/**
 * system-app 业务词条导出
 */
import { zhCN } from './zh-CN';
import { enUS } from './en-US';
import type { AppLocale, SystemAppLocaleMessages } from '../types';

export const systemMessages: Record<AppLocale, SystemAppLocaleMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export { zhCN, enUS };

