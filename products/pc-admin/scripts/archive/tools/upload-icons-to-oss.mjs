/**
 * 上传图标文件到阿里云 OSS（基于文件指纹的增量上传）
 * 只在文件变化时才上传，避免不必要的上传操作
 */
import { logger } from '../../../utils/logger.mjs';

import OSS from 'ali-oss';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');

/**
 * Windows 本地执行时：从 Windows Credential Manager 读取最新 AK/SK（如果环境变量缺失）
 */
function tryLoadOssCredsFromWindowsCredentialManager() {
  if (process.platform !== 'win32') return;
  if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) return;

  try {
    const ps = [
      `$ErrorActionPreference='Stop'`,
      `Import-Module CredentialManager`,
      `$id=(Get-StoredCredential -Target 'AlibabaCloud' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$sec=(Get-StoredCredential -Target 'AlibabaCloudSecret' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$out=[pscustomobject]@{ id=$id; secret=$sec } | ConvertTo-Json -Compress`,
      `Write-Output $out`,
    ].join('; ');

    const raw = execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    const jsonText = (raw || '').trim();
    if (!jsonText) return;

    const parsed = JSON.parse(jsonText);
    if (parsed?.id && !process.env.OSS_ACCESS_KEY_ID) process.env.OSS_ACCESS_KEY_ID = parsed.id;
    if (parsed?.secret && !process.env.OSS_ACCESS_KEY_SECRET) process.env.OSS_ACCESS_KEY_SECRET = parsed.secret;
  } catch {
    // 静默失败：继续走 .env.oss 或报缺少配置
  }
}

// 加载 .env.oss 文件
const envOssPath = resolve(projectRoot, '.env.oss');
if (existsSync(envOssPath)) {
  const envContent = readFileSync(envOssPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    // 跳过空行和注释
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        // 移除引号（如果存在）
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = cleanValue;
        }
      }
    }
  });
}

// 最后兜底：如果没有 .env.oss 或没设置 env，则尝试从 Windows 凭证管理器读取
tryLoadOssCredsFromWindowsCredentialManager();

// OSS 配置（从环境变量读取）
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-shenzhen',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || 'bellis1',
};

// CDN 域名
const CDN_DOMAIN = process.env.CDN_STATIC_ASSETS_URL || 'https://all.bellis.com.cn';
const STRICT_UPLOAD = process.env.OSS_UPLOAD_STRICT === 'true';

// 图标文件源目录
const iconsSourceDir = resolve(projectRoot, 'apps/layout-app/public/icons');
const logoSourceFile = resolve(projectRoot, 'apps/layout-app/public/logo.png');

/**
 * 检查 CDN 上的文件是否存在（HEAD 200 才算存在）
 */
async function cdnExists(pathname) {
  try {
    const url = `${CDN_DOMAIN}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 计算文件的 MD5 哈希值
 */
function calculateFileHash(filePath) {
  const fileBuffer = readFileSync(filePath);
  return createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * 检查 OSS 中文件是否存在且哈希值匹配
 */
async function checkFileInOSS(client, ossPath) {
  try {
    const result = await client.head(ossPath);
    // 阿里云 OSS 的 ETag 是文件的 MD5（去掉引号）
    const etag = result.res.headers.etag?.replace(/"/g, '') || '';
    return { exists: true, etag };
  } catch (error) {
    if (error.code === 'NoSuchKey' || error.status === 404) {
      return { exists: false, etag: null };
    }
    throw error;
  }
}

/**
 * 上传单个文件到 OSS（如果文件已存在且哈希值相同，则跳过）
 */
async function uploadFile(client, localPath, ossPath) {
  try {
    // 计算本地文件哈希
    const localHash = calculateFileHash(localPath);
    
    // 检查 OSS 中的文件
    const { exists, etag } = await checkFileInOSS(client, ossPath);
    
    if (exists && etag === localHash) {
      logger.info(`✓ 跳过 ${ossPath}（文件未变化）`);
      return { uploaded: false, skipped: true };
    }
    
    // 上传文件
    const result = await client.put(ossPath, localPath, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
    if (exists) {
      logger.info(`↑ 更新 ${ossPath}（文件已变化）`);
    } else {
      logger.info(`+ 上传 ${ossPath}`);
    }
    
    return { uploaded: true, skipped: false, url: result.url };
  } catch (error) {
    logger.error(`✗ 上传失败 ${ossPath}:`, error.message);
    throw error;
  }
}

/**
 * 上传图标目录中的所有文件
 */
async function uploadIconsDirectory(client) {
  const files = readdirSync(iconsSourceDir);
  const results = [];
  
  for (const file of files) {
    const localPath = join(iconsSourceDir, file);
    const stats = statSync(localPath);
    
    if (stats.isFile()) {
      const ossPath = `icons/${file}`;
      const result = await uploadFile(client, localPath, ossPath);
      results.push({ file, ...result });
    }
  }
  
  return results;
}

/**
 * 上传 logo.png
 */
async function uploadLogo(client) {
  try {
    const stats = statSync(logoSourceFile);
    if (!stats.isFile()) {
      logger.warn('⚠️  logo.png 不存在，跳过');
      return { uploaded: false, skipped: true };
    }
    
    return await uploadFile(client, logoSourceFile, 'logo.png');
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('⚠️  logo.png 不存在，跳过');
      return { uploaded: false, skipped: true };
    }
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  // 先检查源目录是否存在（本地后备方案依赖它）
  if (!statSync(iconsSourceDir).isDirectory()) {
    logger.error(`❌ 错误：图标目录不存在: ${iconsSourceDir}`);
    process.exit(1);
  }

  // 1) 先检查 CDN 是否已存在所有必要文件：存在则跳过上传
  //    这样你手动上传后，后续构建不会重复上传/依赖 OSS 凭证。
  const iconFiles = readdirSync(iconsSourceDir).filter((f) => {
    const full = join(iconsSourceDir, f);
    try {
      return statSync(full).isFile();
    } catch {
      return false;
    }
  });

  const cdnChecks = [
    { name: 'logo.png', path: '/logo.png' },
    ...iconFiles.map((f) => ({ name: `icons/${f}`, path: `/icons/${f}` })),
  ];

  const cdnResults = await Promise.all(
    cdnChecks.map(async (x) => ({ ...x, ok: await cdnExists(x.path) }))
  );

  const cdnMissing = cdnResults.filter((x) => !x.ok);
  if (cdnMissing.length === 0) {
    logger.info('✓ CDN 已存在所有 icons/ 和 logo.png，跳过 OSS 上传');
    return;
  }

  logger.info(`⚠️  CDN 缺少 ${cdnMissing.length}/${cdnResults.length} 个文件，将尝试上传 OSS`);

  // 检查必要的环境变量
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
    const msg = [
      '⚠️  缺少 OSS 配置（OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET）。',
      '    当前 CDN 仍缺少部分文件，无法自动补齐；将依赖 layout-app 构建产物中的本地 icons/logo 作为后备。',
      '    如需严格失败，请设置环境变量 OSS_UPLOAD_STRICT=true',
    ].join('\n');

    if (STRICT_UPLOAD) {
      logger.error(msg);
      process.exit(1);
    } else {
      logger.warn(msg);
      return;
    }
  }
  
  logger.info('🚀 开始上传图标文件到 OSS...');
  logger.info(`   源目录: ${iconsSourceDir}`);
  logger.info(`   OSS Bucket: ${ossConfig.bucket}`);
  logger.info(`   OSS Region: ${ossConfig.region}`);
  logger.info(`   CDN 域名: ${CDN_DOMAIN}`);
  logger.info('');
  
  // 创建 OSS 客户端
  const client = new OSS({
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket,
  });
  
  try {
    // 上传图标目录
    logger.info('📁 上传 icons/ 目录...');
    const iconResults = await uploadIconsDirectory(client);
    
    // 上传 logo.png
    logger.info('');
    logger.info('🖼️  上传 logo.png...');
    const logoResult = await uploadLogo(client);
    
    // 统计结果
    const totalFiles = iconResults.length + 1;
    const uploadedFiles = iconResults.filter(r => r.uploaded).length + (logoResult.uploaded ? 1 : 0);
    const skippedFiles = iconResults.filter(r => r.skipped).length + (logoResult.skipped ? 1 : 0);
    
    logger.info('');
    logger.info('✅ 上传完成！');
    logger.info(`   总计: ${totalFiles} 个文件`);
    logger.info(`   上传: ${uploadedFiles} 个文件`);
    logger.info(`   跳过: ${skippedFiles} 个文件（未变化）`);
    logger.info('');
    logger.info(`📦 文件可通过 CDN 访问：`);
    logger.info(`   ${CDN_DOMAIN}/logo.png`);
    logger.info(`   ${CDN_DOMAIN}/icons/`);
  } catch (error) {
    const msg = `⚠️  上传失败：${error?.message || error}`;
    if (STRICT_UPLOAD) {
      logger.error(msg);
      process.exit(1);
    } else {
      logger.warn(msg);
      logger.warn('    将依赖 layout-app 构建产物中的本地 icons/logo 作为后备（避免 404）。');
      return;
    }
  }
}

// 执行主函数
main().catch(error => {
  logger.error('❌ 未处理的错误:', error);
  process.exit(1);
});

