/**
 * Menu Preview Page - Navigation Module
 * React Admin - Admin Application
 *
 * Preview menus in different layouts (sidebar, header, breadcrumbs).
 * Select roles to preview menu visibility.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Select, Button, Tag, Space, message, Spin, Breadcrumb } from 'antd';
import {
  ReloadOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  FileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface RoleRecord {
  id?: string | number;
  roleName?: string;
}

interface MenuItem {
  id?: string | number;
  label?: string;
  key?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  parentId?: string | number;
  roles?: (string | number)[];
  sortOrder?: number;
  menuType?: 'CATALOG' | 'MENU' | 'LINK';
  componentPath?: string;
  routePath?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockRoleService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      list: [
        { id: 1, roleName: '超级管理员' },
        { id: 2, roleName: '系统管理员' },
        { id: 3, roleName: '业务管理员' },
        { id: 4, roleName: '普通用户' },
      ],
      total: 4,
    };
  },
};

const mockMenuService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400}));

    const menuList: MenuItem[] = [
      {
        id: 1,
        label: '系统管理',
        key: '1',
        icon: <SettingOutlined />,
        sortOrder: 1,
        roles: [1, 2],
        children: [
          {
            id: 11,
            label: '用户管理',
            key: '1-1',
            icon: <UserOutlined />,
            parentId: 1,
            sortOrder: 1,
            roles: [1, 2],
          },
          {
            id: 12,
            label: '角色管理',
            key: '1-2',
            icon: <TeamOutlined />,
            parentId: 1,
            sortOrder: 2,
            roles: [1, 2],
          },
        ],
      },
      {
        id: 2,
        label: '业务管理',
        key: '2',
        icon: <DashboardOutlined />,
        sortOrder: 2,
        roles: [1, 3],
        children: [
          {
            id: 21,
            label: '订单管理',
            key: '2-1',
            icon: <FileOutlined />,
            parentId: 2,
            sortOrder: 1,
            roles: [1, 3],
          },
        ],
      },
      {
        id: 3,
        label: '数据报表',
        key: '3',
        icon: <DashboardOutlined />,
        sortOrder: 3,
        roles: [1, 3, 4],
      },
    ];

    return { list: menuList, total: menuList.length };
  },
};

// ============================================================================
// Menu Preview Page Component
// ============================================================================

export const MenuPreviewPage: React.FC = () => {
  // State
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | number | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Load roles and menus
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [rolesData, menusData] = await Promise.all([
        mockRoleService.list(),
        mockMenuService.list(),
      ]);

      setRoles(rolesData.list);
      setMenus(menusData.list);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('获取数据失败');
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter menus by role
  const filteredMenus = useMemo(() => {
    if (!selectedRole) return [];

    const filterMenus = (menuList: MenuItem[]): MenuItem[] => {
      return menuList
        .filter((menu) => !menu.roles || menu.roles.includes(selectedRole))
        .map((menu) => ({
          ...menu,
          children: menu.children ? filterMenus(menu.children) : [],
        }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    };

    return filterMenus(menus);
  }, [menus, selectedRole]);

  // Transform to Antd Menu items
  const menuItems: MenuProps['items'] = useMemo(() => {
    return filteredMenus.map((menu) => ({
      key: String(menu.id),
      icon: menu.icon,
      label: menu.label,
      children: menu.children?.map((child) => ({
        key: String(child.id),
        icon: child.icon,
        label: child.label,
      })),
    }));
  }, [filteredMenus]);

  // Handle role change
  const handleRoleChange = useCallback((value: string | number) => {
    setSelectedRole(value);
    setActiveMenu('');
    const role = roles.find((r) => r.id === value);
    message.success(`已切换角色: ${role?.roleName}`);
  }, [roles]);

  // Handle menu select
  const handleMenuSelect: MenuProps['onSelect'] = useCallback((info) => {
    setActiveMenu(info.key);
    const menu = menus.find((m) => String(m.id) === info.key);
    if (menu) {
      message.info(`选中菜单: ${menu.label}`);
    }
  }, [menus]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadData();
    message.success('刷新成功');
  }, [loadData]);

  // Get selected menu label
  const getSelectedMenuLabel = useCallback((key: string): string => {
    const findLabel = (items: MenuItem[], path: string[] = []): string | null => {
      for (const item of items) {
        if (String(item.id) === key) {
          return item.label || '';
        }
        if (item.children) {
          const result = findLabel(item.children, [...path, item.label || '']);
          if (result) return result;
        }
      }
      return null;
    };
    return findLabel(menus) || key;
  }, [menus]);

  // Role options
  const roleOptions = useMemo(() => {
    return roles.map((role) => ({
      label: role.roleName,
      value: role.id,
    }));
  }, [roles]);

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarTitle}>菜单预览</span>
        </div>
        <div className={styles.toolbarRight}>
          <Select
            placeholder="请选择角色"
            value={selectedRole}
            onChange={handleRoleChange}
            options={roleOptions}
            style={{ width: 200 }}
            disabled={dataLoading}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={dataLoading}
            style={{ marginLeft: 10 }}
          >
            刷新
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className={styles.previewContainer}>
        <Spin spinning={dataLoading}>
          {selectedRole ? (
            <div className={styles.previewLayout}>
              {/* Sidebar Preview */}
              <div className={styles.sidebarPreview}>
                <div className={styles.previewTitle}>侧边栏预览</div>
                <div className={styles.sidebarContainer}>
                  <Menu
                    mode="inline"
                    selectedKeys={activeMenu ? [activeMenu] : []}
                    onSelect={handleMenuSelect}
                    items={menuItems}
                    className={styles.previewMenu}
                  />
                </div>
              </div>

              {/* Content Preview */}
              <div className={styles.contentPreview}>
                {/* Header Preview */}
                <div className={styles.headerPreview}>
                  <div className={styles.previewTitle}>顶部导航预览</div>
                  <div className={styles.headerContainer}>
                    <div className={styles.breadcrumb}>
                      <Breadcrumb
                        items={activeMenu
                          ? [
                              { title: '首页' },
                              { title: getSelectedMenuLabel(activeMenu) },
                            ]
                          : [{ title: '首页' }]}
                      />
                    </div>
                    <div className={styles.headerActions}>
                      <Tag color="processing">
                        当前角色: {roles.find((r) => r.id === selectedRole)?.roleName}
                      </Tag>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className={styles.mainContent}>
                  <div className={styles.previewTitle}>内容区域</div>
                  <div className={styles.contentArea}>
                    {activeMenu ? (
                      <div className={styles.contentPage}>
                        <h3>{getSelectedMenuLabel(activeMenu)}</h3>
                        <p>这是 {getSelectedMenuLabel(activeMenu)} 页面的内容预览</p>
                        <p>当前选中菜单ID: {activeMenu}</p>
                      </div>
                    ) : (
                      <div className={styles.emptyContent}>
                        <DashboardOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <p>请从侧边栏选择一个菜单进行预览</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyPreview}>
              <UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <p>请选择角色以预览菜单</p>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

MenuPreviewPage.displayName = 'MenuPreviewPage';

export default MenuPreviewPage;
