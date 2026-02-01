import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  name: 'base',
  label: 'common.module.base.label',
  description: 'common.module.base.description',
  order: 0,
  // PageConfig 字段（必需）
  locale: {
    'zh-CN': {},
    'en-US': {},
  },
} satisfies ModuleConfig;
