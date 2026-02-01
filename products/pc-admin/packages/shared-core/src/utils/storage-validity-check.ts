/**
 * 存储有效性检查工具
 * 用于检查认证相关的存储（cookie、localStorage）是否有效
 * 当检测到存储被清除时，自动触发退出逻辑
 */
import { storage } from './storage/local';
import { sessionStorage } from './storage/session';
import { logger } from './logger/index';

// 防止重复触发退出的标志
let isLoggingOut = false;

// User-check 状态存储键名（与 useUserCheckStorage.ts 保持一致）
const USER_CHECK_STATUS_KEY = 'user_check_status';

// 登录后的宽限期（毫秒），在宽限期内不进行存储有效性检查
// 因为登录成功后，user-check 轮询需要时间启动和完成第一次检查
const LOGIN_GRACE_PERIOD = 5000; // 5 秒宽限期（给 user-check 足够时间完成第一次检查）

// 记录最近一次设置 is_logged_in 的时间
let lastLoginTime: number | null = null;

/**
 * 记录登录时间（在设置 is_logged_in 时调用）
 */
export function recordLoginTime(): void {
  lastLoginTime = Date.now();
}

/**
 * 检查是否在登录页
 */
function isLoginPage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const pathname = window.location.pathname;
  return pathname === '/login' || pathname.startsWith('/login?');
}

/**
 * 检查是否在登录后的宽限期内
 */
function isInLoginGracePeriod(): boolean {
  if (lastLoginTime === null) {
    return false;
  }
  const now = Date.now();
  const elapsed = now - lastLoginTime;
  return elapsed < LOGIN_GRACE_PERIOD;
}

/**
 * 检查认证存储的有效性
 * 检查 user-check 状态是否存在且有效
 * 如果不存在或状态为 expired/unauthorized，说明需要退出
 * 
 * 注意：
 * 1. 在登录页不进行检查，避免循环重定向
 * 2. 在登录后的宽限期内不进行检查，因为 user-check 轮询需要时间启动和完成第一次检查
 */
export function checkStorageValidity(): boolean {
  // 如果在登录页，直接返回 true，不进行检查（避免循环重定向）
  if (isLoginPage()) {
    return true;
  }

  // 如果在登录后的宽限期内，暂时不检查（给 user-check 轮询时间完成第一次检查）
  const inGracePeriod = isInLoginGracePeriod();
  if (inGracePeriod) {
    return true;
  }

  try {
    // 检查 user-check 状态
    // user-check 状态存储在 sessionStorage 中
    const userCheckStatus = sessionStorage.get<string>(USER_CHECK_STATUS_KEY);
    
    // 如果状态为 'valid' 或 'soon_expire'，说明认证有效
    if (userCheckStatus === 'valid' || userCheckStatus === 'soon_expire') {
      return true;
    }
    
    // 如果状态为 'expired' 或 'unauthorized'，说明认证无效
    if (userCheckStatus === 'expired' || userCheckStatus === 'unauthorized') {
      if (import.meta.env.DEV) {
        console.warn('[checkStorageValidity] ❌ user-check 状态显示认证无效:', userCheckStatus);
      }
      return false;
    }
    
    // 如果状态不存在，可能是：
    // 1. 刚登录，user-check 还没完成第一次检查（应该在宽限期内处理）
    // 2. 存储被清除
    // 3. 页面刷新后，sessionStorage 被清除（但 cookie 可能还存在）
    // 此时需要检查 cookie 中的 access_token 或 btc_user
    if (!userCheckStatus) {
      // 检查 cookie 中的 access_token
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          if (!c) continue;
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
          }
        }
        return null;
      };
      
      const accessToken = getCookie('access_token');
      const btcUser = getCookie('btc_user');
      
      if (accessToken || btcUser) {
        // 有 token 或 user cookie，说明可能刚登录或页面刷新，user-check 还没完成
        // 在宽限期外但有 token，可能是页面刷新导致 sessionStorage 被清除
        // 此时应该允许，让 user-check 轮询重新检查
        if (import.meta.env.DEV) {
          console.log('[checkStorageValidity] ⚠️ user-check 状态不存在，但有 token，允许继续（等待 user-check 重新检查）', {
            hasAccessToken: !!accessToken,
            hasBtcUser: !!btcUser,
          });
        }
        return true;
      }
      
      // 既没有 user-check 状态，也没有 token，说明存储被清除
      if (import.meta.env.DEV) {
        console.warn('[checkStorageValidity] ❌ user-check 状态不存在且无 token，可能触发自动退出', {
          storageKey: USER_CHECK_STATUS_KEY,
          hasUserCheckStatus: !!userCheckStatus,
          hasAccessToken: !!accessToken,
          hasBtcUser: !!btcUser,
          lastLoginTime: lastLoginTime ? new Date(lastLoginTime).toISOString() : null,
          inGracePeriod: isInLoginGracePeriod(),
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
        });
      }
      return false;
    }
    
    // 其他未知状态，保守返回 true（让 user-check 自己处理）
    if (import.meta.env.DEV) {
      console.warn('[checkStorageValidity] ⚠️ user-check 状态未知:', userCheckStatus, '，允许继续');
    }
    return true;
  } catch (error) {
    // 检查失败，保守返回 false
    if (import.meta.env.DEV) {
      console.error('[checkStorageValidity] ❌ 检查失败:', error);
    }
    return false;
  }
}

/**
 * 触发自动退出（当检测到存储被清除时）
 */
export async function triggerAutoLogout(): Promise<void> {
  // 已删除：禁用所有自动退出和重定向逻辑
  if (import.meta.env.DEV) {
    console.warn('[triggerAutoLogout] ⚠️ 已禁用自动退出和重定向，不再跳转到登录页');
  }
  return;

  // 防止重复触发
  if (isLoggingOut) {
    if (import.meta.env.DEV) {
      console.warn('[triggerAutoLogout] ⚠️ 已在退出流程中，跳过');
    }
    return;
  }

  // 如果已经在登录页，不需要再次跳转
  if (isLoginPage()) {
    if (import.meta.env.DEV) {
      console.log('[triggerAutoLogout] ✅ 已在登录页，跳过');
    }
    return;
  }

  if (import.meta.env.DEV) {
    console.error('[triggerAutoLogout] 🚨 触发自动退出！', {
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      lastLoginTime: lastLoginTime ? new Date(lastLoginTime).toISOString() : null,
      inGracePeriod: isInLoginGracePeriod(),
      elapsed: lastLoginTime ? `${Date.now() - lastLoginTime}ms` : 'N/A',
      gracePeriod: `${LOGIN_GRACE_PERIOD}ms`,
    });
  }

  isLoggingOut = true;

  try {
    // 动态导入 logoutCore
    const { logoutCore } = await import('../auth/logoutCore');
    
    if (import.meta.env.DEV) {
      console.log('[triggerAutoLogout] 调用 logoutCore...');
    }
    
    // 调用退出逻辑（标记为远程退出，不调用 API）
    await logoutCore({
      isRemoteLogout: true,
    });

    if (import.meta.env.DEV) {
      console.log('[triggerAutoLogout] logoutCore 完成，准备跳转到登录页');
    }

    // 退出成功后，跳转到登录页
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 将相对路径转换为完整 URL
      const { convertPathToFullUrl } = await import('./redirect');
      const fullCallbackUrl = await convertPathToFullUrl(currentPath);

      if (isProductionSubdomain) {
        // 生产环境子域名，跳转到主域名登录页
        const loginUrl = `${protocol}//bellis.com.cn/login?oauth_callback=${encodeURIComponent(fullCallbackUrl)}`;
        if (import.meta.env.DEV) {
          console.log('[triggerAutoLogout] 跳转到主域名登录页:', loginUrl);
          console.log('[triggerAutoLogout] Full callback URL:', fullCallbackUrl);
        }
        window.location.href = loginUrl;
      } else {
        // 开发环境或主域名，跳转到本地登录页
        const loginUrl = `/login?oauth_callback=${encodeURIComponent(fullCallbackUrl)}`;
        if (import.meta.env.DEV) {
          console.log('[triggerAutoLogout] 跳转到本地登录页:', loginUrl);
          console.log('[triggerAutoLogout] Full callback URL:', fullCallbackUrl);
        }
        window.location.href = loginUrl;
      }
    }
  } catch (error) {
    logger.error('[storageValidityCheck] 自动退出失败:', error);
    if (import.meta.env.DEV) {
      console.error('[triggerAutoLogout] ❌ 自动退出失败:', error);
    }
    // 即使退出失败，也尝试跳转到登录页（但需要检查是否已在登录页）
    if (typeof window !== 'undefined' && !isLoginPage()) {
      try {
        window.location.href = '/login';
      } catch (e) {
        // 静默失败
      }
    }
  } finally {
    // 延迟重置标志，避免立即再次触发
    setTimeout(() => {
      isLoggingOut = false;
      if (import.meta.env.DEV) {
        console.log('[triggerAutoLogout] 重置退出标志');
      }
    }, 2000);
  }
}
