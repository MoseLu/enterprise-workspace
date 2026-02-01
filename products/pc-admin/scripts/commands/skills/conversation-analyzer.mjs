/**
 * 对话分析器
 * 从日常对话中识别潜在的skill使用场景，提取优化数据
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { getAllSkills } from './utils/file-helper.mjs';
import { randomBytes } from 'crypto';

/**
 * 生成对话ID
 */
function generateConversationId() {
  const timestamp = Date.now();
  const random = randomBytes(4).toString('hex');
  return `conv_${timestamp}_${random}`;
}

/**
 * 分析用户查询，识别相关skills
 * @param {string} userQuery - 用户查询
 * @returns {array} 相关skills列表
 */
export function identifyRelatedSkills(userQuery) {
  const skills = getAllSkills();
  const query = userQuery.toLowerCase();
  
  // Skill名称关键词映射（按优先级排序，更具体的在前）
  const skillKeywords = {
    'build-guide': ['构建应用', '构建', 'build', '编译', '打包', 'dist', 'cdn', '构建失败', '构建错误'],
    'dev-workflow': ['开发服务器', '开发', 'dev', '启动', '运行', '热重载', '端口', '启动失败'],
    'monorepo-quick-start': ['项目结构', '应用列表', '应用', '包', 'monorepo', '结构'],
    'scripts-navigator': ['脚本', 'script', '命令', '运行脚本'],
    'release-automation': ['发布', 'release', '版本', 'changelog'],
    'i18n-toolkit': ['国际化', 'i18n', '翻译', 'locale', '语言'],
    'deploy-toolkit': ['部署', 'deploy', '上线', '发布'],
    'quality-assurance': ['检查', 'lint', 'type-check', '测试', 'test'],
    'page-creator': ['页面', 'page', '创建页面', '新增页面'],
    'component-catalog': ['组件', 'component', '组件库', 'btc组件']
  };
  
  const relatedSkills = [];
  
  for (const [skillName, keywords] of Object.entries(skillKeywords)) {
    // 优先匹配更具体的关键词（前面的关键词权重更高）
    let matchScore = 0;
    const matchedKeywords = [];
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      if (query.includes(keyword)) {
        // 前面的关键词权重更高
        matchScore += (keywords.length - i) / keywords.length;
        matchedKeywords.push(keyword);
      }
    }
    
    if (matchScore > 0) {
      relatedSkills.push({
        skillName,
        relevanceScore: matchScore,
        matchedKeywords
      });
    }
  }
  
  // 按相关性排序
  return relatedSkills
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3); // 返回前3个最相关的
}

/**
 * 提取对话意图
 * @param {string} userQuery - 用户查询
 * @returns {object} 意图分析结果
 */
export function extractIntent(userQuery) {
  const query = userQuery.toLowerCase();
  
  const intentPatterns = {
    how_to: ['如何', '怎么', '怎样', 'how', 'how to', 'way'],
    what_is: ['是什么', '什么是', 'what', 'what is'],
    why: ['为什么', 'why', '原因'],
    problem: ['错误', '失败', '问题', 'error', 'failed', 'problem', 'issue'],
    request: ['帮我', '请', '需要', 'help', 'please', 'need'],
    optimization: ['优化', '改进', '提升', 'optimize', 'improve', 'better']
  };
  
  let detectedIntent = 'general';
  let maxScore = 0;
  
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    const score = keywords.filter(keyword => query.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intent;
    }
  }
  
  return {
    intent: detectedIntent,
    confidence: Math.min(1.0, maxScore / 2)
  };
}

/**
 * 提取关键词
 * @param {string} text - 文本
 * @returns {array} 关键词列表
 */
function extractKeywords(text) {
  const commonKeywords = [
    '构建', '开发', '部署', '测试', '错误', '配置', '服务', '组件',
    '页面', '路由', '权限', '国际化', 'i18n', '脚本', '命令',
    'build', 'dev', 'deploy', 'test', 'error', 'config', 'service',
    'component', 'page', 'route', 'permission', 'i18n', 'script'
  ];
  
  const keywords = [];
  const lowerText = text.toLowerCase();
  
  for (const keyword of commonKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  }
  
  return [...new Set(keywords)];
}

/**
 * 识别潜在问题
 * @param {string} userQuery - 用户查询
 * @param {string} aiResponse - AI响应（可选）
 * @returns {array} 潜在问题列表
 */
export function identifyPotentialIssues(userQuery, aiResponse = null) {
  const issues = [];
  const query = userQuery.toLowerCase();
  
  // 问题模式
  const issuePatterns = {
    missing_info: ['不知道', '不清楚', '没有', '缺少', 'missing', 'lack', 'don\'t know'],
    unclear: ['不明白', '不理解', '模糊', 'unclear', 'confused', 'vague'],
    error: ['错误', '失败', '不行', 'error', 'failed', 'wrong', 'not working'],
    complexity: ['复杂', '麻烦', '复杂', 'complex', 'complicated', 'difficult'],
    incomplete: ['不完整', '遗漏', 'incomplete', 'missing', 'lack']
  };
  
  for (const [issueType, keywords] of Object.entries(issuePatterns)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      issues.push({
        type: issueType,
        description: `用户提到: ${keywords.find(k => query.includes(k))}`
      });
    }
  }
  
  return issues;
}

/**
 * 生成优化建议
 * @param {string} userQuery - 用户查询
 * @param {array} relatedSkills - 相关skills
 * @param {array} issues - 潜在问题
 * @returns {array} 优化建议列表
 */
export function generateOptimizationSuggestions(userQuery, relatedSkills, issues) {
  const suggestions = [];
  
  // 如果用户询问如何做某事，但相关skill存在，说明skill可能不够明显或易用
  if (userQuery.includes('如何') || userQuery.includes('how')) {
    for (const skill of relatedSkills) {
      suggestions.push({
        type: 'discoverability',
        skillName: skill.skillName,
        description: `用户询问如何${userQuery}，但相关skill "${skill.skillName}" 存在`,
        recommendation: `在skill中添加更明显的使用说明，或改进skill的描述`
      });
    }
  }
  
  // 如果用户遇到问题，相关skill应该包含解决方案
  if (issues.length > 0) {
    for (const skill of relatedSkills) {
      for (const issue of issues) {
        suggestions.push({
          type: 'problem_solution',
          skillName: skill.skillName,
          description: `用户遇到${issue.type}问题，相关skill应该包含解决方案`,
          recommendation: `在skill的"常见问题"部分添加该问题的解决方案`
        });
      }
    }
  }
  
  // 如果用户提到复杂或麻烦，相关skill可能需要拆分或简化
  if (userQuery.includes('复杂') || userQuery.includes('麻烦') || userQuery.includes('complex')) {
    for (const skill of relatedSkills) {
      suggestions.push({
        type: 'complexity_reduction',
        skillName: skill.skillName,
        description: '用户认为操作复杂',
        recommendation: '考虑将skill拆分为更小的子skills，或简化操作步骤'
      });
    }
  }
  
  return suggestions;
}

/**
 * 记录对话场景
 * @param {string} userQuery - 用户查询
 * @param {string} aiResponse - AI响应（可选）
 * @returns {string} conversation_id
 */
export function recordConversationScenario(userQuery, aiResponse = null) {
  const db = getDbManager();
  const conversationId = generateConversationId();
  
  try {
    // 分析对话
    const relatedSkills = identifyRelatedSkills(userQuery);
    const intent = extractIntent(userQuery);
    const keywords = extractKeywords(userQuery);
    const issues = identifyPotentialIssues(userQuery, aiResponse);
    const suggestions = generateOptimizationSuggestions(userQuery, relatedSkills, issues);
    
    const isSkillRelated = relatedSkills.length > 0;
    const confidenceScore = isSkillRelated 
      ? Math.max(...relatedSkills.map(s => s.relevanceScore))
      : 0;
    
    // 确定场景类型
    let scenarioType = 'general';
    if (isSkillRelated) {
      scenarioType = 'skill_related';
    } else if (intent.intent === 'problem') {
      scenarioType = 'problem_report';
    } else if (intent.intent === 'how_to') {
      scenarioType = 'how_to_question';
    }
    
    // 记录对话场景
    db.prepare(`
      INSERT INTO conversation_scenarios (
        conversation_id, user_query, ai_response, related_skill_name,
        scenario_type, extracted_intent, extracted_keywords, potential_issues,
        optimization_suggestions, is_skill_related, confidence_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      conversationId,
      userQuery,
      aiResponse,
      relatedSkills.length > 0 ? relatedSkills[0].skillName : null,
      scenarioType,
      JSON.stringify(intent),
      JSON.stringify(keywords),
      JSON.stringify(issues),
      JSON.stringify(suggestions),
      isSkillRelated ? 1 : 0,
      confidenceScore
    );
    
    // 记录skill映射关系
    for (const skill of relatedSkills) {
      db.prepare(`
        INSERT OR IGNORE INTO conversation_skill_mapping (
          conversation_id, skill_name, relevance_score, mapping_reason
        ) VALUES (?, ?, ?, ?)
      `).run(
        conversationId,
        skill.skillName,
        skill.relevanceScore,
        `匹配关键词: ${skill.matchedKeywords.join(', ')}`
      );
    }
    
    logger.debug(`[ConversationAnalyzer] 对话场景已记录: ${conversationId}, 相关skills: ${relatedSkills.length}`);
    
    return conversationId;
  } catch (error) {
    logger.error(`[ConversationAnalyzer] 记录对话场景失败:`, error);
    return conversationId;
  }
}

/**
 * 获取skill相关的对话场景
 * @param {string} skillName - skill名称
 * @param {number} limit - 限制数量
 * @returns {array} 对话场景列表
 */
export function getSkillRelatedConversations(skillName, limit = 20) {
  const db = getDbManager();
  
  try {
    const conversations = db.prepare(`
      SELECT cs.* FROM conversation_scenarios cs
      INNER JOIN conversation_skill_mapping csm ON cs.conversation_id = csm.conversation_id
      WHERE csm.skill_name = ?
      ORDER BY cs.created_at DESC
      LIMIT ?
    `).all(skillName, limit);
    
    return conversations.map(conv => {
      const result = { ...conv };
      if (result.extracted_intent) {
        try {
          result.extracted_intent = JSON.parse(result.extracted_intent);
        } catch (e) {}
      }
      if (result.extracted_keywords) {
        try {
          result.extracted_keywords = JSON.parse(result.extracted_keywords);
        } catch (e) {}
      }
      if (result.potential_issues) {
        try {
          result.potential_issues = JSON.parse(result.potential_issues);
        } catch (e) {}
      }
      if (result.optimization_suggestions) {
        try {
          result.optimization_suggestions = JSON.parse(result.optimization_suggestions);
        } catch (e) {}
      }
      return result;
    });
  } catch (error) {
    logger.error(`[ConversationAnalyzer] 获取skill相关对话失败:`, error);
    return [];
  }
}

/**
 * 从对话中提取优化建议
 * @param {string} skillName - skill名称
 * @returns {array} 优化建议列表
 */
export function extractOptimizationSuggestionsFromConversations(skillName) {
  const conversations = getSkillRelatedConversations(skillName, 50);
  const suggestions = [];
  const suggestionMap = new Map();
  
  for (const conv of conversations) {
    if (conv.optimization_suggestions && Array.isArray(conv.optimization_suggestions)) {
      for (const suggestion of conv.optimization_suggestions) {
        const key = `${suggestion.type}_${suggestion.skillName}_${suggestion.description}`;
        if (!suggestionMap.has(key)) {
          suggestionMap.set(key, {
            ...suggestion,
            occurrenceCount: 1,
            conversations: [conv.conversation_id]
          });
        } else {
          const existing = suggestionMap.get(key);
          existing.occurrenceCount++;
          existing.conversations.push(conv.conversation_id);
        }
      }
    }
  }
  
  // 按出现次数排序，返回出现1次以上的建议（降低阈值，因为对话数据可能较少）
  return Array.from(suggestionMap.values())
    .filter(s => s.occurrenceCount >= 1)
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}
