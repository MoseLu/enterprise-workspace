import React, { useState, useRef, useCallback } from 'react';
import type { TableColumnsType } from 'antd';
import {
  AppTable,
  Tag,
  Checkbox,
  Empty,
} from '@enterprise-workspace/frontend/shared';
import {
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import styles from './BtcActionTable.module.css';

interface BtcActionTableProps {
  mode: 'matrix' | 'compose';
  filteredActions: any[];
  matrixData: any[];
  actions: any[];
  selectedResources: number[];
  isActionSupported: (actionId: number) => boolean;
  getActionSupportCount: (actionId: number) => number;
  isPermissionChecked: (resourceId: number, actionId: number) => boolean;
  isActionSupportedByResource: (resourceId: number, actionId: number) => boolean;
  getMethodType: (method: string) => string;
  handleMatrixToggle: (resourceId: number, actionId: number, checked: boolean | string | number) => void;
  onActionSelectionChange?: (selection: any[]) => void;
}

const getActionIcon = (actionCode: string, size: number = 18) => {
  const iconStyle = { fontSize: size };
  switch (actionCode) {
    case 'view':
      return <EyeOutlined style={{ ...iconStyle, color: 'var(--color-success)' }} />;
    case 'create':
      return <PlusOutlined style={{ ...iconStyle, color: 'var(--color-primary)' }} />;
    case 'edit':
      return <EditOutlined style={{ ...iconStyle, color: 'var(--color-warning)' }} />;
    case 'delete':
      return <DeleteOutlined style={{ ...iconStyle, color: 'var(--color-danger)' }} />;
    default:
      return <SettingOutlined style={iconStyle} />;
  }
};

export const BtcActionTable: React.FC<BtcActionTableProps> & {
  displayName: string;
} = ({
  mode,
  filteredActions,
  matrixData,
  actions,
  selectedResources,
  isActionSupported,
  getActionSupportCount,
  isPermissionChecked,
  isActionSupportedByResource,
  getMethodType,
  handleMatrixToggle,
  onActionSelectionChange,
}) => {
  const tableRef = useRef<AppTableRef>(null);
  const [selection, setSelection] = useState<any[]>([]);

  const handleSelectionChange = useCallback((newSelection: any[]) => {
    setSelection(newSelection);
    onActionSelectionChange?.(newSelection);
  }, [onActionSelectionChange]);

  // Compose mode table columns
  const composeColumns: TableColumnsType<any> = [
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={isActionSupported(record.id)}
          disabled={!isActionSupported(record.id)}
        />
      ),
    },
    {
      title: '图标',
      width: 60,
      align: 'center',
      render: (_, record) => getActionIcon(record.actionCode),
    },
    {
      title: '名称',
      dataIndex: 'actionNameCn',
      width: 80,
    },
    {
      title: '编码',
      dataIndex: 'actionCode',
      minWidth: 100,
      render: (_, record) => (
        <code className={styles.actionCode}>{record.actionCode}</code>
      ),
    },
    {
      title: '方法',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tag
          type={getMethodType(record.httpMethod)}
          variant="plain"
          size="small"
        >
          {record.httpMethod}
        </Tag>
      ),
    },
  ];

  if (selectedResources.length > 1) {
    composeColumns.push({
      title: '支持度',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const supportCount = getActionSupportCount(record.id);
        const isFullSupported = supportCount === selectedResources.length;
        return (
          <Tag
            type={isFullSupported ? 'success' : 'warning'}
            variant="plain"
            size="small"
          >
            {supportCount}/{selectedResources.length}
          </Tag>
        );
      },
    });
  }

  // Matrix mode columns
  const matrixColumns: TableColumnsType<any> = [
    {
      title: '资源',
      dataIndex: 'resourceNameCn',
      width: 220,
      fixed: 'left',
      align: 'center',
      render: (_, record) => (
        <div className={styles.matrixResource}>
          <FolderOpenOutlined style={{ fontSize: 16 }} />
          <span>{record.resourceNameCn}</span>
          {record.resourceCode && (
            <Tag type="info" size="small">
              {record.resourceCode}
            </Tag>
          )}
        </div>
      ),
    },
    ...actions.map((action) => ({
      title: (
        <div className={styles.matrixActionHeader}>
          {getActionIcon(action.actionCode, 16)}
          <span>{action.actionNameCn}</span>
        </div>
      ),
      dataIndex: `action_${action.id}`,
      align: 'center',
      render: (_: boolean, record: any) => (
        <Checkbox
          checked={isPermissionChecked(record.id, action.id)}
          disabled={!isActionSupportedByResource(record.id, action.id)}
          onChange={(e) => handleMatrixToggle(record.id, action.id, e.target.checked)}
        />
      ),
    })),
  ];

  return (
    <div className={styles.data}>
      <div className={styles.tableContainer}>
        {mode === 'compose' && (
          <AppTable
            ref={tableRef as React.RefObject<AppTableRef>}
            dataSource={filteredActions}
            columns={composeColumns}
            rowKey="id"
            pagination={false}
            className={styles.composeTable}
          />
        )}

        {mode === 'matrix' && matrixData.length === 0 && (
          <div className={styles.matrixEmpty}>
            <Empty
              description="请先选择资源"
              image={FolderOpenOutlined}
              imageSize={60}
            />
          </div>
        )}

        {mode === 'matrix' && matrixData.length > 0 && (
          <AppTable
            dataSource={matrixData}
            columns={matrixColumns}
            rowKey="id"
            pagination={false}
            className={styles.matrixTable}
            scroll={{ x: true }}
          />
        )}
      </div>
    </div>
  );
};

BtcActionTable.displayName = 'BtcActionTable';

export default BtcActionTable;
