;
import { ref } from 'vue';
import type { FilterCategory, BtcFilterListProps } from '../types';
import { logger } from '@btc/shared-core';

/**
 * 数据加载 composable
 */
export function useDataLoading(props: Pick<BtcFilterListProps, 'service' | 'category'>) {
  const loading = ref(false);
  const categories = ref<FilterCategory[]>([]);

  // 加载数据
  const loadData = async () => {
    if (props.category) {
      // 直接使用 props.category，Vue 的响应式系统会自动处理
      categories.value = Array.isArray(props.category) ? props.category : [];
      return;
    }

    if (props.service) {
      loading.value = true;
      try {
        const data = await props.service.list();
        categories.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('[BtcFilterList] Failed to load data:', error);
        categories.value = [];
      } finally {
        loading.value = false;
      }
    }
  };

  return {
    loading,
    categories,
    loadData,
  };
}