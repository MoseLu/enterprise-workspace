/**
 * 全局通用词条导出
 */
import { zhCN } from './zh-CN';
import { enUS } from './en-US';
import type { AppLocale, GlobalLocaleMessages } from '../types';

export const globalMessages: Record<AppLocale, GlobalLocaleMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export { zhCN, enUS };

