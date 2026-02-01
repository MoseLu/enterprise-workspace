import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getAppIdFromPath } from '@btc/shared-core';

/**
 * 获取当前应用名称
 * 使用统一的环境检测方案
 */
export function useCurrentApp() {
  const route = useRoute();
  const currentApp = ref('main');

  const detectCurrentApp = () => {
    // 使用统一的工具函数获取应用标识
    // getAppIdFromPath 已经处理了主应用路由优先、排除公开应用的逻辑
    const path = typeof window !== 'undefined' ? window.location.pathname : route.path;
    currentApp.value = getAppIdFromPath(path);
  };

  watch(
    () => route.path,
    () => {
      detectCurrentApp();
    },
    { immediate: true }
  );

  // 在生产环境子域名下，也需要监听 hostname 的变化
  // 因为路径可能是 /，必须通过子域名识别
  if (typeof window !== 'undefined') {
    // 立即执行一次检测
    detectCurrentApp();

    // 使用 MutationObserver 监听 location 变化（虽然不直接支持，但可以通过其他方式）
    // 或者使用 setInterval 定期检查（不推荐，但作为后备）
  }


  return {
    currentApp,
    detectCurrentApp,
  };
}

