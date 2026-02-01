import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 财务应用身份配置
 */
const financeAppIdentity: AppIdentity = {
  id: 'finance',
  name: '财务应用',
  description: 'BTC车间管理系统 - 财务应用',
  pathPrefix: '/finance',
  subdomain: 'finance.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default financeAppIdentity;

