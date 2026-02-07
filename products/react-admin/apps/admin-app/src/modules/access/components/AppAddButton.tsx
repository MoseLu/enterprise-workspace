/**
 * AppAddButton - Add Button Component
 * React Admin - Access Control Module
 */

import React, { useCallback } from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface AppAddButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export const AppAddButton: React.FC<AppAddButtonProps> & {
  displayName: string;
} = ({ onClick, children = '新增', disabled, loading }) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={handleClick} disabled={disabled} loading={loading}>
      {children}
    </Button>
  );
};

AppAddButton.displayName = 'AppAddButton';

export default AppAddButton;
