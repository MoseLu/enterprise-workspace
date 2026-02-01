/**
 * 清理构建目录插件
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[clean]', ...args),
  error: (...args: any[]) => console.error('[clean]', ...args),
  info: (...args: any[]) => console.info('[clean]', ...args),
  debug: (...args: any[]) => console.debug('[clean]', ...args),
};

import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, rmSync } from 'node:fs';

/**
 * 安全输出日志（避免 Windows 控制台编码问题）
 */
function safeLog(message: string) {
  try {
    console.info(message);
  } catch (error) {
    // 如果输出失败（可能是编码问题），使用纯文本输出
    // eslint-disable-next-line no-control-regex
    console.info(message.replace(/[^\x00-\x7F]/g, ''));
  }
}

/**
 * 安全输出警告（避免 Windows 控制台编码问题）
 */
function safeWarn(message: string) {
  try {
    console.warn(message);
  } catch (error) {
    // 如果输出失败（可能是编码问题），使用纯文本输出
    // eslint-disable-next-line no-control-regex
    console.warn(message.replace(/[^\x00-\x7F]/g, ''));
  }
}

/**
 * 清理 dist 目录插件
 * 添加重试机制以处理 Windows 上的文件锁定问题
 */
export function cleanDistPlugin(appDir: string): Plugin {
  return {
    name: 'clean-dist-plugin',
    buildStart() {
      const distDir = resolve(appDir, 'dist');
      if (existsSync(distDir)) {
        safeLog('[clean-dist-plugin] 清理旧的 dist 目录...');

        // 添加重试机制，处理 Windows 上的文件锁定问题
        let retries = 5; // 增加重试次数
        let success = false;

        while (retries > 0 && !success) {
          try {
            rmSync(distDir, { recursive: true, force: true });
            success = true;
            safeLog('[clean-dist-plugin] ✅ dist 目录已清理');
          } catch (error: any) {
            retries--;
            if (error.code === 'EBUSY' || error.code === 'ENOTEMPTY') {
              if (retries > 0) {
                const waitTime = (6 - retries) * 200; // 递增等待时间：200ms, 400ms, 600ms, 800ms, 1000ms
                safeWarn(`[clean-dist-plugin] ⚠️  目录被占用，等待 ${waitTime}ms 后重试... (剩余 ${retries} 次)`);
                // 同步等待
                const start = Date.now();
                while (Date.now() - start < waitTime) {
                  // 忙等待
                }
              } else {
                safeWarn('[clean-dist-plugin] ❌ 无法清理 dist 目录（可能被其他程序占用）');
                safeWarn('[clean-dist-plugin] 提示：请关闭可能占用文件的程序（如文件资源管理器、编辑器等）');
                safeWarn('[clean-dist-plugin] 或者手动删除 dist 目录后重新构建');
                safeWarn('[clean-dist-plugin] 构建将继续，但旧的构建产物不会被清理，可能导致重复文件');
                success = true; // 继续构建，不阻塞
              }
            } else if (error.code === 'ENOENT') {
              // 目录不存在，不需要清理
              success = true;
            } else {
              // 其他错误，直接抛出
              safeWarn('[clean-dist-plugin] 清理 dist 目录失败: ' + error.message);
              safeWarn('[clean-dist-plugin] 构建将继续，但旧的构建产物不会被清理');
              success = true; // 继续构建，不阻塞
            }
          }
        }
      } else {
        safeLog('[clean-dist-plugin] dist 目录不存在，无需清理');
      }
    },
  } as Plugin;
}

