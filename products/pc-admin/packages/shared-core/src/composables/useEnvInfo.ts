/**
 * 全局环境信息 composable
 * 提供响应式的环境信息和当前应用信息，自动监听变化
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Environment } from '../configs/unified-env-config';
import { getEnvironment, getCurrentSubApp } from '../configs/unified-env-config';
import { getAppConfig } from '../configs/app-env.config';

/**
 * 环境信息接口
 */
export interface EnvInfo {
  environment: Environment;
  isDev: boolean;
  isPreview: boolean;
  isPoc: boolean;
  isSit: boolean;
  isUat: boolean;
  isTest: boolean;
  isProduction: boolean;
  currentApp: string | null;
  currentAppConfig: ReturnType<typeof getAppConfig> | null;
}

/**
 * 获取环境信息 composable
 * @returns 响应式的环境信息和当前应用信息
 */
export function useEnvInfo() {
  const route = useRoute();

  // 响应式状态
  const environment = ref<Environment>(getEnvironment());
  const currentAppId = ref<string | null>(getCurrentSubApp());
  const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '');
  const currentHostname = ref(typeof window !== 'undefined' ? window.location.hostname : '');

  // 计算属性
  const isDev = computed(() => environment.value === 'development');
  const isPreview = computed(() => environment.value === 'preview');
  const isPoc = computed(() => environment.value === 'poc');
  const isSit = computed(() => environment.value === 'sit');
  const isUat = computed(() => environment.value === 'uat');
  const isTest = computed(() => environment.value === 'test');
  const isProduction = computed(() => environment.value === 'production');

  const currentApp = computed(() => currentAppId.value);
  
  const currentAppConfig = computed(() => {
    if (!currentAppId.value) {
      return null;
    }
    return getAppConfig(`${currentAppId.value}-app`);
  });

  /**
   * 刷新环境信息
   */
  function refresh() {
    environment.value = getEnvironment();
    currentAppId.value = getCurrentSubApp();
    currentPath.value = typeof window !== 'undefined' ? window.location.pathname : '';
    currentHostname.value = typeof window !== 'undefined' ? window.location.hostname : '';
  }

  /**
   * 更新路径和主机名（用于路由变化时）
   */
  function updatePathInfo() {
    if (typeof window !== 'undefined') {
      currentPath.value = window.location.pathname;
      currentHostname.value = window.location.hostname;
      // 路径变化可能影响环境和应用判断，需要刷新
      refresh();
    }
  }

  // 监听路由变化
  watch(
    () => route.path,
    () => {
      updatePathInfo();
    },
    { immediate: false }
  );

  // 监听浏览器历史记录变化
  function handlePopState() {
    updatePathInfo();
  }

  // 重写 history API 以监听 pushState 和 replaceState
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;
  let isHistoryPatched = false;

  function patchHistory() {
    if (typeof window === 'undefined' || isHistoryPatched) {
      return;
    }

    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;
    isHistoryPatched = true;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      // 延迟更新，确保路径已变化
      setTimeout(updatePathInfo, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      // 延迟更新，确保路径已变化
      setTimeout(updatePathInfo, 0);
    };
  }

  function unpatchHistory() {
    if (!isHistoryPatched) {
      return;
    }

    if (originalPushState) {
      history.pushState = originalPushState;
    }
    if (originalReplaceState) {
      history.replaceState = originalReplaceState;
    }
    isHistoryPatched = false;
  }

  onMounted(() => {
    // 初始化
    refresh();
    patchHistory();

    // 监听 popstate 事件
    window.addEventListener('popstate', handlePopState);

    // 监听事件总线的应用切换事件（如果有）
    const emitter = (window as any).__APP_EMITTER__;
    if (emitter && typeof emitter.on === 'function') {
      emitter.on('app.switch', refresh);
      emitter.on('route.change', refresh);
    }
  });

  onUnmounted(() => {
    // 清理事件监听
    window.removeEventListener('popstate', handlePopState);
    unpatchHistory();

    // 清理事件总线监听
    const emitter = (window as any).__APP_EMITTER__;
    if (emitter && typeof emitter.off === 'function') {
      emitter.off('app.switch', refresh);
      emitter.off('route.change', refresh);
    }
  });

  return {
    environment,
    isDev,
    isPreview,
    isPoc,
    isSit,
    isUat,
    isTest,
    isProduction,
    currentApp,
    currentAppConfig,
    refresh,
  };
}