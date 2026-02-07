import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Progress,
  Tag,
  Space,
  Typography,
  Modal,
  Descriptions,
  Badge,
  Tooltip,
  Alert,
  Empty,
  Spin,
  Divider,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  LoadingOutlined,
  WarningOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  startTest as startDeploymentTestAPI,
  getTestStatus as getDeploymentTestStatus,
  getTestReport as getDeploymentTestReport,
  downloadReport,
  TestConfig,
  TestStatus,
  TestResult,
  TestReport,
} from '../../../api/deployment-test';
import styles from './DeploymentTest.module.scss';

const { Title, Text, Paragraph } = Typography;

/**
 * 可用应用列表
 */
const AVAILABLE_APPS = [
  { name: 'system-app', label: '系统应用' },
  { name: 'admin-app', label: '管理应用' },
  { name: 'logistics-app', label: '物流应用' },
  { name: 'quality-app', label: '质量应用' },
  { name: 'production-app', label: '生产应用' },
  { name: 'engineering-app', label: '工程应用' },
  { name: 'finance-app', label: '财务应用' },
];

/**
 * 测试结果行数据
 */
interface TestResultRow {
  key: string;
  appName: string;
  domain: string;
  status: 'success' | 'failed';
  duration: number;
  errorCount: number;
  errors?: Array<{ type: string; message: string }>;
}

/**
 * 测试摘要
 */
interface TestSummary {
  total: number;
  passed: number;
  failed: number;
}

/**
 * 部署测试页面组件
 *
 * 提供 CI/CD 流水线测试界面，支持应用选择、测试执行、进度监控和结果查看
 */
const DeploymentTest: React.FC = () => {
  // 状态定义
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [testing, setTesting] = useState<boolean>(false);
  const [currentTestApp, setCurrentTestApp] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<'success' | 'exception' | 'warning' | ''>('');
  const [testResults, setTestResults] = useState<TestResultRow[]>([]);
  const [detailDialogVisible, setDetailDialogVisible] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testSummary, setTestSummary] = useState<TestSummary>({ total: 0, passed: 0, failed: 0 });

  // 测试配置
  const testConfig = useRef<TestConfig>({
    timeout: 30000,
    baseUrl: undefined,
  });

  // 轮询定时器引用
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // 计算通过率
  const passRate = React.useMemo(() => {
    if (testSummary.total === 0) return 0;
    return Math.round((testSummary.passed / testSummary.total) * 100);
  }, [testSummary]);

  // 获取应用标签
  const getAppLabel = useCallback((appName: string): string => {
    const app = AVAILABLE_APPS.find((a) => a.name === appName);
    return app?.label || appName;
  }, []);

  // 格式化时长
  const formatDuration = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }, []);

  // 处理表格选择变化
  const handleSelectionChange = useCallback((selectedRowKeys: React.Key[]) => {
    if (testing.valueOf()) return;
    setSelectedApps(selectedRowKeys as string[]);
  }, [testing]);

  // 开始测试
  const handleStartTest = useCallback(async () => {
    if (selectedApps.length === 0) {
      Modal.warning({
        title: '提示',
        content: '请至少选择一个应用进行测试',
      });
      return;
    }

    if (testing) {
      Modal.info({
        title: '提示',
        content: '测试正在进行中，请稍候...',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.info('[DeploymentTest] 开始测试，选中的应用:', selectedApps);
      setTesting(true);
      setTestResults([]);
      setProgressPercentage(0);
      setProgressStatus('');

      // 调用测试API
      console.info('[DeploymentTest] 调用 startDeploymentTestAPI...');
      const testId = await startDeploymentTestAPI({
        apps: selectedApps,
        timeout: testConfig.current.timeout,
        baseUrl: testConfig.current.baseUrl || undefined,
      });
      console.info('[DeploymentTest] 测试ID:', testId);

      // 开始轮询测试状态
      console.info('[DeploymentTest] 开始轮询测试状态...');
      startPolling(testId);
    } catch (err) {
      console.error('[DeploymentTest] 启动测试失败:', err);
      setError(err instanceof Error ? err.message : '启动测试失败');
      setTesting(false);
    } finally {
      setLoading(false);
    }
  }, [selectedApps, testing]);

  // 开始轮询测试状态
  const startPolling = useCallback((testId: string) => {
    const pollStatus = async () => {
      try {
        const status = await getDeploymentTestStatus(testId);
        console.info('[DeploymentTest] 测试状态:', status);

        if (status.status === 'completed') {
          stopPolling();

          // 获取测试结果
          const report = await getDeploymentTestReport(testId);
          const results: TestResultRow[] = report.apps
            ? Object.entries(report.apps).map(([appName, result]) => ({
                key: appName,
                appName,
                domain: result.config?.domain || '',
                status: result.success ? 'success' : 'failed',
                duration: result.duration || 0,
                errorCount: result.errors?.length || 0,
                errors: result.errors,
              }))
            : [];

          setTestResults(results);
          setProgressPercentage(100);
          setProgressStatus(testSummary.failed === 0 ? 'success' : 'exception');
          setTesting(false);
          setCurrentTestApp(null);

          // 更新摘要
          const passed = results.filter((r) => r.status === 'success').length;
          setTestSummary({
            total: results.length,
            passed,
            failed: results.length - passed,
          });
        } else if (status.status === 'running') {
          setProgressPercentage(Math.min(status.progress || 0, 99));
          setCurrentTestApp(status.currentApp || null);
        } else if (status.status === 'pending') {
          setProgressPercentage(0);
          setCurrentTestApp(null);
        } else if (status.status === 'failed') {
          stopPolling();
          setTesting(false);
          setError(status.error || '测试失败');
        }
      } catch (err) {
        console.error('检查测试状态失败:', err);
      }
    };

    // 立即检查一次
    pollStatus();

    // 每1秒检查一次
    pollingInterval.current = setInterval(pollStatus, 1000);
  }, []);

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // 停止测试
  const handleStopTest = useCallback(async () => {
    Modal.confirm({
      title: '确认停止',
      content: '确定要停止当前测试吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setTesting(false);
        setProgressPercentage(0);
        setCurrentTestApp(null);
        stopPolling();
      },
    });
  }, [stopPolling]);

  // 查看详情
  const handleViewDetails = useCallback((row: TestResultRow) => {
    const testResult: TestResult = {
      appName: row.appName,
      config: {
        domain: row.domain,
        description: '',
      },
      startTime: new Date().toISOString(),
      success: row.status === 'success',
      errors: row.errors || [],
      duration: row.duration,
    };
    setSelectedResult(testResult);
    setDetailDialogVisible(true);
  }, []);

  // 下载报告
  const handleDownloadReport = useCallback(async (row: TestResultRow) => {
    try {
      const testId = `test-${Date.now()}`;
      await downloadReport(testId, 'html');
    } catch (err) {
      console.error('下载报告失败:', err);
    }
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // 应用选择表格列定义
  const appColumns: TableColumnsType<typeof AVAILABLE_APPS[0]> = [
    {
      title: '应用名称',
      dataIndex: 'label',
      key: 'label',
      width: 180,
    },
    {
      title: '应用ID',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
  ];

  // 测试结果表格列定义
  const resultColumns: TableColumnsType<TestResultRow> = [
    {
      title: '应用',
      dataIndex: 'appName',
      key: 'appName',
      width: 150,
      render: (appName: string) => getAppLabel(appName),
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      width: 220,
      render: (domain: string) => (
        <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
          {domain}
        </a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag
          icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={status === 'success' ? 'success' : 'error'}
        >
          {status === 'success' ? '通过' : '失败'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: number) => (
        <Text code>{formatDuration(duration)}</Text>
      ),
    },
    {
      title: '错误数',
      dataIndex: 'errorCount',
      key: 'errorCount',
      width: 100,
      render: (errorCount: number) => (
        <Badge
          count={errorCount}
          showZero
          style={{ backgroundColor: errorCount > 0 ? '#ff4d4f' : '#52c41a' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: TestResultRow) => (
        <Space split={<Divider type="vertical" />}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadReport(record)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.deploymentTest}>
      {/* 标题区域 */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          <RocketOutlined /> 部署测试
        </Title>
        <Paragraph type="secondary">
          多应用部署自动化测试平台，验证各应用的可用性和资源完整性
        </Paragraph>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert
          message="测试错误"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 应用选择 */}
      <Card
        title="测试配置"
        className={styles.appSelectCard}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartTest}
              loading={loading}
              disabled={testing || selectedApps.length === 0}
            >
              {testing ? '测试中...' : '开始测试'}
            </Button>
            {testing && (
              <Button
                danger
                icon={<PauseCircleOutlined />}
                onClick={handleStopTest}
              >
                停止测试
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={appColumns}
          dataSource={AVAILABLE_APPS}
          rowKey="name"
          pagination={false}
          size="small"
          rowSelection={{
            selectedRowKeys: selectedApps,
            onChange: handleSelectionChange,
            getCheckboxProps: (record) => ({
              disabled: testing,
            }),
          }}
          className={styles.appTable}
        />
      </Card>

      {/* 测试进度 */}
      {(testing || testResults.length > 0) && (
        <Card className={styles.progressCard}>
          <div className={styles.progressInfo}>
            <Progress
              percent={progressPercentage}
              status={progressStatus || (testing ? 'active' : 'normal')}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={() => `${progressPercentage}%`}
            />

            {testing && (
              <div className={styles.progressDetails}>
                <Spin indicator={<LoadingOutlined spin />} />
                <Text className={styles.progressText}>
                  {currentTestApp
                    ? `正在测试: ${getAppLabel(currentTestApp)}`
                    : '准备中...'}
                </Text>
                <Text type="secondary" className={styles.progressStats}>
                  {testResults.length} / {selectedApps.length} 个应用
                </Text>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card title="测试结果" className={styles.resultsCard}>
          <Table
            columns={resultColumns}
            dataSource={testResults}
            rowKey="key"
            pagination={false}
            scroll={{ x: 1000 }}
          />

          {/* 测试摘要 */}
          <div className={styles.summarySection}>
            <Title level={4}>测试摘要</Title>
            <div className={styles.summaryStats}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>总计</div>
                <div className={styles.summaryValue}>{testSummary.total}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>通过</div>
                <div className={`${styles.summaryValue} ${styles.success}`}>{testSummary.passed}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>失败</div>
                <div className={`${styles.summaryValue} ${styles.failed}`}>{testSummary.failed}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>通过率</div>
                <div
                  className={`${styles.summaryValue} ${passRate >= 80 ? styles.highRate : styles.lowRate}`}
                >
                  {passRate}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 详情对话框 */}
      <Modal
        title="测试详情"
        open={detailDialogVisible}
        onCancel={() => setDetailDialogVisible(false)}
        footer={null}
        width="80%"
        className={styles.detailsModal}
      >
        {selectedResult && (
          <div className={styles.detailsContent}>
            <div className={styles.detailHeader}>
              <Title level={4}>{getAppLabel(selectedResult.appName)}</Title>
              <Tag
                icon={selectedResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={selectedResult.success ? 'success' : 'error'}
                className={styles.detailTag}
              >
                {selectedResult.success ? '通过' : '失败'}
              </Tag>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="域名">
                <a href={`https://${selectedResult.config.domain}`} target="_blank" rel="noopener noreferrer">
                  {selectedResult.config.domain}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="耗时">
                {formatDuration(selectedResult.duration)}
              </Descriptions.Item>
            </Descriptions>

            {selectedResult.errors && selectedResult.errors.length > 0 ? (
              <div className={styles.errorsSection}>
                <Title level={5}>
                  <WarningOutlined className={styles.errorIcon} />
                  错误列表 ({selectedResult.errors.length})
                </Title>
                <Table
                  dataSource={selectedResult.errors}
                  columns={[
                    { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
                    { title: '信息', dataIndex: 'message', key: 'message', ellipsis: true },
                  ]}
                  rowKey="type"
                  pagination={false}
                  size="small"
                />
              </div>
            ) : (
              <Empty description="无错误" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeploymentTest;
