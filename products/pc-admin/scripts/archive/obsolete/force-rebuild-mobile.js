import { logger } from '../../../utils/logger.mjs';
#!/usr/bin/env node

/**
 * 强制重新构建移动端应用
 * 用于确保一键登录功能被正确构建和部署
 */

const { spawnSync } = require('node:child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '..');
const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';

const mobileAppPath = path.join(repoRoot, 'apps', 'mobile-app');

logger.info('🚀 强制重新构建移动端应用\n');

// 清理所有缓存和构建产物
const pathsToClean = [
  path.join(mobileAppPath, 'dist'),
  path.join(mobileAppPath, 'node_modules', '.vite'),
  path.join(mobileAppPath, '.vite'),
];

logger.info('🧹 清理缓存和构建产物...');
pathsToClean.forEach(cleanPath => {
  if (fs.existsSync(cleanPath)) {
    try {
      fs.rmSync(cleanPath, { recursive: true, force: true });
      logger.info(`  ✓ 已清理: ${path.relative(repoRoot, cleanPath)}`);
    } catch (error) {
      logger.warn(`  ⚠️  清理失败: ${path.relative(repoRoot, cleanPath)} - ${error.message}`);
    }
  }
});

// 验证源代码包含一键登录功能
logger.info('\n📋 验证源代码...');
const loginVuePath = path.join(mobileAppPath, 'src', 'modules', 'auth', 'pages', 'Login.vue');
if (fs.existsSync(loginVuePath)) {
  const content = fs.readFileSync(loginVuePath, 'utf-8');
  if (content.includes('本机号码一键登录')) {
    logger.info('  ✓ 源代码包含一键登录功能');
  } else {
    logger.error('  ✗ 源代码不包含一键登录功能！');
    process.exit(1);
  }
} else {
  logger.error('  ✗ 找不到 Login.vue 文件！');
  process.exit(1);
}

// 重新构建
logger.info('\n🔨 开始构建移动端应用...');
const buildResult = spawnSync(pnpmCmd, ['--filter', 'mobile-app', 'build'], {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (buildResult.status !== 0) {
  logger.error('\n❌ 构建失败！');
  process.exit(buildResult.status ?? 1);
}

// 验证构建产物
logger.info('\n✅ 验证构建产物...');
const distPath = path.join(mobileAppPath, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(distPath)) {
  logger.error('  ✗ 构建产物目录不存在！');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  logger.error('  ✗ index.html 不存在！');
  process.exit(1);
}

// 检查构建产物中的关键文件
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js') && f.includes('Login'));
  if (jsFiles.length > 0) {
    logger.info(`  ✓ 找到 ${jsFiles.length} 个 Login 相关文件`);

    // 检查是否包含号码认证相关代码
    let foundAuthCode = false;
    jsFiles.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('getNumberAuthConfig') ||
          content.includes('loginByNumberAuth') ||
          content.includes('NumberAuth')) {
        foundAuthCode = true;
      }
    });

    // 也在其他 JS 文件中查找
    const allJsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));
    for (const file of allJsFiles) {
      const filePath = path.join(assetsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('getNumberAuthConfig') ||
          content.includes('loginByNumberAuth')) {
        foundAuthCode = true;
        break;
      }
    }

    if (foundAuthCode) {
      logger.info('  ✓ 构建产物包含号码认证相关代码');
    } else {
      logger.warn('  ⚠️  构建产物中未找到号码认证相关代码（可能被压缩）');
    }
  } else {
    logger.warn('  ⚠️  未找到 Login 相关文件');
  }
}

logger.info('\n✅ 构建完成！');
logger.info('\n📦 下一步：部署到生产环境');
logger.info('  运行: pnpm deploy:static:mobile');
logger.info('  或: pnpm build-deploy:static:all');

