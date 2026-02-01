/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 *
 * 参考 cool-admin 的架构设计，采用模块化目录结构
 */

import type { App } from 'vue';

// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';

// 资源加载器初始化（必须在应用启动前初始化）
import { initResourceLoader, initDynamicImportInterceptor } from '@btc/shared-core';

// 核心模块
import { setupStore, setupUI, setupRouter, setupI18n, setupEps } from './core';
import { resolveAppLogoUrl } from '@btc/shared-core/configs/layout-bridge';

// 处理器模块
import { createNotificationHandler, initNotificationManager } from './handlers';

// 集成模块（子应用不需要微前端设置和插件自动发现）
// import { autoDiscoverPlugins, setupMicroApps, setupInterceptors } from './integrations';

// 管理器实例
import { notificationManager } from '../utils/notification-manager';
import { BtcMessage } from '@btc/shared-components';
import { appStorage } from '../utils/app-storage';
// 用户设置（现在都在 app-src chunk 中，可以使用静态导入）
import { initSettingsConfig } from '../plugins/user-setting/composables/useSettingsState';

/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 */
export async function bootstrap(app: App) {
  // 0. 初始化监控系统（必须在最前面，确保所有操作都被监控）
  const { initMonitor, trackBootstrapStart, trackBootstrapEnd } = await import('@btc/shared-core/utils/monitor');
  
  // 先初始化监控配置，再开始跟踪
  initMonitor({
    appName: 'system',
    enableAPM: true,
    enableErrorTracking: true,
    enableUserBehavior: true,
    enablePerformance: true,
    enableResourceMonitoring: true,
    enableBusinessTracking: true,
    enableSystemMonitoring: false,
    sampleRate: 1.0,
  });
  
  trackBootstrapStart();
  
  try {

    // 0. 初始化资源加载器和动态导入拦截器（必须在最前面）
    initResourceLoader();
    initDynamicImportInterceptor();
    
    // 0.1. 初始化存储管理器
    appStorage.init();

  // 1. 核心模块初始化
  setupEps(app);        // EPS 服务（必须在最前面）
  setupStore(app);      // 状态管理
  setupRouter(app);     // 路由配置
  setupUI(app);         // UI框架配置
  setupI18n(app);       // 国际化配置

  // 注意：Loading 元素的移除由 main.ts 统一处理
  // 这里不再处理，避免与 main.ts 的逻辑冲突

  // 2. 集成模块初始化
  // 初始化设置配置（现在都在 app-src chunk 中，使用静态导入）
  await initSettingsConfig();

  // 注意：子应用不需要以下主应用功能：
  // - autoDiscoverPlugins: 插件自动发现（主应用功能）
  // - setupMicroApps: 微前端设置（主应用功能）
  // - setupInterceptors: 拦截器配置（主应用功能）
  
  // 初始化插件消费（消费主应用提供的全局插件状态）
  const { initPluginConsumer } = await import('./plugins');
  initPluginConsumer(app);

  // 3. 处理器初始化
  const notificationHandler = createNotificationHandler();

  initNotificationManager(notificationHandler);

  // 4. 全局暴露
  (window as any).notificationHandler = notificationHandler;
  (window as any).notificationManager = notificationManager;
  (window as any).BtcMessage = BtcMessage;

  // 暴露 cleanupBadge 方法（生命周期管理器需要）
  (window as any).cleanupNotificationBadge = notificationHandler.cleanupBadge;

  // 注意：authApi 已移除，请使用全局 __APP_AUTH_API__ 获取（由 main-app 提供）
  // system-app 不再暴露 authApi 到全局，因为 auth 模块已移除

  // 暴露 Logo URL 获取函数，保持与其他应用的一致性
  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();

  // 注意：user-check 轮询由主应用（main-app）统一管理，system-app 不需要启动

  // 注意：DevTools 不再在这里挂载
  // 改为统一在 layout-app 中挂载，避免重复挂载
  // layout-app 是主应用，所有子应用都会通过它加载，因此只需要在 layout-app 中挂载一次即可

  // 全局捕获未处理的Promise rejection，防止控制台打印错误
  window.addEventListener('unhandledrejection', (event) => {
    // 检查是否是HTTP错误
    if (event.reason && event.reason.name === 'AxiosError') {
      // 检查是否是接口测试中心的请求（通过URL路径判断）
      const url = event.reason.config?.url || '';
      const isTestCenterRequest = url.includes('/api/system/test/');

      if (!isTestCenterRequest) {
        // 静默处理非测试中心的axios错误，不打印到控制台
        event.preventDefault();

        // 显示用户友好的错误消息
        const message = event.reason.response?.status === 404
          ? '请求的资源不存在'
          : '网络请求失败';

        if ((window as any).BtcMessage) {
          (window as any).BtcMessage.error(message);
        }
      }
      // 对于测试中心的请求，不拦截，让错误正常传播
    }
  });

  // 注意：子应用不需要重写 XMLHttpRequest 和 fetch
  // 这些拦截逻辑应该只在主应用中存在
}

// 导出各个模块，供其他地方使用
export * from './core';
export * from './handlers';
export * from './integrations';
