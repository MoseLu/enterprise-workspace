/**
 * 仅索引文档资源（使用本地 Embedding）
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractDocs } from './resource-extractor.mjs';
import { extractHierarchyInfo } from './hierarchy-utils.mjs';

/**
 * 生成简单的向量
 */
async function generateSimpleEmbedding(text) {
  try {
    const { generateEmbeddingLocal } = await import('./local-embedding.mjs');
    return await generateEmbeddingLocal(text);
  } catch (error) {
    console.warn('本地 Embedding 模型不可用，使用简单哈希向量:', error.message);
    
    const hash = text.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    
    const vector = new Array(384).fill(0);
    for (let i = 0; i < 50; i++) {
      const index = Math.abs(hash + i * 7) % 384;
      vector[index] = (Math.sin(hash + i) * 0.1);
    }
    
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }
}

/**
 * 构建文档描述
 */
function buildDocsDescription(docs, extracted) {
  const parts = [];
  
  parts.push(`文档: ${extracted.title}`);
  parts.push(`分类: ${extracted.category}`);
  
  if (extracted.headings && extracted.headings.length > 0) {
    const topHeadings = extracted.headings.slice(0, 10).join(', ');
    parts.push(`章节: ${topHeadings}`);
  }
  
  if (extracted.concepts && extracted.concepts.length > 0) {
    const topConcepts = extracted.concepts.slice(0, 10).join(', ');
    parts.push(`关键概念: ${topConcepts}`);
  }
  
  if (extracted.codeBlocks && extracted.codeBlocks.length > 0) {
    parts.push(`包含 ${extracted.codeBlocks.length} 个代码示例`);
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引文档资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描文档文件
    console.log('📂 扫描文档文件...');
    const resources = await scanResourcesByType('docs');
    console.log(`找到 ${resources.length} 个文档文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到文档文件');
      return;
    }
    
    // 索引每个文档
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取文档信息
        const extracted = await extractDocs(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildDocsDescription(resource, extracted);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 构建元数据
        const metadata = {
          type: 'docs',
          name: extracted.title,
          path: resource.relativePath,
          description: description,
          category: extracted.category,
          headings: extracted.headings || [],
          concepts: extracted.concepts || [],
          codeBlocks: extracted.codeBlocks || [],
          tags: [extracted.category, ...(extracted.concepts?.slice(0, 10) || [])],
          // 层级信息
          appName: hierarchyInfo.appName || 'docs',
          appType: hierarchyInfo.appType || 'package',
          resourceCategory: hierarchyInfo.resourceCategory || 'docs',
          moduleName: hierarchyInfo.moduleName,
        };
        
        // 添加到存储
        const id = `docs:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 10 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个文档...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 文档索引完成！共索引 ${indexed} 个文档`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
