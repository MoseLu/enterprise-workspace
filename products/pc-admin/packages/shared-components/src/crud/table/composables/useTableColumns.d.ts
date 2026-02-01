import type { TableProps } from '../types';
/**
 * 琛ㄦ牸鍒楅厤缃鐞? */
export declare function useTableColumns(props: TableProps): {
    computedColumns: globalThis.ComputedRef<any[]>;
    formatDictValue: (value: any, dict: any[], allLevels?: boolean) => string;
};

