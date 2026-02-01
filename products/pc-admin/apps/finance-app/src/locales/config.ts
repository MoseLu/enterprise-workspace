/**
 * 财务应用级国际化配置
 * 只包含基础的应用信息
 * 菜单配置应该在模块级 config.ts 中
 * 详细的页面配置应该在模块级 config.ts 中
 */

import type { AppLevelLocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '财务模块',
    },
    common: {
      // 错误消息
      error: {
        render_failed: '渲染失败',
        unmount_failed: '卸载失败',
        unmount_previous_failed: '卸载前一个实例失败',
        cannot_display_loading: '无法显示应用级 loading',
        load_shared_resources_failed: '加载共享资源失败，继续使用本地资源',
        load_shared_resources_progress: '加载共享资源进度',
        mount_failed: '挂载到 layout-app 失败',
        mount_success: '成功挂载到 layout-app',
        viewport_found: '找到 #subapp-viewport，准备挂载',
        viewport_timeout: '等待 #subapp-viewport 超时，尝试独立渲染',
        diagnostic_info: '诊断信息',
        standalone_failed: '独立运行失败',
        init_layout_app_failed: '初始化 layout-app 失败',
        import_init_layout_app_failed: '导入 init-layout-app 失败',
      },
      // 系统相关
      system: {
        btc_shop_management: 'BTC车间管理',
        finance_module: '财务模块',
        bellis: '拜里斯',
        address: '深圳市南山区科技园',
        loading_resources: '正在加载系统资源...',
        loading_resources_subtitle: '初次加载可能需要较多时间，请耐心等待',
        simplified_chinese: '简体中文',
        english: 'English',
      },
    },
  },
  'en-US': {
    subapp: {
      name: 'Finance Module',
    },
    common: {
      // 错误消息
      error: {
        render_failed: 'Render failed',
        unmount_failed: 'Unmount failed',
        unmount_previous_failed: 'Failed to unmount previous instance',
        cannot_display_loading: 'Cannot display app-level loading',
        load_shared_resources_failed: 'Failed to load shared resources, continue using local resources',
        load_shared_resources_progress: 'Loading shared resources progress',
        mount_failed: 'Failed to mount to layout-app',
        mount_success: 'Successfully mounted to layout-app',
        viewport_found: 'Found #subapp-viewport, preparing to mount',
        viewport_timeout: 'Timeout waiting for #subapp-viewport, trying standalone render',
        diagnostic_info: 'Diagnostic information',
        standalone_failed: 'Standalone run failed',
        init_layout_app_failed: 'Failed to initialize layout-app',
        import_init_layout_app_failed: 'Failed to import init-layout-app',
      },
      // 系统相关
      system: {
        btc_shop_management: 'BTC Shop Management',
        finance_module: 'Finance Module',
        bellis: 'Bellis',
        address: 'Nanshan District, Shenzhen',
        loading_resources: 'Loading system resources...',
        loading_resources_subtitle: 'Initial loading may take some time, please wait patiently',
        simplified_chinese: 'Simplified Chinese',
        english: 'English',
      },
    },
  },
} satisfies AppLevelLocaleConfig;
