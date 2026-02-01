import {
  initErrorMonitor as initErrorMonitorCore,
  updateErrorList as updateErrorListCore,
  type ErrorInfo,
} from '@btc/shared-utils/error-monitor';

/**
 * 初始化错误监控（在主应用启动时调用）
 */
export function initErrorMonitor() {
  initErrorMonitorCore();
}

/**
 * 更新错误列表（主应用和子应用都可调用）
 */
export function updateErrorList(errorInfo: ErrorInfo) {
  updateErrorListCore(errorInfo);
}

/**
 * 设置全局错误捕获（主应用）
 */
export function setupGlobalErrorCapture() {
  // 1. 捕获资源加载错误（404等）
  window.addEventListener(
    'error',
    (event) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')
      ) {
        updateErrorList({
          type: 'resource',
          message: `资源加载失败: ${(event.target as HTMLScriptElement).src || (event.target as HTMLLinkElement).href || (event.target as HTMLImageElement).src} (${event.type})`,
          source: 'main-app',
          url: (event.target as HTMLScriptElement).src || (event.target as HTMLLinkElement).href || (event.target as HTMLImageElement).src,
        });
      }
    },
    true
  );

  // 2. 捕获JS运行时错误
  window.onerror = (message, source, lineno, colno, error) => {
    updateErrorList({
      type: 'script',
      message: String(message),
      source: 'main-app',
      stack: error?.stack || '',
      url: source || window.location.href,
      ...(lineno !== undefined && { lineno }),
      ...(colno !== undefined && { colno }),
    });
    // 返回 false 以允许默认的错误处理
    return false;
  };

  // 3. 捕获Promise未处理拒绝
  window.addEventListener('unhandledrejection', (event) => {
    updateErrorList({
      type: 'promise',
      message: event.reason?.message || String(event.reason) || 'Promise拒绝未捕获',
      source: 'main-app',
      stack: event.reason?.stack || '',
    });
    // 不阻止默认行为，让错误正常显示
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

  // 4. 捕获console.warn/error（主应用）
  const originalWarn = console.warn;
  console.warn = function (...args: any[]) {
    const message = argsToString(args);
    // 过滤不需要监控的警告
    if (!shouldIgnoreMessage(message)) {
      updateErrorList({
        type: 'console-warn',
        message,
        source: 'main-app',
        isWarning: true,
      });
    }
    originalWarn.apply(console, args);
  };
}

