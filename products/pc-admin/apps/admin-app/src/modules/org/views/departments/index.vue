<template>
  <div class="page">
    <BtcCrud
      ref="crudRef"
      :service="wrappedDeptService"
    >
    <BtcCrudRow>
      <div class="btc-crud-primary-actions">
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcImportBtn
          :template="'/templates/departments.xlsx'"
          :tips="t('org.departments.import_tips')"
          :on-submit="handleImport"
        />
      </div>
      <BtcCrudFlex1 />
      <BtcCrudSearchKey placeholder="搜索部门" />
      <BtcCrudActions>
        <BtcExportBtn :filename="t('org.departments.title')" />
      </BtcCrudActions>
    </BtcCrudRow>

    <BtcCrudRow>
      <BtcTable
        ref="tableRef"
        :columns="columns"
        :op="{ buttons: ['edit', 'delete'] }"
        :context-menu="['refresh']"
        border
      />
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcImportBtn, BtcExportBtn, CommonColumns } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n, usePageColumns, usePageForms, usePageService, getPageConfigFull, logger } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();
let detachCrudRefreshListener: (() => void) | null = null;

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('org.departments');
const { formItems: baseFormItems } = usePageForms('org.departments');
const pageConfig = getPageConfigFull('org.departments');

// 部门服务 - 使用 config.ts 中定义的 service（用于加载选项数据）
const deptService = pageConfig?.service?.dept;

// 使用 config.ts 中定义的 service，并添加删除确认逻辑（用于 CRUD 操作）
const wrappedDeptService = usePageService('org.departments', 'dept', {
  showSuccessMessage: true,
});

// 部门选项数据
const departmentOptions = ref<Array<{ label: string; value: string }>>([]);

// 加载部门选项数据
const loadDepartmentOptions = async () => {
  try {
    const res = await deptService.list({});

    // 处理响应数据结构：res.list 或 res.data.list 或直接是数组
    let dataArray: any[] = [];
    if (res && res.list) {
      dataArray = res.list;
    } else if (res && res.data && res.data.list) {
      dataArray = res.data.list;
    } else if (Array.isArray(res)) {
      dataArray = res;
    }

    const processedData = dataArray
      .filter((dept: any) => dept.id != null && dept.name && dept.parentId === '0') // 只保留顶级部门
      .map((dept: any) => ({
        label: dept.name,
        value: dept.id
      }));

    departmentOptions.value = processedData;
  } catch (_error) {
    logger.error('Failed to load department options:', _error);
    // 出错时设置为空数组
    departmentOptions.value = [];
  }
};


function resolveDepartmentImportFn() {
  const candidates = ['import', 'importBatch', 'importExcel'];
  for (const name of candidates) {
    const fn = (deptService as Record<string, any>)?.[name];
    if (typeof fn === 'function') {
      return fn;
    }
  }
  return null;
}

const handleImport = async (
  payload: { list?: any[]; file?: File; filename?: string },
  helpers: { done?: (error?: unknown) => void; close?: () => void },
) => {
  const { done, close } = helpers ?? {};
  const rows = Array.isArray(payload?.list) ? payload.list.filter(Boolean) : [];

  if (rows.length === 0) {
    message.warning(t('common.org.departments.import_empty'));
    done?.();
    return;
  }

  const importFn = resolveDepartmentImportFn();
  if (!importFn) {
    message.warning(t('common.org.departments.import_unsupported'));
    done?.();
    return;
  }

  try {
    await importFn(rows);
    message.success(t('common.org.departments.import_success'));
    done?.();
    close?.();
    crudRef.value?.crud?.refresh?.();
  } catch (error) {
    logger.error('[Departments] Import failed', error);
    message.error(t('common.org.departments.import_failed'));
    done?.(error);
  }
};

// 部门表格列 - 扩展配置以支持动态 formatter
const columns = computed<TableColumn[]>(() => {
  const cols = baseColumns.value.map(col => {
    // 如果列是 parentId，添加动态 formatter
    if (col.prop === 'parentId') {
      return {
        ...col,
        formatter: (row: any) => {
          if (!row.parentId || row.parentId === '0') return '';
          // 如果 parentId 是部门名称，直接返回
          if (typeof row.parentId === 'string' && isNaN(Number(row.parentId)) && !row.parentId.match(/^[A-Z0-9-]+$/)) {
            return row.parentId;
          }
          // 如果 parentId 是 ID，查找对应的部门名称
          const parentDept = departmentOptions.value.find(dept => dept.value === row.parentId);
          return parentDept ? parentDept.label : row.parentId;
        }
      };
    }
    return col;
  });
  return cols;
});

// 部门表单 - 扩展配置以支持动态 options
const formItems = computed<FormItem[]>(() => {
  const items = baseFormItems.value.map(item => {
    // 如果表单项是 parentId，添加动态 options 和 hook
    if (item.prop === 'parentId') {
      return {
        ...item,
        component: {
          ...item.component,
          options: departmentOptions.value
        },
        hook: {
          bind: (value: any) => {
            // 数据绑定到表单时：将部门名称转换为部门ID
            if (typeof value === 'string' && isNaN(Number(value)) && !value.match(/^[A-Z0-9-]+$/)) {
              const dept = departmentOptions.value.find(d => d.label === value);
              return dept ? dept.value : value;
            }
            return value;
          },
          submit: (value: any) => {
            // 提交时保持部门ID不变
            return value;
          }
        }
      };
    }
    return item;
  });
  return items;
});


// 组件挂载时加载部门选项
onMounted(async () => {
  await loadDepartmentOptions();
  const mitt = crudRef.value?.crud?.mitt;
  if (mitt) {
    const handleRefresh = () => {
      loadDepartmentOptions();
    };
    mitt.on('crud.refresh', handleRefresh);
    detachCrudRefreshListener = () => {
      mitt.off('crud.refresh', handleRefresh);
    };
  }
});

onBeforeUnmount(() => {
  detachCrudRefreshListener?.();
  detachCrudRefreshListener = null;
});
</script>

<style lang="scss" scoped>

</style>
