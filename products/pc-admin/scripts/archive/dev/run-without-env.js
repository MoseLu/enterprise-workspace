import { logger } from '../../../utils/logger.mjs';
#!/usr/bin/env node

// 通用包装脚本，用于避免 Windows PowerShell 的"输入行太长"问题
// 这个脚本会直接运行命令，不设置 NODE_PATH 环境变量
const { spawn } = require('child_process');
const path = require('path');

// 获取要运行的命令和参数
const [command, ...args] = process.argv.slice(2);

if (!command) {
  logger.error('Usage: node scripts/run-without-env.js <command> [args...]');
  process.exit(1);
}

// 创建一个干净的环境变量对象（排除可能导致问题的变量）
const cleanEnv = { ...process.env };
// 删除 NODE_PATH，避免命令过长
delete cleanEnv.NODE_PATH;

// 解析命令路径
let commandPath = null;
const fs = require('fs');
const isWindows = process.platform === 'win32';

if (command.includes('/') || command.includes('\\')) {
  // 如果是路径，直接使用
  commandPath = command;
} else {
  // 尝试在 node_modules/.bin 中查找（pnpm monorepo 的结构）
  const rootNodeModulesBin = path.join(__dirname, '..', 'node_modules', '.bin');

  // 在 Windows 上，优先查找 .cmd 文件
  if (isWindows) {
    const windowsCmd = path.join(rootNodeModulesBin, `${command}.cmd`);
    if (fs.existsSync(windowsCmd)) {
      commandPath = windowsCmd;
    }
  }

  // 如果没有找到 .cmd，尝试通过 require.resolve 找到命令的 package.json，然后找到 bin 文件
  if (!commandPath) {
    try {
      // 保存原始的 Module._resolveFilename，以便我们可以自定义查找逻辑
      // 首先尝试从根目录的 node_modules 查找（pnpm monorepo 的结构）
      const rootNodeModules = path.join(__dirname, '..', 'node_modules');

      // 尝试直接构建路径（pnpm 可能将包放在 .pnpm 目录下）
      // 先尝试在根目录的 node_modules/.bin 中查找
      let pkgPath = null;
      let moduleDir = null;

      // 尝试使用 require.resolve，但指定从根目录查找
      // 由于 Node.js 的模块解析会从当前工作目录查找，我们可以在 cleanEnv 中设置 NODE_PATH
      // 但为了避免 PowerShell 的问题，我们手动查找

      // 尝试在 .pnpm 目录中查找（pnpm 的结构）
      const pnpmDir = path.join(rootNodeModules, '.pnpm');
      if (fs.existsSync(pnpmDir)) {
        // 查找匹配的包目录
        const entries = fs.readdirSync(pnpmDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith(`${command}@`)) {
            const possiblePkgPath = path.join(pnpmDir, entry.name, 'node_modules', command, 'package.json');
            if (fs.existsSync(possiblePkgPath)) {
              pkgPath = possiblePkgPath;
              moduleDir = path.dirname(possiblePkgPath);
              break;
            }
          }
        }
      }

      // 如果没找到，尝试直接在 node_modules 中查找
      if (!pkgPath) {
        const directPkgPath = path.join(rootNodeModules, command, 'package.json');
        if (fs.existsSync(directPkgPath)) {
          pkgPath = directPkgPath;
          moduleDir = path.dirname(directPkgPath);
        }
      }

      // 如果还是没找到，使用 require.resolve（从当前工作目录查找）
      if (!pkgPath) {
        try {
          pkgPath = require.resolve(`${command}/package.json`);
          moduleDir = path.dirname(pkgPath);
        } catch (e2) {
          // 仍然找不到，继续下面的逻辑
        }
      }

      if (pkgPath && moduleDir && fs.existsSync(pkgPath)) {
        const pkg = require(pkgPath);
        let binPath = null;

        // 检查 bin 字段
        if (pkg.bin) {
          if (typeof pkg.bin === 'string') {
            binPath = path.join(moduleDir, pkg.bin);
          } else if (pkg.bin[command]) {
            binPath = path.join(moduleDir, pkg.bin[command]);
          } else if (pkg.bin.default) {
            binPath = path.join(moduleDir, pkg.bin.default);
          }
        }

        // 如果找到了 bin 路径且文件存在，使用它
        if (binPath && fs.existsSync(binPath)) {
          commandPath = binPath;
        } else {
          // 如果没有找到 bin，尝试查找常见的 bin 文件位置
          const possibleBins = [
            path.join(moduleDir, 'bin', `${command}.js`),
            path.join(moduleDir, 'dist', 'cli-default.js'),
            path.join(moduleDir, 'dist', 'cli.mjs'),
            path.join(moduleDir, 'dist', 'index.js'),
            path.join(moduleDir, 'cli.js'),
          ];

          for (const possibleBin of possibleBins) {
            if (fs.existsSync(possibleBin)) {
              commandPath = possibleBin;
              break;
            }
          }
        }
      }
    } catch (e) {
      // require.resolve 失败，继续下面的逻辑
    }
  }

  // 如果上面没有找到 commandPath，尝试其他方法
  if (!commandPath) {
    // 尝试查找其他格式
    const unixCmd = path.join(rootNodeModulesBin, command);
    if (fs.existsSync(unixCmd)) {
      commandPath = unixCmd;
    } else {
      // 如果还是找不到，输出错误信息
      logger.error(`[run-without-env] Cannot find command: ${command}`);
      logger.error(`[run-without-env] Searched in: ${rootNodeModulesBin}`);
      logger.error(`[run-without-env] Current working directory: ${process.cwd()}`);
      process.exit(1);
    }
  }
}

// 在 Windows 上，如果是 .cmd 文件，使用 cmd /c 运行
const useShell = isWindows && commandPath.endsWith('.cmd');

// 确定要运行的命令和参数
let runCommand, runArgs;
if (useShell) {
  runCommand = 'cmd';
  runArgs = ['/c', commandPath, ...args];
} else if (commandPath.endsWith('.js')) {
  // 如果是 .js 文件，使用 node 运行
  runCommand = 'node';
  runArgs = [commandPath, ...args];
} else {
  // 其他情况，直接运行
  runCommand = commandPath;
  runArgs = args;
}

// 运行命令
const child = spawn(runCommand, runArgs, {
  stdio: 'inherit',
  shell: false,
  env: cleanEnv,
  cwd: process.cwd(),
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  logger.error(`Failed to start ${command}:`, err);
  process.exit(1);
});

