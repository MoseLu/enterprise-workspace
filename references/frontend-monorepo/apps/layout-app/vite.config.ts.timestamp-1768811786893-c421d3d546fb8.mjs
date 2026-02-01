// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath5 } from "node:url";

// ../../configs/vite/factories/layout.config.ts
import { resolve as resolve9 } from "path";
import { existsSync as existsSync5, readFileSync as readFileSync2, rmSync as rmSync2, writeFileSync as writeFileSync3 } from "node:fs";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir) {
  const withSrc = (relativePath) => resolve(appDir, relativePath);
  const withPackages = (relativePath) => resolve(appDir, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir, "../../configs", relativePath);
  return { withSrc, withPackages, withRoot, withConfigs };
}

// ../../configs/vite/factories/layout.config.ts
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

// ../../configs/auto-import.config.ts
import AutoImport from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-auto-import@20.3.0/node_modules/unplugin-auto-import/dist/vite.mjs";
import Components from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.2.0_vue@3.5.26/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.2.0_vue@3.5.26/node_modules/unplugin-vue-components/dist/resolvers.js";
function createAutoImportConfig() {
  return AutoImport({
    imports: [
      "vue",
      "vue-router",
      "pinia",
      {
        "@btc/shared-core": [
          "useCrud",
          "useDict",
          "usePermission",
          "useRequest",
          "createI18nPlugin",
          "useI18n"
        ],
        "@btc/shared-utils": [
          "formatDate",
          "formatDateTime",
          "formatMoney",
          "formatNumber",
          "isEmail",
          "isPhone",
          "storage"
        ]
      }
    ],
    resolvers: [
      ElementPlusResolver({
        importStyle: false
        // 禁用按需样式导入
      })
    ],
    dts: "src/auto-imports.d.ts",
    eslintrc: {
      enabled: true,
      filepath: "./.eslintrc-auto-import.json"
    },
    vueTemplate: true
  });
}
function createComponentsConfig(options = {}) {
  const { extraDirs = [], includeShared = true } = options;
  const dirs = [
    "src/components",
    // 应用级组件
    ...extraDirs
    // 额外的域级组件目录
  ];
  if (includeShared) {
    dirs.push(
      "../../packages/shared-components/src/components/basic",
      "../../packages/shared-components/src/components/layout",
      "../../packages/shared-components/src/components/navigation",
      "../../packages/shared-components/src/components/form",
      "../../packages/shared-components/src/components/data",
      "../../packages/shared-components/src/components/feedback",
      "../../packages/shared-components/src/components/others"
    );
  }
  return Components({
    resolvers: [
      ElementPlusResolver({
        importStyle: false
        // 禁用按需样式导入，避免 Vite reloading
      }),
      // 自定义解析器：@btc/shared-components
      (componentName) => {
        const convertToPascalCase = (name) => {
          if (name.startsWith("Btc")) {
            return name;
          }
          if (name.startsWith("btc-")) {
            return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
          }
          return name;
        };
        if (componentName.startsWith("Btc") || componentName.startsWith("btc-")) {
          const pascalName = convertToPascalCase(componentName);
          return {
            name: pascalName,
            from: "@btc/shared-components"
          };
        }
      }
    ],
    dts: "src/components.d.ts",
    dirs,
    extensions: ["vue", "tsx"],
    // 支持 .vue 和 .tsx 文件
    // 强制重新扫描组件
    deep: true,
    // 包含所有 Btc 开头的组件
    include: [/\.vue$/, /\.tsx$/, /Btc[A-Z]/, /btc-[a-z]/]
  });
}

// ../../configs/vite/factories/layout.config.ts
import { btc } from "@btc/vite-plugin";

// ../../configs/vite-app-config.ts
import { resolve as resolve2 } from "path";

// ../../packages/shared-core/src/configs/app-env.config.ts
var MAIN_APP_CONFIG = {
  appName: "main-app",
  devHost: "10.80.8.199",
  devPort: "8080",
  preHost: "localhost",
  prePort: "4180",
  testHost: "test.bellis.com.cn",
  prodHost: "bellis.com.cn"
};
var BUSINESS_APP_CONFIGS = [
  {
    appName: "admin-app",
    devHost: "10.80.8.199",
    devPort: "8081",
    preHost: "localhost",
    prePort: "4181",
    testHost: "admin.test.bellis.com.cn",
    prodHost: "admin.bellis.com.cn"
  },
  {
    appName: "dashboard-app",
    devHost: "10.80.8.199",
    devPort: "8082",
    preHost: "localhost",
    prePort: "4182",
    testHost: "dashboard.test.bellis.com.cn",
    prodHost: "dashboard.bellis.com.cn"
  },
  {
    appName: "engineering-app",
    devHost: "10.80.8.199",
    devPort: "8083",
    preHost: "localhost",
    prePort: "4183",
    testHost: "engineering.test.bellis.com.cn",
    prodHost: "engineering.bellis.com.cn"
  },
  {
    appName: "finance-app",
    devHost: "10.80.8.199",
    devPort: "8084",
    preHost: "localhost",
    prePort: "4184",
    testHost: "finance.test.bellis.com.cn",
    prodHost: "finance.bellis.com.cn"
  },
  {
    appName: "logistics-app",
    devHost: "10.80.8.199",
    devPort: "8086",
    preHost: "localhost",
    prePort: "4186",
    testHost: "logistics.test.bellis.com.cn",
    prodHost: "logistics.bellis.com.cn"
  },
  {
    appName: "operations-app",
    devHost: "10.80.8.199",
    devPort: "8088",
    preHost: "localhost",
    prePort: "4188",
    testHost: "operations.test.bellis.com.cn",
    prodHost: "operations.bellis.com.cn"
  },
  {
    appName: "personnel-app",
    devHost: "10.80.8.199",
    devPort: "8089",
    preHost: "localhost",
    prePort: "4189",
    testHost: "personnel.test.bellis.com.cn",
    prodHost: "personnel.bellis.com.cn"
  },
  {
    appName: "production-app",
    devHost: "10.80.8.199",
    devPort: "8096",
    preHost: "localhost",
    prePort: "4190",
    testHost: "production.test.bellis.com.cn",
    prodHost: "production.bellis.com.cn"
  },
  {
    appName: "quality-app",
    devHost: "10.80.8.199",
    devPort: "8091",
    preHost: "localhost",
    prePort: "4191",
    testHost: "quality.test.bellis.com.cn",
    prodHost: "quality.bellis.com.cn"
  },
  {
    appName: "system-app",
    devHost: "10.80.8.199",
    devPort: "8092",
    preHost: "localhost",
    prePort: "4192",
    testHost: "system.test.bellis.com.cn",
    prodHost: "system.bellis.com.cn"
  }
];
var SPECIAL_APP_CONFIGS = [
  {
    appName: "docs-app",
    devHost: "localhost",
    devPort: "8093",
    preHost: "localhost",
    prePort: "4193",
    testHost: "docs.test.bellis.com.cn",
    prodHost: "docs.bellis.com.cn"
  },
  {
    appName: "home-app",
    devHost: "10.80.8.199",
    devPort: "8085",
    preHost: "localhost",
    prePort: "4185",
    testHost: "www.test.bellis.com.cn",
    prodHost: "www.bellis.com.cn"
  },
  {
    appName: "layout-app",
    devHost: "10.80.8.199",
    devPort: "8094",
    preHost: "localhost",
    prePort: "4194",
    testHost: "layout.test.bellis.com.cn",
    prodHost: "layout.bellis.com.cn"
  }
];
var APP_ENV_CONFIGS = [
  MAIN_APP_CONFIG,
  ...BUSINESS_APP_CONFIGS,
  ...SPECIAL_APP_CONFIGS
];
function getAppConfig(appName) {
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}

// ../../configs/vite-app-config.ts
function getViteAppConfig(appName) {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`\u672A\u627E\u5230 ${appName} \u7684\u73AF\u5883\u914D\u7F6E`);
  }
  const mainAppConfig = getAppConfig("main-app");
  const mainAppOrigin = mainAppConfig ? `http://${mainAppConfig.preHost}:${mainAppConfig.prePort}` : "http://localhost:4180";
  return {
    devPort: parseInt(appConfig.devPort, 10),
    devHost: appConfig.devHost,
    prePort: parseInt(appConfig.prePort, 10),
    preHost: appConfig.preHost,
    prodHost: appConfig.prodHost,
    mainAppOrigin
  };
}
function getPublicDir(appName, appDir) {
  if (appName === "main-app" || appName === "admin-app" || appName === "system-app") {
    return resolve2(appDir, "public");
  }
  return resolve2(appDir, "../../packages/shared-components/public");
}

// ../../configs/vite/base.config.ts
import { resolve as resolve3 } from "path";
import { existsSync } from "fs";
function createBaseAliases(appDir, _appName) {
  const { withSrc, withRoot, withConfigs, withPackages } = createPathHelpers(appDir);
  const aliases = {
    "@": withSrc("src"),
    "@modules": withSrc("src/modules"),
    "@services": withSrc("src/services"),
    "@components": withSrc("src/components"),
    "@utils": withSrc("src/utils"),
    "@auth": withRoot("auth"),
    "@configs": withPackages("shared-core/src/configs"),
    "@btc/auth-shared": withRoot("auth/shared"),
    // @btc/* 包别名：所有应用都打包这些包，所以始终使用别名指向源码
    "@btc/shared-core": withPackages("shared-core/src"),
    "@btc/shared-components": withPackages("shared-components/src"),
    "@btc/shared-router": withPackages("shared-router/src"),
    // 向后兼容：废弃包的别名指向归并后的位置
    "@btc/shared-utils": withPackages("shared-core/src/utils"),
    "@btc/shared-plugins": withPackages("shared-components/src/plugins"),
    "@btc/i18n": withPackages("shared-components/src/i18n"),
    "@btc/subapp-manifests": withPackages("shared-core/src/manifest"),
    "@btc/env": withPackages("shared-core/src/env"),
    // shared-components 内部使用的别名（用于解析 shared-components 内部的导入）
    "@btc-common": withPackages("shared-components/src/common"),
    "@btc-components": withPackages("shared-components/src/components"),
    "@btc-crud": withPackages("shared-components/src/crud"),
    "@btc-styles": withPackages("shared-components/src/styles"),
    "@btc-locales": withPackages("shared-components/src/locales"),
    "@btc-assets": withPackages("shared-components/src/assets"),
    "@assets": withPackages("shared-components/src/assets"),
    // @assets 别名，用于图片资源导入
    "@btc-utils": withPackages("shared-components/src/utils"),
    "@plugins": withPackages("shared-components/src/plugins"),
    // 图表相关别名
    "@charts-utils/css-var": withPackages("shared-components/src/charts/utils/css-var"),
    "@charts-utils/color": withPackages("shared-components/src/charts/utils/color"),
    "@charts-utils/gradient": withPackages("shared-components/src/charts/utils/gradient"),
    "@charts-composables/useChartComponent": withPackages("shared-components/src/charts/composables/useChartComponent"),
    "@charts-types": withPackages("shared-components/src/charts/types"),
    "@charts-utils": withPackages("shared-components/src/charts/utils"),
    "@charts-composables": withPackages("shared-components/src/charts/composables"),
    // Element Plus 别名（始终使用）
    "element-plus/es": "element-plus/es",
    "element-plus/dist": "element-plus/dist"
  };
  return aliases;
}
function createBaseResolve(appDir, appName) {
  const { withPackages } = createPathHelpers(appDir);
  const aliases = createBaseAliases(appDir, appName);
  const aliasArray = [
    // 关键：将 util 映射到 npm 包，防止 Vite 将其视为 Node.js 内置模块并外部化
    // 需要查找 node_modules/util 的实际路径（可能在根目录或应用目录）
    {
      find: /^util$/,
      replacement: (() => {
        const appUtilPath = resolve3(appDir, "node_modules/util");
        if (existsSync(appUtilPath)) {
          return appUtilPath;
        }
        const rootUtilPath = resolve3(appDir, "../../node_modules/util");
        if (existsSync(rootUtilPath)) {
          return rootUtilPath;
        }
        return "util";
      })()
    },
    // locales 子路径别名（所有应用都使用别名指向源码）
    {
      find: "@btc/shared-core/locales/zh-CN",
      replacement: withPackages("shared-core/src/btc/plugins/i18n/locales/zh-CN")
    },
    {
      find: "@btc/shared-core/locales/en-US",
      replacement: withPackages("shared-core/src/btc/plugins/i18n/locales/en-US")
    },
    {
      find: "@btc/shared-components/locales/zh-CN.json",
      replacement: withPackages("shared-components/src/locales/zh-CN.json")
    },
    {
      find: "@btc/shared-components/locales/en-US.json",
      replacement: withPackages("shared-components/src/locales/en-US.json")
    },
    // 其他别名（从对象转换为数组形式）
    ...Object.entries(aliases).map(([find, replacement]) => ({
      find,
      replacement
    }))
  ];
  return {
    alias: aliasArray,
    dedupe: ["vue", "vue-router", "pinia", "element-plus", "@element-plus/icons-vue"],
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    // 确保 Vite 优先使用 package.json 的 exports 配置
    // 关键：添加 'development' 条件，确保在开发环境中使用源码
    conditions: ["development", "import", "module", "browser", "default"]
  };
}

// ../../configs/vite/plugins/clean.ts
import { resolve as resolve4 } from "path";
import { existsSync as existsSync2, rmSync } from "node:fs";
function safeLog(message) {
  try {
    console.info(message);
  } catch (error) {
    console.info(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function safeWarn(message) {
  try {
    console.warn(message);
  } catch (error) {
    console.warn(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function cleanDistPlugin(appDir) {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve4(appDir, "dist");
      if (existsSync2(distDir)) {
        safeLog("[clean-dist-plugin] \u6E05\u7406\u65E7\u7684 dist \u76EE\u5F55...");
        let retries = 5;
        let success = false;
        while (retries > 0 && !success) {
          try {
            rmSync(distDir, { recursive: true, force: true });
            success = true;
            safeLog("[clean-dist-plugin] \u2705 dist \u76EE\u5F55\u5DF2\u6E05\u7406");
          } catch (error) {
            retries--;
            if (error.code === "EBUSY" || error.code === "ENOTEMPTY") {
              if (retries > 0) {
                const waitTime = (6 - retries) * 200;
                safeWarn(`[clean-dist-plugin] \u26A0\uFE0F  \u76EE\u5F55\u88AB\u5360\u7528\uFF0C\u7B49\u5F85 ${waitTime}ms \u540E\u91CD\u8BD5... (\u5269\u4F59 ${retries} \u6B21)`);
                const start = Date.now();
                while (Date.now() - start < waitTime) {
                }
              } else {
                safeWarn("[clean-dist-plugin] \u274C \u65E0\u6CD5\u6E05\u7406 dist \u76EE\u5F55\uFF08\u53EF\u80FD\u88AB\u5176\u4ED6\u7A0B\u5E8F\u5360\u7528\uFF09");
                safeWarn("[clean-dist-plugin] \u63D0\u793A\uFF1A\u8BF7\u5173\u95ED\u53EF\u80FD\u5360\u7528\u6587\u4EF6\u7684\u7A0B\u5E8F\uFF08\u5982\u6587\u4EF6\u8D44\u6E90\u7BA1\u7406\u5668\u3001\u7F16\u8F91\u5668\u7B49\uFF09");
                safeWarn("[clean-dist-plugin] \u6216\u8005\u624B\u52A8\u5220\u9664 dist \u76EE\u5F55\u540E\u91CD\u65B0\u6784\u5EFA");
                safeWarn("[clean-dist-plugin] \u6784\u5EFA\u5C06\u7EE7\u7EED\uFF0C\u4F46\u65E7\u7684\u6784\u5EFA\u4EA7\u7269\u4E0D\u4F1A\u88AB\u6E05\u7406\uFF0C\u53EF\u80FD\u5BFC\u81F4\u91CD\u590D\u6587\u4EF6");
                success = true;
              }
            } else if (error.code === "ENOENT") {
              success = true;
            } else {
              safeWarn("[clean-dist-plugin] \u6E05\u7406 dist \u76EE\u5F55\u5931\u8D25: " + error.message);
              safeWarn("[clean-dist-plugin] \u6784\u5EFA\u5C06\u7EE7\u7EED\uFF0C\u4F46\u65E7\u7684\u6784\u5EFA\u4EA7\u7269\u4E0D\u4F1A\u88AB\u6E05\u7406");
              success = true;
            }
          }
        }
      } else {
        safeLog("[clean-dist-plugin] dist \u76EE\u5F55\u4E0D\u5B58\u5728\uFF0C\u65E0\u9700\u6E05\u7406");
      }
    }
  };
}

// ../../configs/vite/plugins/url.ts
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/url.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);

// ../../configs/vite/plugins/cors.ts
function corsPlugin() {
  const corsDevMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
    next();
  };
  const corsPreviewMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS") {
      const origin2 = req.headers.origin;
      if (origin2) {
        res.setHeader("Access-Control-Allow-Origin", origin2);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      }
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
    }
    next();
  };
  return {
    name: "cors-with-credentials",
    enforce: "pre",
    configureServer(server) {
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter(
          (item) => item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        server.middlewares.stack = [
          { route: "", handle: corsDevMiddleware },
          ...filteredStack
        ];
      } else {
        server.middlewares.use(corsDevMiddleware);
      }
    },
    configurePreviewServer(server) {
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter(
          (item) => item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        server.middlewares.stack = [
          { route: "", handle: corsPreviewMiddleware },
          ...filteredStack
        ];
      } else {
        server.middlewares.use(corsPreviewMiddleware);
      }
    }
  };
}

// ../../configs/vite/plugins/version.ts
import { existsSync as existsSync3, readFileSync, writeFileSync } from "node:fs";
import { resolve as resolve5, dirname as dirname2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/version.ts";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname2 = dirname2(__filename2);
function getBuildTimestamp() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = resolve5(__dirname2, "../../../.build-timestamp");
  if (existsSync3(timestampFile)) {
    try {
      const timestamp2 = readFileSync(timestampFile, "utf-8").trim();
      if (timestamp2) {
        return timestamp2;
      }
    } catch (error) {
    }
  }
  const timestamp = Date.now().toString(36);
  try {
    writeFileSync(timestampFile, timestamp, "utf-8");
  } catch (error) {
  }
  return timestamp;
}
function addVersionPlugin() {
  const buildTimestamp = getBuildTimestamp();
  return {
    name: "add-version",
    apply: "build",
    buildStart() {
      console.info(`[add-version] \u6784\u5EFA\u65F6\u95F4\u6233\u7248\u672C\u53F7: ${buildTimestamp}`);
    },
    // 关键：使用 transformIndexHtml（Vite 内部是在后置阶段生成/写入 index.html，generateBundle 很容易拿不到最终 HTML）
    transformIndexHtml: {
      order: "post",
      handler(html) {
        let newHtml = html;
        let modified = false;
        const emptyStyleRegex = /<style>\s*<\/style>/gi;
        if (emptyStyleRegex.test(newHtml)) {
          newHtml = newHtml.replace(emptyStyleRegex, "");
          modified = true;
        }
        newHtml = newHtml.replace(
          /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
          (match, prefix, src, suffix) => {
            const isModuleScript = /type\s*=\s*["']module["']/i.test(match);
            const isAssets = src.startsWith("/assets/") || src.startsWith("./assets/");
            if (isModuleScript && isAssets) {
              const cleaned = src.replace(/[?&]v=[^&'"]*/g, "").replace(/\?&/, "?").replace(/[?&]$/, "");
              if (cleaned !== src) {
                modified = true;
                return `${prefix}${cleaned}${suffix}`;
              }
              return match;
            }
            if (src.includes("?v=") || src.includes("&v=")) {
              const updated = src.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== src) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (isAssets) {
              modified = true;
              const sep = src.includes("?") ? "&" : "?";
              return `${prefix}${src}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          }
        );
        newHtml = newHtml.replace(
          /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
          (match, prefix, href, suffix) => {
            const isModulePreload = /\srel\s*=\s*["']modulepreload["']/i.test(match);
            const isAssets = href.startsWith("/assets/") || href.startsWith("./assets/");
            if (isModulePreload && isAssets) {
              const cleaned = href.replace(/[?&]v=[^&'"]*/g, "").replace(/\?&/, "?").replace(/[?&]$/, "");
              if (cleaned !== href) {
                modified = true;
                return `${prefix}${cleaned}${suffix}`;
              }
              return match;
            }
            if (href.includes("?v=") || href.includes("&v=")) {
              const updated = href.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== href) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (isAssets) {
              modified = true;
              const sep = href.includes("?") ? "&" : "?";
              return `${prefix}${href}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          }
        );
        const originExpr = `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin:((typeof location!=='undefined'&&location.origin)||''))`;
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m, _q, absPath) => {
            modified = true;
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          }
        );
        if (modified) {
          console.info(`[add-version] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u6DFB\u52A0\u7248\u672C\u53F7: v=${buildTimestamp}`);
          return newHtml;
        }
        return html;
      }
    }
  };
}

// ../../configs/vite/plugins/copy-icons.ts
import { resolve as resolve6 } from "path";
import { existsSync as existsSync4, copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync as writeFileSync2, unlinkSync } from "node:fs";
function copyIconsPlugin(appDir) {
  let viteConfig = null;
  return {
    name: "copy-icons",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      viteConfig = config;
    },
    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }
        const root = viteConfig.root || appDir;
        const iconsSourceDir = resolve6(root, "public/icons");
        if (!existsSync4(iconsSourceDir)) {
          return;
        }
        const outDir = viteConfig.build.outDir || "dist";
        const distDir = resolve6(root, outDir);
        if (!existsSync4(distDir)) {
          return;
        }
        const iconsDestDir = resolve6(distDir, "icons");
        if (!existsSync4(iconsDestDir)) {
          mkdirSync(iconsDestDir, { recursive: true });
        }
        const files = readdirSync(iconsSourceDir);
        for (const file of files) {
          const sourcePath = resolve6(iconsSourceDir, file);
          const destPath = resolve6(iconsDestDir, file);
          const stats = statSync(sourcePath);
          if (stats.isFile()) {
            copyFileSync(sourcePath, destPath);
          }
        }
        const faviconDest = resolve6(distDir, "favicon.ico");
        if (existsSync4(faviconDest)) {
          try {
            unlinkSync(faviconDest);
            console.info(`[copy-icons] \u5DF2\u5220\u9664\u4E0D\u9700\u8981\u7684 favicon.ico: ${faviconDest}`);
          } catch (error) {
          }
        }
        const manifestSource = resolve6(root, "public/icons/site.webmanifest");
        const manifestDest = resolve6(iconsDestDir, "site.webmanifest");
        if (existsSync4(manifestSource)) {
          copyFileSync(manifestSource, manifestDest);
        } else {
          const manifestSourceRoot = resolve6(root, "public/site.webmanifest");
          if (existsSync4(manifestSourceRoot)) {
            copyFileSync(manifestSourceRoot, manifestDest);
          } else {
            const manifest = {
              name: "BTC ShopFlow Admin",
              short_name: "BTC Admin",
              description: "BTC ShopFlow \u7BA1\u7406\u5E94\u7528",
              start_url: "/",
              display: "standalone",
              background_color: "#ffffff",
              theme_color: "#404040",
              icons: [
                {
                  src: "/icons/android-chrome-192x192.png",
                  sizes: "192x192",
                  type: "image/png"
                },
                {
                  src: "/icons/android-chrome-512x512.png",
                  sizes: "512x512",
                  type: "image/png"
                },
                {
                  src: "/icons/favicon-32x32.png",
                  sizes: "32x32",
                  type: "image/png"
                },
                {
                  src: "/icons/favicon-16x16.png",
                  sizes: "16x16",
                  type: "image/png"
                }
              ]
            };
            writeFileSync2(manifestDest, JSON.stringify(manifest, null, 2), "utf-8");
          }
        }
        console.info(`[copy-icons] \u5DF2\u590D\u5236 icons \u76EE\u5F55\u5230: ${iconsDestDir}`);
      } catch (error) {
        console.warn("[copy-icons] \u590D\u5236 icons \u76EE\u5F55\u5931\u8D25:", error);
      }
    }
  };
}

// ../../configs/vite/plugins/upload-icons-to-oss.ts
import { spawn } from "child_process";
import { resolve as resolve7 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { execSync } from "child_process";
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-icons-to-oss.ts";
var __filename3 = fileURLToPath3(__vite_injected_original_import_meta_url3);
var __dirname3 = resolve7(__filename3, "..");
var projectRoot = resolve7(__dirname3, "../../..");
function tryLoadOssCredsFromWindowsCredentialManager() {
  if (process.platform !== "win32") return;
  if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) return;
  try {
    const ps = [
      `$ErrorActionPreference='Stop'`,
      `Import-Module CredentialManager`,
      `$id=(Get-StoredCredential -Target 'AlibabaCloud' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$sec=(Get-StoredCredential -Target 'AlibabaCloudSecret' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$out=[pscustomobject]@{ id=$id; secret=$sec } | ConvertTo-Json -Compress`,
      `Write-Output $out`
    ].join("; ");
    const raw = execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    });
    const jsonText = (raw || "").trim();
    if (!jsonText) return;
    const parsed = JSON.parse(jsonText);
    if (parsed?.id && !process.env.OSS_ACCESS_KEY_ID) process.env.OSS_ACCESS_KEY_ID = parsed.id;
    if (parsed?.secret && !process.env.OSS_ACCESS_KEY_SECRET) process.env.OSS_ACCESS_KEY_SECRET = parsed.secret;
  } catch {
  }
}
function uploadIconsToOssPlugin() {
  let isProductionBuild = false;
  return {
    name: "upload-icons-to-oss",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    async closeBundle() {
      if (!isProductionBuild) {
        return;
      }
      tryLoadOssCredsFromWindowsCredentialManager();
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        console.warn("[upload-icons-to-oss] \u26A0\uFE0F  \u8DF3\u8FC7\u4E0A\u4F20\uFF08\u672A\u914D\u7F6E OSS \u51ED\u8BC1\uFF09\u3002\u8FD9\u4F1A\u5BFC\u81F4 https://all.bellis.com.cn/logo.png \u8FD4\u56DE NoSuchKey");
        return;
      }
      const uploadScript = resolve7(projectRoot, "scripts/upload-icons-to-oss.mjs");
      console.info("[upload-icons-to-oss] \u{1F680} \u5F00\u59CB\u4E0A\u4F20\u56FE\u6807\u6587\u4EF6\u5230 OSS...");
      await new Promise((resolvePromise, rejectPromise) => {
        const child = spawn("node", [uploadScript], {
          stdio: "inherit",
          shell: true,
          env: {
            ...process.env
          }
        });
        child.on("error", (error) => {
          rejectPromise(error);
        });
        child.on("exit", (code) => {
          if (code === 0) {
            console.info("[upload-icons-to-oss] \u2705 \u56FE\u6807\u6587\u4EF6\u4E0A\u4F20\u5B8C\u6210");
            resolvePromise();
          } else {
            const strict = process.env.OSS_UPLOAD_STRICT === "true";
            const err = new Error(`[upload-icons-to-oss] \u4E0A\u4F20\u811A\u672C\u9000\u51FA\uFF0C\u4EE3\u7801: ${code ?? "unknown"}`);
            if (strict) {
              rejectPromise(err);
            } else {
              console.warn(err.message);
              resolvePromise();
            }
          }
        });
      });
    }
  };
}

// ../../configs/vite/plugins/upload-cdn.ts
import { spawn as spawn2 } from "child_process";
import { resolve as resolve8 } from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { execSync as execSync2 } from "child_process";
var __vite_injected_original_import_meta_url4 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-cdn.ts";
var __filename4 = fileURLToPath4(__vite_injected_original_import_meta_url4);
var __dirname4 = resolve8(__filename4, "..");
var projectRoot2 = resolve8(__dirname4, "../../..");
function tryLoadOssCredsFromWindowsCredentialManager2() {
  if (process.platform !== "win32") return;
  if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) return;
  try {
    const ps = [
      `$ErrorActionPreference='Stop'`,
      `Import-Module CredentialManager`,
      `$id=(Get-StoredCredential -Target 'AlibabaCloud' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$sec=(Get-StoredCredential -Target 'AlibabaCloudSecret' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$out=[pscustomobject]@{ id=$id; secret=$sec } | ConvertTo-Json -Compress`,
      `Write-Output $out`
    ].join("; ");
    const raw = execSync2(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    });
    const jsonText = (raw || "").trim();
    if (!jsonText) return;
    const parsed = JSON.parse(jsonText);
    if (parsed?.id && !process.env.OSS_ACCESS_KEY_ID) process.env.OSS_ACCESS_KEY_ID = parsed.id;
    if (parsed?.secret && !process.env.OSS_ACCESS_KEY_SECRET) process.env.OSS_ACCESS_KEY_SECRET = parsed.secret;
  } catch {
  }
}
function uploadCdnPlugin(appName, _appDir) {
  let isProductionBuild = false;
  return {
    name: "upload-cdn",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    async closeBundle() {
      if (process.env.ENABLE_CDN_UPLOAD !== "true") {
        return;
      }
      if (process.env.SKIP_CDN_UPLOAD === "true") {
        console.info(`[upload-cdn] \u23ED\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08SKIP_CDN_UPLOAD=true\uFF09`);
        return;
      }
      if (!isProductionBuild) {
        return;
      }
      tryLoadOssCredsFromWindowsCredentialManager2();
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        console.warn(`[upload-cdn] \u26A0\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08\u672A\u914D\u7F6E OSS \u51ED\u8BC1\uFF09`);
        return;
      }
      const uploadScript = resolve8(projectRoot2, "scripts/upload-app-to-cdn.mjs");
      console.info(`[upload-cdn] \u{1F680} \u5F00\u59CB\u4E0A\u4F20 ${appName} \u5230 CDN...`);
      await new Promise((resolvePromise, rejectPromise) => {
        const child = spawn2("node", [uploadScript, appName], {
          stdio: "inherit",
          shell: true,
          env: {
            ...process.env
          }
        });
        child.on("error", (error) => {
          rejectPromise(error);
        });
        child.on("exit", (code) => {
          if (code === 0) {
            console.info(`[upload-cdn] \u2705 ${appName} \u4E0A\u4F20\u5B8C\u6210`);
            resolvePromise();
          } else {
            const strict = process.env.OSS_UPLOAD_STRICT === "true";
            const err = new Error(`[upload-cdn] ${appName} \u4E0A\u4F20\u811A\u672C\u9000\u51FA\uFF0C\u4EE3\u7801: ${code ?? "unknown"}`);
            if (strict) {
              rejectPromise(err);
            } else {
              console.warn(err.message);
              resolvePromise();
            }
          }
        });
      });
    }
  };
}

// ../../configs/vite/plugins/cdn-assets.ts
function cdnAssetsPlugin(options) {
  const {
    appName,
    // 关键：默认启用条件必须明确检查 ENABLE_CDN_ACCELERATION 环境变量
    // 如果 ENABLE_CDN_ACCELERATION 被设置为 'false'，则禁用 CDN
    // 只有在明确启用（ENABLE_CDN_ACCELERATION=true）或未设置且是生产构建时，才启用 CDN
    enabled = process.env.ENABLE_CDN_ACCELERATION === "true" || process.env.ENABLE_CDN_ACCELERATION !== "false" && process.env.NODE_ENV === "production" && process.env.VITE_PREVIEW !== "true",
    cdnDomain = "https://all.bellis.com.cn"
  } = options;
  return {
    name: "cdn-assets",
    apply: "build",
    buildStart() {
      if (enabled) {
        console.info(`[cdn-assets] CDN \u52A0\u901F\u5DF2\u542F\u7528\uFF0C\u5E94\u7528: ${appName}, CDN \u57DF\u540D: ${cdnDomain}`);
      } else {
        console.info(`[cdn-assets] CDN \u52A0\u901F\u5DF2\u7981\u7528`);
      }
    },
    transformIndexHtml: {
      order: "post",
      // 在 addVersionPlugin 之后执行
      handler(html) {
        const isPreviewBuild = process.env.VITE_PREVIEW === "true";
        const needsEarlyConverter = isPreviewBuild && !enabled;
        if (!enabled && !needsEarlyConverter) {
          return html;
        }
        let newHtml = html;
        let modified = false;
        if (enabled) {
          newHtml = newHtml.replace(
            /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
            (match, prefix, src, suffix) => {
              if (src.startsWith("/assets/") && !src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/${appName}${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/layout-app${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (src.startsWith("./assets/") || src.startsWith("assets/")) {
                const normalizedPath = src.startsWith("./") ? src.substring(2) : src;
                if (normalizedPath.startsWith("assets/layout/")) {
                  const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                } else if (normalizedPath.startsWith("assets/")) {
                  const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                }
              }
              return match;
            }
          );
        }
        if (enabled) {
          newHtml = newHtml.replace(
            /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
            (match, prefix, href, suffix) => {
              if (href.startsWith("/assets/") && !href.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/${appName}${href}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (href.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/layout-app${href}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (href.startsWith("./assets/") || href.startsWith("assets/")) {
                const normalizedPath = href.startsWith("./") ? href.substring(2) : href;
                if (normalizedPath.startsWith("assets/layout/")) {
                  const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                } else if (normalizedPath.startsWith("assets/")) {
                  const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                }
              }
              return match;
            }
          );
        }
        if (enabled) {
          newHtml = newHtml.replace(
            /(<img[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
            (match, prefix, src, suffix) => {
              if (src.startsWith("/assets/") && !src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/${appName}${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/layout-app${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              return match;
            }
          );
        }
        const originExpr = `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin:((typeof location!=='undefined'&&location.origin)||''))`;
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m, _q, absPath) => {
            modified = true;
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          }
        );
        if (!newHtml.includes("__BTC_RESOURCE_LOADER__") || needsEarlyConverter) {
          const cdnEnabled = process.env.ENABLE_CDN_ACCELERATION !== "false";
          const isPreviewBuild2 = process.env.VITE_PREVIEW === "true";
          const earlyUrlConverterScript = isPreviewBuild2 ? `
<script>
  (function() {
    // \u5173\u952E\uFF1A\u5728 HTML \u89E3\u6790\u4E4B\u524D\u5C31\u5904\u7406 CDN URL\uFF0C\u907F\u514D\u6D4F\u89C8\u5668\u8BF7\u6C42 CDN \u8D44\u6E90
    // \u8FD9\u4E2A\u811A\u672C\u5FC5\u987B\u5728\u6240\u6709\u5176\u4ED6 script \u548C link \u6807\u7B7E\u4E4B\u524D\u6267\u884C
    if (typeof document !== 'undefined') {
      const convertCdnUrl = (url) => {
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
          return url;
        }
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname.includes('all.bellis.com.cn') || 
              urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
            // \u63D0\u53D6\u8DEF\u5F84\u90E8\u5206\uFF0C\u53BB\u6389\u5E94\u7528\u524D\u7F00
            let path = urlObj.pathname;
            if (path.includes('/assets/')) {
              path = path.substring(path.indexOf('/assets/'));
            } else if (path.includes('/assets/layout/')) {
              path = path.substring(path.indexOf('/assets/layout/'));
            }
            // \u4FDD\u7559\u67E5\u8BE2\u53C2\u6570\u548C\u54C8\u5E0C
            return path + (urlObj.search || '') + (urlObj.hash || '');
          }
        } catch (e) {
          // URL \u89E3\u6790\u5931\u8D25\uFF0C\u8FD4\u56DE\u539F URL
        }
        return url;
      };
      
      // \u62E6\u622A document.createElement\uFF0C\u5728\u521B\u5EFA script \u548C link \u6807\u7B7E\u65F6\u8F6C\u6362 URL
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = function(tagName, options) {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
          const originalSetAttribute = element.setAttribute.bind(element);
          element.setAttribute = function(name, value) {
            if ((name === 'src' || name === 'href') && typeof value === 'string') {
              const convertedUrl = convertCdnUrl(value);
              return originalSetAttribute(name, convertedUrl);
            }
            return originalSetAttribute(name, value);
          };
        }
        return element;
      };
      
      // \u5904\u7406\u5DF2\u5B58\u5728\u7684 script \u548C link \u6807\u7B7E\uFF08\u5982\u679C DOM \u5DF2\u7ECF\u90E8\u5206\u89E3\u6790\uFF09
      const processExistingTags = () => {
        if (document.querySelectorAll) {
          document.querySelectorAll('script[src]').forEach((script) => {
            const src = script.getAttribute('src');
            if (src) {
              const convertedUrl = convertCdnUrl(src);
              if (convertedUrl !== src) {
                script.setAttribute('src', convertedUrl);
              }
            }
          });
          document.querySelectorAll('link[href]').forEach((link) => {
            const href = link.getAttribute('href');
            if (href) {
              const convertedUrl = convertCdnUrl(href);
              if (convertedUrl !== href) {
                link.setAttribute('href', convertedUrl);
              }
            }
          });
        }
      };
      
      // \u7ACB\u5373\u5904\u7406\uFF08\u5982\u679C DOM \u5DF2\u7ECF\u90E8\u5206\u89E3\u6790\uFF09
      if (document.readyState === 'loading' || document.readyState === 'interactive') {
        processExistingTags();
        // \u76D1\u542C DOM \u53D8\u5316\uFF0C\u5904\u7406\u540E\u7EED\u6DFB\u52A0\u7684\u6807\u7B7E
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', processExistingTags);
        }
      } else {
        processExistingTags();
      }
    }
  })();
</script>` : "";
          const loaderScript = `
<script>
  (function() {
    // \u8D44\u6E90\u52A0\u8F7D\u5668\u5C06\u5728\u8FD0\u884C\u65F6\u6A21\u5757\u4E2D\u521D\u59CB\u5316
    // \u8FD9\u91CC\u53EA\u8BBE\u7F6E\u57FA\u7840\u914D\u7F6E
    if (typeof window !== 'undefined') {
      window.__BTC_CDN_CONFIG__ = {
        appName: '${appName}',
        cdnDomain: '${cdnDomain}',
        ossDomain: 'https://bellis1.oss-cn-shenzhen.aliyuncs.com',
        enabled: ${cdnEnabled}
      };
    }
  })();
</script>`;
          if (newHtml.includes("</head>")) {
            if (earlyUrlConverterScript && newHtml.includes("<script")) {
              const firstTagMatch = newHtml.match(/<(script|link)[^>]*>/i);
              if (firstTagMatch && firstTagMatch.index !== void 0) {
                newHtml = newHtml.slice(0, firstTagMatch.index) + earlyUrlConverterScript + newHtml.slice(firstTagMatch.index);
                modified = true;
              } else {
                newHtml = newHtml.replace("</head>", `${earlyUrlConverterScript}
</head>`);
                modified = true;
              }
            }
            if (!newHtml.includes("__BTC_RESOURCE_LOADER__")) {
              newHtml = newHtml.replace("</head>", `${loaderScript}
</head>`);
              modified = true;
            }
          } else if (newHtml.includes("</body>")) {
            if (earlyUrlConverterScript) {
              newHtml = newHtml.replace("</body>", `${earlyUrlConverterScript}
</body>`);
              modified = true;
            }
            if (!newHtml.includes("__BTC_RESOURCE_LOADER__")) {
              newHtml = newHtml.replace("</body>", `${loaderScript}
</body>`);
              modified = true;
            }
          }
        }
        if (modified) {
          console.info(`[cdn-assets] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u8F6C\u6362\u4E3A CDN URL`);
        }
        return newHtml;
      }
    }
  };
}

// ../../configs/vite/factories/layout.config.ts
function createLayoutAppViteConfig(options) {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customCss,
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true }
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot } = createPathHelpers(appDir);
  const baseUrl = "/";
  const publicDir = getPublicDir(appName, appDir);
  const layoutAliases = {
    "@layout": resolve9(appDir, "src"),
    "@system": resolve9(appDir, "../system-app/src"),
    "@": resolve9(appDir, "../system-app/src"),
    "@services": resolve9(appDir, "../system-app/src/services")
  };
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const plugins = [
    // 1. 清理插件（在构建前清理 dist 目录，包括旧的 assets 和 assets/layout 目录）
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 自定义插件
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync5,
          readFile: (file) => readFileSync2(file, "utf-8")
        }
      }
    }),
    // 4.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    // 关键：与 cool-admin 保持一致，使用默认配置，让插件自动处理所有 JSX/TSX 文件
    vueJsx(),
    // 5. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 6. BTC 业务插件
    btc({
      type: "admin",
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      eps: {
        enable: true,
        // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
        // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
        dist: resolve9(appDir, "build", "eps"),
        // 共享的 EPS 数据源目录（从 main-app 读取）
        // layout-app 优先从 main-app 的 build/eps 读取 EPS 数据，实现真正的共享
        sharedEpsDir: resolve9(appDir, "../main-app/build/eps"),
        api: "/api/login/eps/contract",
        ...btcOptions.eps
      },
      ...btcOptions
    }),
    // 7. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve9(appDir, "../system-app/src/locales/**"),
        resolve9(appDir, "../system-app/src/{modules,plugins}/**/locales/**")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 8. 自动导入插件
    createAutoImportConfig(),
    // 9. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 10. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 11. 确保 script 标签有 type="module"
    {
      name: "ensure-module-scripts",
      transformIndexHtml(html) {
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = "") => {
            if (!match.includes("src=")) {
              return match;
            }
            if (attrs && attrs.includes("type=")) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
      }
    },
    // 12. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 12.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 关键：开发环境和预览环境必须禁用 CDN
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 15. 构建后清理插件：删除 .vite 目录（Vite 缓存目录不应出现在构建产物中）
    {
      name: "clean-vite-dir-plugin",
      closeBundle() {
        const viteDir = resolve9(appDir, "dist", ".vite");
        if (existsSync5(viteDir)) {
          try {
            rmSync2(viteDir, { recursive: true, force: true });
            console.info("[clean-vite-dir-plugin] \u2705 \u5DF2\u5220\u9664 dist/.vite \u76EE\u5F55");
          } catch (error) {
            console.warn("[clean-vite-dir-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u5220\u9664 dist/.vite \u76EE\u5F55:", error.message);
          }
        }
      }
    },
    // 16. 确保 manifest.json 生成插件（包含所有 chunk，不仅仅是入口文件）
    {
      name: "ensure-manifest-plugin",
      writeBundle(_options, bundle) {
        const manifest = {};
        const allChunks = [];
        const fileNameToKeyMap = /* @__PURE__ */ new Map();
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === "chunk" && fileName.endsWith(".js")) {
            const sourceFile = chunk.facadeModuleId || chunk.moduleIds?.[0] || fileName;
            let relativeSource = fileName.replace(/^assets\/(layout\/)?/, "");
            if (sourceFile && typeof sourceFile === "string") {
              const srcPath = sourceFile.replace(resolve9(appDir, "src"), "src").replace(/\\/g, "/");
              if (srcPath.startsWith("src/")) {
                relativeSource = srcPath;
              } else {
                relativeSource = fileName.replace(/^assets\/(layout\/)?/, "").replace(/\.js$/, "");
              }
            }
            const isEntry = chunk.isEntry === true || fileName.includes("index-") || fileName.includes("main-");
            let priority = 999;
            if (fileName.includes("vendor-") && !fileName.includes("echarts-vendor")) {
              priority = 1;
            } else if (fileName.includes("echarts-vendor")) {
              priority = 2;
            } else if (fileName.includes("menu-registry") || fileName.includes("eps-service") || fileName.includes("auth-api")) {
              priority = 3;
            } else if (isEntry) {
              priority = 4;
            }
            const imports = [];
            const chunkImports = chunk.imports;
            if (chunkImports && Array.isArray(chunkImports)) {
              for (const importFileName of chunkImports) {
                if (importFileName && typeof importFileName === "string" && importFileName.endsWith(".js")) {
                  imports.push(importFileName);
                }
              }
            }
            if (imports.length > 0) {
              console.info(`[ensure-manifest-plugin] ${fileName} \u7684 imports:`, imports);
            }
            fileNameToKeyMap.set(fileName, relativeSource);
            allChunks.push({
              key: relativeSource,
              file: fileName,
              isEntry,
              priority,
              imports
            });
          }
        }
        allChunks.sort((a, b) => a.priority - b.priority);
        allChunks.forEach((chunk) => {
          const importKeys = [];
          if (chunk.imports && chunk.imports.length > 0) {
            for (const importFileName of chunk.imports) {
              let importKey = fileNameToKeyMap.get(importFileName);
              if (!importKey) {
                let baseName = null;
                const specialHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9])-([a-zA-Z0-9]{4,})\.js$/);
                if (specialHashMatch && specialHashMatch[1]) {
                  baseName = specialHashMatch[1] ?? null;
                } else {
                  const multiHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.js$/);
                  if (multiHashMatch && multiHashMatch[1]) {
                    baseName = multiHashMatch[1] ?? null;
                  } else {
                    const singleHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]{8,})\.js$/);
                    if (singleHashMatch && singleHashMatch[1]) {
                      baseName = singleHashMatch[1] ?? null;
                    } else {
                      const simpleMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]+)\.js$/);
                      if (simpleMatch && simpleMatch[1]) {
                        baseName = simpleMatch[1] ?? null;
                      }
                    }
                  }
                }
                if (baseName) {
                  for (const [actualFileName, actualKey] of fileNameToKeyMap.entries()) {
                    let actualBaseName = null;
                    const actualSpecialHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9])-([a-zA-Z0-9]{4,})(?:-[a-zA-Z0-9]+)?\.js$/);
                    if (actualSpecialHashMatch && actualSpecialHashMatch[1]) {
                      actualBaseName = actualSpecialHashMatch[1] ?? null;
                    } else {
                      const actualMultiHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.js$/);
                      if (actualMultiHashMatch && actualMultiHashMatch[1]) {
                        actualBaseName = actualMultiHashMatch[1] ?? null;
                      } else {
                        const actualSingleHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]{8,})\.js$/);
                        if (actualSingleHashMatch && actualSingleHashMatch[1]) {
                          actualBaseName = actualSingleHashMatch[1] ?? null;
                        } else {
                          const actualSimpleMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]+)(?:-[a-zA-Z0-9]+)?\.js$/);
                          if (actualSimpleMatch && actualSimpleMatch[1]) {
                            actualBaseName = actualSimpleMatch[1] ?? null;
                          }
                        }
                      }
                    }
                    if (actualBaseName && actualBaseName === baseName) {
                      importKey = actualKey;
                      console.info(`[ensure-manifest-plugin] \u901A\u8FC7\u57FA\u7840\u540D\u79F0\u5339\u914D\u627E\u5230 imports: ${importFileName} -> ${actualFileName} (key: ${actualKey})`);
                      break;
                    }
                  }
                  if (!importKey) {
                    console.warn(`[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u627E\u5230 imports \u5BF9\u5E94\u7684\u6587\u4EF6: ${importFileName} (\u57FA\u7840\u540D\u79F0: ${baseName})`);
                  }
                } else {
                  console.warn(`[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u89E3\u6790\u6587\u4EF6\u540D\u683C\u5F0F: ${importFileName}`);
                }
              }
              if (importKey) {
                importKeys.push(importKey);
              } else {
                console.warn(`[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u627E\u5230 imports \u5BF9\u5E94\u7684\u6587\u4EF6: ${importFileName}`);
              }
            }
          }
          manifest[chunk.key] = {
            file: chunk.file,
            src: chunk.key,
            isEntry: chunk.isEntry,
            ...importKeys.length > 0 ? { imports: importKeys } : {}
          };
        });
        if (Object.keys(manifest).length === 0) {
          const firstChunk = Object.entries(bundle).find(([_, chunk]) => chunk.type === "chunk");
          if (firstChunk) {
            manifest["src/main.ts"] = {
              file: firstChunk[0],
              src: "src/main.ts",
              isEntry: true
            };
          }
        }
        const manifestPath = resolve9(appDir, "dist", "manifest.json");
        try {
          writeFileSync3(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
          console.info(`[ensure-manifest-plugin] \u2705 \u5DF2\u751F\u6210 manifest.json\uFF0C\u5305\u542B ${Object.keys(manifest).length} \u4E2A chunk`);
        } catch (error) {
          console.warn("[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u5199\u5165 manifest.json:", error.message);
        }
      }
    },
    // 17. CDN 上传插件（仅在生产构建且启用时）
    ...process.env.ENABLE_CDN_UPLOAD === "true" && process.env.VITE_PREVIEW !== "true" ? [uploadCdnPlugin(appName, appDir)] : []
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    assetsInlineLimit: 0,
    outDir: process.env.BUILD_OUT_DIR || "dist",
    assetsDir: "assets",
    // 关键：启用 manifest 文件生成，用于动态加载入口文件
    manifest: true,
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    rollupOptions: {
      preserveEntrySignatures: "strict",
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message && typeof warning.message === "string" && warning.message.includes("dynamically imported") && warning.message.includes("statically imported")) {
          return;
        }
        if (warning.message && typeof warning.message === "string" && warning.message.includes("Generated an empty chunk")) {
          return;
        }
        if (warning.code === "CIRCULAR_DEPENDENCY" || warning.message && typeof warning.message === "string" && (warning.message.includes("was reexported through module") || warning.message.includes("will end up in different chunks") || warning.message.includes("circular dependency"))) {
          return;
        }
        warn(warning);
      },
      // 关键：layout-app 作为主应用，需要打包 single-spa 和 qiankun
      // 不将它们标记为 external，确保它们被打包到构建产物中
      external: [
        // vite-plugin 是构建时插件，不应该被打包到运行时代码中
        "@btc/vite-plugin",
        /^@btc\/vite-plugin/
        // 注意：single-spa 和 qiankun 不在这里，它们会被打包
      ],
      output: {
        format: "esm",
        inlineDynamicImports: false,
        manualChunks(id) {
          if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router") || id.includes("node_modules/element-plus") || id.includes("node_modules/pinia") || id.includes("node_modules/@vueuse") || id.includes("node_modules/@element-plus") || id.includes("node_modules/dayjs") || id.includes("node_modules/lodash") || id.includes("node_modules/@vue") || id.includes("packages/shared-components") || id.includes("packages/shared-core") || id.includes("packages/shared-utils")) {
            return "vendor";
          }
          if (id.includes("node_modules/echarts") || id.includes("node_modules/zrender") || id.includes("node_modules/vue-echarts")) {
            return "echarts-vendor";
          }
          if (id.includes("virtual:eps") || id.includes("\\0virtual:eps") || id.includes("services/eps") || id.includes("services\\eps")) {
            return "eps-service";
          }
          if (id.includes("packages/subapp-manifests") || id.includes("packages/shared-components/src/store/menuRegistry") || id.includes("configs/layout-bridge") || id.includes("@btc/subapp-manifests") || id.includes("@btc/shared-core/configs/layout-bridge")) {
            return "menu-registry";
          }
          if (id.includes("node_modules/monaco-editor")) {
            return "lib-monaco";
          }
          if (id.includes("node_modules/three")) {
            return "lib-three";
          }
          return void 0;
        },
        preserveModules: false,
        generatedCode: {
          constBindings: false
        },
        // 布局应用使用 assets/layout/ 目录，与子应用的 assets/ 目录区分开
        chunkFileNames: "assets/layout/[name]-[hash].js",
        // 关键：layout-app 入口文件使用稳定文件名，避免旧 index.html/旧引用导致的 index-xxx.js 404
        // 配合 Nginx：assets/layout/index.js 设置 no-cache；其余 hash 文件 immutable
        entryFileNames: "assets/layout/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/layout/[name]-[hash].css";
          }
          return "assets/layout/[name]-[hash].[ext]";
        }
      }
    },
    ...customBuild
  };
  const serverConfig = {
    port: appConfig.devPort,
    host: appConfig.devHost,
    strictPort: true,
    open: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    fs: {
      allow: [
        resolve9(appDir, ".."),
        resolve9(appDir, "../system-app"),
        resolve9(appDir, "../../")
      ]
    },
    ...customServer
  };
  const rootDistDir = resolve9(appDir, "../../dist");
  const previewRoot = resolve9(rootDistDir, appConfig.prodHost);
  const previewConfig = {
    port: appConfig.prePort,
    host: appConfig.preHost,
    strictPort: true,
    open: false,
    // 关键：设置预览服务器的根目录为 dist/{prodHost}
    root: previewRoot,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  const cssConfig = {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    },
    ...customCss
  };
  const appCacheDir = resolve9(appDir, "node_modules/.vite");
  const optimizeDepsConfig = {
    include: [
      // 核心依赖：所有应用都安装的依赖
      "vue",
      "vue-router",
      "pinia",
      "element-plus",
      // Winston 需要的 Node.js 模块 polyfill
      "util",
      "element-plus/es",
      "element-plus/es/locale/lang/zh-cn",
      "element-plus/es/locale/lang/en",
      "@element-plus/icons-vue",
      "@btc/shared-core",
      // 注意：@btc/shared-components 已从 include 中移除，因为它包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // '@btc/shared-components',
      "@btc/shared-utils",
      "@btc/subapp-manifests",
      "vite-plugin-qiankun/dist/helper",
      "qiankun",
      "@vueuse/core",
      // layout-app 实际安装的依赖
      "vue-i18n",
      "axios",
      "echarts",
      "vue-echarts",
      "mitt",
      "nprogress"
      // 注意：lunr 和 file-saver 不是所有应用都安装，不应该在 include 中强制声明
      // 如果应用安装了这些依赖，Vite 会在扫描 entries 时自动发现并优化
      // 'lunr', // 只在 shared-components 中使用，不是所有应用都安装
      // 'file-saver', // 只在部分应用中使用，不是所有应用都安装
      // 注意：以下依赖不是所有应用都直接安装，它们通过 @btc/shared-components 间接使用
      // Vite 会在运行时自动发现并优化这些依赖，不需要在 include 中显式声明
    ],
    exclude: [
      // 关键：@btc/shared-core/configs/layout-bridge 是本地别名路径，不是 npm 包，不应该被优化
      // 注意：exclude 只支持字符串模式，不支持正则表达式
      "@btc/shared-core/configs/layout-bridge",
      // 关键：排除 @btc/shared-components，因为它是本地包，包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // 这样可以避免 JSX 解析问题
      "@btc/shared-components"
    ],
    force: false,
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    entries: [
      resolve9(appDir, "src/main.ts")
    ],
    esbuildOptions: {
      plugins: [],
      // 关键：确保依赖预构建时也使用 Vue 的 JSX 转换方式
      jsx: "preserve",
      // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: "h",
      // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: "Fragment"
      // 使用 Vue 的 Fragment
    }
  };
  const baseResolve = createBaseResolve(appDir, appName);
  return {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    cacheDir: appCacheDir,
    define: {
      // 为浏览器环境提供 process 对象，Winston 需要它
      "process.env": "{}",
      "process.platform": JSON.stringify("browser"),
      "process.version": JSON.stringify("")
    },
    resolve: {
      ...baseResolve,
      // 合并别名：baseResolve.alias 是数组形式，layoutAliases 是对象形式
      // 关键：layoutAliases 中的别名必须放在数组前面，确保优先匹配（特别是 @ 别名）
      alias: Array.isArray(baseResolve?.alias) ? [
        // layout-app 特有的别名放在前面，优先匹配
        ...Object.entries(layoutAliases).map(([find, replacement]) => ({
          find,
          replacement
        })),
        // 过滤掉 baseResolve.alias 中与 layoutAliases 冲突的别名（如 @）
        ...baseResolve.alias.filter((alias) => {
          if (typeof alias.find === "string") {
            return !(alias.find in layoutAliases);
          }
          return true;
        })
      ] : {
        ...baseResolve?.alias || {},
        ...layoutAliases
      }
    },
    plugins,
    esbuild: {
      charset: "utf8",
      // 关键：确保 esbuild 正确处理 JSX，使用 Vue 的 h 函数而不是 React.createElement
      // 这样即使 esbuild 处理某些 JSX 文件，也会使用正确的转换方式
      jsx: "preserve",
      // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: "h",
      // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: "Fragment"
      // 使用 Vue 的 Fragment
    },
    server: serverConfig,
    preview: previewConfig,
    css: cssConfig,
    build: buildConfig,
    optimizeDeps: optimizeDepsConfig
  };
}

// vite.config.ts
var __vite_injected_original_import_meta_url5 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/layout-app/vite.config.ts";
var vite_config_default = defineConfig(
  createLayoutAppViteConfig({
    appName: "layout-app",
    appDir: fileURLToPath5(new URL(".", __vite_injected_original_import_meta_url5)),
    qiankunName: "layout",
    customPlugins: [
      // 关键：layout-app 需要复制 icons 目录，因为它是统一管理图标的应用
      copyIconsPlugin(fileURLToPath5(new URL(".", __vite_injected_original_import_meta_url5))),
      // 生产构建完成后，自动上传图标文件到 OSS
      uploadIconsToOssPlugin()
    ]
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9sYXlvdXQuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VybC50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jb3JzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29weS1pY29ucy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtaWNvbnMtdG8tb3NzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxsYXlvdXQtYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbGF5b3V0LWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2xheW91dC1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBjcmVhdGVMYXlvdXRBcHBWaXRlQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9sYXlvdXQuY29uZmlnJztcbmltcG9ydCB7IGNvcHlJY29uc1BsdWdpbiwgdXBsb2FkSWNvbnNUb09zc1BsdWdpbiB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKFxuICBjcmVhdGVMYXlvdXRBcHBWaXRlQ29uZmlnKHtcbiAgICBhcHBOYW1lOiAnbGF5b3V0LWFwcCcsXG4gICAgYXBwRGlyOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICBxaWFua3VuTmFtZTogJ2xheW91dCcsXG4gICAgY3VzdG9tUGx1Z2luczogW1xuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbGF5b3V0LWFwcCBcdTk3MDBcdTg5ODFcdTU5MERcdTUyMzYgaWNvbnMgXHU3NkVFXHU1RjU1XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU2NjJGXHU3RURGXHU0RTAwXHU3QkExXHU3NDA2XHU1NkZFXHU2ODA3XHU3Njg0XHU1RTk0XHU3NTI4XG4gICAgICBjb3B5SWNvbnNQbHVnaW4oZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuJywgaW1wb3J0Lm1ldGEudXJsKSkpLFxuICAgICAgLy8gXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TU1xuICAgICAgdXBsb2FkSWNvbnNUb09zc1BsdWdpbigpLFxuICAgIF0sXG4gIH0pXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGZhY3Rvcmllc1xcXFxsYXlvdXQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvbGF5b3V0LmNvbmZpZy50c1wiOy8qKlxuICogXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHU1REU1XHU1MzgyXG4gKiBcdTc1MUZcdTYyMTBcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdTc2ODRcdTVCOENcdTY1NzQgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDhsYXlvdXQtYXBwXHVGRjA5XG4gKi9cbjtcblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcm1TeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvcGF0aC1oZWxwZXJzJztcblxuLy8gXHU0RjdGXHU3NTI4IEVTTSBcdTVCRkNcdTUxNjUgVnVlSTE4blBsdWdpblx1RkYwOFZpdGUgXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHU2NTJGXHU2MzAxIEVTTVx1RkYwOVxuaW1wb3J0IFZ1ZUkxOG5QbHVnaW4gZnJvbSAnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZSc7XG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vYXV0by1pbXBvcnQuY29uZmlnJztcbmltcG9ydCB7IGJ0YyB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZywgZ2V0UHVibGljRGlyIH0gZnJvbSAnLi4vLi4vdml0ZS1hcHAtY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZUJhc2VSZXNvbHZlIH0gZnJvbSAnLi4vYmFzZS5jb25maWcnO1xuaW1wb3J0IHsgY2xlYW5EaXN0UGx1Z2luLCBjb3JzUGx1Z2luLCBhZGRWZXJzaW9uUGx1Z2luLCB1cGxvYWRDZG5QbHVnaW4sIGNkbkFzc2V0c1BsdWdpbiB9IGZyb20gJy4uL3BsdWdpbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExheW91dEFwcFZpdGVDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnbGF5b3V0LWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgKi9cbiAgYXBwRGlyOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBRaWFua3VuIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnbGF5b3V0J1x1RkYwOVxuICAgKi9cbiAgcWlhbmt1bk5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1NTIxN1x1ODg2OFxuICAgKi9cbiAgY3VzdG9tUGx1Z2lucz86IFBsdWdpbltdO1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gICAqL1xuICBjdXN0b21CdWlsZD86IFBhcnRpYWw8VXNlckNvbmZpZ1snYnVpbGQnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbVNlcnZlcj86IFBhcnRpYWw8VXNlckNvbmZpZ1snc2VydmVyJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gICAqL1xuICBjdXN0b21QcmV2aWV3PzogUGFydGlhbDxVc2VyQ29uZmlnWydwcmV2aWV3J10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5IENTUyBcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUNzcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snY3NzJ10+O1xuICAvKipcbiAgICogQlRDIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgYnRjT3B0aW9ucz86IHtcbiAgICB0eXBlPzogJ2FkbWluJztcbiAgICBzdmc/OiB7XG4gICAgICBza2lwTmFtZXM/OiBzdHJpbmdbXTtcbiAgICB9O1xuICAgIGVwcz86IHtcbiAgICAgIGVuYWJsZT86IGJvb2xlYW47XG4gICAgICBkaXN0Pzogc3RyaW5nO1xuICAgICAgYXBpPzogc3RyaW5nO1xuICAgIH07XG4gIH07XG4gIC8qKlxuICAgKiBWdWVJMThuIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgdnVlSTE4bk9wdGlvbnM/OiB7XG4gICAgaW5jbHVkZT86IHN0cmluZ1tdO1xuICAgIHJ1bnRpbWVPbmx5PzogYm9vbGVhbjtcbiAgfTtcbiAgLyoqXG4gICAqIFFpYW5rdW4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBxaWFua3VuT3B0aW9ucz86IHtcbiAgICB1c2VEZXZNb2RlPzogYm9vbGVhbjtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjggVml0ZSBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxheW91dEFwcFZpdGVDb25maWcob3B0aW9uczogTGF5b3V0QXBwVml0ZUNvbmZpZ09wdGlvbnMpOiBVc2VyQ29uZmlnIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgYXBwRGlyLFxuICAgIHFpYW5rdW5OYW1lLFxuICAgIGN1c3RvbVBsdWdpbnMgPSBbXSxcbiAgICBjdXN0b21CdWlsZCxcbiAgICBjdXN0b21TZXJ2ZXIsXG4gICAgY3VzdG9tUHJldmlldyxcbiAgICBjdXN0b21Dc3MsXG4gICAgYnRjT3B0aW9ucyA9IHt9LFxuICAgIHZ1ZUkxOG5PcHRpb25zLFxuICAgIHFpYW5rdW5PcHRpb25zID0geyB1c2VEZXZNb2RlOiB0cnVlIH0sXG4gIH0gPSBvcHRpb25zO1xuXG4gIC8vIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICBjb25zdCBhcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWUpO1xuICAvLyBcdTRGN0ZcdTc1MjhcdTVCRkNcdTUxNjVcdTc2ODQgY3JlYXRlUGF0aEhlbHBlcnNcbiAgY29uc3QgeyB3aXRoUm9vdCB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICAvLyBcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdTU2RkFcdTVCOUFcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODRcbiAgY29uc3QgYmFzZVVybCA9ICcvJztcbiAgY29uc3QgcHVibGljRGlyID0gZ2V0UHVibGljRGlyKGFwcE5hbWUsIGFwcERpcik7XG5cbiAgLy8gXHU2MjY5XHU1QzU1XHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHVGRjA4XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU3Mjc5XHU2NzA5XHVGRjA5XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWJhc2VSZXNvbHZlIFx1NTcyOFx1NTQwRVx1OTc2Mlx1NjgzOVx1NjM2RSBtb2RlIFx1NTIxQlx1NUVGQVx1RkYwQ1x1OEZEOVx1OTFDQ1x1NTNFQVx1NUI5QVx1NEU0OSBsYXlvdXQgXHU3Mjc5XHU2NzA5XHU3Njg0XHU1MjJCXHU1NDBEXG4gIGNvbnN0IGxheW91dEFsaWFzZXMgPSB7XG4gICAgJ0BsYXlvdXQnOiByZXNvbHZlKGFwcERpciwgJ3NyYycpLFxuICAgICdAc3lzdGVtJzogcmVzb2x2ZShhcHBEaXIsICcuLi9zeXN0ZW0tYXBwL3NyYycpLFxuICAgICdAJzogcmVzb2x2ZShhcHBEaXIsICcuLi9zeXN0ZW0tYXBwL3NyYycpLFxuICAgICdAc2VydmljZXMnOiByZXNvbHZlKGFwcERpciwgJy4uL3N5c3RlbS1hcHAvc3JjL3NlcnZpY2VzJyksXG4gIH07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NTQ4Q1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NUZDNVx1OTg3Qlx1Nzk4MVx1NzUyOCBDRE5cbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgY29uc3QgcGx1Z2luczogYW55W10gPSBbXG4gICAgLy8gMS4gXHU2RTA1XHU3NDA2XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU2Nzg0XHU1RUZBXHU1MjREXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjBDXHU1MzA1XHU2MkVDXHU2NUU3XHU3Njg0IGFzc2V0cyBcdTU0OEMgYXNzZXRzL2xheW91dCBcdTc2RUVcdTVGNTVcdUZGMDlcbiAgICBjbGVhbkRpc3RQbHVnaW4oYXBwRGlyKSxcbiAgICAvLyAyLiBDT1JTIFx1NjNEMlx1NEVGNlxuICAgIGNvcnNQbHVnaW4oKSxcbiAgICAvLyAzLiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcbiAgICAuLi5jdXN0b21QbHVnaW5zLFxuICAgIC8vIDQuIFZ1ZSBcdTYzRDJcdTRFRjZcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGZzOiB7XG4gICAgICAgICAgZmlsZUV4aXN0czogZXhpc3RzU3luYyxcbiAgICAgICAgICByZWFkRmlsZTogKGZpbGU6IHN0cmluZykgPT4gcmVhZEZpbGVTeW5jKGZpbGUsICd1dGYtOCcpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgICAvLyA0LjUuIFZ1ZSBKU1ggXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxIFRTWCBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODQgSlNYIFx1OEJFRFx1NkNENVx1RkYwOVxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEUwRSBjb29sLWFkbWluIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVx1RkYwQ1x1OEJBOVx1NjNEMlx1NEVGNlx1ODFFQVx1NTJBOFx1NTkwNFx1NzQwNlx1NjI0MFx1NjcwOSBKU1gvVFNYIFx1NjU4N1x1NEVGNlxuICAgIHZ1ZUpzeCgpLFxuICAgIC8vIDUuIFVub0NTUyBcdTYzRDJcdTRFRjZcbiAgICBVbm9DU1Moe1xuICAgICAgY29uZmlnRmlsZTogd2l0aFJvb3QoJ3Vuby5jb25maWcudHMnKSxcbiAgICB9KSxcbiAgICAvLyA2LiBCVEMgXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XG4gICAgYnRjKHtcbiAgICAgIHR5cGU6ICdhZG1pbicgYXMgYW55LFxuICAgICAgc3ZnOiB7XG4gICAgICAgIHNraXBOYW1lczogWydiYXNlJywgJ2ljb25zJ10sXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuc3ZnLFxuICAgICAgfSxcbiAgICAgIGVwczoge1xuICAgICAgICBlbmFibGU6IHRydWUsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUVQUyBcdTc2ODQgb3V0cHV0RGlyIFx1NUZDNVx1OTg3Qlx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTdGQVx1NEU4RSBhcHBEaXIgXHU4OUUzXHU2NzkwXG4gICAgICAgIC8vIFx1OTA3Rlx1NTE0RFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NTZFMFx1NEUzQVx1NURFNVx1NEY1Q1x1NzZFRVx1NUY1NVx1NTNEOFx1NTMxNlx1ODAwQ1x1NTcyOCBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwQlx1NTIxQlx1NUVGQSBidWlsZCBcdTc2RUVcdTVGNTVcbiAgICAgICAgZGlzdDogcmVzb2x2ZShhcHBEaXIsICdidWlsZCcsICdlcHMnKSxcbiAgICAgICAgLy8gXHU1MTcxXHU0RUFCXHU3Njg0IEVQUyBcdTY1NzBcdTYzNkVcdTZFOTBcdTc2RUVcdTVGNTVcdUZGMDhcdTRFQ0UgbWFpbi1hcHAgXHU4QkZCXHU1M0Q2XHVGRjA5XG4gICAgICAgIC8vIGxheW91dC1hcHAgXHU0RjE4XHU1MTQ4XHU0RUNFIG1haW4tYXBwIFx1NzY4NCBidWlsZC9lcHMgXHU4QkZCXHU1M0Q2IEVQUyBcdTY1NzBcdTYzNkVcdUZGMENcdTVCOUVcdTczQjBcdTc3MUZcdTZCNjNcdTc2ODRcdTUxNzFcdTRFQUJcbiAgICAgICAgc2hhcmVkRXBzRGlyOiByZXNvbHZlKGFwcERpciwgJy4uL21haW4tYXBwL2J1aWxkL2VwcycpLFxuICAgICAgICBhcGk6ICcvYXBpL2xvZ2luL2Vwcy9jb250cmFjdCcsXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuZXBzLFxuICAgICAgfSxcbiAgICAgIC4uLmJ0Y09wdGlvbnMsXG4gICAgfSksXG4gICAgLy8gNy4gVnVlSTE4biBcdTYzRDJcdTRFRjZcbiAgICBWdWVJMThuUGx1Z2luKHtcbiAgICAgIGluY2x1ZGU6IHZ1ZUkxOG5PcHRpb25zPy5pbmNsdWRlIHx8IFtcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLi9zeXN0ZW0tYXBwL3NyYy9sb2NhbGVzLyoqJyksXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vc3lzdGVtLWFwcC9zcmMve21vZHVsZXMscGx1Z2luc30vKiovbG9jYWxlcy8qKicpLFxuICAgICAgXSxcbiAgICAgIHJ1bnRpbWVPbmx5OiB2dWVJMThuT3B0aW9ucz8ucnVudGltZU9ubHkgPz8gdHJ1ZSxcbiAgICB9KSxcbiAgICAvLyA4LiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXG4gICAgLy8gOS4gXHU3RUM0XHU0RUY2XHU4MUVBXHU1MkE4XHU2Q0U4XHU1MThDXHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgLy8gMTAuIFFpYW5rdW4gXHU2M0QyXHU0RUY2XG4gICAgcWlhbmt1bihxaWFua3VuTmFtZSwgcWlhbmt1bk9wdGlvbnMpLFxuICAgIC8vIDExLiBcdTc4NkVcdTRGREQgc2NyaXB0IFx1NjgwN1x1N0I3RVx1NjcwOSB0eXBlPVwibW9kdWxlXCJcbiAgICB7XG4gICAgICBuYW1lOiAnZW5zdXJlLW1vZHVsZS1zY3JpcHRzJyxcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoXG4gICAgICAgICAgLzxzY3JpcHQoXFxzK1tePl0qKT8+L2dpLFxuICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBhdHRyczogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIGlmICghbWF0Y2guaW5jbHVkZXMoJ3NyYz0nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXR0cnMgJiYgYXR0cnMuaW5jbHVkZXMoJ3R5cGU9JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoLnJlcGxhY2UoL3R5cGU9W1wiJ10/W15cIidcXHM+XStbXCInXT8vaSwgJ3R5cGU9XCJtb2R1bGVcIicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiR7YXR0cnN9PmA7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9IGFzIFBsdWdpbixcbiAgICAvLyAxMi4gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA5XG4gICAgYWRkVmVyc2lvblBsdWdpbigpLFxuICAgIC8vIDEyLjUuIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdTRFNEJcdTU0MEVcdUZGMENcdTc4NkVcdTRGRERcdTcyNDhcdTY3MkNcdTUzRjdcdTUzQzJcdTY1NzBcdTg4QUJcdTRGRERcdTc1NTlcdUZGMDlcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTU0OENcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTVGQzVcdTk4N0JcdTc5ODFcdTc1MjggQ0ROXG4gICAgY2RuQXNzZXRzUGx1Z2luKHtcbiAgICAgIGFwcE5hbWUsXG4gICAgICBlbmFibGVkOiAhaXNQcmV2aWV3QnVpbGQgJiYgcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScsXG4gICAgfSksXG4gICAgLy8gMTUuIFx1Njc4NFx1NUVGQVx1NTQwRVx1NkUwNVx1NzQwNlx1NjNEMlx1NEVGNlx1RkYxQVx1NTIyMFx1OTY2NCAudml0ZSBcdTc2RUVcdTVGNTVcdUZGMDhWaXRlIFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NEUwRFx1NUU5NFx1NTFGQVx1NzNCMFx1NTcyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1RkYwOVxuICAgIHtcbiAgICAgIG5hbWU6ICdjbGVhbi12aXRlLWRpci1wbHVnaW4nLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIGNvbnN0IHZpdGVEaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnLCAnLnZpdGUnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmModml0ZURpcikpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcm1TeW5jKHZpdGVEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnW2NsZWFuLXZpdGUtZGlyLXBsdWdpbl0gXHUyNzA1IFx1NURGMlx1NTIyMFx1OTY2NCBkaXN0Ly52aXRlIFx1NzZFRVx1NUY1NScpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW2NsZWFuLXZpdGUtZGlyLXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTUyMjBcdTk2NjQgZGlzdC8udml0ZSBcdTc2RUVcdTVGNTU6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0gYXMgUGx1Z2luLFxuICAgIC8vIDE2LiBcdTc4NkVcdTRGREQgbWFuaWZlc3QuanNvbiBcdTc1MUZcdTYyMTBcdTYzRDJcdTRFRjZcdUZGMDhcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgY2h1bmtcdUZGMENcdTRFMERcdTRFQzVcdTRFQzVcdTY2MkZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMDlcbiAgICB7XG4gICAgICBuYW1lOiAnZW5zdXJlLW1hbmlmZXN0LXBsdWdpbicsXG4gICAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogYW55LCBidW5kbGU6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgLy8gXHU0RUNFIGJ1bmRsZSBcdTRFMkRcdTYzRDBcdTUzRDZcdTYyNDBcdTY3MDkgY2h1bmsgXHU0RkUxXHU2MDZGXG4gICAgICAgIGNvbnN0IG1hbmlmZXN0OiBSZWNvcmQ8c3RyaW5nLCB7IGZpbGU6IHN0cmluZzsgc3JjPzogc3RyaW5nOyBpc0VudHJ5PzogYm9vbGVhbjsgaW1wb3J0cz86IHN0cmluZ1tdIH0+ID0ge307XG4gICAgICAgIGNvbnN0IGFsbENodW5rczogQXJyYXk8eyBrZXk6IHN0cmluZzsgZmlsZTogc3RyaW5nOyBpc0VudHJ5OiBib29sZWFuOyBwcmlvcml0eTogbnVtYmVyOyBpbXBvcnRzPzogc3RyaW5nW10gfT4gPSBbXTtcbiAgICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NTg3XHU0RUY2XHU1NDBEXHU1MjMwIGtleSBcdTc2ODRcdTY2MjBcdTVDMDRcdUZGMENcdTc1MjhcdTRFOEVcdTY3RTVcdTYyN0UgaW1wb3J0c1xuICAgICAgICBjb25zdCBmaWxlTmFtZVRvS2V5TWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgICAgICAvLyBcdTdCMkNcdTRFMDBcdTkwNERcdTkwNERcdTUzODZcdUZGMUFcdTY1MzZcdTk2QzZcdTYyNDBcdTY3MDkgY2h1bmsgXHU0RkUxXHU2MDZGXG4gICAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICAgIGlmICgoY2h1bmsgYXMgYW55KS50eXBlID09PSAnY2h1bmsnICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICAgICAgLy8gXHU2N0U1XHU2MjdFXHU1QkY5XHU1RTk0XHU3Njg0XHU2RTkwXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gKGNodW5rIGFzIGFueSkuZmFjYWRlTW9kdWxlSWQgfHwgKGNodW5rIGFzIGFueSkubW9kdWxlSWRzPy5bMF0gfHwgZmlsZU5hbWU7XG4gICAgICAgICAgICAvLyBcdTY1MkZcdTYzMDEgYXNzZXRzLyBcdTU0OEMgYXNzZXRzL2xheW91dC8gXHU4REVGXHU1Rjg0XG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVTb3VyY2UgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvKGxheW91dFxcLyk/LywgJycpOyAvLyBcdTRGN0ZcdTc1MjhcdTY1ODdcdTRFRjZcdTU0MERcdTRGNUNcdTRFM0FcdTlFRDhcdThCQTQga2V5XHVGRjA4XHU1M0JCXHU2Mzg5IGFzc2V0cy8gXHU2MjE2IGFzc2V0cy9sYXlvdXQvIFx1NTI0RFx1N0YwMFx1RkYwOVxuXG4gICAgICAgICAgICBpZiAoc291cmNlRmlsZSAmJiB0eXBlb2Ygc291cmNlRmlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU2RTkwXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU0RTJEXHU2M0QwXHU1M0Q2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGNvbnN0IHNyY1BhdGggPSBzb3VyY2VGaWxlLnJlcGxhY2UocmVzb2x2ZShhcHBEaXIsICdzcmMnKSwgJ3NyYycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgICAgICAgaWYgKHNyY1BhdGguc3RhcnRzV2l0aCgnc3JjLycpKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVTb3VyY2UgPSBzcmNQYXRoO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjVFMFx1NkNENVx1NjNEMFx1NTNENlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NEY3Rlx1NzUyOFx1NjU4N1x1NEVGNlx1NTQwRFx1NEY1Q1x1NEUzQSBrZXlcdUZGMDhcdTUzQkJcdTYzODkgYXNzZXRzLyBcdTYyMTYgYXNzZXRzL2xheW91dC8gXHU1MjREXHU3RjAwXHVGRjA5XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVTb3VyY2UgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvKGxheW91dFxcLyk/LywgJycpLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTc4NkVcdTVCOUFcdTY2MkZcdTU0MjZcdTRFM0FcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgICAgICAgIGNvbnN0IGlzRW50cnkgPSAoY2h1bmsgYXMgYW55KS5pc0VudHJ5ID09PSB0cnVlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnaW5kZXgtJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCdtYWluLScpO1xuXG4gICAgICAgICAgICAvLyBcdTc4NkVcdTVCOUFcdTUyQTBcdThGN0RcdTRGMThcdTUxNDhcdTdFQTdcdUZGMDhcdTc1MjhcdTRFOEVcdTYzOTJcdTVFOEZcdUZGMDlcbiAgICAgICAgICAgIGxldCBwcmlvcml0eSA9IDk5OTtcbiAgICAgICAgICAgIGlmIChmaWxlTmFtZS5pbmNsdWRlcygndmVuZG9yLScpICYmICFmaWxlTmFtZS5pbmNsdWRlcygnZWNoYXJ0cy12ZW5kb3InKSkge1xuICAgICAgICAgICAgICBwcmlvcml0eSA9IDE7IC8vIHZlbmRvciBcdTY3MDBcdTUxNDhcdTUyQTBcdThGN0RcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoJ2VjaGFydHMtdmVuZG9yJykpIHtcbiAgICAgICAgICAgICAgcHJpb3JpdHkgPSAyOyAvLyBlY2hhcnRzLXZlbmRvciBcdTUxNzZcdTZCMjFcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoJ21lbnUtcmVnaXN0cnknKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnZXBzLXNlcnZpY2UnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnYXV0aC1hcGknKSkge1xuICAgICAgICAgICAgICBwcmlvcml0eSA9IDM7IC8vIFx1NTE3Nlx1NEVENlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0VudHJ5KSB7XG4gICAgICAgICAgICAgIHByaW9yaXR5ID0gNDsgLy8gXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU2NzAwXHU1NDBFXHU1MkEwXHU4RjdEXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENiBpbXBvcnRzXHVGRjA4XHU0RjlEXHU4RDU2XHU3Njg0IGNodW5rIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOVxuICAgICAgICAgICAgY29uc3QgaW1wb3J0czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rSW1wb3J0cyA9IChjaHVuayBhcyBhbnkpLmltcG9ydHM7XG4gICAgICAgICAgICBpZiAoY2h1bmtJbXBvcnRzICYmIEFycmF5LmlzQXJyYXkoY2h1bmtJbXBvcnRzKSkge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGltcG9ydEZpbGVOYW1lIG9mIGNodW5rSW1wb3J0cykge1xuICAgICAgICAgICAgICAgIGlmIChpbXBvcnRGaWxlTmFtZSAmJiB0eXBlb2YgaW1wb3J0RmlsZU5hbWUgPT09ICdzdHJpbmcnICYmIGltcG9ydEZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICAgICAgICAgICAgaW1wb3J0cy5wdXNoKGltcG9ydEZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1OEMwM1x1OEJENVx1RkYxQVx1OEY5M1x1NTFGQSBpbXBvcnRzIFx1NEZFMVx1NjA2RlxuICAgICAgICAgICAgaWYgKGltcG9ydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSAke2ZpbGVOYW1lfSBcdTc2ODQgaW1wb3J0czpgLCBpbXBvcnRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlsZU5hbWVUb0tleU1hcC5zZXQoZmlsZU5hbWUsIHJlbGF0aXZlU291cmNlKTtcbiAgICAgICAgICAgIGFsbENodW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAga2V5OiByZWxhdGl2ZVNvdXJjZSxcbiAgICAgICAgICAgICAgZmlsZTogZmlsZU5hbWUsXG4gICAgICAgICAgICAgIGlzRW50cnksXG4gICAgICAgICAgICAgIHByaW9yaXR5LFxuICAgICAgICAgICAgICBpbXBvcnRzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2MzA5XHU0RjE4XHU1MTQ4XHU3RUE3XHU2MzkyXHU1RThGXG4gICAgICAgIGFsbENodW5rcy5zb3J0KChhLCBiKSA9PiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eSk7XG5cbiAgICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2NzAwXHU3RUM4XHU3Njg0IG1hbmlmZXN0IFx1NUJGOVx1OEM2MVx1RkYwQ1x1NUMwNiBpbXBvcnRzIFx1NEUyRFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NUJGOVx1NUU5NFx1NzY4NCBrZXlcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBaW1wb3J0cyBcdTRFMkRcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcdTUzRUZcdTgwRkRcdTY2MkZcdTY1RTdcdTc2ODRcdUZGMDhcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU3NTFGXHU2MjEwXHU3Njg0XHVGRjA5XHVGRjBDXG4gICAgICAgIC8vIFx1OTcwMFx1ODk4MVx1OTAxQVx1OEZDN1x1NTdGQVx1Nzg0MFx1NTQwRFx1NzlGMFx1NTMzOVx1OTE0RFx1Njc2NVx1NjI3RVx1NTIzMFx1NjVCMFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgICBhbGxDaHVua3MuZm9yRWFjaChjaHVuayA9PiB7XG4gICAgICAgICAgY29uc3QgaW1wb3J0S2V5czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBpZiAoY2h1bmsuaW1wb3J0cyAmJiBjaHVuay5pbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaW1wb3J0RmlsZU5hbWUgb2YgY2h1bmsuaW1wb3J0cykge1xuICAgICAgICAgICAgICAvLyBcdTUxNDhcdTVDMURcdThCRDVcdTc2RjRcdTYzQTVcdTUzMzlcdTkxNERcdUZGMDhcdTU5ODJcdTY3OUNcdTY1ODdcdTRFRjZcdTU0MERcdTVERjJcdTdFQ0ZcdTY2MkZcdTY1QjBcdTc2ODRcdUZGMDlcbiAgICAgICAgICAgICAgbGV0IGltcG9ydEtleSA9IGZpbGVOYW1lVG9LZXlNYXAuZ2V0KGltcG9ydEZpbGVOYW1lKTtcblxuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTc2RjRcdTYzQTVcdTUzMzlcdTkxNERcdTU5MzFcdThEMjVcdUZGMENcdTVDMURcdThCRDVcdTkwMUFcdThGQzdcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjBcdTUzMzlcdTkxNERcdUZGMDhcdTUzQkJcdTYzODkgaGFzaCBcdTU0OEMgYnVpbGRJZFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoIWltcG9ydEtleSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTkxQVx1NzlDRFx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRlx1RkYxQVxuICAgICAgICAgICAgICAgIC8vIDEuIG5hbWUtWC14eHguanMgKFx1NzI3OVx1NkI4QVx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTk4MiBtZW51LXJlZ2lzdHJ5LUItNDgzaHZHLmpzXHVGRjBDXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREKVxuICAgICAgICAgICAgICAgIC8vIDIuIG5hbWUtaGFzaC1idWlsZElkLmpzIChcdTU5MUFcdTRFMkEgaGFzaCBcdTZCQjVcdUZGMENoYXNoIFx1ODFGM1x1NUMxMSA4IFx1NEUyQVx1NUI1N1x1N0IyNilcbiAgICAgICAgICAgICAgICAvLyAzLiBuYW1lLWhhc2guanMgKFx1NTM1NVx1NEUyQSBoYXNoIFx1NkJCNVx1RkYwQ2hhc2ggXHU4MUYzXHU1QzExIDggXHU0RTJBXHU1QjU3XHU3QjI2KVxuICAgICAgICAgICAgICAgIC8vIDQuIG5hbWUteHh4LmpzIChcdTdCODBcdTUzNTVcdTY4M0NcdTVGMEZcdUZGMEN4eHggXHU1M0VGXHU4MEZEXHU2NjJGXHU3N0VEIGhhc2gpXG4gICAgICAgICAgICAgICAgbGV0IGJhc2VOYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIFx1NEYxOFx1NTE0OFx1NUMxRFx1OEJENVx1NTMzOVx1OTE0RFx1NzI3OVx1NkI4QVx1NjgzQ1x1NUYwRlx1RkYwOFx1NTk4MiBtZW51LXJlZ2lzdHJ5LUItNDgzaHZHLmpzXHVGRjA5XG4gICAgICAgICAgICAgICAgLy8gXHU2ODNDXHU1RjBGXHVGRjFBXHU1N0ZBXHU3ODQwXHU1NDBEXHU3OUYwLVx1NTM1NVx1NEUyQVx1NUI1N1x1N0IyNi1cdTU5MUFcdTRFMkFcdTVCNTdcdTdCMjYuanNcbiAgICAgICAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUE0ODNodkcgXHU1M0VBXHU2NzA5IDYgXHU0RTJBXHU1QjU3XHU3QjI2XHVGRjBDXHU2MjQwXHU0RUU1XHU0RTBEXHU4MEZEXHU4OTgxXHU2QzQyXHU4MUYzXHU1QzExIDggXHU0RTJBXHU1QjU3XHU3QjI2XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY2lhbEhhc2hNYXRjaCA9IGltcG9ydEZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KS0oW0EtWmEtejAtOV0pLShbYS16QS1aMC05XXs0LH0pXFwuanMkLyk7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWNpYWxIYXNoTWF0Y2ggJiYgc3BlY2lhbEhhc2hNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBzcGVjaWFsSGFzaE1hdGNoWzFdID8/IG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NTMzOVx1OTE0RFx1NjgwN1x1NTFDNlx1NjgzQ1x1NUYwRlx1RkYwOFx1NTkxQVx1NEUyQSBoYXNoIFx1NkJCNVx1RkYwOVxuICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlIYXNoTWF0Y2ggPSBpbXBvcnRGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotW2EtekEtWjAtOV17OCx9KSsoPzotW2EtekEtWjAtOV0rKT9cXC5qcyQvKTtcbiAgICAgICAgICAgICAgICAgIGlmIChtdWx0aUhhc2hNYXRjaCAmJiBtdWx0aUhhc2hNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlTmFtZSA9IG11bHRpSGFzaE1hdGNoWzFdID8/IG51bGw7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTUzMzlcdTkxNERcdTUzNTVcdTRFMkEgaGFzaCBcdTZCQjVcdUZGMDhcdTgxRjNcdTVDMTEgOCBcdTRFMkFcdTVCNTdcdTdCMjZcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlSGFzaE1hdGNoID0gaW1wb3J0RmlsZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pLShbYS16QS1aMC05XXs4LH0pXFwuanMkLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaW5nbGVIYXNoTWF0Y2ggJiYgc2luZ2xlSGFzaE1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBzaW5nbGVIYXNoTWF0Y2hbMV0gPz8gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTUzMzlcdTkxNERcdTdCODBcdTUzNTVcdTY4M0NcdTVGMEZcdUZGMDhcdTYzRDBcdTUzRDZcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjBcdUZGMENcdTUzQkJcdTYzODlcdTY3MDBcdTU0MEVcdTRFMDBcdTRFMkEgaGFzaCBcdTZCQjVcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW1wbGVNYXRjaCA9IGltcG9ydEZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KS0oW2EtekEtWjAtOV0rKVxcLmpzJC8pO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzaW1wbGVNYXRjaCAmJiBzaW1wbGVNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBzaW1wbGVNYXRjaFsxXSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgLy8gXHU1NzI4XHU2MjQwXHU2NzA5IGNodW5rIFx1NEUyRFx1NjdFNVx1NjI3RVx1NTMzOVx1OTE0RFx1NzY4NFx1NTdGQVx1Nzg0MFx1NTQwRFx1NzlGMFxuICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbYWN0dWFsRmlsZU5hbWUsIGFjdHVhbEtleV0gb2YgZmlsZU5hbWVUb0tleU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHU1NDBEXHU2ODNDXHU1RjBGXHVGRjA4XHU1M0VGXHU4MEZEXHU1MzA1XHU1NDJCXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjA5XG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3R1YWxCYXNlTmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gXHU1MTQ4XHU1QzFEXHU4QkQ1XHU1MzM5XHU5MTREXHU3Mjc5XHU2QjhBXHU2ODNDXHU1RjBGXHVGRjA4XHU1OTgyIG1lbnUtcmVnaXN0cnktQi00ODNodkctbWoybXR1NDYuanNcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU2ODNDXHU1RjBGXHVGRjFBXHU1N0ZBXHU3ODQwXHU1NDBEXHU3OUYwLVx1NTM1NVx1NEUyQVx1NUI1N1x1N0IyNi1cdTU5MUFcdTRFMkFcdTVCNTdcdTdCMjYtXHU2NUY2XHU5NUY0XHU2MjMzLmpzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFNwZWNpYWxIYXNoTWF0Y2ggPSBhY3R1YWxGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPyktKFtBLVphLXowLTldKS0oW2EtekEtWjAtOV17NCx9KSg/Oi1bYS16QS1aMC05XSspP1xcLmpzJC8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsU3BlY2lhbEhhc2hNYXRjaCAmJiBhY3R1YWxTcGVjaWFsSGFzaE1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQmFzZU5hbWUgPSBhY3R1YWxTcGVjaWFsSGFzaE1hdGNoWzFdID8/IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsTXVsdGlIYXNoTWF0Y2ggPSBhY3R1YWxGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotW2EtekEtWjAtOV17OCx9KSsoPzotW2EtekEtWjAtOV0rKT9cXC5qcyQvKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsTXVsdGlIYXNoTWF0Y2ggJiYgYWN0dWFsTXVsdGlIYXNoTWF0Y2hbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEJhc2VOYW1lID0gYWN0dWFsTXVsdGlIYXNoTWF0Y2hbMV0gPz8gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsU2luZ2xlSGFzaE1hdGNoID0gYWN0dWFsRmlsZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pLShbYS16QS1aMC05XXs4LH0pXFwuanMkLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsU2luZ2xlSGFzaE1hdGNoICYmIGFjdHVhbFNpbmdsZUhhc2hNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxCYXNlTmFtZSA9IGFjdHVhbFNpbmdsZUhhc2hNYXRjaFsxXSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsU2ltcGxlTWF0Y2ggPSBhY3R1YWxGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPyktKFthLXpBLVowLTldKykoPzotW2EtekEtWjAtOV0rKT9cXC5qcyQvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbFNpbXBsZU1hdGNoICYmIGFjdHVhbFNpbXBsZU1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQmFzZU5hbWUgPSBhY3R1YWxTaW1wbGVNYXRjaFsxXSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbEJhc2VOYW1lICYmIGFjdHVhbEJhc2VOYW1lID09PSBiYXNlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGltcG9ydEtleSA9IGFjdHVhbEtleTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSBcdTkwMUFcdThGQzdcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjBcdTUzMzlcdTkxNERcdTYyN0VcdTUyMzAgaW1wb3J0czogJHtpbXBvcnRGaWxlTmFtZX0gLT4gJHthY3R1YWxGaWxlTmFtZX0gKGtleTogJHthY3R1YWxLZXl9KWApO1xuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEVDRFx1NzEzNlx1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMFx1RkYwQ1x1OEY5M1x1NTFGQVx1OEMwM1x1OEJENVx1NEZFMVx1NjA2RlxuICAgICAgICAgICAgICAgICAgaWYgKCFpbXBvcnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLW1hbmlmZXN0LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzAgaW1wb3J0cyBcdTVCRjlcdTVFOTRcdTc2ODRcdTY1ODdcdTRFRjY6ICR7aW1wb3J0RmlsZU5hbWV9IChcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjA6ICR7YmFzZU5hbWV9KWApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRjogJHtpbXBvcnRGaWxlTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoaW1wb3J0S2V5KSB7XG4gICAgICAgICAgICAgICAgaW1wb3J0S2V5cy5wdXNoKGltcG9ydEtleSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLW1hbmlmZXN0LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzAgaW1wb3J0cyBcdTVCRjlcdTVFOTRcdTc2ODRcdTY1ODdcdTRFRjY6ICR7aW1wb3J0RmlsZU5hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtYW5pZmVzdFtjaHVuay5rZXldID0ge1xuICAgICAgICAgICAgZmlsZTogY2h1bmsuZmlsZSxcbiAgICAgICAgICAgIHNyYzogY2h1bmsua2V5LFxuICAgICAgICAgICAgaXNFbnRyeTogY2h1bmsuaXNFbnRyeSxcbiAgICAgICAgICAgIC4uLihpbXBvcnRLZXlzLmxlbmd0aCA+IDAgPyB7IGltcG9ydHM6IGltcG9ydEtleXMgfSA6IHt9KSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTYyN0VcdTUyMzBcdTRFRkJcdTRGNTUgY2h1bmtcdUZGMENcdTRGN0ZcdTc1MjhcdTU2REVcdTkwMDBcdTkwM0JcdThGOTFcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG1hbmlmZXN0KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBjb25zdCBmaXJzdENodW5rID0gT2JqZWN0LmVudHJpZXMoYnVuZGxlKS5maW5kKChbXywgY2h1bmtdKSA9PiAoY2h1bmsgYXMgYW55KS50eXBlID09PSAnY2h1bmsnKTtcbiAgICAgICAgICBpZiAoZmlyc3RDaHVuaykge1xuICAgICAgICAgICAgbWFuaWZlc3RbJ3NyYy9tYWluLnRzJ10gPSB7XG4gICAgICAgICAgICAgIGZpbGU6IGZpcnN0Q2h1bmtbMF0sXG4gICAgICAgICAgICAgIHNyYzogJ3NyYy9tYWluLnRzJyxcbiAgICAgICAgICAgICAgaXNFbnRyeTogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1MTk5XHU1MTY1IG1hbmlmZXN0Lmpzb24gXHU2NTg3XHU0RUY2XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0UGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcsICdtYW5pZmVzdC5qc29uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhtYW5pZmVzdFBhdGgsIEpTT04uc3RyaW5naWZ5KG1hbmlmZXN0LCBudWxsLCAyKSwgJ3V0Zi04Jyk7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLW1hbmlmZXN0LXBsdWdpbl0gXHUyNzA1IFx1NURGMlx1NzUxRlx1NjIxMCBtYW5pZmVzdC5qc29uXHVGRjBDXHU1MzA1XHU1NDJCICR7T2JqZWN0LmtleXMobWFuaWZlc3QpLmxlbmd0aH0gXHU0RTJBIGNodW5rYCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NjVFMFx1NkNENVx1NTE5OVx1NTE2NSBtYW5pZmVzdC5qc29uOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0gYXMgUGx1Z2luLFxuICAgIC8vIDE3LiBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XHVGRjA4XHU0RUM1XHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU0RTE0XHU1NDJGXHU3NTI4XHU2NUY2XHVGRjA5XG4gICAgLi4uKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEID09PSAndHJ1ZScgJiYgcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXICE9PSAndHJ1ZSdcbiAgICAgID8gW3VwbG9hZENkblBsdWdpbihhcHBOYW1lLCBhcHBEaXIpXVxuICAgICAgOiBbXSksXG4gIF07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gIGNvbnN0IGJ1aWxkQ29uZmlnOiBVc2VyQ29uZmlnWydidWlsZCddID0ge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTRFRTNcdTc4MDFcdTUzOEJcdTdGMjlcdUZGMENcdTkwN0ZcdTUxNEQgVGVyc2VyIFx1NTM4Qlx1N0YyOVx1NUJGQ1x1ODFGNFx1NzY4NFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NTIwNlx1OTY5NFx1N0IyNlx1NEUyMlx1NTkzMVx1OTVFRVx1OTg5OFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgb3V0RGlyOiBwcm9jZXNzLmVudi5CVUlMRF9PVVRfRElSIHx8ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTQyRlx1NzUyOCBtYW5pZmVzdCBcdTY1ODdcdTRFRjZcdTc1MUZcdTYyMTBcdUZGMENcdTc1MjhcdTRFOEVcdTUyQThcdTYwMDFcdTUyQTBcdThGN0RcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICBtYW5pZmVzdDogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjggVml0ZSBcdTc2ODRcdTgxRUFcdTUyQThcdTZFMDVcdTc0MDZcdUZGMENcdTU2RTBcdTRFM0FcdTYyMTFcdTRFRUNcdTVERjJcdTdFQ0ZcdTY3MDkgY2xlYW5EaXN0UGx1Z2luIFx1NTcyOFx1Njc4NFx1NUVGQVx1NTI0RFx1NkUwNVx1NzQwNlxuICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFx1RkYwOEVCVVNZXHVGRjA5XG4gICAgLy8gY2xlYW5EaXN0UGx1Z2luIFx1NURGMlx1N0VDRlx1NjcwOVx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwODVcdTZCMjFcdUZGMENcdTkwMTJcdTU4OUVcdTdCNDlcdTVGODVcdTY1RjZcdTk1RjRcdUZGMDlcdUZGMENcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdTRGMUFcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdUZGMENcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTUyMjBcdTk2NjRcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjZcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgcHJlc2VydmVFbnRyeVNpZ25hdHVyZXM6ICdzdHJpY3QnLFxuICAgICAgb253YXJuKHdhcm5pbmc6IGFueSwgd2FybjogKHdhcm5pbmc6IGFueSkgPT4gdm9pZCkge1xuICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScgfHxcbiAgICAgICAgICAgICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ2R5bmFtaWNhbGx5IGltcG9ydGVkJykgJiZcbiAgICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ3N0YXRpY2FsbHkgaW1wb3J0ZWQnKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJiB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ0dlbmVyYXRlZCBhbiBlbXB0eSBjaHVuaycpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1OEZDN1x1NkVFNFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1OEI2Nlx1NTQ0QVx1RkYwOFx1NURGMlx1NzdFNVx1NzY4NFx1NUI4OVx1NTE2OFx1OEI2Nlx1NTQ0QVx1RkYwOVxuICAgICAgICAvLyBcdTVGNTMgc2hhcmVkLWNvbXBvbmVudHMgXHU5MDFBXHU4RkM3IHJlZXhwb3J0IFx1NUJGQ1x1NTFGQVx1N0VDNFx1NEVGNlx1RkYwQ1x1NEUxNFx1N0VDNFx1NEVGNlx1NTQ4Q1x1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1NTcyOFx1NEUwRFx1NTQwQyBjaHVuayBcdTY1RjZcdTRGMUFcdTRFQTdcdTc1MUZcdTZCNjRcdThCNjZcdTU0NEFcbiAgICAgICAgLy8gXHU4RkQ5XHU2NjJGXHU5ODg0XHU2NzFGXHU3Njg0XHU2MkM2XHU1MjA2XHU3QjU2XHU3NTY1XHVGRjBDXHU0RTBEXHU0RjFBXHU1RjcxXHU1NENEXHU1MjlGXHU4MEZEXHVGRjBDXHU1NkUwXHU0RTNBIGNodW5rIFx1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1NURGMlx1N0VDRlx1NkI2M1x1Nzg2RVx1OTE0RFx1N0Y2RVxuICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnQ0lSQ1VMQVJfREVQRU5ERU5DWScgfHxcbiAgICAgICAgICAgICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAod2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCd3YXMgcmVleHBvcnRlZCB0aHJvdWdoIG1vZHVsZScpIHx8XG4gICAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnd2lsbCBlbmQgdXAgaW4gZGlmZmVyZW50IGNodW5rcycpIHx8XG4gICAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnY2lyY3VsYXIgZGVwZW5kZW5jeScpKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICAgIH0sXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFsYXlvdXQtYXBwIFx1NEY1Q1x1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwQ1x1OTcwMFx1ODk4MVx1NjI1M1x1NTMwNSBzaW5nbGUtc3BhIFx1NTQ4QyBxaWFua3VuXG4gICAgICAvLyBcdTRFMERcdTVDMDZcdTVCODNcdTRFRUNcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMENcdTc4NkVcdTRGRERcdTVCODNcdTRFRUNcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMkRcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgIC8vIHZpdGUtcGx1Z2luIFx1NjYyRlx1Njc4NFx1NUVGQVx1NjVGNlx1NjNEMlx1NEVGNlx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEVFM1x1NzgwMVx1NEUyRFxuICAgICAgICAnQGJ0Yy92aXRlLXBsdWdpbicsXG4gICAgICAgIC9eQGJ0Y1xcL3ZpdGUtcGx1Z2luLyxcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1biBcdTRFMERcdTU3MjhcdThGRDlcdTkxQ0NcdUZGMENcdTVCODNcdTRFRUNcdTRGMUFcdTg4QUJcdTYyNTNcdTUzMDVcbiAgICAgIF0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZm9ybWF0OiAnZXNtJyxcbiAgICAgICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IGZhbHNlLFxuICAgICAgICBtYW51YWxDaHVua3MoaWQ6IHN0cmluZykge1xuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTE0OFx1NTkwNFx1NzQwNiBWdWUgXHU2ODM4XHU1RkMzXHU0RjlEXHU4RDU2XHVGRjBDXHU3ODZFXHU0RkREIHZlbmRvciBjaHVuayBcdTU3MjggZWNoYXJ0cy12ZW5kb3IgXHU0RTRCXHU1MjREXHU1MkEwXHU4RjdEXG4gICAgICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIGVjaGFydHMtdmVuZG9yIFx1NTcyOCB2ZW5kb3IgXHU0RTRCXHU1MjREXHU1MkEwXHU4RjdEXHU1QkZDXHU4MUY0XHU3Njg0XHU2QTIxXHU1NzU3XHU1MjFEXHU1OUNCXHU1MzE2XHU5ODdBXHU1RThGXHU5NUVFXHU5ODk4XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9lbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3BpbmlhJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdnVldXNlJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbG9kYXNoJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdnVlJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb3JlJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC11dGlscycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQXZ1ZS1lY2hhcnRzIFx1NEY5RFx1OEQ1Nlx1NEU4RSBWdWVcdUZGMENcdTYyNDBcdTRFRTVcdTVFOTRcdThCRTVcdTY1M0VcdTU3MjggdmVuZG9yIFx1NEU0Qlx1NTQwRVx1NTkwNFx1NzQwNlxuICAgICAgICAgIC8vIFx1NEY0Nlx1NEUzQVx1NEU4Nlx1NEZERFx1NjMwMVx1NTIwNlx1NzlCQlx1RkYwQ1x1NjIxMVx1NEVFQ1x1NEVDRFx1NzEzNlx1NUMwNlx1NTE3Nlx1NjUzRVx1NTcyOCBlY2hhcnRzLXZlbmRvciBcdTRFMkRcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdThGRDlcdTg5ODFcdTZDNDIgdmVuZG9yIFx1NTcyOCBlY2hhcnRzLXZlbmRvciBcdTRFNEJcdTUyNERcdTUyQTBcdThGN0RcdUZGMDhcdTkwMUFcdThGQzcgSFRNTCBcdTRFMkRcdTc2ODRcdTk4N0FcdTVFOEZcdTRGRERcdThCQzFcdUZGMDlcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy96cmVuZGVyJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtZWNoYXJ0cycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2VjaGFydHMtdmVuZG9yJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd2aXJ0dWFsOmVwcycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdcXFxcMHZpcnR1YWw6ZXBzJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3NlcnZpY2VzL2VwcycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlc1xcXFxlcHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdlcHMtc2VydmljZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvc3ViYXBwLW1hbmlmZXN0cycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdtZW51LXJlZ2lzdHJ5JztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2xpYi1tb25hY28nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy90aHJlZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2xpYi10aHJlZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHByZXNlcnZlTW9kdWxlczogZmFsc2UsXG4gICAgICAgIGdlbmVyYXRlZENvZGU6IHtcbiAgICAgICAgICBjb25zdEJpbmRpbmdzOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4IGFzc2V0cy9sYXlvdXQvIFx1NzZFRVx1NUY1NVx1RkYwQ1x1NEUwRVx1NUI1MFx1NUU5NFx1NzUyOFx1NzY4NCBhc3NldHMvIFx1NzZFRVx1NUY1NVx1NTMzQVx1NTIwNlx1NUYwMFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9sYXlvdXQvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQWxheW91dC1hcHAgXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU0RjdGXHU3NTI4XHU3QTMzXHU1QjlBXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjBDXHU5MDdGXHU1MTREXHU2NUU3IGluZGV4Lmh0bWwvXHU2NUU3XHU1RjE1XHU3NTI4XHU1QkZDXHU4MUY0XHU3Njg0IGluZGV4LXh4eC5qcyA0MDRcbiAgICAgICAgLy8gXHU5MTREXHU1NDA4IE5naW54XHVGRjFBYXNzZXRzL2xheW91dC9pbmRleC5qcyBcdThCQkVcdTdGNkUgbm8tY2FjaGVcdUZGMUJcdTUxNzZcdTRGNTkgaGFzaCBcdTY1ODdcdTRFRjYgaW1tdXRhYmxlXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2xheW91dC9bbmFtZV0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9sYXlvdXQvW25hbWVdLVtoYXNoXS5jc3MnO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9sYXlvdXQvW25hbWVdLVtoYXNoXS5bZXh0XSc7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLi4uY3VzdG9tQnVpbGQsXG4gIH07XG5cbiAgLy8gXHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gIGNvbnN0IHNlcnZlckNvbmZpZzogVXNlckNvbmZpZ1snc2VydmVyJ10gPSB7XG4gICAgcG9ydDogYXBwQ29uZmlnLmRldlBvcnQsXG4gICAgaG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBvcGVuOiBmYWxzZSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICB9LFxuICAgIGZzOiB7XG4gICAgICBhbGxvdzogW1xuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uJyksXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vc3lzdGVtLWFwcCcpLFxuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uLycpLFxuICAgICAgXSxcbiAgICB9LFxuICAgIC4uLmN1c3RvbVNlcnZlcixcbiAgfTtcblxuICAvLyBcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU0RUNFXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0IGRpc3Qve3Byb2RIb3N0fSBcdThCRkJcdTUzRDZcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTRFQ0UgYXBwcy97YXBwTmFtZX0vZGlzdCBcdThCRkJcdTUzRDZcbiAgY29uc3Qgcm9vdERpc3REaXIgPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL2Rpc3QnKTtcbiAgY29uc3QgcHJldmlld1Jvb3QgPSByZXNvbHZlKHJvb3REaXN0RGlyLCBhcHBDb25maWcucHJvZEhvc3QpO1xuXG4gIGNvbnN0IHByZXZpZXdDb25maWc6IFVzZXJDb25maWdbJ3ByZXZpZXcnXSA9IHtcbiAgICBwb3J0OiBhcHBDb25maWcucHJlUG9ydCxcbiAgICBob3N0OiBhcHBDb25maWcucHJlSG9zdCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIG9wZW46IGZhbHNlLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEJCRVx1N0Y2RVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1NzY4NFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUzQSBkaXN0L3twcm9kSG9zdH1cbiAgICByb290OiBwcmV2aWV3Um9vdCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICB9LFxuICAgIC4uLmN1c3RvbVByZXZpZXcsXG4gIH07XG5cbiAgLy8gQ1NTIFx1OTE0RFx1N0Y2RVxuICBjb25zdCBjc3NDb25maWc6IFVzZXJDb25maWdbJ2NzcyddID0ge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJywgJ2ltcG9ydCddLFxuICAgICAgfSxcbiAgICB9LFxuICAgIC4uLmN1c3RvbUNzcyxcbiAgfTtcblxuICAvLyBcdTRGMThcdTUzMTZcdTRGOURcdThENTZcdTkxNERcdTdGNkVcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2QkNGXHU0RTJBXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU3MkVDXHU3QUNCXHU3Njg0XHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTBEXHU1NDBDXHU1RTk0XHU3NTI4XHU3Njg0XHU5MTREXHU3RjZFXHU1REVFXHU1RjAyXHU1QkZDXHU4MUY0XHU3RjEzXHU1QjU4XHU1MUIyXHU3QTgxXG4gIGNvbnN0IGFwcENhY2hlRGlyID0gcmVzb2x2ZShhcHBEaXIsICdub2RlX21vZHVsZXMvLnZpdGUnKTtcblxuICBjb25zdCBvcHRpbWl6ZURlcHNDb25maWc6IFVzZXJDb25maWdbJ29wdGltaXplRGVwcyddID0ge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgIC8vIFx1NjgzOFx1NUZDM1x1NEY5RFx1OEQ1Nlx1RkYxQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NUI4OVx1ODhDNVx1NzY4NFx1NEY5RFx1OEQ1NlxuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAgJ2VsZW1lbnQtcGx1cycsXG4gICAgICAvLyBXaW5zdG9uIFx1OTcwMFx1ODk4MVx1NzY4NCBOb2RlLmpzIFx1NkEyMVx1NTc1NyBwb2x5ZmlsbFxuICAgICAgJ3V0aWwnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcycsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL3poLWNuJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvZW4nLFxuICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU1REYyXHU0RUNFIGluY2x1ZGUgXHU0RTJEXHU3OUZCXHU5NjY0XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJyxcbiAgICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnLFxuICAgICAgJ3ZpdGUtcGx1Z2luLXFpYW5rdW4vZGlzdC9oZWxwZXInLFxuICAgICAgJ3FpYW5rdW4nLFxuICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAvLyBsYXlvdXQtYXBwIFx1NUI5RVx1OTY0NVx1NUI4OVx1ODhDNVx1NzY4NFx1NEY5RFx1OEQ1NlxuICAgICAgJ3Z1ZS1pMThuJyxcbiAgICAgICdheGlvcycsXG4gICAgICAnZWNoYXJ0cycsXG4gICAgICAndnVlLWVjaGFydHMnLFxuICAgICAgJ21pdHQnLFxuICAgICAgJ25wcm9ncmVzcycsXG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFsdW5yIFx1NTQ4QyBmaWxlLXNhdmVyIFx1NEUwRFx1NjYyRlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NUI4OVx1ODhDNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1NTcyOCBpbmNsdWRlIFx1NEUyRFx1NUYzQVx1NTIzNlx1NThGMFx1NjYwRVxuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1RTk0XHU3NTI4XHU1Qjg5XHU4OEM1XHU0RTg2XHU4RkQ5XHU0RTlCXHU0RjlEXHU4RDU2XHVGRjBDVml0ZSBcdTRGMUFcdTU3MjhcdTYyNkJcdTYzQ0YgZW50cmllcyBcdTY1RjZcdTgxRUFcdTUyQThcdTUzRDFcdTczQjBcdTVFNzZcdTRGMThcdTUzMTZcbiAgICAgIC8vICdsdW5yJywgLy8gXHU1M0VBXHU1NzI4IHNoYXJlZC1jb21wb25lbnRzIFx1NEUyRFx1NEY3Rlx1NzUyOFx1RkYwQ1x1NEUwRFx1NjYyRlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NUI4OVx1ODhDNVxuICAgICAgLy8gJ2ZpbGUtc2F2ZXInLCAvLyBcdTUzRUFcdTU3MjhcdTkwRThcdTUyMDZcdTVFOTRcdTc1MjhcdTRFMkRcdTRGN0ZcdTc1MjhcdUZGMENcdTRFMERcdTY2MkZcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTVCODlcdTg4QzVcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEVFNVx1NEUwQlx1NEY5RFx1OEQ1Nlx1NEUwRFx1NjYyRlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NzZGNFx1NjNBNVx1NUI4OVx1ODhDNVx1RkYwQ1x1NUI4M1x1NEVFQ1x1OTAxQVx1OEZDNyBAYnRjL3NoYXJlZC1jb21wb25lbnRzIFx1OTVGNFx1NjNBNVx1NEY3Rlx1NzUyOFxuICAgICAgLy8gVml0ZSBcdTRGMUFcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTgxRUFcdTUyQThcdTUzRDFcdTczQjBcdTVFNzZcdTRGMThcdTUzMTZcdThGRDlcdTRFOUJcdTRGOURcdThENTZcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTU3MjggaW5jbHVkZSBcdTRFMkRcdTY2M0VcdTVGMEZcdTU4RjBcdTY2MEVcbiAgICBdLFxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUBidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlIFx1NjYyRlx1NjcyQ1x1NTczMFx1NTIyQlx1NTQwRFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1NjYyRiBucG0gXHU1MzA1XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU0RjE4XHU1MzE2XG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFleGNsdWRlIFx1NTNFQVx1NjUyRlx1NjMwMVx1NUI1N1x1N0IyNlx1NEUzMlx1NkEyMVx1NUYwRlx1RkYwQ1x1NEUwRFx1NjUyRlx1NjMwMVx1NkI2M1x1NTIxOVx1ODg2OFx1OEZCRVx1NUYwRlxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjM5Mlx1OTY2NCBAYnRjL3NoYXJlZC1jb21wb25lbnRzXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU2NjJGXHU2NzJDXHU1NzMwXHU1MzA1XHVGRjBDXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIEpTWCBcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICBdLFxuICAgIGZvcmNlOiBmYWxzZSxcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRFMERcdTUxOERcdTUzMDVcdTU0MkIgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2luZGV4LnRzXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcdUZGMENcdTVFOTRcdThCRTVcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTc2RjRcdTYzQTVcdTU5MDRcdTc0MDZcbiAgICBlbnRyaWVzOiBbXG4gICAgICByZXNvbHZlKGFwcERpciwgJ3NyYy9tYWluLnRzJyksXG4gICAgXSxcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgcGx1Z2luczogW10sXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTRGOURcdThENTZcdTk4ODRcdTY3ODRcdTVFRkFcdTY1RjZcdTRFNUZcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBKU1ggXHU4RjZDXHU2MzYyXHU2NUI5XHU1RjBGXG4gICAgICBqc3g6ICdwcmVzZXJ2ZScsIC8vIFx1NEZERFx1NzU1OSBKU1hcdUZGMENcdThCQTkgdnVlSnN4IFx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgICAganN4RmFjdG9yeTogJ2gnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1NEY1Q1x1NEUzQSBKU1ggXHU1REU1XHU1MzgyXHU1MUZEXHU2NTcwXG4gICAgICBqc3hGcmFnbWVudDogJ0ZyYWdtZW50JywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgRnJhZ21lbnRcbiAgICB9LFxuICB9O1xuXG4gIC8vIFx1OEZENFx1NTZERVx1NUI4Q1x1NjU3NFx1OTE0RFx1N0Y2RVxuICAvLyBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcdUZGMDhcdTU2RTBcdTRFM0FcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVx1RkYwOVxuICBjb25zdCBiYXNlUmVzb2x2ZSA9IGNyZWF0ZUJhc2VSZXNvbHZlKGFwcERpciwgYXBwTmFtZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBiYXNlOiBiYXNlVXJsLFxuICAgIHB1YmxpY0RpcixcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTcyRUNcdTdBQ0JcdTc2ODRcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMERcdTU0MENcdTVFOTRcdTc1MjhcdTc2ODRcdTkxNERcdTdGNkVcdTVERUVcdTVGMDJcdTVCRkNcdTgxRjRcdTdGMTNcdTVCNThcdTUxQjJcdTdBODFcbiAgICBjYWNoZURpcjogYXBwQ2FjaGVEaXIsXG4gICAgZGVmaW5lOiB7XG4gICAgICAvLyBcdTRFM0FcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTYzRDBcdTRGOUIgcHJvY2VzcyBcdTVCRjlcdThDNjFcdUZGMENXaW5zdG9uIFx1OTcwMFx1ODk4MVx1NUI4M1xuICAgICAgJ3Byb2Nlc3MuZW52JzogJ3t9JyxcbiAgICAgICdwcm9jZXNzLnBsYXRmb3JtJzogSlNPTi5zdHJpbmdpZnkoJ2Jyb3dzZXInKSxcbiAgICAgICdwcm9jZXNzLnZlcnNpb24nOiBKU09OLnN0cmluZ2lmeSgnJyksXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAuLi5iYXNlUmVzb2x2ZSxcbiAgICAgIC8vIFx1NTQwOFx1NUU3Nlx1NTIyQlx1NTQwRFx1RkYxQWJhc2VSZXNvbHZlLmFsaWFzIFx1NjYyRlx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1RkYwQ2xheW91dEFsaWFzZXMgXHU2NjJGXHU1QkY5XHU4QzYxXHU1RjYyXHU1RjBGXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFsYXlvdXRBbGlhc2VzIFx1NEUyRFx1NzY4NFx1NTIyQlx1NTQwRFx1NUZDNVx1OTg3Qlx1NjUzRVx1NTcyOFx1NjU3MFx1N0VDNFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwOFx1NzI3OVx1NTIyQlx1NjYyRiBAIFx1NTIyQlx1NTQwRFx1RkYwOVxuICAgICAgYWxpYXM6IEFycmF5LmlzQXJyYXkoYmFzZVJlc29sdmU/LmFsaWFzKVxuICAgICAgICA/IFtcbiAgICAgICAgICAgIC8vIGxheW91dC1hcHAgXHU3Mjc5XHU2NzA5XHU3Njg0XHU1MjJCXHU1NDBEXHU2NTNFXHU1NzI4XHU1MjREXHU5NzYyXHVGRjBDXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXG4gICAgICAgICAgICAuLi5PYmplY3QuZW50cmllcyhsYXlvdXRBbGlhc2VzKS5tYXAoKFtmaW5kLCByZXBsYWNlbWVudF0pID0+ICh7XG4gICAgICAgICAgICAgIGZpbmQsXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50LFxuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgLy8gXHU4RkM3XHU2RUU0XHU2Mzg5IGJhc2VSZXNvbHZlLmFsaWFzIFx1NEUyRFx1NEUwRSBsYXlvdXRBbGlhc2VzIFx1NTFCMlx1N0E4MVx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NTk4MiBAXHVGRjA5XG4gICAgICAgICAgICAuLi5iYXNlUmVzb2x2ZS5hbGlhcy5maWx0ZXIoKGFsaWFzKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgYWxpYXMuZmluZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShhbGlhcy5maW5kIGluIGxheW91dEFsaWFzZXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXVxuICAgICAgICA6IHtcbiAgICAgICAgICAgIC4uLihiYXNlUmVzb2x2ZT8uYWxpYXMgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8fCB7fSksXG4gICAgICAgICAgICAuLi5sYXlvdXRBbGlhc2VzLFxuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zLFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIGNoYXJzZXQ6ICd1dGY4JyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCBlc2J1aWxkIFx1NkI2M1x1Nzg2RVx1NTkwNFx1NzQwNiBKU1hcdUZGMENcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1ODAwQ1x1NEUwRFx1NjYyRiBSZWFjdC5jcmVhdGVFbGVtZW50XG4gICAgICAvLyBcdThGRDlcdTY4MzdcdTUzNzNcdTRGN0YgZXNidWlsZCBcdTU5MDRcdTc0MDZcdTY3RDBcdTRFOUIgSlNYIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEU1Rlx1NEYxQVx1NEY3Rlx1NzUyOFx1NkI2M1x1Nzg2RVx1NzY4NFx1OEY2Q1x1NjM2Mlx1NjVCOVx1NUYwRlxuICAgICAganN4OiAncHJlc2VydmUnLCAvLyBcdTRGRERcdTc1NTkgSlNYXHVGRjBDXHU4QkE5IHZ1ZUpzeCBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgICAganN4RnJhZ21lbnQ6ICdGcmFnbWVudCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEZyYWdtZW50XG4gICAgfSxcbiAgICBzZXJ2ZXI6IHNlcnZlckNvbmZpZyxcbiAgICBwcmV2aWV3OiBwcmV2aWV3Q29uZmlnLFxuICAgIGNzczogY3NzQ29uZmlnLFxuICAgIGJ1aWxkOiBidWlsZENvbmZpZyxcbiAgICBvcHRpbWl6ZURlcHM6IG9wdGltaXplRGVwc0NvbmZpZyxcbiAgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcXFxccGF0aC1oZWxwZXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHNcIjsvKipcbiAqIFx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxuICogXHU2M0QwXHU0RjlCXHU3RURGXHU0RTAwXHU3Njg0XHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU1MUZEXHU2NTcwXHVGRjBDXHU3NTI4XHU0RThFIFZpdGUgXHU5MTREXHU3RjZFXHU0RTJEXHU3Njg0XHU1MjJCXHU1NDBEXHU1NDhDXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXG4gKi9cblxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIFx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyOiBzdHJpbmcpIHtcbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MFx1NUU5NFx1NzUyOCBzcmMgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB3aXRoU3JjID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiByZXNvbHZlKGFwcERpciwgcmVsYXRpdmVQYXRoKTtcblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIHBhY2thZ2VzIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFBhY2thZ2VzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzJywgcmVsYXRpdmVQYXRoKTtcblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwXHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB3aXRoUm9vdCA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLicsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBjb25maWdzIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aENvbmZpZ3MgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vY29uZmlncycsIHJlbGF0aXZlUGF0aCk7XG5cbiAgcmV0dXJuIHsgd2l0aFNyYywgd2l0aFBhY2thZ2VzLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhdXRvLWltcG9ydC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHNcIjtcdUZFRkYvKipcbiAqIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVx1NkEyMVx1Njc3RlxuICogXHU0RjlCXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHVGRjA4YWRtaW4tYXBwLCBsb2dpc3RpY3MtYXBwIFx1N0I0OVx1RkYwOVx1NEY3Rlx1NzUyOFxuICovXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIEF1dG8gSW1wb3J0IFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpIHtcbiAgcmV0dXJuIEF1dG9JbXBvcnQoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgIHtcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiBbXG4gICAgICAgICAgJ3VzZUNydWQnLFxuICAgICAgICAgICd1c2VEaWN0JyxcbiAgICAgICAgICAndXNlUGVybWlzc2lvbicsXG4gICAgICAgICAgJ3VzZVJlcXVlc3QnLFxuICAgICAgICAgICdjcmVhdGVJMThuUGx1Z2luJyxcbiAgICAgICAgICAndXNlSTE4bicsXG4gICAgICAgIF0sXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IFtcbiAgICAgICAgICAnZm9ybWF0RGF0ZScsXG4gICAgICAgICAgJ2Zvcm1hdERhdGVUaW1lJyxcbiAgICAgICAgICAnZm9ybWF0TW9uZXknLFxuICAgICAgICAgICdmb3JtYXROdW1iZXInLFxuICAgICAgICAgICdpc0VtYWlsJyxcbiAgICAgICAgICAnaXNQaG9uZScsXG4gICAgICAgICAgJ3N0b3JhZ2UnLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcbiAgICAgIH0pLFxuICAgIF0sXG5cbiAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxuXG4gICAgZXNsaW50cmM6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxuICAgIH0sXG5cbiAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU5ODlEXHU1OTE2XHU3Njg0XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFXHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHVGRjA5XG4gICAqL1xuICBleHRyYURpcnM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xuICAgKi9cbiAgaW5jbHVkZVNoYXJlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENvbXBvbmVudHMgXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudHNDb25maWcob3B0aW9uczogQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IGV4dHJhRGlycyA9IFtdLCBpbmNsdWRlU2hhcmVkID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICBjb25zdCBkaXJzID0gW1xuICAgICdzcmMvY29tcG9uZW50cycsIC8vIFx1NUU5NFx1NzUyOFx1N0VBN1x1N0VDNFx1NEVGNlxuICAgIC4uLmV4dHJhRGlycywgLy8gXHU5ODlEXHU1OTE2XHU3Njg0XHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XG4gIF07XG5cbiAgLy8gXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHVGRjBDXHU2REZCXHU1MkEwXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XG4gIGlmIChpbmNsdWRlU2hhcmVkKSB7XG4gICAgLy8gXHU2REZCXHU1MkEwXHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XHVGRjBDXHU2NTJGXHU2MzAxXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XG4gICAgZGlycy5wdXNoKFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Jhc2ljJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9sYXlvdXQnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Zvcm0nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2RhdGEnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2ZlZWRiYWNrJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9vdGhlcnMnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBDb21wb25lbnRzKHtcbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RCBWaXRlIHJlbG9hZGluZ1xuICAgICAgfSksXG4gICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTg5RTNcdTY3OTBcdTU2NjhcdUZGMUFAYnRjL3NoYXJlZC1jb21wb25lbnRzXG4gICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICAvLyBcdTVDMDYga2ViYWItY2FzZSBcdThGNkNcdTYzNjJcdTRFM0EgUGFzY2FsQ2FzZVxuICAgICAgICAvLyBcdTRGOEJcdTU5ODI6IGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgIGNvbnN0IGNvbnZlcnRUb1Bhc2NhbENhc2UgPSAobmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdCdGMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7IC8vIFx1NURGMlx1N0VDRlx1NjYyRiBQYXNjYWxDYXNlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgICAgLy8gYnRjLXN2ZyAtPiBCdGNTdmdcbiAgICAgICAgICAgIHJldHVybiBuYW1lXG4gICAgICAgICAgICAgIC5zcGxpdCgnLScpXG4gICAgICAgICAgICAgIC5tYXAocGFydCA9PiBwYXJ0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFydC5zbGljZSgxKSlcbiAgICAgICAgICAgICAgLmpvaW4oJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdCdGMnKSB8fCBjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgIGNvbnN0IHBhc2NhbE5hbWUgPSBjb252ZXJ0VG9QYXNjYWxDYXNlKGNvbXBvbmVudE5hbWUpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwYXNjYWxOYW1lLFxuICAgICAgICAgICAgZnJvbTogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSxcbiAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICBkaXJzLFxuICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ3RzeCddLCAvLyBcdTY1MkZcdTYzMDEgLnZ1ZSBcdTU0OEMgLnRzeCBcdTY1ODdcdTRFRjZcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTkxQ0RcdTY1QjBcdTYyNkJcdTYzQ0ZcdTdFQzRcdTRFRjZcbiAgICBkZWVwOiB0cnVlLFxuICAgIC8vIFx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOSBCdGMgXHU1RjAwXHU1OTM0XHU3Njg0XHU3RUM0XHU0RUY2XG4gICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnRzeCQvLCAvQnRjW0EtWl0vLCAvYnRjLVthLXpdL10sXG4gIH0pO1xufVxuLy8gVVRGLTggZW5jb2RpbmcgZml4XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGUtYXBwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUtYXBwLWNvbmZpZy50c1wiOy8qKlxuICogVml0ZSBcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIFx1NzUyOFx1NEU4RVx1NEVDRVx1N0VERlx1NEUwMFx1OTE0RFx1N0Y2RVx1NEUyRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICovXG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEFwcENvbmZpZyB9IGZyb20gJy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnJztcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdUZGMDhcdTc1MjhcdTRFOEUgdml0ZS5jb25maWcudHNcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZpdGVBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKToge1xuICBkZXZQb3J0OiBudW1iZXI7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgcHJlUG9ydDogbnVtYmVyO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByb2RIb3N0OiBzdHJpbmc7XG4gIG1haW5BcHBPcmlnaW46IHN0cmluZztcbn0ge1xuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XG4gIGlmICghYXBwQ29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdTY3MkFcdTYyN0VcdTUyMzAgJHthcHBOYW1lfSBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVgKTtcbiAgfVxuXG4gIGNvbnN0IG1haW5BcHBDb25maWcgPSBnZXRBcHBDb25maWcoJ21haW4tYXBwJyk7XG4gIGNvbnN0IG1haW5BcHBPcmlnaW4gPSBtYWluQXBwQ29uZmlnXG4gICAgPyBgaHR0cDovLyR7bWFpbkFwcENvbmZpZy5wcmVIb3N0fToke21haW5BcHBDb25maWcucHJlUG9ydH1gXG4gICAgOiAnaHR0cDovL2xvY2FsaG9zdDo0MTgwJztcblxuICByZXR1cm4ge1xuICAgIGRldlBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5kZXZQb3J0LCAxMCksXG4gICAgZGV2SG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgcHJlUG9ydDogcGFyc2VJbnQoYXBwQ29uZmlnLnByZVBvcnQsIDEwKSxcbiAgICBwcmVIb3N0OiBhcHBDb25maWcucHJlSG9zdCxcbiAgICBwcm9kSG9zdDogYXBwQ29uZmlnLnByb2RIb3N0LFxuICAgIG1haW5BcHBPcmlnaW4sXG4gIH07XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU3QzdCXHU1NzhCXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEByZXR1cm5zIFx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwVHlwZShhcHBOYW1lOiBzdHJpbmcpOiAnbWFpbicgfCAnc3ViJyB8ICdsYXlvdXQnIHtcbiAgaWYgKGFwcE5hbWUgPT09ICdtYWluLWFwcCcpIHJldHVybiAnbWFpbic7XG4gIGlmIChhcHBOYW1lID09PSAnbGF5b3V0LWFwcCcpIHJldHVybiAnbGF5b3V0JztcbiAgcmV0dXJuICdzdWInOyAvLyBcdTUxNzZcdTRFRDZcdTkwRkRcdTY2MkZcdTVCNTBcdTVFOTRcdTc1Mjhcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgYmFzZSBVUkxcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHBhcmFtIGlzUHJldmlld0J1aWxkIFx1NjYyRlx1NTQyNlx1NEUzQVx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVxuICogQHJldHVybnMgYmFzZSBVUkxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwoYXBwTmFtZTogc3RyaW5nLCBpc1ByZXZpZXdCdWlsZDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xuICBpZiAoIWFwcENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XG4gIH1cbiAgXG4gIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICByZXR1cm4gYGh0dHA6Ly8ke2FwcENvbmZpZy5wcmVIb3N0fToke2FwcENvbmZpZy5wcmVQb3J0fS9gO1xuICB9XG4gIFxuICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTRGN0ZcdTc1MjhcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDhcdThCQTlcdTZENEZcdTg5QzhcdTU2NjhcdTY4MzlcdTYzNkVcdTU3REZcdTU0MERcdTgxRUFcdTUyQThcdTg5RTNcdTY3OTBcdUZGMDlcbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1QjUwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU1OTgyIHByb2R1Y3Rpb24uYmVsbGlzLmNvbS5jblx1RkYwOVxuICByZXR1cm4gJy8nO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBwdWJsaWNEaXIgXHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyBwdWJsaWNEaXIgXHU4REVGXHU1Rjg0XHU2MjE2IGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQdWJsaWNEaXIoYXBwTmFtZTogc3RyaW5nLCBhcHBEaXI6IHN0cmluZyk6IHN0cmluZyB8IGZhbHNlIHtcbiAgLy8gbWFpbi1hcHBcdTMwMDFhZG1pbi1hcHAgXHU1NDhDIHN5c3RlbS1hcHAgXHU0RjdGXHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcbiAgaWYgKGFwcE5hbWUgPT09ICdtYWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ2FkbWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ3N5c3RlbS1hcHAnKSB7XG4gICAgcmV0dXJuIHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XG4gIH1cbiAgXG4gIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTE3MVx1NEVBQlx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XG4gIHJldHVybiByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYycpO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXGNvbmZpZ3NcXFxcYXBwLWVudi5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHNcIjsvLyBcdTZDRThcdTYxMEZcdUZGMUFcdThGRDlcdTkxQ0NcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgbG9nZ2VyXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjU4XHU1NzI4XHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHVGRjFBXG4vLyBsb2dnZXIgLT4gZW52LWluZm8gLT4gdW5pZmllZC1lbnYtY29uZmlnIC0+IGFwcC1lbnYuY29uZmlnIC0+IGxvZ2dlclxuLy8gXHU1NzI4XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU3Njg0XHU2NUU5XHU2NzFGXHU5NjM2XHU2QkI1XHVGRjBDbG9nZ2VyIFx1NTNFRlx1ODBGRFx1OEZEOFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwQ1x1NjI0MFx1NEVFNVx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOCBjb25zb2xlXG4vLyBjb25zb2xlIFx1NjYyRlx1NTE2OFx1NUM0MFx1NUJGOVx1OEM2MVx1RkYwQ1x1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NjVGNlx1NUMzMVx1NURGMlx1N0VDRlx1NUI1OFx1NTcyOFx1RkYwQ1x1NEUwRFx1NEYxQVx1NTNEN1x1NTIzMFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NzY4NFx1NUY3MVx1NTRDRFxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlL2NsaWVudFwiIC8+XG5cbi8qKlxuICogXHU3RURGXHU0RTAwXHU3Njg0XHU1RTk0XHU3NTI4XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTkwRkRcdTRFQ0VcdThGRDlcdTkxQ0NcdThCRkJcdTUzRDZcdUZGMENcdTkwN0ZcdTUxNERcdTRFOENcdTRFNDlcdTYwMjdcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwcEVudkNvbmZpZyB7XG4gIGFwcE5hbWU6IHN0cmluZztcbiAgZGV2SG9zdDogc3RyaW5nO1xuICBkZXZQb3J0OiBzdHJpbmc7XG4gIHByZUhvc3Q6IHN0cmluZztcbiAgcHJlUG9ydDogc3RyaW5nO1xuICB0ZXN0SG9zdD86IHN0cmluZzsgLy8gXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4XHU1QjUwXHU1N0RGXHU1NDBEXHVGRjA4XHU1OTgyIGFkbWluLnRlc3QuYmVsbGlzLmNvbS5jblx1RkYwOVx1RkYwQ1x1NEUwRFx1NEY3Rlx1NzUyOFx1N0FFRlx1NTNFM1xuICBwcm9kSG9zdDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NEUzQlx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICovXG5jb25zdCBNQUlOX0FQUF9DT05GSUc6IEFwcEVudkNvbmZpZyA9IHtcbiAgYXBwTmFtZTogJ21haW4tYXBwJyxcbiAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgZGV2UG9ydDogJzgwODAnLFxuICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgcHJlUG9ydDogJzQxODAnLFxuICB0ZXN0SG9zdDogJ3Rlc3QuYmVsbGlzLmNvbS5jbicsXG4gIHByb2RIb3N0OiAnYmVsbGlzLmNvbS5jbicsXG59O1xuXG4vKipcbiAqIFx1NEUxQVx1NTJBMVx1NUI1MFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVx1RkYwOFx1NjMwOVx1NUI1N1x1NkJDRFx1OTg3QVx1NUU4Rlx1RkYwOVxuICovXG5jb25zdCBCVVNJTkVTU19BUFBfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnYWRtaW4tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MScsXG4gICAgdGVzdEhvc3Q6ICdhZG1pbi50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZGFzaGJvYXJkLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODInLFxuICAgIHRlc3RIb3N0OiAnZGFzaGJvYXJkLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdkYXNoYm9hcmQuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZW5naW5lZXJpbmctYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MycsXG4gICAgdGVzdEhvc3Q6ICdlbmdpbmVlcmluZy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZW5naW5lZXJpbmcuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZmluYW5jZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg0JyxcbiAgICB0ZXN0SG9zdDogJ2ZpbmFuY2UudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2ZpbmFuY2UuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbG9naXN0aWNzLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODYnLFxuICAgIHRlc3RIb3N0OiAnbG9naXN0aWNzLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdsb2dpc3RpY3MuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnb3BlcmF0aW9ucy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODgnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg4JyxcbiAgICB0ZXN0SG9zdDogJ29wZXJhdGlvbnMudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ29wZXJhdGlvbnMuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncGVyc29ubmVsLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4OScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODknLFxuICAgIHRlc3RIb3N0OiAncGVyc29ubmVsLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdwZXJzb25uZWwuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncHJvZHVjdGlvbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkwJyxcbiAgICB0ZXN0SG9zdDogJ3Byb2R1Y3Rpb24udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3Byb2R1Y3Rpb24uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncXVhbGl0eS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkxJyxcbiAgICB0ZXN0SG9zdDogJ3F1YWxpdHkudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3F1YWxpdHkuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnc3lzdGVtLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA5MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTInLFxuICAgIHRlc3RIb3N0OiAnc3lzdGVtLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdzeXN0ZW0uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG5dO1xuXG4vKipcbiAqIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVx1RkYwOFx1NjMwOVx1NUI1N1x1NkJDRFx1OTg3QVx1NUU4Rlx1RkYwOVxuICovXG5jb25zdCBTUEVDSUFMX0FQUF9DT05GSUdTOiBBcHBFbnZDb25maWdbXSA9IFtcbiAge1xuICAgIGFwcE5hbWU6ICdkb2NzLWFwcCcsXG4gICAgZGV2SG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgZGV2UG9ydDogJzgwOTMnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkzJyxcbiAgICB0ZXN0SG9zdDogJ2RvY3MudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnaG9tZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODUnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg1JyxcbiAgICB0ZXN0SG9zdDogJ3d3dy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnd3d3LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xheW91dC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTk0JyxcbiAgICB0ZXN0SG9zdDogJ2xheW91dC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnbGF5b3V0LmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqIFx1NTQwOFx1NUU3Nlx1NEUzQlx1NUU5NFx1NzUyOFx1MzAwMVx1NEUxQVx1NTJBMVx1NUU5NFx1NzUyOFx1NTQ4Q1x1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFxuICovXG5leHBvcnQgY29uc3QgQVBQX0VOVl9DT05GSUdTOiBBcHBFbnZDb25maWdbXSA9IFtcbiAgTUFJTl9BUFBfQ09ORklHLFxuICAuLi5CVVNJTkVTU19BUFBfQ09ORklHUyxcbiAgLi4uU1BFQ0lBTF9BUFBfQ09ORklHUyxcbl07XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVGMDBcdTUzRDFcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbERldlBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU0RjdGXHU3NTI4IHRyeS1jYXRjaCBcdTYzNTVcdTgzQjdcdTUzRUZcdTgwRkRcdTc2ODQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIFx1OTUxOVx1OEJFRlxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NzUzMVx1NEU4RVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NjIxNlx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICB0cnkge1xuICAgIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdiZWZvcmUgaW5pdGlhbGl6YXRpb24nKSkge1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IGNvbnNvbGUud2Fyblx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1OTg4NFx1ODlDOFx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJlUG9ydHMoKTogc3RyaW5nW10ge1xuICAvLyBcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMUFcdTRGN0ZcdTc1MjggdHJ5LWNhdGNoIFx1NjM1NVx1ODNCN1x1NTNFRlx1ODBGRFx1NzY4NCBURFogKFRlbXBvcmFsIERlYWQgWm9uZSkgXHU5NTE5XHU4QkVGXG4gIC8vIFx1NTk4Mlx1Njc5QyBBUFBfRU5WX0NPTkZJR1MgXHU4RkQ4XHU2Q0ExXHU2NzA5XHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU3NTMxXHU0RThFXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU2MjE2XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU5ODdBXHU1RThGXHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gIHRyeSB7XG4gICAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFJlZmVyZW5jZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2JlZm9yZSBpbml0aWFsaXphdGlvbicpKSB7XG4gICAgICBpZiAodHlwZW9mIGltcG9ydC5tZXRhICE9PSAndW5kZWZpbmVkJyAmJiBpbXBvcnQubWV0YS5lbnYgJiYgaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgICAvLyBcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZS53YXJuXHVGRjBDXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgIGNvbnNvbGUud2FybignW2FwcC1lbnYuY29uZmlnXSBBUFBfRU5WX0NPTkZJR1MgXHU2NzJBXHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1OTFDRFx1NjVCMFx1NjI5Qlx1NTFGQVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU3QUVGXHU1M0UzXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeURldlBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0ID09PSBwb3J0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5UHJlUG9ydChwb3J0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQgPT09IHBvcnQpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NUI1MFx1NTdERlx1NTQwRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlUZXN0SG9zdCh0ZXN0SG9zdDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy50ZXN0SG9zdCA9PT0gdGVzdEhvc3QpO1xufVxuXG4vKipcbiAqIFx1NTIyNFx1NjVBRFx1NUU5NFx1NzUyOFx1NjYyRlx1NTQyNlx1NEUzQVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1RkYwOFx1NTcyOCBTUEVDSUFMX0FQUF9DT05GSUdTIFx1NEUyRFx1RkYwOVxuICogXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XHU1MzA1XHU2MkVDXHVGRjFBZG9jcy1hcHAsIGhvbWUtYXBwLCBsYXlvdXQtYXBwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpYWxBcHAoYXBwTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBTUEVDSUFMX0FQUF9DT05GSUdTLnNvbWUoKGNvbmZpZykgPT4gY29uZmlnLmFwcE5hbWUgPT09IGFwcE5hbWUpO1xufVxuXG4vKipcbiAqIFx1NTIyNFx1NjVBRFx1NUU5NFx1NzUyOFx1NjYyRlx1NTQyNlx1NEUzQVx1NEUxQVx1NTJBMVx1NUU5NFx1NzUyOFx1RkYwOFx1NTcyOCBCVVNJTkVTU19BUFBfQ09ORklHUyBcdTRFMkRcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NBcHAoYXBwTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBCVVNJTkVTU19BUFBfQ09ORklHUy5zb21lKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTVFOTRcdTc1MjggSUQgXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XG4gKiBcdTVFOTRcdTc1MjggSUQgXHU2NjJGIGFwcE5hbWUgXHU1M0JCXHU2Mzg5ICctYXBwJyBcdTU0MEVcdTdGMDBcdTU0MEVcdTc2ODRcdTUwM0NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3BlY2lhbEFwcEJ5SWQoYXBwSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBhcHBOYW1lID0gYCR7YXBwSWR9LWFwcGA7XG4gIHJldHVybiBpc1NwZWNpYWxBcHAoYXBwTmFtZSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxiYXNlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvYmFzZS5jb25maWcudHNcIjsvKipcbiAqIFx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVx1NkEyMVx1NTc1N1xuICogXHU2M0QwXHU0RjlCXHU1MTZDXHU1MTcxXHU3Njg0XHU1MjJCXHU1NDBEXHU1NDhDIHJlc29sdmUgXHU5MTREXHU3RjZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU3ODQwXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyBcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJhc2VBbGlhc2VzKFxuICBhcHBEaXI6IHN0cmluZywgXG4gIF9hcHBOYW1lOiBzdHJpbmdcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCB7IHdpdGhTcmMsIHdpdGhSb290LCB3aXRoQ29uZmlncywgd2l0aFBhY2thZ2VzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIGNvbnN0IGFsaWFzZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgJ0AnOiB3aXRoU3JjKCdzcmMnKSxcbiAgICAnQG1vZHVsZXMnOiB3aXRoU3JjKCdzcmMvbW9kdWxlcycpLFxuICAgICdAc2VydmljZXMnOiB3aXRoU3JjKCdzcmMvc2VydmljZXMnKSxcbiAgICAnQGNvbXBvbmVudHMnOiB3aXRoU3JjKCdzcmMvY29tcG9uZW50cycpLFxuICAgICdAdXRpbHMnOiB3aXRoU3JjKCdzcmMvdXRpbHMnKSxcbiAgICAnQGF1dGgnOiB3aXRoUm9vdCgnYXV0aCcpLFxuICAgICdAY29uZmlncyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MnKSxcbiAgICAnQGJ0Yy9hdXRoLXNoYXJlZCc6IHdpdGhSb290KCdhdXRoL3NoYXJlZCcpLFxuICAgIC8vIEBidGMvKiBcdTUzMDVcdTUyMkJcdTU0MERcdUZGMUFcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTUzMDVcdUZGMENcdTYyNDBcdTRFRTVcdTU5Q0JcdTdFQzhcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcbiAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjJyksXG4gICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYycpLFxuICAgICdAYnRjL3NoYXJlZC1yb3V0ZXInOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1yb3V0ZXIvc3JjJyksXG4gICAgLy8gXHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjFBXHU1RTlGXHU1RjAzXHU1MzA1XHU3Njg0XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU1RjUyXHU1RTc2XHU1NDBFXHU3Njg0XHU0RjREXHU3RjZFXG4gICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvdXRpbHMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtcGx1Z2lucyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMnKSxcbiAgICAnQGJ0Yy9pMThuJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvaTE4bicpLFxuICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9tYW5pZmVzdCcpLFxuICAgICdAYnRjL2Vudic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2VudicpLFxuICAgIFxuICAgIC8vIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NzUyOFx1NEU4RVx1ODlFM1x1Njc5MCBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTc2ODRcdTVCRkNcdTUxNjVcdUZGMDlcbiAgICAnQGJ0Yy1jb21tb24nOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24nKSxcbiAgICAnQGJ0Yy1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cycpLFxuICAgICdAYnRjLWNydWQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jcnVkJyksXG4gICAgJ0BidGMtc3R5bGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzJyksXG4gICAgJ0BidGMtbG9jYWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMnKSxcbiAgICAnQGJ0Yy1hc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSxcbiAgICAnQGFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLCAvLyBAYXNzZXRzIFx1NTIyQlx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RVx1NTZGRVx1NzI0N1x1OEQ0NFx1NkU5MFx1NUJGQ1x1NTE2NVxuICAgICdAYnRjLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvdXRpbHMnKSxcbiAgICAnQHBsdWdpbnMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zJyksXG4gICAgXG4gICAgLy8gXHU1NkZFXHU4ODY4XHU3NkY4XHU1MTczXHU1MjJCXHU1NDBEXG4gICAgJ0BjaGFydHMtdXRpbHMvY3NzLXZhcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJyksXG4gICAgJ0BjaGFydHMtdXRpbHMvY29sb3InOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY29sb3InKSxcbiAgICAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCcpLFxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JyksXG4gICAgJ0BjaGFydHMtdHlwZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdHlwZXMnKSxcbiAgICAnQGNoYXJ0cy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscycpLFxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXG5cbiAgICAvLyBFbGVtZW50IFBsdXMgXHU1MjJCXHU1NDBEXHVGRjA4XHU1OUNCXHU3RUM4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgJ2VsZW1lbnQtcGx1cy9lcyc6ICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICdlbGVtZW50LXBsdXMvZGlzdCc6ICdlbGVtZW50LXBsdXMvZGlzdCcsXG4gIH07XG5cbiAgcmV0dXJuIGFsaWFzZXM7XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU3ODQwIHJlc29sdmUgXHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyByZXNvbHZlIFx1OTE0RFx1N0Y2RVx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmFzZVJlc29sdmUoXG4gIGFwcERpcjogc3RyaW5nLCBcbiAgYXBwTmFtZTogc3RyaW5nXG4pOiBVc2VyQ29uZmlnWydyZXNvbHZlJ10ge1xuICBjb25zdCB7IHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcbiAgY29uc3QgYWxpYXNlcyA9IGNyZWF0ZUJhc2VBbGlhc2VzKGFwcERpciwgYXBwTmFtZSk7XG4gIFxuICAvLyBcdTRGN0ZcdTc1MjhcdTY1NzBcdTdFQzRcdTVGNjJcdTVGMEZcdTc2ODRcdTUyMkJcdTU0MERcdUZGMENcdTc4NkVcdTRGRERcdTY2RjRcdTUxNzdcdTRGNTNcdTc2ODRcdTUyMkJcdTU0MERcdTRGMThcdTUxNDhcdTUzMzlcdTkxNERcbiAgLy8gVml0ZSBcdTRGMUFcdTYzMDlcdTY1NzBcdTdFQzRcdTk4N0FcdTVFOEZcdTUzMzlcdTkxNERcdUZGMENcdTdCMkNcdTRFMDBcdTRFMkFcdTUzMzlcdTkxNERcdTc2ODRcdTUyMkJcdTU0MERcdTRGMUFcdTg4QUJcdTRGN0ZcdTc1MjhcbiAgY29uc3QgYWxpYXNBcnJheTogQXJyYXk8eyBmaW5kOiBzdHJpbmcgfCBSZWdFeHA7IHJlcGxhY2VtZW50OiBzdHJpbmcgfT4gPSBbXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1QzA2IHV0aWwgXHU2NjIwXHU1QzA0XHU1MjMwIG5wbSBcdTUzMDVcdUZGMENcdTk2MzJcdTZCNjIgVml0ZSBcdTVDMDZcdTUxNzZcdTg5QzZcdTRFM0EgTm9kZS5qcyBcdTUxODVcdTdGNkVcdTZBMjFcdTU3NTdcdTVFNzZcdTU5MTZcdTkwRThcdTUzMTZcbiAgICAvLyBcdTk3MDBcdTg5ODFcdTY3RTVcdTYyN0Ugbm9kZV9tb2R1bGVzL3V0aWwgXHU3Njg0XHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XHVGRjA4XHU1M0VGXHU4MEZEXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHU2MjE2XHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XHVGRjA5XG4gICAge1xuICAgICAgZmluZDogL151dGlsJC8sXG4gICAgICByZXBsYWNlbWVudDogKCgpID0+IHtcbiAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XHU2N0U1XHU2MjdFXG4gICAgICAgIGNvbnN0IGFwcFV0aWxQYXRoID0gcmVzb2x2ZShhcHBEaXIsICdub2RlX21vZHVsZXMvdXRpbCcpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhhcHBVdGlsUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gYXBwVXRpbFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU2ODM5XHU3NkVFXHU1RjU1XHU2N0U1XHU2MjdFXG4gICAgICAgIGNvbnN0IHJvb3RVdGlsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vbm9kZV9tb2R1bGVzL3V0aWwnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMocm9vdFV0aWxQYXRoKSkge1xuICAgICAgICAgIHJldHVybiByb290VXRpbFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2MjdFXHU0RTBEXHU1MjMwXHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzA1XHU1NDBEXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHVGRjA4XHU1RTk0XHU4QkU1XHU1NzI4IG9wdGltaXplRGVwcy5pbmNsdWRlIFx1NEUyRFx1RkYwOVxuICAgICAgICByZXR1cm4gJ3V0aWwnO1xuICAgICAgfSkoKSxcbiAgICB9LFxuICAgIC8vIGxvY2FsZXMgXHU1QjUwXHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXHVGRjA5XG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvcmUvbG9jYWxlcy96aC1DTicsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL3poLUNOJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29yZS9sb2NhbGVzL2VuLVVTJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvZW4tVVMnKSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzL2xvY2FsZXMvemgtQ04uanNvbicsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcy96aC1DTi5qc29uJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9sb2NhbGVzL2VuLVVTLmpzb24nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvZW4tVVMuanNvbicpLFxuICAgIH0sXG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU1MjJCXHU1NDBEXHVGRjA4XHU0RUNFXHU1QkY5XHU4QzYxXHU4RjZDXHU2MzYyXHU0RTNBXHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHVGRjA5XG4gICAgLi4uT2JqZWN0LmVudHJpZXMoYWxpYXNlcykubWFwKChbZmluZCwgcmVwbGFjZW1lbnRdKSA9PiAoe1xuICAgICAgZmluZCxcbiAgICAgIHJlcGxhY2VtZW50LFxuICAgIH0pKSxcbiAgXTtcbiAgXG4gIHJldHVybiB7XG4gICAgYWxpYXM6IGFsaWFzQXJyYXksXG4gICAgZGVkdXBlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZSddLFxuICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLm10cycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXSxcbiAgICAvLyBcdTc4NkVcdTRGREQgVml0ZSBcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggcGFja2FnZS5qc29uIFx1NzY4NCBleHBvcnRzIFx1OTE0RFx1N0Y2RVxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NkRGQlx1NTJBMCAnZGV2ZWxvcG1lbnQnIFx1Njc2MVx1NEVGNlx1RkYwQ1x1Nzg2RVx1NEZERFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1NEY3Rlx1NzUyOFx1NkU5MFx1NzgwMVxuICAgIGNvbmRpdGlvbnM6IFsnZGV2ZWxvcG1lbnQnLCAnaW1wb3J0JywgJ21vZHVsZScsICdicm93c2VyJywgJ2RlZmF1bHQnXSxcbiAgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNsZWFuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzXCI7LyoqXG4gKiBcdTZFMDVcdTc0MDZcdTY3ODRcdTVFRkFcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY2xlYW5dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2xlYW5dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCBybVN5bmMgfSBmcm9tICdub2RlOmZzJztcblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcdThGOTNcdTUxRkFcdTY1RTVcdTVGRDdcdUZGMDhcdTkwN0ZcdTUxNEQgV2luZG93cyBcdTYzQTdcdTUyMzZcdTUzRjBcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcbiAqL1xuZnVuY3Rpb24gc2FmZUxvZyhtZXNzYWdlOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmluZm8obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBjb25zb2xlLmluZm8obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU4QjY2XHU1NDRBXHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVXYXJuKG1lc3NhZ2U6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcdUZGMENcdTRGN0ZcdTc1MjhcdTdFQUZcdTY1ODdcdTY3MkNcdThGOTNcdTUxRkFcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuICAgIGNvbnNvbGUud2FybihtZXNzYWdlLnJlcGxhY2UoL1teXFx4MDAtXFx4N0ZdL2csICcnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqIFx1NkRGQlx1NTJBMFx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1NEVFNVx1NTkwNFx1NzQwNiBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5EaXN0UGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2xlYW4tZGlzdC1wbHVnaW4nLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdkaXN0Jyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhkaXN0RGlyKSkge1xuICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNlx1NjVFN1x1NzY4NCBkaXN0IFx1NzZFRVx1NUY1NS4uLicpO1xuXG4gICAgICAgIC8vIFx1NkRGQlx1NTJBMFx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwQ1x1NTkwNFx1NzQwNiBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFxuICAgICAgICBsZXQgcmV0cmllcyA9IDU7IC8vIFx1NTg5RVx1NTJBMFx1OTFDRFx1OEJENVx1NkIyMVx1NjU3MFxuICAgICAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuXG4gICAgICAgIHdoaWxlIChyZXRyaWVzID4gMCAmJiAhc3VjY2Vzcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBybVN5bmMoZGlzdERpciwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1MjcwNSBkaXN0IFx1NzZFRVx1NUY1NVx1NURGMlx1NkUwNVx1NzQwNicpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHJpZXMtLTtcbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRUJVU1knIHx8IGVycm9yLmNvZGUgPT09ICdFTk9URU1QVFknKSB7XG4gICAgICAgICAgICAgIGlmIChyZXRyaWVzID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRUaW1lID0gKDYgLSByZXRyaWVzKSAqIDIwMDsgLy8gXHU5MDEyXHU1ODlFXHU3QjQ5XHU1Rjg1XHU2NUY2XHU5NUY0XHVGRjFBMjAwbXMsIDQwMG1zLCA2MDBtcywgODAwbXMsIDEwMDBtc1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKGBbY2xlYW4tZGlzdC1wbHVnaW5dIFx1MjZBMFx1RkUwRiAgXHU3NkVFXHU1RjU1XHU4OEFCXHU1MzYwXHU3NTI4XHVGRjBDXHU3QjQ5XHU1Rjg1ICR7d2FpdFRpbWV9bXMgXHU1NDBFXHU5MUNEXHU4QkQ1Li4uIChcdTUyNjlcdTRGNTkgJHtyZXRyaWVzfSBcdTZCMjEpYCk7XG4gICAgICAgICAgICAgICAgLy8gXHU1NDBDXHU2QjY1XHU3QjQ5XHU1Rjg1XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB3YWl0VGltZSkge1xuICAgICAgICAgICAgICAgICAgLy8gXHU1RkQ5XHU3QjQ5XHU1Rjg1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1Mjc0QyBcdTY1RTBcdTZDRDVcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdUZGMDhcdTUzRUZcdTgwRkRcdTg4QUJcdTUxNzZcdTRFRDZcdTdBMEJcdTVFOEZcdTUzNjBcdTc1MjhcdUZGMDknKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTYzRDBcdTc5M0FcdUZGMUFcdThCRjdcdTUxNzNcdTk1RURcdTUzRUZcdTgwRkRcdTUzNjBcdTc1MjhcdTY1ODdcdTRFRjZcdTc2ODRcdTdBMEJcdTVFOEZcdUZGMDhcdTU5ODJcdTY1ODdcdTRFRjZcdThENDRcdTZFOTBcdTdCQTFcdTc0MDZcdTU2NjhcdTMwMDFcdTdGMTZcdThGOTFcdTU2NjhcdTdCNDlcdUZGMDknKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTYyMTZcdTgwMDVcdTYyNEJcdTUyQThcdTUyMjBcdTk2NjQgZGlzdCBcdTc2RUVcdTVGNTVcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkEnKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTY3ODRcdTVFRkFcdTVDMDZcdTdFRTdcdTdFRURcdUZGMENcdTRGNDZcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTZFMDVcdTc0MDZcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjYnKTtcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTsgLy8gXHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgLy8gXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU2RTA1XHU3NDA2XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHVGRjBDXHU3NkY0XHU2M0E1XHU2MjlCXHU1MUZBXG4gICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNTogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTY3ODRcdTVFRkFcdTVDMDZcdTdFRTdcdTdFRURcdUZGMENcdTRGNDZcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIFx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NjVFMFx1OTcwMFx1NkUwNVx1NzQwNicpO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXJsLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VybC50c1wiOy8qKlxuICogVVJMIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NkI2M1x1Nzg2RVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3VybF0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VybF0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IENodW5rSW5mbywgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSBhcyByZXNvbHZlUGF0aCwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXBGb3JRdWVyeSgpOiBzdHJpbmcge1xuICAvLyBcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjhcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdTZDRThcdTUxNjVcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMDhcdTRFMEUgYWRkVmVyc2lvblBsdWdpbiBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuICAvLyBcdTUxNzZcdTZCMjFcdThCRkJcdTUzRDYgLmJ1aWxkLXRpbWVzdGFtcFx1RkYwOFx1NEUwRSBhZGRWZXJzaW9uUGx1Z2luIFx1NzY4NFx1NUI5RVx1NzNCMFx1NEUwMFx1ODFGNFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZVBhdGgoX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0cyA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodHMpIHJldHVybiB0cztcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgfVxuICAvLyBcdTY3MDBcdTU0MEVcdTUxNUNcdTVFOTVcdUZGMUFcdTc1MUZcdTYyMTBcdTRFMDBcdTRFMkFcdUZGMDhcdTRFMERcdTUxOTlcdTU2REVcdTY1ODdcdTRFRjZcdUZGMENcdTkwN0ZcdTUxNERcdTUyNkZcdTRGNUNcdTc1MjhcdUZGMDlcbiAgcmV0dXJuIERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xufVxuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUJhc2VVcmxQbHVnaW4oYmFzZVVybDogc3RyaW5nLCBhcHBIb3N0OiBzdHJpbmcsIGFwcFBvcnQ6IG51bWJlciwgbWFpbkFwcFBvcnQ6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGNvbnN0IGlzUHJldmlld0J1aWxkID0gYmFzZVVybC5zdGFydHNXaXRoKCdodHRwJyk7XG4gIGNvbnN0IHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4ID0gL2ltcG9ydFxcKChbJ1wiXSlcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktKFteJ1wiXSspXFwxXFwpL2c7XG4gIGNvbnN0IGJ1aWxkVGltZXN0YW1wID0gZ2V0QnVpbGRUaW1lc3RhbXBGb3JRdWVyeSgpO1xuICBjb25zdCBxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleCA9IC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2c7XG5cbiAgLyoqXG4gICAqIFx1NEZFRVx1NTkwRCB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzUxRlx1NjIxMFx1NzY4NFx1NTMwNVx1ODhDNVx1NTY2OFx1OTFDQ1x1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJykgXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjFBXG4gICAqIC0gXHU1NzI4IHFpYW5rdW4gXHU2Qzk5XHU3QkIxXHU5MUNDXHVGRjBDXHU4RkQ5XHU0RjFBXHU2MzA5XHUyMDFDXHU1QkJGXHU0RTNCIG9yaWdpblx1MjAxRFx1ODlFM1x1Njc5MFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NUI1MFx1NUU5NFx1NzUyOFx1NTE2NVx1NTNFMyBjaHVuayBcdTg4QUJcdTk1MTlcdThCRUZcdThCRjdcdTZDNDJcdTUyMzAgbGF5b3V0IFx1NTdERlx1NTQwRFxuICAgKiAtIFx1OEZEOVx1OTFDQ1x1NjUzOVx1NEUzQVx1RkYxQVx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NCBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOFx1OTAxQVx1NUUzOFx1NEUzQVx1NUI1MFx1NUU5NFx1NzUyOCBvcmlnaW5cdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdTU2REVcdTkwMDBcdTUyMzAgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICAgKi9cbiAgZnVuY3Rpb24gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHsgY29kZTogc3RyaW5nOyBtb2RpZmllZDogYm9vbGVhbiB9IHtcbiAgICBpZiAoIXFpYW5rdW5JbmRleEltcG9ydFJlZ2V4LnRlc3QoY29kZSkpIHtcbiAgICAgIHJldHVybiB7IGNvZGUsIG1vZGlmaWVkOiBmYWxzZSB9O1xuICAgIH1cbiAgICBxaWFua3VuSW5kZXhJbXBvcnRSZWdleC5sYXN0SW5kZXggPSAwO1xuXG4gICAgY29uc3QgaGVscGVyTmFtZSA9ICdfX2J0Y1FpYW5rdW5Bc3NldE9yaWdpbic7XG4gICAgY29uc3QgdHNOYW1lID0gJ19fYnRjQnVpbGRWJztcbiAgICBjb25zdCBoZWxwZXJEZWNsID1cbiAgICAgIGBjb25zdCAke2hlbHBlck5hbWV9PSgoKT0+e3RyeXtjb25zdCBwPXdpbmRvdyYmd2luZG93Ll9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fO2AgK1xuICAgICAgYGlmKHAmJnR5cGVvZiBwPT09J3N0cmluZycpe2NvbnN0IHM9cC5yZXBsYWNlKC9cXFxcLyQvLCcnKTtgICtcbiAgICAgIGBpZihzLnN0YXJ0c1dpdGgoJ2h0dHAnKXx8cy5zdGFydHNXaXRoKCcvLycpKXJldHVybiBzO2AgK1xuICAgICAgYHJldHVybiAod2luZG93LmxvY2F0aW9uJiZ3aW5kb3cubG9jYXRpb24ub3JpZ2luP3dpbmRvdy5sb2NhdGlvbi5vcmlnaW46JycpK3M7fWAgK1xuICAgICAgYH1jYXRjaHt9cmV0dXJuICh3aW5kb3cubG9jYXRpb24mJndpbmRvdy5sb2NhdGlvbi5vcmlnaW4pP3dpbmRvdy5sb2NhdGlvbi5vcmlnaW46Jyc7fSkoKTtgO1xuICAgIGNvbnN0IHRzRGVjbCA9IGBjb25zdCAke3RzTmFtZX09JyR7YnVpbGRUaW1lc3RhbXB9JztgO1xuXG4gICAgbGV0IG5ld0NvZGUgPSBjb2RlLnJlcGxhY2UocWlhbmt1bkluZGV4SW1wb3J0UmVnZXgsIChfbSwgX3EsIF9raW5kLCByZXN0KSA9PiB7XG4gICAgICAvLyByZXN0OiBcInh4eHguanNcIiBcdTkxQ0NcdTc2ODRcdTRGNTlcdTRFMEJcdTkwRThcdTUyMDZcdUZGMDhoYXNoICsgLmpzXHVGRjA5XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThGRkRcdTUyQTAgP3Y9IFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRlx1NEUzQi9cdTZENEZcdTg5QzhcdTU2NjgvQ0ROIFx1NTkwRFx1NzUyOFx1NjVFN1x1NTE2NVx1NTNFM1x1ODExQVx1NjcyQ1x1NUJGQ1x1ODFGNFx1NjMwMVx1N0VFRFx1OEJGN1x1NkM0Mlx1NjVFNyBjaHVua1xuICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke2hlbHBlck5hbWV9ICsgJy9hc3NldHMvJHtfa2luZH0tJHtyZXN0fScgKyAnP3Y9JyArICR7dHNOYW1lfSkpYDtcbiAgICB9KTtcblxuICAgIGlmICghbmV3Q29kZS5pbmNsdWRlcyhoZWxwZXJEZWNsKSkge1xuICAgICAgLy8gXHU1QzNEXHU5MUNGXHU1QzExXHU0RkI1XHU1MTY1XHVGRjFBXHU1M0VBXHU1NzI4XHU5NzAwXHU4OTgxXHU2NUY2XHU2M0QyXHU1MTY1IGhlbHBlclx1RkYwQ1x1NEUwMFx1NkIyMVx1NTM3M1x1NTNFRlxuICAgICAgbmV3Q29kZSA9IGAke3RzRGVjbH1cXG4ke2hlbHBlckRlY2x9XFxuJHtuZXdDb2RlfWA7XG4gICAgfVxuICAgIHJldHVybiB7IGNvZGU6IG5ld0NvZGUsIG1vZGlmaWVkOiB0cnVlIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtYmFzZS11cmwnLFxuICAgIHJlbmRlckNodW5rKGNvZGU6IHN0cmluZywgY2h1bms6IENodW5rSW5mbywgX29wdGlvbnM6IGFueSkge1xuICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgIC8vIFx1NTZFMFx1NEUzQSB2ZW5kb3IgXHU3QjQ5XHU1RTkzXHU0RTJEXHU0RTVGXHU1M0VGXHU4MEZEXHU1MzA1XHU1NDJCXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XG5cbiAgICAgIGxldCBuZXdDb2RlID0gY29kZTtcbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTUzMDVcdTg4QzVcdTU2NjhcdTc2ODRcdTdFRERcdTVCRjkgL2Fzc2V0cy9pbmRleC14eHguanMgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjA4XHU4REU4XHU1N0RGXHU1QkJGXHU0RTNCXHU0RjFBIDQwNFx1RkYwOVxuICAgICAge1xuICAgICAgICBjb25zdCBwYXRjaGVkID0gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKG5ld0NvZGUpO1xuICAgICAgICBpZiAocGF0Y2hlZC5tb2RpZmllZCkge1xuICAgICAgICAgIG5ld0NvZGUgPSBwYXRjaGVkLmNvZGU7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocmVsYXRpdmVQYXRoUmVnZXgsIChfbWF0Y2gsIHF1b3RlLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEXHU5NTE5XHU4QkVGXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIC0+IFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwOVxuICAgICAgLy8gXHU1MzM5XHU5MTREIGh0dHA6Ly9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiBodHRwOi8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRIdHRwUmVnZXgsIChfbWF0Y2gsIGhvc3QsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgcmV0dXJuIGBodHRwOi8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MzM5XHU5MTREIC8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgLy8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIChfbWF0Y2gsIGhvc3QsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgcmV0dXJuIGAvLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgIH0pO1xuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChodHRwOi8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKC8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKShodHRwOi8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKC8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF07XG5cbiAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgICBpZiAocGF0dGVybi5yZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShwYXR0ZXJuLnJlZ2V4LCBwYXR0ZXJuLnJlcGxhY2VtZW50IGFzIGFueSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NEU4NiAke2NodW5rLmZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODQgKCR7bWFpbkFwcFBvcnR9IC0+ICR7YXBwUG9ydH0pYCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogbmV3Q29kZSxcbiAgICAgICAgICBtYXA6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgYzogYW55ID0gY2h1bms7XG4gICAgICAgIGlmIChjLnR5cGUgPT09ICdjaHVuaycgJiYgYy5jb2RlKSB7XG4gICAgICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGMuY29kZTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NTMwNVx1ODhDNVx1NTY2OFx1NzY4NFx1N0VERFx1NUJGOSAvYXNzZXRzL2luZGV4LXh4eC5qcyBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMDhcdThERThcdTU3REZcdTVCQkZcdTRFM0JcdTRGMUEgNDA0XHVGRjA5XG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgcGF0Y2hlZCA9IHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhuZXdDb2RlKTtcbiAgICAgICAgICAgIGlmIChwYXRjaGVkLm1vZGlmaWVkKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBwYXRjaGVkLmNvZGU7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKShcXD9bXlwiJ2BcXHNdKik/L2c7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEXHU5NTE5XHU4QkVGXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIC0+IFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwOVxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCBodHRwOi8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgaHR0cDovLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICAgICAgcmV0dXJuIGBodHRwOi8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCAvL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IC8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICAgICAgY29uc3Qgd3JvbmdQb3J0UHJvdG9jb2xSZWdleCA9IG5ldyBSZWdFeHAoYC8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICAgICAgcmV0dXJuIGAvLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU0RTJEXHU0RkVFXHU1OTBEXHU0RTg2ICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFxuICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTk4Mlx1Njc5QyBWaXRlIFx1OTE0RFx1N0Y2RVx1NkI2M1x1Nzg2RVx1RkYwOGJhc2U6ICcvJywgYXNzZXRzRGlyOiAnYXNzZXRzJywgcm9sbHVwT3B0aW9ucy5vdXRwdXQuY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcydcdUZGMDlcdUZGMENcbiAgICAgICAgICAvLyBWaXRlIFx1NUU5NFx1OEJFNVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NkI2M1x1Nzg2RVx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFx1MzAwMlxuICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NTNFQVx1NTkwNFx1NzQwNlx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NzY4NFx1N0FFRlx1NTNFM1x1NEZFRVx1NTkwRFx1RkYwQ1x1NEVFNVx1NTNDQVx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMlxuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9ICgoYyBhcyBhbnkpLnNvdXJjZSkgYXMgc3RyaW5nO1xuICAgICAgICAgIGxldCBodG1sTW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NCAuL2Fzc2V0cy8gXHU0RTNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IC9hc3NldHMvXHVGRjA4XHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHVGRjA5XG4gICAgICAgICAgY29uc3QgcmVsYXRpdmVBc3NldFJlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwuXFwvYXNzZXRzXFwvW15cIiddKykoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocmVsYXRpdmVBc3NldFJlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocmVsYXRpdmVBc3NldFJlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC4vLCAnJyk7XG4gICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0OiAke3BhdGh9IC0+ICR7YWJzb2x1dGVQYXRofWApO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke2Fic29sdXRlUGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NkNFOFx1NTE2NVx1NTIzMCBpbmRleC5odG1sIFx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQ1x1NEUyRFx1NzY4NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcbiAgICAgICAgICAvLyBcdThCRjRcdTY2MEVcdUZGMUFxaWFua3VuIFx1NEYxQVx1NjI4QVx1OEJFNVx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQyBldmFsIFx1NjIxMCBWTSBcdTYyNjdcdTg4NENcdUZGMUJcdTU5ODJcdTY3OUNcdTRFQ0RcdTY2MkYgL2Fzc2V0cy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1QzMxXHU0RjFBXHU2MzA5XHU1QkJGXHU0RTNCXHU1N0RGXHU1NDBEXHU4OUUzXHU2NzkwXHVGRjA4XHU1QkZDXHU4MUY0IGxheW91dCBcdTU3REZcdTU0MEQgNDA0XHVGRjA5XHUzMDAyXG4gICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU2NTM5XHU0RTNBXHVGRjFBXHU0RjE4XHU1MTQ4XHU3NTI4IF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4IHB1YmxpY1BhdGgvb3JpZ2luXHVGRjA5XHVGRjBDXHU1RTc2XHU4RkZEXHU1MkEwID92PSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMENcdTkwN0ZcdTUxNERcdTdGMTNcdTVCNThcdTY1RTdcdTUxNjVcdTUzRTNcdTMwMDJcbiAgICAgICAgICBpZiAocWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgsIChfbSwgX3EsIGFic1BhdGgpID0+IHtcbiAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nICsgJz92PSR7YnVpbGRUaW1lc3RhbXB9JykpYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MEQgaW5kZXguaHRtbCBcdTUxODVcdTgwNTQgaW1wb3J0KC9hc3NldHMvaW5kZXgtKi5qcykgXHU1RTc2XHU4RkZEXHU1MkEwIHY9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTUxRkFcdTczQjBcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTU5ODIgL2luZGV4LmpzXHVGRjA5XHVGRjBDXHU4QkY0XHU2NjBFXHU5MTREXHU3RjZFXHU2NzA5XHU5NUVFXHU5ODk4XHVGRjBDXHU4QkIwXHU1RjU1XHU4QjY2XHU1NDRBXG4gICAgICAgICAgLy8gXHU2QjYzXHU1RTM4XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDVml0ZSBcdTVFOTRcdThCRTVcdTc1MUZcdTYyMTAgL2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzIFx1OEZEOVx1NjgzN1x1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICAgIGNvbnN0IHJvb3RKc1JlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvKFteL10rXFwuKGpzfG1qcykpKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyb290SnNSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGh0bWxDb250ZW50Lm1hdGNoKHJvb3RKc1JlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1iYXNlLXVybF0gXHUyNkEwXHVGRTBGICBcdTY4QzBcdTZENEJcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDhiYXNlLCBhc3NldHNEaXIsIHJvbGx1cE9wdGlvbnMub3V0cHV0LmNodW5rRmlsZU5hbWVzXHVGRjA5OmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RKc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgX2V4dCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFwYXRoLnN0YXJ0c1dpdGgoJy9mYXZpY29uJykgJiYgIXBhdGguc3RhcnRzV2l0aCgnL2xvZ28nKSAmJiAhcGF0aC5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8c3ZnfGljb3xqc29uKSQvKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NjgzOVx1NzZFRVx1NUY1NVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwOFx1NTE1Q1x1NUU5NVx1RkYwOTogJHtwYXRofSAtPiAke25ld1BhdGh9YCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke25ld1BhdGh9JHtxdWVyeX1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfbWF0Y2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJvb3RDc3NSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLyhbXi9dK1xcLmNzcykpKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJvb3RDc3NSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGh0bWxDb250ZW50Lm1hdGNoKHJvb3RDc3NSZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtYmFzZS11cmxdIFx1MjZBMFx1RkUwRiAgXHU2OEMwXHU2RDRCXHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkU6YCwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1OEZEOVx1NEU5Qlx1OERFRlx1NUY4NFx1RkYwOFx1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1NjVCOVx1Njg0OFx1RkYwOVxuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2Uocm9vdENzc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHtmaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU0RTg2IGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjb3JzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NvcnMudHNcIjsvKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XG4gKiBcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHMgXHU3Njg0IENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcblxuLyoqXG4gKiBDT1JTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBjcmVkZW50aWFsc1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yc1BsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjb3JzRGV2TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgY29uc3QgY29yc1ByZXZpZXdNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH1cblxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtd2l0aC1jcmVkZW50aWFscycsXG4gICAgZW5mb3JjZTogJ3ByZScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgY29uc3Qgc3RhY2sgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2s7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFjaykpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayA9IFtcbiAgICAgICAgICB7IHJvdXRlOiAnJywgaGFuZGxlOiBjb3JzRGV2TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNEZXZNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbmZpZ3VyZVByZXZpZXdTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNQcmV2aWV3TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNQcmV2aWV3TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx2ZXJzaW9uLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHNcIjsvKipcbiAqIFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICogXHU0RTNBIEhUTUwgXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU1MTY4XHU1QzQwXHU3RURGXHU0RTAwXHU3Njg0XHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gKiBcdTc1MjhcdTRFOEVcdTZENEZcdTg5QzhcdTU2NjhcdTdGMTNcdTVCNThcdTYzQTdcdTUyMzZcdUZGMENcdTZCQ0ZcdTZCMjFcdTY3ODRcdTVFRkFcdTkwRkRcdTRGMUFcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyMTZcdTc1MUZcdTYyMTBcdTUxNjhcdTVDNDBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcbiAqIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTIxOVx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwQ1x1OTBGRFx1NkNBMVx1NjcwOVx1NTIxOVx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFxuICovXG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICAvLyAxLiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMDhcdTc1MzFcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdThCQkVcdTdGNkVcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuXG4gIC8vIDIuIFx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi8uYnVpbGQtdGltZXN0YW1wJyk7XG4gIGlmIChleGlzdHNTeW5jKHRpbWVzdGFtcEZpbGUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1NUZGRFx1NzU2NVx1OEJGQlx1NTNENlx1OTUxOVx1OEJFRlxuICAgIH1cbiAgfVxuXG4gIC8vIDMuIFx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1x1NUU3Nlx1NEZERFx1NUI1OFx1NTIzMFx1NjU4N1x1NEVGNlx1RkYwOFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTQwQ1x1NEUwMFx1NEUyQVx1RkYwOVxuICAvLyBcdTRGN0ZcdTc1MjgzNlx1OEZEQlx1NTIzNlx1N0YxNlx1NzgwMVx1RkYwQ1x1NzUxRlx1NjIxMFx1NjZGNFx1NzdFRFx1NzY4NFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NTMwNVx1NTQyQlx1NUI1N1x1NkJDRFx1NTQ4Q1x1NjU3MFx1NUI1N1x1RkYwQ1x1NTk4MiBsM2syajFoXHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICB0cnkge1xuICAgIHdyaXRlRmlsZVN5bmModGltZXN0YW1wRmlsZSwgdGltZXN0YW1wLCAndXRmLTgnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTVGRkRcdTc1NjVcdTUxOTlcdTUxNjVcdTk1MTlcdThCRUZcbiAgfVxuICByZXR1cm4gdGltZXN0YW1wO1xufVxuXG4vKipcbiAqIFx1NEUzQSBIVE1MIFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVmVyc2lvblBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBidWlsZFRpbWVzdGFtcCA9IGdldEJ1aWxkVGltZXN0YW1wKCk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYWRkLXZlcnNpb24nLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmluZm8oYFthZGQtdmVyc2lvbl0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3OiAke2J1aWxkVGltZXN0YW1wfWApO1xuICAgIH0sXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RjdGXHU3NTI4IHRyYW5zZm9ybUluZGV4SHRtbFx1RkYwOFZpdGUgXHU1MTg1XHU5MEU4XHU2NjJGXHU1NzI4XHU1NDBFXHU3RjZFXHU5NjM2XHU2QkI1XHU3NTFGXHU2MjEwL1x1NTE5OVx1NTE2NSBpbmRleC5odG1sXHVGRjBDZ2VuZXJhdGVCdW5kbGUgXHU1Rjg4XHU1QkI5XHU2NjEzXHU2MkZGXHU0RTBEXHU1MjMwXHU2NzAwXHU3RUM4IEhUTUxcdUZGMDlcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncG9zdCcsXG4gICAgICBoYW5kbGVyKGh0bWwpIHtcbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyAwKSBcdTc5RkJcdTk2NjRcdTdBN0FcdTc2ODQgPHN0eWxlPjwvc3R5bGU+IFx1NjgwN1x1N0I3RVxuICAgICAgICAvLyBcdThCRjRcdTY2MEVcdUZGMUFcdTU3MjhcdTVGQUVcdTUyNERcdTdBRUZcdTY3QjZcdTY3ODRcdTRFMEJcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTg4QUIgcWlhbmt1biBcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFM0JcdTVFOTRcdTc1MjhcdTVERjJcdTdFQ0ZcdTYzRDBcdTRGOUJcdTRFODYgbG9hZGluZ1x1RkYwQ1xuICAgICAgICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODQgc3R5bGUgXHU2ODA3XHU3QjdFXHU1M0VGXHU4MEZEXHU4OEFCXHU1OTA0XHU3NDA2XHU2MjEwXHU3QTdBXHU3Njg0XHUzMDAyXHU3OUZCXHU5NjY0XHU3QTdBXHU2ODA3XHU3QjdFXHU1M0VGXHU0RUU1XHU3QjgwXHU1MzE2IEhUTUwgXHU3RUQzXHU2Nzg0XHUzMDAyXG4gICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUwQlx1RkYwQ1x1NUI1MFx1NUU5NFx1NzUyOFx1NzJFQ1x1N0FDQlx1OEZEMFx1ODg0Q1x1RkYwQ3N0eWxlIFx1NjgwN1x1N0I3RVx1NjcwOVx1NTE4NVx1NUJCOVx1RkYwOGxvYWRpbmcgXHU2ODM3XHU1RjBGXHVGRjA5XHVGRjBDXHU0RTBEXHU0RjFBXHU4OEFCXHU3OUZCXHU5NjY0XHUzMDAyXG4gICAgICAgIGNvbnN0IGVtcHR5U3R5bGVSZWdleCA9IC88c3R5bGU+XFxzKjxcXC9zdHlsZT4vZ2k7XG4gICAgICAgIGlmIChlbXB0eVN0eWxlUmVnZXgudGVzdChuZXdIdG1sKSkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoZW1wdHlTdHlsZVJlZ2V4LCAnJyk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMSkgXHU0RTNBIDxzY3JpcHQgc3JjPiBcdTZERkJcdTUyQTAvXHU2NkY0XHU2NUIwIHZcbiAgICAgICAgLy9cbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RTBEXHU4OTgxXHU3RUQ5IEVTTSBtb2R1bGUgc2NyaXB0XHVGRjA4dHlwZT1cIm1vZHVsZVwiXHVGRjA5XHU4RkZEXHU1MkEwID92XG4gICAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NTQwQ1x1NEUwMFx1NEUyQVx1NkEyMVx1NTc1N1x1NEYxQVx1NTQwQ1x1NjVGNlx1NEVFNVx1MzAwQ1x1NUUyNiB2XHUzMDBEXHU1NDhDXHUzMDBDXHU0RTBEXHU1RTI2IHZcdTMwMERcdUZGMDhcdTk3NTlcdTYwMDEgaW1wb3J0IFx1NzUxRlx1NjIxMFx1NzY4NCBVUkxcdUZGMDlcdTRFMjRcdTU5NTcgVVJMIFx1ODhBQlx1NTJBMFx1OEY3RFx1RkYwQ1xuICAgICAgICAvLyBcdTU3MjhcdTVGQUVcdTUyNERcdTdBRUYvXHU5MUNEXHU1OTBEXHU1MkEwXHU4RjdEXHU1MTY1XHU1M0UzXHU4MTFBXHU2NzJDXHU1NzNBXHU2NjZGXHU0RTBCXHU0RjFBXHU1QkZDXHU4MUY0XHU2QTIxXHU1NzU3XHU2MjY3XHU4ODRDXHU0RTI0XHU2QjIxXHVGRjBDXHU0RUNFXHU4MDBDXHU4OUU2XHU1M0QxXHU3QzdCXHU0RjNDIEVDaGFydHMgXHU3Njg0XHU5MUNEXHU1OTBEXHU2Q0U4XHU1MThDXHU2NUFEXHU4QTAwXHUzMDAyXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgLyg8c2NyaXB0W14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNNb2R1bGVTY3JpcHQgPSAvdHlwZVxccyo9XFxzKltcIiddbW9kdWxlW1wiJ10vaS50ZXN0KG1hdGNoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXNzZXRzID0gc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgfHwgc3JjLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpO1xuXG4gICAgICAgICAgICAvLyBcdTVCRjkgbW9kdWxlIHNjcmlwdFx1RkYxQVx1NUYzQVx1NTIzNlx1NzlGQlx1OTY2NCB2XHVGRjBDXHU0RkREXHU4QkMxIFVSTCBcdTRFMEVcdTYyNTNcdTUzMDVcdTRFQTdcdTcyNjlcdTUxODVcdTkwRTggaW1wb3J0IFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFxuICAgICAgICAgICAgaWYgKGlzTW9kdWxlU2NyaXB0ICYmIGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNsZWFuZWQgPSBzcmMucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgJycpLnJlcGxhY2UoL1xcPyYvLCAnPycpLnJlcGxhY2UoL1s/Jl0kLywgJycpO1xuICAgICAgICAgICAgICBpZiAoY2xlYW5lZCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjbGVhbmVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3JjLmluY2x1ZGVzKCc/dj0nKSB8fCBzcmMuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBzcmMucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkICE9PSBzcmMpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3VwZGF0ZWR9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zdCBzZXAgPSBzcmMuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3NyY30ke3NlcH12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDIpIFx1NEUzQSA8bGluayBocmVmPiBcdTZERkJcdTUyQTAvXHU2NkY0XHU2NUIwIHZcbiAgICAgICAgLy9cbiAgICAgICAgLy8gXHU1NDBDXHU0RTBBXHVGRjFBbW9kdWxlcHJlbG9hZCBcdTVDNUVcdTRFOEUgRVNNIFx1NEY5RFx1OEQ1Nlx1NTZGRVx1NzY4NFx1NEUwMFx1OTBFOFx1NTIwNlx1RkYwQ1x1OEZGRFx1NTJBMCA/diBcdTRGMUFcdThCQTlcdTk4ODRcdTUyQTBcdThGN0QgVVJMIFx1NEUwRSBpbXBvcnQgVVJMIFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwQ1xuICAgICAgICAvLyBcdTkwMjBcdTYyMTBcdTkxQ0RcdTU5MERcdThCRjdcdTZDNDJcdTc1MUFcdTgxRjNcdTkxQ0RcdTU5MERcdTYyNjdcdTg4NENcdUZGMDhcdTU3MjhcdTY3RDBcdTRFOUIgbG9hZGVyIFx1NTczQVx1NjY2Rlx1NEUwQlx1RkYwOVx1MzAwMlxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC8oPGxpbmtbXj5dKlxccytocmVmPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIGhyZWY6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlUHJlbG9hZCA9IC9cXHNyZWxcXHMqPVxccypbXCInXW1vZHVsZXByZWxvYWRbXCInXS9pLnRlc3QobWF0Y2gpO1xuICAgICAgICAgICAgY29uc3QgaXNBc3NldHMgPSBocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgfHwgaHJlZi5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKTtcblxuICAgICAgICAgICAgaWYgKGlzTW9kdWxlUHJlbG9hZCAmJiBpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gaHJlZi5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCAnJykucmVwbGFjZSgvXFw/Ji8sICc/JykucmVwbGFjZSgvWz8mXSQvLCAnJyk7XG4gICAgICAgICAgICAgIGlmIChjbGVhbmVkICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjbGVhbmVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaHJlZi5pbmNsdWRlcygnP3Y9JykgfHwgaHJlZi5pbmNsdWRlcygnJnY9JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwID0gaHJlZi5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7aHJlZn0ke3NlcH12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDMpIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NFx1NTE4NVx1ODA1NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcdUZGMENcdTkwN0ZcdTUxNERcdTg4QUJcdTVCQkZcdTRFM0JcdTU3REZcdTU0MERcdTg5RTNcdTY3OTBcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTVGXHU0RTBEXHU4OTgxXHU4RkZEXHU1MkEwID92XHVGRjBDXHU5MDdGXHU1MTREXHU1RjYyXHU2MjEwXHUzMDBDXHU1RTI2IHYgLyBcdTRFMERcdTVFMjYgdlx1MzAwRFx1NEUyNFx1NTk1N1x1NTE2NVx1NTNFMyBVUkxcdUZGMENcdTVCRkNcdTgxRjRcdTUxNjVcdTUzRTNcdTZBMjFcdTU3NTdcdTg4QUJcdTkxQ0RcdTU5MERcdTYyNjdcdTg4NENcdTMwMDJcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IHFpYW5rdW4gc2FuZGJveCBcdTRFMkRcdTY2RjRcdTUzRUZcdTk3NjBcdTc2ODRcdTUxOTlcdTZDRDVcdTY2MkZcdTc2RjRcdTYzQTVcdThCRkJcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cbiAgICAgICAgLy8gXHU4MDBDXHU0RTBEXHU2NjJGIHdpbmRvdy5fX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOHdpbmRvdyBcdTUzRUZcdTgwRkRcdTg4QUIgcHJveHkgXHU5MUNEXHU1MTk5L1x1NEUwRFx1NTMwNVx1NTQyQiBsb2NhdGlvblx1RkYwOVx1MzAwMlxuICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZyxcbiAgICAgICAgICAoX206IHN0cmluZywgX3E6IHN0cmluZywgYWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScpKWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFthZGQtdmVyc2lvbl0gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3OiB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY29weS1pY29ucy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jb3B5LWljb25zLnRzXCI7LyoqXG4gKiBcdTU5MERcdTUyMzYgaWNvbnMgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKiBcdTc1MjhcdTRFOEVcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTU5MERcdTUyMzYgcHVibGljL2ljb25zIFx1NzZFRVx1NUY1NVx1NTIzMCBkaXN0L2ljb25zXG4gKiBcdTRFM0JcdTg5ODFcdTc1MjhcdTRFOEUgYWRtaW4tYXBwXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU5NzAwXHU4OTgxXHU2NjNFXHU3OTNBXHU1NkZFXHU2ODA3XHU1MTg1XHU1QkI5XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjb3B5LWljb25zXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY29weS1pY29uc10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tjb3B5LWljb25zXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY29weS1pY29uc10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgY29weUZpbGVTeW5jLCBta2RpclN5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgd3JpdGVGaWxlU3luYywgdW5saW5rU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29weUljb25zUGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgbGV0IHZpdGVDb25maWc6IFJlc29sdmVkQ29uZmlnIHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY29weS1pY29ucycsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgdml0ZUNvbmZpZyA9IGNvbmZpZztcbiAgICB9LFxuXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZpdGVDb25maWcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb290ID0gdml0ZUNvbmZpZy5yb290IHx8IGFwcERpcjtcbiAgICAgICAgY29uc3QgaWNvbnNTb3VyY2VEaXIgPSByZXNvbHZlKHJvb3QsICdwdWJsaWMvaWNvbnMnKTtcblxuICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTZFOTBcdTc2RUVcdTVGNTVcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGljb25zU291cmNlRGlyKSkge1xuICAgICAgICAgIHJldHVybjsgLy8gXHU1OTgyXHU2NzlDXHU2RTkwXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU5NzU5XHU5RUQ4XHU4REYzXHU4RkM3XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTgzQjdcdTUzRDZcdTY3ODRcdTVFRkFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcbiAgICAgICAgY29uc3Qgb3V0RGlyID0gdml0ZUNvbmZpZy5idWlsZC5vdXREaXIgfHwgJ2Rpc3QnO1xuICAgICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShyb290LCBvdXREaXIpO1xuXG4gICAgICAgIGlmICghZXhpc3RzU3luYyhkaXN0RGlyKSkge1xuICAgICAgICAgIHJldHVybjsgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4REYzXHU4RkM3XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpY29uc0Rlc3REaXIgPSByZXNvbHZlKGRpc3REaXIsICdpY29ucycpO1xuXG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoaWNvbnNEZXN0RGlyKSkge1xuICAgICAgICAgIG1rZGlyU3luYyhpY29uc0Rlc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1OTBEXHU1MjM2IGljb25zIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NjI0MFx1NjcwOVx1NjU4N1x1NEVGNlxuICAgICAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKGljb25zU291cmNlRGlyKTtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IHJlc29sdmUoaWNvbnNTb3VyY2VEaXIsIGZpbGUpO1xuICAgICAgICAgIGNvbnN0IGRlc3RQYXRoID0gcmVzb2x2ZShpY29uc0Rlc3REaXIsIGZpbGUpO1xuXG4gICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0U3luYyhzb3VyY2VQYXRoKTtcbiAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIGNvcHlGaWxlU3luYyhzb3VyY2VQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU0RTBEXHU1MThEXHU1OTBEXHU1MjM2IGZhdmljb24uaWNvXHVGRjBDXHU3RURGXHU0RTAwXHU0RjdGXHU3NTI4IGxvZ28ucG5nIFx1NEY1Q1x1NEUzQSBmYXZpY29uXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NUI1OFx1NTcyOCBmYXZpY29uLmljb1x1RkYwQ1x1NTIyMFx1OTY2NFx1NUI4M1x1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRiBWaXRlIFx1NzY4NCBwdWJsaWNEaXIgXHU1OTBEXHU1MjM2XHU3Njg0XHVGRjA5XG4gICAgICAgIGNvbnN0IGZhdmljb25EZXN0ID0gcmVzb2x2ZShkaXN0RGlyLCAnZmF2aWNvbi5pY28nKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoZmF2aWNvbkRlc3QpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHVubGlua1N5bmMoZmF2aWNvbkRlc3QpO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbY29weS1pY29uc10gXHU1REYyXHU1MjIwXHU5NjY0XHU0RTBEXHU5NzAwXHU4OTgxXHU3Njg0IGZhdmljb24uaWNvOiAke2Zhdmljb25EZXN0fWApO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTVFNzZcdTU5MERcdTUyMzYgc2l0ZS53ZWJtYW5pZmVzdFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICAgICAgICBjb25zdCBtYW5pZmVzdFNvdXJjZSA9IHJlc29sdmUocm9vdCwgJ3B1YmxpYy9pY29ucy9zaXRlLndlYm1hbmlmZXN0Jyk7XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0RGVzdCA9IHJlc29sdmUoaWNvbnNEZXN0RGlyLCAnc2l0ZS53ZWJtYW5pZmVzdCcpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhtYW5pZmVzdFNvdXJjZSkpIHtcbiAgICAgICAgICBjb3B5RmlsZVN5bmMobWFuaWZlc3RTb3VyY2UsIG1hbmlmZXN0RGVzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU1QzFEXHU4QkQ1XHU0RUNFIHB1YmxpYyBcdTY4MzlcdTc2RUVcdTVGNTVcdTU5MERcdTUyMzZcbiAgICAgICAgICBjb25zdCBtYW5pZmVzdFNvdXJjZVJvb3QgPSByZXNvbHZlKHJvb3QsICdwdWJsaWMvc2l0ZS53ZWJtYW5pZmVzdCcpO1xuICAgICAgICAgIGlmIChleGlzdHNTeW5jKG1hbmlmZXN0U291cmNlUm9vdCkpIHtcbiAgICAgICAgICAgIGNvcHlGaWxlU3luYyhtYW5pZmVzdFNvdXJjZVJvb3QsIG1hbmlmZXN0RGVzdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NzUxRlx1NjIxMFx1NEUwMFx1NEUyQVx1NTdGQVx1NjcyQ1x1NzY4NCBzaXRlLndlYm1hbmlmZXN0XG4gICAgICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHtcbiAgICAgICAgICAgICAgbmFtZTogJ0JUQyBTaG9wRmxvdyBBZG1pbicsXG4gICAgICAgICAgICAgIHNob3J0X25hbWU6ICdCVEMgQWRtaW4nLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JUQyBTaG9wRmxvdyBcdTdCQTFcdTc0MDZcdTVFOTRcdTc1MjgnLFxuICAgICAgICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgICAgICAgIHRoZW1lX2NvbG9yOiAnIzQwNDA0MCcsXG4gICAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgc3JjOiAnL2ljb25zL2FuZHJvaWQtY2hyb21lLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHNyYzogJy9pY29ucy9hbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvZmF2aWNvbi0zMngzMi5wbmcnLFxuICAgICAgICAgICAgICAgICAgc2l6ZXM6ICczMngzMicsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHNyYzogJy9pY29ucy9mYXZpY29uLTE2eDE2LnBuZycsXG4gICAgICAgICAgICAgICAgICBzaXplczogJzE2eDE2JyxcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhtYW5pZmVzdERlc3QsIEpTT04uc3RyaW5naWZ5KG1hbmlmZXN0LCBudWxsLCAyKSwgJ3V0Zi04Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5pbmZvKGBbY29weS1pY29uc10gXHU1REYyXHU1OTBEXHU1MjM2IGljb25zIFx1NzZFRVx1NUY1NVx1NTIzMDogJHtpY29uc0Rlc3REaXJ9YCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcbiAgICAgICAgY29uc29sZS53YXJuKCdbY29weS1pY29uc10gXHU1OTBEXHU1MjM2IGljb25zIFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cGxvYWQtaWNvbnMtdG8tb3NzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1pY29ucy10by1vc3MudHNcIjsvKipcbiAqIFx1NEUwQVx1NEYyMFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NTIzMCBPU1MgXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdUZGMENcdTgxRUFcdTUyQThcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTXHVGRjA4XHU1N0ZBXHU0RThFXHU2NTg3XHU0RUY2XHU2MzA3XHU3RUI5XHU3Njg0XHU1ODlFXHU5MUNGXHU0RTBBXHU0RjIwXHVGRjA5XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHJlc29sdmUoX19maWxlbmFtZSwgJy4uJyk7XG5jb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4nKTtcblxuZnVuY3Rpb24gdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpOiB2b2lkIHtcbiAgLy8gXHU1M0VBXHU1NzI4IFdpbmRvd3MgXHU0RTE0XHU3RjNBXHU1QzExXHU1MUVEXHU4QkMxXHU2NUY2XHU1QzFEXHU4QkQ1XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSByZXR1cm47XG4gIGlmIChwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCAmJiBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHJldHVybjtcblxuICB0cnkge1xuICAgIC8vIFx1OTAxQVx1OEZDNyBQb3dlclNoZWxsICsgQ3JlZGVudGlhbE1hbmFnZXIgXHU4QkZCXHU1M0Q2XHVGRjA4XHU0RTBEXHU4RjkzXHU1MUZBXHU2NjBFXHU2NTg3XHU1MjMwXHU2NUU1XHU1RkQ3XHVGRjA5XG4gICAgY29uc3QgcHMgPSBbXG4gICAgICBgJEVycm9yQWN0aW9uUHJlZmVyZW5jZT0nU3RvcCdgLFxuICAgICAgYEltcG9ydC1Nb2R1bGUgQ3JlZGVudGlhbE1hbmFnZXJgLFxuICAgICAgYCRpZD0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkJyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJHNlYz0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkU2VjcmV0JyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJG91dD1bcHNjdXN0b21vYmplY3RdQHsgaWQ9JGlkOyBzZWNyZXQ9JHNlYyB9IHwgQ29udmVydFRvLUpzb24gLUNvbXByZXNzYCxcbiAgICAgIGBXcml0ZS1PdXRwdXQgJG91dGAsXG4gICAgXS5qb2luKCc7ICcpO1xuXG4gICAgY29uc3QgcmF3ID0gZXhlY1N5bmMoYHBvd2Vyc2hlbGwgLU5vUHJvZmlsZSAtTm9uSW50ZXJhY3RpdmUgLUNvbW1hbmQgXCIke3BzLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsIHtcbiAgICAgIHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgJ2lnbm9yZSddLFxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGpzb25UZXh0ID0gKHJhdyB8fCAnJykudHJpbSgpO1xuICAgIGlmICghanNvblRleHQpIHJldHVybjtcblxuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIHsgaWQ/OiBzdHJpbmc7IHNlY3JldD86IHN0cmluZyB9O1xuICAgIGlmIChwYXJzZWQ/LmlkICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgPSBwYXJzZWQuaWQ7XG4gICAgaWYgKHBhcnNlZD8uc2VjcmV0ICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCA9IHBhcnNlZC5zZWNyZXQ7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYxQVx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1NkQ0MVx1N0EwQlxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRJY29uc1RvT3NzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3VwbG9hZC1pY29ucy10by1vc3MnLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIC8vIFZpdGUgXHU3Njg0IGlzUHJvZHVjdGlvbiBcdTY2MkZcdTY3MDBcdTUzRUZcdTk3NjBcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTkwN0ZcdTUxNEQgTk9ERV9FTlYgLyBERVYgXHU3QjQ5XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1NzI4IENJIFx1NEUyRFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gXHU1M0VBXHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTBBXHU0RjIwXG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbkJ1aWxkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gV2luZG93cyBcdTY3MkNcdTU3MzBcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTY3OUNcdTY3MkFcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkUgZW52Ly5lbnYub3NzXHVGRjBDXHU1QzFEXHU4QkQ1XHU0RUNFXHU1MUVEXHU4QkMxXHU3QkExXHU3NDA2XHU1NjY4XHU4QkZCXHU1M0Q2XG4gICAgICB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOSBPU1MgXHU5MTREXHU3RjZFXG4gICAgICBpZiAoIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEIHx8ICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU0RTBBXHU0RjIwXHVGRjBDYWxsLmJlbGxpcy5jb20uY24gXHU0RUUzXHU3NDA2XHU1MjMwIE9TUyBcdTVDMDZcdThGRDRcdTU2REUgTm9TdWNoS2V5XHVGRjA4bG9nby5wbmcgLyBpY29ucy8qXHVGRjA5XG4gICAgICAgIGNvbnNvbGUud2FybignW3VwbG9hZC1pY29ucy10by1vc3NdIFx1MjZBMFx1RkUwRiAgXHU4REYzXHU4RkM3XHU0RTBBXHU0RjIwXHVGRjA4XHU2NzJBXHU5MTREXHU3RjZFIE9TUyBcdTUxRURcdThCQzFcdUZGMDlcdTMwMDJcdThGRDlcdTRGMUFcdTVCRkNcdTgxRjQgaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbi9sb2dvLnBuZyBcdThGRDRcdTU2REUgTm9TdWNoS2V5Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IENJIFx1NEUyRFx1NUZDNVx1OTg3Qlx1N0I0OVx1NUY4NVx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMFx1RkYwQ1x1NTQyNlx1NTIxOVx1Njc4NFx1NUVGQVx1OEZEQlx1N0EwQlx1OTAwMFx1NTFGQVx1NEYxQVx1NzZGNFx1NjNBNVx1N0VDOFx1NkI2Mlx1NUI1MFx1OEZEQlx1N0EwQlx1RkYwQ1x1NUJGQ1x1ODFGNFx1NjU4N1x1NEVGNlx1NjcyQVx1NEUwQVx1NEYyMFxuICAgICAgY29uc3QgdXBsb2FkU2NyaXB0ID0gcmVzb2x2ZShwcm9qZWN0Um9vdCwgJ3NjcmlwdHMvdXBsb2FkLWljb25zLXRvLW9zcy5tanMnKTtcbiAgICAgIGNvbnNvbGUuaW5mbygnW3VwbG9hZC1pY29ucy10by1vc3NdIFx1RDgzRFx1REU4MCBcdTVGMDBcdTU5Q0JcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTLi4uJyk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKCdub2RlJywgW3VwbG9hZFNjcmlwdF0sIHtcbiAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10gXHUyNzA1IFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMCcpO1xuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXHU5RUQ4XHU4QkE0XHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHVGRjFBbGF5b3V0LWFwcCBkaXN0IFx1OTFDQ1x1NEVDRFx1NjcwOSBpY29ucy9sb2dvIFx1NEY1Q1x1NEUzQVx1NjcyQ1x1NTczMFx1NTQwRVx1NTkwN1x1RkYwQ1x1OTA3Rlx1NTE0RCA0MDRcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1OTcwMFx1NEUyNVx1NjgzQ1x1NTkzMVx1OEQyNVx1RkYwOENJIFx1NUYzQVx1NTIzNlx1NEUwQVx1NEYyMFx1NjIxMFx1NTI5Rlx1RkYwOVx1RkYwQ1x1OEJCRVx1N0Y2RSBPU1NfVVBMT0FEX1NUUklDVD10cnVlXG4gICAgICAgICAgICBjb25zdCBzdHJpY3QgPSBwcm9jZXNzLmVudi5PU1NfVVBMT0FEX1NUUklDVCA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBbdXBsb2FkLWljb25zLXRvLW9zc10gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVwbG9hZC1jZG4udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWNkbi50c1wiOy8qKlxuICogXHU0RTBBXHU0RjIwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU1MjMwIENETiBcdTc2ODQgVml0ZSBcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1NTQwRVx1RkYwQ1x1ODFFQVx1NTJBOFx1NEUwQVx1NEYyMFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NTIzMCBPU1MvQ0ROXHVGRjA4XHU1N0ZBXHU0RThFXHU2NTg3XHU0RUY2XHU2MzA3XHU3RUI5XHU3Njg0XHU1ODlFXHU5MUNGXHU0RTBBXHU0RjIwXHVGRjA5XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t1cGxvYWQtY2RuXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t1cGxvYWQtY2RuXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHJlc29sdmUoX19maWxlbmFtZSwgJy4uJyk7XG5jb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4nKTtcblxuZnVuY3Rpb24gdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpOiB2b2lkIHtcbiAgLy8gXHU1M0VBXHU1NzI4IFdpbmRvd3MgXHU0RTE0XHU3RjNBXHU1QzExXHU1MUVEXHU4QkMxXHU2NUY2XHU1QzFEXHU4QkQ1XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSByZXR1cm47XG4gIGlmIChwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCAmJiBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHJldHVybjtcblxuICB0cnkge1xuICAgIC8vIFx1OTAxQVx1OEZDNyBQb3dlclNoZWxsICsgQ3JlZGVudGlhbE1hbmFnZXIgXHU4QkZCXHU1M0Q2XHVGRjA4XHU0RTBEXHU4RjkzXHU1MUZBXHU2NjBFXHU2NTg3XHU1MjMwXHU2NUU1XHU1RkQ3XHVGRjA5XG4gICAgY29uc3QgcHMgPSBbXG4gICAgICBgJEVycm9yQWN0aW9uUHJlZmVyZW5jZT0nU3RvcCdgLFxuICAgICAgYEltcG9ydC1Nb2R1bGUgQ3JlZGVudGlhbE1hbmFnZXJgLFxuICAgICAgYCRpZD0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkJyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJHNlYz0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkU2VjcmV0JyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJG91dD1bcHNjdXN0b21vYmplY3RdQHsgaWQ9JGlkOyBzZWNyZXQ9JHNlYyB9IHwgQ29udmVydFRvLUpzb24gLUNvbXByZXNzYCxcbiAgICAgIGBXcml0ZS1PdXRwdXQgJG91dGAsXG4gICAgXS5qb2luKCc7ICcpO1xuXG4gICAgY29uc3QgcmF3ID0gZXhlY1N5bmMoYHBvd2Vyc2hlbGwgLU5vUHJvZmlsZSAtTm9uSW50ZXJhY3RpdmUgLUNvbW1hbmQgXCIke3BzLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsIHtcbiAgICAgIHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgJ2lnbm9yZSddLFxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGpzb25UZXh0ID0gKHJhdyB8fCAnJykudHJpbSgpO1xuICAgIGlmICghanNvblRleHQpIHJldHVybjtcblxuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIHsgaWQ/OiBzdHJpbmc7IHNlY3JldD86IHN0cmluZyB9O1xuICAgIGlmIChwYXJzZWQ/LmlkICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgPSBwYXJzZWQuaWQ7XG4gICAgaWYgKHBhcnNlZD8uc2VjcmV0ICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCA9IHBhcnNlZC5zZWNyZXQ7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYxQVx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1NkQ0MVx1N0EwQlxuICB9XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENETiBcdTRFMEFcdTRGMjBcdTYzRDJcdTRFRjZcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnc3lzdGVtLWFwcCdcdUZGMDlcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRDZG5QbHVnaW4oYXBwTmFtZTogc3RyaW5nLCBfYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd1cGxvYWQtY2RuJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb24gXHU2NjJGXHU2NzAwXHU1M0VGXHU5NzYwXHU3Njg0XHU1MjI0XHU2NUFEXHVGRjA4XHU5MDdGXHU1MTREIE5PREVfRU5WIC8gREVWIFx1N0I0OVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTcyOCBDSSBcdTRFMkRcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE4gXHU0RTBBXHU0RjIwXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9VUExPQUQgIT09ICd0cnVlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1OERGM1x1OEZDN1x1NEUwQVx1NEYyMFxuICAgICAgaWYgKHByb2Nlc3MuZW52LlNLSVBfQ0ROX1VQTE9BRCA9PT0gJ3RydWUnKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3VwbG9hZC1jZG5dIFx1MjNFRFx1RkUwRiAgXHU4REYzXHU4RkM3ICR7YXBwTmFtZX0gXHU3Njg0IENETiBcdTRFMEFcdTRGMjBcdUZGMDhTS0lQX0NETl9VUExPQUQ9dHJ1ZVx1RkYwOWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NEUwQVx1NEYyMFxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdpbmRvd3MgXHU2NzJDXHU1NzMwXHU2Nzg0XHU1RUZBXHVGRjFBXHU1OTgyXHU2NzlDXHU2NzJBXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGVudi8uZW52Lm9zc1x1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRVx1NTFFRFx1OEJDMVx1N0JBMVx1NzQwNlx1NTY2OFx1OEJGQlx1NTNENlxuICAgICAgdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDkgT1NTIFx1OTE0RFx1N0Y2RVxuICAgICAgaWYgKCFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCB8fCAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW3VwbG9hZC1jZG5dIFx1MjZBMFx1RkUwRiAgXHU4REYzXHU4RkM3ICR7YXBwTmFtZX0gXHU3Njg0IENETiBcdTRFMEFcdTRGMjBcdUZGMDhcdTY3MkFcdTkxNERcdTdGNkUgT1NTIFx1NTFFRFx1OEJDMVx1RkYwOWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBDSSBcdTRFMkRcdTVGQzVcdTk4N0JcdTdCNDlcdTVGODVcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBcdUZGMENcdTU0MjZcdTUyMTlcdTY3ODRcdTVFRkFcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdTRGMUFcdTc2RjRcdTYzQTVcdTdFQzhcdTZCNjJcdTVCNTBcdThGREJcdTdBMEJcdUZGMENcdTVCRkNcdTgxRjRcdTY1ODdcdTRFRjZcdTY3MkFcdTRFMEFcdTRGMjBcbiAgICAgIGNvbnN0IHVwbG9hZFNjcmlwdCA9IHJlc29sdmUocHJvamVjdFJvb3QsICdzY3JpcHRzL3VwbG9hZC1hcHAtdG8tY2RuLm1qcycpO1xuICAgICAgY29uc29sZS5pbmZvKGBbdXBsb2FkLWNkbl0gXHVEODNEXHVERTgwIFx1NUYwMFx1NTlDQlx1NEUwQVx1NEYyMCAke2FwcE5hbWV9IFx1NTIzMCBDRE4uLi5gKTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmVQcm9taXNlLCByZWplY3RQcm9taXNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oJ25vZGUnLCBbdXBsb2FkU2NyaXB0LCBhcHBOYW1lXSwge1xuICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICByZWplY3RQcm9taXNlKGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFt1cGxvYWQtY2RuXSBcdTI3MDUgJHthcHBOYW1lfSBcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBgKTtcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1OUVEOFx1OEJBNFx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1OTcwMFx1NEUyNVx1NjgzQ1x1NTkzMVx1OEQyNVx1RkYwOENJIFx1NUYzQVx1NTIzNlx1NEUwQVx1NEYyMFx1NjIxMFx1NTI5Rlx1RkYwOVx1RkYwQ1x1OEJCRVx1N0Y2RSBPU1NfVVBMT0FEX1NUUklDVD10cnVlXG4gICAgICAgICAgICBjb25zdCBzdHJpY3QgPSBwcm9jZXNzLmVudi5PU1NfVVBMT0FEX1NUUklDVCA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBbdXBsb2FkLWNkbl0gJHthcHBOYW1lfSBcdTRFMEFcdTRGMjBcdTgxMUFcdTY3MkNcdTkwMDBcdTUxRkFcdUZGMENcdTRFRTNcdTc4MDE6ICR7Y29kZSA/PyAndW5rbm93bid9YCk7XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2RuLWFzc2V0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4tYXNzZXRzLnRzXCI7LyoqXG4gKiBDRE4gXHU4RDQ0XHU2RTkwXHU1MkEwXHU5MDFGXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTRGRUVcdTY1MzkgSFRNTCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTAgVVJMXHVGRjBDXHU1QzA2XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAqIFx1NjUyRlx1NjMwMVx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MCAoL2Fzc2V0cy8pIFx1NTQ4Q1x1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MCAoL2Fzc2V0cy9sYXlvdXQvKVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbY2RuLWFzc2V0c10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2RuLWFzc2V0c10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENkbkFzc2V0c1BsdWdpbk9wdGlvbnMge1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdhZG1pbi1hcHAnXHVGRjA5XG4gICAqL1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NTJBMFx1OTAxRlx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTQyRlx1NzUyOFx1RkYwOVxuICAgKi9cbiAgZW5hYmxlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDRE4gXHU1N0RGXHU1NDBEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBYWxsLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgICovXG4gIGNkbkRvbWFpbj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDRE4gXHU4RDQ0XHU2RTkwXHU1MkEwXHU5MDFGXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZG5Bc3NldHNQbHVnaW4ob3B0aW9uczogQ2RuQXNzZXRzUGx1Z2luT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IHtcbiAgICBhcHBOYW1lLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OUVEOFx1OEJBNFx1NTQyRlx1NzUyOFx1Njc2MVx1NEVGNlx1NUZDNVx1OTg3Qlx1NjYwRVx1Nzg2RVx1NjhDMFx1NjdFNSBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAgICAvLyBcdTU5ODJcdTY3OUMgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU4OEFCXHU4QkJFXHU3RjZFXHU0RTNBICdmYWxzZSdcdUZGMENcdTUyMTlcdTc5ODFcdTc1MjggQ0ROXG4gICAgLy8gXHU1M0VBXHU2NzA5XHU1NzI4XHU2NjBFXHU3ODZFXHU1NDJGXHU3NTI4XHVGRjA4RU5BQkxFX0NETl9BQ0NFTEVSQVRJT049dHJ1ZVx1RkYwOVx1NjIxNlx1NjcyQVx1OEJCRVx1N0Y2RVx1NEUxNFx1NjYyRlx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NjVGNlx1RkYwQ1x1NjI0RFx1NTQyRlx1NzUyOCBDRE5cbiAgICBlbmFibGVkID0gcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gPT09ICd0cnVlJyB8fCBcbiAgICAgICAgICAgICAgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyAhPT0gJ3RydWUnKSxcbiAgICBjZG5Eb21haW4gPSAnaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbicsXG4gIH0gPSBvcHRpb25zO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Nkbi1hc3NldHMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBDRE4gXHU1MkEwXHU5MDFGXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1RTk0XHU3NTI4OiAke2FwcE5hbWV9LCBDRE4gXHU1N0RGXHU1NDBEOiAke2NkbkRvbWFpbn1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1hc3NldHNdIENETiBcdTUyQTBcdTkwMUZcdTVERjJcdTc5ODFcdTc1MjhgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgb3JkZXI6ICdwb3N0JywgLy8gXHU1NzI4IGFkZFZlcnNpb25QbHVnaW4gXHU0RTRCXHU1NDBFXHU2MjY3XHU4ODRDXG4gICAgICBoYW5kbGVyKGh0bWwpIHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1MzczXHU0RjdGIENETiBcdTYzRDJcdTRFRjZcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTU5ODJcdTY3OUNcdTY2MkZcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMENcdTRFNUZcdTk3MDBcdTg5ODFcdTZDRThcdTUxNjVcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICAvLyBcdTU2RTBcdTRFM0FcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTUzRUZcdTgwRkRcdTRGN0ZcdTc1MjhcdTRFNEJcdTUyNERcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTU0MkIgQ0ROIFVSTCBcdTc2ODRcdTRFQTdcdTcyNjlcbiAgICAgICAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgICAgICAgY29uc3QgbmVlZHNFYXJseUNvbnZlcnRlciA9IGlzUHJldmlld0J1aWxkICYmICFlbmFibGVkO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFlbmFibGVkICYmICFuZWVkc0Vhcmx5Q29udmVydGVyKSB7XG4gICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3SHRtbCA9IGh0bWw7XG4gICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIDEpIFx1NTkwNFx1NzQwNiA8c2NyaXB0IHNyYz4gXHU2ODA3XHU3QjdFXHVGRjA4XHU0RUM1XHU1NzI4IENETiBcdTU0MkZcdTc1MjhcdTY1RjZcdThGNkNcdTYzNjJcdUZGMDlcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8c2NyaXB0W14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgc3JjOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIXNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy9sYXlvdXQveHh4LmpzXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQS4vYXNzZXRzL3h4eC5qcyBcdTYyMTYgYXNzZXRzL3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpIHx8IHNyYy5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHNyYy5zdGFydHNXaXRoKCcuLycpID8gc3JjLnN1YnN0cmluZygyKSA6IHNyYztcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwLyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9LyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIpIFx1NTkwNFx1NzQwNiA8bGluayBocmVmPiBcdTY4MDdcdTdCN0VcdUZGMDhDU1NcdTMwMDFtb2R1bGVwcmVsb2FkIFx1N0I0OVx1RkYwOVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPGxpbmtbXj5dKlxccytocmVmPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgaHJlZjogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5jc3NcbiAgICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7aHJlZn1gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5jc3NcbiAgICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke2hyZWZ9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykgfHwgaHJlZi5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IGhyZWYuc3RhcnRzV2l0aCgnLi8nKSA/IGhyZWYuc3Vic3RyaW5nKDIpIDogaHJlZjtcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwLyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9LyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMpIFx1NTkwNFx1NzQwNiA8aW1nIHNyYz4gXHU2ODA3XHU3QjdFXHVGRjA4XHU0RUM1XHU1NzI4IENETiBcdTU0MkZcdTc1MjhcdTY1RjZcdThGNkNcdTYzNjJcdUZGMDlcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8aW1nW14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgc3JjOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMveHh4LnBuZ1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIXNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy9sYXlvdXQveHh4LnBuZ1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0KSBcdTU5MDRcdTc0MDZcdTUxODVcdTgwNTRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjA4XHU1NzI4IEhUTUwgXHU2QTIxXHU2NzdGXHU0RTJEXHVGRjA5XG4gICAgICAgIC8vIFx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NFx1NTE4NVx1ODA1NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcbiAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICBcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvaW1wb3J0XFwoXFxzKihbJ1wiXSkoXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLVteJ1wiXSspXFwxXFxzKlxcKS9nLFxuICAgICAgICAgIChfbTogc3RyaW5nLCBfcTogc3RyaW5nLCBhYnNQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1OTAzQlx1OEY5MVx1RkYwQ1x1NEY0Nlx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nKSlgO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gNSkgXHU2Q0U4XHU1MTY1XHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU1NjY4XHU1MjFEXHU1OUNCXHU1MzE2XHU4MTFBXHU2NzJDXHU1NDhDXHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1MzczXHU0RjdGIENETiBcdTYzRDJcdTRFRjZcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdTRFNUZcdTk3MDBcdTg5ODFcdTZDRThcdTUxNjVcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICBpZiAoIW5ld0h0bWwuaW5jbHVkZXMoJ19fQlRDX1JFU09VUkNFX0xPQURFUl9fJykgfHwgbmVlZHNFYXJseUNvbnZlcnRlcikge1xuICAgICAgICAgIC8vIFx1NjgzOVx1NjM2RSBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTUxQjNcdTVCOUFcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROXG4gICAgICAgICAgY29uc3QgY2RuRW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnO1xuICAgICAgICAgIGNvbnN0IGlzUHJldmlld0J1aWxkID0gcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXID09PSAndHJ1ZSc7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdUZGMDhcdTU3MjhcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdTZDRThcdTUxNjVcdUZGMENcdTc1MjhcdTRFOEVcdTU3MjggSFRNTCBcdTg5RTNcdTY3OTBcdTUyNERcdThGNkNcdTYzNjIgQ0ROIFVSTFx1RkYwOVxuICAgICAgICAgIC8vIFx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RTVGXHU1M0VGXHU4MEZEXHU0RjdGXHU3NTI4XHU1MzA1XHU1NDJCIENETiBVUkwgXHU3Njg0XHU2NUU3XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XG4gICAgICAgICAgY29uc3QgZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQgPSBpc1ByZXZpZXdCdWlsZCA/IGBcbjxzY3JpcHQ+XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggSFRNTCBcdTg5RTNcdTY3OTBcdTRFNEJcdTUyNERcdTVDMzFcdTU5MDRcdTc0MDYgQ0ROIFVSTFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OEJGN1x1NkM0MiBDRE4gXHU4RDQ0XHU2RTkwXG4gICAgLy8gXHU4RkQ5XHU0RTJBXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4XHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYyNjdcdTg4NENcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgY29udmVydENkblVybCA9ICh1cmwpID0+IHtcbiAgICAgICAgaWYgKCF1cmwgfHwgKCF1cmwuc3RhcnRzV2l0aCgnaHR0cDovLycpICYmICF1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkpIHtcbiAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICAgIGlmICh1cmxPYmouaG9zdG5hbWUuaW5jbHVkZXMoJ2FsbC5iZWxsaXMuY29tLmNuJykgfHwgXG4gICAgICAgICAgICAgIHVybE9iai5ob3N0bmFtZS5pbmNsdWRlcygnYmVsbGlzMS5vc3MtY24tc2hlbnpoZW4uYWxpeXVuY3MuY29tJykpIHtcbiAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENlx1OERFRlx1NUY4NFx1OTBFOFx1NTIwNlx1RkYwQ1x1NTNCQlx1NjM4OVx1NUU5NFx1NzUyOFx1NTI0RFx1N0YwMFxuICAgICAgICAgICAgbGV0IHBhdGggPSB1cmxPYmoucGF0aG5hbWU7XG4gICAgICAgICAgICBpZiAocGF0aC5pbmNsdWRlcygnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHJpbmcocGF0aC5pbmRleE9mKCcvYXNzZXRzLycpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0aC5pbmNsdWRlcygnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyaW5nKHBhdGguaW5kZXhPZignL2Fzc2V0cy9sYXlvdXQvJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU0RkREXHU3NTU5XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHU1NDhDXHU1NEM4XHU1RTBDXG4gICAgICAgICAgICByZXR1cm4gcGF0aCArICh1cmxPYmouc2VhcmNoIHx8ICcnKSArICh1cmxPYmouaGFzaCB8fCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gVVJMIFx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1RkYwQ1x1OEZENFx1NTZERVx1NTM5RiBVUkxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU2MkU2XHU2MjJBIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRcdUZGMENcdTU3MjhcdTUyMUJcdTVFRkEgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NjVGNlx1OEY2Q1x1NjM2MiBVUkxcbiAgICAgIGNvbnN0IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQuYmluZChkb2N1bWVudCk7XG4gICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24odGFnTmFtZSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gb3JpZ2luYWxDcmVhdGVFbGVtZW50KHRhZ05hbWUsIG9wdGlvbnMpO1xuICAgICAgICBpZiAodGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2NyaXB0JyB8fCB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdsaW5rJykge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsU2V0QXR0cmlidXRlID0gZWxlbWVudC5zZXRBdHRyaWJ1dGUuYmluZChlbGVtZW50KTtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoKG5hbWUgPT09ICdzcmMnIHx8IG5hbWUgPT09ICdocmVmJykgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRVcmwgPSBjb252ZXJ0Q2RuVXJsKHZhbHVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsU2V0QXR0cmlidXRlKG5hbWUsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxTZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTVERjJcdTVCNThcdTU3MjhcdTc2ODQgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1RkYwOFx1NTk4Mlx1Njc5QyBET00gXHU1REYyXHU3RUNGXHU5MEU4XHU1MjA2XHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgICBjb25zdCBwcm9jZXNzRXhpc3RpbmdUYWdzID0gKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtzcmNdJykuZm9yRWFjaCgoc2NyaXB0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzcmMgPSBzY3JpcHQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybChzcmMpO1xuICAgICAgICAgICAgICBpZiAoY29udmVydGVkVXJsICE9PSBzcmMpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGlua1tocmVmXScpLmZvckVhY2goKGxpbmspID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgaWYgKGhyZWYpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybChocmVmKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZFVybCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBcdTdBQ0JcdTUzNzNcdTU5MDRcdTc0MDZcdUZGMDhcdTU5ODJcdTY3OUMgRE9NIFx1NURGMlx1N0VDRlx1OTBFOFx1NTIwNlx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJyB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnKSB7XG4gICAgICAgIHByb2Nlc3NFeGlzdGluZ1RhZ3MoKTtcbiAgICAgICAgLy8gXHU3NkQxXHU1NDJDIERPTSBcdTUzRDhcdTUzMTZcdUZGMENcdTU5MDRcdTc0MDZcdTU0MEVcdTdFRURcdTZERkJcdTUyQTBcdTc2ODRcdTY4MDdcdTdCN0VcbiAgICAgICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcHJvY2Vzc0V4aXN0aW5nVGFncyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NFeGlzdGluZ1RhZ3MoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pKCk7XG48L3NjcmlwdD5gIDogJyc7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgbG9hZGVyU2NyaXB0ID0gYFxuPHNjcmlwdD5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIC8vIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1NUMwNlx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1NkEyMVx1NTc1N1x1NEUyRFx1NTIxRFx1NTlDQlx1NTMxNlxuICAgIC8vIFx1OEZEOVx1OTFDQ1x1NTNFQVx1OEJCRVx1N0Y2RVx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93Ll9fQlRDX0NETl9DT05GSUdfXyA9IHtcbiAgICAgICAgYXBwTmFtZTogJyR7YXBwTmFtZX0nLFxuICAgICAgICBjZG5Eb21haW46ICcke2NkbkRvbWFpbn0nLFxuICAgICAgICBvc3NEb21haW46ICdodHRwczovL2JlbGxpczEub3NzLWNuLXNoZW56aGVuLmFsaXl1bmNzLmNvbScsXG4gICAgICAgIGVuYWJsZWQ6ICR7Y2RuRW5hYmxlZH1cbiAgICAgIH07XG4gICAgfVxuICB9KSgpO1xuPC9zY3JpcHQ+YDtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTU3MjggPC9oZWFkPiBcdTRFNEJcdTUyNERcdTZDRThcdTUxNjVcdUZGMDhcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwQ1x1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHVGRjA5XG4gICAgICAgICAgaWYgKG5ld0h0bWwuaW5jbHVkZXMoJzwvaGVhZD4nKSkge1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjggPGhlYWQ+IFx1NzY4NFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwQ1x1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENlx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFxuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1REYyXHU3RUNGXHU2NzA5XHU1MTc2XHU0RUQ2IHNjcmlwdCBcdTY4MDdcdTdCN0VcdUZGMENcdTU3MjhcdTdCMkNcdTRFMDBcdTRFMkEgc2NyaXB0IFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1NjNEMlx1NTE2NVxuICAgICAgICAgICAgaWYgKGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ICYmIG5ld0h0bWwuaW5jbHVkZXMoJzxzY3JpcHQnKSkge1xuICAgICAgICAgICAgICAvLyBcdTU3MjhcdTdCMkNcdTRFMDBcdTRFMkEgPHNjcmlwdD4gXHU2MjE2IDxsaW5rPiBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcdTY1RTlcdTY3MUZcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgICAgICAgY29uc3QgZmlyc3RUYWdNYXRjaCA9IG5ld0h0bWwubWF0Y2goLzwoc2NyaXB0fGxpbmspW14+XSo+L2kpO1xuICAgICAgICAgICAgICBpZiAoZmlyc3RUYWdNYXRjaCAmJiBmaXJzdFRhZ01hdGNoLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5zbGljZSgwLCBmaXJzdFRhZ01hdGNoLmluZGV4KSArIGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ICsgbmV3SHRtbC5zbGljZShmaXJzdFRhZ01hdGNoLmluZGV4KTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU2MjdFXHU1MjMwIHNjcmlwdCBcdTYyMTYgbGluayBcdTY4MDdcdTdCN0VcdUZGMENcdTU3MjggPC9oZWFkPiBcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcbiAgICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2hlYWQ+JywgYCR7ZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHR9XFxuPC9oZWFkPmApO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU2Q0U4XHU1MTY1XHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU1NjY4XHU5MTREXHU3RjZFXHU4MTFBXHU2NzJDXG4gICAgICAgICAgICBpZiAoIW5ld0h0bWwuaW5jbHVkZXMoJ19fQlRDX1JFU09VUkNFX0xPQURFUl9fJykpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke2xvYWRlclNjcmlwdH1cXG48L2hlYWQ+YCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld0h0bWwuaW5jbHVkZXMoJzwvYm9keT4nKSkge1xuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IDwvaGVhZD5cdUZGMENcdTU3MjggPC9ib2R5PiBcdTRFNEJcdTUyNERcdTZDRThcdTUxNjVcbiAgICAgICAgICAgIGlmIChlYXJseVVybENvbnZlcnRlclNjcmlwdCkge1xuICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2JvZHk+JywgYCR7ZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHR9XFxuPC9ib2R5PmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW5ld0h0bWwuaW5jbHVkZXMoJ19fQlRDX1JFU09VUkNFX0xPQURFUl9fJykpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9ib2R5PicsIGAke2xvYWRlclNjcmlwdH1cXG48L2JvZHk+YCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBcdTVERjJcdTRFM0EgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdThGNkNcdTYzNjJcdTRFM0EgQ0ROIFVSTGApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3SHRtbDtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVosU0FBUyxvQkFBb0I7QUFDcGIsU0FBUyxpQkFBQUEsc0JBQXFCOzs7QUNNOUIsU0FBUyxXQUFB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QUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFDRjtBQUtBLElBQU0sc0JBQXNDO0FBQUEsRUFDMUM7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFB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U3luYyIsICJyZWFkRmlsZVN5bmMiLCAicm1TeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgIm9yaWdpbiIsICJleGlzdHNTeW5jIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19kaXJuYW1lIiwgImRpcm5hbWUiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInRpbWVzdGFtcCIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZXNvbHZlIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2Rpcm5hbWUiLCAicmVzb2x2ZSIsICJzcGF3biIsICJyZXNvbHZlIiwgImZpbGVVUkxUb1BhdGgiLCAiZXhlY1N5bmMiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2Rpcm5hbWUiLCAicmVzb2x2ZSIsICJwcm9qZWN0Um9vdCIsICJ0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyIiwgImV4ZWNTeW5jIiwgInNwYXduIiwgImlzUHJldmlld0J1aWxkIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicm1TeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
