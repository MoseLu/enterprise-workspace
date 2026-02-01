import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';
import { useI18n } from '@btc/shared-core';

/**
 * 布局应用身份配置
 */
const { t } = useI18n();

const layoutAppIdentity: AppIdentity = {
  id: 'layout',
  name: t('subapp.name'),
  description: t('app.description'),
  pathPrefix: '/',
  subdomain: 'layout.bellis.com.cn',
  type: 'layout',
  enabled: true,
  version: '1.0.0',
};

export default layoutAppIdentity;

