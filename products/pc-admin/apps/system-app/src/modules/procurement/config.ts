/**
 * 采购模块配置
 * 包含 supplier、packaging、auxiliary 等页面配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'procurement',
  label: 'common.module.procurement.label',
  order: 30,

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {},
    'en-US': {},
  },

  columns: {},

  forms: {},

  service: {},
} satisfies ModuleConfig;
