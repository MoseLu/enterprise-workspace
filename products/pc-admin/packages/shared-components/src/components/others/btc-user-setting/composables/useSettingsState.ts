/**
 * 璁剧疆鐘舵€佺鐞? * 浣跨敤 localStorage 鎸佷箙鍖栬缃姸鎬? */

import { ref, computed } from 'vue';
import { storage } from '@btc/shared-core/utils';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType, StylePresetEnum } from '../config/enums';
import { useThemePlugin, type ButtonStyle } from '@btc/shared-core';

/**
 * 璁剧疆鐘舵€佺鐞嗙粍鍚堝紡鍑芥暟
 */
export function useSettingsState() {
  // 关键：该组合式函数会被多个组件重复调用（偏好抽屉 / AppLayout / Topbar 等）
  // 如果每次调用都创建一份新的 ref，会导致“切换菜单布局只写入 storage，但页面不响应”
  // 因此这里做全局单例缓存，确保同一应用内共享同一份响应式状态
  // 优先使用应用的 useSettingsState（如果存在），确保状态同步
  // 某些应用（如 system-app）有自己的 useSettingsState 实现，需要优先使用
  const globalAny = globalThis as any;
  const appSettingsStateModule = globalAny?.__USE_SETTINGS_STATE_MODULE__;
  if (appSettingsStateModule?.useSettingsState && typeof appSettingsStateModule.useSettingsState === 'function') {
    return appSettingsStateModule.useSettingsState();
  }

  // 如果没有应用的实现，使用共享组件的全局单例
  const globalKey = '__BTC_SETTINGS_STATE__';
  if (globalAny && globalAny[globalKey]) {
    return globalAny[globalKey];
  }

  // 首先获取统一的 settings 存储
  const getSettings = (): Record<string, any> => (storage.get('settings') as Record<string, any> | null) ?? {};
  const initialSettings = getSettings();

  // 从统一的 settings 存储中读取所有设置项，如果没有则从旧键读取（向后兼容）
  // 菜单相关设置
  const menuType = ref<MenuTypeEnum>(initialSettings.menuType || storage.get('menuType') || MenuTypeEnum.LEFT);
  const menuOpenWidth = ref<number>(initialSettings.menuOpenWidth ?? storage.get('menuOpenWidth') ?? 240);
  const menuOpen = ref<boolean>(initialSettings.menuOpen ?? storage.get('menuOpen') ?? true);

  // 涓婚鐩稿叧璁剧疆
  const systemThemeType = ref<SystemThemeEnum>(initialSettings.systemThemeType || storage.get('systemThemeType') || SystemThemeEnum.AUTO);
  const systemThemeMode = ref<SystemThemeEnum>(initialSettings.systemThemeMode || storage.get('systemThemeMode') || SystemThemeEnum.AUTO);
  const menuThemeType = ref<MenuThemeEnum>(initialSettings.menuThemeType || storage.get('menuThemeType') || MenuThemeEnum.DESIGN);
  const systemThemeColor = ref<string>(initialSettings.systemThemeColor || storage.get('systemThemeColor') || '#409eff');

  // 界面显示设置
  const showMenuButton = ref<boolean>(initialSettings.showMenuButton ?? storage.get('showMenuButton') ?? true);
  const showFastEnter = ref<boolean>(initialSettings.showFastEnter ?? storage.get('showFastEnter') ?? true);
  const showRefreshButton = ref<boolean>(initialSettings.showRefreshButton ?? storage.get('showRefreshButton') ?? true);
  const showCrumbs = ref<boolean>(initialSettings.showCrumbs ?? storage.get('showCrumbs') ?? true);
  const showWorkTab = ref<boolean>(initialSettings.showWorkTab ?? storage.get('showWorkTab') ?? true);
  const showGlobalSearch = ref<boolean>(initialSettings.showGlobalSearch ?? storage.get('showGlobalSearch') ?? true);
  const showLanguage = ref<boolean>(initialSettings.showLanguage ?? storage.get('showLanguage') ?? true);
  const showNprogress = ref<boolean>(initialSettings.showNprogress ?? storage.get('showNprogress') ?? true);
  const colorWeak = ref<boolean>(initialSettings.colorWeak ?? storage.get('colorWeak') ?? false);
  const watermarkVisible = ref<boolean>(initialSettings.watermarkVisible ?? storage.get('watermarkVisible') ?? false);

  // 其他设置
  const containerWidth = ref<ContainerWidthEnum>(initialSettings.containerWidth || storage.get('containerWidth') || ContainerWidthEnum.FULL);
  const boxBorderMode = ref<boolean>(initialSettings.boxBorderMode ?? storage.get('boxBorderMode') ?? false);
  const uniqueOpened = ref<boolean>(initialSettings.uniqueOpened ?? storage.get('uniqueOpened') ?? false);
  const tabStyle = ref<string>(initialSettings.tabStyle || storage.get('tabStyle') || 'tab-default');
  const pageTransition = ref<string>(initialSettings.pageTransition || storage.get('pageTransition') || 'slide-left');
  const customRadius = ref<string>(initialSettings.customRadius || storage.get('customRadius') || '0.25');

  // 全局风格套件
  const storedStylePreset = initialSettings.stylePreset as StylePresetEnum | null;
  const resolvedStylePreset: StylePresetEnum =
    storedStylePreset && Object.values(StylePresetEnum).includes(storedStylePreset)
      ? storedStylePreset
      : StylePresetEnum.MINIMAL;
  const stylePreset = ref<StylePresetEnum>(resolvedStylePreset);
  if (!initialSettings.stylePreset || !Object.values(StylePresetEnum).includes(initialSettings.stylePreset)) {
    storage.set('settings', { ...initialSettings, stylePreset: resolvedStylePreset });
  }

  // 按钮风格设置
  // 只从统一的 settings 存储中读取，不再读取旧的独立键
  const storedButtonStyle = initialSettings.buttonStyle as ButtonStyle | null;
  const resolvedButtonStyle: ButtonStyle =
    storedButtonStyle === 'minimal' ? 'minimal' : 'default';
  const buttonStyle = ref<ButtonStyle>(resolvedButtonStyle);
  if (!initialSettings.buttonStyle || (initialSettings.buttonStyle !== 'default' && initialSettings.buttonStyle !== 'minimal')) {
    storage.set('settings', { ...initialSettings, buttonStyle: resolvedButtonStyle });
  }

  // Loading 样式设置
  type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';
  const storedLoadingStyle = initialSettings.loadingStyle as LoadingStyle | null;
  const resolvedLoadingStyle: LoadingStyle = storedLoadingStyle === 'dots' ? 'dots' : storedLoadingStyle === 'gradient' ? 'gradient' : storedLoadingStyle === 'progress' ? 'progress' : storedLoadingStyle === 'flower' ? 'flower' : 'circle';
  const loadingStyle = ref<LoadingStyle>(resolvedLoadingStyle);
  if (!initialSettings.loadingStyle || (initialSettings.loadingStyle !== 'circle' && initialSettings.loadingStyle !== 'dots' && initialSettings.loadingStyle !== 'gradient' && initialSettings.loadingStyle !== 'progress' && initialSettings.loadingStyle !== 'flower')) {
    storage.set('settings', { ...initialSettings, loadingStyle: resolvedLoadingStyle });
  }

  const resolveThemePlugin = () => {
    try {
      return useThemePlugin();
    } catch {
      return (globalThis as any).__THEME_PLUGIN__ || null;
    }
  };

  const applyButtonStyle = (style: ButtonStyle) => {
    const themePlugin = resolveThemePlugin();
    if (themePlugin?.setButtonStyle) {
      themePlugin.setButtonStyle(style);
    } else if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-button-style', style);
    }
  };

  applyButtonStyle(buttonStyle.value);

  const applyStylePreset = (preset: StylePresetEnum) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-style', preset);
    }
  };

  applyStylePreset(stylePreset.value);

  function setButtonStyle(style: ButtonStyle) {
    if (buttonStyle.value === style) return;
    buttonStyle.value = style;
    const settings = getSettings();
    storage.set('settings', { ...settings, buttonStyle: style });
    applyButtonStyle(style);
  }

  /**
   * 设置全局风格套件
   */
  function setStylePreset(preset: StylePresetEnum) {
    if (stylePreset.value === preset) return;
    stylePreset.value = preset;
    const settings = getSettings();
    storage.set('settings', { ...settings, stylePreset: preset });
    applyStylePreset(preset);
    window.dispatchEvent(new CustomEvent('style-preset-change', { detail: { preset } }));
  }

  /**
   * 设置 Loading 样式
   */
  function setLoadingStyle(style: LoadingStyle) {
    if (loadingStyle.value === style) return;
    loadingStyle.value = style;
    const settings = getSettings();
    storage.set('settings', { ...settings, loadingStyle: style });
    // 触发 loading 样式变化事件
    window.dispatchEvent(new CustomEvent('loading-style-change', { detail: { style } }));
  }

  // 鍒濆鍖栨椂搴旂敤璁剧疆
  // 搴旂敤鑹插急妯″紡
  if (colorWeak.value) {
    document.documentElement.classList.add('color-weak');
  }
  // 搴旂敤鑷畾涔夊渾瑙?  document.documentElement.style.setProperty('--custom-radius', `${customRadius.value}rem`);

  /**
   * 切换菜单布局
   */
  function switchMenuLayouts(type: MenuTypeEnum) {
    menuType.value = type;
    const settings = getSettings();
    storage.set('settings', { ...settings, menuType: type });
    // 清理旧的独立存储 key
    storage.remove('menuType');
  }

  /**
   * 切换菜单样式
   */
  function switchMenuStyles(theme: MenuThemeEnum) {
    // 如果主题相同，直接返回，避免重复调用
    if (menuThemeType.value === theme) {
      return;
    }

    menuThemeType.value = theme;
    const settings = getSettings();
    // 检查存储中的值是否已经相同，避免不必要的更新
    if (settings.menuThemeType !== theme) {
      storage.set('settings', { ...settings, menuThemeType: theme });
    }
    // 清理旧的独立存储 key
    storage.remove('menuThemeType');
  }

  /**
   * 切换主题风格
   */
  function switchThemeStyles(theme: SystemThemeEnum) {
    systemThemeType.value = theme;
    systemThemeMode.value = theme;

    // 使用统一的 settings 存储，而不是单独的 systemThemeType 和 systemThemeMode
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', {
      ...currentSettings,
      systemThemeType: theme,
      systemThemeMode: theme
    });
    // 清理旧的独立存储 key
    storage.remove('systemThemeType');
    storage.remove('systemThemeMode');

    // 应用 DOM 变化 - 使用 nextTick 确保 Vue 响应式更新完成后再操作 DOM，避免水合问题
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        const htmlEl = document.documentElement;
        if (theme === SystemThemeEnum.DARK) {
          htmlEl.classList.add('dark');
        } else if (theme === SystemThemeEnum.LIGHT) {
          htmlEl.classList.remove('dark');
        } else {
          // AUTO - 跟随系统
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            htmlEl.classList.add('dark');
          } else {
            htmlEl.classList.remove('dark');
          }
        }
      });
    });
  }

  /**
   * 璁剧疆绯荤粺涓婚鑹?   */
  function setSystemThemeColor(color: string) {
    systemThemeColor.value = color;
    // 浣跨敤缁熶竴鐨?settings 瀛樺偍
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', {
      ...currentSettings,
      systemThemeColor: color
    });
    // 娓呯悊鏃х殑鐙珛瀛樺偍 key
    storage.remove('systemThemeColor');
    // 杩欓噷鍙互瑙﹀彂涓婚鑹叉洿鏂颁簨浠?    window.dispatchEvent(new CustomEvent('theme-color-change', { detail: { color } }));
  }

  /**
   * 璁剧疆瀹瑰櫒瀹藉害
   */
  function setContainerWidth(width: ContainerWidthEnum) {
    containerWidth.value = width;
    const settings = getSettings();
    storage.set('settings', { ...settings, containerWidth: width });
    storage.remove('containerWidth');
  }

  /**
   * 璁剧疆鐩掑瓙妯″紡
   */
  function setBoxMode(type: BoxStyleType) {
    const isBorderMode = type === BoxStyleType.BORDER;
    boxBorderMode.value = isBorderMode;
    const settings = getSettings();
    storage.set('settings', { ...settings, boxBorderMode: isBorderMode });
    storage.remove('boxBorderMode');
    document.documentElement.setAttribute('data-box-mode', type);
  }

  /**
   * 鍒囨崲宸ヤ綔鍙版爣绛?   */
  function toggleWorkTab() {
    showWorkTab.value = !showWorkTab.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showWorkTab: showWorkTab.value });
    storage.remove('showWorkTab');
  }

  /**
   * 鍒囨崲鑿滃崟鎸夐挳
   */
  function toggleMenuButton() {
    showMenuButton.value = !showMenuButton.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showMenuButton: showMenuButton.value });
    storage.remove('showMenuButton');
  }

  /**
   * 鍒囨崲蹇€熷叆鍙?   */
  function toggleFastEnter() {
    showFastEnter.value = !showFastEnter.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showFastEnter: showFastEnter.value });
    storage.remove('showFastEnter');
  }

  /**
   * 鍒囨崲鍒锋柊鎸夐挳
   */
  function toggleRefreshButton() {
    showRefreshButton.value = !showRefreshButton.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showRefreshButton: showRefreshButton.value });
    storage.remove('showRefreshButton');
  }

  /**
   * 鍒囨崲闈㈠寘灞?   */
  function toggleCrumbs() {
    showCrumbs.value = !showCrumbs.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showCrumbs: showCrumbs.value });
    storage.remove('showCrumbs');
  }

  /**
   * 鍒囨崲璇█
   */
  function toggleLanguage() {
    showLanguage.value = !showLanguage.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showLanguage: showLanguage.value });
    storage.remove('showLanguage');
  }

  /**
   * 鍒囨崲鍞竴灞曞紑
   */
  function toggleUniqueOpened() {
    uniqueOpened.value = !uniqueOpened.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, uniqueOpened: uniqueOpened.value });
    storage.remove('uniqueOpened');
  }

  /**
   * 鍒囨崲Nprogress
   */
  function toggleNprogress() {
    showNprogress.value = !showNprogress.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showNprogress: showNprogress.value });
    storage.remove('showNprogress');
  }

  /**
   * 鍒囨崲棰滆壊寮?   */
  function toggleColorWeak() {
    colorWeak.value = !colorWeak.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, colorWeak: colorWeak.value });
    storage.remove('colorWeak');
    const htmlEl = document.documentElement;
    if (colorWeak.value) {
      htmlEl.classList.add('color-weak');
    } else {
      htmlEl.classList.remove('color-weak');
    }
  }

  /**
   * 鍒囨崲姘村嵃
   */
  function toggleWatermark() {
    watermarkVisible.value = !watermarkVisible.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, watermarkVisible: watermarkVisible.value });
    storage.remove('watermarkVisible');
  }

  /**
   * 璁剧疆鏍囩椤垫牱寮?   */
  function setTabStyle(style: string) {
    tabStyle.value = style;
    const settings = getSettings();
    storage.set('settings', { ...settings, tabStyle: style });
    storage.remove('tabStyle');
    window.dispatchEvent(new CustomEvent('tab-style-change', { detail: { style } }));
  }

  /**
   * 璁剧疆椤甸潰杩囨浮
   */
  function setPageTransition(transition: string) {
    pageTransition.value = transition;
    const settings = getSettings();
    storage.set('settings', { ...settings, pageTransition: transition });
    storage.remove('pageTransition');
    window.dispatchEvent(new CustomEvent('page-transition-change', { detail: { transition } }));
  }

  /**
   * 璁剧疆鑷畾涔夊渾瑙?   */
  function setCustomRadius(radius: string) {
    customRadius.value = radius;
    const settings = getSettings();
    storage.set('settings', { ...settings, customRadius: radius });
    storage.remove('customRadius');
    document.documentElement.style.setProperty('--custom-radius', `${radius}rem`);
  }

  /**
   * 鍒囨崲鍏ㄥ眬鎼滅储鏄剧ず
   */
  function toggleGlobalSearch() {
    showGlobalSearch.value = !showGlobalSearch.value;
    const settings = getSettings();
    storage.set('settings', { ...settings, showGlobalSearch: showGlobalSearch.value });
    storage.remove('showGlobalSearch');
  }

  /**
   * 璁剧疆鑿滃崟灞曞紑瀹藉害
   */
  function setMenuOpenWidth(width: number) {
    menuOpenWidth.value = width;
    const settings = getSettings();
    storage.set('settings', { ...settings, menuOpenWidth: width });
    storage.remove('menuOpenWidth');
  }

  /**
   * 鍒ゆ柇鏄惁涓烘殫鑹叉ā寮?   */
  const isDark = computed(() => {
    return systemThemeType.value === SystemThemeEnum.DARK;
  });

  const api = {
    menuType,
    menuOpenWidth,
    menuOpen,
    systemThemeType,
    systemThemeMode,
    menuThemeType,
    systemThemeColor,
    showMenuButton,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showWorkTab,
    showGlobalSearch,
    showLanguage,
    showNprogress,
    colorWeak,
    watermarkVisible,
    containerWidth,
    boxBorderMode,
    uniqueOpened,
    tabStyle,
    pageTransition,
    customRadius,
    buttonStyle,
    loadingStyle,
    stylePreset,
    isDark,
    switchMenuLayouts,
    switchMenuStyles,
    switchThemeStyles,
    setSystemThemeColor,
    setContainerWidth,
    setBoxMode,
    toggleWorkTab,
    toggleMenuButton,
    toggleFastEnter,
    toggleRefreshButton,
    toggleCrumbs,
    toggleLanguage,
    toggleUniqueOpened,
    toggleNprogress,
    toggleColorWeak,
    toggleWatermark,
    setTabStyle,
    setPageTransition,
    setCustomRadius,
    setButtonStyle,
    setLoadingStyle,
    setStylePreset,
    setMenuOpenWidth,
    toggleGlobalSearch,
  };

  // 缓存到全局，保证后续调用共享同一份状态
  if (globalAny) {
    globalAny[globalKey] = api;
  }

  return api;
}


