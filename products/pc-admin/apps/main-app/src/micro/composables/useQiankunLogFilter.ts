/**
 * Qiankun 日志过滤 Composable
 * 用于过滤 qiankun 和 single-spa 产生的噪音日志
 */

;

/**
 * 检查是否应该过滤日志
 */
function shouldFilter(...args: any[]): boolean {
  // 检查所有参数中是否包含 qiankun sandbox 相关日志
  for (const arg of args) {
    if (typeof arg === 'string') {
      if (
        arg.includes('[qiankun:sandbox]') ||
        arg.includes('modified global properties') ||
        arg.includes('restore...') ||
        arg.includes('[qiankun] globalState tools will be removed in 3.0')
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 初始化日志过滤
 * 关键：在模块加载时立即设置日志过滤，确保能拦截所有警告
 * 这必须在任何其他代码执行之前完成
 */
export function setupQiankunLogFilter(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 防止重复设置
  if ((window as any).__qiankun_logs_filtered__) {
    return;
  }
  (window as any).__qiankun_logs_filtered__ = true;

  // 保存原始方法（如果还没有保存的话）
  // 注意：setupGlobalErrorCapture() 可能已经替换了 console.warn，所以优先使用已保存的原始方法
  if (!(console as any).__originalLog) {
    (console as any).__originalLog = console.log;
  }
  if (!(console as any).__originalInfo) {
    (console as any).__originalInfo = console.info;
  }
  if (!(console as any).__originalWarn) {
    (console as any).__originalWarn = console.warn;
  }
  if (!(console as any).__originalError) {
    (console as any).__originalError = console.error;
  }

  // 使用已保存的原始方法，如果没有则使用当前的（可能是被其他代码替换过的）
  const originalLog = ((console as any).__originalLog || console.log).bind(console);
  const originalInfo = ((console as any).__originalInfo || console.info).bind(console);
  const originalWarn = ((console as any).__originalWarn || console.warn).bind(console);
  const originalError = ((console as any).__originalError || console.error).bind(console);

  // 检查是否是表单验证错误（不打印，但允许上报）
  const isFormValidationError = (...args: any[]): boolean => {
    // 检查是否是 async-validator 的警告格式：console.warn("async-validator:", errorList)
    if (args.length >= 1) {
      const firstArg = args[0];
      // 检查第一个参数是否是 "async-validator:" 字符串
      if (typeof firstArg === 'string' && firstArg.includes('async-validator:')) {
        return true;
      }
      // 检查参数中是否包含 "async-validator:" 字符串
      for (const arg of args) {
        if (typeof arg === 'string' && arg.includes('async-validator:')) {
          return true;
        }
      }
    }
    // 检查参数是否是对象格式 {字段名: Array(...)}
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      const obj = args[0];
      // 检查对象是否包含 Array 类型的值（表单验证错误格式）
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          return true;
        }
      }
    }
    // 检查参数中是否包含数组格式的错误列表（async-validator 的第二个参数通常是数组）
    for (const arg of args) {
      if (Array.isArray(arg) && arg.length > 0) {
        // 如果数组中的元素是字符串，且包含常见的验证错误消息，则认为是表单验证错误
        const firstItem = arg[0];
        if (typeof firstItem === 'string' && (
          firstItem.includes('is required') ||
          firstItem.includes('required') ||
          firstItem.includes('格式') ||
          firstItem.includes('格式不正确') ||
          firstItem.includes('长度') ||
          firstItem.includes('不能为空')
        )) {
          return true;
        }
      }
    }
    return false;
  };

  // 安全地将参数转换为字符串，避免过长的字符串和循环引用
  const safeStringify = (arg: any, maxLength: number = 10000): string => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') {
      return arg.length > maxLength ? arg.substring(0, maxLength) + '...' : arg;
    }
    if (typeof arg === 'object') {
      try {
        const seen = new WeakSet();
        const str = JSON.stringify(arg, (key, value) => {
          // 限制深度，避免循环引用
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        }, 2);
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
      } catch (error) {
        return String(arg).length > maxLength ? String(arg).substring(0, maxLength) + '...' : String(arg);
      }
    }
    const str = String(arg);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  // 限制消息总长度，避免过长的字符串
  const limitMessageLength = (message: string, maxLength: number = 50000): string => {
    return message.length > maxLength ? message.substring(0, maxLength) + '... (truncated)' : message;
  };

  // 过滤 console.log
  console.log = (...args: any[]) => {
    if (shouldFilter(...args)) {
      return;
    }
    // 使用原始方法，避免递归
    try {
      const message = limitMessageLength(args.map(arg => safeStringify(arg)).join(' '));
      originalInfo(message, ...args);
    } catch (error) {
      // 如果转换失败，直接使用原始方法输出
      originalLog(...args);
    }
  };

  // 过滤 console.info
  console.info = (...args: any[]) => {
    if (shouldFilter(...args)) {
      return;
    }
    // 使用原始方法，避免递归
    try {
      const message = limitMessageLength(args.map(arg => safeStringify(arg)).join(' '));
      originalInfo(message, ...args);
    } catch (error) {
      // 如果转换失败，直接使用原始方法输出
      originalInfo(...args);
    }
  };

  // 过滤 console.warn
  console.warn = (...args: any[]) => {
    // 过滤 qiankun sandbox 警告
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 qiankun globalState 警告（将在 3.0 移除，但目前仍在使用）
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.includes('[qiankun] globalState tools will be removed in 3.0')) {
        return;
      }
    }
    // 检查所有参数中是否包含 globalState 警告
    for (const arg of args) {
      if (typeof arg === 'string' && arg.includes('[qiankun] globalState tools will be removed in 3.0')) {
        return;
      }
    }
    // 过滤 single-spa 的警告（这些是正常的，不是错误）
    // 检查多种可能的警告格式
    if (typeof firstArg === 'string') {
      if (
        firstArg.includes('single-spa minified message #31') ||
        firstArg.includes('single-spa minified message #41') ||
        firstArg.includes('single-spa minified message #1') ||
        firstArg.includes('single-spa.js.org/error/?code=31') ||
        firstArg.includes('single-spa.js.org/error/?code=41') ||
        firstArg.includes('single-spa.js.org/error/?code=1') ||
        (firstArg.includes('code=31') && firstArg.includes('bootstrap')) ||
        (firstArg.includes('code=41')) ||
        (firstArg.includes('code=1'))
      ) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 警告
    for (const arg of args) {
      if (
        typeof arg === 'string' &&
        (arg.includes('single-spa minified message #31') ||
          arg.includes('single-spa minified message #41') ||
          arg.includes('single-spa minified message #1') ||
          arg.includes('single-spa.js.org/error/?code=31') ||
          arg.includes('single-spa.js.org/error/?code=41') ||
          arg.includes('single-spa.js.org/error/?code=1') ||
          (arg.includes('code=31') && arg.includes('bootstrap')) ||
          (arg.includes('code=41')) ||
          (arg.includes('code=1')))
      ) {
        return;
      }
      // 过滤 registerSubAppI18n 的函数值警告（这些是正常的，Vue I18n 编译优化导致的）
      if (typeof arg === 'string' && arg.includes('[registerSubAppI18n] Skipping function value')) {
        return;
      }
    }
    // 对于表单验证错误，不打印到控制台，但允许错误监控系统上报
    // 如果是表单验证错误，不打印到控制台，但允许错误监控系统上报
    if (isFormValidationError(...args)) {
      // 直接调用 errorMonitor 的上报方法，不打印到控制台
      import('../../utils/errorMonitor').then(({ updateErrorList }) => {
        const message = args.map((arg) => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'string') return arg;
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        updateErrorList({
          type: 'console-warn',
          message,
          source: 'main-app',
          isWarning: true,
        });
      }).catch(() => {
        // 如果导入失败，静默处理
      });
      return; // 不打印，直接返回
    }
    // 使用原始方法，避免递归
    try {
      const message = limitMessageLength(args.map(arg => safeStringify(arg)).join(' '));
      originalWarn(message, ...args);
    } catch (error) {
      // 如果转换失败，直接使用原始方法输出
      originalWarn(...args);
    }
  };

  // 过滤 console.error（single-spa 错误代码 31 通过 error 输出）
  console.error = (...args: any[]) => {
    // 过滤 qiankun sandbox 错误
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 single-spa 的错误代码（这些是正常的警告，不影响功能）
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (
        firstArg.includes('single-spa minified message #31') ||
        firstArg.includes('single-spa minified message #41') ||
        firstArg.includes('single-spa minified message #1') ||
        firstArg.includes('single-spa.js.org/error/?code=31') ||
        firstArg.includes('single-spa.js.org/error/?code=41') ||
        firstArg.includes('single-spa.js.org/error/?code=1') ||
        (firstArg.includes('code=31') && firstArg.includes('bootstrap')) ||
        (firstArg.includes('code=41')) ||
        (firstArg.includes('code=1'))
      ) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 错误
    for (const arg of args) {
      if (
        typeof arg === 'string' &&
        (arg.includes('single-spa minified message #31') ||
          arg.includes('single-spa minified message #41') ||
          arg.includes('single-spa minified message #1') ||
          arg.includes('single-spa.js.org/error/?code=31') ||
          arg.includes('single-spa.js.org/error/?code=41') ||
          arg.includes('single-spa.js.org/error/?code=1') ||
          (arg.includes('code=31') && arg.includes('bootstrap')) ||
          (arg.includes('code=41')) ||
          (arg.includes('code=1')))
      ) {
        return;
      }
    }
    // 使用原始方法，避免递归
    try {
      const message = limitMessageLength(args.map(arg => safeStringify(arg)).join(' '));
      const errorArg = args.find(arg => arg instanceof Error) || args[1];
      originalError(message, errorArg, ...args);
    } catch (error) {
      // 如果转换失败，直接使用原始方法输出
      originalError(...args);
    }
  };
}

