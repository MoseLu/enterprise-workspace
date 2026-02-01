#!/usr/bin/env node
/**
 * 清理构建目录
 */
// logger removed, use console instead
import { existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

if (existsSync(distDir)) {
  try {
    rmSync(distDir, { recursive: true, force: true });
    console.info('✅ dist 目录已清理');
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  }
} else {
  console.info('ℹ️  dist 目录不存在，无需清理');
}
