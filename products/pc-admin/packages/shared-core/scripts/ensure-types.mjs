// logger removed, use console instead
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const srcDir = join(rootDir, 'src');
const srcIndexDts = join(rootDir, 'src', 'index.d.ts');
const distIndexDts = join(distDir, 'index.d.ts');

// 确保 dist 目录存在
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 递归复制所有 .d.ts 文件
function copyDtsFiles(srcPath, destPath) {
  if (!existsSync(srcPath)) return;
  
  const stats = statSync(srcPath);
  if (stats.isFile() && srcPath.endsWith('.d.ts')) {
    const relativePath = srcPath.replace(srcDir, '');
    const destFile = join(destPath, relativePath);
    const destDir = dirname(destFile);
    
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    copyFileSync(srcPath, destFile);
  } else if (stats.isDirectory()) {
    const relativePath = srcPath.replace(srcDir, '');
    const destSubDir = join(destPath, relativePath);
    
    if (!existsSync(destSubDir)) {
      mkdirSync(destSubDir, { recursive: true });
    }
    
    const entries = readdirSync(srcPath);
    for (const entry of entries) {
      copyDtsFiles(join(srcPath, entry), destPath);
    }
  }
}

// 复制所有 .d.ts 文件
try {
  copyDtsFiles(srcDir, distDir);
  console.info('✓ Copied all .d.ts files to dist');
} catch (error) {
  console.error('Failed to copy .d.ts files:', error.message);
  // 如果复制失败，至少确保 index.d.ts 存在
  if (!existsSync(distIndexDts)) {
    copyFileSync(srcIndexDts, distIndexDts);
    console.info('✓ Copied index.d.ts to dist (fallback)');
  }
}

// 尝试运行 tsc 生成类型声明文件（必需）
try {
  const { execSync } = await import('child_process');
  execSync('pnpm exec tsc --project tsconfig.build.json', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.info('✓ Generated type declarations');
} catch (error) {
  // tsc 失败时输出错误信息
  console.error('✗ Failed to generate type declarations:', error.message);
  // 仍然尝试复制 index.d.ts 作为后备方案
  console.info('⚠ Using fallback index.d.ts only');
}

