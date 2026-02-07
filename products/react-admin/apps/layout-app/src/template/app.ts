import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * {{APP_TITLE}}身份配置
 */
const {{APP_NAME}}AppIdentity: AppIdentity = {
  id: '{{APP_ID}}',
  name: '{{APP_TITLE}}',
  description: 'BTC车间管理系统 - {{APP_TITLE}}',
  pathPrefix: '{{APP_BASE_PATH}}',
  subdomain: '{{APP_NAME}}.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default {{APP_NAME}}AppIdentity;

