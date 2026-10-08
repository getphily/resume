export type MediaKind = 'image' | 'audio' | 'video';
export type MediaSource = 'upload' | 'cover-studio' | 'audio-editor' | 'recording' | 'import';
export type MediaStatus = 'uploading' | 'ready' | 'failed';

export interface MediaAsset {
  id: string;
  user_id: string;
  kind: MediaKind;
  status: MediaStatus;
  title: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  thumb_path?: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  peaks?: number[];
  checksum?: string;
  source: MediaSource;
  is_favorite: boolean;
  tags: string[];
  public_path?: string;
  metadata: Record<string, any>;
  last_used_at?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaStorageSummary {
  quota: number;
  used: number;
  images: number;
  audio: number;
  video: number;
}

export interface UploadTask {
  id: string; // The reservation ID
  file: File;
  kind: MediaKind;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
  asset?: MediaAsset;
  abortController?: AbortController;
}
