/**
 * 仅索引组件资源（使用本地 Embedding）
 * 索引项目中的 Vue 组件
 */

import { getStore } from './local-vector-store.mjs';
import { scanResourcesByType } from './resource-scanner.mjs';
import { extractComponent } from './resource-extractor.mjs';
import { extractHierarchyInfo } from './hierarchy-utils.mjs';

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
 * 构建组件描述
 */
function buildComponentDescription(component, extracted) {
  const parts = [];
  
  // 组件名称
  parts.push(`组件: ${extracted.name}`);
  
  // Props 信息
  if (extracted.props && extracted.props.length > 0) {
    parts.push(`Props: ${extracted.props.join(', ')}`);
  }
  
  // 组件功能描述（从注释中提取）
  if (extracted.comments && extracted.comments.length > 0) {
    const mainComment = extracted.comments[0];
    if (mainComment && mainComment.length > 0) {
      parts.push(`说明: ${mainComment.substring(0, 100)}`);
    }
  }
  
  // 从路径推断组件分类
  const pathParts = component.relativePath.split(/[/\\]/);
  const componentsIndex = pathParts.findIndex(part => part === 'components');
  if (componentsIndex >= 0 && componentsIndex < pathParts.length - 1) {
    const category = pathParts[componentsIndex + 1];
    parts.push(`分类: ${category}`);
    
    // 根据分类添加用途描述
    const categoryDescriptions = {
      'table': '表格组件、数据展示、列表',
      'form': '表单组件、输入、验证',
      'dialog': '对话框、弹窗、模态框',
      'button': '按钮组件、操作',
      'input': '输入组件、表单输入',
      'select': '选择组件、下拉选择',
      'upload': '上传组件、文件上传',
      'pagination': '分页组件、翻页',
      'tree': '树形组件、层级展示',
      'menu': '菜单组件、导航',
      'layout': '布局组件、页面结构',
      'card': '卡片组件、内容容器',
      'badge': '徽章组件、标签、提示',
      'tooltip': '提示组件、悬浮提示',
      'popover': '弹出框组件',
      'drawer': '抽屉组件、侧边栏',
      'tabs': '标签页组件、切换',
    };
    
    if (categoryDescriptions[category]) {
      parts.push(`用途: ${categoryDescriptions[category]}`);
    }
  }
  
  // 模板信息
  if (extracted.hasTemplate) {
    parts.push('包含模板');
  }
  
  return parts.join('。');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始索引组件资源...\n');
  
  try {
    const store = getStore();
    
    // 扫描组件
    console.log('📂 扫描组件文件...');
    const resources = await scanResourcesByType('component');
    console.log(`找到 ${resources.length} 个组件文件\n`);
    
    if (resources.length === 0) {
      console.log('⚠️  未找到组件文件');
      return;
    }
    
    // 索引每个组件
    let indexed = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      try {
        // 提取组件信息
        const extracted = extractComponent(resource.path);
        if (!extracted) {
          console.warn(`⚠️  跳过: ${resource.relativePath}`);
          continue;
        }
        
        // 构建描述
        const description = buildComponentDescription(resource, extracted);
        
        // 生成向量（优先使用本地模型）
        const embedding = await generateSimpleEmbedding(description);
        
        // 从路径提取分类
        let category = 'misc';
        const pathParts = resource.relativePath.split(/[/\\]/);
        const componentsIndex = pathParts.findIndex(part => part === 'components');
        if (componentsIndex >= 0 && componentsIndex < pathParts.length - 1) {
          category = pathParts[componentsIndex + 1];
        }
        
        // 从路径提取层级信息
        const hierarchyInfo = extractHierarchyInfo(resource.relativePath);
        
        // 构建元数据（包含层级信息）
        const metadata = {
          type: 'component',
          name: extracted.name,
          path: resource.relativePath,
          description: description,
          category: category,
          props: extracted.props || [],
          tags: [category, extracted.name, ...(extracted.props || [])],
          // 层级信息
          appName: hierarchyInfo.appName,
          appType: hierarchyInfo.appType,
          resourceCategory: hierarchyInfo.resourceCategory || 'components',
          moduleName: hierarchyInfo.moduleName,
        };
        
        // 添加到存储
        const id = `component:${resource.relativePath}`;
        store.addResource(id, metadata, embedding);
        
        indexed++;
        if ((i + 1) % 10 === 0) {
          console.log(`已索引 ${i + 1}/${resources.length} 个组件...`);
        }
      } catch (error) {
        console.warn(`❌ 索引失败 ${resource.relativePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ 组件索引完成！共索引 ${indexed} 个组件`);
    console.log(`📊 当前存储中的资源总数: ${store.getCount()} 个\n`);
    
    // 显示一些示例
    console.log('📋 索引的组件示例：');
    const allResources = store.getAllResources();
    const componentResources = allResources.filter(r => r.type === 'component');
    componentResources.slice(0, 10).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.category}) - ${r.path}`);
    });
    
  } catch (error) {
    console.error('❌ 索引失败:', error);
    process.exit(1);
  }
}

main();
