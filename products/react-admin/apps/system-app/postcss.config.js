// import pxToViewport from 'postcss-px-to-viewport';

// PostCSS 配置
// 注意：PostCSS 不支持 TypeScript 格式，必须使用 JavaScript
const config = {
  plugins: {
    // postcss-px-to-viewport 插件已禁用，避免影响全局布局
    //
    // ========== 为什么之前的配置会导致异常 ==========
    // 1. propList: ['*'] - 转换所有属性，包括不应该转换的属性：
    //    - border、border-width、border-radius（应该保持 px，转换后会导致边框过粗/过细）
    //    - box-shadow（阴影应该保持 px，转换后视觉效果会异常）
    //    - width、height（在固定布局中不应该转换，转换后会导致布局错乱）
    //    - flex-basis、gap 等 flex 布局相关属性（在某些场景下不应该转换）
    //
    // 2. selectorBlackList 配置过于简单：
    //    - 只排除了 `.ignore-` 开头的类，但很多组件（如 topbar、sidebar）应该排除
    //    - 没有排除第三方库的样式类
    //
    // 3. viewportWidth: 1920 可能导致的问题：
    //    - 如果某些元素的 px 值是相对于设计稿计算的，转换后在小屏幕上会异常放大
    //    - 例如：1237px 在 1920px 设计稿下 = 64.43vw，在 1920px 屏幕上正常
    //      但在 1366px 屏幕上 = 64.43vw = 880px，会导致元素过大
    //
    // ========== 如果要启用，建议的正确配置 ==========
    // 'postcss-px-to-viewport': pxToViewport({
    //   viewportWidth: 1920, // 设计稿宽度
    //   unitPrecision: 3,
    //   // 只转换必要的属性，排除布局和视觉效果相关的属性
    //   propList: [
    //     'font-size',
    //     'line-height',
    //     'letter-spacing',
    //     // 注意：width、height、margin、padding 等布局属性
    //     // 应该根据具体情况决定是否转换，建议使用 selectorBlackList 排除固定布局的组件
    //   ],
    //   // 排除不应该转换的选择器（固定布局的组件、第三方库等）
    //   selectorBlackList: [
    //     /^\.ignore-/,           // 原有的忽略类
    //     /^\.topbar/,            // 顶栏固定布局
    //     /^\.sidebar/,           // 侧边栏固定布局
    //     /^\.el-/,               // Element Plus 组件（已做好响应式，不需要转换）
    //     /^\.app-layout/,        // 应用布局容器
    //   ],
    //   viewportUnit: 'vw',
    //   fontViewportUnit: 'vw',
    //   minPixelValue: 1,
    //   mediaQuery: false,
    //   replace: true,
    //   exclude: [/node_modules/],
    // }),
  },
};

export default config;
