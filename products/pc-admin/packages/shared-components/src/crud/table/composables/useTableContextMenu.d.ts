import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';
/**
 * 鍙抽敭鑿滃崟澶勭悊锛堝榻?cool-admin table/helper/row.ts锛? */
export declare function useTableContextMenu(
  crud: UseCrudReturn<any>,
  props: TableProps,
  tableRef: any
): {
  contextMenuVisible: globalThis.Ref<boolean, boolean>;
  contextMenuStyle: globalThis.Ref<Record<string, any>, Record<string, any>>;
  contextMenuItems: globalThis.Ref<any[], any[]>;
  onRowContextMenu: (row: any, column: any, event: MouseEvent) => void;
  handleMenuClick: (item: any) => void;
};

