/* eslint-disable @typescript-eslint/no-explicit-any */
;
import type { Plugin } from 'vite';
import { readFileSync, readdirSync } from 'fs';
import { basename, extname, join } from 'path';
import { optimize } from 'svgo';
import { rootDir, setRootDir } from '../utils';
import { config } from '../config';

let svgIcons: string[] = [];

/**
 * 递归查找 SVG 文件
 */
function findSvg(dir: string): string[] {
  const arr: string[] = [];

  try {
    const dirs = readdirSync(dir, {
      withFileTypes: true,
    });

    // 获取当前目录的模块名
    const moduleName = dir.match(/[/\\](?:src[/\\](?:plugins|modules)[/\\])([^/\\]+)/)?.[1] || '';

    // 检查是否是 assets/icons 目录
    const isAssetsIcons = dir.includes('/assets/icons/') || dir.includes('\\assets\\icons\\');

    for (const d of dirs) {
      if (d.isDirectory()) {
        arr.push(...findSvg(dir + d.name + '/'));
      } else {
        if (extname(d.name) === '.svg') {
          const baseName = basename(d.name, '.svg');

          // 判断是否需要跳过拼接模块名
          let shouldSkip = config.svg?.skipNames?.includes(moduleName);

          // 跳过包含 icon-
          if (baseName.includes('icon-')) {
            shouldSkip = true;
          }

          // 如果是 assets/icons 目录，直接使用文件名，不拼接模块名
          if (isAssetsIcons) {
            shouldSkip = true;
          }

          // 如果 moduleName 为空，也跳过拼接
          if (!moduleName) {
            shouldSkip = true;
          }

          const iconName = shouldSkip ? baseName : `${moduleName}-${baseName}`;

          svgIcons.push(iconName);

          let svgContent = readFileSync(dir + d.name).toString();
          // 清理 XML 声明和 DOCTYPE
          svgContent = svgContent
            .replace(/<\?xml[^>]*\?>/g, '')
            .replace(/<!DOCTYPE[^>]*>/g, '');

          // 提取 viewBox 或使用 width/height
          const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
          const widthMatch = svgContent.match(/width=["']([^"']+)["']/);
          const heightMatch = svgContent.match(/height=["']([^"']+)["']/);

          let viewBox = '';
          if (viewBoxMatch) {
            viewBox = `viewBox="${viewBoxMatch[1]}"`;
          } else if (widthMatch && heightMatch) {
            viewBox = `viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`;
          }

          // 简化：只提取 path、circle、rect 等核心内容
          const innerContent = svgContent
            .replace(/<svg[^>]*>/, '')
            .replace(/<\/svg>/, '')
            .replace(/(\r\n|\n|\r)/gm, '');

          const svg = `<symbol id="icon-${iconName}" ${viewBox}>${innerContent}</symbol>`;

          arr.push(svg);
        }
      }
    }
  } catch (_err) {
    // 目录不存在或无法访问，忽略
  }

  return arr;
}

function listSvgFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...listSvgFiles(full));
      } else if (entry.isFile() && extname(entry.name) === '.svg') {
        files.push(full);
      }
    }
  } catch (_err) {
    // ignore missing directories
  }

  return files;
}

/**
 * 编译 SVG
 */
function compilerSvg(): string {
  svgIcons = [];

  // 扫描 src/ 目录下的 modules 和 plugins
  const srcSvgs = findSvg(rootDir('./src/'));

  // 扫描 assets/icons 目录
  let assetsSvgs: string[] = [];
  const localAssetsDir = rootDir('./src/assets/icons/');
  const localSvgFiles = listSvgFiles(localAssetsDir);

  if (localSvgFiles.length > 0) {
    if (config.svg?.allowAppIcons) {
      assetsSvgs = findSvg(localAssetsDir);
      // 开发环境：输出调试信息
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[btc:svg] 扫描应用内图标目录: ${localAssetsDir}`);
        console.debug(`[btc:svg] 找到 ${localSvgFiles.length} 个应用内 SVG 文件`);
        if (assetsSvgs.length > 0) {
          console.debug(`[btc:svg] 应用内图标已扫描: ${svgIcons.slice(-localSvgFiles.length).join(', ')}`);
        }
      }
    } else {
      const sample = localSvgFiles
        .slice(0, 5)
        .map((file) => file.replace(`${rootDir('./')}`, ''))
        .join(', ');
      console.warn(
        `[btc:svg] 检测到 ${localSvgFiles.length} 个应用内 SVG 图标（src/assets/icons）。已跳过处理，请迁移到 packages/shared-components/src/assets/icons。` +
          (sample ? ` 示例: ${sample}` : '')
      );
    }
  }

  // 扫描共享组件的 icons 目录，确保跨应用的公共组件也能使用这些图标
  const sharedAssetsDir = rootDir('../../packages/shared-components/src/assets/icons/');
  const sharedAssetsSvgs = findSvg(sharedAssetsDir);

  // 开发环境：输出调试信息
  if (process.env.NODE_ENV !== 'production') {
    const sharedSvgFiles = listSvgFiles(sharedAssetsDir);
    if (sharedSvgFiles.length > 0) {
      console.debug(`[btc:svg] 扫描共享组件图标目录: ${sharedAssetsDir}`);
      console.debug(`[btc:svg] 找到 ${sharedSvgFiles.length} 个共享 SVG 文件`);
    }
  }

  // 加载顺序：共享组件图标先加载，应用内图标后加载（可以覆盖共享组件的同名图标）
  // 这样应用可以自定义覆盖共享组件的图标
  const allSvgs = [...srcSvgs, ...sharedAssetsSvgs, ...assetsSvgs];
  const finalHtml = allSvgs
    .map((e) => {
      // 检查是否是 bg.svg（包含 icon-bg symbol）
      const isBgIcon = e.includes('id="icon-bg"');

      if (isBgIcon) {
        // bg.svg 不进行优化，保留所有原始属性（特别是 fill 属性）
        return e;
      }

      // 其他 SVG 正常优化，配置 svgo 保留 fill 属性
      const result = optimize(e, {
        plugins: [
          {
            name: 'removeUselessStrokeAndFill',
            params: {
              fill: false,  // 禁用移除 fill
              stroke: false // 禁用移除 stroke
            }
          }
        ],
        multipass: false
      });
      return result.data || e;
    })
    .join('');

  return finalHtml;
}

/**
 * 创建 SVG sprite
 */
export async function createSvg(): Promise<{ code: string; svgIcons: string[]; svgHtml?: string }> {
  const html = compilerSvg();
  // 使用 JSON.stringify 来安全地转义所有特殊字符
  const escapedHtml = JSON.stringify(html);

  const code = `
if (typeof window !== 'undefined') {
	var loadSvgAttempts = 0;
	var maxLoadSvgAttempts = 100;

	function loadSvg() {
		loadSvgAttempts++;
		if (loadSvgAttempts > maxLoadSvgAttempts) {
			console.warn('[btc:svg] 无法加载SVG sprite，已达到最大尝试次数');
			return;
		}

		if (!document.body) {
			setTimeout(loadSvg, 50);
			return;
		}

		// 检查是否已存在
		if (document.getElementById('btc-svg-sprite')) {
			return;
		}

		try {
			const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svgDom.id = 'btc-svg-sprite';
			svgDom.style.position = 'absolute';
			svgDom.style.width = '0';
			svgDom.style.height = '0';
			svgDom.style.overflow = 'hidden';
			svgDom.style.visibility = 'hidden';
			svgDom.setAttribute('xmlns','http://www.w3.org/2000/svg');
			svgDom.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
			svgDom.innerHTML = ${escapedHtml};
			document.body.insertBefore(svgDom, document.body.firstChild);

			// 验证是否成功加载
			const loadedSprite = document.getElementById('btc-svg-sprite');
			if (loadedSprite) {
				const symbolCount = loadedSprite.querySelectorAll('symbol').length;
				if (symbolCount === 0) {
					console.warn('[btc:svg] ⚠️ SVG sprite 中没有找到任何 symbol 元素！');
				}
				// 注意：应用内图标（如 windmill、star）由应用级别的 svg-hmr 插件动态添加
				// 因此不在这里检查这些图标
			}
		} catch (e) {
			console.error('[btc:svg] 加载SVG sprite失败:', e);
			setTimeout(loadSvg, 100);
		}
	}

	function updateSvg(newHtml) {
		const svgDom = document.getElementById('btc-svg-sprite');
		if (svgDom) {
			svgDom.innerHTML = newHtml;
		} else {
			loadSvg();
		}
	}

	// 多种方式确保加载
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadSvg);
	}

	// 立即尝试（如果body已存在）
	if (document.body) {
		loadSvg();
	} else {
		// 如果body不存在，使用MutationObserver或setTimeout
		if (typeof MutationObserver !== 'undefined') {
			var observer = new MutationObserver(function(mutations) {
				if (document.body) {
					loadSvg();
					observer.disconnect();
				}
			});
			observer.observe(document.documentElement, { childList: true, subtree: true });
		}
		// 备用：定时检查
		setTimeout(loadSvg, 100);
	}
}
	`;

  return { code, svgIcons, svgHtml: html };
}

/**
 * SVG 图标插件
 * 扫描项目中的 SVG 文件，自动生成 SVG sprite
 */
export function svgPlugin(): Plugin {
  let svgCode = '';
  let iconList: string[] = [];
  let isInitialized = false;
  let viteDevServer: any = null;

  // 重新生成 SVG sprite（用于HMR）
  async function regenerateSvg() {
    // 重置全局图标列表，强制重新扫描
    svgIcons = [];

    // 重新扫描并生成HTML和完整代码
    const result = await createSvg();
    svgCode = result.code;
    iconList = result.svgIcons;
    const html = result.svgHtml || '';

    if (iconList.length > 0) {
      console.info(`[btc:svg] 重新扫描完成，找到 ${iconList.length} 个 svg 图标`);
    }

    isInitialized = true;
    return { svgCode, iconList, svgHtml: html };
  }

  // 初始化 SVG sprite（确保在构建和开发时都能正确生成）
  async function initializeSvg(resolved?: any) {
    if (isInitialized && !viteDevServer) return;

    // 同步 Vite 根目录，确保多包场景下路径解析正确
    if (resolved) {
      setRootDir(resolved.root);
    }

    // 生成 SVG sprite
    const result = await createSvg();
    svgCode = result.code;
    iconList = result.svgIcons;

    if (iconList.length > 0) {
      console.info(`[btc:svg] 找到 ${iconList.length} 个 svg 图标`);
    }

    isInitialized = true;
  }

  return {
    name: 'btc:svg',
    enforce: 'pre',

		async configResolved(resolved: any) {
      await initializeSvg(resolved);
		},

    configureServer(server: any) {
      // 保存 dev server 实例，用于HMR
      viteDevServer = server;
    },

    async buildStart() {
      // 构建时确保 SVG sprite 已生成
      if (!isInitialized) {
        await initializeSvg();
      }
    },

    handleHotUpdate(ctx: any) {
      // 监听应用内的 SVG 文件变化（用于HMR）
      const localAssetsDir = rootDir('./src/assets/icons/');
      const filePath = ctx.file.replace(/\\/g, '/');
      const assetsDirPath = localAssetsDir.replace(/\\/g, '/');

      // 检查是否是应用内的 SVG 文件变化
      if (filePath.includes(assetsDirPath) && filePath.endsWith('.svg')) {
        // 重新生成 SVG sprite
        regenerateSvg().then((result) => {
          // 通知客户端更新 SVG sprite
          if (viteDevServer && result.svgHtml) {
            // 通过自定义事件通知客户端更新 SVG sprite
            viteDevServer.ws.send({
              type: 'custom',
              event: 'btc-svg-update',
              data: { svgHtml: result.svgHtml }
            });
          }
        });

        // 返回空数组表示不需要重新加载模块，我们自己处理更新
        return [];
      }

      // 其他文件变化，正常处理
      return undefined;
    },

    resolveId(id: string) {
      if (id === 'virtual:svg-icons') {
        return '\0virtual:svg-icons';
      }
      if (id === 'virtual:svg-register') {
        return '\0virtual:svg-register';
      }
    },

    async load(id: string) {
      // 如果还没有初始化，立即初始化（开发环境可能会在 configResolved 之前调用 load）
      if (!isInitialized) {
        await initializeSvg();
      }

      if (id === '\0virtual:svg-icons') {
        return svgCode || '';
      }
      if (id === '\0virtual:svg-register') {
        // 返回执行 loadSvg() 的代码，确保在应用启动时 SVG sprite 就被加载
        return svgCode || '';
      }
    },

    transformIndexHtml(html: string) {
      // 直接注入 SVG sprite 代码到 HTML，避免虚拟模块的 CORS 问题
      // 在构建和开发模式下都确保 SVG sprite 被注入
      if (svgCode) {
        // 检查是否已经注入（避免重复注入）
        // 使用更严格的检查，避免误判
        if (html.includes('btc-svg-sprite') || html.includes('loadSvg')) {
          return html;
        }

        // 使用 Vite 的标准方式注入脚本
        // 在 </head> 之前插入脚本，确保尽早执行（在 DOM 加载前）
        // 这样可以确保 SVG sprite 在主应用的组件渲染前就已经加载
        const scriptTag = `<script>${svgCode}</script>`;

        // 优先在 </head> 之前插入（更早执行）
        if (html.includes('</head>')) {
          return html.replace('</head>', `${scriptTag}\n</head>`);
        }
        // 如果没有 </head>，在 </body> 之前插入
        else if (html.includes('</body>')) {
          return html.replace('</body>', `${scriptTag}\n</body>`);
        }
        // 如果都没有，在 </html> 之前插入
        else if (html.includes('</html>')) {
          return html.replace('</html>', `${scriptTag}\n</html>`);
        }
        // 如果都没有，直接追加
        else {
          return html + scriptTag;
        }
      }
      return html;
    },
  } as unknown as Plugin;
}
