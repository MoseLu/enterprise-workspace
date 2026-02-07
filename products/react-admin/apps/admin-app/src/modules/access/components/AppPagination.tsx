/**
 * AppPagination - Pagination Component
 * React Admin - Access Control Module
 *
 * Wraps Ant Design Pagination with common configurations.
 */

import React, { useCallback } from 'react';
import { Pagination as AntdPagination, ConfigProvider } from 'antd';

interface AppPaginationProps {
  current?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  className?: string;
  simple?: boolean;
  size?: 'small' | 'default';
}

export const AppPagination: React.FC<AppPaginationProps> & {
  displayName: string;
} = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  className,
  simple = false,
  size = 'default',
}) => {
  const handleChange = useCallback((page: number, newPageSize: number) => {
    onChange?.(page, newPageSize);
  }, [onChange]);

  const renderTotal = useCallback((total: number, range: [number, number]) => {
    return `共 ${total} 条`;
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AntdPagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={handleChange}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={showTotal ? renderTotal : false}
        className={className}
        simple={simple}
        size={size}
      />
    </ConfigProvider>
  );
};

AppPagination.displayName = 'AppPagination';

export default AppPagination;
