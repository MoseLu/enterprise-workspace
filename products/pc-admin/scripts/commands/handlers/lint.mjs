/**
 * Lint 命令处理器
 */

import { execSync, spawn } from 'child_process';
import { showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppDisplayName, getAppPackageName } from '../config.mjs';
import { rootDir } from '../utils.mjs';

/**
 * 从 eslint 输出中解析错误和警告数量
 */
function parseEslintOutput(output) {
  // eslint 输出格式: "✖ X problems (Y errors, Z warnings)"
  const problemsMatch = output.match(/✖\s+(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);
  if (problemsMatch) {
    return {
      errors: parseInt(problemsMatch[2], 10),
      warnings: parseInt(problemsMatch[3], 10),
    };
  }
  
  // 如果没有匹配到，尝试其他格式
  const errorsMatch = output.match(/(\d+)\s+errors?/);
  const warningsMatch = output.match(/(\d+)\s+warnings?/);
  
  return {
    errors: errorsMatch ? parseInt(errorsMatch[1], 10) : 0,
    warnings: warningsMatch ? parseInt(warningsMatch[1], 10) : 0,
  };
}

export async function handleLint(appName, subCommand = 'check', options = {}) {
  const { continueOnError = false } = options;
  const displayName = getAppDisplayName(appName);
  const packageName = getAppPackageName(appName);
  const isFix = subCommand === 'fix';
  
  // 修复 docs 应用名称
  const actualAppName = appName === 'docs' ? 'docs-app' : `${appName}-app`;
  const pattern = `apps/${actualAppName}/src/**/*.{ts,tsx,vue}`;
  let command = `pnpm exec eslint "${pattern}"`;
  
  if (isFix) {
    command += ' --fix';
  } else {
    // 交互式模式下不设置 --max-warnings 0，允许警告和错误存在，只进行统计
    if (!continueOnError) {
      command += ' --max-warnings 0';
    }
    // continueOnError 模式下，移除 --max-warnings 限制，允许继续执行
  }
  
  const action = isFix ? '修复' : '检查';
  showCommandPreview(command, `${action} ${displayName} 代码`);
  
  let output = '';
  let success = false;
  let errors = 0;
  let warnings = 0;
  
  try {
    if (continueOnError) {
      // 在 continueOnError 模式下，需要同时显示输出和捕获统计信息
      // 使用 spawn 来同时处理输出和错误
      // 分割命令为命令和参数（处理引号）
      const parts = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < command.length; i++) {
        const char = command[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ' ' && !inQuotes) {
          if (current) {
            parts.push(current);
            current = '';
          }
        } else {
          current += char;
        }
      }
      if (current) {
        parts.push(current);
      }
      
      const [cmd, ...args] = parts;
      const child = spawn(cmd, args, {
        cwd: rootDir,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        process.stdout.write(text); // 同时显示输出
      });
      
      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        process.stderr.write(text); // 同时显示错误
      });
      
      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          output = stdout + stderr;
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command failed with exit code ${code}`));
          }
        });
        child.on('error', reject);
      });
      
      success = true;
    } else {
      // 非 continueOnError 模式，直接执行
      execSync(command, {
        stdio: 'inherit',
        cwd: rootDir,
        shell: true,
      });
      success = true;
    }
  } catch (error) {
    if (continueOnError) {
      // 在 continueOnError 模式下，解析输出中的错误和警告数量
      const parsed = parseEslintOutput(output);
      errors = parsed.errors;
      warnings = parsed.warnings;
    } else {
      // 非 continueOnError 模式，直接显示错误并退出
      showError(`${displayName} 代码${action}失败`);
      process.exit(error.status || 1);
    }
  }
  
  if (success) {
    showSuccess(`${displayName} 代码${action}完成`);
    return { success: true, appName, displayName, errors: 0, warnings: 0 };
  } else {
    // 交互式模式下不退出进程，只显示错误信息
    showError(`${displayName} 代码${action}发现问题（已继续执行）`);
    return { success: false, appName, displayName, errors, warnings };
  }
}

