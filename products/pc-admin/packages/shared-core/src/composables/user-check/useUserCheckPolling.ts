/**
 * 用户检查轮询管理器
 */
import { checkUser } from './useUserCheck';
import { storeUserCheckData, getUserCheckDataFromStorage, isValidRemainingTime } from './useUserCheckStorage';
import { logger } from '../../utils/logger/index';

type PollingCallback = (data: { remainingTime: number; status: string }) => void;

let pollingTimer: ReturnType<typeof setTimeout> | null = null;
let isPolling = false;
let currentCallback: PollingCallback | null = null;
let exitTimer: ReturnType<typeof setTimeout> | null = null;
let isChecking = false; // 防止 performCheck 并发执行（虽然只有一个调用点，但保留此机制以防万一）

/**
 * 执行退出逻辑
 */
async function performLogout(): Promise<void> {
  // 已删除：禁用所有自动退出和重定向逻辑
  stopPolling();
  if (import.meta.env.DEV) {
    console.warn('[useUserCheckPolling] ⚠️ 已禁用自动退出和重定向，不再跳转到登录页');
  }
  return;

  // 停止轮询
  stopPolling();

  // 尝试从全局获取 logout 函数
  if (typeof window !== 'undefined') {
    const globalLogout = (window as any).__APP_LOGOUT__;
    if (typeof globalLogout === 'function') {
      try {
        await globalLogout();
        return;
      } catch (error) {
        logger.error('[useUserCheckPolling] Logout function failed:', error);
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
 * 显示退出提示并执行退出
 */
function startExitProcess(): void {
  // 停止轮询
  stopPolling();

  // 显示提示消息
  try {
    import('@btc/shared-components').then((sharedComponents) => {
      const { BtcMessage } = sharedComponents as { BtcMessage?: any };
      if (BtcMessage && typeof BtcMessage.warning === 'function') {
        BtcMessage.warning('您的登录状态即将到期，正在退出登录，请不要进行任何操作！', {
          duration: 5000, // 显示5秒
        });
      }
    }).catch((error) => {
      logger.error('[useUserCheckPolling] Failed to import BtcMessage:', error);
    });
  } catch (error) {
    logger.error('[useUserCheckPolling] Failed to show exit warning:', error);
  }

  // 5秒后执行退出
  exitTimer = setTimeout(() => {
    performLogout().catch((error) => {
      logger.error('[useUserCheckPolling] Failed to perform logout:', error);
    });
  }, 5000);
}

/**
 * 计算实际剩余时间（使用当前时间，而不是存储的服务器时间）
 * @param credentialExpireTime 凭证过期时间（ISO 8601）
 * @param serverCurrentTime 服务器当前时间（ISO 8601，仅用于验证，不用于计算）
 * @returns 实际剩余时间（秒），如果时间无效返回 -1
 */
function calculateActualRemainingTime(
  credentialExpireTime: string,
  serverCurrentTime: string
): number {
  try {
    // 验证输入参数
    if (!credentialExpireTime || typeof credentialExpireTime !== 'string') {
      logger.warn('[useUserCheckPolling] credentialExpireTime is invalid:', credentialExpireTime);
      return -1;
    }

    const expireTime = new Date(credentialExpireTime).getTime();
    // 关键：使用当前时间计算，而不是存储的服务器时间
    // 因为存储的服务器时间是旧的，使用它会导致计算不准确
    const currentTime = Date.now();

    if (isNaN(expireTime)) {
      logger.warn('[useUserCheckPolling] Failed to parse credentialExpireTime:', credentialExpireTime);
      return -1; // 无效时间
    }

    // 计算实际剩余时间（秒）
    // 注意：不在这里使用 Math.max(0, ...)，保留负数以便上层判断凭证已过期
    const actualRemainingTime = Math.floor((expireTime - currentTime) / 1000);
    return actualRemainingTime;
  } catch (error) {
    logger.error('[useUserCheckPolling] Failed to calculate actual remaining time:', error);
    return -1;
  }
}

/**
 * 执行一次用户检查并安排下次轮询
 */
async function performCheck(): Promise<void> {
  if (!isPolling) {
    return;
  }

  // 防止并发执行
  if (isChecking) {
    if (import.meta.env.DEV) {
      console.warn('[useUserCheckPolling] performCheck is already running, skipping');
    }
    return;
  }

  isChecking = true;

  try {
    const result = await checkUser();

    if (!result || !result.isValid || !result.data) {
      // 检查失败，停止轮询
      stopPolling();
      return;
    }

    const { data } = result;
    const {
      credentialExpireTime,
      serverCurrentTime,
      remainingTime,
      status,
    } = data;

    // 1. 立即更新会话存储数据（保证数据最新，用于比对）
    storeUserCheckData(data);

    // 2. 计算实际剩余时间（主要依据：UTC 时间差）
    const actualRemainingTime = calculateActualRemainingTime(
      credentialExpireTime,
      serverCurrentTime
    );

    // 3. 验证计算结果的合理性（remainingTime 仅用于验证）
    if (remainingTime !== undefined && remainingTime !== null && isValidRemainingTime(remainingTime)) {
      const diff = Math.abs(actualRemainingTime - remainingTime);
      const maxDiff = Math.max(actualRemainingTime * 0.1, 10); // 允许10%误差或至少10秒
      if (diff > maxDiff) {
        // 差异过大，记录警告但继续使用计算值
        if (import.meta.env.DEV) {
          console.warn(
            `[useUserCheckPolling] 时间差计算与 remainingTime 差异较大: 计算值=${actualRemainingTime}秒, API值=${remainingTime}秒, 差异=${diff}秒`
          );
        }
      }
    }

    // 4. 验证实际剩余时间的有效性（0-86400秒）
    if (!isValidRemainingTime(actualRemainingTime)) {
      // 已删除：禁用自动退出逻辑
      if (actualRemainingTime < 0) {
        // 凭证已过期，但已禁用自动退出
        if (import.meta.env.DEV) {
          console.warn(
            `[useUserCheckPolling] 实际剩余时间异常（已过期）: ${actualRemainingTime}秒，但已禁用自动退出`
          );
        }
        stopPolling();
        return;
      }
      
      // 其他异常情况（如 NaN、undefined 等），使用默认间隔（5分钟）重新检查
      if (import.meta.env.DEV) {
        console.warn(
          `[useUserCheckPolling] 实际剩余时间异常: ${actualRemainingTime}秒，使用默认间隔重新检查`
        );
      }
      if (isPolling) {
        pollingTimer = setTimeout(() => {
          performCheck();
        }, 5 * 60 * 1000); // 默认5分钟
      }
      return;
    }

    // 5. 结合用户状态判断
    if (status === 'expired' || status === 'unauthorized') {
      // 已删除：禁用自动退出逻辑
      if (import.meta.env.DEV) {
        console.warn(`[useUserCheckPolling] 用户状态：${status}，但已禁用自动退出`);
      }
      stopPolling();
      return;
    }

    if (status === 'soon_expire' && actualRemainingTime < 30) {
      // 已删除：禁用自动退出逻辑
      if (import.meta.env.DEV) {
        console.warn(
          `[useUserCheckPolling] 用户状态：${status}，实际剩余时间：${actualRemainingTime}秒 < 30秒，但已禁用自动退出`
        );
      }
      stopPolling();
      return;
    }

    // 6. 计算下一次调用时间：actualRemainingTime - 30秒（留30秒缓冲）
    const nextCallTime = actualRemainingTime - 30;

    // 如果剩余时间 <= 30秒，不再安排下一次调用（但已禁用自动退出）
    if (nextCallTime <= 0) {
      if (import.meta.env.DEV) {
        console.warn(
          `[useUserCheckPolling] 剩余时间：${actualRemainingTime}秒 <= 30秒，但已禁用自动退出`
        );
      }
      stopPolling();
      return;
    }

    // 7. 可选：设置最大间隔（如1小时），避免间隔过长
    const maxInterval = 60 * 60 * 1000; // 1小时
    const interval = Math.min(nextCallTime * 1000, maxInterval);

    // 通知回调
    if (currentCallback) {
      currentCallback({
        remainingTime: actualRemainingTime,
        status: data.status,
      });
    }

    // 8. 使用 setTimeout 递归调用
    if (isPolling) {
      pollingTimer = setTimeout(() => {
        performCheck();
      }, interval);
    }
  } catch (error) {
    logger.error('[useUserCheckPolling] Check failed:', error);
    // 即使出错也继续轮询（使用默认间隔）
    if (isPolling) {
      pollingTimer = setTimeout(() => {
        performCheck();
      }, 5 * 60 * 1000); // 默认5分钟
    }
  } finally {
    isChecking = false;
  }
}

/**
 * 启动用户检查轮询
 * @param callback 每次检查后的回调函数
 * @param forceImmediate 是否强制立即检查（登录后需要立即调用一次）
 */
export function startPolling(callback?: PollingCallback, forceImmediate = false): void {
  // 如果已经在轮询，且不是强制立即检查，直接返回（避免重复启动）
  if (isPolling && !forceImmediate) {
    return;
  }

  // 如果已经在轮询且是强制立即检查，先停止
  if (isPolling) {
    stopPolling();
  }

  isPolling = true;
  currentCallback = callback || null;

  // 如果不是强制立即检查，尝试从 sessionStorage 恢复剩余时间
  if (!forceImmediate && typeof window !== 'undefined') {
    try {
      const storedData = getUserCheckDataFromStorage();
      const storedRemainingTime = storedData?.remainingTime;
      const storedCredentialExpireTime = storedData?.credentialExpireTime;
      const storedServerCurrentTime = storedData?.serverCurrentTime;

      // 如果存在有效的存储数据，尝试计算下一次调用时间
      if (
        isValidRemainingTime(storedRemainingTime) &&
        storedCredentialExpireTime &&
        storedServerCurrentTime
      ) {
        // 计算实际剩余时间（使用当前时间，而不是存储的服务器时间）
        const actualRemainingTime = calculateActualRemainingTime(
          storedCredentialExpireTime,
          storedServerCurrentTime
        );

        // 如果计算出的剩余时间有效，使用它计算下一次调用时间
        if (isValidRemainingTime(actualRemainingTime)) {
          const nextCallTime = actualRemainingTime - 30;

          // 如果还有时间，延迟执行第一次检查
          if (nextCallTime > 0) {
            const maxInterval = 60 * 60 * 1000; // 1小时
            const interval = Math.min(nextCallTime * 1000, maxInterval);

            if (interval > 0) {
              // 成功恢复剩余时间，设置定时器延迟调用，不立即调用
              pollingTimer = setTimeout(() => {
                performCheck();
              }, interval);
              return; // 关键：返回，不执行立即检查
            }
          }
        }
      }
    } catch (error) {
      // 如果恢复失败，继续执行立即检查
      if (import.meta.env.DEV) {
        console.warn('[useUserCheckPolling] Failed to restore remaining time from storage:', error);
      }
    }
  }

  // 如果没有存储的剩余时间，或者强制立即检查，立即执行一次检查
  performCheck();
}

/**
 * 停止用户检查轮询
 */
export function stopPolling(): void {
  isPolling = false;
  currentCallback = null;
  isChecking = false; // 重置检查状态

  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }

  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
  }
}

/**
 * 检查是否正在轮询
 */
export function isPollingActive(): boolean {
  return isPolling;
}

