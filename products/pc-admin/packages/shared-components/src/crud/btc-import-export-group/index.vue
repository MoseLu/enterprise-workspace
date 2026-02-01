<template>
  <div class="btc-import-export-group">
    <slot name="export">
      <BtcExportBtn
        v-bind="{
          ...(exportColumns !== undefined ? { columns: exportColumns } : {}),
          ...(exportData !== undefined ? { data: exportData } : {}),
          filename: exportFilenameComputed,
          ...(exportAutoWidth !== undefined ? { 'auto-width': exportAutoWidth } : {}),
          ...(exportBookType !== undefined ? { 'book-type': exportBookType } : {}),
          ...(exportMaxLimit !== undefined ? { 'max-export-limit': exportMaxLimit } : {}),
          ...(exportButtonText !== undefined ? { text: exportButtonText } : {})
        }"
      />
    </slot>
    <slot name="import">
      <BtcImportBtn
        v-bind="{
          ...(importColumns !== undefined ? { columns: importColumns } : {}),
          'on-submit': handleImport,
          ...(importTips !== undefined ? { tips: importTips } : {}),
          ...(importTemplate !== undefined ? { template: importTemplate } : {}),
          ...(importLimitSize !== undefined ? { 'limit-size': importLimitSize } : {}),
          ...(importButtonType !== undefined ? { type: importButtonType } : {}),
          ...(disabled !== undefined ? { disabled } : {})
        }"
        @change="handleImportChange"
        @validate-filename="handleFilenameValidate"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import type { TableColumn } from '../table/types';
import BtcImportBtn from '../btc-import-btn/index.vue';
import BtcExportBtn from '../../plugins/excel/components/export-btn/index.vue';
import { IMPORT_FILENAME_KEY, IMPORT_FORBIDDEN_KEYWORDS_KEY } from '../btc-import-btn/keys';

defineOptions({
  name: 'BtcImportExportGroup',
  inheritAttrs: false,
});

export interface BtcImportExportGroupProps {
  /** 导出文件名（必填，用于导出和导入文件名匹配） */
  exportFilename: string;
  /** 禁止的文件名关键词（可选，默认：['SysPro', 'BOM表', '(', ')', '（', '）']） */
  forbiddenKeywords?: string[];
  /** 导入相关配置 */
  /** 导入按钮的列配置（可选，如果不提供则从 CRUD 上下文获取） */
  importColumns?: TableColumn[];
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
  exportColumns?: TableColumn[];
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

const props = withDefaults(defineProps<BtcImportExportGroupProps>(), {
  forbiddenKeywords: () => ['SysPro', 'BOM表', '(', ')', '（', '）'],
  importLimitSize: 10,
  importButtonType: 'success',
  exportAutoWidth: true,
  exportBookType: 'xlsx',
  disabled: false,
});

const emit = defineEmits<{
  'import-change': [data: any[]];
  'filename-validate': [isValid: boolean];
}>();

// 提供导出文件名和禁止关键词给子组件（通过 provide/inject）
const exportFilenameComputed = computed(() => props.exportFilename);
provide(IMPORT_FILENAME_KEY, exportFilenameComputed);
const forbiddenKeywordsComputed = computed(() => props.forbiddenKeywords || []);
provide(IMPORT_FORBIDDEN_KEYWORDS_KEY, forbiddenKeywordsComputed);

// 导入处理函数
const handleImport = async (data: any, options: { done: () => void; close: () => void }) => {
  if (props.onImportSubmit) {
    await props.onImportSubmit(data, options);
  }
};

// 导入变更处理
const handleImportChange = (data: any[]) => {
  emit('import-change', data);
};

// 文件名校验处理
const handleFilenameValidate = (isValid: boolean) => {
  emit('filename-validate', isValid);
  if (props.onFilenameValidate) {
    props.onFilenameValidate(isValid);
  }
};
</script>

<style lang="scss" scoped>
.btc-import-export-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>

