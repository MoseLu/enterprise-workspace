/**
 * 设置处理器
 * 提供所有设置的变更处理方法
 */

import { useSettingsState } from './useSettingsState';
import { BoxStyleType, ContainerWidthEnum, StylePresetEnum } from '../config/enums';
import type { SystemThemeEnum, MenuThemeEnum, MenuTypeEnum } from '../config/enums';
import { useThemePlugin, type ButtonStyle } from '@btc/shared-core';

/**
 * 设置处理器组合式函数
 */
export function useSettingsHandlers() {
  // 注意：useSettingsState 已经会优先使用应用的实现（如果存在）
  // 所以这里直接调用 useSettingsState 即可，它会自动使用正确的实现
  const settingsState = useSettingsState();

  // DOM 操作相关
  const domOperations = {
    // 设置HTML类名
    setHtmlClass: (className: string, add: boolean) => {
      const el = document.documentElement;
      if (add) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
    },

    // 设置根元素属性
    setRootAttribute: (attribute: string, value: string) => {
      document.documentElement.setAttribute(attribute, value);
    },

    // 设置body类名
    setBodyClass: (className: string, add: boolean) => {
      const el = document.body;
      if (add) {
        el.setAttribute('class', className);
      } else {
        el.removeAttribute('class');
      }
    },
  };

  // 通用切换处理器
  const createToggleHandler = (toggleMethod: () => void) => {
    return () => {
      toggleMethod();
    };
  };

  // 通用值变更处理器
  const createValueHandler = <T>(valueMethod: (value: T) => void) => {
    return (value: T) => {
      if (value !== undefined && value !== null) {
        valueMethod(value);
      }
    };
  };

  // 基础设置处理器
  const basicHandlers = {
    // 工作台标签页
    workTab: createToggleHandler(() => settingsState.toggleWorkTab()),

    // 手风琴模式
    uniqueOpened: createToggleHandler(() => settingsState.toggleUniqueOpened()),

    // 全局搜索
    globalSearch: createToggleHandler(() => settingsState.toggleGlobalSearch()),

    // 显示面包屑
    crumbs: createToggleHandler(() => settingsState.toggleCrumbs()),

    // 色弱模式
    colorWeak: createToggleHandler(() => settingsState.toggleColorWeak()),

    // 菜单宽度
    menuOpenWidth: createValueHandler<number>((width: number) => settingsState.setMenuOpenWidth(width)),

    // 标签页风格
    tabStyle: createValueHandler<string>((style: string) => settingsState.setTabStyle(style)),

    // 页面切换动画
    pageTransition: createValueHandler<string>((transition: string) => settingsState.setPageTransition(transition)),

    // 圆角大小
    customRadius: createValueHandler<string>((radius: string) => settingsState.setCustomRadius(radius)),
  };

  // 盒子样式处理器
  const boxStyleHandlers = {
    // 设置盒子模式
    setBoxMode: (type: BoxStyleType) => {
      settingsState.setBoxMode(type);
    },
  };

  // 颜色设置处理器
  const colorHandlers = {
    // 选择主题色
    selectColor: (color: string) => {
      if (!color) {
        return;
      }

      settingsState.setSystemThemeColor(color);

      // 如果存在主题插件，也更新主题插件
      // 使用静态导入，确保同步执行
      try {
        const theme = useThemePlugin();
        if (theme && theme.updateThemeColor) {
          theme.updateThemeColor(color);
        }
      } catch (e) {
        // 如果主题插件不可用，尝试从全局获取
        const globalTheme = (globalThis as any).__THEME_PLUGIN__ || (window as any).__THEME_PLUGIN__;
        if (globalTheme && globalTheme.updateThemeColor) {
          globalTheme.updateThemeColor(color);
        }
      }
      // 触发页面重新加载或更新主题
      window.dispatchEvent(new CustomEvent('theme-color-change', { detail: { color } }));
    },
  };

  // 容器设置处理器
  const containerHandlers = {
    // 设置容器宽度
    setWidth: (type: ContainerWidthEnum) => {
      settingsState.setContainerWidth(type);
      // 触发页面重新加载或更新布局
      window.dispatchEvent(new CustomEvent('container-width-change', { detail: { width: type } }));
    },
  };

  // 按钮风格处理器
  const buttonStyleHandlers = {
    setStyle: (style: ButtonStyle) => {
      settingsState.setButtonStyle(style);
    },
  };

  // Loading 样式处理器
  type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';
  const loadingStyleHandlers = {
    setStyle: (style: LoadingStyle) => {
      settingsState.setLoadingStyle(style);
    },
  };

  // 全局风格套件处理器
  const stylePresetHandlers = {
    setPreset: (preset: StylePresetEnum) => {
      settingsState.setStylePreset(preset);
    },
  };

  // 主题风格处理器
  const themeStyleHandlers = {
    // 切换主题风格
    switchTheme: (theme: SystemThemeEnum) => {
      settingsState.switchThemeStyles(theme);
    },
  };

  // 菜单布局处理器
  const menuLayoutHandlers = {
    // 切换菜单布局
    switchLayout: (layout: MenuTypeEnum) => {
      settingsState.switchMenuLayouts(layout);
      // 触发菜单布局变化事件，让布局组件响应
      window.dispatchEvent(new CustomEvent('menu-layout-change', { detail: { layout } }));
    },
  };

  // 菜单风格处理器
  const menuStyleHandlers = {
    // 切换菜单风格
    switchStyle: (style: MenuThemeEnum) => {
      settingsState.switchMenuStyles(style);
      window.dispatchEvent(new CustomEvent('menu-style-change', { detail: { style } }));
    },
  };

  return {
    domOperations,
    basicHandlers,
    boxStyleHandlers,
    colorHandlers,
    containerHandlers,
    buttonStyleHandlers,
    loadingStyleHandlers,
    stylePresetHandlers,
    themeStyleHandlers,
    menuLayoutHandlers,
    menuStyleHandlers,
  };
}

