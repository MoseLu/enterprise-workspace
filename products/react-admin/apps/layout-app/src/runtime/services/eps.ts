// layout-app 的 EPS 服务
// 使用从 system-app 复制的完整 EPS 数据
import epsModule from 'virtual:eps';
import { loadEpsService, exportEpsServiceToGlobal } from '@btc/shared-core';

// 使用共享的 EPS 服务加载函数
const { service, list } = loadEpsService(epsModule);

// 立即将服务暴露到全局，供 shared-components 和其他应用使用
// 这确保了 layout-app 加载时，EPS 服务立即可用
exportEpsServiceToGlobal(service);

export { service, list };
export default service;

