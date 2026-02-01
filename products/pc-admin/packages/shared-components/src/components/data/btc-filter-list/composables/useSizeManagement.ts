;
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n, storage } from '@btc/shared-core';
import type { BtcFilterListSize, BtcFilterListProps, BtcFilterListEmits } from '../types';

/**
 * 尺寸管理 composable
 */
export function useSizeManagement(
  props: BtcFilterListProps,
  emit: (event: 'update:size', size: BtcFilterListSize) => void
) {
  const { t } = useI18n();

  // 获取存储 key（如果提供了 storageKey，使用它；否则不存储）
  const getStorageKey = (): string | null => {
    if (!props.storageKey) {
      return null;
    }
    return `btc-filter-list-size-${props.storageKey}`;
  };

  // 从存储中读取尺寸
  const getStoredSize = (): BtcFilterListSize | null => {
    const key = getStorageKey();
    if (!key) {
      return null;
    }
    try {
      const stored = storage.get<BtcFilterListSize>(key);
      if (stored && ['small', 'default', 'large'].includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.warn('[BtcFilterList] 读取存储的尺寸失败:', error);
    }
    return null;
  };

  // 保存尺寸到存储
  const saveSizeToStorage = (size: BtcFilterListSize) => {
    const key = getStorageKey();
    if (!key) {
      return;
    }
    try {
      storage.set(key, size);
    } catch (error) {
      console.warn('[BtcFilterList] 保存尺寸到存储失败:', error);
    }
  };

  // 当前尺寸（内部状态，支持 v-model）
  // 优先使用 props.size，如果没有则从存储中读取，最后使用默认值
  const initialSize = props.size || getStoredSize() || 'default';
  const currentSize = ref<BtcFilterListSize>(initialSize);

  // 如果初始时从存储中读取到了尺寸，且 props.size 没有值，则同步到 props
  if (!props.size && initialSize !== 'default') {
    // 触发 update:size 事件，让父组件知道当前尺寸
    nextTick(() => {
      emit('update:size', initialSize);
    });
  }

  // 尺寸选项
  const sizeOptions = computed(() => [
    { label: t('btc.filterList.size.small'), value: 'small' as BtcFilterListSize },
    { label: t('btc.filterList.size.default'), value: 'default' as BtcFilterListSize },
    { label: t('btc.filterList.size.large'), value: 'large' as BtcFilterListSize },
  ]);

  // 处理尺寸切换
  const handleSizeChange = (size: BtcFilterListSize) => {
    currentSize.value = size;
    emit('update:size', size);
    // 保存到存储
    saveSizeToStorage(size);
  };

  // 监听 props.size 的变化
  watch(() => props.size, (newSize) => {
    // 如果 props.size 有值，优先使用 props.size（外部控制）
    // 否则保持当前值（可能是从存储中读取的）
    if (newSize) {
      currentSize.value = newSize;
      // 如果提供了 storageKey，同步保存到存储
      if (props.storageKey) {
        saveSizeToStorage(newSize);
      }
    }
  }, { immediate: true });

  return {
    currentSize,
    sizeOptions,
    handleSizeChange,
  };
}