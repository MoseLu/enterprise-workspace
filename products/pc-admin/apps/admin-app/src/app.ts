import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 管理应用身份配置
 * 注意：name 字段使用国际化键，在显示时会通过 i18n 进行翻译
 */
const adminAppIdentity: AppIdentity = {
  id: 'admin',
  name: 'subapp.name', // 使用国际化键，而不是调用 t() 函数（避免模块加载时 i18n 未初始化的问题）
  description: 'common.system.btc_shop_management_system', // 同样使用国际化键
  pathPrefix: '/admin',
  subdomain: 'admin.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default adminAppIdentity;

