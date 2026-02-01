export interface BtcImportExportGroupProps {
  /** 导出文件名（必填，用于导出和导入文件名匹配） */
  exportFilename: string;
  /** 禁止的文件名关键词（可选，默认：['SysPro', 'BOM表', '(', ')', '（', '）']） */
  forbiddenKeywords?: string[];
  /** 导入相关配置 */
  /** 导入按钮的列配置（可选，如果不提供则从 CRUD 上下文获取） */
  importColumns?: import('../table/types').TableColumn[];
  /** 导入提交处理函数 */
  onImportSubmit?: (data: any, options: { done: () => void; close: () => void }) => void | Promise<void>;
  /** 导入提示文本 */
  importTips?: string;
  /** 导入模板下载地址 */
  importTemplate?: string;
  /** 导入文件大小限制（MB） */
  importLimitSize?: number;
  /** 导入按钮类型 */
  importButtonType?: 'default' | 'success' | 'warning' | 'info' | 'text' | 'primary' | 'danger';
  /** 导入变更事件 */
  onImportChange?: (data: any[]) => void;
  /** 文件名校验事件 */
  onFilenameValidate?: (isValid: boolean) => void;
  /** 导出相关配置 */
  /** 导出按钮的列配置（可选，如果不提供则从 CRUD 上下文获取） */
  exportColumns?: import('../table/types').TableColumn[];
  /** 导出数据（可选，如果不提供则从 CRUD 上下文获取） */
  exportData?: any[];
  /** 导出是否自动列宽 */
  exportAutoWidth?: boolean;
  /** 导出文件类型 */
  exportBookType?: 'xlsx' | 'xls';
  /** 导出最大条数限制 */
  exportMaxLimit?: number;
  /** 导出按钮文本 */
  exportButtonText?: string;
  /** 是否禁用导入按钮 */
  disabled?: boolean;
}
