<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="checkService"
      :right-service="wrappedDiffService"
      :table-columns="diffColumns"
      :form-items="diffFormItems"
      :op="opConfig"
      left-title="title.logistics.inventory.check.list"
      :right-title="t('menu.inventory_management.detail')"
      :show-unassigned="false"
      :enable-key-search="true"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :show-create-time="false"
      :label-field="'checkType'"
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
      :title="t('logistics.inventory.diff.detail.title')"
      width="800px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="t('logistics.inventory.diff.fields.diff_reason')">
          {{ detailRow?.diffReason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.diff.fields.process_time')">
          {{ detailRow?.processTime ? formatDateTime(detailRow.processTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.diff.fields.process_remark')">
          {{ detailRow?.processRemark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t('common.button.close') }}</el-button>
      </template>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n, normalizePageResponse, exportJsonToExcel, usePageColumns, usePageForms, getPageConfigFull, logger } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcMasterTableGroup, BtcDialog, BtcSvg } from '@btc/shared-components';
import { formatDateTime, formatTableNumber } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-inventory-detail',
});

const { t } = useI18n();
const tableGroupRef = ref();
const selectedCheck = ref<any>(null);
const exportLoading = ref(false);
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 搜索表单数据（盘点流程ID由左侧列表传递，不参与搜索）
const searchForm = ref({
  materialCode: '',
  position: '',
});

// 仓位选项列表
const positionOptions = ref<{ label: string; value: string }[]>([]);
const positionLoading = ref(false);

// 盘点列表服务（左侧）- 使用后端接口
const checkService = {
  list: async (params?: any) => {
    const checkListService = service.logistics?.warehouse?.check?.list;
    if (!checkListService) {
      console.warn('[InventoryDetail] 盘点列表接口不存在');
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
      logger.error('[InventoryDetail] 获取盘点列表失败:', error);
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
const { columns: baseDiffColumns } = usePageColumns('logistics.inventory.detail');
const { formItems: baseDiffFormItems } = usePageForms('logistics.inventory.detail');
const pageConfig = getPageConfigFull('logistics.inventory.detail');

// 差异记录服务（右侧表）- 使用 config.ts 中定义的服务
const diffService = pageConfig?.service?.detail || service.logistics?.warehouse?.diff;

// 包装差异记录服务，将左侧选中的 checkNo 转换为 keyword.checkNo，并合并搜索表单的值
const wrappedDiffService = {
  ...diffService,
  // 包装 page 方法，合并搜索表单的值并标准化响应格式
  page: async (params: any) => {
    const finalParams = { ...params };

    // 从搜索表单构建搜索参数（始终包含 materialCode 和 position，即使为空也传递空字符串，以便后端正确处理）
    // checkNo 由左侧选中项控制，不在这里处理
    const searchKeyword: Record<string, any> = {
      materialCode: searchForm.value.materialCode?.trim() || '',
      position: searchForm.value.position?.trim() || '',
    };

    // 处理 keyword 参数，合并搜索表单的值
    if (finalParams.keyword !== undefined && finalParams.keyword !== null) {
      const keyword = finalParams.keyword;

      // 如果 keyword 是对象，合并搜索表单的值
      if (typeof keyword === 'object' && !Array.isArray(keyword)) {
        // 移除 ids 字段（如果存在），保留其他字段（包括左侧选中项的 checkNo），然后合并搜索表单的值
        const { ids: _, ...rest } = keyword;
        // 合并逻辑：先应用 params.keyword 中的值（包括左侧选中项的 checkNo），然后应用搜索表单的值（materialCode, position）
        // 这样可以确保左侧选中项的 checkNo 不会被覆盖，同时搜索表单的值会被正确添加
        finalParams.keyword = { ...rest, ...searchKeyword };
      } else if (typeof keyword === 'number' || (typeof keyword === 'string' && keyword !== '')) {
        // 如果 keyword 直接是数字或字符串，转换为 checkNo 对象，并合并搜索表单的值
        finalParams.keyword = { checkNo: keyword, ...searchKeyword };
      } else {
        // 其他情况，直接使用搜索表单的值
        if (Object.keys(searchKeyword).length > 0) {
          finalParams.keyword = searchKeyword;
        }
      }
    } else {
      // 如果 params.keyword 为空，直接使用搜索表单的值
      if (Object.keys(searchKeyword).length > 0) {
        finalParams.keyword = searchKeyword;
      }
    }

    // 调用后端接口（EPS 的 wrapServiceTree 会自动调用 normalizePageParams 处理搜索参数聚合）
    const response = await diffService?.page?.(finalParams);

    // 处理响应格式：后端返回 { code, msg, data } 格式，HTTP 拦截器已经提取了 data
    // data 格式为 { list, page, size, total }
    let data = response;
    if (response && typeof response === 'object' && 'data' in response) {
      data = response.data;
    }

    // 后端返回格式为 { list, total }，BtcCrud 期望的格式也是 { list, total }
    // 直接返回，确保 total 是数字类型
    if (data && Array.isArray(data.list) && typeof data.total !== 'undefined') {
      return {
        list: data.list,
        total: Number(data.total) || 0,
      };
    }

    // 如果数据格式不符合预期，返回空数据
    return {
      list: [],
      total: 0,
    };
  },
  // 更新方法：使用 EPS 服务的 update 接口
  async update(data: any) {
    if (!diffService?.update) {
      throw new Error('未找到更新服务接口');
    }
    // 直接返回结果，成功提示由 useFormSubmit 统一处理
    return diffService.update(data);
  },
  // 导出方法：使用 EPS 服务的 export 接口
  async export(params: any) {
    if (!diffService?.export) {
      throw new Error('未找到导出服务接口');
    }
    return diffService.export(params);
  },
};

// 盘点选择处理
const onCheckSelect = (check: any) => {
  selectedCheck.value = check;
};

// 加载仓位选项
const loadPositionOptions = async () => {
  positionLoading.value = true;
  try {
    // 调用物流子应用的仓位配置表的 page 服务
    const pageService = service.logistics?.base?.position?.page;
    if (!pageService) {
      console.warn('[InventoryDetail] 仓位配置 page 服务不存在');
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
    logger.error('[InventoryDetail] 获取仓位选项失败:', error);
    positionOptions.value = [];
  } finally {
    positionLoading.value = false;
  }
};

// 右侧操作栏搜索字段配置
const rightOpFields = computed(() => [
  {
    type: 'input' as const,
    prop: 'materialCode',
    placeholder: t('logistics.inventory.diff.fields.material_code'),
    width: '150px',
  },
  {
    type: 'select' as const,
    prop: 'position',
    placeholder: t('logistics.inventory.diff.fields.position'),
    width: '100px',
    options: positionOptions.value,
    loading: positionLoading.value,
  },
]);

// 处理搜索（直接刷新即可，wrappedDiffService.page 会从 searchForm 读取值）
const handleSearch = () => {
  if (tableGroupRef.value?.crudRef?.crud) {
    const crud = tableGroupRef.value.crudRef.crud as any;
    // 直接刷新数据，wrappedDiffService.page 会从 searchForm.value 读取搜索参数并合并
    crud.refresh();
  }
};

// 日期格式化函数
const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) => {
  try {
    if (!value || value === null || value === undefined) {
      return '--';
    }
    return formatDateTime(value);
  } catch (error) {
    console.warn('[InventoryDetail] Date format error:', error, value);
    return '--';
  }
};

// 数字格式化函数
const formatNumber = (_row: Record<string, any>, _column: TableColumn, value: any) => {
  return formatTableNumber(value);
};

// 使用 config.ts 中定义的服务（如果需要的话，可以在这里使用）
// const baseDiffService = usePageService('logistics.inventory.detail', 'detail');

// 差异记录表格列（根据 EPS 服务定义的字段）
// 差异原因、处理时间、处理备注在详情弹窗中显示，不在表格中显示
// 扩展配置以支持动态 formatter
const diffColumns = computed(() => {
  return baseDiffColumns.value.map(col => {
    // 如果列是数字字段，添加动态 formatter
    if (col.prop === 'diffQty') {
      return {
        ...col,
        formatter: formatNumber,
      };
    }
    return col;
  });
});

// 操作按钮配置
const opConfig = computed(() => ({
  buttons: [
    {
      label: t('common.button.detail'),
      type: 'warning',
      icon: 'info',
      onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
    },
    'edit',
  ],
}));

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

// 差异记录表单（根据 EPS 服务定义的字段）
// 只有处理人、处理时间、处理备注可以填写，其他字段都是只读
// 扩展配置以支持动态 readonly 属性
const diffFormItems = computed(() => {
  return baseDiffFormItems.value.map(item => {
    // 对于只读字段，添加 readonly 属性
    if (['checkNo', 'materialCode', 'position', 'diffQty', 'diffReason'].includes(item.prop || '')) {
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

// 导出用的列配置（从 config.ts 读取）
const { columns: exportColumns } = usePageColumns('logistics.inventory.detail.export');
const diffExportColumns = computed(() => exportColumns.value);

// 导出功能
const handleExport = async () => {
  if (!diffService?.export) {
    BtcMessage.error(t('common.ui.export_failed') || '导出服务不可用');
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
    const keyword: Record<string, any> = {};

    // 如果选中了盘点项，添加 checkNo
    // selectedItem 是响应式的，会一直保存当前选中的项，不需要等待异步操作
    if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
      keyword.checkNo = selectedItem.checkNo;
    }

    // 添加搜索表单的值（始终包含，即使为空也传递空字符串）
    keyword.materialCode = searchForm.value.materialCode?.trim() || '';
    keyword.position = searchForm.value.position?.trim() || '';

    // 如果 params.keyword 中还有其他字段，也合并进来（搜索字段优先）
    if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
      Object.assign(keyword, { ...params.keyword, ...keyword });
    }

    // 构建导出参数
    const exportParams = {
      ...params,
      keyword,
    };

    // 调用后端导出接口
    const response = await diffService.export(exportParams);

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
    const exportColumns = diffExportColumns.value;
    const header = exportColumns.map(col => col.label || col.prop);
    const data = dataList && dataList.length > 0
      ? dataList.map(item => {
          return exportColumns.map(col => {
            let value = item[col.prop];
            // 格式化处理时间字段
            if (col.prop === 'processTime' && value) {
              try {
                value = formatDateTime(value);
              } catch (error) {
                // 如果格式化失败，使用原值
                console.warn('[InventoryDetail] Failed to format processTime:', error);
              }
            }
            return value ?? '';
          });
        })
      : []; // 空数据时，data 为空数组，只保留表头

    // 使用 exportJsonToExcel 生成并下载 Excel 文件
    exportJsonToExcel({
      header,
      data,
      filename: t('menu.inventory_management.detail') || '差异记录表',
      autoWidth: true,
      bookType: 'xlsx',
    });

    BtcMessage.success(t('platform.common.export_success'));
  } catch (error: any) {
    logger.error('[InventoryDetail] Export failed:', error);
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('common.ui.export_failed');
    BtcMessage.error(errorMsg);
  } finally {
    exportLoading.value = false;
  }
};

// 组件挂载时加载仓位选项
onMounted(() => {
  loadPositionOptions();
});
</script>

<style lang="scss" scoped>

</style>
