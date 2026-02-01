<template>
  <div class="page">
    <BtcDoubleLayout
      ref="tableGroupRef"
      left-title="title.logistics.inventory.check.list"
      :right-title="t('menu.inventory_management.result')"
      :left-size="'small'"
    >
      <template #left>
        <BtcMasterList
          :service="checkService"
          :label-field="'checkType'"
          :enable-key-search="true"
          @select="onCheckSelect"
        />
      </template>
      <template #right>
        <BtcCrud
          ref="crudRef"
          :service="wrappedInventoryCheckService"
          :auto-load="false"
          :on-before-refresh="handleBeforeRefresh"
          style="padding: 10px;"
        >
          <BtcCrudRow>
            <div class="btc-crud-primary-actions">
              <BtcRefreshBtn />
            </div>
            <BtcCrudFlex1 />
            <BtcCrudSearchKey :placeholder="t('logistics.inventory.result.search_placeholder')" />
            <BtcCrudActions>
              <el-button type="info" @click="handleExport" :loading="exportLoading">
                <BtcSvg name="export" class="mr-[5px]" />
                {{ t('ui.export') }}
              </el-button>
            </BtcCrudActions>
          </BtcCrudRow>
          <BtcCrudRow>
            <BtcTable
              :columns="columns"
              :disable-auto-created-at="true"
              border
            />
          </BtcCrudRow>
          <BtcCrudRow>
            <BtcCrudFlex1 />
            <BtcPagination />
          </BtcCrudRow>
          <BtcUpsert
            :items="formItems"
            width="640px"
          />
        </BtcCrud>
      </template>
    </BtcDoubleLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue';
import { useI18n, normalizePageResponse, usePageColumns, usePageForms, getPageConfigFull, logger } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcDoubleLayout, BtcMasterList, BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcTable, BtcPagination, BtcUpsert, BtcCrudActions, BtcSvg } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatTableNumber } from '@btc/shared-utils';
import { service } from '@services/eps';
import { useLogisticsInventoryExport } from './composables/useLogisticsInventoryExport';

defineOptions({
  name: 'btc-logistics-inventory-result',
});

const { t } = useI18n();

const tableGroupRef = ref();
const crudRef = ref();
const selectedCheck = ref<any>(null);
const exportLoading = ref(false);

// 组件卸载标志，用于检查组件是否已卸载
let isUnmounted = false;

onBeforeUnmount(() => {
  isUnmounted = true;
});

// 盘点列表服务（左侧）- 使用物流应用的盘点列表接口
const checkService = {
  list: async (params?: any) => {
    const checkListService = service.logistics?.warehouse?.check?.list;
    if (!checkListService) {
      console.warn('[LogisticsInventoryResult] 盘点列表接口不存在');
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }

    try {
      // 调用后端接口
      const response = await checkListService(params || {});

      // 处理响应格式：后端返回 { code, msg, data } 格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        // 如果响应包含 data 字段，使用 data 字段
        data = response.data;
      }

      // 标准化响应格式
      const page = params?.page || 1;
      const size = params?.size || 10;
      const normalized = normalizePageResponse(data, page, size);

      return {
        list: normalized.list,
        pagination: normalized.pagination,
      };
    } catch (error) {
      logger.error('[LogisticsInventoryResult] 获取盘点列表失败:', error);
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }
  }
};

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('logistics.inventory.result');
const { formItems } = usePageForms('logistics.inventory.result');
const pageConfig = getPageConfigFull('logistics.inventory.result');

// 盘点结果服务（右侧表）- 使用 config.ts 中定义的服务或创建新服务
const baseInventoryCheckService = pageConfig?.service?.result || createCrudServiceFromEps(
  ['logistics', 'base', 'check'],
  service
);

// 包装盘点结果服务，将checkNo作为参数传递
const wrappedInventoryCheckService = {
  ...baseInventoryCheckService,
  async page(params: any) {
    // 检查组件是否已卸载
    if (isUnmounted) {
      return {
        list: [],
        total: 0
      };
    }

    // 安全访问 ref
    if (!tableGroupRef.value) {
      return {
        list: [],
        total: 0
      };
    }

    // 从tableGroupRef获取选中的checkNo
    const selectedItem = tableGroupRef.value?.selectedItem;

    // 构建最终参数
    const finalParams = { ...params };

    // 确保keyword是一个对象
    if (!finalParams.keyword || typeof finalParams.keyword !== 'object' || Array.isArray(finalParams.keyword)) {
      finalParams.keyword = {};
    }

    // 如果选中了盘点项，添加checkNo到keyword
    if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
      finalParams.keyword.checkNo = selectedItem.checkNo;
    }

    // 再次检查组件是否已卸载（异步操作后）
    if (isUnmounted) {
      return {
        list: [],
        total: 0
      };
    }

    try {
      return await baseInventoryCheckService.page(finalParams);
    } catch (error) {
      // 如果组件已卸载，返回空结果
      if (isUnmounted) {
        return {
          list: [],
          total: 0
        };
      }
      throw error;
    }
  }
};

// 刷新前钩子 - 注入 keyword 参数
const handleBeforeRefresh = (params: Record<string, unknown>) => {
  const selectedItem = tableGroupRef.value?.selectedItem;

  // 确保保留所有原始参数（包括 page 和 size）
  const finalParams = { ...params };

  // 获取现有的 keyword 对象（可能包含用户输入的搜索内容）
  const existingKeyword = (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword))
    ? { ...(params.keyword as Record<string, unknown>) }
    : {};

  // 如果选中项有 checkNo 字段，将 checkNo 合并到 keyword 对象中
  if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
    finalParams.keyword = {
      ...existingKeyword,
      checkNo: selectedItem.checkNo
    };
  } else if (Object.keys(existingKeyword).length > 0) {
    // 如果没有 selectedKeyword，但已有 keyword 对象，保留现有的 keyword
    finalParams.keyword = existingKeyword;
  }

  return finalParams;
};

// 盘点选择处理
const onCheckSelect = (check: any) => {
  selectedCheck.value = check;
  // 刷新右侧表格
  if (crudRef.value) {
    crudRef.value.refresh();
  }
};

// 使用导出 composable
const { handleExport: handleExportInternal } = useLogisticsInventoryExport();

// 导出处理函数
const handleExport = async () => {
  // 检查组件是否已卸载
  if (isUnmounted) {
    return;
  }

  // 安全访问 ref
  if (!tableGroupRef.value) {
    return;
  }

  try {
    const crudInstance = crudRef.value?.crud || undefined;

    // 再次检查组件是否已卸载
    if (isUnmounted) {
      return;
    }

    // 获取当前选中的盘点项
    const selectedItem = tableGroupRef.value?.selectedItem;
    let checkType: string | undefined;

    if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
      // 如果选中了盘点项，设置checkNo参数
      if (crudInstance && !isUnmounted) {
        try {
          const currentParams = crudInstance.getParams();
          crudInstance.setParams({
            ...currentParams,
            keyword: {
              ...(currentParams.keyword || {}),
              checkNo: selectedItem.checkNo
            }
          });
        } catch (error) {
          // 组件可能正在卸载，静默处理
          if (import.meta.env.DEV) {
            console.warn('[LogisticsInventoryResult] 设置参数失败（组件可能正在卸载）:', error);
          }
          return;
        }
      }
      // 获取checkType用于文件名
      checkType = selectedItem.checkType;
    }

    // 再次检查组件是否已卸载（异步操作前）
    if (isUnmounted) {
      return;
    }

    await handleExportInternal(crudInstance, checkType);
  } catch (error) {
    // 如果组件已卸载，静默处理错误
    if (isUnmounted) {
      return;
    }
    throw error;
  }
};

const formatNumber = (_row: Record<string, any>, _column: TableColumn, value: any) => formatTableNumber(value);

// 盘点结果表格列（只显示：序号、物料编码、仓位、账面数量、实际数量、差异数量、操作列）
// 扩展配置以支持动态 formatter
const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是数字字段，添加动态 formatter
    if (col.prop === 'bookQty' || col.prop === 'actualQty' || col.prop === 'diffQty') {
      return {
        ...col,
        formatter: formatNumber,
      };
    }
    return col;
  });
});

</script>

<style scoped lang="scss">

</style>

