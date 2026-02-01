<template>
  <el-scrollbar>
    <el-table
      ref="tableRef"
      class="btc-table"
      :key="rebuildKey"
      :data="crud?.tableData?.value ?? []"
      :loading="crud?.loading?.value || false"
      :height="height || '100%'"
      :max-height="autoHeight ? (autoMaxHeight && autoMaxHeight > 0 ? autoMaxHeight : (maxHeight ?? undefined)) : (maxHeight || undefined)"
      :row-key="rowKey || 'username'"
      :empty-text="translatedEmptyText"
      :default-sort="computedDefaultSort"
      :border="currentBorder"
      :stripe="currentStripe"
      :size="currentSize"
      :header-cell-style="mergedHeaderCellStyle"
      highlight-current-row
      fit
      v-bind="tableAttrs"
      @selection-change="crud?.handleSelectionChange"
      @sort-change="onSortChange"
      @row-contextmenu="onRowContextMenu"
      style="width: 100%"
    >
    <table-column
        v-for="(column, index) in visibleColumns"
        :key="column.prop || column.type || index"
      :column="column"
    >
      <template v-for="slot in Object.keys($slots)" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>

        <template #op-slot="{ scope, column: opColumn }">
        <div class="btc-table-op">
          <slot name="op-buttons" v-bind="scope">
            <template v-for="(btn, btnIndex) in getOpButtons(opColumn, scope || {})" :key="btnIndex">
              <slot
                v-if="typeof btn === 'string' && btn.startsWith('slot-')"
                :name="btn"
                v-bind="scope"
              />
              <template v-else-if="typeof btn === 'string'">
                <BtcTableButton
                  v-if="isMinimalButtonStyle"
                  class="btc-table-op__btn"
                  :config="getStringOpButtonConfig(btn, scope)"
                />
                <el-button
                  v-else
                  text
                  class="btc-crud-btn btc-crud-op-btn"
                  :type="getButtonType(btn)"
                  @click="handleOpClick(btn, scope.row, emit as any)"
                >
                  <BtcSvg
                    v-if="getButtonIcon(btn)"
                    class="btc-crud-btn__icon"
                    :name="getButtonIcon(btn) || ''"
                  />
                  <span class="btc-crud-btn__text">
                    {{ getButtonText(btn) }}
                  </span>
                </el-button>
              </template>
              <template v-else-if="typeof btn === 'object'">
                <BtcTableButton
                  v-if="isMinimalButtonStyle"
                  class="btc-table-op__btn"
                  :config="getObjectOpButtonConfig(btn, scope)"
                />
                <el-button
                  v-else
                  text
                  class="btc-crud-btn btc-crud-op-btn"
                  :type="btn.type"
                  @click="btn.onClick?.({ scope })"
                >
                  <BtcSvg
                    v-if="btn.icon"
                    class="btc-crud-btn__icon"
                    :name="btn.icon"
                  />
                  <span class="btc-crud-btn__text">
                    {{ btn.label }}
                  </span>
                </el-button>
              </template>
            </template>
          </slot>
        </div>
      </template>
    </table-column>

    <template #empty>
      <div class="btc-table__empty">
        <slot name="empty">
          <BtcEmpty :image-size="100" :description="translatedEmptyText" />
        </slot>
      </div>
    </template>
  </el-table>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, inject, provide, toRefs, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAttrs } from 'vue';
import { ElScrollbar } from 'element-plus';
import type { TableInstance } from 'element-plus';
import type { UseCrudReturn } from '@btc/shared-core';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import type { TableColumn, TableProps, TableSize, TableToolbarItem } from './types';
import {
  useTableColumns,
  useTableOp,
  useTableHeight,
  useTableContextMenu,
  useTableSort,
  useTablePreferences,
} from './composables';
import TableColumnComponent from './components/table-column.vue';
import BtcTableButton from '../../components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '../../components/basic/btc-table-button/types';
import BtcSvg from '../../components/basic/btc-svg/index.vue';
import BtcEmpty from '../../components/basic/btc-empty/index.vue';
import { crudLayoutKey, DEFAULT_OPERATION_WIDTH } from '@btc-crud/context/layout';

defineOptions({
  name: 'BtcTable',
  components: {
    TableColumn: TableColumnComponent,
    BtcTableButton,
    BtcSvg,
  },
});

const DEFAULT_TOOLBAR_LAYOUT: TableToolbarItem[] = ['size', 'columns', 'style'];
const DEFAULT_PREFERENCE_KEY = 'btc-table';

const props = withDefaults(defineProps<TableProps>(), {
  autoHeight: true,
  rowKey: 'id',
  sortRefresh: true,
  emptyText: 'common.table.empty',
  disableAutoCreatedAt: false,
  toolbar: true,
});

const emit = defineEmits(['selection-change', 'sort-change', 'detail-click']);

const attrs = useAttrs();

const { autoHeight, height, maxHeight, rowKey, emptyText, defaultSort } = toRefs(props);

const { t } = useI18n();
const theme = useThemePlugin();

const translatedEmptyText = computed(() => t(emptyText.value));

const crud = inject<UseCrudReturn<any>>('btc-crud');
const tableRefContext = inject<any>('btc-table-ref');

if (!crud) {
  throw new Error('[BtcTable] Must be used inside <BtcCrud>');
}

const toolbarState = computed(() => {
  const config = props.toolbar;
  if (config === false) {
    return {
      visible: false,
      items: new Set<TableToolbarItem>(),
      storageKey: props.storageKey,
    };
  }
  if (config === true || config === undefined) {
    return {
      visible: true,
      items: new Set<TableToolbarItem>(DEFAULT_TOOLBAR_LAYOUT),
      storageKey: props.storageKey,
    };
  }

  const layout =
    Array.isArray(config.layout) && config.layout.length > 0
      ? config.layout
      : DEFAULT_TOOLBAR_LAYOUT;

  return {
    visible: config.visible !== false,
    items: new Set<TableToolbarItem>(layout),
    storageKey: config.storageKey ?? props.storageKey,
  };
});

const preferenceKey = toolbarState.value.storageKey ?? props.storageKey ?? DEFAULT_PREFERENCE_KEY;

const preferences = useTablePreferences({
  storageKey: preferenceKey,
  defaultSize: props.size ?? 'default',
  defaultStripe: props.stripe ?? false,
  defaultBorder: props.border ?? true,
  defaultHeaderBackground: props.headerBackground ?? true,
  defaultTagRound: false,
});

const isBorderControlled = computed(() => props.border !== undefined);
const isStripeControlled = computed(() => props.stripe !== undefined);
const isHeaderBackgroundControlled = computed(() => props.headerBackground !== undefined);
const isSizeControlled = computed(() => props.size !== undefined);

const currentBorder = computed<boolean>({
  get: () => props.border ?? preferences.border.value,
  set: (value) => {
    if (props.border === undefined) {
      preferences.border.value = value;
    }
  },
});

const currentStripe = computed<boolean>({
  get: () => props.stripe ?? preferences.stripe.value,
  set: (value) => {
    if (props.stripe === undefined) {
      preferences.stripe.value = value;
    }
  },
});

const currentHeaderBackground = computed<boolean>({
  get: () => props.headerBackground ?? preferences.headerBackground.value,
  set: (value) => {
    if (props.headerBackground === undefined) {
      preferences.headerBackground.value = value;
    }
  },
});

const currentSize = computed<TableSize>({
  get: () => props.size ?? preferences.size.value,
  set: (value) => {
    if (props.size === undefined) {
      preferences.size.value = value;
    }
  },
});

const currentTagRound = computed<boolean>({
  get: () => preferences.tagRound.value,
  set: (value) => {
    preferences.tagRound.value = value;
  },
});

const sizeButtonConfig = computed(() => ({
  icon: 'table-density',
  tooltip: () => t('btc.table.toolbar.size'),
  type: 'default',
  size: 20,
  disabled: isSizeControlled.value,
  class: 'btc-table-toolbar__icon',
}));

const columnsButtonConfig = computed(() => ({
  icon: 'table-columns',
  tooltip: () => t('btc.table.toolbar.columns'),
  type: 'default',
  size: 20,
  class: 'btc-table-toolbar__icon',
}));

const styleButtonConfig = computed(() => ({
  icon: 'table-style',
  tooltip: () => t('btc.table.toolbar.style'),
  type: 'default',
  size: 20,
  class: 'btc-table-toolbar__icon',
}));

const mergedHeaderCellStyle = computed(() => {
  const background = currentHeaderBackground.value
    ? 'var(--el-fill-color-lighter)'
    : 'var(--el-bg-color)';

  const base = props.headerCellStyle;

  if (typeof base === 'function') {
    return (data: any) => ({
      background,
      ...(base(data) || {}),
    });
  }

  return {
    background,
    ...(base || {}),
  };
});

const tableAttrs = computed(() => attrs);

const tableRef = ref<TableInstance>();
const crudLayout = inject(crudLayoutKey, null);

// Provide tagRound 给子组件使用
const tableTagRoundKey = Symbol.for('btc-table-tag-round');
provide(tableTagRoundKey, currentTagRound);

const { computedColumns } = useTableColumns(props as any);

const getColumnKey = (column: TableColumn): string | undefined => {
  if (column.prop) return column.prop;
  if (column.type) return `__${column.type}`;
  return undefined;
};

const isToggleable = (column: TableColumn) => {
  if (column.toggleable === false || column.alwaysVisible === true) {
    return false;
  }
  return true;
};

const transformColumns = (columns: TableColumn[]): TableColumn[] => {
  const result: TableColumn[] = [];

  columns.forEach((column) => {
    const key = getColumnKey(column);
    const hiddenByPreference = isToggleable(column) && preferences.isColumnHidden(key);

    if (column.hidden || hiddenByPreference) {
      return;
    }

    let next: TableColumn = { ...column };

    if (column.children && column.children.length > 0) {
      const children = transformColumns(column.children);
      if (children.length === 0 && !column.prop && !column.type) {
        return;
      }
      next = { ...next, children };
    }

    result.push(next);
  });

  return result;
};

// 使用计算后的列配置（列宽已在 useTableColumns 中统一处理）
const visibleColumns = computed(() => transformColumns(computedColumns.value));

interface ColumnOption {
  key: string;
  label: string;
  disabled: boolean;
  checked: boolean;
}

/**
 * 判断字符串是否是国际化 key（而不是翻译后的值）
 * 国际化 key 的格式：以字母开头，包含至少一个点，且点前后都有非空字符
 */
const isI18nKey = (str: string): boolean => {
  if (!str.includes('.')) {
    return false;
  }
  const parts = str.split('.');
  if (parts.length < 2) {
    return false;
  }
  const firstPart = parts[0]?.trim();
  if (!firstPart || !/^[a-zA-Z]/.test(firstPart)) {
    return false;
  }
  return parts.every(part => part.trim().length > 0);
};

const resolveColumnLabel = (column: TableColumn, fallback: string) => {
  if (typeof column.label === 'string') {
    return isI18nKey(column.label) ? t(column.label) : column.label;
  }

  if (column.prop) return column.prop;

  if (column.type === 'selection') {
    return t('btc.table.columns.selection');
  }

  if (column.type === 'index') {
    return t('crud.table.index');
  }

  if (column.type === 'op') {
    return t('ui.table.operation');
  }

  return fallback;
};

const columnOptions = computed<ColumnOption[]>(() => {
  const options: ColumnOption[] = [];
  const seen = new Set<string>();

  const traverse = (columns: TableColumn[]) => {
    columns.forEach((column) => {
      const key = getColumnKey(column);
      if (column.children && column.children.length > 0) {
        traverse(column.children);
      }

      if (!key || seen.has(key)) {
        return;
      }

      const disabled = !isToggleable(column);
      const label = resolveColumnLabel(column, key);

      options.push({
        key,
        label,
        disabled,
        checked: disabled ? true : !preferences.isColumnHidden(key),
      });

      seen.add(key);
    });
  };

  traverse(computedColumns.value);

  return options;
});

watch(
  columnOptions,
  (options) => {
    const availableKeys = new Set(options.map((item) => item.key));
    const disabledKeys = new Set(options.filter((item) => item.disabled).map((item) => item.key));
    const filtered = preferences.hiddenColumns.value.filter(
      (key) => availableKeys.has(key) && !disabledKeys.has(key),
    );
    if (filtered.length !== preferences.hiddenColumns.value.length) {
      preferences.hiddenColumns.value = filtered;
    }
  },
  { deep: true },
);

const handleColumnVisibility = (key: string, value: unknown) => {
  preferences.setColumnVisibility(key, value === true);
};

const handleSizeCommand = (command: TableSize) => {
  if (isSizeControlled.value) return;
  currentSize.value = command;
};

const setStripe = (val: boolean) => {
  if (isStripeControlled.value) return;
  currentStripe.value = val;
};

const setBorder = (val: boolean) => {
  if (isBorderControlled.value) return;
  currentBorder.value = val;
};

const setHeaderBackground = (val: boolean) => {
  if (isHeaderBackgroundControlled.value) return;
  currentHeaderBackground.value = val;
};

const setTagRound = (val: boolean) => {
  currentTagRound.value = val;
};

const toolbarMounted = ref(false);

const toolbarBinding = {
  visible: computed(() => toolbarState.value.visible),
  items: computed(() => toolbarState.value.items),
  columnOptions,
  handleColumnVisibility,
  sizeButtonConfig,
  columnsButtonConfig,
  styleButtonConfig,
  handleSizeCommand,
  currentSize,
  currentStripe,
  currentBorder,
  currentHeaderBackground,
  currentTagRound,
  isSizeControlled,
  isStripeControlled,
  isBorderControlled,
  isHeaderBackgroundControlled,
  setStripe,
  setBorder,
  setHeaderBackground,
  setTagRound,
  toolbarMounted,
};

const syncOperationWidth = () => {
  if (!crudLayout) return;
  const opColumn = visibleColumns.value.find((column) => column.type === 'op');
  // 操作列的宽度已经在 useTableColumns 中增加了 gap，所以这里直接使用即可
  const widthCandidate =
    (opColumn && typeof opColumn.width === 'number' && opColumn.width > 0 && opColumn.width) ||
    (opColumn && typeof opColumn.minWidth === 'number' && opColumn.minWidth > 0 && opColumn.minWidth) ||
    DEFAULT_OPERATION_WIDTH;
  crudLayout.setOperationWidth(widthCandidate);
};

if (crudLayout) {
  watch(
    visibleColumns,
    () => {
      syncOperationWidth();
    },
    { deep: true, immediate: true },
  );
}

onMounted(() => {
  syncOperationWidth();
  toolbarMounted.value = true;
});

onBeforeUnmount(() => {
  toolbarMounted.value = false;
  if (tableRefContext && typeof tableRefContext === 'object' && 'value' in tableRefContext) {
    // 在父级 provide 仍存在时安全清理引用，避免在未提供上下文时读写抛错
    (tableRefContext as any).value = null;
  }
});

if (tableRefContext) {
  tableRefContext.value = {
    tableRef,
    columns: visibleColumns,
    allColumns: computedColumns,
    toolbarBinding,
  };
}

const { getOpButtons, getButtonType, getButtonText, getButtonIcon, handleOpClick, showColumn, hideColumn, setColumns, reBuild, rebuildKey } =
  useTableOp(crud, props as any);

const isMinimalButtonStyle = computed(() => theme.buttonStyle?.value === 'minimal');

const getStringOpButtonConfig = (btn: string, scope: any): BtcTableButtonConfig => {
  const text = getButtonText(btn);
  const rawIcon = getButtonIcon(btn);
  const icon = isMinimalButtonStyle.value ? rawIcon : undefined;
  const showLabel = !isMinimalButtonStyle.value || !icon;
  return {
    icon: icon || (() => ''),
    label: text,
    showLabel,
    tooltip: () => text,
    ariaLabel: text,
    type: (getButtonType(btn) as BtcTableButtonConfig['type']) ?? 'default',
    onClick: () => handleOpClick(btn, scope.row, emit as any),
  };
};

const getObjectOpButtonConfig = (btn: any, scope: any): BtcTableButtonConfig => {
  const text = btn.label || btn.tooltip || '';
  const rawIcon = btn.icon;
  const icon = isMinimalButtonStyle.value ? rawIcon : undefined;
  const showLabel = !isMinimalButtonStyle.value || !icon;
  return {
    icon: icon || undefined,
    label: text,
    showLabel,
    tooltip: () => text,
    ariaLabel: text,
    type: (btn.type as BtcTableButtonConfig['type']) ?? 'default',
    onClick: () => btn.onClick?.({ scope }),
  };
};

const { maxHeight: autoMaxHeight, calcMaxHeight } = useTableHeight(props as any, tableRef);
const { onRowContextMenu } = useTableContextMenu(crud, props as any, tableRef);
const { defaultSort: tableDefaultSort, onSortChange, clearSort } = useTableSort(crud, props as any, emit);

const computedDefaultSort = computed(() => tableDefaultSort.value ?? defaultSort.value);

const scheduleAutoHeight = () => {
  calcMaxHeight();
};

watch(
  () => crud?.tableData?.value?.length ?? 0,
  () => {
    scheduleAutoHeight();
  },
);

watch(
  () => crud?.loading?.value ?? false,
  (loading) => {
    if (!loading) {
      scheduleAutoHeight();
    }
  },
);

watch(
  () => props.autoHeight,
  (val) => {
    if (val) {
      calcMaxHeight();
    } else {
      calcMaxHeight();
    }
  },
  { immediate: true },
);

watch(
  () => autoMaxHeight.value,
  () => {
    nextTick(() => {
      tableRef.value?.doLayout?.();
    });
  },
);

defineExpose({
  tableRef,
  crud,
  maxHeight: autoMaxHeight,
  calcMaxHeight,
  showColumn,
  hideColumn,
  setColumns,
  reBuild,
  clearSort,
  columns: visibleColumns,
  preferences,
  toolbarBinding,
});
</script>

<style lang="scss" scoped>
// 修复固定列层级遮挡问题
// 核心问题：样式穿透、选择器权重、层级上下文、背景色透明
.btc-table {
  // .container 已经强制设置了 width: 100% 和 height: 100%
  // width: 100%; // 可选：显式设置，但 .container 已强制设置
  // height: 100%; // 可选：显式设置，但 .container 已强制设置

  display: flex; // flex 布局
  flex-direction: column; // 垂直布局
  min-height: 0; // 允许收缩

  // 使用 :deep() 穿透 scoped 样式隔离，确保样式作用到 el-table 内部 DOM
  :deep(.el-table) {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    // 1. 固定右侧列（操作列）- 最高层级
    .el-table__fixed-right {
      position: absolute !important; // 确保定位生效
      z-index: 101 !important; // 高于左侧列，确保在最上层
      background-color: var(--el-bg-color) !important; // 关键：设置背景色，避免透明穿透
    }

    .el-table__fixed-right-patch {
      z-index: 101 !important;
      background-color: var(--el-bg-color) !important;
    }

    .el-table__fixed-right-header,
    .el-table__fixed-right-body {
      z-index: 101 !important;
      background-color: var(--el-bg-color) !important;
    }

    // 2. 固定左侧列 - 层级低于右侧列
    .el-table__fixed-left {
      position: absolute !important; // 确保定位生效
      z-index: 100 !important; // 低于右侧列，但高于滚动区域
      background-color: var(--el-bg-color) !important; // 关键：设置背景色，避免透明穿透
    }

    .el-table__fixed-left-patch {
      z-index: 100 !important;
      background-color: var(--el-bg-color) !important;
    }

    .el-table__fixed-left-header,
    .el-table__fixed-left-body {
      z-index: 100 !important;
      background-color: var(--el-bg-color) !important;
    }

    // 3. 中间滚动区域 - 最低层级，确保在固定列下方
    .el-table__inner {
      flex: 1;
      min-height: 0;
      // 注意：不应该在这里设置 overflow-y: auto
      // 滚动由 .container 统一处理，自动出现滚动条

      .el-table__header-wrapper,
      .el-table__body-wrapper {
        position: relative !important; // 补全定位，确保 z-index 生效
        z-index: 1 !important; // 低于所有固定列，确保从固定列下方滚动
      }
    }

    // 4. 修复固定列边框（右侧列的左边框）
    .el-table__fixed-right::before,
    .el-table__fixed-right-patch::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: -1px;
      width: 1px;
      background-color: var(--el-border-color);
      pointer-events: none;
      z-index: 102 !important; // 边框在最上层
    }
  }
}
</style>
