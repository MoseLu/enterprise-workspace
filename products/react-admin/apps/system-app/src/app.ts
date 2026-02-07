import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 系统应用身份配置（子应用）
 */
const systemAppIdentity: AppIdentity = {
  id: 'system',
  name: '系统应用',
  description: 'BTC车间管理系统 - 系统应用',
  pathPrefix: '/system',
  subdomain: 'system.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default systemAppIdentity;

