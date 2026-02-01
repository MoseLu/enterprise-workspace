#!/usr/bin/env node

// 简单的包装脚本，用于避免 Windows PowerShell 的"输入行太长"问题
const { spawn } = require('child_process');
const path = require('path');

// 尝试找到 turbo 的可执行文件
let turboPath;
const fs = require('fs');
const isWindows = process.platform === 'win32';
const rootNodeModules = path.join(__dirname, '..', 'node_modules');

// 在 Windows 上，.cmd 文件会设置很长的 NODE_PATH，导致 PowerShell 报错
// 所以我们需要直接调用 turbo 的 JavaScript 文件，绕过 .cmd 文件

// 尝试查找 turbo 的可执行文件
// 从 .cmd 文件中可以看到，它调用的是 "%~dp0\..\turbo\bin\turbo"
// 也就是从 .bin 目录找到 turbo/bin/turbo

// 首先尝试在 pnpm 的 .pnpm 目录中查找（pnpm monorepo 的结构）
const pnpmDir = path.join(rootNodeModules, '.pnpm');
if (fs.existsSync(pnpmDir)) {
  const entries = fs.readdirSync(pnpmDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('turbo@')) {
      // 尝试查找 turbo.js（优先）或 turbo（无扩展名）
      const possiblePaths = [
        path.join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo.js'),
        path.join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo'),
      ];
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          turboPath = possiblePath;
          break;
        }
      }
      if (turboPath) break;
    }
  }
}

// 如果还没找到，尝试直接在 node_modules 中查找
if (!turboPath) {
  const possiblePaths = [
    path.join(rootNodeModules, 'turbo', 'bin', 'turbo.js'),
    path.join(rootNodeModules, 'turbo', 'bin', 'turbo'),
  ];
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      turboPath = possiblePath;
      break;
    }
  }
}

// 如果还是找不到，尝试使用 require.resolve（从当前工作目录查找）
if (!turboPath) {
  try {
    turboPath = require.resolve('turbo/bin/turbo.js');
  } catch (e) {
    try {
      turboPath = require.resolve('turbo/bin/turbo');
    } catch (e2) {
      // 仍然找不到
    }
  }
}

// 如果还是找不到，报错
if (!turboPath) {
  console.error('Cannot find turbo. Please run: pnpm install');
  console.error('Searched in:', rootNodeModules);
  process.exit(1);
}

// 运行 turbo，传递所有参数
// 关键：在 Windows 上，清除 NODE_PATH 环境变量以避免"环境变量名或值太长"错误
// pnpm 的 PowerShell 脚本会设置很长的 NODE_PATH，导致 PowerShell 报错
const args = process.argv.slice(2);
const env = { ...process.env };
if (isWindows) {
  // 在 Windows 上，清除 NODE_PATH 以避免长度限制问题
  // Node.js 会自动解析 node_modules，不需要 NODE_PATH
  delete env.NODE_PATH;
}
const child = spawn('node', [turboPath, ...args], {
  stdio: 'inherit',
  shell: false,
  env: env,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to start turbo:', err);
  process.exit(1);
});

