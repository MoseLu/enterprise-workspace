/**
 * Qiankun 微前端主入口文件
 * 负责初始化和导出 qiankun 相关功能
 */

// 导入 composables
import {
  setupQiankunLogFilter,
  setupResourceInterceptor,
  setupQiankun,
  listenSubAppReady,
  listenSubAppRouteChange,
} from './composables';

// 关键：在模块加载时立即设置日志过滤，确保能拦截所有警告
// 这必须在任何其他代码执行之前完成
if (typeof window !== 'undefined') {
  setupQiankunLogFilter();
}

// 关键：在模块级别尽早设置全局资源拦截器
// 这确保拦截器在页面加载时就能拦截所有资源请求，包括动态 import
if (typeof window !== 'undefined') {
  setupResourceInterceptor();
}

// 重新导出 composables 中的函数，保持向后兼容
export { registerManifestTabsForApp, registerManifestMenusForApp } from './composables';

/**
 * 初始化 qiankun 微前端
 * @returns globalState qiankun全局状态
 */
export { setupQiankun };

/**
 * 监听子应用就绪事件
 */
export { listenSubAppReady };

/**
 * 监听子应用路由变化事件
 */
export { listenSubAppRouteChange };
