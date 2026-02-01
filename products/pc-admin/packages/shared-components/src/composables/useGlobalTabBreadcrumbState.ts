/**
 * 全局 Tabbar 和面包屑状态监听器（单例模式）
 * 确保整个应用只有一个全局状态监听器，避免 qiankun 警告
 */

import { ref, type Ref } from 'vue';
import { getMainAppId, onGlobalStateChange, getGlobalStateValue } from '@btc/shared-core';

// 全局状态响应式变量
export const globalBreadcrumbList = ref<any[]>([]);
export const globalTabbarList = ref<any[]>([]);
export const globalActiveTabKey = ref<string>('');

// 延迟初始化 globalCurrentApp，避免在模块加载时立即调用 getMainAppId()
// 使用 try-catch 包装，确保即使 getMainAppId() 调用失败也能正常初始化
export const globalCurrentApp = (() => {
  try {
    // 延迟调用 getMainAppId()，确保 app-scanner 已经初始化
    const appId = getMainAppId();
    return ref<string>(appId || 'main');
  } catch (error) {
    // 如果 getMainAppId() 调用失败（可能因为模块加载顺序问题），使用兜底值
    // 静默失败，不输出警告日志
    return ref<string>('main');
  }
})();

// 单例监听器标志
let isListenerInitialized = false;
let globalStateUnsubscribe: (() => void) | null = null;

/**
 * 初始化全局状态监听器（只注册一次）
 */
export function initGlobalTabBreadcrumbListener() {
  if (isListenerInitialized) {
    // 即使已经初始化，也尝试同步一次当前状态（防止状态更新时监听器还未注册）
    try {
      const currentState = getGlobalStateValue();
      if (currentState && typeof currentState === 'object') {
        globalBreadcrumbList.value = Array.isArray(currentState.breadcrumbList) ? currentState.breadcrumbList : [];
        globalTabbarList.value = Array.isArray(currentState.tabbarList) ? currentState.tabbarList : [];
        globalActiveTabKey.value = typeof currentState.activeTabKey === 'string' ? currentState.activeTabKey : '';
        globalCurrentApp.value = typeof currentState.currentApp === 'string' ? currentState.currentApp : getMainAppId();
      }
    } catch (error) {
      // 忽略错误
    }
    return; // 已经初始化，直接返回
  }

  // 使用统一的全局状态管理器注册监听器（防止重复注册）
  try {
    globalStateUnsubscribe = onGlobalStateChange(
      (state: any) => {
        // 更新响应式变量
        globalBreadcrumbList.value = state.breadcrumbList || [];
        globalTabbarList.value = state.tabbarList || [];
        globalActiveTabKey.value = state.activeTabKey || '';
        globalCurrentApp.value = state.currentApp || getMainAppId();
        
        // 同步更新全局状态缓存（供工具函数使用）
        if ((window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__) {
          (window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__.breadcrumbList = state.breadcrumbList || [];
          (window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__.tabbarList = state.tabbarList || [];
          (window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__.activeTabKey = state.activeTabKey || '';
          (window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__.currentApp = state.currentApp || getMainAppId();
        }
      },
      true, // 立即触发一次
      'global-tab-breadcrumb-listener' // 固定监听器 key，防止重复注册
    );
    
    if (globalStateUnsubscribe) {
      isListenerInitialized = true;
    }
  } catch (error) {
    // 忽略错误
  }
}

/**
 * 清理全局状态监听器
 */
export function cleanupGlobalTabBreadcrumbListener() {
  if (globalStateUnsubscribe) {
    try {
      globalStateUnsubscribe();
    } catch (error) {
      // 忽略错误
    }
    globalStateUnsubscribe = null;
    isListenerInitialized = false;
  }
}

