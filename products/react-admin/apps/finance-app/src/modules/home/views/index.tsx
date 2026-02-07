import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Progress, List, Space } from 'antd';
import {
  DollarOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  AccountBookOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
  BankOutlined,
} from '@ant-design/icons';
import styles from './index.module.scss';

const { Title, Text, Paragraph } = Typography;

/**
 * 财务首页组件
 *
 * 提供财务数据概览、关键指标和业务数据展示
 */
const FinanceHome: React.FC = () => {
  const navigate = useNavigate();

  // 关键财务指标
  const financialMetrics = {
    totalRevenue: 1250000,
    totalExpenses: 980000,
    netProfit: 270000,
    profitMargin: 21.6,
    accountsReceivable: 450000,
    accountsPayable: 320000,
  };

  // 收入趋势数据
  const revenueTrend = [
    { month: '1月', revenue: 180000, expenses: 140000 },
    { month: '2月', revenue: 210000, expenses: 160000 },
    { month: '3月', revenue: 195000, expenses: 155000 },
    { month: '4月', revenue: 220000, expenses: 170000 },
    { month: '5月', revenue: 240000, expenses: 175000 },
    { month: '6月', revenue: 205000, expenses: 180000 },
  ];

  // 最近交易
  const recentTransactions = [
    { id: 'TXN001', type: '收入', description: '销售订单 #SO-2024-001', amount: 15000, date: '2024-06-15' },
    { id: 'TXN002', type: '支出', description: '采购订单 #PO-2024-015', amount: -8500, date: '2024-06-14' },
    { id: 'TXN003', type: '收入', description: '服务费收入 #SV-2024-008', amount: 25000, date: '2024-06-13' },
    { id: 'TXN004', type: '支出', description: '设备采购 #EQ-2024-003', amount: -45000, date: '2024-06-12' },
    { id: 'TXN005', type: '收入', description: '订单回款 #AR-2024-012', amount: 32000, date: '2024-06-11' },
  ];

  // 待处理事项
  const pendingItems = [
    { id: 1, type: 'invoice', title: '待开票', count: 12, priority: 'high' },
    { id: 2, type: 'payment', title: '待付款', count: 8, priority: 'medium' },
    { id: 3, type: 'receipt', title: '待收款', count: 5, priority: 'low' },
    { id: 4, type: 'report', title: '待审核报表', count: 3, priority: 'medium' },
  ];

  // 交易记录表格列定义
  const transactionColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '交易ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === '收入' ? 'success' : 'error'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <Text
          strong
          style={{ color: amount >= 0 ? '#52c41a' : '#ff4d4f' }}
        >
          {amount >= 0 ? '+' : ''}{amount.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })}
        </Text>
      ),
    },
  ];

  // 收入趋势表格列定义
  const trendColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
    },
    {
      title: '收入',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      render: (value: number) => (
        <Text type="success">{value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })}</Text>
      ),
    },
    {
      title: '支出',
      dataIndex: 'expenses',
      key: 'expenses',
      width: 120,
      render: (value: number) => (
        <Text type="danger">{value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })}</Text>
      ),
    },
    {
      title: '净利润',
      key: 'netProfit',
      width: 140,
      render: (_: unknown, record: typeof revenueTrend[0]) => {
        const netProfit = record.revenue - record.expenses;
        return (
          <Text type={netProfit >= 0 ? 'success' : 'danger'}>
            {netProfit.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })}
          </Text>
        );
      },
    },
  ];

  return (
    <div className={styles.financeHome}>
      {/* 标题区域 */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          <BankOutlined /> 财务概览
        </Title>
        <Paragraph type="secondary">
          财务管理驾驶舱，实时监控财务关键指标和业务数据
        </Paragraph>
      </div>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} className={styles.metricsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.metricCard}>
            <Statistic
              title="总收入"
              value={financialMetrics.totalRevenue}
              prefix={<DollarOutlined className={styles.metricIconRevenue} />}
              suffix="元"
              precision={0}
            />
            <div className={styles.metricTrend}>
              <RiseOutlined className={styles.trendUp} />
              <Text type="secondary">较上月 +12.5%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.metricCard}>
            <Statistic
              title="总支出"
              value={financialMetrics.totalExpenses}
              prefix={<WalletOutlined className={styles.metricIconExpense} />}
              suffix="元"
              precision={0}
            />
            <div className={styles.metricTrend}>
              <FallOutlined className={styles.trendDown} />
              <Text type="secondary">较上月 +5.2%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.metricCard}>
            <Statistic
              title="净利润"
              value={financialMetrics.netProfit}
              prefix={<AccountBookOutlined className={styles.metricIconProfit} />}
              suffix="元"
              precision={0}
            />
            <div className={styles.metricTrend}>
              <RiseOutlined className={styles.trendUp} />
              <Text type="secondary">较上月 +18.3%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.metricCard}>
            <Statistic
              title="利润率"
              value={financialMetrics.profitMargin}
              prefix={<BarChartOutlined className={styles.metricIconMargin} />}
              suffix="%"
              precision={1}
            />
            <Progress
              percent={financialMetrics.profitMargin}
              showInfo={false}
              strokeColor="#52c41a"
              trailColor="#f0f0f0"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 待处理事项 */}
      <Card title="待处理事项" className={styles.pendingCard} extra={<a onClick={() => navigate('/inventory')}>查看全部</a>}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 4 }}
          dataSource={pendingItems}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                className={styles.pendingItemCard}
                onClick={() => console.log('Navigate to:', item.type)}
              >
                <div className={styles.pendingItem}>
                  <Text strong>{item.title}</Text>
                  <Tag color={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}>
                    {item.count} 项
                  </Tag>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {/* 收入趋势与交易记录 */}
      <Row gutter={[16, 16]} className={styles.contentRow}>
        <Col xs={24} lg={14}>
          <Card title="收入趋势" className={styles.trendCard}>
            <Table
              columns={trendColumns}
              dataSource={revenueTrend}
              rowKey="month"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最近交易" className={styles.transactionCard}>
            <Table
              columns={transactionColumns}
              dataSource={recentTransactions}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 应收账款与应付账款 */}
      <Row gutter={[16, 16]} className={styles.summaryRow}>
        <Col xs={24} sm={12}>
          <Card title="应收账款" className={styles.arCard}>
            <Statistic
              value={financialMetrics.accountsReceivable}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" className={styles.arSubtext}>
              30天内到期: ¥180,000
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="应付账款" className={styles.apCard}>
            <Statistic
              value={financialMetrics.accountsPayable}
              prefix={<WalletOutlined />}
              suffix="元"
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary" className={styles.apSubtext}>
              30天内到期: ¥120,000
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinanceHome;
