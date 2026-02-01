/**
 * 用户检查数据存储
 */
;

import { getCookie, setCookie, getCookieDomain } from '../../utils/storage/cookie';
import { sessionStorage } from '../../utils/storage/session';
import type { UserCheckData } from './useUserCheck';
import { logger } from '../../utils/logger/index';

const SESSION_STORAGE_KEYS = {
  STATUS: 'user_check_status',
  SERVER_TIME: 'user_check_serverTime',
  CREDENTIAL_EXPIRE_TIME: 'user_check_credentialExpireTime',
  REMAINING_TIME: 'user_check_remainingTime',
  DETAILS: 'user_check_details',
} as const;

/**
 * 存储用户检查数据
 * @param data 用户检查数据
 */
export function storeUserCheckData(data: UserCheckData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 1. 将 credentialExpireTime 存储到 cookie 的 btc_user 中
    const btcUserCookie = getCookie('btc_user');
    let btcUser: any = {};
    
    if (btcUserCookie) {
      try {
        // getCookie 已经做了 decodeURIComponent，所以直接解析
        btcUser = JSON.parse(btcUserCookie);
      } catch (e) {
        // 如果解析失败，使用空对象
        btcUser = {};
      }
    }

    // 更新 credentialExpireTime
    btcUser.credentialExpireTime = data.credentialExpireTime;

    // 重新设置 cookie
    const domain = getCookieDomain();
    const isHttps = window.location.protocol === 'https:';
    const cookieOptions: {
      sameSite?: 'Strict' | 'Lax' | 'None';
      secure: boolean;
      path: string;
      domain?: string;
    } = {
      secure: isHttps,
      path: '/',
    };
    if (isHttps) {
      cookieOptions.sameSite = 'None';
    }
    if (domain) {
      cookieOptions.domain = domain;
    }
    setCookie('btc_user', JSON.stringify(btcUser), 7, cookieOptions);

    // 2. 将所有字段存储到 sessionStorage（包括 credentialExpireTime，用于恢复时计算）
    sessionStorage.set(SESSION_STORAGE_KEYS.STATUS, data.status);
    sessionStorage.set(SESSION_STORAGE_KEYS.SERVER_TIME, data.serverCurrentTime);
    sessionStorage.set(SESSION_STORAGE_KEYS.CREDENTIAL_EXPIRE_TIME, data.credentialExpireTime);
    sessionStorage.set(SESSION_STORAGE_KEYS.REMAINING_TIME, data.remainingTime);
    sessionStorage.set(SESSION_STORAGE_KEYS.DETAILS, data.details);
  } catch (error) {
    logger.error('[storeUserCheckData] Failed to store data:', error);
  }
}

/**
 * 从 cookie 获取 credentialExpireTime
 */
export function getCredentialExpireTime(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const btcUserCookie = getCookie('btc_user');
    if (!btcUserCookie) {
      return null;
    }

    // getCookie 已经做了 decodeURIComponent，所以直接解析
    const btcUser = JSON.parse(btcUserCookie);
    return btcUser?.credentialExpireTime || null;
  } catch (error) {
    logger.error('[getCredentialExpireTime] Failed to get credentialExpireTime:', error);
    return null;
  }
}

/**
 * 从 sessionStorage 获取用户检查数据
 */
export function getUserCheckDataFromStorage(): Partial<UserCheckData> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const status = sessionStorage.get<string>(SESSION_STORAGE_KEYS.STATUS);
    const serverTime = sessionStorage.get<string>(SESSION_STORAGE_KEYS.SERVER_TIME);
    const credentialExpireTime = sessionStorage.get<string>(SESSION_STORAGE_KEYS.CREDENTIAL_EXPIRE_TIME);
    const remainingTime = sessionStorage.get<number>(SESSION_STORAGE_KEYS.REMAINING_TIME);
    const details = sessionStorage.get<string>(SESSION_STORAGE_KEYS.DETAILS);

    if (!status && !serverTime && !credentialExpireTime && !remainingTime && !details) {
      return null;
    }

    const result: Partial<UserCheckData> = {};
    if (status) {
      result.status = status as UserCheckData['status'];
    }
    if (serverTime) {
      result.serverCurrentTime = serverTime;
    }
    if (credentialExpireTime) {
      result.credentialExpireTime = credentialExpireTime;
    }
    if (remainingTime !== null && remainingTime !== undefined) {
      result.remainingTime = typeof remainingTime === 'number' ? remainingTime : Number(remainingTime);
    }
    if (details) {
      result.details = details;
    }
    return result;
  } catch (error) {
    logger.error('[getUserCheckDataFromStorage] Failed to get data:', error);
    return null;
  }
}

/**
 * 清除用户检查数据
 */
export function clearUserCheckData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.remove(SESSION_STORAGE_KEYS.STATUS);
    sessionStorage.remove(SESSION_STORAGE_KEYS.SERVER_TIME);
    sessionStorage.remove(SESSION_STORAGE_KEYS.CREDENTIAL_EXPIRE_TIME);
    sessionStorage.remove(SESSION_STORAGE_KEYS.REMAINING_TIME);
    sessionStorage.remove(SESSION_STORAGE_KEYS.DETAILS);
  } catch (error) {
    logger.error('[clearUserCheckData] Failed to clear data:', error);
  }
}

/**
 * 验证剩余时间的有效性
 * @param remainingTime 剩余时间（秒）
 * @returns 是否有效
 */
export function isValidRemainingTime(remainingTime: number | undefined | null): boolean {
  if (remainingTime === undefined || remainingTime === null) {
    return false;
  }
  // 有效范围：0 <= remainingTime <= 86400（秒，24小时）
  return remainingTime >= 0 && remainingTime <= 86400;
}

/**
 * 验证存储数据的有效性
 * @param data 用户检查数据
 * @returns 是否有效
 */
export function isValidUserCheckData(data: Partial<UserCheckData> | null): boolean {
  if (!data) {
    return false;
  }

  // 检查必要字段是否存在
  if (!data.status || !data.serverCurrentTime || !data.credentialExpireTime) {
    return false;
  }

  // 验证剩余时间
  if (!isValidRemainingTime(data.remainingTime)) {
    return false;
  }

  // 验证时间格式（ISO 8601）
  try {
    const serverTime = new Date(data.serverCurrentTime);
    const expireTime = new Date(data.credentialExpireTime);
    
    if (isNaN(serverTime.getTime()) || isNaN(expireTime.getTime())) {
      return false;
    }

    // 验证时间逻辑：过期时间应该晚于服务器当前时间
    if (expireTime.getTime() <= serverTime.getTime()) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
}

