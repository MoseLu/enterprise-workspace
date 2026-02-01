/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type?: string; // 错误类型：resource/script/promise/console/warn等
  message?: string; // 错误信息
  source?: string; // 来源：main-app/layout-app/admin-app等
  stack?: string; // 错误栈
  url?: string; // 错误发生页面或资源URL
  isWarning?: boolean; // 是否是警告（区分error/warn）
  lineno?: number; // 行号
  colno?: number; // 列号
}

/**
 * 格式化后的错误信息
 */
export interface FormattedError {
  id: string; // 唯一ID
  type: string;
  message: string;
  source: string;
  stack: string;
  url: string;
  time: string; // 发生时间
  isWarning: boolean;
  lineno?: number;
  colno?: number;
}

/**
 * 格式化错误信息为统一格式
 */
export function formatError(errorInfo: ErrorInfo): FormattedError {
  const result: FormattedError = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: errorInfo.type || 'unknown',
    message: errorInfo.message || '',
    source: errorInfo.source || 'main-app',
    stack: errorInfo.stack || '',
    url: errorInfo.url || (typeof window !== 'undefined' ? window.location.href : ''),
    time: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    })(),
    isWarning: errorInfo.isWarning || false,
  };
  
  // 明确处理可选属性的 undefined
  if (errorInfo.lineno !== undefined) {
    result.lineno = errorInfo.lineno;
  }
  if (errorInfo.colno !== undefined) {
    result.colno = errorInfo.colno;
  }
  
  return result;
}

