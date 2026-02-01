/**
 * 本地 Embedding 服务
 * 使用 Transformers.js 提供完全本地的向量生成，无需 OpenAI API
 */

import { pipeline, env } from '@xenova/transformers';

// 允许远程模型下载（首次运行需要）
env.allowRemoteModels = true;
// 设置模型缓存路径
env.localModelPath = './.models';

let embeddingPipeline = null;
let isInitializing = false;
let initPromise = null;

/**
 * 初始化本地 Embedding 模型
 */
async function initLocalEmbedding() {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log('📥 正在加载本地 Embedding 模型（首次运行需要下载）...');
      
      // 使用轻量级的多语言模型
      // 'Xenova/all-MiniLM-L6-v2' - 384维，快速，多语言支持
      // 'Xenova/bge-small-en-v1.5' - 384维，英文优化
      // 'Xenova/multilingual-e5-small' - 384维，多语言
      embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        {
          quantized: true, // 使用量化模型，减少内存占用
        }
      );

      console.log('✅ 本地 Embedding 模型加载完成');
      isInitializing = false;
      return embeddingPipeline;
    } catch (error) {
      isInitializing = false;
      console.error('❌ 加载本地 Embedding 模型失败:', error.message);
      console.log('💡 提示: 首次运行需要下载模型，请确保网络连接正常');
      throw error;
    }
  })();

  return initPromise;
}

/**
 * 生成文本的向量表示（使用本地模型）
 */
export async function generateEmbeddingLocal(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    // 确保模型已加载
    const model = await initLocalEmbedding();

    // 截断过长的文本
    const maxLength = 512; // 本地模型的 token 限制
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) 
      : text;

    // 生成向量
    const output = await model(truncatedText, {
      pooling: 'mean', // 使用 mean pooling
      normalize: true,  // 归一化
    });

    // 转换为数组
    const embedding = Array.from(output.data);

    return embedding;
  } catch (error) {
    console.error('Failed to generate local embedding:', error);
    throw error;
  }
}

/**
 * 批量生成向量
 */
export async function generateEmbeddingsBatchLocal(texts, batchSize = 10) {
  const embeddings = [];
  
  // 确保模型已加载
  await initLocalEmbedding();
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`生成向量 ${i + 1}-${Math.min(i + batchSize, texts.length)}/${texts.length}...`);
    
    const batchEmbeddings = await Promise.all(
      batch.map((text) => generateEmbeddingLocal(text))
    );
    
    embeddings.push(...batchEmbeddings);
  }
  
  return embeddings;
}

/**
 * 检查模型是否可用
 */
export async function checkLocalEmbeddingAvailable() {
  try {
    await initLocalEmbedding();
    return true;
  } catch (error) {
    return false;
  }
}
