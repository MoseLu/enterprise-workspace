/**
 * 国际化配置模块
 * 负责配置Vue I18n国际化
 */

import type { App } from 'vue';
import { initSystemI18n } from '../../i18n';

// 存储 props（用于在 setupI18n 中获取 i18n 实例和 globalState）
let storedProps: any = null;

/**
 * 设置 props（由 bootstrap-subapp 调用）
 */
export function setSystemAppProps(props: any) {
  storedProps = props;
}

/**
 * 配置国际化
 * @param app Vue 应用实例
 * @param locale 语言
 */
export const setupI18n = (app: App, locale?: string) => {
  // 使用新的 i18n 初始化（支持微前端和独立运行模式）
  // 从存储的 props 中获取 i18n 实例和 globalState
  const i18nPlugin = initSystemI18n({
    i18n: storedProps?.i18n,
    locale: (storedProps?.locale || locale) as any,
    globalState: storedProps?.globalState,
  });
  
  app.use(i18nPlugin);
  
  // 返回 i18n 实例（与 admin-app 保持一致）
  return i18nPlugin.i18n;
};
