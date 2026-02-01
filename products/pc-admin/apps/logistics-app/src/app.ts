import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 物流应用身份配置
 */
const logisticsAppIdentity: AppIdentity = {
  id: 'logistics',
  name: 'common.apps.logistics',
  description: 'common.system.btc_shop_management_system_logistics',
  pathPrefix: '/logistics',
  subdomain: 'logistics.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default logisticsAppIdentity;

