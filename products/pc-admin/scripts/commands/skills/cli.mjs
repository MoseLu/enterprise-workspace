/**
 * Skills优化系统CLI工具
 */

import { getExecution, getExecutionSteps } from './execution-tracker.mjs';
import { generateHealthReport, analyzeTrends, generateAllHealthReports } from './analyzer.mjs';
import { autoOptimize } from './optimization-engine.mjs';
import { searchIssues } from './shared-issues-center.mjs';
import { splitSkill } from './skill-splitter.mjs';
import { initJudgmentCriteria } from './judgment-criteria.mjs';
import { initDatabase } from './database/init.mjs';
import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { getAllSkills } from './utils/file-helper.mjs';
import { recordConversationScenario, getSkillRelatedConversations } from './conversation-analyzer.mjs';
import { 
  getChildExecutions, 
  getParallelExecutionStats, 
  getActiveChildExecutions,
  getParallelExecutionByChatId
} from './parallel-manager.mjs';
import { getParallelExecutionInfo } from './parallel-executor.mjs';
import { analyzeRootCause } from './root-cause-analyzer.mjs';
import { validateOptimization } from './skill-validator.mjs';
import { 
  rollbackSkillVersion, 
  getSkillVersions, 
  startGradualRollout,
  incrementRollout
} from './version-manager.mjs';
import {
  scheduleWeeklyOptimization,
  triggerThresholdOptimization,
  triggerScenarioOptimization,
  checkAndTriggerOptimizations
} from './iteration-scheduler.mjs';

/**
 * 显示帮助信息
 */
function showHelp() {
  logger.info(`
Skills优化系统CLI工具

用法: node scripts/commands/skills/cli.mjs <command> [options]

命令:
  init                    初始化数据库和判定标准库
  list-executions         列出执行记录
  show-execution <id>     显示执行详情（包括子任务）
  parallel <execution_id> 查看并行执行的子任务信息
  close-chats <execution_id> [--force] 关闭所有子任务 Chat
  record-conversation     记录对话场景（用于优化分析）
  conversations <skill>   查看skill相关的对话场景
  analyze <skill>         生成skill健康度报告
  analyze-all             生成所有skills的健康度报告
  trends <skill> [days]   分析执行趋势
  optimize <skill>        手动触发优化
  split <skill>           拆分复杂skill
  issues [search]         搜索共享问题
  dev-errors [options]   查看开发错误记录
  dev-errors:resolve <id> 标记错误为已解决
  analyze-root-cause <skill> 分析问题根源
  validate-optimization <optimization-id> 验证优化效果
  rollback-skill <skill> [version] 回滚技能版本
  schedule-optimization [--skill=<name>] [--trigger=<type>] 调度优化任务
  view-versions <skill>   查看技能版本历史
  gradual-rollout <skill> <version> [--percentage=<n>] 灰度发布
  help                    显示此帮助信息

示例:
  node scripts/commands/skills/cli.mjs init
  node scripts/commands/skills/cli.mjs analyze build-guide
  node scripts/commands/skills/cli.mjs optimize build-guide
  node scripts/commands/skills/cli.mjs issues 构建错误
  node scripts/commands/skills/cli.mjs analyze-root-cause build-guide
  node scripts/commands/skills/cli.mjs view-versions build-guide
  node scripts/commands/skills/cli.mjs schedule-optimization --trigger=threshold
`);
}

/**
 * 列出执行记录
 */
function listExecutions(skillName = null) {
  const db = getDbManager();
  
  try {
    let sql = `
      SELECT execution_id, skill_name, status, start_time, end_time, 
             inferred_rating, explicit_rating, iterations
      FROM executions
    `;
    const params = [];
    
    if (skillName) {
      sql += ' WHERE skill_name = ?';
      params.push(skillName);
    }
    
    sql += ' ORDER BY start_time DESC LIMIT 20';
    
    const executions = db.prepare(sql).all(...params);
    
    if (executions.length === 0) {
      logger.info('暂无执行记录');
      return;
    }
    
    logger.info('\n执行记录:');
    logger.info('─'.repeat(100));
    for (const exec of executions) {
      const duration = exec.end_time 
        ? ((exec.end_time - exec.start_time) / 1000).toFixed(1) + 's'
        : '进行中';
      const rating = exec.explicit_rating || exec.inferred_rating || 'N/A';
      logger.info(`${exec.execution_id.substring(0, 20)}... | ${exec.skill_name.padEnd(20)} | ${exec.status.padEnd(10)} | ${duration.padEnd(8)} | 评分: ${rating} | 迭代: ${exec.iterations || 0}`);
    }
  } catch (error) {
    logger.error('列出执行记录失败:', error);
  }
}

/**
 * 显示并行执行信息
 */
function showParallelExecution(parentExecutionId) {
  const info = getParallelExecutionInfo(parentExecutionId);
  
  if (info.total === 0) {
    logger.info('该执行没有并行子任务');
    return;
  }
  
  logger.info('\n并行执行信息:');
  logger.info('═'.repeat(80));
  logger.info(`父级执行 ID: ${parentExecutionId}`);
  logger.info(`子任务总数: ${info.total}`);
  logger.info(`\n状态统计:`);
  logger.info(`  已打开: ${info.stats.opened || 0}`);
  logger.info(`  进行中: ${info.stats.started || 0}`);
  logger.info(`  已完成: ${info.stats.completed || 0}`);
  logger.info(`  已关闭: ${info.stats.closed || 0}`);
  logger.info(`  失败: ${info.stats.failed || 0}`);
  logger.info(`  已取消: ${info.stats.cancelled || 0}`);
  
  logger.info(`\n所有子任务:`);
  logger.info('─'.repeat(80));
  for (const child of info.all) {
    const statusIcon = {
      'opened': '📝',
      'started': '🔄',
      'completed': '✅',
      'failed': '❌',
      'cancelled': '🚫',
      'closed': '🔒'
    }[child.status] || '❓';
    
    logger.info(`${statusIcon} ${child.child_skill_name.padEnd(20)} | Chat ID: ${child.chat_id || 'N/A'}`);
    logger.info(`  任务: ${child.task_description}`);
    if (child.child_execution_id) {
      logger.info(`  执行 ID: ${child.child_execution_id}`);
    }
    if (child.process_info) {
      const processInfo = typeof child.process_info === 'string' ? JSON.parse(child.process_info) : child.process_info;
      logger.info(`  进程信息: ${JSON.stringify(processInfo)}`);
    }
    logger.info(`  状态: ${child.status} | 打开时间: ${new Date(child.opened_at * 1000).toLocaleString()}`);
    if (child.completed_at) {
      logger.info(`  完成时间: ${new Date(child.completed_at * 1000).toLocaleString()}`);
    }
    logger.info('');
  }
  
  if (info.active.length > 0) {
    logger.info(`\n活跃子任务 (${info.active.length}):`);
    for (const active of info.active) {
      logger.info(`  - ${active.child_skill_name} (Chat ID: ${active.chat_id})`);
    }
  }
  
  logger.info(`\n所有 Chat ID: ${info.chatIds.join(', ')}`);
}

/**
 * 列出开发错误
 */
function listDevErrors(args = []) {
  const db = getDbManager();
  
  try {
    // 解析参数
    const options = {
      severity: null,
      package: null,
      unresolved: false,
      limit: 20
    };
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--severity' && args[i + 1]) {
        options.severity = args[++i];
      } else if (arg === '--package' && args[i + 1]) {
        options.package = args[++i];
      } else if (arg === '--unresolved') {
        options.unresolved = true;
      } else if (arg === '--limit' && args[i + 1]) {
        options.limit = parseInt(args[++i], 10);
      }
    }
    
    let sql = 'SELECT * FROM dev_errors WHERE 1=1';
    const params = [];
    
    if (options.severity) {
      sql += ' AND severity = ?';
      params.push(options.severity);
    }
    
    if (options.package) {
      sql += ' AND package_name LIKE ?';
      params.push(`%${options.package}%`);
    }
    
    if (options.unresolved) {
      sql += ' AND resolved = 0';
    }
    
    sql += ' ORDER BY last_seen_at DESC, occurrence_count DESC';
    sql += ' LIMIT ?';
    params.push(options.limit);
    
    const errors = db.prepare(sql).all(...params);
    
    if (errors.length === 0) {
      logger.info('暂无错误记录');
      return;
    }
    
    logger.info('\n开发错误记录:');
    logger.info('─'.repeat(100));
    
    for (const error of errors) {
      const severityIcon = {
        'critical': '🔴',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
      }[error.severity] || '❓';
      
      const resolvedIcon = error.resolved ? '✅' : '⏳';
      const reportedIcon = error.reported_to_cursor ? '📤' : '📥';
      
      logger.info(`${severityIcon} [ID: ${error.id}] ${resolvedIcon} ${reportedIcon} ${error.severity.toUpperCase()}`);
      logger.info(`   类型: ${error.error_type || 'unknown'}`);
      if (error.package_name) {
        logger.info(`   工作空间: ${error.package_name}`);
      }
      if (error.file_path) {
        logger.info(`   文件: ${error.file_path}${error.line_number ? `:${error.line_number}` : ''}`);
      }
      logger.info(`   出现次数: ${error.occurrence_count}`);
      logger.info(`   错误信息: ${error.error_message.substring(0, 100)}${error.error_message.length > 100 ? '...' : ''}`);
      logger.info(`   首次出现: ${new Date(error.first_seen_at * 1000).toLocaleString()}`);
      logger.info(`   最后出现: ${new Date(error.last_seen_at * 1000).toLocaleString()}`);
      logger.info('');
    }
    
    // 显示统计信息
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as errors,
        SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warnings,
        SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN reported_to_cursor = 1 THEN 1 ELSE 0 END) as reported
      FROM dev_errors
    `).get();
    
    logger.info('统计信息:');
    logger.info(`  总计: ${stats.total} 个错误`);
    logger.info(`  严重: ${stats.critical} 个，错误: ${stats.errors} 个，警告: ${stats.warnings} 个`);
    logger.info(`  已解决: ${stats.resolved} 个，已上报: ${stats.reported} 个`);
  } catch (error) {
    logger.error('列出开发错误失败:', error);
  }
}

/**
 * 标记错误为已解决
 */
function resolveDevError(errorId, solution = null) {
  const db = getDbManager();
  
  try {
    const error = db.prepare('SELECT * FROM dev_errors WHERE id = ?').get(errorId);
    
    if (!error) {
      logger.error(`错误: 找不到ID为 ${errorId} 的错误记录`);
      return;
    }
    
    db.prepare(`
      UPDATE dev_errors SET
        resolved = 1,
        resolved_at = strftime('%s', 'now'),
        solution = ?,
        updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(solution || null, errorId);
    
    logger.info(`✅ 错误 [ID: ${errorId}] 已标记为已解决`);
    if (solution) {
      logger.info(`   解决方案: ${solution}`);
    }
  } catch (error) {
    logger.error('标记错误解决失败:', error);
  }
}

/**
 * 显示执行详情
 */
function showExecution(executionId) {
  const execution = getExecution(executionId);
  if (!execution) {
    logger.info('执行记录不存在');
    return;
  }
  
  logger.info('\n执行详情:');
  logger.info('═'.repeat(80));
  logger.info('─'.repeat(100));
  logger.info(`执行ID: ${execution.execution_id}`);
  logger.info(`Skill: ${execution.skill_name}`);
  logger.info(`状态: ${execution.status}`);
  logger.info(`开始时间: ${new Date(execution.start_time).toLocaleString()}`);
  if (execution.end_time) {
    logger.info(`结束时间: ${new Date(execution.end_time).toLocaleString()}`);
    logger.info(`耗时: ${((execution.end_time - execution.start_time) / 1000).toFixed(2)}秒`);
  }
  logger.info(`迭代次数: ${execution.iterations || 0}`);
  logger.info(`评分: ${execution.explicit_rating || execution.inferred_rating || 'N/A'}`);
  
  const steps = getExecutionSteps(executionId);
  if (steps.length > 0) {
    logger.info(`\n步骤 (${steps.length}):`);
    for (const step of steps) {
      const stepDuration = step.end_time 
        ? ((step.end_time - step.start_time) / 1000).toFixed(1) + 's'
        : '进行中';
      logger.info(`  ${step.step_order}. ${step.step_name} [${step.status}] ${stepDuration} (评分: ${step.completion_score || 'N/A'})`);
    }
  }
  
  // 显示并行执行的子任务信息
  const parallelInfo = getParallelExecutionInfo(executionId);
  if (parallelInfo.total > 0) {
    logger.info(`\n并行子任务 (${parallelInfo.total}):`);
    logger.info('─'.repeat(100));
    for (const child of parallelInfo.all) {
      const statusIcon = {
        'opened': '📝',
        'started': '🔄',
        'completed': '✅',
        'failed': '❌',
        'cancelled': '🚫',
        'closed': '🔒'
      }[child.status] || '❓';
      
      logger.info(`  ${statusIcon} ${child.child_skill_name.padEnd(20)} | Chat ID: ${child.chat_id || 'N/A'} | 状态: ${child.status}`);
      if (child.child_execution_id) {
        logger.info(`    执行 ID: ${child.child_execution_id}`);
      }
    }
    logger.info(`\n所有 Chat ID: ${parallelInfo.chatIds.join(', ')}`);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  try {
    switch (command) {
      case 'init':
        logger.info('初始化数据库...');
        initDatabase();
        logger.info('初始化判定标准库...');
        initJudgmentCriteria();
        logger.info('初始化完成！');
        break;
        
      case 'list-executions':
        listExecutions(args[1] || null);
        break;
        
      case 'show-execution':
        if (!args[1]) {
          logger.error('错误: 请提供执行ID');
          return;
        }
        showExecution(args[1]);
        break;
        
      case 'parallel':
        if (!args[1]) {
          logger.error('错误: 请提供父级执行ID');
          return;
        }
        showParallelExecution(args[1]);
        break;
        
      case 'close-chats':
        if (!args[1]) {
          logger.error('错误: 请提供父级执行ID');
          return;
        }
        const { closeAllChildChats } = await import('./parallel-manager.mjs');
        const closeResult = closeAllChildChats(args[1], args[2] === '--force');
        logger.info(`\n${closeResult.message}`);
        logger.info(`已关闭 ${closeResult.closed} 个子任务 Chat`);
        if (closeResult.chatIds.length > 0) {
          logger.info(`Chat IDs: ${closeResult.chatIds.join(', ')}`);
        }
        break;
        
      case 'record-conversation':
        if (!args[1]) {
          logger.error('错误: 请提供用户查询');
          return;
        }
        const convId = recordConversationScenario(args[1], args[2] || null);
        logger.info(`对话场景已记录: ${convId}`);
        break;
        
      case 'conversations':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        const conversations = getSkillRelatedConversations(args[1], 20);
        logger.info(`\n${args[1]} 相关的对话场景 (${conversations.length}):`);
        for (const conv of conversations) {
          logger.info(`\n[${conv.conversation_id}] ${conv.scenario_type}`);
          logger.info(`用户: ${conv.user_query.substring(0, 100)}...`);
          if (conv.optimization_suggestions) {
            const suggestions = typeof conv.optimization_suggestions === 'string' 
              ? JSON.parse(conv.optimization_suggestions)
              : conv.optimization_suggestions;
            if (Array.isArray(suggestions) && suggestions.length > 0) {
              logger.info(`优化建议: ${suggestions.length}条`);
            }
          }
        }
        break;
        
      case 'analyze':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        const report = generateHealthReport(args[1]);
        logger.info('\n健康度报告:');
        logger.info(JSON.stringify(report, null, 2));
        break;
        
      case 'analyze-all':
        const reports = generateAllHealthReports();
        logger.info('\n所有Skills健康度报告:');
        for (const report of reports) {
          logger.info(`\n${report.skillName}: ${report.status} (${report.healthScore || 'N/A'})`);
        }
        break;
        
      case 'trends':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        const days = parseInt(args[2]) || 30;
        const trends = analyzeTrends(args[1], days);
        logger.info('\n执行趋势:');
        logger.info(JSON.stringify(trends, null, 2));
        break;
        
      case 'optimize':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        logger.info(`开始优化: ${args[1]}`);
        const result = autoOptimize(args[1]);
        logger.info('优化结果:', JSON.stringify(result, null, 2));
        break;
        
      case 'split':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        logger.info(`开始拆分: ${args[1]}`);
        const splitResult = splitSkill(args[1]);
        logger.info('拆分结果:', JSON.stringify(splitResult, null, 2));
        break;
        
      case 'issues':
        const searchTerm = args[1] || null;
        const issues = searchIssues({ search: searchTerm, limit: 20 });
        logger.info('\n共享问题:');
        for (const issue of issues) {
          logger.info(`[${issue.issue_type}] ${issue.description} (引用: ${issue.reference_count})`);
        }
        break;
        
      case 'dev-errors':
        listDevErrors(args.slice(1));
        break;
        
      case 'dev-errors:resolve':
        if (!args[1]) {
          logger.error('错误: 请提供错误ID');
          return;
        }
        resolveDevError(parseInt(args[1], 10), args[2] || null);
        break;
        
      case 'analyze-root-cause':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        const rootCauseResult = analyzeRootCause(args[1]);
        logger.info('\n根因分析结果:');
        logger.info(JSON.stringify(rootCauseResult, null, 2));
        break;
        
      case 'validate-optimization':
        if (!args[1]) {
          logger.error('错误: 请提供优化ID');
          return;
        }
        const validationResult = validateOptimization(args[1]);
        logger.info('\n验证结果:');
        logger.info(JSON.stringify(validationResult, null, 2));
        break;
        
      case 'rollback-skill':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        const rollbackResult = rollbackSkillVersion(args[1], args[2] || null);
        logger.info('\n回滚结果:');
        logger.info(JSON.stringify(rollbackResult, null, 2));
        break;
        
      case 'schedule-optimization':
        const skillArg = args.find(arg => arg.startsWith('--skill='));
        const triggerArg = args.find(arg => arg.startsWith('--trigger='));
        const skillName = skillArg ? skillArg.split('=')[1] : null;
        const triggerType = triggerArg ? triggerArg.split('=')[1] : 'all';
        
        let scheduleResult;
        if (triggerType === 'threshold') {
          if (!skillName) {
            logger.error('错误: 阈值触发需要指定skill名称');
            return;
          }
          scheduleResult = triggerThresholdOptimization(skillName);
        } else if (triggerType === 'scenario') {
          if (!skillName) {
            logger.error('错误: 场景触发需要指定skill名称');
            return;
          }
          const scenarioArg = args.find(arg => arg.startsWith('--scenario='));
          const scenario = scenarioArg ? scenarioArg.split('=')[1] : null;
          if (!scenario) {
            logger.error('错误: 场景触发需要指定场景类型');
            return;
          }
          scheduleResult = triggerScenarioOptimization(skillName, scenario);
        } else if (triggerType === 'scheduled') {
          scheduleResult = scheduleWeeklyOptimization(skillName);
        } else {
          scheduleResult = checkAndTriggerOptimizations({
            includeScheduled: true
          });
        }
        logger.info('\n调度结果:');
        logger.info(JSON.stringify(scheduleResult, null, 2));
        break;
        
      case 'view-versions':
        if (!args[1]) {
          logger.error('错误: 请提供skill名称');
          return;
        }
        const versions = getSkillVersions(args[1]);
        logger.info(`\n${args[1]} 版本历史 (${versions.length}个):`);
        logger.info('─'.repeat(80));
        for (const version of versions) {
          const activeIcon = version.is_active ? '✓' : ' ';
          logger.info(`${activeIcon} v${version.version} | ${version.change_summary || '无描述'}`);
          logger.info(`  创建时间: ${new Date(version.created_at * 1000).toLocaleString()}`);
          if (version.rollout_percentage < 100) {
            logger.info(`  灰度比例: ${version.rollout_percentage}%`);
          }
          logger.info('');
        }
        break;
        
      case 'gradual-rollout':
        if (!args[1] || !args[2]) {
          logger.error('错误: 请提供skill名称和版本号');
          return;
        }
        const percentageArg = args.find(arg => arg.startsWith('--percentage='));
        const percentage = percentageArg ? parseInt(percentageArg.split('=')[1], 10) : 10;
        const rolloutResult = startGradualRollout(args[1], args[2], percentage);
        logger.info('\n灰度发布结果:');
        logger.info(JSON.stringify(rolloutResult, null, 2));
        break;
        
      default:
        logger.warn(`未知命令: ${command}`);
        showHelp();
    }
  } catch (error) {
    logger.error('执行命令失败:', error);
    logger.error('错误:', error.message);
  } finally {
    // 清理资源
    process.exit(0);
  }
}

main();
