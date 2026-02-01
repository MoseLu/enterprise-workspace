// 注意：在 VitePress 配置文件中，不能直接导入 @btc/shared-core
// 因为 VitePress 在加载配置时使用 esbuild，无法正确解析 workspace 包
// 使用 console 替代 logger，或者使用条件导入
// import { logger } from '@btc/shared-core';
import { defineConfig } from 'vitepress';
import { exportSearchIndexPlugin } from './plugins/exportSearchIndex';
import { fileURLToPath, URL } from 'node:url';
import { generateNav } from './utils/auto-nav';
import { generateSidebar } from './utils/auto-sidebar';
import { getViteAppConfig } from '../../../configs/vite-app-config';
import { localesStaticPlugin } from '../../../configs/vite/plugins';

// 简单的 logger 替代，避免在配置文件中导入 @btc/shared-core
const logger = {
  error: (...args: any[]) => console.error('[VitePress Config]', ...args),
  warn: (...args: any[]) => console.warn('[VitePress Config]', ...args),
  info: (...args: any[]) => console.info('[VitePress Config]', ...args),
  debug: (...args: any[]) => console.debug('[VitePress Config]', ...args),
};

export default defineConfig({
  // 共享属性和其他顶层内容
  base: '/',
  lastUpdated: true,

  // 路由配置
  cleanUrls: true, // 生成干净的 URL，不包含 .html 后缀

  // 确保路由状态保持
  ignoreDeadLinks: true, // 忽略死链接，避免路由错误

  // 外观设置 - 启用主题切换，允许文档应用独立控制主题
  appearance: true,

  // 添加超早期脚本，在首屏前执行主题设置（可选：如果是在iframe中，可以同步主应用主题）
  head: [
    // 显式设置 favicon，使用绝对路径避免受 iframe base URL 影响
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['script', {},
`(function(){
  try {
    // 特殊情况：在 VitePress 配置的内联脚本中，无法等待模块加载，必须直接使用 localStorage
    // 注意：正常情况下应使用 @btc/shared-core/utils/storage/local 中的 storage 工具
    // 如果是在iframe中，尝试从主应用同步主题（可选）
    // 如果不在iframe中，让VitePress自己处理主题
    if (window.parent !== window) {
      var parentTheme = localStorage.getItem('parent-theme');
      var vueuseTheme = localStorage.getItem('vueuse-color-scheme');
      var isDark = false;

      if (parentTheme) {
        isDark = parentTheme === 'dark';
      } else if (vueuseTheme) {
        isDark = vueuseTheme === 'auto';
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.setProperty('color-scheme', 'dark');
      }
    }
    // 如果不在iframe中，让VitePress的appearance配置自己处理主题
  } catch(e) {
    logger.error('[Early Script] Error:', e);
  }
})();`
    ]
  ],

  // 多语言配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: '拜里斯文档库',
      description: 'BTC 车间管理系统开发文档库',
      themeConfig: {
        logo: '/logo.png',
        siteTitle: '拜里斯文档库',
        // 自动生成导航栏（根据文件夹）
        nav: generateNav('zh'),
        // 自动生成侧边栏（根据 frontmatter）
        sidebar: generateSidebar('zh'),

        // 本地搜索
        search: {
          provider: 'local',
          options: {
            locales: {
              'zh-CN': {
                translations: {
                  button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
                  modal: {
                    noResultsText: '无法找到相关结果',
                    resetButtonTitle: '清除查询条件',
                    footer: {
                      selectText: '选择',
                      navigateText: '切换',
                      closeText: '关闭'
                    }
                  }
                }
              }
            }
          }
        },

        // 编辑链接
        editLink: {
          pattern: 'https://github.com/BellisGit/btc-shopflow-monorepo/edit/develop/apps/docs-app/:path',
          text: '在 GitHub 上编辑此页'
        },

        // 大纲配置
        outline: {
          level: [2, 3],
          label: '页面导航'
        },

        // 最后更新文本
        lastUpdated: {
          text: '最后更新',
          formatOptions: {
            dateStyle: 'short',
            timeStyle: 'short'
          }
        },

        // 分页导航文本
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },

        // 社交媒体链接（可选）
        socialLinks: [
          // 返回系统应用的logo图标
          {
            icon: {
              svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="btc-logo-icon"><title>返回系统应用</title></svg>'
            },
            link: 'https://bellis.com.cn',
            ariaLabel: '返回系统应用'
          }
        ],

        // 返回顶部按钮配置
        returnToTopLabel: '返回顶部'
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Bellis Documentation',
      description: 'BTC Shopflow Management System Documentation',
      themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Bellis Documentation',
        nav: generateNav('en'),
        sidebar: generateSidebar('en'),
        search: {
          provider: 'local',
          options: {
            locales: {
              'en-US': {
                translations: {
                  button: { buttonText: 'Search', buttonAriaLabel: 'Search' },
                  modal: {
                    noResultsText: 'No results found',
                    resetButtonTitle: 'Reset search',
                    footer: {
                      selectText: 'to select',
                      navigateText: 'to navigate',
                      closeText: 'to close'
                    }
                  }
                }
              }
            }
          }
        },
        editLink: {
          pattern: 'https://github.com/BellisGit/btc-shopflow-monorepo/edit/develop/apps/docs-app/:path',
          text: 'Edit this page on GitHub'
        },
        outline: {
          level: [2, 3],
          label: 'On this page'
        },
        lastUpdated: {
          text: 'Last updated',
          formatOptions: {
            dateStyle: 'short',
            timeStyle: 'short'
          }
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        },
        returnToTopLabel: 'Back to top'
      },
    },
  },

  // Markdown 配置（可以在 locales 中覆盖）
  markdown: {
    lineNumbers: true,

    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  },

  // Vite 配置
  vite: {
    plugins: [
      exportSearchIndexPlugin(), // 导出搜索索引给主应用
      localesStaticPlugin(fileURLToPath(new URL('../', import.meta.url))), // 提供 locales 文件
    ],

    // 确保 public 目录被正确处理
    publicDir: 'public',

    resolve: {
      alias: {
        '@btc/shared-components': fileURLToPath(new URL('../../../packages/shared-components/src', import.meta.url)),
        '@btc/shared-core': fileURLToPath(new URL('../../../packages/shared-core/src', import.meta.url)),
        '@btc/shared-utils': fileURLToPath(new URL('../../../packages/shared-utils/src', import.meta.url)),
        '@btc/auth-shared': fileURLToPath(new URL('../../../auth/shared', import.meta.url)),
        '@btc-components': fileURLToPath(new URL('../../../packages/shared-components/src/components', import.meta.url)),
        '@btc-common': fileURLToPath(new URL('../../../packages/shared-components/src/common', import.meta.url)),
        '@btc-crud': fileURLToPath(new URL('../../../packages/shared-components/src/crud', import.meta.url)),
        '@btc-styles': fileURLToPath(new URL('../../../packages/shared-components/src/styles', import.meta.url)),
        '@btc-locales': fileURLToPath(new URL('../../../packages/shared-components/src/locales', import.meta.url)),
        '@btc-assets': fileURLToPath(new URL('../../../packages/shared-components/src/assets', import.meta.url)),
        '@assets': fileURLToPath(new URL('../../../packages/shared-components/src/assets', import.meta.url)),
        '@plugins': fileURLToPath(new URL('../../../packages/shared-components/src/plugins', import.meta.url)),
        '@btc/shared-core/utils': fileURLToPath(new URL('../../../packages/shared-core/src/utils', import.meta.url)),
        '@configs': fileURLToPath(new URL('../../../packages/shared-core/src/configs', import.meta.url)),
        '@btc/subapp-manifests': fileURLToPath(new URL('../../../packages/shared-core/src/manifest', import.meta.url)),
      }
    },

    // CSS 配置 - 解决 Sass 弃用警告
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 使用现代编译器 API
          silenceDeprecations: ['legacy-js-api'] // 抑制弃用警告
        }
      }
    },

    // SSR 配置
    ssr: {
      noExternal: ['element-plus', '@btc/shared-components', '@btc/shared-core', 'vue', 'file-saver'],
      // pino 和 pino-pretty 使用外部版本，避免 worker.js 构建问题
      external: ['pino', 'pino-pretty', 'thread-stream']
    },

    // 定义全局变量（用于 SSR 构建）
    define: {
      __dirname: JSON.stringify(fileURLToPath(new URL('.', import.meta.url))),
      __filename: JSON.stringify(fileURLToPath(new URL(import.meta.url))),
    },

    // 构建配置
    build: {
      chunkSizeWarningLimit: 1000, // 文档站点允许更大的 chunk
      rollupOptions: {
        external: ['pino', 'pino-pretty', 'thread-stream'], // 在构建时排除 pino 相关包
        output: {
          // 确保 worker 文件被正确处理
          inlineDynamicImports: false,
        }
      }
    },

    // 服务器配置
    server: {
      port: getViteAppConfig('docs-app').devPort,
      host: '0.0.0.0',
      strictPort: true, // 端口被占用时报错而不是自动换端口
      cors: true, // 允许跨域（iframe 嵌入需要）
      hmr: {
        port: getViteAppConfig('docs-app').devPort + 1, // 使用不同的端口避免冲突
        host: 'localhost', // 改为 localhost，避免 0.0.0.0 的问题
      },
    },

    // 预览服务器配置
    preview: {
      port: getViteAppConfig('docs-app').prePort,
      host: '0.0.0.0',
      strictPort: true, // 端口被占用时报错而不是自动换端口
    },
  }
});
