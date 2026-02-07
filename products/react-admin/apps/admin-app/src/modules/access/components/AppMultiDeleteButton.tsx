/**
 * AppMultiDeleteButton - Multi Delete Button Component
 * React Admin - Access Control Module
 */

import React, { useCallback } from 'react';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface AppMultiDeleteButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  confirmTitle?: string;
  confirmContent?: string;
}

export const AppMultiDeleteButton: React.FC<AppMultiDeleteButtonProps> & {
  displayName: string;
} = ({
  onClick,
  children = '批量删除',
  disabled,
  loading,
  confirmTitle = '确认删除',
  confirmContent = '确定要删除选中的数据吗？',
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const button = (
    <Button
      danger
      icon={<DeleteOutlined />}
      onClick={handleClick}
      disabled={disabled}
      loading={loading}
    >
      {children}
    </Button>
  );

  return (
    <Popconfirm title={confirmTitle} description={confirmContent} onConfirm={handleClick}>
      {button}
    </Popconfirm>
  );
};

AppMultiDeleteButton.displayName = 'AppMultiDeleteButton';

export default AppMultiDeleteButton;
