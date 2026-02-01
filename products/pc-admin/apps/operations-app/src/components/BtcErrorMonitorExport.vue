<template>
  <div class="btc-error-monitor-export">
    <el-button type="info" @click="open" :loading="loading">
      <BtcSvg name="export" class="mr-[5px]" />
      {{ t('monitor.export') }}
    </el-button>

    <BtcForm ref="formRef" />
  </div>
</template>

<script setup lang="ts">
import { storage } from '@btc/shared-utils';
import { ref, computed } from 'vue';
import { useI18n, exportTableToExcel, logger } from '@btc/shared-core';
import { formatDate, getDateRange } from '@btc/shared-utils';
import { BtcForm, BtcSvg, BtcMessage } from '@btc/shared-components';
import type { BtcFormItem } from '@btc/shared-components';
import { getErrorListSync } from '@btc/shared-utils/error-monitor';
import type { FormattedError } from '@btc/shared-utils/error-monitor';

interface Props {
  /** 当前过滤的来源 */
  filterSource?: string;
  /** 当前过滤的类型 */
  filterType?: string;
  /** 应用名称映射函数 */
  getAppDisplayName: (source: string) => string;
  /** 错误类型显示名称函数 */
  getErrorTypeDisplayName: (type: string) => string;
}

const props = withDefaults(defineProps<Props>(), {
  filterSource: 'all',
  filterType: 'all',
});

const { t } = useI18n();
const loading = ref(false);
const formRef = ref();

// 获取所有错误数据（从 storage 和内存中）
const getAllErrors = (): FormattedError[] => {
  try {
    const allErrors: FormattedError[] = [];

    // 从 storage 读取所有日期的错误
    const storageKey = 'btc_error';
    const data = storage.get<{ errors?: Record<string, FormattedError[]> }>(storageKey);
    if (data) {
      if (data.errors && typeof data.errors === 'object') {
        Object.values(data.errors).forEach((errors: any) => {
          if (Array.isArray(errors)) {
            allErrors.push(...errors);
          }
        });
      }
    }

    // 合并当前内存中的错误（去重）
    const currentErrors = getErrorListSync();
    const existingIds = new Set(allErrors.map((e) => e.id));
    currentErrors.forEach((error) => {
      if (!existingIds.has(error.id)) {
        allErrors.push(error);
      }
    });

    return allErrors.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  } catch (error) {
    console.warn('[ErrorMonitorExport] 获取错误数据失败:', error);
    return getErrorListSync();
  }
};

// 获取数据的时间范围
const getDataTimeRange = () => {
  const allErrors = getAllErrors();
  if (allErrors.length === 0) return null;

  const dates = allErrors
    .map((error) => {
      if (!error.time) return null;
      const dateStr = error.time.split(' ')[0]; // 提取日期部分 YYYY-MM-DD
      return new Date(dateStr);
    })
    .filter(Boolean)
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

  if (dates.length === 0) return null;

  return {
    min: formatDate(dates[0], 'YYYY-MM-DD'),
    max: formatDate(dates[dates.length - 1], 'YYYY-MM-DD'),
  };
};

// 导出列配置
const exportColumns = computed(() => [
  { prop: 'time', label: t('monitor.export.column.time') },
  { prop: 'type', label: t('monitor.export.column.type') },
  { prop: 'source', label: t('monitor.export.column.source') },
  { prop: 'errorType', label: t('monitor.export.column.errorType') },
  { prop: 'message', label: t('monitor.export.column.message') },
  { prop: 'url', label: t('monitor.export.column.url') },
  { prop: 'stack', label: t('monitor.export.column.stack') },
]);

// 表单配置
const formItems = computed<BtcFormItem[]>(() => {
  const dataTimeRange = getDataTimeRange();

  return [
    // 日期范围选择
    {
      label: t('monitor.export.dateRange'),
      prop: 'dateRange',
      component: {
        name: 'el-radio-group',
        props: {
          options: [
            { label: t('monitor.export.dateRangeAll'), value: 'all' },
            { label: t('monitor.export.dateRangeToday'), value: 'today' },
            { label: t('monitor.export.dateRangeWeek'), value: 'week' },
            { label: t('monitor.export.dateRangeMonth'), value: 'month' },
            { label: t('monitor.export.dateRangeCustom'), value: 'custom' },
          ],
        },
      },
    },
    // 自定义日期范围
    {
      label: t('monitor.export.customDateRange'),
      prop: 'customDateRange',
      hidden: (data: { scope: any }) => data.scope.dateRange !== 'custom',
      span: 24,
      component: {
        name: 'el-date-picker',
        props: {
          type: 'daterange',
          rangeSeparator: '至',
          placeholder: `${t('platform.common.start_date')} - ${t('platform.common.end_date')}`,
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          style: 'width: 100%',
          clearable: true,
          disabledDate: dataTimeRange ? ((time: Date) => {
            const date = formatDate(time, 'YYYY-MM-DD');
            return date < dataTimeRange.min || date > dataTimeRange.max;
          }) : undefined,
        },
      },
      ...(dataTimeRange
        ? {
            help: `${t('monitor.export.availableDateRange')}: ${dataTimeRange.min} 至 ${dataTimeRange.max}`,
          }
        : {}),
    },
    // 来源过滤
    {
      label: t('monitor.export.source'),
      prop: 'source',
      component: {
        name: 'el-select',
        props: {
          style: 'width: 100%',
          options: [
            { label: t('monitor.filter.allSources'), value: 'all' },
            { label: t('micro_app.main.title'), value: 'main-app' },
            { label: t('micro_app.admin.title'), value: 'admin' },
            { label: t('micro_app.logistics.title'), value: 'logistics' },
            { label: t('micro_app.quality.title'), value: 'quality' },
            { label: t('micro_app.production.title'), value: 'production' },
            { label: t('micro_app.engineering.title'), value: 'engineering' },
            { label: t('micro_app.finance.title'), value: 'finance' },
          ],
        },
      },
    },
    // 类型过滤
    {
      label: t('monitor.export.type'),
      prop: 'type',
      component: {
        name: 'el-select',
        props: {
          style: 'width: 100%',
          options: [
            { label: t('monitor.filter.allTypes'), value: 'all' },
            { label: t('monitor.filter.onlyError'), value: 'error' },
            { label: t('monitor.filter.onlyWarn'), value: 'warn' },
          ],
        },
      },
    },
    // 列选择
    {
      label: t('monitor.export.columns'),
      prop: 'checked',
      component: {
        name: 'el-checkbox-group',
        props: {
          options: exportColumns.value.map((col) => ({
            label: col.label,
            value: col.prop,
          })),
        },
      },
    },
  ];
});

// 标准化来源值
const normalizeSource = (source: string): string => {
  return source.replace(/-app$/, '');
};

interface FormData {
  dateRange?: string;
  customDateRange?: [Date | string, Date | string] | null;
  source?: string;
  type?: string;
  checked?: string[];
}

// 过滤数据
const filterErrors = (formData: FormData): FormattedError[] => {
  let filtered = getAllErrors();

  // 按日期范围过滤
  if (formData.dateRange && formData.dateRange !== 'all') {
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (formData.dateRange === 'custom') {
      // 自定义日期范围
      if (formData.customDateRange && Array.isArray(formData.customDateRange) && formData.customDateRange.length === 2) {
        const [start, end] = formData.customDateRange;
        // 确保日期格式正确（YYYY-MM-DD）
        if (start && end) {
          startDate = typeof start === 'string' ? start.split(' ')[0] : formatDate(start, 'YYYY-MM-DD');
          endDate = typeof end === 'string' ? end.split(' ')[0] : formatDate(end, 'YYYY-MM-DD');
        }
      }
    } else {
      // 预设日期范围（today/week/month）
      try {
        const [start, end] = getDateRange(formData.dateRange);
        startDate = formatDate(start, 'YYYY-MM-DD');
        endDate = formatDate(end, 'YYYY-MM-DD');
      } catch (error) {
        console.warn('[ErrorMonitorExport] 获取日期范围失败:', error);
      }
    }

    // 只有在成功获取日期范围时才进行过滤
    if (startDate && endDate) {
      filtered = filtered.filter((error) => {
        if (!error.time) return false;
        const errorDate = error.time.split(' ')[0]; // 提取日期部分 YYYY-MM-DD
        // 确保日期格式一致进行比较
        return errorDate >= startDate! && errorDate <= endDate!;
      });
    }
  }

  // 按来源过滤
  if (formData.source && formData.source !== 'all') {
    filtered = filtered.filter((error) => {
      const normalizedFilter = normalizeSource(formData.source);
      const normalizedError = normalizeSource(error.source);
      return normalizedFilter === normalizedError || error.source === formData.source;
    });
  }

  // 按类型过滤
  if (formData.type && formData.type !== 'all') {
    filtered = filtered.filter((error) => {
      if (formData.type === 'warn') {
        return error.isWarning;
      } else if (formData.type === 'error') {
        return !error.isWarning;
      }
      return true;
    });
  }

  return filtered;
};

// 打开导出对话框
const open = () => {
  const dataTimeRange = getDataTimeRange();

  // 默认选中所有列
  const defaultChecked = exportColumns.value.map((col) => col.prop);

  // 设置默认表单数据（使用当前过滤条件）
  const defaultForm = {
    dateRange: 'all',
    customDateRange: dataTimeRange ? [dataTimeRange.min, dataTimeRange.max] : null,
    source: props.filterSource,
    type: props.filterType,
    checked: defaultChecked,
  };

  formRef.value?.open({
    title: t('monitor.export'),
    width: '600px',
    form: defaultForm,
    items: formItems.value,
    op: {
      buttons: ['save', 'close'],
      saveButtonText: t('monitor.export'),
      closeButtonText: t('common.button.cancel'),
    },
    on: {
      submit: handleSubmit,
    },
  });
};

interface SubmitCallbacks {
  done: () => void;
  close: () => void;
}

// 处理导出提交
const handleSubmit = async (data: FormData, callbacks: SubmitCallbacks) => {
  const { done, close } = callbacks;
  // 验证列选择
  if (!data.checked || data.checked.length === 0) {
    BtcMessage.warning(t('platform.common.please_select_at_least_one_column'));
    done();
    return;
  }

  // 验证自定义日期范围
  if (data.dateRange === 'custom') {
    if (!data.customDateRange) {
      BtcMessage.warning(t('monitor.export.customDateRangeRequired'));
      done();
      return;
    }
    if (!Array.isArray(data.customDateRange)) {
      BtcMessage.warning(t('monitor.export.customDateRangeRequired'));
      done();
      return;
    }
    if (data.customDateRange.length !== 2) {
      BtcMessage.warning(t('monitor.export.customDateRangeRequired'));
      done();
      return;
    }
    const [start, end] = data.customDateRange;
    if (!start || !end) {
      BtcMessage.warning(t('monitor.export.customDateRangeRequired'));
      done();
      return;
    }
  }

  loading.value = true;

  try {
    // 过滤数据
    const filteredErrors = filterErrors(data);

    if (!filteredErrors || filteredErrors.length === 0) {
      BtcMessage.warning(t('platform.common.no_data_to_export'));
      done();
      return;
    }

    // 过滤选中的列
    const selectedColumns = exportColumns.value.filter((col) => data.checked?.includes(col.prop));

    // 准备导出数据
    const exportData = filteredErrors.map((error) => {
      const row: Record<string, string> = {};

      if (data.checked?.includes('time')) {
        row.time = error.time;
      }
      if (data.checked?.includes('type')) {
        row.type = error.isWarning ? t('monitor.type.warning') : t('monitor.type.error');
      }
      if (data.checked?.includes('source')) {
        row.source = props.getAppDisplayName(error.source);
      }
      if (data.checked?.includes('errorType')) {
        row.errorType = props.getErrorTypeDisplayName(error.type);
      }
      if (data.checked?.includes('message')) {
        row.message = error.message;
      }
      if (data.checked?.includes('url')) {
        row.url = error.url || '-';
      }
      if (data.checked?.includes('stack')) {
        row.stack = error.stack || '-';
      }

      return row;
    });

    // 生成文件名
    const timestamp = formatDate(new Date(), 'YYYY-MM-DD_HH-mm-ss');
    const filename = `错误监控_${timestamp}`;

    // 执行导出
    exportTableToExcel({
      columns: selectedColumns,
      data: exportData,
      filename,
      autoWidth: true,
      bookType: 'xlsx',
    });

    BtcMessage.success(t('platform.common.export_success'));
    close();
  } catch (error) {
    logger.error('导出失败:', error);
    BtcMessage.error(t('platform.common.export_failed'));
  } finally {
    loading.value = false;
    done();
  }
};

defineExpose({
  open,
});
</script>

<style scoped>
.btc-error-monitor-export {
  display: inline-flex;
}
</style>
