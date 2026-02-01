/**
 * 设置状态管理
 * 使用 localStorage 持久化设置状态
 */
;

import { appStorage } from '@/utils/app-storage';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType, StylePresetEnum } from '../config/enums';
// 现在都在 app-src chunk 中，可以使用静态导入
import { config } from '@/config/index';
import { useThemePlugin, type ButtonStyle } from '@btc/shared-core';
import { registerEChartsThemes } from '@btc/shared-components';

// 使用 markRaw 标记 config 对象，防止 Vue 响应式系统处理，避免内存溢出
// 注意：必须在导入后立即标记，确保在任何响应式处理之前
const rawConfig = markRaw(config);

// 单例状态实例
let settingsStateInstance: ReturnType<typeof createSettingsState> | null = null;

/**
 * 创建设置状态的函数（内部使用）
 */
function createSettingsState() {
  // 从系统配置获取默认值（现在都在 app-src chunk 中，可以直接使用静态导入的 config）
  // 使用 rawConfig 确保不会被 Vue 响应式系统处理
  const defaultSetting = rawConfig.app.systemSetting;
  const defaultStylePreset = (defaultSetting?.default as any)?.defaultStylePreset ?? StylePresetEnum.MINIMAL;

  // 菜单相关设置
  const storedMenuType = appStorage.settings.getItem('menuType');
  const resolvedMenuType =
    storedMenuType && Object.values(MenuTypeEnum).includes(storedMenuType as MenuTypeEnum)
      ? (storedMenuType as MenuTypeEnum)
      : MenuTypeEnum.LEFT;
  const menuType = ref<MenuTypeEnum>(resolvedMenuType);
  if (!storedMenuType || !Object.values(MenuTypeEnum).includes(storedMenuType as MenuTypeEnum)) {
    appStorage.settings.setItem('menuType', resolvedMenuType);
  }
  const menuOpenWidth = ref<number>(appStorage.settings.getItem('menuOpenWidth') ?? defaultSetting.default.defaultMenuWidth);
  const menuOpen = ref<boolean>(appStorage.settings.getItem('menuOpen') ?? true);

  // 主题相关设置
  const storedSystemThemeType = appStorage.settings.getItem('systemThemeType');
  const systemThemeType = ref<SystemThemeEnum>(
    storedSystemThemeType && Object.values(SystemThemeEnum).includes(storedSystemThemeType as SystemThemeEnum)
      ? (storedSystemThemeType as SystemThemeEnum)
      : (defaultSetting.default.defaultSystemThemeType as SystemThemeEnum)
  );

  const storedSystemThemeMode = appStorage.settings.getItem('systemThemeMode');
  const systemThemeMode = ref<SystemThemeEnum>(
    storedSystemThemeMode && Object.values(SystemThemeEnum).includes(storedSystemThemeMode as SystemThemeEnum)
      ? (storedSystemThemeMode as SystemThemeEnum)
      : systemThemeType.value
  );

  // 如果使用的是默认值且存储中没有值，保存默认值到存储
  if (!storedSystemThemeType || !Object.values(SystemThemeEnum).includes(storedSystemThemeType as SystemThemeEnum)) {
    appStorage.settings.setItem('systemThemeType', systemThemeType.value);
  }
  if (!storedSystemThemeMode || !Object.values(SystemThemeEnum).includes(storedSystemThemeMode as SystemThemeEnum)) {
    appStorage.settings.setItem('systemThemeMode', systemThemeMode.value);
  }

  // 菜单风格设置 - 从存储读取或使用默认值
  // 如果存储中没有值，使用默认值；如果存储的值无效，也使用默认值
  const storedMenuTheme = appStorage.settings.getItem('menuThemeType');
  const validMenuTheme = storedMenuTheme && Object.values(MenuThemeEnum).includes(storedMenuTheme as MenuThemeEnum)
    ? (storedMenuTheme as MenuThemeEnum)
    : defaultSetting.default.defaultMenuTheme;

  const menuThemeType = ref<MenuThemeEnum>(validMenuTheme);

  // 如果使用的是默认值且存储中没有值，保存默认值到存储
  if (!storedMenuTheme || !Object.values(MenuThemeEnum).includes(storedMenuTheme as MenuThemeEnum)) {
    appStorage.settings.setItem('menuThemeType', validMenuTheme);
  }

  const systemThemeColor = ref<string>(appStorage.settings.getItem('systemThemeColor') || defaultSetting.default.defaultSystemThemeColor);

  // 界面显示设置
  const showMenuButton = ref<boolean>(appStorage.settings.getItem('showMenuButton') ?? true);
  const showFastEnter = ref<boolean>(appStorage.settings.getItem('showFastEnter') ?? true);
  const showRefreshButton = ref<boolean>(appStorage.settings.getItem('showRefreshButton') ?? true);
  const showCrumbs = ref<boolean>(appStorage.settings.getItem('showCrumbs') ?? defaultSetting.default.defaultShowCrumbs);
  const showWorkTab = ref<boolean>(appStorage.settings.getItem('showWorkTab') ?? defaultSetting.default.defaultShowWorkTab);
  const showGlobalSearch = ref<boolean>(appStorage.settings.getItem('showGlobalSearch') ?? defaultSetting.default.defaultShowGlobalSearch);
  const showLanguage = ref<boolean>(appStorage.settings.getItem('showLanguage') ?? true);
  const showNprogress = ref<boolean>(appStorage.settings.getItem('showNprogress') ?? true);
  const colorWeak = ref<boolean>(appStorage.settings.getItem('colorWeak') ?? defaultSetting.default.defaultColorWeak);
  const watermarkVisible = ref<boolean>(appStorage.settings.getItem('watermarkVisible') ?? false);

  // 其他设置
  const storedContainerWidth = appStorage.settings.getItem('containerWidth');
  const resolvedContainerWidth =
    storedContainerWidth && Object.values(ContainerWidthEnum).includes(storedContainerWidth as ContainerWidthEnum)
      ? (storedContainerWidth as ContainerWidthEnum)
      : ContainerWidthEnum.FULL;
  const containerWidth = ref<ContainerWidthEnum>(resolvedContainerWidth);
  if (!storedContainerWidth || !Object.values(ContainerWidthEnum).includes(storedContainerWidth as ContainerWidthEnum)) {
    appStorage.settings.setItem('containerWidth', resolvedContainerWidth);
  }
  const boxBorderMode = ref<boolean>(appStorage.settings.getItem('boxBorderMode') ?? defaultSetting.default.defaultBoxBorderMode);
  const uniqueOpened = ref<boolean>(appStorage.settings.getItem('uniqueOpened') ?? defaultSetting.default.defaultUniqueOpened);
  const tabStyle = ref<string>(appStorage.settings.getItem('tabStyle') || defaultSetting.default.defaultTabStyle);
  const pageTransition = ref<string>(appStorage.settings.getItem('pageTransition') || defaultSetting.default.defaultPageTransition);
  const customRadius = ref<string>(appStorage.settings.getItem('customRadius') || defaultSetting.default.defaultCustomRadius);

  // 全局风格套件
  const storedStylePreset = appStorage.settings.getItem('stylePreset');
  const resolvedStylePreset =
    storedStylePreset && Object.values(StylePresetEnum).includes(storedStylePreset as StylePresetEnum)
      ? (storedStylePreset as StylePresetEnum)
      : defaultStylePreset;
  const stylePreset = ref<StylePresetEnum>(resolvedStylePreset);
  if (!storedStylePreset || !Object.values(StylePresetEnum).includes(storedStylePreset as StylePresetEnum)) {
    appStorage.settings.setItem('stylePreset', resolvedStylePreset);
  }

  // 按钮风格设置
  const initialSettings = appStorage.settings.get();
  // 只从统一的 settings 存储中读取，不再读取旧的独立键
  const storedButtonStyle = initialSettings?.buttonStyle as ButtonStyle | null;
  const resolvedButtonStyle: ButtonStyle =
    storedButtonStyle === 'minimal' ? 'minimal' : 'default';
  const buttonStyle = ref<ButtonStyle>(resolvedButtonStyle);
  if (!initialSettings?.buttonStyle || (initialSettings.buttonStyle !== 'default' && initialSettings.buttonStyle !== 'minimal')) {
    appStorage.settings.set({ buttonStyle: resolvedButtonStyle });
  }

  // Loading 样式设置
  type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';
  const storedLoadingStyle = initialSettings?.loadingStyle as LoadingStyle | null;
  const resolvedLoadingStyle: LoadingStyle = storedLoadingStyle === 'dots' ? 'dots' : storedLoadingStyle === 'gradient' ? 'gradient' : storedLoadingStyle === 'progress' ? 'progress' : storedLoadingStyle === 'flower' ? 'flower' : 'circle';
  const loadingStyle = ref<LoadingStyle>(resolvedLoadingStyle);
  if (!initialSettings?.loadingStyle || (initialSettings.loadingStyle !== 'circle' && initialSettings.loadingStyle !== 'dots' && initialSettings.loadingStyle !== 'gradient' && initialSettings.loadingStyle !== 'progress' && initialSettings.loadingStyle !== 'flower')) {
    appStorage.settings.set({ loadingStyle: resolvedLoadingStyle });
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
    const nextAction = () => {
      if (themePlugin?.setButtonStyle) {
        themePlugin.setButtonStyle(style);
      } else if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-button-style', style);
      }
    };
    nextAction();
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
    appStorage.settings.set({ buttonStyle: style });
    applyButtonStyle(style);
  }

  /**
   * 设置全局风格套件
   */
  function setStylePreset(preset: StylePresetEnum) {
    if (stylePreset.value === preset) return;
    stylePreset.value = preset;
    appStorage.settings.setItem('stylePreset', preset);
    applyStylePreset(preset);
    window.dispatchEvent(new CustomEvent('style-preset-change', { detail: { preset } }));
  }

  /**
   * 设置 Loading 样式
   */
  function setLoadingStyle(style: LoadingStyle) {
    if (loadingStyle.value === style) return;
    loadingStyle.value = style;
    appStorage.settings.set({ loadingStyle: style });
    // 触发 loading 样式变化事件
    window.dispatchEvent(new CustomEvent('loading-style-change', { detail: { style } }));
  }

  // 初始化时应用设置
  // 1. 应用系统主题（应用到 DOM）- 确保在页面加载时立即应用
  const applySystemTheme = () => {
    const htmlEl = document.documentElement;
    // 先清除所有可能的主题类，确保干净的状态
    htmlEl.classList.remove('dark');

    if (systemThemeType.value === SystemThemeEnum.DARK) {
      htmlEl.classList.add('dark');
    } else if (systemThemeType.value === SystemThemeEnum.LIGHT) {
      // 浅色主题：确保移除 dark class
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
  };

  // 延迟应用设置，避免在模块加载时立即执行（导致循环依赖）
  // 这些代码会在首次调用 useSettingsState() 时执行（通过初始化函数）

  // 初始化函数：应用所有设置到 DOM
  const applyInitialSettings = () => {
    // 1. 应用系统主题（应用到 DOM）- 确保在页面加载时立即应用
    applySystemTheme();
    // 1.1 应用全局风格套件
    applyStylePreset(stylePreset.value);

    // 监听系统主题变化（AUTO 模式）
    if (systemThemeType.value === SystemThemeEnum.AUTO) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => {
        applySystemTheme();
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleThemeChange);
      } else {
        // 兼容旧浏览器
        mediaQuery.addListener(handleThemeChange);
      }
    }

    // 监听主题切换事件（来自 toggleDark），同步更新 systemThemeType 和 menuThemeType
    // 确保两种切换方式（toggleDark 和 switchThemeStyles）的状态一致
    const handleThemeToggle = (event: CustomEvent) => {
      const { theme } = event.detail;
      if (theme && (theme === SystemThemeEnum.LIGHT || theme === SystemThemeEnum.DARK)) {
        // 同步更新 systemThemeType，但不调用 switchThemeStyles 避免循环
        systemThemeType.value = theme;
        systemThemeMode.value = theme;
        appStorage.settings.setItem('systemThemeType', theme);
        appStorage.settings.setItem('systemThemeMode', theme);

        // 同步更新菜单风格：当系统主题切换为暗色时，如果当前菜单风格不是深色，则自动切换为深色
        // 反之，当系统主题切换为浅色时，如果当前菜单风格是深色，则切换为设计风格
        const targetIsDark = theme === SystemThemeEnum.DARK;
        if (targetIsDark && menuThemeType.value !== MenuThemeEnum.DARK) {
          // 切换为暗色菜单风格
          menuThemeType.value = MenuThemeEnum.DARK;
          appStorage.settings.setItem('menuThemeType', MenuThemeEnum.DARK);
        } else if (!targetIsDark && menuThemeType.value === MenuThemeEnum.DARK) {
          // 切换回设计风格（优先使用设计风格）
          menuThemeType.value = MenuThemeEnum.DESIGN;
          appStorage.settings.setItem('menuThemeType', MenuThemeEnum.DESIGN);
        }
      }
    };
    window.addEventListener('theme-toggle', handleThemeToggle as EventListener);

    // 2. 应用盒子模式
    document.documentElement.setAttribute('data-box-mode', boxBorderMode.value ? BoxStyleType.BORDER : BoxStyleType.SHADOW);

    // 3. 应用色弱模式
    if (colorWeak.value) {
      document.documentElement.classList.add('color-weak');
    }

    // 4. 应用自定义圆角
    document.documentElement.style.setProperty('--custom-radius', `${customRadius.value}rem`);
  };

  // 标记是否已初始化
  let settingsApplied = false;

  // 在首次访问时应用初始设置
  // 关键：立即应用系统主题，避免水合问题（在 Vue 组件渲染前就应用正确的主题类）
  const ensureInitialSettingsApplied = () => {
    if (!settingsApplied && typeof window !== 'undefined' && typeof document !== 'undefined') {
      settingsApplied = true;
      // 立即应用系统主题，确保在 Vue 组件渲染前就应用正确的主题类
      applySystemTheme();
      applyStylePreset(stylePreset.value);
      // 其他设置可以在 nextTick 中应用
      nextTick(() => {
        applyInitialSettings();
      });
    }
  };

  /**
   * 切换菜单布局
   */
  function switchMenuLayouts(type: MenuTypeEnum) {
    menuType.value = type;
    appStorage.settings.setItem('menuType', type);
  }

  /**
   * 切换菜单样式
   * 注意：菜单风格值独立存储，不受系统主题影响
   * UI 层面的限制在 menu-style 组件中处理
   */
  function switchMenuStyles(theme: MenuThemeEnum) {
    // 如果主题相同，直接返回，避免重复调用
    if (menuThemeType.value === theme) {
      return;
    }

    menuThemeType.value = theme;

    // 检查存储中的值是否已经相同，避免不必要的更新
    const currentSettings = appStorage.settings.get();
    if (currentSettings.menuThemeType !== theme) {
      appStorage.settings.setItem('menuThemeType', theme);
    }
  }

  /**
   * 禁用过渡效果（参考 art-design-pro，避免主题切换时的水合问题）
   */
  const disableTransitions = () => {
    const style = document.createElement('style');
    style.setAttribute('id', 'disable-transitions');
    style.textContent = '* { transition: none !important; }';
    document.head.appendChild(style);
  };

  /**
   * 启用过渡效果
   */
  const enableTransitions = () => {
    const style = document.getElementById('disable-transitions');
    if (style) {
      style.remove();
    }
  };

  /**
   * 切换主题风格
   * 使用与顶栏主题切换按钮相同的逻辑（theme.toggleDark），确保一致性
   * 关键：通过 useDark 自动管理 dark 类，避免手动管理导致的冲突
   */
  function switchThemeStyles(theme: SystemThemeEnum) {
    // 计算目标暗色模式状态
    const targetIsDark = theme === SystemThemeEnum.DARK ||
      (theme === SystemThemeEnum.AUTO && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 先更新设置状态（同步执行，避免响应式延迟）
    systemThemeType.value = theme;
    systemThemeMode.value = theme;
    appStorage.settings.setItem('systemThemeType', theme);
    appStorage.settings.setItem('systemThemeMode', theme);

    // 同步更新菜单风格：当系统主题切换为暗色时，如果当前菜单风格不是深色，则自动切换为深色
    // 反之，当系统主题切换为浅色时，如果当前菜单风格是深色，则切换为设计风格
    if (targetIsDark && menuThemeType.value !== MenuThemeEnum.DARK) {
      // 切换为暗色菜单风格
      menuThemeType.value = MenuThemeEnum.DARK;
      appStorage.settings.setItem('menuThemeType', MenuThemeEnum.DARK);
    } else if (!targetIsDark && menuThemeType.value === MenuThemeEnum.DARK) {
      // 切换回设计风格（优先使用设计风格）
      menuThemeType.value = MenuThemeEnum.DESIGN;
      appStorage.settings.setItem('menuThemeType', MenuThemeEnum.DESIGN);
    }

    // 尝试获取主题插件实例
    let themePlugin: any = null;

    // 优先尝试从 window 获取（同步方式）
    themePlugin = (window as any).__THEME_PLUGIN__ || (globalThis as any).__THEME_PLUGIN__;

    // 如果从 window 获取失败，尝试使用静态导入的 useThemePlugin
    if (!themePlugin || !themePlugin.isDark) {
      try {
        const plugin = useThemePlugin();
        if (plugin && plugin.isDark) {
          themePlugin = plugin;
        }
      } catch (e) {
        console.warn('Failed to get theme plugin:', e);
        // 如果获取失败，直接应用 DOM 变化（不使用主题插件）
        applySystemTheme();
        return;
      }
    }

    // 如果仍然获取不到主题插件，直接应用 DOM 变化
    if (!themePlugin || !themePlugin.isDark) {
      applySystemTheme();
      return;
    }

    // 如果已经是目标状态，直接返回
    if (themePlugin.isDark.value === targetIsDark) {
      return;
    }

    // 设置面板切换主题不需要动画，直接切换（参考 cool-admin）
    disableTransitions();

    // 关键：只更新 isDark.value，让 useDark 自动管理 HTML class
    // 然后调用统一的 setTheme 函数（完全按照 cool-admin 的方式）
    themePlugin.isDark.value = targetIsDark;

    if (themePlugin.setTheme && themePlugin.currentTheme?.value) {
      themePlugin.setTheme({
        color: themePlugin.currentTheme.value.color,
        dark: targetIsDark
      });
    } else {
      console.warn('[useSettingsState] 无法更新主题', {
        hasSetTheme: !!themePlugin.setTheme,
        hasCurrentTheme: !!themePlugin.currentTheme?.value
      });
    }

    // 使用双重 requestAnimationFrame 确保 CSS 变量已更新，然后重新注册 ECharts 主题
    // 第一帧：等待 DOM 更新和 CSS 变量更新
    requestAnimationFrame(() => {
      // 第二帧：确保 CSS 变量已完全更新
      requestAnimationFrame(() => {
      // 重新注册 ECharts 主题（使用最新的 CSS 变量值）
      registerEChartsThemes();

      // 触发自定义事件，通知组件更新
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { isDark: targetIsDark, theme }
      }));
      });
    });

    // 同步更新设置状态（如果存在）
    try {
      // const SystemThemeEnum = {
      //   LIGHT: 'light',
      //   DARK: 'dark',
      //   AUTO: 'auto',
      // };
      appStorage.settings.setItem('systemThemeType', theme);
      appStorage.settings.setItem('systemThemeMode', theme);
    } catch (e) {
      // 忽略错误
    }

    // 使用双重 requestAnimationFrame 确保在下一帧恢复过渡效果（参考 art-design-pro）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        enableTransitions();
      });
    });
  }

  /**
   * 设置系统主题色
   */
  function setSystemThemeColor(color: string) {
    systemThemeColor.value = color;
    appStorage.settings.setItem('systemThemeColor', color);
    // 这里可以触发主题色更新事件
    window.dispatchEvent(new CustomEvent('theme-color-change', { detail: { color } }));
  }

  /**
   * 设置容器宽度
   */
  function setContainerWidth(width: ContainerWidthEnum) {
    containerWidth.value = width;
    appStorage.settings.setItem('containerWidth', width);
  }

  /**
   * 设置盒子模式
   */
  function setBoxMode(type: BoxStyleType) {
    const isBorderMode = type === BoxStyleType.BORDER;
    boxBorderMode.value = isBorderMode;
    appStorage.settings.setItem('boxBorderMode', isBorderMode);
    document.documentElement.setAttribute('data-box-mode', type);
  }

  /**
   * 切换工作台标签
   */
  function toggleWorkTab() {
    showWorkTab.value = !showWorkTab.value;
    appStorage.settings.setItem('showWorkTab', showWorkTab.value);
  }

  /**
   * 设置工作台标签页
   */
  function setWorkTab(value: boolean) {
    showWorkTab.value = value;
    appStorage.settings.setItem('showWorkTab', value);
  }

  /**
   * 切换菜单按钮
   */
  function toggleMenuButton() {
    showMenuButton.value = !showMenuButton.value;
    appStorage.settings.setItem('showMenuButton', showMenuButton.value);
  }

  /**
   * 切换快速入口
   */
  function toggleFastEnter() {
    showFastEnter.value = !showFastEnter.value;
    appStorage.settings.setItem('showFastEnter', showFastEnter.value);
  }

  /**
   * 切换刷新按钮
   */
  function toggleRefreshButton() {
    showRefreshButton.value = !showRefreshButton.value;
    appStorage.settings.setItem('showRefreshButton', showRefreshButton.value);
  }

  /**
   * 切换面包屑
   */
  function toggleCrumbs() {
    showCrumbs.value = !showCrumbs.value;
    appStorage.settings.setItem('showCrumbs', showCrumbs.value);
  }

  /**
   * 设置面包屑
   */
  function setCrumbs(value: boolean) {
    showCrumbs.value = value;
    appStorage.settings.setItem('showCrumbs', value);
  }

  /**
   * 切换语言
   */
  function toggleLanguage() {
    showLanguage.value = !showLanguage.value;
    appStorage.settings.setItem('showLanguage', showLanguage.value);
  }

  /**
   * 切换唯一展开
   */
  function toggleUniqueOpened() {
    uniqueOpened.value = !uniqueOpened.value;
    appStorage.settings.setItem('uniqueOpened', uniqueOpened.value);
  }

  /**
   * 设置唯一展开
   */
  function setUniqueOpened(value: boolean) {
    uniqueOpened.value = value;
    appStorage.settings.setItem('uniqueOpened', value);
  }

  /**
   * 切换Nprogress
   */
  function toggleNprogress() {
    showNprogress.value = !showNprogress.value;
    appStorage.settings.setItem('showNprogress', showNprogress.value);
  }

  /**
   * 切换颜色弱
   */
  function toggleColorWeak() {
    colorWeak.value = !colorWeak.value;
    appStorage.settings.setItem('colorWeak', colorWeak.value);
    // 应用 CSS 类到 html 元素
    const htmlEl = document.documentElement;
    if (colorWeak.value) {
      htmlEl.classList.add('color-weak');
    } else {
      htmlEl.classList.remove('color-weak');
    }
  }

  /**
   * 设置颜色弱
   */
  function setColorWeak(value: boolean) {
    colorWeak.value = value;
    appStorage.settings.setItem('colorWeak', value);
    // 应用 CSS 类到 html 元素
    const htmlEl = document.documentElement;
    if (value) {
      htmlEl.classList.add('color-weak');
    } else {
      htmlEl.classList.remove('color-weak');
    }
  }

  /**
   * 切换水印
   */
  function toggleWatermark() {
    watermarkVisible.value = !watermarkVisible.value;
    appStorage.settings.setItem('watermarkVisible', watermarkVisible.value);
  }

  /**
   * 设置标签页样式
   */
  function setTabStyle(style: string) {
    tabStyle.value = style;
    appStorage.settings.setItem('tabStyle', style);
    // 触发样式更新事件
    window.dispatchEvent(new CustomEvent('tab-style-change', { detail: { style } }));
  }

  /**
   * 设置页面过渡
   */
  function setPageTransition(transition: string) {
    pageTransition.value = transition;
    appStorage.settings.setItem('pageTransition', transition);
    // 触发页面过渡动画更新事件
    window.dispatchEvent(new CustomEvent('page-transition-change', { detail: { transition } }));
  }

  /**
   * 设置自定义圆角
   */
  function setCustomRadius(radius: string) {
    customRadius.value = radius;
    appStorage.settings.setItem('customRadius', radius);
    // 设置 CSS 变量
    document.documentElement.style.setProperty('--custom-radius', `${radius}rem`);
  }

  /**
   * 切换全局搜索显示
   */
  function toggleGlobalSearch() {
    showGlobalSearch.value = !showGlobalSearch.value;
    appStorage.settings.setItem('showGlobalSearch', showGlobalSearch.value);
  }

  /**
   * 设置全局搜索
   */
  function setGlobalSearch(value: boolean) {
    showGlobalSearch.value = value;
    appStorage.settings.setItem('showGlobalSearch', value);
  }

  /**
   * 设置菜单展开宽度
   */
  function setMenuOpenWidth(width: number) {
    menuOpenWidth.value = width;
    appStorage.settings.setItem('menuOpenWidth', width);
  }

  /**
   * 判断是否为暗色模式
   * 需要考虑 AUTO 模式下系统主题的变化
   */
  const isDark = computed(() => {
    if (systemThemeType.value === SystemThemeEnum.DARK) {
      return true;
    }
    if (systemThemeType.value === SystemThemeEnum.LIGHT) {
      return false;
    }
    // AUTO - 跟随系统
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  return {
    // 状态
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
    // 方法
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
    setWorkTab,
    setUniqueOpened,
    setGlobalSearch,
    setCrumbs,
    setColorWeak,
    // 内部方法：确保初始设置已应用（延迟执行）
    _ensureInitialSettingsApplied: ensureInitialSettingsApplied,
  };
}

/**
 * 初始化配置（在应用启动时调用）
 * 现在使用静态导入，此函数不再需要异步加载 config
 */
export async function initSettingsConfig() {
  // config 已经通过静态导入加载，不需要额外操作
  // 保留此函数以保持 API 兼容性
}

/**
 * 设置状态管理组合式函数（单例模式）
 * 确保所有组件使用同一个状态实例
 */
export function useSettingsState() {
  if (!settingsStateInstance) {
    settingsStateInstance = createSettingsState();
    // 首次初始化时，确保初始设置已应用（延迟执行）
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // 使用 nextTick 确保在 Vue 应用初始化之后执行
      nextTick(() => {
        if ((settingsStateInstance as any)._ensureInitialSettingsApplied) {
          (settingsStateInstance as any)._ensureInitialSettingsApplied();
        }
      });
    }
  } else {
    // 如果实例已存在，也要确保初始设置已应用（可能在之前调用时未应用）
    if ((settingsStateInstance as any)._ensureInitialSettingsApplied) {
      (settingsStateInstance as any)._ensureInitialSettingsApplied();
    }
  }
  return settingsStateInstance;
}

// 在模块加载时，将 useSettingsState 函数暴露到全局，供 useSettingsHandlers 使用
// 这样可以避免静态导入导致的循环依赖
// 注意：这里必须在 useSettingsState 函数定义之后执行，确保函数已经完全定义
// 使用 Object.defineProperty 确保属性可以被正确设置，即使模块还在初始化中
if (typeof globalThis !== 'undefined') {
  try {
    Object.defineProperty(globalThis, '__USE_SETTINGS_STATE_MODULE__', {
      value: {
        useSettingsState,
      },
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // 如果 Object.defineProperty 失败，使用普通赋值
    (globalThis as any).__USE_SETTINGS_STATE_MODULE__ = {
      useSettingsState,
    };
  }
}

