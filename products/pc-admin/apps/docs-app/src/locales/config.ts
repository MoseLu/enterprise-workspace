/**
 * 文档应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '文档应用',
    },
    menu: {
      docs: {
        center: '文档中心',
      },
    },
  },
  'en-US': {
    subapp: {
      name: 'Documentation Application',
    },
    menu: {
      docs: {
        center: 'Documentation Center',
      },
    },
  },
} satisfies LocaleConfig;
