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
 * 菜单项
 */
export interface MenuItem {
  index: string;
  title: string;
  icon: string;
  children?: MenuItem[];
}

/**
 * Qiankun 子应用 Props 类型定义
 */
export interface QiankunProps {
  /** 挂载容器（支持 HTMLElement 或字符串选择器） */
  container?: HTMLElement | string;
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
