/**
 * Qiankun Template 处理 Composable
 * 用于处理 HTML 模板，修复资源路径并确保 script 标签为 module 类型
 */

import { getAppBySubdomain, getAppByPathPrefix } from '@btc/shared-core/configs/app-scanner';
;

/**
 * 清理旧 chunk 引用
 */
function cleanOldChunkReferences(processedTpl: string): string {
  const OLD_REF_PATTERN = /B2xaJ9jT|CQjIfk82|Ct0QBumG|B9_7Pxt3|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT|Bob15k_M|DXiZfgDR|CK3kLuZf|B6Y4X6Zv|vga9bYFB|C5YyqyGj|5K5tXpWB|element-plus-CQjIfk82|vue-core-Ct0QBumG|vendor-B2xaJ9jT|vue-router-B9_7Pxt3|app-src-C3806ap7|app-src-COBg3Fmo|app-src-vga9bYFB|index-D-vcpc3r|index-C-4vWSys|index-u6iSJWLT|index-C5YyqyGj|index-5K5tXpWB/g;

  if (OLD_REF_PATTERN.test(processedTpl)) {
    OLD_REF_PATTERN.lastIndex = 0;
    const oldRefMatches = processedTpl.match(OLD_REF_PATTERN);
    if (oldRefMatches && oldRefMatches.length > 0) {
      console.warn(`[getTemplate] 检测到 ${oldRefMatches.length} 个旧 chunk 引用，将强制删除:`, oldRefMatches.slice(0, 5).join(', '));

      const oldHashList = OLD_REF_PATTERN.source.replace(/^\/|\/[gimuy]*$/g, '').split('|');
      const oldScriptPattern = new RegExp(`<script[^>]*src=["'][^"']*(${oldHashList.join('|')})[^"']*["'][^>]*>`, 'gi');
      processedTpl = processedTpl.replace(oldScriptPattern, '');

      const oldLinkPattern = new RegExp(`<link[^>]*(?:href|src)=["'][^"']*(${oldHashList.join('|')})[^"']*["'][^>]*>`, 'gi');
      processedTpl = processedTpl.replace(oldLinkPattern, '');

      const oldImportPattern = new RegExp(`import\\s*\\(\\s*["'][^"']*(${oldHashList.join('|')})[^"']*["']\\s*\\)`, 'gi');
      processedTpl = processedTpl.replace(oldImportPattern, 'Promise.resolve()');

      const inlineScriptPattern = new RegExp(`(<script[^>]*>)([\\s\\S]*?)(import\\s*\\(\\s*["'][^"']*(${oldHashList.join('|')})[^"']*["']\\s*\\)[\\s\\S]*?)(</script>)`, 'gi');
      processedTpl = processedTpl.replace(inlineScriptPattern, (_match, openTag, before, importStmt) => {
        const cleanedImport = importStmt.replace(new RegExp(`import\\s*\\(\\s*["'][^"']*(${oldHashList.join('|')})[^"']*["']\\s*\\)`, 'gi'), 'Promise.resolve()');
        return openTag + before + cleanedImport;
      });

      console.info(`[getTemplate] ✅ 已清理所有旧 chunk 引用`);
    }
  }
  return processedTpl;
}

/**
 * 修复 script src 路径
 */
function fixScriptSrc(
  src: string,
  baseUrl: string,
  targetHost: string,
  targetPort: string,
  currentHost: string,
  currentPort: string
): string {
  // 如果 src 已经是完整 URL 且匹配目标 hostname 和端口，直接返回
  if ((src.includes(`://${targetHost}:${targetPort}/`) || src.includes(`//${targetHost}:${targetPort}/`)) ||
      (targetPort && (src.includes(`://${targetHost}/`) || src.includes(`//${targetHost}/`))) ||
      (src.includes(`://localhost:${targetPort}/`) || src.includes(`//localhost:${targetPort}/`))) {
    return src;
  }

  let fixedSrc = src;

  // 如果 src 包含 localhost，但当前页面是通过 IP 访问的，需要替换 hostname
  if (src.includes('localhost') && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    fixedSrc = src.replace(/localhost/g, currentHost);
  }

  // 情况1：相对路径（以 / 开头）
  if (fixedSrc.startsWith('/')) {
    fixedSrc = `${baseUrl.replace(/localhost/g, targetHost)}${fixedSrc}`;
  }
  // 情况2：相对路径（不以 / 开头）
  else if (!fixedSrc.includes('://') && !fixedSrc.startsWith('//') && !fixedSrc.startsWith('data:') && !fixedSrc.startsWith('blob:')) {
    const normalizedSrc = fixedSrc.startsWith('/') ? fixedSrc : `/${fixedSrc}`;
    fixedSrc = `${baseUrl.replace(/localhost/g, targetHost)}${normalizedSrc}`;
  }
  // 情况3：包含错误的端口
  else if (currentPort && currentPort !== targetPort && (
    fixedSrc.includes(`:${currentPort}`) ||
    fixedSrc.includes(`://${currentHost}:${currentPort}`) ||
    fixedSrc.includes(`//${currentHost}:${currentPort}`) ||
    fixedSrc.includes(`://localhost:${currentPort}`) ||
    fixedSrc.includes(`//localhost:${currentPort}`)
  )) {
    fixedSrc = fixedSrc.replace(new RegExp(`:${currentPort}(?=/|$|"|'|\\s)`, 'g'), targetPort ? `:${targetPort}` : '');
    fixedSrc = fixedSrc.replace(/localhost/g, targetHost);
    if (currentHost !== targetHost) {
      fixedSrc = fixedSrc.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
    }
  }
  // 情况4：协议相对路径（//host/）
  else if (fixedSrc.startsWith('//') && !fixedSrc.includes(':')) {
    const hostMatch = fixedSrc.match(/^\/\/([^/]+)(.*)$/);
    if (hostMatch) {
      const urlHost = hostMatch[1];
      const urlPath = hostMatch[2];
      if (urlHost === currentHost || urlHost === 'localhost' || urlHost === targetHost) {
        fixedSrc = targetPort ? `//${targetHost}:${targetPort}${urlPath}` : `//${targetHost}${urlPath}`;
      }
    }
  }
  // 情况5：完整 URL 但包含 localhost
  else if ((fixedSrc.startsWith('http://localhost') || fixedSrc.startsWith('https://localhost')) && targetHost !== 'localhost') {
    fixedSrc = fixedSrc.replace(/localhost/g, targetHost);
  }
  // 情况6：包含错误的 hostname
  else if (currentHost !== targetHost && fixedSrc.includes(`://${currentHost}`)) {
    fixedSrc = fixedSrc.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
  }

  return fixedSrc;
}

/**
 * 修复 link href 路径
 */
function fixLinkHref(
  href: string,
  baseUrl: string,
  targetHost: string,
  targetPort: string,
  currentHost: string,
  currentPort: string
): string {
  // 如果 href 已经是完整 URL 且匹配目标 hostname 和端口，直接返回
  if ((href.includes(`://${targetHost}:${targetPort}/`) || href.includes(`//${targetHost}:${targetPort}/`)) ||
      (targetPort && (href.includes(`://${targetHost}/`) || href.includes(`//${targetHost}/`))) ||
      (href.includes(`://localhost:${targetPort}/`) || href.includes(`//localhost:${targetPort}/`))) {
    return href;
  }

  let fixedHref = href;

  // 如果 href 包含 localhost，但当前页面是通过 IP 访问的，需要替换 hostname
  if (href.includes('localhost') && targetHost !== 'localhost' && targetHost !== '127.0.0.1') {
    fixedHref = href.replace(/localhost/g, targetHost);
  }

  // 情况1：相对路径（以 / 开头）
  if (fixedHref.startsWith('/')) {
    fixedHref = `${baseUrl.replace(/localhost/g, targetHost)}${fixedHref}`;
  }
  // 情况2：相对路径（不以 / 开头）
  else if (!fixedHref.includes('://') && !fixedHref.startsWith('//') && !fixedHref.startsWith('data:') && !fixedHref.startsWith('blob:')) {
    const normalizedHref = fixedHref.startsWith('/') ? fixedHref : `/${fixedHref}`;
    fixedHref = `${baseUrl.replace(/localhost/g, targetHost)}${normalizedHref}`;
  }
  // 情况3：包含错误的端口
  else if (currentPort && currentPort !== targetPort && (
    fixedHref.includes(`:${currentPort}`) ||
    fixedHref.includes(`://${currentHost}:${currentPort}`) ||
    fixedHref.includes(`//${currentHost}:${currentPort}`) ||
    fixedHref.includes(`://localhost:${currentPort}`) ||
    fixedHref.includes(`//localhost:${currentPort}`)
  )) {
    fixedHref = fixedHref.replace(new RegExp(`:${currentPort}(?=/|$|"|'|\\s)`, 'g'), targetPort ? `:${targetPort}` : '');
    fixedHref = fixedHref.replace(/localhost/g, targetHost);
    if (currentHost !== targetHost) {
      fixedHref = fixedHref.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
    }
  }
  // 情况4：协议相对路径（//host/）
  else if (fixedHref.startsWith('//') && !fixedHref.includes(':')) {
    const hostMatch = fixedHref.match(/^\/\/([^/]+)(.*)$/);
    if (hostMatch) {
      const urlHost = hostMatch[1];
      const urlPath = hostMatch[2];
      if (urlHost === currentHost || urlHost === 'localhost' || urlHost === targetHost) {
        fixedHref = targetPort ? `//${targetHost}:${targetPort}${urlPath}` : `//${targetHost}${urlPath}`;
      }
    }
  }
  // 情况5：完整 URL 但包含 localhost
  else if ((fixedHref.startsWith('http://localhost') || fixedHref.startsWith('https://localhost')) && targetHost !== 'localhost') {
    fixedHref = fixedHref.replace(/localhost/g, targetHost);
  }
  // 情况6：包含错误的 hostname
  else if (currentHost !== targetHost && fixedHref.includes(`://${currentHost}`)) {
    fixedHref = fixedHref.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
  }

  return fixedHref;
}

/**
 * 获取 baseUrl 和 matchedAppName
 */
function getBaseUrlAndAppName(
  entry: string | undefined,
  entryMap: Map<string, string>
): { baseUrl: string; matchedAppName: string | null } {
  let baseUrl = '';
  let _matchedAppName: string | null = null;
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;

  // 首先尝试从 entry 参数获取
  if (entry) {
    let entryUrl: URL | null = null;
    try {
      if (entry.startsWith('http://') || entry.startsWith('https://')) {
        entryUrl = new URL(entry);
      } else if (entry.startsWith('//')) {
        entryUrl = new URL(`${protocol}${entry}`);
      } else if (entry.startsWith('/')) {
        entryUrl = new URL(entry, window.location.origin);
      }
    } catch (e) {
      console.warn('[getTemplate] 解析 entry URL 失败:', entry, e);
    }

    if (entryUrl) {
      const port = entryUrl.port || '';
      let finalHost = entryUrl.hostname;

      if (entry.startsWith('/')) {
        finalHost = currentHost;
      } else if (entry.startsWith('http://') || entry.startsWith('https://')) {
        finalHost = entryUrl.hostname;
      } else if (entry.startsWith('//')) {
        finalHost = entryUrl.hostname;
      }

      baseUrl = `${entryUrl.protocol}//${finalHost}${port ? `:${port}` : ''}`;

      for (const [appName, appEntry] of entryMap.entries()) {
        if (appEntry === entry) {
          _matchedAppName = appName;
          break;
        }
      }
    }
  }

  // 如果没有从 entry 参数获取到，尝试从当前路径或子域名判断
  if (!baseUrl) {
    const currentPath = window.location.pathname;
    const hostname = window.location.hostname;

    const appBySubdomain = getAppBySubdomain(hostname);
    if (appBySubdomain) {
      _matchedAppName = appBySubdomain.id;
    } else {
      const appByPath = getAppByPathPrefix(currentPath.split('/')[1] ? `/${currentPath.split('/')[1]}` : '/');
      if (appByPath) {
        _matchedAppName = appByPath.id;
      }
    }

    if (_matchedAppName) {
      const appEntry = entryMap.get(_matchedAppName);
      if (appEntry) {
        let entryUrl: URL | null = null;
        try {
          if (appEntry.startsWith('http://') || appEntry.startsWith('https://')) {
            entryUrl = new URL(appEntry);
          } else if (appEntry.startsWith('//')) {
            entryUrl = new URL(`${protocol}${appEntry}`);
          } else if (appEntry.startsWith('/')) {
            entryUrl = new URL(appEntry, window.location.origin);
          }
        } catch (e) {
          console.warn('[getTemplate] 解析 appEntry URL 失败:', appEntry, e);
        }

        if (entryUrl) {
          const port = entryUrl.port || '';
          let finalHost = entryUrl.hostname;

          if (appEntry.startsWith('/')) {
            const appBySubdomain = getAppBySubdomain(hostname);
            if (appBySubdomain && appBySubdomain.id === _matchedAppName) {
              finalHost = hostname;
            } else {
              finalHost = currentHost;
            }
          } else if (entryUrl.hostname !== currentHost) {
            finalHost = entryUrl.hostname;
          }

          baseUrl = `${protocol}//${finalHost}${port ? `:${port}` : ''}`;
        }
      }
    }
  }

  return { baseUrl, matchedAppName: _matchedAppName };
}

/**
 * 创建简单的 getTemplate 处理器（用于应用配置）
 */
export function createSimpleGetTemplate(entryUrl: string): (tpl: string) => string {
  return (tpl: string) => {
    let processedTpl = tpl;

    if (entryUrl && !entryUrl.startsWith('/')) {
      const entryMatch = entryUrl.match(/^(\/\/)([^:]+)(:(\d+))?/);
      if (entryMatch) {
        const protocol = window.location.protocol;
        const currentHost = window.location.hostname;
        const port = entryMatch[4] || '';
        const baseUrl = `${protocol}//${currentHost}${port ? `:${port}` : ''}`;

        // 修复 script src
        processedTpl = processedTpl.replace(
          /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
          (match, before, src, after) => {
            if ((src.includes(`://${currentHost}:${port}/`) || src.includes(`//${currentHost}:${port}/`)) ||
                (src.includes(`://localhost:${port}/`) || src.includes(`//localhost:${port}/`))) {
              return match;
            }

            if (src.startsWith('/')) {
              return `<script${before} src="${baseUrl}${src}"${after}>`;
            }
            if (!src.includes('://') && !src.startsWith('//') && !src.startsWith('data:') && !src.startsWith('blob:')) {
              const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
              return `<script${before} src="${baseUrl}${normalizedSrc}"${after}>`;
            }
            const currentPort = window.location.port;
            const isWrongPort = (src.includes(`://${currentHost}:${currentPort}/`) ||
                                 src.includes(`//${currentHost}:${currentPort}/`) ||
                                 src.includes(`://localhost:${currentPort}/`) ||
                                 src.includes(`//localhost:${currentPort}/`));
            if (isWrongPort && currentPort !== port) {
              let fixedUrl = src.replace(new RegExp(`://${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
              fixedUrl = fixedUrl.replace(new RegExp(`//${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
              fixedUrl = fixedUrl.replace(new RegExp(`://localhost:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
              fixedUrl = fixedUrl.replace(new RegExp(`//localhost:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
              return `<script${before} src="${fixedUrl}"${after}>`;
            }
            if ((src.startsWith(`//${currentHost}/`) || src.startsWith(`//localhost/`)) && !src.includes(':')) {
              const fixedUrl = port ? src.replace(/^\/\/[^/]+\//, `//${currentHost}:${port}/`) : src.replace(/^\/\/[^/]+\//, `//${currentHost}/`);
              return `<script${before} src="${fixedUrl}"${after}>`;
            }
            return match;
          }
        );

        // 修复 link href
        processedTpl = processedTpl.replace(
          /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
          (match, before, href, after) => {
            if ((href.includes(`://${currentHost}:${port}/`) || href.includes(`//${currentHost}:${port}/`)) ||
                (href.includes(`://localhost:${port}/`) || href.includes(`//localhost:${port}/`))) {
              return match;
            }

            if (href.startsWith('/')) {
              return `<link${before} href="${baseUrl}${href}"${after}>`;
            }
            const currentPort = window.location.port;
            const isWrongPort = (href.includes(`://${currentHost}:${currentPort}/`) ||
                                 href.includes(`//${currentHost}:${currentPort}/`) ||
                                 href.includes(`://localhost:${currentPort}/`) ||
                                 href.includes(`//localhost:${currentPort}/`));
            if (isWrongPort && currentPort !== port) {
              let fixedUrl = href.replace(new RegExp(`://${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
              fixedUrl = fixedUrl.replace(new RegExp(`//${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
              fixedUrl = fixedUrl.replace(new RegExp(`://localhost:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
              fixedUrl = fixedUrl.replace(new RegExp(`//localhost:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
              return `<link${before} href="${fixedUrl}"${after}>`;
            }
            if ((href.startsWith(`//${currentHost}/`) || href.startsWith(`//localhost/`)) && !href.includes(':')) {
              const fixedUrl = port ? href.replace(/^\/\/[^/]+\//, `//${currentHost}:${port}/`) : href.replace(/^\/\/[^/]+\//, `//${currentHost}/`);
              return `<link${before} href="${fixedUrl}"${after}>`;
            }
            return match;
          }
        );

        // 添加 base 标签
        const baseHref = `${protocol}//${currentHost}${port ? `:${port}` : ''}/`;
        processedTpl = processedTpl.replace(/<base[^>]*>/gi, '');
        if (processedTpl.includes('<head')) {
          processedTpl = processedTpl.replace(/(<head[^>]*>)/i, `$1<base href="${baseHref}">`);
        } else {
          processedTpl = processedTpl.replace(/(<html[^>]*>)/i, `$1<base href="${baseHref}">`);
        }
      }
    }

    // 确保所有 script 标签都有 type="module"
    processedTpl = processedTpl.replace(
      /<script(\s+[^>]*)?>/gi,
      (match, attrs = '') => {
        if (attrs.includes('type=')) {
          return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
        }
        return `<script type="module"${attrs}>`;
      }
    );

    return processedTpl;
  };
}

/**
 * 创建复杂的 getTemplate 处理器（用于 importEntryOpts）
 */
export function createComplexGetTemplate(entryMap: Map<string, string>): (tpl: string, entry?: string) => string {
  return (tpl: string, entry?: string) => {
    let processedTpl = cleanOldChunkReferences(tpl);

    const { baseUrl } = getBaseUrlAndAppName(entry, entryMap);

    // 如果还是没有找到，尝试从 HTML 中的资源路径推断
    let finalBaseUrl = baseUrl;
    if (!finalBaseUrl) {
      const resourceMatch = tpl.match(/(?:src|href)=["']([^"']+)/);
      if (resourceMatch && resourceMatch[1]) {
        const resourceUrl = resourceMatch[1];
        if (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) {
          const url = new URL(resourceUrl);
          finalBaseUrl = `${url.protocol}//${url.host}`;
        }
      }
    }

    if (finalBaseUrl) {
      const baseUrlObj = new URL(finalBaseUrl);
      const targetPort = baseUrlObj.port;
      const targetHost = baseUrlObj.hostname;
      const currentHost = window.location.hostname;
      const currentPort = window.location.port;
      const protocol = window.location.protocol;

      // 修复 script src
      processedTpl = processedTpl.replace(
        /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
        (match, before, src, after) => {
          const fixedSrc = fixScriptSrc(src, finalBaseUrl, targetHost, targetPort, currentHost, currentPort);
          if (fixedSrc !== src) {
            return `<script${before} src="${fixedSrc}"${after}>`;
          }
          return match;
        }
      );

      // 修复 link href
      processedTpl = processedTpl.replace(
        /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
        (match, before, href, after) => {
          const fixedHref = fixLinkHref(href, finalBaseUrl, targetHost, targetPort, currentHost, currentPort);
          if (fixedHref !== href) {
            return `<link${before} href="${fixedHref}"${after}>`;
          }
          return match;
        }
      );

      // 添加 base 标签
      let baseHost = targetHost || currentHost;
      if (entry) {
        try {
          let entryUrl: URL | null = null;
          if (entry.startsWith('http://') || entry.startsWith('https://')) {
            entryUrl = new URL(entry);
          } else if (entry.startsWith('//')) {
            entryUrl = new URL(`${protocol}${entry}`);
          }

          if (entryUrl && entryUrl.hostname !== currentHost) {
            baseHost = entryUrl.hostname;
          }
        } catch (e) {
          // 忽略错误
        }
      }

      const basePath = '/';
      const baseHref = `${protocol}//${baseHost}${targetPort ? `:${targetPort}` : ''}${basePath}`;
      processedTpl = processedTpl.replace(/<base[^>]*>/gi, '');
      if (processedTpl.includes('<head')) {
        processedTpl = processedTpl.replace(/(<head[^>]*>)/i, `$1\n    <base href="${baseHref}">`);
      } else {
        processedTpl = processedTpl.replace(/(<html[^>]*>)/i, `$1\n  <base href="${baseHref}">`);
      }
    }

    // 确保所有 script 标签都有 type="module"
    processedTpl = processedTpl.replace(
      /<script(\s+[^>]*)?>/gi,
      (match, attrs = '') => attrs.includes('type=')
        ? match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"')
        : `<script type="module"${attrs}>`
    );

    return processedTpl;
  };
}

