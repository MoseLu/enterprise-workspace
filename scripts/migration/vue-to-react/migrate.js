/**
 * Vue → React 迁移 SubAgent
 *
 * 用于将 pc-admin 的 Vue3 应用迁移到 react-admin
 *
 * 使用方式:
 *   node migrate.js <appName> [sourcePath] [targetPath]
 *
 * 示例:
 *   node migrate.js home-app
 *   node migrate.js admin-app products/pc-admin/apps/admin-app products/react-admin/apps/admin-app
 */

import { migrate } from './agent.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 命令行参数解析
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    appName: null,
    sourcePath: null,
    targetPath: null,
  };

  // 第一个参数是 appName
  if (args.length >= 1) {
    options.appName = args[0];
  }

  // 第二个参数是 sourcePath（可选）
  if (args.length >= 2) {
    options.sourcePath = args[1];
  }

  // 第三个参数是 targetPath（可选）
  if (args.length >= 3) {
    options.targetPath = args[2];
  }

  return options;
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
Vue → React 迁移 SubAgent

用法:
  node migrate.js <appName> [sourcePath] [targetPath]

参数:
  appName      应用名称（如 home-app, admin-app）
  sourcePath   源路径（默认: products/pc-admin/apps/{appName}）
  targetPath   目标路径（默认: products/react-admin/apps/{appName}）

示例:
  node migrate.js home-app
  node migrate.js admin-app
  node migrate.js my-app /path/to/source /path/to/target

注意事项:
  1. 迁移前请确保目标目录不存在
  2. 迁移完成后需要手动安装依赖: npm install
  3. 复杂的 Vue 特性需要手动调整
  4. Element Plus 组件会自动转换为 Ant Design
`);
}

/**
 * 格式化结果输出
 */
function formatResult(result) {
  console.log('\n' + '='.repeat(50));
  console.log('迁移结果');
  console.log('='.repeat(50));
  console.log(`应用名称: ${result.appName}`);
  console.log(`源文件数: ${result.sourceFiles}`);
  console.log(`已迁移文件: ${result.migratedFiles}`);
  console.log(`跳过文件: ${result.skippedFiles}`);
  console.log(`状态: ${result.status}`);

  if (result.warnings.length > 0) {
    console.log('\n警告:');
    result.warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n错误:');
    result.errors.forEach((e) => {
      if (e.file) {
        console.log(`  - ${e.file}: ${e.error}`);
      } else {
        console.log(`  - ${e.error}`);
      }
    });
  }

  console.log('='.repeat(50) + '\n');

  return result;
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs();

  // 如果没有提供 appName，显示帮助
  if (!options.appName || options.appName === '--help' || options.appName === '-h') {
    showHelp();
    process.exit(0);
  }

  // 设置默认路径
  const baseSourcePath = path.resolve(__dirname, '../../../products/pc-admin/apps');
  const baseTargetPath = path.resolve(__dirname, '../../../products/react-admin/apps');

  const sourcePath = options.sourcePath || path.join(baseSourcePath, options.appName);
  const targetPath = options.targetPath || path.join(baseTargetPath, options.appName);

  console.log(`开始迁移应用: ${options.appName}`);
  console.log(`源路径: ${sourcePath}`);
  console.log(`目标路径: ${targetPath}`);

  try {
    const result = await migrate(options.appName, sourcePath, targetPath);
    formatResult(result);

    // 返回退出码
    process.exit(result.status === 'failed' ? 1 : 0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
