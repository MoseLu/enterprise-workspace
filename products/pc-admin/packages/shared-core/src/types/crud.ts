/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CRUD 琛ㄦ牸鍒楅厤缃? */
export interface CrudColumn {
  prop: string;
  label: string;
  width?: number;
  formatter?: (row: any) => string;
  dict?: string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

/**
 * CRUD 閰嶇疆
 */
export interface CrudConfig {
  service: any;
  table: {
    columns: CrudColumn[];
    rowKey?: string;
    selection?: boolean;
  };
  search?: {
    items: any[];
  };
  upsert?: {
    items: any[];
  };
}

/**
 * CRUD 鎿嶄綔鎸夐挳閰嶇疆
 */
export interface CrudOperation {
  label: string;
  type?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: string;
  onClick: (row?: any) => void;
  permission?: string;
}


