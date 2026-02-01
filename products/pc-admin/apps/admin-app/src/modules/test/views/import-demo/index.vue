<template>
  <div class="import-demo">
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

// Mock data
let mockUsers = [
  { id: 1, username: 'admin', name: 'Administrator', email: 'admin@example.com', status: 1, avatar: '' },
  { id: 2, username: 'user1', name: 'Zhang San', email: 'zhangsan@example.com', status: 1, avatar: '' },
  { id: 3, username: 'user2', name: 'Li Si', email: 'lisi@example.com', status: 0, avatar: '' },
];
let nextId = 4;

// 模拟服务
const userService = {
  baseURL: '/api/users', // 添加baseURL用于实体名称检测
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
 * 表单打开
 */
const handleFormOpen = () => {
  // Form opened
};

/**
 * 处理导入数据
 */
const handleImport = async (data: { list: any[]; file: File; filename: string }, { done, close }: any) => {
  try {
    // 模拟导入延迟
    await new Promise(resolve => setTimeout(resolve, 1000));


    // 使用 BtcImportBtn 的动态验证结果
    const validData = data.list;

    // 详细的错误提示
    if (validData.length === 0) {
      const totalRows = data.list.length;
      const errorMessages = [];

      if (totalRows === 0) {
        errorMessages.push('Excel文件中没有找到数据行');
        errorMessages.push('可能的原因：');
        errorMessages.push('1. Excel文件为空或格式不正确');
        errorMessages.push('2. 文件损坏或无法读取');
        errorMessages.push('3. 工作表名称不正确');
      } else {
        errorMessages.push(`共${totalRows}行数据，但所有行都缺少必填字段`);

        // 检查第一行数据的字段情况
        const firstRow = data.list[0];
        const missingFields = [];

        if (!firstRow.username && !firstRow['用户名']) {
          missingFields.push('用户名');
        }
        if (!firstRow.name && !firstRow['姓名']) {
          missingFields.push('姓名');
        }

        if (missingFields.length > 0) {
          errorMessages.push(`缺少必填字段：${missingFields.join('、')}`);
        }

        // 检查列名是否正确
        const availableColumns = Object.keys(firstRow);
        const expectedColumns = ['用户名', '姓名', '邮箱', '状态', '头像'];
        const missingColumns = expectedColumns.filter(col => !availableColumns.includes(col));

        if (missingColumns.length > 0) {
          errorMessages.push(`缺少列：${missingColumns.join('、')}`);
        }

        // 添加调试信息
        errorMessages.push(`实际列名：${availableColumns.join('、')}`);
        errorMessages.push(`第一行数据：${JSON.stringify(firstRow)}`);

        errorMessages.push('请确保Excel文件包含以下列：用户名、姓名、邮箱、状态、头像');
      }

      BtcMessage.error(errorMessages.join('\n'), {
        duration: 5000,
        showClose: true
      });
      done();
      return;
    }

    // 检查是否有部分数据无效
    const invalidRows = data.list.length - validData.length;
    if (invalidRows > 0) {
      BtcMessage.warning(`发现 ${invalidRows} 行数据格式不正确，已跳过。成功导入 ${validData.length} 条有效数据。`, {
        duration: 4000,
        showClose: true
      });
    }

    // 去重检查：检查用户名是否已存在
    const existingUsernames = new Set(mockUsers.map(user => user.username));
    const duplicateUsers: any[] = [];
    const uniqueUsers: any[] = [];

    validData.forEach((item: any) => {
      const username = item.username;

      // 跳过无效的用户名
      if (!username || username === 'undefined' || username.trim() === '') {
        return;
      }

      if (existingUsernames.has(username)) {
        duplicateUsers.push({
          username,
          name: item.name || '未知用户'
        });
      } else {
        uniqueUsers.push(item);
        existingUsernames.add(username);
      }
    });

    // 如果有重复数据，显示警告
    if (duplicateUsers.length > 0) {
      const duplicateList = duplicateUsers.map(user => `${user.name}(${user.username})`).join('、');
      BtcMessage.warning(`发现 ${duplicateUsers.length} 条重复数据，已跳过：${duplicateList}`, {
        duration: 4000,
        showClose: true
      });
    }

    // 如果没有唯一数据，直接返回
    if (uniqueUsers.length === 0) {
      BtcMessage.info('所有数据都已存在，无需重复导入');
      done();
      return;
    }

    // 模拟批量添加用户 - 使用动态验证后的数据
    const newUsers = uniqueUsers.map((item: any, index: number) => ({
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
    BtcMessage.success(`成功导入 ${newUsers.length} 条用户数据`);

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
.import-demo {
  padding: 20px;
}
</style>
