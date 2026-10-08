# Google Drive saving — one-time setup

The Audio Recording Studio can save recordings to the user's **Google Drive** (into a `Podcast Studio` folder).
It runs entirely in the browser using Google Identity Services — there is **no backend and no client secret**.

The app only asks for the narrow `drive.file` scope, which can only see files/folders **this app created**.
It cannot read the rest of a user's Drive.

Until a client ID is configured, the Google Drive buttons/switch are **hidden** (everything else works normally).

## Steps (about 10 minutes, in the Google Cloud Console)

1. **Project** — open <https://console.cloud.google.com/>, pick (or create) a project.
   (You can reuse the project that powers the Supabase "Sign in with Google" button.)
2. **Enable the API** — *APIs & Services → Library* → search **Google Drive API** → **Enable**.
3. **Consent screen** — *APIs & Services → OAuth consent screen* (a.k.a. *Google Auth Platform*):
   - User type: **External**. Fill in app name, support email, and add `getphily.io` as an authorized domain.
   - *Data access / Scopes* → add `https://www.googleapis.com/auth/drive.file`.
   - Under *Audience*, click **Publish app** (move from "Testing" to "In production"). While in "Testing",
     only listed test users can sign in and their grants expire after 7 days.
4. **OAuth client** — *Credentials → Create credentials → OAuth client ID*:
   - Application type: **Web application**.
   - **Authorized JavaScript origins** (no redirect URIs are needed):
     - `https://code.getphily.io`
     - `http://localhost:3000` (and any other local dev port you use)
5. **Configure the app** — copy the *Client ID* (`xxxxxxxx.apps.googleusercontent.com`; it is public, not a secret) into
   `.env.local`:

   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   ```

6. **Rebuild and deploy** — `NEXT_PUBLIC_*` values are baked in at build time, so run `npm run build` and the usual
   rsync deploy again.

## Notes

- Access tokens live only in memory (≈1 hour). Nothing Google-related is stored in localStorage or Supabase.
- If the browser blocks the sign-in popup, the user gets a toast asking them to allow popups.
- Large files use Drive's resumable upload, so the 50 MB limit of the Supabase bucket does not apply to Drive.
