/**
 * 设置配置管理
 * 提供所有设置选项的配置
 */

import { computed } from 'vue';
import { useI18n, useThemePlugin, type ButtonStyle } from '@btc/shared-core';
import { getCurrentEnvironment } from '@btc/shared-core/configs/unified-env-config';
import { configImages as defaultConfigImages } from '../config/images';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType, StylePresetEnum } from '../config/enums';

/**
 * 修复图片路径：如果路径是 /assets/layout/ 开头，且当前不在 layout-app 域名下，转换为完整 URL
 * 这样可以确保在子应用（如 admin-app）中也能正确加载 layout-app 的图片资源
 */
function fixImagePath(path: string): string {
  if (!path) return path;

  // 如果路径已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // 如果路径是 /assets/layout/ 开头，需要检查是否需要转换为完整 URL
  if (path.startsWith('/assets/layout/')) {
    // 检查当前是否在 layout-app 域名下
    if (typeof window !== 'undefined') {
      const env = getCurrentEnvironment();
      const hostname = window.location.hostname;
      const port = window.location.port || '';

      const isLayoutAppDomain =
        (env === 'production' && hostname === 'layout.bellis.com.cn') ||
        (env === 'test' && hostname === 'layout.test.bellis.com.cn') ||
        (env === 'preview' && port === '4192') ||
        (env === 'development' && port === '4188');

      // 如果不在 layout-app 域名下，转换为完整 URL
      if (!isLayoutAppDomain) {
        // 使用 layout-app 的域名
        const protocol = window.location.protocol;
        let layoutOrigin: string;
        if (env === 'test') {
          layoutOrigin = `${protocol}//layout.test.bellis.com.cn`;
        } else {
          layoutOrigin = `${protocol}//layout.bellis.com.cn`;
        }
        return `${layoutOrigin}${path}`;
      }
    }
  }

  return path;
}

/**
 * 获取应用特定的图片配置（支持覆盖）
 * 优先使用应用提供的配置，如果没有则使用共享组件的默认配置
 * 如果应用配置中的图片路径为空字符串，则使用共享组件的默认配置
 * 关键：修复图片路径，确保在子应用中也能正确加载 layout-app 的图片资源
 */
function getConfigImages() {
  // 检查是否有应用特定的配置
  const globalAny = globalThis as any;
  const appConfigImages = globalAny?.__CONFIG_IMAGES__;

  let finalConfig;
  if (appConfigImages) {
    // 合并应用配置和默认配置：如果应用配置中的值为空字符串，使用默认配置
    finalConfig = {
      themeStyles: {
        light: appConfigImages.themeStyles?.light || defaultConfigImages.themeStyles.light,
        dark: appConfigImages.themeStyles?.dark || defaultConfigImages.themeStyles.dark,
        system: appConfigImages.themeStyles?.system || defaultConfigImages.themeStyles.system,
      },
      menuLayouts: {
        vertical: appConfigImages.menuLayouts?.vertical || defaultConfigImages.menuLayouts.vertical,
        horizontal: appConfigImages.menuLayouts?.horizontal || defaultConfigImages.menuLayouts.horizontal,
        mixed: appConfigImages.menuLayouts?.mixed || defaultConfigImages.menuLayouts.mixed,
        dualColumn: appConfigImages.menuLayouts?.dualColumn || defaultConfigImages.menuLayouts.dualColumn,
      },
      menuStyles: {
        design: appConfigImages.menuStyles?.design || defaultConfigImages.menuStyles.design,
        dark: appConfigImages.menuStyles?.dark || defaultConfigImages.menuStyles.dark,
        light: appConfigImages.menuStyles?.light || defaultConfigImages.menuStyles.light,
      },
    };
  } else {
    // 使用共享组件的默认配置
    finalConfig = defaultConfigImages;
  }

  // 修复所有图片路径
  return {
    themeStyles: {
      light: fixImagePath(finalConfig.themeStyles.light),
      dark: fixImagePath(finalConfig.themeStyles.dark),
      system: fixImagePath(finalConfig.themeStyles.system),
    },
    menuLayouts: {
      vertical: fixImagePath(finalConfig.menuLayouts.vertical),
      horizontal: fixImagePath(finalConfig.menuLayouts.horizontal),
      mixed: fixImagePath(finalConfig.menuLayouts.mixed),
      dualColumn: fixImagePath(finalConfig.menuLayouts.dualColumn),
    },
    menuStyles: {
      design: fixImagePath(finalConfig.menuStyles.design),
      dark: fixImagePath(finalConfig.menuStyles.dark),
      light: fixImagePath(finalConfig.menuStyles.light),
    },
  };
}

/**
 * 设置配置管理组合式函数
 */
export function useSettingsConfig() {
  const { t } = useI18n();
  // 获取图片配置（支持应用特定覆盖）
  const configImages = getConfigImages();

  // 安全地获取主题插件
  let theme: ReturnType<typeof useThemePlugin> | null = null;
  try {
    theme = useThemePlugin();
  } catch (error) {
    // 如果主题插件未初始化，尝试从全局获取
    theme = (globalThis as any).__THEME_PLUGIN__ || (typeof window !== 'undefined' && (window as any).__THEME_PLUGIN__) || null;
  }
  const buttonStyleOptions = computed(() => {
    const currentStyle = theme?.buttonStyle?.value || 'default';
    return [
      {
        value: 'default' as ButtonStyle,
        label: t('theme.buttonStyles.default') || 'Default',
        active: currentStyle === 'default',
      },
      {
        value: 'minimal' as ButtonStyle,
        label: t('theme.buttonStyles.minimal') || 'Minimal',
        active: currentStyle === 'minimal',
      },
    ];
  });


  // 主题风格选项
  const themeList = computed(() => [
    {
      name: t('setting.theme.list[0]') || 'Light',
      theme: SystemThemeEnum.LIGHT,
      color: ['var(--el-bg-color)', 'var(--el-bg-color)'],
      leftLineColor: 'var(--el-border-color-light)',
      rightLineColor: 'var(--el-border-color-light)',
      img: configImages.themeStyles.light,
    },
    {
      name: t('setting.theme.list[1]') || 'Dark',
      theme: SystemThemeEnum.DARK,
      color: ['var(--btc-surface-panel)'],
      leftLineColor: 'var(--el-border-color)',
      rightLineColor: 'var(--el-border-color)',
      img: configImages.themeStyles.dark,
    },
    {
      name: t('setting.theme.list[2]') || 'System',
      theme: SystemThemeEnum.AUTO,
      color: ['var(--el-bg-color)', 'var(--btc-surface-panel)'],
      leftLineColor: 'var(--el-border-color-light)',
      rightLineColor: 'var(--el-border-color)',
      img: configImages.themeStyles.system,
    },
  ]);

  // 菜单布局选项
  const menuLayoutList = computed(() => [
    { name: t('setting.menuType.list[0]') || 'Left', value: MenuTypeEnum.LEFT, img: configImages.menuLayouts.vertical },
    { name: t('setting.menuType.list[1]') || 'Top', value: MenuTypeEnum.TOP, img: configImages.menuLayouts.horizontal },
    { name: t('setting.menuType.list[2]') || 'Mixed', value: MenuTypeEnum.TOP_LEFT, img: configImages.menuLayouts.mixed },
    { name: t('setting.menuType.list[3]') || 'Dual Column', value: MenuTypeEnum.DUAL_MENU, img: configImages.menuLayouts.dualColumn },
  ]);

  // 菜单风格选项
  const menuStyleList = computed(() => [
    {
      theme: MenuThemeEnum.DESIGN,
      background: 'var(--el-bg-color)',
      systemNameColor: 'var(--el-text-color-primary)',
      iconColor: 'var(--el-text-color-regular)',
      textColor: 'var(--el-text-color-primary)',
      textActiveColor: 'var(--el-color-primary)',
      iconActiveColor: 'var(--el-text-color-primary)',
      tabBarBackground: 'var(--el-bg-color-page)',
      systemBackground: 'var(--el-bg-color-page)',
      leftLineColor: 'var(--el-border-color-light)',
      rightLineColor: 'var(--el-border-color-light)',
      img: configImages.menuStyles.design,
    },
    {
      theme: MenuThemeEnum.DARK,
      background: 'var(--btc-surface-panel)',
      systemNameColor: 'var(--el-text-color-regular)',
      iconColor: 'var(--el-text-color-regular)',
      textColor: 'var(--el-text-color-regular)',
      textActiveColor: 'var(--el-text-color-primary)',
      iconActiveColor: 'var(--el-text-color-primary)',
      tabBarBackground: 'var(--el-bg-color)',
      systemBackground: 'var(--el-bg-color-page)',
      leftLineColor: 'var(--el-border-color)',
      rightLineColor: 'var(--el-border-color-light)',
      img: configImages.menuStyles.dark,
    },
    {
      theme: MenuThemeEnum.LIGHT,
      background: 'var(--el-bg-color)',
      systemNameColor: 'var(--el-text-color-primary)',
      iconColor: 'var(--el-text-color-regular)',
      textColor: 'var(--el-text-color-primary)',
      textActiveColor: 'var(--el-color-primary)',
      iconActiveColor: 'var(--el-color-primary)',
      tabBarBackground: 'var(--el-bg-color)',
      systemBackground: 'var(--el-bg-color)',
      leftLineColor: 'var(--el-border-color-light)',
      rightLineColor: 'var(--el-border-color-light)',
      img: configImages.menuStyles.light,
    },
  ]);

  // 全局风格套件选项
  const stylePresetList = computed(() => [
    {
      name: t('setting.style.list[0]') || 'Minimal',
      value: StylePresetEnum.MINIMAL,
    },
    {
      name: t('setting.style.list[1]') || 'Glass',
      value: StylePresetEnum.GLASS,
    },
    {
      name: t('setting.style.list[2]') || 'Cyber',
      value: StylePresetEnum.CYBER,
    },
  ]);

  // 系统主题色选项（从预设主题中获取，排除自定义主题）
  const mainColors = computed(() => {
    const presets = theme?.THEME_PRESETS || [];
    // 从预设主题中提取颜色，过滤掉空值
    return presets
      .map((preset: any) => preset.color)
      .filter((color: any) => color != null && color !== '');
  });

  // 容器宽度选项
  const containerWidthOptions = computed(() => [
    {
      value: ContainerWidthEnum.FULL,
      label: t('setting.container.list[0]') || 'Full Width',
      icon: '&#xe694;',
    },
    {
      value: ContainerWidthEnum.BOXED,
      label: t('setting.container.list[1]') || 'Boxed',
      icon: '&#xe6de;',
    },
  ]);

  // 标签页风格选项
  const tabStyleOptions = computed(() => [
    {
      value: 'tab-default',
      label: t('setting.tabStyle.default') || 'Default',
    },
    {
      value: 'tab-card',
      label: t('setting.tabStyle.card') || 'Card',
    },
    {
      value: 'tab-google',
      label: t('setting.tabStyle.google') || 'Google',
    },
  ]);

  // 页面切换动画选项
  const pageTransitionOptions = computed(() => [
    {
      value: '',
      label: t('setting.transition.list.none') || 'None',
    },
    {
      value: 'fade',
      label: t('setting.transition.list.fade') || 'Fade',
    },
    {
      value: 'slide-left',
      label: t('setting.transition.list.slideLeft') || 'Slide Left',
    },
    {
      value: 'slide-bottom',
      label: t('setting.transition.list.slideBottom') || 'Slide Bottom',
    },
    {
      value: 'slide-top',
      label: t('setting.transition.list.slideTop') || 'Slide Top',
    },
  ]);

  // 圆角大小选项
  const customRadiusOptions = computed(() => [
    { value: '0', label: t('setting.radius.list[0]') || '0' },
    { value: '0.25', label: t('setting.radius.list[1]') || '0.25' },
    { value: '0.5', label: t('setting.radius.list[2]') || '0.5' },
    { value: '0.75', label: t('setting.radius.list[3]') || '0.75' },
    { value: '1', label: t('setting.radius.list[4]') || '1' },
  ]);

  // 盒子样式选项
  const boxStyleOptions = computed(() => [
    {
      value: 'border-mode',
      label: t('setting.box.list[0]') || 'Border Mode',
      type: BoxStyleType.BORDER,
    },
    {
      value: 'shadow-mode',
      label: t('setting.box.list[1]') || 'Shadow Mode',
      type: BoxStyleType.SHADOW,
    },
  ]);

  // 基础设置项配置
  const basicSettingsConfig = computed(() => {
    const allSettings = [
      {
        key: 'showWorkTab',
        label: t('setting.basics.list.multiTab') || 'Multi Tab',
        type: 'switch' as const,
        handler: 'workTab',
        mobileHide: false,
      },
      {
        key: 'uniqueOpened',
        label: t('setting.basics.list.accordion') || 'Accordion',
        type: 'switch' as const,
        handler: 'uniqueOpened',
        mobileHide: false,
      },
      {
        key: 'showGlobalSearch',
        label: t('setting.basics.list.globalSearch') || 'Global Search',
        type: 'switch' as const,
        handler: 'globalSearch',
        mobileHide: false,
      },
      {
        key: 'showCrumbs',
        label: t('setting.basics.list.breadcrumb') || 'Breadcrumb',
        type: 'switch' as const,
        handler: 'crumbs',
        mobileHide: true,
      },
      {
        key: 'colorWeak',
        label: t('setting.basics.list.weakMode') || 'Color Weak Mode',
        type: 'switch' as const,
        handler: 'colorWeak',
        mobileHide: false,
      },
      {
        key: 'menuOpenWidth',
        label: t('setting.basics.list.menuWidth') || 'Menu Width',
        type: 'input-number' as const,
        handler: 'menuOpenWidth',
        min: 180,
        max: 320,
        step: 10,
        style: { width: '120px' },
        controlsPosition: 'right' as const,
        mobileHide: false,
      },
      {
        key: 'tabStyle',
        label: t('setting.basics.list.tabStyle') || 'Tab Style',
        type: 'select' as const,
        handler: 'tabStyle',
        options: tabStyleOptions.value,
        style: { width: '120px' },
        mobileHide: false,
      },
      {
        key: 'pageTransition',
        label: t('setting.basics.list.pageTransition') || 'Page Transition',
        type: 'select' as const,
        handler: 'pageTransition',
        options: pageTransitionOptions.value,
        style: { width: '120px' },
        mobileHide: false,
      },
      {
        key: 'customRadius',
        label: t('setting.basics.list.borderRadius') || 'Border Radius',
        type: 'select' as const,
        handler: 'customRadius',
        options: customRadiusOptions.value,
        style: { width: '120px' },
        mobileHide: false,
      },
    ];

    // 过滤掉移动端需要隐藏的设置
    return allSettings.filter((item) => {
      if (typeof window !== 'undefined' && window.innerWidth <= 768 && item.mobileHide) {
        return false;
      }
      return true;
    });
  });

  // 从配置文件直接获取的选项（普通对象，不是computed）
  const configOptions = {
    themeList: themeList.value,
    menuLayoutList: menuLayoutList.value,
    menuStyleList: menuStyleList.value,
    mainColors: mainColors.value,
    stylePresetList: stylePresetList.value,
  };

  return {
    // 直接导出 computed 属性供组件使用
    themeList,
    menuLayoutList,
    menuStyleList,
    stylePresetList,
    mainColors,
    buttonStyleOptions,
    // 配置选项对象（用于兼容旧代码）
    configOptions,
    containerWidthOptions,
    tabStyleOptions,
    pageTransitionOptions,
    customRadiusOptions,
    boxStyleOptions,
    basicSettingsConfig,
  };
}

