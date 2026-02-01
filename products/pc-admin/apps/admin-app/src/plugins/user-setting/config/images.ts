/**
 * 设置面板图片资源配置
 *
 * 注意：这些图片文件在 layout-app 的构建产物中（/assets/layout/ 目录下）
 * 图片文件名包含 hash（如 light-Cqtd3oL6.png），在构建时确定
 * 由于无法在代码中硬编码 hash，这里使用空字符串作为占位符
 * 共享组件会使用默认配置（从 @btc-assets 导入的图片）
 * 这些图片在 layout-app 的构建产物中，通过 Nginx 代理访问
 */

/**
 * 配置设置中心图片
 * 使用空字符串作为占位符，让共享组件使用默认配置
 * 共享组件的默认配置会从 @btc-assets 导入图片，这些图片在 layout-app 的构建产物中
 */
export const configImages = {
  themeStyles: {
    light: '', // 使用共享组件的默认配置
    dark: '', // 使用共享组件的默认配置
    system: '', // 使用共享组件的默认配置
  },
  menuLayouts: {
    vertical: '', // 使用共享组件的默认配置
    horizontal: '', // 使用共享组件的默认配置
    mixed: '', // 使用共享组件的默认配置
    dualColumn: '', // 使用共享组件的默认配置
  },
  menuStyles: {
    design: '', // 使用共享组件的默认配置
    dark: '', // 使用共享组件的默认配置
    light: '', // 使用共享组件的默认配置
  },
};
