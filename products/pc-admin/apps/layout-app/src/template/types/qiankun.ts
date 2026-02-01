/**
 * Tab 元数据
 */
export interface TabMeta {
  key: string;
  title: string;
  path: string;
  i18nKey?: string;
}

/**
 * Qiankun 子应用 Props 类型定义
 */
export interface QiankunProps {
  /** 挂载容器 */
  container?: HTMLElement;
  /** 当前语言 */
  locale?: string;
  /** 就绪回调 */
  onReady?: () => void;
  /** 注册 Tab 元数据 */
  registerTabs?: (tabs: TabMeta[]) => void;
  /** 清理 Tab 元数据 */
  clearTabs?: () => void;
  /** 设置激活的 Tab */
  setActiveTab?: (tabKey: string) => void;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

