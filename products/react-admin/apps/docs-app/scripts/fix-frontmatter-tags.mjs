#!/usr/bin/env node

/**
 * 修复 frontmatter 中重复的 tags 键
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const enDir = join(__dirname, '../en');

function scanMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...scanMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // ignore
  }
  return files;
}

function fixTags(content) {
  // 匹配 frontmatter 中的重复 tags
  const tagsRegex = /^(tags:\s*$\n(?:- .+\n)+)+/m;
  const match = content.match(tagsRegex);
  
  if (match) {
    // 提取所有 tag 值
    const tags = [];
    const lines = match[0].split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('- ')) {
        tags.push(line.trim().substring(2));
      }
    }
    
    // 替换为单个 tags 块
    const newTags = 'tags:\n' + tags.map(t => `- ${t}`).join('\n') + '\n';
    return content.replace(/^(tags:\s*$\n(?:- .+\n)+)+/m, newTags);
  }
  
  return content;
}

// 主函数
const files = scanMarkdownFiles(enDir);
let fixed = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf-8');
    const fixedContent = fixTags(content);
    if (fixedContent !== content) {
      writeFileSync(file, fixedContent, 'utf-8');
      fixed++;
    }
  } catch (error) {
    // ignore
  }
}

console.log(`Fixed ${fixed} files`);
