/**
 * 修复文档中损坏的 emoji 图标
 * 根据上下文恢复正确的 emoji
 */
;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

interface EmojiMapping {
  pattern: RegExp;
  emoji: string;
  description: string;
}

// Emoji 修复映射表（根据上下文匹配）
const emojiMappings: EmojiMapping[] = [
  // index.md features
  { pattern: /icon: ��\s*\n\s*title: 完整归档/g, emoji: '📦', description: '完整归档' },
  { pattern: /icon: ��\s*\n\s*title: 智能检索/g, emoji: '🔍', description: '智能检索' },
  { pattern: /icon: ��\s*\n\s*title: 可追溯性/g, emoji: '🔗', description: '可追溯性' },
  { pattern: /icon: ��️?\s*\n\s*title: 多维分类/g, emoji: '🏷️', description: '多维分类' },
  { pattern: /icon: ��\s*\n\s*title: 组件演示/g, emoji: '🎨', description: '组件演示' },
  { pattern: /icon: ��\s*\n\s*title: 私有访问/g, emoji: '🔒', description: '私有访问' },

  // 常见标题 emoji
  { pattern: /## �� 快速开始/g, emoji: '🚀', description: '快速开始' },
  { pattern: /## �� 启动/g, emoji: '🚀', description: '启动' },
  { pattern: /## �� 构建/g, emoji: '📦', description: '构建' },
  { pattern: /## �� 文档结构/g, emoji: '📁', description: '文档结构' },
  { pattern: /## �� 特性/g, emoji: '✨', description: '特性' },
  { pattern: /## �� 创建新文档/g, emoji: '📝', description: '创建新文档' },
  { pattern: /## �� 文档类型/g, emoji: '📋', description: '文档类型' },
  { pattern: /## �� 可用脚本/g, emoji: '🛠️', description: '可用脚本' },
  { pattern: /## �� 相关链接/g, emoji: '🔗', description: '相关链接' },
  { pattern: /## �� 文档分类/g, emoji: '📚', description: '文档分类' },
  { pattern: /## �� 快速导航/g, emoji: '🧭', description: '快速导航' },
  { pattern: /## �� 使用提示/g, emoji: '💡', description: '使用提示' },

  // 列表项 emoji
  { pattern: /- �� 时间线/g, emoji: '📅', description: '时间线' },
  { pattern: /- �� 项目/g, emoji: '📁', description: '项目' },
  { pattern: /- ��️ 类型/g, emoji: '🏷️', description: '类型' },
  { pattern: /- �� 标签/g, emoji: '🏷️', description: '标签' },
  { pattern: /- �� 组件/g, emoji: '🧩', description: '组件' },

  // 功能特性 emoji
  { pattern: /- �� \*\*主题统一\*\*/g, emoji: '🎨', description: '主题统一' },
  { pattern: /- �� \*\*i18n 统一\*\*/g, emoji: '🌐', description: 'i18n 统一' },
  { pattern: /- �� \*\*全局搜索\*\*/g, emoji: '🔍', description: '全局搜索' },
  { pattern: /- �� \*\*暗黑模式\*\*/g, emoji: '🌙', description: '暗黑模式' },
  { pattern: /- �� \*\*响应式\*\*/g, emoji: '📱', description: '响应式' },
  { pattern: /- �� \*\*Markdown 增强\*\*/g, emoji: '📝', description: 'Markdown 增强' },
  { pattern: /- �� \*\*组件演示\*\*/g, emoji: '🎨', description: '组件演示' },

  // 其他常见 emoji
  { pattern: /�� 测试步骤/g, emoji: '🧪', description: '测试步骤' },
  { pattern: /�� 问题排查/g, emoji: '🔍', description: '问题排查' },
  { pattern: /��️ 可能的问题/g, emoji: '⚠️', description: '可能的问题' },
  { pattern: /�� 下一步/g, emoji: '➡️', description: '下一步' },
  { pattern: /�� 核心功能/g, emoji: '⭐', description: '核心功能' },
  { pattern: /�� 搜索历史/g, emoji: '📜', description: '搜索历史' },
  { pattern: /�� 快速访问/g, emoji: '⚡', description: '快速访问' },
  { pattern: /�� 概述/g, emoji: '📋', description: '概述' },
  { pattern: /�� 实现要点/g, emoji: '🔑', description: '实现要点' },
  { pattern: /�� 用户体验流程/g, emoji: '👤', description: '用户体验流程' },
  { pattern: /�� 技术细节/g, emoji: '⚙️', description: '技术细节' },
  { pattern: /�� 文件清单/g, emoji: '📄', description: '文件清单' },
  { pattern: /�� 后续优化建议/g, emoji: '💡', description: '后续优化建议' },
  { pattern: /�� 效果预览/g, emoji: '👁️', description: '效果预览' },
  { pattern: /�� 实施方案/g, emoji: '📋', description: '实施方案' },
  { pattern: /�� 实施内容/g, emoji: '📝', description: '实施内容' },
  { pattern: /�� 目录结构/g, emoji: '📁', description: '目录结构' },
  { pattern: /�� 使用指南/g, emoji: '📖', description: '使用指南' },
  { pattern: /�� 后续工作/g, emoji: '🔜', description: '后续工作' },
  { pattern: /�� 总结/g, emoji: '📝', description: '总结' },
  { pattern: /�� 重构内容/g, emoji: '🔧', description: '重构内容' },
  { pattern: /�� 修改文件列表/g, emoji: '📄', description: '修改文件列表' },
  { pattern: /�� 用户体验提升/g, emoji: '⬆️', description: '用户体验提升' },
  { pattern: /�� 需要隐藏的元素/g, emoji: '👁️', description: '需要隐藏的元素' },
  { pattern: /�� 隐藏方案/g, emoji: '🔧', description: '隐藏方案' },
  { pattern: /�� 三种隐藏方式对比/g, emoji: '📊', description: '三种隐藏方式对比' },
  { pattern: /�� 我们的选择/g, emoji: '✅', description: '我们的选择' },
  { pattern: /�� 完整实现/g, emoji: '💻', description: '完整实现' },
  { pattern: /�� 布局结构对比/g, emoji: '📐', description: '布局结构对比' },
  { pattern: /�� Bug 修复/g, emoji: '🐛', description: 'Bug 修复' },
  { pattern: /�� 优势/g, emoji: '✅', description: '优势' },
  { pattern: /�� 集成目标/g, emoji: '🎯', description: '集成目标' },
  { pattern: /�� 性能对比/g, emoji: '📊', description: '性能对比' },
  { pattern: /�� 测试检查清单/g, emoji: '✅', description: '测试检查清单' },
  { pattern: /�� 相关文档/g, emoji: '📚', description: '相关文档' },
  { pattern: /�� 最终效果/g, emoji: '🎉', description: '最终效果' },
  { pattern: /�� 问题/g, emoji: '❓', description: '问题' },
  { pattern: /�� 实现/g, emoji: '💻', description: '实现' },
  { pattern: /�� 执行流程/g, emoji: '🔄', description: '执行流程' },
  { pattern: /�� 效果对比/g, emoji: '📊', description: '效果对比' },
  { pattern: /�� 问题背景/g, emoji: '📝', description: '问题背景' },
  { pattern: /�� 核心设计/g, emoji: '🎯', description: '核心设计' },
  { pattern: /�� 架构对比/g, emoji: '🏗️', description: '架构对比' },
  { pattern: /�� 关键特性/g, emoji: '⭐', description: '关键特性' },
  { pattern: /�� 测试验证/g, emoji: '✅', description: '测试验证' },
  { pattern: /�� 效果/g, emoji: '✨', description: '效果' },
  { pattern: /�� 包含功能/g, emoji: '📦', description: '包含功能' },
  { pattern: /�� 使用方式/g, emoji: '📖', description: '使用方式' },
  { pattern: /�� 功能详解/g, emoji: '🔍', description: '功能详解' },
  { pattern: /�� 实施计划/g, emoji: '📋', description: '实施计划' },
  { pattern: /�� 包含内容/g, emoji: '📦', description: '包含内容' },
  { pattern: /��️ 架构/g, emoji: '🏗️', description: '架构' },
  { pattern: /�� 导出内容/g, emoji: '📤', description: '导出内容' },
  { pattern: /�� 开发/g, emoji: '💻', description: '开发' },
  { pattern: /�� 许可证/g, emoji: '📜', description: '许可证' },
  { pattern: /�� 变更日志/g, emoji: '📝', description: '变更日志' },
  { pattern: /�� API 文档/g, emoji: '📚', description: 'API 文档' },
  { pattern: /�� 微前端中的 i18n 架构/g, emoji: '🌐', description: '微前端中的 i18n 架构' },
  { pattern: /�� 工作流程/g, emoji: '🔄', description: '工作流程' },
  { pattern: /�� 后端 API 设计/g, emoji: '🔧', description: '后端 API 设计' },
  { pattern: /�� 缓存策略/g, emoji: '💾', description: '缓存策略' },
  { pattern: /�� 数据流图/g, emoji: '📊', description: '数据流图' },
  { pattern: /�� A?PI 参考/g, emoji: '📚', description: 'API 参考' },
  { pattern: /�� 时间线/g, emoji: '📅', description: '时间线' },
  { pattern: /��️ 类型索引/g, emoji: '🏷️', description: '类型索引' },
  { pattern: /�� 标签云/g, emoji: '☁️', description: '标签云' },
  { pattern: /�� 项目索引/g, emoji: '📁', description: '项目索引' },
  { pattern: /�� 参考资料/g, emoji: '📚', description: '参考资料' },
  { pattern: /�� 额外收益/g, emoji: '🎁', description: '额外收益' },

  // 通用替换（最后处理，避免过度匹配）
  { pattern: /立即实施 ��/g, emoji: '🚀', description: '立即实施' },
  { pattern: /开箱即用！\*\*： ��/g, emoji: '🎉', description: '开箱即用' },
  { pattern: /VitePress 搜索整合完成！\*\*： ��/g, emoji: '🎉', description: 'VitePress 搜索整合完成' },
  { pattern: /文档迁移完成！\*\*： ��/g, emoji: '🎉', description: '文档迁移完成' },
  { pattern: /集成完成！[^：]*： ��/g, emoji: '🎉', description: '集成完成' },
  { pattern: /这就是[^：]*： ��/g, emoji: '🎯', description: '总结' },
  { pattern: /推荐程度\*\*:：?[ ]*��+/g, emoji: '⭐⭐⭐⭐⭐', description: '推荐程度' },
  { pattern: /实施优先级\*\*:：?[ ]*��/g, emoji: '🔥', description: '实施优先级' },
  { pattern: /质量评级\*\*:：?[ ]*��+/g, emoji: '⭐⭐⭐⭐⭐', description: '质量评级' },
];

interface FixResult {
  file: string;
  replacements: number;
  success: boolean;
  error?: string;
}

/**
 * 修复单个文件中的 emoji
 */
function fixEmojisInFile(filePath: string): FixResult {
  const relativePath = path.relative(docsRoot, filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let totalReplacements = 0;

    // 应用所有映射
    for (const mapping of emojiMappings) {
      const beforeLength = content.length;
      content = content.replace(mapping.pattern, (match) => {
        return match.replace(/��️?/g, mapping.emoji);
      });
      const afterLength = content.length;

      if (beforeLength !== afterLength) {
        const count = (match => {
          const matches = [...match.matchAll(mapping.pattern)];
          return matches.length;
        })(content);

        if (count > 0) {
          totalReplacements++;
        }
      }
    }

    // 写回文件
    if (totalReplacements > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    return {
      file: relativePath,
      replacements: totalReplacements,
      success: true
    };
  } catch (error) {
    return {
      file: relativePath,
      replacements: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.info('╔════════════════════════════════════════════════════════╗');
  console.info('║           文档 Emoji 修复工具                          ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  // 扫描所有 .md 文件
  const files = await glob('**/*.md', {
    cwd: docsRoot,
    ignore: ['node_modules/**', '.vitepress/**', 'dist/**'],
  });

  console.info(`📂 发现 ${files.length} 个文档文件\n`);
  console.info('⚙️  开始修复 emoji...\n');

  const results: FixResult[] = [];

  for (const file of files) {
    const fullPath = path.join(docsRoot, file);
    const result = fixEmojisInFile(fullPath);
    results.push(result);

    if (result.success && result.replacements > 0) {
      console.info(`✅ ${result.file} - 修复了 ${result.replacements} 处 emoji`);
    }
  }

  // 统计
  console.info('\n╔════════════════════════════════════════════════════════╗');
  console.info('║                    修复报告                            ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  const fixedFiles = results.filter(r => r.success && r.replacements > 0);
  const totalReplacements = fixedFiles.reduce((sum, r) => sum + r.replacements, 0);
  const failedFiles = results.filter(r => !r.success);

  console.info(`📊 统计信息：`);
  console.info(`   - 扫描文件：${files.length}`);
  console.info(`   - 修复文件：${fixedFiles.length}`);
  console.info(`   - 修复总数：${totalReplacements}`);
  console.info(`   - 失败文件：${failedFiles.length}`);
  console.info();

  if (failedFiles.length > 0) {
    console.info(`❌ 失败文件：`);
    failedFiles.forEach(r => console.info(`   - ${r.file}: ${r.error}`));
    console.info();
  }

  console.info('✅ Emoji 修复完成！');
  console.info('💡 建议：刷新浏览器查看效果 (Ctrl+F5)\n');
}

main().catch(console.error);

