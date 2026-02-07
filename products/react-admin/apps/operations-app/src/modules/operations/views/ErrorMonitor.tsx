import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Space,
  Typography,
  Tooltip,
  Badge,
  Empty,
  Spin,
  Alert,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import styles from './ErrorMonitor.module.scss';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 错误类型定义
 */
interface ErrorInfo {
  id: string;
  type: 'error' | 'warn' | 'console-error' | 'console-warn' | 'promise' | 'resource' | 'unknown';
  source: string;
  message: string;
  url?: string;
  line?: number;
  column?: number;
  stack?: string;
  timestamp: number;
  isWarning: boolean;
}

/**
 * 应用来源选项
 */
const SOURCE_OPTIONS = [
  { value: 'all', label: '全部来源' },
  { value: 'main-app', label: '主应用' },
  { value: 'admin-app', label: '管理应用' },
  { value: 'logistics-app', label: '物流应用' },
  { value: 'quality-app', label: '质量应用' },
  { value: 'production-app', label: '生产应用' },
  { value: 'engineering-app', label: '工程应用' },
  { value: 'finance-app', label: '财务应用' },
];

/**
 * 清理周期选项
 */
const CLEANUP_PERIOD_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: '3days', label: '最近3天' },
  { value: '7days', label: '最近7天' },
  { value: '30days', label: '最近30天' },
  { value: 'never', label: '永不清理' },
];

/**
 * 获取应用显示名称
 */
const getAppDisplayName = (source: string): string => {
  const sourceMap: Record<string, string> = {
    'main': '主应用',
    'system': '系统应用',
    'admin': '管理应用',
    'logistics': '物流应用',
    'quality': '质量应用',
    'production': '生产应用',
    'engineering': '工程应用',
    'finance': '财务应用',
    'monitor': '监控应用',
  };
  const normalizedSource = source.replace(/-app$/, '');
  return sourceMap[normalizedSource] || source;
};

/**
 * 获取错误类型显示名称
 */
const getErrorTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'resource': '资源加载错误',
    'script': 'JavaScript 错误',
    'promise': 'Promise 错误',
    'console-warn': '控制台警告',
    'console-error': '控制台错误',
    'unknown': '未知错误',
  };
  return typeMap[type] || type;
};

/**
 * 获取错误类型对应的图标
 */
const getErrorTypeIcon = (type: string, isWarning: boolean) => {
  if (isWarning) {
    return <WarningOutlined style={{ color: '#faad14' }} />;
  }
  switch (type) {
    case 'resource':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    case 'script':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'promise':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'console-error':
    case 'console-warn':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    default:
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  }
};

/**
 * 错误监控页面组件
 *
 * 提供错误监控、筛选、清理和导出功能
 */
const ErrorMonitor: React.FC = () => {
  // 状态定义
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [cleanupPeriod, setCleanupPeriod] = useState<string>('today');
  const [errorList, setErrorList] = useState<ErrorInfo[]>([]);
  const [filteredErrorList, setFilteredErrorList] = useState<ErrorInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟错误数据
  const loadMockData = useCallback(() => {
    setLoading(true);
    try {
      // 模拟错误数据
      const mockErrors: ErrorInfo[] = [
        {
          id: '1',
          type: 'script',
          source: 'admin-app',
          message: 'Uncaught TypeError: Cannot read property \'value\' of undefined',
          url: 'https://admin.bellis.com.cn/js/app.js',
          line: 123,
          column: 45,
          timestamp: Date.now() - 1000 * 60 * 5,
          isWarning: false,
        },
        {
          id: '2',
          type: 'resource',
          source: 'logistics-app',
          message: 'Failed to load resource: net::ERR_CONNECTION_REFUSED',
          url: 'https://logistics.bellis.com.cn/api/data.json',
          timestamp: Date.now() - 1000 * 60 * 15,
          isWarning: false,
        },
        {
          id: '3',
          type: 'promise',
          source: 'system-app',
          message: 'Uncaught (in promise) Error: Network response was not ok',
          url: 'https://system.bellis.com.cn/api/users',
          timestamp: Date.now() - 1000 * 60 * 30,
          isWarning: false,
        },
        {
          id: '4',
          type: 'console-warn',
          source: 'production-app',
          message: 'Warning: componentWillMount is deprecated',
          timestamp: Date.now() - 1000 * 60 * 45,
          isWarning: true,
        },
        {
          id: '5',
          type: 'script',
          source: 'finance-app',
          message: 'Uncaught ReferenceError: calculateTotal is not defined',
          url: 'https://finance.bellis.com.cn/js/finance.js',
          line: 89,
          column: 12,
          timestamp: Date.now() - 1000 * 60 * 60,
          isWarning: false,
        },
        {
          id: '6',
          type: 'resource',
          source: 'quality-app',
          message: 'Failed to load resource: 404 Not Found',
          url: 'https://quality.bellis.com.cn/images/logo.png',
          timestamp: Date.now() - 1000 * 60 * 90,
          isWarning: true,
        },
        {
          id: '7',
          type: 'unknown',
          source: 'engineering-app',
          message: 'Unknown error occurred',
          timestamp: Date.now() - 1000 * 60 * 120,
          isWarning: false,
        },
      ];
      setErrorList(mockErrors);
      setFilteredErrorList(mockErrors);
      setError(null);
    } catch (err) {
      setError('加载错误数据失败');
      console.error('加载错误数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadMockData();
  }, [loadMockData]);

  // 根据筛选条件过滤错误列表
  useEffect(() => {
    let filtered = [...errorList];

    // 来源筛选
    if (filterSource !== 'all') {
      filtered = filtered.filter((err) => err.source === filterSource);
    }

    // 类型筛选
    if (filterType === 'error') {
      filtered = filtered.filter((err) => !err.isWarning);
    } else if (filterType === 'warn') {
      filtered = filtered.filter((err) => err.isWarning);
    }

    // 按时间排序（最新的在前）
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    setFilteredErrorList(filtered);
  }, [errorList, filterSource, filterType]);

  // 清空错误列表
  const handleClearError = () => {
    setErrorList([]);
    setFilteredErrorList([]);
  };

  // 处理清理周期变化
  const handleCleanupPeriodChange = (value: string) => {
    setCleanupPeriod(value);
    console.log('清理周期设置为:', value);
  };

  // 刷新错误列表
  const handleRefresh = () => {
    loadMockData();
  };

  // 导出错误报告
  const handleExport = () => {
    const report = {
      exportTime: new Date().toISOString(),
      filterSource,
      filterType,
      totalErrors: filteredErrorList.length,
      errors: filteredErrorList,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // 表格列定义
  const columns: TableColumnsType<ErrorInfo> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      sorter: (a, b) => b.timestamp - a.timestamp,
      render: (timestamp: number) => {
        const date = new Date(timestamp);
        return (
          <Tooltip title={date.toLocaleString()}>
            <Text type="secondary">
              {date.toLocaleTimeString()}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string, record: ErrorInfo) => (
        <Space>
          {getErrorTypeIcon(type, record.isWarning)}
          <Text>{getErrorTypeDisplayName(type)}</Text>
        </Space>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 140,
      render: (source: string) => (
        <Tag color="blue">{getAppDisplayName(source)}</Tag>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      ellipsis: true,
      render: (url: string) => (
        url ? (
          <Tooltip title={url}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
  ];

  // 统计信息
  const errorCount = filteredErrorList.filter(e => !e.isWarning).length;
  const warnCount = filteredErrorList.filter(e => e.isWarning).length;

  return (
    <div className={styles.errorMonitor}>
      {/* 标题区域 */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          错误监控
        </Title>
        <Text type="secondary">
          实时监控前端错误，提供错误筛选、清理和导出功能
        </Text>
      </div>

      {/* 工具栏 */}
      <Card className={styles.toolbarCard}>
        <div className={styles.toolbar}>
          <Space wrap>
            <Badge count={errorCount} showZero color="#ff4d4f">
              <Tag color="error" className={styles.filterTag}>
                错误: {errorCount}
              </Tag>
            </Badge>
            <Badge count={warnCount} showZero color="#faad14">
              <Tag color="warning" className={styles.filterTag}>
                警告: {warnCount}
              </Tag>
            </Badge>
            <Badge count={filteredErrorList.length} showZero color="#1890ff">
              <Tag color="processing" className={styles.filterTag}>
                总计: {filteredErrorList.length}
              </Tag>
            </Badge>
          </Space>

          <Space wrap className={styles.toolbarActions}>
            <Select
              value={cleanupPeriod}
              onChange={handleCleanupPeriodChange}
              style={{ width: 140 }}
              placeholder="清理周期"
            >
              {CLEANUP_PERIOD_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>

            <Select
              value={filterSource}
              onChange={setFilterSource}
              style={{ width: 150 }}
              placeholder="来源筛选"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>

            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              placeholder="类型筛选"
            >
              <Option value="all">全部类型</Option>
              <Option value="error">仅错误</Option>
              <Option value="warn">仅警告</Option>
            </Select>

            <Tooltip title="导出错误报告">
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
                disabled={filteredErrorList.length === 0}
              >
                导出
              </Button>
            </Tooltip>

            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
            </Tooltip>

            <Tooltip title="清空错误列表">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearError}
                disabled={filteredErrorList.length === 0}
              >
                清空
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* 错误列表 */}
      <Card className={styles.tableCard}>
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" tip="加载错误数据..." />
          </div>
        ) : filteredErrorList.length === 0 ? (
          <Empty
            description={filterSource !== 'all' || filterType !== 'all' ? '筛选条件下没有错误' : '暂无错误记录'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredErrorList}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
            }}
            scroll={{ x: 1000, y: 'calc(100vh - 400px)' }}
            className={styles.errorTable}
          />
        )}
      </Card>
    </div>
  );
};

export default ErrorMonitor;
