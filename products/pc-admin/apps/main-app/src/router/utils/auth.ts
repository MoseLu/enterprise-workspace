import { getCookie } from '@btc/shared-core/utils/cookie';
import { storage } from '@btc/shared-core/utils/storage';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

/**
 * 检查用户是否已认证
 * 
 * 认证判断逻辑（按优先级）：
 * 1. 优先检查 is_logged_in 标记（登录 API 返回 200 后立即设置）
 * 2. 检查 user-check 轮询的状态（sessionStorage 中的 user_check_status）
 * 3. 检查 btc_user cookie 中的过期时间（user-check 设置的）
 * 
 * 注意：
 * - access_token 是 HTTPONLY 的，无法直接读取，只能通过 user-check 接口判断
 * - 登录 API 返回 200 就表示登录成功，不需要检查 cookie
 */
export function isAuthenticated(): boolean {
  // ========== 步骤 1：检查 is_logged_in 标记（最高优先级） ==========
  // 登录 API 返回 200 后立即设置此标记，用于解决登录后立即跳转时 user-check 可能还没完成的问题
  try {
    const settingsKey = 'settings';
    const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
    
    if (currentSettings.is_logged_in === true) {
      // 如果标记存在，说明刚登录成功，即使 user-check 还没完成，也认为已认证
      return true;
    }
  } catch (error) {
    // 如果检查失败，继续检查其他方式
  }

  // ========== 步骤 2：检查 user-check 轮询的状态 ==========
  // user-check 会将状态存储到 sessionStorage 中
  try {
    const userCheckStatus = sessionStorage.get<string>('user_check_status');
    
    // 如果状态是 'valid' 或 'soon_expire'，说明已登录且状态正常
    if (userCheckStatus === 'valid' || userCheckStatus === 'soon_expire') {
      return true;
    }
    
    // 如果状态是 'expired' 或 'unauthorized'，说明已过期或未授权
    if (userCheckStatus === 'expired' || userCheckStatus === 'unauthorized') {
      return false;
    }
  } catch (error) {
    // 如果检查失败，继续检查其他方式
  }

  // ========== 步骤 3：检查 btc_user cookie 中的过期时间（兜底方案） ==========
  // user-check 会将 credentialExpireTime 存储到 btc_user cookie 中
  // 如果 sessionStorage 没有数据（可能是页面刷新），使用 cookie 中的过期时间判断
  try {
    const btcUserCookie = getCookie('btc_user');
    
    if (!btcUserCookie) {
      // 如果 btc_user cookie 也不存在，说明未登录
      return false;
    }

    // 解析 btc_user cookie（getCookie 已经处理了 URL 解码）
    const btcUser = JSON.parse(btcUserCookie);
    const credentialExpireTime = btcUser?.credentialExpireTime;

    if (!credentialExpireTime) {
      // 如果没有过期时间，无法判断，保守返回 false
      return false;
    }

    // 比较当前时间与过期时间
    const expireTime = new Date(credentialExpireTime).getTime();
    const now = Date.now();

    // 如果当前时间小于过期时间，说明还在有效期内
    if (now < expireTime) {
      return true;
    }

    // 已过期
    return false;
  } catch (error) {
    // 解析失败，保守返回 false
    return false;
  }
}

