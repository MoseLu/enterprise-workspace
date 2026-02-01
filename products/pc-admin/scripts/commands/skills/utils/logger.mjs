/**
 * Skills模块日志工具
 * 使用 pino logger，自动上报到日志中心
 */

import { getPinoLogger } from '../../../utils/pino-logger.mjs';

// 创建专用的 pino logger，自动上报日志
export const logger = getPinoLogger({
  name: 'skills',
  appName: 'agent-skill',
  enableReport: true,
  reportMinLevel: 'info',
});
