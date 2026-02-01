<template>
  <div class="page">
    <BtcCrud ref="crudRef" :service="wrappedService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px"  />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { usePageColumns, usePageForms, usePageService } from '@btc/shared-core';

const crudRef = ref();

// 从 config.ts 读取配置
const { columns } = usePageColumns('access.permissions');
const { formItems } = usePageForms('access.permissions');
const wrappedService = usePageService('access.permissions', 'permission', {
  showSuccessMessage: true,
});

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>

</style>
