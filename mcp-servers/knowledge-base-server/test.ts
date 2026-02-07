/**
 * Knowledge Base Server Test Script
 * 测试知识库检索功能
 */

import * as fs from 'fs';
import * as path from 'path';

// 知识库路径
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'knowledge-base/RAG');

// 类型定义
interface KnowledgeEntry {
  id: string;
  type: string;
  label: string;
  description: string;
  [key: string]: unknown;
}

// 加载知识库
function loadKnowledgeBase(): {
  taxonomy: Record<string, unknown>;
  graph: Record<string, unknown>;
} {
  const taxonomyPath = path.join(KNOWLEDGE_BASE_PATH, 'knowledge-taxonomy.json');
  const graphPath = path.join(KNOWLEDGE_BASE_PATH, 'knowledge-graph.json');

  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));

  return { taxonomy, graph };
}

// 意图识别
function classifyIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  const patterns: Record<string, string[]> = {
    LOCATE: ['在哪里', '的位置', '定义', '文件路径', '位于', 'location'],
    LIST: ['所有', '列表', '有哪些', '列出', 'list'],
    UNDERSTAND: ['如何', '怎么', '原理', '实现', 'understand', 'how'],
    DECISION: ['为什么', '决策', '背景', '选择', 'decision', 'why'],
    RULE: ['规范', '规则', '要求', 'rule', 'standard'],
    SOLUTION: ['方案', '实现', '做法', 'solution', 'approach'],
  };

  for (const [intent, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => lowerQuery.includes(k))) {
      return intent;
    }
  }
  return 'SEARCH';
}

// 搜索函数
function searchKnowledgeBase(query: string, options: { type?: string; limit?: number } = {}): {
  query: string;
  intent: string;
  results: {
    id: string;
    type: string;
    label: string;
    description: string;
    score: number;
    highlights: string[];
  }[];
} {
  const { type, limit = 10 } = options;
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);

  const { graph } = loadKnowledgeBase();
  const nodes = graph.nodes as Record<string, KnowledgeEntry[]>;

  const allNodes: KnowledgeEntry[] = [];
  const nodeTypes = ['concepts', 'components', 'hooks', 'patterns', 'decisions', 'rules', 'solutions', 'domains'];

  for (const nodeType of nodeTypes) {
    if (nodes[nodeType]) {
      for (const node of nodes[nodeType] as KnowledgeEntry[]) {
        if (type && node.type !== type && node.type !== type.toUpperCase()) {
          continue;
        }
        allNodes.push(node);
      }
    }
  }

  const scoredResults = allNodes.map(node => {
    let score = 0;
    const highlights: string[] = [];
    const keywords = (node.keywords || []) as string[];
    const tags = (node.tags || []) as string[];

    for (const word of queryWords) {
      if (tags.some((t: string) => t.includes(word))) {
        score += 3;
        highlights.push(`标签: ${word}`);
      }
      if (keywords.some((k: string) => k.includes(word))) {
        score += 2;
      }
      if (node.description?.toLowerCase().includes(word)) {
        score += 1;
      }
      if (node.id.toLowerCase().includes(word)) {
        score += 4;
      }
      if (node.label?.toLowerCase().includes(word)) {
        score += 3;
      }
    }

    return {
      id: node.id,
      type: node.type,
      label: node.label,
      description: node.description,
      score,
      highlights,
    };
  });

  const filteredResults = scoredResults
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    query,
    intent: classifyIntent(query),
    results: filteredResults,
  };
}

// 获取特定条目
function getEntryById(id: string): KnowledgeEntry | null {
  const { graph } = loadKnowledgeBase();
  const nodes = graph.nodes as Record<string, KnowledgeEntry[]>;

  const nodeTypes = ['concepts', 'components', 'hooks', 'patterns', 'decisions', 'rules', 'solutions', 'domains'];

  for (const nodeType of nodeTypes) {
    if (nodes[nodeType]) {
      const found = (nodes[nodeType] as KnowledgeEntry[]).find(n => n.id === id);
      if (found) return found;
    }
  }
  return null;
}

// 测试用例
const tests = [
  {
    name: '搜索 TypeScript 严格模式规范',
    query: 'TypeScript 严格模式规范',
    type: 'RULE',
  },
  {
    name: '搜索错误处理规范',
    query: '错误处理规范',
    type: 'RULE',
  },
  {
    name: '搜索表单验证',
    query: '表单验证',
  },
  {
    name: '搜索用户认证方案',
    query: '用户认证',
    type: 'SOLUTION',
  },
  {
    name: '搜索主题切换',
    query: '主题切换',
  },
  {
    name: '搜索 Monorepo 决策',
    query: 'Monorepo',
    type: 'DECISION',
  },
  {
    name: '搜索菜单组件',
    query: '菜单组件',
    type: 'COMPONENT',
  },
];

console.log('='.repeat(60));
console.log('Knowledge Base Search Test');
console.log('='.repeat(60));
console.log('');

for (const test of tests) {
  console.log(`\n📌 Test: ${test.name}`);
  console.log(`   Query: "${test.query}"`);
  console.log(`   Type Filter: ${test.type || 'none'}`);

  const result = searchKnowledgeBase(test.query, {
    type: test.type,
    limit: 5,
  });

  console.log(`   Intent: ${result.intent}`);
  console.log(`   Results: ${result.results.length}`);

  if (result.results.length > 0) {
    console.log('   Top Results:');
    for (const r of result.results.slice(0, 3)) {
      console.log(`   - [${r.type}] ${r.label} (score: ${r.score})`);
      console.log(`     ${r.description.slice(0, 50)}...`);
    }
  } else {
    console.log('   ❌ No results found');
  }
}

console.log('\n' + '='.repeat(60));
console.log('Entry Detail Test');
console.log('='.repeat(60));

const entryTestIds = [
  'rule:typescript-strict',
  'solution:user-auth',
  'decision:003',
];

for (const id of entryTestIds) {
  console.log(`\n📖 Entry: ${id}`);
  const entry = getEntryById(id);
  if (entry) {
    console.log(`   Label: ${entry.label}`);
    console.log(`   Type: ${entry.type}`);
    console.log(`   Description: ${entry.description}`);
    if (entry.category) {
      console.log(`   Category: ${entry.category}`);
    }
    if (entry.severity) {
      console.log(`   Severity: ${entry.severity}`);
    }
  } else {
    console.log('   ❌ Entry not found');
  }
}

console.log('\n' + '='.repeat(60));
console.log('Test Complete!');
console.log('='.repeat(60));
