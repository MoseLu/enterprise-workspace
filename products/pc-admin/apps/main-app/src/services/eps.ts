// 注意：此文件被标记为副作用模块（package.json 中的 sideEffects），确保完整的 EPS 数据被包含
// 防止 tree-shaking 移除未直接访问的 EPS 服务
;
import epsModule from 'virtual:eps';
import { loadEpsService, exportEpsServiceToGlobal } from '@btc/shared-core';

// 使用共享的 EPS 服务加载函数
const { service, list } = loadEpsService(epsModule);

// 开发环境调试：检查 service 对象结构（已禁用日志）
// if (import.meta.env.DEV) {
//   console.info('[eps.ts] EPS service loaded', {
//     hasService: !!service,
//     hasAdmin: !!service?.admin,
//     hasIam: !!service?.admin?.iam,
//     hasDomain: !!service?.admin?.iam?.domain,
//     hasDomainMe: !!service?.admin?.iam?.domain?.me,
//     serviceKeys: service ? Object.keys(service).slice(0, 10) : [],
//     adminKeys: service?.admin ? Object.keys(service.admin).slice(0, 10) : [],
//     iamKeys: service?.admin?.iam ? Object.keys(service.admin.iam).slice(0, 10) : [],
//     domainKeys: service?.admin?.iam?.domain ? Object.keys(service.admin.iam.domain) : [],
//   });
// }

// 导出到全局，供其他应用使用
exportEpsServiceToGlobal(service);

// 确保完整的 service 对象被导出
// package.json 中的 sideEffects 标记会确保此模块不被 tree-shaking 移除
export { service, list };
export default service;

