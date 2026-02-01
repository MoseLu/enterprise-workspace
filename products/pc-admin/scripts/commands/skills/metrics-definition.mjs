/**
 * 量化评估指标系统
 * 为每个skill类型定义KPI
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
 * Skill类型到KPI的映射
 */
const SKILL_TYPE_METRICS = {
  'package-manager': {
    name: '包管理技能',
    metrics: {
      'circular_dependency_detection_accuracy': {
        name: '循环依赖检测准确率',
        target: 0.95,
        weight: 0.4
      },
      'dependency_conflict_resolution_adoption': {
        name: '依赖冲突解决方案采纳率',
        target: 0.8,
        weight: 0.3
      },
      'package_version_analysis_accuracy': {
        name: '包版本分析准确率',
        target: 0.9,
        weight: 0.3
      }
    }
  },
  'log-analysis': {
    name: '日志分析技能',
    metrics: {
      'anomaly_detection_recall': {
        name: '异常日志识别召回率',
        target: 0.9,
        weight: 0.4
      },
      'fault_localization_accuracy': {
        name: '故障定位准确率',
        target: 0.85,
        weight: 0.4
      },
      'log_pattern_recognition_accuracy': {
        name: '日志模式识别准确率',
        target: 0.88,
        weight: 0.2
      }
    }
  },
  'build-optimization': {
    name: '构建优化技能',
    metrics: {
      'build_time_reduction_ratio': {
        name: '构建时间缩短比例',
        target: 0.2,
        weight: 0.4
      },
      'bundle_size_reduction_ratio': {
        name: '产物体积减少比例',
        target: 0.15,
        weight: 0.3
      },
      'optimization_suggestion_adoption': {
        name: '优化建议采纳率',
        target: 0.7,
        weight: 0.3
      }
    }
  },
  'dev-workflow': {
    name: '开发工作流技能',
    metrics: {
      'server_startup_success_rate': {
        name: '服务器启动成功率',
        target: 0.95,
        weight: 0.5
      },
      'port_conflict_resolution_rate': {
        name: '端口冲突解决率',
        target: 0.9,
        weight: 0.3
      },
      'hot_reload_effectiveness': {
        name: '热重载有效性',
        target: 0.85,
        weight: 0.2
      }
    }
  },
  'build-guide': {
    name: '构建指南技能',
    metrics: {
      'build_success_rate': {
        name: '构建成功率',
        target: 0.9,
        weight: 0.5
      },
      'build_mode_selection_accuracy': {
        name: '构建模式选择准确率',
        target: 0.85,
        weight: 0.3
      },
      'error_resolution_effectiveness': {
        name: '错误解决有效性',
        target: 0.8,
        weight: 0.2
      }
    }
  },
  'default': {
    name: '通用技能',
    metrics: {
      'success_rate': {
        name: '成功率',
        target: 0.8,
        weight: 0.4
      },
      'avg_rating': {
        name: '平均评分',
        target: 4.0,
        weight: 0.3
      },
      'efficiency': {
        name: '效率',
        target: 0.85,
        weight: 0.3
      }
    }
  }
};

/**
 * 获取skill类型
 * @param {string} skillName - skill名称
 * @returns {string} skill类型
 */
export function getSkillType(skillName) {
  // 根据skill名称推断类型
  if (skillName.includes('package') || skillName.includes('dependency')) {
    return 'package-manager';
  }
  if (skillName.includes('log') || skillName.includes('error')) {
    return 'log-analysis';
  }
  if (skillName.includes('build') || skillName.includes('optimization')) {
    return 'build-optimization';
  }
  if (skillName.includes('dev') || skillName.includes('workflow')) {
    return 'dev-workflow';
  }
  if (skillName.includes('build') || skillName.includes('guide')) {
    return 'build-guide';
  }
  return 'default';
}

/**
 * 获取skill的KPI定义
 * @param {string} skillName - skill名称
 * @returns {object} KPI定义
 */
export function getSkillMetrics(skillName) {
  const skillType = getSkillType(skillName);
  return SKILL_TYPE_METRICS[skillType] || SKILL_TYPE_METRICS.default;
}

/**
 * 评估skill指标
 * @param {string} skillName - skill名称
 * @param {object} actualMetrics - 实际指标值
 * @returns {object} 评估结果
 */
export function evaluateSkillMetrics(skillName, actualMetrics) {
  const metricDef = getSkillMetrics(skillName);
  const results = [];
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const [metricKey, metricDef] of Object.entries(metricDef.metrics)) {
    const actualValue = actualMetrics[metricKey];
    if (actualValue === undefined || actualValue === null) {
      continue;
    }
    
    const target = metricDef.target;
    const weight = metricDef.weight;
    const score = actualValue >= target ? 1.0 : actualValue / target;
    
    results.push({
      metric: metricKey,
      name: metricDef.name,
      target,
      actual: actualValue,
      score,
      weight,
      status: score >= 0.9 ? 'excellent' : score >= 0.7 ? 'good' : score >= 0.5 ? 'fair' : 'poor'
    });
    
    totalScore += score * weight;
    totalWeight += weight;
  }
  
  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  return {
    skillName,
    skillType: getSkillType(skillName),
    overallScore,
    results,
    status: overallScore >= 0.9 ? 'excellent' : overallScore >= 0.7 ? 'good' : overallScore >= 0.5 ? 'fair' : 'poor'
  };
}

/**
 * 检查skill指标是否达标
 * @param {string} skillName - skill名称
 * @param {object} actualMetrics - 实际指标值
 * @returns {object} 检查结果
 */
export function checkSkillMetricsThreshold(skillName, actualMetrics) {
  const evaluation = evaluateSkillMetrics(skillName, actualMetrics);
  const belowThreshold = evaluation.results.filter(r => r.score < 0.7);
  
  return {
    passed: belowThreshold.length === 0,
    overallScore: evaluation.overallScore,
    belowThreshold,
    needsImprovement: belowThreshold.length > 0
  };
}
