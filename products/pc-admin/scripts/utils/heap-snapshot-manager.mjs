#!/usr/bin/env node

/**
 * 堆快照管理工具
 * 管理堆快照文件的清理、命名和组织
 */

import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { getRootDir } from './path-helper.mjs';
import { logger } from './logger.mjs';

const SNAPSHOT_DIR = join(getRootDir(), '.heap-snapshots');
const MAX_SNAPSHOTS = 50; // 最多保留 50 个快照文件
const MAX_AGE_DAYS = 7; // 超过 7 天的快照自动删除

/**
 * 确保快照目录存在
 */
export function ensureSnapshotDir() {
  if (!existsSync(SNAPSHOT_DIR)) {
    try {
      mkdirSync(SNAPSHOT_DIR, { recursive: true });
      logger.debug(`[HeapSnapshotManager] 创建堆快照目录: ${SNAPSHOT_DIR}`);
    } catch (error) {
      logger.error(`[HeapSnapshotManager] 创建堆快照目录失败:`, error);
      throw error;
    }
  }
  return SNAPSHOT_DIR;
}

/**
 * 生成堆快照文件名
 * @param {string} prefix - 文件名前缀（如进程名）
 * @returns {string} 完整的快照文件路径
 */
export function generateSnapshotPath(prefix = 'heap') {
  ensureSnapshotDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const pid = process.pid;
  const filename = `${prefix}-${pid}-${timestamp}.heapsnapshot`;
  return join(SNAPSHOT_DIR, filename);
}

/**
 * 清理旧的堆快照文件
 */
export function cleanupOldSnapshots() {
  try {
    ensureSnapshotDir();
    const files = readdirSync(SNAPSHOT_DIR)
      .filter(file => file.endsWith('.heapsnapshot'))
      .map(file => ({
        name: file,
        path: join(SNAPSHOT_DIR, file),
        stats: statSync(join(SNAPSHOT_DIR, file))
      }))
      .sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs); // 按修改时间降序排列

    const now = Date.now();
    const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    let deletedCount = 0;
    let deletedSize = 0;

    // 删除超过最大年龄的文件
    for (const file of files) {
      const age = now - file.stats.mtimeMs;
      if (age > maxAgeMs) {
        try {
          deletedSize += file.stats.size;
          unlinkSync(file.path);
          deletedCount++;
          logger.debug(`[HeapSnapshotManager] 删除过期快照: ${file.name}`);
        } catch (error) {
          logger.warn(`[HeapSnapshotManager] 删除快照失败: ${file.name}`, error);
        }
      }
    }

    // 如果文件数量仍然超过限制，删除最旧的文件
    const remainingFiles = readdirSync(SNAPSHOT_DIR)
      .filter(file => file.endsWith('.heapsnapshot'))
      .map(file => ({
        name: file,
        path: join(SNAPSHOT_DIR, file),
        stats: statSync(join(SNAPSHOT_DIR, file))
      }))
      .sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs); // 按修改时间升序排列

    while (remainingFiles.length > MAX_SNAPSHOTS) {
      const oldestFile = remainingFiles.shift();
      try {
        deletedSize += oldestFile.stats.size;
        unlinkSync(oldestFile.path);
        deletedCount++;
        logger.debug(`[HeapSnapshotManager] 删除最旧快照（超过限制）: ${oldestFile.name}`);
      } catch (error) {
        logger.warn(`[HeapSnapshotManager] 删除快照失败: ${oldestFile.name}`, error);
      }
    }

    if (deletedCount > 0) {
      const sizeMB = (deletedSize / 1024 / 1024).toFixed(2);
      logger.info(`[HeapSnapshotManager] 清理完成: 删除 ${deletedCount} 个快照文件，释放 ${sizeMB} MB`);
    }

    return { deletedCount, deletedSize };
  } catch (error) {
    logger.error(`[HeapSnapshotManager] 清理快照失败:`, error);
    return { deletedCount: 0, deletedSize: 0 };
  }
}

/**
 * 获取堆快照目录路径
 */
export function getSnapshotDir() {
  return SNAPSHOT_DIR;
}

/**
 * 列出所有堆快照文件
 */
export function listSnapshots() {
  try {
    ensureSnapshotDir();
    const files = readdirSync(SNAPSHOT_DIR)
      .filter(file => file.endsWith('.heapsnapshot'))
      .map(file => {
        const path = join(SNAPSHOT_DIR, file);
        const stats = statSync(path);
        return {
          name: file,
          path,
          size: stats.size,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          mtime: stats.mtime,
          age: Date.now() - stats.mtimeMs
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序排列

    return files;
  } catch (error) {
    logger.error(`[HeapSnapshotManager] 列出快照失败:`, error);
    return [];
  }
}

/**
 * 初始化堆快照管理（在应用启动时调用）
 */
export function initSnapshotManager() {
  ensureSnapshotDir();
  cleanupOldSnapshots();
  logger.info(`[HeapSnapshotManager] 堆快照目录: ${SNAPSHOT_DIR}`);
}
