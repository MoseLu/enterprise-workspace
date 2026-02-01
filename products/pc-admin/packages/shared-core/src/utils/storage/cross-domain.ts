import { logger } from '../logger/index';
;
/**
 * 跨子域名共享存储工具
 * 使用 Cookie 实现跨子域名共享用户偏好设置
 */

/**
 * 读取 cookie 值
 * 未使用，保留以备将来使用
 */
/*
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}
*/

/**
 * 设置 cookie
 * 未使用，保留以备将来使用
 */
/*
function setCookie(
  name: string,
  value: string,
  days: number = 7,
  options?: {
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    domain?: string;
    path?: string;
  }
): void {
  if (typeof document === 'undefined') {
    return;
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }

  const path = options?.path || '/';
  let cookieString = `${name}=${value}${expires}; path=${path}`;

  const isHttps = window.location.protocol === 'https:';
  
  if (options?.sameSite) {
    if (options.sameSite === 'None' && !isHttps) {
      // 不设置 SameSite
    } else {
      cookieString += `; SameSite=${options.sameSite}`;
    }
  } else if (isHttps) {
    cookieString += '; SameSite=None';
  }

  if (isHttps && options?.secure) {
    cookieString += '; Secure';
  }

  if (options?.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  document.cookie = cookieString;
}
*/

/**
 * 删除 cookie
 */
function deleteCookie(
  name: string,
  options?: {
    domain?: string;
    path?: string;
  }
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const path = options?.path || '/';
  const domain = options?.domain;

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * 获取跨子域名共享的 cookie domain
 * 在生产环境下返回 .bellis.com.cn，开发环境也尝试设置 domain 以便测试
 */
export function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const hostname = window.location.hostname;
  
  // 生产环境：设置 domain 为 .bellis.com.cn 以支持跨子域名共享
  if (hostname.includes('bellis.com.cn')) {
    return '.bellis.com.cn';
  }
  
  // 开发环境：如果是 localhost 的子域名（如 admin.localhost），设置 domain 为 .localhost
  // 注意：某些浏览器可能不支持 .localhost，但至少可以尝试
  if (hostname.includes('.localhost') || hostname === 'localhost') {
    return '.localhost';
  }
  
  // 其他环境（IP 地址等）：不设置 domain，cookie 只在当前域名下有效
  // 但为了测试，我们仍然会同步到 cookie，只是不设置 domain
  return undefined;
}

/**
 * 用户偏好设置的 Cookie 键名
 */
const SETTINGS_COOKIE_KEY = 'btc_settings';
const USER_COOKIE_KEY = 'btc_user';

/**
 * 从 Cookie 同步用户偏好设置（不再写入 localStorage，偏好设置完全使用 Cookie）
 * 在子应用启动时调用，确保能够读取根域保存的偏好设置
 * 注意：此函数现在只用于触发 Cookie 读取，不再写入 localStorage
 */
export function syncSettingsFromCookie(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 偏好设置现在完全使用 Cookie，不再需要同步到 localStorage
  // 此函数保留是为了向后兼容，但不再执行任何操作
  // 实际的 Cookie 读取在 storage.get('settings') 和 storage.get('user') 中完成
}

/**
 * 将用户偏好设置同步到 Cookie（跨子域名共享）
 * 在根域修改用户偏好设置时调用
 */
export function syncSettingsToCookie(settings: Record<string, any>): void {
  if (typeof window === 'undefined') {
    console.warn('[CrossDomain] window 未定义，无法同步到 Cookie');
    return;
  }

  try {
    const domain = getCookieDomain();
    const hostname = window.location.hostname;
    const settingsStr = JSON.stringify(settings);
    const encodedStr = encodeURIComponent(settingsStr);
    
    // Cookie 大小限制检查（单个 Cookie 通常限制 4KB）
    if (encodedStr.length > 4000) {
      console.warn('[CrossDomain] 用户偏好设置过大，无法同步到 Cookie:', {
        originalLength: settingsStr.length,
        encodedLength: encodedStr.length,
        settingsKeys: Object.keys(settings),
      });
      return;
    }
    
    // 设置 Cookie（7 天过期，支持跨子域名共享）
    // 使用与 locale cookie 相同的方式：直接使用 document.cookie，简化设置
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    
    let cookieString = `${SETTINGS_COOKIE_KEY}=${encodedStr}${expires}; path=/; SameSite=Lax`;
    
    // 仅在 HTTPS 时设置 Secure
    if (window.location.protocol === 'https:') {
      cookieString += '; Secure';
    }
    
    // 只有在 domain 存在且不是 localhost 时才设置 domain 属性
    // 注意：某些浏览器不支持 .localhost，所以不设置 domain
    if (domain && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      cookieString += `; Domain=${domain}`;
    }
    
    document.cookie = cookieString;
  } catch (error) {
    logger.error('[CrossDomain] 同步用户偏好设置到 Cookie 失败:', error);
  }
}

/**
 * 将用户信息同步到 Cookie（跨子域名共享）
 * 在根域修改用户信息时调用
 */
export function syncUserToCookie(user: Record<string, any>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const domain = getCookieDomain();
    const hostname = window.location.hostname;
    const userStr = JSON.stringify(user);
    
    // 设置 Cookie（7 天过期，支持跨子域名共享）
    // 使用与 locale cookie 相同的方式：直接使用 document.cookie，简化设置
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    
    let cookieString = `${USER_COOKIE_KEY}=${encodeURIComponent(userStr)}${expires}; path=/; SameSite=Lax`;
    
    // 仅在 HTTPS 时设置 Secure
    if (window.location.protocol === 'https:') {
      cookieString += '; Secure';
    }
    
    // 只有在 domain 存在且不是 localhost 时才设置 domain 属性
    // 注意：某些浏览器不支持 .localhost，所以不设置 domain
    if (domain && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      cookieString += `; Domain=${domain}`;
    }
    
    document.cookie = cookieString;
  } catch (error) {
    logger.error('[CrossDomain] 同步用户信息到 Cookie 失败:', error);
  }
}

/**
 * 清除跨子域名共享的 Cookie
 */
export function clearCrossDomainCookies(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const domain = getCookieDomain();
    
    // 清除用户偏好设置 Cookie
    const settingsCookieOptions: { path: string; domain?: string } = {
      path: '/',
    };
    if (domain) {
      settingsCookieOptions.domain = domain;
    }
    deleteCookie(SETTINGS_COOKIE_KEY, settingsCookieOptions);
    
    // 清除用户信息 Cookie
    const userCookieOptions: { path: string; domain?: string } = {
      path: '/',
    };
    if (domain) {
      userCookieOptions.domain = domain;
    }
    deleteCookie(USER_COOKIE_KEY, userCookieOptions);
  } catch (error) {
    logger.error('[CrossDomain] 清除跨子域名共享的 Cookie 失败:', error);
  }
}

