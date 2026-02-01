/**
 * 分析报告系统
 * 生成skills健康度报告、优化建议、执行趋势分析
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { checkOptimizationNeeded, analyzeOptimizationOpportunities } from './optimization-engine.mjs';

/**
 * 生成skill健康度报告
 * @param {string} skillName - skill名称
 * @returns {object} 健康度报告
 */
export function generateHealthReport(skillName) {
  const db = getDbManager();
  
  try {
    const metrics = db.prepare('SELECT * FROM skill_metrics WHERE skill_name = ?').get(skillName);
    
    if (!metrics) {
      return {
        skillName,
        status: 'no_data',
        message: '暂无执行记录'
      };
    }
    
    // 计算健康度评分（0-100）
    let healthScore = 100;
    
    // 成功率权重：40%
    const successRateScore = metrics.success_rate * 100;
    healthScore = healthScore * 0.6 + successRateScore * 0.4;
    
    // 平均评分权重：30%
    const ratingScore = (metrics.avg_rating / 5) * 100;
    healthScore = healthScore * 0.7 + ratingScore * 0.3;
    
    // 迭代次数权重：20%（迭代越少越好）
    const iterationScore = Math.max(0, 100 - (metrics.avg_iterations - 1) * 20);
    healthScore = healthScore * 0.8 + iterationScore * 0.2;
    
    // 执行时间权重：10%（时间越短越好，但需要合理范围）
    const durationScore = metrics.avg_duration < 60 ? 100 : Math.max(0, 100 - (metrics.avg_duration - 60) / 10);
    healthScore = healthScore * 0.9 + durationScore * 0.1;
    
    // 确定健康状态
    let status = 'excellent';
    if (healthScore < 60) {
      status = 'poor';
    } else if (healthScore < 75) {
      status = 'fair';
    } else if (healthScore < 90) {
      status = 'good';
    }
    
    // 获取优化建议
    const optimizationCheck = checkOptimizationNeeded(skillName);
    const opportunities = analyzeOptimizationOpportunities(skillName);
    
    return {
      skillName,
      status,
      healthScore: Math.round(healthScore),
      metrics: {
        totalExecutions: metrics.total_executions,
        successRate: (metrics.success_rate * 100).toFixed(1) + '%',
        avgRating: metrics.avg_rating.toFixed(2),
        avgIterations: metrics.avg_iterations.toFixed(2),
        avgDuration: metrics.avg_duration.toFixed(1) + 's',
        lastOptimized: metrics.last_optimized_at 
          ? new Date(metrics.last_optimized_at * 1000).toISOString()
          : '从未优化'
      },
      needsOptimization: optimizationCheck.needed,
      optimizationReasons: optimizationCheck.reasons || [],
      optimizationOpportunities: opportunities,
      recommendations: generateRecommendations(metrics, opportunities)
    };
  } catch (error) {
    logger.error(`[Analyzer] 生成健康度报告失败:`, error);
    return {
      skillName,
      status: 'error',
      error: error.message
    };
  }
}

/**
 * 生成建议
 */
function generateRecommendations(metrics, opportunities) {
  const recommendations = [];
  
  if (metrics.success_rate < 0.8) {
    recommendations.push('成功率较低，建议分析失败原因并优化指令');
  }
  
  if (metrics.avg_rating < 3.5) {
    recommendations.push('平均评分较低，建议改进指令清晰度和完整性');
  }
  
  if (metrics.avg_iterations > 3) {
    recommendations.push('平均迭代次数较高，建议优化指令，减少歧义');
  }
  
  if (opportunities.length > 0) {
    recommendations.push(`发现 ${opportunities.length} 个优化机会，建议应用优化`);
  }
  
  return recommendations;
}

/**
 * 分析执行趋势
 * @param {string} skillName - skill名称
 * @param {number} days - 分析天数（默认30天）
 * @returns {object} 趋势分析
 */
export function analyzeTrends(skillName, days = 30) {
  const db = getDbManager();
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  try {
    const executions = db.prepare(`
      SELECT start_time, status, inferred_rating, explicit_rating, iterations
      FROM executions
      WHERE skill_name = ? AND start_time >= ?
      ORDER BY start_time
    `).all(skillName, cutoffTime);
    
    if (executions.length === 0) {
      return {
        skillName,
        period: `${days}天`,
        message: '该时间段内无执行记录'
      };
    }
    
    // 按周分组
    const weeklyData = {};
    for (const exec of executions) {
      const week = Math.floor(exec.start_time / (7 * 24 * 60 * 60 * 1000));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          total: 0,
          success: 0,
          ratings: [],
          iterations: []
        };
      }
      weeklyData[week].total++;
      if (exec.status === 'completed') {
        weeklyData[week].success++;
      }
      const rating = exec.explicit_rating || exec.inferred_rating;
      if (rating) {
        weeklyData[week].ratings.push(rating);
      }
      if (exec.iterations) {
        weeklyData[week].iterations.push(exec.iterations);
      }
    }
    
    // 计算趋势
    const weeks = Object.keys(weeklyData).map(Number).sort();
    let successRateTrend = 'stable';
    let ratingTrend = 'stable';
    
    if (weeks.length >= 2) {
      const firstWeek = weeklyData[weeks[0]];
      const lastWeek = weeklyData[weeks[weeks.length - 1]];
      
      const firstSuccessRate = firstWeek.total > 0 ? firstWeek.success / firstWeek.total : 0;
      const lastSuccessRate = lastWeek.total > 0 ? lastWeek.success / lastWeek.total : 0;
      
      if (lastSuccessRate > firstSuccessRate + 0.1) {
        successRateTrend = 'improving';
      } else if (lastSuccessRate < firstSuccessRate - 0.1) {
        successRateTrend = 'declining';
      }
      
      const firstAvgRating = firstWeek.ratings.length > 0
        ? firstWeek.ratings.reduce((a, b) => a + b, 0) / firstWeek.ratings.length
        : 0;
      const lastAvgRating = lastWeek.ratings.length > 0
        ? lastWeek.ratings.reduce((a, b) => a + b, 0) / lastWeek.ratings.length
        : 0;
      
      if (lastAvgRating > firstAvgRating + 0.3) {
        ratingTrend = 'improving';
      } else if (lastAvgRating < firstAvgRating - 0.3) {
        ratingTrend = 'declining';
      }
    }
    
    return {
      skillName,
      period: `${days}天`,
      totalExecutions: executions.length,
      successRateTrend,
      ratingTrend,
      weeklyData: weeks.map(week => ({
        week: new Date(week * 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        total: weeklyData[week].total,
        successRate: weeklyData[week].total > 0 
          ? (weeklyData[week].success / weeklyData[week].total * 100).toFixed(1) + '%'
          : '0%',
        avgRating: weeklyData[week].ratings.length > 0
          ? (weeklyData[week].ratings.reduce((a, b) => a + b, 0) / weeklyData[week].ratings.length).toFixed(2)
          : 'N/A',
        avgIterations: weeklyData[week].iterations.length > 0
          ? (weeklyData[week].iterations.reduce((a, b) => a + b, 0) / weeklyData[week].iterations.length).toFixed(2)
          : 'N/A'
      }))
    };
  } catch (error) {
    logger.error(`[Analyzer] 分析执行趋势失败:`, error);
    return {
      skillName,
      error: error.message
    };
  }
}

/**
 * 生成所有skills的健康度报告
 * @returns {array} 报告列表
 */
export function generateAllHealthReports() {
  const db = getDbManager();
  
  try {
    const skills = db.prepare('SELECT skill_name FROM skill_metrics ORDER BY skill_name').all();
    
    return skills.map(skill => generateHealthReport(skill.skill_name));
  } catch (error) {
    logger.error(`[Analyzer] 生成所有健康度报告失败:`, error);
    return [];
  }
}
