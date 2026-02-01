/**
 * 索引所有应用内的资源
 * 扫描所有应用（apps/*）下的 composables, routes, stores, utils, services, config 等
 */

import { getStore } from './local-vector-store.mjs';
import { glob } from 'glob';
import { relative, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, statSync } from 'fs';
import { extractHierarchyInfo } from './hierarchy-utils.mjs';
import { extractComposable, extractRoutes, extractStores, extractUtility } from './resource-extractor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  return join(__dirname, '../../../../');
}

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
 * 扫描应用资源
 */
async function scanAppResources() {
  const projectRoot = getProjectRoot();
  const resources = [];
  
  // 扫描应用内的各种资源类型
  const patterns = [
    // Composables
    'apps/*/src/composables/**/*.ts',
    'apps/*/src/modules/**/composables/**/*.ts',
    // Routes
    'apps/*/src/router/**/*.ts',
    'apps/*/src/routes/**/*.ts',
    // Stores
    'apps/*/src/store/**/*.ts',
    'apps/*/src/stores/**/*.ts',
    // Utils
    'apps/*/src/utils/**/*.ts',
    // Services
    'apps/*/src/services/**/*.ts',
    // Config
    'apps/*/src/config/**/*.ts',
    // Modules
    'apps/*/src/modules/**/*.ts',
  ];
  
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
      absolute: true,
    });
    
    for (const filePath of files) {
      const relativePath = relative(projectRoot, filePath);
      const stats = statSync(filePath);
      
      // 确定资源类型
      let resourceType = 'other';
      if (relativePath.includes('/composables/')) {
        resourceType = 'composable';
      } else if (relativePath.includes('/router/') || relativePath.includes('/routes/')) {
        resourceType = 'routes';
      } else if (relativePath.includes('/store') || relativePath.includes('/stores/')) {
        resourceType = 'stores';
      } else if (relativePath.includes('/utils/')) {
        resourceType = 'utility';
      } else if (relativePath.includes('/services/')) {
        resourceType = 'service';
      } else if (relativePath.includes('/config/')) {
        resourceType = 'config';
      }
      
      resources.push({
        type: resourceType,
        path: filePath,
        relativePath,
        size: stats.size,
        modifiedTime: stats.mtimeMs,
      });
    }
  }
  
  return resources;
}

/**
 * 构建资源描述
 */
function buildResourceDescription(resource, extracted, hierarchyInfo) {
  const parts = [];
  
  if (resource.type === 'composable' && extracted.composables) {
    extracted.composables.forEach(comp => {
      parts.push(`Composable: ${comp.name}`);
    });
  } else if (resource.type === 'routes' && extracted.routes) {
    parts.push(`路由配置: ${extracted.appName}`);
    parts.push(`路由数量: ${extracted.routeCount}`);
  } else if (resource.type === 'stores' && extracted.storeName) {
    parts.push(`状态管理: ${extracted.storeName}`);
    parts.push(`应用: ${extracted.appName}`);
  } else if (resource.type === 'utility' && extracted.functions) {
    extracted.functions.forEach(func => {
      parts.push(`工具函数: ${func.name}`);
    });
  }
  
  if (hierarchyInfo.appName) {
    parts.push(`应用: ${hierarchyInfo.appName}`);
  }
  
  if (hierarchyInfo.moduleName) {
    parts.push(`模块: ${hierarchyInfo.moduleName}`);
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引所有应用内的资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描应用资源
    console.log('📂 扫描应用资源文件...');
    const resources = await scanAppResources();
    console.log(`找到 ${resources.length} 个应用资源文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到应用资源文件');
      return;
    }
    
    // 索引每个资源
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 提取资源信息
        let extracted = null;
        try {
          if (resource.type === 'composable') {
            extracted = await extractComposable(resource.path);
          } else if (resource.type === 'routes') {
            extracted = extractRoutes(resource.path);
          } else if (resource.type === 'stores') {
            extracted = extractStores(resource.path);
          } else if (resource.type === 'utility') {
            extracted = await extractUtility(resource.path);
          }
        } catch (error) {
          // 提取失败，创建简单结果
          extracted = null;
        }
        
        // 对于 service 和 config，或提取失败的情况，创建简单的提取结果
        if (!extracted) {
          if (resource.type === 'service' || resource.type === 'config' || resource.type === 'other') {
            extracted = {
              name: resource.relativePath.split('/').pop().replace(/\.(ts|vue)$/, ''),
              type: resource.type,
            };
          } else {
            // 即使提取失败，也尝试索引（使用文件名作为名称）
            extracted = {
              name: resource.relativePath.split('/').pop().replace(/\.(ts|vue)$/, ''),
              type: resource.type,
            };
          }
        }
        
        // 构建描述
        const description = buildResourceDescription(resource, extracted || {}, hierarchyInfo);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 构建元数据
        const resourceName = extracted?.name || 
                            extracted?.storeName || 
                            extracted?.appName || 
                            resource.relativePath.split('/').pop().replace(/\.(ts|vue)$/, '');
        
        const metadata = {
          type: resource.type,
          name: resourceName,
          path: resource.relativePath,
          description: description || `${resource.type}: ${resourceName}`,
          category: hierarchyInfo.resourceCategory || resource.type,
          tags: [hierarchyInfo.appName, hierarchyInfo.resourceCategory || resource.type].filter(Boolean),
          // 层级信息
          appName: hierarchyInfo.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || resource.type,
          moduleName: hierarchyInfo.moduleName,
          // 扩展信息
          extended: extracted || {},
        };
        
        // 添加到存储
        const id = `${resource.type}:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 50 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个应用资源...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 应用资源索引完成！共索引 ${indexed} 个资源`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
