/**
 * 页面切换动画 composable
 * 用于读取用户设置的页面切换动画，并监听变化
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { storage } from '../storage';

/**
 * 获取页面切换动画名称
 */
export function usePageTransition() {
  // 从 settings 中读取 pageTransition，如果没有则从旧键读取，默认 'slide-left'
  const getSettings = (): Record<string, any> => (storage.get('settings') as Record<string, any> | null) ?? {};
  const initialSettings = getSettings();
  const pageTransition = ref<string>(
    initialSettings.pageTransition || storage.get('pageTransition') || 'slide-left'
  );

  // 监听页面切换动画变化事件
  function handlePageTransitionChange(event: CustomEvent) {
    if (event.detail?.transition) {
      pageTransition.value = event.detail.transition;
    }
  }

  onMounted(() => {
    window.addEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  });

  onUnmounted(() => {
    window.removeEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  });

  return {
    pageTransition,
  };
}
