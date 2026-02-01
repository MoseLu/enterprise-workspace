<template>
  <div class="btc-transfer-panel" :style="panelStyle">
    <BtcCrud
      ref="crudComponentRef"
      class="btc-transfer-panel__crud"
      :service="crudService"
      :options="crudOptions"
      :auto-load="autoLoadComputed"
      :border="false"
      padding="0"
    >
      <template #default>
        <div class="btc-transfer-panel__main">
          <header v-if="title || sourceTitle || collapsible || $slots['header-actions']" class="btc-transfer-panel__header">
            <div v-if="title || sourceTitle" class="btc-transfer-panel__titles">
              <span v-if="title" class="btc-transfer-panel__subtitle">{{ title }}</span>
              <span v-if="sourceTitle" class="btc-transfer-panel__title-text">{{ sourceTitle }}</span>
            </div>
            <div class="btc-transfer-panel__header-actions">
              <slot name="header-actions" />
              <button
                v-if="collapsible"
                type="button"
                class="btc-transfer-panel__collapse-btn"
                @click="toggleCollapse()"
              >
                <BtcSvg
                  class="btc-transfer-panel__collapse-icon"
                  :name="collapsed ? 'arrow-right' : 'arrow-down'"
                  :size="14"
                />
                <span>{{ collapsed ? collapseTexts.expand : collapseTexts.collapse }}</span>
              </button>
            </div>
          </header>

          <BtcCrudRow class="btc-transfer-panel__toolbar">
            <BtcIconButton :config="refreshButtonConfig" />
            <slot name="filters" />
            <BtcCrudFlex1 />
            <div class="btc-transfer-panel__search-wrapper">
              <BtcCrudSearchKey />
            </div>
          </BtcCrudRow>

          <BtcCrudRow class="btc-transfer-panel__table-row">
            <el-col :span="24">
              <BtcTable
                ref="tableComponentRef"
                :columns="tableColumns"
                :row-key="rowKeyProp"
                :disable-auto-created-at="true"
                :auto-height="autoHeight"
                v-bind="{
                  ...(maxHeight !== undefined ? { 'max-height': maxHeight } : {}),
                  border: true,
                  'reserve-selection': true
                }"
              >
                <template v-for="( slotName ) in scopedSlots" v-slot:[slotName]="scope">
                  <slot :name="slotName" v-bind="scope" />
                </template>
              </BtcTable>
            </el-col>
          </BtcCrudRow>

          <BtcCrudRow class="btc-transfer-panel__pagination-row" justify="center">
            <BtcPagination size="small" />
          </BtcCrudRow>
        </div>
      </template>
    </BtcCrud>

    <aside class="btc-transfer-panel__selected" :class="{ 'is-collapsed': collapsed && collapsible }">
      <header class="btc-transfer-panel__selected-header">
        <div class="btc-transfer-panel__selected-title">
          {{ targetTitle }}
          <span class="btc-transfer-panel__selected-count">({{ selectedEntries.length }})</span>
        </div>
        <div class="btc-transfer-panel__selected-actions">
          <button
            type="button"
            class="btc-transfer-panel__text-btn"
            :disabled="!selectedEntries.length"
            @click="handleClear"
          >
            清空
          </button>
          <button
            v-if="collapsible"
            type="button"
            class="btc-transfer-panel__icon-btn"
            @click="toggleCollapse()"
          >
            <BtcSvg :name="collapsed ? 'arrow-right' : 'arrow-down'" :size="14" />
          </button>
        </div>
      </header>

      <div class="btc-transfer-panel__selected-scroll">
        <template v-if="selectedEntries.length">
          <ul class="btc-transfer-panel__selected-list">
            <li
              v-for="entry in selectedEntries"
              :key="entry.key"
              class="btc-transfer-panel__selected-item"
            >
              <slot name="selected-item" :item="entry.item" :key-value="entry.key">
                <div class="btc-transfer-panel__selected-text">
                  <div class="btc-transfer-panel__selected-title-text">
                    {{ entry.display.title }}
                  </div>
                  <div v-if="entry.display.description" class="btc-transfer-panel__selected-desc">
                    {{ entry.display.description }}
                  </div>
                </div>
                <button
                  type="button"
                  class="btc-transfer-panel__icon-btn btc-transfer-panel__selected-remove"
                  @click="handleRemove(entry.key)"
                >
                  <BtcSvg name="delete" :size="14" />
                </button>
              </slot>
            </li>
          </ul>
        </template>
        <div v-else class="btc-transfer-panel__empty">{{ targetEmptyText }}</div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, useSlots, watch } from 'vue';
import { ElCol } from 'element-plus';
import BtcCrud from '@btc-crud/context/index.vue';
import BtcTable from '@btc-crud/table/index.vue';
import BtcPagination from '@btc-crud/pagination/index.vue';
import BtcCrudRow from '@btc-crud/crud-row/index.vue';
import BtcCrudFlex1 from '@btc-crud/crud-flex1/index.vue';
import BtcCrudSearchKey from '@btc-crud/crud-search-key/index.vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcIconButton from '@btc-components/basic/btc-icon-button/index.vue';
import { useI18n } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { IconButtonConfig } from '@btc-components/basic/btc-icon-button/types';
import type {
  TransferKey,
  TransferPanelEmits,
  TransferPanelExpose,
  TransferPanelColumn,
  SelectedItemDisplay,
} from './types';

const props = withDefaults(
  defineProps<{
    title?: string;
    sourceTitle?: string;
    targetTitle?: string;
    data?: any[] | null;
    service?: any;
    options?: any;
    columns: TransferPanelColumn<any>[];
    rowKey?: string | ((row: any) => TransferKey);
    modelValue: TransferKey[];
    loading?: boolean;
    autoLoad?: boolean;
    height?: string | number;
    collapsible?: boolean;
    displayProp?: string;
    descriptionProp?: string;
    selectedFormatter?: any;
    selectedMap?: Record<string, any>;
    targetEmptyText?: string;
    collapseText?: {
      expand?: string;
      collapse?: string;
    };
    pagination?: any;
    autoHeight?: boolean;
    maxHeight?: string | number;
  }>(),
  {
    sourceTitle: '',
    targetTitle: '已选择',
    data: () => [],
    columns: () => [],
    modelValue: () => [],
    autoLoad: true,
    collapsible: true,
    rowKey: 'id',
    targetEmptyText: '暂无选择',
    autoHeight: true,
  }
);

const emit = defineEmits<TransferPanelEmits<any>>();
const slots = useSlots();
const { t } = useI18n();

const crudComponentRef = ref<InstanceType<typeof BtcCrud> | null>(null);
const tableComponentRef = ref<InstanceType<typeof BtcTable> | null>(null);
const collapsed = ref(false);

const autoLoadComputed = computed(() => props.autoLoad ?? true);
const autoHeight = computed(() => props.autoHeight ?? true);
const scopedSlots = computed(() => slots);
const panelStyle = computed(() => {
  if (!props.height) return undefined;
  return { height: typeof props.height === 'number' ? `${props.height}px` : props.height };
});

const collapseTexts = computed(() => ({
  expand: props.collapseText?.expand ?? '展开已选',
  collapse: props.collapseText?.collapse ?? '收起已选',
}));

const rowKeyResolver = computed<(row: any) => TransferKey>(() => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey;
  }
  const key = props.rowKey ?? 'id';
  return (row: any) => row?.[key];
});

const rowKeyProp = computed(() => (typeof props.rowKey === 'string' ? props.rowKey : 'id'));

const selectionColumn = computed<TransferPanelColumn>(() => ({ type: 'selection', width: 48 }));
const tableColumns = computed<TransferPanelColumn[]>(() => {
  const base = props.columns ?? [];
  return base.some((col) => col.type === 'selection') ? base : [selectionColumn.value, ...base];
});

// 规范化 data，确保始终是数组
const normalizedData = computed(() => {
  const data = props.data;
  if (data === null || data === undefined) {
    return [];
  }
  return Array.isArray(data) ? data : [];
});

const localData = ref<any[]>([...normalizedData.value]);
watch(
  normalizedData,
  (val) => {
    localData.value = [...val];
    if (!props.service) {
      nextTick(() => {
        crudComponentRef.value?.crud?.forceRefresh?.();
      });
    }
  },
);

const noop = () => Promise.resolve();
const fallbackService = computed<CrudService<any>>(() => ({
  page: async (params: Record<string, any>) => {
    const size = Number(params?.size ?? 20);
    const page = Number(params?.page ?? 1);
    const start = (page - 1) * size;
    const list = localData.value.slice(start, start + size);
    return { list, total: localData.value.length };
  },
  add: noop,
  update: noop,
  delete: noop,
  deleteBatch: noop,
}));

const crudService = computed<CrudService<any>>(() => {
  if (!props.service) {
    return fallbackService.value;
  }
  if (typeof props.service.page === 'function') {
    return props.service as CrudService<any>;
  }
  if (typeof (props.service as any).list === 'function') {
    return {
      page: async (params: Record<string, unknown>) => {
        const res = await (props.service as any).list(params);
        if (res && typeof res === 'object') {
          const list = Array.isArray(res.list) ? res.list : Array.isArray(res.data) ? res.data : [];
          const total =
            typeof res.total === 'number'
              ? res.total
              : typeof res.count === 'number'
              ? res.count
              : typeof res.size === 'number'
              ? res.size
              : list.length;
          return { list, total };
        }
        if (Array.isArray(res)) {
          return { list: res, total: res.length };
        }
        return { list: [], total: 0 };
      },
      add: (props.service as any).add ?? noop,
      update: (props.service as any).update ?? noop,
      delete: (props.service as any).delete ?? noop,
      deleteBatch: (props.service as any).deleteBatch ?? (props.service as any).delete ?? noop,
    } as CrudService<any>;
  }
  return fallbackService.value;
});

const crudOptions = computed(() => {
  const incoming = props.options ?? {};
  return {
    ...incoming,
    onBeforeRefresh: (params: Record<string, unknown>) => {
      const result = incoming.onBeforeRefresh?.(params) ?? params;
      return result ?? params;
    },
    onAfterRefresh: (data: { list: any[]; total: number }) => {
      incoming.onAfterRefresh?.(data);
      nextTick(syncSelectionFromModel);
    },
  };
});

const selectedKeySet = ref<Set<string>>(new Set(normalizeKeys(props.modelValue)));
const selectedRecordMap = ref<Record<string, any>>({});

const selectedEntries = computed(() =>
  Array.from(selectedKeySet.value).map((key) => ({
    key,
    item: selectedRecordMap.value[key] ?? null,
    display: buildDisplay(selectedRecordMap.value[key] ?? null, key),
  })),
);

const selectedItems = computed(() =>
  Array.from(selectedKeySet.value)
    .map((key) => selectedRecordMap.value[key])
    .filter((item) => item !== undefined && item !== null),
);

const crudInstance = computed(() => crudComponentRef.value?.crud ?? null);

function handleRefresh() {
  crudInstance.value?.handleRefresh?.();
}

const refreshButtonConfig = computed<IconButtonConfig>(() => ({
  icon: 'refresh',
  tooltip: t('crud.button.refresh'),
  onClick: handleRefresh,
}));

watch(
  () => crudInstance.value,
  (crud) => {
    if (!crud) return;
    const autoLoad = autoLoadComputed.value;
    if (!autoLoad) {
      nextTick(() => refresh());
    }
  },
  { immediate: true },
);

const crudSelection = computed(() => crudInstance.value?.selection?.value ?? []);
const crudTableData = computed(() => crudInstance.value?.tableData?.value ?? []);

const syncingFromModel = ref(false);

watch(
  () => props.modelValue,
  (keys) => {
    // 如果正在从内部同步，跳过外部更新
    if (syncingFromModel.value) return;
    const normalized = normalizeKeys(keys);
    const currentKeys = Array.from(selectedKeySet.value);
    // 只有当 keys 真正变化时才更新
    if (!isSameKeys(normalized, currentKeys)) {
      selectedKeySet.value = new Set(normalized);
      nextTick(syncSelectionFromModel);
    }
  },
  { immediate: true },
);

watch(
  crudTableData,
  () => {
    nextTick(() => {
      syncSelectionFromModel();
      captureCurrentRows();
    });
  },
  { deep: true },
);

watch(
  crudSelection,
  (rows) => {
    if (syncingFromModel.value) return;
    applySelectionChange(rows);
  },
  { deep: true },
);

watch(
  () => [crudInstance.value?.page?.value, crudInstance.value?.size?.value],
  ([page, size]) => {
    if (page == null || size == null) return;
    emit('page-change', Number(page), Number(size));
  },
);

function keyToString(key: TransferKey): string {
  if (key === null || key === undefined) return '';
  return String(key);
}

function normalizeKeys(keys?: readonly TransferKey[] | TransferKey[]): string[] {
  if (!keys) return [];
  const set = new Set<string>();
  keys.forEach((key) => {
    const str = keyToString(key);
    if (str) set.add(str);
  });
  return Array.from(set);
}

function isSameKeys(a: readonly string[] | string[], b: readonly string[] | string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const key of setA) {
    if (!setB.has(key)) return false;
  }
  return true;
}

function resolveRowKey(row: any): string {
  const key = keyToString(rowKeyResolver.value(row));
  return key;
}

function syncSelectionFromModel(autoReset = true) {
  const crud = crudInstance.value;
  const table = tableComponentRef.value?.tableRef;
  if (!crud || !table) return;

  syncingFromModel.value = true;
  table.clearSelection?.();
  crud.clearSelection?.();

  const rows = crud.tableData.value ?? [];
  const keySet = selectedKeySet.value;
  const mapCopy: Record<string, any> = { ...selectedRecordMap.value };

  rows.forEach((row: any) => {
    const key = resolveRowKey(row);
    if (!key || !keySet.has(key)) return;
    table.toggleRowSelection(row, true);
    mapCopy[key] = row;
  });

  selectedRecordMap.value = mapCopy;
  if (autoReset) {
    syncingFromModel.value = false;
  }
}

function applySelectionChange(rows: any[]) {
  const crud = crudInstance.value;
  if (!crud) return;

  const pageRows = crud.tableData.value ?? [];
  const pageKeySet = new Set<string>(pageRows.map((row: any) => resolveRowKey(row)));
  const selectedPageKeys = new Set<string>(rows.map((row: any) => resolveRowKey(row)));

  const newSet = new Set(selectedKeySet.value);
  const mapCopy: Record<string, any> = { ...selectedRecordMap.value };

  pageKeySet.forEach((key: string) => {
    if (!key) return;
    if (!selectedPageKeys.has(key) && key in mapCopy) {
      delete mapCopy[key];
    }
    newSet.delete(key);
  });

  rows.forEach((row) => {
    const key = resolveRowKey(row);
    if (!key) return;
    newSet.add(key);
    mapCopy[key] = row;
  });

  selectedKeySet.value = newSet;
  selectedRecordMap.value = mapCopy;

  const keysArray = Array.from(newSet);
  emit('update:modelValue', keysArray);
  const itemsArray = keysArray.map((key) => mapCopy[key]).filter((item) => item !== undefined && item !== null);
  emit('change', { keys: keysArray, items: itemsArray });
}

function captureCurrentRows() {
  const crud = crudInstance.value;
  if (!crud) return;
  const rows = crud.tableData.value ?? [];
  if (!rows.length) return;
  const mapCopy: Record<string, any> = { ...selectedRecordMap.value };
  rows.forEach((row: any) => {
    const key = resolveRowKey(row);
    if (!key || !selectedKeySet.value.has(key)) return;
    mapCopy[key] = row;
  });
  selectedRecordMap.value = mapCopy;
}

function buildDisplay(item: any | null, key: TransferKey): SelectedItemDisplay {
  if (props.selectedFormatter) {
    const result = props.selectedFormatter(item ?? undefined, key);
    if (typeof result === 'string') {
      return { title: result };
    }
    if (result) {
      return result;
    }
  }
  if (item && props.displayProp && item[props.displayProp] != null) {
    const display: SelectedItemDisplay = {
      title: String(item[props.displayProp]),
    };
    if (props.descriptionProp && item[props.descriptionProp] != null) {
      display.description = String(item[props.descriptionProp]);
    }
    return display;
  }
  return {
    title: keyToString(key),
  };
}

function handleRemove(key: TransferKey) {
  const keyStr = keyToString(key);
  if (!keyStr) return;

  const crud = crudInstance.value;
  const table = tableComponentRef.value?.tableRef;

  // 先更新 selectedKeySet
  const newSet = new Set(selectedKeySet.value);
  newSet.delete(keyStr);
  selectedKeySet.value = newSet;

  const mapCopy = { ...selectedRecordMap.value };
  const currentRows = crud?.tableData.value ?? [];
  const targetRow = currentRows.find((row: any) => resolveRowKey(row) === keyStr);
  const removedItem = mapCopy[keyStr] ?? targetRow ?? null;
  delete mapCopy[keyStr];
  selectedRecordMap.value = mapCopy;

  // 立即同步表格选择状态：根据新的 selectedKeySet 重新同步
  // 这会清除所有选择，然后只选择在 selectedKeySet 中的行
  if (table) {
    // 不自动重置 syncingFromModel，由我们手动控制
    syncSelectionFromModel(false);
  }

  const keysArray = Array.from(newSet);
  emit('update:modelValue', keysArray);
  const itemsArray = keysArray.map((k) => mapCopy[k]).filter((item) => item !== undefined && item !== null);
  emit('change', { keys: keysArray, items: itemsArray });
  emit('remove', { key, item: removedItem });

  // 延迟重置 syncingFromModel，确保 watch 不会干扰
  if (table) {
    nextTick(() => {
      syncingFromModel.value = false;
    });
  }
}

function handleClear() {
  // crud 变量未使用，但保留 crudInstance.value 的引用以保持代码结构
  void crudInstance.value; // 确保引用被使用
  const table = tableComponentRef.value?.tableRef;

  // 先更新 selectedKeySet
  selectedKeySet.value = new Set();
  selectedRecordMap.value = {};

  // 立即同步表格选择状态：根据新的 selectedKeySet 重新同步（此时应该没有选择）
  if (table) {
    // 不自动重置 syncingFromModel，由我们手动控制
    syncSelectionFromModel(false);
  }

  emit('update:modelValue', []);
  emit('change', { keys: [], items: [] });
  emit('clear');

  // 延迟重置 syncingFromModel，确保 watch 不会干扰
  if (table) {
    nextTick(() => {
      syncingFromModel.value = false;
    });
  }
}

function toggleCollapse(force?: boolean) {
  if (!props.collapsible) return;
  collapsed.value = force ?? !collapsed.value;
}

function refresh(params?: Record<string, unknown>) {
  if (!crudInstance.value) return;
  if (params && Object.keys(params).length > 0) {
    crudInstance.value.handleSearch?.(params);
  } else {
    if (autoLoadComputed.value === false) {
      crudInstance.value.handleSearch?.({});
    } else {
      crudInstance.value.handleRefresh?.();
    }
  }
}

defineExpose<TransferPanelExpose<any>>({
  clear: handleClear,
  toggleCollapse,
  selectedItems,
  refresh,
});
</script>

<style lang="scss" scoped>
.btc-transfer-panel {
  display: flex;
  gap: 16px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.btc-transfer-panel__crud {
  flex: 1;
  min-width: 0;
}

.btc-transfer-panel__crud :deep(.btc-crud) {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
}

.btc-transfer-panel__main {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  gap: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  background-color: var(--el-bg-color);

  :deep(.btc-crud-row) {
    row-gap: 10px;
    column-gap: 10px;
  }

  :deep(.btc-crud > .btc-crud-row + .btc-crud-row) {
    margin-top: 10px !important;
  }

  > .btc-crud-row + .btc-crud-row {
    margin-top: 10px !important;
  }
}

.btc-transfer-panel__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.btc-transfer-panel__titles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btc-transfer-panel__subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.btc-transfer-panel__title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.btc-transfer-panel__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btc-transfer-panel__collapse-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--el-color-primary);
  border: none;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.btc-transfer-panel__collapse-icon {
  display: flex;
  align-items: center;
}

.btc-transfer-panel__toolbar {
  flex-shrink: 0;
}

.btc-transfer-panel__search-wrapper {
  display: flex;
  align-items: center;
  margin-right: -1px; /* 对齐表格右侧边框 */

  :deep(.btc-search-key__icon-btn) {
    width: 26px !important;
    height: 26px !important;
  }

  :deep(.btc-search-key__icon-btn .btc-svg) {
    font-size: 16px !important;
  }

  :deep(.btc-search-key.is-collapsible:not(.is-expanded)) {
    flex: 0 0 26px !important;
    width: 26px !important;
    max-width: 26px !important;
    min-width: 26px !important;
  }

  :deep(.btc-search-key .el-input__wrapper) {
    min-height: 26px !important;
  }

  :deep(.btc-search-key .el-input__inner) {
    height: 26px !important;
    line-height: 26px !important;
  }
}

.btc-transfer-panel__table-row {
  flex: 1;
  min-height: 0;
}

.btc-transfer-panel__table-row :deep(.el-col) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.btc-transfer-panel__table-row :deep(.btc-table) {
  flex: 1;
  min-height: 0;
}

.btc-transfer-panel__pagination-row {
  flex-shrink: 0;
}

.btc-transfer-panel__selected {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-lighter);
  padding: 16px;
  box-sizing: border-box;
}

.btc-transfer-panel__selected.is-collapsed {
  display: none;
}

.btc-transfer-panel__selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.btc-transfer-panel__selected-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.btc-transfer-panel__selected-count {
  margin-left: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.btc-transfer-panel__selected-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btc-transfer-panel__text-btn {
  border: none;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.btc-transfer-panel__text-btn:disabled {
  color: var(--el-text-color-placeholder);
  cursor: not-allowed;
}

.btc-transfer-panel__icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btc-transfer-panel__selected-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.btc-transfer-panel__selected-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btc-transfer-panel__selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background-color: var(--el-fill-color-lighter);
}

.btc-transfer-panel__selected-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.btc-transfer-panel__selected-title-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.btc-transfer-panel__selected-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.btc-transfer-panel__selected-remove {
  color: var(--el-color-danger);
  flex-shrink: 0;
  width: 20px;
  height: 20px;

  &:hover {
    color: var(--el-color-danger);
    opacity: 0.8;
  }

  .btc-svg {
    color: inherit;
  }
}

.btc-transfer-panel__empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  padding: 12px 0;
  text-align: center;
}
</style>

