/**
 * 拦截器配置模块
 * 负责配置各种拦截器
 */

import { initResponseInterceptor } from '../../utils/response-interceptor-init';
import { router } from '../core/router';

/**
 * 初始化拦截器
 */
export const setupInterceptors = () => {
  // 初始化响应拦截器
  initResponseInterceptor(router);
};
