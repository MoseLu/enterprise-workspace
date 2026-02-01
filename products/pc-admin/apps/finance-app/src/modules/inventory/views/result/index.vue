<template>
  <div class="page">
    <BtcDoubleLayout
      ref="tableGroupRef"
      left-title="title.finance.inventory.check.list"
      :right-title="t('menu.finance.inventory_management.result')"
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
          :service="wrappedFinanceInventoryService"
          :auto-load="false"
          :on-before-refresh="handleBeforeRefresh"
          style="padding: 10px;"
        >
          <BtcCrudRow>
            <div class="btc-crud-primary-actions">
              <BtcRefreshBtn />
            </div>
            <BtcCrudFlex1 />
            <BtcCrudSearchKey :placeholder="t('finance.inventory.result.search_placeholder')" />
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
import { ref, onBeforeUnmount, onMounted, nextTick } from 'vue';
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService } from '@btc/shared-core';
import { BtcSvg, BtcDoubleLayout, BtcMasterList, BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcTable, BtcPagination, BtcUpsert, BtcCrudActions } from '@btc/shared-components';
import { useFinanceInventoryExport } from './composables/useFinanceInventoryExport';

defineOptions({
  name: 'btc-finance-inventory-result',
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

// 从 config.ts 读取配置
const { columns } = usePageColumns('finance.inventory.result');
const { formItems } = usePageForms('finance.inventory.result');
const pageConfig = getPageConfigFull('finance.inventory.result');

// 使用 composables
const { handleExport: handleExportInternal } = useFinanceInventoryExport();

// 盘点列表服务（左侧）- 使用物流应用的盘点列表接口
const checkService = pageConfig?.service?.checkList;

// 财务盘点结果服务 - 使用 usePageService 包装
const baseFinanceInventoryService = usePageService('finance.inventory.result', 'financeResult');

// 包装财务盘点结果服务，将checkNo作为参数传递
const wrappedFinanceInventoryService = {
  ...baseFinanceInventoryService,
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

    // 根据EPS配置的fieldEq，添加必需的字段
    if (finalParams.keyword.materialCode === undefined) {
      finalParams.keyword.materialCode = '';
    }
    if (finalParams.keyword.position === undefined) {
      finalParams.keyword.position = '';
    }

        // 再次检查组件是否已卸载（异步操作后）
        if (isUnmounted) {
          return {
            list: [],
            total: 0
          };
        }

        try {
          return await baseFinanceInventoryService.page(finalParams);
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
  // 刷新右侧表格 - 使用 nextTick 确保 crudRef 已准备好
  nextTick(() => {
    if (crudRef.value && !isUnmounted) {
      crudRef.value.refresh();
    } else if (!isUnmounted) {
      // 如果 nextTick 后还是没有引用，再延迟一点
      setTimeout(() => {
        if (crudRef.value && !isUnmounted) {
          crudRef.value.refresh();
        }
      }, 100);
    }
  });
};

// 页面挂载时，检查是否有选中的项，如果有则自动加载数据
onMounted(() => {
  // 延迟检查，确保 BtcMasterViewGroup 已经加载完成并可能已经选中了第一项
  nextTick(() => {
    if (isUnmounted) return;

    // 检查是否有选中的盘点项
    const selectedItem = tableGroupRef.value?.selectedItem;
    if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo && crudRef.value) {
      // 如果有选中的项，自动加载数据
      crudRef.value.refresh();
    } else if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
      // 如果选中了项但 crudRef 还没准备好，再延迟一点
      setTimeout(() => {
        if (crudRef.value && !isUnmounted) {
          crudRef.value.refresh();
        }
      }, 200);
    }
  });
});

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
            console.warn('[FinanceInventoryResult] 设置参数失败（组件可能正在卸载）:', error);
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

</script>

<style scoped lang="scss">

</style>

