<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryInfoService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('menu.logistics.inventoryManagement.info')" />
        </BtcCrudActions>
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
          border
          :op="{ buttons: ['edit', 'delete'] }"
        />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>

      <BtcUpsert ref="upsertRef" :items="formItems" width="680px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { formatDateTime } from '@btc/shared-utils';

defineOptions({
  name: 'btc-logistics-warehouse-inventory-info',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('warehouse.inventory.info');
const { formItems } = usePageForms('warehouse.inventory.info');
const pageConfig = getPageConfigFull('warehouse.inventory.info');

// 使用 config.ts 中定义的服务
const inventoryInfoService = usePageService('warehouse.inventory.info', 'inventoryInfo');

// 扩展配置以支持动态 formatter
const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是日期字段，添加动态 formatter
    if (col.prop === 'startTime' || col.prop === 'endTime' || col.prop === 'createdAt' || col.prop === 'updateAt') {
      return {
        ...col,
        formatter: formatDateCell,
      };
    }
    return col;
  });
});

onMounted(() => {
  crudRef.value?.crud?.loadData?.();
  nextTick(() => {
    tableRef.value?.calcMaxHeight?.();
  });
});
</script>

<style scoped lang="scss">
.logistics-crud-wrapper {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

</style>


