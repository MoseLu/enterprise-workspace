/**
 * 上传应用构建产物到 CDN 的 Vite 插件
 * 在生产构建完成后，自动上传应用构建产物到 OSS/CDN（基于文件指纹的增量上传）
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[upload-cdn]', ...args),
  error: (...args: any[]) => console.error('[upload-cdn]', ...args),
  info: (...args: any[]) => console.info('[upload-cdn]', ...args),
  debug: (...args: any[]) => console.debug('[upload-cdn]', ...args),
};

import type { Plugin, ResolvedConfig } from 'vite';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '../../..');

function tryLoadOssCredsFromWindowsCredentialManager(): void {
  // 只在 Windows 且缺少凭证时尝试
  if (process.platform !== 'win32') return;
  if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) return;

  try {
    // 通过 PowerShell + CredentialManager 读取（不输出明文到日志）
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

    const parsed = JSON.parse(jsonText) as { id?: string; secret?: string };
    if (parsed?.id && !process.env.OSS_ACCESS_KEY_ID) process.env.OSS_ACCESS_KEY_ID = parsed.id;
    if (parsed?.secret && !process.env.OSS_ACCESS_KEY_SECRET) process.env.OSS_ACCESS_KEY_SECRET = parsed.secret;
  } catch {
    // 静默失败：不阻塞构建流程
  }
}

/**
 * 创建 CDN 上传插件
 * @param appName 应用名称（如 'system-app'）
 * @param appDir 应用目录
 */
export function uploadCdnPlugin(appName: string, _appDir: string): Plugin {
  let isProductionBuild = false;

  return {
    name: 'upload-cdn',
    apply: 'build', // 只在构建时执行

    configResolved(config: ResolvedConfig) {
      // Vite 的 isProduction 是最可靠的判断（避免 NODE_ENV / DEV 等环境变量在 CI 中不一致）
      isProductionBuild = !!config.isProduction;
    },

    async closeBundle() {
      // 检查是否启用 CDN 上传
      if (process.env.ENABLE_CDN_UPLOAD !== 'true') {
        return;
      }

      // 检查是否跳过上传
      if (process.env.SKIP_CDN_UPLOAD === 'true') {
        console.info(`[upload-cdn] ⏭️  跳过 ${appName} 的 CDN 上传（SKIP_CDN_UPLOAD=true）`);
        return;
      }

      // 只在生产环境构建时上传
      if (!isProductionBuild) {
        return;
      }

      // Windows 本地构建：如果未显式设置 env/.env.oss，尝试从凭证管理器读取
      tryLoadOssCredsFromWindowsCredentialManager();

      // 检查是否有 OSS 配置
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        console.warn(`[upload-cdn] ⚠️  跳过 ${appName} 的 CDN 上传（未配置 OSS 凭证）`);
        return;
      }

      // 关键：在 CI 中必须等待上传完成，否则构建进程退出会直接终止子进程，导致文件未上传
      const uploadScript = resolve(projectRoot, 'scripts/upload-app-to-cdn.mjs');
      console.info(`[upload-cdn] 🚀 开始上传 ${appName} 到 CDN...`);

      await new Promise<void>((resolvePromise, rejectPromise) => {
        const child = spawn('node', [uploadScript, appName], {
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
          },
        });

        child.on('error', (error) => {
          rejectPromise(error);
        });

        child.on('exit', (code) => {
          if (code === 0) {
            console.info(`[upload-cdn] ✅ ${appName} 上传完成`);
            resolvePromise();
          } else {
            // 默认不阻塞构建：如需严格失败（CI 强制上传成功），设置 OSS_UPLOAD_STRICT=true
            const strict = process.env.OSS_UPLOAD_STRICT === 'true';
            const err = new Error(`[upload-cdn] ${appName} 上传脚本退出，代码: ${code ?? 'unknown'}`);
            if (strict) {
              rejectPromise(err);
            } else {
              console.warn(err.message);
              resolvePromise();
            }
          }
        });
      });
    },
  } as Plugin;
}

