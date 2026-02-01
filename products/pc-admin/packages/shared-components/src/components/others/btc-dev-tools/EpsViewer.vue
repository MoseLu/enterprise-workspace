<template>
  <div class="eps-viewer">
    <div class="eps-viewer__top">
      <el-tooltip content="刷新 EPS 数据">
        <el-button
          circle
          size="small"
          :icon="Refresh"
          @click="reload"
          :loading="reloading"
        />
      </el-tooltip>

      <el-input
        v-model="keyword"
        class="eps-viewer__search"
        placeholder="搜索 API 端点..."
        clearable
        @input="onKeywordChange"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-result
      v-if="isEmpty"
      icon="error"
      title="EPS 数据为空"
      sub-title="请检查后端 EPS 接口是否正常，或点击刷新按钮重新加载"
    >
      <template #extra>
        <el-button type="primary" @click="reload" :loading="reloading">
          刷新
        </el-button>
      </template>
    </el-result>

    <el-tree
      v-else
      ref="treeRef"
      :data="treeData"
      :filter-node-method="filterNode"
      :props="treeProps"
      node-key="id"
      highlight-current
    >
      <template #default="{ node, data }">
        <div class="eps-viewer__tree-node">
          <span class="eps-viewer__node-label">{{ node.label }}</span>
          <div class="eps-viewer__node-tags">
            <el-tag
              v-if="data.method"
              size="small"
              :type="getMethodType(data.method)"
              class="eps-viewer__method-tag"
            >
              {{ data.method.toUpperCase() }}
            </el-tag>
            <el-tag
              v-if="data.path"
              size="small"
              class="eps-viewer__path-tag"
              :title="data.path || ''"
            >
              {{ formatPath(data.path) }}
            </el-tag>
            <el-tag
              v-if="data.summary"
              size="small"
              type="info"
              class="eps-viewer__summary-tag"
              :title="data.summary"
            >
              {{ data.summary }}
            </el-tag>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { logger } from '@btc/shared-core';
;


interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  summary?: string;
  path?: string;
  method?: string;
}

// 获取 EPS service 和 list（从全局对象）
function getEpsService(): { service: any; list: any[] } {
  // 尝试从全局对象获取
  const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).__BTC_SERVICE__ || (window as any).service;
  const globalList = (window as any).__APP_EPS_LIST__ || (window as any).__BTC_EPS_LIST__;

  return {
    service: globalService || {},
    list: globalList || []
  };
}

const { service, list } = getEpsService();

const keyword = ref('');
const reloading = ref(false);
const treeRef = ref<any>(null);

const treeProps = {
  children: 'children',
  label: 'label',
};

const isEmpty = computed(() => {
  return !treeData.value || treeData.value.length === 0;
});

const treeData = ref<TreeNode[]>([]);

// 将 service 对象转换为树形结构
function buildTree() {
  const result: TreeNode[] = [];
  let nodeId = 0;

  // 创建路径到 API 信息的映射
  const apiMap = createApiMap();

  function traverse(obj: any, parentPath: string[] = [], parent: TreeNode | null = null) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    // 跳过这些字段
    const skipKeys = ['namespace', 'permission', '_permission', 'request'];

    for (const key in obj) {
      if (skipKeys.includes(key)) {
        continue;
      }

      const currentPath = [...parentPath, key];
      const pathKey = currentPath.join('.');

      // 查找对应的 EPS 信息
      const apiInfo = apiMap.get(pathKey);

      const nodeIdStr = `node-${nodeId++}`;
      const node: TreeNode = {
        id: nodeIdStr,
        label: key,
        children: [],
      };

      // 如果找到对应的 API 信息，添加说明
      if (apiInfo) {
        if (apiInfo.summary) {
          node.summary = apiInfo.summary;
        }
        if (apiInfo.path) {
          node.path = apiInfo.path;
        }
        if (apiInfo.method) {
          node.method = apiInfo.method;
          node.label = `${key} [${apiInfo.method.toUpperCase()}]`;
        }
      }

      const value = obj[key];

      // 如果是函数，说明这是一个 API 端点
      if (typeof value === 'function') {
        delete node.children;
        // 如果没有找到 API 信息，尝试从函数名推断
        if (!apiInfo && value.name) {
          node.label = `${key} (${value.name})`;
        }
      } else if (typeof value === 'object' && value !== null) {
        // 递归处理子对象
        traverse(value, currentPath, node);

        // 如果没有子节点，移除空的 children
        if (node.children && node.children.length === 0) {
          delete node.children;
        }
      } else if (typeof value === 'string') {
        // 字符串值可能是配置
        node.label += ` (${value})`;
        delete node.children;
      } else {
        // 其他类型
        delete node.children;
      }

      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        result.push(node);
      }
    }
  }

  traverse(service);

  return result;
}

// 创建 API 映射表：路径 -> API 信息
function createApiMap(): Map<string, any> {
  const map = new Map<string, any>();

  if (!list || !Array.isArray(list)) {
    return map;
  }

  // 遍历所有 EPS 实体
  for (const entity of list) {
    if (!entity.api || !Array.isArray(entity.api)) {
      continue;
    }

    const prefix = entity.prefix || '';
    const prefixParts = prefix.split('/').filter((p: any) => p && p !== 'api');

    // 遍历该实体的所有 API
    for (const api of entity.api) {
      if (!api.path) continue;

      const apiPath = api.path.replace(/^\//, '').split('/').filter((p: any) => p);

      // 尝试匹配 service 路径
      // service 路径格式可能是：sys.user.list
      // 对应的 prefix 可能是：/api/sys/user
      // API path 可能是：/list

      // 构建完整路径
      const fullPathParts = [...prefixParts, ...apiPath];

      // 生成可能的路径组合
      const possiblePaths = [];

      // 方式1：直接组合
      possiblePaths.push(fullPathParts.join('.'));

      // 方式2：去掉最后一个作为方法名
      if (fullPathParts.length > 1) {
        const moduleParts = fullPathParts.slice(0, -1);
        const methodName = fullPathParts[fullPathParts.length - 1];
        possiblePaths.push([...moduleParts, methodName].join('.'));
      }

      // 将 API 信息存储到映射中
      for (const pathKey of possiblePaths) {
        if (pathKey) {
          map.set(pathKey, {
            summary: api.summary,
            path: api.path,
            method: api.method,
            name: api.name,
          });
        }
      }
    }
  }

  return map;
}

function filterNode(value: string, data: TreeNode) {
  if (!value) return true;

  const searchText = value.toLowerCase();
  const label = (data.label || '').toLowerCase();
  const summary = (data.summary || '').toLowerCase();
  const path = (data.path || '').toLowerCase();

  return label.includes(searchText) ||
         summary.includes(searchText) ||
         path.includes(searchText);
}

function onKeywordChange(value: string) {
  nextTick(() => {
    if (treeRef.value) {
      treeRef.value.filter(value);
    }
  });
}

async function reload() {
  reloading.value = true;

  try {
    // 尝试刷新 EPS 数据
    // 注意：实际的刷新可能需要重新加载页面或调用后端接口
    // 这里我们先提示用户刷新页面

    ElMessage.info({ message: '正在刷新 EPS 数据，页面将自动刷新...' } as any);

    // 延迟刷新，给用户看到消息
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    ElMessage.error({ message: '刷新失败：' + (error as Error).message } as any);
    reloading.value = false;
  }
}

function refresh() {
  try {
    treeData.value = buildTree();
  } catch (error) {
    logger.error('构建 EPS 树失败:', error);
    treeData.value = [];
  }
}

function getMethodType(method: string): string {
  const methodUpper = method.toUpperCase();
  const methodTypes: Record<string, string> = {
    'GET': 'success',
    'POST': 'warning',
    'PUT': 'primary',
    'DELETE': 'danger',
    'PATCH': 'info',
  };
  return methodTypes[methodUpper] || 'info';
}

function formatPath(path: string | undefined): string {
  if (!path) return '';
  // 只显示路径的最后一部分，完整路径在 title 中显示
  const parts = path.split('/').filter(p => p);
  return parts.length > 0 ? (parts[parts.length - 1] || path) : path;
}

onMounted(() => {
  refresh();
});
</script>

<style lang="scss" scoped>
.eps-viewer {
  &__top {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: var(--el-bg-color);
    padding-bottom: 8px;
  }

  &__search {
    flex: 1;

    :deep(.el-input__wrapper) {
      height: 32px;
      border-radius: 6px;
    }
  }

  &__tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  &__node-label {
    flex: 1;
    font-size: 13px;
  }

  &__node-tags {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  &__method-tag {
    font-size: 10px;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
  }

  &__path-tag {
    font-size: 10px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    background-color: var(--el-fill-color);
    color: var(--el-text-color-primary);
    border-color: var(--el-border-color);
  }

  &__summary-tag {
    font-size: 11px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.el-tree-node__content) {
    border-radius: 4px;
    height: 32px;
    padding: 0 8px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  :deep(.el-tree-node__expand-icon) {
    font-size: 12px;
  }
}
</style>

