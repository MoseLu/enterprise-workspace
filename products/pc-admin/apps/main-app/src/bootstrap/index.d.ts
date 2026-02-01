/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 *
 * 参考 cool-admin 的架构设计，采用模块化目录结构
 */
import type { App } from 'vue';
/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 */
export declare function bootstrap(app: App): Promise<void>;
export * from './core';
export * from './handlers';
export * from './integrations';
