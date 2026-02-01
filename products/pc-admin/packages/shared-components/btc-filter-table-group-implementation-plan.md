# BtcFilterTableGroup 实现方案

## 需求分析

基于高复杂交互需求，需要创建 `BtcFilterTableGroup` 组件，实现以下功能：

1. **左右侧联动**：基于左侧的分类优先渲染对应的列（宽度充足再渲染其他列）
2. **选择提前**：基于用户选中的分类将列提前显示
3. **宽度交互**：左侧宽度自动根据页面实际渲染调整尺寸（列非常少时可以突破 large，但有上限）

## 架构设计

### 组件层次

```
BtcFilterTableGroup (新增)
  └── BtcFilterGroup (复用现有组件)
       └── BtcSplitLayout (布局)
            ├── BtcFilterList (左侧)
            └── BtcCrud (右侧)
                 └── BtcTable (表格)
```

### 核心功能模块

1. **列优先级管理** (`useColumnPriority`)
   - 根据左侧分类映射到表格列
   - 计算列的优先级（基于分类选中状态）
   - 动态调整列的顺序和显示

2. **动态宽度计算** (`useDynamicWidth`)
   - 根据实际渲染的列数计算左侧宽度
   - 考虑列数、列宽、容器宽度等因素
   - 支持最小/最大宽度限制

3. **列渲染优化** (`useColumnRender`)
   - 优先渲染选中分类对应的列
   - 宽度充足时再渲染其他列
   - 动态显示/隐藏列

## 类型定义

```typescript
// types.ts

export interface FilterTableGroupProps {
  // 筛选相关（继承自 BtcFilterGroup）
  filterCategory?: FilterCategory[];
  filterService?: { list: () => Promise<FilterCategory[]> };
  enableFilterSearch?: boolean;
  defaultExpandedCount?: number;
  
  // 表格相关
  rightService: CrudService;
  tableColumns: TableColumn[];
  formItems?: FormItem[];
  
  // 列优先级配置
  columnPriority?: 'auto' | 'manual'; // 自动或手动
  enableColumnReorder?: boolean; // 是否允许列重排序
  categoryColumnMap?: Record<string, string[]>; // 分类ID到列prop的映射
  
  // 宽度配置
  minLeftWidth?: string; // 最小宽度，默认 200px
  maxLeftWidth?: string; // 最大宽度，默认 600px
  enableAutoWidth?: boolean; // 是否启用自动宽度调整
  baseWidth?: { small: number; default: number; large: number }; // 基准宽度
  
  // 其他配置（继承自 BtcTableGroup）
  showAddBtn?: boolean;
  showMultiDeleteBtn?: boolean;
  showSearchKey?: boolean;
  showToolbar?: boolean;
  upsertWidth?: string | number;
  searchPlaceholder?: string;
}

export interface FilterTableGroupEmits {
  'filter-change': [result: FilterResult[]];
  'expand-change': [isExpand: boolean];
  'column-change': [columns: TableColumn[]]; // 列变化事件
  'width-change': [width: string]; // 宽度变化事件
}

export interface FilterTableGroupExpose {
  filterResult: ComputedRef<FilterResult[]>;
  crudRef: any;
  filterListRef: any;
  refresh: (params?: any) => Promise<void>;
  updateColumns: (columns: TableColumn[]) => void; // 手动更新列
}
```

## 实现方案

### 1. 列优先级管理 (`useColumnPriority`)

```typescript
// composables/useColumnPriority.ts

export function useColumnPriority(
  filterResult: Ref<FilterResult[]>,
  tableColumns: Ref<TableColumn[]>,
  categoryColumnMap: Record<string, string[]>
) {
  // 计算列的优先级
  const columnPriorities = computed(() => {
    const priorities: Record<string, number> = {};
    
    // 获取当前选中的分类ID
    const selectedCategoryIds = filterResult.value.map(r => r.name);
    
    // 初始化所有列的优先级为 0（最低）
    tableColumns.value.forEach(col => {
      if (col.prop) {
        priorities[col.prop] = 0;
      }
    });
    
    // 根据选中的分类提升对应列的优先级
    selectedCategoryIds.forEach((categoryId, index) => {
      const columnProps = categoryColumnMap[categoryId] || [];
      columnProps.forEach(prop => {
        // 优先选中的分类对应的列优先级更高
        priorities[prop] = selectedCategoryIds.length - index;
      });
    });
    
    return priorities;
  });
  
  // 计算排序后的列（优先级高的在前）
  const sortedColumns = computed(() => {
    return [...tableColumns.value].sort((a, b) => {
      const priorityA = columnPriorities.value[a.prop || ''] || 0;
      const priorityB = columnPriorities.value[b.prop || ''] || 0;
      return priorityB - priorityA; // 降序
    });
  });
  
  return {
    columnPriorities,
    sortedColumns
  };
}
```

### 2. 动态宽度计算 (`useDynamicWidth`)

```typescript
// composables/useDynamicWidth.ts

export function useDynamicWidth(
  filterListRef: Ref,
  tableRef: Ref,
  containerRef: Ref,
  options: {
    minWidth: number;
    maxWidth: number;
    baseWidths: { small: number; default: number; large: number };
    enabled: boolean;
  }
) {
  const dynamicWidth = ref<string>('');
  
  const calculateWidth = () => {
    if (!options.enabled || !tableRef.value || !containerRef.value) {
      return;
    }
    
    // 获取表格实际渲染的列数
    const visibleColumns = tableRef.value.getVisibleColumns();
    const columnCount = visibleColumns.length;
    
    // 获取容器宽度
    const containerWidth = containerRef.value.offsetWidth;
    
    // 估算每列的平均宽度（可以根据实际列宽计算）
    const avgColumnWidth = 150; // 可以根据实际情况调整
    const estimatedTableWidth = columnCount * avgColumnWidth;
    
    // 计算可用宽度（容器宽度 - 右侧最小宽度）
    const minRightWidth = 400; // 右侧最小宽度
    const availableWidth = containerWidth - minRightWidth;
    
    // 根据列数计算左侧宽度
    let calculatedWidth: number;
    
    if (columnCount <= 3) {
      // 列数很少，可以突破 large（450px）
      calculatedWidth = Math.min(options.maxWidth, availableWidth * 0.4);
    } else if (columnCount <= 5) {
      // 列数中等，使用 large
      calculatedWidth = options.baseWidths.large;
    } else if (columnCount <= 7) {
      // 列数较多，使用 default
      calculatedWidth = options.baseWidths.default;
    } else {
      // 列数很多，使用 small
      calculatedWidth = options.baseWidths.small;
    }
    
    // 确保在最小和最大宽度范围内
    calculatedWidth = Math.max(options.minWidth, Math.min(options.maxWidth, calculatedWidth));
    
    dynamicWidth.value = `${calculatedWidth}px`;
  };
  
  // 监听表格列变化、容器宽度变化等
  watch([filterListRef, tableRef, containerRef], () => {
    nextTick(() => {
      requestAnimationFrame(calculateWidth);
    });
  }, { deep: true });
  
  return {
    dynamicWidth,
    calculateWidth
  };
}
```

### 3. 列渲染优化 (`useColumnRender`)

```typescript
// composables/useColumnRender.ts

export function useColumnRender(
  sortedColumns: ComputedRef<TableColumn[]>,
  containerRef: Ref,
  tableRef: Ref
) {
  // 计算可见列（基于可用宽度）
  const visibleColumns = computed(() => {
    if (!containerRef.value || !tableRef.value) {
      return sortedColumns.value;
    }
    
    // 获取可用宽度
    const availableWidth = containerRef.value.offsetWidth;
    const leftWidth = getLeftWidth(); // 从 BtcFilterGroup 获取
    const rightAvailableWidth = availableWidth - parseFloat(leftWidth);
    
    // 计算已使用的宽度
    let usedWidth = 0;
    const visible: TableColumn[] = [];
    
    // 优先显示高优先级的列
    for (const column of sortedColumns.value) {
      const columnWidth = getColumnWidth(column); // 获取列的实际宽度
      
      if (usedWidth + columnWidth <= rightAvailableWidth) {
        visible.push(column);
        usedWidth += columnWidth;
      } else {
        // 宽度不足，停止添加
        break;
      }
    }
    
    return visible;
  });
  
  return {
    visibleColumns
  };
}
```

## 组件实现

### 基础结构

```vue
<template>
  <BtcFilterGroup
    ref="filterGroupRef"
    :filter-category="props.filterCategory"
    :filter-service="props.filterService"
    :enable-filter-search="props.enableFilterSearch"
    :default-expanded-count="props.defaultExpandedCount"
    :left-width="computedLeftWidth"
    :right-title="props.rightTitle"
    @filter-change="handleFilterChange"
    @expand-change="handleExpandChange"
  >
    <template #right="{ filterResult }">
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
              <slot name="actions" :filter-result="filterResult" />
            </template>
          </BtcCrudActions>
        </BtcCrudRow>
        <BtcCrudRow>
          <BtcTable
            ref="tableRef"
            :columns="computedTableColumns"
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
        />
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import BtcFilterGroup from '../btc-filter-group/index.vue';
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
import { useColumnPriority } from './composables/useColumnPriority';
import { useDynamicWidth } from './composables/useDynamicWidth';
import { useColumnRender } from './composables/useColumnRender';
import type { FilterTableGroupProps, FilterTableGroupEmits } from './types';

const props = withDefaults(defineProps<FilterTableGroupProps>(), {
  enableFilterSearch: true,
  defaultExpandedCount: 3,
  columnPriority: 'auto',
  enableColumnReorder: true,
  enableAutoWidth: true,
  minLeftWidth: '200px',
  maxLeftWidth: '600px',
  baseWidth: () => ({ small: 200, default: 300, large: 450 }),
  showAddBtn: true,
  showMultiDeleteBtn: true,
  showSearchKey: true,
  showToolbar: true,
  upsertWidth: 800,
});

const emit = defineEmits<FilterTableGroupEmits>();

// 组件引用
const filterGroupRef = ref();
const crudRef = ref();
const tableRef = ref();
const containerRef = ref();

// 筛选结果
const filterResult = ref<FilterResult[]>([]);

// 列优先级管理
const { sortedColumns } = useColumnPriority(
  filterResult,
  computed(() => props.tableColumns),
  props.categoryColumnMap || {}
);

// 动态宽度计算
const { dynamicWidth, calculateWidth } = useDynamicWidth(
  computed(() => filterGroupRef.value?.filterListRef),
  tableRef,
  containerRef,
  {
    minWidth: parseFloat(props.minLeftWidth),
    maxWidth: parseFloat(props.maxLeftWidth),
    baseWidths: props.baseWidth,
    enabled: props.enableAutoWidth,
  }
);

// 计算左侧宽度
const computedLeftWidth = computed(() => {
  if (props.enableAutoWidth && dynamicWidth.value) {
    return dynamicWidth.value;
  }
  return props.leftWidth || '300px';
});

// 计算表格列（应用优先级排序）
const computedTableColumns = computed(() => {
  if (props.columnPriority === 'auto') {
    return sortedColumns.value;
  }
  return props.tableColumns;
});

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  filterResult.value = result;
  emit('filter-change', result);
  
  // 触发宽度重新计算
  if (props.enableAutoWidth) {
    nextTick(() => {
      calculateWidth();
    });
  }
};

// 处理展开/收起变化
const handleExpandChange = (isExpand: boolean) => {
  emit('expand-change', isExpand);
};

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

// 暴露
defineExpose({
  filterResult: computed(() => filterResult.value),
  crudRef,
  filterListRef: computed(() => filterGroupRef.value?.filterListRef),
  refresh: async (params?: any) => {
    await crudRef.value?.refresh(params);
  },
});
</script>
```

## 实施步骤

1. **创建类型定义文件** (`types.ts`)
2. **创建 composables**
   - `useColumnPriority.ts`：列优先级管理
   - `useDynamicWidth.ts`：动态宽度计算
   - `useColumnRender.ts`：列渲染优化
3. **创建主组件** (`index.vue`)
4. **编写文档** (`README.md`)
5. **编写测试用例**

## 注意事项

1. **性能优化**：列优先级计算和宽度计算需要防抖处理
2. **响应式**：需要监听窗口大小变化、筛选结果变化等
3. **兼容性**：确保与现有的 `BtcFilterGroup` 和 `BtcTable` 兼容
4. **可扩展性**：保留关键插槽，允许部分自定义
