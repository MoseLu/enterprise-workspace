<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryInfoService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcTableButton
            class="btc-crud-action-icon"
            v-if="isMinimal"
            :config="pullButtonConfig"
          />
          <el-button
            v-else
            type="warning"
            class="btc-crud-btn"
            :loading="pullLoading"
            @click="handlePullData"
          >
            <BtcSvg name="pull" class="btc-crud-btn__icon" />
            <span class="btc-crud-btn__text">{{ t('logistics.inventory.base.button.pull') }}</span>
          </el-button>
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('menu.inventory_management.info')" />
        </BtcCrudActions>
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
          border
          :op="{ buttons: opButtons }"
        />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>

      <BtcUpsert ref="upsertRef" :items="formItems" width="680px" />
    </BtcCrud>

    <!-- 子流程详情弹窗 -->
    <BtcDialog
      v-model="subProcessDialogVisible"
      :title="t('logistics.inventory.sub_process.detail.title')"
      width="1200px"
      @closed="handleSubProcessDialogClosed"
    >
      <BtcCrud ref="subProcessCrudRef" :service="subProcessService" :auto-load="false">
        <BtcCrudRow>
          <div class="btc-crud-primary-actions">
            <BtcRefreshBtn />
            <BtcAddBtn />
          </div>
          <BtcCrudFlex1 />
          <div class="btc-crud-right-group">
            <BtcCrudSearchKey />
          </div>
        </BtcCrudRow>

        <BtcCrudRow>
          <BtcTable
            ref="subProcessTableRef"
            :columns="subProcessColumns"
            :disable-auto-created-at="true"
            border
            :op="{ buttons: ['edit'] }"
          />
        </BtcCrudRow>

        <BtcCrudRow>
          <BtcCrudFlex1 />
          <BtcPagination />
        </BtcCrudRow>

        <BtcUpsert
          ref="subProcessUpsertRef"
          :items="subProcessFormItems"
          width="800px"
          :on-submit="handleSubProcessSubmit"
        />
      </BtcCrud>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n, useThemePlugin, usePageColumns, usePageForms, usePageService, logger } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert, BtcMessage, BtcSvg, BtcTableButton, BtcDialog } from '@btc/shared-components';
import type { BtcTableButtonConfig } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-inventory-info',
});

const { t } = useI18n();
const theme = useThemePlugin();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();
const pullLoading = ref(false);
const subProcessDialogVisible = ref(false);
const currentCheckNo = ref<string>('');
const subProcessCrudRef = ref();
const subProcessTableRef = ref();
const subProcessUpsertRef = ref();

const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('logistics.inventory.info');
const { formItems: baseFormItems } = usePageForms('logistics.inventory.info');

// 使用 config.ts 中定义的服务
const inventoryInfoService = usePageService('logistics.inventory.info', 'info');

// 子流程服务
const subProcessService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'warehouse', 'subProcess'],
  service
);

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

// 拉取数据
const handlePullData = async () => {
  try {
    pullLoading.value = true;

    // 调用拉取数据的API
    await service.logistics?.warehouse?.check?.pull?.();

    BtcMessage.success(t('logistics.inventory.base.pull.success'));

    // 刷新表格数据
    crudRef.value?.crud?.loadData?.();
  } catch (error: any) {
    logger.error('[InventoryInfo] Pull data failed:', error);
    BtcMessage.error(error?.message || t('logistics.inventory.base.pull.failed'));
  } finally {
    pullLoading.value = false;
  }
};

const pullButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'pull',
  tooltip: t('logistics.inventory.base.button.pull'),
  ariaLabel: t('logistics.inventory.base.button.pull'),
  type: 'warning',
  disabled: pullLoading.value,
  onClick: () => {
    if (!pullLoading.value) {
      handlePullData();
    }
  },
}));

// 扩展配置以支持动态 formatter
const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是日期字段，添加动态 formatter
    if (col.prop === 'startTime' || col.prop === 'endTime' || col.prop === 'createdAt' || col.prop === 'updateAt') {
      return {
        ...col,
        formatter: formatDateCell,
      };
    }
    return col;
  });
});

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.detail'),
    type: 'warning',
    icon: 'info',
    onClick: ({ scope }: { scope: any }) => handleSubProcessDetail(scope.row),
  },
  {
    label: t('common.button.edit'),
    type: 'primary',
    icon: 'Edit',
    onClick: ({ scope }: { scope: any }) => {
      const row = scope?.row;
      if (!row) {
        return;
      }
      // 获取 crud 实例并调用编辑功能
      const crudInstance = crudRef.value?.crud;
      if (crudInstance?.handleEdit) {
        crudInstance.handleEdit(row);
      }
    },
  },
]);

// 扩展表单配置以支持动态 options
const formItems = computed(() => {
  return baseFormItems.value.map(item => {
    // 如果表单项是 checkStatus，添加动态 options
    if (item.prop === 'checkStatus') {
      return {
        ...item,
        component: {
          ...item.component,
          options: [
            { label: t('logistics.inventory.base.fields.check_status.notStarted'), value: 'notStarted' },
            { label: t('logistics.inventory.base.fields.check_status.inProgress'), value: 'inProgress' },
            { label: t('logistics.inventory.base.fields.check_status.completed'), value: 'completed' },
          ],
        },
      };
    }
    return item;
  });
});

// 从 config.ts 读取子流程配置
const { columns: baseSubProcessColumns } = usePageColumns('logistics.inventory.info.subProcess');
const { formItems: baseSubProcessFormItems } = usePageForms('logistics.inventory.info.subProcess');

// 子流程表格列配置
// 扩展配置以支持动态 formatter
const subProcessColumns = computed(() => {
  return baseSubProcessColumns.value.map(col => {
    if (col.prop === 'startTime' || col.prop === 'endTime' || col.prop === 'createdAt' || col.prop === 'updatedAt') {
      return { ...col, formatter: formatDateCell };
    }
    return col;
  });
});

// 子流程表单项配置
// 扩展配置以支持动态 options
const subProcessFormItems = computed(() => {
  return baseSubProcessFormItems.value.map(item => {
    if (item.prop === 'checkStatus') {
      return {
        ...item,
        component: {
          ...item.component,
          options: [
            { label: t('logistics.inventory.base.fields.check_status.notStarted'), value: 'notStarted' },
            { label: t('logistics.inventory.base.fields.check_status.inProgress'), value: 'inProgress' },
            { label: t('logistics.inventory.base.fields.check_status.completed'), value: 'completed' },
          ],
        },
      };
    }
    return item;
  });
});

// 处理子流程详情按钮点击
const handleSubProcessDetail = (row: any) => {
  currentCheckNo.value = row.checkNo || '';
  subProcessDialogVisible.value = true;
  // 等待弹窗打开后设置查询参数并加载数据
  nextTick(() => {
    if (subProcessCrudRef.value?.crud) {
      // 设置查询参数，根据 checkNo 过滤
      // 参数会被包装在 keyword 对象中
      subProcessCrudRef.value.crud.setParams({
        keyword: {
          checkNo: currentCheckNo.value,
        },
      });
      subProcessCrudRef.value.crud.loadData();
    }
  });
};

// 处理子流程表单提交
const handleSubProcessSubmit = async (data: any, { close, done }: { close: () => void; done: () => void }) => {
  try {
    // 如果是新增，设置 parentProcessNo
    if (!data.id && currentCheckNo.value) {
      data.parentProcessNo = currentCheckNo.value;
    }

    if (data.id) {
      await subProcessService.update(data);
    } else {
      await subProcessService.add(data);
    }

    BtcMessage.success(t('common.saveSuccess'));
    close();
    subProcessCrudRef.value?.crud?.loadData();
  } catch (error: any) {
    logger.error('[SubProcess] Submit failed:', error);
    done();
    BtcMessage.error(error?.message || t('common.saveFailed'));
  }
};

// 处理子流程弹窗关闭
const handleSubProcessDialogClosed = () => {
  // 重置查询参数
  if (subProcessCrudRef.value?.crud) {
    subProcessCrudRef.value.crud.setParams({
      keyword: {},
    });
  }
  currentCheckNo.value = '';
};

onMounted(() => {
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


