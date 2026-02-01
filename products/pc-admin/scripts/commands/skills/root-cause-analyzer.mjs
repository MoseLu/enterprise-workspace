/**
 * 根因分析引擎
 * 自动分析skill执行失败或表现不佳的根本原因
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { checkSkillMetricsThreshold, getSkillType } from './metrics-definition.mjs';

/**
 * 读取配置
 */
function getConfig() {
  try {
    const configPath = join(process.cwd(), '.claude', 'skills-meta', 'config.json');
    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    }
  } catch (error) {
    // 忽略配置读取错误
  }
  return {};
}

/**
 * 分析技能规则缺陷
 * @param {string} skillName - skill名称
 * @param {array} errors - 错误列表
 * @returns {array} 规则缺陷列表
 */
function analyzeRuleDefects(skillName, errors) {
  const defects = [];
  const skillType = getSkillType(skillName);
  
  // 分析错误模式，识别规则缺陷
  for (const error of errors) {
    const errorMessage = error.error_message || '';
    const errorType = error.error_type || '';
    
    // 检测常见的规则缺陷模式
    if (skillType === 'package-manager') {
      // 包管理技能的规则缺陷
      if (errorMessage.includes('workspace:*') || errorMessage.includes('workspace protocol')) {
        defects.push({
          type: 'rule_defect',
          category: 'workspace_dependency_rule',
          description: '未考虑 pnpm workspace 的 workspace:* 版本依赖规则',
          confidence: 0.8,
          solution: '更新技能规则，支持 workspace:* 依赖检测'
        });
      }
      
      if (errorMessage.includes('peerDependencies') || errorMessage.includes('peer dependencies')) {
        defects.push({
          type: 'rule_defect',
          category: 'peer_dependencies_rule',
          description: '未考虑 peerDependencies 冲突检测',
          confidence: 0.75,
          solution: '添加 peerDependencies 校验规则'
        });
      }
    }
    
    if (skillType === 'log-analysis') {
      // 日志分析技能的规则缺陷
      if (errorMessage.includes('qiankun') || errorMessage.includes('sandbox')) {
        defects.push({
          type: 'rule_defect',
          category: 'microfrontend_sandbox_rule',
          description: '无法识别 qiankun 沙箱隔离导致的跨应用异常日志',
          confidence: 0.85,
          solution: '添加微前端沙箱环境的日志识别规则'
        });
      }
    }
  }
  
  return defects;
}

/**
 * 分析场景适配不足
 * @param {string} skillName - skill名称
 * @param {array} errors - 错误列表
 * @param {array} projectStates - 项目状态列表
 * @returns {array} 场景适配问题列表
 */
function analyzeScenarioAdaptation(skillName, errors, projectStates) {
  const issues = [];
  const skillType = getSkillType(skillName);
  
  // 分析项目状态，识别场景适配问题
  for (const state of projectStates) {
    const packageVersions = state.package_versions ? JSON.parse(state.package_versions) : {};
    const buildConfig = state.build_config ? JSON.parse(state.build_config) : {};
    
    // 检测微前端场景
    if (buildConfig.has_vite_config && packageVersions.project_version) {
      // 检查是否在微前端环境中
      const isMicrofrontend = packageVersions.project_version.includes('monorepo') || 
                             buildConfig.config_type === 'vite';
      
      if (isMicrofrontend && skillType === 'log-analysis') {
        // 检查是否有qiankun相关的错误
        const hasQiankunError = errors.some(e => 
          e.error_message?.includes('qiankun') || 
          e.error_message?.includes('microfrontend')
        );
        
        if (hasQiankunError) {
          issues.push({
            type: 'scenario_adaptation',
            category: 'microfrontend_nesting',
            description: '无法处理微前端子应用嵌套场景',
            confidence: 0.8,
            solution: '添加微前端嵌套层级的适配逻辑',
            scenario_tags: ['microfrontend', 'qiankun', 'nested_apps']
          });
        }
      }
    }
    
    // 检测monorepo场景
    if (packageVersions.package_manager === 'pnpm') {
      const hasMonorepoError = errors.some(e =>
        e.error_message?.includes('workspace') ||
        e.error_message?.includes('monorepo')
      );
      
      if (hasMonorepoError && skillType === 'package-manager') {
        issues.push({
          type: 'scenario_adaptation',
          category: 'monorepo_package_structure',
          description: '无法处理 monorepo 包划分策略变化',
          confidence: 0.75,
          solution: '添加 monorepo 包结构动态检测',
          scenario_tags: ['monorepo', 'pnpm', 'workspace']
        });
      }
    }
  }
  
  return issues;
}

/**
 * 分析输入数据缺失
 * @param {string} skillName - skill名称
 * @param {array} errors - 错误列表
 * @param {object} executionContext - 执行上下文
 * @returns {array} 数据缺失问题列表
 */
function analyzeInputDataMissing(skillName, errors, executionContext) {
  const issues = [];
  const skillType = getSkillType(skillName);
  
  // 分析错误，识别数据缺失问题
  for (const error of errors) {
    const errorMessage = error.error_message || '';
    
    if (skillType === 'log-analysis') {
      // 日志分析技能需要性能指标数据
      if (errorMessage.includes('performance') || errorMessage.includes('metrics')) {
        issues.push({
          type: 'input_data_missing',
          category: 'performance_metrics',
          description: '缺少微前端子应用的性能指标数据',
          confidence: 0.7,
          solution: '集成性能监控数据源',
          required_data: ['performance_metrics', 'subapp_performance']
        });
      }
    }
    
    if (skillType === 'build-optimization') {
      // 构建优化技能需要构建历史数据
      if (errorMessage.includes('history') || errorMessage.includes('baseline')) {
        issues.push({
          type: 'input_data_missing',
          category: 'build_history',
          description: '缺少构建历史数据用于对比分析',
          confidence: 0.65,
          solution: '收集并存储构建历史数据',
          required_data: ['build_history', 'previous_build_metrics']
        });
      }
    }
  }
  
  return issues;
}

/**
 * 执行根因分析
 * @param {string} skillName - skill名称
 * @param {object} options - 选项
 * @returns {object} 分析结果
 */
export function analyzeRootCause(skillName, options = {}) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.root_cause_analysis?.enable_auto_attribution) {
    return {
      enabled: false,
      message: '根因分析未启用'
    };
  }
  
  try {
    // 获取最近的执行记录和错误
    const recentExecutions = db.prepare(`
      SELECT execution_id, status, start_time, end_time
      FROM executions
      WHERE skill_name = ?
      ORDER BY start_time DESC
      LIMIT 20
    `).all(skillName);
    
    if (recentExecutions.length === 0) {
      return {
        skillName,
        analysis: [],
        message: '暂无执行记录'
      };
    }
    
    const executionIds = recentExecutions.map(e => e.execution_id);
    const placeholders = executionIds.map(() => '?').join(',');
    
    // 获取错误信息
    const errors = db.prepare(`
      SELECT * FROM execution_errors
      WHERE execution_id IN (${placeholders})
    `).all(...executionIds);
    
    // 获取项目状态
    const projectStates = db.prepare(`
      SELECT * FROM project_state_snapshots
      WHERE execution_id IN (${placeholders})
    `).all(...executionIds);
    
    // 获取执行上下文
    const executionContext = recentExecutions[0] || {};
    
    // 执行三类分析
    const ruleDefects = analyzeRuleDefects(skillName, errors);
    const scenarioIssues = analyzeScenarioAdaptation(skillName, errors, projectStates);
    const dataMissingIssues = analyzeInputDataMissing(skillName, errors, executionContext);
    
    // 合并分析结果
    const allIssues = [
      ...ruleDefects,
      ...scenarioIssues,
      ...dataMissingIssues
    ];
    
    // 按置信度排序
    allIssues.sort((a, b) => b.confidence - a.confidence);
    
    // 过滤低置信度的结果
    const minConfidence = config.root_cause_analysis?.min_confidence_threshold || 0.7;
    const filteredIssues = allIssues.filter(issue => issue.confidence >= minConfidence);
    
    logger.info(`[RootCauseAnalyzer] 根因分析完成: ${skillName}, 发现问题=${filteredIssues.length}`);
    
    return {
      skillName,
      analysis: filteredIssues,
      summary: {
        totalIssues: filteredIssues.length,
        ruleDefects: ruleDefects.length,
        scenarioIssues: scenarioIssues.length,
        dataMissingIssues: dataMissingIssues.length
      },
      recommendations: generateRecommendations(filteredIssues)
    };
  } catch (error) {
    logger.error(`[RootCauseAnalyzer] 根因分析失败:`, error);
    return {
      skillName,
      error: error.message,
      analysis: []
    };
  }
}

/**
 * 生成优化建议
 * @param {array} issues - 问题列表
 * @returns {array} 建议列表
 */
function generateRecommendations(issues) {
  const recommendations = [];
  
  // 按类型分组
  const byType = {
    rule_defect: [],
    scenario_adaptation: [],
    input_data_missing: []
  };
  
  for (const issue of issues) {
    if (byType[issue.type]) {
      byType[issue.type].push(issue);
    }
  }
  
  // 生成建议
  if (byType.rule_defect.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'rule_update',
      description: `发现 ${byType.rule_defect.length} 个规则缺陷，建议更新技能规则库`,
      actions: byType.rule_defect.map(d => d.solution)
    });
  }
  
  if (byType.scenario_adaptation.length > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'scenario_enhancement',
      description: `发现 ${byType.scenario_adaptation.length} 个场景适配问题，建议增强场景支持`,
      actions: byType.scenario_adaptation.map(s => s.solution)
    });
  }
  
  if (byType.input_data_missing.length > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'data_integration',
      description: `发现 ${byType.input_data_missing.length} 个数据缺失问题，建议集成数据源`,
      actions: byType.input_data_missing.map(d => d.solution)
    });
  }
  
  return recommendations;
}

/**
 * 保存问题模式到知识库
 * @param {string} skillName - skill名称
 * @param {array} issues - 问题列表
 */
export function saveIssuePatterns(skillName, issues) {
  const db = getDbManager();
  
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO issue_patterns (
        pattern_id, skill_name, issue_type, pattern_description,
        root_cause, solution, scenario_tags, confidence_score, last_matched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
    for (const issue of issues) {
      const patternId = `${skillName}_${issue.category}_${Date.now()}`;
      const scenarioTags = issue.scenario_tags ? JSON.stringify(issue.scenario_tags) : null;
      
      stmt.run(
        patternId,
        skillName,
        issue.type,
        issue.description,
        JSON.stringify(issue),
        issue.solution,
        scenarioTags,
        issue.confidence
      );
    }
    
    logger.info(`[RootCauseAnalyzer] 问题模式已保存: ${skillName}, 模式数=${issues.length}`);
  } catch (error) {
    logger.error(`[RootCauseAnalyzer] 保存问题模式失败:`, error);
  }
}
