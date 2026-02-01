import { logger } from '@btc/shared-core';
;
/**
 * 辅助函数模块
 * 提供启动过程中的各种辅助函数
 */

/**
 * 延迟执行函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 安全执行函数，捕获错误
 */
export const safeExecute = async <T>(
  fn: () => Promise<T>,
  errorMessage: string = '执行失败'
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    logger.error(errorMessage, error);
    return null;
  }
};
