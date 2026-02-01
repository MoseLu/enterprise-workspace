/**
 * 仅索引国际化资源（使用本地 Embedding）
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractLocale } from './resource-extractor.mjs';
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
 * 构建国际化资源描述
 */
function buildLocaleDescription(locale, extracted) {
  const parts = [];
  
  parts.push(`国际化资源: ${extracted.language}`);
  parts.push(`键数量: ${extracted.keyCount}`);
  
  if (extracted.keys && extracted.keys.length > 0) {
    const topKeys = extracted.keys.slice(0, 20).join(', ');
    parts.push(`主要键: ${topKeys}`);
  }
  
  // 从路径推断应用或模块
  const pathParts = locale.relativePath.split(/[/\\]/);
  const localesIndex = pathParts.findIndex(part => part === 'locales');
  if (localesIndex >= 0) {
    if (localesIndex > 0) {
      const appOrModule = pathParts[localesIndex - 1];
      parts.push(`所属: ${appOrModule}`);
    }
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引国际化资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描国际化资源
    console.log('📂 扫描国际化文件...');
    const resources = await scanResourcesByType('locale');
    console.log(`找到 ${resources.length} 个国际化文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到国际化文件');
      return;
    }
    
    // 索引每个国际化资源
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取国际化信息
        const extracted = await extractLocale(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildLocaleDescription(resource, extracted);
        
        // 生成向量
        const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 从路径提取应用或模块
        let appOrModule = 'global';
        const pathParts = resource.relativePath.split(/[/\\]/);
        const localesIndex = pathParts.findIndex(part => part === 'locales');
        if (localesIndex > 0) {
          appOrModule = pathParts[localesIndex - 1];
        }
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'locale',
          name: `${appOrModule}-${extracted.language}`,
          path: resource.relativePath,
          description: description,
          language: extracted.language,
          appOrModule: appOrModule,
          keyCount: extracted.keyCount,
          keys: extracted.keys || [],
          tags: [extracted.language, appOrModule, ...(extracted.keys?.slice(0, 10) || [])],
          // 层级信息
          appName: hierarchyInfo.appName || appOrModule,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'locales',
          moduleName: hierarchyInfo.moduleName,
        };
        
        // 添加到存储
        const id = `locale:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 10 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个国际化资源...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 国际化资源索引完成！共索引 ${indexed} 个国际化资源`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
