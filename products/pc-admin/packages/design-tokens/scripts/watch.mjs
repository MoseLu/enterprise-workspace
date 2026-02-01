#!/usr/bin/env node

/**
 * Style Dictionary Watch 脚本
 * style-dictionary 4.3.1 不支持 --watch，使用 chokidar 实现监听
 */

import { execSync } from 'child_process';
import { watch } from 'chokidar';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const configPath = join(rootDir, 'config', 'style-dictionary.config.js');
const tokensDir = join(rootDir, 'tokens');

console.log('🔍 监听设计令牌文件变化...');
console.log(`📁 监听目录: ${tokensDir}`);
console.log(`⚙️  配置文件: ${configPath}\n`);

function build() {
  try {
    console.log('🔨 开始构建...');
    execSync('pnpm build', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ 构建完成\n');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
  }
}

// 首次构建
build();

// 监听文件变化
const watcher = watch(tokensDir, {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  persistent: true,
  ignoreInitial: true,
});

watcher.on('change', (path) => {
  console.log(`📝 文件变化: ${path}`);
  build();
});

watcher.on('add', (path) => {
  console.log(`➕ 新增文件: ${path}`);
  build();
});

watcher.on('unlink', (path) => {
  console.log(`🗑️  删除文件: ${path}`);
  build();
});

console.log('⏳ 等待文件变化...\n');

// 处理退出
process.on('SIGINT', () => {
  console.log('\n👋 停止监听');
  watcher.close();
  process.exit(0);
});
