export { BaseService } from './base';
export { request, createRequest, createRequestWithPermission } from './request';
export type { BaseServiceOptions } from './base';
export type { Request, RequestOptions } from './request';

// EPS 工具函数
export {
  normalizeKeywordObject,
  normalizePageParams,
  wrapServiceTree,
  normalizePageResponse,
  createCrudServiceFromEps,
} from './eps-utils';


