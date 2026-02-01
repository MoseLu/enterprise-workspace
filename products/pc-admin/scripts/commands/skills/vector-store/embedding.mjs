/**
 * Embedding 服务
 * 将文本转换为向量
 * 支持 OpenAI API 和本地模型
 */

import { config } from './config.mjs';

// 简单的 logger
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
};

let openaiClient = null;
let localEmbeddingAvailable = null;

/**
 * 初始化 OpenAI 客户端
 */
async function initOpenAIClient() {
  if (!openaiClient && config.embedding.provider === 'openai') {
    if (!config.embedding.apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
    }
    // 动态导入 OpenAI（ES 模块）
    const { default: OpenAI } = await import('openai');
    openaiClient = new OpenAI({
      apiKey: config.embedding.apiKey,
    });
  }
  return openaiClient;
}

/**
 * 检查本地 Embedding 是否可用
 */
async function checkLocalEmbedding() {
  if (localEmbeddingAvailable === null) {
    try {
      const { checkLocalEmbeddingAvailable } = await import('./local-embedding.mjs');
      localEmbeddingAvailable = await checkLocalEmbeddingAvailable();
    } catch (error) {
      localEmbeddingAvailable = false;
    }
  }
  return localEmbeddingAvailable;
}

/**
 * 生成文本的向量表示
 * 优先使用本地模型，如果不可用则使用 OpenAI
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  // 截断过长的文本
  const maxLength = 8000;
  const truncatedText = text.length > maxLength 
    ? text.substring(0, maxLength) 
    : text;

  try {
    // 优先尝试本地模型
    if (config.embedding.provider === 'local' || 
        (config.embedding.provider === 'auto' && await checkLocalEmbedding())) {
      try {
        const { generateEmbeddingLocal } = await import('./local-embedding.mjs');
        return await generateEmbeddingLocal(truncatedText);
      } catch (error) {
        logger.warn('本地 Embedding 不可用，尝试使用 OpenAI:', error.message);
        // 降级到 OpenAI
      }
    }

    // 使用 OpenAI
    if (config.embedding.provider === 'openai' || config.embedding.provider === 'auto') {
      const client = await initOpenAIClient();
      if (!client) {
        throw new Error('OpenAI client initialization failed');
      }
      const response = await client.embeddings.create({
        model: config.embedding.model,
        input: truncatedText,
      });

      return response.data[0].embedding;
    }

    throw new Error(`Unsupported embedding provider: ${config.embedding.provider}`);
  } catch (error) {
    logger.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * 批量生成向量
 */
export async function generateEmbeddingsBatch(texts, batchSize = 10) {
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    logger.info(`Generating embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
    
    const batchEmbeddings = await Promise.all(
      batch.map((text) => generateEmbedding(text))
    );
    
    embeddings.push(...batchEmbeddings);
  }
  
  return embeddings;
}

/**
 * 构建资源描述文本（用于向量化）
 */
export function buildResourceDescription(resource, extracted) {
  const parts = [];

  // 基本信息
  parts.push(`Resource Type: ${resource.type}`);
  parts.push(`Name: ${extracted.name || resource.relativePath}`);
  
  // 描述
  if (extracted.description) {
    parts.push(`Description: ${extracted.description}`);
  }

  // 特定类型的信息
  switch (resource.type) {
    case 'composable':
      if (extracted.composables?.length > 0) {
        extracted.composables.forEach((comp) => {
          parts.push(`Function: ${comp.name}(${comp.params.join(', ')})`);
          if (comp.description) {
            parts.push(`  ${comp.description}`);
          }
        });
      }
      break;

    case 'component':
      if (extracted.props?.length > 0) {
        parts.push(`Props: ${extracted.props.join(', ')}`);
      }
      if (extracted.comments?.length > 0) {
        parts.push(`Comments: ${extracted.comments.join(' ')}`);
      }
      break;

    case 'icon':
      parts.push(`Category: ${extracted.category}`);
      parts.push(`Icon name: ${extracted.name}`);
      break;

    case 'locale':
      parts.push(`Language: ${extracted.language}`);
      parts.push(`Keys: ${extracted.keyCount} translation keys`);
      break;

    case 'skill':
      parts.push(`Skill: ${extracted.name}`);
      if (extracted.scenarios) {
        parts.push(`Use cases: ${extracted.scenarios}`);
      }
      break;

    case 'utility':
      if (extracted.functions?.length > 0) {
        parts.push(`Functions: ${extracted.functions.map((f) => f.name).join(', ')}`);
      }
      break;
  }

  // 添加部分内容（如果可用）
  if (extracted.content && extracted.content.length < 1000) {
    parts.push(`Content preview: ${extracted.content.substring(0, 500)}`);
  }

  return parts.join('\n');
}
