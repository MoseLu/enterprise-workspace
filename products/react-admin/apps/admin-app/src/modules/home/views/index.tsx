/**
 * Admin Home Page
 *
 * Strategy monitoring chart analysis dashboard.
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/home/views/index.vue)
 * to React + TypeScript + Ant Design
 */

import React from 'react';
import { Card, Row, Col } from 'antd';
import type { ReactNode } from 'react';
import styles from './index.module.css';

export interface AdminHomeProps {
  /** Gap between charts */
  gap?: number;
  /** Number of columns per row */
  colsPerRow?: number;
  /** Chart height */
  chartHeight?: string;
}

interface ChartItem {
  id: string;
  title: string;
  content: ReactNode;
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
        <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Chart Component Placeholder 1
        </div>
      ),
    },
    {
      id: 'chart-2',
      title: '策略监控 - 图表 2',
      content: (
        <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Chart Component Placeholder 2
        </div>
      ),
    },
    {
      id: 'chart-3',
      title: '策略监控 - 图表 3',
      content: (
        <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Chart Component Placeholder 3
        </div>
      ),
    },
    {
      id: 'chart-4',
      title: '策略监控 - 图表 4',
      content: (
        <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
 * AdminHome - Main Home Page Component
 *
 * Displays strategy monitoring charts and analysis dashboard.
 */
export const AdminHome: React.FC<AdminHomeProps> = ({
  gap = 10,
  colsPerRow = 2,
  chartHeight = '300px',
}) => {
  return (
    <div className={styles.page}>
      {/* 策略监控图表分析 */}
      <div className={styles.strategyCharts}>
        <ChartGallery
          gap={gap}
          colsPerRow={colsPerRow}
          chartHeight={chartHeight}
        />
      </div>
    </div>
  );
};

AdminHome.displayName = 'AdminHome';

export default AdminHome;
