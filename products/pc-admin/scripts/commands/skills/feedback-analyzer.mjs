/**
 * 反馈分析器
 * NLP分析、情感分析、多维度推断
 */

import { logger } from './utils/logger.mjs';

/**
 * 提取关键词
 * @param {string} text - 文本
 * @returns {array} 关键词列表
 */
export function extractKeywords(text) {
  if (!text) return [];
  
  // 常见问题关键词
  const problemKeywords = [
    '错误', '失败', '缺失', '遗漏', '拼写', '配置', '服务', 
    '国际化', 'i18n', '路由', '权限', '组件', '功能',
    'error', 'failed', 'missing', 'typo', 'config', 'service',
    'i18n', 'routing', 'permission', 'component', 'feature'
  ];
  
  const keywords = [];
  const lowerText = text.toLowerCase();
  
  for (const keyword of problemKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  }
  
  return [...new Set(keywords)]; // 去重
}

/**
 * 识别问题类型
 * @param {string} text - 反馈文本
 * @returns {array} 问题类型列表
 */
export function identifyProblemTypes(text) {
  if (!text) return [];
  
  const problemTypes = [];
  const lowerText = text.toLowerCase();
  
  // 问题类型模式
  const patterns = {
    redundancy: ['冗余', '重复', '多余', 'redundant', 'duplicate', 'unnecessary'],
    inaccuracy: ['不准确', '错误', '不对', 'inaccurate', 'wrong', 'incorrect'],
    missing: ['缺失', '遗漏', '缺少', 'missing', 'lack', 'absent'],
    unclear: ['模糊', '不清楚', '不明确', 'unclear', 'ambiguous', 'vague'],
    failure: ['失败', '无法', '不能', 'failed', 'cannot', 'unable']
  };
  
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      problemTypes.push(type);
    }
  }
  
  return problemTypes;
}

/**
 * 分析反馈意图
 * @param {string} text - 反馈文本
 * @returns {object} 意图分析结果
 */
export function analyzeIntent(text) {
  if (!text) {
    return {
      intent: 'unknown',
      confidence: 0
    };
  }
  
  const lowerText = text.toLowerCase();
  
  // 意图模式
  const intents = {
    complaint: ['不好', '差', '错误', '失败', 'bad', 'wrong', 'failed'],
    praise: ['好', '很好', '不错', '满意', 'good', 'great', 'satisfied'],
    suggestion: ['建议', '可以', '应该', 'suggest', 'should', 'could'],
    question: ['为什么', '如何', '怎么', 'why', 'how', 'what']
  };
  
  let maxScore = 0;
  let detectedIntent = 'neutral';
  
  for (const [intent, keywords] of Object.entries(intents)) {
    const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intent;
    }
  }
  
  const confidence = Math.min(1.0, maxScore / 3);
  
  return {
    intent: detectedIntent,
    confidence
  };
}

/**
 * 综合反馈分析
 * @param {string} feedbackText - 反馈文本
 * @returns {object} 综合分析结果
 */
export function analyzeFeedback(feedbackText) {
  if (!feedbackText || feedbackText.trim().length === 0) {
    return {
      keywords: [],
      problemTypes: [],
      intent: 'unknown',
      confidence: 0,
      sentiment: 'neutral'
    };
  }
  
  const keywords = extractKeywords(feedbackText);
  const problemTypes = identifyProblemTypes(feedbackText);
  const intent = analyzeIntent(feedbackText);
  
  // 简单情感分析
  const positiveWords = ['好', '很好', '不错', '满意', '成功', 'good', 'great', 'excellent'];
  const negativeWords = ['差', '不好', '错误', '失败', 'bad', 'wrong', 'failed'];
  
  const lowerText = feedbackText.toLowerCase();
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  
  let sentiment = 'neutral';
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }
  
  return {
    keywords,
    problemTypes,
    intent: intent.intent,
    confidence: intent.confidence,
    sentiment
  };
}
