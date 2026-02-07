import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';

interface HeaderProps {
  logoSrc?: string;
  logoText?: string;
}

interface NavItem {
  path: string;
  label: string;
  name: string;
}

/**
 * 页面顶部 Header 组件
 */
export const Header: React.FC<HeaderProps> = ({
  logoSrc,
  logoText = '拜里斯科技',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 导航菜单项
  const navItems: NavItem[] = [
    { path: '/', label: '首页', name: 'Home' },
    { path: '/about', label: '关于我们', name: 'About' },
    { path: '/news', label: '新闻动态', name: 'News' },
    { path: '/terms', label: '服务条款', name: 'Terms' },
    { path: '/help', label: '帮助中心', name: 'Help' },
  ];

  // 节流函数
  const throttle = (fn: () => void, delay: number) => {
    let lastTime = 0;
    return () => {
      const now = Date.now();
      if (now - lastTime > delay) {
        fn();
        lastTime = now;
      }
    };
  };

  // 处理滚动事件
  const handleScroll = throttle(() => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 判断导航项是否激活
  const isActive = (path: string, name: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.name === name;
  };

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <a href="/" className={styles.logoLink}>
            {logoSrc ? (
              <img src={logoSrc} alt={logoText} className={styles.logo} />
            ) : (
              <span className={styles.logoText}>{logoText}</span>
            )}
          </a>
          {navItems[0] && (
            <a
              href={navItems[0].path}
              className={`${styles.navLink} ${styles.homeLink} ${
                isActive(navItems[0].path, navItems[0].name) ? styles.active : ''
              }`}
            >
              {navItems[0].label}
            </a>
          )}
        </div>
        <nav className={styles.nav}>
          {navItems.slice(1).map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${
                isActive(item.path, item.name) ? styles.active : ''
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
