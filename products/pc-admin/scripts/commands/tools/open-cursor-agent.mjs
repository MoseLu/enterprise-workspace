#!/usr/bin/env node

/**
 * 打开新的 Cursor Chat/Agent 对话
 * 在当前 Cursor 窗口中自动打开新的 chat，实现并行处理
 * 支持子级 skills 独立执行
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../utils/logger.mjs';
import { getRootDir } from '../../utils/path-helper.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = getRootDir();

/**
 * 使用 PowerShell 发送快捷键到 Cursor
 * @param {string} shortcut - 快捷键，如 "Ctrl+L", "Ctrl+T"
 */
function sendShortcutToCursor(shortcut = 'Ctrl+L') {
  return new Promise((resolve, reject) => {
    const psScript = join(__dirname, 'send-cursor-shortcut.ps1');
    
    console.log(`\n⌨️  正在向 Cursor 发送快捷键: ${shortcut}...\n`);
    
    const psProcess = spawn('powershell', [
      '-ExecutionPolicy', 'Bypass',
      '-File', psScript,
      '-Shortcut', shortcut
    ], {
      stdio: 'inherit',
      shell: false
    });
    
    psProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ 快捷键发送成功\n');
        resolve(true);
      } else {
        console.log(`\n⚠️  快捷键发送完成，退出码: ${code}\n`);
        // 即使失败也 resolve，因为可能已经成功
        resolve(false);
      }
    });
    
    psProcess.on('error', (error) => {
      console.error('\n❌ 执行 PowerShell 脚本失败:', error.message);
      reject(error);
    });
  });
}

/**
 * 打开新的 Cursor Chat/Agent 对话
 * @param {object} options - 选项
 * @param {string} options.context - 上下文信息（可选）
 * @param {string} options.initialPrompt - 初始提示（可选）
 * @param {string} options.shortcut - 快捷键，默认 "Ctrl+L"
 * @param {boolean} options.autoClick - 是否自动点击 "+ New Chat" 按钮（需要额外实现）
 */
export async function openCursorAgent(options = {}) {
  const { 
    context, 
    initialPrompt, 
    shortcut = 'Ctrl+L',
    autoClick = false
  } = options;
  
  console.log('\n🚀 自动打开新的 Cursor Chat 对话');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // 在 Windows 上尝试自动发送快捷键
  if (process.platform === 'win32') {
    try {
      // 发送 Ctrl+L 打开 Chat 面板
      await sendShortcutToCursor(shortcut);
      
      console.log('💡 下一步操作：');
      if (shortcut === 'Ctrl+L') {
        console.log('   1. Chat 面板应该已经打开');
        console.log('   2. 请点击 Chat 面板右上角的 "+ New Chat" 或 "+" 按钮');
        console.log('   3. 或者等待 2 秒后自动尝试点击（如果支持）\n');
        
        // 如果支持自动点击，可以在这里添加
        if (autoClick) {
          console.log('⏳ 等待 2 秒后尝试自动点击 "+ New Chat" 按钮...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
          // 这里可以添加自动点击逻辑（需要更复杂的实现）
          console.log('💡 提示：自动点击功能需要额外实现，请手动点击 "+ New Chat"\n');
        }
      } else if (shortcut === 'Ctrl+T') {
        console.log('   ✅ 新 Chat 应该已经打开（如果 Cursor 支持 Ctrl+T）\n');
      }
    } catch (error) {
      console.error('❌ 自动发送快捷键失败:', error.message);
      console.log('\n💡 请手动操作：');
      console.log('   按 Ctrl+L，然后点击 "+ New Chat"\n');
    }
  } else {
    // 非 Windows 系统，提供手动指南
    console.log('💡 手动打开新 Chat 的方法：\n');
    console.log('   【方法1 - 推荐】快捷键：');
    console.log('   1. 按 Ctrl+L (Windows) 或 Cmd+L (Mac) 打开 Chat 面板');
    console.log('   2. 点击 Chat 面板右上角的 "+ New Chat" 或 "+" 按钮\n');
    
    console.log('   【方法2】命令面板：');
    console.log('   1. 按 Ctrl+Shift+P (Windows) 或 Cmd+Shift+P (Mac)');
    console.log('   2. 输入 "New Chat" 或 "Cursor: New Chat"');
    console.log('   3. 选择打开新的 Chat 对话\n');
  }
  
  if (initialPrompt) {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`💬 新 Chat 打开后，可以输入以下提示：\n`);
    console.log(`   ${initialPrompt}\n`);
  }
  
  if (context) {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📝 上下文信息：${context}\n`);
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ 提示：新 Chat 会在当前 Cursor 窗口中打开，可以并行处理多个任务\n');
  console.log('💡 子级 skills 可以在新 Chat 中独立执行，实现并行子任务\n');
  
  return true;
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const context = process.argv[2] || '';
  const initialPrompt = process.argv[3] || '';
  
  (async () => {
    try {
      await openCursorAgent({ context, initialPrompt });
      // 不立即退出，让用户看到输出
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('执行失败:', error);
      process.exit(1);
    }
  })();
}
