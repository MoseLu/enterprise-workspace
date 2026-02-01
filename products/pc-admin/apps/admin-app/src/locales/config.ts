/**
 * 应用级国际化配置
 * 只包含基础的应用信息和真正通用的内容
 * 模块特定的国际化配置应该在模块级 config.ts 中
 */

import type { AppLevelLocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '管理模块',
    },
    common: {
      // 错误消息
      error: {
        failed: '执行失败',
        request_failed: '请求失败',
        not_retrying: '请求失败，不进行重试',
        preparing_retry: '请求失败，准备重试',
        get_user_info_failed: '获取用户信息失败',
        set_user_info_failed: '设置用户信息失败',
        override_message_close_failed: '无法重写消息关闭方法',
        send_i18n_message_failed: '发送国际化消息到主应用失败',
        render_failed: '渲染失败',
        crud_component_error: 'CRUD 组件错误（必须修复）',
        proxy_error: '代理错误：无法连接到后端服务器',
        data_sync_failed: '数据同步失败',
        generate_failed: '生成失败',
        save_failed: '保存失败',
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
        admin: '管理应用',
        app: '应用',
      },
      // 系统相关
      system: {
        btc_shop_management: 'BTC车间管理',
        btc_shop_management_system: 'BTC车间管理系统 - 管理应用',
        bellis: '拜里斯',
        address: '深圳市南山区科技园',
        loading_resources: '正在加载系统资源...',
        loading_resources_subtitle: '初次加载可能需要较多时间，请耐心等待',
        simplified_chinese: '简体中文',
        english: 'English',
        admin_module: '管理模块',
        cannot_display_loading: '无法显示应用级 loading',
        container_not_in_dom: '容器 #subapp-viewport 不在 DOM 中',
        container_not_in_dom_cannot_load: '容器 #subapp-viewport 不在 DOM 中，无法加载应用',
        container_still_invisible: '容器 #subapp-viewport 仍然不可见，强制显示',
        container_not_found: '容器 #subapp-viewport 在 {time}ms 内未找到',
        container_not_exists: '容器 #subapp-viewport 不存在，无法加载应用',
        app_config_not_found: '未找到应用配置',
      },
      // 插件相关
      plugin: {
        skip_invalid: '跳过无效插件',
        missing_name: '缺少 name 属性',
        parse_failed: '解析插件失败',
        register_failed: '注册插件失败',
        install_failed: '安装插件失败',
      },
      // 通用字段
      fields: {
        index: '序号',
        role_id: '角色ID',
        permission_id: '权限ID',
        tenant_id: '租户ID',
        create_time: '创建时间',
      },
      // 导入相关
      import: {
        success: '导入成功',
        failed: '导入失败',
      },
      // 通用操作
      success: '成功',
      failed: '失败',
      save_success: '保存成功',
      save_failed: '保存失败',
      tip: '提示',
      confirm: '确定',
      cancel: '取消',
      confirm_delete: '确认删除',
      // 模块相关（保留，因为被模块元数据引用）
      module: {
        base: {
          label: '基础模块',
          description: '提供布局、导航等核心功能',
        },
        api_services: {
          label: 'API 服务模块',
          description: '存放不在 EPS 系统中的手动管理 API 服务',
        },
      },
    }
  },
  'en-US': {
    subapp: {
      name: 'Admin Module',
    },
    common: {
      // 错误消息
      error: {
        failed: 'Execution failed',
        request_failed: 'Request failed',
        not_retrying: 'Request failed, not retrying',
        preparing_retry: 'Request failed, preparing retry',
        get_user_info_failed: 'Failed to get user info',
        set_user_info_failed: 'Failed to set user info',
        override_message_close_failed: 'Failed to override message close method',
        send_i18n_message_failed: 'Failed to send i18n messages to main app',
        render_failed: 'Render failed',
        crud_component_error: 'CRUD component error (must fix)',
        proxy_error: 'Proxy error: Unable to connect to backend server',
        data_sync_failed: 'Data sync failed',
        generate_failed: 'Generation failed',
        save_failed: 'Save failed',
      },
      // 重试相关
      retry: {
        retrying: 'Retrying request ({count}/{max}), next retry delay: {delay}ms',
        failed: 'Request retry failed ({count}/{max}), please check network connection',
        normal: 'Network connection normal',
        request_retry: 'Request retry',
        delay: ', delay',
      },
      // 应用相关
      apps: {
        logistics: 'Logistics Application',
        engineering: 'Engineering Application',
        quality: 'Quality Application',
        production: 'Production Application',
        admin: 'Admin Application',
        app: 'Application',
      },
      // 系统相关
      system: {
        btc_shop_management: 'BTC Shop Management',
        btc_shop_management_system: 'BTC Shop Management System - Admin Application',
        bellis: 'Bellis',
        address: 'Shenzhen Nanshan Science Park',
        loading_resources: 'Loading system resources...',
        loading_resources_subtitle: 'Initial loading may take longer, please wait patiently',
        simplified_chinese: 'Simplified Chinese',
        english: 'English',
        admin_module: 'Admin Module',
        cannot_display_loading: 'Cannot display app-level loading',
        container_not_in_dom: 'Container #subapp-viewport is not in DOM',
        container_not_in_dom_cannot_load: 'Container #subapp-viewport is not in DOM, cannot load application',
        container_still_invisible: 'Container #subapp-viewport is still invisible, forcing display',
        container_not_found: 'Container #subapp-viewport not found within {time}ms',
        container_not_exists: 'Container #subapp-viewport does not exist, cannot load application',
        app_config_not_found: 'Application configuration not found',
      },
      // 插件相关
      plugin: {
        skip_invalid: 'Skip invalid plugin',
        missing_name: 'Missing name property',
        parse_failed: 'Failed to parse plugin',
        register_failed: 'Failed to register plugin',
        install_failed: 'Failed to install plugin',
      },
      // 模块相关（保留，因为被模块元数据引用）
      module: {
        base: {
          label: 'Base Module',
          description: 'Provides core functions such as layout and navigation',
        },
        api_services: {
          label: 'API Services Module',
          description: 'Stores manually managed API services not in the EPS system',
        },
      },
    },
  },
} satisfies AppLevelLocaleConfig;
