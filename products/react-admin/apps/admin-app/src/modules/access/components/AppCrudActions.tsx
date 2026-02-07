/**
 * AppCrudActions - Actions Column Component
 * React Admin - Access Control Module
 *
 * Renders action buttons in table rows.
 */

import React, { useCallback } from 'react';
import { Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  confirm?: boolean;
  confirmTitle?: string;
  onClick: (record: Record<string, unknown>) => void;
}

interface AppCrudActionsProps {
  actions?: ActionItem[];
  record?: Record<string, unknown>;
  width?: number;
  onEdit?: (record: Record<string, unknown>) => void;
  onDelete?: (record: Record<string, unknown>) => void;
  onView?: (record: Record<string, unknown>) => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  editText?: string;
  deleteText?: string;
  viewText?: string;
  editConfirmTitle?: string;
  deleteConfirmTitle?: string;
}

export const AppCrudActions: React.FC<AppCrudActionsProps> & {
  displayName: string;
} = ({
  actions,
  record,
  width = 160,
  onEdit,
  onDelete,
  onView,
  showEdit = true,
  showDelete = true,
  showView = false,
  editText = '编辑',
  deleteText = '删除',
  viewText = '查看',
  editConfirmTitle = '确认编辑',
  deleteConfirmTitle = '确认删除',
}) => {
  const handleEdit = useCallback(() => {
    if (record) {
      onEdit?.(record);
    }
  }, [record, onEdit]);

  const handleDelete = useCallback(() => {
    if (record) {
      onDelete?.(record);
    }
  }, [record, onDelete]);

  const handleView = useCallback(() => {
    if (record) {
      onView?.(record);
    }
  }, [record, onView]);

  // If custom actions are provided
  if (actions && actions.length > 0) {
    return (
      <Space size="small">
        {actions.map((action) => {
          const button = (
            <Button
              key={action.key}
              type="link"
              danger={action.danger}
              disabled={action.disabled}
              onClick={() => action.onClick(record!)}
              icon={action.icon}
            >
              {action.label}
            </Button>
          );

          if (action.confirm) {
            return (
              <Popconfirm
                key={action.key}
                title={action.confirmTitle || '确认操作'}
                onConfirm={() => action.onClick(record!)}
              >
                {button}
              </Popconfirm>
            );
          }

          return button;
        })}
      </Space>
    );
  }

  // Default action buttons
  return (
    <Space size="small" style={{ width }}>
      {showView && (
        <Button type="link" size="small" onClick={handleView} icon={<EyeOutlined />}>
          {viewText}
        </Button>
      )}
      {showEdit && (
        <Button type="link" size="small" onClick={handleEdit} icon={<EditOutlined />}>
          {editText}
        </Button>
      )}
      {showDelete && (
        <Popconfirm title={deleteConfirmTitle} onConfirm={handleDelete}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            {deleteText}
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
};

AppCrudActions.displayName = 'AppCrudActions';

export default AppCrudActions;
