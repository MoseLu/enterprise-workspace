<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="storageLocationService">
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

      <BtcUpsert ref="upsertRef" :items="formItems" width="720px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService, logger } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcConfirm, BtcMessage } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-config-storage-location',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 从 config.ts 读取配置（仓位配置属于盘点模块）
const { columns: baseColumns } = usePageColumns('logistics.inventory.storage-location');
const { formItems: baseFormItems } = usePageForms('logistics.inventory.storage-location');
const pageConfig = getPageConfigFull('logistics.inventory.storage-location');

// 开发环境：验证国际化消息是否正确加载
if (import.meta.env.DEV) {
  nextTick(() => {
    const testKey = 'common.inventory.storage_location.fields.name';
    const translated = t(testKey);
    if (translated === testKey) {
      console.warn('[StorageLocation] 国际化消息未找到:', testKey);
      // 检查 i18n 实例
      const i18nInstance = (t as any).__i18n || (t as any).$i18n;
      if (i18nInstance?.global) {
        const currentLocale = i18nInstance.global.locale?.value || 'zh-CN';
        const messages = i18nInstance.global.getLocaleMessage(currentLocale) || {};
        const hasCommon = 'common' in messages;
        const hasInventory = hasCommon && messages.common && 'inventory' in messages.common;
        const hasStorageLocation = hasInventory && messages.common.inventory && 'storage_location' in messages.common.inventory;
        console.debug('[StorageLocation] 国际化消息检查:', {
          testKey,
          currentLocale,
          hasCommon,
          hasInventory,
          hasStorageLocation,
          commonKeys: hasCommon ? Object.keys(messages.common || {}).slice(0, 5) : [],
          inventoryKeys: hasInventory ? Object.keys(messages.common.inventory || {}).slice(0, 5) : [],
          storageLocationKeys: hasStorageLocation ? Object.keys(messages.common.inventory.storage_location || {}).slice(0, 5) : [],
        });
      }
    } else {
      console.debug('[StorageLocation] 国际化消息已找到:', testKey, '->', translated);
    }
  });
}

// 使用 config.ts 中定义的服务（仓位配置属于盘点模块）
const baseService = pageConfig?.service?.storageLocation || createCrudServiceFromEps(
  ['logistics', 'base', 'position'],
  service
);

// 包装 service，添加删除确认逻辑
const storageLocationService: CrudService<any> = {
  ...baseService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await baseService.delete(id);
    BtcMessage.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await baseService.deleteBatch(ids);
    BtcMessage.success(t('crud.message.delete_success'));
  },
};

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

// 扩展配置以支持动态 formatter
const columns = computed(() => {
  return baseColumns.value.map(col => {
    if (col.prop === 'createdAt' || col.prop === 'updatedAt') {
      return { ...col, formatter: formatDateCell };
    }
    return col;
  });
});

// 域列表选项
const domainOptions = ref<{ label: string; value: string }[]>([]);
const domainLoading = ref(false);

// 加载域列表
const loadDomainOptions = async () => {
  domainLoading.value = true;
  try {
    // 调用管理域的域列表服务
    const response = await service.admin?.iam?.domain?.list({});
    
    // 处理响应数据：支持 response.data.list 或 response.list
    const domainList = Array.isArray(response?.data?.list) 
      ? response.data.list 
      : Array.isArray(response?.list) 
        ? response.list 
        : Array.isArray(response?.data) 
          ? response.data 
          : [];

    domainOptions.value = domainList
      .map((domain: any) => {
        const value = domain?.id;
        const label = domain?.name;

        if (!value || !label) {
          return null;
        }

        return {
          value: String(value),
          label: String(label),
        };
      })
      .filter((item): item is { label: string; value: string } => item !== null);
  } catch (error) {
    logger.error('[StorageLocation] 获取域列表失败:', error);
    domainOptions.value = [];
  } finally {
    domainLoading.value = false;
  }
};

// 扩展配置以支持动态 options
const formItems = computed(() => {
  return baseFormItems.value.map(item => {
    // 如果表单项是 domainId，添加动态 options
    if (item.prop === 'domainId') {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            filterable: true,
            loading: domainLoading.value,
          },
          options: domainOptions.value,
        },
      };
    }
    return item;
  });
});

onMounted(() => {
  // 加载域列表（用于表单下拉选项）
  loadDomainOptions();
  // 移除手动调用 loadData，让 BtcCrud 自动加载
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

