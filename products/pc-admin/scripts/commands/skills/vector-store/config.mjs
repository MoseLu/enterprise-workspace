/**
 * 向量数据库配置
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  return join(__dirname, '../../../../');
}

/**
 * 获取配置目录
 */
function getConfigDir() {
  return join(getProjectRoot(), '.cursor', 'skills-meta');
}

/**
 * 默认配置
 */
const defaultConfig = {
  chroma: {
    path: join(getConfigDir(), 'vector-store'),
    collectionName: 'project-resources',
  },
  embedding: {
    provider: 'auto', // 'openai' | 'local' | 'auto' (自动选择)
    model: 'text-embedding-3-small', // OpenAI 模型
    localModel: 'Xenova/all-MiniLM-L6-v2', // 本地模型
    apiKey: process.env.OPENAI_API_KEY || '',
    dimensions: 384, // 本地模型维度（all-MiniLM-L6-v2 是 384）
    // OpenAI text-embedding-3-small 是 1536，但使用本地模型时是 384
  },
  scanning: {
    include: [
      'packages/**/composables/**/*.ts',
      'packages/**/components/**/*.vue',
      'packages/**/utils/**/*.ts',
      '**/assets/icons/**/*.svg',
      '**/locales/**/*.json',
      '.cursor/skills/**/SKILL.md',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.d.ts',
    ],
  },
  indexing: {
    batchSize: 100,
    concurrency: 5,
    updateInterval: 3600000, // 1小时
  },
  resourceTypes: {
    composable: {
      pattern: 'packages/**/composables/**/*.ts', // 匹配所有 packages 下的 composables 目录中的 .ts 文件
      extractor: 'composable',
    },
    component: {
      pattern: 'packages/**/*.vue', // 匹配所有 packages 下的 .vue 文件
      extractor: 'component',
    },
    icon: {
      pattern: '**/assets/icons/**/*.svg',
      extractor: 'icon',
    },
    locale: {
      pattern: '**/locales/**/*.json', // 匹配所有 locales 目录下的 .json 文件
      extractor: 'locale',
    },
    skill: {
      pattern: '.cursor/skills/**/SKILL.md', // 匹配所有 skills 目录下的 SKILL.md 文件
      extractor: 'skill',
    },
    utility: {
      pattern: 'packages/**/utils/**/*.ts', // 匹配所有 packages 下的 utils 目录中的 .ts 文件
      extractor: 'utility',
    },
    routes: {
      pattern: 'apps/*/src/router/**/*.ts', // 匹配所有应用的路由配置文件
      extractor: 'routes',
    },
    stores: {
      pattern: 'apps/*/src/store/**/*.ts', // 匹配所有应用的状态管理文件
      extractor: 'stores',
    },
    docs: {
      pattern: 'docs/**/*.md', // 匹配所有文档文件
      extractor: 'docs',
    },
  },
};

/**
 * 加载配置
 */
export function loadConfig() {
  const configPath = join(getConfigDir(), 'vector-store-config.json');
  
  if (existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      return {
        ...defaultConfig,
        ...userConfig,
        chroma: { ...defaultConfig.chroma, ...userConfig.chroma },
        embedding: { ...defaultConfig.embedding, ...userConfig.embedding },
        scanning: { ...defaultConfig.scanning, ...userConfig.scanning },
        indexing: { ...defaultConfig.indexing, ...userConfig.indexing },
      };
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error.message);
      return defaultConfig;
    }
  }
  
  return defaultConfig;
}

/**
 * 获取配置
 */
export const config = loadConfig();

export default config;
