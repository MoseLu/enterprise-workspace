import type { ErrorInfo } from './formatError';
import { reportErrorToMonitorApp } from './crossDomainReporter';

/**
 * 子应用错误捕获配置
 */
export interface SubAppErrorCaptureConfig {
  updateErrorList?: (errorInfo: ErrorInfo) => void | Promise<void>; // 可选：本地更新（用于同域或 qiankun 环境）
  appName: string; // 子应用名称
  useCrossDomainReport?: boolean; // 是否使用跨域上报（默认：true，子应用只上报不存储）
}

/**
 * 设置子应用的错误捕获
 * 由于 qiankun 的沙箱隔离，子应用的错误无法被主应用的 window.onerror 捕获
 * 必须在子应用内部捕获并主动上报
 */
export function setupSubAppErrorCapture(config: SubAppErrorCaptureConfig) {
  const { updateErrorList, appName, useCrossDomainReport = true } = config;

  // 错误上报函数：子应用默认只使用跨域上报，不进行本地存储
  const reportError = (errorInfo: ErrorInfo) => {
    // 跨域上报到监控应用（子应用只上报不存储）
    if (useCrossDomainReport) {
      reportErrorToMonitorApp(errorInfo);
    }
    // 如果明确禁用了跨域上报，且提供了本地更新函数，则使用本地更新
    // 这主要用于同域环境或 qiankun 环境下的兼容
    if (!useCrossDomainReport && updateErrorList) {
      updateErrorList(errorInfo);
    }
  };

  // 1. 捕获子应用JS运行时错误
  window.onerror = (message, source, lineno, colno, error) => {
    const errorInfo: any = {
      type: 'script',
      message: String(message),
      source: appName,
      stack: error?.stack || '',
      url: source || window.location.href,
    };
    // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
    if (lineno !== undefined) {
      errorInfo.lineno = lineno;
    }
    if (colno !== undefined) {
      errorInfo.colno = colno;
    }
    reportError(errorInfo);
    // 返回 false 以允许默认的错误处理
    return false;
  };

  // 2. 捕获子应用资源加载错误
  window.addEventListener(
    'error',
    (event) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')
      ) {
        reportError({
          type: 'resource',
          message: `资源加载失败: ${(event.target as HTMLScriptElement).src || (event.target as HTMLLinkElement).href || (event.target as HTMLImageElement).src}`,
          source: appName,
          url: (event.target as HTMLScriptElement).src || (event.target as HTMLLinkElement).href || (event.target as HTMLImageElement).src,
        });
      }
    },
    true
  );

  // 3. 捕获子应用Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      type: 'promise',
      message: event.reason?.message || String(event.reason) || 'Promise拒绝未捕获',
      source: appName,
      stack: event.reason?.stack || '',
    });
  });

  // 安全的 JSON 序列化函数，处理循环引用
  const safeStringify = (obj: any): string => {
    const seen = new WeakSet();
    try {
      return JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        // 过滤掉函数、undefined、symbol 等不可序列化的值
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }
        if (typeof value === 'undefined') {
          return '[Undefined]';
        }
        if (typeof value === 'symbol') {
          return value.toString();
        }
        return value;
      });
    } catch (error) {
      return String(obj);
    }
  };

  // 将参数转换为字符串
  const argsToString = (args: any[]): string => {
    return args.map((arg) => {
      if (arg === null) {
        return 'null';
      }
      if (arg === undefined) {
        return 'undefined';
      }
      const type = typeof arg;
      if (type === 'string') {
        return arg;
      }
      if (type === 'number' || type === 'boolean') {
        return String(arg);
      }
      if (type === 'object') {
        return safeStringify(arg);
      }
      return String(arg);
    }).join(' ');
  };

  // 检查是否应该过滤警告/错误
  const shouldIgnoreMessage = (message: string): boolean => {
    // 过滤 Vue 开发警告
    if (message.includes('[Vue warn]')) {
      return true;
    }
    // 过滤编译器选项警告
    if (message.includes('compilerOptions')) {
      return true;
    }
    // 过滤组件实例枚举警告
    if (message.includes('Avoid app logic that relies on enumerating keys')) {
      return true;
    }
    // 过滤错误监控系统自身的错误
    if (message.includes('[errorMonitor]') || message.includes('errorMonitor')) {
      return true;
    }
    // 过滤 qiankun 相关警告
    if (message.includes('[qiankun]') || message.includes('qiankun')) {
      return true;
    }
    // 过滤 single-spa 相关警告
    if (message.includes('single-spa')) {
      return true;
    }
    // 过滤 Element Plus 的 prop 类型检查警告（开发环境警告）
    if (message.includes('Invalid prop: type check failed')) {
      return true;
    }
    // 过滤 Vue 的 extraneous non-props attributes 警告（BtcImportBtn 的 exportFilename prop）
    if (message.includes('Extraneous non-props attributes') && message.includes('exportFilename')) {
      return true;
    }
    // 过滤表单验证错误（Element Plus 表单验证失败时输出的对象，格式如 {username: Array(1)}）
    // 匹配模式：{字段名: Array(...)} 或包含常见表单字段名和 Array 的对象
    if (
      /^\s*\{[^}]*:\s*Array\([^)]*\)[^}]*\}\s*$/.test(message) ||
      (message.includes('Array(') && (
        message.includes('username') ||
        message.includes('password') ||
        message.includes('phone') ||
        message.includes('smsCode') ||
        message.includes('email') ||
        message.includes('confirmPassword')
      ))
    ) {
      return true;
    }
    return false;
  };

  // 4. 捕获子应用console.warn/error
  const originalWarn = console.warn;
  console.warn = function (...args: any[]) {
    const message = argsToString(args);
    // 过滤不需要监控的警告
    if (!shouldIgnoreMessage(message)) {
      reportError({
        type: 'console-warn',
        message,
        source: appName,
        isWarning: true,
      });
    }
    originalWarn.apply(console, args);
  };

  const originalError = console.error;
  console.error = function (...args: any[]) {
    const message = argsToString(args);
    // 过滤不需要监控的错误
    if (!shouldIgnoreMessage(message)) {
      reportError({
        type: 'console-error',
        message,
        source: appName,
      });
    }
    originalError.apply(console, args);
  };
}

