/**
 * Google Drive saving for the Podcast Audio Studio — browser only, no backend.
 *
 * Auth: Google Identity Services token client with the narrow `drive.file` scope, which only
 * grants access to files/folders THIS app creates (never the rest of the user's Drive).
 * Tokens live in memory only (≈1 h lifetime); nothing is persisted.
 *
 * Setup (one-time, by the site owner): see GOOGLE_DRIVE_SETUP.md. Without
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID the feature reports itself unconfigured and the UI hides it.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const FOLDER_NAME = 'Podcast Studio';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

export const isDriveConfigured = (): boolean => CLIENT_ID.length > 0;

export interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
}

export class DriveError extends Error {
  constructor(message: string, readonly kind: 'auth' | 'cancelled' | 'config' | 'network' | 'api' = 'api') {
    super(message);
    this.name = 'DriveError';
  }
}

// --- Minimal GIS typings (avoids pulling in @types/google.accounts) --------------------------
interface TokenResponse {
  access_token?: string;
  expires_in?: number | string;
  error?: string;
  error_description?: string;
}
interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}
interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (r: TokenResponse) => void;
    error_callback?: (e: { type: string; message?: string }) => void;
  }) => TokenClient;
}
declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleAccountsOAuth2 } };
  }
}

// --- Token handling --------------------------------------------------------------------------
let gisPromise: Promise<void> | null = null;
let cached: { token: string; expiresAt: number } | null = null;
let inFlight: Promise<string> | null = null;
let folderIdCache: string | null = null;

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.onload = () => (window.google?.accounts?.oauth2 ? resolve() : reject(new DriveError("Google sign-in didn't load.", 'network')));
    s.onerror = () => reject(new DriveError("Couldn't reach Google. Check your connection or ad-blocker.", 'network'));
    document.head.appendChild(s);
  }).catch(e => {
    gisPromise = null; // allow a retry
    throw e;
  });
  return gisPromise;
}

/** Warm the Google script early so the consent popup opens inside the user's click (popup blockers). */
export function preloadDriveSdk(): void {
  if (isDriveConfigured()) loadGis().catch(() => {});
}

/**
 * Returns a valid access token, prompting the user if needed.
 * MUST be called from a user gesture (click) the first time, otherwise the browser blocks the popup.
 */
export async function getDriveToken(): Promise<string> {
  if (!isDriveConfigured()) throw new DriveError('Google Drive saving is not set up yet.', 'config');
  if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    await loadGis();
    return new Promise<string>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: r => {
          if (r.error || !r.access_token) {
            reject(new DriveError(r.error_description || 'Google sign-in was not completed.', r.error === 'access_denied' ? 'cancelled' : 'auth'));
            return;
          }
          cached = { token: r.access_token, expiresAt: Date.now() + Number(r.expires_in ?? 3600) * 1000 };
          resolve(r.access_token);
        },
        error_callback: e => {
          if (e.type === 'popup_closed') reject(new DriveError('Google sign-in was closed.', 'cancelled'));
          else if (e.type === 'popup_failed_to_open') reject(new DriveError('Your browser blocked the Google sign-in popup. Allow popups and try again.', 'auth'));
          else reject(new DriveError(e.message || 'Google sign-in failed.', 'auth'));
        },
      });
      client.requestAccessToken();
    });
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function forgetDriveToken(): void {
  cached = null;
  folderIdCache = null;
}

// --- Drive REST ------------------------------------------------------------------------------
async function driveJson<T>(token: string, url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) } });
  } catch {
    throw new DriveError("Couldn't reach Google Drive. Check your connection.", 'network');
  }
  if (res.status === 401) {
    forgetDriveToken();
    throw new DriveError('Your Google session expired. Please try again.', 'auth');
  }
  if (!res.ok) throw new DriveError(`Google Drive error (${res.status}).`, 'api');
  return res.json() as Promise<T>;
}

/** Find (or create) the app's "Podcast Studio" folder. `drive.file` only sees folders this app made. */
async function ensureFolder(token: string): Promise<string> {
  if (folderIdCache) return folderIdCache;
  const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`);
  const found = await driveJson<{ files: { id: string }[] }>(
    token,
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&spaces=drive&pageSize=1`,
  );
  if (found.files[0]) return (folderIdCache = found.files[0].id);
  const created = await driveJson<{ id: string }>(token, 'https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
  });
  return (folderIdCache = created.id);
}

/**
 * Resumable upload using XMLHttpRequest: unlike fetch it can read the session `Location` header
 * under CORS and reports upload progress. Works for large WAV files (no 5 MB multipart limit).
 */
function xhrUpload(
  token: string,
  folderId: string,
  blob: Blob,
  filename: string,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<DriveFile> {
  return new Promise((resolve, reject) => {
    const abortErr = () => new DriveError('Upload cancelled.', 'cancelled');
    if (signal?.aborted) return reject(abortErr());

    const init = new XMLHttpRequest();
    init.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink');
    init.setRequestHeader('Authorization', `Bearer ${token}`);
    init.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    init.setRequestHeader('X-Upload-Content-Type', blob.type || 'application/octet-stream');
    init.setRequestHeader('X-Upload-Content-Length', String(blob.size));

    let active: XMLHttpRequest = init;
    const onAbort = () => {
      active.abort();
      reject(abortErr());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    const fail = (e: DriveError) => {
      cleanup();
      reject(e);
    };

    init.onerror = () => fail(new DriveError("Couldn't reach Google Drive. Check your connection.", 'network'));
    init.onload = () => {
      if (init.status === 401) {
        forgetDriveToken();
        return fail(new DriveError('Your Google session expired. Please try again.', 'auth'));
      }
      const session = init.getResponseHeader('Location');
      if (init.status !== 200 || !session) return fail(new DriveError(`Google Drive refused the upload (${init.status}).`, 'api'));

      const put = new XMLHttpRequest();
      active = put;
      put.open('PUT', session);
      put.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
      put.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded / e.total);
      put.onerror = () => fail(new DriveError('The upload was interrupted. Please try again.', 'network'));
      put.onload = () => {
        cleanup();
        if (put.status >= 200 && put.status < 300) {
          try {
            resolve(JSON.parse(put.responseText) as DriveFile);
          } catch {
            reject(new DriveError('Google Drive returned an unexpected response.', 'api'));
          }
        } else reject(new DriveError(`Upload failed (${put.status}).`, 'api'));
      };
      put.send(blob);
    };
    init.send(JSON.stringify({ name: filename, parents: [folderId] }));
  });
}

/** Save a blob into the user's Drive under "Podcast Studio/". Call from a click handler. */
export async function saveToDrive(
  blob: Blob,
  filename: string,
  onProgress: (fraction: number) => void = () => {},
  signal?: AbortSignal,
): Promise<DriveFile> {
  const token = await getDriveToken();
  const folderId = await ensureFolder(token);
  try {
    return await xhrUpload(token, folderId, blob, filename, onProgress, signal);
  } catch (e) {
    // The remembered folder may have been deleted by the user — forget it so the next try recreates it.
    if (e instanceof DriveError && e.kind === 'api') folderIdCache = null;
    throw e;
  }
}
