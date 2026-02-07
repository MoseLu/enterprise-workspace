import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Table, Tag, Button, Space, Statistic, Row, Col, Input, Select, DatePicker, Modal, Form, InputNumber, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import styles from './index.module.scss';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 库存数据类型定义
 */
interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  status: 'normal' | 'low' | 'overstock' | 'out';
  lastUpdate: string;
}

/**
 * 库存汇总数据
 */
interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStock: number;
  overStock: number;
}

/**
 * 财务库存管理页面组件
 *
 * 提供库存数据管理、查询、统计和盘点功能
 */
const FinanceInventory: React.FC = () => {
  // 状态定义
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  // 模拟库存数据
  const inventoryData: InventoryItem[] = [
    {
      id: 'INV001',
      code: 'SKU-2024-001',
      name: '办公桌',
      category: '办公家具',
      warehouse: '主仓库-A',
      quantity: 45,
      unit: '张',
      unitPrice: 1200,
      totalValue: 54000,
      status: 'normal',
      lastUpdate: '2024-06-15',
    },
    {
      id: 'INV002',
      code: 'SKU-2024-002',
      name: '笔记本电脑',
      category: '电子设备',
      warehouse: '主仓库-B',
      quantity: 12,
      unit: '台',
      unitPrice: 8500,
      totalValue: 102000,
      status: 'low',
      lastUpdate: '2024-06-14',
    },
    {
      id: 'INV003',
      code: 'SKU-2024-003',
      name: '打印机',
      category: '电子设备',
      warehouse: '主仓库-A',
      quantity: 8,
      unit: '台',
      unitPrice: 3500,
      totalValue: 28000,
      status: 'low',
      lastUpdate: '2024-06-13',
    },
    {
      id: 'INV004',
      code: 'SKU-2024-004',
      name: '办公椅',
      category: '办公家具',
      warehouse: '分仓库-1',
      quantity: 200,
      unit: '把',
      unitPrice: 450,
      totalValue: 90000,
      status: 'overstock',
      lastUpdate: '2024-06-12',
    },
    {
      id: 'INV005',
      code: 'SKU-2024-005',
      name: '碎纸机',
      category: '办公设备',
      warehouse: '主仓库-B',
      quantity: 0,
      unit: '台',
      unitPrice: 800,
      totalValue: 0,
      status: 'out',
      lastUpdate: '2024-06-11',
    },
    {
      id: 'INV006',
      code: 'SKU-2024-006',
      name: '投影仪',
      category: '电子设备',
      warehouse: '主仓库-A',
      quantity: 25,
      unit: '台',
      unitPrice: 4500,
      totalValue: 112500,
      status: 'normal',
      lastUpdate: '2024-06-10',
    },
  ];

  // 库存汇总
  const summary: InventorySummary = {
    totalItems: inventoryData.length,
    totalValue: inventoryData.reduce((sum, item) => sum + item.totalValue, 0),
    lowStock: inventoryData.filter((item) => item.status === 'low').length,
    overStock: inventoryData.filter((item) => item.status === 'overstock').length,
  };

  // 获取库存状态标签
  const getStatusTag = (status: string): React.ReactNode => {
    const statusMap: Record<string, { color: string; text: string }> = {
      normal: { color: 'success', text: '正常' },
      low: { color: 'warning', text: '低库存' },
      overstock: { color: 'processing', text: '超储' },
      out: { color: 'error', text: '缺货' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: TableColumnsType<InventoryItem> = [
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类别',
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
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price: number) => (
        <Text code>¥{price.toLocaleString()}</Text>
      ),
    },
    {
      title: '总值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 140,
      align: 'right',
      render: (value: number) => (
        <Text strong type="success">¥{value.toLocaleString()}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '更新日期',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: () => (
        <Space split="|">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 添加库存项
  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      console.log('新增库存项:', values);
      message.success('添加成功');
      setAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 筛选后的数据
  const filteredData = inventoryData.filter((item) => {
    const matchesSearch = searchText
      ? item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className={styles.financeInventory}>
      {/* 标题区域 */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          <InboxOutlined /> 库存管理
        </Title>
        <Paragraph type="secondary">
          财务库存管理模块，支持库存查询、统计、盘点和导出功能
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.summaryRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="库存种类"
              value={summary.totalItems}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="库存总值"
              value={summary.totalValue}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="低库存"
              value={summary.lowStock}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="超储"
              value={summary.overStock}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 工具栏 */}
      <Card className={styles.toolbarCard}>
        <div className={styles.toolbar}>
          <Space wrap>
            <Input
              placeholder="搜索名称/编码"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 140 }}
              placeholder="类别筛选"
            >
              <Option value="all">全部类别</Option>
              <Option value="办公家具">办公家具</Option>
              <Option value="电子设备">电子设备</Option>
              <Option value="办公设备">办公设备</Option>
            </Select>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              placeholder="状态筛选"
            >
              <Option value="all">全部状态</Option>
              <Option value="normal">正常</Option>
              <Option value="low">低库存</Option>
              <Option value="overstock">超储</Option>
              <Option value="out">缺货</Option>
            </Select>
          </Space>
          <Space wrap>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
            <Link to="/inventory/result">
              <Button icon={<SearchOutlined />}>
                盘点结果
              </Button>
            </Link>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              新增库存
            </Button>
          </Space>
        </div>
      </Card>

      {/* 库存表格 */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
          loading={loading}
        />
      </Card>

      {/* 新增库存对话框 */}
      <Modal
        title="新增库存"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        onOk={handleAdd}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="库存编码"
            rules={[{ required: true, message: '请输入库存编码' }]}
          >
            <Input placeholder="SKU-XXXX-XXX" />
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="物品名称" />
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请选择类别' }]}
          >
            <Select placeholder="选择类别">
              <Option value="办公家具">办公家具</Option>
              <Option value="电子设备">电子设备</Option>
              <Option value="办公设备">办公设备</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="warehouse"
            label="仓库"
            rules={[{ required: true, message: '请选择仓库' }]}
          >
            <Select placeholder="选择仓库">
              <Option value="主仓库-A">主仓库-A</Option>
              <Option value="主仓库-B">主仓库-B</Option>
              <Option value="分仓库-1">分仓库-1</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="个/台/张" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="unitPrice"
            label="单价"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <InputNumber
              min={0}
              prefix="¥"
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinanceInventory;
