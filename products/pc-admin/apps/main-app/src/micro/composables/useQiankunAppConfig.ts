/**
 * Qiankun 应用配置 Composable
 * 用于创建应用配置和 props
 */

import type { MicroAppConfig } from '../apps';
import { updateErrorList } from '../../utils/errorMonitor';
import { type TabMeta } from './useQiankunMenuRegistry';
import { createSimpleGetTemplate } from './useQiankunTemplate';

/**
 * 创建超时配置
 */
function createTimeoutsConfig(app: MicroAppConfig) {
  const isDev = import.meta.env.DEV;
  const defaultTimeout = isDev ? 8000 : 15000;
  const timeout = app.timeout || defaultTimeout;

  return {
    bootstrap: {
      millis: timeout * 2,
      dieOnTimeout: false,
      warningMillis: Math.floor(timeout * 1.5),
    },
    mount: {
      millis: timeout,
      dieOnTimeout: !isDev,
      warningMillis: Math.floor(timeout * 0.8),
    },
    unmount: {
      millis: 3000,
      dieOnTimeout: true,
      warningMillis: 2500,
    },
  };
}

/**
 * 创建应用配置
 */
export function createAppConfigs(
  microApps: MicroAppConfig[],
  currentLocale: string,
  globalState: any,
  i18n?: any
) {
  return microApps.map(app => {
    const timeoutsConfig = createTimeoutsConfig(app);

    return {
      ...app,
      props: {
        locale: currentLocale,
        globalState,
        i18n, // 传递主应用的i18n实例给子应用
        onReady: () => {
          // 清除超时保护
          const timeoutKey = `__qiankun_timeout_${app.name}__`;
          const timeoutId = (window as any)[timeoutKey];
          if (timeoutId) {
            clearTimeout(timeoutId);
            delete (window as any)[timeoutKey];
          }
        },
        // Tab 管理 API（使用动态导入避免循环依赖）
        registerTabs: async (tabs: TabMeta[]) => {
          const { registerTabs: registerTabsFn } = await import('../../store/tabRegistry');
          registerTabsFn(app.name, tabs);
        },
        clearTabs: async () => {
          const { clearTabs: clearTabsFn } = await import('../../store/tabRegistry');
          clearTabsFn(app.name);
        },
        setActiveTab: (_tabKey: string) => {
          // 空实现
        },
        // 错误上报方法（传递给子应用）
        updateErrorList,
        appName: app.name,
      },
      // 核心配置：指定脚本类型为 module
      scriptType: 'module' as const,
      // 自定义 getTemplate：确保所有 script 标签都有 type="module"，并修复资源路径
      getTemplate: createSimpleGetTemplate(app.entry),
      // 配置生命周期超时时间（single-spa 格式）
      timeouts: timeoutsConfig,
    };
  });
}

