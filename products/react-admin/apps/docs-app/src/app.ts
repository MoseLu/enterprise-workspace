import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';
import { useI18n } from '@btc/shared-core';

/**
 * 文档应用身份配置
 */
const { t } = useI18n();

const docsSiteAppIdentity: AppIdentity = {
  id: 'docs',
  name: t('subapp.name'),
  description: t('app.description'),
  pathPrefix: '/docs',
  subdomain: 'docs.bellis.com.cn',
  type: 'docs',
  enabled: true,
  version: '1.0.0',
};

export default docsSiteAppIdentity;

