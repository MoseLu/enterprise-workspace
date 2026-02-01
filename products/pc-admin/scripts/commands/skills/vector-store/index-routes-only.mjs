/**
 * 仅索引路由配置资源（使用本地 Embedding）
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractRoutes } from './resource-extractor.mjs';
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
 * 构建路由配置描述
 */
function buildRoutesDescription(routes, extracted) {
  const parts = [];
  
  parts.push(`路由配置: ${extracted.appName}`);
  parts.push(`路由数量: ${extracted.routeCount}`);
  
  if (extracted.routeNames && extracted.routeNames.length > 0) {
    const topNames = extracted.routeNames.slice(0, 10).join(', ');
    parts.push(`路由名称: ${topNames}`);
  }
  
  if (extracted.routes && extracted.routes.length > 0) {
    const topPaths = extracted.routes.slice(0, 10).map(r => r.path).join(', ');
    parts.push(`路由路径: ${topPaths}`);
  }
  
  if (extracted.components && extracted.components.length > 0) {
    const topComponents = extracted.components.slice(0, 10).join(', ');
    parts.push(`组件: ${topComponents}`);
  }
  
  if (extracted.hasGuards) {
    parts.push(`包含路由守卫`);
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引路由配置资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描路由配置
    console.log('📂 扫描路由配置文件...');
    const resources = await scanResourcesByType('routes');
    console.log(`找到 ${resources.length} 个路由配置文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到路由配置文件');
      return;
    }
    
    // 索引每个路由配置
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取路由信息
        const extracted = await extractRoutes(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildRoutesDescription(resource, extracted);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'routes',
          name: `${extracted.appName}-routes`,
          path: resource.relativePath,
          description: description,
          appName: hierarchyInfo.appName || extracted.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'routes',
          moduleName: hierarchyInfo.moduleName,
          routeCount: extracted.routeCount,
          routeNames: extracted.routeNames || [],
          routes: extracted.routes || [],
          components: extracted.components || [],
          hasGuards: extracted.hasGuards || false,
          tags: [extracted.appName, 'routes', ...(extracted.routeNames?.slice(0, 5) || [])],
        };
        
        // 添加到存储
        const id = `routes:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 5 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个路由配置...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 路由配置索引完成！共索引 ${indexed} 个路由配置`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
