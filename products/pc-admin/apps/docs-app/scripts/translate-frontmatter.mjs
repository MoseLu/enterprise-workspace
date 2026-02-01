#!/usr/bin/env node

/**
 * 批量翻译文档的 frontmatter（title, sidebar_label）
 * 注意：这只是基本翻译，实际文档内容需要人工翻译
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const enDir = join(__dirname, '../en');

// 常用翻译映射（用于自动翻译常见词汇）
const translations = {
  '快速开始': 'Quick Start',
  '项目概览': 'Project Overview',
  '项目结构': 'Project Structure',
  '开发指南': 'Development Guides',
  '组件开发': 'Component Development',
  '表单处理': 'Form Handling',
  '系统配置': 'System Configuration',
  '部署指南': 'Deployment Guide',
  '版本更新': 'Changelog',
  '架构决策': 'Architecture Decision Records',
  '技术提案': 'Request for Comments',
  '标准操作': 'Standard Operating Procedures',
  '首页': 'Home',
  '简介': 'Introduction',
};

/**
 * 简单翻译函数（仅用于常见词汇）
 */
function translate(text) {
  if (!text) return text;
  
  // 先尝试直接匹配
  if (translations[text]) {
    return translations[text];
  }
  
  // 如果无法自动翻译，返回原文本（标记需要人工翻译）
  return text;
}

/**
 * 解析和翻译 frontmatter
 */
function translateFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return content; // 没有 frontmatter，直接返回
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  
  // 解析 frontmatter
  let frontmatter = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inArray = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('- ')) {
      // 数组项
      currentValue.push(trimmed.substring(2));
      inArray = true;
    } else if (trimmed.includes(':')) {
      // 新键
      if (currentKey && currentValue.length > 0) {
        frontmatter[currentKey] = inArray ? currentValue : currentValue.join('');
        currentValue = [];
        inArray = false;
      }
      const [key, ...valueParts] = trimmed.split(':');
      currentKey = key.trim();
      const value = valueParts.join(':').trim();
      if (value) {
        currentValue = [value.replace(/^['"]|['"]$/g, '')];
        inArray = false;
      }
    } else if (currentKey && trimmed) {
      // 多行值
      currentValue.push(trimmed);
    }
  }
  
  if (currentKey && currentValue.length > 0) {
    frontmatter[currentKey] = inArray ? currentValue : currentValue.join('');
  }
  
  // 翻译 title 和 sidebar_label
  if (frontmatter.title) {
    const translated = translate(frontmatter.title);
    if (translated !== frontmatter.title) {
      frontmatter.title = translated;
    }
  }
  
  if (frontmatter.sidebar_label) {
    const translated = translate(frontmatter.sidebar_label);
    if (translated !== frontmatter.sidebar_label) {
      frontmatter.sidebar_label = translated;
    }
  }
  
  // 重新构建 frontmatter
  const newFrontmatterLines = [];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        newFrontmatterLines.push(`${key}:`);
        newFrontmatterLines.push(`- ${item}`);
      }
    } else {
      const formattedValue = typeof value === 'string' && (value.includes(':') || value.includes('\n'))
        ? `'${value}'`
        : value;
      newFrontmatterLines.push(`${key}: ${formattedValue}`);
    }
  }
  
  const newFrontmatter = '---\n' + newFrontmatterLines.join('\n') + '\n---\n';
  return newFrontmatter + body;
}

/**
 * 递归扫描目录下的所有 .md 文件
 */
function scanMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...scanMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Failed to scan ${dir}:`, error.message);
  }
  return files;
}

// 主函数
function main() {
  console.log('🔍 扫描 en/ 目录下的所有 Markdown 文件...');
  const files = scanMarkdownFiles(enDir);
  console.log(`找到 ${files.length} 个文件`);

  let translatedCount = 0;
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const translated = translateFrontmatter(content);
      if (translated !== content) {
        writeFileSync(file, translated, 'utf-8');
        translatedCount++;
        const relativePath = file.replace(enDir + '\\', '').replace(enDir + '/', '');
        console.log(`✅ 已翻译 frontmatter: ${relativePath}`);
      }
    } catch (error) {
      console.warn(`Failed to process ${file}:`, error.message);
    }
  }

  console.log(`\n✨ 完成！共翻译 ${translatedCount} 个文件的 frontmatter`);
  console.log('⚠️  注意：文档正文内容仍需要人工翻译');
}

main();
