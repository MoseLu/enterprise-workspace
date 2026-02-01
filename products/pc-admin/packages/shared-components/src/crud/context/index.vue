<template>
  <div ref="crudRef" class="btc-crud" :class="{ 'is-border': border, 'has-pagination': hasPagination }" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  provide,
  onMounted,
  ref,
  onUpdated,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  computed,
  // reactive 未使用，已移除
  watchEffect,
  watch,
} from 'vue';
import { useCrud, logger } from '@btc/shared-core';
import { BtcMessage } from '../../components/feedback/btc-message';
import {
  crudLayoutKey,
  type CrudLayoutTrailingKey,
  DEFAULT_OPERATION_WIDTH,
  DEFAULT_CRUD_GAP,
} from './layout';
import { useContentHeight } from '../../composables/content-height';

defineOptions({
  name: 'BtcCrud',
  inheritAttrs: false,
});

/** 补回用于 registerTrailing 的可选参数类型 */
interface RegisterOptions {
  immediate?: boolean;
}

/**
 * BtcCrud 上下文容器
 * 提供 CRUD 上下文给所有子组件使用
 */

type UseCrudParams = Parameters<typeof useCrud>[0];
type CrudService = NonNullable<UseCrudParams['service']>;

export interface Props {
  // CRUD 服务（必填）
  service: CrudService;

  // CRUD 配置
  options?: Omit<UseCrudParams, 'service'>;

  // 样式
  border?: boolean;
  padding?: string;

  // 是否自动加载数据
  autoLoad?: boolean;

  // 刷新前钩子
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
}

const props = withDefaults(defineProps<Props>(), {
  border: false,
  padding: '10px',
  autoLoad: true,
});

// 检测是否有分页组件
const hasPagination = ref(false);
const crudRef = ref<HTMLElement>();

// 创建 CRUD 实例
// 注意：先展开 props.options，再设置默认的 onSuccess，这样 props.options 中的 onSuccess 可以覆盖默认值
const crudOptions: any = {
  service: props.service,
  ...props.options,
};
// 如果 props.options 中没有 onSuccess，使用默认的
if (!crudOptions.onSuccess) {
  crudOptions.onSuccess = (message: string) => {
    BtcMessage.success(message);
  };
}
if (props.onBeforeRefresh !== undefined) {
  crudOptions.onBeforeRefresh = props.onBeforeRefresh;
}
const crud = useCrud(crudOptions);

// 关键：确保 crud 实例有效
if (!crud) {
  const error = new Error('[BtcCrud] useCrud returned undefined or null');
  logger.error('[BtcCrud] CRITICAL ERROR:', error.message, {
    service: props.service,
    options: props.options,
    timestamp: new Date().toISOString(),
  });
  throw error;
}

// 确保 crud.handleAdd 是函数
if (typeof crud.handleAdd !== 'function') {
  const error = new Error('[BtcCrud] crud.handleAdd is not a function');
  logger.error('[BtcCrud] CRITICAL ERROR:', error.message, {
    crud,
    handleAdd: crud.handleAdd,
    crudKeys: Object.keys(crud),
    timestamp: new Date().toISOString(),
  });
  throw error;
}

// 提供给子组件
provide('btc-crud', crud);

// 检测分页组件的存在
function checkPagination() {
  if (!crudRef.value) return;
  const paginationEl = crudRef.value.querySelector('.el-pagination');
  hasPagination.value = !!paginationEl;
}

// 管理表格引用
const tableRef = ref();

const containerStyle = computed(() => ({
  padding: props.padding,
}));

const { height: contentHeight } = useContentHeight();
// 还原自动高度调度：在下一帧调用表格的 calcMaxHeight
const scheduleTableAutoHeight = () => {
  nextTick(() => {
    tableRef.value?.calcMaxHeight?.();
  });
};

// 提供给子组件
provide('btc-table-ref', tableRef);
provide(
  'btc-crud-toolbar-binding',
  computed(() => tableRef.value?.toolbarBinding ?? null),
);

const operationWidth = ref<number>(DEFAULT_OPERATION_WIDTH);
const layoutGap = ref<number>(DEFAULT_CRUD_GAP);

// 将 trailing 相关的尺寸计算移除，固定为 0，并提供 no-op 的注册函数
const trailingWidth = computed(() => 0);
const trailingCount = computed(() => 0);

// search 区域宽度固定为 0，避免任何动态计算
const searchWidth = computed(() => 0);

// 不再跟踪或观察任何元素尺寸变化
const registerTrailing = (_key: CrudLayoutTrailingKey, _el: HTMLElement | null, _options: RegisterOptions = {}) => {
  // no-op
};

const setOperationWidth = (width: number | null | undefined) => {
  if (typeof width === 'number' && Number.isFinite(width) && width > 0) {
    operationWidth.value = width;
  }
};

const setGap = (gap: number) => {
  if (Number.isFinite(gap) && gap > 0) {
    layoutGap.value = gap;
  }
};

watchEffect(() => {
  if (!crudRef.value) return;
  // operationWidth 已经在 syncOperationWidth 中包含了 gap（操作列宽度 + 10px）
  // 所以这里直接使用 operationWidth，不需要再加 gap
  // 这样 .btc-crud-right-group 的宽度会包含 gap，确保内部元素之间有间距
  // 同时操作列宽度也增加了 10px，确保搜索组件最右侧和操作列左侧对齐
  crudRef.value.style.setProperty('--btc-crud-op-width', `${operationWidth.value}px`);
  crudRef.value.style.setProperty('--btc-crud-search-width', `${searchWidth.value}px`);
  crudRef.value.style.setProperty('--btc-crud-trailing-width', `${trailingWidth.value}px`);
  const reservedGap = trailingCount.value > 0 ? layoutGap.value : 0;
  crudRef.value.style.setProperty('--btc-crud-trailing-gap', `${reservedGap}px`);
});

const resolveInitialMetrics = () => {
  // 保留轻量初始化：当前无需解析 CSS 变量，行间距由默认值覆盖
};

provide(crudLayoutKey, {
  operationWidth,
  gap: layoutGap,
  trailingWidth,
  trailingCount,
  searchWidth,
  registerTrailing,
  setOperationWidth,
  setGap,
});

// 检测父组件的辅助函数
function checkParentComponent(componentName: string): boolean {
  let parent = getCurrentInstance()?.parent;
  while (parent) {
    if (parent.type.name === componentName || parent.type.__name === componentName) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

// 初始化标记，避免重复调用 loadData
const isDataLoaded = ref(false);

// 组件挂载时自动加载数据
onMounted(() => {
  const hasViewGroupParent = checkParentComponent('BtcViewGroup');
  if (props.autoLoad && !hasViewGroupParent && !isDataLoaded.value) {
    isDataLoaded.value = true;
    crud.loadData();
  }
  setTimeout(checkPagination, 500);
  nextTick(() => {
    resolveInitialMetrics();
    scheduleTableAutoHeight();
  });
});

// 组件更新时重新检测分页组件
onUpdated(() => {
  checkPagination();
  nextTick(() => {
    resolveInitialMetrics();
    scheduleTableAutoHeight();
  });
});

onBeforeUnmount(() => {
  // 无需清理（未注册 ResizeObserver）
});

// 暴露给父组件
defineExpose({
  crud,
  ...crud,
});

// 与域列表一致：当内容区高度、分页变更时，调度一次表格高度计算
watch(
  () => contentHeight.value,
  () => {
    scheduleTableAutoHeight();
  },
);

watch(
  () => crud.pagination.size,
  () => {
    scheduleTableAutoHeight();
  },
);

watch(
  () => crud.pagination.page,
  () => {
    scheduleTableAutoHeight();
  },
);
</script>

