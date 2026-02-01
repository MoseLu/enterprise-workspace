/**
 * 重定向追踪日志工具
 * 将重定向相关的日志写入文件，避免页面刷新后日志丢失
 */

// 日志缓冲区（避免频繁写入文件）
let logBuffer: string[] = [];
let bufferTimer: ReturnType<typeof setTimeout> | null = null;
const BUFFER_SIZE = 50; // 缓冲区大小
const FLUSH_INTERVAL = 2000; // 每2秒刷新一次

/**
 * 获取日志文件路径
 */
function getLogFilePath(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  // 在浏览器环境中，使用 localStorage 存储日志（因为无法直接写入文件系统）
  // 或者使用 IndexedDB 存储
  return 'redirect-log';
}

/**
 * 写入日志到存储
 */
function writeLogToStorage(message: string): void {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // 使用 sessionStorage 存储日志（页面刷新后仍然保留，直到标签页关闭）
    const logKey = '__redirect_trace_log__';
    const existingLogs = sessionStorage.getItem(logKey) || '';
    const newLogs = existingLogs + logEntry;
    
    // 限制日志大小（最多保留 100KB）
    const maxSize = 100 * 1024; // 100KB
    if (newLogs.length > maxSize) {
      // 只保留最新的日志（保留后 50KB）
      const keepSize = 50 * 1024;
      const logs = newLogs.split('\n');
      const recentLogs = logs.slice(-Math.floor(keepSize / 100)); // 假设每行约100字节
      sessionStorage.setItem(logKey, recentLogs.join('\n'));
    } else {
      sessionStorage.setItem(logKey, newLogs);
    }
    
    // 同时输出到控制台（开发环境）
    if (import.meta.env.DEV) {
      console.log(logEntry.trim());
    }
  } catch (error) {
    // 如果存储失败，至少输出到控制台
    console.error('[redirect-logger] 写入日志失败:', error);
    console.log(message);
  }
}

/**
 * 刷新日志缓冲区
 */
function flushLogBuffer(): void {
  if (logBuffer.length === 0) {
    return;
  }
  
  const logs = logBuffer.join('\n');
  logBuffer = [];
  
  writeLogToStorage(logs);
  
  if (bufferTimer) {
    clearTimeout(bufferTimer);
    bufferTimer = null;
  }
}

/**
 * 记录重定向追踪日志
 */
export function logRedirectTrace(message: string, data?: any): void {
  const logMessage = data 
    ? `${message} ${JSON.stringify(data, null, 2)}`
    : message;
  
  // 添加到缓冲区
  logBuffer.push(logMessage);
  
  // 如果缓冲区满了，立即刷新
  if (logBuffer.length >= BUFFER_SIZE) {
    flushLogBuffer();
  } else {
    // 否则设置定时器刷新
    if (!bufferTimer) {
      bufferTimer = setTimeout(flushLogBuffer, FLUSH_INTERVAL);
    }
  }
}

/**
 * 获取所有重定向追踪日志
 */
export function getRedirectTraceLogs(): string {
  try {
    const logKey = '__redirect_trace_log__';
    return sessionStorage.getItem(logKey) || '';
  } catch (error) {
    return '';
  }
}

/**
 * 清除重定向追踪日志
 */
export function clearRedirectTraceLogs(): void {
  try {
    const logKey = '__redirect_trace_log__';
    sessionStorage.removeItem(logKey);
    logBuffer = [];
    if (bufferTimer) {
      clearTimeout(bufferTimer);
      bufferTimer = null;
    }
  } catch (error) {
    // 静默失败
  }
}

/**
 * 导出日志到文件（通过下载）
 */
export function exportRedirectTraceLogs(): void {
  try {
    const logs = getRedirectTraceLogs();
    if (!logs) {
      console.warn('[redirect-logger] 没有日志可导出');
      return;
    }
    
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redirect-trace-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[redirect-logger] 导出日志失败:', error);
  }
}
