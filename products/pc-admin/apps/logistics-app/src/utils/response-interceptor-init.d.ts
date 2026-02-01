/**
 * 响应拦截器初始化
 * 用于设置路由实例，支持重定向功能
 */
import type { Router } from 'vue-router';
/**
 * 初始化响应拦截器
 * @param router Vue Router 实例
 */
export declare function initResponseInterceptor(router: Router): void;
/**
 * 响应拦截器工具函数
 */
export { responseInterceptor } from '@btc/shared-utils';
