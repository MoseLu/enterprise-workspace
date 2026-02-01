/**
 * Public 图片资源处理插件
 * 将 public 目录中的图片文件打包到 assets 目录并添加哈希值
 * 特殊处理 logo.png：保持在根目录，文件名不变
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[public-images]', ...args),
  error: (...args: any[]) => console.error('[public-images]', ...args),
  info: (...args: any[]) => console.info('[public-images]', ...args),
  debug: (...args: any[]) => console.debug('[public-images]', ...args),
};

import type { Plugin, ResolvedConfig } from 'vite';
import type { OutputOptions, OutputBundle } from 'rollup';
import { resolve, join, extname, basename } from 'path';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';

export function publicImagesToAssetsPlugin(appDir: string): Plugin {
  const imageMap = new Map<string, string>();
  const emittedFiles = new Map<string, string>();
  const publicImageFiles = new Map<string, string>();
  let isProductionBuild = false;
  
  // 需要特殊处理的文件列表：放在根目录，不使用 hash（仅用于 CSS 路径替换）
  const rootImageFiles = ['logo.png', 'login_cut_dark.png', 'login_cut_light.png'];

  const isVirtualModuleId = (id: string): boolean => {
    return id.includes('\0') || id.includes('public-image:');
  };

  const extractOriginalPath = (id: string): string | null => {
    if (!isVirtualModuleId(id)) {
      return null;
    }
    const originalPath = id.replace(/\0public-image:/g, '').replace(/\0/g, '');
    if (originalPath.includes('\0')) {
      return null;
    }
    return originalPath;
  };

  return {
    name: 'public-images-to-assets',
    configResolved(config: ResolvedConfig) {
      // Vite 的 isProduction 是最可靠的判断（避免 NODE_ENV / DEV 等环境变量在 CI 中不一致）
      isProductionBuild = !!config.isProduction;
    },
    buildStart() {
      // 在开发模式下，Vite 会直接服务 public 目录的文件，不需要处理
      // 只在构建模式下才需要处理图片
      if (!isProductionBuild) {
        // 开发模式，静默跳过
        return;
      }

      const publicDir = resolve(appDir, 'public');
      if (!existsSync(publicDir)) {
        return;
      }

      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
      // 排除 favicon.ico，统一使用 logo.png 作为 favicon
      const excludedFiles = ['favicon.ico'];
      const files = readdirSync(publicDir);

      for (const file of files) {
        // 跳过排除的文件
        if (excludedFiles.includes(file)) {
          // 构建模式下才输出日志
          console.info(`[public-images-to-assets] ⏭️  跳过 ${file}（统一使用 logo.png 作为 favicon）`);
          continue;
        }
        
        const ext = extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          // 根目录图片需要特殊处理：保持在根目录，文件名不变，不使用哈希值
          if (rootImageFiles.includes(file)) {
            // 构建模式下才输出日志
            console.info(`[public-images-to-assets] 📦 处理 ${file}，将复制到根目录（无哈希值）`);
            // 记录文件的路径，在 writeBundle 阶段复制到根目录
            publicImageFiles.set(file, join(publicDir, file));
            continue;
          }

          const filePath = join(publicDir, file);
          const stats = statSync(filePath);
          if (stats.isFile()) {
            publicImageFiles.set(`/${file}`, filePath);
            publicImageFiles.set(file, filePath);

            const fileContent = readFileSync(filePath);
            // 关键：Rollup 的 emitFile 会将文件放在 assetsDir（默认是 'assets'）
            // 我们不在 emitFile 时指定 fileName，让 Rollup 自动处理，然后在 generateBundle 中获取实际路径
            const referenceId = (this as any).emitFile({
              type: 'asset',
              name: file, // 文件名（不含路径），Rollup 会自动添加哈希值并放在 assetsDir
              source: fileContent,
            });
            emittedFiles.set(file, referenceId);
            // 构建模式下才输出日志
            console.info(`[public-images-to-assets] 📦 将 ${file} 打包 (referenceId: ${referenceId})`);
          }
        }
      }
    },
    resolveId(id: string, _importer: string | undefined): string | null | { id: string; external?: boolean } {
      if (isVirtualModuleId(id)) {
        if (id.startsWith('\0public-image:') || id.includes('\0public-image:')) {
          return id;
        }
        return null;
      }

      // 关键：处理 /logo.png 的解析，让 Rollup 能够找到它
      // 即使 publicDir 被禁用，我们仍然需要让构建时能够解析这个路径
      if (id === '/logo.png' || id === 'logo.png') {
        const logoPath = publicImageFiles.get('logo.png');
        if (logoPath && existsSync(logoPath)) {
          // 返回实际文件路径，让 Rollup 能够处理
          return logoPath;
        }
        // 如果文件不存在，返回虚拟模块 ID
        return `\0public-image:/logo.png`;
      }

      if (id.startsWith('/') && publicImageFiles.has(id)) {
        return `\0public-image:${id}`;
      }
      return null;
    },
    load(id: string) {
      // 关键：处理根目录图片的加载
      // 如果 id 是实际文件路径（不是虚拟模块），直接返回文件内容
      for (const rootFile of rootImageFiles) {
        if (id.endsWith(rootFile) && existsSync(id)) {
          // 对于根目录图片，返回一个导出路径的模块
          // 在运行时，图片会在根目录，所以返回 "/文件名"
          return `export default "/${rootFile}";`;
        }
      }

      if (!isVirtualModuleId(id)) {
        return null;
      }

      const originalPath = extractOriginalPath(id);
      if (!originalPath) {
        // 特殊处理根目录图片
        for (const rootFile of rootImageFiles) {
          if (id.includes(rootFile)) {
            return `export default "/${rootFile}";`;
          }
        }
        console.warn(`[public-images-to-assets] ⚠️  无法提取原始路径，跳过: ${id}`);
        return null;
      }

      const fileName = basename(originalPath);

      // 如果是根目录图片，直接返回路径
      if (rootImageFiles.includes(fileName)) {
        return `export default "/${fileName}";`;
      }

      const referenceId = emittedFiles.get(fileName);
      if (referenceId) {
        return `export default "/${fileName}";`;
      }

      return null;
    },
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      const bundleAssets = Object.entries(bundle).filter(([_, chunk]) => (chunk as any).type === 'asset');
      console.info(`[public-images-to-assets] 📋 bundle 中的资源文件数量: ${bundleAssets.length}`);

      console.info(`[public-images-to-assets] 🔍 开始处理 ${emittedFiles.size} 个已发出的文件`);
      for (const [originalFile, referenceId] of emittedFiles.entries()) {
        try {
          const actualFileName = (this as any).getFileName(referenceId);

          if (!actualFileName) {
            console.warn(`[public-images-to-assets] ⚠️  无法获取 ${originalFile} 的文件名 (referenceId: ${referenceId})`);
            continue;
          }

          const assetChunk = bundle[actualFileName];
          if (!assetChunk || assetChunk.type !== 'asset') {
            console.warn(`[public-images-to-assets] ⚠️  在 bundle 中未找到 ${actualFileName} (原始文件: ${originalFile})`);
            continue;
          }

          // 关键：保持完整的路径，包括 assets/ 前缀（如果存在）
          // Rollup 会将文件放在 assets 目录，所以路径应该是 assets/filename
          const fileNameWithPath = actualFileName; // 保持原始路径，包括 assets/ 前缀
          imageMap.set(originalFile, fileNameWithPath);
          console.info(`[public-images-to-assets] ✅ ${originalFile} -> ${fileNameWithPath} (Rollup 生成的文件名)`);
        } catch (error) {
          console.warn(`[public-images-to-assets] ⚠️  处理 ${originalFile} 时出错:`, error);
        }
      }

      if (imageMap.size === 0) {
        console.warn(`[public-images-to-assets] ⚠️  imageMap 为空，可能 emitFile 没有成功执行`);
      } else {
        console.info(`[public-images-to-assets] 📝 imageMap 内容:`, Array.from(imageMap.entries()).map(([k, v]) => `${k} -> ${v}`).join(', '));
      }

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const c: any = chunk;
        if (c.type === 'chunk' && c.code) {
          let modified = false;
          let newCode = c.code;

          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            // 关键：hashedFile 可能已经包含 assets/ 前缀，需要确保路径正确
            const newPath = hashedFile.startsWith('assets/') ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const stringPattern = new RegExp(`(["'\`])${escapedPath}(["'\`])`, 'g');
            if (newCode.includes(originalPath)) {
              newCode = newCode.replace(stringPattern, `$1${newPath}$2`);
              modified = true;
            }
          }

          if (modified) {
            c.code = newCode;
            console.info(`[public-images-to-assets] 🔄 更新 ${fileName} 中的图片引用`);
          }
        } else if (c.type === 'asset' && fileName.endsWith('.css') && (c as any).source) {
          let modified = false;
          let newSource = typeof (c as any).source === 'string' ? (c as any).source : Buffer.from((c as any).source).toString('utf-8');

          // 首先处理根目录图片：替换为根目录路径
          for (const rootFile of rootImageFiles) {
            const rootPath = `/${rootFile}`;
            // 匹配 assets 目录中的引用（Vite 可能已经处理过，添加了 hash）
            // 格式可能是：/assets/login_cut_dark-ChKD5Upo.png 或 url(/assets/login_cut_dark-ChKD5Upo.png)
            // 需要匹配文件名部分（不含扩展名）+ hash + 扩展名
            const fileNameWithoutExt = rootFile.replace(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i, '');
            const fileExt = rootFile.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)?.[0] || '.png';
            // 转义特殊字符，但保留下划线
            const escapedFileName = fileNameWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 匹配 /assets/文件名-hash.扩展名 格式（在 url() 中或直接引用）
            const assetsPattern = new RegExp(`/assets/${escapedFileName}-[A-Za-z0-9]{4,}${fileExt.replace('.', '\\.')}`, 'g');
            if (assetsPattern.test(newSource)) {
              newSource = newSource.replace(assetsPattern, rootPath);
              modified = true;
              console.info(`[public-images-to-assets] 🔄 更新 CSS ${fileName} 中的根目录图片引用: /assets/${rootFile} -> ${rootPath}`);
            }
            // 也匹配直接的根路径引用（已经是根路径，不需要修改）
            const rootPattern = new RegExp(`url\\(["']?${rootPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\?[^"')]*)?["']?\\)`, 'g');
            if (rootPattern.test(newSource)) {
              // 已经是根路径，不需要修改
            }
          }

          // 然后处理其他图片（带 hash 的）
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            // 跳过根目录图片，已经处理过了
            if (rootImageFiles.includes(originalFile)) {
              continue;
            }
            
            const originalPath = `/${originalFile}`;
            // 关键：hashedFile 可能已经包含 assets/ 前缀，需要确保路径正确
            const newPath = hashedFile.startsWith('assets/') ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 匹配多种 URL 格式：
            // 1. url(/path) - 无引号
            // 2. url("/path") - 双引号
            // 3. url('/path') - 单引号
            // 4. url(/path?query) - 带查询参数
            const urlPatterns = [
              new RegExp(`url\\(${escapedPath}(\\?[^)]*)?\\)`, 'g'),
              new RegExp(`url\\(["']${escapedPath}(\\?[^"']*)?["']\\)`, 'g'),
            ];

            for (const pattern of urlPatterns) {
              if (pattern.test(newSource)) {
                newSource = newSource.replace(pattern, (match: string) => {
                  // 保留查询参数（如果有）
                  const queryMatch = match.match(/(\?[^)]*)/);
                  const query = queryMatch ? queryMatch[1] : '';
                  return match.replace(originalPath, newPath).replace(/\?[^)]*/, query ? query : '');
                });
                modified = true;
                console.info(`[public-images-to-assets] 🔄 更新 CSS ${fileName} 中的引用: ${originalPath} -> ${newPath}`);
              }
            }
          }

          if (modified) {
            (c as any).source = newSource;
          }
        }
      }
    },
    writeBundle(options: OutputOptions) {
      const outputDir = options.dir || resolve(appDir, 'dist');

      // 关键：复制根目录图片到根目录（不使用哈希值，保持原文件名）
      for (const rootFile of rootImageFiles) {
        const filePath = publicImageFiles.get(rootFile);
        if (filePath && existsSync(filePath)) {
          const fileDest = join(outputDir, rootFile);
          try {
            const fileContent = readFileSync(filePath);
            writeFileSync(fileDest, fileContent);
            console.info(`[public-images-to-assets] ✅ 已复制 ${rootFile} 到根目录: ${fileDest}`);
          } catch (error) {
            console.warn(`[public-images-to-assets] ⚠️  复制 ${rootFile} 失败:`, error);
          }
        }
      }

      // 关键：复制 bridge.html 到根目录（用于跨子域通信）
      // 注意：bridge.html 应该只在 main-app 中存在，因为所有子应用都访问主域的 bridge.html
      const publicDir = resolve(appDir, 'public');
      const bridgeHtmlPath = join(publicDir, 'bridge.html');
      if (existsSync(bridgeHtmlPath)) {
        const bridgeHtmlDest = join(outputDir, 'bridge.html');
        try {
          const fileContent = readFileSync(bridgeHtmlPath);
          writeFileSync(bridgeHtmlDest, fileContent);
          console.info(`[public-images-to-assets] ✅ 已复制 bridge.html 到根目录: ${bridgeHtmlDest}`);
        } catch (error) {
          console.error(`[public-images-to-assets] ❌ 复制 bridge.html 失败:`, error);
          throw error; // 抛出错误，确保构建失败
        }
      } else {
        // bridge.html 不存在，检查是否是 main-app（应该存在）
        const appName = appDir.split(/[/\\]/).pop() || '';
        if (appName === 'main-app') {
          console.warn(`[public-images-to-assets] ⚠️  警告: main-app 的 public/bridge.html 不存在！`);
          console.warn(`[public-images-to-assets] ⚠️  这会导致跨子域通信失败。请确保 bridge.html 存在于 public 目录。`);
        }
        // 其他应用不需要 bridge.html（它们访问主域的 bridge.html）
      }

      if (imageMap.size === 0) {
        return;
      }

      const assetsDirPath = join(outputDir, 'assets');

      if (!existsSync(assetsDirPath)) {
        mkdirSync(assetsDirPath, { recursive: true });
      }

      const indexHtmlPath = join(outputDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let modified = false;

        for (const [originalFile, hashedFile] of imageMap.entries()) {
          // 跳过根目录图片，保持原文件名
          if (rootImageFiles.includes(originalFile)) {
            continue;
          }

          const originalPath = `/${originalFile}`;
          const newPath = `/${hashedFile}`;

          if (html.includes(originalPath)) {
            html = html.replace(new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
            modified = true;
            console.info(`[public-images-to-assets] 🔄 更新 HTML 中的引用: ${originalPath} -> ${newPath}`);
          }
        }

        if (modified) {
          writeFileSync(indexHtmlPath, html, 'utf-8');
        }
      }

      const assetsDir = join(outputDir, 'assets');
      if (existsSync(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
        const cssFiles = readdirSync(assetsDir).filter(f => f.endsWith('.css'));

        for (const file of [...jsFiles, ...cssFiles]) {
          const filePath = join(assetsDir, file);
          let content = readFileSync(filePath, 'utf-8');
          let modified = false;

          // 首先处理根目录图片：替换为根目录路径
          for (const rootFile of rootImageFiles) {
            const rootPath = `/${rootFile}`;
            // 匹配 assets 目录中的引用（Vite 可能已经处理过，添加了 hash）
            // 格式可能是：/assets/login_cut_dark-ChKD5Upo.png
            // 需要匹配文件名部分（不含扩展名）+ hash + 扩展名
            const fileNameWithoutExt = rootFile.replace(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i, '');
            const fileExt = rootFile.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)?.[0] || '.png';
            // 转义特殊字符，但保留下划线
            const escapedFileName = fileNameWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 匹配 /assets/文件名-hash.扩展名 格式
            const assetsPattern = new RegExp(`/assets/${escapedFileName}-[A-Za-z0-9]{4,}${fileExt.replace('.', '\\.')}`, 'g');
            if (assetsPattern.test(content)) {
              content = content.replace(assetsPattern, rootPath);
              modified = true;
              console.info(`[public-images-to-assets] 🔄 更新 ${file} 中的根目录图片引用: /assets/${rootFile} -> ${rootPath}`);
            }
          }

          // 然后处理其他图片（带 hash 的）
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            // 跳过根目录图片，已经处理过了
            if (rootImageFiles.includes(originalFile)) {
              continue;
            }
            
            const originalPath = `/${originalFile}`;
            // 关键：hashedFile 包含完整路径（如 assets/login_cut_dark-ChKD5Upo.png）
            // 需要确保路径以 / 开头
            const newPath = hashedFile.startsWith('assets/') ? `/${hashedFile}` : `/${hashedFile}`;

            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 匹配多种格式，包括带查询参数的
            // 使用字符串拼接避免模板字符串中的反引号转义问题
            const backtick = '`';
            const quotePattern = '["\'' + backtick + ']';
            const negatedQuotePattern = '[^"' + "'" + backtick + ']';
            const patterns = [
              new RegExp('(' + quotePattern + ')' + escapedPath + '(\\?' + negatedQuotePattern + '*)?(' + quotePattern + ')', 'g'),
              new RegExp(`url\\(${escapedPath}(\\?[^)]*)?\\)`, 'g'),
              new RegExp(`url\\(['"]${escapedPath}(\\?[^"']*)?['"]\\)`, 'g'),
            ];

            for (const pattern of patterns) {
              if (pattern.test(content)) {
                if (pattern.source.includes('url')) {
                  content = content.replace(pattern, (match) => {
                    // 保留查询参数（如果有）
                    const queryMatch = match.match(/(\?[^)]*)/);
                    const query = queryMatch ? queryMatch[1] : '';
                    return match.replace(originalPath, newPath).replace(/\?[^)]*/, query ? query : '');
                  });
                } else {
                  // 对于字符串引用，也保留查询参数
                  content = content.replace(pattern, (_match: string, quote1: string, _path: string, query: string, quote2: string) => {
                    return `${quote1}${newPath}${query || ''}${quote2}`;
                  });
                }
                modified = true;
                console.info(`[public-images-to-assets] 🔄 更新 ${file} 中的引用: ${originalPath} -> ${newPath}`);
              }
            }
          }

          if (modified) {
            writeFileSync(filePath, content, 'utf-8');
          }
        }
      }
    },
    closeBundle() {
      if (imageMap.size === 0) {
        return;
      }

      const outputDir = resolve(appDir, 'dist');

      for (const [originalFile, hashedFile] of imageMap.entries()) {
        // 检查文件是否在 assets 目录或根目录
        const expectedPath = join(outputDir, hashedFile);
        if (existsSync(expectedPath)) {
          console.info(`[public-images-to-assets] ✅ 文件已正确生成: ${hashedFile}`);
        } else {
          // 尝试在根目录查找（如果 hashedFile 不包含 assets/）
          const rootPath = hashedFile.startsWith('assets/')
            ? join(outputDir, hashedFile.replace('assets/', ''))
            : join(outputDir, hashedFile);
          if (existsSync(rootPath)) {
            console.info(`[public-images-to-assets] ✅ 文件在根目录: ${hashedFile.replace('assets/', '')}`);
          } else {
            console.warn(`[public-images-to-assets] ⚠️  文件不存在: ${hashedFile} (原始文件: ${originalFile})`);
            console.warn(`[public-images-to-assets]   检查路径: ${expectedPath}`);
            console.warn(`[public-images-to-assets]   检查路径: ${rootPath}`);
          }
        }
      }
    },
  } as Plugin;
}

