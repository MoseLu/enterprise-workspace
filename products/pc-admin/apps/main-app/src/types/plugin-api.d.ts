/**
 * 插件系统全局API类型声明
 */

import type { PluginAPI } from '@btc/shared-plugins';

declare global {
  interface Window {
    /**
     * 插件系统全局API
     * 主应用作为插件基座，提供统一的插件操作接口
     */
    __PLUGIN_API__?: PluginAPI;
  }
}

export {};

