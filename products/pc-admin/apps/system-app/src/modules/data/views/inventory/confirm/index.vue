<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="checkService"
      :right-service="approvalService"
      :table-columns="approvalColumns"
      :form-items="approvalFormItems"
      :op="opConfig"
      left-title="title.inventory.check.list"
      :right-title="t('inventory.confirm.title')"
      :search-placeholder="t('inventory.confirm.search_placeholder')"
      :show-unassigned="false"
      :enable-key-search="true"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :label-field="'checkType'"
      @select="onCheckSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n, normalizePageResponse, usePageColumns, usePageForms, getPageConfigFull } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcMasterTableGroup, BtcMessage, BtcConfirm } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryConfirm'
});

const { t } = useI18n();
const tableGroupRef = ref();
const selectedCheck = ref<any>(null);

// 从 config.ts 读取配置（必须在其他使用 pageConfig 的代码之前）
const { columns: baseColumns } = usePageColumns('data.inventory.confirm');
const { formItems } = usePageForms('data.inventory.confirm');
const pageConfig = getPageConfigFull('data.inventory.confirm');

// 盘点列表服务（左侧）- 使用后端接口
const checkService = {
  list: async (params?: any) => {
    const checkListService = service.logistics?.warehouse?.check?.list;
    if (!checkListService) {
      console.warn('[InventoryConfirm] 盘点列表接口不存在');
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
      // 响应拦截器已显示错误消息，不需要在控制台打印
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

// 流程确认服务（右侧）- 使用 config.ts 中定义的服务或创建新服务
const baseApprovalService = pageConfig?.service?.inventoryConfirm || service.system?.base?.approval;
const approvalService = {
  page: async (params?: any) => {
    const approvalPageService = service.system?.base?.approval?.page;
    if (!approvalPageService) {
      return {
        list: [],
        total: 0
      };
    }

    try {
      // BtcMasterTableGroup 会自动将左侧选中项的 checkNo 传递到 keyword 对象中
      // 这里只需要直接调用接口即可
      const response = await approvalPageService(params || {});

      // 处理响应格式：后端返回 { code, msg, data } 格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      // 标准化响应格式
      const page = params?.page || 1;
      const size = params?.size || 10;
      const normalized = normalizePageResponse(data, page, size);

      // BtcMasterTableGroup 期望返回 { list, total } 格式，而不是 { list, pagination }
      return {
        list: normalized.list,
        total: normalized.total,
      };
    } catch (error) {
      // 响应拦截器已显示错误消息，不需要在控制台打印
      return {
        list: [],
        total: 0
      };
    }
  },
  list: async () => {
    return [];
  },
  get: async () => {
    return null;
  },
  add: async () => {
    return null;
  },
  update: async () => {
    return null;
  },
  delete: async () => {
    return null;
  },
  deleteBatch: async () => {
    return null;
  },
};

// 盘点选择处理
const onCheckSelect = (check: any) => {
  selectedCheck.value = check;
  // BtcMasterTableGroup 会自动刷新右侧表格，不需要手动调用 refresh()
};

// 判断是否已确认
const isConfirmed = (row: any): boolean => {
  const status = row?.status;
  if (!status) return false;
  // 支持多种状态值：'已确认'、'confirmed'、'CONFIRMED' 等
  const statusStr = String(status);
  return statusStr === '已确认' || statusStr.toLowerCase() === 'confirmed' || statusStr === 'CONFIRMED';
};

// 确认处理（针对单行数据）
const handleConfirm = async (row: any) => {
  // 检查是否已确认
  if (isConfirmed(row)) {
    BtcMessage.warning(t('inventory.confirm.already_confirmed') || '已确认，无需再次确认！');
    return;
  }

  // 获取该行的 id
  const id = row?.id;

  if (!id) {
    BtcMessage.warning(t('inventory.confirm.id_not_found') || '数据ID不存在');
    return;
  }

  // 获取 checkNo 用于显示（如果有）
  const checkNo = row?.checkNo || selectedCheck.value?.checkNo;

  try {
    // 二次确认对话框
    await BtcConfirm(
      t('inventory.confirm.confirm_message') || `确定要确认流程 ${checkNo || id} 吗？`,
      t('inventory.confirm.confirm_title') || '确认',
      {
        confirmButtonText: t('common.button.confirm') || '确定',
        cancelButtonText: t('common.button.cancel') || '取消',
        type: 'warning'
      }
    );

    // 调用确认接口
    const confirmService = service.system?.base?.approval?.confirm;
    if (!confirmService) {
      BtcMessage.error(t('inventory.confirm.service_not_found') || '确认接口不存在');
      return;
    }

    // 传递 id
    const response = await confirmService({ id });

    // 处理响应
    // 响应拦截器在成功时会返回 data 字段，而不是整个响应对象
    // 如果接口调用成功（没有抛出异常），说明操作成功
    // 检查响应：如果有 code 字段，检查是否为成功状态码；如果没有 code 字段，说明拦截器已处理，直接认为成功
    if (response && typeof response === 'object' && 'code' in response) {
      // 如果响应包含 code 字段，检查状态码
      if (response.code === 2000 || response.code === 200 || response.code === 1000) {
        BtcMessage.success(response.msg || t('inventory.confirm.success') || '确认成功');
        // 刷新右侧表格
        if (tableGroupRef.value?.crudRef) {
          tableGroupRef.value.crudRef.refresh();
        }
      } else {
        BtcMessage.error(response.msg || t('inventory.confirm.failed') || '确认失败');
      }
    } else {
      // 响应拦截器已处理，如果没有抛出异常，说明操作成功
      BtcMessage.success(t('inventory.confirm.success') || '确认成功');
      // 刷新右侧表格
      if (tableGroupRef.value?.crudRef) {
        tableGroupRef.value.crudRef.refresh();
      }
    }
  } catch (error: any) {
    // 用户取消操作
    if (error === 'cancel' || error?.message === 'cancel') {
      return;
    }
    // 响应拦截器已显示错误消息，不需要在控制台打印
    // 响应拦截器会在业务错误时显示消息，这里不需要再显示
  }
};

// 操作列配置（根据状态动态渲染按钮）
// 注意：BtcMasterTableGroup 期望 op.buttons 是一个数组，而不是函数
// 如果需要根据行数据动态显示按钮，需要在按钮的 onClick 中处理状态判断
const opConfig = computed(() => ({
  buttons: [
    {
      label: t('inventory.confirm.confirm') || '确认',
      type: 'primary',
      onClick: ({ scope }: any) => {
        const row = scope?.row;
        handleConfirm(row);
      }
    }
  ]
}));

// 流程确认表格列配置
// 扩展配置以支持动态 formatter
const approvalColumns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是日期字段，添加动态 formatter
    if (col.prop === 'createdAt') {
      return {
        ...col,
        formatter: (row: any) => {
          if (!row.createdAt) return '-';
          return new Date(row.createdAt).toLocaleString('zh-CN');
        },
      };
    }
    return col;
  });
});

// 流程确认表单项配置（暂时不需要表单）
const approvalFormItems = computed(() => formItems.value);
</script>

<style lang="scss" scoped>

</style>
