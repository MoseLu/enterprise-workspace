import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

interface FooterProps {
  copyrightText?: string;
}

/**
 * 页面底部 Footer 组件
 */
export const Footer: React.FC<FooterProps> = ({
  copyrightText,
}) => {
  // 计算版权年份
  const yearRange = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2012;
    return currentYear > startYear ? `${startYear}-${currentYear}` : startYear.toString();
  }, []);

  // 默认版权文本
  const defaultCopyrightText = `© ${yearRange} BTC. All rights reserved.`;

  return (
    <footer className={styles.footer}>
      <div className={styles.bottomLayerContent}>
        <Link to="/about" className={styles.footerLink}>
          关于我们
        </Link>
        <Link to="/news" className={styles.footerLink}>
          新闻动态
        </Link>
        <Link to="/terms" className={styles.footerLink}>
          服务条款
        </Link>
        <Link to="/help" className={styles.footerLink}>
          帮助中心
        </Link>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.footerLink} ${styles.beianLink}`}
        >
          桂ICP备2025062018号-1
        </a>
        <span className={styles.copyrightText}>
          {copyrightText || defaultCopyrightText}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
