<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedBomService"
      :table-columns="bomColumns"
      :form-items="bomFormItems"
      left-title="title.inventory.domains"
      :right-title="t('menu.inventory.data_source.bom')"
      :show-unassigned="false"
      :enable-key-search="false"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :show-toolbar="true"
      @select="onDomainSelect"
    >
      <template #add-btn>
        <BtcImportBtn
          :columns="bomColumns"
          :on-submit="handleImport"
        />
      </template>
      <template #actions>
        <el-button type="info" @click="handleExport" :loading="exportLoading">
          <BtcSvg name="export" class="mr-[5px]" />
          {{ t('ui.export') }}
        </el-button>
      </template>
    </BtcMasterTableGroup>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from '@/utils/use-message';
import { useI18n, exportJsonToExcel, usePageColumns, usePageForms, getPageConfigFull, logger } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcMasterTableGroup, BtcImportBtn, IMPORT_FILENAME_KEY, IMPORT_FORBIDDEN_KEYWORDS_KEY, BtcMessage } from '@btc/shared-components';
import { service } from '@/services/eps';
import { BtcSvg } from '@btc/shared-components';

defineOptions({
  name: 'BtcDataInventoryBom'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);
const exportLoading = ref(false);

// 统一导出/导入文件名
const exportFilename = computed(() => t('menu.inventory.data_source.bom'));

// 不强制要求文件名匹配（允许任意文件名，只要不包含禁止关键词即可）
// provide(IMPORT_FILENAME_KEY, exportFilename); // 注释掉，不强制文件名匹配
provide(IMPORT_FORBIDDEN_KEYWORDS_KEY, ['SysPro', 'BOM表', '(', ')', '（', '）']);

// 左侧域列表使用物流域的仓位配置的 me 接口
const domainService = {
  list: async () => {
    try {
      // 调用物流域仓位配置的 me 接口
      const response = await service.logistics?.base?.position?.me?.();

      // 处理响应数据
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      // me 接口可能直接返回数组，也可能返回包含 list 的对象
      const list = Array.isArray(data) ? data : (data?.list || []);

      // 判断返回的数据是域列表还是仓位列表
      // 如果第一个元素有 domianId 或 domainId 字段，说明是域列表
      const firstItem = list[0];
      const isDomainList = firstItem && (firstItem.domianId || firstItem.domainId);

      if (isDomainList) {
        // 直接返回域列表，兼容 domianId 和 domainId 两种字段名
        const domainMap = new Map<string, any>();
        list.forEach((item: any) => {
          const domainId = item.domianId || item.domainId; // 兼容拼写错误
          if (domainId && !domainMap.has(domainId)) {
            domainMap.set(domainId, {
              id: domainId,
              domainId: domainId,
              name: item.name || '',
              domainCode: domainId,
              value: domainId,
            });
          }
        });
        return Array.from(domainMap.values());
      } else {
        // 从仓位数据中提取唯一的域信息（根据 domainId 和 name 去重）
        const domainMap = new Map<string, any>();
        list.forEach((item: any) => {
          const domainId = item.domainId;
          if (domainId && !domainMap.has(domainId)) {
            domainMap.set(domainId, {
              id: domainId,
              domainId: domainId,
              name: item.name || '',
              domainCode: domainId,
              value: domainId,
            });
          }
        });
        return Array.from(domainMap.values());
      }
    } catch (error) {
      logger.error('[InventoryBom] Failed to load domains from position service:', error);
      return [];
    }
  }
};

// 物料构成表服务（右侧表），使用后端API
const bomService = service.system?.base?.bom;

const wrappedBomService = {
  ...bomService,
  // 包装 page 方法，将左侧选中的域 ID 转换为 keyword.domainId
  // EPS 层会自动根据 search 配置封装其他字段到 keyword 对象中
  page: async (params: any) => {
    const finalParams = { ...params };

    // 处理 keyword 参数，将 ids 转换为 domainId
    if (finalParams.keyword !== undefined && finalParams.keyword !== null) {
      const keyword = finalParams.keyword;

      // 如果 keyword 是对象且包含 ids 字段（BtcMasterTableGroup 的标准格式）
      if (typeof keyword === 'object' && !Array.isArray(keyword) && keyword.ids) {
        const ids = Array.isArray(keyword.ids) ? keyword.ids : [keyword.ids];
        // 取第一个 ID 作为 domainId
        if (ids.length > 0 && ids[0] !== undefined && ids[0] !== null && ids[0] !== '') {
          // 将 domainId 放在 keyword 对象中，保留其他字段
          finalParams.keyword = { ...keyword, domainId: ids[0] };
          // 删除 ids 字段
          delete finalParams.keyword.ids;
        } else {
          // 如果没有有效的 ID，删除 ids 字段，保留其他字段
          const { ids: _, ...rest } = keyword;
          finalParams.keyword = rest;
        }
      } else if (typeof keyword === 'number' || (typeof keyword === 'string' && keyword !== '')) {
        // 如果 keyword 直接是数字或字符串，转换为 domainId
        finalParams.keyword = { domainId: keyword };
      }
    }

    // EPS 层会自动根据 search 配置补充其他字段（如 parentNode, childNode, checkType 等）
    return bomService?.page?.(finalParams);
  },
  // 移除删除相关方法，因为不允许删除
  delete: undefined,
  deleteBatch: undefined,
};

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
  // 可以根据选中的域，过滤右侧的物料构成表数据
  // 这里可以通过 tableGroupRef 来刷新右侧表格
};

const resolveSelectedDomainId = () => {
  const domain = selectedDomain.value;
  if (!domain) {
    return null;
  }

  // me 接口返回的域数据通常包含 id/domainCode/name 等字段
  // 优先使用实际的 domainId/id，其次才回退到 code/value
  return (
    domain.domainId ??
    domain.id ??
    domain.domainCode ??
    domain.value ??
    domain.code ??
    null
  );
};

// 处理导入
const handleImport = async (
  data: any,
  { done, close }: { done: () => void; close: () => void }
) => {
  try {
    const rows = (data?.list || data?.rows || []).map((row: Record<string, any>) => {
      const { _index, ...rest } = row || {};
      return rest;
    });
    if (!rows.length) {
      const warnMessage = data?.filename
        ? t('common.import.no_data_or_mapping')
        : t('inventory.data_source.bom.import.no_file');
      message.warning(warnMessage);
      done();
      return;
    }

    const domainId = resolveSelectedDomainId();
    if (!domainId) {
      message.warning(t('title.inventory.domainsSelectRequired') || '请先选择左侧域');
      done();
      return;
    }

    // BtcImportBtn 已经根据 columns 配置自动进行了列名映射（中文列名 -> 字段名）
    // 所以这里直接使用映射后的字段名即可
    const normalizedRows = rows.map((row: Record<string, any>) => ({
      processId: row.processId,
      checkNo: row.checkNo,
      domainId: row.domainId ?? domainId,
      parentNode: row.parentNode,
      childNode: row.childNode,
      childQty: row.childQty ? Number(row.childQty) : undefined,
      checkType: row.checkType,
      remark: row.remark,
    }));

    const payload = {
      domainId,
      list: normalizedRows,
    };

    const response = await service.system?.base?.bom?.import?.(payload);

    // 检查响应中的 code 字段，如果 code 不是 200/1000/2000，说明导入失败
    // 注意：响应拦截器可能返回原始 response 对象（AxiosResponse）或业务数据
    // 需要同时检查 response.data.code 和 response.code
    let responseData: any = response;
    if (response && typeof response === 'object' && 'data' in response) {
      // 如果是 AxiosResponse 对象，提取 data
      responseData = (response as any).data;
    }

    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      const code = responseData.code;
      if (code !== 200 && code !== 1000 && code !== 2000) {
        const errorMsg = responseData.msg || responseData.message || t('inventory.data_source.bom.import.failed');
        message.error(errorMsg);
        done();
        return;
      }
    }

    message.success(t('inventory.data_source.bom.import.success'));
    tableGroupRef.value?.crudRef?.crud?.refresh();
    close();
  } catch (error) {
    logger.error('[InventoryBom] import failed:', error);
    const errorMsg = (error as any)?.response?.data?.msg || (error as any)?.msg || t('inventory.data_source.bom.import.failed');
    message.error(errorMsg);
    done();
  }
};

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('data.inventory.bom');
const { formItems } = usePageForms('data.inventory.bom');
const pageConfig = getPageConfigFull('data.inventory.bom');

// 物料构成表表格列（移除选择列和操作列，不包含盘点类型）
const bomColumns = computed(() => baseColumns.value);

// 导出用的列（不包含时间字段和盘点类型字段）
const { columns: exportColumns } = usePageColumns('data.inventory.bom.export');
const bomExportColumns = computed(() => exportColumns.value);

// 直接导出（使用后端导出接口，返回 JSON 数据，前端生成 Excel）
const handleExport = async () => {
  if (!service.system?.base?.bom?.export) {
    BtcMessage.error(t('platform.common.export_failed') || '导出服务不可用');
    return;
  }

  exportLoading.value = true;

  try {
    // 获取当前筛选参数
    const params = tableGroupRef.value?.crudRef?.getParams?.() || {};

    // 获取当前选中的域 ID
    const domainId = resolveSelectedDomainId();

    // 构建导出参数：将 domainId 放在 keyword 对象内部
    const exportParams = {
      keyword: {
        ...(params.keyword || {}),
        domainId,
      },
      page: params.page,
      size: params.size,
      order: params.order,
      sort: params.sort,
    };

    // 调用后端导出接口，返回 JSON 数据
    const response = await service.system.base.bom.export(exportParams);

    // 检查响应中的 code 字段，如果 code 不是 200/1000/2000，说明导出失败
    // 注意：只对非Syspro BOM表进行此检查
    if (response && typeof response === 'object' && 'code' in response) {
      const code = response.code;
      if (code !== 200 && code !== 1000 && code !== 2000) {
        // 导出失败，显示错误信息，不生成文件
        const errorMsg = response.msg || t('platform.common.export_failed') || '导出失败';
        BtcMessage.error(errorMsg);
        return;
      }
    }

    // 处理响应数据：只有当 code 为 200 且 data 为数组时才允许导出
    let dataList: any[] = [];
    if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        dataList = response.data;
      } else if (Array.isArray(response)) {
        dataList = response;
      } else if ('data' in response && !Array.isArray(response.data)) {
        // data 存在但不是数组，说明导出失败
        const errorMsg = response.msg || t('platform.common.export_failed') || '导出失败：数据格式不正确';
        BtcMessage.error(errorMsg);
        return;
      }
    }

    // 准备导出数据（即使为空也生成 Excel，只有表头）
    const exportColumns = bomExportColumns.value;
    const header = exportColumns.map(col => col.label || col.prop || '');
    const data = dataList && dataList.length > 0
      ? dataList.map(item => {
          return exportColumns.map(col => {
            const value = col.prop ? item[col.prop] : undefined;
            return value ?? '';
          });
        })
      : []; // 空数据时，data 为空数组，只保留表头

    // 使用 exportJsonToExcel 生成并下载 Excel 文件
    exportJsonToExcel({
      header,
      data,
      filename: exportFilename.value || '物料构成',
      autoWidth: true,
      bookType: 'xlsx',
    });

    BtcMessage.success(t('platform.common.export_success'));
  } catch (error: any) {
    logger.error('[InventoryBom] Export failed:', error);
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('platform.common.export_failed');
    BtcMessage.error(errorMsg);
  } finally {
    exportLoading.value = false;
  }
};

// 物料构成表表单（使用 config.ts 中的配置）
const bomFormItems = computed(() => formItems.value);

// 导出功能已由 BtcImportExportGroup 组件处理，不再需要单独的导出函数
</script>

<style lang="scss" scoped>

</style>
