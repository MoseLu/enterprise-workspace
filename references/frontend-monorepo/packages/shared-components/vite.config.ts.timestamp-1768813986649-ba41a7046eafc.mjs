// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import dts from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@24.10.1_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\packages\\shared-components";
function buildLogPlugin() {
  return {
    name: "build-log",
    buildStart() {
      console.log("\n\u{1F4E6} \u5F00\u59CB\u6784\u5EFA @btc/shared-components...");
      console.log("   - \u8F93\u5165\u6587\u4EF6: src/index.ts");
      console.log("   - \u8F93\u51FA\u683C\u5F0F: ESM + CJS");
      console.log("   - \u7C7B\u578B\u58F0\u660E: dist/*.d.ts\n");
    },
    buildEnd(error) {
      if (error) {
        console.error("\n\u274C @btc/shared-components \u6784\u5EFA\u5931\u8D25\uFF01");
        console.error("   \u9519\u8BEF:", error.message);
      } else {
        console.log("\n\u2705 @btc/shared-components \u6784\u5EFA\u6210\u529F\uFF01");
        console.log("   - \u8F93\u51FA\u6587\u4EF6: dist/index.mjs (ESM)");
        console.log("   - \u8F93\u51FA\u6587\u4EF6: dist/index.js (CJS)");
        console.log("   - \u6837\u5F0F\u6587\u4EF6: dist/style.css");
        console.log("   - \u7C7B\u578B\u58F0\u660E: dist/*.d.ts\n");
      }
    }
  };
}
function copyDarkThemePlugin() {
  return {
    name: "copy-dark-theme",
    writeBundle() {
      const srcFile = resolve(__vite_injected_original_dirname, "src/styles/dark-theme.css");
      const distDir = resolve(__vite_injected_original_dirname, "dist/styles");
      const distFile = resolve(distDir, "dark-theme.css");
      try {
        mkdirSync(distDir, { recursive: true });
        copyFileSync(srcFile, distFile);
        console.log("[copy-dark-theme] \u2713 \u5DF2\u590D\u5236 dark-theme.css \u5230 dist/styles/");
      } catch (error) {
        console.error("[copy-dark-theme] \u2717 \u590D\u5236\u5931\u8D25:", error);
      }
    }
  };
}
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@btc-common": resolve(__vite_injected_original_dirname, "src/common"),
      "@btc-components": resolve(__vite_injected_original_dirname, "src/components"),
      "@btc-crud": resolve(__vite_injected_original_dirname, "src/crud"),
      "@btc-styles": resolve(__vite_injected_original_dirname, "src/styles"),
      "@btc-locales": resolve(__vite_injected_original_dirname, "src/locales"),
      "@assets": resolve(__vite_injected_original_dirname, "src/assets"),
      "@btc-assets": resolve(__vite_injected_original_dirname, "src/assets"),
      // 添加 @btc-assets 别名，用于图片资源导入
      "@plugins": resolve(__vite_injected_original_dirname, "src/plugins"),
      "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "src"),
      // 添加 @configs 别名，指向 shared-core 的 configs 目录（用于开发环境）
      // 在构建时，这些模块会被标记为 external，不会被打包
      "@configs": resolve(__vite_injected_original_dirname, "../shared-core/src/configs"),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      "@charts-utils/css-var": resolve(__vite_injected_original_dirname, "src/charts/utils/css-var"),
      "@charts-utils/color": resolve(__vite_injected_original_dirname, "src/charts/utils/color"),
      "@charts-utils/gradient": resolve(__vite_injected_original_dirname, "src/charts/utils/gradient"),
      "@charts-composables/useChartComponent": resolve(__vite_injected_original_dirname, "src/charts/composables/useChartComponent"),
      "@charts": resolve(__vite_injected_original_dirname, "src/charts"),
      "@charts-types": resolve(__vite_injected_original_dirname, "src/charts/types"),
      "@charts-utils": resolve(__vite_injected_original_dirname, "src/charts/utils"),
      "@charts-composables": resolve(__vite_injected_original_dirname, "src/charts/composables"),
      "@btc/shared-core/utils": resolve(__vite_injected_original_dirname, "../shared-core/src/utils"),
      "@btc/shared-core/utils/form": resolve(__vite_injected_original_dirname, "../shared-core/src/utils/form"),
      "@btc/shared-core/utils/format": resolve(__vite_injected_original_dirname, "../shared-core/src/utils/format"),
      "@btc/i18n": resolve(__vite_injected_original_dirname, "src/i18n")
    },
    // 关键：确保 Vite 能够正确解析 .tsx 和 .jsx 文件
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    // 确保只有一个 Vue 实例和插件实例，避免依赖解析问题和循环引用
    dedupe: ["vue", "@vitejs/plugin-vue"],
    // 关键：添加 'development' 条件，确保在开发环境中使用源码
    // 这样在构建时，如果 NODE_ENV=development，会使用源码路径而不是构建产物路径
    conditions: ["development", "import", "module", "browser", "default"]
  },
  plugins: [
    buildLogPlugin(),
    // 添加构建日志插件
    vue(),
    vueJsx(),
    copyDarkThemePlugin(),
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
      exclude: ["src/**/*.d.ts", "node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
      outDir: resolve(__vite_injected_original_dirname, "dist"),
      root: __vite_injected_original_dirname,
      copyDtsFiles: false,
      // 不复制 .d.ts 文件，只从 .ts 文件生成
      insertTypesEntry: true,
      skipDiagnostics: true,
      logLevel: "silent",
      tsconfigPath: resolve(__vite_injected_original_dirname, "tsconfig.build.json"),
      rollupTypes: false
      // 禁用 rollupTypes，保留目录结构
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    }
  },
  // 关键：确保 esbuild 正确处理 JSX，使用 Vue 的 h 函数而不是 React.createElement
  // 这样即使 esbuild 处理某些 JSX 文件，也会使用正确的转换方式
  esbuild: {
    jsx: "preserve",
    // 保留 JSX，让 vueJsx 插件处理
    jsxFactory: "h",
    // 使用 Vue 的 h 函数作为 JSX 工厂函数
    jsxFragment: "Fragment"
    // 使用 Vue 的 Fragment
  },
  logLevel: "error",
  // 鍙樉绀洪敊璇紝鎶戝埗璀﹀憡
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "BTCSharedComponents",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.message?.includes("Generated an empty chunk")) {
          return;
        }
        if (warning.message?.includes("named and default exports together")) {
          return;
        }
        warn(warning);
      },
      external: ["vue", "vue-router", "pinia", "element-plus", "@element-plus/icons-vue", "@btc/shared-core", /^@btc\/shared-core\/.*/, "@btc/i18n", /^@btc\/i18n\/.*/, "@octokit/rest", "@btc/subapp-manifests", "@btc/shared-core/configs/unified-env-config", "@btc/shared-core/configs/app-scanner", "@btc/shared-core/configs/layout-bridge", "zod"],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          "pinia": "Pinia",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          "@btc/shared-core": "BTCSharedCore",
          "@btc/subapp-manifests": "BTCSubappManifests"
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "style.css";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    },
    cssCodeSplit: false
    // 灏嗘墍鏈?CSS 鍚堝苟鍒颁竴涓枃浠朵腑
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb21wb25lbnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb21wb25lbnRzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGNvcHlGaWxlU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuLy8gXHU2Nzg0XHU1RUZBXHU2NUU1XHU1RkQ3XHU2M0QyXHU0RUY2XG5mdW5jdGlvbiBidWlsZExvZ1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdidWlsZC1sb2cnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmxvZygnXFxuXHVEODNEXHVEQ0U2IFx1NUYwMFx1NTlDQlx1Njc4NFx1NUVGQSBAYnRjL3NoYXJlZC1jb21wb25lbnRzLi4uJyk7XG4gICAgICBjb25zb2xlLmxvZygnICAgLSBcdThGOTNcdTUxNjVcdTY1ODdcdTRFRjY6IHNyYy9pbmRleC50cycpO1xuICAgICAgY29uc29sZS5sb2coJyAgIC0gXHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGOiBFU00gKyBDSlMnKTtcbiAgICAgIGNvbnNvbGUubG9nKCcgICAtIFx1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRTogZGlzdC8qLmQudHNcXG4nKTtcbiAgICB9LFxuICAgIGJ1aWxkRW5kKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignXFxuXHUyNzRDIEBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XHVGRjAxJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgIFx1OTUxOVx1OEJFRjonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5cdTI3MDUgQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyBcdTY3ODRcdTVFRkFcdTYyMTBcdTUyOUZcdUZGMDEnKTtcbiAgICAgICAgY29uc29sZS5sb2coJyAgIC0gXHU4RjkzXHU1MUZBXHU2NTg3XHU0RUY2OiBkaXN0L2luZGV4Lm1qcyAoRVNNKScpO1xuICAgICAgICBjb25zb2xlLmxvZygnICAgLSBcdThGOTNcdTUxRkFcdTY1ODdcdTRFRjY6IGRpc3QvaW5kZXguanMgKENKUyknKTtcbiAgICAgICAgY29uc29sZS5sb2coJyAgIC0gXHU2ODM3XHU1RjBGXHU2NTg3XHU0RUY2OiBkaXN0L3N0eWxlLmNzcycpO1xuICAgICAgICBjb25zb2xlLmxvZygnICAgLSBcdTdDN0JcdTU3OEJcdTU4RjBcdTY2MEU6IGRpc3QvKi5kLnRzXFxuJyk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuLy8gXHU1OTBEXHU1MjM2IGRhcmstdGhlbWUuY3NzIFx1NTIzMCBkaXN0IFx1NzZFRVx1NUY1NVx1NzY4NFx1NjNEMlx1NEVGNlxuZnVuY3Rpb24gY29weURhcmtUaGVtZVBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3B5LWRhcmstdGhlbWUnLFxuICAgIHdyaXRlQnVuZGxlKCkge1xuICAgICAgY29uc3Qgc3JjRmlsZSA9IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3N0eWxlcy9kYXJrLXRoZW1lLmNzcycpO1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdC9zdHlsZXMnKTtcbiAgICAgIGNvbnN0IGRpc3RGaWxlID0gcmVzb2x2ZShkaXN0RGlyLCAnZGFyay10aGVtZS5jc3MnKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbWtkaXJTeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBjb3B5RmlsZVN5bmMoc3JjRmlsZSwgZGlzdEZpbGUpO1xuICAgICAgICBjb25zb2xlLmxvZygnW2NvcHktZGFyay10aGVtZV0gXHUyNzEzIFx1NURGMlx1NTkwRFx1NTIzNiBkYXJrLXRoZW1lLmNzcyBcdTUyMzAgZGlzdC9zdHlsZXMvJyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbY29weS1kYXJrLXRoZW1lXSBcdTI3MTcgXHU1OTBEXHU1MjM2XHU1OTMxXHU4RDI1OicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQGJ0Yy1jb21tb24nOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21tb24nKSxcbiAgICAgICdAYnRjLWNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGJ0Yy1jcnVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY3J1ZCcpLFxuICAgICAgJ0BidGMtc3R5bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc3R5bGVzJyksXG4gICAgICAnQGJ0Yy1sb2NhbGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvbG9jYWxlcycpLFxuICAgICAgJ0Bhc3NldHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9hc3NldHMnKSxcbiAgICAgICdAYnRjLWFzc2V0cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2Fzc2V0cycpLCAvLyBcdTZERkJcdTUyQTAgQGJ0Yy1hc3NldHMgXHU1MjJCXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1QkZDXHU1MTY1XG4gICAgICAnQHBsdWdpbnMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9wbHVnaW5zJyksXG4gICAgICAnQHV0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdXRpbHMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcbiAgICAgIC8vIFx1NkRGQlx1NTJBMCBAY29uZmlncyBcdTUyMkJcdTU0MERcdUZGMENcdTYzMDdcdTU0MTEgc2hhcmVkLWNvcmUgXHU3Njg0IGNvbmZpZ3MgXHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHVGRjA5XG4gICAgICAvLyBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdThGRDlcdTRFOUJcdTZBMjFcdTU3NTdcdTRGMUFcdTg4QUJcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMENcdTRFMERcdTRGMUFcdTg4QUJcdTYyNTNcdTUzMDVcbiAgICAgICdAY29uZmlncyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MnKSxcbiAgICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NTE3N1x1NEY1M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwQ1x1NTNCQlx1NjM4OSAudHMgXHU2MjY5XHU1QzU1XHU1NDBEXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjA5XG4gICAgICAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXInKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgICAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCcpLFxuICAgICAgJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnKSxcbiAgICAgICdAY2hhcnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzJyksXG4gICAgICAnQGNoYXJ0cy10eXBlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NoYXJ0cy90eXBlcycpLFxuICAgICAgJ0BjaGFydHMtdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jaGFydHMvdXRpbHMnKSxcbiAgICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS91dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vc2hhcmVkLWNvcmUvc3JjL3V0aWxzJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS91dGlscy9mb3JtJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zaGFyZWQtY29yZS9zcmMvdXRpbHMvZm9ybScpLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvdXRpbHMvZm9ybWF0JzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zaGFyZWQtY29yZS9zcmMvdXRpbHMvZm9ybWF0JyksXG4gICAgICAnQGJ0Yy9pMThuJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaTE4bicpLFxuICAgIH0sXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIFZpdGUgXHU4MEZEXHU1OTFGXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwIC50c3ggXHU1NDhDIC5qc3ggXHU2NTg3XHU0RUY2XG4gICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcubXRzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLnZ1ZSddLFxuICAgIC8vIFx1Nzg2RVx1NEZERFx1NTNFQVx1NjcwOVx1NEUwMFx1NEUyQSBWdWUgXHU1QjlFXHU0RjhCXHU1NDhDXHU2M0QyXHU0RUY2XHU1QjlFXHU0RjhCXHVGRjBDXHU5MDdGXHU1MTREXHU0RjlEXHU4RDU2XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XHU1NDhDXHU1RkFBXHU3M0FGXHU1RjE1XHU3NTI4XG4gICAgZGVkdXBlOiBbJ3Z1ZScsICdAdml0ZWpzL3BsdWdpbi12dWUnXSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZERkJcdTUyQTAgJ2RldmVsb3BtZW50JyBcdTY3NjFcdTRFRjZcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdTRGN0ZcdTc1MjhcdTZFOTBcdTc4MDFcbiAgICAvLyBcdThGRDlcdTY4MzdcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTU5ODJcdTY3OUMgTk9ERV9FTlY9ZGV2ZWxvcG1lbnRcdUZGMENcdTRGMUFcdTRGN0ZcdTc1MjhcdTZFOTBcdTc4MDFcdThERUZcdTVGODRcdTgwMENcdTRFMERcdTY2MkZcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdThERUZcdTVGODRcbiAgICBjb25kaXRpb25zOiBbJ2RldmVsb3BtZW50JywgJ2ltcG9ydCcsICdtb2R1bGUnLCAnYnJvd3NlcicsICdkZWZhdWx0J10sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBidWlsZExvZ1BsdWdpbigpLCAvLyBcdTZERkJcdTUyQTBcdTY3ODRcdTVFRkFcdTY1RTVcdTVGRDdcdTYzRDJcdTRFRjZcbiAgICB2dWUoKSxcbiAgICB2dWVKc3goKSxcbiAgICBjb3B5RGFya1RoZW1lUGx1Z2luKCksXG4gICAgZHRzKHtcbiAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoudHMnLCAnc3JjLyoqLyoudHN4JywgJ3NyYy8qKi8qLnZ1ZSddLFxuICAgICAgZXhjbHVkZTogWydzcmMvKiovKi5kLnRzJywgJ25vZGVfbW9kdWxlcycsICdkaXN0JywgJyoqLyoudGVzdC50cycsICcqKi8qLnNwZWMudHMnXSxcbiAgICAgIG91dERpcjogcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0JyksXG4gICAgICByb290OiBfX2Rpcm5hbWUsXG4gICAgICBjb3B5RHRzRmlsZXM6IGZhbHNlLCAvLyBcdTRFMERcdTU5MERcdTUyMzYgLmQudHMgXHU2NTg3XHU0RUY2XHVGRjBDXHU1M0VBXHU0RUNFIC50cyBcdTY1ODdcdTRFRjZcdTc1MUZcdTYyMTBcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgICBza2lwRGlhZ25vc3RpY3M6IHRydWUsXG4gICAgICBsb2dMZXZlbDogJ3NpbGVudCcsXG4gICAgICB0c2NvbmZpZ1BhdGg6IHJlc29sdmUoX19kaXJuYW1lLCAndHNjb25maWcuYnVpbGQuanNvbicpLFxuICAgICAgcm9sbHVwVHlwZXM6IGZhbHNlLCAvLyBcdTc5ODFcdTc1Mjggcm9sbHVwVHlwZXNcdUZGMENcdTRGRERcdTc1NTlcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODRcbiAgICB9KSxcbiAgXSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknLCAnaW1wb3J0J11cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCBlc2J1aWxkIFx1NkI2M1x1Nzg2RVx1NTkwNFx1NzQwNiBKU1hcdUZGMENcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1ODAwQ1x1NEUwRFx1NjYyRiBSZWFjdC5jcmVhdGVFbGVtZW50XG4gIC8vIFx1OEZEOVx1NjgzN1x1NTM3M1x1NEY3RiBlc2J1aWxkIFx1NTkwNFx1NzQwNlx1NjdEMFx1NEU5QiBKU1ggXHU2NTg3XHU0RUY2XHVGRjBDXHU0RTVGXHU0RjFBXHU0RjdGXHU3NTI4XHU2QjYzXHU3ODZFXHU3Njg0XHU4RjZDXHU2MzYyXHU2NUI5XHU1RjBGXG4gIGVzYnVpbGQ6IHtcbiAgICBqc3g6ICdwcmVzZXJ2ZScsIC8vIFx1NEZERFx1NzU1OSBKU1hcdUZGMENcdThCQTkgdnVlSnN4IFx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgIGpzeEZyYWdtZW50OiAnRnJhZ21lbnQnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBGcmFnbWVudFxuICB9LFxuICBsb2dMZXZlbDogJ2Vycm9yJywgLy8gXHU5MzU5XHVFMDQ1XHU2QTA5XHU3RUMwXHU2RDJBXHU2NTRBXHU3NDg3XHVFMjI0XHU3RDFEXHU5M0I2XHU2MjFEXHU1N0Q3XHU3NDgwXHVGRTQwXHU2MUExXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgIG5hbWU6ICdCVENTaGFyZWRDb21wb25lbnRzJyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGluZGV4LiR7Zm9ybWF0ID09PSAnZXMnID8gJ21qcycgOiAnanMnfWAsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvbndhcm4od2FybmluZywgd2Fybikge1xuICAgICAgICAvLyBcdTYyOTFcdTUyMzZcdTdBN0EgY2h1bmsgXHU4QjY2XHU1NDRBXG4gICAgICAgIGlmICh3YXJuaW5nLm1lc3NhZ2U/LmluY2x1ZGVzKCdHZW5lcmF0ZWQgYW4gZW1wdHkgY2h1bmsnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTYyOTFcdTUyMzYgbmFtZWQgXHU1NDhDIGRlZmF1bHQgZXhwb3J0cyBcdTRFMDBcdThENzdcdTRGN0ZcdTc1MjhcdTc2ODRcdThCNjZcdTU0NEFcbiAgICAgICAgaWYgKHdhcm5pbmcubWVzc2FnZT8uaW5jbHVkZXMoJ25hbWVkIGFuZCBkZWZhdWx0IGV4cG9ydHMgdG9nZXRoZXInKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdThCNjZcdTU0NEFcdTZCNjNcdTVFMzhcdTY2M0VcdTc5M0FcbiAgICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICAgIH0sXG4gICAgICBleHRlcm5hbDogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdlbGVtZW50LXBsdXMnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLCAnQGJ0Yy9zaGFyZWQtY29yZScsIC9eQGJ0Y1xcL3NoYXJlZC1jb3JlXFwvLiovLCAnQGJ0Yy9pMThuJywgL15AYnRjXFwvaTE4blxcLy4qLywgJ0BvY3Rva2l0L3Jlc3QnLCAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJywgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy91bmlmaWVkLWVudi1jb25maWcnLCAnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2FwcC1zY2FubmVyJywgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJywgJ3pvZCddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICB2dWU6ICdWdWUnLFxuICAgICAgICAgICd2dWUtcm91dGVyJzogJ1Z1ZVJvdXRlcicsXG4gICAgICAgICAgJ3BpbmlhJzogJ1BpbmlhJyxcbiAgICAgICAgICAnZWxlbWVudC1wbHVzJzogJ0VsZW1lbnRQbHVzJyxcbiAgICAgICAgICAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnOiAnRWxlbWVudFBsdXNJY29uc1Z1ZScsXG4gICAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiAnQlRDU2hhcmVkQ29yZScsXG4gICAgICAgICAgJ0BidGMvc3ViYXBwLW1hbmlmZXN0cyc6ICdCVENTdWJhcHBNYW5pZmVzdHMnLFxuICAgICAgICB9LFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogeyBuYW1lPzogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09ICdzdHlsZS5jc3MnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3N0eWxlLmNzcyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsIC8vIFx1NzA0Rlx1NTVEOFx1NTg4RFx1OTNDOD9DU1MgXHU5MzVBXHU1ODFEXHU4MkRGXHU5MzUyXHU5ODgxXHU3QUY0XHU2RDkzXHVFMDQ1XHU2NzgzXHU2RDYwXHU2NzM1XHU4MTUxXG4gIH0sXG59KTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3YixTQUFTLG9CQUFvQjtBQUNyZCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sU0FBUztBQUVoQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxjQUFjLGlCQUFpQjtBQU54QyxJQUFNLG1DQUFtQztBQVV6QyxTQUFTLGlCQUF5QjtBQUNoQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQ1gsY0FBUSxJQUFJLGdFQUFxQztBQUNqRCxjQUFRLElBQUksNkNBQXlCO0FBQ3JDLGNBQVEsSUFBSSwwQ0FBc0I7QUFDbEMsY0FBUSxJQUFJLDhDQUEwQjtBQUFBLElBQ3hDO0FBQUEsSUFDQSxTQUFTLE9BQU87QUFDZCxVQUFJLE9BQU87QUFDVCxnQkFBUSxNQUFNLGdFQUFrQztBQUNoRCxnQkFBUSxNQUFNLG9CQUFVLE1BQU0sT0FBTztBQUFBLE1BQ3ZDLE9BQU87QUFDTCxnQkFBUSxJQUFJLGdFQUFrQztBQUM5QyxnQkFBUSxJQUFJLHFEQUFpQztBQUM3QyxnQkFBUSxJQUFJLG9EQUFnQztBQUM1QyxnQkFBUSxJQUFJLCtDQUEyQjtBQUN2QyxnQkFBUSxJQUFJLDhDQUEwQjtBQUFBLE1BQ3hDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLFNBQVMsc0JBQThCO0FBQ3JDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFDWixZQUFNLFVBQVUsUUFBUSxrQ0FBVywyQkFBMkI7QUFDOUQsWUFBTSxVQUFVLFFBQVEsa0NBQVcsYUFBYTtBQUNoRCxZQUFNLFdBQVcsUUFBUSxTQUFTLGdCQUFnQjtBQUVsRCxVQUFJO0FBQ0Ysa0JBQVUsU0FB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
