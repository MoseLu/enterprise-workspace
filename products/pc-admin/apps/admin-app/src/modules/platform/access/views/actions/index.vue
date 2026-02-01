<template>
  <div class="action-list">
    <BtcCrud ref="crudRef" :service="actionService">
      <BtcCrudRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable ref="tableRef" :columns="columns" border />
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
import { ref } from 'vue';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { usePageColumns, usePageForms, usePageService } from '@btc/shared-core';

const crudRef = ref();

// 从 config.ts 读取配置（platform.access.actions 使用 access 模块的配置）
const { columns } = usePageColumns('access.actions');
const { formItems } = usePageForms('access.actions');
const actionService = usePageService('access.actions', 'action', {
  showSuccessMessage: true,
});


// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
.action-list {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}
</style>

