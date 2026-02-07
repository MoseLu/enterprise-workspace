import React from 'react';
import styles from './index.module.scss';

interface AppConfig {
  copyright: {
    text: string;
  };
}

interface AuthFooterProps {
  appConfig?: AppConfig;
}

/**
 * 默认应用配置
 */
const DEFAULT_APP_CONFIG: AppConfig = {
  copyright: {
    text: '© 2025 Bellis. All Rights Reserved.'
  }
};

/**
 * 认证页面底部组件
 *
 * 显示相关链接和版权信息
 */
export const AuthFooter: React.FC<AuthFooterProps> = ({
  appConfig = DEFAULT_APP_CONFIG
}) => {
  return (
    <div className={styles.sBottomLayerContent}>
      <a
        href="https://about.bellis.com.cn"
        className={styles.footerLink}
      >
        关于我们
      </a>
      <a
        href="https://news.bellis.com.cn"
        className={styles.footerLink}
      >
        新闻动态
      </a>
      <a
        href="https://terms.bellis.com.cn"
        className={styles.footerLink}
      >
        服务条款
      </a>
      <a
        href="https://help.bellis.com.cn"
        className={styles.footerLink}
      >
        帮助中心
      </a>
      {/* 企业服务暂时隐藏，保留逻辑 */}
      <a
        href="https://business.bellis.com.cn"
        className={styles.footerLink}
        style={{ display: 'none' }}
      >
        企业服务
      </a>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.footerLink} ${styles.beianLink}`}
      >
        桂ICP备2025062018号-1
      </a>
      <span className={styles.copyrightText}>
        {appConfig.copyright.text}
      </span>
    </div>
  );
};

export default AuthFooter;
