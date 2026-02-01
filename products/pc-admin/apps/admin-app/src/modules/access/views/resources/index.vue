<template>
  <div class="page">
    <BtcCrud ref="crudRef" :service="crudResourceService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <el-button
            type="warning"
            class="btc-crud-btn"
            :loading="syncLoading"
            @click="handleSync"
          >
            <BtcSvg class="btc-crud-btn__icon" name="sync" />
            <span class="btc-crud-btn__text">
              {{ t('access.resources.sync') }}
            </span>
          </el-button>
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcTable :columns="columns" border />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>

      <BtcUpsert :items="formItems" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n, usePageColumns, usePageForms, usePageService, getPageConfigFull, logger } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import {
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcRefreshBtn,
  BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
  BtcCrudActions,
  BtcSvg,
} from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const syncLoading = ref(false);

// 从 config.ts 读取配置
const { columns } = usePageColumns('access.resources');
const { formItems } = usePageForms('access.resources');
const pageConfig = getPageConfigFull('access.resources');

// 资源服务 - 使用 config.ts 中定义的 service（用于同步操作）
const resourceService = pageConfig?.service?.resource || service.admin?.iam?.resource;

// 使用 config.ts 中定义的 service，并添加删除确认逻辑（用于 CRUD 操作）
const crudResourceService = usePageService('access.resources', 'resource');

// 数据同步处理
const handleSync = async () => {
  if (syncLoading.value) return;

  try {
    syncLoading.value = true;

    // 调用 pull 接口拉取资源
    await resourceService?.pull();

    message.success(t('access.resources.sync_success'));

    // 刷新表格数据
    if (crudRef.value?.crud) {
      await crudRef.value.crud.refresh();
    }
  } catch (error) {
    message.error(t('access.resources.sync_failed'));
    logger.error('Data sync failed:', error);
  } finally {
    syncLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>

</style>
