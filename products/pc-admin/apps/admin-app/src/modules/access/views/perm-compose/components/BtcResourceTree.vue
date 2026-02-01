<template>
  <div class="scope">
    <!-- 资源标题 -->
    <div class="head">
      <el-text class="label">资源列表</el-text>
      <el-switch
        v-model="modelValue.applyToChildren"
        active-text="应用到子节点"
        inactive-text=""
        size="small"
      />
    </div>

    <!-- 资源搜索 -->
    <div class="search">
      <el-input
        v-model="modelValue.resourceFilterText"
        placeholder="搜索资源"
        clearable
        :prefix-icon="Search"
      />
    </div>

    <!-- 资源数据 -->
    <div class="data">
      <el-scrollbar>
        <el-tree
          ref="treeRef"
          class="tree"
          :data="resourceTree"
          :props="treeProps"
          :filter-node-method="filterResourceNode"
          show-checkbox
          :check-strictly="!modelValue.applyToChildren"
          node-key="id"
          default-expand-all
          highlight-current
          @check-change="$emit('resourceCheck', $event)"
        >
          <template #default="{ data }">
            <div class="item">
              <el-icon><FolderOpened /></el-icon>
              <el-text truncated class="item-label">
                {{ data.resourceNameCn }}
              </el-text>
              <el-tag v-if="data.supportedActions" size="small" type="info" class="item-tag">
                {{ data.supportedActions.length }}
              </el-tag>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { FolderOpened, Search } from '@element-plus/icons-vue';

interface Props {
  resourceTree: any[];
  modelValue: {
    resourceFilterText: string;
    applyToChildren: boolean;
  };
  treeProps?: any;
  filterResourceNode: (value: string, data: any) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  treeProps: () => ({
    children: 'children',
    label: 'resourceNameCn',
  })
});

defineEmits<{
  resourceCheck: [data: any, checked: boolean];
}>();

defineOptions({
  name: 'BtcResourceTree'
});

const treeRef = ref();

watch(() => props.modelValue.resourceFilterText, (val) => {
  treeRef.value?.filter(val);
});

defineExpose({
  getCheckedNodes: () => treeRef.value?.getCheckedNodes(),
  getCheckedKeys: () => treeRef.value?.getCheckedKeys(),
  setCheckedKeys: (keys: number[]) => treeRef.value?.setCheckedKeys(keys),
  filter: (val: string) => treeRef.value?.filter(val),
});
</script>

<style lang="scss" scoped>
.scope {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  font-size: 14px;
  padding: 0 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;

  .label {
    flex: 1;
    font-weight: 500;
  }
}

.search {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;

  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }
}

.data {
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;

  .tree {
    :deep(.el-tree-node__content) {
      height: 38px;
      margin: 0 5px;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;

      .el-icon {
        flex-shrink: 0;
        color: var(--el-color-primary);
      }

      .item-label {
        flex: 1;
        min-width: 0;
      }

      .item-tag {
        flex-shrink: 0;
        font-size: 11px;
      }

      &.is-active {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}
</style>

