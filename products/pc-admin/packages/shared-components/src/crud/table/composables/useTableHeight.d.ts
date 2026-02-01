import { type Ref } from 'vue';
import type { TableProps } from '../types';
/**
 * 琛ㄦ牸楂樺害鑷姩璁＄畻锛堝榻?cool-admin table/helper/height.ts锛? */
export declare function useTableHeight(props: TableProps, tableRef: Ref): {
    maxHeight: Ref<number | undefined, number | undefined>;
    calcMaxHeight: () => void;
};

