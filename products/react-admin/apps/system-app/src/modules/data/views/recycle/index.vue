<template>
  <div class="page">
    <btc-crud ref="crudRef" :service="recycleService">
    <btc-crud-row>
      <div class="btc-crud-primary-actions">
        <!-- 刷新按钮 -->
        <btc-refresh-btn />
        <btc-button
          type="success"
          :disabled="tableSelection.length === 0 || loading"
          :loading="loading"
          @click="restore()"
        >
          {{ tableSelection.length === 1 ? $t('recycle.restore') : $t('recycle.batch_restore') }} ({{ tableSelection.length }})
        </btc-button>
      </div>

      <btc-crud-flex1 />
      <!-- 关键字搜索 -->
      <btc-crud-search-key />
      <btc-crud-actions />
    </btc-crud-row>

    <btc-crud-row>
      <!-- 数据表格 -->
      <btc-table
        ref="tableRef"
        :columns="columns"
        :autoHeight="true"
        border
        rowKey="id"
      />
    </btc-crud-row>

    <btc-crud-row>
      <btc-crud-flex1 />
      <!-- 分页控件 -->
      <btc-pagination />
    </btc-crud-row>
  </btc-crud>
  </div>
</template>

<script lang="ts" setup>
import { onActivated } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { usePageColumns, usePageForms, getPageConfigFull, logger } from '@btc/shared-core';
import { requestAdapter } from '@/utils/requestAdapter';

defineOptions({
  name: 'DataRecycle'
});

const { t } = useI18n();

// 加载状态
const loading = ref(false);

// 获取crud实例
const crudRef = ref();
const tableRef = ref();

// 从crud中获取选择状态
const tableSelection = computed(() => {
  return crudRef.value?.selection || [];
});

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('data.recycle');
const { formItems } = usePageForms('data.recycle');
const pageConfig = getPageConfigFull('data.recycle');

// 表格列配置 - 扩展配置以支持动态组件和按钮
const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果是 beforeData 或 params 列，添加自定义组件
    if (col.prop === 'beforeData' || col.prop === 'params') {
      return {
        ...col,
        component: {
          name: 'btc-code-json',
          props: {
            popover: true,
          },
        },
      };
    }
    // 如果是操作列，添加按钮
    if (col.type === 'op') {
      return {
        ...col,
        width: 120,
        buttons: [
          {
            label: t('recycle.restore'),
            type: 'success',
            onClick: ({ scope }: { scope: { row: any } }) => {
              const id = scope.row.id;
              restore(id);
            },
          },
        ],
      };
    }
    return col;
  });
});

// CRUD 配置已在上面定义

// 使用真实的 EPS 服务 - 数据回收站
// 由于deletelog服务可能还未在EPS中注册，我们直接使用HTTP请求
const recycleService = {
  page: async (data?: any) => {
    return await requestAdapter.post('/api/system/log/deletelog/page', data || {}, { notifySuccess: false });
  },
  restore: async (data: any) => {
    return await requestAdapter.post('/api/system/log/deletelog/restore', data, { notifySuccess: false });
  },
  restoreBatch: async (data: any) => {
    return await requestAdapter.post('/api/system/log/deletelog/restore/batch', data, { notifySuccess: false });
  },
  // 添加CRUD必需的方法（数据回收站不需要这些功能）
  add: async () => {
    throw new Error('数据回收站不支持添加操作');
  },
  update: async () => {
    throw new Error('数据回收站不支持更新操作');
  },
  delete: async () => {
    throw new Error('数据回收站不支持删除操作');
  },
  deleteBatch: async () => {
    throw new Error('数据回收站不支持批量删除操作');
  }
};

// 刷新数据
function refresh(params?: any) {
  crudRef.value?.crud?.refresh(params);
}

// 数据恢复
function restore(targetId?: string) {
  // 使用日志记录本身的ID
  const ids = targetId ? [targetId] : tableSelection.value.map(e => e.id);

  // 过滤掉空值
  const validIds = ids.filter(Boolean);

  if (validIds.length === 0) {
    BtcMessage.warning(t('recycle.please_select_data'));
    return;
  }

  const confirmMessage = validIds.length === 1
    ? t('recycle.restore_confirm')
    : t('recycle.batch_restore_confirm', { count: validIds.length });

  BtcConfirm(
    confirmMessage,
    t('common.tip'),
    {
      type: 'warning',
      confirmButtonText: t('common.button.confirm'),
      cancelButtonText: t('common.button.cancel')
    }
  )
    .then(async () => {
      loading.value = true;
      try {
        if (validIds.length === 1) {
          // 单个恢复 - 使用 restore API
          await recycleService.restore({
            id: validIds[0]
          });
          BtcMessage.success(t('recycle.restore_success'));
        } else {
          // 批量恢复 - 使用 restoreBatch API，传递对象格式
          await recycleService.restoreBatch({ ids: validIds });
          BtcMessage.success(t('recycle.batch_restore_success', { count: validIds.length }));
        }

        refresh();
      } catch (err: any) {
        logger.error('恢复数据失败:', err);
        // HTTP拦截器已经处理了错误提示，这里不需要重复显示
      } finally {
        loading.value = false;
      }
    })
    .catch(() => null);
}

// 页面激活时刷新数据
onActivated(() => {
  refresh();
});
</script>

<style scoped>
</style>
