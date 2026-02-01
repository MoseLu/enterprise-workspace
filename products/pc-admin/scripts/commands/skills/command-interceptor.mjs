/**
 * 命令拦截器
 * 在执行特定命令时自动记录相关skill的执行
 */

import { createExecution, completeExecution, createStep, completeStep } from './execution-tracker.mjs';
import { isFirstExecution, generateFirstExecutionQuestions, getHintSuggestions, recordHintFeedback } from './hint-system.mjs';
import { collectFeedback } from './feedback-collector.mjs';
import { recordConversationScenario } from './conversation-analyzer.mjs';
import { logger } from './utils/logger.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * 命令到skill的映射
 */
const COMMAND_SKILL_MAPPING = {
  'dev:all': 'dev-workflow',
  'dev': 'dev-workflow',
  'dev:app': 'dev-workflow',
  'build:all': 'build-guide',
  'build:app': 'build-guide',
  'build-cdn:all': 'build-guide',
  'build-cdn:app': 'build-guide',
  'build-dist:all': 'build-guide',
  'build-dist:app': 'build-guide',
  'build-dist-cdn:all': 'build-guide',
  'build-dist-cdn:app': 'build-guide',
  'build:share': 'build-guide',
  'release:push': 'release-automation',
  'release:version': 'release-automation',
  'check:i18n': 'i18n-toolkit',
  'check:i18n:apps': 'i18n-toolkit',
  'locale:merge': 'i18n-toolkit',
  'locale:merge:all': 'i18n-toolkit',
  'lint:all': 'quality-assurance',
  'lint:app': 'quality-assurance',
  'type-check:all': 'quality-assurance',
  'type-check:app': 'quality-assurance',
  'check:circular': 'quality-assurance',
  'deploy:app': 'deploy-toolkit',
  'deploy:all': 'deploy-toolkit',
  'deploy:static': 'deploy-toolkit',
  'create-app': 'monorepo-quick-start'
};

/**
 * 读取配置
 */
function getConfig() {
  try {
    const configPath = join(process.cwd(), '.claude', 'skills-meta', 'config.json');
    const configContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    return {
      command_interception: {
        enabled: true,
        auto_track: true
      }
    };
  }
}

/**
 * 识别命令对应的skill
 * @param {string} command - 命令名称
 * @returns {string|null} skill名称
 */
export function identifySkillForCommand(command) {
  // 直接映射
  if (COMMAND_SKILL_MAPPING[command]) {
    return COMMAND_SKILL_MAPPING[command];
  }
  
  // 模糊匹配
  for (const [cmd, skill] of Object.entries(COMMAND_SKILL_MAPPING)) {
    if (command.includes(cmd) || cmd.includes(command)) {
      return skill;
    }
  }
  
  return null;
}

/**
 * 包装命令执行，自动记录skill执行
 * @param {string} command - 命令名称
 * @param {function} commandExecutor - 命令执行函数
 * @param {object} options - 选项
 * @returns {Promise} 执行结果
 */
export async function interceptCommand(command, commandExecutor, options = {}) {
  const config = getConfig();
  
  if (!config.command_interception?.enabled) {
    return commandExecutor();
  }
  
  const skillName = identifySkillForCommand(command);
  
  if (!skillName) {
    logger.debug(`[CommandInterceptor] 命令 "${command}" 无对应skill，跳过拦截`);
    return commandExecutor();
  }
  
  logger.info(`[CommandInterceptor] 检测到命令 "${command}" 对应skill: ${skillName}`);
  
  // 创建执行记录
  const executionId = createExecution(skillName, {
    command,
    autoTracked: true,
    ...options.context
  });
  
  let executionResult = null;
  let executionError = null;
  
  try {
    // 检查是否为首次执行
    const isFirst = isFirstExecution(skillName);
    
    // 首次执行时生成询问清单（但不阻塞执行）
    if (isFirst && config.command_interception?.auto_track) {
      const questions = generateFirstExecutionQuestions(skillName);
      logger.debug(`[CommandInterceptor] 首次执行，生成了 ${questions.length} 个询问项`);
      // 注意：这里不实际询问，只是记录，后续可以用于优化
    }
    
    // 记录命令执行步骤
    const stepId = createStep(executionId, `执行命令: ${command}`, 1, 'command_execution', {
      command,
      args: options.args || []
    });
    
    const startTime = Date.now();
    
    // 判断是否为长期运行命令（如dev服务器）
    const isLongRunning = options.longRunning !== false && (
      command.includes('dev') || 
      command.includes('serve') || 
      command.includes('watch')
    );
    
    // 执行命令
    try {
      if (isLongRunning) {
        // 长期运行命令：立即标记为运行中，不等待完成
        completeStep(stepId, {
          status: 'running',
          completion_score: 0.5 // 启动成功但未完成
        });
        
        logger.info(`[CommandInterceptor] 长期运行命令 "${command}" 已启动，skill执行记录已创建`);
        
        // 异步执行，不阻塞
        commandExecutor().then(() => {
          const duration = Date.now() - startTime;
          completeStep(stepId, {
            status: 'completed',
            completion_score: 1.0
          });
          completeExecution(executionId, {
            status: 'completed',
            metrics: {
              duration,
              command,
              success: true,
              longRunning: true
            }
          });
        }).catch((error) => {
          const duration = Date.now() - startTime;
          completeStep(stepId, {
            status: 'failed',
            completion_score: 0.0,
            error_message: error.message
          });
          completeExecution(executionId, {
            status: 'failed',
            metrics: {
              duration,
              command,
              error: error.message,
              success: false,
              longRunning: true
            }
          });
        });
        
        // 返回执行ID，让调用者知道已记录
        return { executionId, longRunning: true };
      } else {
        // 短期命令：等待完成
        executionResult = await commandExecutor();
        completeStep(stepId, {
          status: 'completed',
          completion_score: 1.0
        });
        
        const duration = Date.now() - startTime;
        completeExecution(executionId, {
          status: 'completed',
          metrics: {
            duration,
            command,
            success: true
          }
        });
        
        logger.info(`[CommandInterceptor] 命令执行完成: ${command} (${duration}ms)`);
        return executionResult;
      }
    } catch (error) {
      executionError = error;
      completeStep(stepId, {
        status: 'failed',
        completion_score: 0.0,
        error_message: error.message
      });
      
      const duration = Date.now() - startTime;
      completeExecution(executionId, {
        status: 'failed',
        metrics: {
          duration,
          command,
          error: error.message,
          success: false
        }
      });
      
      logger.error(`[CommandInterceptor] 命令执行失败: ${command}`, error);
      throw error;
    }
  } catch (error) {
    executionError = error;
    completeExecution(executionId, {
      status: 'failed',
      metrics: {
        command,
        error: error.message,
        success: false
      }
    });
    throw error;
  }
}

/**
 * 创建命令包装器
 * @param {string} command - 命令名称
 * @param {function} originalExecutor - 原始执行函数
 * @returns {function} 包装后的执行函数
 */
export function wrapCommand(command, originalExecutor) {
  return async function(...args) {
    return interceptCommand(command, () => originalExecutor(...args), {
      args,
      context: {
        wrapped: true
      }
    });
  };
}

/**
 * 自动记录命令执行（不包装，只记录）
 * @param {string} command - 命令名称
 * @param {object} context - 执行上下文
 * @returns {string} execution_id
 */
export function autoTrackCommand(command, context = {}) {
  const skillName = identifySkillForCommand(command);
  
  if (!skillName) {
    return null;
  }
  
  logger.debug(`[CommandInterceptor] 自动跟踪命令: ${command} -> ${skillName}`);
  
  const executionId = createExecution(skillName, {
    command,
    autoTracked: true,
    ...context
  });
  
  return executionId;
}

/**
 * 完成自动跟踪的命令
 * @param {string} executionId - 执行ID
 * @param {object} result - 执行结果
 */
export function completeAutoTrackedCommand(executionId, result = {}) {
  if (!executionId) {
    return;
  }
  
  completeExecution(executionId, {
    status: result.success !== false ? 'completed' : 'failed',
    metrics: {
      ...result
    }
  });
}
