<template>
  <div class="perm-compose page">
    <!-- 权限组合页面头部 -->
    <div class="perm-compose-header">
      <div class="header-left">
        <BtcSelectButton v-model="mode" :options="modeOptions" @change="handleModeChange" />
      </div>
      <div class="header-right">
        <el-button @click="handleClearAll" :disabled="composedPermissions.length === 0">
          <el-icon><Delete /></el-icon>
          {{ t('common.access.clear_all') }}
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" :disabled="composedPermissions.length === 0">
          <el-icon><Select /></el-icon>
          {{ t('common.access.save_permissions') }}
        </el-button>
      </div>
    </div>

    <!-- 权限组合页面内容 -->
    <div class="perm-compose-content">
      <div class="perm-compose-wrap">
        <!-- 左侧资源树 -->
        <div class="perm-compose-left">
          <BtcResourceTree
            :resource-tree="resourceTree"
            :model-value="{ resourceFilterText, applyToChildren }"
            :tree-props="treeProps"
            :filter-resource-node="filterResourceNode"
            @resource-check="handleResourceCheck"
            ref="resourceTreeRef"
          />
        </div>

        <!-- 中间操作列表 -->
        <div class="perm-compose-middle">
          <div class="scope">
            <!-- 操作标题 -->
            <div class="head">
              <el-text class="label">{{ mode === 'matrix' ? t('common.access.permission_matrix') : t('common.access.action_list') }}</el-text>
              <div class="head-actions" v-if="mode === 'compose'">
                <el-button size="small" text @click="handleSelectAllActions">{{ t('common.access.select_all') }}</el-button>
                <el-divider direction="vertical" />
                <el-dropdown trigger="click" @command="handleActionTemplate">
                  <el-button size="small" text>
                    {{ t('common.access.quick_select') }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="readonly">{{ t('common.access.readonly_permission') }}</el-dropdown-item>
                      <el-dropdown-item command="editor">{{ t('common.access.edit_permission') }}</el-dropdown-item>
                      <el-dropdown-item command="full">{{ t('common.access.full_crud') }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- 操作表格 -->
            <BtcActionTable
              :mode="mode"
              :filtered-actions="filteredActions"
              :matrix-data="matrixData"
              :actions="actions"
              :selected-resources="selectedResources"
              :is-action-supported="isActionSupported"
              :get-action-support-count="getActionSupportCount"
              :is-permission-checked="isPermissionChecked"
              :is-action-supported-by-resource="isActionSupportedByResource"
              :get-method-type="getMethodType"
              :handle-matrix-toggle="handleMatrixToggle"
              @action-selection-change="handleActionSelectionChange"
              ref="actionTableRef"
            />
          </div>
        </div>

        <!-- 右侧权限预览 -->
        <div class="perm-compose-right">
          <div class="scope">
            <!-- 预览标题 -->
            <div class="head">
              <el-text class="label">{{ mode === 'matrix' ? t('common.access.selected_permissions') : t('common.access.permission_preview') }}</el-text>
              <div class="head-stat">
                <el-statistic
                  :value="composedPermissions.length"
                  :suffix="t('common.access.count_unit')"
                  :value-style="{ fontSize: '16px', fontWeight: 600, color: 'var(--el-color-primary)' }"
                />
              </div>
            </div>

            <!-- 组合按钮 -->
            <div v-if="mode === 'compose'" class="compose-action">
              <el-button
                type="primary"
                @click="handleCompose"
                :disabled="!canCompose"
                :loading="composing"
                style="width: 100%;"
                size="large"
              >
                <el-icon><Connection /></el-icon>
                    {{ t('common.access.generate_permissions') }} {{ composeCount }} {{ t('common.access.count_unit') }}
              </el-button>
            </div>

            <!-- 预览数据 -->
            <div class="data" :style="{ height: mode === 'compose' ? 'calc(100% - 110px)' : 'calc(100% - 40px)' }">
              <el-scrollbar>
                <BtcPermissionList
                  :composed-permissions="composedPermissions"
                  @remove-permission="handleRemovePermission"
                />
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import { Delete, Select, ArrowDown, Connection } from '@element-plus/icons-vue';
import { service } from '@services/eps';
import { usePermComposeData } from './composables/usePermComposeData';
import { useActionFilter } from './composables/useActionFilter';
import { useMatrixMode } from './composables/useMatrixMode';
import { useComposeMode } from './composables/useComposeMode';
import BtcResourceTree from './components/BtcResourceTree.vue';
import BtcActionTable from './components/BtcActionTable.vue';
import BtcPermissionList from './components/BtcPermissionList.vue';
import './styles/perm-compose.scss';

// 初始化
const { t } = useI18n();
const message = useMessage();
const mode = ref<'matrix' | 'compose'>('matrix');
const modeOptions = computed(() => [
  { label: t('common.access.matrix_mode'), value: 'matrix' },
  { label: t('common.access.compose_mode'), value: 'compose' },
]);

// 权限服务
const permissionService = service.admin?.iam?.permission;

// 数据管理
const {
  resourceTree,
  actions,
  composedPermissions,
  resourceTreeRef,
  resourceFilterText,
  applyToChildren,
  treeProps,
  selectedResources,
  selectedActions,
  matrixSelections,
  filterResourceNode,
  loadData,
  handleResourceCheck,
} = usePermComposeData();

// 操作过滤
const {
  filteredActions,
  isActionSupported,
  getActionSupportCount,
  isActionSupportedByResource,
} = useActionFilter(actions, selectedResources, resourceTreeRef, resourceTree);

// 矩阵模式
const {
  matrixData,
  isPermissionChecked,
  handleMatrixToggle,
} = useMatrixMode(resourceTree, actions, selectedResources, matrixSelections, composedPermissions, resourceTreeRef);

// 组合模式
const {
  composeCount,
  canCompose,
  handleCompose: handleComposeBase,
} = useComposeMode(actions, selectedResources, selectedActions, resourceTreeRef, composedPermissions);

// 状态
const composing = ref(false);
const saving = ref(false);

// 切换模式
const handleModeChange = (val: 'matrix' | 'compose') => {
  const modeText = val === 'matrix' ? t('common.access.matrix') : t('common.access.compose');
  message.info(`${t('common.access.switched_to')}${modeText}${t('common.access.mode')}`);

  if (val === 'matrix') {
    selectedResources.value = [];
    selectedActions.value = [];
  } else {
    matrixSelections.value.clear();
  }
};

// 操作表格引用和方法
const actionTableRef = ref();
const handleActionSelectionChange = (selection: any[]) => {
  selectedActions.value = selection.map((a: any) => a.id);
};

const handleSelectAllActions = () => {
  if (selectedActions.value.length === filteredActions.value.length) {
    selectedActions.value = [];
    actionTableRef.value?.clearSelection();
    message.info(t('common.access.deselected_all'));
  } else {
    selectedActions.value = filteredActions.value.map((a: any) => a.id);
    filteredActions.value.forEach((row: any) => {
      actionTableRef.value?.toggleRowSelection(row, true);
    });
    message.success(t('common.access.selected_all'));
  }
};

const handleActionTemplate = (command: string) => {
  actionTableRef.value?.clearSelection();

  let targetActions: any[] = [];

  switch (command) {
    case 'readonly':
      targetActions = actions.value.filter((a: any) => a.actionCode === 'view');
      message.success(t('common.access.selected_readonly'));
      break;
    case 'editor':
      targetActions = actions.value.filter((a: any) => ['view', 'edit'].includes(a.actionCode));
      message.success(t('common.access.selected_edit'));
      break;
    case 'full':
      targetActions = actions.value;
      message.success(t('common.access.selected_full_crud'));
      break;
  }

  selectedActions.value = targetActions.map((a: any) => a.id);

  targetActions.forEach((action: any) => {
    actionTableRef.value?.toggleRowSelection(action, true);
  });
};

const getMethodType = (method: string) => {
  const typeMap: Record<string, any> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
  };
  return typeMap[method] || 'info';
};

// 生成权限
const handleCompose = () => handleComposeBase(composing);

// 移除权限
const handleRemovePermission = (index: number) => {
  const perm = composedPermissions.value[index];
  composedPermissions.value.splice(index, 1);

  if (mode.value === 'matrix') {
    matrixSelections.value.delete(perm.key);
  }

  message.success(t('common.access.removed'));
};

// 清空全部
const handleClearAll = () => {
  composedPermissions.value = [];
  matrixSelections.value.clear();
  message.success(t('common.access.cleared_all'));
};

// 保存权限
const handleSave = async () => {
  saving.value = true;
  try {
    for (const perm of composedPermissions.value) {
      await permissionService.add(perm);
    }
    message.success(`${t('common.access.saved')} ${composedPermissions.value.length} ${t('common.access.permissions')}`);
    composedPermissions.value = [];
    matrixSelections.value.clear();
  } catch (_error) {
    message.error(t('common.access.save_failed'));
  } finally {
    saving.value = false;
  }
};

// 加载数据
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.perm-compose .data {
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
