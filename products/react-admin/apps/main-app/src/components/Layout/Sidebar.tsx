import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Input } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

/**
 * 侧边栏导航组件
 */
export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchKeyword, setSearchKeyword] = useState('');

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '概览',
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
    },
    {
      key: '/admin',
      icon: <UserOutlined />,
      label: 'admin 应用',
    },
    {
      key: '/logistics',
      icon: <DashboardOutlined />,
      label: '物流应用',
    },
    {
      key: '/engineering',
      icon: <DashboardOutlined />,
      label: '工程应用',
    },
    {
      key: '/quality',
      icon: <DashboardOutlined />,
      label: '品质应用',
    },
    {
      key: '/production',
      icon: <DashboardOutlined />,
      label: '生产应用',
    },
    {
      key: '/finance',
      icon: <DashboardOutlined />,
      label: '财务应用',
    },
    {
      key: '/operations',
      icon: <DashboardOutlined />,
      label: '运维应用',
    },
    {
      key: '/docs',
      icon: <DashboardOutlined />,
      label: '文档应用',
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '图表应用',
    },
    {
      key: '/personnel',
      icon: <UserOutlined />,
      label: '人事应用',
    },
  ];

  // 获取当前选中的菜单 key
  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    const topLevelPath = '/' + path.split('/')[1];
    const menuItem = menuItems.find((item) => item.key === topLevelPath);
    return menuItem ? [topLevelPath] : ['/'];
  }, [location.pathname, menuItems]);

  // 过滤菜单项（根据搜索关键词）
  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) {
      return menuItems;
    }
    const keyword = searchKeyword.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(keyword) ||
        item.key.toLowerCase().includes(keyword)
    );
  }, [menuItems, searchKeyword]);

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo 区域 */}
      <div className={styles.logo}>
        {!collapsed ? (
          <h1 className={styles.logoText}>拜里斯科技</h1>
        ) : (
          <h1 className={styles.logoShort}>B</h1>
        )}
      </div>

      {/* 搜索框 */}
      {!collapsed && (
        <div className={styles.search}>
          <Input
            placeholder="搜索菜单"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
          />
        </div>
      )}

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={filteredItems}
        onClick={handleMenuClick}
        className={styles.menu}
        inlineCollapsed={collapsed}
      />
    </aside>
  );
};

export default Sidebar;
