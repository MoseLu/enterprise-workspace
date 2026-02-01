<template>
  <ElDrawer
    :model-value="visible"
    :size="width"
    :with-header="false"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    :modal="false"
    append-to-body
    :lock-scroll="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="btc-transfer-drawer">
      <header class="btc-transfer-drawer__header">
        <div class="btc-transfer-drawer__header-left">
          <slot name="header">
            <div v-if="title || subtitle" class="btc-transfer-drawer__header-title">
              <div v-if="title" class="btc-transfer-drawer__header-title-text">{{ title }}</div>
              <div v-if="subtitle" class="btc-transfer-drawer__header-subtitle">{{ subtitle }}</div>
            </div>
          </slot>
        </div>
        <div class="btc-transfer-drawer__header-actions">
          <slot name="header-actions" />
          <ElButton text @click="handleCancel">
            <BtcSvg name="close" :size="16" />
          </ElButton>
        </div>
      </header>

      <div class="btc-transfer-drawer__content">
        <div class="btc-transfer-drawer__splitter">
          <div
            v-for="section in normalizedSections"
            :key="section.key"
            class="btc-transfer-drawer__panel"
            :class="{ 'is-expanded': isExpanded(section.key), 'is-collapsed': !isExpanded(section.key) }"
          >
            <header class="btc-transfer-drawer__panel-header" @click="toggleSection(section.key)">
              <BtcSvg
                class="btc-transfer-drawer__panel-icon"
                :class="{ 'is-expanded': expandedKeys.has(section.key) }"
                name="arrow-right"
                :size="16"
              />
              <div class="btc-transfer-drawer__panel-title">
                <span class="btc-transfer-drawer__panel-title-text">{{ section.title }}</span>
                <span v-if="section.subtitle" class="btc-transfer-drawer__panel-subtitle">{{ section.subtitle }}</span>
              </div>
            </header>

            <div class="btc-transfer-drawer__panel-body" :data-key="section.key">
              <!-- 如果有自定义内容 slot，使用自定义内容，否则使用 BtcTransferPanel -->
              <template v-if="$slots[`content-${section.key}`]">
                <slot :name="`content-${section.key}`" />
              </template>
              <BtcTransferPanel
                v-else
                :ref="setPanelRef(section.key)"
                v-model="panelState[section.key]"
                v-bind="cleanedTransferProps[section.key]"
                height="100%"
                @change="(payload) => handlePanelChange(section.key, payload)"
                @remove="(payload) => handlePanelRemove(section.key, payload)"
                @clear="() => handlePanelClear(section.key)"
              >
                <template #filters>
                  <slot :name="`filters-${section.key}`" :refresh="() => refreshSection(section.key)" />
                </template>
                <template #selected-item="scope">
                  <slot :name="`selected-item-${section.key}`" v-bind="scope" />
                </template>
              </BtcTransferPanel>
            </div>
          </div>
        </div>
      </div>

      <footer class="btc-transfer-drawer__footer">
        <slot name="footer">
          <ElButton @click="handleCancel">{{ cancelText }}</ElButton>
          <ElButton type="primary" :loading="confirmLoading" @click="handleConfirm">
            {{ confirmText }}
          </ElButton>
        </slot>
      </footer>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcTransferPanel from '../btc-transfer-panel/index.vue';
import type { TransferKey, TransferPanelChangePayload } from '../btc-transfer-panel/types';
import type { TransferDrawerSection, TransferDrawerChangePayload, TransferDrawerRemovePayload } from './types';

interface Props {
  visible: boolean;
  sections: TransferDrawerSection[];
  title?: string;
  subtitle?: string;
  width?: string | number;
  cancelText?: string;
  confirmText?: string;
  confirmLoading?: boolean;
  closeOnClickModal?: boolean;
  destroyOnClose?: boolean;
  autoHeight?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: '60%',
  cancelText: '取消',
  confirmText: '确认',
  confirmLoading: false,
  closeOnClickModal: false,
  destroyOnClose: false,
  autoHeight: true,
});

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
  (event: 'confirm'): void;
  (event: 'cancel'): void;
  (event: 'update:section-keys', payload: TransferDrawerChangePayload): void;
  (event: 'change', payload: TransferDrawerChangePayload): void;
  (event: 'remove', payload: TransferDrawerRemovePayload): void;
  (event: 'clear', sectionKey: string): void;
}>();

const normalizedSections = computed(() => props.sections ?? []);

// 为每个 section 构建清理后的 transferProps
const cleanedTransferProps = computed(() => {
  const result: Record<string, any> = {};
  normalizedSections.value.forEach((section) => {
    const transferProps = { ...section.transferProps };
    // 移除 null 或 undefined 的 data 属性
    if (transferProps.data === null || transferProps.data === undefined) {
      delete transferProps.data;
    }
    // 如果 transferProps 中没有设置 autoHeight，使用组件级别的 autoHeight
    if (transferProps.autoHeight === undefined) {
      transferProps.autoHeight = props.autoHeight;
    }
    result[section.key] = transferProps;
  });
  return result;
});

const panelState = reactive<Record<string, TransferKey[]>>({});
const expandedKeys = ref<Set<string>>(new Set());
const panelRefs = reactive<Record<string, any>>({});

watch(
  normalizedSections,
  (sections) => {
    const newKeys = sections.map((section) => section.key);

    sections.forEach((section) => {
      const normalizedKeys = normalizeKeys(section.modelValue);
      if (!panelState[section.key]) {
        panelState[section.key] = normalizedKeys;
      } else {
        panelState[section.key] = normalizedKeys;
      }
    });

    Object.keys(panelState).forEach((key) => {
      if (!newKeys.includes(key)) {
        delete panelState[key];
        delete panelRefs[key];
      }
    });

    if (expandedKeys.value.size === 0) {
      expandedKeys.value = new Set(newKeys);
    } else {
      newKeys.forEach((key) => expandedKeys.value.add(key));
      Array.from(expandedKeys.value).forEach((key) => {
        if (!newKeys.includes(key)) {
          expandedKeys.value.delete(key);
        }
      });
    }
  },
  { immediate: true, deep: true },
);

function normalizeKeys(keys: TransferKey[]): TransferKey[] {
  const map = new Map<string, TransferKey>();
  keys?.forEach((key) => {
    const str = keyToString(key);
    if (str) {
      map.set(str, key);
    }
  });
  return Array.from(map.values());
}

function keyToString(key: TransferKey): string {
  if (key === undefined || key === null) return '';
  return String(key);
}

function handleVisibleChange(value: boolean) {
  emit('update:visible', value);
  if (!value) {
    emit('cancel');
  }
}

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('update:visible', false);
  emit('cancel');
}

function isExpanded(key: string) {
  return expandedKeys.value.has(key);
}

function toggleSection(key: string) {
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key);
  } else {
    expandedKeys.value.add(key);
  }
}

function setPanelRef(key: string) {
  return (el: any) => {
    if (el) {
      panelRefs[key] = el;
    } else {
      delete panelRefs[key];
    }
  };
}

function handlePanelChange(key: string, payload: TransferPanelChangePayload<any>) {
  panelState[key] = normalizeKeys(payload.keys);
  emit('update:section-keys', { key, keys: [...panelState[key]], items: payload.items ?? [] });
  emit('change', { key, keys: [...panelState[key]], items: payload.items ?? [] });
}

function handlePanelRemove(key: string, payload: { key: TransferKey; item: any }) {
  const current = panelState[key] ?? [];
  const str = keyToString(payload.key);
  panelState[key] = current.filter((item) => keyToString(item) !== str);
  emit('remove', { sectionKey: key, key: payload.key, item: payload.item });
}

function handlePanelClear(key: string) {
  panelState[key] = [];
  emit('update:section-keys', { key, keys: [], items: [] });
  emit('clear', key);
}

function refreshSection(key: string, params?: Record<string, unknown>) {
  panelRefs[key]?.refresh?.(params);
}

function refreshAll(params?: Record<string, unknown>) {
  normalizedSections.value.forEach((section) => refreshSection(section.key, params));
}

defineExpose({
  refreshSection,
  refreshAll,
});
</script>

<style lang="scss" scoped>
.btc-transfer-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  gap: 0;
}

.btc-transfer-drawer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.btc-transfer-drawer__header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.btc-transfer-drawer__header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btc-transfer-drawer__header-title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.btc-transfer-drawer__header-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.btc-transfer-drawer__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btc-transfer-drawer__content {
  overflow: hidden;
  flex: 1;
  min-height: 0;
  max-height: 100%;
  padding: 0 16px;
  margin-bottom: 16px;
}

.btc-transfer-drawer__splitter {
  height: 100%;
  max-height: 100%;
  width: 100%;
  overflow: hidden;

  :deep(.el-splitter__panel) {
    overflow: hidden;
    max-height: 100%;
  }

  :deep(.el-splitter-bar) {
    display: none; // 隐藏分隔条，因为 resizable="false"
  }
}

.btc-transfer-drawer__panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

.btc-transfer-drawer__panel.is-collapsed {
  display: none;
}

.btc-transfer-drawer__panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  background-color: var(--el-bg-color);
  transition: background-color 0.2s ease;
}

.btc-transfer-drawer__panel-header:hover {
  background-color: var(--el-fill-color-lighter);
}

.btc-transfer-drawer__panel-icon {
  color: var(--el-text-color-secondary);
  transition: transform 0.2s ease;
}

.btc-transfer-drawer__panel-icon.is-expanded {
  transform: rotate(90deg);
}

.btc-transfer-drawer__panel-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btc-transfer-drawer__panel-title-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.btc-transfer-drawer__panel-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.btc-transfer-drawer__panel-body {
  flex: 1;
  min-height: 0;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.btc-transfer-drawer__panel.is-collapsed .btc-transfer-drawer__panel-body {
  display: none;
}

.btc-transfer-drawer__footer {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  padding: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
