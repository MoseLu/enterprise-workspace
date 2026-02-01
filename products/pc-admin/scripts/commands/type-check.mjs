#!/usr/bin/env node
/**
 * Type-check 命令管理脚本（向后兼容接口）
 * 用法: node scripts/commands/type-check.mjs [app-name]
 * 示例: node scripts/commands/type-check.mjs system
 * 
 * 注意：此文件保持向后兼容，内部调用新的处理器
 */

import { handleTypeCheck } from './handlers/type-check.mjs';
import { executeCommand } from './utils.mjs';

const args = process.argv.slice(2);
const appName = args.find(arg => !arg.startsWith('--'));

if (!appName) {
  // 所有应用：使用 turbo
  const result = executeCommand('node scripts/commands/tools/turbo.js run type-check');
  if (!result.success) {
    process.exit(result.exitCode);
  }
} else {
  // 单个应用：使用新的处理器
  await handleTypeCheck(appName);
}

