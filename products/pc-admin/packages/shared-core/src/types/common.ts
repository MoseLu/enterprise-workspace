/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 鍩虹 API 鍝嶅簲
 */
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 鍒嗛〉鍝嶅簲
 */
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

/**
 * 鍒嗛〉鍙傛暟
 */
export interface PageParams {
  page: number;
  size: number;
  [key: string]: any;
}

/**
 * 瀛楀吀椤? */
export interface DictItem {
  label: string;
  value: string | number;
  type?: string;
  color?: string;
}


