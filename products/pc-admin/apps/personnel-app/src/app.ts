import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 人事应用身份配置
 */
const personnelAppIdentity: AppIdentity = {
  id: 'personnel',
  name: '人事应用',
  description: 'BTC车间管理系统 - 人事应用',
  pathPrefix: '/personnel',
  subdomain: 'personnel.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default personnelAppIdentity;
