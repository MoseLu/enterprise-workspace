/**
 * 统一日志工具
 * 提供统一的构建日志规范（颜色、格式等）
 */

// TypeScript 类型定义（仅用于文档）
// type LogLevel = 'debug' | 'info' | 'warn' | 'error';
// interface LoggerOptions {
//   prefix?: string;
//   enableColors?: boolean;
// }

/**
 * 颜色工具
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * 检查是否支持颜色输出
 */
function supportsColor() {
  // 检查环境变量
  if (process.env.NO_COLOR || process.env.FORCE_COLOR === '0') {
    return false;
  }
  if (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === '2' || process.env.FORCE_COLOR === '3') {
    return true;
  }
  // 检查是否在 TTY 中
  return process.stdout.isTTY === true;
}

/**
 * 创建日志器
 */
function createLogger(options = {}) {
  const { prefix = '', enableColors = supportsColor() } = options;
  const useColors = enableColors && supportsColor();

  const formatMessage = (level, message, ...args) => {
    // 格式化日期为 YYYY-MM-DD HH:mm:ss 格式（本地时区）
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    let formatted = '';

    if (useColors) {
      const levelColors = {
        debug: colors.dim,
        info: colors.cyan,
        warn: colors.yellow,
        error: colors.red,
      };
      formatted = `${colors.dim}[${timestamp}]${colors.reset} ${levelColors[level]}${level.toUpperCase()}${colors.reset}`;
    } else {
      formatted = `[${timestamp}] ${level.toUpperCase()}`;
    }

    if (prefix) {
      formatted += useColors ? ` ${colors.blue}${prefix}${colors.reset}` : ` ${prefix}`;
    }

    formatted += ` ${message}`;

    // 处理额外参数
    if (args.length > 0) {
      const argsStr = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');
      formatted += ` ${argsStr}`;
    }

    return formatted;
  };

  return {
    debug: (message, ...args) => {
      if (process.env.DEBUG || process.env.LOG_LEVEL === 'debug') {
        console.log(formatMessage('debug', message, ...args));
      }
    },

    info: (message, ...args) => {
      console.log(formatMessage('info', message, ...args));
    },

    warn: (message, ...args) => {
      console.warn(formatMessage('warn', message, ...args));
    },

    error: (message, error, ...args) => {
      let errorMessage = message;
      if (error instanceof Error) {
        errorMessage += `\n${error.stack || error.message}`;
      } else if (error) {
        errorMessage += ` ${JSON.stringify(error)}`;
      }
      console.error(formatMessage('error', errorMessage, ...args));
    },

    success: (message, ...args) => {
      const formatted = useColors
        ? `${colors.green}✓${colors.reset} ${message}`
        : `✓ ${message}`;
      console.log(formatted, ...args);
    },

    /**
     * 创建带前缀的子 logger
     */
    child: (childPrefix) => {
      return createLogger({ ...options, prefix: prefix ? `${prefix}:${childPrefix}` : childPrefix });
    },
  };
}

/**
 * 默认 logger 实例
 */
export const logger = createLogger();

/**
 * 导出创建函数
 */
export { createLogger };
