/**
 * 微应用集成模块
 * 负责配置qiankun微前端相关设置
 */
import type { App } from 'vue';
/**
 * 设置微前端应用
 */
export declare const setupMicroApps: (app: App) => Promise<void>;
