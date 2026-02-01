/**
 * Pino Transport Worker
 * 在 worker 线程中处理日志上报
 * 注意：这个文件会被 pino 在 worker 线程中加载，所以不能使用 TypeScript
 */

/**
 * Pino Transport Worker 函数
 * @param {Object} options - Transport 选项
 */
export default async function pinoTransportWorker(options = {}) {
  // 由于 worker 线程的限制，我们使用消息传递机制
  // 但实际上，更好的方式是在主线程中直接处理
  // 所以这个 transport 会返回一个简单的转换函数
  
  return {
    async worker(log) {
      // 将 pino 日志对象转换为字符串，通过 process.send 发送（如果可用）
      // 或者直接返回，让主线程处理
      return log;
    },
  };
}
