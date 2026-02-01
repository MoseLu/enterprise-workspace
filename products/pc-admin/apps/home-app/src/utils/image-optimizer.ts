/**
 * 图片优化工具
 * 支持 WebP 格式、响应式图片、懒加载等优化策略
 * 支持图片降级：优先使用本地构建的图片，失败后降级到 CDN
 */

const CDN_BASE_URL = 'https://all.bellis.com.cn';

/**
 * 获取 CDN 视频 URL
 * @param filename 视频文件名，例如 'automation_area_web.mp4'
 * @returns CDN 视频 URL
 */
export function getCdnVideoUrl(filename: string): string {
  // 确保文件名不包含路径分隔符
  const cleanFilename = filename.split('/').pop() || filename;
  return `${CDN_BASE_URL}/${cleanFilename}`;
}

/**
 * 获取 CDN 降级 URL
 * @param localPath 本地图片路径，例如 '/assets/images/1.jpg' 或 '/images/webp/1.webp'
 * @returns CDN URL
 */
export function getCdnFallbackUrl(localPath: string): string {
  // 如果路径已经包含 /images/webp/，保持该路径结构
  if (localPath.includes('/images/webp/')) {
    // 提取 /images/webp/ 之后的部分
    const parts = localPath.split('/images/webp/');
    if (parts.length > 1) {
      const filename = parts[1];
      return `${CDN_BASE_URL}/images/webp/${filename}`;
    }
  }

  // 如果路径已经包含 /images/（但不是webp子目录），保持该路径结构
  if (localPath.includes('/images/') && !localPath.includes('/images/webp/')) {
    const parts = localPath.split('/images/');
    if (parts.length > 1) {
      const filename = parts[1];
      return `${CDN_BASE_URL}/images/${filename}`;
    }
  }

  // 从本地路径提取文件名
  const filename = localPath.split('/').pop() || '';

  // 视频文件在根目录（使用统一的 CDN 视频 URL 函数）
  if (filename.endsWith('.mp4') || filename.endsWith('.webm') || filename.endsWith('.avi') ||
      filename.endsWith('.mov') || filename.endsWith('.mkv') || filename.endsWith('.flv') ||
      filename.endsWith('.m4v')) {
    return getCdnVideoUrl(filename);
  }

  // 所有图片都在 images 目录
  return `${CDN_BASE_URL}/images/${filename}`;
}

/**
 * 为图片元素设置降级策略
 * 优先使用本地构建的图片，失败后降级到 CDN
 * @param img 图片元素
 * @param localSrc 本地图片路径（构建后的路径）
 */
export function setupImageFallback(img: HTMLImageElement, localSrc: string): void {
  if (!img || typeof window === 'undefined') {
    return;
  }

  // 保存原始本地路径
  const originalSrc = localSrc;
  const cdnFallback = getCdnFallbackUrl(originalSrc);

  // 设置错误处理：如果本地图片加载失败，降级到 CDN
  img.onerror = function(this: HTMLImageElement) {
    // 如果当前不是 CDN URL，尝试使用 CDN
    if (this.src !== cdnFallback) {
      this.src = cdnFallback;
      // 清除错误处理，避免无限循环
      this.onerror = null;
    }
  };

  // 设置初始源为本地路径
  img.src = originalSrc;
}

/**
 * 获取图片的 WebP 版本 URL
 * @param originalUrl 原始图片 URL
 * @returns WebP 格式的 URL，如果原图已经是 WebP 则返回原 URL
 */
export function getWebPUrl(originalUrl: string): string {
  // 如果已经是 WebP 格式，直接返回
  if (originalUrl.endsWith('.webp')) {
    return originalUrl;
  }

  // 替换文件扩展名为 .webp
  return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * 获取响应式图片的 srcset
 * @param baseUrl 基础图片 URL
 * @param sizes 不同尺寸的宽度数组，例如 [400, 800, 1200]
 * @returns srcset 字符串
 */
export function getSrcSet(baseUrl: string, sizes: number[] = [400, 800, 1200]): string {
  // 如果使用 CDN，可以通过 URL 参数调整尺寸
  // 这里假设 CDN 支持 ?w= 参数来调整宽度
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
}

/**
 * 获取优化后的图片属性
 * @param src 图片源 URL
 * @param options 优化选项
 * @returns 图片属性对象
 */
export function getOptimizedImageProps(
  src: string,
  options: {
    alt?: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
    useWebP?: boolean;
    useResponsive?: boolean;
    sizes?: string;
  } = {}
) {
  const {
    alt = '',
    loading = 'lazy',
    decoding = 'async',
    useWebP = true,
    useResponsive = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  } = options;

  const props: Record<string, any> = {
    alt,
    loading,
    decoding,
  };

  // 如果支持 WebP，使用 <picture> 标签的降级方案
  if (useWebP && typeof window !== 'undefined') {
    const webpUrl = getWebPUrl(src);
    // 检查浏览器是否支持 WebP
    const supportsWebP = checkWebPSupport();

    if (supportsWebP && webpUrl !== src) {
      // 使用 WebP 作为主要源
      props.src = webpUrl;
      // 添加降级方案
      props.onerror = function(this: HTMLImageElement) {
        // 如果 WebP 加载失败，降级到原始格式
        if (this.src !== src) {
          this.src = src;
        }
      };
    } else {
      props.src = src;
    }
  } else {
    props.src = src;
  }

  // 响应式图片
  if (useResponsive) {
    props.sizes = sizes;
    props.srcset = getSrcSet(props.src);
  }

  return props;
}

/**
 * 检查浏览器是否支持 WebP
 */
let webPSupportCache: boolean | null = null;

export function checkWebPSupport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (webPSupportCache !== null) {
    return webPSupportCache;
  }

  // 使用 canvas 检测 WebP 支持
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  try {
    const dataURL = canvas.toDataURL('image/webp');
    webPSupportCache = dataURL.indexOf('data:image/webp') === 0;
  } catch {
    webPSupportCache = false;
  }

  return webPSupportCache;
}

/**
 * 预加载图片
 * @param url 图片 URL
 * @returns Promise<HTMLImageElement>
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 批量预加载图片
 * @param urls 图片 URL 数组
 * @param maxConcurrent 最大并发数，默认 3
 * @returns Promise<void>
 */
export async function preloadImages(
  urls: string[],
  maxConcurrent: number = 3
): Promise<void> {
  const queue: Promise<void>[] = [];

  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(url =>
      preloadImage(url).catch(() => {
        // 忽略单个图片加载失败
      })
    );
    queue.push(Promise.all(batchPromises).then(() => {}));
  }

  await Promise.all(queue);
}

/**
 * 获取 CDN 图片 URL（带优化参数）
 * @param path 图片路径，例如 'images/1.jpg'
 * @param options 优化选项
 * @returns 优化后的 CDN URL
 */
export function getCdnImageUrl(
  path: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const { width, quality = 85, format } = options;
  const baseUrl = `${CDN_BASE_URL}/${path}`;

  // 如果 CDN 支持图片处理参数，可以添加
  // 这里假设使用常见的图片处理服务（如阿里云 OSS、腾讯云 COS 等）
  const params: string[] = [];

  if (width) {
    params.push(`w_${width}`);
  }

  if (quality !== 85) {
    params.push(`q_${quality}`);
  }

  if (format === 'webp') {
    params.push('format,webp');
  }

  if (params.length > 0) {
    // 假设 CDN 使用 x-oss-process 或类似参数
    // 根据实际 CDN 服务调整
    return `${baseUrl}?x-oss-process=image/resize,${params.join(',')}`;
  }

  return baseUrl;
}

