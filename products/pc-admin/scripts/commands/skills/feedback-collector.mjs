/**
 * 反馈收集器
 * 智能收集用户反馈，支持文本推断和主动询问
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { updateExecution } from './execution-tracker.mjs';

/**
 * 分析反馈文本，推断多维度评分
 * @param {string} feedbackText - 反馈文本
 * @returns {object} 推断结果
 */
function analyzeFeedbackText(feedbackText) {
  if (!feedbackText || feedbackText.trim().length === 0) {
    return {
      confidence: 0,
      inferredRating: null,
      dimensions: null
    };
  }
  
  const text = feedbackText.toLowerCase();
  
  // 情感关键词
  const positiveWords = ['好', '很好', '不错', '满意', '成功', '正确', '完整', '清晰', '有用', 'good', 'great', 'excellent', 'perfect', 'success'];
  const negativeWords = ['差', '不好', '错误', '失败', '缺失', '模糊', '无用', 'bad', 'wrong', 'failed', 'missing', 'unclear', 'useless'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (text.includes(word)) positiveCount++;
  }
  
  for (const word of negativeWords) {
    if (text.includes(word)) negativeCount++;
  }
  
  // 推断评分（1-5）
  let inferredRating = 3; // 默认中性
  if (positiveCount > negativeCount) {
    inferredRating = Math.min(5, 3 + Math.ceil(positiveCount / 2));
  } else if (negativeCount > positiveCount) {
    inferredRating = Math.max(1, 3 - Math.ceil(negativeCount / 2));
  }
  
  // 推断多维度评分
  const dimensions = {
    accuracy: inferredRating,
    completeness: inferredRating,
    efficiency: inferredRating,
    usability: inferredRating,
    practicality: inferredRating
  };
  
  // 根据关键词调整维度
  if (text.includes('正确') || text.includes('准确') || text.includes('right') || text.includes('accurate')) {
    dimensions.accuracy = Math.min(5, inferredRating + 1);
  }
  if (text.includes('完整') || text.includes('全面') || text.includes('complete') || text.includes('comprehensive')) {
    dimensions.completeness = Math.min(5, inferredRating + 1);
  }
  if (text.includes('快速') || text.includes('高效') || text.includes('fast') || text.includes('efficient')) {
    dimensions.efficiency = Math.min(5, inferredRating + 1);
  }
  if (text.includes('清晰') || text.includes('易懂') || text.includes('clear') || text.includes('easy')) {
    dimensions.usability = Math.min(5, inferredRating + 1);
  }
  if (text.includes('有用') || text.includes('实用') || text.includes('useful') || text.includes('practical')) {
    dimensions.practicality = Math.min(5, inferredRating + 1);
  }
  
  // 计算置信度
  const confidence = Math.min(1.0, (positiveCount + negativeCount) / 5);
  
  return {
    confidence,
    inferredRating,
    dimensions,
    sentiment: positiveCount > negativeCount ? 'positive' : (negativeCount > positiveCount ? 'negative' : 'neutral')
  };
}

/**
 * 收集用户反馈
 * @param {string} executionId - 执行ID
 * @param {object} feedback - 反馈数据
 */
export function collectFeedback(executionId, feedback) {
  const db = getDbManager();
  
  try {
    // 分析反馈文本
    const analysis = feedback.rawText 
      ? analyzeFeedbackText(feedback.rawText)
      : { confidence: 0, inferredRating: null, dimensions: null };
    
    // 更新执行记录
    const updates = {
      user_feedback_raw: feedback.rawText || null,
      user_feedback_analyzed: JSON.stringify({
        sentiment: analysis.sentiment,
        keywords: analysis.keywords || [],
        issues: feedback.issues || []
      }),
      inferred_rating: analysis.inferredRating,
      explicit_rating: feedback.explicitRating || null,
      multi_dimension_scores: feedback.multiDimensionScores || analysis.dimensions
    };
    
    updateExecution(executionId, updates);
    
    logger.info(`[FeedbackCollector] 反馈已收集: execution_id=${executionId}, confidence=${analysis.confidence.toFixed(2)}`);
    
    return {
      success: true,
      analysis,
      needsMoreInfo: analysis.confidence < 0.6
    };
  } catch (error) {
    logger.error(`[FeedbackCollector] 收集反馈失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查反馈是否需要进一步询问
 * @param {string} executionId - 执行ID
 * @returns {boolean}
 */
export function needsMoreFeedback(executionId) {
  const db = getDbManager();
  
  try {
    const execution = db.prepare(`
      SELECT user_feedback_raw, inferred_rating, explicit_rating
      FROM executions WHERE execution_id = ?
    `).get(executionId);
    
    if (!execution) {
      return true;
    }
    
    // 如果没有反馈文本且没有显式评分，需要询问
    if (!execution.user_feedback_raw && !execution.explicit_rating) {
      return true;
    }
    
    // 如果推断评分置信度低，需要询问
    if (execution.user_feedback_raw) {
      const analysis = analyzeFeedbackText(execution.user_feedback_raw);
      return analysis.confidence < 0.6;
    }
    
    return false;
  } catch (error) {
    logger.error(`[FeedbackCollector] 检查反馈需求失败:`, error);
    return true;
  }
}

/**
 * 生成结构化询问问题
 * @param {string} executionId - 执行ID
 * @returns {array} 问题列表
 */
export function generateFeedbackQuestions(executionId) {
  const questions = [
    {
      id: 'accuracy',
      question: '准确性：执行结果是否符合您的预期？',
      options: [
        { value: 5, label: '完全符合' },
        { value: 4, label: '基本符合' },
        { value: 3, label: '部分符合' },
        { value: 2, label: '不太符合' },
        { value: 1, label: '完全不符合' }
      ],
      weight: 0.3
    },
    {
      id: 'completeness',
      question: '完整性：是否覆盖了所有要点？',
      options: [
        { value: 5, label: '完全覆盖' },
        { value: 4, label: '基本覆盖' },
        { value: 3, label: '部分覆盖' },
        { value: 2, label: '覆盖较少' },
        { value: 1, label: '遗漏关键点' }
      ],
      weight: 0.25
    },
    {
      id: 'efficiency',
      question: '效率：执行速度和迭代次数如何？',
      options: [
        { value: 5, label: '一次成功' },
        { value: 4, label: '1-2次迭代' },
        { value: 3, label: '3次迭代' },
        { value: 2, label: '4-5次迭代' },
        { value: 1, label: '超过5次迭代' }
      ],
      weight: 0.2
    },
    {
      id: 'usability',
      question: '易用性：指令是否清晰易懂？',
      options: [
        { value: 5, label: '非常清晰' },
        { value: 4, label: '比较清晰' },
        { value: 3, label: '基本清晰' },
        { value: 2, label: '有些模糊' },
        { value: 1, label: '难以理解' }
      ],
      weight: 0.15
    },
    {
      id: 'practicality',
      question: '实用性：是否解决了实际问题？',
      options: [
        { value: 5, label: '完全解决' },
        { value: 4, label: '基本解决' },
        { value: 3, label: '部分解决' },
        { value: 2, label: '作用有限' },
        { value: 1, label: '无法解决' }
      ],
      weight: 0.1
    }
  ];
  
  return questions;
}
