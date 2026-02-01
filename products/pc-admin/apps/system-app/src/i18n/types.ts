/**
 * system-app 业务词条类型定义
 */
import type { AppLocaleMessages } from '@btc/i18n/types';

/**
 * system-app 业务词条类型
 * 使用 Record<string, any> 来支持扁平结构的词条键（如 menu.data.*, menu.inventory.*）
 */
export type SystemAppLocaleMessages = Record<string, any>;

/**
 * 合并全局+业务词条的最终类型
 */
export type SystemLocaleMessages = AppLocaleMessages<SystemAppLocaleMessages>;

