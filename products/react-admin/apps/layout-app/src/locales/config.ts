/**
 * 布局应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '布局应用',
    },
    common: {
      // 错误消息
      error: {
        layout_container_not_found: '布局容器不存在，请确保页面中存在 #app 或 #layout-container 元素',
        mount_target_not_found: '挂载目标不存在，回退到 #app',
        mount_target_not_found_no_fallback: '挂载目标不存在，且无法找到 #app 容器',
        mount_container_corrected: '修正挂载容器：从错误的容器改为 #app',
        mount_container_not_found: '无法找到挂载容器',
        subapp_load_failed: '子应用加载失败',
        vue_error: 'Vue 错误',
        dom_operation_error: '全局错误监听器捕获到 DOM 操作错误',
        router_unavailable: '主应用路由在 layout-app 环境下不可用，重定向到404',
        plugin_parse_failed: '解析插件失败',
        plugin_register_failed: '注册插件失败',
        subapp_route_change_failed: '处理子应用路由变化事件失败',
        subapp_route_change_received: '收到子应用路由变化事件',
        menu_registry_init_failed: '菜单注册表初始化失败',
        menu_registry_using_existing: '使用已存在的全局菜单注册表',
        menu_registry_creating_new: '创建新的全局菜单注册表',
        menu_registry_initialized: '菜单注册表已初始化，应用列表',
        embedded_mode_detected: '检测到嵌入模式，跳过 qiankun 子应用注册',
        embedded_mode_detected_standalone: '检测到嵌入模式（独立运行分支），跳过 qiankun 子应用注册',
        init_environment_started: 'initLayoutEnvironment 开始执行',
        using_unified_logic: 'layoutIsMainApp: 使用统一判断逻辑',
      },
      // 系统相关
      system: {
        layout_app: '布局应用',
      },
    },
  },
  'en-US': {
    subapp: {
      name: 'Layout Application',
    },
    common: {
      // 错误消息
      error: {
        layout_container_not_found: 'Layout container not found, please ensure #app or #layout-container element exists in the page',
        mount_target_not_found: 'Mount target not found, fallback to #app',
        mount_target_not_found_no_fallback: 'Mount target not found, and cannot find #app container',
        mount_container_corrected: 'Corrected mount container: changed from wrong container to #app',
        mount_container_not_found: 'Cannot find mount container',
        subapp_load_failed: 'Sub-app load failed',
        vue_error: 'Vue error',
        dom_operation_error: 'Global error listener caught DOM operation error',
        router_unavailable: 'Main app route unavailable in layout-app environment, redirecting to 404',
        plugin_parse_failed: 'Failed to parse plugin',
        plugin_register_failed: 'Failed to register plugin',
        subapp_route_change_failed: 'Failed to handle sub-app route change event',
        subapp_route_change_received: 'Received sub-app route change event',
        menu_registry_init_failed: 'Menu registry initialization failed',
        menu_registry_using_existing: 'Using existing global menu registry',
        menu_registry_creating_new: 'Creating new global menu registry',
        menu_registry_initialized: 'Menu registry initialized, app list',
        embedded_mode_detected: 'Embedded mode detected, skipping qiankun sub-app registration',
        embedded_mode_detected_standalone: 'Embedded mode detected (standalone branch), skipping qiankun sub-app registration',
        init_environment_started: 'initLayoutEnvironment started',
        using_unified_logic: 'layoutIsMainApp: using unified logic',
      },
      // 系统相关
      system: {
        layout_app: 'Layout Application',
      },
    },
  },
} satisfies LocaleConfig;
