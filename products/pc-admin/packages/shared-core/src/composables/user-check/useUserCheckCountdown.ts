/**
 * 用户检查倒计时和退出逻辑
 */
import { getCredentialExpireTime, getUserCheckDataFromStorage } from './useUserCheckStorage';
import { stopPolling } from './useUserCheckPolling';
import { logger } from '../../utils/logger/index';

let countdownTimer: ReturnType<typeof setInterval> | null = null;
let countdownActive = false;
let warningShown = false;

/**
 * 执行退出逻辑
 */
async function performLogout(): Promise<void> {
  // 已删除：禁用所有自动退出和重定向逻辑
  stopPolling();
  stopCountdown();
  if (import.meta.env.DEV) {
    console.warn('[useUserCheckCountdown] ⚠️ 已禁用自动退出和重定向，不再跳转到登录页');
  }
  return;

  // 停止轮询
  stopPolling();
  // 停止倒计时
  stopCountdown();

  // 尝试从全局获取 logout 函数
  if (typeof window !== 'undefined') {
    const globalLogout = (window as any).__APP_LOGOUT__;
    if (typeof globalLogout === 'function') {
      try {
        await globalLogout();
        return;
      } catch (error) {
        logger.error('[useUserCheckCountdown] Logout function failed:', error);
      }
    }
  }

  // 如果找不到退出函数或调用失败，尝试直接跳转到登录页
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
    
    if (isProductionSubdomain) {
      window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
    } else {
      window.location.href = '/login?logout=1';
    }
  }
}

/**
 * 显示即将退出警告
 */
function showWarning(): void {
  if (warningShown) {
    return;
  }

  try {
    // 动态导入 BtcMessage 避免循环依赖
    import('@btc/shared-components').then((sharedComponents) => {
      const { BtcMessage } = sharedComponents as { BtcMessage?: any };
      if (BtcMessage && typeof BtcMessage.warning === 'function') {
        BtcMessage.warning('您的登录凭证即将过期，系统将在几秒后自动退出，请及时保存工作', {
          duration: 5000, // 显示5秒
        });
        warningShown = true;
      }
    }).catch((error) => {
      logger.error('[useUserCheckCountdown] Failed to import BtcMessage:', error);
    });
  } catch (error) {
    logger.error('[useUserCheckCountdown] Failed to show warning:', error);
  }
}

/**
 * 检查倒计时状态
 */
function checkCountdown(): void {
  if (!countdownActive) {
    return;
  }

  try {
    // 从 cookie 获取 credentialExpireTime
    const expireTimeStr = getCredentialExpireTime();
    if (!expireTimeStr) {
      // 如果获取不到过期时间，停止倒计时
      stopCountdown();
      return;
    }

    const expireTime = new Date(expireTimeStr).getTime();
    const now = Date.now();
    const remainingTime = Math.max(0, Math.floor((expireTime - now) / 1000));

    // 从 sessionStorage 获取状态
    const storedData = getUserCheckDataFromStorage();
    const status = storedData?.status;

    // 如果剩余时间不足10秒且未显示警告，显示警告
    if (remainingTime < 10 && remainingTime > 0 && !warningShown) {
      showWarning();
    }

    // 如果剩余时间为0且状态为expired，执行退出
    if (remainingTime <= 0 && status === 'expired') {
      performLogout().catch((error) => {
        logger.error('[useUserCheckCountdown] Failed to perform logout:', error);
      });
      return;
    }

    // 如果剩余时间大于30秒，停止倒计时（由轮询接管）
    if (remainingTime > 30) {
      stopCountdown();
      warningShown = false;
    }
  } catch (error) {
    logger.error('[useUserCheckCountdown] Countdown check failed:', error);
  }
}

/**
 * 启动倒计时（当剩余时间不足30秒时）
 */
export function startCountdown(): void {
  if (countdownActive) {
    return;
  }

  countdownActive = true;
  warningShown = false;

  // 每秒检查一次
  countdownTimer = setInterval(() => {
    checkCountdown();
  }, 1000);

  // 立即检查一次
  checkCountdown();
}

/**
 * 停止倒计时
 */
export function stopCountdown(): void {
  countdownActive = false;
  warningShown = false;

  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

/**
 * 检查是否正在倒计时
 */
export function isCountdownActive(): boolean {
  return countdownActive;
}

