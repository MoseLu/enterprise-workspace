#!/usr/bin/env node

/**
 * 非交互式发布推送脚本
 * 支持通过命令行参数指定版本号和标签消息
 * 
 * 使用方式：
 *   node scripts/commands/release/push-non-interactive.mjs --version=1.0.10 --tag-message="Scripts 架构重构完成"
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pushScript = join(__dirname, 'push.mjs');

// 解析命令行参数
const args = process.argv.slice(2);
const versionArg = args.find(arg => arg.startsWith('--version='));
const tagMessageArg = args.find(arg => arg.startsWith('--tag-message='));

if (!versionArg) {
  console.error('❌ 错误: 必须提供 --version 参数');
  console.error('   示例: node scripts/commands/release/push-non-interactive.mjs --version=1.0.10 --tag-message="版本描述"');
  process.exit(1);
}

const version = versionArg.split('=')[1];
const tagMessage = tagMessageArg ? tagMessageArg.split('=')[1] : `版本 v${version}`;

// 验证版本号格式
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('❌ 版本号格式不正确，应为 x.y.z 格式（如 1.0.10）');
  process.exit(1);
}

console.log(`🚀 开始发布流程...`);
console.log(`版本号: ${version}`);
console.log(`标签消息: ${tagMessage}`);
console.log(`\n注意: 由于发布脚本是交互式的，此包装脚本会启动交互式流程`);
console.log(`您需要在交互式提示中输入信息。\n`);

// 直接调用原始脚本（仍然是交互式的）
const child = spawn('node', [pushScript, ...args], {
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
