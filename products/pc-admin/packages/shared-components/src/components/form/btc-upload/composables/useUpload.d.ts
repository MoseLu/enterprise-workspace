import type { UploadOptions, UploadResponse } from '../types';
/**
 * 文件上传 composable
 */
export declare function useUpload(service?: any): {
    toUpload: (file: File, options?: UploadOptions) => Promise<UploadResponse>;
};
