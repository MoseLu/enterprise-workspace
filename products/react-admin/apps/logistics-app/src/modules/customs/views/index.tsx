/**
 * Logistics Customs Page
 *
 * Customs declaration management page containing:
 * - Customs declaration management
 * - Table with CRUD operations
 * - Status tracking
 *
 * Migrated from Vue3 (products/pc-admin/apps/logistics-app/src/modules/customs/views/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Tooltip,
} from 'antd';
  Space,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import styles from './index.module.css';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Customs declaration data interface
 */
export interface CustomsDeclaration {
  id: string;
  declarationNo: string;
  applicant: string;
  goodsName: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submitDate: string;
  customsOffice: string;
}

/**
 * Form values interface
 */
interface CustomsFormValues {
  applicant: string;
  goodsName: string;
  quantity: number;
  amount: number;
  customsOffice: string;
  remarks: string;
  submitDate: Dayjs;
}

/**
 * Status configuration
 */
const statusConfig: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  pending: {
    color: 'warning',
    label: '待审核',
    icon: <ClockCircleOutlined />,
  },
  approved: {
    color: 'success',
    label: '已通过',
    icon: <CheckCircleOutlined />,
  },
  rejected: {
    color: 'error',
    label: '已拒绝',
    icon: <CloseCircleOutlined />,
  },
  processing: {
    color: 'processing',
    label: '处理中',
    icon: <SyncOutlined spin />,
  },
};

// Icons for status
const ClockCircleOutlined = () => (
  <span style={{ marginRight: 4 }}>○</span>
);
const CheckCircleOutlined = () => (
  <span style={{ marginRight: 4, color: '#52c41a' }}>✓</span>
);
const CloseCircleOutlined = () => (
  <span style={{ marginRight: 4, color: '#ff4d4f' }}>✕</span>
);
const SyncOutlined: React.FC<{ spin?: boolean }> = ({ spin }) => (
  <span style={{ marginRight: 4 }}>{spin ? '⟳' : '↻'}</span>
);

/**
 * CustomsPage - Main Customs Page Component
 *
 * Displays customs declaration management with table CRUD operations.
 */
export const CustomsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Mock data - replace with actual API calls
  const [data, setData] = useState<CustomsDeclaration[]>([
    {
      id: '1',
      declarationNo: 'DEC2024001',
      applicant: '张三',
      goodsName: '电子元器件',
      quantity: 1000,
      amount: 50000,
      status: 'approved',
      submitDate: '2024-01-15',
      customsOffice: '上海海关',
    },
    {
      id: '2',
      declarationNo: 'DEC2024002',
      applicant: '李四',
      goodsName: '服装面料',
      quantity: 500,
      amount: 25000,
      status: 'pending',
      submitDate: '2024-01-16',
      customsOffice: '深圳海关',
    },
    {
      id: '3',
      declarationNo: 'DEC2024003',
      applicant: '王五',
      goodsName: '机械设备',
      quantity: 10,
      amount: 150000,
      status: 'processing',
      submitDate: '2024-01-17',
      customsOffice: '广州海关',
    },
    {
      id: '4',
      declarationNo: 'DEC2024004',
      applicant: '赵六',
      goodsName: '化工原料',
      quantity: 200,
      amount: 80000,
      status: 'rejected',
      submitDate: '2024-01-18',
      customsOffice: '宁波海关',
    },
  ]);

  // Filter data
  const filteredData = data.filter((item) => {
    const matchesSearch =
      !searchText ||
      item.declarationNo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.applicant.toLowerCase().includes(searchText.toLowerCase()) ||
      item.goodsName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Table columns
  const columns: ColumnsType<CustomsDeclaration> = [
    {
      title: '报关单号',
      dataIndex: 'declarationNo',
      key: 'declarationNo',
      width: 150,
      render: (text) => <a>{text}</a>,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 150,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount) => amount.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '提交日期',
      dataIndex: 'submitDate',
      key: 'submitDate',
      width: 120,
    },
    {
      title: '海关',
      dataIndex: 'customsOffice',
      key: 'customsOffice',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: data.length,
    pending: data.filter((d) => d.status === 'pending').length,
    approved: data.filter((d) => d.status === 'approved').length,
    processing: data.filter((d) => d.status === 'processing').length,
    rejected: data.filter((d) => d.status === 'rejected').length,
  };

  // Handlers
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CustomsDeclaration) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      submitDate: undefined, // Reset date field
    });
    setModalVisible(true);
  };

  const handleView = (record: CustomsDeclaration) => {
    message.info(`查看报关单: ${record.declarationNo}`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此报关单吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setData((prev) => prev.filter((item) => item.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editingId) {
        // Update existing
        setData((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...values,
                  submitDate: values.submitDate?.format('YYYY-MM-DD') || item.submitDate,
                }
              : item
          )
        );
        message.success('更新成功');
      } else {
        // Add new
        const newItem: CustomsDeclaration = {
          id: String(Date.now()),
          declarationNo: `DEC${Date.now().toString().slice(-7)}`,
          ...values,
          submitDate: values.submitDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
          status: 'pending',
        };
        setData((prev) => [newItem, ...prev]);
        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('导出功能开发中');
  };

  const handleRefresh = () => {
    message.loading('刷新数据中...', 1).then(() => {
      message.success('数据已刷新');
    });
  };

  return (
    <div className={styles.page}>
      {/* Statistics row */}
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>全部报关单</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#faad14' }}>
            {stats.pending}
          </div>
          <div className={styles.statLabel}>待审核</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#52c41a' }}>
            {stats.approved}
          </div>
          <div className={styles.statLabel}>已通过</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#1890ff' }}>
            {stats.processing}
          </div>
          <div className={styles.statLabel}>处理中</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#ff4d4f' }}>
            {stats.rejected}
          </div>
          <div className={styles.statLabel}>已拒绝</div>
        </Card>
      </div>

      {/* Main table section */}
      <Card
        className={styles.tableSection}
        title="报关管理"
        extra={
          <Space>
            <Search
              placeholder="搜索报关单号、申请人、货品"
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 120 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="pending">待审核</Option>
              <Option value="approved">已通过</Option>
              <Option value="processing">处理中</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增报关单
            </Button>
          </Space>
        }
      >
        <Table<CustomsDeclaration>
          columns={columns}
          dataSource={filteredData}
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

      {/* Add/Edit Modal */}
      <Modal
        title={editingId ? '编辑报关单' : '新增报关单'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className={styles.modalForm}>
            <Form.Item
              name="applicant"
              label="申请人"
              rules={[{ required: true, message: '请输入申请人' }]}
            >
              <Input placeholder="请输入申请人姓名" />
            </Form.Item>
            <Form.Item
              name="goodsName"
              label="货品名称"
              rules={[{ required: true, message: '请输入货品名称' }]}
            >
              <Input placeholder="请输入货品名称" />
            </Form.Item>
            <div className={styles.formRow}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
                className={styles.formItem}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入数量" />
              </Form.Item>
              <Form.Item
                name="amount"
                label="金额(元)"
                rules={[{ required: true, message: '请输入金额' }]}
                className={styles.formItem}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入金额"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="customsOffice"
              label="海关"
              rules={[{ required: true, message: '请选择海关' }]}
            >
              <Select placeholder="请选择海关">
                <Option value="上海海关">上海海关</Option>
                <Option value="深圳海关">深圳海关</Option>
                <Option value="广州海关">广州海关</Option>
                <Option value="宁波海关">宁波海关</Option>
                <Option value="厦门海关">厦门海关</Option>
                <Option value="天津海关">天津海关</Option>
              </Select>
            </Form.Item>
            <Form.Item name="submitDate" label="提交日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="remarks" label="备注">
              <TextArea rows={3} placeholder="请输入备注信息" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

CustomsPage.displayName = 'CustomsPage';

export default CustomsPage;
