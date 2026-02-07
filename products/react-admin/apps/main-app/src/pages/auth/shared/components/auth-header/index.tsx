import React, { ReactNode, useMemo } from 'react';
import { Icon } from '@enterprise-workspace/frontend/shared';
import { QrToggleBtn, QrToggleBtnProps } from '../qr-toggle-btn';
import styles from './index.module.scss';

interface AppConfig {
  logo: string;
  name: string;
}

interface AuthHeaderProps {
  toggleIcon?: QrToggleBtnProps['icon'];
  toggleLabel?: string;
  onToggleQr?: () => void;
  appConfig?: AppConfig;
  children?: ReactNode;
}

/**
 * 默认应用配置
 */
const DEFAULT_APP_CONFIG: AppConfig = {
  logo: new URL('@/assets/images/logo.png', import.meta.url).href,
  name: '企业工作空间'
};

/**
 * 认证页面头部组件
 *
 * 显示应用 logo、名称和二维码切换按钮
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({
  toggleIcon = 'qr',
  toggleLabel = 'auth.login.toggle.qr',
  onToggleQr,
  appConfig = DEFAULT_APP_CONFIG,
  children
}) => {
  const toggleBtnLabel = useMemo(() => {
    return toggleLabel;
  }, [toggleLabel]);

  return (
    <div className={styles.cardHeader}>
      <div className={styles.title}>
        <div className={styles.logo}>
          <img src={appConfig.logo} alt={appConfig.name} />
        </div>
        <h1>{appConfig.name}</h1>
      </div>
      <slot name="toggle">
        {onToggleQr && (
          <QrToggleBtn
            icon={toggleIcon}
            label={toggleBtnLabel}
            onClick={onToggleQr}
          />
        )}
      </slot>
      {children}
    </div>
  );
};

export default AuthHeader;
