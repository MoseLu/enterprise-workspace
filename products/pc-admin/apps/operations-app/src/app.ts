import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 运维应用身份配置
 * 注意：name 字段使用国际化键，在显示时会通过 i18n 进行翻译
 */
const operationsAppIdentity: AppIdentity = {
  id: 'operations',
  name: 'subapp.name', // 使用国际化键，而不是调用 t() 函数（避免模块加载时 i18n 未初始化的问题）
  description: 'BTC车间管理系统 - 运维应用',
  pathPrefix: '/operations',
  subdomain: 'operations.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default operationsAppIdentity;

