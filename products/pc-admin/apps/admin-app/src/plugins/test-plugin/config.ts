/**
 * 测试插件配置
 * 用于验证自动扫描功能
 */

import type { Plugin } from '@btc/shared-core';

export default (): Plugin => {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: '测试插件，用于验证自动扫描功能',
    author: 'BTC Team',
    order: 10,
    enable: true,

    // 安装钩子
    install(_app) {
      // 可以在这里注册全局组件、指令等
      // app.component('TestComponent', TestComponent);
    },

    // 卸载钩子
    uninstall() {
      // 清理逻辑
    },

    // 加载完成钩子
    onLoad(_events) {
      return {
        testMethod: () => {
          // 测试方法
        }
      };
    }
  };
};
