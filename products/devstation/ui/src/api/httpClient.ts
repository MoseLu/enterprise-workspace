/*
 * DevStation HTTP Client
 * Based on MonkeyCode-main design pattern with Zod validation support
 */

import type {
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';
import type { ZodType } from 'zod';
import { validateApiResponse } from '../types/schema';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
  /** zod schema for response validation (optional) */
  schema?: ZodType<unknown>;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

const whitePathnameList = ['/user/login', '/login', '/auth', '/invite'];

const redirectToLogin = () => {
  const pathname = location.pathname.startsWith('/user')
    ? '/login'
    : '/login/admin';
  window.location.href = `${pathname}?redirect=${encodeURIComponent(location.href)}`;
};

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      withCredentials: true,
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || import.meta.env.VITE_API_BASE_URL || '/api/v1',
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;

    // Response interceptor
    this.instance.interceptors.response.use(
      (resp) => {
        const responseData = resp.data;
        if (responseData && typeof responseData === 'object' && 'code' in responseData) {
          if (responseData.code === 0) {
            return responseData.data;
          }
          const message = responseData.message || 'Unknown API error';
          console.warn(`[API Error] ${message}`);
          return Promise.reject(message);
        }
        return responseData;
      },
      (err) => {
        if (err?.response?.status === 401) {
          if (
            whitePathnameList.find((item) => location.pathname.startsWith(item))
          ) {
            return Promise.reject('尚未登录');
          }
          redirectToLogin();
          return Promise.reject('尚未登录');
        }
        // 手动取消请求
        if (err.code === 'ERR_CANCELED') {
          return;
        }
        const msg = err?.response?.data?.message || err?.message || 'Unknown API error';
        console.warn(`[API Error] ${msg}`);
        return Promise.reject(msg);
      }
    );
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem)
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = unknown, _E = unknown>({
    secure,
    path,
    type,
    query,
    format,
    body,
    schema,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === 'object'
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== 'string'
    ) {
      body = JSON.stringify(body);
    }

    const response = await this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData
          ? { 'Content-Type': type }
          : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });

    // Zod 验证（如果提供了 schema）
    if (schema) {
      // 自动处理 null 值：对于 GET 列表请求，将 null 转换为空数组
      let dataToValidate = response;
      if (response === null && params.method === 'GET') {
        // 对于 GET 请求且返回 null 的情况，视为空数组
        dataToValidate = [];
      }
      
      const validationResult = validateApiResponse(dataToValidate, schema);
      if (!validationResult.success) {
        console.warn(`[Zod Validation Failed] Path: ${path}`, validationResult.error);
      }
    }

    return response as T;
  };
}

// Create default instance
const httpClient = new HttpClient({ format: 'json' });

export default httpClient;
