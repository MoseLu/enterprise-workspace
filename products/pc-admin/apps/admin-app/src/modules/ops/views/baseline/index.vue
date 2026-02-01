<template>
  <div class="page">
    <BtcCrud ref="crudRef" :service="wrappedBaselineService || baselineService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey :placeholder="t('ops.baseline.search_placeholder')" />
        <BtcCrudActions />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcTable ref="tableRef" :columns="baselineColumns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>

      <BtcUpsert ref="upsertRef" :items="baselineFormItems" width="800px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService } from '@btc/shared-core';
import { createMockCrudService } from '@utils/http';

const { t } = useI18n();
const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 从 config.ts 读取配置
const { columns: baselineColumns } = usePageColumns('ops.baseline');
const { formItems: baselineFormItems } = usePageForms('ops.baseline');
const pageConfig = getPageConfigFull('ops.baseline');

// 基线服务 - 使用Mock服务（config.ts 中 baseline 为 null，使用 Mock 服务）
const baselineService = pageConfig?.service?.baseline || createMockCrudService('btc_baseline');
const wrappedBaselineService = usePageService('ops.baseline', 'baseline') || baselineService;

</script>

<style lang="scss" scoped>

</style>
