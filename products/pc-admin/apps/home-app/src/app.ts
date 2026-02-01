import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 公司首页应用身份配置
 */
const homeAppIdentity: AppIdentity = {
  id: 'home',
  name: '公司首页',
  description: 'BTC车间管理系统 - 公司首页和关于我们',
  pathPrefix: '/',
  subdomain: 'www.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
  metadata: {
    public: true,
    port: 8095,
  },
};

export default homeAppIdentity;

