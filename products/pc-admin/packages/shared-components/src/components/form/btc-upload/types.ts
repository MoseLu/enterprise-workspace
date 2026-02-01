export interface UploadItem {
  uid: string | number;
  size: number;
  name: string;
  type: string;
  progress: number;
  url: string;
  preload: string;
  error: string;
  isPlay?: boolean;
}

export interface UploadOptions {
  uploadType?: 'avatar' | 'file';
  onProgress?: (progress: number) => void;
}

export interface UploadResponse {
  url: string;
  key?: string;
  fileId?: string;
}
