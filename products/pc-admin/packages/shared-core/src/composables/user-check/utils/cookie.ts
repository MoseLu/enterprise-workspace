/**
 * Cookie 工具函数（共享版本）
 */

/**
 * 获取跨子域名共享的 cookie domain
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
  
  return undefined;
}

/**
 * 读取 cookie 值
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * 设置 cookie
 */
export function setCookie(
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
  const encodedValue = encodeURIComponent(value);
  let cookieString = `${name}=${encodedValue}${expires}; path=${path}`;

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

