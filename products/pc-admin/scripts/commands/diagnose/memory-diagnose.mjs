#!/usr/bin/env node

/**
 * 内存诊断工具
 * 分析堆快照文件，生成内存使用报告，检测常见内存泄漏模式
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';
import { logger } from '../../utils/logger.mjs';
import { listSnapshots, getSnapshotDir } from '../../utils/heap-snapshot-manager.mjs';

const rootDir = getRootDir();
const snapshotDir = getSnapshotDir();

/**
 * 分析堆快照文件（基础信息）
 * 注意：完整的堆快照分析需要使用 Chrome DevTools
 */
function analyzeSnapshotFile(filePath) {
  try {
    const stats = statSync(filePath);
    return {
      path: filePath,
      size: stats.size,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2),
      mtime: stats.mtime,
      age: Date.now() - stats.mtimeMs
    };
  } catch (error) {
    logger.error(`分析快照文件失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 检测常见内存泄漏模式（基于文件名和大小）
 */
function detectLeakPatterns(snapshots) {
  const patterns = [];

  // 检测：快照文件过大（可能包含大量未释放对象）
  const largeSnapshots = snapshots.filter(s => s.sizeMB > 100);
  if (largeSnapshots.length > 0) {
    patterns.push({
      type: 'large_snapshot',
      severity: 'warning',
      message: `发现 ${largeSnapshots.length} 个大型堆快照（>100MB），可能包含大量未释放对象`,
      snapshots: largeSnapshots.map(s => s.name)
    });
  }

  // 检测：短时间内生成多个快照（可能频繁 OOM）
  const recentSnapshots = snapshots
    .filter(s => s.age < 24 * 60 * 60 * 1000) // 24小时内
    .sort((a, b) => a.mtime - b.mtime);
  
  if (recentSnapshots.length > 5) {
    patterns.push({
      type: 'frequent_oom',
      severity: 'critical',
      message: `24小时内生成了 ${recentSnapshots.length} 个堆快照，说明频繁发生 OOM，需要立即排查`,
      snapshots: recentSnapshots.map(s => s.name)
    });
  }

  // 检测：快照文件持续增长（内存泄漏趋势）
  if (recentSnapshots.length >= 3) {
    const sizes = recentSnapshots.map(s => s.sizeMB);
    const isGrowing = sizes.every((size, index) => index === 0 || size >= sizes[index - 1]);
    if (isGrowing) {
      patterns.push({
        type: 'growing_memory',
        severity: 'warning',
        message: `快照文件大小持续增长，表明内存使用持续增加，可能存在内存泄漏`,
        snapshots: recentSnapshots.map(s => `${s.name} (${s.sizeMB}MB)`)
      });
    }
  }

  return patterns;
}

/**
 * 生成诊断报告
 */
function generateReport(snapshots, patterns) {
  const report = {
    timestamp: new Date().toISOString(),
    snapshotDir,
    totalSnapshots: snapshots.length,
    totalSizeMB: snapshots.reduce((sum, s) => sum + parseFloat(s.sizeMB), 0).toFixed(2),
    recentSnapshots: snapshots.filter(s => s.age < 7 * 24 * 60 * 60 * 1000).length, // 7天内
    patterns: patterns,
    recommendations: []
  };

  // 生成修复建议
  if (patterns.some(p => p.type === 'frequent_oom')) {
    report.recommendations.push({
      priority: 'high',
      action: '立即分析最新的堆快照文件，使用 Chrome DevTools 查看内存占用最多的对象',
      steps: [
        '1. 打开 Chrome DevTools (chrome://inspect)',
        '2. 点击 "Memory" 标签',
        '3. 点击 "Load" 导入最新的 .heapsnapshot 文件',
        '4. 在 "Summary" 视图中查看占用内存最多的对象类型',
        '5. 使用 "Comparison" 视图对比多个快照，找出持续增长的对象',
        '6. 使用 "Retainers" 视图查看对象的引用链，找出阻止 GC 回收的原因'
      ]
    });
  }

  if (patterns.some(p => p.type === 'growing_memory')) {
    report.recommendations.push({
      priority: 'medium',
      action: '检查代码中是否存在未清理的定时器、事件监听器或全局变量累积',
      steps: [
        '1. 运行 pnpm diagnose:leak 扫描代码中的潜在泄漏点',
        '2. 检查所有 setInterval/setTimeout 是否都有对应的 clearInterval/clearTimeout',
        '3. 检查所有 EventEmitter 监听器是否都有 removeListener',
        '4. 检查全局变量（global、window）是否有无限累积的数据'
      ]
    });
  }

  if (snapshots.length === 0) {
    report.recommendations.push({
      priority: 'info',
      action: '尚未生成堆快照，如果发生 OOM，快照将自动保存在 .heap-snapshots 目录',
      steps: [
        '1. 继续运行应用，等待 OOM 发生时自动生成快照',
        '2. 或手动触发堆快照：在 Chrome DevTools 中点击 "Take snapshot"'
      ]
    });
  }

  return report;
}

/**
 * 打印报告
 */
function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 内存诊断报告');
  console.log('='.repeat(80));
  console.log(`生成时间: ${report.timestamp}`);
  console.log(`快照目录: ${report.snapshotDir}`);
  console.log(`总快照数: ${report.totalSnapshots}`);
  console.log(`总大小: ${report.totalSizeMB} MB`);
  console.log(`最近7天: ${report.recentSnapshots} 个快照`);
  console.log('');

  if (report.patterns.length > 0) {
    console.log('🔍 检测到的模式:');
    for (const pattern of report.patterns) {
      const icon = pattern.severity === 'critical' ? '🚨' : '⚠️';
      console.log(`  ${icon} [${pattern.severity.toUpperCase()}] ${pattern.type}: ${pattern.message}`);
      if (pattern.snapshots && pattern.snapshots.length > 0) {
        console.log(`     相关快照: ${pattern.snapshots.slice(0, 3).join(', ')}${pattern.snapshots.length > 3 ? '...' : ''}`);
      }
    }
    console.log('');
  }

  if (report.recommendations.length > 0) {
    console.log('💡 修复建议:');
    for (const rec of report.recommendations) {
      const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵';
      console.log(`  ${icon} [${rec.priority.toUpperCase()}] ${rec.action}`);
      if (rec.steps && rec.steps.length > 0) {
        for (const step of rec.steps) {
          console.log(`     ${step}`);
        }
      }
    }
    console.log('');
  }

  if (report.totalSnapshots > 0) {
    console.log('📁 最近的堆快照文件:');
    const recent = report.snapshots
      .filter(s => s.age < 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5);
    
    for (const snapshot of recent) {
      const ageHours = Math.round(snapshot.age / (60 * 60 * 1000));
      console.log(`  - ${snapshot.name} (${snapshot.sizeMB}MB, ${ageHours}小时前)`);
    }
    console.log('');
  }

  console.log('='.repeat(80) + '\n');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const analyzeHeap = args.includes('--analyze-heap') || args.includes('-a');

  try {
    // 列出所有堆快照
    const snapshots = listSnapshots();

    // 检测泄漏模式
    const patterns = detectLeakPatterns(snapshots);

    // 生成报告
    const report = generateReport(snapshots, patterns);
    report.snapshots = snapshots; // 保存快照列表供打印使用

    // 打印报告
    printReport(report);

    // 如果需要详细分析堆快照
    if (analyzeHeap && snapshots.length > 0) {
      console.log('📖 详细堆快照分析需要使用 Chrome DevTools:');
      console.log('   1. 打开 Chrome 浏览器，访问 chrome://inspect');
      console.log('   2. 点击 "Open dedicated DevTools for Node"');
      console.log('   3. 切换到 "Memory" 标签');
      console.log('   4. 点击 "Load" 按钮，选择堆快照文件');
      console.log(`   5. 快照文件位置: ${snapshotDir}`);
      console.log('');
    }

    // 返回退出码（如果有严重问题，返回非0）
    const hasCritical = patterns.some(p => p.severity === 'critical');
    process.exit(hasCritical ? 1 : 0);
  } catch (error) {
    logger.error('内存诊断失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
