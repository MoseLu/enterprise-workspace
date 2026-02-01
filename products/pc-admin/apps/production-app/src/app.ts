import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';
import { useI18n } from '@btc/shared-core';

/**
 * 生产应用身份配置
 */
const { t } = useI18n();

const productionAppIdentity: AppIdentity = {
  id: 'production',
  name: t('subapp.name'),
  description: t('common.system.btc_shop_management_system'),
  pathPrefix: '/production',
  subdomain: 'production.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default productionAppIdentity;

