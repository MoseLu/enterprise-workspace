/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { AppLevelLocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '人事模块',
    },
    common: {
      // 错误消息
      error: {
        failed: '执行失败',
        request_failed: '请求失败',
        not_retrying: '请求失败，不进行重试',
        preparing_retry: '请求失败，准备重试',
        get_user_info_failed: '获取用户信息失败',
        render_failed: '渲染失败',
        mount_failed: 'mount 失败',
        cannot_display_loading: '无法显示应用级 loading',
      },
      // 重试相关
      retry: {
        retrying: '正在重试请求 ({count}/{max})，下次重试延迟: {delay}ms',
        failed: '请求重试失败 ({count}/{max})，请检查网络连接',
        normal: '网络连接正常',
        request_retry: '请求重试',
        delay: '，延迟',
      },
      // 应用相关
      apps: {
        logistics: '物流应用',
        engineering: '工程应用',
        quality: '品质应用',
        production: '生产应用',
        app: '应用',
      },
      // 系统相关
      system: {
        btc_shop_management: 'BTC车间管理',
        btc_shop_management_system_personnel: 'BTC车间管理系统 - 人事应用',
        personnel_module: '人事模块',
        bellis: '拜里斯',
        address: '深圳市南山区科技园',
        loading_resources: '正在加载系统资源...',
        loading_resources_subtitle: '初次加载可能需要较多时间，请耐心等待',
        simplified_chinese: '简体中文',
        english: 'English',
        app_config_not_found: '未找到应用配置',
        container_not_in_dom: '容器 #subapp-viewport 不在 DOM 中',
        container_not_in_dom_cannot_load: '容器 #subapp-viewport 不在 DOM 中，无法加载应用',
        container_still_invisible: '容器 #subapp-viewport 仍然不可见，强制显示',
        container_not_found: '容器 #subapp-viewport 在 {time}ms 内未找到',
        container_not_exists: '容器 #subapp-viewport 不存在，无法加载应用',
      },
      // 确认对话框
      confirm: {
        confirm: '确认',
        ok: '确定',
        cancel: '取消',
      },
      // 操作相关
      operation: {
        success: '操作成功',
        failed: '操作失败，请稍后重试',
      },
      // UI 相关
      ui: {
        export: '导出',
        export_success: '导出成功',
        export_failed: '导出失败',
      },
      // 其他
      other: {
        data_truncated: '[数据过大，已截断]',
        more_data_truncated: '[更多数据已截断]',
        depth_exceeded: '[深度超限]',
        test_message: '测试消息',
        not_exists: '不存在',
        error: '错误',
        failed: '失败',
        exception: '异常',
        invalid: '无效',
        expired: '过期',
        rejected: '拒绝',
        forbidden: '禁止',
        not_found: '未找到',
        cannot: '无法',
        cannot_do: '不能',
        missing: '缺少',
        insufficient: '不足',
        resource_not_found: '请求的资源不存在',
        unknown_error: '未知错误',
        identity_expired: '身份已过期，请重新登录',
        listener_error: '监听器执行出错 (key: {key})',
        request_no_token: '请求 {url} 没有 token',
        request_log_queue_full: '请求日志队列已满({size})，丢弃最旧的日志',
        param_serialize_failed: '参数序列化失败，使用空对象:',
        service_not_initialized: 'Service 未初始化，无法发送请求日志',
        request_log_service_unavailable: '请求日志服务不可用',
        batch_send_failed: '批量发送请求日志失败（已重试）:',
        request_log_service_reenabled: '请求日志服务已重新启用，继续发送队列中的数据',
        loading_failed: '加载「{name}」失败，请刷新重试',
        app_load_failed: '[应用加载失败]',
        manifest_injected: '已从 manifest 注入应用配置:',
        manifest_inject_failed: '从 manifest 注入配置失败:',
      },
      // 插件相关
      plugin: {
        user_setting: '用户设置',
        user_setting_description: '提供用户偏好设置和主题配置',
      },
    },
  },
  'en-US': {
    subapp: {
      name: 'Personnel Module',
    },
    common: {
      error: {
        failed: 'Execution failed',
        request_failed: 'Request failed',
        not_retrying: 'Request failed, not retrying',
        preparing_retry: 'Request failed, preparing retry',
        get_user_info_failed: 'Failed to get user info',
        render_failed: 'Render failed',
        mount_failed: 'Mount failed',
        cannot_display_loading: 'Cannot display app-level loading',
      },
      retry: {
        retrying: 'Retrying request ({count}/{max}), next retry delay: {delay}ms',
        failed: 'Request retry failed ({count}/{max}), please check network connection',
        normal: 'Network connection normal',
        request_retry: 'Request retry',
        delay: ', delay',
      },
      apps: {
        logistics: 'Logistics App',
        engineering: 'Engineering App',
        quality: 'Quality App',
        production: 'Production App',
        app: 'App',
      },
      system: {
        btc_shop_management: 'BTC Shop Management',
        btc_shop_management_system_personnel: 'BTC Shop Management System - Personnel App',
        personnel_module: 'Personnel Module',
        bellis: 'Bellis',
        address: 'Nanshan District, Shenzhen',
        loading_resources: 'Loading system resources...',
        loading_resources_subtitle: 'Initial loading may take some time, please wait patiently',
        simplified_chinese: 'Simplified Chinese',
        english: 'English',
        app_config_not_found: 'App config not found',
        container_not_in_dom: 'Container #subapp-viewport not in DOM',
        container_not_in_dom_cannot_load: 'Container #subapp-viewport not in DOM, cannot load app',
        container_still_invisible: 'Container #subapp-viewport still invisible, force show',
        container_not_found: 'Container #subapp-viewport not found within {time}ms',
        container_not_exists: 'Container #subapp-viewport does not exist, cannot load app',
      },
      confirm: {
        confirm: 'Confirm',
        ok: 'OK',
        cancel: 'Cancel',
      },
      operation: {
        success: 'Operation successful',
        failed: 'Operation failed, please try again later',
      },
      // UI 相关
      ui: {
        export: 'Export',
        export_success: 'Export successful',
        export_failed: 'Export failed',
      },
      other: {
        data_truncated: '[Data too large, truncated]',
        more_data_truncated: '[More data truncated]',
        depth_exceeded: '[Depth exceeded]',
        test_message: 'Test message',
        not_exists: 'Not exists',
        error: 'Error',
        failed: 'Failed',
        exception: 'Exception',
        invalid: 'Invalid',
        expired: 'Expired',
        rejected: 'Rejected',
        forbidden: 'Forbidden',
        not_found: 'Not found',
        cannot: 'Cannot',
        cannot_do: 'Cannot do',
        missing: 'Missing',
        insufficient: 'Insufficient',
        resource_not_found: 'Requested resource not found',
        unknown_error: 'Unknown error',
        identity_expired: 'Identity expired, please login again',
        listener_error: 'Listener execution error (key: {key})',
        request_no_token: 'Request {url} has no token',
        request_log_queue_full: 'Request log queue full ({size}), dropping oldest log',
        param_serialize_failed: 'Parameter serialization failed, using empty object:',
        service_not_initialized: 'Service not initialized, cannot send request log',
        request_log_service_unavailable: 'Request log service unavailable',
        batch_send_failed: 'Batch send request log failed (retried):',
        request_log_service_reenabled: 'Request log service re-enabled, continuing to send queued data',
        loading_failed: 'Failed to load "{name}", please refresh and retry',
        app_load_failed: '[App load failed]',
        manifest_injected: 'App config injected from manifest:',
        manifest_inject_failed: 'Failed to inject config from manifest:',
      },
      plugin: {
        user_setting: 'User Settings',
        user_setting_description: 'Provides user preference settings and theme configuration',
      },
    },
  },
} satisfies AppLevelLocaleConfig;
