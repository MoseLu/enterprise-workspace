/**
 * 主题设置共享翻译
 * 
 * 注意：theme.presets.* 的国际化定义在 @btc/shared-core/locales 中
 * 这里只定义 shared-core 中没有的主题相关翻译，避免重复定义
 */

// 从 shared-core 引用主题预设的国际化
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';

// 提取 shared-core 中的主题预设翻译
const getThemePresetsFromSharedCore = (locale: 'zh-CN' | 'en-US') => {
  const sharedCore = locale === 'zh-CN' ? sharedCoreZh : sharedCoreEn;
  const sharedCoreDefault = (sharedCore as any)?.default ?? sharedCore;
  
  return {
    'theme.presets.brand_red': sharedCoreDefault['theme.presets.brand_red'],
    'theme.presets.brand_gray': sharedCoreDefault['theme.presets.brand_gray'],
    'theme.presets.lake_blue': sharedCoreDefault['theme.presets.lake_blue'],
    'theme.presets.green': sharedCoreDefault['theme.presets.green'],
    'theme.presets.purple': sharedCoreDefault['theme.presets.purple'],
    'theme.presets.orange': sharedCoreDefault['theme.presets.orange'],
    'theme.presets.mint': sharedCoreDefault['theme.presets.mint'],
    'theme.presets.blue': sharedCoreDefault['theme.presets.blue'],
    'theme.presets.custom': sharedCoreDefault['theme.presets.custom'],
  };
};

export const theme = {
  'zh-CN': {
    // 主题基础
    'theme.title': '偏好设置',
    'theme.presets': '预设主题',
    'theme.custom_color': '自定义颜色',
    'theme.switched': '已切换到',
    'theme.default': '默认',
    'theme.custom': '自定义',

    // 主题预设颜色（从 shared-core 引用，确保单一数据源）
    ...getThemePresetsFromSharedCore('zh-CN'),
    'theme.presets.pink': '粉色', // shared-core 中没有，保留在这里

    // 按钮风格
    'theme.buttonStyles.title': '按钮风格',
    'theme.buttonStyles.default': '默认风格',
    'theme.buttonStyles.minimal': '极简风格',
    'theme.buttonStyles.primary': '主按钮',
    'theme.buttonStyles.secondary': '次按钮',

    // 加载样式
    'theme.loadingStyles.title': '加载样式',
    'theme.loadingStyles.circle': '彩色圆圈',
    'theme.loadingStyles.dots': '四个圆点',
    'theme.loadingStyles.gradient': '渐变圆环',
    'theme.loadingStyles.progress': '进度条',
    'theme.loadingStyles.flower': '八瓣花',

    // 设置相关
    'setting.theme.title': '主题风格',
    'setting.theme.list[0]': '浅色',
    'setting.theme.list[1]': '深色',
    'setting.theme.list[2]': '跟随系统',
    'setting.menuType.title': '菜单布局',
    'setting.menuType.list[0]': '左侧',
    'setting.menuType.list[1]': '顶部',
    'setting.menuType.list[2]': '混合',
    'setting.menuType.list[3]': '双栏',
    'setting.menu.title': '菜单风格',
    'setting.color.title': '系统主题色',
    'setting.box.title': '盒子样式',
    'setting.box.list[0]': '边框模式',
    'setting.box.list[1]': '阴影模式',
    'setting.container.title': '容器宽度',
    'setting.container.list[0]': '铺满',
    'setting.container.list[1]': '定宽',
    'setting.basics.title': '基础配置',
    'setting.basics.list.multiTab': '多标签页',
    'setting.basics.list.accordion': '侧边栏开启手风琴模式',
    'setting.basics.list.collapseSidebar': '显示折叠侧边栏按钮',
    'setting.basics.list.globalSearch': '显示全局搜索',
    'setting.basics.list.fastEnter': '显示快速入口',
    'setting.basics.list.reloadPage': '显示重载页面按钮',
    'setting.basics.list.breadcrumb': '显示全局面包屑导航',
    'setting.basics.list.progressBar': '显示顶部进度条',
    'setting.basics.list.weakMode': '色弱模式',
    'setting.basics.list.watermark': '全局水印',
    'setting.basics.list.menuWidth': '菜单宽度',
    'setting.basics.list.tabStyle': '标签页风格',
    'setting.basics.list.pageTransition': '页面切换动画',
    'setting.basics.list.borderRadius': '自定义圆角',
    'setting.tabStyle.default': '默认',
    'setting.tabStyle.card': '卡片',
    'setting.tabStyle.google': 'Chrome',
    'setting.transition.list.none': '无',
    'setting.transition.list.fade': '淡入淡出',
    'setting.transition.list.slideLeft': '滑动左侧',
    'setting.transition.list.slideBottom': '滑动底部',
    'setting.transition.list.slideTop': '滑动顶部',
    'setting.radius.list[0]': '0',
    'setting.radius.list[1]': '0.25',
    'setting.radius.list[2]': '0.5',
    'setting.radius.list[3]': '0.75',
    'setting.radius.list[4]': '1',
  },
  'en-US': {
    // Theme Basics
    'theme.title': 'Preferences',
    'theme.presets': 'Preset Themes',
    'theme.custom_color': 'Custom Color',
    'theme.switched': 'Switched to',
    'theme.default': 'Default',
    'theme.custom': 'Custom',

    // Theme Preset Colors (referenced from shared-core to ensure single source of truth)
    ...getThemePresetsFromSharedCore('en-US'),
    'theme.presets.pink': 'Pink', // Not in shared-core, keep here

    // Button Styles
    'theme.buttonStyles.title': 'Button Style',
    'theme.buttonStyles.default': 'Default',
    'theme.buttonStyles.minimal': 'Minimal',
    'theme.buttonStyles.primary': 'Primary',
    'theme.buttonStyles.secondary': 'Secondary',

    // Loading Styles
    'theme.loadingStyles.title': 'Loading Style',
    'theme.loadingStyles.circle': 'Color Circle',
    'theme.loadingStyles.dots': 'Four Dots',
    'theme.loadingStyles.gradient': 'Gradient Ring',
    'theme.loadingStyles.progress': 'Progress Bar',
    'theme.loadingStyles.flower': 'Eight Petals',

    // Settings
    'setting.theme.title': 'Theme Style',
    'setting.theme.list[0]': 'Light',
    'setting.theme.list[1]': 'Dark',
    'setting.theme.list[2]': 'System',
    'setting.menuType.title': 'Menu Layout',
    'setting.menuType.list[0]': 'Left',
    'setting.menuType.list[1]': 'Top',
    'setting.menuType.list[2]': 'Mixed',
    'setting.menuType.list[3]': 'Dual Column',
    'setting.menu.title': 'Menu Style',
    'setting.color.title': 'Theme Color',
    'setting.box.title': 'Box Style',
    'setting.box.list[0]': 'Border Mode',
    'setting.box.list[1]': 'Shadow Mode',
    'setting.container.title': 'Container Width',
    'setting.container.list[0]': 'Full',
    'setting.container.list[1]': 'Fixed Width',
    'setting.basics.title': 'Basic Settings',
    'setting.basics.list.multiTab': 'Multi Tab',
    'setting.basics.list.accordion': 'Sidebar opens accordion',
    'setting.basics.list.collapseSidebar': 'Show sidebar button',
    'setting.basics.list.globalSearch': 'Show Global Search',
    'setting.basics.list.fastEnter': 'Show fast enter',
    'setting.basics.list.reloadPage': 'Show reload page button',
    'setting.basics.list.breadcrumb': 'Show crumb navigation',
    'setting.basics.list.progressBar': 'Show top progress bar',
    'setting.basics.list.weakMode': 'Color Weakness Mode',
    'setting.basics.list.watermark': 'Global watermark',
    'setting.basics.list.menuWidth': 'Menu width',
    'setting.basics.list.tabStyle': 'Tab style',
    'setting.basics.list.pageTransition': 'Page animation',
    'setting.basics.list.borderRadius': 'Custom radius',
    'setting.tabStyle.default': 'Default',
    'setting.tabStyle.card': 'Card',
    'setting.tabStyle.google': 'Chrome',
    'setting.transition.list.none': 'None',
    'setting.transition.list.fade': 'Fade',
    'setting.transition.list.slideLeft': 'Slide Left',
    'setting.transition.list.slideBottom': 'Slide Bottom',
    'setting.transition.list.slideTop': 'Slide Top',
    'setting.radius.list[0]': '0',
    'setting.radius.list[1]': '0.25',
    'setting.radius.list[2]': '0.5',
    'setting.radius.list[3]': '0.75',
    'setting.radius.list[4]': '1',
  },
};
