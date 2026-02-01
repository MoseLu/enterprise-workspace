import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 看板应用身份配置
 */
const dashboardAppIdentity: AppIdentity = {
  id: 'dashboard',
  name: '看板应用',
  description: 'BTC车间管理系统 - 看板应用',
  pathPrefix: '/dashboard',
  subdomain: 'dashboard.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default dashboardAppIdentity;
