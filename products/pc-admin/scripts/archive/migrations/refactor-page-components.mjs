#!/usr/bin/env node

/**
 * 批量重构页面组件，统一使用 .page 容器 BEM 规范
 * 
 * 功能：
 * 1. 将自定义 page 类名（如 .profile-page）替换为 .page
 * 2. 添加 .page__body 包裹结构（如果缺失）
 * 3. 删除自定义 page 类的样式定义
 * 
 * 使用方式：
 *   node scripts/refactor-page-components.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 递归查找所有页面组件
function findPageFiles(dir, fileList = [], baseDir = dir) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          // 跳过 node_modules 和 dist
          if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) {
            continue;
          }
          findPageFiles(filePath, fileList, baseDir);
        } else if (file.endsWith('.vue')) {
          // 检查是否在 pages 或 views 目录下
          const relPath = relative(baseDir, filePath);
          if (relPath.includes('pages') || relPath.includes('views')) {
            fileList.push(filePath);
          }
        }
      } catch (err) {
        // 忽略无法访问的文件
        continue;
      }
    }
  } catch (err) {
    // 忽略无法访问的目录
  }
  
  return fileList;
}

// 查找所有页面组件
const appsDir = join(rootDir, 'apps');
const pageFiles = findPageFiles(appsDir);

console.log(`找到 ${pageFiles.length} 个页面组件，开始批量重构...\n`);

let processedCount = 0;
let modifiedCount = 0;

pageFiles.forEach(file => {
  const filePath = file; // file 已经是绝对路径
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 1. 替换根元素类名（从 .xxx-page 到 .page）
  // 匹配第一个 <div class="xxx" 或 <div class='xxx'
  const rootDivMatch = content.match(/<div\s+class=["']([^"']*)["']/);
  if (rootDivMatch) {
    const oldClass = rootDivMatch[1];
    // 如果包含 -page 结尾的类名，替换为 page
    if (oldClass.includes('-page') && !oldClass.includes('page__')) {
      const newClass = oldClass.replace(/\b[\w-]+-page\b/g, 'page').trim();
      if (newClass !== oldClass) {
        content = content.replace(
          new RegExp(`<div\\s+class=["']${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`),
          `<div class="${newClass}"`
        );
        modified = true;
      }
    }
    // 如果根元素没有 page 类，且是页面组件，添加 page 类
    else if (!oldClass.includes('page') && !oldClass.includes('admin-home') && !oldClass.includes('scanner-page')) {
      // 检查是否是页面组件（在 views 或 pages 目录下）
      const relPath = relative(rootDir, filePath);
      if (relPath.includes('/views/') || relPath.includes('/pages/')) {
        const newClass = oldClass ? `${oldClass} page` : 'page';
        content = content.replace(
          new RegExp(`<div\\s+class=["']${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`),
          `<div class="${newClass}"`
        );
        modified = true;
      }
    }
  }
  
  // 2. 如果模板中没有 .page__body，添加包裹结构（简化处理，避免破坏现有结构）
  // 注意：这一步需要谨慎，因为可能破坏现有布局
  // 暂时跳过，让开发者手动添加 .page__body
  
  // 2. 替换内部 BEM 类名（从 xxx-page__xxx 到 page__xxx）
  // 替换所有 -page__ 为 __（BEM 规范）
  const bemClassMatch = content.match(/-page__/g);
  if (bemClassMatch) {
    content = content.replace(/-page__/g, '__');
    modified = true;
  }
  
  // 3. 替换独立的 -page 类名（如 class="files-page"）
  // 但保留已经是 page 或 page__ 开头的
  content = content.replace(/\b([\w-]+)-page\b(?![_])/g, (match, prefix) => {
    // 如果已经是 page 开头，不替换
    if (prefix === 'page' || prefix.startsWith('page')) {
      return match;
    }
    // 如果是 scanner-page 等特殊类名，保留（这些可能是组件特定的）
    if (['scanner', 'login', 'register', 'home', 'admin'].includes(prefix)) {
      return match;
    }
    // 其他情况替换为 page
    return 'page';
  });
  
  // 4. 删除自定义 page 类的样式定义
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    const styleContent = styleMatch[1];
    // 删除 .xxx-page { ... } 样式块（但保留 .page 和 .page__ 开头的）
    const newStyleContent = styleContent.replace(
      /\.[\w-]+-page(?![_])\s*\{[^}]*\}/g,
      ''
    );
    if (styleContent !== newStyleContent) {
      content = content.replace(styleContent, newStyleContent);
      modified = true;
    }
  }
  
  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    modifiedCount++;
    const relPath = relative(rootDir, filePath);
    console.log(`✓ ${relPath}`);
  }
  processedCount++;
});

console.log(`\n批量重构完成！`);
console.log(`处理文件数: ${processedCount}`);
console.log(`修改文件数: ${modifiedCount}`);
console.log(`\n注意：此脚本仅做了基础的类名替换，具体页面结构需要根据实际情况手动调整。`);
