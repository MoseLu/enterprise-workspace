import { logger } from '../logger/index';
;
/**
 * 从 layout-app 加载共享资源
 *
 * 共享资源包括：
 * - vendor: Vue 生态库 + 共享组件库
 * - echarts-vendor: ECharts 相关库
 * - menu-registry: 菜单注册表
 *
 * 使用说明：
 * 1. 在生产环境，非 layout-app 应用需要先加载共享资源
 * 2. 开发环境仍然使用本地打包的资源，不加载共享资源
 * 3. 通过 manifest.json 获取实际文件名（包含 hash）
 */

/**
 * 获取 layout-app 的基础 URL
 */
function getLayoutAppBase(): string {
  if (typeof window === 'undefined') {
    return 'https://layout.bellis.com.cn';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // #region agent log H-SSL-CDN
  fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-SSL-CDN',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getLayoutAppBase',message:'compute layoutAppBase',data:{hostname,protocol},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log H-SSL-CDN

  // 生产环境：使用子域名
  if (hostname.includes('bellis.com.cn')) {
    return `${protocol}//layout.bellis.com.cn`;
  }

  // 开发/预览环境：根据当前端口判断环境类型
  const port = window.location.port || '';
  const isPreview = port.startsWith('41');
  const isDev = port.startsWith('80');

  if (isPreview) {
    // 预览环境：使用 layout-app 的预览端口 4192
    return 'http://localhost:4192';
  } else if (isDev) {
    // 开发环境：使用 layout-app 的开发端口 4188
    return 'http://localhost:4188';
  } else {
    // 默认使用预览端口
    return 'http://localhost:4192';
  }
}

/**
 * 从 manifest.json 获取资源文件名
 */
async function getResourceFromManifest(
  layoutAppBase: string,
  resourceName: string
): Promise<string | null> {
  try {
    const manifestUrl = `${layoutAppBase}/manifest.json`;

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'fetch manifest.json',data:{manifestUrl,resourceName},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    const response = await fetch(manifestUrl, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'manifest response',data:{manifestUrl,ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    if (!response.ok) {
      console.warn(`[load-shared-resources] 无法获取 manifest.json: ${response.status}`);
      return null;
    }

    const manifest = await response.json();

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'manifest parsed',data:{manifestKeysCount:Object.keys(manifest||{}).length,resourceName},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    // 查找匹配的资源文件
    // manifest 格式：{ "vendor-xxx.js": { file: "assets/layout/vendor-xxx.js", ... }, ... }
    for (const [key, value] of Object.entries(manifest)) {
      const entry = value as { file?: string; src?: string };
      const fileName = entry.file || entry.src || key;

      // 匹配资源名称（vendor、echarts-vendor、menu-registry）
      if (fileName.includes(resourceName) && fileName.endsWith('.js')) {
        // 返回完整的 URL
        // 注意：layout-app 的资源路径是 assets/layout/xxx.js，需要确保路径正确
        const basePath = fileName.startsWith('/') ? '' : '/';
        // 如果路径已经是 assets/layout/，直接使用；否则需要确保路径正确
        let finalPath = fileName;
        if (!fileName.includes('assets/layout/') && fileName.startsWith('assets/')) {
          // 如果路径是 assets/xxx.js，转换为 assets/layout/xxx.js
          finalPath = fileName.replace(/^assets\//, 'assets/layout/');
        }
        const finalUrl = `${layoutAppBase}${basePath}${finalPath}`;

        // #region agent log H-PATH
        fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-PATH',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'matched resource in manifest',data:{resourceName,key,fileName,finalPath,finalUrl},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log H-PATH
        return finalUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn(`[load-shared-resources] 获取 manifest.json 失败:`, error);

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'manifest fetch threw',data:{resourceName,errorName:(error as any)?.name,errorMessage:(error as any)?.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    return null;
  }
}

/**
 * 规范化 URL，提取路径部分（用于去重检查）
 */
function normalizeUrlForCheck(url: string): string {
  try {
    // 如果是完整 URL，提取路径部分
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    // 如果是绝对路径，直接返回
    if (url.startsWith('/')) {
      return url;
    }
    // 相对路径，转换为绝对路径
    if (typeof window !== 'undefined') {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * 动态加载 JavaScript 模块
 */
async function loadScript(url: string): Promise<void> {
  // 规范化 URL 用于去重检查
  const normalizedPath = normalizeUrlForCheck(url);
  
  // 检查是否已经加载过（使用规范化后的路径检查）
  // 检查所有 script 标签，比较路径部分
  const existingScripts = document.querySelectorAll('script[src]');
  for (const script of existingScripts) {
    const src = script.getAttribute('src');
    if (src && normalizeUrlForCheck(src) === normalizedPath) {
      // 如果已经加载，直接 resolve
      return;
    }
  }

  // 检查是否是静态资源路径，如果是则使用资源加载器
  const isStaticAsset = url.includes('/assets/') || url.includes('/assets/layout/');
  
  if (isStaticAsset && typeof window !== 'undefined') {
    try {
      // 使用资源加载器加载资源（会自动降级：CDN -> OSS -> 本地）
      const resourceLoader = (window as any).__BTC_RESOURCE_LOADER__;
      if (resourceLoader) {
        const config = (window as any).__BTC_CDN_CONFIG__;
        const appName = config?.appName || 'unknown-app';
        
        // 关键：对于模块脚本，必须使用 src 属性而不是 textContent
        // 因为 ES 模块的相对路径解析基于模块的 URL，而不是页面 URL
        // 如果使用 textContent，模块没有明确的 URL，相对路径会被错误解析为基于当前页面 URL
        
        // 规范化 URL，提取路径部分
        const normalizedPath = normalizeUrlForCheck(url);
        
        // 生成 CDN URL（资源加载器会处理降级，但这里我们需要一个明确的 URL 用于 src）
        const cdnDomain = config?.cdnDomain || 'https://all.bellis.com.cn';
        let moduleUrl = url;
        if (normalizedPath.includes('/assets/layout/')) {
          moduleUrl = `${cdnDomain}/layout-app${normalizedPath}`;
        } else if (normalizedPath.includes('/assets/')) {
          moduleUrl = `${cdnDomain}/${appName}${normalizedPath}`;
        }
        
        // 创建脚本标签，使用 src 属性（确保模块有正确的 URL）
        const script = document.createElement('script');
        script.type = 'module';
        script.src = moduleUrl; // 关键：使用 src 而不是 textContent
        script.async = true;
        
        return new Promise((resolve, reject) => {
          script.onload = () => {
            resolve();
          };
          
          script.onerror = () => {
            // #region agent log H-LOAD
            fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-LOAD',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:loadScript',message:'script load error',data:{url,moduleUrl},timestamp:Date.now()})}).catch(()=>{});
            // #endregion agent log H-LOAD
            reject(new Error(`Failed to load shared resource: ${url}`));
          };
          
          document.head.appendChild(script);
        });
      }
    } catch (error) {
      // 资源加载器失败，回退到原来的方式
      console.warn(`[load-shared-resources] 资源加载器失败，回退到直接加载: ${url}`, error);
    }
  }
  
  // 非静态资源或资源加载器不可用，使用原来的方式
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      // #region agent log H-LOAD
      fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-LOAD',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:loadScript',message:'script onerror',data:{url},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log H-LOAD
      reject(new Error(`Failed to load shared resource: ${url}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * 从 layout-app 加载共享资源
 *
 * @param options 加载选项
 * @param options.resources 要加载的资源列表，默认为 ['vendor', 'echarts-vendor', 'menu-registry']
 * @param options.onProgress 进度回调，参数为 (loaded, total)
 * @returns Promise，在所有资源加载完成后 resolve
 */
export async function loadSharedResourcesFromLayoutApp(options?: {
  resources?: string[];
  onProgress?: (loaded: number, total: number) => void;
}): Promise<void> {
  // layout-app 本身不需要加载共享资源
  // 如果使用了 layout-app（__USE_LAYOUT_APP__ 为 true），也不需要加载，因为 layout-app 已经提供了这些资源
  if (typeof window !== 'undefined') {
    if ((window as any).__IS_LAYOUT_APP__ || (window as any).__USE_LAYOUT_APP__) {
      return;
    }
  }

  const layoutAppBase = getLayoutAppBase();

  // 开发环境：不加载共享资源，使用本地打包的资源
  // 通过 hostname 判断：localhost 或非生产域名都是开发环境
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  !hostname.includes('bellis.com.cn');
    if (isDev) {
      return;
    }
  } else {
    // 服务端环境：尝试使用 import.meta.env（如果可用）
    try {
      const isDev = typeof import.meta !== 'undefined' &&
                    import.meta.env &&
                    (import.meta.env as any).DEV === true;
      if (isDev) {
        return;
      }
    } catch {
      // 如果 import.meta 不可用，继续执行（假设是生产环境）
    }
  }
  const resources = options?.resources || ['vendor', 'echarts-vendor', 'menu-registry'];

  let loaded = 0;
  const total = resources.length;

  // 并行获取所有资源的 URL
  const resourceUrls = await Promise.all(
    resources.map(async (resourceName) => {
      const url = await getResourceFromManifest(layoutAppBase, resourceName);
      if (!url) {
        console.warn(`[load-shared-resources] 无法找到资源: ${resourceName}`);
      }
      return { name: resourceName, url };
    })
  );

  // 按顺序加载资源（确保依赖顺序：vendor → echarts-vendor → menu-registry）
  for (const { name, url } of resourceUrls) {
    if (!url) {
      // 如果找不到资源，跳过（可能是该资源不存在，如某些应用不使用 echarts）
      loaded++;
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
      continue;
    }

    try {
      await loadScript(url);
      loaded++;
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
    } catch (error) {
      logger.error(`[load-shared-resources] 加载资源失败: ${name}`, error);
      // 继续加载其他资源，不中断
      loaded++;
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
    }
  }
}

/**
 * 检查共享资源是否已加载
 */
export function areSharedResourcesLoaded(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查是否已经加载了 vendor（Vue 应该已经可用）
  return typeof (window as any).Vue !== 'undefined' ||
         document.querySelector('script[src*="vendor"]') !== null;
}

