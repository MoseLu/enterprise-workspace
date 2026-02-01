/**
 * UI框架配置模块
 * 负责配置Element Plus、主题、样式等UI相关设置
 */
import type { App } from 'vue';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'virtual:uno.css';
import '../../styles/global.scss';
import '../../styles/theme.scss';
import '../../styles/menu-themes.scss';
import '../../styles/nprogress.scss';
import '@btc/shared-components/styles/index.scss';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
/**
 * Element Plus 语言配置
 */
export declare const elementLocale: {
    'zh-CN': typeof zhCn;
    'en-US': typeof en;
};
/**
 * 获取当前语言设置
 */
export declare const getCurrentLocale: () => string;
/**
 * 配置Element Plus
 */
export declare const setupElementPlus: (app: App) => void;
/**
 * 配置全局样式
 */
export declare const setupGlobalStyles: () => void;
/**
 * 配置UI框架
 */
export declare const setupUI: (app: App) => void;
