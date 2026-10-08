import { Upload } from 'tus-js-client';
import { supabase } from '../supabase';

export interface TusUploadOptions {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (bytesSent: number, bytesTotal: number) => void;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
  abortController?: AbortController;
}

export async function uploadWithTus(options: TusUploadOptions): Promise<void> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error('Not authenticated for upload');

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1];
  if (!projectId) throw new Error('Could not determine Supabase project ID');

  // Supabase Tus endpoint: https://[project_id].supabase.co/storage/v1/upload/resumable
  const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;

  return new Promise((resolve, reject) => {
    let _aborted = false;
    
    if (options.abortController) {
      options.abortController.signal.addEventListener('abort', () => {
        _aborted = true;
        if (upload) {
          upload.abort();
        }
        reject(new Error('Upload aborted'));
      });
    }

    const upload = new Upload(options.file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      uploadDataDuringCreation: true,
      // chunkSize must be 6MB for Supabase
      chunkSize: 6 * 1024 * 1024, 
      metadata: {
        bucketName: options.bucket,
        objectName: options.path,
        contentType: options.file.type,
      },
      onError: (err) => {
        if (_aborted) return;
        if (options.onError) options.onError(err);
        reject(err);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        if (_aborted) return;
        if (options.onProgress) options.onProgress(bytesUploaded, bytesTotal);
      },
      onSuccess: () => {
        if (_aborted) return;
        if (options.onSuccess) options.onSuccess();
        resolve();
      },
    });

    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then((previousUploads) => {
      if (_aborted) return;
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    }).catch(err => {
      if (_aborted) return;
      // If finding previous uploads fails, just start a new one
      upload.start();
    });
  });
}
