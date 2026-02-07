/**
 * Logistics Warehouse Page
 *
 * Warehouse management page containing:
 * - Warehouse management
 * - Inventory overview
 * - Location management
 *
 * Migrated from Vue3 (products/pc-admin/apps/logistics-app/src/modules/warehouse/views/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tabs,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Progress,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SettingOutlined,
  ExportOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.module.css';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Warehouse data interface
 */
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  usedCapacity: number;
  totalItems: number;
  totalValue: number;
}

/**
 * Inventory item data interface
 */
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  location: string;
  quantity: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdate: string;
}

/**
 * Location data interface
 */
export interface Location {
  id: string;
  code: string;
  zone: string;
  aisle: string;
  rack: string;
  level: string;
  status: 'available' | 'occupied' | 'reserved';
}

/**
 * WarehousePage - Main Warehouse Page Component
 *
 * Displays warehouse management, inventory overview, and location management.
 */
export const WarehousePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchText, setSearchText] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();

  // Mock warehouse data
  const warehouses: Warehouse[] = [
    {
      id: '1',
      name: '上海主仓',
      code: 'SH-MAIN',
      location: '上海市浦东新区',
      capacity: 10000,
      usedCapacity: 7500,
      totalItems: 5680,
      totalValue: 12500000,
    },
    {
      id: '2',
      name: '深圳分仓',
      code: 'SZ-BRANCH',
      location: '深圳市南山区',
      capacity: 5000,
      usedCapacity: 3200,
      totalItems: 2450,
      totalValue: 5800000,
    },
    {
      id: '3',
      name: '北京仓',
      code: 'BJ-WAREHOUSE',
      location: '北京市朝阳区',
      capacity: 8000,
      usedCapacity: 5600,
      totalItems: 3890,
      totalValue: 9200000,
    },
  ];

  // Mock inventory data
  const inventoryData: InventoryItem[] = [
    {
      id: '1',
      sku: 'SKU001',
      name: '电子元器件-A',
      category: '电子元器件',
      warehouse: '上海主仓',
      location: 'A-01-01',
      quantity: 1500,
      unit: '个',
      status: 'in_stock',
      lastUpdate: '2024-01-15',
    },
    {
      id: '2',
      sku: 'SKU002',
      name: '电子元器件-B',
      category: '电子元器件',
      warehouse: '上海主仓',
      location: 'A-01-02',
      quantity: 50,
      unit: '个',
      status: 'low_stock',
      lastUpdate: '2024-01-14',
    },
    {
      id: '3',
      sku: 'SKU003',
      name: '包装材料',
      category: '包装材料',
      warehouse: '深圳分仓',
      location: 'B-02-03',
      quantity: 5000,
      unit: '套',
      status: 'in_stock',
      lastUpdate: '2024-01-15',
    },
    {
      id: '4',
      sku: 'SKU004',
      name: '辅料配件',
      category: '辅料配件',
      warehouse: '北京仓',
      location: 'C-03-01',
      quantity: 0,
      unit: '个',
      status: 'out_of_stock',
      lastUpdate: '2024-01-10',
    },
    {
      id: '5',
      sku: 'SKU005',
      name: '半成品-A',
      category: '半成品',
      warehouse: '上海主仓',
      location: 'A-02-01',
      quantity: 200,
      unit: '件',
      status: 'in_stock',
      lastUpdate: '2024-01-15',
    },
  ];

  // Mock location data
  const locationData: Location[] = [
    { id: '1', code: 'A-01-01', zone: 'A', aisle: '01', rack: '01', level: '1', status: 'occupied' },
    { id: '2', code: 'A-01-02', zone: 'A', aisle: '01', rack: '01', level: '2', status: 'occupied' },
    { id: '3', code: 'A-01-03', zone: 'A', aisle: '01', rack: '01', level: '3', status: 'available' },
    { id: '4', code: 'A-01-04', zone: 'A', aisle: '01', rack: '01', level: '4', status: 'reserved' },
    { id: '5', code: 'A-02-01', zone: 'A', aisle: '02', rack: '01', level: '1', status: 'occupied' },
    { id: '6', code: 'A-02-02', zone: 'A', aisle: '02', rack: '01', level: '2', status: 'available' },
    { id: '7', code: 'A-02-03', zone: 'A', aisle: '02', rack: '01', level: '3', status: 'occupied' },
    { id: '8', code: 'A-02-04', zone: 'A', aisle: '02', rack: '01', level: '4', status: 'available' },
  ];

  // Calculate statistics
  const stats = {
    totalWarehouses: warehouses.length,
    totalInventory: inventoryData.length,
    lowStock: inventoryData.filter((i) => i.status === 'low_stock').length,
    outOfStock: inventoryData.filter((i) => i.status === 'out_of_stock').length,
    totalLocations: locationData.length,
    availableLocations: locationData.filter((l) => l.status === 'available').length,
  };

  // Filter inventory
  const filteredInventory = inventoryData.filter((item) => {
    const matchesSearch =
      !searchText ||
      item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesWarehouse = !warehouseFilter || item.warehouse === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  // Inventory table columns
  const inventoryColumns: ColumnsType<InventoryItem> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100,
      render: (text) => <a>{text}</a>,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120,
    },
    {
      title: '库位',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = {
          in_stock: { color: 'success', label: '充足' },
          low_stock: { color: 'warning', label: '不足' },
          out_of_stock: { color: 'error', label: '缺货' },
        }[status];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      },
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">
            入库
          </Button>
          <Button type="link" size="small">
            出库
          </Button>
        </Space>
      ),
    },
  ];

  // Render capacity bar
  const renderCapacityBar = (used: number, total: number) => {
    const percentage = Math.round((used / total) * 100);
    const colorClass =
      percentage >= 80
        ? styles.capacityHigh
        : percentage >= 60
        ? styles.capacityMedium
        : styles.capacityLow;
    return (
      <div className={styles.capacityBar}>
        <div className={`${styles.capacityFill} ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  // Render location cells
  const renderLocationCells = () => {
    return locationData.map((location) => {
      const statusClass =
        location.status === 'available'
          ? styles.locationAvailable
          : location.status === 'occupied'
          ? styles.locationOccupied
          : styles.locationReserved;
      const statusLabel =
        location.status === 'available'
          ? '空闲'
          : location.status === 'occupied'
          ? '占用'
          : '预留';

      return (
        <div key={location.id} className={styles.locationCell}>
          <div className={styles.locationCode}>{location.code}</div>
          <div className={`${styles.locationStatus} ${statusClass}`}>{statusLabel}</div>
        </div>
      );
    });
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Quick actions handlers
  const handleInbound = () => {
    message.info('入库管理 - 开发中');
  };

  const handleOutbound = () => {
    message.info('出库管理 - 开发中');
  };

  const handleTransfer = () => {
    message.info('库存调拨 - 开发中');
  };

  const handleInventoryCheck = () => {
    message.info('库存盘点 - 开发中');
  };

  return (
    <div className={styles.page}>
      {/* Quick actions */}
      <div className={styles.quickActions}>
        <div className={styles.quickActionBtn} onClick={handleInbound}>
          <InboxOutlined className={styles.quickActionIcon} />
          <span>入库</span>
        </div>
        <div className={styles.quickActionBtn} onClick={handleOutbound}>
          <ExportOutlined className={styles.quickActionIcon} />
          <span>出库</span>
        </div>
        <div className={styles.quickActionBtn} onClick={handleTransfer}>
          <ArrowUpOutlined className={styles.quickActionIcon} />
          <span>调拨</span>
        </div>
        <div className={styles.quickActionBtn} onClick={handleInventoryCheck}>
          <SettingOutlined className={styles.quickActionIcon} />
          <span>盘点</span>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span>
              <HomeOutlined />
              仓库概览
            </span>
          }
          key="overview"
        >
          <div className={styles.tabContent}>
            {/* Inventory stats */}
            <div className={styles.inventoryStats}>
              <Card className={styles.statCard}>
                <EnvironmentOutlined className={styles.statIcon} style={{ color: '#1890ff' }} />
                <div className={styles.statValue}>{stats.totalWarehouses}</div>
                <div className={styles.statLabel}>仓库数量</div>
              </Card>
              <Card className={styles.statCard}>
                <InboxOutlined className={styles.statIcon} style={{ color: '#52c41a' }} />
                <div className={styles.statValue}>{inventoryData.length}</div>
                <div className={styles.statLabel}>库存SKU</div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statValue} style={{ color: '#faad14' }}>
                  {stats.lowStock}
                </div>
                <div className={styles.statLabel}>库存不足</div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statValue} style={{ color: '#ff4d4f' }}>
                  {stats.outOfStock}
                </div>
                <div className={styles.statLabel}>缺货商品</div>
              </Card>
              <Card className={styles.statCard}>
                <TableOutlined className={styles.statIcon} style={{ color: '#722ed1' }} />
                <div className={styles.statValue}>{stats.totalLocations}</div>
                <div className={styles.statLabel}>总库位</div>
              </Card>
            </div>

            {/* Warehouse cards */}
            <Card title="仓库列表">
              <div className={styles.warehouseList}>
                {warehouses.map((warehouse) => {
                  const capacityPercent = Math.round((warehouse.usedCapacity / warehouse.capacity) * 100);
                  return (
                    <Card key={warehouse.id} className={styles.warehouseCard}>
                      <div className={styles.warehouseHeader}>
                        <span className={styles.warehouseName}>{warehouse.name}</span>
                        <div className={styles.warehouseCapacity}>
                          {renderCapacityBar(warehouse.usedCapacity, warehouse.capacity)}
                          <span className={styles.capacityText}>{capacityPercent}%</span>
                        </div>
                      </div>
                      <div className={styles.warehouseDetails}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailValue}>{warehouse.code}</div>
                          <div className={styles.detailLabel}>仓库编码</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailValue}>{warehouse.totalItems}</div>
                          <div className={styles.detailLabel}>库存数量</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailValue}>
                            {(warehouse.totalValue / 10000).toFixed(0)}万
                          </div>
                          <div className={styles.detailLabel}>库存价值</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <InboxOutlined />
              库存管理
            </span>
          }
          key="inventory"
        >
          <div className={styles.tabContent}>
            {/* Filter section */}
            <div className={styles.filterSection}>
              <Search
                placeholder="搜索SKU、商品名称"
                allowClear
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="仓库筛选"
                allowClear
                style={{ width: 150 }}
                value={warehouseFilter}
                onChange={setWarehouseFilter}
              >
                {warehouses.map((w) => (
                  <Option key={w.id} value={w.name}>
                    {w.name}
                  </Option>
                ))}
              </Select>
              <Button icon={<ReloadOutlined />}>刷新</Button>
              <Button icon={<ExportOutlined />}>导出</Button>
            </div>

            {/* Inventory table */}
            <Card className={styles.inventoryTable} title="库存列表">
              <Table<InventoryItem>
                columns={inventoryColumns}
                dataSource={filteredInventory}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
                }}
              />
            </Card>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <AppstoreOutlined />
              库位管理
            </span>
          }
          key="locations"
        >
          <div className={styles.tabContent}>
            <Card title="库位分布">
              <div className={styles.locationGrid}>{renderLocationCells()}</div>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

WarehousePage.displayName = 'WarehousePage';

export default WarehousePage;
