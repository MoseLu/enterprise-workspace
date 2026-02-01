/**
 * 应用 Loading 状态管理
 * 统一管理主应用切换子应用时的 Loading 状态
 */
;

import { ref } from 'vue';
import type { MicroAppConfig } from '../micro/apps';
import { microApps } from '../micro/apps';
import { logger } from '@btc/shared-core';

// 当前加载中的应用信息
export const loadingApp = ref<Partial<MicroAppConfig>>({});
// Loading显示状态
export const loadingVisible = ref(false);
// 加载失败状态
export const loadingFail = ref(false);
// 失败描述
export const loadingFailDesc = ref('');

/**
 * 显示Loading（切换应用时调用）
 * @param app 应用配置
 */
export function showLoading(app: MicroAppConfig) {
  loadingApp.value = app;
  loadingVisible.value = true;
  loadingFail.value = false;
  loadingFailDesc.value = '';
}

/**
 * 隐藏Loading（应用加载完成时调用）
 */
export function hideLoading() {
  loadingVisible.value = false;
}

/**
 * 标记加载失败
 * @param desc 失败描述
 */
export function markLoadingFail(desc?: string) {
  loadingFail.value = true;
  loadingFailDesc.value = desc || '';
}

/**
 * 重试加载当前应用
 */
export function retryLoadingApp() {
  if (!loadingApp.value.name) {
    return;
  }

  // 重置失败状态
  loadingFail.value = false;
  loadingFailDesc.value = '';
  loadingVisible.value = true;

  // 获取应用配置
  const app = microApps.find((item) => item.name === loadingApp.value.name);
  if (!app) {
    markLoadingFail(`应用 ${loadingApp.value.name} 配置不存在`);
    return;
  }

  // 重新触发应用加载（通过路由跳转或刷新页面）
  try {
    // 根据 activeRule 类型获取路径
    let targetPath = '';
    if (typeof app.activeRule === 'string') {
      targetPath = app.activeRule;
    } else if (typeof app.activeRule === 'function') {
      // 如果是函数，尝试获取默认路径（通常是应用的路径前缀）
      // 这里使用应用名称作为路径前缀（常见约定）
      targetPath = `/${app.name}`;
    }

    // 跳转到应用路径，触发 qiankun 重新加载
    if (targetPath) {
      // 使用 window.location 跳转，确保 qiankun 重新加载应用
      window.location.href = targetPath;
    } else {
      // 如果无法确定路径，刷新页面
      window.location.reload();
    }
  } catch (error) {
    logger.error('[useAppLoading] 重试加载失败:', error);
    // 如果出错，刷新页面
    window.location.reload();
  }
}

// 暴露到全局 window 对象，供 shared-components 使用
// 关键：在函数定义之后暴露，确保函数引用正确
if (typeof window !== 'undefined') {
  (window as any).__BTC_APP_LOADING__ = {
    loadingApp,
    loadingVisible,
    loadingFail,
    loadingFailDesc,
    showLoading,
    hideLoading,
    markLoadingFail,
    retryLoadingApp,
  };
}

