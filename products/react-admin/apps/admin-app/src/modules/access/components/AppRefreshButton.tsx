/**
 * AppRefreshButton - Refresh Button Component
 * React Admin - Access Control Module
 */

import React, { useCallback } from 'react';
import { Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface AppRefreshButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
}

export const AppRefreshButton: React.FC<AppRefreshButtonProps> & {
  displayName: string;
} = ({ onClick, children = '刷新', loading }) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Button icon={<ReloadOutlined />} onClick={handleClick} loading={loading}>
      {children}
    </Button>
  );
};

AppRefreshButton.displayName = 'AppRefreshButton';

export default AppRefreshButton;
