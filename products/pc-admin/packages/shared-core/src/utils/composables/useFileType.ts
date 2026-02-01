/**
 * 文件类型检测 composable
 * 封装 file-type 库，结合文件扩展名识别纯文本文件
 */
;

import { fileTypeFromBlob, fileTypeFromBuffer } from 'file-type';

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
 * 纯文本文件扩展名列表
 */
const TEXT_FILE_EXTENSIONS = new Set([
  'txt', 'js', 'jsx', 'ts', 'tsx', 'vue', 'html', 'htm', 'css', 'scss', 'sass', 'less',
  'json', 'md', 'markdown', 'xml', 'yaml', 'yml', 'csv', 'log', 'sh', 'bash',
  'py', 'java', 'c', 'cpp', 'h', 'hpp', 'sql', 'sqlite', 'ini', 'conf', 'env',
  'properties', 'gitignore', 'dockerfile', 'makefile', 'yml', 'yaml'
]);

/**
 * 图片文件扩展名列表
 */
const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif',
  'heic', 'heif', 'avif', 'jxl'
]);

/**
 * 视频文件扩展名列表
 */
const VIDEO_EXTENSIONS = new Set([
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv',
  'mpg', 'mpeg', 'ts', 'm2ts'
]);

/**
 * 音频文件扩展名列表
 */
const AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'flac', 'aac', 'ogg', 'oga', 'm4a', 'wma', 'opus', 'amr'
]);

/**
 * 从文件名提取扩展名
 */
function getExtensionFromFileName(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts.pop()?.toLowerCase() || '';
}

/**
 * 根据扩展名判断文件分类
 */
function getCategoryFromExtension(ext: string): 'image' | 'video' | 'audio' | 'text' | 'file' {
  if (IMAGE_EXTENSIONS.has(ext)) {
    return 'image';
  }
  if (VIDEO_EXTENSIONS.has(ext)) {
    return 'video';
  }
  if (AUDIO_EXTENSIONS.has(ext)) {
    return 'audio';
  }
  if (TEXT_FILE_EXTENSIONS.has(ext)) {
    return 'text';
  }
  return 'file';
}

/**
 * 根据 MIME 类型判断文件分类
 */
function getCategoryFromMime(mime: string): 'image' | 'video' | 'audio' | 'text' | 'file' {
  if (mime.startsWith('image/')) {
    return 'image';
  }
  if (mime.startsWith('video/')) {
    return 'video';
  }
  if (mime.startsWith('audio/')) {
    return 'audio';
  }
  if (mime.startsWith('text/')) {
    return 'text';
  }
  // 特殊处理一些文本类型的 MIME
  if (['application/json', 'application/xml', 'application/javascript', 'application/typescript'].includes(mime)) {
    return 'text';
  }
  return 'file';
}

/**
 * 获取默认 MIME 类型（基于扩展名）
 */
function getDefaultMimeFromExtension(ext: string, category: string): string {
  const mimeMap: Record<string, string> = {
    // 图片
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    // 视频
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    // 音频
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    // 文本
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
  };
  
  return mimeMap[ext] || (category === 'text' ? 'text/plain' : 'application/octet-stream');
}

/**
 * 检测文件类型（从 File 或 Blob 对象）
 * 
 * @param file - File 或 Blob 对象
 * @param fileName - 可选的文件名（如果 file 是 Blob 且没有 name 属性）
 * @returns Promise<FileTypeResult>
 */
export async function detectFileType(
  file: File | Blob,
  fileName?: string
): Promise<FileTypeResult> {
  const name = (file instanceof File ? file.name : fileName) || '';
  const ext = getExtensionFromFileName(name);
  
  // 1. 优先检查纯文本文件扩展名（最快）
  if (TEXT_FILE_EXTENSIONS.has(ext)) {
    return {
      category: 'text',
      mime: getDefaultMimeFromExtension(ext, 'text'),
      ext,
      isText: true,
    };
  }
  
  try {
    // 2. 使用 file-type 库检测文件内容（最准确）
    let fileTypeResult = await fileTypeFromBlob(file);
    
    if (fileTypeResult) {
      const category = getCategoryFromMime(fileTypeResult.mime);
      return {
        category,
        mime: fileTypeResult.mime,
        ext: fileTypeResult.ext,
        isText: category === 'text',
      };
    }
  } catch (error) {
    // file-type 检测失败，继续使用扩展名匹配
    console.warn('[useFileType] file-type detection failed:', error);
  }
  
  // 3. 回退到扩展名匹配（后备方案）
  const category = getCategoryFromExtension(ext);
  return {
    category,
    mime: getDefaultMimeFromExtension(ext, category),
    ext: ext || 'unknown',
    isText: category === 'text',
  };
}

/**
 * 检测文件类型（从 ArrayBuffer 或 Uint8Array）
 * 
 * @param buffer - ArrayBuffer 或 Uint8Array
 * @param fileName - 可选的文件名
 * @returns Promise<FileTypeResult>
 */
export async function detectFileTypeFromBuffer(
  buffer: ArrayBuffer | Uint8Array,
  fileName?: string
): Promise<FileTypeResult> {
  const uint8Array = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  const name = fileName || '';
  const ext = getExtensionFromFileName(name);
  
  // 1. 优先检查纯文本文件扩展名
  if (TEXT_FILE_EXTENSIONS.has(ext)) {
    return {
      category: 'text',
      mime: getDefaultMimeFromExtension(ext, 'text'),
      ext,
      isText: true,
    };
  }
  
  try {
    // 2. 使用 file-type 库检测
    const fileTypeResult = await fileTypeFromBuffer(uint8Array);
    
    if (fileTypeResult) {
      const category = getCategoryFromMime(fileTypeResult.mime);
      return {
        category,
        mime: fileTypeResult.mime,
        ext: fileTypeResult.ext,
        isText: category === 'text',
      };
    }
  } catch (error) {
    console.warn('[useFileType] file-type detection failed:', error);
  }
  
  // 3. 回退到扩展名匹配
  const category = getCategoryFromExtension(ext);
  return {
    category,
    mime: getDefaultMimeFromExtension(ext, category),
    ext: ext || 'unknown',
    isText: category === 'text',
  };
}

/**
 * 从文件名快速检测文件类型（同步方法，不读取文件内容）
 * 
 * @param fileName - 文件名
 * @returns FileTypeResult
 */
export function detectFileTypeFromFileName(fileName: string): FileTypeResult {
  const ext = getExtensionFromFileName(fileName);
  const category = getCategoryFromExtension(ext);
  
  return {
    category,
    mime: getDefaultMimeFromExtension(ext, category),
    ext: ext || 'unknown',
    isText: category === 'text',
  };
}

/**
 * useFileType composable
 * 
 * @returns 文件类型检测函数
 */
export function useFileType() {
  return {
    detectFileType,
    detectFileTypeFromBuffer,
    detectFileTypeFromFileName,
  };
}

