/**
 * admin-app 应用特定翻译
 * 从 admin-app 的 config.ts 和 JSON 文件提取
 */

export const admin = {
  'zh-CN': {
    // 应用信息
    'subapp.name': '管理模块',
    
    // 系统相关（admin-app 特有）
    'common.system.btc_shop_management': 'BTC车间管理',
    'common.system.btc_shop_management_system': 'BTC车间管理系统 - 管理应用',
    'common.system.bellis': '拜里斯',
    'common.system.address': '深圳市南山区科技园',
    'common.system.loading_resources': '正在加载系统资源...',
    'common.system.loading_resources_subtitle': '初次加载可能需要较多时间，请耐心等待',
    'common.system.simplified_chinese': '简体中文',
    'common.system.english': 'English',
    'common.system.admin_module': '管理模块',
    'common.system.cannot_display_loading': '无法显示应用级 loading',
    'common.system.container_not_in_dom': '容器 #subapp-viewport 不在 DOM 中',
    'common.system.container_not_in_dom_cannot_load': '容器 #subapp-viewport 不在 DOM 中，无法加载应用',
    'common.system.container_still_invisible': '容器 #subapp-viewport 仍然不可见，强制显示',
    'common.system.container_not_found': '容器 #subapp-viewport 在 {time}ms 内未找到',
    'common.system.container_not_exists': '容器 #subapp-viewport 不存在，无法加载应用',
    'common.system.app_config_not_found': '未找到应用配置',
    
    // 错误消息（admin-app 特有）
    'common.error.failed': '执行失败',
    'common.error.request_failed': '请求失败',
    'common.error.not_retrying': '请求失败，不进行重试',
    'common.error.preparing_retry': '请求失败，准备重试',
    'common.error.get_user_info_failed': '获取用户信息失败',
    'common.error.set_user_info_failed': '设置用户信息失败',
    'common.error.override_message_close_failed': '无法重写消息关闭方法',
    'common.error.send_i18n_message_failed': '发送国际化消息到主应用失败',
    'common.error.render_failed': '渲染失败',
    'common.error.crud_component_error': 'CRUD 组件错误（必须修复）',
    'common.error.proxy_error': '代理错误：无法连接到后端服务器',
    'common.error.data_sync_failed': '数据同步失败',
    'common.error.generate_failed': '生成失败',
    'common.error.save_failed': '保存失败',
    
    // 重试相关
    'common.retry.retrying': '正在重试请求 ({count}/{max})，下次重试延迟: {delay}ms',
    'common.retry.failed': '请求重试失败 ({count}/{max})，请检查网络连接',
    'common.retry.normal': '网络连接正常',
    'common.retry.request_retry': '请求重试',
    'common.retry.delay': '，延迟',
    
    // 应用相关
    'common.apps.logistics': '物流应用',
    'common.apps.engineering': '工程应用',
    'common.apps.quality': '品质应用',
    'common.apps.production': '生产应用',
    'common.apps.admin': '管理应用',
    'common.apps.app': '应用',
    
    // 插件相关
    'common.plugin.skip_invalid': '跳过无效插件',
    'common.plugin.missing_name': '缺少 name 属性',
    'common.plugin.parse_failed': '解析插件失败',
    'common.plugin.register_failed': '注册插件失败',
    'common.plugin.install_failed': '安装插件失败',
    
    // 通用字段
    'common.fields.index': '序号',
    'common.fields.role_id': '角色ID',
    'common.fields.permission_id': '权限ID',
    'common.fields.tenant_id': '租户ID',
    'common.fields.create_time': '创建时间',
    
    // 导入相关
    'common.import.success': '导入成功',
    'common.import.failed': '导入失败',
    
    // 通用操作
    'common.success': '成功',
    'common.failed': '失败',
    'common.save_success': '保存成功',
    'common.save_failed': '保存失败',
    'common.tip': '提示',
    'common.confirm': '确定',
    'common.cancel': '取消',
    'common.confirm_delete': '确认删除',
    
    // 模块相关
    'common.module.base.label': '基础模块',
    'common.module.base.description': '提供布局、导航等核心功能',
    'common.module.api_services.label': 'API 服务模块',
    'common.module.api_services.description': '存放不在 EPS 系统中的手动管理 API 服务',
  },
  'en-US': {
    // App Info
    'subapp.name': 'Admin Module',
    
    // System Related (admin-app specific)
    'common.system.btc_shop_management': 'BTC Shop Management',
    'common.system.btc_shop_management_system': 'BTC Shop Management System - Admin Application',
    'common.system.bellis': 'Bellis',
    'common.system.address': 'Shenzhen Nanshan Science Park',
    'common.system.loading_resources': 'Loading system resources...',
    'common.system.loading_resources_subtitle': 'Initial loading may take longer, please wait patiently',
    'common.system.simplified_chinese': 'Simplified Chinese',
    'common.system.english': 'English',
    'common.system.admin_module': 'Admin Module',
    'common.system.cannot_display_loading': 'Cannot display app-level loading',
    'common.system.container_not_in_dom': 'Container #subapp-viewport is not in DOM',
    'common.system.container_not_in_dom_cannot_load': 'Container #subapp-viewport is not in DOM, cannot load application',
    'common.system.container_still_invisible': 'Container #subapp-viewport is still invisible, forcing display',
    'common.system.container_not_found': 'Container #subapp-viewport not found within {time}ms',
    'common.system.container_not_exists': 'Container #subapp-viewport does not exist, cannot load application',
    'common.system.app_config_not_found': 'Application configuration not found',
    
    // Error Messages (admin-app specific)
    'common.error.failed': 'Execution failed',
    'common.error.request_failed': 'Request failed',
    'common.error.not_retrying': 'Request failed, not retrying',
    'common.error.preparing_retry': 'Request failed, preparing retry',
    'common.error.get_user_info_failed': 'Failed to get user info',
    'common.error.set_user_info_failed': 'Failed to set user info',
    'common.error.override_message_close_failed': 'Failed to override message close method',
    'common.error.send_i18n_message_failed': 'Failed to send i18n messages to main app',
    'common.error.render_failed': 'Render failed',
    'common.error.crud_component_error': 'CRUD component error (must fix)',
    'common.error.proxy_error': 'Proxy error: Unable to connect to backend server',
    'common.error.data_sync_failed': 'Data sync failed',
    'common.error.generate_failed': 'Generation failed',
    'common.error.save_failed': 'Save failed',
    
    // Retry Related
    'common.retry.retrying': 'Retrying request ({count}/{max}), next retry delay: {delay}ms',
    'common.retry.failed': 'Request retry failed ({count}/{max}), please check network connection',
    'common.retry.normal': 'Network connection normal',
    'common.retry.request_retry': 'Request retry',
    'common.retry.delay': ', delay',
    
    // Apps Related
    'common.apps.logistics': 'Logistics Application',
    'common.apps.engineering': 'Engineering Application',
    'common.apps.quality': 'Quality Application',
    'common.apps.production': 'Production Application',
    'common.apps.admin': 'Admin Application',
    'common.apps.app': 'Application',
    
    // Plugin Related
    'common.plugin.skip_invalid': 'Skip invalid plugin',
    'common.plugin.missing_name': 'Missing name property',
    'common.plugin.parse_failed': 'Failed to parse plugin',
    'common.plugin.register_failed': 'Failed to register plugin',
    'common.plugin.install_failed': 'Failed to install plugin',
    
    // Common Fields
    'common.fields.index': 'Index',
    'common.fields.role_id': 'Role ID',
    'common.fields.permission_id': 'Permission ID',
    'common.fields.tenant_id': 'Tenant ID',
    'common.fields.create_time': 'Create Time',
    
    // Import Related
    'common.import.success': 'Import success',
    'common.import.failed': 'Import failed',
    
    // Common Actions
    'common.success': 'Success',
    'common.failed': 'Failed',
    'common.save_success': 'Save success',
    'common.save_failed': 'Save failed',
    'common.tip': 'Tip',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.confirm_delete': 'Confirm delete',
    
    // Module Related
    'common.module.base.label': 'Base Module',
    'common.module.base.description': 'Provides core functions such as layout and navigation',
    'common.module.api_services.label': 'API Services Module',
    'common.module.api_services.description': 'Stores manually managed API services not in the EPS system',
  },
};
