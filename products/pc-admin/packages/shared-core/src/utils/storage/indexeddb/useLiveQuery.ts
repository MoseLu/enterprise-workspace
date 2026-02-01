/**
 * Vue3 响应式查询 Composable
 * 手动实现 dexie-vue-addon 的 useLiveQuery 功能
 * 让 Dexie 查询结果自动成为响应式数据
 */
;

import { ref, watch, onMounted, type Ref } from 'vue';
import type { PromiseExtended } from 'dexie';
import { logger } from '../../logger/index';

/**
 * 响应式查询 Hook
 * 当数据库数据变化时，自动重新查询并更新响应式数据
 * 
 * @param queryFn 查询函数，返回 Dexie Promise
 * @param deps 依赖项数组（可选），当依赖变化时重新查询
 * @returns 响应式查询结果
 * 
 * @example
 * ```typescript
 * const dashboardList = useLiveQuery(() => 
 *   db.dashboardData
 *     .where('time')
 *     .between(startTime, endTime)
 *     .toArray()
 * );
 * ```
 */
export function useLiveQuery<T = any>(
  queryFn: () => PromiseExtended<T> | Promise<T>,
  deps?: ReadonlyArray<any>
): Ref<T | undefined> {
  const result = ref<T | undefined>(undefined);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  // 执行查询
  const executeQuery = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await queryFn();
      result.value = data as T;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      logger.error('[useLiveQuery] 查询失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 监听依赖变化
  if (deps && deps.length > 0) {
    // 优化：只在依赖项包含对象或数组时才使用深度 watch，避免不必要的性能开销
    const hasComplexTypes = deps.some(dep => 
      dep !== null && typeof dep === 'object' && (Array.isArray(dep) || Object.keys(dep).length > 0)
    );
    watch(deps, executeQuery, { 
      immediate: true, 
      deep: hasComplexTypes // 只在需要时使用深度 watch
    });
  } else {
    // 没有依赖时，立即执行一次
    onMounted(() => {
      executeQuery();
    });
  }

  // 返回响应式结果
  // 注意：由于没有 dexie-vue-addon，数据变更不会自动触发重新查询
  // 建议：
  // 1. 使用依赖数组：当查询条件变化时自动重新查询
  // 2. 数据变更后手动刷新：使用 useLiveQueryWithState 的 refetch 方法
  return result as Ref<T | undefined>;
}

/**
 * 响应式查询 Hook（带加载状态和错误处理）
 * 
 * @param queryFn 查询函数
 * @param deps 依赖项数组（可选）
 * @returns 包含 result、isLoading、error 的对象
 */
export function useLiveQueryWithState<T = any>(
  queryFn: () => PromiseExtended<T> | Promise<T>,
  deps?: ReadonlyArray<any>
): {
  result: Ref<T | undefined>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  refetch: () => Promise<void>;
} {
  const result = ref<T | undefined>(undefined);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  // 执行查询
  const executeQuery = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await queryFn();
      result.value = data as T;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      logger.error('[useLiveQuery] 查询失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 监听依赖变化
  if (deps && deps.length > 0) {
    // 优化：只在依赖项包含对象或数组时才使用深度 watch，避免不必要的性能开销
    const hasComplexTypes = deps.some(dep => 
      dep !== null && typeof dep === 'object' && (Array.isArray(dep) || Object.keys(dep).length > 0)
    );
    watch(deps, executeQuery, { 
      immediate: true, 
      deep: hasComplexTypes // 只在需要时使用深度 watch
    });
  } else {
    onMounted(() => {
      executeQuery();
    });
  }

  return {
    result: result as Ref<T | undefined>,
    isLoading,
    error,
    refetch: executeQuery,
  };
}
