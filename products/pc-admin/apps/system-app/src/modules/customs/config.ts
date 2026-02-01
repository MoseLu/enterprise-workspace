/**
 * 海关模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'customs',
  label: 'common.module.customs.label',
  order: 60,

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {},
    'en-US': {},
  },

  columns: {},

  forms: {},

  service: {},
} satisfies ModuleConfig;
