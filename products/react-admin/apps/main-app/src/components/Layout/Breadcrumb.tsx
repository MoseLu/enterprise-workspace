import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import styles from './Breadcrumb.module.scss';

interface BreadcrumbItem {
  label: string;
  icon?: React.ReactNode;
  path?: string;
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  home: <HomeOutlined />,
  setting: <SettingOutlined />,
  user: <UserOutlined />,
  dashboard: <DashboardOutlined />,
};

/**
 * 面包屑导航组件
 */
export const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  const [breadcrumbList, setBreadcrumbList] = useState<BreadcrumbItem[]>([]);

  // 模拟面包屑数据（实际项目中应从 store 或 manifest 获取）
  useEffect(() => {
    const path = location.pathname;
    const items: BreadcrumbItem[] = [];

    // 首页
    items.push({
      label: '首页',
      icon: <HomeOutlined />,
      path: '/',
    });

    // 根据路径生成面包屑
    if (path !== '/') {
      const pathParts = path.split('/').filter(Boolean);

      if (pathParts.length > 0) {
        // 系统管理
        if (pathParts[0] === 'system') {
          items.push({
            label: '系统管理',
            icon: <SettingOutlined />,
            path: '/system',
          });

          if (pathParts.length > 1) {
            items.push({
              label: pathParts[1] === 'users' ? '用户管理' : pathParts[1],
              icon: <UserOutlined />,
              path: `/system/${pathParts[1]}`,
            });
          }
        }
        // 物流应用
        else if (pathParts[0] === 'logistics') {
          items.push({
            label: '物流应用',
            icon: <DashboardOutlined />,
            path: '/logistics',
          });

          if (pathParts.length > 1) {
            items.push({
              label: pathParts[1],
              icon: <DashboardOutlined />,
              path: `/logistics/${pathParts[1]}`,
            });
          }
        }
        // 其他应用
        else {
          const appNames: Record<string, string> = {
            admin: 'admin 应用',
            engineering: '工程应用',
            quality: '品质应用',
            production: '生产应用',
            finance: '财务应用',
            operations: '运维应用',
            docs: '文档应用',
            dashboard: '图表应用',
            personnel: '人事应用',
          };

          items.push({
            label: appNames[pathParts[0]] || pathParts[0],
            icon: <DashboardOutlined />,
            path: `/${pathParts[0]}`,
          });

          if (pathParts.length > 1) {
            items.push({
              label: pathParts[1],
              icon: <DashboardOutlined />,
              path: `/${pathParts[0]}/${pathParts[1]}`,
            });
          }
        }
      }
    }

    setBreadcrumbList(items);
  }, [location.pathname]);

  return (
    <div className={styles.breadcrumbContainer}>
      <Breadcrumb
        items={breadcrumbList.map((item) => ({
          href: item.path,
          title: (
            <span className={styles.breadcrumbItem}>
              {item.icon && (
                <span className={styles.icon}>{item.icon}</span>
              )}
              <span>{item.label}</span>
            </span>
          ),
        }))}
        separator="|"
        className={styles.breadcrumb}
      />
    </div>
  );
};

// 简单的面包屑包装组件，提供更好的样式控制
export const BreadcrumbWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className={styles.wrapper}>{children}</div>;
};

export default AppBreadcrumb;
