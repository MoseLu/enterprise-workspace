/**
 * 跨子域名错误上报工具
 * 子应用使用此工具将错误发送到监控应用，监控应用负责存储
 */

import type { ErrorInfo } from './formatError';
;

/**
 * 获取监控应用的域名
 * 根据当前环境自动判断监控应用的域名
 */
function getMonitorAppOrigin(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // 生产环境：监控应用在 monitor.bellis.com.cn
  if (hostname.includes('bellis.com.cn')) {
    // 检查是否是监控应用本身
    if (hostname === 'monitor.bellis.com.cn') {
      return null; // 监控应用自己不需要上报
    }
    return `${protocol}//monitor.bellis.com.cn`;
  }

  // 开发环境：监控应用在 localhost:4180
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // 检查是否是监控应用本身
    if (window.location.port === '4180' || window.location.pathname.startsWith('/monitor')) {
      return null; // 监控应用自己不需要上报
    }
    return `${protocol}//localhost:4180`;
  }

  // 其他环境：尝试从当前域名推断
  // 例如：如果当前是 admin.example.com，监控应用可能是 example.com
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // 子域名情况，取主域名
    const mainDomain = parts.slice(-2).join('.');
    return `${protocol}//${mainDomain}`;
  }

  return null;
}

/**
 * 跨域错误上报消息类型
 */
interface CrossDomainErrorReport {
  type: 'btc-error-report';
  errorInfo: ErrorInfo;
  timestamp: number;
}

/**
 * 通过 postMessage 发送错误到监控应用
 * @param errorInfo 错误信息
 */
export function reportErrorToMonitorApp(errorInfo: ErrorInfo): void {
  try {
    const monitorOrigin = getMonitorAppOrigin();

    if (!monitorOrigin) {
      // 如果是监控应用自己，或者无法确定监控应用域名，则不发送
      return;
    }

    // 检查是否在 iframe 中（qiankun 环境）
    const targetWindow = window.parent !== window ? window.parent : window.top;

    if (!targetWindow || targetWindow === window) {
      // 如果不在 iframe 中，尝试直接发送到当前窗口（监控应用可能在同一窗口）
      // 这种情况下，监控应用需要监听当前窗口的 message 事件
      window.postMessage(
        {
          type: 'btc-error-report',
          errorInfo,
          timestamp: Date.now(),
        } as CrossDomainErrorReport,
        '*'
      );
      return;
    }

    // 在 iframe 中，发送到父窗口
    targetWindow.postMessage(
      {
        type: 'btc-error-report',
        errorInfo,
        timestamp: Date.now(),
      } as CrossDomainErrorReport,
      monitorOrigin
    );
  } catch (error) {
    // 静默失败，避免错误上报本身导致错误
    console.warn('[CrossDomainReporter] 上报错误到监控应用失败', error);
  }
}

/**
 * 监听来自子应用的错误上报（仅在监控应用中使用）
 * @param callback 接收到错误时的回调函数
 * @returns 取消监听的函数
 */
export function listenForErrorReports(
  callback: (errorInfo: ErrorInfo) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    // 验证消息类型
    if (event.data && event.data.type === 'btc-error-report') {
      const report = event.data as CrossDomainErrorReport;

      // 验证消息来源（可选，生产环境建议启用）
      // 在生产环境中，可以验证 event.origin 是否来自预期的子域名
      const currentOrigin = window.location.origin;
      const isSameOrigin = event.origin === currentOrigin;
      const isExpectedOrigin =
        (event.origin.includes('bellis.com.cn') && !event.origin.includes('monitor.bellis.com.cn')) || // 允许所有 bellis.com.cn 的子域名（除了监控应用自己）
        event.origin.includes('localhost') ||
        event.origin.includes('127.0.0.1');

      // 允许同源或预期的跨域来源
      if (isSameOrigin || isExpectedOrigin) {
        callback(report.errorInfo);
      } else {
        console.warn('[CrossDomainReporter] 收到来自未知来源的错误上报', { origin: event.origin });
      }
    }
  };

  window.addEventListener('message', handler);

  // 返回取消监听的函数
  return () => {
    window.removeEventListener('message', handler);
  };
}

