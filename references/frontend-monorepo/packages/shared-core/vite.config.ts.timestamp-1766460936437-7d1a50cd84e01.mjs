// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import dts from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@24.10.1_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\packages\\shared-core";
var vite_config_default = defineConfig({
  logLevel: "error",
  // 只显示错误，抑制警告
  resolve: {
    alias: {
      "@configs": resolve(__vite_injected_original_dirname, "../../configs"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "../shared-components/src")
    }
  },
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
      outDir: "dist",
      // 保留目录结构
      copyDtsFiles: false,
      // 不复制 .d.ts 文件，只从 .ts 文件生成
      // 生成类型声明文件后，插入类型引用路径
      insertTypesEntry: true,
      // 跳过类型检查，避免 rootDir 限制问题
      // @ts-ignore - skipDiagnostics 在较新版本的 vite-plugin-dts 中可用
      skipDiagnostics: true,
      // 静默模式，不显示诊断信息
      logLevel: "silent",
      // 使用单独的 tsconfig 文件
      tsconfigPath: "./tsconfig.build.json",
      // 禁用 rollupTypes，避免 API Extractor 错误
      rollupTypes: false,
      // 生成统一的类型声明文件到 dist 根目录
      bundledPackages: []
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "BTCSharedCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`
    },
    rollupOptions: {
      external: [
        "vue",
        "axios",
        "vue-i18n",
        "@btc/shared-utils",
        /^@btc\/shared-utils\/.*/,
        "pinia",
        "@vueuse/core",
        "@configs/layout-bridge",
        /^@configs\/.*/,
        "@btc/shared-components",
        /^@btc\/shared-components\/.*/
      ],
      output: {
        globals: {
          vue: "Vue",
          axios: "axios",
          "vue-i18n": "VueI18n",
          pinia: "Pinia",
          "@vueuse/core": "VueUse"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGxvZ0xldmVsOiAnZXJyb3InLCAvLyBcdTUzRUFcdTY2M0VcdTc5M0FcdTk1MTlcdThCRUZcdUZGMENcdTYyOTFcdTUyMzZcdThCNjZcdTU0NEFcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQGNvbmZpZ3MnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2NvbmZpZ3MnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgZHRzKHtcbiAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoudHMnXSxcbiAgICAgIGV4Y2x1ZGU6IFsnc3JjLyoqLyouZC50cycsICdub2RlX21vZHVsZXMnLCAnZGlzdCcsICcqKi8qLnRlc3QudHMnLCAnKiovKi5zcGVjLnRzJ10sXG4gICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgIC8vIFx1NEZERFx1NzU1OVx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFxuICAgICAgY29weUR0c0ZpbGVzOiBmYWxzZSwgLy8gXHU0RTBEXHU1OTBEXHU1MjM2IC5kLnRzIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NTNFQVx1NEVDRSAudHMgXHU2NTg3XHU0RUY2XHU3NTFGXHU2MjEwXG4gICAgICAvLyBcdTc1MUZcdTYyMTBcdTdDN0JcdTU3OEJcdTU4RjBcdTY2MEVcdTY1ODdcdTRFRjZcdTU0MEVcdUZGMENcdTYzRDJcdTUxNjVcdTdDN0JcdTU3OEJcdTVGMTVcdTc1MjhcdThERUZcdTVGODRcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgICAvLyBcdThERjNcdThGQzdcdTdDN0JcdTU3OEJcdTY4QzBcdTY3RTVcdUZGMENcdTkwN0ZcdTUxNEQgcm9vdERpciBcdTk2NTBcdTUyMzZcdTk1RUVcdTk4OThcbiAgICAgIC8vIEB0cy1pZ25vcmUgLSBza2lwRGlhZ25vc3RpY3MgXHU1NzI4XHU4RjgzXHU2NUIwXHU3MjQ4XHU2NzJDXHU3Njg0IHZpdGUtcGx1Z2luLWR0cyBcdTRFMkRcdTUzRUZcdTc1MjhcbiAgICAgIHNraXBEaWFnbm9zdGljczogdHJ1ZSxcbiAgICAgIC8vIFx1OTc1OVx1OUVEOFx1NkEyMVx1NUYwRlx1RkYwQ1x1NEUwRFx1NjYzRVx1NzkzQVx1OEJDQVx1NjVBRFx1NEZFMVx1NjA2RlxuICAgICAgbG9nTGV2ZWw6ICdzaWxlbnQnLFxuICAgICAgLy8gXHU0RjdGXHU3NTI4XHU1MzU1XHU3MkVDXHU3Njg0IHRzY29uZmlnIFx1NjU4N1x1NEVGNlxuICAgICAgdHNjb25maWdQYXRoOiAnLi90c2NvbmZpZy5idWlsZC5qc29uJyxcbiAgICAgIC8vIFx1Nzk4MVx1NzUyOCByb2xsdXBUeXBlc1x1RkYwQ1x1OTA3Rlx1NTE0RCBBUEkgRXh0cmFjdG9yIFx1OTUxOVx1OEJFRlxuICAgICAgcm9sbHVwVHlwZXM6IGZhbHNlLFxuICAgICAgLy8gXHU3NTFGXHU2MjEwXHU3RURGXHU0RTAwXHU3Njg0XHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHU1MjMwIGRpc3QgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICBidW5kbGVkUGFja2FnZXM6IFtdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXG4gICAgICBuYW1lOiAnQlRDU2hhcmVkQ29yZScsXG4gICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdCA9PT0gJ2VzJyA/ICdtanMnIDogJ2pzJ31gLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgJ3Z1ZScsXG4gICAgICAgICdheGlvcycsXG4gICAgICAgICd2dWUtaTE4bicsXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscycsXG4gICAgICAgIC9eQGJ0Y1xcL3NoYXJlZC11dGlsc1xcLy4qLyxcbiAgICAgICAgJ3BpbmlhJyxcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAgICdAY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgICAgL15AY29uZmlnc1xcLy4qLyxcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgICAvXkBidGNcXC9zaGFyZWQtY29tcG9uZW50c1xcLy4qLyxcbiAgICAgIF0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHZ1ZTogJ1Z1ZScsXG4gICAgICAgICAgYXhpb3M6ICdheGlvcycsXG4gICAgICAgICAgJ3Z1ZS1pMThuJzogJ1Z1ZUkxOG4nLFxuICAgICAgICAgIHBpbmlhOiAnUGluaWEnLFxuICAgICAgICAgICdAdnVldXNlL2NvcmUnOiAnVnVlVXNlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzYSxTQUFTLG9CQUFvQjtBQUNuYyxTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBRmhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFVBQVU7QUFBQTtBQUFBLEVBQ1YsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsWUFBWSxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUM5QywwQkFBMEIsUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxJQUN6RTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLFNBQVMsQ0FBQyxhQUFhO0FBQUEsTUFDdkIsU0FBUyxDQUFDLGlCQUFpQixnQkFBZ0IsUUFBUSxnQkFBZ0IsY0FBYztBQUFBLE1BQ2pGLFFBQVE7QUFBQTtBQUFBLE1BRVIsY0FBYztBQUFBO0FBQUE7QUFBQSxNQUVkLGtCQUFrQjtBQUFBO0FBQUE7QUFBQSxNQUdsQixpQkFBaUI7QUFBQTtBQUFBLE1BRWpCLFVBQVU7QUFBQTtBQUFBLE1BRVYsY0FBYztBQUFBO0FBQUEsTUFFZCxhQUFhO0FBQUE7QUFBQSxNQUViLGlCQUFpQixDQUFDO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDeEMsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUFXLFNBQVMsV0FBVyxPQUFPLFFBQVEsSUFBSTtBQUFBLElBQy9EO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxLQUFLO0FBQUEsVUFDTCxPQUFPO0FBQUEsVUFDUCxZQUFZO0FBQUEsVUFDWixPQUFPO0FBQUEsVUFDUCxnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
