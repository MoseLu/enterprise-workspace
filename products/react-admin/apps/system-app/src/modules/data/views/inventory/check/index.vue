<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="checkService"
      :right-service="wrappedResultService"
      :table-columns="resultColumns"
      :form-items="resultFormItems"
      :op="{ buttons: opButtons }"
      left-title="title.inventory.check.list"
      :right-title="t('inventory.result.title')"
      :search-placeholder="t('inventory.result.search_placeholder')"
      :show-unassigned="false"
      :enable-key-search="true"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :label-field="'checkType'"
      :show-create-time="false"
      @select="onCheckSelect"
      :right-op-fields="rightOpFields"
      v-model:right-op-fields-value="searchForm"
      @right-op-search="handleSearch"
    >
      <template #actions>
        <el-button type="info" @click="handleExport" :loading="exportLoading">
          <BtcSvg name="export" class="mr-[5px]" />
          {{ t('ui.export') }}
        </el-button>
      </template>
    </BtcMasterTableGroup>

    <!-- 详情弹窗 -->
    <BtcDialog
      v-model="detailVisible"
      :title="t('inventory.result.detail.title')"
      width="800px"
      :append-to-body="true"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('system.inventory.base.fields.check_no')">
          {{ detailRow?.checkNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="流程ID">
          {{ detailRow?.processId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.material_code')">
          {{ detailRow?.partName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.actual_qty')">
          {{ detailRow?.partQty || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.checker_id')">
          {{ detailRow?.checker || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.storage_location')">
          {{ detailRow?.position || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.created_at')">
          {{ formatDateTimeFriendly(detailRow?.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n, normalizePageResponse, exportJsonToExcel, usePageColumns, usePageForms, getPageConfigFull, logger } from '@btc/shared-core';
import { formatDateTimeFriendly } from '@btc/shared-utils';
import type { TableColumn, FormItem, UseCrudReturn } from '@btc/shared-components';
import { BtcMasterTableGroup } from '@btc/shared-components';
import { service } from '@/services/eps';
import { BtcSvg } from '@btc/shared-components';

defineOptions({
  name: 'BtcDataInventoryCheck'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedCheck = ref<any>(null);
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 搜索表单数据
const searchForm = ref({
  partName: '',
  position: '',
  checker: '',
});

// 仓位选项列表
const positionOptions = ref<{ label: string; value: string }[]>([]);
const positionLoading = ref(false);

// 导出加载状态
const exportLoading = ref(false);

// 加载仓位选项
const loadPositionOptions = async () => {
  positionLoading.value = true;
  try {
    // 调用物流子应用的仓位配置表的 page 服务
    const pageService = service.logistics?.base?.position?.page;
    if (!pageService) {
      console.warn('[InventoryCheck] 仓位配置 page 服务不存在');
      positionOptions.value = [];
      return;
    }

    // 调用 page 接口获取所有仓位数据（不分页或获取足够多的数据）
    const response = await pageService({ page: 1, size: 1000 });

    // 处理响应数据
    let list: any[] = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (response && typeof response === 'object') {
      if ('data' in response) {
        const data = response.data;
        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === 'object') {
          list = Array.isArray(data.list) ? data.list : (Array.isArray(data.data) ? data.data : []);
        }
      } else if ('list' in response) {
        list = Array.isArray(response.list) ? response.list : [];
      }
    }

    // 提取仓位字段作为选项的 label 和 value
    positionOptions.value = list
      .map((item: any) => {
        const position = item?.position;
        if (!position) {
          return null;
        }
        return {
          label: String(position),
          value: String(position),
        };
      })
      .filter((item): item is { label: string; value: string } => item !== null);

    // 去重（基于 value）
    const uniqueMap = new Map<string, { label: string; value: string }>();
    positionOptions.value.forEach(item => {
      if (!uniqueMap.has(item.value)) {
        uniqueMap.set(item.value, item);
      }
    });
    positionOptions.value = Array.from(uniqueMap.values());

    // 对选项进行排序（按 label 字母顺序）
    positionOptions.value.sort((a, b) => {
      return a.label.localeCompare(b.label, 'zh-CN', { numeric: true, sensitivity: 'base' });
    });
  } catch (error) {
    logger.error('[InventoryCheck] 获取仓位选项失败:', error);
    positionOptions.value = [];
  } finally {
    positionLoading.value = false;
  }
};

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.detail'),
    type: 'warning',
    icon: 'info',
    onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
  },
  'edit',
]);

// 盘点列表服务（左侧）- 使用后端接口
const checkService = {
  list: async (params?: any) => {
    const checkListService = service.logistics?.warehouse?.check?.list;
    if (!checkListService) {
      console.warn('[InventoryCheck] 盘点列表接口不存在');
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
      logger.error('[InventoryCheck] 获取盘点列表失败:', error);
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

// 盘点结果服务（右侧表），使用新的data-source API
const resultService = service.system?.base?.dataSource;

const wrappedResultService = {
  ...resultService,
  async delete(id: string | number) {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    if (!resultService?.delete) {
      throw new Error('未找到删除服务接口');
    }
    await resultService.delete(id);
    message.success(t('crud.message.delete_success'));
  },
  async deleteBatch(ids: (string | number)[]) {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    if (resultService?.deleteBatch) {
      await resultService.deleteBatch(ids);
    } else if (resultService?.delete) {
      await Promise.all(ids.map(id => resultService.delete!(id)));
    } else {
      throw new Error('未找到删除服务接口');
    }
    message.success(t('crud.message.delete_success'));
  },
};

// 盘点选择处理
const onCheckSelect = (check: any) => {
  selectedCheck.value = check;
  // 可以根据选中的盘点，过滤右侧的盘点结果
  // 这里可以通过 tableGroupRef 来刷新右侧表格
};

// 右侧操作栏搜索字段配置
const rightOpFields = computed(() => [
  {
    type: 'input' as const,
    prop: 'partName',
    placeholder: t('system.material.fields.material_code'),
    width: '150px',
  },
  {
    type: 'select' as const,
    prop: 'position',
    placeholder: t('inventory.result.fields.storage_location'),
    width: '100px',
    options: positionOptions.value,
    loading: positionLoading.value,
  },
  {
    type: 'input' as const,
    prop: 'checker',
    placeholder: t('system.inventory.base.fields.checker_id'),
    width: '150px',
  },
]);

// 处理搜索
const handleSearch = () => {
  if (tableGroupRef.value?.crudRef?.crud) {
    const crud = tableGroupRef.value.crudRef.crud as UseCrudReturn<any>;
    // 设置搜索参数
    crud.setParams({
      keyword: {
        partName: searchForm.value.partName || '',
        position: searchForm.value.position || '',
        checker: searchForm.value.checker || '',
      }
    });
    // 刷新数据
    crud.refresh();
  }
};

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

// 导出用的列配置
const { columns: exportColumns } = usePageColumns('data.inventory.check.export');
const resultExportColumns = computed(() => exportColumns.value);

// 导出功能
const handleExport = async () => {
  if (!resultService?.export) {
    BtcMessage.error(t('platform.common.export_failed') || '导出服务不可用');
    return;
  }

  exportLoading.value = true;

  try {
    // 获取当前筛选参数（用于获取 page、size 等分页参数）
    const params = tableGroupRef.value?.crudRef?.getParams?.() || {};

    // 直接从 viewGroupRef 读取当前选中的项
    // selectedItem 是一个响应式 ref，存储在组件实例的内存中
    // 当用户切换盘点项目时，selectedItem.value 会立即更新（同步操作）
    // 这个值会一直保存在内存中，直到组件销毁，所以不需要 localStorage
    const viewGroup = tableGroupRef.value?.viewGroupRef;
    const selectedItem = viewGroup?.selectedItem;

    // 手动构建 keyword 对象，确保包含 checkNo 和搜索条件
    const keyword: Record<string, any> = {
      partName: searchForm.value.partName || '',
      position: searchForm.value.position || '',
      checker: searchForm.value.checker || '',
    };

    // 如果选中了盘点项，添加 checkNo 到 keyword
    // selectedItem 是响应式的，会一直保存当前选中的项，不需要等待异步操作
    if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
      keyword.checkNo = selectedItem.checkNo;
    }

    // 如果 params.keyword 中还有其他字段，也合并进来
    if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
      Object.assign(keyword, params.keyword);
    }

    // 构建导出参数
    const exportParams = {
      ...params,
      keyword,
    };

    // 调用后端导出接口
    const response = await resultService.export(exportParams);

    // 处理响应数据
    let dataList: any[] = [];
    if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (Array.isArray(response)) {
        dataList = response;
      }
    }

    // 准备导出数据（即使为空也生成 Excel，只有表头）
    const exportColumns = resultExportColumns.value;
    const header = exportColumns.map(col => col.label || col.prop);
    const data = dataList && dataList.length > 0
      ? dataList.map(item => {
          return exportColumns.map(col => {
            const value = item[col.prop];
            return value ?? '';
          });
        })
      : []; // 空数据时，data 为空数组，只保留表头

    // 使用 exportJsonToExcel 生成并下载 Excel 文件
    exportJsonToExcel({
      header,
      data,
      filename: t('inventory.result.title') || '实盘数据',
      autoWidth: true,
      bookType: 'xlsx',
    });

    BtcMessage.success(t('platform.common.export_success'));
  } catch (error: any) {
    logger.error('[InventoryCheck] Export failed:', error);
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('platform.common.export_failed');
    BtcMessage.error(errorMsg);
  } finally {
    exportLoading.value = false;
  }
};

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('data.inventory.check');
const { formItems: baseFormItems } = usePageForms('data.inventory.check');
const pageConfig = getPageConfigFull('data.inventory.check');

// 盘点结果表格列（根据新的data-source API字段）
const resultColumns = computed(() => baseColumns.value);

// 盘点结果表单（根据新的data-source API字段）
// 扩展配置以支持动态 readonly 属性
const resultFormItems = computed(() => {
  return baseFormItems.value.map(item => {
    // 对于只读字段，添加 readonly 属性
    if (['partName', 'checker', 'position'].includes(item.prop || '')) {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            readonly: true,
          },
        },
      };
    }
    return item;
  });
});

// 组件挂载时加载仓位选项
onMounted(() => {
  loadPositionOptions();
});
</script>

<style lang="scss" scoped>

</style>
