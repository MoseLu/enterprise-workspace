import type { App } from 'vue';
import { initAdminI18n } from '../../i18n';

// 存储 props（用于在 setupI18n 中获取 i18n 实例和 globalState）
let storedProps: any = null;

/**
 * 设置 props（由 bootstrap-subapp 调用）
 */
export function setAdminAppProps(props: any) {
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
  const i18n = initAdminI18n({
    i18n: storedProps?.i18n,
    locale: (storedProps?.locale || locale) as any,
    globalState: storedProps?.globalState,
  });
  
  app.use(i18n);
  return i18n;
};
