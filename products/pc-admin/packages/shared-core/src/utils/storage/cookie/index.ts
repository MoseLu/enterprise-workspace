/**
 * Cookie 工具函数
 * 统一实现，支持环境判断、SameSite、Secure 等完整功能
 */

import { getEnvironment } from '@btc/shared-core/configs/unified-env-config';
import { getCookieDomain } from '../cross-domain';

/**
 * 获取 cookie 值
 * @param name cookie 名称
 * @returns cookie 值，如果不存在则返回 null
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
      // 关键：cookie 值可能是 URL 编码的，需要解码
      try {
        return decodeURIComponent(value);
      } catch (e) {
        // 如果解码失败（可能已经是解码后的字符串），返回原值
        return value;
      }
    }
  }

  return null;
}

/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数（可选，默认 7 天）
 * @param options 额外选项（SameSite、Secure 等）
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
  // 关键：统一使用 encodeURIComponent 编码 cookie 值
  let cookieString = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;

  // 使用统一的环境判断逻辑
  const env = getEnvironment();
  const isHttps = window.location.protocol === 'https:';
  const isPreview = env === 'preview';
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);

  // 跟踪是否设置了 SameSite=None（无论是明确指定还是自动添加）
  let hasSameSiteNone = false;

  if (options?.sameSite) {
    // 如果明确指定了 SameSite，使用指定的值
    // 但如果指定了 SameSite=None 且不是 HTTPS，浏览器会拒绝，所以改为不设置（让浏览器决定）
    if (options.sameSite === 'None' && !isHttps) {
      // 不设置 SameSite，让浏览器使用默认值
    } else {
      cookieString += `; SameSite=${options.sameSite}`;
      if (options.sameSite === 'None') {
        hasSameSiteNone = true;
      }
    }
  } else if (isHttps) {
    // HTTPS 环境下：使用 SameSite=None（需要配合 Secure）
    cookieString += '; SameSite=None';
    hasSameSiteNone = true;
  } else if (isPreview && isIpAddress) {
    // 预览模式 + IP 地址 + HTTP：不设置 SameSite（让浏览器使用默认值，与开发服务器一致）
    // 不设置 SameSite
  } else {
    // 其他情况：不设置 SameSite（让浏览器使用默认值）
    // 注意：开发服务器可能也没有设置 SameSite，所以可以工作
  }

  // 添加 Secure 属性
  // 关键：如果设置了 SameSite=None，必须同时设置 Secure（浏览器要求）
  // 注意：在 HTTP 环境下设置 Secure cookie 会被浏览器拒绝，所以必须检查协议
  // 如果设置了 SameSite=None，必须在 HTTPS 环境下设置 Secure
  if (hasSameSiteNone && isHttps) {
    // SameSite=None 必须配合 Secure，且只能在 HTTPS 环境下使用
    cookieString += '; Secure';
  } else if (isHttps && (options?.secure || (isPreview && isHttps))) {
    // 其他情况下，如果明确指定了 secure 或预览环境，也设置 Secure
    cookieString += '; Secure';
  }

  // 添加 domain 属性（如果指定）
  // 如果没有指定 domain，尝试使用 getCookieDomain() 自动获取
  const domain = options?.domain ?? getCookieDomain();
  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * 删除 cookie
 * 注意：如果 cookie 是 HttpOnly 的，前端无法删除，需要后端通过 Set-Cookie header 清除
 * @param name cookie 名称
 * @param options 额外选项（domain 等）
 */
export function deleteCookie(
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

  // 基本删除尝试（仅对非 HttpOnly cookie 有效）
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * 获取跨子域名共享的 cookie domain
 * 从 storage/cross-domain 重新导出以保持向后兼容
 */
export { getCookieDomain };
