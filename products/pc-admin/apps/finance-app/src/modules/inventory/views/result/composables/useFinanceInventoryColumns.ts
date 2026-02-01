import { computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { formatTableNumber } from '@btc/shared-utils';

/**
 * 盘点结果表格列配置
 */
export function useFinanceInventoryColumns() {
  const { t } = useI18n();

  const formatNumber = (_row: Record<string, any>, _column: TableColumn, value: any) => formatTableNumber(value);

  const columns = computed<TableColumn[]>(() => [
    { type: 'selection', width: 48 },
    { type: 'index', label: t('common.index'), width: 60 },
    { label: t('finance.inventory.result.fields.material_code'), prop: 'materialCode', showOverflowTooltip: true },
    { label: t('finance.inventory.result.fields.position'), prop: 'position', width: 80, showOverflowTooltip: true },
    { label: `${t('finance.inventory.result.fields.unit_cost')} ($)`, prop: 'unitCost', width: 100, align: 'right', formatter: formatNumber },
    { label: t('finance.inventory.result.fields.book_qty'), prop: 'bookQty', width: 100, align: 'right', formatter: formatNumber },
    { label: t('finance.inventory.result.fields.actual_qty'), prop: 'actualQty', width: 100, align: 'right', formatter: formatNumber },
    { label: t('finance.inventory.result.fields.diff_qty'), prop: 'diffQty', width: 100, align: 'right', formatter: formatNumber },
    { label: `${t('finance.inventory.result.fields.variance_cost')} ($)`, prop: 'varianceCost', width: 120, align: 'right', formatter: formatNumber },
  ]);

  return {
    columns,
  };
}

