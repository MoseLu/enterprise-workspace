import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Statistic, Table, Progress, List, Tag } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ServerOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import styles from './Home.module.scss';

const { Title, Text, Paragraph } = Typography;

/**
 * 运维概览首页组件
 *
 * 提供系统监控、错误统计、服务状态等仪表盘功能
 */
const Home: React.FC = () => {
  const navigate = useNavigate();

  // 模拟统计数据
  const stats = {
    totalErrors: 12,
    todayErrors: 5,
    resolvedErrors: 156,
    pendingErrors: 8,
    services: {
      running: 7,
      stopped: 1,
    },
  };

  // 最近错误列表
  const recentErrors = [
    { id: 1, type: 'error', message: '数据库连接超时', source: 'admin-app', time: '10:23:45' },
    { id: 2, type: 'warn', message: 'API响应时间过长', source: 'system-app', time: '10:20:12' },
    { id: 3, type: 'error', message: '内存使用率超过阈值', source: 'logistics-app', time: '10:15:33' },
    { id: 4, type: 'warn', message: '磁盘空间不足', source: 'production-app', time: '10:10:18' },
    { id: 5, type: 'error', message: '文件上传失败', source: 'quality-app', time: '10:05:44' },
  ];

  // 服务状态列表
  const services = [
    { name: '系统应用', key: 'system-app', status: 'running', uptime: '99.9%' },
    { name: '管理应用', key: 'admin-app', status: 'running', uptime: '99.8%' },
    { name: '物流应用', key: 'logistics-app', status: 'running', uptime: '99.5%' },
    { name: '质量应用', key: 'quality-app', status: 'stopped', uptime: '0%' },
    { name: '生产应用', key: 'production-app', status: 'running', uptime: '99.7%' },
    { name: '工程应用', key: 'engineering-app', status: 'running', uptime: '99.9%' },
    { name: '财务应用', key: 'finance-app', status: 'running', uptime: '99.6%' },
  ];

  // 错误类型分布数据
  const errorTypeDistribution = [
    { type: 'JavaScript 错误', count: 45 },
    { type: '资源加载错误', count: 23 },
    { type: 'Promise 错误', count: 18 },
    { type: 'API 请求错误', count: 12 },
    { type: '控制台警告', count: 8 },
  ];

  // 错误列表表格列定义
  const errorColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'error' ? 'error' : 'warning'}>
          {type === 'error' ? '错误' : '警告'}
        </Tag>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
    },
  ];

  // 服务状态表格列定义
  const serviceColumns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag
          icon={status === 'running' ? <CheckCircleOutlined /> : <WarningOutlined />}
          color={status === 'running' ? 'success' : 'error'}
        >
          {status === 'running' ? '运行中' : '已停止'}
        </Tag>
      ),
    },
    {
      title: '可用性',
      dataIndex: 'uptime',
      key: 'uptime',
      width: 100,
      render: (uptime: string) => (
        <Progress
          percent={parseFloat(uptime)}
          size="small"
          status={parseFloat(uptime) >= 99 ? 'success' : 'exception'}
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  return (
    <div className={styles.monitorHome}>
      {/* 标题区域 */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          运维概览
        </Title>
        <Paragraph className={styles.subtitle}>
          实时监控系统状态、错误监控和服务健康检查
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="今日错误"
              value={stats.todayErrors}
              prefix={<WarningOutlined className={styles.statIconError} />}
              suffix={
                <Text type="secondary" className={styles.statSuffix}>
                  / {stats.totalErrors} 总计
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="已解决"
              value={stats.resolvedErrors}
              prefix={<CheckCircleOutlined className={styles.statIconSuccess} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="待处理"
              value={stats.pendingErrors}
              prefix={<ClockCircleOutlined className={styles.statIconWarning} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="运行服务"
              value={stats.services.running}
              suffix={`/ ${stats.services.running + stats.services.stopped}`}
              prefix={<ServerOutlined className={styles.statIconInfo} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={[16, 16]} className={styles.contentRow}>
        {/* 服务状态 */}
        <Col xs={24} lg={14}>
          <Card
            title="服务状态"
            className={styles.serviceCard}
            extra={<a onClick={() => navigate('/deployment-test')}>部署测试</a>}
          >
            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="key"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 错误统计 */}
        <Col xs={24} lg={10}>
          <Card title="错误类型分布" className={styles.chartCard}>
            <List
              dataSource={errorTypeDistribution}
              renderItem={(item) => (
                <List.Item>
                  <div className={styles.chartListItem}>
                    <Text>{item.type}</Text>
                    <Progress
                      percent={(item.count / 100) * 100}
                      size="small"
                      format={() => item.count}
                      status="active"
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近错误 */}
      <Card
        title="最近错误"
        className={styles.errorCard}
        extra={<a onClick={() => navigate('/error-monitor')}>查看全部</a>}
      >
        <Table
          columns={errorColumns}
          dataSource={recentErrors}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Home;
