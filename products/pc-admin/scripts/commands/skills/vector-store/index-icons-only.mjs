/**
 * 仅索引图标资源（不依赖 OpenAI API）
 * 使用简化的描述文本进行索引
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractIcon } from './resource-extractor.mjs';
import { extractHierarchyInfo } from './hierarchy-utils.mjs';
import { readFileSync } from 'fs';

/**
 * 生成简单的向量（用于测试，不依赖 OpenAI）
 * 使用本地 Embedding 模型或降级到简单哈希
 */
async function generateSimpleEmbedding(text) {
  // 尝试使用本地 Embedding 模型
  try {
    const { generateEmbeddingLocal } = await import('./local-embedding.mjs');
    return await generateEmbeddingLocal(text);
  } catch (error) {
    // 降级到简单哈希向量（384维，匹配本地模型）
    console.warn('本地 Embedding 模型不可用，使用简单哈希向量:', error.message);
    
    const hash = text.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    
    const vector = new Array(384).fill(0);
    // 基于哈希值生成一些非零值
    for (let i = 0; i < 50; i++) {
      const index = Math.abs(hash + i * 7) % 384;
      vector[index] = (Math.sin(hash + i) * 0.1);
    }
    
    // 归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }
}

/**
 * 构建图标描述
 */
function buildIconDescription(icon, extracted) {
  const parts = [];
  
  parts.push(`Icon: ${extracted.name}`);
  parts.push(`Category: ${extracted.category}`);
  
  // 根据分类添加用途描述
  const categoryDescriptions = {
    'actions': '操作按钮、工具栏、功能按钮',
    'analytics': '数据分析、统计报表、监控',
    'commerce': '商业、订单、商品、购物',
    'communication': '通信、消息、通知、社交',
    'iot': '物联网、设备',
    'location': '位置、地图、定位',
    'media': '媒体、文件、图片、视频',
    'micro': '微应用、子应用标识',
    'misc': '通用、杂项',
    'navigation': '导航、菜单、方向',
    'people': '人员、用户、团队、部门',
    'status': '状态、成功、失败、警告',
    'system': '系统、设置、主题',
  };
  
  if (categoryDescriptions[extracted.category]) {
    parts.push(`用途: ${categoryDescriptions[extracted.category]}`);
  }
  
  // 根据图标名称推断用途
  const nameHints = {
    'export': '导出、下载',
    'import': '导入、上传',
    'delete': '删除、移除',
    'edit': '编辑、修改',
    'add': '添加、新增',
    'plus': '添加、新增',
    'search': '搜索、查找',
    'user': '用户、人员',
    'settings': '设置、配置',
    'home': '首页、主页',
    'menu': '菜单、导航',
  };
  
  for (const [key, hint] of Object.entries(nameHints)) {
    if (extracted.name.toLowerCase().includes(key)) {
      parts.push(`功能: ${hint}`);
      break;
    }
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引图标资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描图标
    console.log('📂 扫描图标文件...');
    const resources = await scanResourcesByType('icon');
    console.log(`找到 ${resources.length} 个图标文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到图标文件');
      return;
    }
    
    // 索引每个图标
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取图标信息
        const extracted = extractIcon(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildIconDescription(resource, extracted);
        
      // 生成向量（优先使用本地模型）
      const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 从路径提取分类（如果提取器没有提取到）
        let category = extracted.category;
        if (!category || category === 'root') {
          const pathParts = resource.relativePath.split(/[/\\]/);
          const iconsIndex = pathParts.findIndex(part => part === 'icons');
          if (iconsIndex >= 0 && iconsIndex < pathParts.length - 1) {
            category = pathParts[iconsIndex + 1];
          }
        }
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'icon',
          name: extracted.name,
          path: resource.relativePath,
          description: description,
          category: category || 'misc',
          tags: [category || 'misc', extracted.name],
          // 层级信息
          appName: hierarchyInfo.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'icons',
          moduleName: hierarchyInfo.moduleName,
        };
        
        // 添加到存储
        const id = `icon:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 10 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个图标...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 图标索引完成！共索引 ${indexed} 个图标`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
    // 显示一些示例
    console.log('📋 索引的图标示例：');
    const allResources = store.getAllResources();
    allResources.slice(0, 10).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.category}) - ${r.path}`);
    });
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
