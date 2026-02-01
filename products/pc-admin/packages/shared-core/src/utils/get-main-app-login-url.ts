/**
 * 获取主应用登录页 URL
 * 用于子应用在独立运行时重定向到主应用的登录页面
 * 关键：只有主应用有登录页面，子应用没有登录页面
 * 所以子应用在生产环境子域名下必须重定向到主应用的登录页面
 */

import { getEnvironment, getCurrentSubApp } from '../configs/unified-env-config';
import { getMainAppOrigin } from '../configs/app-env.config';

/**
 * 将相对路径转换为完整 URL（使用主应用配置）
 * @param path - 相对路径，例如 '/workbench/overview'
 * @returns 完整 URL，例如 'http://{MAIN_APP_CONFIG.devHost}:8080/workbench/overview'
 */
function convertPathToFullUrlSync(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }
  
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 获取主应用的基础 URL（从应用配置读取）
  // getMainAppOrigin() 使用 MAIN_APP_CONFIG 获取配置，不硬编码
  const mainAppOrigin = getMainAppOrigin();
  
  // 拼接路径
  return `${mainAppOrigin}${path}`;
}

/**
 * 获取主应用登录页 URL
 * @param redirectPath - 登录后重定向的路径（可选），如果是相对路径会自动转换为完整 URL
 * @param options - 选项参数
 * @param options.clearRedirectCookie - 是否添加 clearRedirectCookie=1 参数（默认 true）
 * @returns 主应用登录页的完整 URL，包含 oauth_callback 和 clearRedirectCookie=1 参数
 */
export function getMainAppLoginUrl(
  redirectPath?: string,
  options?: { clearRedirectCookie?: boolean }
): string {
  if (typeof window === 'undefined') {
    return '/login';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // 默认添加 clearRedirectCookie=1 参数
  const shouldClearRedirectCookie = options?.clearRedirectCookie !== false;
  
  // 如果提供了 redirectPath，将其转换为完整 URL
  let fullRedirectUrl: string | undefined;
  if (redirectPath) {
    fullRedirectUrl = convertPathToFullUrlSync(redirectPath);
  }
  
  // 构建查询参数
  const queryParams: string[] = [];
  if (fullRedirectUrl) {
    queryParams.push(`oauth_callback=${encodeURIComponent(fullRedirectUrl)}`);
  }
  if (shouldClearRedirectCookie) {
    queryParams.push('clearRedirectCookie=1');
  }
  const redirectQuery = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

  const env = getEnvironment();
  const currentSubApp = getCurrentSubApp();

  // 生产环境或测试环境：如果是子域名（如 system.bellis.com.cn 或 system.test.bellis.com.cn），重定向到主应用的登录页面
  // 关键：只有主应用有登录页面，子应用没有登录页面
  if ((env === 'production' || env === 'test') && currentSubApp) {
    // 子域名环境，重定向到主应用的登录页面
    const mainDomain = env === 'test' ? 'test.bellis.com.cn' : 'bellis.com.cn';
    return `${protocol}//${mainDomain}/login${redirectQuery}`;
  }

  // 开发环境：主应用在 8080 端口
  if (env === 'development') {
    // 关键修复：开发环境下，无论当前在哪个应用（主应用或子应用），都应该使用主应用的端口（8080）
    // 因为所有应用在开发环境下都应该通过主应用（8080端口）来访问
    // 使用 getMainAppOrigin() 获取主应用 URL，从中提取端口和 host
    const mainAppOrigin = getMainAppOrigin();
    // 从主应用 URL 中提取域名和端口（使用 MAIN_APP_CONFIG.devHost 和 MAIN_APP_CONFIG.devPort）
    const urlObj = new URL(mainAppOrigin);
    return `${urlObj.protocol}//${urlObj.host}/login${redirectQuery}`;
  }

  // 其他环境：使用当前域名的登录页面（假设是主应用）
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/login${redirectQuery}`;
}
