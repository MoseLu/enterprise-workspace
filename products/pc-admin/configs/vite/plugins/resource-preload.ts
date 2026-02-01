/**
 * 资源预加载插件
 * 为关键资源（index.js、eps-service.js、CSS）添加 preload/modulepreload 链接
 */

import type { Plugin } from 'vite';
import type { OutputOptions, OutputBundle } from 'rollup';

export function resourcePreloadPlugin(): Plugin {
  const criticalResources: Array<{ href: string; as?: string; rel: string }> = [];

  return {
    name: 'resource-preload',
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      const getResourceHref = (chunkName: string): string => {
        if (chunkName.startsWith('assets/')) {
          return `/${chunkName}`;
        } else {
          return `/assets/${chunkName}`;
        }
      };

      // 只预加载最关键的资源，避免阻塞 HTML 解析
      // 1. 入口文件（必须预加载）
      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      if (indexChunk) {
        criticalResources.push({
          href: getResourceHref(indexChunk),
          rel: 'modulepreload',
        });
      }

      // 2. EPS 服务（关键依赖，但可以延迟加载）
      // 注意：EPS 服务不是阻塞性的，可以延迟加载，所以不预加载
      // 如果 EPS 服务很大，预加载可能会阻塞其他资源
      // const epsServiceChunk = jsChunks.find(jsChunk => jsChunk.includes('eps-service-'));
      // if (epsServiceChunk) {
      //   criticalResources.push({
      //     href: getResourceHref(epsServiceChunk),
      //     rel: 'modulepreload',
      //   });
      // }

      // 3. CSS 文件（必须预加载，但只预加载第一个，避免阻塞）
      // 只预加载第一个 CSS 文件，其他 CSS 文件可以延迟加载
      const firstCssChunk = cssChunks[0];
      if (firstCssChunk) {
        criticalResources.push({
          href: getResourceHref(firstCssChunk),
          rel: 'preload',
          as: 'style',
        });
      }
    },
    transformIndexHtml(html) {
      if (criticalResources.length === 0) {
        return html;
      }

      const preloadLinks = criticalResources
        .map(resource => {
          if (resource.rel === 'modulepreload') {
            return `    <link rel="modulepreload" href="${resource.href}" />`;
          } else {
            return `    <link rel="preload" href="${resource.href}" as="${resource.as || 'script'}" />`;
          }
        })
        .join('\n');

      if (html.includes('</head>')) {
        return html.replace('</head>', `${preloadLinks}\n</head>`);
      }

      return html;
    },
  } as Plugin;
}

