<template>
  <div class="page">
    <BtcCrud ref="crudRef" :service="wrappedDomainService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey :placeholder="t('platform.domain.search_placeholder')" />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('platform.domain.list')" />
        </BtcCrudActions>
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcExportBtn } from '@btc/shared-components';
import { useI18n, usePageColumns, usePageForms, usePageService } from '@btc/shared-core';
import { service } from '@services/eps';

const { t } = useI18n();
const crudRef = ref();
const tableRef = ref();

// 租户下拉选项
const tenantOptions = ref<{ label: string; value: any }[]>([]);
const tenantLoading = ref(false);

const loadTenantOptions = async () => {
  const tenantService = service.admin?.iam?.tenant;

  if (!tenantService || typeof tenantService.list !== 'function') {
    console.warn('[Domain] Tenant list service unavailable');
    tenantOptions.value = [];
    return;
  }

  tenantLoading.value = true;
  try {
    const response = await tenantService.list({});
    const list = Array.isArray(response?.list) ? response.list : Array.isArray(response) ? response : [];

    tenantOptions.value = list
      .map((tenant: any) => {
        // 使用 tenantCode 作为值，优先使用 tenantName 作为显示标签，如果没有则使用 tenantCode
        const value = tenant?.tenantCode ?? tenant?.code;
        const label = tenant?.tenantName ?? tenant?.name ?? tenant?.tenantCode ?? value;

        if (value === undefined || value === null) {
          return null;
        }

        return {
          value,
          label: String(label ?? value),
        };
      })
      .filter((item): item is { label: string; value: any } => !!item);
  } catch (error) {
    console.warn('[Domain] Failed to get tenant list:', error);
    tenantOptions.value = [];
  } finally {
    tenantLoading.value = false;
  }
};

onMounted(() => {
  loadTenantOptions();
});

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('platform.domains');
const { formItems: baseFormItems } = usePageForms('platform.domains');

// 使用 config.ts 中定义的 service，并添加删除确认逻辑
const wrappedDomainService = usePageService('platform.domains', 'domain');

// 域表格列 - 直接使用 baseColumns，因为 tenantCode 不需要 formatter
const columns = computed(() => {
  return baseColumns.value;
});

// 域表单 - 扩展配置以支持动态 options
const formItems = computed(() => {
  return baseFormItems.value.map(item => {
    // 如果表单项是 tenantCode，添加动态 options 和 loading
    if (item.prop === 'tenantCode') {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            loading: tenantLoading.value,
          },
          options: tenantOptions.value,
        },
      };
    }
    return item;
  });
});


// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
</style>
