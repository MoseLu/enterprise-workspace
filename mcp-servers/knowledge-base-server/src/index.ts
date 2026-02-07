/**
 * Knowledge Base MCP Server
 *
 * 提供企业工作空间知识库检索能力的 MCP 服务器
 * 支持自然语言查询，返回组件、规则、方案等知识条目
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';

// 类型定义
interface KnowledgeEntry {
  id: string;
  type: string;
  label: string;
  description: string;
  [key: string]: unknown;
}

interface SearchOptions {
  query: string;
  type?: string;
  category?: string;
  domain?: string;
  limit?: number;
}

interface SearchResult {
  query: string;
  intent: string;
  results: {
    id: string;
    type: string;
    label: string;
    description: string;
    score: number;
    highlights: string[];
    matchedFields: string[];
  }[];
  relatedConcepts: string[];
  suggestions: string[];
}

// 知识库路径
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'knowledge-base/RAG');

// 加载知识库
function loadKnowledgeBase(): {
  taxonomy: Record<string, unknown>;
  graph: Record<string, unknown>;
  index: { entries: KnowledgeEntry[] };
} {
  const taxonomyPath = path.join(KNOWLEDGE_BASE_PATH, 'knowledge-taxonomy.json');
  const graphPath = path.join(KNOWLEDGE_BASE_PATH, 'knowledge-graph.json');
  const indexPath = path.join(KNOWLEDGE_BASE_PATH, 'knowledge-index.json');

  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  return { taxonomy, graph, index: index as { entries: KnowledgeEntry[] } };
}

// 意图识别
function classifyIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  // 定位查询
  const locatePatterns = ['在哪里', '的位置', '定义', '文件路径', '位于', 'location'];
  if (locatePatterns.some(p => lowerQuery.includes(p))) {
    return 'LOCATE';
  }

  // 列举查询
  const listPatterns = ['所有', '列表', '有哪些', '列出', 'list'];
  if (listPatterns.some(p => lowerQuery.includes(p))) {
    return 'LIST';
  }

  // 理解查询
  const understandPatterns = ['如何', '怎么', '原理', '实现', 'understand', 'how'];
  if (understandPatterns.some(p => lowerQuery.includes(p))) {
    return 'UNDERSTAND';
  }

  // 决策查询
  const decisionPatterns = ['为什么', '决策', '背景', '选择', 'decision', 'why'];
  if (decisionPatterns.some(p => lowerQuery.includes(p))) {
    return 'DECISION';
  }

  // 规则查询
  const rulePatterns = ['规范', '规则', '要求', 'rule', 'standard'];
  if (rulePatterns.some(p => lowerQuery.includes(p))) {
    return 'RULE';
  }

  // 方案查询
  const solutionPatterns = ['方案', '实现', '做法', 'solution', 'approach'];
  if (solutionPatterns.some(p => lowerQuery.includes(p))) {
    return 'SOLUTION';
  }

  return 'SEARCH';
}

// 简单关键词匹配搜索
function searchKnowledgeBase(options: SearchOptions): SearchResult {
  const { query, type, category, domain, limit = 10 } = options;
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);

  // 加载知识库
  const { graph } = loadKnowledgeBase();
  const nodes = graph.nodes as Record<string, KnowledgeEntry[]>;

  // 收集所有节点
  const allNodes: KnowledgeEntry[] = [];
  const nodeTypes = ['concepts', 'components', 'hooks', 'patterns', 'decisions', 'rules', 'solutions', 'domains'];

  for (const nodeType of nodeTypes) {
    if (nodes[nodeType]) {
      for (const node of nodes[nodeType] as KnowledgeEntry[]) {
        if (type && node.type !== type && node.type !== type.toUpperCase()) {
          continue;
        }
        if (category && node.category !== category) {
          continue;
        }
        const nodeKeywords = (node.keywords || []) as string[];
        const nodeTags = (node.tags || []) as string[];
        if (domain && !nodeKeywords.some((k: string) => k.includes(domain))) {
          continue;
        }
        allNodes.push(node);
      }
    }
  }

  // 计算匹配分数
  const scoredResults = allNodes.map(node => {
    let score = 0;
    const highlights: string[] = [];
    const matchedFields: string[] = [];

    // 标签匹配
    const keywords = (node.keywords || []) as string[];
    const tags = (node.tags || []) as string[];

    for (const word of queryWords) {
      // 标签匹配
      if (tags.some((t: string) => t.includes(word))) {
        score += 3;
        matchedFields.push('tags');
        highlights.push(`标签匹配: ${word}`);
      }

      // 关键词匹配
      if (keywords.some((k: string) => k.includes(word))) {
        score += 2;
        matchedFields.push('keywords');
      }

      // 描述匹配
      if (node.description?.toLowerCase().includes(word)) {
        score += 1;
        matchedFields.push('description');
      }

      // ID 匹配
      if (node.id.toLowerCase().includes(word)) {
        score += 4;
        matchedFields.push('id');
      }

      // 标签匹配
      if (node.label?.toLowerCase().includes(word)) {
        score += 3;
        matchedFields.push('label');
      }
    }

    // 精确短语匹配
    if (lowerQuery.includes(node.label?.toLowerCase() || '')) {
      score += 5;
    }

    return {
      id: node.id,
      type: node.type,
      label: node.label,
      description: node.description,
      score,
      highlights: [...new Set(highlights)],
      matchedFields: [...new Set(matchedFields)],
    };
  });

  // 过滤并排序
  const filteredResults = scoredResults
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // 生成建议
  const suggestions: string[] = [];
  if (filteredResults.length === 0) {
    suggestions.push('尝试使用更宽泛的关键词');
    suggestions.push('使用英文关键词尝试');
  } else {
    suggestions.push('查看匹配的规则详情');
    suggestions.push('探索相关组件和 Hooks');
  }

  // 生成相关概念
  const relatedConcepts = filteredResults
    .slice(0, 3)
    .flatMap(r => {
      const graphNode = allNodes.find(n => n.id === r.id);
      return (graphNode?.concepts || []) as string[];
    });

  return {
    query,
    intent: classifyIntent(query),
    results: filteredResults,
    relatedConcepts: [...new Set(relatedConcepts)],
    suggestions,
  };
}

// 获取特定条目详情
function getEntryById(id: string): KnowledgeEntry | null {
  const { graph } = loadKnowledgeBase();
  const nodes = graph.nodes as Record<string, KnowledgeEntry[]>;

  const nodeTypes = ['concepts', 'components', 'hooks', 'patterns', 'decisions', 'rules', 'solutions', 'domains'];

  for (const nodeType of nodeTypes) {
    if (nodes[nodeType]) {
      const found = (nodes[nodeType] as KnowledgeEntry[]).find(n => n.id === id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

// 获取某类型的所有条目
function getEntriesByType(type: string): KnowledgeEntry[] {
  const { graph } = loadKnowledgeBase();
  const nodes = graph.nodes as Record<string, KnowledgeEntry[]>;
  const normalizedType = type.toUpperCase();

  const nodeTypes = ['rules', 'solutions', 'decisions', 'components', 'hooks', 'patterns'];

  for (const nodeType of nodeTypes) {
    if (nodes[nodeType]) {
      const results = (nodes[nodeType] as KnowledgeEntry[]).filter(
        n => n.type === normalizedType || nodeType === normalizedType.toLowerCase()
      );
      if (results.length > 0) {
        return results;
      }
    }
  }

  return [];
}

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'knowledge-base-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'kb_search',
        description: '搜索知识库，支持自然语言查询组件、规则、方案等知识条目',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索查询，支持自然语言，如"菜单组件在哪里"、"表单验证规则"、"主题切换方案"',
            },
            type: {
              type: 'string',
              description: '知识类型过滤（可选）：RULE, SOLUTION, DECISION, COMPONENT, HOOK, PATTERN',
              enum: ['RULE', 'SOLUTION', 'DECISION', 'COMPONENT', 'HOOK', 'PATTERN'],
            },
            category: {
              type: 'string',
              description: '分类过滤（可选），如 CODE_QUALITY, SECURITY, IMPLEMENTATION',
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制（默认 10）',
              default: 10,
              minimum: 1,
              maximum: 50,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'kb_get_entry',
        description: '获取知识库特定条目的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '知识条目 ID，如 "rule:typescript-strict"、"solution:user-auth"',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'kb_list_rules',
        description: '列出所有项目规范规则',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '规则分类过滤：CODE_QUALITY, SECURITY, GIT规范, TESTING, STYLE',
            },
          },
        },
      },
      {
        name: 'kb_list_solutions',
        description: '列出所有技术方案和实现指南',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '方案分类过滤：IMPLEMENTATION, INTEGRATION, MIGRATION, OPTIMIZATION, WORKFLOW',
            },
          },
        },
      },
      {
        name: 'kb_get_decision',
        description: '获取架构决策记录详情',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '决策 ID，如 "decision:001"、"decision:003"',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'kb_get_rule_example',
        description: '获取规则的代码示例（好/坏实践对比）',
        inputSchema: {
          type: 'object',
          properties: {
            ruleId: {
              type: 'string',
              description: '规则 ID，如 "rule:typescript-strict"、"rule:error-handling"',
            },
          },
          required: ['ruleId'],
        },
      },
      {
        name: 'kb_intent_analysis',
        description: '分析查询意图，判断用户想查找什么类型的知识',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '需要分析的查询文本',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'kb_search': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments for kb_search');
        }
        const searchArgs = args as Record<string, unknown>;
        const query = searchArgs.query as string;
        const type = searchArgs.type as string | undefined;
        const category = searchArgs.category as string | undefined;
        const limit = (searchArgs.limit as number) || 10;

        const result = searchKnowledgeBase({ query, type, category, limit });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'kb_get_entry': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments for kb_get_entry');
        }
        const searchArgs = args as Record<string, unknown>;
        const id = searchArgs.id as string;

        const entry = getEntryById(id);
        if (!entry) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: `未找到知识条目: ${id}` }, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(entry, null, 2),
            },
          ],
        };
      }

      case 'kb_list_rules': {
        const searchArgs = args as Record<string, unknown>;
        const category = searchArgs.category as string | undefined;

        let rules = getEntriesByType('RULE');
        if (category) {
          rules = rules.filter(r => r.category === category);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                total: rules.length,
                category,
                rules: rules.map(r => ({
                  id: r.id,
                  label: r.label,
                  description: r.description,
                  category: r.category,
                  severity: r.severity,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'kb_list_solutions': {
        const searchArgs = args as Record<string, unknown>;
        const category = searchArgs.category as string | undefined;

        let solutions = getEntriesByType('SOLUTION');
        if (category) {
          solutions = solutions.filter(r => r.category === category);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                total: solutions.length,
                category,
                solutions: solutions.map(s => ({
                  id: s.id,
                  label: s.label,
                  description: s.description,
                  category: s.category,
                  steps: ((s.steps as unknown[]) || []).length,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'kb_get_decision': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments for kb_get_decision');
        }
        const searchArgs = args as Record<string, unknown>;
        const id = searchArgs.id as string;

        const decision = getEntryById(id);
        if (!decision) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: `未找到架构决策: ${id}` }, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(decision, null, 2),
            },
          ],
        };
      }

      case 'kb_get_rule_example': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments for kb_get_rule_example');
        }
        const searchArgs = args as Record<string, unknown>;
        const ruleId = searchArgs.ruleId as string;

        const rule = getEntryById(ruleId);
        if (!rule) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: `未找到规则: ${ruleId}` }, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: rule.id,
                label: rule.label,
                description: rule.description,
                category: rule.category,
                examples: rule.examples,
                severity: rule.severity,
              }, null, 2),
            },
          ],
        };
      }

      case 'kb_intent_analysis': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments for kb_intent_analysis');
        }
        const searchArgs = args as Record<string, unknown>;
        const query = searchArgs.query as string;

        const intent = classifyIntent(query);
        const intentDescriptions: Record<string, string> = {
          LOCATE: '定位查询 - 查找组件、文件、函数的位置',
          LIST: '列举查询 - 列出某类条目',
          UNDERSTAND: '理解查询 - 理解功能工作原理',
          DECISION: '决策查询 - 了解决策背景',
          RULE: '规则查询 - 查询规范要求',
          SOLUTION: '方案查询 - 查询实现方案',
          SEARCH: '通用搜索',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query,
                intent,
                description: intentDescriptions[intent] || '通用搜索',
                suggestedTools: {
                  LOCATE: 'kb_search',
                  LIST: 'kb_search',
                  UNDERSTAND: 'kb_search + kb_get_entry',
                  DECISION: 'kb_get_decision',
                  RULE: 'kb_list_rules + kb_get_rule_example',
                  SOLUTION: 'kb_list_solutions',
                  SEARCH: 'kb_search',
                },
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Knowledge Base MCP Server running on stdio');
}

main().catch(console.error);
