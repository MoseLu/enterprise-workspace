import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Dropdown, Avatar, Space, Input } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import styles from './Topbar.module.scss';

interface TopbarProps {
  isCollapse?: boolean;
  menuType?: 'left' | 'top' | 'top-left' | 'dual-menu';
  onToggleSidebar?: () => void;
  logoSrc?: string;
  logoText?: string;
}

interface ToolbarComponent {
  order: number;
  component: React.ReactNode;
  pc?: boolean;
  h5?: boolean;
}

interface UserMenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
}

/**
 * 顶部工具栏组件
 */
export const Topbar: React.FC<TopbarProps> = ({
  isCollapse = false,
  menuType = 'left',
  onToggleSidebar,
  logoSrc,
  logoText = '拜里斯科技',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');

  // Logo URL（带缓存 bust）
  const logoUrl = useMemo(() => {
    const baseUrl = logoSrc || '/assets/logo/logo.png';
    if (import.meta.env.DEV) {
      const hour = Math.floor(Date.now() / (1000 * 60 * 60));
      return `${baseUrl}?t=${hour}`;
    }
    return baseUrl;
  }, [logoSrc]);

  // 处理 Logo 加载错误
  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    img.style.display = 'none';
  };

  // 工具栏组件配置
  const toolbarComponents: ToolbarComponent[] = [
    {
      order: 1,
      component: (
        <Button
          key="search"
          type="text"
          icon={<SearchOutlined />}
          onClick={() => {
            // 搜索功能实现
          }}
        />
      ),
      pc: true,
    },
    {
      order: 2,
      component: (
        <Dropdown
          key="notification"
          menu={{
            items: [
              {
                key: '1',
                label: (
                  <div className={styles.notificationItem}>
                    <p style={{ fontWeight: 500 }}>系统通知</p>
                    <p style={{ fontSize: 12, color: '#999' }}>
                      您有一条新消息
                    </p>
                  </div>
                ),
              },
            ],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<BellOutlined />} />
        </Dropdown>
      ),
      pc: true,
    },
  ];

  // 过滤工具栏组件（根据移动端/桌面端）
  const filteredToolbarComponents = useMemo(() => {
    const isMobile = window.innerWidth <= 768;
    return toolbarComponents.filter((config) => {
      if (isMobile) {
        return config.h5 ?? true;
      }
      return config.pc ?? true;
    });
  }, []);

  // 用户下拉菜单
  const userMenuItems: UserMenuItem[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'divider',
      icon: null,
      label: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        // 退出登录逻辑
        navigate('/login');
      },
    },
  ];

  // 汉堡菜单点击
  const handleHamburgerClick = () => {
    onToggleSidebar?.();
  };

  // 侧边栏折叠切换
  const handleToggleSidebar = () => {
    onToggleSidebar?.();
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    if (value.trim()) {
      // 搜索功能实现
      console.log('Search:', value);
    }
  };

  return (
    <div
      className={`${styles.topbar} ${
        menuType === 'top' ? styles.menuTypeTop : ''
      }`}
    >
      {/* 左侧：汉堡菜单 + Logo 区域 */}
      <div
        className={`${styles.brand} ${
          isCollapse && menuType !== 'top' && menuType !== 'dual-menu'
            ? styles.collapse
            : ''
        } ${menuType === 'top' ? styles.menuTypeTop : ''} ${
          menuType === 'dual-menu' ? styles.menuTypeDual : ''
        }`}
      >
        {/* 汉堡菜单 */}
        <div
          className={`${styles.hamburger} ${
            isCollapse ? styles.active : ''
          }`}
          onClick={handleHamburgerClick}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </div>

        {/* Logo + 标题（顶部菜单和双栏菜单模式下隐藏） */}
        {menuType !== 'top' && menuType !== 'dual-menu' && (
          <div className={styles.logoContent}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className={styles.logoImg}
                onError={handleLogoError}
              />
            ) : (
              <span className={styles.logoText}>{logoText}</span>
            )}
            <h2 className={styles.logoTitle}>{logoText}</h2>
          </div>
        )}
      </div>

      {/* 中间：工具区域 */}
      <div className={styles.left}>
        {/* 折叠按钮（仅左侧菜单和混合菜单显示） */}
        {(menuType === 'left' || menuType === 'top-left') && (
          <Button
            type="text"
            icon={isCollapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleToggleSidebar}
            className={styles.foldBtn}
          />
        )}

        {/* 全局搜索（移动端隐藏） */}
        {window.innerWidth > 768 && (
          <Input
            placeholder="搜索菜单"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            allowClear
            className={styles.searchInput}
          />
        )}

        {/* 顶部菜单（仅顶部菜单模式显示） */}
        {menuType === 'top' && (
          <div className={styles.topMenu}>
            {/* 顶部菜单渲染 */}
          </div>
        )}
      </div>

      {/* 右侧：工具栏 + 用户信息 */}
      <div className={styles.right}>
        {/* 工具栏 */}
        <ul className={styles.tools}>
          {filteredToolbarComponents.map((config) => (
            <li key={config.order}>{config.component}</li>
          ))}
        </ul>

        {/* 用户信息 */}
        <Dropdown
          menu={{
            items: userMenuItems.map((item) =>
              item.key === 'divider'
                ? { type: 'divider' }
                : {
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    onClick: item.onClick,
                  }
            ),
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className={styles.user}>
            <Avatar icon={<UserOutlined />} size="small" />
            <span className={styles.userName}>用户</span>
            <DownOutlined className={styles.dropdownIcon} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Topbar;
