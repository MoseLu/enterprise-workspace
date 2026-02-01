/**
 * Pino Report Transport
 * 将 pino 日志上报到 LogReporter
 * 注意：这个文件会被 pino 在 worker 线程中加载，所以不能使用 TypeScript
 */

/**
 * Pino Transport 函数
 * @param {Object} options - Transport 选项
 */
export default async function pinoReportTransport(options = {}) {
  const { reporter, appName } = options;

  return {
    /**
     * 写入日志
     * @param {Object} log - Pino 日志对象
     */
    write(log) {
      try {
        // 由于在 worker 线程中，我们需要通过消息传递
        // 但更好的方式是在主线程中直接处理
        // 这里我们使用 process.send（如果可用）或者通过其他机制
        
        // 转换日志格式
        const logEntry = convertPinoLogToLogEntry(log, appName);
        
        // 上报日志（如果 reporter 可用）
        if (reporter && typeof reporter.report === 'function') {
          // 由于在 worker 线程中，我们需要通过消息传递
          // 但 pino transport 实际上是在主线程中执行的
          // 所以我们可以直接调用
          reporter.report(logEntry);
        }
      } catch (error) {
        // 静默处理错误，避免影响主程序
        console.error('[PinoReportTransport] 上报日志失败:', error);
      }
    },
  };
}

/**
 * 将 pino 日志对象转换为 LogEntry
 */
function convertPinoLogToLogEntry(log, appName) {
  // 提取日志级别（pino 使用数字级别）
  const levelMap = {
    10: 'debug',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  };

  const level = levelMap[log.level] || 'info';

  // 提取消息
  const message = log.msg || log.message || '';

  // 提取时间戳（pino 使用秒级时间戳）
  const timestamp = log.time ? new Date(log.time).getTime() : Date.now();

  // 提取错误信息
  let error;
  if (log.err || log.error) {
    const err = log.err || log.error;
    error = {
      name: err.name || 'Error',
      message: err.message || String(err),
      stack: err.stack,
    };
  }

  // 提取上下文信息（除了 pino 内置字段）
  const pinoBuiltInFields = ['level', 'time', 'pid', 'hostname', 'msg', 'message', 'err', 'error', 'v', 'appName'];
  const context = {};
  for (const [key, value] of Object.entries(log)) {
    if (!pinoBuiltInFields.includes(key)) {
      context[key] = value;
    }
  }

  return {
    level,
    message,
    timestamp,
    appName: appName || log.appName || 'unknown',
    loggerName: log.loggerName || log.name || 'pino',
    context: Object.keys(context).length > 0 ? context : undefined,
    error,
  };
}
