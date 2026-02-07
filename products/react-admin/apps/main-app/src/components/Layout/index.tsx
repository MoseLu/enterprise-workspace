import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Badge, Button, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import styles from './index.module.css';

const { Header, Sider, Content } = AntLayout;

/**
 * 主布局组件
 */
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  // 菜单项
  const menuItems = [
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
      icon: <DashboardOutlined />,
      label: '人事应用',
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
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
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => logout(),
    },
  ];

  // 消息通知菜单
  const notificationItems = [
    {
      key: '1',
      label: (
        <div className={styles.notificationItem}>
          <p style={{ fontWeight: 500 }}>系统通知</p>
          <p style={{ fontSize: 12, color: '#999' }}>您有一条新消息</p>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className={styles.notificationItem}>
          <p style={{ fontWeight: 500 }}>任务提醒</p>
          <p style={{ fontSize: 12, color: '#999' }}>您有3个待处理任务</p>
        </div>
      ),
    },
  ];

  // 获取当前选中的菜单key
  const getSelectedKey = () => {
    const path = location.pathname;
    const topLevelPath = '/' + path.split('/')[1];
    const menuItem = menuItems.find(item => item.key === topLevelPath);
    return menuItem ? [topLevelPath] : ['/'];
  };

  return (
    <AntLayout className={styles.layout}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
        width={220}
        theme={theme}
      >
        <div className={styles.logo}>
          {!collapsed ? (
            <h1 className={styles.logoText}>拜里斯科技</h1>
          ) : (
            <h1 className={styles.logoShort}>B</h1>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className={styles.menu}
          theme={theme}
        />
      </Sider>

      <AntLayout>
        {/* 顶部栏 */}
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.triggerBtn}
            />
          </div>

          <div className={styles.headerRight}>
            <Space size="middle">
              {/* 主题切换 */}
              <Button
                type="text"
                icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                onClick={toggleTheme}
              />

              {/* 消息通知 */}
              <Dropdown
                menu={{ items: notificationItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Badge count={2} size="small">
                  <Button type="text" icon={<BellOutlined />} />
                </Badge>
              </Dropdown>

              {/* 用户信息 */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className={styles.userInfo}>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <span className={styles.userName}>{user?.name || '用户'}</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 主内容区 */}
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default MainLayout;
