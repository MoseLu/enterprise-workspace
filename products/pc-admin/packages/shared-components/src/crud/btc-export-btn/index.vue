<template>
  <div class="btc-export-btn">
    <template v-if="variant === 'icon'">
      <BtcTableButton :config="iconButtonConfig" />
    </template>
    <template v-else>
      <el-button type="info" @click="open" :loading="loading">
        <BtcSvg name="export" class="mr-[5px]" />
        {{ text || t('ui.export') }}
      </el-button>
    </template>

    <BtcForm ref="formRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';

import { useI18n, exportTableToExcel, logger } from '@btc/shared-core';
import { formatDate, getDateRange } from '@btc/shared-core/utils';
import BtcForm from '../../components/form/btc-form/index.vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { TableColumn } from '../table/types';
import type { BtcFormItem } from '../../components/form/btc-form/types';
import type { UseCrudReturn } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';

type ExportButtonVariant = 'button' | 'icon';

interface Props {
  /** 表格列配置（可选，如果不提供则从 CRUD 上下文获取） */
  columns?: TableColumn[];
  /** 表格数据（可选，如果不提供则从 CRUD 上下文获取） */
  data?: any[];
  /** 文件名 */
  filename?: string;
  /** 是否自动列宽 */
  autoWidth?: boolean;
  /** 文件类型 */
  bookType?: 'xlsx' | 'xls';
  /** 最大导出条数 */
  maxExportLimit?: number;
  /** 按钮文本（按钮模式有效） */
  text?: string;
  /** 渲染模式：按钮 / 图标 */
  variant?: ExportButtonVariant;
  /** 图标按钮模式下的图标名称 */
  icon?: string;
  /** 图标按钮模式下的 tooltip 文案 */
  tooltip?: string;
  /** 图标按钮模式下的类型 */
  iconType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const props = withDefaults(defineProps<Props>(), {
  filename: 'export',
  autoWidth: true,
  bookType: 'xlsx',
  variant: 'button' as ExportButtonVariant,
  icon: 'export',
  iconType: 'info',
});

const { t } = useI18n();
const loading = ref(false);
const formRef = ref();

// 从 CRUD 上下文获取数据
const crud = inject<UseCrudReturn<any>>('btc-crud');
const tableRefContext = inject<any>('btc-table-ref');

// 计算是否有选中数据
const hasSelection = computed(() => {
  return crud && crud.selection && crud.selection.value.length > 0;
});

// 计算当前筛选结果的总数
const currentFilterTotal = computed(() => {
  return crud?.pagination?.total || 0;
});

// 计算数据的实际时间范围
const dataTimeRange = ref<{ min: string; max: string } | null>(null);

// 获取数据的时间范围
const fetchDataTimeRange = async () => {
  if (!crud?.service || typeof crud.service.page !== 'function') {
    return null;
  }

  try {
    // 获取所有数据的时间范围（不分页）
    const params = {
      ...crud.getParams(),
      page: 1,
      size: 1, // 只获取一条数据用于检测时间字段
      isTimeRangeCheck: true, // 特殊标记，后端可以只返回时间字段
    };

    const res = await crud.service.page(params);

    if (!res.list || res.list.length === 0) {
      return null;
    }

    // 从第一条数据中检测时间字段
    const firstItem = res.list[0];
    const timeField = firstItem.createdAt
      || firstItem.createTime
      || firstItem.created_at
      || firstItem.create_time;

    if (!timeField) {
      return null;
    }

    // 如果有时间字段，尝试获取完整的时间范围
    // 或者使用现有的分页接口获取所有数据
    const allDataParams = {
      ...crud.getParams(),
      page: 1,
      size: 999999, // 获取所有数据
      isTimeRangeCheck: true,
    };

    const allDataRes = await crud.service.page(allDataParams);

    if (!allDataRes.list || allDataRes.list.length === 0) {
      return null;
    }

    const dates = allDataRes.list
      .map((item: any) => {
        const dateValue = item.createdAt
          || item.createTime
          || item.created_at
          || item.create_time;
        return dateValue ? new Date(dateValue) : null;
      })
      .filter(Boolean)
      .sort((a: Date, b: Date) => a.getTime() - b.getTime());

    if (dates.length === 0) return null;

    return {
      min: formatDate(dates[0], 'YYYY-MM-DD'),
      max: formatDate(dates[dates.length - 1], 'YYYY-MM-DD'),
    };
  } catch (error) {
    console.warn('获取数据时间范围失败:', error);
    return null;
  }
};

// 获取列配置（优先使用 props，否则从 CRUD 上下文获取）
const columns = computed(() => {
  if (props.columns && props.columns.length > 0) {
    return props.columns;
  }

  // 从 CRUD 上下文获取列配置
  if (tableRefContext?.value?.columns) {
    return tableRefContext.value.columns;
  }

  return [];
});

// 过滤可导出的列
const exportableColumns = computed(() => {
  return columns.value.filter((col: any) =>
    col.prop
    && !['selection', 'index', 'expand', 'op'].includes(col.type || '')
    && !col.hidden
    && !col.filterExport
    && !(col as any)['filter-export'],
  );
});

const iconButtonConfig = computed(() => ({
  icon: props.icon,
  tooltip: () => props.tooltip || t('ui.export'),
  ariaLabel: props.tooltip || t('ui.export'),
  type: props.iconType,
  disabled: loading.value,
  onClick: () => {
    if (!loading.value) {
      open();
    }
  },
}));

// 表单配置
const formItems = computed<BtcFormItem[]>(() => {
  const items: BtcFormItem[] = [
    // 导出范围选择
    {
      label: t('platform.common.export_mode'),
      prop: 'exportMode',
      component: {
        name: 'el-radio-group',
        props: {
          options: [
            {
              label: `${t('platform.common.export_mode_all')}（${t('platform.common.total_records', { count: currentFilterTotal.value })}）`,
              value: 'all',
            },
            {
              label: `${t('platform.common.export_mode_selected')}（${t('platform.common.total_records', { count: hasSelection.value ? crud?.selection?.value?.length || 0 : 0 })}）`,
              value: 'selected',
              disabled: !hasSelection.value,
            },
          ],
        },
      },
    },
    // 时间范围选择（可选）
    {
      label: t('platform.common.time_range'),
      prop: 'timeRange',
      component: {
        name: 'el-radio-group',
        props: {
          options: [
            { label: t('platform.common.time_range_today'), value: 'today' },
            { label: t('platform.common.time_range_week'), value: 'week' },
            { label: t('platform.common.time_range_month'), value: 'month' },
            { label: t('platform.common.time_range_custom'), value: 'custom' },
          ],
        },
      },
    },
    // 自定义时间段的日期选择器（并排显示）
    {
      label: t('platform.common.time_range_custom'),
      prop: 'customDateRange',
      hidden: (data: { scope: any }) => data.scope.timeRange !== 'custom',
      span: 24,
      component: {
        name: 'el-date-picker',
        props: {
          type: 'daterange',
          rangeSeparator: '至',
          startPlaceholder: t('platform.common.start_date'),
          endPlaceholder: t('platform.common.end_date'),
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          style: 'width: 100%',
          // 限制选择范围
          disabledDate: (time: Date) => {
            if (!dataTimeRange.value) return false;
            const date = formatDate(time, 'YYYY-MM-DD');
            return date < dataTimeRange.value.min || date > dataTimeRange.value.max;
          },
          // 智能默认值
          defaultValue: dataTimeRange.value ? [dataTimeRange.value.min, dataTimeRange.value.max] : undefined,
        },
      },
      // 添加提示信息
      ...(dataTimeRange.value
        ? {
            help: `可选时间范围：${dataTimeRange.value.min} 至 ${dataTimeRange.value.max}`,
          }
        : {}),
    },
    // 列选择
    {
      label: t('platform.common.select_columns'),
      prop: 'checked',
      component: {
        name: 'el-checkbox-group',
        props: {
          options: exportableColumns.value.map((col: any) => ({
            label: col.label || col.prop!,
            value: col.prop!,
          })),
        },
      },
    },
  ];

  return items;
});

const open = async () => {
  if (!columns.value || columns.value.length === 0) {
    BtcMessage.error(t('platform.common.no_columns_to_export'));
    return;
  }

  // 获取数据时间范围
  dataTimeRange.value = await fetchDataTimeRange();

  // 默认选中所有可导出的列
  const defaultChecked = exportableColumns.value.map((col: any) => col.prop!);

  // 设置默认表单数据
  const defaultForm = {
    exportMode: 'all',
    timeRange: null,
    customDateRange: null,
    checked: defaultChecked,
  };

  // 使用 BtcForm 的 open 方法
  formRef.value?.open({
    title: t('ui.export'),
    width: '600px',
    form: defaultForm,
    items: formItems.value,
    op: {
      buttons: ['save', 'close'],
      saveButtonText: t('ui.export'),
      closeButtonText: t('common.button.cancel'),
    },
    on: {
      submit: handleSubmit,
    },
  });
};

// 获取当前筛选结果的数据
const fetchFilteredData = async (formData: any) => {
  if (!crud?.service) {
    throw new Error('CRUD service is not available');
  }

  const params = {
    ...crud.getParams(), // 获取当前搜索/筛选参数
    page: 1,
    size: 999999, // 获取所有数据
    isExport: true,
  };

  // 应用时间筛选参数
  if (formData.timeRange) {
    Object.assign(params, buildTimeRangeParams(formData));
  }

  const res = await crud.service.page(params);
  return res.list || [];
};

// 构建时间范围查询参数
const buildTimeRangeParams = (formData: any) => {
  if (formData.timeRange === 'custom') {
    // 处理日期范围选择器的值
    if (formData.customDateRange && Array.isArray(formData.customDateRange) && formData.customDateRange.length === 2) {
      return {
        startDate: formData.customDateRange[0],
        endDate: formData.customDateRange[1],
      };
    }
    return {};
  }

  // 使用 getDateRange 函数获取时间范围
  const [startDate, endDate] = getDateRange(formData.timeRange);

  return {
    startDate: formatDate(startDate, 'YYYY-MM-DD'),
    endDate: formatDate(endDate, 'YYYY-MM-DD'),
  };
};

// 根据时间范围过滤数据
const filterByTimeRange = (data: any[], formData: any) => {
  if (!formData.timeRange) return data;

  const { startDate, endDate } = buildTimeRangeParams(formData);

  return data.filter((item: any) => {
    // 假设数据有 createdAt 或 createTime 字段
    const dateField = item.createdAt || item.createTime || item.created_at;
    if (!dateField) return true;

    const itemDate = formatDate(dateField, 'YYYY-MM-DD');
    return itemDate >= startDate && itemDate <= endDate;
  });
};

const handleSubmit = async (data: any, { done, close }: any) => {
  // 1. 验证列选择
  if (!data.checked || data.checked.length === 0) {
    BtcMessage.warning(t('platform.common.please_select_at_least_one_column'));
    done();
    return;
  }

  loading.value = true;

  try {
    // 过滤选中的列
    const selectedColumns = exportableColumns.value.filter((col: any) =>
      data.checked.includes(col.prop!),
    );

    // 2. 根据导出模式获取数据
    let exportData: any[] = [];

    if (data.exportMode === 'selected') {
      // 导出选中数据
      exportData = crud?.selection?.value || [];

      // 3. 应用时间筛选（如果有）
      if (data.timeRange) {
        exportData = filterByTimeRange(exportData, data);
      }
    } else {
      // 导出当前筛选结果
      exportData = await fetchFilteredData(data);
    }

    if (!exportData || exportData.length === 0) {
      BtcMessage.warning(t('platform.common.no_data_to_export'));
      done();
      return;
    }

    // 4. 执行导出
    exportTableToExcel({
      columns: selectedColumns,
      data: exportData,
      filename: props.filename,
      autoWidth: props.autoWidth,
      bookType: props.bookType,
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
.btc-export-btn {
  display: inline-flex;
}
</style>