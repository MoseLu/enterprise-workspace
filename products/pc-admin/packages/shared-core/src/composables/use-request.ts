import { ref } from 'vue';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UseRequestReturn<T> {
  loading: any;
  data: any;
  error: any;
  execute: (...args: any[]) => Promise<T>;
}

/**
 * 閫氱敤璇锋眰 Composable
 */
export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>
): UseRequestReturn<T> {
  const loading = ref(false);
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);

  const execute = async (...args: any[]) => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await requestFn(...args);
      return data.value;
    } catch (e) {
      error.value = e as Error;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    data,
    error,
    execute,
  };
}


