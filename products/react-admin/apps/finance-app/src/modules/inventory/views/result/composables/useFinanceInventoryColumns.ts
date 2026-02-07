import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';

export interface FinanceInventoryRecord {
  key: string;
  materialCode: string;
  position: string;
  unitCost: number;
  bookQty: number;
  actualQty: number;
  diffQty: number;
  varianceCost: number;
}

export function useFinanceInventoryColumns(): ColumnsType<FinanceInventoryRecord> {
  return useMemo(() => [
    { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode' },
    { title: '仓位', dataIndex: 'position', key: 'position', width: 80 },
    { title: '单位成本 ($)', dataIndex: 'unitCost', key: 'unitCost', width: 100, align: 'right' },
    { title: '账面数量', dataIndex: 'bookQty', key: 'bookQty', width: 100, align: 'right' },
    { title: '实际数量', dataIndex: 'actualQty', key: 'actualQty', width: 100, align: 'right' },
    { title: '差异数量', dataIndex: 'diffQty', key: 'diffQty', width: 100, align: 'right' },
    { title: '差异金额 ($)', dataIndex: 'varianceCost', key: 'varianceCost', width: 120, align: 'right' },
  ], []);
}
