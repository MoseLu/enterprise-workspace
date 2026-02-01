/**
 * 仅索引 Composables 资源（使用本地 Embedding）
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractComposable } from './resource-extractor.mjs';
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
 * 构建 Composable 描述
 */
function buildComposableDescription(composable, extracted) {
  const parts = [];
  
  if (extracted.composables && extracted.composables.length > 0) {
    extracted.composables.forEach(comp => {
      parts.push(`Composable: ${comp.name}`);
      if (comp.params && comp.params.length > 0) {
        parts.push(`参数: ${comp.params.join(', ')}`);
      }
      if (comp.description) {
        parts.push(`说明: ${comp.description.substring(0, 100)}`);
      }
    });
  }
  
  // 从路径推断分类
  const pathParts = composable.relativePath.split(/[/\\]/);
  const composablesIndex = pathParts.findIndex(part => part === 'composables');
  if (composablesIndex >= 0 && composablesIndex < pathParts.length - 1) {
    const category = pathParts[composablesIndex + 1];
    parts.push(`分类: ${category}`);
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引 Composables 资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描 Composables
    console.log('📂 扫描 Composables 文件...');
    const resources = await scanResourcesByType('composable');
    console.log(`找到 ${resources.length} 个 Composables 文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到 Composables 文件');
      return;
    }
    
    // 索引每个 Composable
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取 Composable 信息
        const extracted = await extractComposable(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildComposableDescription(resource, extracted);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 从路径提取分类
        let category = 'misc';
        const pathParts = resource.relativePath.split(/[/\\]/);
        const composablesIndex = pathParts.findIndex(part => part === 'composables');
        if (composablesIndex >= 0 && composablesIndex < pathParts.length - 1) {
          category = pathParts[composablesIndex + 1];
        }
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'composable',
          name: extracted.composables?.[0]?.name || resource.relativePath.split('/').pop().replace('.ts', ''),
          path: resource.relativePath,
          description: description,
          category: category,
          composables: extracted.composables || [],
          tags: [category, ...(extracted.composables?.map(c => c.name) || [])],
          // 层级信息
          appName: hierarchyInfo.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'composables',
          moduleName: hierarchyInfo.moduleName,
        };
        
        // 添加到存储
        const id = `composable:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 10 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个 Composables...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ Composables 索引完成！共索引 ${indexed} 个 Composables`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
