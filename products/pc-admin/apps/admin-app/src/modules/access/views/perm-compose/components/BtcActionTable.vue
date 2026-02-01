<template>
  <div class="data">
    <el-scrollbar>
      <!-- 组合模式表格 -->
      <el-table
        v-if="mode === 'compose'"
        ref="tableRef"
        :data="filteredActions"
        border
        stripe
        @selection-change="$emit('actionSelectionChange', $event)"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="50" :selectable="(row) => isActionSupported(row.id)" />
        <el-table-column label="图标" width="60" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.actionCode === 'view'" :size="18" color="var(--el-color-success)"><View /></el-icon>
            <el-icon v-else-if="row.actionCode === 'create'" :size="18" color="var(--el-color-primary)"><Plus /></el-icon>
            <el-icon v-else-if="row.actionCode === 'edit'" :size="18" color="var(--el-color-warning)"><Edit /></el-icon>
            <el-icon v-else-if="row.actionCode === 'delete'" :size="18" color="var(--el-color-danger)"><Delete /></el-icon>
            <el-icon v-else :size="18"><Operation /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="actionNameCn" label="名称" width="80" />
        <el-table-column prop="actionCode" label="编码" min-width="100">
          <template #default="{ row }">
            <code class="action-code">{{ row.actionCode }}</code>
          </template>
        </el-table-column>
        <el-table-column label="方法" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getMethodType(row.httpMethod)" effect="plain">
              {{ row.httpMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支持度" width="90" align="center" v-if="selectedResources.length > 1">
          <template #default="{ row }">
            <el-tooltip :content="`${getActionSupportCount(row.id)} / ${selectedResources.length} 个资源支持`" placement="top">
              <el-tag
                size="small"
                :type="getActionSupportCount(row.id) === selectedResources.length ? 'success' : 'warning'"
                effect="plain"
              >
                {{ getActionSupportCount(row.id) }}/{{ selectedResources.length }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 矩阵模式表格 -->
      <div v-if="matrixData.length === 0 && mode === 'matrix'" class="matrix-empty">
        <el-empty description="请先选择资源">
          <template #image>
            <el-icon :size="60" color="var(--el-text-color-placeholder)">
              <FolderOpened />
            </el-icon>
          </template>
        </el-empty>
      </div>
      <el-table
        v-else-if="mode === 'matrix'"
        :data="matrixData"
        border
        stripe
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column prop="resourceNameCn" label="资源" width="220" fixed align="center" header-align="center">
          <template #default="{ row }">
            <div class="matrix-resource">
              <el-icon :size="16"><FolderOpened /></el-icon>
              <span>{{ row.resourceNameCn }}</span>
              <el-tag v-if="row.resourceCode" size="small" type="info">
                {{ row.resourceCode }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="action in actions"
          :key="action.id"
          :prop="`action_${action.id}`"
          min-width="100"
          align="center"
        >
          <template #header>
            <div class="matrix-action-header">
              <el-icon v-if="action.actionCode === 'view'" :size="16" color="var(--el-color-success)"><View /></el-icon>
              <el-icon v-else-if="action.actionCode === 'create'" :size="16" color="var(--el-color-primary)"><Plus /></el-icon>
              <el-icon v-else-if="action.actionCode === 'edit'" :size="16" color="var(--el-color-warning)"><Edit /></el-icon>
              <el-icon v-else-if="action.actionCode === 'delete'" :size="16" color="var(--el-color-danger)"><Delete /></el-icon>
              <span>{{ action.actionNameCn }}</span>
            </div>
          </template>
          <template #default="{ row }">
            <el-checkbox
              :model-value="isPermissionChecked(row.id, action.id)"
              @change="handleMatrixToggle(row.id, action.id, $event)"
              :disabled="!isActionSupportedByResource(row.id, action.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { View, Plus, Edit, Delete, Operation, FolderOpened } from '@element-plus/icons-vue';

interface Props {
  mode: 'matrix' | 'compose';
  filteredActions: any[];
  matrixData: any[];
  actions: any[];
  selectedResources: number[];
  isActionSupported: (actionId: number) => boolean;
  getActionSupportCount: (actionId: number) => number;
  isPermissionChecked: (resourceId: number, actionId: number) => boolean;
  isActionSupportedByResource: (resourceId: number, actionId: number) => boolean;
  getMethodType: (method: string) => string;
  handleMatrixToggle: (resourceId: number, actionId: number, checked: boolean | string | number) => void;
}

const props = defineProps<Props>();

defineEmits<{
  actionSelectionChange: [selection: any[]];
}>();

defineOptions({
  name: 'BtcActionTable'
});

const tableRef = ref();

defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, checked: boolean) => tableRef.value?.toggleRowSelection(row, checked),
});
</script>

<style lang="scss" scoped>
.data {
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
}

.action-code {
  font-size: 12px;
  color: var(--el-color-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  background: var(--el-color-primary-light-9);
  padding: 2px 6px;
  border-radius: 3px;
}

.matrix-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.matrix-resource {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  .el-icon {
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    font-weight: 500;
  }

  .el-tag {
    font-size: 11px;
    flex-shrink: 0;
  }
}

.matrix-action-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .el-icon {
    flex-shrink: 0;
  }

  span {
    font-size: 12px;
    font-weight: 500;
  }
}

:deep(.el-table) {
  font-size: 13px;

  .el-checkbox {
    display: flex;
    justify-content: center;
  }

  .el-table__cell {
    padding: 10px 0;
  }

  th.el-table__cell {
    background-color: var(--el-fill-color-lighter);
  }
}

:deep(.el-empty) {
  padding: 40px 0;
}
</style>

