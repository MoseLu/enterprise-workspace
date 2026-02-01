/**
 * 鍩虹鏈嶅姟绫? * 鍩轰簬缁熶竴鐨?request 鍑芥暟锛屽弬鑰?cool-admin 鐨勫疄鐜? */

import { request, type Request } from './request';

export interface BaseServiceOptions {
  namespace?: string;
  request?: Request;
}

export class BaseService {
  private namespace: string;
  private request: Request;

  constructor(options: BaseServiceOptions = {}) {
    this.namespace = options.namespace || '';
    this.request = options.request || request;
  }

  /**
   * 闈欐€佽姹傛柟娉?   */
  static async request(options: any): Promise<any> {
    return request(options);
  }

  /**
   * 鍙戣捣 HTTP 璇锋眰
   */
  protected async http<T = any>(options: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
  }): Promise<T> {
    const { url, method = 'GET', data, params } = options;

    // 鏋勫缓瀹屾暣 URL
    const fullUrl = this.namespace ? `${this.namespace}${url}` : url;

    return this.request({
      url: fullUrl,
      method,
      data,
      params,
    });
  }

  /**
   * 鍒楄〃鏌ヨ
   */
  async list(data?: any): Promise<any[]> {
    return this.http({
      url: '/list',
      method: 'POST',
      data,
    });
  }

  /**
   * 鍒嗛〉鏌ヨ
   */
  async page(data: any): Promise<{
    list: any[];
    pagination: {
      page: number;
      size: number;
      total: number;
    };
  }> {
    return this.http({
      url: '/page',
      method: 'POST',
      data,
    });
  }

  /**
   * 璇︽儏鏌ヨ
   */
  async info(params: any): Promise<any> {
    return this.http({
      url: '/info',
      method: 'GET',
      params,
    });
  }

  /**
   * 鏂板
   */
  async add(data: any): Promise<any> {
    return this.http({
      url: '/add',
      method: 'POST',
      data,
    });
  }

  /**
   * 鏇存柊
   */
  async update(data: any): Promise<any> {
    return this.http({
      url: '/update',
      method: 'POST',
      data,
    });
  }

  /**
   * 鍒犻櫎
   */
  async delete(data: { ids: (string | number)[] }): Promise<any> {
    return this.http({
      url: '/delete',
      method: 'POST',
      data,
    });
  }
}



