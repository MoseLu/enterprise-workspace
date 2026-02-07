import React from 'react';
import { Button } from '@enterprise-workspace/frontend/shared';
import styles from './BtcFileActionsCell.module.scss';

export interface BtcFileActionsCellRow {
  [key: string]: unknown;
}

export interface BtcFileActionsCellProps {
  row: BtcFileActionsCellRow;
  onShare?: (row: BtcFileActionsCellRow) => void;
  onDetail?: (row: BtcFileActionsCellRow) => void;
  onDelete?: (row: BtcFileActionsCellRow) => void;
}

export const BtcFileActionsCell: React.FC<BtcFileActionsCellProps> = ({
  row,
  onShare,
  onDetail,
  onDelete,
}) => {
  const handleShare = () => {
    onShare?.(row);
  };

  const handleDetail = () => {
    onDetail?.(row);
  };

  const handleDelete = () => {
    onDelete?.(row);
  };

  return (
    <div className={styles.tableOp}>
      <Button type="link" onClick={handleShare} danger={false}>
        分享
      </Button>
      <Button type="link" onClick={handleDetail} danger={false}>
        详情
      </Button>
      <Button type="link" onClick={handleDelete} danger>
        删除
      </Button>
    </div>
  );
};
