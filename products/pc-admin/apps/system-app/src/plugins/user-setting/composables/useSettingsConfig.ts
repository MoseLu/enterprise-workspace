/**
 * 设置配置管理
 * 提供所有设置选项的配置
 */

import { computed } from 'vue';
import { useI18n, useThemePlugin, type ButtonStyle } from '@btc/shared-core';
import { configImages } from '../config/images';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType } from '../config/enums';

/**
 * 设置配置管理组合式函数
 */
export function useSettingsConfig() {
  const { t } = useI18n();
  const theme = useThemePlugin();
  const buttonStyleOptions = computed(() => {
    const currentStyle = theme.buttonStyle?.value || 'default';
    return [
      {
        value: 'default' as ButtonStyle,
        label: t('setting.buttonStyle.default') || 'Default',
        active: currentStyle === 'default',
      },
      {
        value: 'minimal' as ButtonStyle,
        label: t('setting.buttonStyle.minimal') || 'Minimal',
        active: currentStyle === 'minimal',
      },
    ];
  });


  // 主题风格选项
  const themeList = computed(() => [
    {
      name: t('setting.theme.list[0]') || 'Light',
      theme: SystemThemeEnum.LIGHT,
      color: ['#fff', '#fff'],
      leftLineColor: '#EDEEF0',
      rightLineColor: '#EDEEF0',
      img: configImages.themeStyles.light,
    },
    {
      name: t('setting.theme.list[1]') || 'Dark',
      theme: SystemThemeEnum.DARK,
      color: ['#22252A'],
      leftLineColor: '#3F4257',
      rightLineColor: '#3F4257',
      img: configImages.themeStyles.dark,
    },
    {
      name: t('setting.theme.list[2]') || 'System',
      theme: SystemThemeEnum.AUTO,
      color: ['#fff', '#22252A'],
      leftLineColor: '#EDEEF0',
      rightLineColor: '#3F4257',
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
      background: '#FFFFFF',
      systemNameColor: 'var(--el-text-color-primary)',
      iconColor: '#6B6B6B',
      textColor: '#29343D',
      textActiveColor: '#3F8CFF',
      iconActiveColor: '#333333',
      tabBarBackground: '#FAFBFC',
      systemBackground: '#FAFBFC',
      leftLineColor: '#EDEEF0',
      rightLineColor: '#EDEEF0',
      img: configImages.menuStyles.design,
    },
    {
      theme: MenuThemeEnum.DARK,
      background: '#0a0a0a',
      systemNameColor: '#BABBBD',
      iconColor: '#BABBBD',
      textColor: '#BABBBD',
      textActiveColor: '#FFFFFF',
      iconActiveColor: '#FFFFFF',
      tabBarBackground: '#FFFFFF',
      systemBackground: '#F8F8F8',
      leftLineColor: '#3F4257',
      rightLineColor: '#EDEEF0',
      img: configImages.menuStyles.dark,
    },
    {
      theme: MenuThemeEnum.LIGHT,
      background: '#FFFFFF',
      systemNameColor: 'var(--el-text-color-primary)',
      iconColor: '#6B6B6B',
      textColor: '#29343D',
      textActiveColor: '#409eff',
      iconActiveColor: '#409eff',
      tabBarBackground: '#FFFFFF',
      systemBackground: '#FFFFFF',
      leftLineColor: '#EDEEF0',
      rightLineColor: '#EDEEF0',
      img: configImages.menuStyles.light,
    },
  ]);

  // 系统主题色选项（从预设主题中获取，排除自定义主题）
  const mainColors = computed(() => {
    const presets = theme.THEME_PRESETS || [];
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
  };

  return {
    // 直接导出 computed 属性供组件使用
    themeList,
    menuLayoutList,
    menuStyleList,
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

