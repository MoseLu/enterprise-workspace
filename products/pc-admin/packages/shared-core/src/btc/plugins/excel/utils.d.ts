import * as XLSX from 'xlsx';
export interface ExportExcelOptions {
    /** 多级表头 */
    multiHeader?: string[][];
    /** 表头 */
    header: string[];
    /** 数据 */
    data: any[][];
    /** 文件名（不含扩展名） */
    filename?: string;
    /** 合并单元格配置（如 ['A1:B1']） */
    merges?: string[];
    /** 是否自动列宽 */
    autoWidth?: boolean;
    /** 文件类型 */
    bookType?: XLSX.BookType;
    /** 字段配置（用于时间格式化） */
    fields?: Array<{
        prop: string;
        label: string;
    }>;
    /** 原始数据（用于时间格式化） */
    rawData?: any[];
}
/**
 * 导出 JSON 数据为 Excel
 */
export declare function exportJsonToExcel(options: ExportExcelOptions): void;
/**
 * 从表格列配置和原始数据导出Excel（自动处理时间格式化）
 */
export declare function exportTableToExcel(options: {
    columns: Array<{
        prop?: string;
        label?: string;
    }>;
    data: any[];
    filename?: string;
    autoWidth?: boolean;
    bookType?: XLSX.BookType;
}): void;
//# sourceMappingURL=utils.d.ts.map