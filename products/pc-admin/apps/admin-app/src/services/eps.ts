import epsModule from 'virtual:eps';
import { loadEpsService } from '@btc/shared-core';

// 使用共享的 EPS 服务加载函数
// 会自动优先使用全局服务（由 layout-app 提供），如果没有则从 virtual:eps 加载本地服务
// 如果存在全局服务，会自动合并本地服务以确保完整性
const { service, list } = loadEpsService(epsModule);

export { service, list };
export default service;
