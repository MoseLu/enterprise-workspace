/**
 * 仅索引状态管理资源（使用本地 Embedding）
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractStores } from './resource-extractor.mjs';
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
 * 构建状态管理描述
 */
function buildStoresDescription(stores, extracted) {
  const parts = [];
  
  parts.push(`状态管理: ${extracted.storeName}`);
  parts.push(`应用: ${extracted.appName}`);
  
  if (extracted.stateFields && extracted.stateFields.length > 0) {
    const topFields = extracted.stateFields.slice(0, 10).join(', ');
    parts.push(`State 字段: ${topFields}`);
  }
  
  if (extracted.actions && extracted.actions.length > 0) {
    const topActions = extracted.actions.slice(0, 10).join(', ');
    parts.push(`Actions: ${topActions}`);
  }
  
  if (extracted.getters && extracted.getters.length > 0) {
    const topGetters = extracted.getters.slice(0, 10).join(', ');
    parts.push(`Getters: ${topGetters}`);
  }
  
  if (extracted.hasModules) {
    parts.push(`包含模块`);
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引状态管理资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描状态管理文件
    console.log('📂 扫描状态管理文件...');
    const resources = await scanResourcesByType('stores');
    console.log(`找到 ${resources.length} 个状态管理文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到状态管理文件');
      return;
    }
    
    // 索引每个状态管理文件
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取状态管理信息
        const extracted = await extractStores(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildStoresDescription(resource, extracted);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'stores',
          name: `${extracted.appName}-${extracted.storeName}`,
          path: resource.relativePath,
          description: description,
          appName: hierarchyInfo.appName || extracted.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'stores',
          moduleName: hierarchyInfo.moduleName,
          storeName: extracted.storeName,
          stateFields: extracted.stateFields || [],
          actions: extracted.actions || [],
          getters: extracted.getters || [],
          hasModules: extracted.hasModules || false,
          tags: [extracted.appName, 'store', extracted.storeName, ...(extracted.stateFields?.slice(0, 5) || [])],
        };
        
        // 添加到存储
        const id = `stores:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 5 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个状态管理文件...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 状态管理索引完成！共索引 ${indexed} 个状态管理文件`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
