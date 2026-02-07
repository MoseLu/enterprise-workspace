/**
 * 批量修复文档中损坏的 emoji
 * 使用简单的映射规则
 */
;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

// 文件列表
const filesToFix = [
  'guides/integration/d-o-c-s--c-a-c-h-e--d-e-b-u-g.md',
  'guides/integration/d-o-c-s--i-f-r-a-m-e--c-a-c-h-e--o-p-t-i-m-i-z-a-t-i-o-n.md',
  'guides/integration/d-o-c-s--i-n-s-t-a-n-t--s-w-i-t-c-h.md',
  'guides/integration/d-o-c-s--i-n-t-e-g-r-a-t-i-o-n--s-u-m-m-a-r-y.md',
  'guides/integration/d-o-c-s--l-a-y-o-u-t--h-i-d-e--s-t-r-a-t-e-g-y.md',
  'guides/integration/doc-migration-complete.md',
  'guides/integration/l-a-y-o-u-t--r-e-f-a-c-t-o-r--c-o-m-p-l-e-t-e.md',
  'guides/integration/v-i-t-e-p-r-e-s-s--i-n-t-e-g-r-a-t-i-o-n--c-o-m-p-l-e-t-e.md',
  'guides/integration/v-i-t-e-p-r-e-s-s--s-e-a-r-c-h--i-n-t-e-g-r-a-t-i-o-n.md',
  'guides/layout/global-search.md',
  'api/index.md',
  'adr/2025-10-12-browser-title-i18n.md',
  'packages/btc-form.md',
  'packages/btc-upsert.md',
  'packages/i18n-plugin.md',
  'packages/shared-components.md',
  'packages/shared-core.md',
  'packages/shared-utils.md',
  'packages/vite-plugin.md',
  'projects/index.md',
  'tags/index.md',
  'types/index.md',
  'timeline/index.md',
  'rfc/vitepress-integration-brief.md',
  'rfc/2025-10-12-vitepress-integration.md',
];

// Emoji 替换规则（基于上下文）
const replacements: Array<[RegExp, string | ((match: string) => string)]> = [
  // 测试和开发
  [/�� 测试/g, '🧪 测试'],
  [/�� 问题/g, '❓ 问题'],
  [/��️ 可能/g, '⚠️ 可能'],
  [/�� 下一步/g, '➡️ 下一步'],

  // 核心功能
  [/�� 核心/g, '⭐ 核心'],
  [/�� 搜索/g, '📜 搜索'],
  [/�� 快速/g, '⚡ 快速'],
  [/�� 概述/g, '📋 概述'],
  [/�� 实现/g, '💻 实现'],
  [/�� 用户/g, '👤 用户'],
  [/�� 技术/g, '⚙️ 技术'],
  [/�� 文件/g, '📄 文件'],
  [/�� 后续/g, '💡 后续'],
  [/�� 效果/g, '👁️ 效果'],

  // 计划和实施
  [/�� 实施/g, '📋 实施'],
  [/�� 目录/g, '📁 目录'],
  [/�� 使用/g, '📖 使用'],
  [/�� 工作/g, '🔜  工作'],
  [/�� 总结/g, '📝 总结'],
  [/�� 重构/g, '🔧 重构'],
  [/�� 修改/g, '📄 修改'],
  [/�� 体验/g, '⬆️ 体验'],

  // 需求和设计
  [/�� 需要/g, '👁️ 需要'],
  [/�� 隐藏/g, '🔧 隐藏'],
  [/�� 三种/g, '📊  三种'],
  [/�� 我们/g, '✅ 我们'],
  [/�� 完整/g, '💻 完整'],
  [/�� 布局/g, '📐 布局'],
  [/�� Bug/g, '🐛 Bug'],
  [/�� 优势/g, '✅ 优势'],
  [/�� 集成/g, '🎯 集成'],
  [/�� 性能/g, '📊 性能'],
  [/�� 检查/g, '✅ 检查'],
  [/�� 相关/g, '📚 相关'],
  [/�� 最终/g, '🎉  最终'],

  // 执行和流程
  [/�� 执行/g, '🔄 执行'],
  [/�� 问题背景/g, '📝 问题背景'],
  [/�� 设计/g, '🎯 设计'],
  [/�� 架构/g, '🏗️ 架构'],
  [/�� 关键/g, '⭐ 关键'],
  [/�� 验证/g, '✅ 验证'],
  [/��\.? 效果/g, '✨ 效果'],

  // 功能和内容
  [/�� 包含/g, '📦 包含'],
  [/�� 方式/g, '📖  方式'],
  [/�� 详解/g, '🔍 详解'],
  [/�� 计划/g, '📋 计划'],
  [/��️ 架构/g, '🏗️ 架构'],
  [/�� 导出/g, '📤  导出'],
  [/�� 开发/g, '💻 开发'],
  [/�� 许可证/g, '📜 许可证'],
  [/�� 变更/g, '📝 变更'],
  [/�� API/g, '📚 API'],
  [/�� 文档/g, '📚 文档'],

  // 微前端和国际化
  [/�� 微前端/g, '🌐 微前端'],
  [/�� 流程/g, '🔄 流程'],
  [/�� 后端/g, '🔧 后端'],
  [/�� 缓存/g, '💾 缓存'],
  [/�� 数据/g, '📊 数据'],
  [/��️ 类型/g, '🏷️ 类型'],
  [/�� 标签/g, '☁️ 标签'],
  [/�� 项目/g, '📁 项目'],
  [/�� 时间线/g, '📅 时间线'],
  [/�� 参考/g, '📚  参考'],
  [/�� 额外/g, '🎁 额外'],

  // 特殊短语
  [/立即实施 ��/g, '立即实施 🚀'],
  [/开箱即用！\*\*�� /g, '开箱即用！**🎉 '],
  [/完成！\*\*�� /g, '完成！**🎉 '],
  [/完成！\*\* ��/g, '完成！** 🎉'],
  [/这就是.*��/g, (match) => match.replace(/��/, '🎯')],
  [/推荐.*��+/g, '⭐⭐⭐⭐⭐'],
  [/优先级.*��/g, (match) => match.replace(/��/, '🔥')],
  [/质量.*��+/g, '⭐⭐⭐⭐⭐'],
];

async function fixFile(filePath: string): Promise<number> {
  const fullPath = path.join(docsRoot, filePath);

  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    let fixCount = 0;

    for (const [pattern, replacement] of replacements) {
      const before = content;
      if (typeof replacement === 'function') {
        content = content.replace(pattern, replacement);
      } else {
        content = content.replace(pattern, replacement);
      }
      if (content !== before) {
        fixCount++;
      }
    }

    if (fixCount > 0) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.info(`✅ ${filePath} - 修复了 ${fixCount} 处`);
    } else {
      console.info(`⏭️  ${filePath} - 无需修复`);
    }

    return fixCount;
  } catch (error) {
    console.error(`❌ ${filePath} - ${error}`);
    return 0;
  }
}

async function main() {
  console.info('开始批量修复 emoji...\n');

  let totalFixes = 0;
  let fixedFiles = 0;

  for (const file of filesToFix) {
    const fixes = await fixFile(file);
    if (fixes > 0) {
      fixedFiles++;
      totalFixes += fixes;
    }
  }

  console.info(`\n修复完成！`);
  console.info(`- 修复文件数：${fixedFiles}`);
  console.info(`- 修复总数：${totalFixes}`);
  console.info(`\n💡 请刷新浏览器（Ctrl+F5）查看效果`);
}

main().catch(console.error);

