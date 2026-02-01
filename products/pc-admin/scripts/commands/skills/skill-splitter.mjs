/**
 * Skills拆分系统
 * 将复杂skills拆分为子skills，提高执行效率
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readSkillFile, writeSkillFile, getAllSkills } from './utils/file-helper.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

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
      skill_splitting: {
        enable_splitting: true,
        max_steps_before_split: 10,
        max_duration_before_split: 1800
      }
    };
  }
}

/**
 * 分析skill复杂度
 * @param {string} skillName - skill名称
 * @returns {object} 复杂度分析结果
 */
export function analyzeComplexity(skillName) {
  const db = getDbManager();
  const config = getConfig();
  const splittingConfig = config.skill_splitting || {};
  
  try {
    // 获取最近的执行记录
    const recentExecution = db.prepare(`
      SELECT e.*, COUNT(es.id) as step_count
      FROM executions e
      LEFT JOIN execution_steps es ON e.execution_id = es.execution_id
      WHERE e.skill_name = ?
      ORDER BY e.start_time DESC
      LIMIT 1
    `).get(skillName);
    
    if (!recentExecution) {
      return {
        needsSplit: false,
        reason: '无执行记录'
      };
    }
    
    const stepCount = recentExecution.step_count || 0;
    const duration = recentExecution.end_time 
      ? (recentExecution.end_time - recentExecution.start_time) / 1000
      : 0;
    
    const maxSteps = splittingConfig.max_steps_before_split || 10;
    const maxDuration = splittingConfig.max_duration_before_split || 1800;
    
    const reasons = [];
    if (stepCount > maxSteps) {
      reasons.push(`步骤数过多: ${stepCount} > ${maxSteps}`);
    }
    if (duration > maxDuration) {
      reasons.push(`执行时间过长: ${duration.toFixed(1)}s > ${maxDuration}s`);
    }
    
    return {
      needsSplit: reasons.length > 0,
      reasons,
      stepCount,
      duration,
      executionId: recentExecution.execution_id
    };
  } catch (error) {
    logger.error(`[SkillSplitter] 分析复杂度失败:`, error);
    return {
      needsSplit: false,
      reason: '分析失败: ' + error.message
    };
  }
}

/**
 * 识别可拆分的功能模块
 * @param {string} skillName - skill名称
 * @returns {array} 可拆分的模块列表
 */
export function identifySplittableModules(skillName) {
  const db = getDbManager();
  
  try {
    // 获取执行步骤
    const steps = db.prepare(`
      SELECT es.* FROM execution_steps es
      INNER JOIN executions e ON es.execution_id = e.execution_id
      WHERE e.skill_name = ?
        AND e.start_time = (SELECT MAX(start_time) FROM executions WHERE skill_name = ?)
      ORDER BY es.step_order
    `).all(skillName, skillName);
    
    if (steps.length === 0) {
      return [];
    }
    
    // 根据步骤类型和名称识别模块
    const modules = [];
    let currentModule = null;
    
    for (const step of steps) {
      const stepType = step.step_type || 'general';
      const stepName = step.step_name.toLowerCase();
      
      // 识别模块边界
      if (stepType === 'setup' || stepName.includes('setup') || stepName.includes('初始化')) {
        if (currentModule) modules.push(currentModule);
        currentModule = {
          name: 'setup',
          displayName: '基础设置',
          steps: [step]
        };
      } else if (stepType === 'component' || stepName.includes('component') || stepName.includes('组件')) {
        if (currentModule && currentModule.name !== 'component') {
          modules.push(currentModule);
        }
        if (!currentModule || currentModule.name !== 'component') {
          currentModule = {
            name: 'component',
            displayName: '组件配置',
            steps: []
          };
        }
        currentModule.steps.push(step);
      } else if (stepType === 'service' || stepName.includes('service') || stepName.includes('服务')) {
        if (currentModule && currentModule.name !== 'service') {
          modules.push(currentModule);
        }
        if (!currentModule || currentModule.name !== 'service') {
          currentModule = {
            name: 'service',
            displayName: '服务集成',
            steps: []
          };
        }
        currentModule.steps.push(step);
      } else if (stepType === 'i18n' || stepName.includes('i18n') || stepName.includes('国际化')) {
        if (currentModule && currentModule.name !== 'i18n') {
          modules.push(currentModule);
        }
        if (!currentModule || currentModule.name !== 'i18n') {
          currentModule = {
            name: 'i18n',
            displayName: '国际化配置',
            steps: []
          };
        }
        currentModule.steps.push(step);
      } else {
        if (!currentModule) {
          currentModule = {
            name: 'general',
            displayName: '通用步骤',
            steps: []
          };
        }
        currentModule.steps.push(step);
      }
    }
    
    if (currentModule) {
      modules.push(currentModule);
    }
    
    // 过滤出可以独立成子skill的模块（至少2个步骤）
    return modules.filter(module => module.steps.length >= 2);
  } catch (error) {
    logger.error(`[SkillSplitter] 识别可拆分模块失败:`, error);
    return [];
  }
}

/**
 * 创建子skill
 * @param {string} parentSkillName - 父skill名称
 * @param {object} module - 模块信息
 * @returns {string} 子skill名称
 */
export function createChildSkill(parentSkillName, module) {
  const childSkillName = `${parentSkillName}-${module.name}`;
  const skillsDir = join(process.cwd(), '.claude', 'skills', childSkillName);
  
  try {
    // 创建目录
    mkdirSync(skillsDir, { recursive: true });
    
    // 创建SKILL.md
    const skillContent = `---
name: ${childSkillName}
description: ${parentSkillName} 的 ${module.displayName} 子skill
parent: ${parentSkillName}
---

# ${module.displayName}

## 功能

此skill是 ${parentSkillName} 的子skill，专注于${module.displayName}。

## 步骤

${module.steps.map((step, idx) => `${idx + 1}. ${step.step_name}`).join('\n')}

## 使用方式

此skill通常由父skill ${parentSkillName} 自动调用，也可以独立使用。
`;
    
    writeFileSync(join(skillsDir, 'SKILL.md'), skillContent, 'utf-8');
    
    // 记录父子关系
    const db = getDbManager();
    const metrics = db.prepare('SELECT total_executions FROM skill_metrics WHERE skill_name = ?').get(parentSkillName);
    
    db.prepare(`
      INSERT INTO skill_hierarchy (
        parent_skill_name, child_skill_name, split_reason, execution_count_before_split
      ) VALUES (?, ?, ?, ?)
    `).run(
      parentSkillName,
      childSkillName,
      `步骤数: ${module.steps.length}`,
      metrics ? metrics.total_executions : 0
    );
    
    logger.info(`[SkillSplitter] 子skill已创建: ${childSkillName}`);
    return childSkillName;
  } catch (error) {
    logger.error(`[SkillSplitter] 创建子skill失败:`, error);
    throw error;
  }
}

/**
 * 执行拆分
 * @param {string} skillName - skill名称
 * @returns {object} 拆分结果
 */
export function splitSkill(skillName) {
  logger.info(`[SkillSplitter] 开始拆分skill: ${skillName}`);
  
  // 分析复杂度
  const complexity = analyzeComplexity(skillName);
  if (!complexity.needsSplit) {
    return {
      split: false,
      reason: complexity.reason || '无需拆分'
    };
  }
  
  // 识别可拆分模块
  const modules = identifySplittableModules(skillName);
  if (modules.length === 0) {
    return {
      split: false,
      reason: '未识别到可拆分的模块'
    };
  }
  
  // 创建子skills
  const childSkills = [];
  try {
    for (const module of modules) {
      const childSkillName = createChildSkill(skillName, module);
      childSkills.push(childSkillName);
    }
    
    logger.info(`[SkillSplitter] 拆分完成: ${skillName} -> ${childSkills.length} 个子skills`);
    
    return {
      split: true,
      parentSkill: skillName,
      childSkills,
      modules: modules.map(m => m.displayName)
    };
  } catch (error) {
    logger.error(`[SkillSplitter] 拆分失败:`, error);
    return {
      split: false,
      reason: error.message
    };
  }
}
