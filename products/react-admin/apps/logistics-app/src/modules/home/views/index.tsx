/**
 * Logistics Home Page
 *
 * Dashboard overview page for logistics application containing:
 * - Strategy monitoring chart analysis
 * - Statistics cards
 * - Quick navigation
 *
 * Migrated from Vue3 (products/pc-admin/apps/logistics-app/src/modules/home/views/index.vue)
 * to React + TypeScript + Ant Design
 */

import React from 'react';
import { Card, Row, Col, Statistic, List, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import styles from './index.module.css';

const { Title, Text } = Typography;

/**
 * Props interface for HomePage component
 */
interface HomePageProps {
  /** Gap between charts */
  gap?: number;
  /** Number of columns per row */
  colsPerRow?: number;
  /** Chart height */
  chartHeight?: string;
}

/**
 * Chart item interface
 */
interface ChartItem {
  id: string;
  title: string;
  content: ReactNode;
}

/**
 * Statistics data interface
 */
interface StatItem {
  key: string;
  label: string;
  value: number;
  trend: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Quick navigation item interface
 */
interface NavItem {
  key: string;
  icon: ReactNode;
  label: string;
  path?: string;
}

/**
 * ChartGallery - Placeholder component for BtcChartGallery
 *
 * This component provides a grid layout for displaying charts.
 * Replace with actual @enterprise-workspace/frontend chart components when available.
 */
interface ChartGalleryProps {
  gap?: number;
  colsPerRow?: number;
  chartHeight?: string;
  className?: string;
}

const ChartGallery: React.FC<ChartGalleryProps> = ({
  gap = 10,
  colsPerRow = 2,
  chartHeight = '300px',
  className = '',
}) => {
  // Placeholder chart data - replace with actual chart components
  const chartItems: ChartItem[] = [
    {
      id: 'chart-1',
      title: '策略监控 - 图表 1',
      content: (
        <div
          style={{
            height: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          Chart Component Placeholder 1
        </div>
      ),
    },
    {
      id: 'chart-2',
      title: '策略监控 - 图表 2',
      content: (
        <div
          style={{
            height: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          Chart Component Placeholder 2
        </div>
      ),
    },
    {
      id: 'chart-3',
      title: '策略监控 - 图表 3',
      content: (
        <div
          style={{
            height: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          Chart Component Placeholder 3
        </div>
      ),
    },
    {
      id: 'chart-4',
      title: '策略监控 - 图表 4',
      content: (
        <div
          style={{
            height: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          Chart Component Placeholder 4
        </div>
      ),
    },
  ];

  const spanValue = Math.floor(24 / (colsPerRow || 1));

  return (
    <div className={`${styles.chartGallery} ${className}`}>
      <Row gutter={[gap, gap]}>
        {chartItems.map((item) => (
          <Col key={item.id} span={spanValue}>
            <Card
              title={item.title}
              className={styles.chartItem}
              style={{ height: '100%' }}
            >
              {item.content}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

/**
 * StatisticsCard - Component for displaying statistics
 */
interface StatisticsCardProps {
  stats: StatItem[];
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ stats }) => {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat) => (
        <Card key={stat.key} className={styles.statCard}>
          <Statistic
            title={stat.label}
            value={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            valueStyle={{ color: '#333' }}
          />
          <div
            className={`${styles.statTrend} ${
              stat.trend >= 0 ? styles.positive : styles.negative
            }`}
          >
            {stat.trend >= 0 ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )}
            <span>{Math.abs(stat.trend)}% 较上周</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * QuickNavigation - Component for quick access navigation
 */
interface QuickNavigationProps {
  items: NavItem[];
}

const QuickNavigation: React.FC<QuickNavigationProps> = ({ items }) => {
  return (
    <div className={styles.quickNav}>
      {items.map((item) => (
        <div key={item.key} className={styles.navItem}>
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * HomePage - Main Home Page Component
 *
 * Displays strategy monitoring charts and analysis dashboard.
 */
export const HomePage: React.FC<HomePageProps> = ({
  gap = 10,
  colsPerRow = 2,
  chartHeight = '300px',
}) => {
  // Statistics data
  const statisticsData: StatItem[] = [
    { key: 'orders', label: '今日订单', value: 128, trend: 12.5 },
    { key: 'shipments', label: '发货量', value: 856, trend: 8.3 },
    { key: 'warehouses', label: '仓库数量', value: 12, trend: 0 },
    { key: 'customs', label: '报关单数', value: 45, trend: -2.1 },
  ];

  // Quick navigation data
  const quickNavItems: NavItem[] = [
    { key: 'orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
    { key: 'warehouse', icon: <EnvironmentOutlined />, label: '仓储管理' },
    { key: 'customs', icon: <BankOutlined />, label: '报关管理' },
    { key: 'reports', icon: <FileTextOutlined />, label: '报表中心' },
  ];

  return (
    <div className={styles.page}>
      {/* Welcome banner */}
      <Card className={styles.welcomeBanner}>
        <Title level={4} className={styles.welcomeTitle}>
          欢迎使用物流管理系统
        </Title>
        <Text className={styles.welcomeSubtitle}>
          实时监控物流运营数据，优化供应链效率
        </Text>
      </Card>

      {/* Statistics section */}
      <Card title="运营概览">
        <StatisticsCard stats={statisticsData} />
      </Card>

      {/* Quick navigation */}
      <Card title="快捷入口">
        <QuickNavigation items={quickNavItems} />
      </Card>

      {/* Strategy monitoring charts */}
      <Card title="策略监控">
        <div className={styles.strategyCharts}>
          <ChartGallery
            gap={gap}
            colsPerRow={colsPerRow}
            chartHeight={chartHeight}
          />
        </div>
      </Card>
    </div>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
