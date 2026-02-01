;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../guides/backend');

// 服务配置映射
const serviceConfigs = {
  'system-service.md': {
    title: 'System Service (系统服务)',
    order: 2,
    tags: ['guides', 'backend', 'system', 'microservices']
  },
  'admin-service.md': {
    title: 'Admin Service (管理服务)',
    order: 3,
    tags: ['guides', 'backend', 'admin', 'microservices']
  },
  'upload-service.md': {
    title: 'Upload Service (上传服务)',
    order: 4,
    tags: ['guides', 'backend', 'upload', 'microservices']
  },
  'search-service.md': {
    title: 'Search Service (搜索服务)',
    order: 5,
    tags: ['guides', 'backend', 'search', 'microservices']
  },
  'notice-service.md': {
    title: 'Notice Service (通知服务)',
    order: 6,
    tags: ['guides', 'backend', 'notice', 'microservices']
  },
  'dispatch-service.md': {
    title: 'Dispatch Service (调度服务)',
    order: 7,
    tags: ['guides', 'backend', 'dispatch', 'microservices']
  },
  'common.md': {
    title: 'Common Module (公共模块)',
    order: 8,
    tags: ['guides', 'backend', 'common', 'microservices']
  }
};

function updateFrontmatter(filePath: string, config: any) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 查找现有的frontmatter
    const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
    const match = content.match(frontmatterRegex);

    if (match) {
      // 替换frontmatter
      const newFrontmatter = `---
title: ${config.title}
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - ${config.tags.join('\n  - ')}
sidebar_label: ${config.title.split(' (')[0]}
sidebar_order: ${config.order}
sidebar_group: guides-backend
---

`;

      const newContent = content.replace(frontmatterRegex, newFrontmatter);
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.info(`✅ Updated frontmatter for ${path.basename(filePath)}`);
    } else {
      console.info(`❌ No frontmatter found in ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
  }
}

// 处理所有后端服务文档
Object.entries(serviceConfigs).forEach(([filename, config]) => {
  const filePath = path.join(backendDir, filename);
  if (fs.existsSync(filePath)) {
    updateFrontmatter(filePath, config);
  } else {
    console.info(`❌ File not found: ${filePath}`);
  }
});

console.info('🎉 Backend frontmatter update completed!');
