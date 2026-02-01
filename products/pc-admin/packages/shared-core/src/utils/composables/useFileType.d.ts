/**
 * 文件类型检测 composable
 * 封装 file-type 库，结合文件扩展名识别纯文本文件
 */
/**
 * 文件类型检测结果
 */
export interface FileTypeResult {
    /**
     * 文件分类
     */
    category: 'image' | 'video' | 'audio' | 'text' | 'file';
    /**
     * MIME 类型
     */
    mime: string;
    /**
     * 文件扩展名（不含点号）
     */
    ext: string;
    /**
     * 是否为文本文件
     */
    isText: boolean;
}
/**
 * 检测文件类型（从 File 或 Blob 对象）
 *
 * @param file - File 或 Blob 对象
 * @param fileName - 可选的文件名（如果 file 是 Blob 且没有 name 属性）
 * @returns Promise<FileTypeResult>
 */
export declare function detectFileType(file: File | Blob, fileName?: string): Promise<FileTypeResult>;
/**
 * 检测文件类型（从 ArrayBuffer 或 Uint8Array）
 *
 * @param buffer - ArrayBuffer 或 Uint8Array
 * @param fileName - 可选的文件名
 * @returns Promise<FileTypeResult>
 */
export declare function detectFileTypeFromBuffer(buffer: ArrayBuffer | Uint8Array, fileName?: string): Promise<FileTypeResult>;
/**
 * 从文件名快速检测文件类型（同步方法，不读取文件内容）
 *
 * @param fileName - 文件名
 * @returns FileTypeResult
 */
export declare function detectFileTypeFromFileName(fileName: string): FileTypeResult;
/**
 * useFileType composable
 *
 * @returns 文件类型检测函数
 */
export declare function useFileType(): {
    detectFileType: typeof detectFileType;
    detectFileTypeFromBuffer: typeof detectFileTypeFromBuffer;
    detectFileTypeFromFileName: typeof detectFileTypeFromFileName;
};
//# sourceMappingURL=useFileType.d.ts.map