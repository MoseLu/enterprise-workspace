// .vitepress/config.ts
import { logger } from '@btc/shared-core';
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.40.1_@types+node@24.7.0_postcss@8.5.6_sass@1.93.2_se_t2xrupr6uqi27flwt5bd7ikrjm/node_modules/vitepress/dist/node/index.js";

// .vitepress/plugins/exportSearchIndex.ts
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\apps\\docs-site\\.vitepress\\plugins";
function exportSearchIndexPlugin() {
  return {
    name: "vitepress-export-search-index",
    enforce: "post",
    // 在开发服务器配置时添加端点
    configureServer(server) {
      server.middlewares.use("/api/search-index.json", (_req, res) => {
        const devIndex = generateDevSearchIndex();
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(devIndex));
      });
    },
    // 在构建完成后生成搜索索引文件
    closeBundle() {
      try {
        const outDir = path.resolve(__vite_injected_original_dirname, "../../dist");
        if (fs.existsSync(outDir)) {
          const searchIndex = extractSearchIndexFromBuild(outDir);
          const indexPath = path.join(outDir, "search-index.json");
          fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
          logger.info("[exportSearchIndex] Search index exported to:", indexPath);
        }
      } catch (error) {
        logger.warn("[exportSearchIndex] Failed to export search index:", error);
      }
    }
  };
}
function generateDevSearchIndex() {
  return [
    {
      id: "timeline",
      title: "\u9879\u76EE\u65F6\u95F4\u7EBF",
      url: "/timeline/",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3",
      excerpt: "\u6309\u65F6\u95F4\u987A\u5E8F\u67E5\u770B\u9879\u76EE\u7684\u4E3B\u8981\u91CC\u7A0B\u7891\u548C\u53D8\u66F4\u5386\u53F2"
    },
    {
      id: "projects",
      title: "\u9879\u76EE\u7D22\u5F15",
      url: "/projects/",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3",
      excerpt: "\u6309\u9879\u76EE\u5206\u7C7B\u6D4F\u89C8\u6280\u672F\u6587\u6863"
    },
    {
      id: "types",
      title: "\u6587\u6863\u7C7B\u578B\u5206\u7C7B",
      url: "/types/",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3",
      excerpt: "\u6309\u6587\u6863\u7C7B\u578B\uFF08ADR, RFC, SOP \u7B49\uFF09\u6D4F\u89C8"
    },
    {
      id: "tags",
      title: "\u6807\u7B7E\u7D22\u5F15",
      url: "/tags/",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3",
      excerpt: "\u6309\u6807\u7B7E\u6D4F\u89C8\u76F8\u5173\u6587\u6863"
    },
    {
      id: "components",
      title: "\u7EC4\u4EF6\u6587\u6863",
      url: "/components/",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3",
      excerpt: "BTC \u4E1A\u52A1\u7EC4\u4EF6\u4F7F\u7528\u6587\u6863\u548C\u6700\u4F73\u5B9E\u8DF5"
    },
    {
      id: "components-crud",
      title: "BtcCrud \u7EC4\u4EF6",
      url: "/components/crud",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3 > \u7EC4\u4EF6",
      excerpt: "CRUD \u64CD\u4F5C\u7684\u6838\u5FC3\u7EC4\u4EF6\uFF0C\u63D0\u4F9B\u589E\u5220\u6539\u67E5\u3001\u5206\u9875\u3001\u641C\u7D22\u7B49\u529F\u80FD"
    },
    {
      id: "components-form",
      title: "BtcForm \u7EC4\u4EF6",
      url: "/components/form",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3 > \u7EC4\u4EF6",
      excerpt: "\u8868\u5355\u7EC4\u4EF6\uFF0C\u652F\u6301\u52A8\u6001\u8868\u5355\u3001\u9A8C\u8BC1\u3001tabs\u3001\u63D2\u4EF6\u7B49\u529F\u80FD"
    },
    {
      id: "components-upsert",
      title: "BtcUpsert \u7EC4\u4EF6",
      url: "/components/upsert",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3 > \u7EC4\u4EF6",
      excerpt: "\u65B0\u589E\u548C\u7F16\u8F91\u7684\u5F39\u7A97\u7EC4\u4EF6\uFF0C\u57FA\u4E8E BtcDialog \u548C BtcForm"
    },
    {
      id: "components-table",
      title: "BtcTable \u7EC4\u4EF6",
      url: "/components/table",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3 > \u7EC4\u4EF6",
      excerpt: "\u8868\u683C\u7EC4\u4EF6\uFF0C\u652F\u6301\u6392\u5E8F\u3001\u56FA\u5B9A\u5217\u3001\u81EA\u5B9A\u4E49\u5217\u3001\u64CD\u4F5C\u5217\u7B49"
    },
    {
      id: "components-dialog",
      title: "BtcDialog \u7EC4\u4EF6",
      url: "/components/dialog",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3 > \u7EC4\u4EF6",
      excerpt: "\u5F39\u7A97\u7EC4\u4EF6\uFF0C\u652F\u6301\u5168\u5C4F\u3001\u62D6\u62FD\u3001\u81EA\u5B9A\u4E49\u5C3A\u5BF8\u7B49\u529F\u80FD"
    },
    {
      id: "components-view-group",
      title: "BtcViewGroup \u7EC4\u4EF6",
      url: "/components/view-group",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3 > \u7EC4\u4EF6",
      excerpt: "\u5DE6\u6811\u53F3\u8868\u5E03\u5C40\u7EC4\u4EF6\uFF0C\u652F\u6301\u6811\u5F62\u83DC\u5355\u3001\u5217\u8868\u5207\u6362\u3001\u62D6\u62FD\u6392\u5E8F\u7B49"
    },
    {
      id: "api",
      title: "API \u6587\u6863",
      url: "/api/",
      breadcrumb: "\u6587\u6863\u4E2D\u5FC3",
      excerpt: "\u7CFB\u7EDF API \u63A5\u53E3\u6587\u6863"
    }
  ];
}
function extractSearchIndexFromBuild(outDir) {
  return generateDevSearchIndex();
}

// .vitepress/config.ts
import { fileURLToPath as fileURLToPath3, URL } from "node:url";

// .vitepress/utils/auto-nav.ts
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/docs-site/.vitepress/utils/auto-nav.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname2 = path2.dirname(__filename);
var docsRoot = path2.resolve(__dirname2, "../../");
var folderToNav = {
  "guides": "\u6307\u5357",
  "adr": "ADR",
  "sop": "SOP",
  "packages": "\u5305",
  "components": "\u7EC4\u4EF6",
  "api": "API",
  "timeline": "\u65F6\u95F4\u7EBF",
  "projects": "\u9879\u76EE",
  "types": "\u7C7B\u578B",
  "tags": "\u6807\u7B7E"
};
var navOrder = [
  "guides",
  "adr",
  "sop",
  "packages",
  "components"
];
function findFirstMarkdown(dir) {
  try {
    const indexPath = path2.join(dir, "index.md");
    if (fs2.existsSync(indexPath)) {
      return "/index";
    }
    const entries = fs2.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path2.join(dir, entry.name);
        const indexPath2 = path2.join(subDir, "index.md");
        if (fs2.existsSync(indexPath2)) {
          return `/${entry.name}/index`;
        }
        const subEntries = fs2.readdirSync(subDir);
        const firstMd = subEntries.find((f) => f.endsWith(".md"));
        if (firstMd) {
          return `/${entry.name}/${firstMd.replace(".md", "")}`;
        }
      } else if (entry.name.endsWith(".md") && entry.name !== "index.md") {
        return `/${entry.name.replace(".md", "")}`;
      }
    }
  } catch (error) {
    logger.warn(`Failed to find markdown in ${dir}:`, error);
  }
  return null;
}
function generateNav() {
  const nav = [
    { text: "\u9996\u9875", link: "/", activeMatch: "^/$" }
  ];
  for (const folder of navOrder) {
    const folderPath = path2.join(docsRoot, folder);
    if (!fs2.existsSync(folderPath)) {
      continue;
    }
    const firstMd = findFirstMarkdown(folderPath);
    if (!firstMd) {
      continue;
    }
    const text = folderToNav[folder] || folder;
    const link = `/${folder}${firstMd}`;
    nav.push({
      text,
      link,
      activeMatch: `^/${folder}/`
    });
  }
  return nav;
}

// .vitepress/utils/auto-sidebar.ts
import fs3 from "fs";
import path3 from "path";
import matter from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js";
import { fileURLToPath as fileURLToPath2 } from "url";
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/docs-site/.vitepress/utils/auto-sidebar.ts";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname3 = path3.dirname(__filename2);
var docsRoot2 = path3.resolve(__dirname3, "../../");
function getGroupDisplayName(groupName) {
  const groupNameMap = {
    "guides": "\u5F00\u53D1\u6307\u5357",
    "components": "\u7EC4\u4EF6\u5F00\u53D1",
    "forms": "\u8868\u5355\u5904\u7406",
    "system": "\u7CFB\u7EDF\u914D\u7F6E",
    "integration": "\u96C6\u6210\u90E8\u7F72",
    "adr": "\u67B6\u6784\u51B3\u7B56",
    "rfc": "\u6280\u672F\u63D0\u6848",
    "sop": "\u6807\u51C6\u64CD\u4F5C",
    "packages": "\u5171\u4EAB\u5305",
    "layout": "\u5E03\u5C40\u7EC4\u4EF6",
    "overview": "\u9879\u76EE\u6982\u89C8",
    "changelog": "\u5F00\u53D1\u65E5\u5FD7",
    "guides-backend": "\u540E\u7AEF\u670D\u52A1",
    // Packages 子分组
    "packages-components": "\u7EC4\u4EF6\u5305",
    "packages-plugins": "\u63D2\u4EF6\u5305",
    "packages-utils": "\u5DE5\u5177\u5305",
    // ADR 子分组
    "adr-system": "\u7CFB\u7EDF\u67B6\u6784",
    "adr-technical": "\u6280\u672F\u5B9E\u73B0",
    "adr-project": "\u9879\u76EE\u7BA1\u7406",
    // SOP 子分组
    "sop-development": "\u5F00\u53D1\u73AF\u5883",
    "sop-components": "\u7EC4\u4EF6\u5F00\u53D1",
    "sop-system": "\u7CFB\u7EDF\u914D\u7F6E",
    // Templates 子分组
    "templates": "\u6587\u6863\u6A21\u677F"
  };
  return groupNameMap[groupName] || groupName;
}
function scanMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = fs3.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path3.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("_")) {
        files.push(...scanMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    logger.warn(`Failed to scan directory ${dir}:`, error);
  }
  return files;
}
function parseFrontmatter(filePath) {
  try {
    const content = fs3.readFileSync(filePath, "utf-8");
    const { data } = matter(content);
    const relativePath = path3.relative(docsRoot2, filePath).replace(/\\/g, "/").replace(/\.md$/, "");
    const fileName = path3.basename(filePath, ".md");
    const displayPath = relativePath.replace(/^(integration|backend|development)\//, "");
    return {
      data,
      relativePath,
      fileName,
      displayPath
    };
  } catch (error) {
    logger.warn(`Failed to parse frontmatter for ${filePath}:`, error);
    return null;
  }
}
function generateSidebar() {
  const sidebar = {};
  const mainFolders = [
    "guides",
    "adr",
    "rfc",
    "sop",
    "packages",
    "components"
  ];
  for (const folder of mainFolders) {
    const folderPath = path3.join(docsRoot2, folder);
    if (!fs3.existsSync(folderPath)) {
      continue;
    }
    const markdownFiles = scanMarkdownFiles(folderPath);
    if (markdownFiles.length === 0) {
      continue;
    }
    const fileData = markdownFiles.map((file) => parseFrontmatter(file)).filter((data) => data !== null);
    const groups = {};
    const ungrouped = [];
    for (const { data, relativePath, fileName, displayPath } of fileData) {
      if (fileName === "index" && !data.sidebar_group) {
        continue;
      }
      const item = {
        text: data.sidebar_label || data.title || fileName,
        link: `/${displayPath}`,
        // 使用 displayPath 而不是 relativePath，生成简洁的 URL
        order: data.sidebar_order || data.order || 999
      };
      const group = data.sidebar_group;
      if (group) {
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(item);
      } else {
        ungrouped.push(item);
      }
    }
    const sidebarItems = [];
    if (ungrouped.length > 0) {
      ungrouped.sort((a, b) => (a.order || 999) - (b.order || 999));
      sidebarItems.push(...ungrouped.map(({ order, ...rest }) => rest));
    }
    for (const [groupName, items] of Object.entries(groups)) {
      items.sort((a, b) => (a.order || 999) - (b.order || 999));
      const firstFile = fileData.find((f) => f.data.sidebar_group === groupName);
      const collapsed = firstFile?.data.sidebar_collapsed === true;
      const groupDisplayName = getGroupDisplayName(groupName);
      sidebarItems.push({
        text: groupDisplayName,
        collapsed,
        items: items.map(({ order, ...rest }) => rest)
        // 移除 order 字段
      });
    }
    sidebar[`/${folder}/`] = sidebarItems;
  }
  return sidebar;
}

// .vitepress/config.ts
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/docs-site/.vitepress/config.ts";
var config_default = defineConfig({
  title: "\u62DC\u91CC\u65AF\u6587\u6863\u5E93",
  description: "BTC \u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF\u5F00\u53D1\u6587\u6863\u5E93",
  base: process.env.NODE_ENV === "production" ? "/internal/archive/" : "/",
  lang: "zh-CN",
  lastUpdated: true,
  // 路由配置
  cleanUrls: true,
  // 生成干净的 URL，不包含 .html 后缀
  // 确保路由状态保持
  ignoreDeadLinks: true,
  // 忽略死链接，避免路由错误
  // 外观设置 - 嵌入模式禁用外观切换，避免内联脚本注入
  appearance: false,
  // 完全禁用VitePress的外观切换，避免内联脚本"秒变黑"
  // 添加超早期脚本，在首屏前执行主题设置
  head: [
    [
      "script",
      {},
      `(function(){
  try {
    // \u4F18\u5148\u8BFB\u53D6parent-theme\uFF0C\u5982\u679C\u6CA1\u6709\u5219\u9ED8\u8BA4\u6D45\u8272\u4E3B\u9898
    var parentTheme = localStorage.getItem('parent-theme');
    var vueuseTheme = localStorage.getItem('vueuse-color-scheme');

    var isDark = false;

    // \u5982\u679C\u6709parent-theme\uFF0C\u76F4\u63A5\u4F7F\u7528
    if (parentTheme) {
      isDark = parentTheme === 'dark';
    } else if (vueuseTheme) {
      // \u5982\u679C\u6CA1\u6709parent-theme\uFF0C\u4F46\u6709vueuse-color-scheme\uFF0C\u5219\u6839\u636E\u5B83\u5224\u65AD
      // vueuse-color-scheme\u4E3A'auto'\u65F6\u8868\u793A\u6697\u8272\u4E3B\u9898\uFF0C'light'\u65F6\u8868\u793A\u6D45\u8272\u4E3B\u9898
      isDark = vueuseTheme === 'auto';
    }

    // \u5E94\u7528\u4E3B\u9898
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.setProperty('color-scheme', 'light');
    }
  } catch(e) {
    logger.error('[Early Script] Error:', e);
  }
})();`
    ]
  ],
  themeConfig: {
    logo: "/logo.png",
    siteTitle: "\u62DC\u91CC\u65AF\u6587\u6863\u5E93",
    // 显示站点标题
    // 自动生成导航栏（根据文件夹）
    nav: generateNav(),
    // 自动生成侧边栏（根据 frontmatter）
    sidebar: generateSidebar(),
    // 本地搜索
    search: {
      provider: "local",
      options: {
        locales: {
          "zh-CN": {
            translations: {
              button: { buttonText: "\u641C\u7D22\u6587\u6863", buttonAriaLabel: "\u641C\u7D22\u6587\u6863" },
              modal: {
                noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
                resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
                footer: {
                  selectText: "\u9009\u62E9",
                  navigateText: "\u5207\u6362",
                  closeText: "\u5173\u95ED"
                }
              }
            }
          }
        }
      }
    },
    // 编辑链接
    editLink: {
      pattern: "https://github.com/your-org/btc-shopflow/edit/main/:path",
      text: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875"
    },
    // 大纲配置
    outline: {
      level: [2, 3],
      label: "\u9875\u9762\u5BFC\u822A"
    },
    // 最后更新文本
    lastUpdated: {
      text: "\u6700\u540E\u66F4\u65B0",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short"
      }
    },
    // 分页导航文本
    docFooter: {
      prev: "\u4E0A\u4E00\u9875",
      next: "\u4E0B\u4E00\u9875"
    },
    // 社交媒体链接（可选）
    socialLinks: [
      // 可以添加GitHub等链接
    ],
    // 返回顶部按钮配置
    returnToTopLabel: "\u8FD4\u56DE\u9876\u90E8"
  },
  // Markdown 配置
  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: "\u63D0\u793A",
      warningLabel: "\u8B66\u544A",
      dangerLabel: "\u5371\u9669",
      infoLabel: "\u4FE1\u606F",
      detailsLabel: "\u8BE6\u7EC6\u4FE1\u606F"
    }
  },
  // Vite 配置
  vite: {
    plugins: [
      exportSearchIndexPlugin()
      // 导出搜索索引给主应用
    ],
    resolve: {
      alias: {
        "@btc/shared-components": fileURLToPath3(new URL("../../../packages/shared-components/src", __vite_injected_original_import_meta_url3)),
        "@btc/shared-core": fileURLToPath3(new URL("../../../packages/shared-core/src", __vite_injected_original_import_meta_url3)),
        "@btc/shared-utils": fileURLToPath3(new URL("../../../packages/shared-utils/src", __vite_injected_original_import_meta_url3))
      }
    },
    // CSS 配置 - 解决 Sass 弃用警告
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          // 使用现代编译器 API
          silenceDeprecations: ["legacy-js-api"]
          // 抑制弃用警告
        }
      }
    },
    // SSR 配置
    ssr: {
      noExternal: ["element-plus", "@btc/shared-components", "@btc/shared-core"]
    },
    // 构建配置
    build: {
      chunkSizeWarningLimit: 1e3
      // 文档站点允许更大的 chunk
    },
    // 服务器配置
    server: {
      port: 8085,
      host: "0.0.0.0",
      strictPort: true,
      // 端口被占用时报错而不是自动换端口
      cors: true,
      // 允许跨域（iframe 嵌入需要）
      hmr: {
        port: 8086,
        // 使用不同的端口避免冲突
        host: "localhost"
        // 改为 localhost，避免 0.0.0.0 的问题
      }
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcudHMiLCAiLnZpdGVwcmVzcy9wbHVnaW5zL2V4cG9ydFNlYXJjaEluZGV4LnRzIiwgIi52aXRlcHJlc3MvdXRpbHMvYXV0by1uYXYudHMiLCAiLnZpdGVwcmVzcy91dGlscy9hdXRvLXNpZGViYXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZG9jcy1zaXRlXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxkb2NzLXNpdGVcXFxcLnZpdGVwcmVzc1xcXFxjb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9kb2NzLXNpdGUvLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IHsgZXhwb3J0U2VhcmNoSW5kZXhQbHVnaW4gfSBmcm9tICcuL3BsdWdpbnMvZXhwb3J0U2VhcmNoSW5kZXgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgZ2VuZXJhdGVOYXYgfSBmcm9tICcuL3V0aWxzL2F1dG8tbmF2JztcbmltcG9ydCB7IGdlbmVyYXRlU2lkZWJhciB9IGZyb20gJy4vdXRpbHMvYXV0by1zaWRlYmFyJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGl0bGU6ICdcdTYyRENcdTkxQ0NcdTY1QUZcdTY1ODdcdTY4NjNcdTVFOTMnLFxuICBkZXNjcmlwdGlvbjogJ0JUQyBcdThGNjZcdTk1RjRcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTVGMDBcdTUzRDFcdTY1ODdcdTY4NjNcdTVFOTMnLFxuXG4gIGJhc2U6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAnL2ludGVybmFsL2FyY2hpdmUvJyA6ICcvJyxcbiAgbGFuZzogJ3poLUNOJyxcblxuICBsYXN0VXBkYXRlZDogdHJ1ZSxcblxuICAvLyBcdThERUZcdTc1MzFcdTkxNERcdTdGNkVcbiAgY2xlYW5VcmxzOiB0cnVlLCAvLyBcdTc1MUZcdTYyMTBcdTVFNzJcdTUxQzBcdTc2ODQgVVJMXHVGRjBDXHU0RTBEXHU1MzA1XHU1NDJCIC5odG1sIFx1NTQwRVx1N0YwMFxuXG4gIC8vIFx1Nzg2RVx1NEZERFx1OERFRlx1NzUzMVx1NzJCNlx1NjAwMVx1NEZERFx1NjMwMVxuICBpZ25vcmVEZWFkTGlua3M6IHRydWUsIC8vIFx1NUZGRFx1NzU2NVx1NkI3Qlx1OTRGRVx1NjNBNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OERFRlx1NzUzMVx1OTUxOVx1OEJFRlxuXG4gIC8vIFx1NTkxNlx1ODlDMlx1OEJCRVx1N0Y2RSAtIFx1NUQ0Q1x1NTE2NVx1NkEyMVx1NUYwRlx1Nzk4MVx1NzUyOFx1NTkxNlx1ODlDMlx1NTIwN1x1NjM2Mlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQ1x1NkNFOFx1NTE2NVxuICBhcHBlYXJhbmNlOiBmYWxzZSwgLy8gXHU1QjhDXHU1MTY4XHU3OTgxXHU3NTI4Vml0ZVByZXNzXHU3Njg0XHU1OTE2XHU4OUMyXHU1MjA3XHU2MzYyXHVGRjBDXHU5MDdGXHU1MTREXHU1MTg1XHU4MDU0XHU4MTFBXHU2NzJDXCJcdTc5RDJcdTUzRDhcdTlFRDFcIlxuXG4gIC8vIFx1NkRGQlx1NTJBMFx1OEQ4NVx1NjVFOVx1NjcxRlx1ODExQVx1NjcyQ1x1RkYwQ1x1NTcyOFx1OTk5Nlx1NUM0Rlx1NTI0RFx1NjI2N1x1ODg0Q1x1NEUzQlx1OTg5OFx1OEJCRVx1N0Y2RVxuICBoZWFkOiBbXG4gICAgWydzY3JpcHQnLCB7fSxcbmAoZnVuY3Rpb24oKXtcbiAgdHJ5IHtcbiAgICAvLyBcdTRGMThcdTUxNDhcdThCRkJcdTUzRDZwYXJlbnQtdGhlbWVcdUZGMENcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUyMTlcdTlFRDhcdThCQTRcdTZENDVcdTgyNzJcdTRFM0JcdTk4OThcbiAgICB2YXIgcGFyZW50VGhlbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncGFyZW50LXRoZW1lJyk7XG4gICAgdmFyIHZ1ZXVzZVRoZW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Z1ZXVzZS1jb2xvci1zY2hlbWUnKTtcblxuICAgIHZhciBpc0RhcmsgPSBmYWxzZTtcblxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjcwOXBhcmVudC10aGVtZVx1RkYwQ1x1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOFxuICAgIGlmIChwYXJlbnRUaGVtZSkge1xuICAgICAgaXNEYXJrID0gcGFyZW50VGhlbWUgPT09ICdkYXJrJztcbiAgICB9IGVsc2UgaWYgKHZ1ZXVzZVRoZW1lKSB7XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlwYXJlbnQtdGhlbWVcdUZGMENcdTRGNDZcdTY3MDl2dWV1c2UtY29sb3Itc2NoZW1lXHVGRjBDXHU1MjE5XHU2ODM5XHU2MzZFXHU1QjgzXHU1MjI0XHU2NUFEXG4gICAgICAvLyB2dWV1c2UtY29sb3Itc2NoZW1lXHU0RTNBJ2F1dG8nXHU2NUY2XHU4ODY4XHU3OTNBXHU2Njk3XHU4MjcyXHU0RTNCXHU5ODk4XHVGRjBDJ2xpZ2h0J1x1NjVGNlx1ODg2OFx1NzkzQVx1NkQ0NVx1ODI3Mlx1NEUzQlx1OTg5OFxuICAgICAgaXNEYXJrID0gdnVldXNlVGhlbWUgPT09ICdhdXRvJztcbiAgICB9XG5cbiAgICAvLyBcdTVFOTRcdTc1MjhcdTRFM0JcdTk4OThcbiAgICBpZiAoaXNEYXJrKSB7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZGFyaycpO1xuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS10aGVtZScsICdkYXJrJyk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ2NvbG9yLXNjaGVtZScsICdkYXJrJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkYXJrJyk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lJywgJ2xpZ2h0Jyk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ2NvbG9yLXNjaGVtZScsICdsaWdodCcpO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcignW0Vhcmx5IFNjcmlwdF0gRXJyb3I6JywgZSk7XG4gIH1cbn0pKCk7YFxuICAgIF1cbiAgXSxcblxuICB0aGVtZUNvbmZpZzoge1xuICAgIGxvZ286ICcvbG9nby5wbmcnLFxuICAgIHNpdGVUaXRsZTogJ1x1NjJEQ1x1OTFDQ1x1NjVBRlx1NjU4N1x1Njg2M1x1NUU5MycsIC8vIFx1NjYzRVx1NzkzQVx1N0FEOVx1NzBCOVx1NjgwN1x1OTg5OFxuXG4gICAgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU1QkZDXHU4MjJBXHU2ODBGXHVGRjA4XHU2ODM5XHU2MzZFXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA5XG4gICAgbmF2OiBnZW5lcmF0ZU5hdigpLFxuXG4gICAgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU0RkE3XHU4RkI5XHU2ODBGXHVGRjA4XHU2ODM5XHU2MzZFIGZyb250bWF0dGVyXHVGRjA5XG4gICAgc2lkZWJhcjogZ2VuZXJhdGVTaWRlYmFyKCksXG5cbiAgICAvLyBcdTY3MkNcdTU3MzBcdTY0MUNcdTdEMjJcbiAgICBzZWFyY2g6IHtcbiAgICAgIHByb3ZpZGVyOiAnbG9jYWwnLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBsb2NhbGVzOiB7XG4gICAgICAgICAgJ3poLUNOJzoge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25zOiB7XG4gICAgICAgICAgICAgIGJ1dHRvbjogeyBidXR0b25UZXh0OiAnXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzJywgYnV0dG9uQXJpYUxhYmVsOiAnXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzJyB9LFxuICAgICAgICAgICAgICBtb2RhbDoge1xuICAgICAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6ICdcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzBcdTc2RjhcdTUxNzNcdTdFRDNcdTY3OUMnLFxuICAgICAgICAgICAgICAgIHJlc2V0QnV0dG9uVGl0bGU6ICdcdTZFMDVcdTk2NjRcdTY3RTVcdThCRTJcdTY3NjFcdTRFRjYnLFxuICAgICAgICAgICAgICAgIGZvb3Rlcjoge1xuICAgICAgICAgICAgICAgICAgc2VsZWN0VGV4dDogJ1x1OTAwOVx1NjJFOScsXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZVRleHQ6ICdcdTUyMDdcdTYzNjInLFxuICAgICAgICAgICAgICAgICAgY2xvc2VUZXh0OiAnXHU1MTczXHU5NUVEJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBcdTdGMTZcdThGOTFcdTk0RkVcdTYzQTVcbiAgICBlZGl0TGluazoge1xuICAgICAgcGF0dGVybjogJ2h0dHBzOi8vZ2l0aHViLmNvbS95b3VyLW9yZy9idGMtc2hvcGZsb3cvZWRpdC9tYWluLzpwYXRoJyxcbiAgICAgIHRleHQ6ICdcdTU3MjggR2l0SHViIFx1NEUwQVx1N0YxNlx1OEY5MVx1NkI2NFx1OTg3NSdcbiAgICB9LFxuXG4gICAgLy8gXHU1OTI3XHU3RUIyXHU5MTREXHU3RjZFXG4gICAgb3V0bGluZToge1xuICAgICAgbGV2ZWw6IFsyLCAzXSxcbiAgICAgIGxhYmVsOiAnXHU5ODc1XHU5NzYyXHU1QkZDXHU4MjJBJ1xuICAgIH0sXG5cbiAgICAvLyBcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjBcdTY1ODdcdTY3MkNcbiAgICBsYXN0VXBkYXRlZDoge1xuICAgICAgdGV4dDogJ1x1NjcwMFx1NTQwRVx1NjZGNFx1NjVCMCcsXG4gICAgICBmb3JtYXRPcHRpb25zOiB7XG4gICAgICAgIGRhdGVTdHlsZTogJ3Nob3J0JyxcbiAgICAgICAgdGltZVN0eWxlOiAnc2hvcnQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFx1NTIwNlx1OTg3NVx1NUJGQ1x1ODIyQVx1NjU4N1x1NjcyQ1xuICAgIGRvY0Zvb3Rlcjoge1xuICAgICAgcHJldjogJ1x1NEUwQVx1NEUwMFx1OTg3NScsXG4gICAgICBuZXh0OiAnXHU0RTBCXHU0RTAwXHU5ODc1J1xuICAgIH0sXG5cbiAgICAvLyBcdTc5M0VcdTRFQTRcdTVBOTJcdTRGNTNcdTk0RkVcdTYzQTVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDlcbiAgICBzb2NpYWxMaW5rczogW1xuICAgICAgLy8gXHU1M0VGXHU0RUU1XHU2REZCXHU1MkEwR2l0SHViXHU3QjQ5XHU5NEZFXHU2M0E1XG4gICAgXSxcblxuICAgIC8vIFx1OEZENFx1NTZERVx1OTg3Nlx1OTBFOFx1NjMwOVx1OTRBRVx1OTE0RFx1N0Y2RVxuICAgIHJldHVyblRvVG9wTGFiZWw6ICdcdThGRDRcdTU2REVcdTk4NzZcdTkwRTgnXG4gIH0sXG5cbiAgLy8gTWFya2Rvd24gXHU5MTREXHU3RjZFXG4gIG1hcmtkb3duOiB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG5cbiAgICBjb250YWluZXI6IHtcbiAgICAgIHRpcExhYmVsOiAnXHU2M0QwXHU3OTNBJyxcbiAgICAgIHdhcm5pbmdMYWJlbDogJ1x1OEI2Nlx1NTQ0QScsXG4gICAgICBkYW5nZXJMYWJlbDogJ1x1NTM3MVx1OTY2OScsXG4gICAgICBpbmZvTGFiZWw6ICdcdTRGRTFcdTYwNkYnLFxuICAgICAgZGV0YWlsc0xhYmVsOiAnXHU4QkU2XHU3RUM2XHU0RkUxXHU2MDZGJ1xuICAgIH1cbiAgfSxcblxuICAvLyBWaXRlIFx1OTE0RFx1N0Y2RVxuICB2aXRlOiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgZXhwb3J0U2VhcmNoSW5kZXhQbHVnaW4oKSAvLyBcdTVCRkNcdTUxRkFcdTY0MUNcdTdEMjJcdTdEMjJcdTVGMTVcdTdFRDlcdTRFM0JcdTVFOTRcdTc1MjhcbiAgICBdLFxuXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vLi4vcGFja2FnZXMvc2hhcmVkLXV0aWxzL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDU1MgXHU5MTREXHU3RjZFIC0gXHU4OUUzXHU1MUIzIFNhc3MgXHU1RjAzXHU3NTI4XHU4QjY2XHU1NDRBXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIHNjc3M6IHtcbiAgICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLCAvLyBcdTRGN0ZcdTc1MjhcdTczQjBcdTRFRTNcdTdGMTZcdThCRDFcdTU2NjggQVBJXG4gICAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJ10gLy8gXHU2MjkxXHU1MjM2XHU1RjAzXHU3NTI4XHU4QjY2XHU1NDRBXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU1NSIFx1OTE0RFx1N0Y2RVxuICAgIHNzcjoge1xuICAgICAgbm9FeHRlcm5hbDogWydlbGVtZW50LXBsdXMnLCAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsICdAYnRjL3NoYXJlZC1jb3JlJ11cbiAgICB9LFxuXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gICAgYnVpbGQ6IHtcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCwgLy8gXHU2NTg3XHU2ODYzXHU3QUQ5XHU3MEI5XHU1MTQxXHU4QkI4XHU2NkY0XHU1OTI3XHU3Njg0IGNodW5rXG4gICAgfSxcblxuICAgIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogODA4NSxcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgIHN0cmljdFBvcnQ6IHRydWUsIC8vIFx1N0FFRlx1NTNFM1x1ODhBQlx1NTM2MFx1NzUyOFx1NjVGNlx1NjJBNVx1OTUxOVx1ODAwQ1x1NEUwRFx1NjYyRlx1ODFFQVx1NTJBOFx1NjM2Mlx1N0FFRlx1NTNFM1xuICAgICAgY29yczogdHJ1ZSwgLy8gXHU1MTQxXHU4QkI4XHU4REU4XHU1N0RGXHVGRjA4aWZyYW1lIFx1NUQ0Q1x1NTE2NVx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgICBobXI6IHtcbiAgICAgICAgICBwb3J0OiA4MDg2LCAvLyBcdTRGN0ZcdTc1MjhcdTRFMERcdTU0MENcdTc2ODRcdTdBRUZcdTUzRTNcdTkwN0ZcdTUxNERcdTUxQjJcdTdBODFcbiAgICAgICAgICBob3N0OiAnbG9jYWxob3N0JyAvLyBcdTY1MzlcdTRFM0EgbG9jYWxob3N0XHVGRjBDXHU5MDdGXHU1MTREIDAuMC4wLjAgXHU3Njg0XHU5NUVFXHU5ODk4XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZG9jcy1zaXRlXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGRvY3Mtc2l0ZVxcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcXFxcZXhwb3J0U2VhcmNoSW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9kb2NzLXNpdGUvLnZpdGVwcmVzcy9wbHVnaW5zL2V4cG9ydFNlYXJjaEluZGV4LnRzXCI7LyoqXG4gKiBWaXRlUHJlc3MgXHU2M0QyXHU0RUY2XHVGRjFBXHU1QkZDXHU1MUZBXHU2NDFDXHU3RDIyXHU3RDIyXHU1RjE1XHU3RUQ5XHU0RTNCXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XG4gKlxuICogXHU4QkU1XHU2M0QyXHU0RUY2XHU0RjFBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU1QzA2IFZpdGVQcmVzcyBcdTc2ODRcdTY0MUNcdTdEMjJcdTdEMjJcdTVGMTVcdTVCRkNcdTUxRkFcdTRFM0FcdTcyRUNcdTdBQ0JcdTc2ODQgSlNPTiBcdTY1ODdcdTRFRjZcdUZGMENcbiAqIFx1NEY5Qlx1NEUzQlx1NUU5NFx1NzUyOFx1NzY4NFx1NTE2OFx1NUM0MFx1NjQxQ1x1N0QyMlx1NTI5Rlx1ODBGRFx1NEY3Rlx1NzUyOFx1MzAwMlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmludGVyZmFjZSBTZWFyY2hJbmRleEl0ZW0ge1xuICBpZDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgYnJlYWRjcnVtYj86IHN0cmluZztcbiAgZXhjZXJwdD86IHN0cmluZztcbiAgY29udGVudD86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFNlYXJjaEluZGV4UGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGVwcmVzcy1leHBvcnQtc2VhcmNoLWluZGV4JyxcbiAgICBlbmZvcmNlOiAncG9zdCcsXG5cbiAgICAvLyBcdTU3MjhcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcdTY1RjZcdTZERkJcdTUyQTBcdTdBRUZcdTcwQjlcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3NlYXJjaC1pbmRleC5qc29uJywgKF9yZXEsIHJlcykgPT4ge1xuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMUFcdThGRDRcdTU2REVcdTdCODBcdTUzMTZcdTc2ODRcdTY0MUNcdTdEMjJcdTdEMjJcdTVGMTVcbiAgICAgICAgY29uc3QgZGV2SW5kZXggPSBnZW5lcmF0ZURldlNlYXJjaEluZGV4KCk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGV2SW5kZXgpKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBcdTU3MjhcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdTc1MUZcdTYyMTBcdTY0MUNcdTdEMjJcdTdEMjJcdTVGMTVcdTY1ODdcdTRFRjZcbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1NEVDRVx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NjNEMFx1NTNENlx1NjQxQ1x1N0QyMlx1N0QyMlx1NUYxNVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgb3V0RGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2Rpc3QnKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMob3V0RGlyKSkge1xuICAgICAgICAgIGNvbnN0IHNlYXJjaEluZGV4ID0gZXh0cmFjdFNlYXJjaEluZGV4RnJvbUJ1aWxkKG91dERpcik7XG4gICAgICAgICAgY29uc3QgaW5kZXhQYXRoID0gcGF0aC5qb2luKG91dERpciwgJ3NlYXJjaC1pbmRleC5qc29uJyk7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhpbmRleFBhdGgsIEpTT04uc3RyaW5naWZ5KHNlYXJjaEluZGV4LCBudWxsLCAyKSk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1tleHBvcnRTZWFyY2hJbmRleF0gU2VhcmNoIGluZGV4IGV4cG9ydGVkIHRvOicsIGluZGV4UGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW2V4cG9ydFNlYXJjaEluZGV4XSBGYWlsZWQgdG8gZXhwb3J0IHNlYXJjaCBpbmRleDonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFx1NzUxRlx1NjIxMFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NzY4NFx1NjQxQ1x1N0QyMlx1N0QyMlx1NUYxNVx1RkYwOFx1N0I4MFx1NTMxNlx1NzI0OFx1RkYwOVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZURldlNlYXJjaEluZGV4KCk6IFNlYXJjaEluZGV4SXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBpZDogJ3RpbWVsaW5lJyxcbiAgICAgIHRpdGxlOiAnXHU5ODc5XHU3NkVFXHU2NUY2XHU5NUY0XHU3RUJGJyxcbiAgICAgIHVybDogJy90aW1lbGluZS8nLFxuICAgICAgYnJlYWRjcnVtYjogJ1x1NjU4N1x1Njg2M1x1NEUyRFx1NUZDMycsXG4gICAgICBleGNlcnB0OiAnXHU2MzA5XHU2NUY2XHU5NUY0XHU5ODdBXHU1RThGXHU2N0U1XHU3NzBCXHU5ODc5XHU3NkVFXHU3Njg0XHU0RTNCXHU4OTgxXHU5MUNDXHU3QTBCXHU3ODkxXHU1NDhDXHU1M0Q4XHU2NkY0XHU1Mzg2XHU1M0YyJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdwcm9qZWN0cycsXG4gICAgICB0aXRsZTogJ1x1OTg3OVx1NzZFRVx1N0QyMlx1NUYxNScsXG4gICAgICB1cmw6ICcvcHJvamVjdHMvJyxcbiAgICAgIGJyZWFkY3J1bWI6ICdcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzMnLFxuICAgICAgZXhjZXJwdDogJ1x1NjMwOVx1OTg3OVx1NzZFRVx1NTIwNlx1N0M3Qlx1NkQ0Rlx1ODlDOFx1NjI4MFx1NjcyRlx1NjU4N1x1Njg2MydcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndHlwZXMnLFxuICAgICAgdGl0bGU6ICdcdTY1ODdcdTY4NjNcdTdDN0JcdTU3OEJcdTUyMDZcdTdDN0InLFxuICAgICAgdXJsOiAnL3R5cGVzLycsXG4gICAgICBicmVhZGNydW1iOiAnXHU2NTg3XHU2ODYzXHU0RTJEXHU1RkMzJyxcbiAgICAgIGV4Y2VycHQ6ICdcdTYzMDlcdTY1ODdcdTY4NjNcdTdDN0JcdTU3OEJcdUZGMDhBRFIsIFJGQywgU09QIFx1N0I0OVx1RkYwOVx1NkQ0Rlx1ODlDOCdcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndGFncycsXG4gICAgICB0aXRsZTogJ1x1NjgwN1x1N0I3RVx1N0QyMlx1NUYxNScsXG4gICAgICB1cmw6ICcvdGFncy8nLFxuICAgICAgYnJlYWRjcnVtYjogJ1x1NjU4N1x1Njg2M1x1NEUyRFx1NUZDMycsXG4gICAgICBleGNlcnB0OiAnXHU2MzA5XHU2ODA3XHU3QjdFXHU2RDRGXHU4OUM4XHU3NkY4XHU1MTczXHU2NTg3XHU2ODYzJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb21wb25lbnRzJyxcbiAgICAgIHRpdGxlOiAnXHU3RUM0XHU0RUY2XHU2NTg3XHU2ODYzJyxcbiAgICAgIHVybDogJy9jb21wb25lbnRzLycsXG4gICAgICBicmVhZGNydW1iOiAnXHU2NTg3XHU2ODYzXHU0RTJEXHU1RkMzJyxcbiAgICAgIGV4Y2VycHQ6ICdCVEMgXHU0RTFBXHU1MkExXHU3RUM0XHU0RUY2XHU0RjdGXHU3NTI4XHU2NTg3XHU2ODYzXHU1NDhDXHU2NzAwXHU0RjczXHU1QjlFXHU4REY1J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb21wb25lbnRzLWNydWQnLFxuICAgICAgdGl0bGU6ICdCdGNDcnVkIFx1N0VDNFx1NEVGNicsXG4gICAgICB1cmw6ICcvY29tcG9uZW50cy9jcnVkJyxcbiAgICAgIGJyZWFkY3J1bWI6ICdcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzMgPiBcdTdFQzRcdTRFRjYnLFxuICAgICAgZXhjZXJwdDogJ0NSVUQgXHU2NENEXHU0RjVDXHU3Njg0XHU2ODM4XHU1RkMzXHU3RUM0XHU0RUY2XHVGRjBDXHU2M0QwXHU0RjlCXHU1ODlFXHU1MjIwXHU2NTM5XHU2N0U1XHUzMDAxXHU1MjA2XHU5ODc1XHUzMDAxXHU2NDFDXHU3RDIyXHU3QjQ5XHU1MjlGXHU4MEZEJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb21wb25lbnRzLWZvcm0nLFxuICAgICAgdGl0bGU6ICdCdGNGb3JtIFx1N0VDNFx1NEVGNicsXG4gICAgICB1cmw6ICcvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgIGJyZWFkY3J1bWI6ICdcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzMgPiBcdTdFQzRcdTRFRjYnLFxuICAgICAgZXhjZXJwdDogJ1x1ODg2OFx1NTM1NVx1N0VDNFx1NEVGNlx1RkYwQ1x1NjUyRlx1NjMwMVx1NTJBOFx1NjAwMVx1ODg2OFx1NTM1NVx1MzAwMVx1OUE4Q1x1OEJDMVx1MzAwMXRhYnNcdTMwMDFcdTYzRDJcdTRFRjZcdTdCNDlcdTUyOUZcdTgwRkQnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2NvbXBvbmVudHMtdXBzZXJ0JyxcbiAgICAgIHRpdGxlOiAnQnRjVXBzZXJ0IFx1N0VDNFx1NEVGNicsXG4gICAgICB1cmw6ICcvY29tcG9uZW50cy91cHNlcnQnLFxuICAgICAgYnJlYWRjcnVtYjogJ1x1NjU4N1x1Njg2M1x1NEUyRFx1NUZDMyA+IFx1N0VDNFx1NEVGNicsXG4gICAgICBleGNlcnB0OiAnXHU2NUIwXHU1ODlFXHU1NDhDXHU3RjE2XHU4RjkxXHU3Njg0XHU1RjM5XHU3QTk3XHU3RUM0XHU0RUY2XHVGRjBDXHU1N0ZBXHU0RThFIEJ0Y0RpYWxvZyBcdTU0OEMgQnRjRm9ybSdcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY29tcG9uZW50cy10YWJsZScsXG4gICAgICB0aXRsZTogJ0J0Y1RhYmxlIFx1N0VDNFx1NEVGNicsXG4gICAgICB1cmw6ICcvY29tcG9uZW50cy90YWJsZScsXG4gICAgICBicmVhZGNydW1iOiAnXHU2NTg3XHU2ODYzXHU0RTJEXHU1RkMzID4gXHU3RUM0XHU0RUY2JyxcbiAgICAgIGV4Y2VycHQ6ICdcdTg4NjhcdTY4M0NcdTdFQzRcdTRFRjZcdUZGMENcdTY1MkZcdTYzMDFcdTYzOTJcdTVFOEZcdTMwMDFcdTU2RkFcdTVCOUFcdTUyMTdcdTMwMDFcdTgxRUFcdTVCOUFcdTRFNDlcdTUyMTdcdTMwMDFcdTY0Q0RcdTRGNUNcdTUyMTdcdTdCNDknXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2NvbXBvbmVudHMtZGlhbG9nJyxcbiAgICAgIHRpdGxlOiAnQnRjRGlhbG9nIFx1N0VDNFx1NEVGNicsXG4gICAgICB1cmw6ICcvY29tcG9uZW50cy9kaWFsb2cnLFxuICAgICAgYnJlYWRjcnVtYjogJ1x1NjU4N1x1Njg2M1x1NEUyRFx1NUZDMyA+IFx1N0VDNFx1NEVGNicsXG4gICAgICBleGNlcnB0OiAnXHU1RjM5XHU3QTk3XHU3RUM0XHU0RUY2XHVGRjBDXHU2NTJGXHU2MzAxXHU1MTY4XHU1QzRGXHUzMDAxXHU2MkQ2XHU2MkZEXHUzMDAxXHU4MUVBXHU1QjlBXHU0RTQ5XHU1QzNBXHU1QkY4XHU3QjQ5XHU1MjlGXHU4MEZEJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb21wb25lbnRzLXZpZXctZ3JvdXAnLFxuICAgICAgdGl0bGU6ICdCdGNWaWV3R3JvdXAgXHU3RUM0XHU0RUY2JyxcbiAgICAgIHVybDogJy9jb21wb25lbnRzL3ZpZXctZ3JvdXAnLFxuICAgICAgYnJlYWRjcnVtYjogJ1x1NjU4N1x1Njg2M1x1NEUyRFx1NUZDMyA+IFx1N0VDNFx1NEVGNicsXG4gICAgICBleGNlcnB0OiAnXHU1REU2XHU2ODExXHU1M0YzXHU4ODY4XHU1RTAzXHU1QzQwXHU3RUM0XHU0RUY2XHVGRjBDXHU2NTJGXHU2MzAxXHU2ODExXHU1RjYyXHU4M0RDXHU1MzU1XHUzMDAxXHU1MjE3XHU4ODY4XHU1MjA3XHU2MzYyXHUzMDAxXHU2MkQ2XHU2MkZEXHU2MzkyXHU1RThGXHU3QjQ5J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdhcGknLFxuICAgICAgdGl0bGU6ICdBUEkgXHU2NTg3XHU2ODYzJyxcbiAgICAgIHVybDogJy9hcGkvJyxcbiAgICAgIGJyZWFkY3J1bWI6ICdcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzMnLFxuICAgICAgZXhjZXJwdDogJ1x1N0NGQlx1N0VERiBBUEkgXHU2M0E1XHU1M0UzXHU2NTg3XHU2ODYzJ1xuICAgIH0sXG4gIF07XG59XG5cbi8qKlxuICogXHU0RUNFXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHU2M0QwXHU1M0Q2XHU2NDFDXHU3RDIyXHU3RDIyXHU1RjE1XG4gKiBUT0RPOiBcdTVCOUVcdTczQjBcdTRFQ0UgVml0ZVByZXNzIFx1Njc4NFx1NUVGQVx1NzY4NCBoYXNobWFwLmpzb24gXHU2MjE2XHU1MTc2XHU0RUQ2XHU3RDIyXHU1RjE1XHU2NTg3XHU0RUY2XHU0RTJEXHU2M0QwXHU1M0Q2XG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RTZWFyY2hJbmRleEZyb21CdWlsZChvdXREaXI6IHN0cmluZyk6IFNlYXJjaEluZGV4SXRlbVtdIHtcbiAgLy8gXHU3NkVFXHU1MjREXHU4RkQ0XHU1NkRFXHU1RjAwXHU1M0QxXHU3RDIyXHU1RjE1XHVGRjBDXHU2NzJBXHU2NzY1XHU1M0VGXHU0RUU1XHU4OUUzXHU2NzkwIFZpdGVQcmVzcyBcdTc1MUZcdTYyMTBcdTc2ODRcdTVCOUVcdTk2NDVcdTdEMjJcdTVGMTVcdTY1ODdcdTRFRjZcbiAgcmV0dXJuIGdlbmVyYXRlRGV2U2VhcmNoSW5kZXgoKTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZG9jcy1zaXRlXFxcXC52aXRlcHJlc3NcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxkb2NzLXNpdGVcXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1xcXFxhdXRvLW5hdi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2RvY3Mtc2l0ZS8udml0ZXByZXNzL3V0aWxzL2F1dG8tbmF2LnRzXCI7LyoqXG4gKiBcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTVCRkNcdTgyMkFcdTY4MEZcdTkxNERcdTdGNkVcbiAqIFx1NjgzOVx1NjM2RVx1NEUwMFx1N0VBN1x1NjU4N1x1NEVGNlx1NTkzOVx1NTQwRFx1NzlGMFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBuYXZcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcbmNvbnN0IGRvY3NSb290ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLycpO1xuXG5pbnRlcmZhY2UgTmF2SXRlbSB7XG4gIHRleHQ6IHN0cmluZztcbiAgbGluazogc3RyaW5nO1xuICBhY3RpdmVNYXRjaD86IHN0cmluZztcbn1cblxuLy8gXHU2NTg3XHU0RUY2XHU1OTM5XHU1MjMwXHU1QkZDXHU4MjJBXHU2NTg3XHU2NzJDXHU3Njg0XHU2NjIwXHU1QzA0XG5jb25zdCBmb2xkZXJUb05hdjogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ2d1aWRlcyc6ICdcdTYzMDdcdTUzNTcnLFxuICAnYWRyJzogJ0FEUicsXG4gICdzb3AnOiAnU09QJyxcbiAgJ3BhY2thZ2VzJzogJ1x1NTMwNScsXG4gICdjb21wb25lbnRzJzogJ1x1N0VDNFx1NEVGNicsXG4gICdhcGknOiAnQVBJJyxcbiAgJ3RpbWVsaW5lJzogJ1x1NjVGNlx1OTVGNFx1N0VCRicsXG4gICdwcm9qZWN0cyc6ICdcdTk4NzlcdTc2RUUnLFxuICAndHlwZXMnOiAnXHU3QzdCXHU1NzhCJyxcbiAgJ3RhZ3MnOiAnXHU2ODA3XHU3QjdFJyxcbn07XG5cbi8vIFx1NUJGQ1x1ODIyQVx1OTg3QVx1NUU4Rlx1RkYwOFx1NjU3MFx1N0VDNFx1OTg3QVx1NUU4Rlx1NTM3M1x1NEUzQVx1NjYzRVx1NzkzQVx1OTg3QVx1NUU4Rlx1RkYwOVxuY29uc3QgbmF2T3JkZXIgPSBbXG4gICdndWlkZXMnLFxuICAnYWRyJyxcbiAgJ3NvcCcsXG4gICdwYWNrYWdlcycsXG4gICdjb21wb25lbnRzJyxcbl07XG5cbi8qKlxuICogXHU2N0U1XHU2MjdFXHU2NTg3XHU0RUY2XHU1OTM5XHU0RTBCXHU3Njg0XHU3QjJDXHU0RTAwXHU0RTJBIC5tZCBcdTY1ODdcdTRFRjZcdUZGMDhcdTRGNUNcdTRFM0FcdTlFRDhcdThCQTRcdTk0RkVcdTYzQTVcdUZGMDlcbiAqL1xuZnVuY3Rpb24gZmluZEZpcnN0TWFya2Rvd24oZGlyOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgdHJ5IHtcbiAgICAvLyBcdTUxNDhcdTY3RTVcdTYyN0UgaW5kZXgubWRcbiAgICBjb25zdCBpbmRleFBhdGggPSBwYXRoLmpvaW4oZGlyLCAnaW5kZXgubWQnKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhpbmRleFBhdGgpKSB7XG4gICAgICByZXR1cm4gJy9pbmRleCc7XG4gICAgfVxuXG4gICAgLy8gXHU2N0U1XHU2MjdFXHU1QjUwXHU3NkVFXHU1RjU1XG4gICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBjb25zdCBzdWJEaXIgPSBwYXRoLmpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgY29uc3QgaW5kZXhQYXRoID0gcGF0aC5qb2luKHN1YkRpciwgJ2luZGV4Lm1kJyk7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGluZGV4UGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gYC8ke2VudHJ5Lm5hbWV9L2luZGV4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NjdFNVx1NjI3RVx1N0IyQ1x1NEUwMFx1NEUyQSAubWQgXHU2NTg3XHU0RUY2XG4gICAgICAgIGNvbnN0IHN1YkVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhzdWJEaXIpO1xuICAgICAgICBjb25zdCBmaXJzdE1kID0gc3ViRW50cmllcy5maW5kKGYgPT4gZi5lbmRzV2l0aCgnLm1kJykpO1xuICAgICAgICBpZiAoZmlyc3RNZCkge1xuICAgICAgICAgIHJldHVybiBgLyR7ZW50cnkubmFtZX0vJHtmaXJzdE1kLnJlcGxhY2UoJy5tZCcsICcnKX1gO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5tZCcpICYmIGVudHJ5Lm5hbWUgIT09ICdpbmRleC5tZCcpIHtcbiAgICAgICAgcmV0dXJuIGAvJHtlbnRyeS5uYW1lLnJlcGxhY2UoJy5tZCcsICcnKX1gO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBmaW5kIG1hcmtkb3duIGluICR7ZGlyfTpgLCBlcnJvcik7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBcdTc1MUZcdTYyMTBcdTVCRkNcdTgyMkFcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlTmF2KCk6IE5hdkl0ZW1bXSB7XG4gIGNvbnN0IG5hdjogTmF2SXRlbVtdID0gW1xuICAgIHsgdGV4dDogJ1x1OTk5Nlx1OTg3NScsIGxpbms6ICcvJywgYWN0aXZlTWF0Y2g6ICdeLyQnIH1cbiAgXTtcblxuICBmb3IgKGNvbnN0IGZvbGRlciBvZiBuYXZPcmRlcikge1xuICAgIGNvbnN0IGZvbGRlclBhdGggPSBwYXRoLmpvaW4oZG9jc1Jvb3QsIGZvbGRlcik7XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTU5MzlcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZm9sZGVyUGF0aCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFx1NjdFNVx1NjI3RVx1N0IyQ1x1NEUwMFx1NEUyQSBtYXJrZG93biBcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBmaXJzdE1kID0gZmluZEZpcnN0TWFya2Rvd24oZm9sZGVyUGF0aCk7XG4gICAgaWYgKCFmaXJzdE1kKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0ID0gZm9sZGVyVG9OYXZbZm9sZGVyXSB8fCBmb2xkZXI7XG4gICAgY29uc3QgbGluayA9IGAvJHtmb2xkZXJ9JHtmaXJzdE1kfWA7XG5cbiAgICAvLyBcdTZERkJcdTUyQTAgYWN0aXZlTWF0Y2ggXHU4OUM0XHU1MjE5XHVGRjFBXHU1M0VBXHU4OTgxXHU4REVGXHU1Rjg0XHU0RUU1IC9mb2xkZXIvIFx1NUYwMFx1NTkzNFx1NUMzMVx1NkZDMFx1NkQzQlxuICAgIG5hdi5wdXNoKHtcbiAgICAgIHRleHQsXG4gICAgICBsaW5rLFxuICAgICAgYWN0aXZlTWF0Y2g6IGBeLyR7Zm9sZGVyfS9gXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbmF2O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxkb2NzLXNpdGVcXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGRvY3Mtc2l0ZVxcXFwudml0ZXByZXNzXFxcXHV0aWxzXFxcXGF1dG8tc2lkZWJhci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2RvY3Mtc2l0ZS8udml0ZXByZXNzL3V0aWxzL2F1dG8tc2lkZWJhci50c1wiOy8qKlxuICogXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU0RkE3XHU4RkI5XHU2ODBGXHU5MTREXHU3RjZFXG4gKiBcdTY4MzlcdTYzNkUgZnJvbnRtYXR0ZXIgXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU3NTFGXHU2MjEwIHNpZGViYXJcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbWF0dGVyIGZyb20gJ2dyYXktbWF0dGVyJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpO1xuY29uc3QgZG9jc1Jvb3QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vJyk7XG5cbmludGVyZmFjZSBTaWRlYmFySXRlbSB7XG4gIHRleHQ6IHN0cmluZztcbiAgbGluaz86IHN0cmluZztcbiAgb3JkZXI/OiBudW1iZXI7XG4gIGNvbGxhcHNlZD86IGJvb2xlYW47XG4gIGl0ZW1zPzogU2lkZWJhckl0ZW1bXTtcbn1cblxuaW50ZXJmYWNlIEZyb250bWF0dGVyRGF0YSB7XG4gIHRpdGxlPzogc3RyaW5nO1xuICBvcmRlcj86IG51bWJlcjtcbiAgc2lkZWJhcl9sYWJlbD86IHN0cmluZztcbiAgc2lkZWJhcl9vcmRlcj86IG51bWJlcjtcbiAgc2lkZWJhcl9ncm91cD86IHN0cmluZztcbiAgc2lkZWJhcl9jb2xsYXBzZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NUMwNlx1ODJGMVx1NjU4N1x1N0VDNFx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NEUyRFx1NjU4N1x1NjYzRVx1NzkzQVx1NTQwRFxuICovXG5mdW5jdGlvbiBnZXRHcm91cERpc3BsYXlOYW1lKGdyb3VwTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZ3JvdXBOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdndWlkZXMnOiAnXHU1RjAwXHU1M0QxXHU2MzA3XHU1MzU3JyxcbiAgICAnY29tcG9uZW50cyc6ICdcdTdFQzRcdTRFRjZcdTVGMDBcdTUzRDEnLFxuICAgICdmb3Jtcyc6ICdcdTg4NjhcdTUzNTVcdTU5MDRcdTc0MDYnLFxuICAgICdzeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU5MTREXHU3RjZFJyxcbiAgICAnaW50ZWdyYXRpb24nOiAnXHU5NkM2XHU2MjEwXHU5MEU4XHU3RjcyJyxcbiAgICAnYWRyJzogJ1x1NjdCNlx1Njc4NFx1NTFCM1x1N0I1NicsXG4gICAgJ3JmYyc6ICdcdTYyODBcdTY3MkZcdTYzRDBcdTY4NDgnLFxuICAgICdzb3AnOiAnXHU2ODA3XHU1MUM2XHU2NENEXHU0RjVDJyxcbiAgICAncGFja2FnZXMnOiAnXHU1MTcxXHU0RUFCXHU1MzA1JyxcbiAgICAnbGF5b3V0JzogJ1x1NUUwM1x1NUM0MFx1N0VDNFx1NEVGNicsXG4gICAgJ292ZXJ2aWV3JzogJ1x1OTg3OVx1NzZFRVx1Njk4Mlx1ODlDOCcsXG4gICAgJ2NoYW5nZWxvZyc6ICdcdTVGMDBcdTUzRDFcdTY1RTVcdTVGRDcnLFxuICAgICdndWlkZXMtYmFja2VuZCc6ICdcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTEnLFxuICAgIC8vIFBhY2thZ2VzIFx1NUI1MFx1NTIwNlx1N0VDNFxuICAgICdwYWNrYWdlcy1jb21wb25lbnRzJzogJ1x1N0VDNFx1NEVGNlx1NTMwNScsXG4gICAgJ3BhY2thZ2VzLXBsdWdpbnMnOiAnXHU2M0QyXHU0RUY2XHU1MzA1JyxcbiAgICAncGFja2FnZXMtdXRpbHMnOiAnXHU1REU1XHU1MTc3XHU1MzA1JyxcbiAgICAvLyBBRFIgXHU1QjUwXHU1MjA2XHU3RUM0XG4gICAgJ2Fkci1zeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU2N0I2XHU2Nzg0JyxcbiAgICAnYWRyLXRlY2huaWNhbCc6ICdcdTYyODBcdTY3MkZcdTVCOUVcdTczQjAnLFxuICAgICdhZHItcHJvamVjdCc6ICdcdTk4NzlcdTc2RUVcdTdCQTFcdTc0MDYnLFxuICAgIC8vIFNPUCBcdTVCNTBcdTUyMDZcdTdFQzRcbiAgICAnc29wLWRldmVsb3BtZW50JzogJ1x1NUYwMFx1NTNEMVx1NzNBRlx1NTg4MycsXG4gICAgJ3NvcC1jb21wb25lbnRzJzogJ1x1N0VDNFx1NEVGNlx1NUYwMFx1NTNEMScsXG4gICAgJ3NvcC1zeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU5MTREXHU3RjZFJyxcbiAgICAvLyBUZW1wbGF0ZXMgXHU1QjUwXHU1MjA2XHU3RUM0XG4gICAgJ3RlbXBsYXRlcyc6ICdcdTY1ODdcdTY4NjNcdTZBMjFcdTY3N0YnLFxuICB9O1xuXG4gIHJldHVybiBncm91cE5hbWVNYXBbZ3JvdXBOYW1lXSB8fCBncm91cE5hbWU7XG59XG5cbi8qKlxuICogXHU2MjZCXHU2M0NGXHU2NTg3XHU0RUY2XHU1OTM5XHU0RTBCXHU3Njg0XHU2MjQwXHU2NzA5IC5tZCBcdTY1ODdcdTRFRjZcbiAqL1xuZnVuY3Rpb24gc2Nhbk1hcmtkb3duRmlsZXMoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXIsIGVudHJ5Lm5hbWUpO1xuXG4gICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSAmJiAhZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykgJiYgIWVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnXycpKSB7XG4gICAgICAgIC8vIFx1OTAxMlx1NUY1Mlx1NjI2Qlx1NjNDRlx1NUI1MFx1NzZFRVx1NUY1NVxuICAgICAgICBmaWxlcy5wdXNoKC4uLnNjYW5NYXJrZG93bkZpbGVzKGZ1bGxQYXRoKSk7XG4gICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5tZCcpKSB7XG4gICAgICAgIGZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBzY2FuIGRpcmVjdG9yeSAke2Rpcn06YCwgZXJyb3IpO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVzO1xufVxuXG4vKipcbiAqIFx1NEVDRVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MCBmcm9udG1hdHRlclxuICovXG5mdW5jdGlvbiBwYXJzZUZyb250bWF0dGVyKGZpbGVQYXRoOiBzdHJpbmcpOiB7IGRhdGE6IEZyb250bWF0dGVyRGF0YTsgcmVsYXRpdmVQYXRoOiBzdHJpbmc7IGZpbGVOYW1lOiBzdHJpbmc7IGRpc3BsYXlQYXRoOiBzdHJpbmcgfSB8IG51bGwge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gbWF0dGVyKGNvbnRlbnQpO1xuXG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShkb2NzUm9vdCwgZmlsZVBhdGgpXG4gICAgICAucmVwbGFjZSgvXFxcXC9nLCAnLycpXG4gICAgICAucmVwbGFjZSgvXFwubWQkLywgJycpO1xuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCAnLm1kJyk7XG5cbiAgICAvLyBcdTc1MUZcdTYyMTBcdTY2M0VcdTc5M0FcdThERUZcdTVGODRcdUZGMUFcdTc5RkJcdTk2NjRcdTVCNTBcdTc2RUVcdTVGNTVcdTUyNERcdTdGMDBcdUZGMENcdTRGRERcdTYzMDFcdTdCODBcdTZEMDFcdTc2ODQgVVJMXG4gICAgLy8gXHU0RjhCXHU1OTgyXHVGRjFBaW50ZWdyYXRpb24vdml0ZXByZXNzLXNlYXJjaC1pbnRlZ3JhdGlvbiAtPiB2aXRlcHJlc3Mtc2VhcmNoLWludGVncmF0aW9uXG4gICAgY29uc3QgZGlzcGxheVBhdGggPSByZWxhdGl2ZVBhdGgucmVwbGFjZSgvXihpbnRlZ3JhdGlvbnxiYWNrZW5kfGRldmVsb3BtZW50KVxcLy8sICcnKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiBkYXRhIGFzIEZyb250bWF0dGVyRGF0YSxcbiAgICAgIHJlbGF0aXZlUGF0aCxcbiAgICAgIGZpbGVOYW1lLFxuICAgICAgZGlzcGxheVBhdGhcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGZyb250bWF0dGVyIGZvciAke2ZpbGVQYXRofTpgLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTc1MUZcdTYyMTBcdTRGQTdcdThGQjlcdTY4MEZcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2lkZWJhcigpOiBSZWNvcmQ8c3RyaW5nLCBTaWRlYmFySXRlbVtdPiB7XG4gIGNvbnN0IHNpZGViYXI6IFJlY29yZDxzdHJpbmcsIFNpZGViYXJJdGVtW10+ID0ge307XG5cbiAgLy8gXHU0RTNCXHU4OTgxXHU2NTg3XHU0RUY2XHU1OTM5XHU1MjE3XHU4ODY4XG4gIGNvbnN0IG1haW5Gb2xkZXJzID0gW1xuICAgICdndWlkZXMnLFxuICAgICdhZHInLFxuICAgICdyZmMnLFxuICAgICdzb3AnLFxuICAgICdwYWNrYWdlcycsXG4gICAgJ2NvbXBvbmVudHMnLFxuICBdO1xuXG4gIGZvciAoY29uc3QgZm9sZGVyIG9mIG1haW5Gb2xkZXJzKSB7XG4gICAgY29uc3QgZm9sZGVyUGF0aCA9IHBhdGguam9pbihkb2NzUm9vdCwgZm9sZGVyKTtcblxuICAgIGlmICghZnMuZXhpc3RzU3luYyhmb2xkZXJQYXRoKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU2NTg3XHU0RUY2XHU1OTM5XHU0RTBCXHU3Njg0XHU2MjQwXHU2NzA5IC5tZCBcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBtYXJrZG93bkZpbGVzID0gc2Nhbk1hcmtkb3duRmlsZXMoZm9sZGVyUGF0aCk7XG5cbiAgICBpZiAobWFya2Rvd25GaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFx1ODlFM1x1Njc5MFx1NjI0MFx1NjcwOVx1NjU4N1x1NEVGNlx1NzY4NCBmcm9udG1hdHRlclxuICAgIGNvbnN0IGZpbGVEYXRhID0gbWFya2Rvd25GaWxlc1xuICAgICAgLm1hcChmaWxlID0+IHBhcnNlRnJvbnRtYXR0ZXIoZmlsZSkpXG4gICAgICAuZmlsdGVyKChkYXRhKTogZGF0YSBpcyBOb25OdWxsYWJsZTx0eXBlb2YgZGF0YT4gPT4gZGF0YSAhPT0gbnVsbCk7XG5cbiAgICAvLyBcdTYzMDkgc2lkZWJhcl9ncm91cCBcdTUyMDZcdTdFQzRcbiAgICBjb25zdCBncm91cHM6IFJlY29yZDxzdHJpbmcsIFNpZGViYXJJdGVtW10+ID0ge307XG4gICAgY29uc3QgdW5ncm91cGVkOiBTaWRlYmFySXRlbVtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IHsgZGF0YSwgcmVsYXRpdmVQYXRoLCBmaWxlTmFtZSwgZGlzcGxheVBhdGggfSBvZiBmaWxlRGF0YSkge1xuICAgICAgLy8gXHU4REYzXHU4RkM3IGluZGV4Lm1kIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NEVFQ1x1OTAxQVx1NUUzOFx1NjYyRlx1Njk4Mlx1ODlDOFx1OTg3NVx1OTc2Mlx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NTcyOFx1NEZBN1x1OEZCOVx1NjgwRlx1NjYzRVx1NzkzQVxuICAgICAgaWYgKGZpbGVOYW1lID09PSAnaW5kZXgnICYmICFkYXRhLnNpZGViYXJfZ3JvdXApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGl0ZW06IFNpZGViYXJJdGVtID0ge1xuICAgICAgICB0ZXh0OiBkYXRhLnNpZGViYXJfbGFiZWwgfHwgZGF0YS50aXRsZSB8fCBmaWxlTmFtZSxcbiAgICAgICAgbGluazogYC8ke2Rpc3BsYXlQYXRofWAsIC8vIFx1NEY3Rlx1NzUyOCBkaXNwbGF5UGF0aCBcdTgwMENcdTRFMERcdTY2MkYgcmVsYXRpdmVQYXRoXHVGRjBDXHU3NTFGXHU2MjEwXHU3QjgwXHU2RDAxXHU3Njg0IFVSTFxuICAgICAgICBvcmRlcjogZGF0YS5zaWRlYmFyX29yZGVyIHx8IGRhdGEub3JkZXIgfHwgOTk5LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgZ3JvdXAgPSBkYXRhLnNpZGViYXJfZ3JvdXA7XG4gICAgICBpZiAoZ3JvdXApIHtcbiAgICAgICAgaWYgKCFncm91cHNbZ3JvdXBdKSB7XG4gICAgICAgICAgZ3JvdXBzW2dyb3VwXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVuZ3JvdXBlZC5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1Njc4NFx1NUVGQVx1NEZBN1x1OEZCOVx1NjgwRlx1N0VEM1x1Njc4NFxuICAgIGNvbnN0IHNpZGViYXJJdGVtczogU2lkZWJhckl0ZW1bXSA9IFtdO1xuXG4gICAgLy8gXHU1MTQ4XHU2REZCXHU1MkEwXHU2NzJBXHU1MjA2XHU3RUM0XHU3Njg0XHU5ODc5XHVGRjA4XHU5MDFBXHU1RTM4XHU2NjJGXHU2OTgyXHU4OUM4XHU3QzdCXHU2NTg3XHU2ODYzXHVGRjBDb3JkZXIgXHU2NzAwXHU1QzBGXHVGRjA5XG4gICAgaWYgKHVuZ3JvdXBlZC5sZW5ndGggPiAwKSB7XG4gICAgICB1bmdyb3VwZWQuc29ydCgoYSwgYikgPT4gKGEub3JkZXIgfHwgOTk5KSAtIChiLm9yZGVyIHx8IDk5OSkpO1xuICAgICAgc2lkZWJhckl0ZW1zLnB1c2goLi4udW5ncm91cGVkLm1hcCgoeyBvcmRlciwgLi4ucmVzdCB9KSA9PiByZXN0KSk7XG4gICAgfVxuXG4gICAgLy8gXHU1MThEXHU2REZCXHU1MkEwXHU1MjA2XHU3RUM0XG4gICAgZm9yIChjb25zdCBbZ3JvdXBOYW1lLCBpdGVtc10gb2YgT2JqZWN0LmVudHJpZXMoZ3JvdXBzKSkge1xuICAgICAgLy8gXHU2MzA5IG9yZGVyIFx1NjM5Mlx1NUU4RlxuICAgICAgaXRlbXMuc29ydCgoYSwgYikgPT4gKGEub3JkZXIgfHwgOTk5KSAtIChiLm9yZGVyIHx8IDk5OSkpO1xuXG4gICAgICAvLyBcdTYyN0VcdTUyMzBcdTdCMkNcdTRFMDBcdTRFMkFcdTY1ODdcdTRFRjZcdTc2ODQgc2lkZWJhcl9jb2xsYXBzZWQgXHU5MTREXHU3RjZFXHVGRjA4XHU0RjVDXHU0RTNBXHU3RUM0XHU3Njg0XHU5RUQ4XHU4QkE0XHU1MDNDXHVGRjA5XG4gICAgICBjb25zdCBmaXJzdEZpbGUgPSBmaWxlRGF0YS5maW5kKGYgPT4gZi5kYXRhLnNpZGViYXJfZ3JvdXAgPT09IGdyb3VwTmFtZSk7XG4gICAgICBjb25zdCBjb2xsYXBzZWQgPSBmaXJzdEZpbGU/LmRhdGEuc2lkZWJhcl9jb2xsYXBzZWQgPT09IHRydWU7IC8vIFx1OUVEOFx1OEJBNFx1NUM1NVx1NUYwMFx1RkYwQ1x1NTNFQVx1NjcwOVx1NjYwRVx1Nzg2RVx1OEJCRVx1N0Y2RVx1NEUzQXRydWVcdTY1RjZcdTYyNERcdTYyOThcdTUzRTBcblxuICAgICAgLy8gXHU1QzA2XHU4MkYxXHU2NTg3XHU3RUM0XHU1NDBEXHU4RjZDXHU2MzYyXHU0RTNBXHU0RTJEXHU2NTg3XG4gICAgICBjb25zdCBncm91cERpc3BsYXlOYW1lID0gZ2V0R3JvdXBEaXNwbGF5TmFtZShncm91cE5hbWUpO1xuXG4gICAgICBzaWRlYmFySXRlbXMucHVzaCh7XG4gICAgICAgIHRleHQ6IGdyb3VwRGlzcGxheU5hbWUsXG4gICAgICAgIGNvbGxhcHNlZCxcbiAgICAgICAgaXRlbXM6IGl0ZW1zLm1hcCgoeyBvcmRlciwgLi4ucmVzdCB9KSA9PiByZXN0KSwgLy8gXHU3OUZCXHU5NjY0IG9yZGVyIFx1NUI1N1x1NkJCNVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2lkZWJhcltgLyR7Zm9sZGVyfS9gXSA9IHNpZGViYXJJdGVtcztcbiAgfVxuXG4gIHJldHVybiBzaWRlYmFyO1xufVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZhLFNBQVMsb0JBQW9COzs7QUNRMWMsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBVGpCLElBQU0sbUNBQW1DO0FBb0JsQyxTQUFTLDBCQUFrQztBQUNoRCxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUE7QUFBQSxJQUdULGdCQUFnQixRQUFRO0FBQ3RCLGFBQU8sWUFBWSxJQUFJLDBCQUEwQixDQUFDLE1BQU0sUUFBUTtBQUU5RCxjQUFNLFdBQVcsdUJBQXVCO0FBQ3hDLFlBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELFlBQUksVUFBVSwrQkFBK0IsR0FBRztBQUNoRCxZQUFJLElBQUksS0FBSyxVQUFV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QTBCLGtCQUFrQjtBQUFBLElBQzNFO0FBQUE7QUFBQSxJQUdBLE9BQU87QUFBQSxNQUNMLHVCQUF1QjtBQUFBO0FBQUEsSUFDekI7QUFBQTtBQUFBLElBR0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBO0FBQUEsTUFDWixNQUFNO0FBQUE7QUFBQSxNQUNKLEtBQUs7QUFBQSxRQUNILE1BQU07QUFBQTtBQUFBLFFBQ04sTUFBTTtBQUFBO0FBQUEsTUFDUjtBQUFBLElBQ0o7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiZmlsZVVSTFRvUGF0aCIsICJmcyIsICJwYXRoIiwgIl9fZGlybmFtZSIsICJwYXRoIiwgImZzIiwgImluZGV4UGF0aCIsICJmcyIsICJwYXRoIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX19kaXJuYW1lIiwgInBhdGgiLCAiZG9jc1Jvb3QiLCAiZnMiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
