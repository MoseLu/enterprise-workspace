/**
 * Menus Page - Navigation Module
 * React Admin - Admin Application
 *
 * Manages menus with master-detail layout (domain list + menu list).
 * Menu types: CATALOG, MENU, LINK
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Tag, Button, Space, Empty, Spin, message } from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  MenuOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd/es/table';
import { AppTable } from '@enterprise-workspace/frontend/shared/data-display';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import type { CrudService } from '../../components';
import type { CrudFormField } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface DomainRecord {
  id?: string | number;
  name?: string;
  code?: string;
  description?: string;
}

interface MenuRecord {
  id?: string | number;
  menuName?: string;
  menuCode?: string;
  menuType?: 'CATALOG' | 'MENU' | 'LINK';
  parentId?: string | number;
  icon?: string;
  componentPath?: string;
  routePath?: string;
  sortOrder?: number;
  domainId?: string | number;
  description?: string;
  children?: MenuRecord[];
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockDomainService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      list: [
        { id: 1, name: '系统管理', code: 'SYSTEM', description: '系统管理域' },
        { id: 2, name: '业务管理', code: 'BUSINESS', description: '业务管理域' },
        { id: 3, name: '数据管理', code: 'DATA', description: '数据管理域' },
        { id: 0, name: '未分配', code: 'UNASSIGNED', description: '未分配到域的菜单' },
      ],
      total: 4,
    };
  },
};

const mockMenuService: CrudService<MenuRecord> & {
  list?: (params?: Record<string, unknown>) => Promise<{ list: MenuRecord[]; total: number }>;
} = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, domainId } = params || {};

    const allMenus: MenuRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      menuName: `菜单${i + 1}`,
      menuCode: `menu:${i + 1}`,
      menuType: ['CATALOG', 'MENU', 'LINK'][i % 3] as 'CATALOG' | 'MENU' | 'LINK',
      parentId: i < 3 ? 0 : ((i % 3) + 1),
      icon: ['setting', 'user', 'dashboard'][i % 3],
      componentPath: `/pages/${i + 1}/index`,
      routePath: `/menu-${i + 1}`,
      sortOrder: i + 1,
      domainId: domainId || ((i % 3) + 1),
      description: `这是第 ${i + 1} 个菜单的描述`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      children:
        i < 3
          ? Array.from({ length: 3 }, (_, j) => ({
              id: 100 + i * 10 + j,
              menuName: `子菜单${i + 1}-${j + 1}`,
              menuCode: `menu:${i + 1}:${j + 1}`,
              menuType: 'MENU' as const,
              parentId: i + 1,
              icon: 'file',
              componentPath: `/pages/${i + 1}/${j + 1}/index`,
              routePath: `/menu-${i + 1}-${j + 1}`,
              sortOrder: j + 1,
              domainId: domainId || ((i % 3) + 1),
              description: `子菜单描述`,
            }))
          : undefined,
    }));

    // Filter by domain
    const filteredMenus = domainId
      ? allMenus.filter((menu) => menu.domainId === domainId)
      : allMenus;

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredMenus.slice(start, end),
      total: filteredMenus.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      menuName: `菜单${id}`,
      menuCode: `menu:${id}`,
      menuType: 'MENU',
      parentId: 0,
      icon: 'setting',
      componentPath: `/pages/${id}/index`,
      routePath: `/menu-${id}`,
      sortOrder: id as number,
      domainId: 1,
      description: '菜单描述信息',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: MenuRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: MenuRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted menu:', id);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getMenuTypeTag = (type?: string): { color: string; text: string; icon: React.ReactNode } => {
  const typeMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
    CATALOG: { color: 'blue', text: '目录', icon: <FolderOutlined /> },
    MENU: { color: 'green', text: '菜单', icon: <MenuOutlined /> },
    LINK: { color: 'orange', text: '链接', icon: <LinkOutlined /> },
  };
  return typeMap[type || ''] || { color: 'default', text: type || '未知', icon: null };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Menus Page Component
// ============================================================================

export const MenusPage: React.FC = () => {
  // Services
  const domainService = mockDomainService;
  const menuService = mockMenuService;

  // State
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null);
  const [menuTotal, setMenuTotal] = useState(0);
  const [domainLoading, setDomainLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);

  // Refs
  const menuTableRef = useRef<AppTableRef>(null);

  // Load domains
  const loadDomains = useCallback(async () => {
    setDomainLoading(true);
    try {
      const response = await domainService.list();
      setDomains(response.list);
    } catch (error) {
      console.error('Failed to load domains:', error);
    } finally {
      setDomainLoading(false);
    }
  }, [domainService]);

  // Load menus
  const loadMenus = useCallback(async (domain?: DomainRecord | null) => {
    setMenuLoading(true);
    try {
      const response = await menuService.list!({ domainId: domain?.id });
      setMenus(response.list);
      setMenuTotal(response.total);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setMenuLoading(false);
    }
  }, [menuService]);

  // Initial load
  useEffect(() => {
    loadDomains();
    loadMenus(null);
  }, [loadDomains, loadMenus]);

  // Handle domain selection
  const handleDomainSelect = useCallback((domain: DomainRecord) => {
    setSelectedDomain(domain);
    loadMenus(domain);
  }, [loadMenus]);

  // Handle domain reload
  const handleDomainReload = useCallback(() => {
    loadDomains();
  }, [loadDomains]);

  // Handle menu reload
  const handleMenuReload = useCallback(() => {
    loadMenus(selectedDomain);
  }, [loadMenus, selectedDomain]);

  // Domain columns
  const domainColumns: TableColumnsType<DomainRecord> = useMemo(
    () => [
      {
        title: '域名',
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <Space>
            <span>{record.name}</span>
            <Tag color="blue">{record.code}</Tag>
          </Space>
        ),
      },
    ],
    []
  );

  // Menu columns
  const menuColumns: TableColumnsType<MenuRecord> = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1,
      },
      {
        title: '菜单名称',
        dataIndex: 'menuName',
        key: 'menuName',
        width: 120,
      },
      {
        title: '菜单编码',
        dataIndex: 'menuCode',
        key: 'menuCode',
        width: 140,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '菜单类型',
        dataIndex: 'menuType',
        key: 'menuType',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text, icon } = getMenuTypeTag(record.menuType);
          return (
            <Tag color={color} icon={icon}>
              {text}
            </Tag>
          );
        },
      },
      {
        title: '图标',
        dataIndex: 'icon',
        key: 'icon',
        width: 80,
        align: 'center',
        render: (value) => value || '-',
      },
      {
        title: '组件路径',
        dataIndex: 'componentPath',
        key: 'componentPath',
        width: 160,
        render: (value) => <code style={{ fontSize: '11px' }}>{value}</code>,
      },
      {
        title: '路由路径',
        dataIndex: 'routePath',
        key: 'routePath',
        width: 140,
        render: (value) => <code style={{ fontSize: '11px' }}>{value}</code>,
      },
      {
        title: '排序',
        dataIndex: 'sortOrder',
        key: 'sortOrder',
        width: 70,
        align: 'center',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        minWidth: 120,
        render: (value) => value || '-',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (_, record) => formatDate(record.createdAt),
      },
      {
        title: '操作',
        key: 'action',
        width: 140,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />}>
              编辑
            </Button>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <div className={styles.masterDetail}>
        {/* Domain List (Left Panel) */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>域列表</span>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleDomainReload}
              loading={domainLoading}
            />
          </div>
          <div className={styles.panelContent}>
            <Spin spinning={domainLoading}>
              {domains.length > 0 ? (
                <div className={styles.domainList}>
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className={`${styles.domainItem} ${selectedDomain?.id === domain.id ? styles.selected : ''}`}
                      onClick={() => handleDomainSelect(domain)}
                    >
                      <span className={styles.domainName}>{domain.name}</span>
                      <Tag color="blue" className={styles.domainCode}>
                        {domain.code}
                      </Tag>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Spin>
          </div>
        </div>

        {/* Menu List (Right Panel) */}
        <div className={styles.rightPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.rightHeaderLeft}>
              <span className={styles.panelTitle}>菜单列表</span>
              {selectedDomain && (
                <Tag color="processing">
                  {selectedDomain.name}
                </Tag>
              )}
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleMenuReload} loading={menuLoading}>
                刷新
              </Button>
            </Space>
          </div>
          <div className={styles.panelContent}>
            <AppTable
              ref={menuTableRef}
              dataSource={menus}
              columns={menuColumns}
              loading={menuLoading}
              rowKey="id"
              pagination={{
                current: 1,
                pageSize: 10,
                total: menuTotal,
              }}
              scroll={{ x: 1400 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

MenusPage.displayName = 'MenusPage';

export default MenusPage;
