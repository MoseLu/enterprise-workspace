;
import { ref, computed, watch } from 'vue';
import { storage } from '@btc/shared-core/utils';

type TableSize = 'small' | 'default' | 'large';

export interface TablePreferenceOptions {
  storageKey?: string; // 用于区分不同表格的偏好设置，会作为 settings 中的子键
  defaultSize?: TableSize;
  defaultStripe?: boolean;
  defaultBorder?: boolean;
  defaultHeaderBackground?: boolean;
  defaultTagRound?: boolean;
  defaultHiddenColumns?: string[];
}

interface PersistedPreferences {
  size?: TableSize;
  stripe?: boolean;
  border?: boolean;
  headerBackground?: boolean;
  tagRound?: boolean;
  hiddenColumns?: string[];
}

interface TablePreferencesStorage {
  [key: string]: PersistedPreferences;
}

const DEFAULT_STORAGE_KEY = 'default';

function loadPreferences(key: string): PersistedPreferences {
  try {
    // 从统一的 settings 存储中读取表格偏好设置
    const settings = (storage.get('settings') as { tablePreferences?: TablePreferencesStorage } | null) || {};
    const allPreferences = settings.tablePreferences || {};
    return allPreferences[key] || {};
  } catch (error) {
    console.warn('[BtcTable] Failed to parse table preferences:', error);
    return {};
  }
}

function persistPreferences(key: string, value: PersistedPreferences) {
  try {
    // 将表格偏好设置存储到统一的 settings 中
    const settings = (storage.get('settings') as { tablePreferences?: TablePreferencesStorage } | null) || {};
    const allPreferences = settings.tablePreferences || {};
    allPreferences[key] = value;
    settings.tablePreferences = allPreferences;
    storage.set('settings', settings);
  } catch (error) {
    console.warn('[BtcTable] Failed to save table preferences:', error);
  }
}

export function useTablePreferences(options: TablePreferenceOptions = {}) {
  const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
  const stored = loadPreferences(storageKey);

  const size = ref<TableSize>(stored.size ?? options.defaultSize ?? 'default');
  const stripe = ref<boolean>(stored.stripe ?? options.defaultStripe ?? false);
  const border = ref<boolean>(stored.border ?? options.defaultBorder ?? true);
  const headerBackground = ref<boolean>(
    stored.headerBackground ?? options.defaultHeaderBackground ?? true,
  );
  const tagRound = ref<boolean>(stored.tagRound ?? options.defaultTagRound ?? false);
  const hiddenColumns = ref<string[]>(
    stored.hiddenColumns ?? options.defaultHiddenColumns ?? [],
  );

  const hiddenColumnSet = computed(() => new Set(hiddenColumns.value));

  const persist = () => {
    persistPreferences(storageKey, {
      size: size.value,
      stripe: stripe.value,
      border: border.value,
      headerBackground: headerBackground.value,
      tagRound: tagRound.value,
      hiddenColumns: hiddenColumns.value,
    });
  };

  watch([size, stripe, border, headerBackground, tagRound, hiddenColumns], persist, {
    deep: true,
  });

  const isColumnHidden = (key?: string | null) => {
    if (!key) return false;
    return hiddenColumnSet.value.has(key);
  };

  const setColumnVisibility = (key: string, visible: boolean) => {
    if (!key) return;
    const set = new Set(hiddenColumns.value);
    if (visible) {
      set.delete(key);
    } else {
      set.add(key);
    }
    hiddenColumns.value = Array.from(set);
  };

  const resetPreferences = () => {
    size.value = options.defaultSize ?? 'default';
    stripe.value = options.defaultStripe ?? false;
    border.value = options.defaultBorder ?? true;
    headerBackground.value = options.defaultHeaderBackground ?? true;
    tagRound.value = options.defaultTagRound ?? false;
    hiddenColumns.value = options.defaultHiddenColumns ?? [];
  };

  return {
    size,
    stripe,
    border,
    headerBackground,
    tagRound,
    hiddenColumns,
    isColumnHidden,
    setColumnVisibility,
    resetPreferences,
  };
}


