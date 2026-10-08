import React from 'react';
import toast from 'react-hot-toast';
import { DriveError, type DriveFile } from '@/lib/audioEditor/drive';

export function toastDriveSaved(file: DriveFile): void {
  toast.success(
    <span>
      Saved to Google Drive → Podcast Studio.{' '}
      {file.webViewLink && (
        <a href={file.webViewLink} target="_blank" rel="noreferrer" className="underline font-semibold">
          Open
        </a>
      )}
    </span>,
    { position: 'top-center', duration: 6000 },
  );
}

export function toastDriveError(e: unknown): void {
  if (e instanceof DriveError && e.kind === 'cancelled') {
    toast('Google Drive save cancelled.', { position: 'top-center' });
    return;
  }
  console.error('[Drive]', e);
  toast.error(e instanceof Error ? e.message : 'Saving to Google Drive failed.', { position: 'top-center' });
}
