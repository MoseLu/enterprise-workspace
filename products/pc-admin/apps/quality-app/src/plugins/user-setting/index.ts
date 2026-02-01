import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 用户设置插件
 */
export const userSettingPlugin: Plugin = {
  name: 'user-setting',
  version: '1.0.0',
  description: 'User settings plugin',
  order: 20,

  // 插件配置元数据
  config: definePluginConfig({
    label: '用户设置',
    description: '提供用户偏好设置和主题配置',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['settings', 'theme', 'user-preference', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 5, // 在消息插件之后
    pc: true,
    h5: false, // 移动端隐藏
    component: () => import('./index.vue')
  }
};

// 注意：不要在这里导出任何 .vue 组件或 composables。
// 原因：主应用/容器的 ModuleScanner 会在启动时扫描并导入 /src/plugins/*/index.ts，
// 若这里 re-export 组件/组合式，会导致扫描阶段就执行大量依赖（甚至触发断言/循环依赖），从而出现：
// [ModuleScanner] 解析插件失败: /src/plugins/user-setting/index.ts
// 组件请在插件内部通过动态导入使用（toolbar.component 已是动态导入）。
