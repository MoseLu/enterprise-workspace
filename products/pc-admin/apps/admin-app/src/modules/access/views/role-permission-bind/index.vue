<template>
  <div class="page">
    <BtcCrud ref="crudRef" :service="rolePermissionService">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey placeholder="搜索角色权限绑定..." />
        <BtcCrudActions />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
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
import { ref, computed, onMounted } from 'vue';
import {
  BtcCrud,
  BtcCrudRow,
  BtcRefreshBtn,
  BtcAddBtn,
  BtcMultiDeleteBtn,
  BtcCrudFlex1,
  BtcCrudSearchKey,
  BtcCrudActions,
  BtcTable,
  BtcPagination,
  BtcUpsert,
  BtcConfirm,
  type TableColumn,
  type FormItem,
} from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 角色权限服务 - 使用EPS服务
// 根据 prefix /api/system/iam/role-permission，服务路径应该是 admin.iam.rolePermission
const rolePermissionService = {
  ...service.admin?.iam?.rolePermission,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await service.admin?.iam?.rolePermission?.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：如果存在 deleteBatch 方法则使用，否则循环调用 delete
    if (service.admin?.iam?.rolePermission?.deleteBatch) {
      await service.admin?.iam?.rolePermission?.deleteBatch(ids);
    } else {
      const deleteFn = service.admin?.iam?.rolePermission?.delete;
      if (deleteFn) {
        await Promise.all(ids.map((id) => deleteFn(id)));
      }
    }

    message.success(t('crud.message.delete_success'));
  },
};

// 表格列配置
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: 'common.fields.index', width: 60 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'roleId', label: 'common.fields.role_id', width: 150 },
  { prop: 'permissionId', label: 'common.fields.permission_id', width: 150 },
  { prop: 'tenantId', label: 'common.fields.tenant_id', width: 150 },
  { prop: 'createdAt', label: 'common.fields.create_time', width: 180, sortable: true },
]);

// 表单项配置
const formItems = computed<FormItem[]>(() => [
  { prop: 'roleId', label: 'common.fields.role_id', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'permissionId', label: 'common.fields.permission_id', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantId', label: 'common.fields.tenant_id', span: 12, component: { name: 'el-input' } },
]);

onMounted(() => {
  setTimeout(() => crudRef.value?.crud.loadData(), 100);
});
</script>

<style lang="scss" scoped>


.btc-crud-primary-actions {
  display: flex;
  gap: 8px;
}
</style>
