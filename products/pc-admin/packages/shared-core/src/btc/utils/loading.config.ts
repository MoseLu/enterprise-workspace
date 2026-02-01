/**
 * Loading 配置常量
 * 统一管理所有层级的 z-index、超时时间、样式配置等
 */

/**
 * Z-index 层级定义（从高到低，优先级递减）
 */
export const LOADING_Z_INDEX = {
  /** 全局根级 loading（覆盖整个浏览器视口） */
  ROOT: 99999,
  /** 应用级 loading（覆盖单个应用容器） */
  APP: 9999,
  /** 路由级 loading（覆盖路由视图容器） */
  ROUTE: 999,
  /** 操作级 loading（覆盖操作相关区域） */
  OPERATION: 99,
  /** 组件级 loading（覆盖组件自身区域） */
  COMPONENT: 9,
} as const;

/**
 * 超时时间定义（毫秒）
 */
export const LOADING_TIMEOUT = {
  /** 全局根级 loading 超时时间（10秒） */
  ROOT: 10000,
  /** 应用级 loading 超时时间（5秒） */
  APP: 5000,
  /** 路由级 loading 超时时间（10秒） */
  ROUTE: 10000,
  /** 操作级 loading 超时时间（10秒） */
  OPERATION: 10000,
  /** 组件级 loading 超时时间（10秒） */
  COMPONENT: 10000,
} as const;

/**
 * Loading 样式配置
 */
export interface LoadingStyleConfig {
  /** 蒙层背景色（明亮模式） */
  maskBgLight: string;
  /** 蒙层背景色（暗黑模式） */
  maskBgDark: string;
  /** 蒙层透明度 */
  maskOpacity: number;
  /** 文字颜色（明亮模式） */
  textColorLight: string;
  /** 文字颜色（暗黑模式） */
  textColorDark: string;
  /** 文字大小 */
  textSize: string;
  /** 加载动画颜色（明亮模式） */
  spinnerColorLight: string;
  /** 加载动画颜色（暗黑模式） */
  spinnerColorDark: string;
  /** 加载动画大小 */
  spinnerSize: string;
}

/**
 * 默认样式配置
 */
export const DEFAULT_LOADING_STYLE: LoadingStyleConfig = {
  maskBgLight: 'rgba(255, 255, 255, 0.9)',
  maskBgDark: 'rgba(0, 0, 0, 0.9)',
  maskOpacity: 0.9,
  textColorLight: '#606266',
  textColorDark: '#e5e5e5',
  textSize: '14px',
  spinnerColorLight: '#409eff',
  spinnerColorDark: '#409eff',
  spinnerSize: '50px',
};

/**
 * 获取当前主题的蒙层背景色
 */
export function getMaskBackground(isDark = false): string {
  return isDark ? DEFAULT_LOADING_STYLE.maskBgDark : DEFAULT_LOADING_STYLE.maskBgLight;
}

/**
 * 获取当前主题的文字颜色
 */
export function getTextColor(isDark = false): string {
  return isDark ? DEFAULT_LOADING_STYLE.textColorDark : DEFAULT_LOADING_STYLE.textColorLight;
}

/**
 * 获取当前主题的加载动画颜色
 */
export function getSpinnerColor(isDark = false): string {
  return isDark ? DEFAULT_LOADING_STYLE.spinnerColorDark : DEFAULT_LOADING_STYLE.spinnerColorLight;
}

/**
 * 检查是否为暗黑模式
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

