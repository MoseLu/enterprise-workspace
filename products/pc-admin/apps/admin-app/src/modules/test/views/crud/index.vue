<template>
  <div class="crud-demo">
    <BtcCrud ref="crudRef" :service="userService">
      <!-- Toolbar -->
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions>
          <BtcImportBtn
            :template="'/templates/users.xlsx'"
            :tips="'请按照模板格式填写用户信息，支持用户名、姓名、邮箱、状态等字段'"
            :on-submit="handleImport"
          />
          <BtcExportBtn :filename="'用户列表'" />
        </BtcCrudActions>
      </BtcCrudRow>

      <!-- Table -->
      <BtcCrudRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border>
          <!-- Custom status column -->
          <template #column-status="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? t('user.status.active') : t('user.status.inactive') }}
            </el-tag>
          </template>

          <!-- Custom action button -->
          <template #slot-custom="{ row }">
            <el-button link type="warning" @click="handleCustomAction(row)">
              {{ t('common.button.custom') }}
            </el-button>
          </template>
        </BtcTable>
      </BtcCrudRow>

      <!-- Pagination -->
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>

      <!-- 新增/编辑弹窗 -->
      <BtcUpsert
        ref="upsertRef"
        :items="formItems"
        width="600px"
        :on-open="handleFormOpen"
      >
        <!-- 自定义表单项 -->
        <template #item-avatar="{ form }">
          <el-avatar :src="form.avatar || 'https://via.placeholder.com/100'" :size="80" />
          <el-input v-model="form.avatar" placeholder="Avatar URL" style="margin-top: 8px" />
        </template>
      </BtcUpsert>
    </BtcCrud>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-if="crudRef"
      v-model="crudRef.crud.viewVisible.value"
      :title="t('crud.button.info')"
      width="600px"
      @close="crudRef.crud.handleViewClose()"
    >
      <el-descriptions :column="2" border v-if="crudRef.crud.viewRow.value">
        <el-descriptions-item :label="t('user.field.username')">
          {{ crudRef.crud.viewRow.value.username }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('user.field.name')">
          {{ crudRef.crud.viewRow.value.name }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('user.field.email')" :span="2">
          {{ crudRef.crud.viewRow.value.email }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('user.field.status')">
          <el-tag :type="crudRef.crud.viewRow.value.status === 1 ? 'success' : 'danger'">
            {{ crudRef.crud.viewRow.value.status === 1 ? t('user.status.active') : t('user.status.inactive') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('user.field.avatar')" :span="2">
          <el-avatar
            :src="crudRef.crud.viewRow.value.avatar || 'https://via.placeholder.com/100'"
            :size="60"
          />
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="crudRef?.crud.handleViewClose()">
          {{ t('common.button.close') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 导出列选择对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      :title="t('common.button.export')"
      width="500px"
    >
      <el-form label-position="top">
        <el-form-item :label="t('crud.message.select_export_columns')">
          <el-checkbox-group v-model="exportColumns" class="export-checkbox-group">
            <el-checkbox
              v-for="col in exportableColumns"
              :key="col.prop"
              :label="col.label"
              :value="col.prop"
            />
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="exportDialogVisible = false">
          {{ t('common.button.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmExport">
          {{ t('common.button.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n, usePluginManager, logger } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcConfirm, BtcMessage, BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcImportBtn, BtcExportBtn } from '@btc/shared-components';

const { t } = useI18n();
const pluginManager = usePluginManager();

// Refs
const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 导出对话框
const exportDialogVisible = ref(false);
const exportColumns = ref<string[]>([]);

// Mock data
let mockUsers = [
  { id: 1, username: 'admin', name: 'Administrator', email: 'admin@example.com', status: 1, avatar: '' },
  { id: 2, username: 'user1', name: 'Zhang San', email: 'zhangsan@example.com', status: 1, avatar: '' },
  { id: 3, username: 'user2', name: 'Li Si', email: 'lisi@example.com', status: 0, avatar: '' },
];
let nextId = 4;

// 模拟服务
const userService = {
  page: async (params: any) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟搜索
    let list = [...mockUsers];
    if (params.keyword) {
      list = list.filter(u =>
        u.username.includes(params.keyword) ||
        u.name.includes(params.keyword)
      );
    }

    // 模拟分页
    const start = (params.page - 1) * params.size;
    const end = start + params.size;

    return {
      list: list.slice(start, end),
      total: list.length,
    };
  },

  add: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newUser = { id: nextId++, ...data };
    mockUsers.push(newUser);

    BtcMessage.success('Added successfully');
    return newUser;
  },

  update: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = mockUsers.findIndex(u => u.id === data.id);
    if (index > -1) {
      mockUsers[index] = { ...mockUsers[index], ...data };
    }

    BtcMessage.success('Updated successfully');
    return data;
  },

  delete: async (ids: (string | number)[]) => {
    // Confirm delete
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    await new Promise(resolve => setTimeout(resolve, 300));

    mockUsers = mockUsers.filter(u => !ids.includes(u.id));

    BtcMessage.success(t('crud.message.delete_success'));
  },
};

// 表格列配置（使用 computed 以支持 i18n）
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60, align: 'center', headerAlign: 'center' },
  { type: 'index', label: t('crud.table.index'), width: 60, align: 'center', headerAlign: 'center' },
  { prop: 'username', label: t('user.field.username'), minWidth: 120, align: 'center', headerAlign: 'center' },
  { prop: 'name', label: t('user.field.name'), minWidth: 120, align: 'center', headerAlign: 'center' },
  { prop: 'email', label: t('user.field.email'), minWidth: 180, align: 'center', headerAlign: 'center' },
  { prop: 'status', label: t('user.field.status'), width: 100, align: 'center', headerAlign: 'center' },
  {
    type: 'op',
    label: t('crud.table.operation'),
    width: 300,
    align: 'center',
    headerAlign: 'center',
    buttons: ['info', 'edit', 'slot-custom', 'delete'],
  },
]);

// 表单项配置（使用 computed 以支持 i18n）
const formItems = computed<FormItem[]>(() => [
  {
    prop: 'avatar',
    label: t('user.field.avatar'),
    span: 24,
  },
  {
    prop: 'username',
    label: t('user.field.username'),
    span: 12,
    required: true,
    component: {
      name: 'el-input',
    },
    rules: [
      { required: true, message: t('user.field.username') },
    ],
  },
  {
    prop: 'name',
    label: t('user.field.name'),
    span: 12,
    required: true,
    component: {
      name: 'el-input',
    },
  },
  {
    prop: 'email',
    label: t('user.field.email'),
    span: 12,
    component: {
      name: 'el-input',
      props: {
        type: 'email',
      },
    },
    rules: [
      { type: 'email', message: t('user.field.email') },
    ],
  },
  {
    prop: 'status',
    label: t('user.field.status'),
    value: 1,
    span: 12,
    component: {
      name: 'el-radio-group',
      options: [
        { label: t('user.status.active'), value: 1 },
        { label: t('user.status.inactive'), value: 0 },
      ],
    },
  },
]);

/**
 * 表单提交
 */

/**
 * 表单打开
 */
const handleFormOpen = () => {
  // Form opened
};

// 可导出的列配置
const exportableColumns = computed(() => [
  { prop: 'username', label: t('user.field.username') },
  { prop: 'name', label: t('user.field.name') },
  { prop: 'email', label: t('user.field.email') },
  { prop: 'status', label: t('user.field.status') },
]);

/**
 * 打开导出对话框
 */
const handleExport = () => {
  const selection = crudRef.value?.crud.selection.value || [];
  const dataToExport = selection.length > 0 ? selection : mockUsers;

  if (dataToExport.length === 0) {
    BtcMessage.warning('No data to export');
    return;
  }

  // Select all columns by default
  exportColumns.value = exportableColumns.value.map(col => col.prop);
  exportDialogVisible.value = true;
};

/**
 * Confirm export
 */
const confirmExport = () => {
  if (exportColumns.value.length === 0) {
    BtcMessage.warning('请先选择要导出的列');
    return;
  }

  const selection = crudRef.value?.crud.selection.value || [];
  const dataToExport = selection.length > 0 ? selection : mockUsers;

  // Generate headers and data based on selected columns
  const header = exportColumns.value.map(prop => {
    const col = exportableColumns.value.find(c => c.prop === prop);
    return col?.label || prop;
  });

  // Data (only selected columns)
  const data = dataToExport.map((user: any) =>
    exportColumns.value.map(prop => {
      if (prop === 'status') {
        return user.status === 1 ? t('user.status.active') : t('user.status.inactive');
      }
      return user[prop];
    })
  );

  // Get Excel plugin API
  const excelApi = pluginManager.getApi<{ export: (...args: any[]) => void }>('excel');

  if (!excelApi) {
    BtcMessage.error('Excel plugin not available');
    return;
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `users_export_${timestamp}`;

  // Export to Excel using plugin
  excelApi.export({
    header,
    data,
    filename,
    autoWidth: true,
    bookType: 'xlsx',
  });

  exportDialogVisible.value = false;
  BtcMessage.success('导出成功');
};

/**
 * 处理导入数据
 */
const handleImport = async (data: { list: any[]; file: File; filename: string }, { done, close }: any) => {
  try {
    // 模拟导入延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 验证导入数据
    const validData = data.list.filter((item: any) => {
      return item.username && item.name; // 基本验证
    });

    if (validData.length === 0) {
      BtcMessage.error('导入数据无效，请检查数据格式');
      done();
      return;
    }

    // 模拟批量添加用户
    const newUsers = validData.map((item: any, index: number) => ({
      id: nextId + index,
      username: item.username || `imported_user_${nextId + index}`,
      name: item.name || `Imported User ${nextId + index}`,
      email: item.email || `imported${nextId + index}@example.com`,
      status: item.status === '1' || item.status === 1 || item.status === 'active' ? 1 : 0,
      avatar: item.avatar || '',
    }));

    // 添加到模拟数据
    mockUsers.push(...newUsers);
    nextId += newUsers.length;

    // 刷新表格数据
    crudRef.value?.crud.loadData();

    close();
    BtcMessage.success(`成功导入 ${validData.length} 条用户数据`);

  } catch (error) {
    logger.error('导入失败:', error);
    BtcMessage.error('导入失败，请重试');
    done();
  }
};

/**
 * Custom action
 */
const handleCustomAction = (row: any) => {
  BtcMessage.info(`${t('common.button.custom')}: ${row.name}`);
};

// Auto load data on mounted
onMounted(() => {
  setTimeout(() => {
    crudRef.value?.crud.loadData();
  }, 100);
});
</script>

<style lang="scss" scoped>
.export-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

