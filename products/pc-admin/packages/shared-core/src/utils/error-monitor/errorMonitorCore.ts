import { storage } from '../storage/local';
import { formatError, type ErrorInfo, type FormattedError } from './formatError';
import { logger } from '../logger/index';
;

/**
 * 错误监控事件名称
 */
const ERROR_MONITOR_EVENT = 'btc-error-monitor-update';
const ERROR_MONITOR_CLEAR_EVENT = 'btc-error-monitor-clear';

/**
 * localStorage 统一键名
 */
const STORAGE_KEY = 'btc_error';

/**
 * 清理周期类型
 */
export type CleanupPeriod = 'today' | '3days' | '7days' | '30days' | 'never';

/**
 * 清理周期配置
 */
const CLEANUP_PERIOD_DAYS: Record<CleanupPeriod, number> = {
  today: 1,
  '3days': 3,
  '7days': 7,
  '30days': 30,
  never: Infinity,
};

/**
 * 获取清理周期（从 localStorage 读取，默认保留当天）
 */
function getCleanupPeriod(): CleanupPeriod {
  try {
    const storageData = loadStorageData();
    if (storageData.cleanupPeriod &&
        (storageData.cleanupPeriod === 'today' ||
         storageData.cleanupPeriod === '3days' ||
         storageData.cleanupPeriod === '7days' ||
         storageData.cleanupPeriod === '30days' ||
         storageData.cleanupPeriod === 'never')) {
      return storageData.cleanupPeriod;
    }
  } catch (error) {
    console.warn('[errorMonitor] 读取清理周期失败', error);
  }
  return 'today'; // 默认保留当天
}

/**
 * 设置清理周期
 */
export function setCleanupPeriod(period: CleanupPeriod): void {
  try {
    const storageData = loadStorageData();
    storageData.cleanupPeriod = period;
    saveStorageData(storageData);
    // 立即执行一次清理
    clearExpiredErrors();
  } catch (error) {
    console.warn('[errorMonitor] 设置清理周期失败', error);
  }
}

/**
 * 全局错误列表存储（使用 window 对象存储，避免使用 globalState）
 */
declare global {
  interface Window {
    __BTC_ERROR_LIST__?: FormattedError[];
    __BTC_ERROR_MONITOR_CLEANUP_TIMER__?: number;
    __BTC_ERROR_MONITOR_CURRENT_DATE__?: string; // 当前存储的日期
  }
}

/**
 * 获取当前日期字符串（YYYY-MM-DD）
 */
function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取存储数据结构
 */
interface ErrorStorageData {
  cleanupPeriod?: CleanupPeriod;
  errors?: Record<string, FormattedError[]>; // 按日期存储：{ "2025-12-02": [...], "2025-12-03": [...] }
}

/**
 * 从 storage 加载存储数据
 */
function loadStorageData(): ErrorStorageData {
  try {
    const data = storage.get<ErrorStorageData>(STORAGE_KEY);
    return data || {};
  } catch (error) {
    console.warn('[errorMonitor] 从 storage 加载数据失败', error);
  }
  return {};
}

/**
 * 保存数据到 storage
 */
function saveStorageData(data: ErrorStorageData): void {
  try {
    storage.set(STORAGE_KEY, data);
  } catch (error) {
    console.warn('[errorMonitor] 保存数据到 storage 失败', error);
  }
}

/**
 * 从 localStorage 加载当天的错误列表
 */
function loadTodayErrorsFromStorage(): FormattedError[] {
  try {
    const storageData = loadStorageData();
    const today = getCurrentDateString();
    if (storageData.errors && storageData.errors[today]) {
      return storageData.errors[today];
    }
  } catch (error) {
    console.warn('[errorMonitor] 从 localStorage 加载错误列表失败', error);
  }
  return [];
}

/**
 * 保存当天的错误列表到 localStorage
 */
function saveTodayErrorsToStorage(errorList: FormattedError[]): void {
  try {
    const storageData = loadStorageData();
    const today = getCurrentDateString();
    if (!storageData.errors) {
      storageData.errors = {};
    }
    storageData.errors[today] = errorList;
    saveStorageData(storageData);
  } catch (error) {
    console.warn('[errorMonitor] 保存错误列表到 localStorage 失败', error);
  }
}

/**
 * 清除过期的错误数据（兜底机制）
 */
function clearExpiredErrors(): void {
  try {
    const storageData = loadStorageData();
    if (!storageData.errors) {
      return;
    }

    const period = getCleanupPeriod();
    if (period === 'never') {
      return; // 永不清理
    }

    const daysToKeep = CLEANUP_PERIOD_DAYS[period];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 遍历所有日期的错误数据
    const datesToRemove: string[] = [];
    Object.keys(storageData.errors).forEach((dateStr) => {
      const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateMatch && dateMatch[1] && dateMatch[2] && dateMatch[3]) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1; // 月份从 0 开始
        const day = parseInt(dateMatch[3], 10);
        const errorDate = new Date(year, month, day);
        errorDate.setHours(0, 0, 0, 0);

        // 如果错误日期早于截止日期，标记为删除
        if (errorDate < cutoffDate) {
          datesToRemove.push(dateStr);
        }
      }
    });

    // 删除过期的日期数据
    datesToRemove.forEach((date) => {
      delete storageData.errors![date];
    });

    // 保存更新后的数据
    saveStorageData(storageData);

    if (datesToRemove.length > 0) {
      console.info(`[errorMonitor] 已清除 ${datesToRemove.length} 个过期的错误数据`);
    }
  } catch (error) {
    console.warn('[errorMonitor] 清除过期错误数据失败', error);
  }
}

/**
 * 清除昨天的错误数据（用于定时器）
 */
function clearYesterdayErrors(): void {
  try {
    const storageData = loadStorageData();
    if (!storageData.errors) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayKey = `${year}-${month}-${day}`;

    if (storageData.errors[yesterdayKey]) {
      delete storageData.errors[yesterdayKey];
      saveStorageData(storageData);
    }
  } catch (error) {
    console.warn('[errorMonitor] 清除昨天的错误数据失败', error);
  }
}

/**
 * 设置凌晨 00:00 清除定时器
 */
function setupMidnightCleanup(): void {
  // 清除之前的定时器
  if (window.__BTC_ERROR_MONITOR_CLEANUP_TIMER__) {
    clearTimeout(window.__BTC_ERROR_MONITOR_CLEANUP_TIMER__);
  }

  // 计算到明天凌晨 00:00 的毫秒数
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  // 设置定时器
  window.__BTC_ERROR_MONITOR_CLEANUP_TIMER__ = window.setTimeout(() => {
    // 清除过期的错误数据（根据清理周期）
    clearExpiredErrors();

    // 切换到新日期（如果应用还在运行）
    checkAndSwitchDateIfNeeded();

    // 递归设置下一次清除
    setupMidnightCleanup();
  }, msUntilMidnight);
}

/**
 * 检查日期是否变化，如果变化则切换到新日期的存储
 */
function checkAndSwitchDateIfNeeded(): void {
  const currentDate = getCurrentDateString();
  const storedDate = window.__BTC_ERROR_MONITOR_CURRENT_DATE__;

  // 如果日期变化了，需要切换到新日期的存储
  if (storedDate && storedDate !== currentDate) {
    // 保存旧日期的数据（虽然会被清除，但为了完整性）
    if (window.__BTC_ERROR_LIST__ && window.__BTC_ERROR_LIST__.length > 0) {
      try {
        const storageData = loadStorageData();
        if (!storageData.errors) {
          storageData.errors = {};
        }
        storageData.errors[storedDate] = window.__BTC_ERROR_LIST__;
        saveStorageData(storageData);
      } catch (error) {
        console.warn('[errorMonitor] 保存旧日期错误数据失败', error);
      }
    }

    // 清除昨天的错误数据
    clearYesterdayErrors();

    // 加载新日期的错误列表
    const newErrors = loadTodayErrorsFromStorage();
    window.__BTC_ERROR_LIST__ = newErrors;
    window.__BTC_ERROR_MONITOR_CURRENT_DATE__ = currentDate;

    // 通知监听者日期已变化
    window.dispatchEvent(
      new CustomEvent(ERROR_MONITOR_EVENT, {
        detail: { errorList: newErrors },
        bubbles: true,
      })
    );
  } else if (!storedDate) {
    // 首次初始化，设置当前日期
    window.__BTC_ERROR_MONITOR_CURRENT_DATE__ = currentDate;
  }
}

/**
 * 初始化错误监控（在主应用启动时调用）
 * 初始化全局错误列表存储，并从 localStorage 恢复当天的错误
 */
export function initErrorMonitor() {
  // 兜底机制：清除所有过期的错误数据（即使凌晨没有启动项目）
  clearExpiredErrors();

  // 从 localStorage 恢复当天的错误列表
  const storedErrors = loadTodayErrorsFromStorage();
  window.__BTC_ERROR_LIST__ = storedErrors;
  window.__BTC_ERROR_MONITOR_CURRENT_DATE__ = getCurrentDateString();

  // 清除昨天的错误数据（如果清理周期允许）
  const period = getCleanupPeriod();
  if (period !== 'never') {
    clearYesterdayErrors();
  }

  // 设置凌晨 00:00 清除定时器
  setupMidnightCleanup();
}

/**
 * 获取当前错误列表
 */
function getErrorList(): FormattedError[] {
  if (!window.__BTC_ERROR_LIST__) {
    window.__BTC_ERROR_LIST__ = [];
  }
  return window.__BTC_ERROR_LIST__;
}

/**
 * 更新错误列表（主应用和子应用都可调用）
 * 使用 CustomEvent 替代 globalState
 */
export function updateErrorList(errorInfo: ErrorInfo) {
  try {
    // 检查日期是否变化
    checkAndSwitchDateIfNeeded();

    const errorList = getErrorList();
    const formattedError = formatError(errorInfo);

    // 去重：避免相同错误短时间刷屏（可选）
    const isDuplicate = errorList.some(
      (item) =>
        item.message === formattedError.message &&
        item.source === formattedError.source &&
        item.type === formattedError.type &&
        // 如果时间差小于 1 秒，认为是重复错误
        Math.abs(new Date(item.time).getTime() - new Date(formattedError.time).getTime()) < 1000
    );

    if (!isDuplicate) {
      const newErrorList = [...errorList, formattedError];
      // 最多保留 1000 条，避免内存溢出（已有保留时间限制）
      if (newErrorList.length > 1000) {
        newErrorList.shift();
      }
      window.__BTC_ERROR_LIST__ = newErrorList;

      // 保存到 localStorage
      saveTodayErrorsToStorage(newErrorList);

      // 通过 CustomEvent 通知所有监听者
      window.dispatchEvent(
        new CustomEvent(ERROR_MONITOR_EVENT, {
          detail: { errorList: newErrorList },
          bubbles: true,
        })
      );
    }
  } catch (error) {
    logger.error('[errorMonitor] 更新错误列表失败', error);
  }
}

/**
 * 清空错误列表
 */
export function clearErrorList() {
  try {
    window.__BTC_ERROR_LIST__ = [];

    // 清除 localStorage 中的当天数据
    saveTodayErrorsToStorage([]);

    // 通过 CustomEvent 通知所有监听者
    window.dispatchEvent(
      new CustomEvent(ERROR_MONITOR_CLEAR_EVENT, {
        detail: { errorList: [] },
        bubbles: true,
      })
    );
  } catch (error) {
    logger.error('[errorMonitor] 清空错误列表失败', error);
  }
}

/**
 * 获取错误列表（供监听者使用）
 */
export function getErrorListSync(): FormattedError[] {
  return getErrorList();
}

/**
 * 监听错误列表更新
 */
export function onErrorListUpdate(callback: (errorList: FormattedError[]) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ errorList: FormattedError[] }>;
    callback(customEvent.detail.errorList);
  };

  window.addEventListener(ERROR_MONITOR_EVENT, handler);
  window.addEventListener(ERROR_MONITOR_CLEAR_EVENT, handler);

  // 立即执行一次，获取当前状态
  callback(getErrorList());

  // 返回取消监听的函数
  return () => {
    window.removeEventListener(ERROR_MONITOR_EVENT, handler);
    window.removeEventListener(ERROR_MONITOR_CLEAR_EVENT, handler);
  };
}

