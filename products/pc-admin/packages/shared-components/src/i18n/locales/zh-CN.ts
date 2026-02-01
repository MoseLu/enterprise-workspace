/**
 * 中文全局通用词条
 * 
 * 注意：所有国际化定义都从 @btc/shared-core/locales 引用，确保单一数据源
 * 这里将 shared-core 的扁平结构转换为嵌套结构，以兼容 createAppI18n 的嵌套格式要求
 */
import type { GlobalLocaleMessages } from '../types';
import { unflattenObject } from '@btc/shared-core/utils/i18n/locale-utils';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';

// 从 shared-core 获取扁平结构的国际化消息
const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;

// 将 shared-core 的扁平结构转换为嵌套结构
// 只提取 common、layout、app 相关的键，转换为嵌套格式
const nestedMessages = unflattenObject(sharedCoreZhMessages as Record<string, any>);

// 提取 common、layout、app 部分（如果存在）
export const zhCN: GlobalLocaleMessages = {
  common: nestedMessages.common || {},
  layout: nestedMessages.layout || {},
  app: nestedMessages.app || {},
};

