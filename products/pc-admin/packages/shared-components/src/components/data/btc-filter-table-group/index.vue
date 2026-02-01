<template>
  <div ref="containerRef" class="btc-filter-table-group">
    <BtcDoubleLayout
      ref="doubleLayoutRef"
      :left-width="computedLeftWidth"
    >
      <template v-if="props.rightTitle" #right-header>
        <span class="title">{{ props.rightTitle }}</span>
      </template>
      <!-- 左侧头部 -->
      <template #left-header>
        <!-- 始终渲染头部容器，确保高度一致，避免展开时内容上移 -->
        <div class="btc-filter-table-group__left-header">
          <!-- 搜索框 -->
          <template v-if="props.enableFilterSearch">
            <div class="btc-filter-table-group__search">
              <BtcInput
                :model-value="filterListRef?.searchKeyword || ''"
                @update:model-value="handleSearchKeywordChange"
                placeholder="搜索分类..."
                clearable
                :id="`${instanceId}-search`"
                :name="`${instanceId}-search`"
              >
                <template #prefix>
                  <BtcSvg name="search" :size="16" />
                </template>
              </BtcInput>
            </div>
          </template>
          <!-- 清除按钮 -->
          <div
            v-if="hasSelectedOptions"
            class="btc-filter-table-group__clear-btn btc-comm__icon"
            title="清除所有筛选"
            @click="handleClearAll"
          >
            <BtcSvg 
              name="delete" 
              :size="16" 
              animation="shake"
              animation-trigger="hover"
              :animation-duration="0.5"
            />
          </div>
          <!-- 设置按钮 -->
          <el-dropdown
            v-if="filterListRef"
            v-model:visible="settingsDropdownVisible"
            trigger="click"
            @command="handleSizeChange"
            placement="bottom-end"
          >
            <template #default>
              <BtcIconButton
                :config="{
                  icon: 'set',
                  tooltip: '修改侧栏尺寸',
                  iconAnimation: 'rotate',
                  iconAnimationTrigger: 'hover',
                  iconAnimationDuration: 0.2,
                  class: 'btc-filter-table-group__settings-icon'
                }"
              />
            </template>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="sizeOption in (filterListRef.sizeOptions || [])"
                  :key="sizeOption.value"
                  :command="sizeOption.value"
                >
                  <div
                    class="btc-filter-table-group__size-item"
                    :class="{ 'is-active': sizeOption.value === filterListRef.currentSize }"
                  >
                    <span class="btc-filter-table-group__size-item-label">{{ sizeOption.label }}</span>
                    <span v-if="sizeOption.value === filterListRef.currentSize" class="btc-filter-table-group__size-item-dot"></span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>

      <!-- 左侧内容 -->
      <template #left>
        <BtcFilterList
          ref="filterListRef"
          v-bind="filterListProps"
          :style="filterListStyle"
          @change="handleFilterChange"
          @update:size="handleFilterListSizeChange"
        />
      </template>

      <!-- 右侧内容 -->
      <template #right>
        <BtcCrud
          ref="crudRef"
          :service="props.rightService"
          :auto-load="props.autoLoad !== false"
          :on-before-refresh="handleBeforeRefresh"
        >
          <BtcCrudRow>
            <div class="btc-crud-primary-actions">
              <BtcRefreshBtn />
              <slot name="after-refresh-btn" />
              <slot name="add-btn">
                <BtcAddBtn v-if="props.showAddBtn" />
              </slot>
              <slot name="multi-delete-btn">
                <BtcMultiDeleteBtn v-if="props.showMultiDeleteBtn" />
              </slot>
            </div>
            <BtcCrudFlex1 />
            <slot name="search">
              <BtcCrudSearchKey
                v-if="props.showSearchKey"
                :placeholder="props.searchPlaceholder || '搜索'"
              />
            </slot>
            <BtcCrudActions v-if="props.showToolbar" :show-toolbar="true">
              <template #default>
                <slot
                  name="actions"
                  :filter-result="filterResult"
                />
              </template>
            </BtcCrudActions>
          </BtcCrudRow>
          <BtcCrudRow>
            <BtcTable
              ref="tableRef"
              :columns="computedTableColumns"
              v-bind="props.op ? { op: props.op } : {}"
              :border="true"
            />
          </BtcCrudRow>
          <BtcCrudRow>
            <BtcCrudFlex1 />
            <BtcPagination />
          </BtcCrudRow>
          <BtcUpsert
            :items="props.formItems || []"
            :width="props.upsertWidth || 800"
            @submit="handleFormSubmit"
          />
        </BtcCrud>
      </template>
    </BtcDoubleLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted, type Ref } from 'vue';
import { Setting } from '@element-plus/icons-vue';
import BtcDoubleLayout from '../../layout/btc-double-layout/index.vue';
import BtcFilterList from '../btc-filter-list/index.vue';
import BtcCrud from '@btc-crud/context/index.vue';
import BtcTable from '@btc-crud/table/index.vue';
import BtcPagination from '@btc-crud/pagination/index.vue';
import BtcAddBtn from '@btc-crud/add-btn/index.vue';
import BtcRefreshBtn from '@btc-crud/refresh-btn/index.vue';
import BtcMultiDeleteBtn from '@btc-crud/multi-delete-btn/index.vue';
import BtcCrudRow from '@btc-crud/crud-row/index.vue';
import BtcCrudFlex1 from '@btc-crud/crud-flex1/index.vue';
import BtcCrudSearchKey from '@btc-crud/crud-search-key/index.vue';
import BtcUpsert from '@btc-crud/upsert/index.vue';
import BtcCrudActions from '@btc-crud/actions/index.vue';
import { BtcInput, BtcSvg, BtcIconButton } from '@btc/shared-components';
import { useColumnPriority } from './composables/useColumnPriority';
import { useDynamicWidth } from './composables/useDynamicWidth';
import type { FilterResult } from '../btc-filter-list/types';
import type { TableColumn } from '@btc-crud/table/types';
import type {
  BtcFilterTableGroupProps,
  BtcFilterTableGroupEmits,
  BtcFilterTableGroupExpose,
} from './types';
;


defineOptions({
  name: 'BtcFilterTableGroup',
  inheritAttrs: false,
  components: {
    BtcDoubleLayout,
    BtcFilterList,
    BtcCrud,
    BtcTable,
    BtcPagination,
    BtcAddBtn,
    BtcRefreshBtn,
    BtcMultiDeleteBtn,
    BtcCrudRow,
    BtcCrudFlex1,
    BtcCrudSearchKey,
    BtcUpsert,
    BtcCrudActions,
    Setting,
  },
});

const props = withDefaults(defineProps<BtcFilterTableGroupProps>(), {
  enableFilterSearch: true,
  defaultExpandedCount: 3,
  columnPriority: 'auto',
  enableColumnReorder: false,
  categoryColumnMap: () => ({}),
  minLeftWidth: '200px',
  maxLeftWidth: '600px',
  enableAutoWidth: true,
  baseWidth: () => ({ small: 200, default: 325, large: 450 }),
  showAddBtn: true,
  showMultiDeleteBtn: true,
  showSearchKey: true,
  showToolbar: true,
  upsertWidth: 800,
  searchPlaceholder: '搜索',
  defaultExpand: true,
  autoCollapseOnMobile: true,
  autoLoad: true,
  showTagsContainer: false,
});

// 生成唯一 ID，避免多个实例之间的 id 冲突
const instanceId = `btc-filter-table-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const emit = defineEmits<BtcFilterTableGroupEmits>();

// 定义插槽类型
defineSlots<{
  actions?: (props: { filterResult: FilterResult[] }) => any;
  'add-btn'?: () => any;
  'multi-delete-btn'?: () => any;
  'after-refresh-btn'?: () => any;
  search?: () => any;
}>();

// 组件引用
const containerRef = ref<HTMLElement>();
const doubleLayoutRef = ref<InstanceType<typeof BtcDoubleLayout>>();
const filterListRef = ref<InstanceType<typeof BtcFilterList>>();
const crudRef = ref<any>();
const tableRef = ref<any>();

// 控制设置下拉菜单的显示状态（用于旋转动画）
const settingsDropdownVisible = ref(false);

// 判断左侧面板是否展开（折叠时禁用类型切换）
const isLeftPanelExpanded = computed(() => {
  return doubleLayoutRef.value?.isExpand ?? true;
});

// 关键修复：使用 ref 存储 CSS 变量状态，通过 watch 延迟移除
// 这样可以确保在展开过程中，is-no-wrap 类移除之后再移除 CSS 变量，避免宽度骤变
const filterListStyleRef = ref<Record<string, string>>({});
let expandTimeoutId: ReturnType<typeof setTimeout> | null = null;

// 监听展开状态变化，延迟移除 CSS 变量
watch(
  isLeftPanelExpanded,
  (isExpanded) => {
    // 清除之前的定时器
    if (expandTimeoutId) {
      clearTimeout(expandTimeoutId);
      expandTimeoutId = null;
    }

    if (isExpanded) {
      // 展开时：延迟移除 CSS 变量，确保动画完成（0.3s）且 is-no-wrap 类已移除
      // 延迟 350ms（略大于动画时间 300ms），确保动画和 DOM 更新都完成
      expandTimeoutId = setTimeout(() => {
        filterListStyleRef.value = {};
        expandTimeoutId = null;
      }, 350);
    } else {
      // 折叠时：立即设置 CSS 变量
      filterListStyleRef.value = {
        '--btc-filter-list-collapsed-width': lastValidLeftWidth.value || `${props.baseWidth.default}px`
      };
    }
  },
  { immediate: true }
);

// 清理定时器
onUnmounted(() => {
  if (expandTimeoutId) {
    clearTimeout(expandTimeoutId);
    expandTimeoutId = null;
  }
});

// 计算样式对象（用于模板绑定）
const filterListStyle = computed(() => filterListStyleRef.value);

// 筛选结果
const filterResult = ref<FilterResult[]>([]);

// 列优先级管理
const { sortedColumns } = useColumnPriority(
  filterResult,
  computed(() => props.tableColumns),
  props.categoryColumnMap || {}
);

// 动态宽度计算（折叠时禁用，避免触发不必要的计算）
const { dynamicWidth, calculateWidth, cleanup } = useDynamicWidth(
  tableRef,
  containerRef,
  {
    minWidth: parseFloat(props.minLeftWidth),
    maxWidth: parseFloat(props.maxLeftWidth),
    baseWidths: props.baseWidth,
    // 只有在展开状态且启用自动宽度时才计算
    enabled: computed(() => props.enableAutoWidth && isLeftPanelExpanded.value),
  }
);

// 保存上一次的有效宽度（用于折叠时保持状态）
const lastValidLeftWidth = ref<string>('');

// 计算左侧分栏宽度（优先使用 btc-filter-list 的 size 配置）
const computedLeftWidth = computed(() => {
  const isExpanded = isLeftPanelExpanded.value;
  // 优先使用 btc-filter-list 的 currentSize
  const filterListSize = filterListRef.value?.currentSize;
  
  // 如果左侧面板已折叠，返回上一次的有效宽度，避免触发宽度变化逻辑
  if (!isExpanded) {
    return lastValidLeftWidth.value || `${props.baseWidth.default}px`;
  }
  
  if (filterListSize) {
    // 根据 btc-filter-list 的 size 决定宽度
    // small: 200px, large: 450px, default: 使用动态宽度或默认宽度
    let leftWidth: string;
    if (filterListSize === 'small') {
      leftWidth = '200px';
    } else if (filterListSize === 'large') {
      leftWidth = '450px';
    } else {
      // default 尺寸：使用动态宽度或默认宽度
      if (props.enableAutoWidth && dynamicWidth.value) {
        leftWidth = dynamicWidth.value;
      } else {
        leftWidth = `${props.baseWidth.default}px`;
      }
    }
    // 保存有效宽度
    lastValidLeftWidth.value = leftWidth;
    return leftWidth;
  }

  // 如果 filterListRef 还没有初始化，使用原有逻辑
  let leftWidth: string;

  if (props.enableAutoWidth) {
    // 启用自动宽度时，使用动态计算的宽度
    // 注意：如果 dynamicWidth 还没有值，直接使用默认宽度，避免出现空值导致动画不连续
    if (dynamicWidth.value && dynamicWidth.value.trim()) {
      leftWidth = dynamicWidth.value;
    } else {
      // 如果动态宽度还未计算，使用默认宽度
      leftWidth = `${props.baseWidth.default}px`;
    }
  } else {
    // 禁用自动宽度时：
    // 1. 如果用户明确指定了 leftWidth，使用用户指定的值
    // 2. 否则根据 leftSize 计算宽度
    if (props.leftWidth) {
      leftWidth = props.leftWidth;
    } else {
      // 根据 leftSize 计算宽度
      const sizeWidth = props.baseWidth[props.leftSize || 'default'];
      leftWidth = `${sizeWidth}px`;
    }
  }

  // 保存有效宽度
  lastValidLeftWidth.value = leftWidth;
  // 返回左侧宽度字符串
  return leftWidth;
});

// 计算 BtcFilterList 的 props
const filterListProps = computed(() => {
  const result: Record<string, any> = {
    'enable-search': false,
    'default-expanded-count': props.defaultExpandedCount,
    'show-tags-container': props.showTagsContainer,
    // 当左侧面板折叠时，禁用选项换行，避免选项竖排
    'option-wrap': isLeftPanelExpanded.value,
  };

  // 只在有值时才添加可选属性
  if (props.filterCategory !== undefined) {
    result.category = props.filterCategory;
  }
  if (props.filterService !== undefined) {
    result.service = props.filterService;
  }
  if (props.storageKey !== undefined) {
    result['storage-key'] = props.storageKey;
  }
  if (props.leftSize !== undefined) {
    result.size = props.leftSize;
  }

  return result;
});

// 检查是否有选中的选项
const hasSelectedOptions = computed(() => {
  return filterResult.value.some(item => item.value && item.value.length > 0);
});

// 处理搜索关键词变化
const handleSearchKeywordChange = (value: string) => {
  if (filterListRef.value) {
    filterListRef.value.searchKeyword = value;
  }
};

// 处理清除所有筛选
const handleClearAll = () => {
  if (filterListRef.value) {
    filterListRef.value.clearAll();
  }
};

// 处理尺寸变化
const handleSizeChange = (size: string) => {
  if (filterListRef.value) {
    filterListRef.value.handleSizeChange(size);
  }
};

// 处理筛选列表尺寸变化
const handleFilterListSizeChange = (size: string) => {
  // 如果左侧面板已折叠，不响应宽度变化（避免折叠时经过 small 状态触发不必要的逻辑）
  if (!isLeftPanelExpanded.value) {
    return;
  }

  // 尺寸变化时，可能需要重新计算宽度
  // 注意：当 size 为 'default' 时，需要重新计算动态宽度，确保从 small 切换到 default 时能正确更新
  // 但是不要清空 dynamicWidth，避免导致 computedLeftWidth 出现中间状态，打断动画
  if (props.enableAutoWidth && size === 'default') {
    // 直接触发计算，不清空 dynamicWidth，避免动画被打断
    // 如果 dynamicWidth 还没有值，computedLeftWidth 会使用默认宽度，不会出现空值
    nextTick(() => {
      // 延迟计算，确保 filterListRef 的 currentSize 已更新
      requestAnimationFrame(() => {
        calculateWidth();
      });
    });
  }

  // 触发宽度变化事件
  nextTick(() => {
    const width = computedLeftWidth.value;
    if (width) {
      emit('width-change', width);
    }
  });
};

// 计算表格列（应用优先级排序）
const computedTableColumns = computed(() => {
  if (props.columnPriority === 'auto') {
    return sortedColumns.value;
  }
  return props.tableColumns;
});

// 监听表格列变化，触发宽度重新计算
watch(
  () => tableRef.value?.columns,
  () => {
    if (props.enableAutoWidth) {
      nextTick(() => {
        calculateWidth();
      });
    }
  },
  { deep: true }
);

// 监听筛选结果变化，触发宽度重新计算
watch(
  filterResult,
  () => {
    if (props.enableAutoWidth) {
      nextTick(() => {
        calculateWidth();
      });
    }
  },
  { deep: true }
);

// 监听宽度变化，触发 width-change 事件
// 注意：折叠时不触发宽度变化事件，避免不必要的响应
watch(
  computedLeftWidth,
  (leftWidth) => {
    // 如果左侧面板已折叠，不触发宽度变化事件
    if (!isLeftPanelExpanded.value) {
      return;
    }
    
    if (leftWidth) {
      emit('width-change', leftWidth);
    }
  },
  { immediate: true }
);

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  filterResult.value = result;
  emit('filter-change', result);

  // 触发列变化事件
  emit('column-change', computedTableColumns.value);

  // 触发宽度重新计算
  if (props.enableAutoWidth) {
    nextTick(() => {
      calculateWidth();
    });
  }
};

// 注意：BtcSplitter 使用 Element Plus 的 splitter，折叠功能已内置，不再需要 handleExpandChange

// 处理刷新前钩子（将筛选结果转换为查询参数）
const handleBeforeRefresh = (params: Record<string, any>) => {
  const keyword: Record<string, any> = {};
  filterResult.value.forEach(item => {
    if (item.value && item.value.length > 0) {
      keyword[item.name] = item.value;
    }
  });

  if (Object.keys(keyword).length > 0) {
    params.keyword = { ...(params.keyword || {}), ...keyword };
  }

  return params;
};

// 处理表单提交
const handleFormSubmit = (
  data: any,
  formEvent: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean }
) => {
  emit('form-submit', data, formEvent);
};

// 监听数据加载完成
watch(
  () => crudRef.value?.tableData,
  (data) => {
    if (data) {
      emit('load', data);
    }
  },
  { deep: true }
);

// 清理函数
onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});

// 暴露
defineExpose<BtcFilterTableGroupExpose>({
  filterResult: computed(() => filterResult.value),
  crudRef,
  filterListRef: computed(() => filterListRef.value),
  refresh: async (params?: any) => {
    await crudRef.value?.refresh(params);
  },
  updateColumns: (columns: TableColumn[]) => {
    // 暂未实现，未来可以支持手动更新列
    console.warn('[BtcFilterTableGroup] updateColumns 暂未实现');
  },
});
</script>

<style scoped lang="scss">
.btc-filter-table-group {
  width: 100%;
  height: 100%;

  // 左侧头部（参考 btc-view-group 的 .head 样式）
  &__left-header {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    width: 100%;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    background-color: var(--el-bg-color);
    flex-shrink: 0;
    box-sizing: border-box;
    margin: 0;
  }

  // 确保左侧面板头部占据完整宽度
  :deep(.btc-splitter-panel:first-child .btc-splitter-panel__header) {
    justify-content: flex-start !important;
    padding: 0;
    
    > * {
      width: 100%;
    }
  }

  // 允许 btc-filter-list 的选项换行（覆盖 btc-splitter-panel 的 nowrap 样式）
  :deep(.btc-splitter-panel:first-child .btc-splitter-panel__content) {
    white-space: normal !important;
    // 确保内容区域可以正常显示，不被压缩
    min-width: 0 !important;
    // 注意：保持 overflow: hidden 用于滚动，但确保内容宽度足够
    // overflow 由 btc-filter-list 内部的 el-scrollbar 处理
    
    // 允许 btc-filter-list 及其子元素正常换行
    .btc-filter-list,
    .btc-filter-list__container,
    .btc-filter-list__options,
    .el-checkbox-group {
      white-space: normal !important;
    }
  }

  &__search {
    flex: 1;
    min-width: 0;
  }

  &__clear-btn {
    flex-shrink: 0;
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: color 0.2s;

    &:hover {
      color: var(--el-text-color-primary);
    }
  }

  // 设置图标样式（去掉边框）
  &__settings-icon {
    // 去掉 btc-comm__icon 的边框样式
    border: none !important;
    
    &:hover {
      border: none !important;
    }
    
    &:focus {
      border: none !important;
      outline: none !important;
    }
  }
  
  // 移除 el-dropdown 的 focus outline（白色方形边框）
  :deep(.el-dropdown) {
    .el-only-child {
      outline: none !important;
      
      &:focus {
        outline: none !important;
      }
      
      &:focus-visible {
        outline: none !important;
      }
    }
  }

  &__size-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 0;

    &-label {
      font-size: 14px;
    }

    &-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
      flex-shrink: 0;
    }

    &.is-active {
      .btc-filter-table-group__size-item-label {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }

    &:hover {
      .btc-filter-table-group__size-item-label {
        color: var(--el-color-primary);
      }
    }
  }

}
</style>
