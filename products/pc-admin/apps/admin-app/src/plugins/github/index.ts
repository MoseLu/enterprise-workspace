import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * GitHub插件
 */
export const githubPlugin: Plugin = {
  name: 'github',
  version: '1.0.0',
  description: 'GitHub repository access plugin',
  order: 10, // 设置合适的加载顺序

  // 插件配置元数据
  config: definePluginConfig({
    label: 'GitHub Integration',
    description: 'Provides GitHub repository access and code display functionality',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'integration',
    tags: ['github', 'repository', 'code', 'toolbar'],
    recommended: true,
    doc: 'https://github.com/BellisGit/btc-shopflow',
  }),

  // 工具栏配置
  toolbar: {
    order: 1, // 在最左侧
    pc: true,
    h5: true,
    component: () => import('@btc/shared-components/components/layout/app-layout/github-icon/index.vue')
  },

  // 插件API
  api: {
    openRepository: (url?: string) => {
      window.open(url || 'https://github.com/BellisGit/btc-shopflow.git', '_blank');
    }
  }
};
