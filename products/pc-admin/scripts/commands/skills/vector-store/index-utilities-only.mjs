/**
 * 仅索引工具库资源（使用本地 Embedding）
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractUtility } from './resource-extractor.mjs';
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
 * 构建工具函数描述
 */
function buildUtilityDescription(utility, extracted) {
  const parts = [];
  
  if (extracted.functions && extracted.functions.length > 0) {
    extracted.functions.forEach(func => {
      parts.push(`函数: ${func.name}`);
      if (func.params && func.params > 0) {
        parts.push(`参数数量: ${func.params}`);
      }
    });
  }
  
  // 从路径推断分类
  const pathParts = utility.relativePath.split(/[/\\]/);
  const utilsIndex = pathParts.findIndex(part => part === 'utils');
  if (utilsIndex >= 0 && utilsIndex < pathParts.length - 1) {
    const category = pathParts[utilsIndex + 1];
    parts.push(`分类: ${category}`);
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引工具库资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描工具库
    console.log('📂 扫描工具库文件...');
    const resources = await scanResourcesByType('utility');
    console.log(`找到 ${resources.length} 个工具库文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到工具库文件');
      return;
    }
    
    // 索引每个工具函数
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取工具函数信息
        const extracted = await extractUtility(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildUtilityDescription(resource, extracted);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 从路径提取分类
        let category = 'misc';
        const pathParts = resource.relativePath.split(/[/\\]/);
        const utilsIndex = pathParts.findIndex(part => part === 'utils');
        if (utilsIndex >= 0 && utilsIndex < pathParts.length - 1) {
          category = pathParts[utilsIndex + 1];
        }
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'utility',
          name: extracted.functions?.[0]?.name || resource.relativePath.split('/').pop().replace('.ts', ''),
          path: resource.relativePath,
          description: description,
          category: category,
          functions: extracted.functions || [],
          tags: [category, ...(extracted.functions?.map(f => f.name) || [])],
          // 层级信息
          appName: hierarchyInfo.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'utils',
          moduleName: hierarchyInfo.moduleName,
        };
        
        // 添加到存储
        const id = `utility:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 10 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个工具函数...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 工具库索引完成！共索引 ${indexed} 个工具函数`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
