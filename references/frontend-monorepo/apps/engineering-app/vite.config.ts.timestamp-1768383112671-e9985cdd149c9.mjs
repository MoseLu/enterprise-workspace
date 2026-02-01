var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../packages/shared-core/src/env/index.ts
import { z } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js";
var envSchema, env, isDevelopment;
var init_env = __esm({
  "../../packages/shared-core/src/env/index.ts"() {
    "use strict";
    init_logger();
    envSchema = z.object({
      // Node 环境
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      MODE: z.enum(["development", "preview", "production"]).default("development"),
      // 应用配置
      VITE_APP_TITLE: z.string().default("BTC ShopFlow"),
      VITE_APP_BASE_API: z.string().url().optional(),
      VITE_APP_UPLOAD_URL: z.string().url().optional(),
      VITE_DOCS_URL: z.string().url().optional(),
      VITE_APP_WS_URL: z.string().url().optional(),
      // 端口配置（可选）
      VITE_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
      PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
      // 其他 Vite 环境变量
      VITE_PREVIEW: z.string().transform((val) => val === "true").optional()
    }).passthrough();
    try {
      const rawEnv = typeof window !== "undefined" ? import.meta.env : process.env;
      env = envSchema.parse(rawEnv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("\u73AF\u5883\u53D8\u91CF\u9A8C\u8BC1\u5931\u8D25:", error.errors);
        throw new Error(`\u73AF\u5883\u53D8\u91CF\u914D\u7F6E\u9519\u8BEF: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
      }
      throw error;
    }
    isDevelopment = () => env.MODE === "development" || env.NODE_ENV === "development";
  }
});

// ../../packages/shared-core/src/utils/logger/transports.ts
function shouldLog(url) {
  if (!url) {
    return false;
  }
  if (url.includes(".html") || url.includes(".js") || url.includes(".css") || url.includes(".json") || url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg") || url.includes(".gif") || url.includes(".svg") || url.includes(".ico")) {
    return false;
  }
  if (!url.startsWith("/api/")) {
    return false;
  }
  return !FILTERED_PATHS.some((path) => url.includes(path));
}
function filterSensitiveParams(params) {
  if (!params || typeof params !== "object") {
    return params;
  }
  const sensitiveKeys = ["password", "token", "secret", "key", "authorization"];
  if (Array.isArray(params)) {
    return params.map((item) => filterSensitiveParams(item));
  }
  const filtered = {};
  for (const key in params) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      filtered[key] = "***";
    } else {
      filtered[key] = filterSensitiveParams(params[key]);
    }
  }
  return filtered;
}
function convertPinoLogToRequestLog(logObject, context) {
  const level = logObject.level || 30;
  const message = logObject.msg || logObject.message || "";
  const time = logObject.time || Date.now();
  const metadata = { ...logObject };
  delete metadata.level;
  delete metadata.msg;
  delete metadata.message;
  delete metadata.time;
  delete metadata.pid;
  delete metadata.hostname;
  const userId = context?.userId || metadata.userId || metadata.user_id;
  const username = context?.username || metadata.username;
  const requestUrl = metadata.requestUrl || metadata.url || metadata.path || "";
  const ip = context?.ip || metadata.ip;
  const duration = metadata.duration || 0;
  const status = metadata.status || (level >= 50 ? "failed" : "success");
  const params = filterSensitiveParams(metadata.params || metadata);
  return {
    userId: userId ? Number(userId) : void 0,
    username: username || "unknown",
    requestUrl: requestUrl || "/unknown",
    params: typeof params === "string" ? params : JSON.stringify(params),
    ip,
    duration: Number(duration) || 0,
    status,
    createdAt: new Date(time).toISOString()
  };
}
function createLogTransport(context) {
  return {
    level: 30,
    // info 级别及以上才传输
    send: (level, logEvent) => {
      try {
        const logObject = logEvent;
        const requestUrl = logObject.requestUrl || logObject.url || logObject.path;
        if (requestUrl && !shouldLog(requestUrl)) {
          return;
        }
        const requestLog = convertPinoLogToRequestLog(logObject, context);
        logTransportQueue.add(requestLog);
      } catch (error) {
        try {
          if (import.meta?.env?.DEV) {
            console.error("Log transport error:", error);
          }
        } catch (e) {
        }
      }
    }
  };
}
var FILTERED_PATHS, LogTransportQueue, logTransportQueue;
var init_transports = __esm({
  "../../packages/shared-core/src/utils/logger/transports.ts"() {
    "use strict";
    FILTERED_PATHS = [
      "/login",
      "/register",
      "/captcha",
      "/code/sms/send",
      "/code/email/send",
      "/refresh-token",
      "/refresh/access-token",
      "/logout",
      "/upload",
      "/api/system/log/sys/request/update",
      // 过滤请求日志更新接口，避免循环记录
      "/api/system/log/sys/operation/update"
      // 过滤操作日志更新接口
    ];
    LogTransportQueue = class {
      constructor() {
        this.queue = [];
        this.timer = null;
        this.BATCH_SIZE = 100;
        // 批量发送大小
        this.BATCH_INTERVAL = 18e4;
        // 批量发送间隔（180秒）
        this.MAX_QUEUE_SIZE = 1e3;
        // 最大队列长度
        this.isServiceAvailable = true;
        this.isPaused = false;
        this.QPS_LIMIT = 2;
        // 每秒最多发送2次请求
        this.lastSendTime = 0;
      }
      /**
       * 添加日志到队列
       */
      add(logItem) {
        if (this.queue.length >= this.MAX_QUEUE_SIZE) {
          this.queue.shift();
        }
        this.queue.push(logItem);
        if (this.isServiceAvailable && !this.isPaused) {
          this.tryFlush();
        } else if (this.queue.length === 1 && !this.timer) {
          this.startTimer();
        }
      }
      /**
       * 尝试发送（带QPS限制）
       */
      tryFlush() {
        const now = Date.now();
        const timeSinceLastSend = now - this.lastSendTime;
        const minInterval = 1e3 / this.QPS_LIMIT;
        if (timeSinceLastSend < minInterval) {
          const delay = minInterval - timeSinceLastSend;
          setTimeout(() => {
            this.flush();
          }, delay);
          return;
        }
        if (this.queue.length >= this.BATCH_SIZE) {
          this.flush();
        } else if (this.queue.length > 0 && !this.timer) {
          this.startTimer();
        }
      }
      /**
       * 批量发送日志
       */
      async flush() {
        if (this.queue.length === 0) {
          return;
        }
        if (!this.isServiceAvailable) {
          this.isPaused = true;
          this.startTimer();
          return;
        }
        const logsToSend = [...this.queue];
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        try {
          const service = typeof window !== "undefined" ? window.__BTC_SERVICE__ : null;
          if (!service) {
            throw new Error("Service not initialized, cannot send logs");
          }
          if (!service?.admin?.log?.sys?.request?.update) {
            throw new Error("Request log service unavailable");
          }
          await service.admin.log.sys.request.update(logsToSend);
          this.isServiceAvailable = true;
          this.isPaused = false;
          this.lastSendTime = Date.now();
          this.queue = this.queue.slice(logsToSend.length);
          if (this.queue.length > 0) {
            this.tryFlush();
          }
        } catch (error) {
          this.isPaused = true;
          this.isServiceAvailable = false;
          setTimeout(() => {
            this.isServiceAvailable = true;
            this.isPaused = false;
            if (this.queue.length > 0) {
              this.tryFlush();
            }
          }, 5 * 60 * 1e3);
        }
      }
      /**
       * 启动定时器
       */
      startTimer() {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          if (this.isServiceAvailable && !this.isPaused && this.queue.length > 0) {
            this.flush();
          } else if (this.queue.length > 0) {
            this.startTimer();
          }
        }, this.BATCH_INTERVAL);
      }
      /**
       * 销毁实例（页面卸载时调用）
       */
      destroy() {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        if (this.queue.length > 0) {
          this.flush();
        }
      }
    };
    logTransportQueue = new LogTransportQueue();
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        logTransportQueue.destroy();
      });
    }
  }
});

// ../../packages/shared-core/src/utils/logger/pino-config.ts
import pino from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/pino@10.1.1/node_modules/pino/pino.js";
function getLogLevel() {
  if (isDevelopment()) {
    return "debug";
  }
  return "warn";
}
function createPinoConfig(context) {
  const isDev = isDevelopment();
  const level = getLogLevel();
  const browserConfig = {
    asObject: true
    // 在浏览器中输出为对象格式
  };
  if (typeof window !== "undefined") {
    const transport = createLogTransport(context);
    browserConfig.transmit = {
      level: 30,
      // info 级别及以上才传输
      send: (level2, logEvent) => {
        transport.send(level2, logEvent);
      }
    };
  }
  const baseConfig = {
    level,
    browser: browserConfig
  };
  const isNodeEnv = typeof window === "undefined";
  const nodeEnv = typeof process !== "undefined" ? process.env.NODE_ENV : void 0;
  const mode = typeof process !== "undefined" ? process.env.MODE : void 0;
  const isNodeDev = isNodeEnv && (isDev || nodeEnv === "development" || mode === "development" || (!nodeEnv || nodeEnv !== "production" && mode !== "production"));
  if (isNodeDev) {
    return {
      ...baseConfig,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
          messageFormat: "{msg}",
          // 确保输出格式与示例一致
          hideObject: false
        }
      }
    };
  }
  return baseConfig;
}
function createPinoLogger(context) {
  const config = createPinoConfig(context);
  if (config.transport && typeof window === "undefined") {
    return pino(config);
  }
  return pino(config);
}
var init_pino_config = __esm({
  "../../packages/shared-core/src/utils/logger/pino-config.ts"() {
    "use strict";
    init_env();
    init_transports();
  }
});

// ../../packages/shared-core/src/utils/zod/reporting.ts
var reporting_exports = {};
__export(reporting_exports, {
  clearErrorQueue: () => clearErrorQueue,
  configureReporting: () => configureReporting,
  flushReports: () => flushReports,
  getPendingReportCount: () => getPendingReportCount,
  reportValidationError: () => reportValidationError
});
function configureReporting(config) {
  currentConfig = { ...defaultConfig, ...config };
}
function reportValidationError(type, schema, error, context = {}) {
  if (!currentConfig.enabled) {
    if (import.meta.env.DEV) {
      logger.warn("[\u9A8C\u8BC1\u5931\u8D25\u4E0A\u62A5] \u4E0A\u62A5\u529F\u80FD\u672A\u542F\u7528", { type, schema, errors: error.errors });
    }
    return;
  }
  const report = {
    type,
    schema,
    errors: error.errors,
    context,
    timestamp: Date.now(),
    environment: import.meta.env.DEV ? "development" : "production",
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : void 0
    // userId 可以从全局状态或认证信息中获取，这里预留
    // userId: getCurrentUserId(),
  };
  errorQueue.push(report);
  if (errorQueue.length >= (currentConfig.maxBatchSize || 10)) {
    flushErrorQueue();
    return;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    flushErrorQueue();
  }, currentConfig.debounceMs || 1e3);
}
function flushErrorQueue() {
  if (errorQueue.length === 0) {
    return;
  }
  const reports = [...errorQueue];
  errorQueue.length = 0;
  if (import.meta.env.DEV) {
    logger.info("[\u9A8C\u8BC1\u5931\u8D25\u4E0A\u62A5] \u5F85\u4E0A\u62A5\u7684\u9519\u8BEF:", reports);
  } else {
    logger.warn(`[\u9A8C\u8BC1\u5931\u8D25\u4E0A\u62A5] ${reports.length} \u4E2A\u9A8C\u8BC1\u9519\u8BEF\u5F85\u4E0A\u62A5`);
  }
}
function flushReports() {
  flushErrorQueue();
}
function getPendingReportCount() {
  return errorQueue.length;
}
function clearErrorQueue() {
  errorQueue.length = 0;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
var defaultConfig, currentConfig, errorQueue, debounceTimer;
var init_reporting = __esm({
  "../../packages/shared-core/src/utils/zod/reporting.ts"() {
    "use strict";
    init_logger();
    defaultConfig = {
      enabled: false,
      // 默认关闭，后续实现时启用
      debounceMs: 1e3,
      maxBatchSize: 10
    };
    currentConfig = { ...defaultConfig };
    errorQueue = [];
    debounceTimer = null;
  }
});

// ../../packages/shared-core/src/configs/schemas.ts
import { z as z2 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js";
function preprocessI18nValue(val) {
  if (typeof val === "function") {
    try {
      const result = val({ normalize: (arr) => arr[0] });
      if (typeof result === "string") {
        return result;
      }
      const source = val.loc?.source || val.source;
      if (typeof source === "string") {
        return source;
      }
    } catch {
    }
  }
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const processed = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        processed[key] = preprocessI18nValue(val[key]);
      }
    }
    return processed;
  }
  return val;
}
function validateConfig(schema, config, configName = "\u914D\u7F6E") {
  const preprocessedConfig = preprocessI18nValue(config);
  if (import.meta.env.DEV) {
    try {
      return schema.parse(preprocessedConfig);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        logger.error(`[\u914D\u7F6E\u9A8C\u8BC1] ${configName}\u9A8C\u8BC1\u5931\u8D25:`, error.errors);
        throw new Error(
          `${configName}\u9A8C\u8BC1\u5931\u8D25: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
        );
      }
      throw error;
    }
  } else {
    const result = schema.safeParse(preprocessedConfig);
    if (result.success) {
      return result.data;
    } else {
      logger.warn(`[\u914D\u7F6E\u9A8C\u8BC1] ${configName}\u9A8C\u8BC1\u5931\u8D25\uFF0C\u4F7F\u7528\u539F\u59CB\u914D\u7F6E`);
      Promise.resolve().then(() => (init_reporting(), reporting_exports)).then(({ reportValidationError: reportValidationError2 }) => {
        reportValidationError2(
          "config",
          configName,
          result.error,
          { configPath: configName }
        );
      }).catch(() => {
      });
      return config;
    }
  }
}
var MenuConfigItemSchema, MenuConfigSchema, SubAppManifestRouteSchema, SubAppManifestSchema, AppIdentitySchema, SubAppLevelConfigSchema, AppLevelConfigSchema, MenuLevelConfigSchema, PageLevelConfigSchema, CommonLevelConfigSchema, LocaleConfigSingleSchema, LocaleConfigSchema;
var init_schemas = __esm({
  "../../packages/shared-core/src/configs/schemas.ts"() {
    "use strict";
    init_logger();
    MenuConfigItemSchema = z2.lazy(
      () => z2.object({
        id: z2.string(),
        title: z2.string().optional(),
        labelKey: z2.string().optional(),
        icon: z2.string().optional(),
        sort: z2.number().optional(),
        showInOverview: z2.boolean().optional(),
        permission: z2.string().optional(),
        description: z2.string().optional(),
        hot: z2.boolean().optional(),
        mountTo: z2.string().optional(),
        children: z2.array(MenuConfigItemSchema).optional(),
        path: z2.string().optional()
      })
    );
    MenuConfigSchema = z2.object({
      global: z2.array(MenuConfigItemSchema).optional(),
      mountPoints: z2.array(MenuConfigItemSchema).optional(),
      module: z2.array(MenuConfigItemSchema).optional()
    });
    SubAppManifestRouteSchema = z2.object({
      path: z2.string(),
      name: z2.string().optional(),
      component: z2.string().optional(),
      labelKey: z2.string().optional(),
      tabLabelKey: z2.string().optional(),
      breadcrumbs: z2.array(
        z2.object({
          labelKey: z2.string().optional(),
          label: z2.string().optional(),
          icon: z2.string().optional()
        })
      ).optional()
    });
    SubAppManifestSchema = z2.object({
      app: z2.object({
        id: z2.string(),
        basePath: z2.string().optional(),
        nameKey: z2.string().optional(),
        "app-name": z2.string().optional()
      }),
      routes: z2.array(SubAppManifestRouteSchema),
      menus: z2.array(
        z2.object({
          index: z2.string(),
          labelKey: z2.string().optional(),
          label: z2.string().optional(),
          icon: z2.string().optional(),
          children: z2.array(z2.any()).optional()
        })
      ).optional(),
      menuConfig: MenuConfigSchema.optional(),
      raw: z2.any().optional()
    });
    AppIdentitySchema = z2.object({
      id: z2.string().min(1, "\u5E94\u7528ID\u4E0D\u80FD\u4E3A\u7A7A"),
      name: z2.string().min(1, "\u5E94\u7528\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A"),
      description: z2.string().optional(),
      pathPrefix: z2.string().min(1, "\u8DEF\u5F84\u524D\u7F00\u4E0D\u80FD\u4E3A\u7A7A"),
      subdomain: z2.string().optional(),
      type: z2.enum(["main", "sub", "layout", "docs"]),
      enabled: z2.boolean(),
      icon: z2.string().optional(),
      version: z2.string().optional(),
      routes: z2.object({
        mainAppRoutes: z2.array(z2.string()).optional(),
        nonClosableRoutes: z2.array(z2.string()).optional(),
        homeRoute: z2.string().optional(),
        skipTabbarRoutes: z2.array(z2.string()).optional()
      }).optional(),
      metadata: z2.record(z2.any()).optional()
    });
    SubAppLevelConfigSchema = z2.preprocess(
      (val) => {
        if (val && typeof val === "object" && "name" in val) {
          return { ...val, name: preprocessI18nValue(val.name) };
        }
        return val;
      },
      z2.object({
        name: z2.union([z2.string(), z2.any()])
        // 允许字符串或任何类型（生产环境静默失败）
      })
    );
    AppLevelConfigSchema = z2.record(z2.union([z2.string(), z2.record(z2.string())]));
    MenuLevelConfigSchema = z2.lazy(
      () => z2.record(
        z2.union([
          z2.string(),
          MenuLevelConfigSchema,
          z2.object({
            _: z2.string().optional()
          }).passthrough()
        ])
      )
    );
    PageLevelConfigSchema = z2.record(
      z2.record(z2.record(z2.string()))
    );
    CommonLevelConfigSchema = z2.lazy(
      () => z2.record(
        z2.union([
          z2.string(),
          z2.function(),
          // 允许 Vue I18n 编译后的函数格式（会在验证前预处理）
          CommonLevelConfigSchema,
          z2.any()
          // 允许任何类型（生产环境静默失败）
        ])
      )
    );
    LocaleConfigSingleSchema = z2.object({
      app: AppLevelConfigSchema.optional(),
      subapp: SubAppLevelConfigSchema.optional(),
      menu: MenuLevelConfigSchema.optional(),
      page: PageLevelConfigSchema.optional(),
      common: CommonLevelConfigSchema.optional()
    });
    LocaleConfigSchema = z2.object({
      "zh-CN": LocaleConfigSingleSchema,
      "en-US": LocaleConfigSingleSchema
    });
  }
});

// ../../packages/shared-core/src/configs/app-configs-collected.ts
var appConfigsJsonMap, appConfigsMap;
var init_app_configs_collected = __esm({
  "../../packages/shared-core/src/configs/app-configs-collected.ts"() {
    "use strict";
    appConfigsJsonMap = {
      "../../../apps/admin-app/src/app.ts": '{\n  "id": "admin",\n  "name": "app.name",\n  "description": "common.system.btc_shop_management_system",\n  "pathPrefix": "/admin",\n  "subdomain": "admin.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/dashboard-app/src/app.ts": '{\n  "id": "dashboard",\n  "name": "\u770B\u677F\u5E94\u7528",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u770B\u677F\u5E94\u7528",\n  "pathPrefix": "/dashboard",\n  "subdomain": "dashboard.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/docs-app/src/app.ts": '{\n  "id": "docs",\n  "name": "app.name",\n  "description": "app.description",\n  "pathPrefix": "/docs",\n  "subdomain": "docs.bellis.com.cn",\n  "type": "docs",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/engineering-app/src/app.ts": '{\n  "id": "engineering",\n  "name": "app.name",\n  "description": "common.system.btc_shop_management_system",\n  "pathPrefix": "/engineering",\n  "subdomain": "engineering.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/finance-app/src/app.ts": '{\n  "id": "finance",\n  "name": "\u8D22\u52A1\u5E94\u7528",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u8D22\u52A1\u5E94\u7528",\n  "pathPrefix": "/finance",\n  "subdomain": "finance.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/home-app/src/app.ts": '{\n  "id": "home",\n  "name": "\u516C\u53F8\u9996\u9875",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u516C\u53F8\u9996\u9875\u548C\u5173\u4E8E\u6211\u4EEC",\n  "pathPrefix": "/",\n  "subdomain": "www.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0",\n  "metadata": {\n    "public": true,\n    "port": 8095\n  }\n}',
      "../../../apps/layout-app/src/app.ts": '{\n  "id": "layout",\n  "name": "app.name",\n  "description": "app.description",\n  "pathPrefix": "/",\n  "subdomain": "layout.bellis.com.cn",\n  "type": "layout",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/logistics-app/src/app.ts": '{\n  "id": "logistics",\n  "name": "common.apps.logistics",\n  "description": "common.system.btc_shop_management_system_logistics",\n  "pathPrefix": "/logistics",\n  "subdomain": "logistics.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/main-app/src/app.ts": '{\n  "id": "main",\n  "name": "\u4E3B\u5E94\u7528",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u4E3B\u5E94\u7528\u57FA\u5EA7",\n  "pathPrefix": "/",\n  "subdomain": "bellis.com.cn",\n  "type": "main",\n  "enabled": true,\n  "version": "1.0.0",\n  "routes": {\n    "mainAppRoutes": [\n      "/overview",\n      "/todo",\n      "/profile"\n    ],\n    "nonClosableRoutes": [\n      "/overview"\n    ],\n    "homeRoute": "/overview",\n    "skipTabbarRoutes": [\n      "/login",\n      "/register",\n      "/forget-password"\n    ]\n  }\n}',
      "../../../apps/mobile-app/src/app.ts": '{\n  "id": "mobile",\n  "name": "app.name",\n  "description": "app.description",\n  "pathPrefix": "/mobile",\n  "subdomain": "mobile.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/operations-app/src/app.ts": '{\n  "id": "operations",\n  "name": "\u8FD0\u7EF4\u5E94\u7528",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u8FD0\u7EF4\u5E94\u7528",\n  "pathPrefix": "/operations",\n  "subdomain": "operations.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/personnel-app/src/app.ts": '{\n  "id": "personnel",\n  "name": "\u4EBA\u4E8B\u5E94\u7528",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u4EBA\u4E8B\u5E94\u7528",\n  "pathPrefix": "/personnel",\n  "subdomain": "personnel.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/production-app/src/app.ts": '{\n  "id": "production",\n  "name": "app.name",\n  "description": "common.system.btc_shop_management_system",\n  "pathPrefix": "/production",\n  "subdomain": "production.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/quality-app/src/app.ts": '{\n  "id": "quality",\n  "name": "app.name",\n  "description": "common.system.btc_shop_management_system",\n  "pathPrefix": "/quality",\n  "subdomain": "quality.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}',
      "../../../apps/system-app/src/app.ts": '{\n  "id": "system",\n  "name": "\u7CFB\u7EDF\u5E94\u7528",\n  "description": "BTC\u8F66\u95F4\u7BA1\u7406\u7CFB\u7EDF - \u7CFB\u7EDF\u5E94\u7528",\n  "pathPrefix": "/system",\n  "subdomain": "system.bellis.com.cn",\n  "type": "sub",\n  "enabled": true,\n  "version": "1.0.0"\n}'
    };
    appConfigsMap = Object.fromEntries(
      Object.entries(appConfigsJsonMap).map(([path, jsonStr]) => [
        path,
        JSON.parse(jsonStr)
      ])
    );
  }
});

// ../../packages/shared-core/src/configs/app-scanner.ts
function getAppRegistry() {
  try {
    if (typeof globalThis === "undefined") {
      const globalObj = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
      if (typeof globalObj.__BTC_APP_REGISTRY__ === "undefined" || !(globalObj.__BTC_APP_REGISTRY__ instanceof Map)) {
        globalObj.__BTC_APP_REGISTRY__ = /* @__PURE__ */ new Map();
      }
      return globalObj.__BTC_APP_REGISTRY__;
    } else {
      if (typeof globalThis.__BTC_APP_REGISTRY__ === "undefined" || !(globalThis.__BTC_APP_REGISTRY__ instanceof Map)) {
        globalThis.__BTC_APP_REGISTRY__ = /* @__PURE__ */ new Map();
      }
      return globalThis.__BTC_APP_REGISTRY__;
    }
  } catch (error) {
    logger.warn("[app-scanner] getAppRegistry() \u521D\u59CB\u5316\u5931\u8D25\uFF0C\u521B\u5EFA\u65B0\u5B9E\u4F8B", error);
    return /* @__PURE__ */ new Map();
  }
}
function extractAppName(filePath) {
  const match = filePath.match(/apps\/(.+?)-app\//);
  return match && match[1] ? match[1] : "";
}
function validateAppIdentity(identity, appName) {
  try {
    validateConfig(AppIdentitySchema, identity, `\u5E94\u7528 ${appName} \u7684\u8EAB\u4EFD\u914D\u7F6E`);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      logger.warn(`[app-scanner] \u5E94\u7528 ${appName} \u7684\u914D\u7F6E\u9A8C\u8BC1\u5931\u8D25:`, error);
    }
    return false;
  }
}
function scanAndRegisterApps() {
  const registry = getAppRegistry();
  if (registry && registry instanceof Map && typeof registry.clear === "function") {
    try {
      registry.clear();
    } catch (error) {
      logger.warn("[app-scanner] registry.clear() \u5931\u8D25\uFF0C\u91CD\u65B0\u521D\u59CB\u5316", error);
      try {
        if (typeof globalThis !== "undefined") {
          globalThis.__BTC_APP_REGISTRY__ = /* @__PURE__ */ new Map();
        } else {
          const globalObj = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
          globalObj.__BTC_APP_REGISTRY__ = /* @__PURE__ */ new Map();
        }
      } catch (e) {
        logger.error("[app-scanner] \u65E0\u6CD5\u91CD\u65B0\u521D\u59CB\u5316 registry", e);
      }
    }
  } else {
    try {
      if (typeof globalThis !== "undefined") {
        globalThis.__BTC_APP_REGISTRY__ = /* @__PURE__ */ new Map();
      } else {
        const globalObj = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
        globalObj.__BTC_APP_REGISTRY__ = /* @__PURE__ */ new Map();
      }
    } catch (e) {
      logger.error("[app-scanner] \u65E0\u6CD5\u521D\u59CB\u5316 registry", e);
    }
  }
  const finalRegistry = getAppRegistry();
  if (!appConfigsMap || typeof appConfigsMap !== "object" || appConfigsMap === null || Array.isArray(appConfigsMap)) {
    if (import.meta.env.DEV) {
      logger.warn("[app-scanner] appConfigsMap \u4E0D\u5B58\u5728\u6216\u4E0D\u662F\u5BF9\u8C61\uFF0C\u8DF3\u8FC7\u626B\u63CF", { appConfigsMap });
    }
    return finalRegistry;
  }
  const appConfigsEntries = Object.entries(appConfigsMap || {});
  for (const [filePath, appConfig] of appConfigsEntries) {
    try {
      const appName = extractAppName(filePath);
      if (!appName) {
        continue;
      }
      if (!validateAppIdentity(appConfig, appName)) {
        continue;
      }
      const identity = {
        ...appConfig,
        id: appConfig.id || appName
      };
      finalRegistry.set(identity.id, identity);
    } catch (error) {
      logger.error(`[app-scanner] \u274C \u626B\u63CF\u5E94\u7528\u914D\u7F6E\u5931\u8D25: ${filePath}`, error);
    }
  }
  return finalRegistry;
}
function getAllApps() {
  const registry = getAppRegistry();
  if (!isInitialized || registry.size === 0) {
    scanAndRegisterApps();
    isInitialized = true;
  }
  return Array.from(registry.values());
}
var appRegistry, isInitialized;
var init_app_scanner = __esm({
  "../../packages/shared-core/src/configs/app-scanner.ts"() {
    "use strict";
    init_logger();
    init_schemas();
    init_app_configs_collected();
    appRegistry = getAppRegistry();
    isInitialized = false;
  }
});

// ../../packages/shared-core/src/configs/unified-env-config.ts
function getConfigScheme() {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "default";
  }
  return import.meta.env.VITE_CONFIG_SCHEME || "default";
}
function getEnvironment() {
  if (typeof window === "undefined") {
    const prodFlag2 = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PROD) ?? process.env.NODE_ENV === "production";
    return prodFlag2 ? "production" : "development";
  }
  const hostname = window.location.hostname;
  const port = window.location.port || "";
  if (hostname === "test.bellis.com.cn" || hostname.endsWith(".test.bellis.com.cn")) {
    return "test";
  }
  if ((hostname === "bellis.com.cn" || hostname.endsWith(".bellis.com.cn")) && !hostname.includes(".test.bellis.com.cn")) {
    return "production";
  }
  try {
    const prePorts = getAllPrePorts();
    if (prePorts.includes(port)) {
      return "preview";
    }
    const devPorts = getAllDevPorts();
    if (devPorts.includes(port)) {
      return "development";
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      logger.warn("[unified-env-config] getAllPrePorts/getAllDevPorts \u8C03\u7528\u5931\u8D25\uFF0C\u4F7F\u7528\u5907\u7528\u65B9\u6CD5\u5224\u65AD\u73AF\u5883:", error);
    }
  }
  const prodFlag = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PROD) ?? false;
  return prodFlag ? "production" : "development";
}
function getEnvConfig() {
  const scheme = getConfigScheme();
  const env2 = getEnvironment();
  const config = configSchemes[scheme][env2];
  if (config.cdn?.staticAssetsUrl) {
    let envCdnUrl;
    if (typeof window !== "undefined") {
      if (typeof import.meta !== "undefined" && import.meta.env) {
        envCdnUrl = import.meta.env.VITE_CDN_STATIC_ASSETS_URL;
      }
    } else {
      envCdnUrl = process.env.CDN_STATIC_ASSETS_URL || process.env.VITE_CDN_STATIC_ASSETS_URL;
    }
    if (envCdnUrl) {
      return {
        ...config,
        cdn: {
          staticAssetsUrl: envCdnUrl
        }
      };
    }
  }
  return config;
}
function getCurrentSubApp() {
  const env2 = getEnvironment();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" ? window.location.port || "" : "";
  if (env2 === "test" && hostname) {
    const appConfig = getAppConfigByTestHost(hostname);
    if (appConfig) {
      const appName = appConfig.appName.replace("-app", "");
      const app = getAllApps().find((a) => a.id === appName);
      if (app && app.type === "sub" && app.enabled) {
        return app.id;
      }
    }
    return null;
  }
  if (env2 === "production" && hostname) {
    const app = getAllApps().find((a) => a.subdomain === hostname);
    if (app && app.type === "sub" && app.enabled) {
      return app.id;
    }
    return null;
  }
  if (env2 === "preview" && port) {
    const appConfig = getAppConfigByPrePort(port);
    if (appConfig) {
      const appName = appConfig.appName.replace("-app", "");
      const app = getAllApps().find((a) => a.id === appName);
      if (app && app.type === "sub" && app.enabled) {
        return app.id;
      }
    }
    return null;
  }
  const apps = getAllApps();
  const mainApp = apps.find((app) => app.type === "main");
  const mainAppRoutes = mainApp?.routes?.mainAppRoutes || [];
  if (mainAppRoutes.length > 0) {
    const normalizedPath = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
    if (mainAppRoutes.some((route) => {
      const normalizedRoute = route.endsWith("/") && route !== "/" ? route.slice(0, -1) : route;
      return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + "/");
    })) {
      return null;
    }
  }
  for (const app of apps) {
    if (app.type === "main" || app.type === "sub" && app.metadata?.public === true) {
      continue;
    }
    if (app.type === "sub" && app.enabled) {
      const normalizedPathPrefix = app.pathPrefix.endsWith("/") ? app.pathPrefix.slice(0, -1) : app.pathPrefix;
      const normalizedPath = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
      if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + "/")) {
        return app.id;
      }
    }
  }
  return null;
}
function getCurrentEnvironment() {
  if (_currentEnvironment === null) {
    _currentEnvironment = getEnvironment();
  }
  return _currentEnvironment;
}
function getCurrentEnvConfig() {
  if (_envConfig === null) {
    _envConfig = getEnvConfig();
  }
  return _envConfig;
}
var configSchemes, _currentEnvironment, _envConfig, currentEnvironment, envConfig;
var init_unified_env_config = __esm({
  "../../packages/shared-core/src/configs/unified-env-config.ts"() {
    "use strict";
    init_logger();
    init_app_scanner();
    init_app_env_config();
    init_app_env_config();
    configSchemes = {
      default: {
        development: {
          api: {
            baseURL: "/api",
            timeout: 3e4,
            backendTarget: "http://10.80.9.76:8115"
          },
          microApp: {
            baseURL: "//10.80.8.199",
            entryPrefix: ""
          },
          docs: {
            url: "http://localhost:8092",
            port: "8092"
          },
          ws: {
            url: "ws://10.80.9.76:8115"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: ""
          }
        },
        preview: {
          api: {
            baseURL: "/api",
            timeout: 3e4
          },
          microApp: {
            baseURL: "http://localhost",
            entryPrefix: "/index.html"
          },
          docs: {
            url: "http://localhost:4173",
            port: "4173"
          },
          ws: {
            url: "ws://localhost:8115"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: ""
          }
        },
        test: {
          api: {
            baseURL: "/api",
            timeout: 3e4
          },
          microApp: {
            baseURL: "https://test.bellis.com.cn",
            entryPrefix: ""
            // 构建产物直接部署到子域名根目录（与生产环境一致）
          },
          docs: {
            url: "https://docs.test.bellis.com.cn",
            port: ""
          },
          ws: {
            url: "wss://api.test.bellis.com.cn"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: "https://all.bellis.com.cn"
          }
        },
        production: {
          api: {
            baseURL: "/api",
            timeout: 3e4
          },
          microApp: {
            baseURL: "https://bellis.com.cn",
            entryPrefix: ""
            // 构建产物直接部署到子域名根目录
          },
          docs: {
            url: "https://docs.bellis.com.cn",
            port: ""
          },
          ws: {
            url: "wss://api.bellis.com.cn"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: "https://all.bellis.com.cn"
          }
        }
      },
      custom: {
        // 可以通过 .env 定义自定义配置方案
        // 这里可以扩展其他配置方案
        development: {
          api: {
            baseURL: "/api",
            timeout: 3e4,
            backendTarget: "http://10.80.9.76:8115"
          },
          microApp: {
            baseURL: "//10.80.8.199",
            entryPrefix: ""
          },
          docs: {
            url: "http://localhost:8092",
            port: "8092"
          },
          ws: {
            url: "ws://10.80.9.76:8115"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: ""
          }
        },
        preview: {
          api: {
            baseURL: "/api",
            timeout: 3e4
          },
          microApp: {
            baseURL: "http://localhost",
            entryPrefix: "/index.html"
          },
          docs: {
            url: "http://localhost:4173",
            port: "4173"
          },
          ws: {
            url: "ws://localhost:8115"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: ""
          }
        },
        test: {
          api: {
            baseURL: "/api",
            timeout: 3e4
          },
          microApp: {
            baseURL: "https://test.bellis.com.cn",
            entryPrefix: ""
            // 构建产物直接部署到子域名根目录（与生产环境一致）
          },
          docs: {
            url: "https://docs.test.bellis.com.cn",
            port: ""
          },
          ws: {
            url: "wss://api.test.bellis.com.cn"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: "https://all.bellis.com.cn"
          }
        },
        production: {
          api: {
            baseURL: "/api",
            timeout: 3e4
          },
          microApp: {
            baseURL: "https://bellis.com.cn",
            entryPrefix: ""
            // 构建产物直接部署到子域名根目录
          },
          docs: {
            url: "https://docs.bellis.com.cn",
            port: ""
          },
          ws: {
            url: "wss://api.bellis.com.cn"
          },
          upload: {
            url: "/api/upload"
          },
          cdn: {
            staticAssetsUrl: "https://all.bellis.com.cn"
          }
        }
      }
    };
    _currentEnvironment = null;
    _envConfig = null;
    currentEnvironment = getCurrentEnvironment();
    envConfig = getCurrentEnvConfig();
  }
});

// ../../packages/shared-core/src/utils/env-info.ts
function getCurrentAppId() {
  return getCurrentSubApp();
}
var init_env_info = __esm({
  "../../packages/shared-core/src/utils/env-info.ts"() {
    "use strict";
    init_unified_env_config();
    init_app_env_config();
  }
});

// ../../packages/shared-core/src/utils/logger/index.ts
import "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/pino@10.1.1/node_modules/pino/pino.js";
function createLoggerWithContext(context) {
  let appId = null;
  try {
    appId = context?.appId || globalContext.appId || getCurrentAppId();
  } catch (error) {
    try {
      if (import.meta?.env?.DEV) {
        console.warn("[logger] getCurrentAppId() \u8C03\u7528\u5931\u8D25\uFF0C\u53EF\u80FD\u662F\u6A21\u5757\u521D\u59CB\u5316\u9636\u6BB5:", error);
      }
    } catch (e) {
    }
  }
  const mergedContext = {
    ...globalContext,
    ...context,
    appId: appId || void 0
  };
  const baseLogger = createPinoLogger(mergedContext);
  if (Object.keys(mergedContext).length > 0) {
    return baseLogger.child(mergedContext);
  }
  return baseLogger;
}
var globalContext, defaultLogger, logger;
var init_logger = __esm({
  "../../packages/shared-core/src/utils/logger/index.ts"() {
    "use strict";
    init_pino_config();
    init_transports();
    init_env_info();
    globalContext = {};
    defaultLogger = createLoggerWithContext();
    logger = {
      /**
       * Debug 级别日志
       */
      debug: (message, ...args) => {
        defaultLogger.debug({ ...args }, message);
      },
      /**
       * Info 级别日志
       */
      info: (message, ...args) => {
        defaultLogger.info({ ...args }, message);
      },
      /**
       * Warn 级别日志
       */
      warn: (message, ...args) => {
        defaultLogger.warn({ ...args }, message);
      },
      /**
       * Error 级别日志
       */
      error: (message, error, ...args) => {
        if (error instanceof Error) {
          defaultLogger.error({ err: error, ...args }, message);
        } else if (error) {
          defaultLogger.error({ ...error, ...args }, message);
        } else {
          defaultLogger.error({ ...args }, message);
        }
      },
      /**
       * Fatal 级别日志
       */
      fatal: (message, error, ...args) => {
        if (error instanceof Error) {
          defaultLogger.fatal({ err: error, ...args }, message);
        } else if (error) {
          defaultLogger.fatal({ ...error, ...args }, message);
        } else {
          defaultLogger.fatal({ ...args }, message);
        }
      },
      /**
       * 创建带上下文的子 logger
       */
      child: (context) => {
        return createLoggerWithContext(context);
      },
      /**
       * 设置日志级别
       */
      setLevel: (level) => {
        defaultLogger.level = level;
      },
      /**
       * 获取当前日志级别
       */
      getLevel: () => {
        return defaultLogger.level;
      }
    };
  }
});

// ../../packages/shared-core/src/configs/app-env.config.ts
function getAppConfig(appName) {
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}
function getAllDevPorts() {
  try {
    return APP_ENV_CONFIGS.map((config) => config.devPort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes("before initialization")) {
      if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV) {
        logger.warn("[app-env.config] APP_ENV_CONFIGS \u672A\u521D\u59CB\u5316\uFF08\u53EF\u80FD\u662F\u5FAA\u73AF\u4F9D\u8D56\uFF09\uFF0C\u8FD4\u56DE\u7A7A\u6570\u7EC4");
      }
      return [];
    }
    throw error;
  }
}
function getAllPrePorts() {
  try {
    return APP_ENV_CONFIGS.map((config) => config.prePort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes("before initialization")) {
      if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV) {
        logger.warn("[app-env.config] APP_ENV_CONFIGS \u672A\u521D\u59CB\u5316\uFF08\u53EF\u80FD\u662F\u5FAA\u73AF\u4F9D\u8D56\uFF09\uFF0C\u8FD4\u56DE\u7A7A\u6570\u7EC4");
      }
      return [];
    }
    throw error;
  }
}
function getAppConfigByPrePort(port) {
  return APP_ENV_CONFIGS.find((config) => config.prePort === port);
}
function getAppConfigByTestHost(testHost) {
  return APP_ENV_CONFIGS.find((config) => config.testHost === testHost);
}
var MAIN_APP_CONFIG, BUSINESS_APP_CONFIGS, SPECIAL_APP_CONFIGS, APP_ENV_CONFIGS;
var init_app_env_config = __esm({
  "../../packages/shared-core/src/configs/app-env.config.ts"() {
    "use strict";
    init_logger();
    MAIN_APP_CONFIG = {
      appName: "main-app",
      devHost: "10.80.8.199",
      devPort: "8080",
      preHost: "localhost",
      prePort: "4180",
      testHost: "test.bellis.com.cn",
      prodHost: "bellis.com.cn"
    };
    BUSINESS_APP_CONFIGS = [
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
        devPort: "8090",
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
    SPECIAL_APP_CONFIGS = [
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
      },
      {
        appName: "mobile-app",
        devHost: "10.80.8.199",
        devPort: "8087",
        preHost: "localhost",
        prePort: "4187",
        testHost: "mobile.test.bellis.com.cn",
        prodHost: "mobile.bellis.com.cn"
      }
    ];
    APP_ENV_CONFIGS = [
      MAIN_APP_CONFIG,
      ...BUSINESS_APP_CONFIGS,
      ...SPECIAL_APP_CONFIGS
    ];
  }
});

// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath6 } from "node:url";

// ../../configs/vite/factories/subapp.config.ts
import { resolve as resolve9, dirname as dirname4 } from "path";
import { fileURLToPath as fileURLToPath5 } from "node:url";
import { createRequire } from "module";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";
import { existsSync as existsSync7, readFileSync as readFileSync4 } from "node:fs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir) {
  const withSrc = (relativePath) => resolve(appDir, relativePath);
  const withPackages = (relativePath) => resolve(appDir, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir, "../../configs", relativePath);
  return { withSrc, withPackages, withRoot, withConfigs };
}

// ../../configs/vite/factories/subapp.config.ts
import { pathToFileURL } from "node:url";

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

// ../../configs/vite/factories/subapp.config.ts
import { btc, fixChunkReferencesPlugin } from "@btc/vite-plugin";

// ../../configs/vite-app-config.ts
init_app_env_config();
import { resolve as resolve2 } from "path";
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
function getBaseUrl(appName, isPreviewBuild = false) {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`\u672A\u627E\u5230 ${appName} \u7684\u73AF\u5883\u914D\u7F6E`);
  }
  if (isPreviewBuild) {
    return `http://${appConfig.preHost}:${appConfig.prePort}/`;
  }
  return "/";
}
function getPublicDir(appName, appDir) {
  if (appName === "main-app" || appName === "admin-app" || appName === "mobile-app" || appName === "system-app") {
    return resolve2(appDir, "public");
  }
  return resolve2(appDir, "../../packages/shared-components/public");
}

// ../../configs/vite/base.config.ts
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

// ../../configs/vite/plugins/manual-chunks.ts
var APP_USAGE = {
  "layout-app": { echarts: true, monaco: false, three: false },
  "system-app": { echarts: true, monaco: false, three: false },
  "admin-app": { echarts: true, monaco: false, three: false },
  "finance-app": { echarts: true, monaco: false, three: false },
  "logistics-app": { echarts: true, monaco: false, three: false },
  "quality-app": { echarts: true, monaco: false, three: false },
  "production-app": { echarts: true, monaco: false, three: false },
  "engineering-app": { echarts: true, monaco: false, three: false },
  "monitor-app": { echarts: true, monaco: false, three: false },
  "mobile-app": { echarts: false, monaco: false, three: false }
};
var isProduction = process.env.NODE_ENV === "production";
function createManualChunksStrategy(appName) {
  const isLayoutApp = appName === "layout-app";
  const isMainApp = appName === "main-app";
  const appUsage = APP_USAGE[appName] || { echarts: false, monaco: false, three: false };
  const skipSharedResources = isProduction && !isLayoutApp && !isMainApp;
  return (id) => {
    if (id.includes("virtual:eps") || id.includes("\\0virtual:eps") || id.includes("services/eps") || id.includes("services\\eps")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "eps-service";
    }
    if (id.includes("modules/api-services/auth") || id.includes("modules\\api-services\\auth") || id.includes("api-services/auth")) {
      return "auth-api";
    }
    if (id.includes("packages/shared-components/src/store/menuRegistry") || id.includes("@btc/shared-components/store/menuRegistry") || id.includes("shared-components/store/menuRegistry")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "vendor";
    }
    if (id.includes("configs/layout-bridge") || id.includes("@btc/shared-core/configs/layout-bridge")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "vendor";
    }
    if (id.includes("packages/subapp-manifests") || id.includes("@btc/subapp-manifests")) {
      const otherApps = ["finance", "logistics", "system", "quality", "engineering", "production", "monitor", "admin"];
      const currentAppName = appName.replace("-app", "");
      const shouldExclude = otherApps.filter((app) => app !== currentAppName).some((app) => id.includes(`manifests/${app}.json`));
      if (shouldExclude) {
        return void 0;
      }
      if (skipSharedResources) {
        return void 0;
      }
      return "menu-registry";
    }
    if (id.includes("node_modules/echarts") || id.includes("node_modules/zrender")) {
      if (skipSharedResources && appUsage.echarts) {
        return void 0;
      }
      if (!appUsage.echarts) {
        return void 0;
      }
      return "echarts-vendor";
    }
    if (id.includes("node_modules/monaco-editor")) {
      if (!appUsage.monaco) {
        return void 0;
      }
      return "lib-monaco";
    }
    if (id.includes("node_modules/three")) {
      if (!appUsage.three) {
        return void 0;
      }
      return "lib-three";
    }
    if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router") || id.includes("node_modules/element-plus") || id.includes("node_modules/pinia") || id.includes("node_modules/@vueuse") || id.includes("node_modules/@element-plus") || id.includes("node_modules/vue-echarts") || id.includes("node_modules/dayjs") || id.includes("node_modules/lodash") || id.includes("node_modules/@vue") || id.includes("packages/shared-components") || id.includes("packages/shared-core") || id.includes("packages/shared-utils")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "vendor";
    }
    if (id.includes("packages/vite-plugin") || id.includes("@btc/vite-plugin")) {
      return "vendor";
    }
    return void 0;
  };
}

// ../../configs/vite/plugins/rollup-config.ts
function createRollupConfig(appName, options) {
  const manualChunks = createManualChunksStrategy(appName);
  const assetDir = options?.assetDir || "assets";
  const chunkDir = options?.chunkDir || assetDir;
  const _externalSingleSpa = options?.externalSingleSpa !== false;
  const externalBtcPackages = options?.externalBtcPackages === true;
  const externalConfigsPackages = options?.externalConfigsPackages !== false;
  const external = [
    // vite-plugin 是构建时插件，不应该被打包到运行时代码中
    "@btc/vite-plugin",
    /^@btc\/vite-plugin/,
    // @btc 包：根据配置决定是否标记为 external
    // 默认所有应用都打包这些库，避免运行时模块解析问题
    // 注意：CSS 文件不应该被标记为 external，应该被 Vite 处理并打包
    ...externalBtcPackages ? [
      "@btc/shared-components",
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id) => {
        if (id.startsWith("@btc/shared-components/")) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
      "@btc/shared-core",
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id) => {
        if (id.startsWith("@btc/shared-core/")) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
      "@btc/shared-utils",
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id) => {
        if (id.startsWith("@btc/shared-utils/")) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      }
    ] : [],
    // @btc/shared-core/configs 包：根据配置决定是否标记为 external
    // 主应用（main-app）应该打包这些库，子应用从 layout-app 加载
    ...externalConfigsPackages ? [
      "@btc/shared-core/configs/layout-bridge",
      "@btc/shared-core/configs/unified-env-config",
      "@btc/shared-core/configs/app-scanner",
      "@btc/shared-core/configs/app-env.config",
      /^@btc\/shared-core\/configs\/.*/
    ] : []
  ];
  return {
    preserveEntrySignatures: "strict",
    onwarn(warning, warn) {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message && typeof warning.message === "string" && warning.message.includes("dynamically imported") && warning.message.includes("statically imported")) {
        return;
      }
      if (warning.message && typeof warning.message === "string" && warning.message.includes("Generated an empty chunk")) {
        return;
      }
      warn(warning);
    },
    output: {
      format: "esm",
      inlineDynamicImports: false,
      manualChunks,
      preserveModules: false,
      generatedCode: {
        constBindings: false,
        // 不使用 const，避免 TDZ 问题
        // 关键：保留导出名称，避免被压缩成单字母
        // 这可以防止 "does not provide an export named 'c'" 错误
        preserveModulesRoot: void 0,
        // 关键：确保对象属性之间有正确的分隔符，避免字符串和数字连接
        objectShorthand: false,
        // 禁用对象简写，确保属性名和值都完整
        arrowFunctions: false
        // 禁用箭头函数，使用普通函数，更安全
      },
      // 关键：确保导出名称不被压缩
      // 虽然 terser 的 mangle 已禁用，但 Rollup 的代码生成也可能压缩导出名称
      chunkFileNames: `${chunkDir}/[name]-[hash].js`,
      // 关键：入口文件使用稳定文件名（不带 hash），降低部署/缓存导致的 index-xxx.js 404 风险
      // Nginx 对该文件应配置 no-cache；其他 chunk 仍保持 hash + immutable
      entryFileNames: `${chunkDir}/[name].js`,
      assetFileNames: (assetInfo) => {
        if (assetInfo.name?.includes("favicon") || assetInfo.name?.includes("icons/")) {
          return assetInfo.name || `${assetDir}/[name].[ext]`;
        }
        if (assetInfo.name?.endsWith(".css")) {
          return `${assetDir}/[name]-[hash].css`;
        }
        return `${assetDir}/[name]-[hash].[ext]`;
      }
    },
    external
  };
}

// ../../configs/vite/plugins/clean.ts
import { logger as logger2 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { resolve as resolve3 } from "path";
import { existsSync, rmSync } from "node:fs";
function safeLog(message) {
  try {
    logger2.info(message);
  } catch (error) {
    logger2.info(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function safeWarn(message) {
  try {
    logger2.warn(message);
  } catch (error) {
    logger2.warn(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function cleanDistPlugin(appDir) {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve3(appDir, "dist");
      if (existsSync(distDir)) {
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

// ../../configs/vite/plugins/chunk.ts
import { logger as logger3 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
function chunkVerifyPlugin() {
  return {
    name: "chunk-verify-plugin",
    writeBundle(_options, bundle) {
      logger3.info("\n[chunk-verify-plugin] \u2705 \u751F\u6210\u7684\u6240\u6709 chunk \u6587\u4EF6\uFF1A");
      const jsChunks = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      const cssChunks = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      logger3.info(`
JS chunk\uFF08\u5171 ${jsChunks.length} \u4E2A\uFF09\uFF1A`);
      jsChunks.forEach((chunk) => logger3.info(`  - ${chunk}`));
      logger3.info(`
CSS chunk\uFF08\u5171 ${cssChunks.length} \u4E2A\uFF09\uFF1A`);
      cssChunks.forEach((chunk) => logger3.info(`  - ${chunk}`));
      const indexChunk = jsChunks.find((jsChunk) => jsChunk.includes("index-"));
      const indexSize = indexChunk ? bundle[indexChunk]?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      const indexSizeMB = indexSizeKB / 1024;
      const missingRequiredChunks = [];
      if (!indexChunk) {
        missingRequiredChunks.push("index");
      }
      const hasEpsService = jsChunks.some((jsChunk) => jsChunk.includes("eps-service"));
      const hasAuthApi = jsChunks.some((jsChunk) => jsChunk.includes("auth-api"));
      const hasEchartsVendor = jsChunks.some((jsChunk) => jsChunk.includes("echarts-vendor"));
      const hasLibMonaco = jsChunks.some((jsChunk) => jsChunk.includes("lib-monaco"));
      const hasLibThree = jsChunks.some((jsChunk) => jsChunk.includes("lib-three"));
      logger3.info(`
[chunk-verify-plugin] \u{1F4E6} \u6784\u5EFA\u60C5\u51B5\uFF08\u5E73\u8861\u62C6\u5206\u7B56\u7565\uFF09\uFF1A`);
      if (indexChunk) {
        logger3.info(`  \u2705 index: \u4E3B\u6587\u4EF6\uFF08Vue\u751F\u6001 + Element Plus + \u4E1A\u52A1\u4EE3\u7801\uFF0C\u4F53\u79EF~${indexSizeMB.toFixed(2)}MB \u672A\u538B\u7F29\uFF0Cgzip\u540E~${(indexSizeMB * 0.3).toFixed(2)}MB\uFF09`);
      } else {
        logger3.info(`  \u274C \u5165\u53E3\u6587\u4EF6\u4E0D\u5B58\u5728`);
      }
      if (hasEpsService) logger3.info(`  \u2705 eps-service: EPS \u670D\u52A1\uFF08\u6240\u6709\u5E94\u7528\u5171\u4EAB\uFF0C\u5355\u72EC\u6253\u5305\uFF09`);
      if (hasAuthApi) logger3.info(`  \u2705 auth-api: Auth API\uFF08\u6240\u6709\u5E94\u7528\u5171\u4EAB\uFF0C\u5355\u72EC\u6253\u5305\uFF0C\u7531 system-app \u63D0\u4F9B\uFF09`);
      if (hasEchartsVendor) logger3.info(`  \u2705 echarts-vendor: ECharts + zrender\uFF08\u72EC\u7ACB\u5927\u5E93\uFF0C\u65E0\u4F9D\u8D56\u95EE\u9898\uFF09`);
      if (hasLibMonaco) logger3.info(`  \u2705 lib-monaco: Monaco Editor\uFF08\u72EC\u7ACB\u5927\u5E93\uFF09`);
      if (hasLibThree) logger3.info(`  \u2705 lib-three: Three.js\uFF08\u72EC\u7ACB\u5927\u5E93\uFF09`);
      logger3.info(`  \u2139\uFE0F  \u4E1A\u52A1\u4EE3\u7801\u548C Vue \u751F\u6001\u5408\u5E76\u5230\u4E3B\u6587\u4EF6\uFF0C\u907F\u514D\u521D\u59CB\u5316\u987A\u5E8F\u95EE\u9898`);
      if (missingRequiredChunks.length > 0) {
        logger3.error(`
[chunk-verify-plugin] \u274C \u7F3A\u5931\u6838\u5FC3 chunk\uFF1A`, missingRequiredChunks);
        throw new Error(`\u6838\u5FC3 chunk \u7F3A\u5931\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01`);
      } else {
        logger3.info(`
[chunk-verify-plugin] \u2705 \u6838\u5FC3 chunk \u5168\u90E8\u5B58\u5728`);
      }
      logger3.info("\n[chunk-verify-plugin] \u{1F50D} \u9A8C\u8BC1\u8D44\u6E90\u5F15\u7528\u4E00\u81F4\u6027...");
      const allChunkFiles = /* @__PURE__ */ new Set([...jsChunks, ...cssChunks]);
      const referencedFiles = /* @__PURE__ */ new Map();
      const missingFiles = [];
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code) {
          const codeWithoutComments = chunkAny.code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
          const importPattern = /import\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']\s*\)/g;
          let match;
          while ((match = importPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            if (!resourcePath) continue;
            const resourceFile = resourcePath.replace(/^\/?assets\//, "assets/");
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile).push(fileName);
          }
          const urlPattern = /new\s+URL\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']/g;
          while ((match = urlPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            if (!resourcePath) continue;
            const resourceFile = resourcePath.replace(/^\/?assets\//, "assets/");
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile).push(fileName);
          }
        }
      }
      for (const [referencedFile, referencedBy] of referencedFiles.entries()) {
        const fileName = referencedFile.replace(/^assets\//, "");
        let exists = allChunkFiles.has(fileName);
        let possibleMatches = [];
        if (!exists) {
          const match = fileName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
          if (match) {
            const [, namePrefix, , ext] = match;
            possibleMatches = Array.from(allChunkFiles).filter((chunkFile) => {
              const chunkMatch = chunkFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (chunkMatch) {
                const [, chunkNamePrefix, , chunkExt] = chunkMatch;
                return chunkNamePrefix === namePrefix && chunkExt === ext;
              }
              return false;
            });
            exists = possibleMatches.length > 0;
          }
        }
        if (!exists) {
          missingFiles.push({ file: referencedFile, referencedBy, possibleMatches });
        }
      }
      if (missingFiles.length > 0) {
        logger3.error(`
[chunk-verify-plugin] \u274C \u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A`);
        if (missingFiles.length <= 5) {
          logger3.warn(`
[chunk-verify-plugin] \u26A0\uFE0F  \u8B66\u544A\uFF1A\u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u4F46\u7EE7\u7EED\u6784\u5EFA`);
        } else {
          throw new Error(`\u8D44\u6E90\u5F15\u7528\u4E0D\u4E00\u81F4\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01\u6709 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u6587\u4EF6\u4E0D\u5B58\u5728`);
        }
      } else {
        logger3.info(`
[chunk-verify-plugin] \u2705 \u6240\u6709\u8D44\u6E90\u5F15\u7528\u90FD\u6B63\u786E\uFF08\u5171\u9A8C\u8BC1 ${referencedFiles.size} \u4E2A\u5F15\u7528\uFF09`);
      }
    }
  };
}
function optimizeChunksPlugin() {
  return {
    name: "optimize-chunks",
    generateBundle(_options, bundle) {
      const emptyChunks = [];
      const chunkReferences = /* @__PURE__ */ new Map();
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code && chunkAny.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        if (chunkAny.type === "chunk" && chunkAny.imports) {
          for (const imported of chunkAny.imports) {
            if (!chunkReferences.has(imported)) {
              chunkReferences.set(imported, []);
            }
            chunkReferences.get(imported).push(fileName);
          }
        }
      }
      if (emptyChunks.length === 0) {
        return;
      }
      const chunksToRemove = [];
      const chunksToKeep = [];
      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
        if (referencedBy.length > 0) {
          const chunk = bundle[emptyChunk];
          if (chunk && chunk.type === "chunk") {
            chunk.code = "export {}";
            chunksToKeep.push(emptyChunk);
            logger3.info(`[optimize-chunks] \u4FDD\u7559\u88AB\u5F15\u7528\u7684\u7A7A chunk: ${emptyChunk} (\u88AB ${referencedBy.length} \u4E2A chunk \u5F15\u7528\uFF0C\u5DF2\u6DFB\u52A0\u5360\u4F4D\u7B26)`);
          }
        } else {
          chunksToRemove.push(emptyChunk);
          delete bundle[emptyChunk];
        }
      }
      if (chunksToRemove.length > 0) {
        logger3.info(`[optimize-chunks] \u79FB\u9664\u4E86 ${chunksToRemove.length} \u4E2A\u672A\u88AB\u5F15\u7528\u7684\u7A7A chunk:`, chunksToRemove);
      }
      if (chunksToKeep.length > 0) {
        logger3.info(`[optimize-chunks] \u4FDD\u7559\u4E86 ${chunksToKeep.length} \u4E2A\u88AB\u5F15\u7528\u7684\u7A7A chunk\uFF08\u5DF2\u6DFB\u52A0\u5360\u4F4D\u7B26\uFF09:`, chunksToKeep);
      }
    }
  };
}

// ../../configs/vite/plugins/url.ts
import { logger as logger4 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { existsSync as existsSync2, readFileSync } from "node:fs";
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/url.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);
function getBuildTimestampForQuery() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = resolvePath(__dirname, "../../../.build-timestamp");
  if (existsSync2(timestampFile)) {
    try {
      const ts = readFileSync(timestampFile, "utf-8").trim();
      if (ts) return ts;
    } catch {
    }
  }
  return Date.now().toString(36);
}
function ensureBaseUrlPlugin(baseUrl, appHost, appPort, mainAppPort) {
  const isPreviewBuild = baseUrl.startsWith("http");
  const qiankunIndexImportRegex = /import\((['"])\/assets\/(index|main)-([^'"]+)\1\)/g;
  const buildTimestamp = getBuildTimestampForQuery();
  const qiankunIndexImportInHtmlRegex = /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g;
  function patchQiankunIndexImports(code) {
    if (!qiankunIndexImportRegex.test(code)) {
      return { code, modified: false };
    }
    qiankunIndexImportRegex.lastIndex = 0;
    const helperName = "__btcQiankunAssetOrigin";
    const tsName = "__btcBuildV";
    const helperDecl = `const ${helperName}=(()=>{try{const p=window&&window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;if(p&&typeof p==='string'){const s=p.replace(/\\/$/,'');if(s.startsWith('http')||s.startsWith('//'))return s;return (window.location&&window.location.origin?window.location.origin:'')+s;}}catch{}return (window.location&&window.location.origin)?window.location.origin:'';})();`;
    const tsDecl = `const ${tsName}='${buildTimestamp}';`;
    let newCode = code.replace(qiankunIndexImportRegex, (_m, _q, _kind, rest) => {
      return `import(/* @vite-ignore */ (${helperName} + '/assets/${_kind}-${rest}' + '?v=' + ${tsName}))`;
    });
    if (!newCode.includes(helperDecl)) {
      newCode = `${tsDecl}
${helperDecl}
${newCode}`;
    }
    return { code: newCode, modified: true };
  }
  return {
    name: "ensure-base-url",
    renderChunk(code, chunk, _options) {
      let newCode = code;
      let modified = false;
      {
        const patched = patchQiankunIndexImports(newCode);
        if (patched.modified) {
          newCode = patched.code;
          modified = true;
        }
      }
      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = "") => {
            return `${quote}${baseUrl.replace(/\/$/, "")}${path}${query}`;
          });
          modified = true;
        }
      }
      const wrongPortHttpRegex = new RegExp(`http://(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (_match, host, path, query = "") => {
          if (isPreviewBuild) {
            return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
          }
          return `http://${host}:${appPort}${path}${query}`;
        });
        modified = true;
      }
      const wrongPortProtocolRegex = new RegExp(`//(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (_match, host, path, query = "") => {
          if (isPreviewBuild) {
            return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
          }
          return `//${host}:${appPort}${path}${query}`;
        });
        modified = true;
      }
      const patterns = [
        {
          regex: new RegExp(`(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, protocol, _host, path, query = "") => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, protocol, _host, path, query = "") => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, quote, protocol, _host, path, query = "") => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, quote, protocol, _host, path, query = "") => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          }
        }
      ];
      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement);
          modified = true;
        }
      }
      if (modified) {
        logger4.info(`[ensure-base-url] \u4FEE\u590D\u4E86 ${chunk.fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84 (${mainAppPort} -> ${appPort})`);
        return {
          code: newCode,
          map: null
        };
      }
      return null;
    },
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const c = chunk;
        if (c.type === "chunk" && c.code) {
          let newCode = c.code;
          let modified = false;
          {
            const patched = patchQiankunIndexImports(newCode);
            if (patched.modified) {
              newCode = patched.code;
              modified = true;
            }
          }
          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = "") => {
                return `${quote}${baseUrl.replace(/\/$/, "")}${path}${query}`;
              });
              modified = true;
            }
          }
          const wrongPortHttpRegex = new RegExp(`http://(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (_match, host, path, query = "") => {
              if (isPreviewBuild) {
                return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
              }
              return `http://${host}:${appPort}${path}${query}`;
            });
            modified = true;
          }
          const wrongPortProtocolRegex = new RegExp(`//(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (_match, host, path, query = "") => {
              if (isPreviewBuild) {
                return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
              }
              return `//${host}:${appPort}${path}${query}`;
            });
            modified = true;
          }
          if (modified) {
            chunk.code = newCode;
            logger4.info(`[ensure-base-url] \u5728 generateBundle \u4E2D\u4FEE\u590D\u4E86 ${fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        } else if (c.type === "asset" && fileName === "index.html") {
          let htmlContent = c.source;
          let htmlModified = false;
          const relativeAssetRegex = /(href|src)=["'](\.\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (relativeAssetRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(relativeAssetRegex, (_match, attr, path, query = "") => {
              const absolutePath = path.replace(/^\./, "");
              htmlModified = true;
              logger4.info(`[ensure-base-url] \u4FEE\u590D\u76F8\u5BF9\u8DEF\u5F84: ${path} -> ${absolutePath}`);
              return `${attr}="${absolutePath}${query}"`;
            });
          }
          if (qiankunIndexImportInHtmlRegex.test(htmlContent)) {
            qiankunIndexImportInHtmlRegex.lastIndex = 0;
            const originExpr = `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin:((typeof location!=='undefined'&&location.origin)||''))`;
            htmlContent = htmlContent.replace(qiankunIndexImportInHtmlRegex, (_m, _q, absPath) => {
              htmlModified = true;
              return `import(/* @vite-ignore */ (${originExpr} + '${absPath}' + '?v=${buildTimestamp}'))`;
            });
            logger4.info(`[ensure-base-url] \u4FEE\u590D index.html \u5185\u8054 import(/assets/index-*.js) \u5E76\u8FFD\u52A0 v=${buildTimestamp}`);
          }
          const rootJsRegex = /(href|src)=["'](\/([^/]+\.(js|mjs)))(\?[^"']*)?["']/g;
          if (rootJsRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootJsRegex);
            if (matches) {
              logger4.warn(`[ensure-base-url] \u26A0\uFE0F  \u68C0\u6D4B\u5230\u6839\u76EE\u5F55\u8D44\u6E90\u8DEF\u5F84\uFF0C\u8FD9\u901A\u5E38\u4E0D\u5E94\u8BE5\u51FA\u73B0\u3002\u8BF7\u68C0\u67E5 Vite \u914D\u7F6E\uFF08base, assetsDir, rollupOptions.output.chunkFileNames\uFF09:`, matches);
              htmlContent = htmlContent.replace(rootJsRegex, (_match, attr, path, fileName2, _ext, query = "") => {
                if (!path.startsWith("/assets/") && !path.startsWith("/favicon") && !path.startsWith("/logo") && !path.match(/\.(png|jpg|jpeg|gif|svg|ico|json)$/)) {
                  const newPath = `/assets/${fileName2}`;
                  htmlModified = true;
                  logger4.info(`[ensure-base-url] \u4FEE\u590D\u6839\u76EE\u5F55\u8D44\u6E90\u8DEF\u5F84\uFF08\u515C\u5E95\uFF09: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }
          const rootCssRegex = /(href|src)=["'](\/([^/]+\.css))(\?[^"']*)?["']/g;
          if (rootCssRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootCssRegex);
            if (matches) {
              logger4.warn(`[ensure-base-url] \u26A0\uFE0F  \u68C0\u6D4B\u5230\u6839\u76EE\u5F55 CSS \u8DEF\u5F84\uFF0C\u8FD9\u901A\u5E38\u4E0D\u5E94\u8BE5\u51FA\u73B0\u3002\u8BF7\u68C0\u67E5 Vite \u914D\u7F6E:`, matches);
              htmlContent = htmlContent.replace(rootCssRegex, (_match, attr, path, fileName2, query = "") => {
                if (!path.startsWith("/assets/")) {
                  const newPath = `/assets/${fileName2}`;
                  htmlModified = true;
                  logger4.info(`[ensure-base-url] \u4FEE\u590D\u6839\u76EE\u5F55 CSS \u8DEF\u5F84\uFF08\u515C\u5E95\uFF09: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }
          if (htmlModified) {
            chunk.source = htmlContent;
            logger4.info(`[ensure-base-url] \u4FEE\u590D\u4E86 index.html \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        }
      }
    }
  };
}

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

// ../../configs/vite/plugins/css.ts
import { logger as logger5 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
function ensureCssPlugin() {
  return {
    name: "ensure-css-plugin",
    generateBundle(_options, bundle) {
      const jsFiles = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      let hasInlineCss = false;
      const suspiciousFiles = [];
      jsFiles.forEach((file) => {
        const chunk = bundle[file];
        if (chunk && chunk.code && typeof chunk.code === "string") {
          const code = chunk.code;
          const isModulePreload = code.includes("modulepreload") || code.includes("relList");
          if (isModulePreload) return;
          const isKnownLibrary = file.includes("vue-core") || file.includes("element-plus") || file.includes("vendor") || file.includes("vue-i18n") || file.includes("vue-router") || file.includes("lib-echarts") || file.includes("module-") || file.includes("app-composables") || file.includes("app-pages");
          if (isKnownLibrary) return;
          const hasStyleElementCreation = /document\.createElement\(['"]style['"]\)/.test(code) && /\.(textContent|innerHTML)\s*=/.test(code) && /\{[^}]{10,}\}/.test(code);
          const hasInsertStyleWithCss = /insertStyle\s*\(/.test(code) && /text\/css/.test(code) && /\{[^}]{20,}\}/.test(code);
          const styleTagMatch = code.match(/<style[^>]*>/);
          const hasStyleTagWithContent = styleTagMatch && !styleTagMatch[0].includes("'") && !styleTagMatch[0].includes('"') && /\{[^}]{20,}\}/.test(code);
          const hasInlineCssString = /['"`][^'"`]{50,}:\s*[^'"`]{10,};\s*[^'"`]{10,}['"`]/.test(code) && /(color|background|width|height|margin|padding|border|display|position|flex|grid)/.test(code);
          if (hasStyleElementCreation || hasInsertStyleWithCss || hasStyleTagWithContent || hasInlineCssString) {
            hasInlineCss = true;
            suspiciousFiles.push(file);
            const patterns = [];
            if (hasStyleElementCreation) patterns.push("\u52A8\u6001\u521B\u5EFA style \u5143\u7D20");
            if (hasInsertStyleWithCss) patterns.push("insertStyle \u51FD\u6570");
            if (hasStyleTagWithContent) patterns.push("<style> \u6807\u7B7E");
            if (hasInlineCssString) patterns.push("\u5185\u8054 CSS \u5B57\u7B26\u4E32");
            logger5.warn(`[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u5728 ${file} \u4E2D\u68C0\u6D4B\u5230\u53EF\u80FD\u7684\u5185\u8054 CSS\uFF08\u6A21\u5F0F\uFF1A${patterns.join(", ")}\uFF09`);
          }
        }
      });
      if (hasInlineCss) {
        logger5.warn("[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u68C0\u6D4B\u5230 CSS \u53EF\u80FD\u88AB\u5185\u8054\u5230 JS \u4E2D\uFF0C\u8FD9\u4F1A\u5BFC\u81F4 qiankun \u65E0\u6CD5\u6B63\u786E\u52A0\u8F7D\u6837\u5F0F");
        logger5.warn(`[ensure-css-plugin] \u53EF\u7591\u6587\u4EF6\uFF1A${suspiciousFiles.join(", ")}`);
        logger5.warn("[ensure-css-plugin] \u8BF7\u68C0\u67E5 vite-plugin-qiankun \u914D\u7F6E\u548C build.assetsInlineLimit \u8BBE\u7F6E");
      }
    },
    writeBundle(_options, bundle) {
      const cssFiles = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      if (cssFiles.length === 0) {
        logger5.error("[ensure-css-plugin] \u274C \u9519\u8BEF\uFF1A\u6784\u5EFA\u4EA7\u7269\u4E2D\u65E0 CSS \u6587\u4EF6\uFF01");
        logger5.error("[ensure-css-plugin] \u8BF7\u68C0\u67E5\uFF1A");
        logger5.error("1. \u5165\u53E3\u6587\u4EF6\u662F\u5426\u9759\u6001\u5BFC\u5165\u5168\u5C40\u6837\u5F0F\uFF08index.css/uno.css/element-plus.css\uFF09");
        logger5.error("2. \u662F\u5426\u6709 Vue \u7EC4\u4EF6\u4E2D\u4F7F\u7528 <style> \u6807\u7B7E");
        logger5.error("3. UnoCSS \u914D\u7F6E\u662F\u5426\u6B63\u786E\uFF0C\u662F\u5426\u5BFC\u5165 @unocss all");
        logger5.error("4. vite-plugin-qiankun \u7684 useDevMode \u662F\u5426\u5728\u751F\u4EA7\u73AF\u5883\u6B63\u786E\u5173\u95ED");
        logger5.error("5. build.assetsInlineLimit \u662F\u5426\u8BBE\u7F6E\u4E3A 0\uFF08\u7981\u6B62\u5185\u8054\uFF09");
      } else {
        logger5.info(`[ensure-css-plugin] \u2705 \u6210\u529F\u6253\u5305 ${cssFiles.length} \u4E2A CSS \u6587\u4EF6\uFF1A`, cssFiles);
        cssFiles.forEach((file) => {
          const asset = bundle[file];
          if (asset && asset.source) {
            const sizeKB = (asset.source.length / 1024).toFixed(2);
            logger5.info(`  - ${file}: ${sizeKB}KB`);
          } else if (asset && asset.fileName) {
            logger5.info(`  - ${asset.fileName || file}`);
          }
        });
      }
    }
  };
}

// ../../configs/vite/plugins/version.ts
import { logger as logger6 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { existsSync as existsSync3, readFileSync as readFileSync2, writeFileSync } from "node:fs";
import { resolve as resolve4, dirname as dirname2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/version.ts";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname2 = dirname2(__filename2);
function getBuildTimestamp() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = resolve4(__dirname2, "../../../.build-timestamp");
  if (existsSync3(timestampFile)) {
    try {
      const timestamp2 = readFileSync2(timestampFile, "utf-8").trim();
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
      logger6.info(`[add-version] \u6784\u5EFA\u65F6\u95F4\u6233\u7248\u672C\u53F7: ${buildTimestamp}`);
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
          logger6.info(`[add-version] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u6DFB\u52A0\u7248\u672C\u53F7: v=${buildTimestamp}`);
          return newHtml;
        }
        return html;
      }
    }
  };
}

// ../../configs/vite/plugins/public-images.ts
import { logger as logger7 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";

// ../../configs/vite/plugins/resolve-logo.ts
import { resolve as resolve5, dirname as dirname3 } from "path";
import { existsSync as existsSync4, copyFileSync, mkdirSync } from "node:fs";
function resolveLogoPlugin(appDir) {
  let viteConfig = null;
  return {
    name: "resolve-logo",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      viteConfig = config;
    },
    resolveId(id) {
      if (id === "/logo.png" || id === "logo.png") {
        const sharedLogoPath = resolve5(appDir, "../../packages/shared-components/public/logo.png");
        if (existsSync4(sharedLogoPath)) {
          return sharedLogoPath;
        }
        const appLogoPath = resolve5(appDir, "public/logo.png");
        if (existsSync4(appLogoPath)) {
          return appLogoPath;
        }
        return `\0logo.png`;
      }
      return null;
    },
    load(id) {
      if (id === "\0logo.png") {
        return "";
      }
      return null;
    },
    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }
        const root = viteConfig.root || appDir;
        const sharedLogoPath = resolve5(root, "../../packages/shared-components/public/logo.png");
        let logoSourcePath = null;
        if (existsSync4(sharedLogoPath)) {
          logoSourcePath = sharedLogoPath;
        } else {
          const appLogoPath = resolve5(root, "public/logo.png");
          if (existsSync4(appLogoPath)) {
            logoSourcePath = appLogoPath;
          }
        }
        if (!logoSourcePath) {
          return;
        }
        const outDir = viteConfig.build.outDir || "dist";
        const distDir = resolve5(root, outDir);
        if (!existsSync4(distDir)) {
          return;
        }
        const logoDestPath = resolve5(distDir, "logo.png");
        const destDir = dirname3(logoDestPath);
        if (!existsSync4(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(logoSourcePath, logoDestPath);
      } catch (error) {
      }
    }
  };
}

// ../../configs/vite/plugins/copy-icons.ts
import { logger as logger8 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";

// ../../configs/vite/plugins/upload-icons-to-oss.ts
import { logger as logger9 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { resolve as resolve6 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-icons-to-oss.ts";
var __filename3 = fileURLToPath3(__vite_injected_original_import_meta_url3);
var __dirname3 = resolve6(__filename3, "..");
var projectRoot = resolve6(__dirname3, "../../..");

// ../../configs/vite/plugins/replace-icons-with-cdn.ts
import { logger as logger10 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
function replaceIconsWithCdnPlugin() {
  let isProductionBuild = false;
  let cachedLogoCdnOk = null;
  return {
    name: "replace-icons-with-cdn",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    async transformIndexHtml(html) {
      if (!isProductionBuild) {
        return html;
      }
      try {
        const { getEnvConfig: getEnvConfig2 } = await import("file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/configs/unified-env-config.mjs");
        const envConfig2 = getEnvConfig2();
        const cdnUrl = envConfig2.cdn?.staticAssetsUrl;
        if (!cdnUrl) {
          return html;
        }
        const cdnBase = cdnUrl.replace(/\/$/, "");
        if (cachedLogoCdnOk === null) {
          try {
            const res = await fetch(`${cdnBase}/logo.png`, { method: "HEAD", redirect: "follow" });
            cachedLogoCdnOk = !!res.ok;
          } catch {
            cachedLogoCdnOk = false;
          }
        }
        let newHtml = html;
        if (cachedLogoCdnOk) {
          newHtml = newHtml.replace(
            /href=["']\/logo\.png["']/g,
            `href="${cdnBase}/logo.png"`
          );
        }
        newHtml = newHtml.replace(
          /href=["']\/icons\/([^"']+)["']/g,
          (match, iconFile) => {
            if (iconFile === "site.webmanifest") {
              return match;
            }
            return `href="${cdnBase}/icons/${iconFile}"`;
          }
        );
        return newHtml;
      } catch (error) {
        logger10.warn("[replace-icons-with-cdn] \u83B7\u53D6\u914D\u7F6E\u5931\u8D25\uFF0C\u4FDD\u6301\u539F\u56FE\u6807\u8DEF\u5F84:", error);
        return html;
      }
    }
  };
}

// ../../configs/vite/plugins/duty-static.ts
import { logger as logger11 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";

// ../../configs/vite/plugins/locales-static.ts
import { logger as logger12 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { readFileSync as readFileSync3, existsSync as existsSync5 } from "fs";
import { resolve as resolve7 } from "path";
function localesStaticPlugin(appDir) {
  let viteConfig = null;
  const localesMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS" && req.url?.match(/^\/src\/locales\/[^/]+\.json$/)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.statusCode = 200;
      res.end();
      return;
    }
    if (req.method !== "GET" || !req.url || !req.url.match(/^\/src\/locales\/[^/]+\.json$/)) {
      next();
      return;
    }
    const filePath = req.url.replace(/^\//, "");
    const fullPath = resolve7(appDir, filePath);
    if (!existsSync5(fullPath)) {
      logger12.warn(`[locales-static] File not found: ${fullPath} (requested: ${req.url})`);
      next();
      return;
    }
    try {
      const content = readFileSync3(fullPath, "utf-8");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.statusCode = 200;
      res.end(content);
    } catch (error) {
      logger12.warn(`[locales-static] Failed to read file: ${fullPath}`, error);
      next();
    }
  };
  return {
    name: "vite-plugin-locales-static",
    configResolved(config) {
      viteConfig = config;
    },
    configureServer(server) {
      server.middlewares.use(localesMiddleware);
    }
  };
}

// ../../configs/vite/plugins/upload-cdn.ts
import { logger as logger13 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { spawn } from "child_process";
import { resolve as resolve8 } from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { execSync } from "child_process";
var __vite_injected_original_import_meta_url4 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-cdn.ts";
var __filename4 = fileURLToPath4(__vite_injected_original_import_meta_url4);
var __dirname4 = resolve8(__filename4, "..");
var projectRoot2 = resolve8(__dirname4, "../../..");
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
        logger13.info(`[upload-cdn] \u23ED\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08SKIP_CDN_UPLOAD=true\uFF09`);
        return;
      }
      if (!isProductionBuild) {
        return;
      }
      tryLoadOssCredsFromWindowsCredentialManager();
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        logger13.warn(`[upload-cdn] \u26A0\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08\u672A\u914D\u7F6E OSS \u51ED\u8BC1\uFF09`);
        return;
      }
      const uploadScript = resolve8(projectRoot2, "scripts/upload-app-to-cdn.mjs");
      logger13.info(`[upload-cdn] \u{1F680} \u5F00\u59CB\u4E0A\u4F20 ${appName} \u5230 CDN...`);
      await new Promise((resolvePromise, rejectPromise) => {
        const child = spawn("node", [uploadScript, appName], {
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
            logger13.info(`[upload-cdn] \u2705 ${appName} \u4E0A\u4F20\u5B8C\u6210`);
            resolvePromise();
          } else {
            const strict = process.env.OSS_UPLOAD_STRICT === "true";
            const err = new Error(`[upload-cdn] ${appName} \u4E0A\u4F20\u811A\u672C\u9000\u51FA\uFF0C\u4EE3\u7801: ${code ?? "unknown"}`);
            if (strict) {
              rejectPromise(err);
            } else {
              logger13.warn(err.message);
              resolvePromise();
            }
          }
        });
      });
    }
  };
}

// ../../configs/vite/plugins/cdn-assets.ts
import { logger as logger14 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
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
        logger14.info(`[cdn-assets] CDN \u52A0\u901F\u5DF2\u542F\u7528\uFF0C\u5E94\u7528: ${appName}, CDN \u57DF\u540D: ${cdnDomain}`);
      } else {
        logger14.info(`[cdn-assets] CDN \u52A0\u901F\u5DF2\u7981\u7528`);
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
          logger14.info(`[cdn-assets] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u8F6C\u6362\u4E3A CDN URL`);
        }
        return newHtml;
      }
    }
  };
}

// ../../configs/vite/plugins/cdn-import.ts
import { logger as logger15 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
function cdnImportPlugin(options) {
  const {
    appName,
    // 关键：默认启用条件必须明确检查 ENABLE_CDN_ACCELERATION 环境变量
    // 如果 ENABLE_CDN_ACCELERATION 被设置为 'false'，则禁用 CDN
    // 只有在明确启用（ENABLE_CDN_ACCELERATION=true）或未设置且是生产构建时，才启用 CDN
    enabled = process.env.ENABLE_CDN_ACCELERATION === "true" || process.env.ENABLE_CDN_ACCELERATION !== "false" && process.env.NODE_ENV === "production" && process.env.VITE_PREVIEW !== "true",
    cdnDomain = "https://all.bellis.com.cn"
  } = options;
  return {
    name: "cdn-import",
    apply: "build",
    buildStart() {
      if (enabled) {
        logger15.info(`[cdn-import] CDN \u52A8\u6001\u5BFC\u5165\u8F6C\u6362\u5DF2\u542F\u7528\uFF0C\u5E94\u7528: ${appName}, CDN \u57DF\u540D: ${cdnDomain}`);
      } else {
        logger15.info(`[cdn-import] CDN \u52A8\u6001\u5BFC\u5165\u8F6C\u6362\u5DF2\u7981\u7528`);
      }
    },
    renderChunk(code, chunk) {
      if (!enabled) {
        return null;
      }
      if (!chunk.fileName.endsWith(".js")) {
        return null;
      }
      if (chunk.isEntry || chunk.fileName.match(/^index-[a-zA-Z0-9]+\.js$/)) {
        return null;
      }
      let modified = false;
      let newCode = code;
      const importPattern = /import\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
      newCode = newCode.replace(importPattern, (match, quote, specifier) => {
        const isRelativePath = specifier.startsWith("./");
        const isAssetsPath = specifier.startsWith("/assets/");
        if (!isRelativePath && !isAssetsPath) {
          return match;
        }
        modified = true;
        let normalizedPath;
        if (isRelativePath) {
          if (specifier.startsWith("./assets/")) {
            normalizedPath = "/" + specifier.substring(2);
          } else {
            normalizedPath = "/assets/" + specifier.substring(2);
          }
        } else {
          normalizedPath = specifier;
        }
        const isLayoutResource = normalizedPath.includes("/assets/layout/");
        let cdnUrl;
        if (isLayoutResource) {
          cdnUrl = `${cdnDomain}/layout-app${normalizedPath}`;
        } else {
          cdnUrl = `${cdnDomain}/${appName}${normalizedPath}`;
        }
        return `import(${quote}${cdnUrl}${quote})`;
      });
      if (modified) {
        logger15.info(`[cdn-import] \u5DF2\u8F6C\u6362 chunk ${chunk.fileName} \u4E2D\u7684\u52A8\u6001\u5BFC\u5165\u4E3A CDN URL`);
      }
      return modified ? { code: newCode, map: null } : null;
    }
  };
}

// ../../configs/vite/plugins/resolve-external-imports.ts
import { logger as logger16 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";

// ../../configs/vite/plugins/resolve-btc-imports.ts
import { logger as logger17 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
import { existsSync as existsSync6 } from "node:fs";
function resolveBtcImportsPlugin(options) {
  const { appDir, enabled = true } = options;
  if (!enabled) {
    return {
      name: "resolve-btc-imports",
      apply: "build"
    };
  }
  const { withPackages, withRoot, withConfigs } = createPathHelpers(appDir);
  function isFromBuiltPackageOrSharedComponents(importer) {
    if (!importer) return false;
    const isFromBuiltPackage = importer.includes("/dist/") || importer.includes("\\dist\\") || importer.endsWith(".mjs") && !importer.includes("/src/") || importer.endsWith(".js") && !importer.includes("/src/") && !importer.includes("node_modules");
    const isFromSharedComponents = importer.includes("shared-components/src");
    return isFromBuiltPackage || isFromSharedComponents;
  }
  function ensureFileExtension(filePath) {
    if (/\.(ts|tsx|js|jsx|vue|json|css|scss|sass|less)$/i.test(filePath)) {
      return filePath;
    }
    const extensions = [".tsx", ".ts", ".jsx", ".js"];
    for (const ext of extensions) {
      const pathWithExt = `${filePath}${ext}`;
      if (existsSync6(pathWithExt)) {
        return pathWithExt;
      }
    }
    return filePath;
  }
  function resolveSharedComponentsAlias(id) {
    const { withPackages: withPackages2 } = createPathHelpers(appDir);
    if (id === "@btc-components" || id.startsWith("@btc-components/")) {
      const subPath = id.replace("@btc-components/", "");
      const basePath = withPackages2(`shared-components/src/components/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-common" || id.startsWith("@btc-common/")) {
      const subPath = id.replace("@btc-common/", "");
      const basePath = withPackages2(`shared-components/src/common/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-crud" || id.startsWith("@btc-crud/")) {
      const subPath = id.replace("@btc-crud/", "");
      const basePath = withPackages2(`shared-components/src/crud/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-styles" || id.startsWith("@btc-styles/")) {
      const subPath = id.replace("@btc-styles/", "");
      const basePath = withPackages2(`shared-components/src/styles/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-locales" || id.startsWith("@btc-locales/")) {
      const subPath = id.replace("@btc-locales/", "");
      const basePath = withPackages2(`shared-components/src/locales/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-assets" || id.startsWith("@btc-assets/")) {
      const subPath = id.replace("@btc-assets/", "");
      const basePath = withPackages2(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@assets" || id.startsWith("@assets/")) {
      const subPath = id.replace("@assets/", "");
      const basePath = withPackages2(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-utils" || id.startsWith("@btc-utils/")) {
      const subPath = id.replace("@btc-utils/", "");
      const basePath = withPackages2(`shared-components/src/utils/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@plugins" || id.startsWith("@plugins/")) {
      const subPath = id.replace("@plugins/", "");
      const basePath = withPackages2(`shared-components/src/plugins/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils/css-var" || id.startsWith("@charts-utils/css-var/")) {
      const subPath = id.replace("@charts-utils/css-var", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/css-var${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils/color" || id.startsWith("@charts-utils/color/")) {
      const subPath = id.replace("@charts-utils/color", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/color${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils/gradient" || id.startsWith("@charts-utils/gradient/")) {
      const subPath = id.replace("@charts-utils/gradient", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/gradient${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-composables/useChartComponent" || id.startsWith("@charts-composables/useChartComponent/")) {
      const subPath = id.replace("@charts-composables/useChartComponent", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/composables/useChartComponent${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-types" || id.startsWith("@charts-types/")) {
      const subPath = id.replace("@charts-types/", "");
      const basePath = withPackages2(`shared-components/src/charts/types/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils" || id.startsWith("@charts-utils/")) {
      const subPath = id.replace("@charts-utils/", "");
      const basePath = withPackages2(`shared-components/src/charts/utils/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-composables" || id.startsWith("@charts-composables/")) {
      const subPath = id.replace("@charts-composables/", "");
      const basePath = withPackages2(`shared-components/src/charts/composables/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts" || id.startsWith("@charts/")) {
      const subPath = id.replace("@charts/", "");
      const basePath = withPackages2(`shared-components/src/charts/${subPath}`);
      return ensureFileExtension(basePath);
    }
    return null;
  }
  return {
    name: "resolve-btc-imports",
    apply: "build",
    buildStart() {
      logger17.info("[resolve-btc-imports] \u5DF2\u542F\u7528\uFF0C\u5C06\u89E3\u6790\u4ECE\u5DF2\u6784\u5EFA\u5305\u4E2D\u5BFC\u5165\u7684 @btc/* \u6A21\u5757\u548C shared-components \u5185\u90E8\u522B\u540D");
    },
    resolveId(id, importer) {
      const shouldResolve = isFromBuiltPackageOrSharedComponents(importer);
      if (!shouldResolve) {
        return null;
      }
      const sharedComponentsAlias = resolveSharedComponentsAlias(id);
      if (sharedComponentsAlias) {
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 shared-components \u5185\u90E8\u522B\u540D ${id} (\u6765\u81EA ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sharedComponentsAlias.split("/").slice(-3).join("/")}`);
        return sharedComponentsAlias;
      }
      if (id.startsWith("@configs/")) {
        const subPath = id.replace("@configs/", "");
        const sourcePath = withConfigs(subPath);
        const finalPath = ensureFileExtension(sourcePath);
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 @configs \u5305 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${finalPath.split("/").slice(-3).join("/")}`);
        return finalPath;
      }
      if (!id.startsWith("@btc/")) {
        return null;
      }
      if (id === "@btc/shared-components" || id.startsWith("@btc/shared-components/")) {
        const sourcePath = id === "@btc/shared-components" ? withPackages("shared-components/src/index.ts") : withPackages(`shared-components/src/${id.replace("@btc/shared-components/", "")}`);
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      if (id === "@btc/shared-core" || id.startsWith("@btc/shared-core/")) {
        const sourcePath = id === "@btc/shared-core" ? withPackages("shared-core/src/index.ts") : withPackages(`shared-core/src/${id.replace("@btc/shared-core/", "")}`);
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      if (id === "@btc/shared-utils" || id.startsWith("@btc/shared-utils/")) {
        const sourcePath = id === "@btc/shared-utils" ? withPackages("shared-utils/src/index.ts") : withPackages(`shared-utils/src/${id.replace("@btc/shared-utils/", "")}`);
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      if (id === "@btc/shared-plugins" || id.startsWith("@btc/shared-plugins/")) {
        const sourcePath = id === "@btc/shared-plugins" ? withPackages("shared-plugins/src/index.ts") : withPackages(`shared-plugins/src/${id.replace("@btc/shared-plugins/", "")}`);
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return ensureFileExtension(sourcePath);
      }
      if (id === "@btc/i18n" || id.startsWith("@btc/i18n/")) {
        const sourcePath = id === "@btc/i18n" ? withPackages("i18n/src/index.ts") : withPackages(`i18n/src/${id.replace("@btc/i18n/", "")}`);
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return ensureFileExtension(sourcePath);
      }
      if (id === "@btc/auth-shared" || id.startsWith("@btc/auth-shared/")) {
        let sourcePath;
        if (id === "@btc/auth-shared") {
          sourcePath = withRoot("auth/shared/composables/index.ts");
        } else {
          const subPath = id.replace("@btc/auth-shared/", "");
          sourcePath = withRoot(`auth/shared/${subPath}${subPath.includes(".") ? "" : ".ts"}`);
        }
        logger17.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      return null;
    }
  };
}

// ../../configs/vite/factories/subapp.config.ts
var __vite_injected_original_import_meta_url5 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/factories/subapp.config.ts";
var __filename5 = fileURLToPath5(__vite_injected_original_import_meta_url5);
var __dirname5 = dirname4(__filename5);
function getVueI18nPlugin(appDir) {
  const appDirUrl = pathToFileURL(resolve9(appDir, "package.json")).href;
  const require2 = createRequire(appDirUrl);
  const plugin = require2("@intlify/unplugin-vue-i18n/vite");
  return plugin.default || plugin;
}
function createSubAppViteConfig(options) {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy: proxy2 = {},
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true }
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot } = createPathHelpers(appDir);
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  const publicDir = isPreviewBuild ? getPublicDir(appName, appDir) : false;
  const mainAppConfig = getViteAppConfig("main-app");
  const mainAppPort = mainAppConfig.prePort.toString();
  const epsOutputDir = resolve9(appDir, "build", "eps");
  const sharedEpsDir = resolve9(appDir, "../../apps/main-app/build/eps");
  const epsEnable = btcOptions.eps?.enable ?? true;
  const epsConfig = {
    enable: epsEnable,
    dict: btcOptions.eps?.dict ?? true,
    // 默认启用字典功能
    dictApi: btcOptions.eps?.dictApi || "/api/system/auth/dict",
    // 默认字典接口
    dist: epsOutputDir,
    sharedEpsDir
  };
  const plugins = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 解析 @btc/* 包导入插件（在 Logo 插件之前，确保能够解析从已构建包中导入的 @btc/* 模块）
    resolveBtcImportsPlugin({ appDir }),
    // 4. Logo 路径解析插件（在自定义插件之前，确保 /logo.png 能被正确解析）
    resolveLogoPlugin(appDir),
    // 4.5. Locales 静态文件插件（提供 src/locales/*.json 文件，供主应用通过 fetch 加载）
    localesStaticPlugin(appDir),
    // 5. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync7,
          readFile: (file) => readFileSync4(file, "utf-8")
        }
      }
    }),
    // 4.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    vueJsx(),
    // 5. 自动导入插件
    createAutoImportConfig(),
    // 6. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 7. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 8. BTC 业务插件
    btc({
      type: "subapp",
      proxy: proxy2,
      eps: epsConfig,
      // 类型断言：确保 enable 始终为 boolean
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      ...btcOptions
    }),
    // 9. VueI18n 插件
    getVueI18nPlugin(appDir)({
      include: vueI18nOptions?.include || [
        resolve9(appDir, "src/locales/**")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 10. CSS 验证插件
    ensureCssPlugin(),
    // 11. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 12. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 15. 确保 base URL 插件
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 16. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 16.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 处理 HTML 中的资源 URL（<script>、<link>、<img> 等）
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 16.6. CDN 动态导入转换插件（转换代码中的 import() 调用）
    // 将相对路径转换为 CDN URL，与 cdnAssetsPlugin 配合实现完整的 CDN 加速
    cdnImportPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 16.7. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
    // 注意：不再需要 resolveExternalImportsPlugin，因为所有应用都打包 @btc/* 包
    // 17. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 18. Chunk 验证插件
    chunkVerifyPlugin(),
    // 19. CDN 上传插件（仅在生产构建且启用时）
    ...process.env.ENABLE_CDN_UPLOAD === "true" && !isPreviewBuild ? [uploadCdnPlugin(appName, appDir)] : []
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    assetsInlineLimit: 10 * 1024,
    outDir: process.env.BUILD_OUT_DIR || "dist",
    assetsDir: "assets",
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    // 所有应用都打包 @btc/* 包和 @configs 包，避免运行时模块解析问题
    rollupOptions: createRollupConfig(appName, {
      externalBtcPackages: false,
      // 显式设置为 false，打包 @btc/* 包
      externalConfigsPackages: false
      // 显式设置为 false，打包 @configs 包
    }),
    chunkSizeWarningLimit: 1e3,
    ...customBuild
  };
  const finalProxy = customServer?.proxy !== void 0 ? customServer.proxy : proxy2;
  const { proxy: _customProxy, ...restCustomServer } = customServer || {};
  const serverConfig = {
    port: appConfig.devPort,
    host: "0.0.0.0",
    strictPort: true,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    },
    hmr: {
      host: appConfig.devHost,
      port: appConfig.devPort,
      overlay: false
    },
    proxy: finalProxy,
    fs: {
      strict: false,
      allow: [
        withRoot(".")
      ],
      cachedChecks: true
    },
    ...restCustomServer
  };
  const rootDistDir = resolve9(appDir, "../../dist");
  const previewRoot = resolve9(rootDistDir, appConfig.prodHost);
  const previewConfig = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: "0.0.0.0",
    proxy: proxy2,
    headers: {
      "Access-Control-Allow-Origin": appConfig.mainAppOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  previewConfig.root = previewRoot;
  const appCacheDir = resolve9(appDir, "node_modules/.vite");
  const optimizeDepsConfig = {
    include: [
      // 核心依赖：所有应用都安装的依赖
      "vue",
      "vue-router",
      "pinia",
      "element-plus",
      "element-plus/es",
      "element-plus/es/locale/lang/zh-cn",
      "element-plus/es/locale/lang/en",
      "element-plus/es/components/cascader/style/css",
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
      // 关键：这些依赖现在已经在所有应用的 package.json 中声明
      // 通过 @btc/shared-components 间接使用，但需要在应用中显式声明以便 Vite 正确解析
      "lodash-es",
      "chardet",
      "xlsx",
      "vue-i18n",
      // 关键：echarts 相关依赖需要被预构建
      // 虽然只在部分应用中使用，但添加到 include 中可以避免运行时优化
      // 如果应用未安装这些依赖，Vite 会忽略它们（不会报错）
      "echarts/core",
      "echarts",
      "vue-echarts"
    ],
    // 排除不应该被优化的依赖
    // 注意：exclude 使用包名或文件路径模式
    exclude: [
      // 关键：@btc/shared-core/configs/layout-bridge 是本地别名路径，不是 npm 包，不应该被优化
      // 注意：exclude 只支持字符串模式，不支持正则表达式
      "@btc/shared-core/configs/layout-bridge",
      // 关键：排除 @btc/shared-components，因为它是本地包，包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // 这样可以避免 JSX 解析问题
      "@btc/shared-components"
    ],
    // 关键：设置为 true，强制重新构建所有依赖，确保所有依赖都被预构建
    // 这会在首次启动时构建所有依赖，之后就不会再触发了
    force: false,
    // 关键：参考 cool-admin 的做法
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    // shared-components 中的依赖（如 lunr, chardet 等）会在运行时被自动发现和优化
    entries: [
      // 应用的入口文件
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
    },
    ...customOptimizeDeps
  };
  const cssConfig = {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    },
    devSourcemap: false,
    ...customCss
  };
  const baseResolve = createBaseResolve(appDir, appName);
  const shouldUseSharedEps = process.env.NODE_ENV === "production" || isPreviewBuild;
  const sharedEpsStub = resolve9(appDir, "../../configs/vite/stubs/virtual-eps-empty.ts");
  const finalResolve = shouldUseSharedEps ? {
    ...baseResolve,
    // 关键：保持别名数组形式，添加 virtual:eps 别名
    alias: Array.isArray(baseResolve?.alias) ? [
      ...baseResolve.alias,
      {
        find: "virtual:eps",
        replacement: sharedEpsStub
      }
    ] : {
      ...baseResolve?.alias || {},
      "virtual:eps": sharedEpsStub
    }
  } : baseResolve;
  const config = {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    // 虽然这会增加一些存储空间，但可以确保每个应用的缓存状态一致，避免频繁重新构建
    cacheDir: appCacheDir,
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
    optimizeDeps: optimizeDepsConfig,
    css: cssConfig,
    build: buildConfig
  };
  if (finalResolve !== void 0) {
    config.resolve = finalResolve;
  }
  return config;
}

// ../admin-app/src/config/proxy.ts
import { logger as logger18 } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
var proxy = {
  "/api": {
    target: "http://10.80.9.76:8115",
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 处理响应头，添加 CORS 头
    configure: (proxy2, options) => {
      proxy2.on("proxyRes", (proxyRes, req, res) => {
        const origin = req.headers.origin || "*";
        if (proxyRes.headers) {
          proxyRes.headers["Access-Control-Allow-Origin"] = origin;
          proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
          proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
          const requestHeaders = req.headers["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id";
          proxyRes.headers["Access-Control-Allow-Headers"] = requestHeaders;
          const setCookieHeader = proxyRes.headers["set-cookie"];
          if (setCookieHeader) {
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            const fixedCookies = cookies.map((cookie) => {
              if (!cookie.includes("SameSite=None")) {
                let fixedCookie = cookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, "");
                fixedCookie += "; SameSite=None; Secure";
                return fixedCookie;
              }
              return cookie;
            });
            proxyRes.headers["set-cookie"] = fixedCookies;
          }
        }
        if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
          logger18.error(`[Proxy] Backend returned ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        }
      });
      proxy2.on("error", (err, req, res) => {
        logger18.error("[Proxy] Error:", err.message);
        logger18.error("[Proxy] Request URL:", req.url);
        logger18.error("[Proxy] Target:", "http://10.80.9.76:8115");
        if (res && !res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": req.headers.origin || "*"
          });
          res.end(JSON.stringify({
            code: 500,
            message: "Proxy error: Unable to connect to backend server http://10.80.9.76:8115",
            error: err.message
          }));
        }
      });
      proxy2.on("proxyReq", (proxyReq, req, res) => {
        logger18.info(`[Proxy] ${req.method} ${req.url} -> http://10.80.9.76:8115${req.url}`);
      });
    }
  }
};

// vite.config.ts
var __vite_injected_original_import_meta_url6 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/engineering-app/vite.config.ts";
var vite_config_default = defineConfig(
  createSubAppViteConfig({
    appName: "engineering-app",
    appDir: fileURLToPath6(new URL(".", __vite_injected_original_import_meta_url6)),
    qiankunName: "engineering",
    customServer: { proxy },
    proxy
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2Vudi9pbmRleC50cyIsICIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvdXRpbHMvbG9nZ2VyL3RyYW5zcG9ydHMudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL3V0aWxzL2xvZ2dlci9waW5vLWNvbmZpZy50cyIsICIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvdXRpbHMvem9kL3JlcG9ydGluZy50cyIsICIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9zY2hlbWFzLnRzIiwgIi4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1jb25maWdzLWNvbGxlY3RlZC50cyIsICIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9hcHAtc2Nhbm5lci50cyIsICIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy91bmlmaWVkLWVudi1jb25maWcudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL3V0aWxzL2Vudi1pbmZvLnRzIiwgIi4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy91dGlscy9sb2dnZXIvaW5kZXgudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9zdWJhcHAuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcm9sbHVwLWNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jaHVuay50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9wdWJsaWMtaW1hZ2VzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtbG9nby50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jb3B5LWljb25zLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1pY29ucy10by1vc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcmVwbGFjZS1pY29ucy13aXRoLWNkbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9kdXR5LXN0YXRpYy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9sb2NhbGVzLXN0YXRpYy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtY2RuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2Nkbi1hc3NldHMudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWltcG9ydC50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWV4dGVybmFsLWltcG9ydHMudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcmVzb2x2ZS1idGMtaW1wb3J0cy50cyIsICIuLi9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXGVudlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcZW52XFxcXGluZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9lbnYvaW5kZXgudHNcIjsvKipcbiAqIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OUE4Q1x1OEJDMVx1NTQ4Q1x1N0M3Qlx1NTc4Qlx1NUI5QVx1NEU0OVxuICogXHU0RjdGXHU3NTI4IFpvZCBcdThGREJcdTg4NENcdThGRDBcdTg4NENcdTY1RjZcdTlBOENcdThCQzFcdUZGMENcdTc4NkVcdTRGRERcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTdDN0JcdTU3OEJcdTVCODlcdTUxNjhcbiAqL1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbi8vIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRiBTY2hlbWFcbmNvbnN0IGVudlNjaGVtYSA9IHoub2JqZWN0KHtcbiAgLy8gTm9kZSBcdTczQUZcdTU4ODNcbiAgTk9ERV9FTlY6IHouZW51bShbJ2RldmVsb3BtZW50JywgJ3Rlc3QnLCAncHJvZHVjdGlvbiddKS5kZWZhdWx0KCdkZXZlbG9wbWVudCcpLFxuICBNT0RFOiB6LmVudW0oWydkZXZlbG9wbWVudCcsICdwcmV2aWV3JywgJ3Byb2R1Y3Rpb24nXSkuZGVmYXVsdCgnZGV2ZWxvcG1lbnQnKSxcblxuICAvLyBcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAgVklURV9BUFBfVElUTEU6IHouc3RyaW5nKCkuZGVmYXVsdCgnQlRDIFNob3BGbG93JyksXG4gIFZJVEVfQVBQX0JBU0VfQVBJOiB6LnN0cmluZygpLnVybCgpLm9wdGlvbmFsKCksXG4gIFZJVEVfQVBQX1VQTE9BRF9VUkw6IHouc3RyaW5nKCkudXJsKCkub3B0aW9uYWwoKSxcbiAgVklURV9ET0NTX1VSTDogei5zdHJpbmcoKS51cmwoKS5vcHRpb25hbCgpLFxuICBWSVRFX0FQUF9XU19VUkw6IHouc3RyaW5nKCkudXJsKCkub3B0aW9uYWwoKSxcblxuICAvLyBcdTdBRUZcdTUzRTNcdTkxNERcdTdGNkVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDlcbiAgVklURV9QT1JUOiB6LnN0cmluZygpLnJlZ2V4KC9eXFxkKyQvKS50cmFuc2Zvcm0oTnVtYmVyKS5vcHRpb25hbCgpLFxuICBQT1JUOiB6LnN0cmluZygpLnJlZ2V4KC9eXFxkKyQvKS50cmFuc2Zvcm0oTnVtYmVyKS5vcHRpb25hbCgpLFxuXG4gIC8vIFx1NTE3Nlx1NEVENiBWaXRlIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICBWSVRFX1BSRVZJRVc6IHouc3RyaW5nKCkudHJhbnNmb3JtKCh2YWwpID0+IHZhbCA9PT0gJ3RydWUnKS5vcHRpb25hbCgpLFxufSkucGFzc3Rocm91Z2goKTsgLy8gXHU1MTQxXHU4QkI4XHU1MTc2XHU0RUQ2XHU2NzJBXHU1QjlBXHU0RTQ5XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG5cbi8vIFx1N0M3Qlx1NTc4Qlx1NUI5QVx1NEU0OVxuZXhwb3J0IHR5cGUgRW52ID0gei5pbmZlcjx0eXBlb2YgZW52U2NoZW1hPjtcblxuLy8gXHU5QThDXHU4QkMxXHU1RTc2XHU1QkZDXHU1MUZBXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG5sZXQgZW52OiBFbnY7XG5cbnRyeSB7XG4gIC8vIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NEY3Rlx1NzUyOCBpbXBvcnQubWV0YS5lbnZcbiAgLy8gXHU1NzI4IE5vZGUgXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU0RjdGXHU3NTI4IHByb2Nlc3MuZW52XG4gIGNvbnN0IHJhd0VudiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnIFxuICAgID8gKGltcG9ydC5tZXRhIGFzIGFueSkuZW52IFxuICAgIDogcHJvY2Vzcy5lbnY7XG5cbiAgZW52ID0gZW52U2NoZW1hLnBhcnNlKHJhd0Vudik7XG59IGNhdGNoIChlcnJvcikge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiB6LlpvZEVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKCdcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTlBOENcdThCQzFcdTU5MzFcdThEMjU6JywgZXJyb3IuZXJyb3JzKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OTE0RFx1N0Y2RVx1OTUxOVx1OEJFRjogJHtlcnJvci5lcnJvcnMubWFwKGUgPT4gYCR7ZS5wYXRoLmpvaW4oJy4nKX06ICR7ZS5tZXNzYWdlfWApLmpvaW4oJywgJyl9YCk7XG4gIH1cbiAgdGhyb3cgZXJyb3I7XG59XG5cbi8vIFx1NUJGQ1x1NTFGQVx1OUE4Q1x1OEJDMVx1NTQwRVx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuZXhwb3J0IHsgZW52IH07XG5cbi8vIFx1NEZCRlx1NjM3N1x1OEJCRlx1OTVFRVx1NTFGRFx1NjU3MFxuZXhwb3J0IGNvbnN0IGdldEVudiA9ICgpID0+IGVudjtcblxuLy8gXHU3M0FGXHU1ODgzXHU1MjI0XHU2NUFEXHU1MUZEXHU2NTcwXG5leHBvcnQgY29uc3QgaXNEZXZlbG9wbWVudCA9ICgpID0+IGVudi5NT0RFID09PSAnZGV2ZWxvcG1lbnQnIHx8IGVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JztcbmV4cG9ydCBjb25zdCBpc1Byb2R1Y3Rpb24gPSAoKSA9PiBlbnYuTU9ERSA9PT0gJ3Byb2R1Y3Rpb24nIHx8IGVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xuZXhwb3J0IGNvbnN0IGlzUHJldmlldyA9ICgpID0+IGVudi5NT0RFID09PSAncHJldmlldyc7XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcdXRpbHNcXFxcbG9nZ2VyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFx1dGlsc1xcXFxsb2dnZXJcXFxcdHJhbnNwb3J0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvdXRpbHMvbG9nZ2VyL3RyYW5zcG9ydHMudHNcIjsvKipcbiAqIFx1NjVFNVx1NUZEN1x1NEYyMFx1OEY5M1x1NTY2OFxuICogXHU5NkM2XHU2MjEwXHU3M0IwXHU2NzA5XHU3Njg0IHJlcXVlc3QtbG9nZ2VyXHVGRjBDXHU1QzA2IFBpbm8gXHU2NUU1XHU1RkQ3XHU0RTBBXHU2MkE1XHU1MjMwXHU1NDBFXHU3QUVGXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBMb2dDb250ZXh0IH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogXHU5NzAwXHU4OTgxXHU4RkM3XHU2RUU0XHU3Njg0XHU2M0E1XHU1M0UzXHU4REVGXHU1Rjg0XHVGRjA4XHU0RTBEXHU4QkIwXHU1RjU1XHU4RkQ5XHU0RTlCXHU2M0E1XHU1M0UzXHU3Njg0XHU2NUU1XHU1RkQ3XHVGRjA5XG4gKi9cbmNvbnN0IEZJTFRFUkVEX1BBVEhTID0gW1xuICAnL2xvZ2luJyxcbiAgJy9yZWdpc3RlcicsXG4gICcvY2FwdGNoYScsXG4gICcvY29kZS9zbXMvc2VuZCcsXG4gICcvY29kZS9lbWFpbC9zZW5kJyxcbiAgJy9yZWZyZXNoLXRva2VuJyxcbiAgJy9yZWZyZXNoL2FjY2Vzcy10b2tlbicsXG4gICcvbG9nb3V0JyxcbiAgJy91cGxvYWQnLFxuICAnL2FwaS9zeXN0ZW0vbG9nL3N5cy9yZXF1ZXN0L3VwZGF0ZScsIC8vIFx1OEZDN1x1NkVFNFx1OEJGN1x1NkM0Mlx1NjVFNVx1NUZEN1x1NjZGNFx1NjVCMFx1NjNBNVx1NTNFM1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1OEJCMFx1NUY1NVxuICAnL2FwaS9zeXN0ZW0vbG9nL3N5cy9vcGVyYXRpb24vdXBkYXRlJywgLy8gXHU4RkM3XHU2RUU0XHU2NENEXHU0RjVDXHU2NUU1XHU1RkQ3XHU2NkY0XHU2NUIwXHU2M0E1XHU1M0UzXG5dO1xuXG4vKipcbiAqIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1OTcwMFx1ODk4MVx1OEJCMFx1NUY1NVx1NjVFNVx1NUZEN1xuICovXG5mdW5jdGlvbiBzaG91bGRMb2codXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCF1cmwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBcdThGQzdcdTZFRTRcdTUxODVcdTkwRThcdThENDRcdTZFOTBcdUZGMDhcdTU5ODJcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdUZGMDlcbiAgaWYgKFxuICAgIHVybC5pbmNsdWRlcygnLmh0bWwnKSB8fFxuICAgIHVybC5pbmNsdWRlcygnLmpzJykgfHxcbiAgICB1cmwuaW5jbHVkZXMoJy5jc3MnKSB8fFxuICAgIHVybC5pbmNsdWRlcygnLmpzb24nKSB8fFxuICAgIHVybC5pbmNsdWRlcygnLnBuZycpIHx8XG4gICAgdXJsLmluY2x1ZGVzKCcuanBnJykgfHxcbiAgICB1cmwuaW5jbHVkZXMoJy5qcGVnJykgfHxcbiAgICB1cmwuaW5jbHVkZXMoJy5naWYnKSB8fFxuICAgIHVybC5pbmNsdWRlcygnLnN2ZycpIHx8XG4gICAgdXJsLmluY2x1ZGVzKCcuaWNvJylcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gXHU1M0VBXHU4QkIwXHU1RjU1XHU0RTFBXHU1MkExXHU2M0E1XHU1M0UzXHVGRjA4XHU0RUU1IC9hcGkvIFx1NUYwMFx1NTkzNFx1NzY4NFx1OEJGN1x1NkM0Mlx1RkYwOVxuICBpZiAoIXVybC5zdGFydHNXaXRoKCcvYXBpLycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gXHU4RkM3XHU2RUU0XHU2NTRGXHU2MTFGXHU2M0E1XHU1M0UzXG4gIHJldHVybiAhRklMVEVSRURfUEFUSFMuc29tZSgocGF0aCkgPT4gdXJsLmluY2x1ZGVzKHBhdGgpKTtcbn1cblxuLyoqXG4gKiBcdThGQzdcdTZFRTRcdTY1NEZcdTYxMUZcdTUzQzJcdTY1NzBcbiAqL1xuZnVuY3Rpb24gZmlsdGVyU2Vuc2l0aXZlUGFyYW1zKHBhcmFtczogYW55KTogYW55IHtcbiAgaWYgKCFwYXJhbXMgfHwgdHlwZW9mIHBhcmFtcyAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgY29uc3Qgc2Vuc2l0aXZlS2V5cyA9IFsncGFzc3dvcmQnLCAndG9rZW4nLCAnc2VjcmV0JywgJ2tleScsICdhdXRob3JpemF0aW9uJ107XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xuICAgIHJldHVybiBwYXJhbXMubWFwKChpdGVtKSA9PiBmaWx0ZXJTZW5zaXRpdmVQYXJhbXMoaXRlbSkpO1xuICB9XG5cbiAgY29uc3QgZmlsdGVyZWQ6IGFueSA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbXMpIHtcbiAgICBjb25zdCBsb3dlcktleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChzZW5zaXRpdmVLZXlzLnNvbWUoKHMpID0+IGxvd2VyS2V5LmluY2x1ZGVzKHMpKSkge1xuICAgICAgZmlsdGVyZWRba2V5XSA9ICcqKionO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWx0ZXJlZFtrZXldID0gZmlsdGVyU2Vuc2l0aXZlUGFyYW1zKHBhcmFtc1trZXldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmlsdGVyZWQ7XG59XG5cbi8qKlxuICogXHU1QzA2IFBpbm8gXHU2NUU1XHU1RkQ3XHU1QkY5XHU4QzYxXHU4RjZDXHU2MzYyXHU0RTNBIHJlcXVlc3QtbG9nZ2VyIFx1NjgzQ1x1NUYwRlxuICovXG5mdW5jdGlvbiBjb252ZXJ0UGlub0xvZ1RvUmVxdWVzdExvZyhcbiAgbG9nT2JqZWN0OiBhbnksXG4gIGNvbnRleHQ/OiBMb2dDb250ZXh0XG4pOiBhbnkge1xuICAvLyBcdTYzRDBcdTUzRDZcdTY1RTVcdTVGRDdcdTRGRTFcdTYwNkZcbiAgY29uc3QgbGV2ZWwgPSBsb2dPYmplY3QubGV2ZWwgfHwgMzA7IC8vIFx1OUVEOFx1OEJBNCBpbmZvXG4gIGNvbnN0IG1lc3NhZ2UgPSBsb2dPYmplY3QubXNnIHx8IGxvZ09iamVjdC5tZXNzYWdlIHx8ICcnO1xuICBjb25zdCB0aW1lID0gbG9nT2JqZWN0LnRpbWUgfHwgRGF0ZS5ub3coKTtcbiAgY29uc3QgbWV0YWRhdGEgPSB7IC4uLmxvZ09iamVjdCB9O1xuICBkZWxldGUgbWV0YWRhdGEubGV2ZWw7XG4gIGRlbGV0ZSBtZXRhZGF0YS5tc2c7XG4gIGRlbGV0ZSBtZXRhZGF0YS5tZXNzYWdlO1xuICBkZWxldGUgbWV0YWRhdGEudGltZTtcbiAgZGVsZXRlIG1ldGFkYXRhLnBpZDtcbiAgZGVsZXRlIG1ldGFkYXRhLmhvc3RuYW1lO1xuXG4gIC8vIFx1NEVDRVx1NEUwQVx1NEUwQlx1NjU4N1x1NjIxNiBtZXRhZGF0YSBcdTRFMkRcdTYzRDBcdTUzRDZcdTc1MjhcdTYyMzdcdTRGRTFcdTYwNkZcbiAgY29uc3QgdXNlcklkID0gY29udGV4dD8udXNlcklkIHx8IG1ldGFkYXRhLnVzZXJJZCB8fCBtZXRhZGF0YS51c2VyX2lkO1xuICBjb25zdCB1c2VybmFtZSA9IGNvbnRleHQ/LnVzZXJuYW1lIHx8IG1ldGFkYXRhLnVzZXJuYW1lO1xuICBjb25zdCByZXF1ZXN0VXJsID0gbWV0YWRhdGEucmVxdWVzdFVybCB8fCBtZXRhZGF0YS51cmwgfHwgbWV0YWRhdGEucGF0aCB8fCAnJztcbiAgY29uc3QgaXAgPSBjb250ZXh0Py5pcCB8fCBtZXRhZGF0YS5pcDtcbiAgY29uc3QgZHVyYXRpb24gPSBtZXRhZGF0YS5kdXJhdGlvbiB8fCAwO1xuICBjb25zdCBzdGF0dXMgPSBtZXRhZGF0YS5zdGF0dXMgfHwgKGxldmVsID49IDUwID8gJ2ZhaWxlZCcgOiAnc3VjY2VzcycpO1xuXG4gIC8vIFx1OEZDN1x1NkVFNFx1NjU0Rlx1NjExRlx1NTNDMlx1NjU3MFxuICBjb25zdCBwYXJhbXMgPSBmaWx0ZXJTZW5zaXRpdmVQYXJhbXMobWV0YWRhdGEucGFyYW1zIHx8IG1ldGFkYXRhKTtcblxuICAvLyBcdThGNkNcdTYzNjJcdTRFM0EgcmVxdWVzdC1sb2dnZXIgXHU2ODNDXHU1RjBGXG4gIHJldHVybiB7XG4gICAgdXNlcklkOiB1c2VySWQgPyBOdW1iZXIodXNlcklkKSA6IHVuZGVmaW5lZCxcbiAgICB1c2VybmFtZTogdXNlcm5hbWUgfHwgJ3Vua25vd24nLFxuICAgIHJlcXVlc3RVcmw6IHJlcXVlc3RVcmwgfHwgJy91bmtub3duJyxcbiAgICBwYXJhbXM6IHR5cGVvZiBwYXJhbXMgPT09ICdzdHJpbmcnID8gcGFyYW1zIDogSlNPTi5zdHJpbmdpZnkocGFyYW1zKSxcbiAgICBpcCxcbiAgICBkdXJhdGlvbjogTnVtYmVyKGR1cmF0aW9uKSB8fCAwLFxuICAgIHN0YXR1czogc3RhdHVzIGFzICdzdWNjZXNzJyB8ICdmYWlsZWQnLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUodGltZSkudG9JU09TdHJpbmcoKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTY1RTVcdTVGRDdcdTRGMjBcdThGOTNcdTU2NjhcdTk2MUZcdTUyMTdcdTdCQTFcdTc0MDZcdTU2NjhcbiAqIFx1NTkwRFx1NzUyOCByZXF1ZXN0LWxvZ2dlciBcdTc2ODRcdTYyNzlcdTkxQ0ZcdTUzRDFcdTkwMDFcdTkwM0JcdThGOTFcbiAqL1xuY2xhc3MgTG9nVHJhbnNwb3J0UXVldWUge1xuICBwcml2YXRlIHF1ZXVlOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIHRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IEJBVENIX1NJWkUgPSAxMDA7IC8vIFx1NjI3OVx1OTFDRlx1NTNEMVx1OTAwMVx1NTkyN1x1NUMwRlxuICBwcml2YXRlIHJlYWRvbmx5IEJBVENIX0lOVEVSVkFMID0gMTgwMDAwOyAvLyBcdTYyNzlcdTkxQ0ZcdTUzRDFcdTkwMDFcdTk1RjRcdTk2OTRcdUZGMDgxODBcdTc5RDJcdUZGMDlcbiAgcHJpdmF0ZSByZWFkb25seSBNQVhfUVVFVUVfU0laRSA9IDEwMDA7IC8vIFx1NjcwMFx1NTkyN1x1OTYxRlx1NTIxN1x1OTU3Rlx1NUVBNlxuICBwcml2YXRlIGlzU2VydmljZUF2YWlsYWJsZSA9IHRydWU7XG4gIHByaXZhdGUgaXNQYXVzZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSByZWFkb25seSBRUFNfTElNSVQgPSAyOyAvLyBcdTZCQ0ZcdTc5RDJcdTY3MDBcdTU5MUFcdTUzRDFcdTkwMDEyXHU2QjIxXHU4QkY3XHU2QzQyXG4gIHByaXZhdGUgbGFzdFNlbmRUaW1lID0gMDtcblxuICAvKipcbiAgICogXHU2REZCXHU1MkEwXHU2NUU1XHU1RkQ3XHU1MjMwXHU5NjFGXHU1MjE3XG4gICAqL1xuICBhZGQobG9nSXRlbTogYW55KSB7XG4gICAgLy8gXHU2OEMwXHU2N0U1XHU5NjFGXHU1MjE3XHU5NTdGXHU1RUE2XHVGRjBDXHU5NjMyXHU2QjYyXHU1MTg1XHU1QjU4XHU2RUEyXHU1MUZBXG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID49IHRoaXMuTUFYX1FVRVVFX1NJWkUpIHtcbiAgICAgIC8vIFx1NzlGQlx1OTY2NFx1NjcwMFx1NjVFN1x1NzY4NFx1NjVFNVx1NUZEN1xuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgIH1cblxuICAgIHRoaXMucXVldWUucHVzaChsb2dJdGVtKTtcblxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjcwRFx1NTJBMVx1NTNFRlx1NzUyOFx1NEUxNFx1NjcyQVx1NjY4Mlx1NTA1Q1x1RkYwQ1x1NUMxRFx1OEJENVx1NTNEMVx1OTAwMVxuICAgIGlmICh0aGlzLmlzU2VydmljZUF2YWlsYWJsZSAmJiAhdGhpcy5pc1BhdXNlZCkge1xuICAgICAgdGhpcy50cnlGbHVzaCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDEgJiYgIXRoaXMudGltZXIpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjcwRFx1NTJBMVx1NEUwRFx1NTNFRlx1NzUyOFx1NEUxNFx1NkNBMVx1NjcwOVx1NUI5QVx1NjVGNlx1NTY2OFx1NTcyOFx1OEZEMFx1ODg0Q1x1RkYwQ1x1NTQyRlx1NTJBOFx1NUI5QVx1NjVGNlx1NTY2OFx1N0I0OVx1NUY4NVx1NjcwRFx1NTJBMVx1NjA2Mlx1NTkwRFxuICAgICAgdGhpcy5zdGFydFRpbWVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NUMxRFx1OEJENVx1NTNEMVx1OTAwMVx1RkYwOFx1NUUyNlFQU1x1OTY1MFx1NTIzNlx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSB0cnlGbHVzaCgpIHtcbiAgICAvLyBcdTY4QzBcdTY3RTVRUFNcdTk2NTBcdTUyMzZcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RTZW5kID0gbm93IC0gdGhpcy5sYXN0U2VuZFRpbWU7XG4gICAgY29uc3QgbWluSW50ZXJ2YWwgPSAxMDAwIC8gdGhpcy5RUFNfTElNSVQ7IC8vIFx1NjcwMFx1NUMwRlx1OTVGNFx1OTY5NFx1NjVGNlx1OTVGNFxuXG4gICAgaWYgKHRpbWVTaW5jZUxhc3RTZW5kIDwgbWluSW50ZXJ2YWwpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OERERFx1NzlCQlx1NEUwQVx1NkIyMVx1NTNEMVx1OTAwMVx1NjVGNlx1OTVGNFx1NTkyQVx1NzdFRFx1RkYwQ1x1NUVGNlx1OEZERlx1NTNEMVx1OTAwMVxuICAgICAgY29uc3QgZGVsYXkgPSBtaW5JbnRlcnZhbCAtIHRpbWVTaW5jZUxhc3RTZW5kO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmx1c2goKTtcbiAgICAgIH0sIGRlbGF5KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdThGQkVcdTUyMzBcdTYyNzlcdTkxQ0ZcdTU5MjdcdTVDMEZcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPj0gdGhpcy5CQVRDSF9TSVpFKSB7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDAgJiYgIXRoaXMudGltZXIpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTYxRlx1NTIxN1x1NjcwOVx1NjU3MFx1NjM2RVx1NEY0Nlx1NjcyQVx1OEZCRVx1NTIzMFx1NjI3OVx1OTFDRlx1NTkyN1x1NUMwRlx1RkYwQ1x1NEUxNFx1NkNBMVx1NjcwOVx1NUI5QVx1NjVGNlx1NTY2OFx1NTcyOFx1OEZEMFx1ODg0Q1x1RkYwQ1x1NTQyRlx1NTJBOFx1NUI5QVx1NjVGNlx1NTY2OFxuICAgICAgdGhpcy5zdGFydFRpbWVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NjI3OVx1OTFDRlx1NTNEMVx1OTAwMVx1NjVFNVx1NUZEN1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBmbHVzaCgpIHtcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTU5ODJcdTY3OUNcdTY3MERcdTUyQTFcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENcdTY2ODJcdTUwNUNcdTUzRDFcdTkwMDFcbiAgICBpZiAoIXRoaXMuaXNTZXJ2aWNlQXZhaWxhYmxlKSB7XG4gICAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3RhcnRUaW1lcigpOyAvLyBcdTdFRTdcdTdFRURcdTdCNDlcdTVGODVcdTY3MERcdTUyQTFcdTYwNjJcdTU5MERcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dzVG9TZW5kID0gWy4uLnRoaXMucXVldWVdO1xuXG4gICAgaWYgKHRoaXMudGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBcdTRFQ0VcdTUxNjhcdTVDNDBcdTgzQjdcdTUzRDYgc2VydmljZVxuICAgICAgY29uc3Qgc2VydmljZSA9XG4gICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gKHdpbmRvdyBhcyBhbnkpLl9fQlRDX1NFUlZJQ0VfXyA6IG51bGw7XG5cbiAgICAgIGlmICghc2VydmljZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZpY2Ugbm90IGluaXRpYWxpemVkLCBjYW5ub3Qgc2VuZCBsb2dzJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjcwRFx1NTJBMVx1NjYyRlx1NTQyNlx1NTNFRlx1NzUyOFxuICAgICAgaWYgKCFzZXJ2aWNlPy5hZG1pbj8ubG9nPy5zeXM/LnJlcXVlc3Q/LnVwZGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVlc3QgbG9nIHNlcnZpY2UgdW5hdmFpbGFibGUnKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU2Mjc5XHU5MUNGXHU1M0QxXHU5MDAxXHVGRjFBXHU1QzA2XHU2MjQwXHU2NzA5XHU2NUU1XHU1RkQ3XHU0RjVDXHU0RTNBXHU2NTcwXHU3RUM0XHU0RTAwXHU2QjIxXHU2MDI3XHU1M0QxXHU5MDAxXG4gICAgICBhd2FpdCBzZXJ2aWNlLmFkbWluLmxvZy5zeXMucmVxdWVzdC51cGRhdGUobG9nc1RvU2VuZCk7XG5cbiAgICAgIC8vIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1RkYwQ1x1OTFDRFx1N0Y2RVx1NzJCNlx1NjAwMVxuICAgICAgdGhpcy5pc1NlcnZpY2VBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5sYXN0U2VuZFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAvLyBcdTZFMDVcdTdBN0FcdTk2MUZcdTUyMTdcdUZGMDhcdTUzRUFcdTZFMDVcdTdBN0FcdTVERjJcdTUzRDFcdTkwMDFcdTc2ODRcdTkwRThcdTUyMDZcdUZGMDlcbiAgICAgIHRoaXMucXVldWUgPSB0aGlzLnF1ZXVlLnNsaWNlKGxvZ3NUb1NlbmQubGVuZ3RoKTtcblxuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4RkQ4XHU2NzA5XHU1MjY5XHU0RjU5XHU2NUU1XHU1RkQ3XHVGRjBDXHU3RUU3XHU3RUVEXHU1QzFEXHU4QkQ1XHU1M0QxXHU5MDAxXG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMudHJ5Rmx1c2goKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gXHU1M0QxXHU5MDAxXHU1OTMxXHU4RDI1XHVGRjBDXHU2NjgyXHU1MDVDXHU1M0QxXHU5MDAxXG4gICAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNTZXJ2aWNlQXZhaWxhYmxlID0gZmFsc2U7XG5cbiAgICAgIC8vIDVcdTUyMDZcdTk0OUZcdTU0MEVcdTkxQ0RcdTY1QjBcdTVDMURcdThCRDVcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmlzU2VydmljZUF2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRoaXMudHJ5Rmx1c2goKTtcbiAgICAgICAgfVxuICAgICAgfSwgNSAqIDYwICogMTAwMCk7IC8vIDVcdTUyMDZcdTk0OUZcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU1NDJGXHU1MkE4XHU1QjlBXHU2NUY2XHU1NjY4XG4gICAqL1xuICBwcml2YXRlIHN0YXJ0VGltZXIoKSB7XG4gICAgaWYgKHRoaXMudGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICB9XG5cbiAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBcdTVCOUFcdTY1RjZcdTU2NjhcdTg5RTZcdTUzRDFcdTY1RjZcdUZGMENcdTc2RjRcdTYzQTVcdTUzRDFcdTkwMDFcdTk2MUZcdTUyMTdcdTRFMkRcdTc2ODRcdTY1RTVcdTVGRDdcdUZGMENcdTRFMERcdTdCQTFcdTY2MkZcdTU0MjZcdThGQkVcdTUyMzBcdTYyNzlcdTkxQ0ZcdTU5MjdcdTVDMEZcbiAgICAgIGlmICh0aGlzLmlzU2VydmljZUF2YWlsYWJsZSAmJiAhdGhpcy5pc1BhdXNlZCAmJiB0aGlzLnF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NzBEXHU1MkExXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDXHU3RUU3XHU3RUVEXHU3QjQ5XHU1Rjg1XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgfVxuICAgIH0sIHRoaXMuQkFUQ0hfSU5URVJWQUwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1OTUwMFx1NkJDMVx1NUI5RVx1NEY4Qlx1RkYwOFx1OTg3NVx1OTc2Mlx1NTM3OFx1OEY3RFx1NjVGNlx1OEMwM1x1NzUyOFx1RkYwOVxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy50aW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgfVxuICAgIC8vIFx1NTNEMVx1OTAwMVx1NTI2OVx1NEY1OVx1NzY4NFx1NjVFNVx1NUZEN1xuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZmx1c2goKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gXHU1MjFCXHU1RUZBXHU1MzU1XHU0RjhCXG5jb25zdCBsb2dUcmFuc3BvcnRRdWV1ZSA9IG5ldyBMb2dUcmFuc3BvcnRRdWV1ZSgpO1xuXG4vLyBcdTk4NzVcdTk3NjJcdTUzNzhcdThGN0RcdTY1RjZcdTUzRDFcdTkwMDFcdTUyNjlcdTRGNTlcdTY1RTVcdTVGRDdcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgKCkgPT4ge1xuICAgIGxvZ1RyYW5zcG9ydFF1ZXVlLmRlc3Ryb3koKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUGlubyBcdTY1RTVcdTVGRDdcdTRGMjBcdThGOTNcdTU2NjhcbiAqIFx1NUMwNiBQaW5vIFx1NjVFNVx1NUZEN1x1NTNEMVx1OTAwMVx1NTIzMFx1NTQwRVx1N0FFRlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9nVHJhbnNwb3J0KGNvbnRleHQ/OiBMb2dDb250ZXh0KSB7XG4gIHJldHVybiB7XG4gICAgbGV2ZWw6IDMwLCAvLyBpbmZvIFx1N0VBN1x1NTIyQlx1NTNDQVx1NEVFNVx1NEUwQVx1NjI0RFx1NEYyMFx1OEY5M1xuICAgIHNlbmQ6IChsZXZlbDogbnVtYmVyLCBsb2dFdmVudDogYW55KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBcdTg5RTNcdTY3OTAgUGlubyBcdTY1RTVcdTVGRDdcdTVCRjlcdThDNjFcbiAgICAgICAgY29uc3QgbG9nT2JqZWN0ID0gbG9nRXZlbnQ7XG5cbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU5NzAwXHU4OTgxXHU4QkIwXHU1RjU1XHVGRjA4XHU1OTgyXHU2NzlDXHU2NzA5IHJlcXVlc3RVcmxcdUZGMDlcbiAgICAgICAgY29uc3QgcmVxdWVzdFVybCA9IGxvZ09iamVjdC5yZXF1ZXN0VXJsIHx8IGxvZ09iamVjdC51cmwgfHwgbG9nT2JqZWN0LnBhdGg7XG4gICAgICAgIGlmIChyZXF1ZXN0VXJsICYmICFzaG91bGRMb2cocmVxdWVzdFVybCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdThGNkNcdTYzNjJcdTRFM0EgcmVxdWVzdC1sb2dnZXIgXHU2ODNDXHU1RjBGXG4gICAgICAgIGNvbnN0IHJlcXVlc3RMb2cgPSBjb252ZXJ0UGlub0xvZ1RvUmVxdWVzdExvZyhsb2dPYmplY3QsIGNvbnRleHQpO1xuXG4gICAgICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIzMFx1OTYxRlx1NTIxN1xuICAgICAgICBsb2dUcmFuc3BvcnRRdWV1ZS5hZGQocmVxdWVzdExvZyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBcdTRGMjBcdThGOTNcdTU5MzFcdThEMjVcdTRFMERcdTVGNzFcdTU0Q0RcdTRFM0JcdTZENDFcdTdBMEJcdUZGMENcdTk3NTlcdTlFRDhcdTU5MDRcdTc0MDZcbiAgICAgICAgLy8gXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU1M0VGXHU0RUU1XHU4RjkzXHU1MUZBXHU5NTE5XHU4QkVGXHVGRjA4XHU0RjdGXHU3NTI4IGNvbnNvbGUuZXJyb3IgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHVGRjA5XG4gICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NkI2NFx1NjU4N1x1NEVGNlx1NjYyRiBsb2dnZXIgXHU2QTIxXHU1NzU3XHU3Njg0XHU0RTAwXHU5MEU4XHU1MjA2XHVGRjBDXHU0RTBEXHU4MEZEXHU0RjdGXHU3NTI4IGxvZ2dlciBcdTY3MkNcdThFQUJcdUZGMENcdTU0MjZcdTUyMTlcdTRGMUFcdTkwMjBcdTYyMTBcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoaW1wb3J0Lm1ldGE/LmVudj8uREVWKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTG9nIHRyYW5zcG9ydCBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaW1wb3J0Lm1ldGEuZW52IFx1NTNFRlx1ODBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwOFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1RkYwOVx1RkYwQ1x1NUZGRFx1NzU2NVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTYyNEJcdTUyQThcdTUzRDFcdTkwMDFcdTY1RTVcdTVGRDdcdUZGMDhcdTc1MjhcdTRFOEVcdTk3NUUgUGlubyBcdTY1RTVcdTVGRDdcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbmRMb2dUb0JhY2tlbmQobG9nSXRlbTogYW55KSB7XG4gIGxvZ1RyYW5zcG9ydFF1ZXVlLmFkZChsb2dJdGVtKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcdXRpbHNcXFxcbG9nZ2VyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFx1dGlsc1xcXFxsb2dnZXJcXFxccGluby1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL3V0aWxzL2xvZ2dlci9waW5vLWNvbmZpZy50c1wiOy8qKlxuICogUGlubyBcdTY1RTVcdTVGRDdcdTkxNERcdTdGNkVcbiAqL1xuXG5pbXBvcnQgcGlubyBmcm9tICdwaW5vJztcbmltcG9ydCB0eXBlIHsgTG9nZ2VyT3B0aW9ucyBhcyBQaW5vTG9nZ2VyT3B0aW9ucyB9IGZyb20gJ3Bpbm8nO1xuaW1wb3J0IHsgaXNEZXZlbG9wbWVudCB9IGZyb20gJy4uLy4uL2Vudic7XG5pbXBvcnQgeyBjcmVhdGVMb2dUcmFuc3BvcnQgfSBmcm9tICcuL3RyYW5zcG9ydHMnO1xuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjVFNVx1NUZEN1x1N0VBN1x1NTIyQlxuICogXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzOiBkZWJ1Z1x1RkYwQ1x1NzUxRlx1NEVBN1x1NzNBRlx1NTg4Mzogd2FyblxuICovXG5mdW5jdGlvbiBnZXRMb2dMZXZlbCgpOiBzdHJpbmcge1xuICBpZiAoaXNEZXZlbG9wbWVudCgpKSB7XG4gICAgcmV0dXJuICdkZWJ1Zyc7XG4gIH1cbiAgcmV0dXJuICd3YXJuJztcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgUGlubyBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBpbm9Db25maWcoY29udGV4dD86IGFueSk6IFBpbm9Mb2dnZXJPcHRpb25zIHtcbiAgY29uc3QgaXNEZXYgPSBpc0RldmVsb3BtZW50KCk7XG4gIGNvbnN0IGxldmVsID0gZ2V0TG9nTGV2ZWwoKTtcblxuICAvLyBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTkxNERcdTdGNkVcdTRGMjBcdThGOTNcdTU2NjhcdTc1MjhcdTRFOEVcdTY1RTVcdTVGRDdcdTRFMEFcdTYyQTVcbiAgY29uc3QgYnJvd3NlckNvbmZpZzogYW55ID0ge1xuICAgIGFzT2JqZWN0OiB0cnVlLCAvLyBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTRFMkRcdThGOTNcdTUxRkFcdTRFM0FcdTVCRjlcdThDNjFcdTY4M0NcdTVGMEZcbiAgfTtcblxuICAvLyBcdTkxNERcdTdGNkVcdTY1RTVcdTVGRDdcdTRGMjBcdThGOTNcdUZGMDhcdTRFMEFcdTYyQTVcdTUyMzBcdTU0MEVcdTdBRUZcdUZGMDlcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0ID0gY3JlYXRlTG9nVHJhbnNwb3J0KGNvbnRleHQpO1xuICAgIGJyb3dzZXJDb25maWcudHJhbnNtaXQgPSB7XG4gICAgICBsZXZlbDogMzAsIC8vIGluZm8gXHU3RUE3XHU1MjJCXHU1M0NBXHU0RUU1XHU0RTBBXHU2MjREXHU0RjIwXHU4RjkzXG4gICAgICBzZW5kOiAobGV2ZWw6IG51bWJlciwgbG9nRXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICB0cmFuc3BvcnQuc2VuZChsZXZlbCwgbG9nRXZlbnQpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgYmFzZUNvbmZpZzogUGlub0xvZ2dlck9wdGlvbnMgPSB7XG4gICAgbGV2ZWwsXG4gICAgYnJvd3NlcjogYnJvd3NlckNvbmZpZyxcbiAgfTtcblxuICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMUFcdTRGN0ZcdTc1MjggcGluby1wcmV0dHkgXHU2ODNDXHU1RjBGXHU1MzE2XHU4RjkzXHU1MUZBXG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBOb2RlLmpzIFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ3RyYW5zcG9ydCBcdTk3MDBcdTg5ODFcdTVGMDJcdTZCNjVcdTUyQTBcdThGN0RcbiAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1NzI4IE5vZGUuanMgXHU3M0FGXHU1ODgzXHU0RTE0XHU2NjJGXHU1RjAwXHU1M0QxXHU2QTIxXHU1RjBGXG4gIGNvbnN0IGlzTm9kZUVudiA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnO1xuICAvLyBcdTY4QzBcdTY3RTVcdTVGMDBcdTUzRDFcdTZBMjFcdTVGMEZcdUZGMUFcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggaXNEZXZcdUZGMENcdTUxNzZcdTZCMjFcdTY4QzBcdTY3RTUgTk9ERV9FTlYgXHU1NDhDIE1PREVcbiAgLy8gXHU1NzI4IE5vZGUuanMgXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU3NkY0XHU2M0E1XHU2OEMwXHU2N0U1IHByb2Nlc3MuZW52XHVGRjBDXHU1NkUwXHU0RTNBIGVudiBcdTVCRjlcdThDNjFcdTUzRUZcdTgwRkRcdThGRDhcdTZDQTFcdTY3MDlcdTZCNjNcdTc4NkVcdTUyMURcdTU5Q0JcdTUzMTZcbiAgY29uc3Qgbm9kZUVudiA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyA/IHByb2Nlc3MuZW52Lk5PREVfRU5WIDogdW5kZWZpbmVkO1xuICBjb25zdCBtb2RlID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnID8gcHJvY2Vzcy5lbnYuTU9ERSA6IHVuZGVmaW5lZDtcbiAgLy8gXHU1NzI4IE5vZGUuanMgXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU5MDFBXHU1RTM4IE5PREVfRU5WIFx1NEYxQVx1ODhBQlx1OEJCRVx1N0Y2RVx1NEUzQSAnZGV2ZWxvcG1lbnQnXG4gIC8vIFx1NjIxNlx1ODAwNVx1NkNBMVx1NjcwOVx1OEJCRVx1N0Y2RVx1RkYwOFx1OUVEOFx1OEJBNFx1NEUzQVx1NUYwMFx1NTNEMVx1NkEyMVx1NUYwRlx1RkYwOVxuICBjb25zdCBpc05vZGVEZXYgPSBpc05vZGVFbnYgJiYgKFxuICAgIGlzRGV2IHx8IFxuICAgIG5vZGVFbnYgPT09ICdkZXZlbG9wbWVudCcgfHwgXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyB8fFxuICAgICghbm9kZUVudiB8fCAobm9kZUVudiAhPT0gJ3Byb2R1Y3Rpb24nICYmIG1vZGUgIT09ICdwcm9kdWN0aW9uJykpXG4gICk7XG4gIFxuICBpZiAoaXNOb2RlRGV2KSB7XG4gICAgLy8gTm9kZS5qcyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMUFcdTRGN0ZcdTc1MjggcGluby1wcmV0dHkgXHU2ODNDXHU1RjBGXHU1MzE2XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICB0cmFuc3BvcnQ6IHtcbiAgICAgICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgY29sb3JpemU6IHRydWUsXG4gICAgICAgICAgdHJhbnNsYXRlVGltZTogJ1NZUzpzdGFuZGFyZCcsXG4gICAgICAgICAgaWdub3JlOiAncGlkLGhvc3RuYW1lJyxcbiAgICAgICAgICBzaW5nbGVMaW5lOiBmYWxzZSxcbiAgICAgICAgICBtZXNzYWdlRm9ybWF0OiAne21zZ30nLFxuICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1OEY5M1x1NTFGQVx1NjgzQ1x1NUYwRlx1NEUwRVx1NzkzQVx1NEY4Qlx1NEUwMFx1ODFGNFxuICAgICAgICAgIGhpZGVPYmplY3Q6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2MjE2XHU2RDRGXHU4OUM4XHU1NjY4XHU3M0FGXHU1ODgzXHVGRjFBXHU3RUQzXHU2Nzg0XHU1MzE2IEpTT04gXHU4RjkzXHU1MUZBXG4gIHJldHVybiBiYXNlQ29uZmlnO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBQaW5vIFx1NUI5RVx1NEY4QlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGlub0xvZ2dlcihjb250ZXh0PzogYW55KTogcGluby5Mb2dnZXIge1xuICBjb25zdCBjb25maWcgPSBjcmVhdGVQaW5vQ29uZmlnKGNvbnRleHQpO1xuICBcbiAgLy8gXHU1NzI4IE5vZGUuanMgXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU1OTgyXHU2NzlDXHU5MTREXHU3RjZFXHU0RTg2IHRyYW5zcG9ydFx1RkYwQ1x1OTcwMFx1ODk4MVx1NEY3Rlx1NzUyOCBwaW5vLnRyYW5zcG9ydCgpIFx1Njc2NVx1NUYwMlx1NkI2NVx1NTIxQlx1NUVGQVxuICAvLyBcdTY4MzlcdTYzNkUgUGlubyBcdTY1ODdcdTY4NjNcdUZGMEN0cmFuc3BvcnQgXHU5NzAwXHU4OTgxXHU1RjAyXHU2QjY1XHU1MkEwXHU4RjdEXG4gIGlmIChjb25maWcudHJhbnNwb3J0ICYmIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm9kZS5qcyBcdTczQUZcdTU4ODNcdUZGMUFcdTRGN0ZcdTc1MjggdHJhbnNwb3J0IFx1OTE0RFx1N0Y2RVxuICAgIC8vIFx1NTcyOCBQaW5vIHY4KyBcdTRFMkRcdUZGMENcdTUzRUZcdTRFRTVcdTc2RjRcdTYzQTVcdTkxNERcdTdGNkUgdHJhbnNwb3J0IFx1OTAwOVx1OTg3OVx1RkYwQ3Bpbm8gXHU0RjFBXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHU1RjAyXHU2QjY1XHU1MkEwXHU4RjdEXG4gICAgLy8gXHU0RjQ2XHU0RTNBXHU0RTg2XHU3ODZFXHU0RkREXHU1MTdDXHU1QkI5XHU2MDI3XHVGRjBDXHU2MjExXHU0RUVDXHU0RjdGXHU3NTI4XHU1NDBDXHU2QjY1XHU2NUI5XHU1RjBGXHU1MjFCXHU1RUZBIGxvZ2dlclx1RkYwQ3RyYW5zcG9ydCBcdTRGMUFcdTU3MjhcdTU0MEVcdTUzRjBcdTVGMDJcdTZCNjVcdTUyQTBcdThGN0RcbiAgICByZXR1cm4gcGlubyhjb25maWcpO1xuICB9XG4gIFxuICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTYyMTZcdTZDQTFcdTY3MDkgdHJhbnNwb3J0XHVGRjFBXHU3NkY0XHU2M0E1XHU1MjFCXHU1RUZBXG4gIHJldHVybiBwaW5vKGNvbmZpZyk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXHV0aWxzXFxcXHpvZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcdXRpbHNcXFxcem9kXFxcXHJlcG9ydGluZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvdXRpbHMvem9kL3JlcG9ydGluZy50c1wiOy8qKlxuICogXHU5QThDXHU4QkMxXHU1OTMxXHU4RDI1XHU0RTBBXHU2MkE1XHU2NzBEXHU1MkExXHVGRjA4XHU5ODg0XHU3NTU5XHVGRjA5XG4gKiBcdTc1MjhcdTRFOEVcdTVDMDZcdTlBOENcdThCQzFcdTU5MzFcdThEMjVcdTRGRTFcdTYwNkZcdTRFMEFcdTYyQTVcdTUyMzBcdThGRDBcdTdFRjRcdTVCNTBcdTVFOTRcdTc1MjhcdTU0OENcdTU0MEVcdTdBRUZBUElcbiAqL1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcblxuaW1wb3J0IHR5cGUgeyBab2RFcnJvciB9IGZyb20gJ3pvZCc7XG5cbi8qKlxuICogXHU5QThDXHU4QkMxXHU5NTE5XHU4QkVGXHU3QzdCXHU1NzhCXG4gKi9cbmV4cG9ydCB0eXBlIFZhbGlkYXRpb25FcnJvclR5cGUgPSAnZm9ybScgfCAnYXBpLXJlc3BvbnNlJyB8ICdjb25maWcnO1xuXG4vKipcbiAqIFx1OUE4Q1x1OEJDMVx1OTUxOVx1OEJFRlx1NEUwQVx1NEUwQlx1NjU4N1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25FcnJvckNvbnRleHQge1xuICB1cmw/OiBzdHJpbmc7IC8vIEFQSSBcdThCRjdcdTZDNDIgVVJMXG4gIGNvbmZpZ1BhdGg/OiBzdHJpbmc7IC8vIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxuICBmb3JtRmllbGQ/OiBzdHJpbmc7IC8vIFx1ODg2OFx1NTM1NVx1NUI1N1x1NkJCNVx1NTQwRFxuICBzY2hlbWFOYW1lPzogc3RyaW5nOyAvLyBTY2hlbWEgXHU1NDBEXHU3OUYwXG59XG5cbi8qKlxuICogXHU5QThDXHU4QkMxXHU5NTE5XHU4QkVGXHU0RTBBXHU2MkE1XHU2NTcwXHU2MzZFXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvbkVycm9yUmVwb3J0IHtcbiAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZTtcbiAgc2NoZW1hOiBzdHJpbmc7IC8vIHNjaGVtYSBcdTU0MERcdTc5RjBcdTYyMTZcdThERUZcdTVGODRcbiAgZXJyb3JzOiBab2RFcnJvclsnZXJyb3JzJ107XG4gIGNvbnRleHQ6IFZhbGlkYXRpb25FcnJvckNvbnRleHQ7XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xuICBlbnZpcm9ubWVudDogJ2RldmVsb3BtZW50JyB8ICdwcm9kdWN0aW9uJztcbiAgdXNlckFnZW50Pzogc3RyaW5nO1xuICB1c2VySWQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU0RTBBXHU2MkE1XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVwb3J0aW5nQ29uZmlnIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU0RTBBXHU2MkE1XG4gIGRlYm91bmNlTXM/OiBudW1iZXI7IC8vIFx1OTYzMlx1NjI5Nlx1NjVGNlx1OTVGNFx1RkYwOFx1NkJFQlx1NzlEMlx1RkYwOVx1RkYwQ1x1OUVEOFx1OEJBNCAxMDAwXG4gIG1heEJhdGNoU2l6ZT86IG51bWJlcjsgLy8gXHU2Mjc5XHU5MUNGXHU0RTBBXHU2MkE1XHU2NzAwXHU1OTI3XHU2NTcwXHU5MUNGXHVGRjBDXHU5RUQ4XHU4QkE0IDEwXG4gIG9wZXJhdGlvbnNBcHBVcmw/OiBzdHJpbmc7IC8vIFx1OEZEMFx1N0VGNFx1NUI1MFx1NUU5NFx1NzUyOCBVUkxcbiAgYmFja2VuZEFwaVVybD86IHN0cmluZzsgLy8gXHU1NDBFXHU3QUVGIEFQSSBcdTdBRUZcdTcwQjlcbn1cblxuLyoqXG4gKiBcdTlFRDhcdThCQTRcdTkxNERcdTdGNkVcbiAqL1xuY29uc3QgZGVmYXVsdENvbmZpZzogUmVwb3J0aW5nQ29uZmlnID0ge1xuICBlbmFibGVkOiBmYWxzZSwgLy8gXHU5RUQ4XHU4QkE0XHU1MTczXHU5NUVEXHVGRjBDXHU1NDBFXHU3RUVEXHU1QjlFXHU3M0IwXHU2NUY2XHU1NDJGXHU3NTI4XG4gIGRlYm91bmNlTXM6IDEwMDAsXG4gIG1heEJhdGNoU2l6ZTogMTAsXG59O1xuXG4vKipcbiAqIFx1NUY1M1x1NTI0RFx1OTE0RFx1N0Y2RVxuICovXG5sZXQgY3VycmVudENvbmZpZzogUmVwb3J0aW5nQ29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnIH07XG5cbi8qKlxuICogXHU1Rjg1XHU0RTBBXHU2MkE1XHU3Njg0XHU5NTE5XHU4QkVGXHU5NjFGXHU1MjE3XG4gKi9cbmNvbnN0IGVycm9yUXVldWU6IFZhbGlkYXRpb25FcnJvclJlcG9ydFtdID0gW107XG5cbi8qKlxuICogXHU5NjMyXHU2Mjk2XHU1QjlBXHU2NUY2XHU1NjY4XG4gKi9cbmxldCBkZWJvdW5jZVRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFx1OTE0RFx1N0Y2RVx1NEUwQVx1NjJBNVx1NjcwRFx1NTJBMVxuICogQHBhcmFtIGNvbmZpZyBcdTRFMEFcdTYyQTVcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZVJlcG9ydGluZyhjb25maWc6IFBhcnRpYWw8UmVwb3J0aW5nQ29uZmlnPikge1xuICBjdXJyZW50Q29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnLCAuLi5jb25maWcgfTtcbn1cblxuLyoqXG4gKiBcdTRFMEFcdTYyQTVcdTlBOENcdThCQzFcdTk1MTlcdThCRUZcdUZGMDhcdTk4ODRcdTc1NTlcdTYzQTVcdTUzRTNcdUZGMDlcbiAqIEBwYXJhbSB0eXBlIFx1OTUxOVx1OEJFRlx1N0M3Qlx1NTc4QlxuICogQHBhcmFtIHNjaGVtYSAgc2NoZW1hIFx1NTQwRFx1NzlGMFx1NjIxNlx1OERFRlx1NUY4NFxuICogQHBhcmFtIGVycm9yIFpvZCBcdTk1MTlcdThCRUZcdTVCRjlcdThDNjFcbiAqIEBwYXJhbSBjb250ZXh0IFx1NEUwQVx1NEUwQlx1NjU4N1x1NEZFMVx1NjA2RlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0VmFsaWRhdGlvbkVycm9yKFxuICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLFxuICBzY2hlbWE6IHN0cmluZyxcbiAgZXJyb3I6IFpvZEVycm9yLFxuICBjb250ZXh0OiBWYWxpZGF0aW9uRXJyb3JDb250ZXh0ID0ge31cbik6IHZvaWQge1xuICAvLyBcdTU5ODJcdTY3OUNcdTY3MkFcdTU0MkZcdTc1MjhcdTRFMEFcdTYyQTVcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcbiAgaWYgKCFjdXJyZW50Q29uZmlnLmVuYWJsZWQpIHtcbiAgICBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgbG9nZ2VyLndhcm4oJ1tcdTlBOENcdThCQzFcdTU5MzFcdThEMjVcdTRFMEFcdTYyQTVdIFx1NEUwQVx1NjJBNVx1NTI5Rlx1ODBGRFx1NjcyQVx1NTQyRlx1NzUyOCcsIHsgdHlwZSwgc2NoZW1hLCBlcnJvcnM6IGVycm9yLmVycm9ycyB9KTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU0RTBBXHU2MkE1XHU2NTcwXHU2MzZFXG4gIGNvbnN0IHJlcG9ydDogVmFsaWRhdGlvbkVycm9yUmVwb3J0ID0ge1xuICAgIHR5cGUsXG4gICAgc2NoZW1hLFxuICAgIGVycm9yczogZXJyb3IuZXJyb3JzLFxuICAgIGNvbnRleHQsXG4gICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgIGVudmlyb25tZW50OiBpbXBvcnQubWV0YS5lbnYuREVWID8gJ2RldmVsb3BtZW50JyA6ICdwcm9kdWN0aW9uJyxcbiAgICB1c2VyQWdlbnQ6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgOiB1bmRlZmluZWQsXG4gICAgLy8gdXNlcklkIFx1NTNFRlx1NEVFNVx1NEVDRVx1NTE2OFx1NUM0MFx1NzJCNlx1NjAwMVx1NjIxNlx1OEJBNFx1OEJDMVx1NEZFMVx1NjA2Rlx1NEUyRFx1ODNCN1x1NTNENlx1RkYwQ1x1OEZEOVx1OTFDQ1x1OTg4NFx1NzU1OVxuICAgIC8vIHVzZXJJZDogZ2V0Q3VycmVudFVzZXJJZCgpLFxuICB9O1xuXG4gIC8vIFx1NkRGQlx1NTJBMFx1NTIzMFx1OTYxRlx1NTIxN1xuICBlcnJvclF1ZXVlLnB1c2gocmVwb3J0KTtcblxuICAvLyBcdTU5ODJcdTY3OUNcdTk2MUZcdTUyMTdcdThGQkVcdTUyMzBcdTYyNzlcdTkxQ0ZcdTU5MjdcdTVDMEZcdUZGMENcdTdBQ0JcdTUzNzNcdTRFMEFcdTYyQTVcbiAgaWYgKGVycm9yUXVldWUubGVuZ3RoID49IChjdXJyZW50Q29uZmlnLm1heEJhdGNoU2l6ZSB8fCAxMCkpIHtcbiAgICBmbHVzaEVycm9yUXVldWUoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBcdTU0MjZcdTUyMTlcdTRGN0ZcdTc1MjhcdTk2MzJcdTYyOTZcdUZGMENcdTVFRjZcdThGREZcdTRFMEFcdTYyQTVcbiAgaWYgKGRlYm91bmNlVGltZXIpIHtcbiAgICBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lcik7XG4gIH1cblxuICBkZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZmx1c2hFcnJvclF1ZXVlKCk7XG4gIH0sIGN1cnJlbnRDb25maWcuZGVib3VuY2VNcyB8fCAxMDAwKTtcbn1cblxuLyoqXG4gKiBcdTdBQ0JcdTUzNzNcdTRFMEFcdTYyQTVcdTk2MUZcdTUyMTdcdTRFMkRcdTc2ODRcdTYyNDBcdTY3MDlcdTk1MTlcdThCRUZcbiAqL1xuZnVuY3Rpb24gZmx1c2hFcnJvclF1ZXVlKCk6IHZvaWQge1xuICBpZiAoZXJyb3JRdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByZXBvcnRzID0gWy4uLmVycm9yUXVldWVdO1xuICBlcnJvclF1ZXVlLmxlbmd0aCA9IDA7IC8vIFx1NkUwNVx1N0E3QVx1OTYxRlx1NTIxN1xuXG4gIC8vIFRPRE86IFx1NTQwRVx1N0VFRFx1NUI5RVx1NzNCMFx1NUI5RVx1OTY0NVx1NEUwQVx1NjJBNVx1OTAzQlx1OEY5MVxuICAvLyAxLiBcdTRFMEFcdTYyQTVcdTUyMzBcdThGRDBcdTdFRjRcdTVCNTBcdTVFOTRcdTc1MjhcbiAgLy8gaWYgKGN1cnJlbnRDb25maWcub3BlcmF0aW9uc0FwcFVybCkge1xuICAvLyAgIHJlcG9ydFRvT3BlcmF0aW9uc0FwcChyZXBvcnRzKTtcbiAgLy8gfVxuICAvLyAyLiBcdTRFMEFcdTYyQTVcdTUyMzBcdTU0MEVcdTdBRUZBUElcbiAgLy8gaWYgKGN1cnJlbnRDb25maWcuYmFja2VuZEFwaVVybCkge1xuICAvLyAgIHJlcG9ydFRvQmFja2VuZEFQSShyZXBvcnRzKTtcbiAgLy8gfVxuXG4gIC8vIFx1NUY1M1x1NTI0RFx1NEVDNVx1OEJCMFx1NUY1NVx1NjVFNVx1NUZEN1xuICBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgIGxvZ2dlci5pbmZvKCdbXHU5QThDXHU4QkMxXHU1OTMxXHU4RDI1XHU0RTBBXHU2MkE1XSBcdTVGODVcdTRFMEFcdTYyQTVcdTc2ODRcdTk1MTlcdThCRUY6JywgcmVwb3J0cyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU5NzU5XHU5RUQ4XHU4QkIwXHU1RjU1XG4gICAgbG9nZ2VyLndhcm4oYFtcdTlBOENcdThCQzFcdTU5MzFcdThEMjVcdTRFMEFcdTYyQTVdICR7cmVwb3J0cy5sZW5ndGh9IFx1NEUyQVx1OUE4Q1x1OEJDMVx1OTUxOVx1OEJFRlx1NUY4NVx1NEUwQVx1NjJBNWApO1xuICB9XG59XG5cbi8qKlxuICogXHU0RTBBXHU2MkE1XHU1MjMwXHU4RkQwXHU3RUY0XHU1QjUwXHU1RTk0XHU3NTI4XHVGRjA4XHU5ODg0XHU3NTU5XHVGRjBDXHU1NDBFXHU3RUVEXHU1QjlFXHU3M0IwXHVGRjA5XG4gKiBAcGFyYW0gcmVwb3J0cyBcdTk1MTlcdThCRUZcdTYyQTVcdTU0NEFcdTY1NzBcdTdFQzRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVwb3J0VG9PcGVyYXRpb25zQXBwKHJlcG9ydHM6IFZhbGlkYXRpb25FcnJvclJlcG9ydFtdKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIFRPRE86IFx1NUI5RVx1NzNCMFx1NEUwQVx1NjJBNVx1NTIzMFx1OEZEMFx1N0VGNFx1NUI1MFx1NUU5NFx1NzUyOFx1NzY4NFx1OTAzQlx1OEY5MVxuICAvLyBcdTRGOEJcdTU5ODJcdUZGMUFcdTRGN0ZcdTc1MjggZmV0Y2ggXHU2MjE2IGF4aW9zIFx1NTNEMVx1OTAwMSBQT1NUIFx1OEJGN1x1NkM0MlxuICAvLyBhd2FpdCBmZXRjaChjdXJyZW50Q29uZmlnLm9wZXJhdGlvbnNBcHBVcmwhLCB7XG4gIC8vICAgbWV0aG9kOiAnUE9TVCcsXG4gIC8vICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gIC8vICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyByZXBvcnRzIH0pLFxuICAvLyB9KTtcbn1cblxuLyoqXG4gKiBcdTRFMEFcdTYyQTVcdTUyMzBcdTU0MEVcdTdBRUZBUElcdUZGMDhcdTk4ODRcdTc1NTlcdUZGMENcdTU0MEVcdTdFRURcdTVCOUVcdTczQjBcdUZGMDlcbiAqIEBwYXJhbSByZXBvcnRzIFx1OTUxOVx1OEJFRlx1NjJBNVx1NTQ0QVx1NjU3MFx1N0VDNFxuICovXG5hc3luYyBmdW5jdGlvbiByZXBvcnRUb0JhY2tlbmRBUEkocmVwb3J0czogVmFsaWRhdGlvbkVycm9yUmVwb3J0W10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gVE9ETzogXHU1QjlFXHU3M0IwXHU0RTBBXHU2MkE1XHU1MjMwXHU1NDBFXHU3QUVGQVBJXHU3Njg0XHU5MDNCXHU4RjkxXG4gIC8vIFx1NEY4Qlx1NTk4Mlx1RkYxQVx1NEY3Rlx1NzUyOFx1OTg3OVx1NzZFRVx1NzY4NCBIVFRQIFx1NUJBMlx1NjIzN1x1N0FFRlx1NTNEMVx1OTAwMVx1OEJGN1x1NkM0MlxuICAvLyBhd2FpdCBodHRwLnBvc3QoY3VycmVudENvbmZpZy5iYWNrZW5kQXBpVXJsISwgeyByZXBvcnRzIH0pO1xufVxuXG4vKipcbiAqIFx1NjI0Qlx1NTJBOFx1ODlFNlx1NTNEMVx1NEUwQVx1NjJBNVx1RkYwOFx1NzUyOFx1NEU4RVx1NkQ0Qlx1OEJENVx1NjIxNlx1N0QyN1x1NjAyNVx1NjBDNVx1NTFCNVx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx1c2hSZXBvcnRzKCk6IHZvaWQge1xuICBmbHVzaEVycm9yUXVldWUoKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTVGODVcdTRFMEFcdTYyQTVcdTc2ODRcdTk1MTlcdThCRUZcdTY1NzBcdTkxQ0ZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBlbmRpbmdSZXBvcnRDb3VudCgpOiBudW1iZXIge1xuICByZXR1cm4gZXJyb3JRdWV1ZS5sZW5ndGg7XG59XG5cbi8qKlxuICogXHU2RTA1XHU3QTdBXHU1Rjg1XHU0RTBBXHU2MkE1XHU5NjFGXHU1MjE3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckVycm9yUXVldWUoKTogdm9pZCB7XG4gIGVycm9yUXVldWUubGVuZ3RoID0gMDtcbiAgaWYgKGRlYm91bmNlVGltZXIpIHtcbiAgICBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lcik7XG4gICAgZGVib3VuY2VUaW1lciA9IG51bGw7XG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcY29uZmlnc1xcXFxzY2hlbWFzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL3NjaGVtYXMudHNcIjsvKipcbiAqIFx1OTE0RFx1N0Y2RVx1OUE4Q1x1OEJDMSBab2QgU2NoZW1hc1xuICogXHU3NTI4XHU0RThFXHU5QThDXHU4QkMxXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHUzMDAxXHU4M0RDXHU1MzU1XHU5MTREXHU3RjZFXHUzMDAxXHU2RTA1XHU1MzU1XHU5MTREXHU3RjZFXHU3QjQ5XG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG4vKipcbiAqIFx1ODNEQ1x1NTM1NVx1OTE0RFx1N0Y2RVx1OTg3OSBTY2hlbWFcbiAqL1xuZXhwb3J0IGNvbnN0IE1lbnVDb25maWdJdGVtU2NoZW1hOiB6LlpvZFR5cGU8YW55PiA9IHoubGF6eSgoKSA9PlxuICB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCksXG4gICAgdGl0bGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICBsYWJlbEtleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICBzb3J0OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gICAgc2hvd0luT3ZlcnZpZXc6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gICAgcGVybWlzc2lvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgaG90OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAgIG1vdW50VG86IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICBjaGlsZHJlbjogei5hcnJheShNZW51Q29uZmlnSXRlbVNjaGVtYSkub3B0aW9uYWwoKSxcbiAgICBwYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIH0pXG4pO1xuXG4vKipcbiAqIFx1ODNEQ1x1NTM1NVx1OTE0RFx1N0Y2RSBTY2hlbWFcbiAqL1xuZXhwb3J0IGNvbnN0IE1lbnVDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGdsb2JhbDogei5hcnJheShNZW51Q29uZmlnSXRlbVNjaGVtYSkub3B0aW9uYWwoKSxcbiAgbW91bnRQb2ludHM6IHouYXJyYXkoTWVudUNvbmZpZ0l0ZW1TY2hlbWEpLm9wdGlvbmFsKCksXG4gIG1vZHVsZTogei5hcnJheShNZW51Q29uZmlnSXRlbVNjaGVtYSkub3B0aW9uYWwoKSxcbn0pO1xuXG4vKipcbiAqIFx1NUI1MFx1NUU5NFx1NzUyOFx1NkUwNVx1NTM1NVx1OERFRlx1NzUzMSBTY2hlbWFcbiAqL1xuZXhwb3J0IGNvbnN0IFN1YkFwcE1hbmlmZXN0Um91dGVTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIHBhdGg6IHouc3RyaW5nKCksXG4gIG5hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgY29tcG9uZW50OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGxhYmVsS2V5OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHRhYkxhYmVsS2V5OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGJyZWFkY3J1bWJzOiB6XG4gICAgLmFycmF5KFxuICAgICAgei5vYmplY3Qoe1xuICAgICAgICBsYWJlbEtleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICBsYWJlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICBpY29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICB9KVxuICAgIClcbiAgICAub3B0aW9uYWwoKSxcbn0pO1xuXG4vKipcbiAqIFx1NUI1MFx1NUU5NFx1NzUyOFx1NkUwNVx1NTM1NSBTY2hlbWFcbiAqL1xuZXhwb3J0IGNvbnN0IFN1YkFwcE1hbmlmZXN0U2NoZW1hID0gei5vYmplY3Qoe1xuICBhcHA6IHoub2JqZWN0KHtcbiAgICBpZDogei5zdHJpbmcoKSxcbiAgICBiYXNlUGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgIG5hbWVLZXk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAnYXBwLW5hbWUnOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIH0pLFxuICByb3V0ZXM6IHouYXJyYXkoU3ViQXBwTWFuaWZlc3RSb3V0ZVNjaGVtYSksXG4gIG1lbnVzOiB6XG4gICAgLmFycmF5KFxuICAgICAgei5vYmplY3Qoe1xuICAgICAgICBpbmRleDogei5zdHJpbmcoKSxcbiAgICAgICAgbGFiZWxLZXk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAgICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAgICAgaWNvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICBjaGlsZHJlbjogei5hcnJheSh6LmFueSgpKS5vcHRpb25hbCgpLFxuICAgICAgfSlcbiAgICApXG4gICAgLm9wdGlvbmFsKCksXG4gIG1lbnVDb25maWc6IE1lbnVDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbiAgcmF3OiB6LmFueSgpLm9wdGlvbmFsKCksXG59KTtcblxuLyoqXG4gKiBcdTVFOTRcdTc1MjhcdThFQUJcdTRFRkQgU2NoZW1hXG4gKi9cbmV4cG9ydCBjb25zdCBBcHBJZGVudGl0eVNjaGVtYSA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkubWluKDEsICdcdTVFOTRcdTc1MjhJRFx1NEUwRFx1ODBGRFx1NEUzQVx1N0E3QScpLFxuICBuYW1lOiB6LnN0cmluZygpLm1pbigxLCAnXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBJyksXG4gIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHBhdGhQcmVmaXg6IHouc3RyaW5nKCkubWluKDEsICdcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0EnKSxcbiAgc3ViZG9tYWluOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHR5cGU6IHouZW51bShbJ21haW4nLCAnc3ViJywgJ2xheW91dCcsICdkb2NzJ10pLFxuICBlbmFibGVkOiB6LmJvb2xlYW4oKSxcbiAgaWNvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICB2ZXJzaW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHJvdXRlczogelxuICAgIC5vYmplY3Qoe1xuICAgICAgbWFpbkFwcFJvdXRlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgICAgbm9uQ2xvc2FibGVSb3V0ZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgICAgIGhvbWVSb3V0ZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgc2tpcFRhYmJhclJvdXRlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIH0pXG4gICAgLm9wdGlvbmFsKCksXG4gIG1ldGFkYXRhOiB6LnJlY29yZCh6LmFueSgpKS5vcHRpb25hbCgpLFxufSk7XG5cbi8qKlxuICogXHU5ODg0XHU1OTA0XHU3NDA2XHU1MUZEXHU2NTcwXHVGRjFBXHU1QzA2IFZ1ZSBJMThuIFx1N0YxNlx1OEJEMVx1NTQwRVx1NzY4NFx1NTFGRFx1NjU3MFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NUI1N1x1N0IyNlx1NEUzMlxuICovXG5mdW5jdGlvbiBwcmVwcm9jZXNzSTE4blZhbHVlKHZhbDogYW55KTogYW55IHtcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdmFsKHsgbm9ybWFsaXplOiAoYXJyOiBhbnlbXSkgPT4gYXJyWzBdIH0pO1xuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTUxRkRcdTY1NzBcdTVCRjlcdThDNjFcdTRFMkRcdTYzRDBcdTUzRDYgc291cmNlXG4gICAgICBjb25zdCBzb3VyY2UgPSAodmFsIGFzIGFueSkubG9jPy5zb3VyY2UgfHwgKHZhbCBhcyBhbnkpLnNvdXJjZTtcbiAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2M0QwXHU1M0Q2XHU1OTMxXHU4RDI1XHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzlGXHU1OUNCXHU1MDNDXG4gICAgfVxuICB9XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIC8vIFx1OTAxMlx1NUY1Mlx1NTkwNFx1NzQwNlx1NUJGOVx1OEM2MVxuICAgIGNvbnN0IHByb2Nlc3NlZDogYW55ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdmFsKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbCwga2V5KSkge1xuICAgICAgICBwcm9jZXNzZWRba2V5XSA9IHByZXByb2Nlc3NJMThuVmFsdWUodmFsW2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc2VkO1xuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogXHU1QjUwXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFIFNjaGVtYVxuICogXHU2Q0U4XHU2MTBGXHVGRjFBbmFtZSBcdTUzRUZcdTgwRkRcdTY2MkZcdTVCNTdcdTdCMjZcdTRFMzJcdTYyMTYgVnVlIEkxOG4gXHU3RjE2XHU4QkQxXHU1NDBFXHU3Njg0XHU1MUZEXHU2NTcwXHU2ODNDXHU1RjBGXG4gKi9cbmV4cG9ydCBjb25zdCBTdWJBcHBMZXZlbENvbmZpZ1NjaGVtYSA9IHoucHJlcHJvY2VzcyhcbiAgKHZhbCkgPT4ge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgJ25hbWUnIGluIHZhbCkge1xuICAgICAgcmV0dXJuIHsgLi4udmFsLCBuYW1lOiBwcmVwcm9jZXNzSTE4blZhbHVlKHZhbC5uYW1lKSB9O1xuICAgIH1cbiAgICByZXR1cm4gdmFsO1xuICB9LFxuICB6Lm9iamVjdCh7XG4gICAgbmFtZTogei51bmlvbihbei5zdHJpbmcoKSwgei5hbnkoKV0pLCAvLyBcdTUxNDFcdThCQjhcdTVCNTdcdTdCMjZcdTRFMzJcdTYyMTZcdTRFRkJcdTRGNTVcdTdDN0JcdTU3OEJcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMDlcbiAgfSlcbik7XG5cbi8qKlxuICogXHU1RTk0XHU3NTI4XHU3RUE3XHU5MTREXHU3RjZFIFNjaGVtYVxuICovXG5leHBvcnQgY29uc3QgQXBwTGV2ZWxDb25maWdTY2hlbWEgPSB6LnJlY29yZCh6LnVuaW9uKFt6LnN0cmluZygpLCB6LnJlY29yZCh6LnN0cmluZygpKV0pKTtcblxuLyoqXG4gKiBcdTgzRENcdTUzNTVcdTdFQTdcdTkxNERcdTdGNkUgU2NoZW1hXHVGRjA4XHU2NTJGXHU2MzAxXHU1OTFBXHU1QzQyXHU1RDRDXHU1OTU3XHVGRjA5XG4gKi9cbmV4cG9ydCBjb25zdCBNZW51TGV2ZWxDb25maWdTY2hlbWE6IHouWm9kVHlwZTxhbnk+ID0gei5sYXp5KCgpID0+XG4gIHoucmVjb3JkKFxuICAgIHoudW5pb24oW1xuICAgICAgei5zdHJpbmcoKSxcbiAgICAgIE1lbnVMZXZlbENvbmZpZ1NjaGVtYSxcbiAgICAgIHoub2JqZWN0KHtcbiAgICAgICAgXzogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgfSkucGFzc3Rocm91Z2goKSxcbiAgICBdKVxuICApXG4pO1xuXG4vKipcbiAqIFx1OTg3NVx1OTc2Mlx1N0VBN1x1OTE0RFx1N0Y2RSBTY2hlbWFcbiAqL1xuZXhwb3J0IGNvbnN0IFBhZ2VMZXZlbENvbmZpZ1NjaGVtYSA9IHoucmVjb3JkKFxuICB6LnJlY29yZCh6LnJlY29yZCh6LnN0cmluZygpKSlcbik7XG5cbi8qKlxuICogXHU5MDFBXHU3NTI4XHU5MTREXHU3RjZFIFNjaGVtYVxuICogXHU2NTJGXHU2MzAxXHU1OTFBXHU1QzQyXHU1RDRDXHU1OTU3XHU3Njg0XHU1QkY5XHU4QzYxXHU3RUQzXHU2Nzg0XHVGRjBDXHU1MDNDXHU1M0VGXHU0RUU1XHU2NjJGXHU1QjU3XHU3QjI2XHU0RTMyXHU2MjE2XHU1RDRDXHU1OTU3XHU1QkY5XHU4QzYxXG4gKiBcdTZDRThcdTYxMEZcdUZGMUFcdTUxRkRcdTY1NzBcdTdDN0JcdTU3OEJcdTRGMUFcdTU3MjhcdTlBOENcdThCQzFcdTUyNERcdTkwMUFcdThGQzdcdTk4ODRcdTU5MDRcdTc0MDZcdTUxRkRcdTY1NzBcdThGNkNcdTYzNjJcbiAqL1xuZXhwb3J0IGNvbnN0IENvbW1vbkxldmVsQ29uZmlnU2NoZW1hOiB6LlpvZFR5cGU8YW55PiA9IHoubGF6eSgoKSA9PlxuICB6LnJlY29yZChcbiAgICB6LnVuaW9uKFtcbiAgICAgIHouc3RyaW5nKCksXG4gICAgICB6LmZ1bmN0aW9uKCksIC8vIFx1NTE0MVx1OEJCOCBWdWUgSTE4biBcdTdGMTZcdThCRDFcdTU0MEVcdTc2ODRcdTUxRkRcdTY1NzBcdTY4M0NcdTVGMEZcdUZGMDhcdTRGMUFcdTU3MjhcdTlBOENcdThCQzFcdTUyNERcdTk4ODRcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgIENvbW1vbkxldmVsQ29uZmlnU2NoZW1hLFxuICAgICAgei5hbnkoKSwgLy8gXHU1MTQxXHU4QkI4XHU0RUZCXHU0RjU1XHU3QzdCXHU1NzhCXHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XHVGRjA5XG4gICAgXSlcbiAgKVxuKTtcblxuLyoqXG4gKiBcdTUzNTVcdThCRURcdThBMDBcdTkxNERcdTdGNkUgU2NoZW1hXG4gKi9cbmV4cG9ydCBjb25zdCBMb2NhbGVDb25maWdTaW5nbGVTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGFwcDogQXBwTGV2ZWxDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbiAgc3ViYXBwOiBTdWJBcHBMZXZlbENvbmZpZ1NjaGVtYS5vcHRpb25hbCgpLFxuICBtZW51OiBNZW51TGV2ZWxDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbiAgcGFnZTogUGFnZUxldmVsQ29uZmlnU2NoZW1hLm9wdGlvbmFsKCksXG4gIGNvbW1vbjogQ29tbW9uTGV2ZWxDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbn0pO1xuXG4vKipcbiAqIFx1NTkxQVx1OEJFRFx1OEEwMFx1OTE0RFx1N0Y2RSBTY2hlbWFcbiAqL1xuZXhwb3J0IGNvbnN0IExvY2FsZUNvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgJ3poLUNOJzogTG9jYWxlQ29uZmlnU2luZ2xlU2NoZW1hLFxuICAnZW4tVVMnOiBMb2NhbGVDb25maWdTaW5nbGVTY2hlbWEsXG59KTtcblxuLyoqXG4gKiBcdTlBOENcdThCQzFcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBzY2hlbWEgWm9kIHNjaGVtYVxuICogQHBhcmFtIGNvbmZpZyBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqIEBwYXJhbSBjb25maWdOYW1lIFx1OTE0RFx1N0Y2RVx1NTQwRFx1NzlGMFx1RkYwOFx1NzUyOFx1NEU4RVx1OTUxOVx1OEJFRlx1NkQ4OFx1NjA2Rlx1RkYwOVxuICogQHJldHVybnMgXHU5QThDXHU4QkMxXHU1NDBFXHU3Njg0XHU5MTREXHU3RjZFXG4gKiBAdGhyb3dzIFpvZEVycm9yIFx1NTk4Mlx1Njc5Q1x1OUE4Q1x1OEJDMVx1NTkzMVx1OEQyNVx1RkYwOFx1NEVDNVx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb25maWc8VD4oXG4gIHNjaGVtYTogei5ab2RUeXBlPFQ+LFxuICBjb25maWc6IHVua25vd24sXG4gIGNvbmZpZ05hbWU6IHN0cmluZyA9ICdcdTkxNERcdTdGNkUnXG4pOiBUIHtcbiAgLy8gXHU5ODg0XHU1OTA0XHU3NDA2XHU5MTREXHU3RjZFXHVGRjFBXHU1QzA2IFZ1ZSBJMThuIFx1N0YxNlx1OEJEMVx1NTQwRVx1NzY4NFx1NTFGRFx1NjU3MFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NUI1N1x1N0IyNlx1NEUzMlxuICBjb25zdCBwcmVwcm9jZXNzZWRDb25maWcgPSBwcmVwcm9jZXNzSTE4blZhbHVlKGNvbmZpZyk7XG4gIFxuICBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1RkYxQVx1NUYzQVx1NTIzNlx1OUE4Q1x1OEJDMVx1RkYwQ1x1NTkzMVx1OEQyNVx1NjVGNlx1NjI5Qlx1NTFGQVx1OTUxOVx1OEJFRlxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gc2NoZW1hLnBhcnNlKHByZXByb2Nlc3NlZENvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIHouWm9kRXJyb3IpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBbXHU5MTREXHU3RjZFXHU5QThDXHU4QkMxXSAke2NvbmZpZ05hbWV9XHU5QThDXHU4QkMxXHU1OTMxXHU4RDI1OmAsIGVycm9yLmVycm9ycyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgJHtjb25maWdOYW1lfVx1OUE4Q1x1OEJDMVx1NTkzMVx1OEQyNTogJHtlcnJvci5lcnJvcnMubWFwKChlKSA9PiBgJHtlLnBhdGguam9pbignLicpfTogJHtlLm1lc3NhZ2V9YCkuam9pbignLCAnKX1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU1NDJGXHU3NTI4XHU5QThDXHU4QkMxXHU0RjQ2XHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XG4gICAgY29uc3QgcmVzdWx0ID0gc2NoZW1hLnNhZmVQYXJzZShwcmVwcm9jZXNzZWRDb25maWcpO1xuICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMENcdThGRDRcdTU2REVcdTUzOUZcdTU5Q0JcdTkxNERcdTdGNkVcdUZGMENcdTVFNzZcdTRFMEFcdTYyQTVcbiAgICAgIGxvZ2dlci53YXJuKGBbXHU5MTREXHU3RjZFXHU5QThDXHU4QkMxXSAke2NvbmZpZ05hbWV9XHU5QThDXHU4QkMxXHU1OTMxXHU4RDI1XHVGRjBDXHU0RjdGXHU3NTI4XHU1MzlGXHU1OUNCXHU5MTREXHU3RjZFYCk7XG4gICAgICAvLyBcdTRFMEFcdTYyQTVcdTlBOENcdThCQzFcdTU5MzFcdThEMjVcdUZGMDhcdTVGMDJcdTZCNjVcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcdUZGMDlcbiAgICAgIGltcG9ydCgnLi4vdXRpbHMvem9kL3JlcG9ydGluZycpLnRoZW4oKHsgcmVwb3J0VmFsaWRhdGlvbkVycm9yIH0pID0+IHtcbiAgICAgICAgcmVwb3J0VmFsaWRhdGlvbkVycm9yKFxuICAgICAgICAgICdjb25maWcnLFxuICAgICAgICAgIGNvbmZpZ05hbWUsXG4gICAgICAgICAgcmVzdWx0LmVycm9yLFxuICAgICAgICAgIHsgY29uZmlnUGF0aDogY29uZmlnTmFtZSB9XG4gICAgICAgICk7XG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUJGQ1x1NTE2NVx1NTkzMVx1OEQyNVx1RkYwQ1x1OTc1OVx1OUVEOFx1OERGM1x1OEZDN1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gY29uZmlnIGFzIFQ7XG4gICAgfVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXGNvbmZpZ3NcXFxcYXBwLWNvbmZpZ3MtY29sbGVjdGVkLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1jb25maWdzLWNvbGxlY3RlZC50c1wiOy8vIEB0cy1ub2NoZWNrXG4vKipcbiAqIFx1NkI2NFx1NjU4N1x1NEVGNlx1NzUzMSBzY3JpcHRzL2NvbGxlY3QtYXBwLWNvbmZpZ3MubWpzIFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFxuICogXHU4QkY3XHU1MkZGXHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHU2QjY0XHU2NTg3XHU0RUY2XG4gKiBcbiAqIFx1NzUxRlx1NjIxMFx1NjVGNlx1OTVGNDogMjAyNi0wMS0wN1QxMjowMToyOS45MTlaXG4gKiBcbiAqIFx1NkI2NFx1NjU4N1x1NEVGNlx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1NzY4NFx1NTE4NVx1ODA1NCBKU09OIFx1NjU3MFx1NjM2RVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZEMFx1ODg0Q1x1NjVGNlx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVxuICovXG5cbmltcG9ydCB0eXBlIHsgQXBwSWRlbnRpdHkgfSBmcm9tICcuL2FwcC1pZGVudGl0eS50eXBlcyc7XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU3Njg0XHU2NjIwXHU1QzA0XHVGRjA4XHU1MTg1XHU4MDU0IEpTT04gXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA5XG4gKiBcdTk1MkVcdTRFM0FcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjlcdTRFOEVcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDlcdUZGMENcdTUwM0NcdTRFM0EgSlNPTiBcdTVCNTdcdTdCMjZcdTRFMzJcbiAqIFxuICogXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU0RTlCXHU2NjJGIEpTT04gXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjBDXHU5NzAwXHU4OTgxXHU1NzI4IGFwcC1zY2FubmVyLnRzIFx1NEUyRFx1ODlFM1x1Njc5MFxuICovXG5leHBvcnQgY29uc3QgYXBwQ29uZmlnc0pzb25NYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgJy4uLy4uLy4uL2FwcHMvYWRtaW4tYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJhZG1pblxcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJhcHAubmFtZVxcXCIsXFxuICBcXFwiZGVzY3JpcHRpb25cXFwiOiBcXFwiY29tbW9uLnN5c3RlbS5idGNfc2hvcF9tYW5hZ2VtZW50X3N5c3RlbVxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvYWRtaW5cXFwiLFxcbiAgXFxcInN1YmRvbWFpblxcXCI6IFxcXCJhZG1pbi5iZWxsaXMuY29tLmNuXFxcIixcXG4gIFxcXCJ0eXBlXFxcIjogXFxcInN1YlxcXCIsXFxuICBcXFwiZW5hYmxlZFxcXCI6IHRydWUsXFxuICBcXFwidmVyc2lvblxcXCI6IFxcXCIxLjAuMFxcXCJcXG59XCIsXG4gICAgJy4uLy4uLy4uL2FwcHMvZGFzaGJvYXJkLWFwcC9zcmMvYXBwLnRzJzogXCJ7XFxuICBcXFwiaWRcXFwiOiBcXFwiZGFzaGJvYXJkXFxcIixcXG4gIFxcXCJuYW1lXFxcIjogXFxcIlx1NzcwQlx1Njc3Rlx1NUU5NFx1NzUyOFxcXCIsXFxuICBcXFwiZGVzY3JpcHRpb25cXFwiOiBcXFwiQlRDXHU4RjY2XHU5NUY0XHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGIC0gXHU3NzBCXHU2NzdGXHU1RTk0XHU3NTI4XFxcIixcXG4gIFxcXCJwYXRoUHJlZml4XFxcIjogXFxcIi9kYXNoYm9hcmRcXFwiLFxcbiAgXFxcInN1YmRvbWFpblxcXCI6IFxcXCJkYXNoYm9hcmQuYmVsbGlzLmNvbS5jblxcXCIsXFxuICBcXFwidHlwZVxcXCI6IFxcXCJzdWJcXFwiLFxcbiAgXFxcImVuYWJsZWRcXFwiOiB0cnVlLFxcbiAgXFxcInZlcnNpb25cXFwiOiBcXFwiMS4wLjBcXFwiXFxufVwiLFxuICAgICcuLi8uLi8uLi9hcHBzL2RvY3MtYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJkb2NzXFxcIixcXG4gIFxcXCJuYW1lXFxcIjogXFxcImFwcC5uYW1lXFxcIixcXG4gIFxcXCJkZXNjcmlwdGlvblxcXCI6IFxcXCJhcHAuZGVzY3JpcHRpb25cXFwiLFxcbiAgXFxcInBhdGhQcmVmaXhcXFwiOiBcXFwiL2RvY3NcXFwiLFxcbiAgXFxcInN1YmRvbWFpblxcXCI6IFxcXCJkb2NzLmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwiZG9jc1xcXCIsXFxuICBcXFwiZW5hYmxlZFxcXCI6IHRydWUsXFxuICBcXFwidmVyc2lvblxcXCI6IFxcXCIxLjAuMFxcXCJcXG59XCIsXG4gICAgJy4uLy4uLy4uL2FwcHMvZW5naW5lZXJpbmctYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJlbmdpbmVlcmluZ1xcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJhcHAubmFtZVxcXCIsXFxuICBcXFwiZGVzY3JpcHRpb25cXFwiOiBcXFwiY29tbW9uLnN5c3RlbS5idGNfc2hvcF9tYW5hZ2VtZW50X3N5c3RlbVxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvZW5naW5lZXJpbmdcXFwiLFxcbiAgXFxcInN1YmRvbWFpblxcXCI6IFxcXCJlbmdpbmVlcmluZy5iZWxsaXMuY29tLmNuXFxcIixcXG4gIFxcXCJ0eXBlXFxcIjogXFxcInN1YlxcXCIsXFxuICBcXFwiZW5hYmxlZFxcXCI6IHRydWUsXFxuICBcXFwidmVyc2lvblxcXCI6IFxcXCIxLjAuMFxcXCJcXG59XCIsXG4gICAgJy4uLy4uLy4uL2FwcHMvZmluYW5jZS1hcHAvc3JjL2FwcC50cyc6IFwie1xcbiAgXFxcImlkXFxcIjogXFxcImZpbmFuY2VcXFwiLFxcbiAgXFxcIm5hbWVcXFwiOiBcXFwiXHU4RDIyXHU1MkExXHU1RTk0XHU3NTI4XFxcIixcXG4gIFxcXCJkZXNjcmlwdGlvblxcXCI6IFxcXCJCVENcdThGNjZcdTk1RjRcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREYgLSBcdThEMjJcdTUyQTFcdTVFOTRcdTc1MjhcXFwiLFxcbiAgXFxcInBhdGhQcmVmaXhcXFwiOiBcXFwiL2ZpbmFuY2VcXFwiLFxcbiAgXFxcInN1YmRvbWFpblxcXCI6IFxcXCJmaW5hbmNlLmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwic3ViXFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIlxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9ob21lLWFwcC9zcmMvYXBwLnRzJzogXCJ7XFxuICBcXFwiaWRcXFwiOiBcXFwiaG9tZVxcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJcdTUxNkNcdTUzRjhcdTk5OTZcdTk4NzVcXFwiLFxcbiAgXFxcImRlc2NyaXB0aW9uXFxcIjogXFxcIkJUQ1x1OEY2Nlx1OTVGNFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERiAtIFx1NTE2Q1x1NTNGOFx1OTk5Nlx1OTg3NVx1NTQ4Q1x1NTE3M1x1NEU4RVx1NjIxMVx1NEVFQ1xcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvXFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwid3d3LmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwic3ViXFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIixcXG4gIFxcXCJtZXRhZGF0YVxcXCI6IHtcXG4gICAgXFxcInB1YmxpY1xcXCI6IHRydWUsXFxuICAgIFxcXCJwb3J0XFxcIjogODA5NVxcbiAgfVxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9sYXlvdXQtYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJsYXlvdXRcXFwiLFxcbiAgXFxcIm5hbWVcXFwiOiBcXFwiYXBwLm5hbWVcXFwiLFxcbiAgXFxcImRlc2NyaXB0aW9uXFxcIjogXFxcImFwcC5kZXNjcmlwdGlvblxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvXFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwibGF5b3V0LmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwibGF5b3V0XFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIlxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9sb2dpc3RpY3MtYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJsb2dpc3RpY3NcXFwiLFxcbiAgXFxcIm5hbWVcXFwiOiBcXFwiY29tbW9uLmFwcHMubG9naXN0aWNzXFxcIixcXG4gIFxcXCJkZXNjcmlwdGlvblxcXCI6IFxcXCJjb21tb24uc3lzdGVtLmJ0Y19zaG9wX21hbmFnZW1lbnRfc3lzdGVtX2xvZ2lzdGljc1xcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvbG9naXN0aWNzXFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwibG9naXN0aWNzLmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwic3ViXFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIlxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9tYWluLWFwcC9zcmMvYXBwLnRzJzogXCJ7XFxuICBcXFwiaWRcXFwiOiBcXFwibWFpblxcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJcdTRFM0JcdTVFOTRcdTc1MjhcXFwiLFxcbiAgXFxcImRlc2NyaXB0aW9uXFxcIjogXFxcIkJUQ1x1OEY2Nlx1OTVGNFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERiAtIFx1NEUzQlx1NUU5NFx1NzUyOFx1NTdGQVx1NUVBN1xcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvXFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwiYmVsbGlzLmNvbS5jblxcXCIsXFxuICBcXFwidHlwZVxcXCI6IFxcXCJtYWluXFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIixcXG4gIFxcXCJyb3V0ZXNcXFwiOiB7XFxuICAgIFxcXCJtYWluQXBwUm91dGVzXFxcIjogW1xcbiAgICAgIFxcXCIvb3ZlcnZpZXdcXFwiLFxcbiAgICAgIFxcXCIvdG9kb1xcXCIsXFxuICAgICAgXFxcIi9wcm9maWxlXFxcIlxcbiAgICBdLFxcbiAgICBcXFwibm9uQ2xvc2FibGVSb3V0ZXNcXFwiOiBbXFxuICAgICAgXFxcIi9vdmVydmlld1xcXCJcXG4gICAgXSxcXG4gICAgXFxcImhvbWVSb3V0ZVxcXCI6IFxcXCIvb3ZlcnZpZXdcXFwiLFxcbiAgICBcXFwic2tpcFRhYmJhclJvdXRlc1xcXCI6IFtcXG4gICAgICBcXFwiL2xvZ2luXFxcIixcXG4gICAgICBcXFwiL3JlZ2lzdGVyXFxcIixcXG4gICAgICBcXFwiL2ZvcmdldC1wYXNzd29yZFxcXCJcXG4gICAgXVxcbiAgfVxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9tb2JpbGUtYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJtb2JpbGVcXFwiLFxcbiAgXFxcIm5hbWVcXFwiOiBcXFwiYXBwLm5hbWVcXFwiLFxcbiAgXFxcImRlc2NyaXB0aW9uXFxcIjogXFxcImFwcC5kZXNjcmlwdGlvblxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvbW9iaWxlXFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwibW9iaWxlLmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwic3ViXFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIlxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9vcGVyYXRpb25zLWFwcC9zcmMvYXBwLnRzJzogXCJ7XFxuICBcXFwiaWRcXFwiOiBcXFwib3BlcmF0aW9uc1xcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJcdThGRDBcdTdFRjRcdTVFOTRcdTc1MjhcXFwiLFxcbiAgXFxcImRlc2NyaXB0aW9uXFxcIjogXFxcIkJUQ1x1OEY2Nlx1OTVGNFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERiAtIFx1OEZEMFx1N0VGNFx1NUU5NFx1NzUyOFxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvb3BlcmF0aW9uc1xcXCIsXFxuICBcXFwic3ViZG9tYWluXFxcIjogXFxcIm9wZXJhdGlvbnMuYmVsbGlzLmNvbS5jblxcXCIsXFxuICBcXFwidHlwZVxcXCI6IFxcXCJzdWJcXFwiLFxcbiAgXFxcImVuYWJsZWRcXFwiOiB0cnVlLFxcbiAgXFxcInZlcnNpb25cXFwiOiBcXFwiMS4wLjBcXFwiXFxufVwiLFxuICAgICcuLi8uLi8uLi9hcHBzL3BlcnNvbm5lbC1hcHAvc3JjL2FwcC50cyc6IFwie1xcbiAgXFxcImlkXFxcIjogXFxcInBlcnNvbm5lbFxcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJcdTRFQkFcdTRFOEJcdTVFOTRcdTc1MjhcXFwiLFxcbiAgXFxcImRlc2NyaXB0aW9uXFxcIjogXFxcIkJUQ1x1OEY2Nlx1OTVGNFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERiAtIFx1NEVCQVx1NEU4Qlx1NUU5NFx1NzUyOFxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvcGVyc29ubmVsXFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwicGVyc29ubmVsLmJlbGxpcy5jb20uY25cXFwiLFxcbiAgXFxcInR5cGVcXFwiOiBcXFwic3ViXFxcIixcXG4gIFxcXCJlbmFibGVkXFxcIjogdHJ1ZSxcXG4gIFxcXCJ2ZXJzaW9uXFxcIjogXFxcIjEuMC4wXFxcIlxcbn1cIixcbiAgICAnLi4vLi4vLi4vYXBwcy9wcm9kdWN0aW9uLWFwcC9zcmMvYXBwLnRzJzogXCJ7XFxuICBcXFwiaWRcXFwiOiBcXFwicHJvZHVjdGlvblxcXCIsXFxuICBcXFwibmFtZVxcXCI6IFxcXCJhcHAubmFtZVxcXCIsXFxuICBcXFwiZGVzY3JpcHRpb25cXFwiOiBcXFwiY29tbW9uLnN5c3RlbS5idGNfc2hvcF9tYW5hZ2VtZW50X3N5c3RlbVxcXCIsXFxuICBcXFwicGF0aFByZWZpeFxcXCI6IFxcXCIvcHJvZHVjdGlvblxcXCIsXFxuICBcXFwic3ViZG9tYWluXFxcIjogXFxcInByb2R1Y3Rpb24uYmVsbGlzLmNvbS5jblxcXCIsXFxuICBcXFwidHlwZVxcXCI6IFxcXCJzdWJcXFwiLFxcbiAgXFxcImVuYWJsZWRcXFwiOiB0cnVlLFxcbiAgXFxcInZlcnNpb25cXFwiOiBcXFwiMS4wLjBcXFwiXFxufVwiLFxuICAgICcuLi8uLi8uLi9hcHBzL3F1YWxpdHktYXBwL3NyYy9hcHAudHMnOiBcIntcXG4gIFxcXCJpZFxcXCI6IFxcXCJxdWFsaXR5XFxcIixcXG4gIFxcXCJuYW1lXFxcIjogXFxcImFwcC5uYW1lXFxcIixcXG4gIFxcXCJkZXNjcmlwdGlvblxcXCI6IFxcXCJjb21tb24uc3lzdGVtLmJ0Y19zaG9wX21hbmFnZW1lbnRfc3lzdGVtXFxcIixcXG4gIFxcXCJwYXRoUHJlZml4XFxcIjogXFxcIi9xdWFsaXR5XFxcIixcXG4gIFxcXCJzdWJkb21haW5cXFwiOiBcXFwicXVhbGl0eS5iZWxsaXMuY29tLmNuXFxcIixcXG4gIFxcXCJ0eXBlXFxcIjogXFxcInN1YlxcXCIsXFxuICBcXFwiZW5hYmxlZFxcXCI6IHRydWUsXFxuICBcXFwidmVyc2lvblxcXCI6IFxcXCIxLjAuMFxcXCJcXG59XCIsXG4gICAgJy4uLy4uLy4uL2FwcHMvc3lzdGVtLWFwcC9zcmMvYXBwLnRzJzogXCJ7XFxuICBcXFwiaWRcXFwiOiBcXFwic3lzdGVtXFxcIixcXG4gIFxcXCJuYW1lXFxcIjogXFxcIlx1N0NGQlx1N0VERlx1NUU5NFx1NzUyOFxcXCIsXFxuICBcXFwiZGVzY3JpcHRpb25cXFwiOiBcXFwiQlRDXHU4RjY2XHU5NUY0XHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGIC0gXHU3Q0ZCXHU3RURGXHU1RTk0XHU3NTI4XFxcIixcXG4gIFxcXCJwYXRoUHJlZml4XFxcIjogXFxcIi9zeXN0ZW1cXFwiLFxcbiAgXFxcInN1YmRvbWFpblxcXCI6IFxcXCJzeXN0ZW0uYmVsbGlzLmNvbS5jblxcXCIsXFxuICBcXFwidHlwZVxcXCI6IFxcXCJzdWJcXFwiLFxcbiAgXFxcImVuYWJsZWRcXFwiOiB0cnVlLFxcbiAgXFxcInZlcnNpb25cXFwiOiBcXFwiMS4wLjBcXFwiXFxufVwiLFxufTtcblxuLyoqXG4gKiBcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdTY2MjBcdTVDMDRcbiAqIFx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NjVGNlx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MCBKU09OIFx1NUI1N1x1N0IyNlx1NEUzMlxuICovXG5leHBvcnQgY29uc3QgYXBwQ29uZmlnc01hcDogUmVjb3JkPHN0cmluZywgQXBwSWRlbnRpdHk+ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICBPYmplY3QuZW50cmllcyhhcHBDb25maWdzSnNvbk1hcCkubWFwKChbcGF0aCwganNvblN0cl0pID0+IFtcbiAgICBwYXRoLFxuICAgIEpTT04ucGFyc2UoanNvblN0cikgYXMgQXBwSWRlbnRpdHksXG4gIF0pXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXGFwcC1zY2FubmVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1zY2FubmVyLnRzXCI7LyoqXG4gKiBcdTVFOTRcdTc1MjhcdTUyQThcdTYwMDFcdTYyNkJcdTYzQ0ZcdTU2NjhcbiAqIFx1NTNDMlx1ODAwMyBjb29sLWFkbWluIFx1NzY4NFx1NUI5RVx1NzNCMFx1RkYwQ1x1ODFFQVx1NTJBOFx1NjI2Qlx1NjNDRiBhcHBzIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuXG5pbXBvcnQgdHlwZSB7IEFwcElkZW50aXR5IH0gZnJvbSAnLi9hcHAtaWRlbnRpdHkudHlwZXMnO1xuLy8gXHU1QkZDXHU1MTY1IFpvZCBcdTlBOENcdThCQzFcdTVERTVcdTUxNzdcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDlcbmltcG9ydCB7IEFwcElkZW50aXR5U2NoZW1hLCB2YWxpZGF0ZUNvbmZpZyB9IGZyb20gJy4vc2NoZW1hcyc7XG5cbi8qKlxuICogXHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU3NTFGXHU2MjEwXHU3Njg0XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHU1QkZDXHU1MTY1XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKiBcdThGRDlcdTRFOUJcdTkxNERcdTdGNkVcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTVERjJcdTdFQ0ZcdTg4QUJcdTUxODVcdTgwNTRcdTRFM0EgSlNPTlx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1OEZEMFx1ODg0Q1x1NjVGNlx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVxuICovXG5pbXBvcnQgeyBhcHBDb25maWdzTWFwIH0gZnJvbSAnLi9hcHAtY29uZmlncy1jb2xsZWN0ZWQnO1xuXG4vKipcbiAqIFx1NUU5NFx1NzUyOFx1NkNFOFx1NTE4Q1x1ODg2OFxuICogXHU0RjdGXHU3NTI4XHU3QUNCXHU1MzczXHU2MjY3XHU4ODRDXHU3Njg0XHU1MjFEXHU1OUNCXHU1MzE2XHVGRjBDXHU3ODZFXHU0RkREXHU1NzI4XHU0RjdGXHU3NTI4XHU1MjREXHU1REYyXHU3RUNGXHU1MjFEXHU1OUNCXHU1MzE2XG4gKiBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGN0ZcdTc1MjhcdTUxRkRcdTY1NzBcdTc4NkVcdTRGREQgTWFwIFx1NUI5RVx1NEY4Qlx1NjAzQlx1NjYyRlx1NUI1OFx1NTcyOFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OFxuICovXG5mdW5jdGlvbiBnZXRBcHBSZWdpc3RyeSgpOiBNYXA8c3RyaW5nLCBBcHBJZGVudGl0eT4ge1xuICAvLyBcdTRGN0ZcdTc1MjhcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcdTVCNThcdTUwQThcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTY1NzRcdTRFMkFcdTVFOTRcdTc1MjhcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTRFMkRcdTkwRkRcdTY2MkZcdTU0MENcdTRFMDBcdTRFMkFcdTVCOUVcdTRGOEJcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIGdsb2JhbFRoaXMgXHU1QjU4XHU1NzI4XHVGRjBDXHU1RTc2XHU0RTE0XHU2MDNCXHU2NjJGXHU4RkQ0XHU1NkRFXHU0RTAwXHU0RTJBXHU2NzA5XHU2NTQ4XHU3Njg0IE1hcCBcdTVCOUVcdTRGOEJcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBcdTU5ODJcdTY3OUMgZ2xvYmFsVGhpcyBcdTRFMERcdTVCNThcdTU3MjhcdUZGMDhcdTY3ODFcdTVDMTFcdTY1NzBcdTYwQzVcdTUxQjVcdUZGMDlcdUZGMENcdTRGN0ZcdTc1Mjggd2luZG93IFx1NjIxNiBnbG9iYWxcbiAgICAgIGNvbnN0IGdsb2JhbE9iaiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDoge30pO1xuICAgICAgaWYgKHR5cGVvZiAoZ2xvYmFsT2JqIGFzIGFueSkuX19CVENfQVBQX1JFR0lTVFJZX18gPT09ICd1bmRlZmluZWQnIHx8ICEoKGdsb2JhbE9iaiBhcyBhbnkpLl9fQlRDX0FQUF9SRUdJU1RSWV9fIGluc3RhbmNlb2YgTWFwKSkge1xuICAgICAgICAoZ2xvYmFsT2JqIGFzIGFueSkuX19CVENfQVBQX1JFR0lTVFJZX18gPSBuZXcgTWFwPHN0cmluZywgQXBwSWRlbnRpdHk+KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGdsb2JhbE9iaiBhcyBhbnkpLl9fQlRDX0FQUF9SRUdJU1RSWV9fO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIChnbG9iYWxUaGlzIGFzIGFueSkuX19CVENfQVBQX1JFR0lTVFJZX18gPT09ICd1bmRlZmluZWQnIHx8ICEoKGdsb2JhbFRoaXMgYXMgYW55KS5fX0JUQ19BUFBfUkVHSVNUUllfXyBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgKGdsb2JhbFRoaXMgYXMgYW55KS5fX0JUQ19BUFBfUkVHSVNUUllfXyA9IG5ldyBNYXA8c3RyaW5nLCBBcHBJZGVudGl0eT4oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fQlRDX0FQUF9SRUdJU1RSWV9fO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdTYyNDBcdTY3MDlcdTVDMURcdThCRDVcdTkwRkRcdTU5MzFcdThEMjVcdUZGMENcdTUyMUJcdTVFRkFcdTRFMDBcdTRFMkFcdTY1QjBcdTc2ODQgTWFwIFx1NUI5RVx1NEY4Qlx1RkYwOFx1ODY3RFx1NzEzNlx1NEUwRFx1NUU5NFx1OEJFNVx1NTNEMVx1NzUxRlx1RkYwOVxuICAgIGxvZ2dlci53YXJuKCdbYXBwLXNjYW5uZXJdIGdldEFwcFJlZ2lzdHJ5KCkgXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1XHVGRjBDXHU1MjFCXHU1RUZBXHU2NUIwXHU1QjlFXHU0RjhCJywgZXJyb3IpO1xuICAgIHJldHVybiBuZXcgTWFwPHN0cmluZywgQXBwSWRlbnRpdHk+KCk7XG4gIH1cbn1cblxuY29uc3QgYXBwUmVnaXN0cnkgPSBnZXRBcHBSZWdpc3RyeSgpO1xuXG4vKipcbiAqIFx1NTIxRFx1NTlDQlx1NTMxNlx1NjgwN1x1NUZEN1x1RkYwQ1x1Nzg2RVx1NEZERFx1NTNFQVx1NTIxRFx1NTlDQlx1NTMxNlx1NEUwMFx1NkIyMVxuICovXG5sZXQgaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4vKipcbiAqIFx1NEVDRVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjNEMFx1NTNENlx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICovXG5mdW5jdGlvbiBleHRyYWN0QXBwTmFtZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU0RUNFXHU4REVGXHU1Rjg0IGFwcHMvYWRtaW4tYXBwL3NyYy9hcHAudHMgXHU2M0QwXHU1M0Q2IGFkbWluXG4gIC8vIFx1NEVDRVx1OERFRlx1NUY4NCBhcHBzL2RvY3MtYXBwL3NyYy9hcHAudHMgXHU2M0QwXHU1M0Q2IGRvY3NcbiAgLy8gXHU1MzM5XHU5MTREIGFwcHMvIFx1NTQ4QyAtYXBwLyBcdTRFNEJcdTk1RjRcdTc2ODRcdTYyNDBcdTY3MDlcdTUxODVcdTVCQjlcdUZGMDhcdTUzMDVcdTYyRUNcdThGREVcdTVCNTdcdTdCMjZcdUZGMDlcbiAgY29uc3QgbWF0Y2ggPSBmaWxlUGF0aC5tYXRjaCgvYXBwc1xcLyguKz8pLWFwcFxcLy8pO1xuICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2hbMV0gPyBtYXRjaFsxXSA6ICcnO1xufVxuXG4vKipcbiAqIFx1OUE4Q1x1OEJDMVx1NUU5NFx1NzUyOFx1OEVBQlx1NEVGRFx1OTE0RFx1N0Y2RVxuICogXHU0RjdGXHU3NTI4IFpvZCBzY2hlbWEgXHU4RkRCXHU4ODRDXHU5QThDXHU4QkMxXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQXBwSWRlbnRpdHkoaWRlbnRpdHk6IGFueSwgYXBwTmFtZTogc3RyaW5nKTogaWRlbnRpdHkgaXMgQXBwSWRlbnRpdHkge1xuICB0cnkge1xuICAgIC8vIFx1NEY3Rlx1NzUyOCBab2Qgc2NoZW1hIFx1OUE4Q1x1OEJDMVxuICAgIHZhbGlkYXRlQ29uZmlnKEFwcElkZW50aXR5U2NoZW1hLCBpZGVudGl0eSwgYFx1NUU5NFx1NzUyOCAke2FwcE5hbWV9IFx1NzY4NFx1OEVBQlx1NEVGRFx1OTE0RFx1N0Y2RWApO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1OUE4Q1x1OEJDMVx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJCMFx1NUY1NVx1OEI2Nlx1NTQ0QVx1NEY0Nlx1OEZENFx1NTZERSBmYWxzZVx1RkYwOFx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYwOVxuICAgIGlmIChpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICBsb2dnZXIud2FybihgW2FwcC1zY2FubmVyXSBcdTVFOTRcdTc1MjggJHthcHBOYW1lfSBcdTc2ODRcdTkxNERcdTdGNkVcdTlBOENcdThCQzFcdTU5MzFcdThEMjU6YCwgZXJyb3IpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTYyNkJcdTYzQ0ZcdTVFNzZcdTZDRThcdTUxOENcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcbiAqIFx1NEY3Rlx1NzUyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NzUxRlx1NjIxMFx1NzY4NFx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZEMFx1ODg0Q1x1NjVGNlx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NTkzMVx1OEQyNVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbkFuZFJlZ2lzdGVyQXBwcygpOiBNYXA8c3RyaW5nLCBBcHBJZGVudGl0eT4ge1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZCQ0ZcdTZCMjFcdTkwRkRcdTkxQ0RcdTY1QjBcdTgzQjdcdTUzRDYgYXBwUmVnaXN0cnlcdUZGMENcdTc4NkVcdTRGRERcdTRGN0ZcdTc1MjhcdTc2ODRcdTY2MkZcdTY3MDBcdTY1QjBcdTc2ODRcdTVCOUVcdTRGOEJcbiAgY29uc3QgcmVnaXN0cnkgPSBnZXRBcHBSZWdpc3RyeSgpO1xuXG4gIC8vIFx1NUI4OVx1NTE2OFx1OEMwM1x1NzUyOCBjbGVhclx1RkYwQ1x1Nzg2RVx1NEZERCByZWdpc3RyeSBcdTVERjJcdTUyMURcdTU5Q0JcdTUzMTZcdTRFMTRcdTY2MkZcdTY3MDlcdTY1NDhcdTc2ODQgTWFwIFx1NUI5RVx1NEY4QlxuICBpZiAocmVnaXN0cnkgJiYgcmVnaXN0cnkgaW5zdGFuY2VvZiBNYXAgJiYgdHlwZW9mIHJlZ2lzdHJ5LmNsZWFyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlZ2lzdHJ5LmNsZWFyKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5QyBjbGVhciBcdTU5MzFcdThEMjVcdUZGMENcdTkxQ0RcdTY1QjBcdTUyMURcdTU5Q0JcdTUzMTYgcmVnaXN0cnlcbiAgICAgIGxvZ2dlci53YXJuKCdbYXBwLXNjYW5uZXJdIHJlZ2lzdHJ5LmNsZWFyKCkgXHU1OTMxXHU4RDI1XHVGRjBDXHU5MUNEXHU2NUIwXHU1MjFEXHU1OUNCXHU1MzE2JywgZXJyb3IpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIChnbG9iYWxUaGlzIGFzIGFueSkuX19CVENfQVBQX1JFR0lTVFJZX18gPSBuZXcgTWFwPHN0cmluZywgQXBwSWRlbnRpdHk+KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZ2xvYmFsT2JqID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB7fSk7XG4gICAgICAgICAgKGdsb2JhbE9iaiBhcyBhbnkpLl9fQlRDX0FQUF9SRUdJU1RSWV9fID0gbmV3IE1hcDxzdHJpbmcsIEFwcElkZW50aXR5PigpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTFDRFx1NjVCMFx1NTIxRFx1NTlDQlx1NTMxNlx1NEU1Rlx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RCByZWdpc3RyeVx1RkYwOFx1ODY3RFx1NzEzNlx1NTNFRlx1ODBGRFx1NjcwOVx1OTVFRVx1OTg5OFx1RkYwOVxuICAgICAgICBsb2dnZXIuZXJyb3IoJ1thcHAtc2Nhbm5lcl0gXHU2NUUwXHU2Q0Q1XHU5MUNEXHU2NUIwXHU1MjFEXHU1OUNCXHU1MzE2IHJlZ2lzdHJ5JywgZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFx1NTk4Mlx1Njc5QyByZWdpc3RyeSBcdTRFMERcdTVCNThcdTU3MjhcdTYyMTZcdTRFMERcdTY2MkZcdTY3MDlcdTY1NDhcdTc2ODQgTWFwXHVGRjBDXHU5MUNEXHU2NUIwXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgKGdsb2JhbFRoaXMgYXMgYW55KS5fX0JUQ19BUFBfUkVHSVNUUllfXyA9IG5ldyBNYXA8c3RyaW5nLCBBcHBJZGVudGl0eT4oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGdsb2JhbE9iaiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDoge30pO1xuICAgICAgICAoZ2xvYmFsT2JqIGFzIGFueSkuX19CVENfQVBQX1JFR0lTVFJZX18gPSBuZXcgTWFwPHN0cmluZywgQXBwSWRlbnRpdHk+KCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdbYXBwLXNjYW5uZXJdIFx1NjVFMFx1NkNENVx1NTIxRFx1NTlDQlx1NTMxNiByZWdpc3RyeScsIGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFx1OTFDRFx1NjVCMFx1ODNCN1x1NTNENiByZWdpc3RyeVx1RkYwOFx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1ODhBQlx1OTFDRFx1NjVCMFx1NTIxQlx1NUVGQVx1RkYwOVxuICBjb25zdCBmaW5hbFJlZ2lzdHJ5ID0gZ2V0QXBwUmVnaXN0cnkoKTtcblxuICAvLyBcdTc4NkVcdTRGREQgYXBwQ29uZmlnc01hcCBcdTVCNThcdTU3MjhcdTRFMTRcdTY2MkZcdTVCRjlcdThDNjFcdUZGMDhcdTY4QzBcdTY3RTUgbnVsbCBcdTU0OENcdTY1NzBcdTdFQzRcdUZGMDlcbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBdHlwZW9mIG51bGwgPT09ICdvYmplY3QnXHVGRjBDXHU2MjQwXHU0RUU1XHU5NzAwXHU4OTgxXHU5ODlEXHU1OTE2XHU2OEMwXHU2N0U1XG4gIGlmICghYXBwQ29uZmlnc01hcCB8fCB0eXBlb2YgYXBwQ29uZmlnc01hcCAhPT0gJ29iamVjdCcgfHwgYXBwQ29uZmlnc01hcCA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGFwcENvbmZpZ3NNYXApKSB7XG4gICAgLy8gXHU1M0VBXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU2MjE2XHU3NzFGXHU2QjYzXHU2NzA5XHU5NUVFXHU5ODk4XHU2NUY2XHU2MjREXHU4QjY2XHU1NDRBXG4gICAgaWYgKGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgIGxvZ2dlci53YXJuKCdbYXBwLXNjYW5uZXJdIGFwcENvbmZpZ3NNYXAgXHU0RTBEXHU1QjU4XHU1NzI4XHU2MjE2XHU0RTBEXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjBDXHU4REYzXHU4RkM3XHU2MjZCXHU2M0NGJywgeyBhcHBDb25maWdzTWFwIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmluYWxSZWdpc3RyeTtcbiAgfVxuXG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERCBhcHBDb25maWdzTWFwIFx1NEUwRFx1NjYyRiBudWxsIFx1NjIxNiB1bmRlZmluZWRcbiAgY29uc3QgYXBwQ29uZmlnc0VudHJpZXMgPSBPYmplY3QuZW50cmllcyhhcHBDb25maWdzTWFwIHx8IHt9KTtcbiAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGFwcENvbmZpZ10gb2YgYXBwQ29uZmlnc0VudHJpZXMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXBwTmFtZSA9IGV4dHJhY3RBcHBOYW1lKGZpbGVQYXRoKTtcblxuICAgICAgaWYgKCFhcHBOYW1lKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXZhbGlkYXRlQXBwSWRlbnRpdHkoYXBwQ29uZmlnLCBhcHBOYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU3ODZFXHU0RkREIGlkIFx1NEUwRSBhcHBOYW1lIFx1NEUwMFx1ODFGNFx1RkYwOFx1NTk4Mlx1Njc5Q1x1OTE0RFx1N0Y2RVx1NEUyRFx1NzY4NCBpZCBcdTRFMERcdTU0MENcdUZGMENcdTRGN0ZcdTc1MjggYXBwTmFtZVx1RkYwOVxuICAgICAgY29uc3QgaWRlbnRpdHk6IEFwcElkZW50aXR5ID0ge1xuICAgICAgICAuLi5hcHBDb25maWcsXG4gICAgICAgIGlkOiBhcHBDb25maWcuaWQgfHwgYXBwTmFtZSxcbiAgICAgIH07XG5cbiAgICAgIGZpbmFsUmVnaXN0cnkuc2V0KGlkZW50aXR5LmlkLCBpZGVudGl0eSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgW2FwcC1zY2FubmVyXSBcdTI3NEMgXHU2MjZCXHU2M0NGXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU1OTMxXHU4RDI1OiAke2ZpbGVQYXRofWAsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmluYWxSZWdpc3RyeTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVERjJcdTZDRThcdTUxOENcdTc2ODRcdTVFOTRcdTc1MjhcbiAqIFx1NEY3Rlx1NzUyOFx1NTIxRFx1NTlDQlx1NTMxNlx1NjgwN1x1NUZEN1x1Nzg2RVx1NEZERFx1N0VCRlx1N0EwQlx1NUI4OVx1NTE2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsQXBwcygpOiBBcHBJZGVudGl0eVtdIHtcbiAgY29uc3QgcmVnaXN0cnkgPSBnZXRBcHBSZWdpc3RyeSgpO1xuICBpZiAoIWlzSW5pdGlhbGl6ZWQgfHwgcmVnaXN0cnkuc2l6ZSA9PT0gMCkge1xuICAgIHNjYW5BbmRSZWdpc3RlckFwcHMoKTtcbiAgICBpc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gQXJyYXkuZnJvbShyZWdpc3RyeS52YWx1ZXMoKSk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFIElEIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFxuICogXHU0RjdGXHU3NTI4XHU1MjFEXHU1OUNCXHU1MzE2XHU2ODA3XHU1RkQ3XHU3ODZFXHU0RkREXHU3RUJGXHU3QTBCXHU1Qjg5XHU1MTY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBCeUlkKGlkOiBzdHJpbmcpOiBBcHBJZGVudGl0eSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHJlZ2lzdHJ5ID0gZ2V0QXBwUmVnaXN0cnkoKTtcbiAgaWYgKCFpc0luaXRpYWxpemVkIHx8IHJlZ2lzdHJ5LnNpemUgPT09IDApIHtcbiAgICBzY2FuQW5kUmVnaXN0ZXJBcHBzKCk7XG4gICAgaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHJlZ2lzdHJ5LmdldChpZCk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1QjUwXHU1RTk0XHU3NTI4XHVGRjA4XHU2MzkyXHU5NjY0XHU0RTNCXHU1RTk0XHU3NTI4XHU1NDhDXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdWJBcHBzKCk6IEFwcElkZW50aXR5W10ge1xuICByZXR1cm4gZ2V0QWxsQXBwcygpLmZpbHRlcihhcHAgPT4gYXBwLnR5cGUgPT09ICdzdWInICYmIGFwcC5lbmFibGVkKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTRFM0JcdTVFOTRcdTc1MjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1haW5BcHAoKTogQXBwSWRlbnRpdHkgfCB1bmRlZmluZWQge1xuICByZXR1cm4gZ2V0QWxsQXBwcygpLmZpbmQoYXBwID0+IGFwcC50eXBlID09PSAnbWFpbicpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1NjdFNVx1NjI3RVx1NUU5NFx1NzUyOFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQnlQYXRoUHJlZml4KHBhdGhQcmVmaXg6IHN0cmluZyk6IEFwcElkZW50aXR5IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGdldEFsbEFwcHMoKS5maW5kKGFwcCA9PiBhcHAucGF0aFByZWZpeCA9PT0gcGF0aFByZWZpeCk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1QjUwXHU1N0RGXHU1NDBEXHU2N0U1XHU2MjdFXHU1RTk0XHU3NTI4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBCeVN1YmRvbWFpbihzdWJkb21haW46IHN0cmluZyk6IEFwcElkZW50aXR5IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGdldEFsbEFwcHMoKS5maW5kKGFwcCA9PiBhcHAuc3ViZG9tYWluID09PSBzdWJkb21haW4pO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXHVuaWZpZWQtZW52LWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy91bmlmaWVkLWVudi1jb25maWcudHNcIjsvKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVx1N0NGQlx1N0VERlxuICogXHU2NTJGXHU2MzAxXHU5MDFBXHU4RkM3IC5lbnYgXHU1MjA3XHU2MzYyXHU5MTREXHU3RjZFXHU2NUI5XHU2ODQ4XHVGRjBDXHU0RjQ2XHU1MTg1XHU5MEU4XHU4OUM0XHU1MjE5XHU0RTBEXHU1M0Q4XG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5cbmltcG9ydCB7IGdldEFsbEFwcHMsIGdldEFwcEJ5SWQgfSBmcm9tICcuL2FwcC1zY2FubmVyJztcbmltcG9ydCB7IGdldEFsbERldlBvcnRzLCBnZXRBbGxQcmVQb3J0cywgZ2V0QXBwQ29uZmlnLCBnZXRBcHBDb25maWdCeVByZVBvcnQsIGdldEFwcENvbmZpZ0J5VGVzdEhvc3QsIGlzU3BlY2lhbEFwcEJ5SWQgfSBmcm9tICcuL2FwcC1lbnYuY29uZmlnJztcblxuZXhwb3J0IHR5cGUgRW52aXJvbm1lbnQgPSAnZGV2ZWxvcG1lbnQnIHwgJ3ByZXZpZXcnIHwgJ3Rlc3QnIHwgJ3Byb2R1Y3Rpb24nO1xuZXhwb3J0IHR5cGUgQ29uZmlnU2NoZW1lID0gJ2RlZmF1bHQnIHwgJ2N1c3RvbSc7IC8vIFx1NTNFRlx1NEVFNVx1OTAxQVx1OEZDNyAuZW52IFx1NTIwN1x1NjM2MlxuXG5leHBvcnQgaW50ZXJmYWNlIEVudmlyb25tZW50Q29uZmlnIHtcbiAgLy8gQVBJIFx1OTE0RFx1N0Y2RVxuICBhcGk6IHtcbiAgICBiYXNlVVJMOiBzdHJpbmc7XG4gICAgdGltZW91dDogbnVtYmVyO1xuICAgIGJhY2tlbmRUYXJnZXQ/OiBzdHJpbmc7XG4gIH07XG5cbiAgLy8gXHU1RkFFXHU1MjREXHU3QUVGXHU5MTREXHU3RjZFXG4gIG1pY3JvQXBwOiB7XG4gICAgYmFzZVVSTDogc3RyaW5nO1xuICAgIGVudHJ5UHJlZml4OiBzdHJpbmc7XG4gIH07XG5cbiAgLy8gXHU2NTg3XHU2ODYzXHU5MTREXHU3RjZFXG4gIGRvY3M6IHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBwb3J0OiBzdHJpbmc7XG4gIH07XG5cbiAgLy8gV2ViU29ja2V0IFx1OTE0RFx1N0Y2RVxuICB3czoge1xuICAgIHVybDogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFx1NEUwQVx1NEYyMFx1OTE0RFx1N0Y2RVxuICB1cGxvYWQ6IHtcbiAgICB1cmw6IHN0cmluZztcbiAgfTtcblxuICAvLyBDRE4gXHU5MTREXHU3RjZFXG4gIGNkbjoge1xuICAgIHN0YXRpY0Fzc2V0c1VybDogc3RyaW5nO1xuICB9O1xufVxuXG4vLyBcdTkxNERcdTdGNkVcdTY1QjlcdTY4NDhcdUZGMUFcdTdDN0JcdTRGM0MgRWxlbWVudCBQbHVzIFx1NEUzQlx1OTg5OFxuY29uc3QgY29uZmlnU2NoZW1lczogUmVjb3JkPENvbmZpZ1NjaGVtZSwgUmVjb3JkPEVudmlyb25tZW50LCBFbnZpcm9ubWVudENvbmZpZz4+ID0ge1xuICBkZWZhdWx0OiB7XG4gICAgZGV2ZWxvcG1lbnQ6IHtcbiAgICAgIGFwaToge1xuICAgICAgICBiYXNlVVJMOiAnL2FwaScsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgICBiYWNrZW5kVGFyZ2V0OiAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJy8vMTAuODAuOC4xOTknLFxuICAgICAgICBlbnRyeVByZWZpeDogJycsXG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwOTInLFxuICAgICAgICBwb3J0OiAnODA5MicsXG4gICAgICB9LFxuICAgICAgd3M6IHtcbiAgICAgICAgdXJsOiAnd3M6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgICAgfSxcbiAgICAgIHVwbG9hZDoge1xuICAgICAgICB1cmw6ICcvYXBpL3VwbG9hZCcsXG4gICAgICB9LFxuICAgICAgY2RuOiB7XG4gICAgICAgIHN0YXRpY0Fzc2V0c1VybDogJycsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHA6Ly9sb2NhbGhvc3QnLFxuICAgICAgICBlbnRyeVByZWZpeDogJy9pbmRleC5odG1sJyxcbiAgICAgIH0sXG4gICAgICBkb2NzOiB7XG4gICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE3MycsXG4gICAgICAgIHBvcnQ6ICc0MTczJyxcbiAgICAgIH0sXG4gICAgICB3czoge1xuICAgICAgICB1cmw6ICd3czovL2xvY2FsaG9zdDo4MTE1JyxcbiAgICAgIH0sXG4gICAgICB1cGxvYWQ6IHtcbiAgICAgICAgdXJsOiAnL2FwaS91cGxvYWQnLFxuICAgICAgfSxcbiAgICAgIGNkbjoge1xuICAgICAgICBzdGF0aWNBc3NldHNVcmw6ICcnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRlc3Q6IHtcbiAgICAgIGFwaToge1xuICAgICAgICBiYXNlVVJMOiAnL2FwaScsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgfSxcbiAgICAgIG1pY3JvQXBwOiB7XG4gICAgICAgIGJhc2VVUkw6ICdodHRwczovL3Rlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJywgLy8gXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RTBFXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwczovL2RvY3MudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICAgICAgcG9ydDogJycsXG4gICAgICB9LFxuICAgICAgd3M6IHtcbiAgICAgICAgdXJsOiAnd3NzOi8vYXBpLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgICB9LFxuICAgICAgdXBsb2FkOiB7XG4gICAgICAgIHVybDogJy9hcGkvdXBsb2FkJyxcbiAgICAgIH0sXG4gICAgICBjZG46IHtcbiAgICAgICAgc3RhdGljQXNzZXRzVXJsOiAnaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbicsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJvZHVjdGlvbjoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHBzOi8vYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJywgLy8gXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwczovL2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIHBvcnQ6ICcnLFxuICAgICAgfSxcbiAgICAgIHdzOiB7XG4gICAgICAgIHVybDogJ3dzczovL2FwaS5iZWxsaXMuY29tLmNuJyxcbiAgICAgIH0sXG4gICAgICB1cGxvYWQ6IHtcbiAgICAgICAgdXJsOiAnL2FwaS91cGxvYWQnLFxuICAgICAgfSxcbiAgICAgIGNkbjoge1xuICAgICAgICBzdGF0aWNBc3NldHNVcmw6ICdodHRwczovL2FsbC5iZWxsaXMuY29tLmNuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgY3VzdG9tOiB7XG4gICAgLy8gXHU1M0VGXHU0RUU1XHU5MDFBXHU4RkM3IC5lbnYgXHU1QjlBXHU0RTQ5XHU4MUVBXHU1QjlBXHU0RTQ5XHU5MTREXHU3RjZFXHU2NUI5XHU2ODQ4XG4gICAgLy8gXHU4RkQ5XHU5MUNDXHU1M0VGXHU0RUU1XHU2MjY5XHU1QzU1XHU1MTc2XHU0RUQ2XHU5MTREXHU3RjZFXHU2NUI5XHU2ODQ4XG4gICAgZGV2ZWxvcG1lbnQ6IHtcbiAgICAgIGFwaToge1xuICAgICAgICBiYXNlVVJMOiAnL2FwaScsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgICBiYWNrZW5kVGFyZ2V0OiAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJy8vMTAuODAuOC4xOTknLFxuICAgICAgICBlbnRyeVByZWZpeDogJycsXG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwOTInLFxuICAgICAgICBwb3J0OiAnODA5MicsXG4gICAgICB9LFxuICAgICAgd3M6IHtcbiAgICAgICAgdXJsOiAnd3M6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgICAgfSxcbiAgICAgIHVwbG9hZDoge1xuICAgICAgICB1cmw6ICcvYXBpL3VwbG9hZCcsXG4gICAgICB9LFxuICAgICAgY2RuOiB7XG4gICAgICAgIHN0YXRpY0Fzc2V0c1VybDogJycsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHA6Ly9sb2NhbGhvc3QnLFxuICAgICAgICBlbnRyeVByZWZpeDogJy9pbmRleC5odG1sJyxcbiAgICAgIH0sXG4gICAgICBkb2NzOiB7XG4gICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE3MycsXG4gICAgICAgIHBvcnQ6ICc0MTczJyxcbiAgICAgIH0sXG4gICAgICB3czoge1xuICAgICAgICB1cmw6ICd3czovL2xvY2FsaG9zdDo4MTE1JyxcbiAgICAgIH0sXG4gICAgICB1cGxvYWQ6IHtcbiAgICAgICAgdXJsOiAnL2FwaS91cGxvYWQnLFxuICAgICAgfSxcbiAgICAgIGNkbjoge1xuICAgICAgICBzdGF0aWNBc3NldHNVcmw6ICcnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRlc3Q6IHtcbiAgICAgIGFwaToge1xuICAgICAgICBiYXNlVVJMOiAnL2FwaScsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgfSxcbiAgICAgIG1pY3JvQXBwOiB7XG4gICAgICAgIGJhc2VVUkw6ICdodHRwczovL3Rlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJywgLy8gXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RTBFXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwczovL2RvY3MudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICAgICAgcG9ydDogJycsXG4gICAgICB9LFxuICAgICAgd3M6IHtcbiAgICAgICAgdXJsOiAnd3NzOi8vYXBpLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgICB9LFxuICAgICAgdXBsb2FkOiB7XG4gICAgICAgIHVybDogJy9hcGkvdXBsb2FkJyxcbiAgICAgIH0sXG4gICAgICBjZG46IHtcbiAgICAgICAgc3RhdGljQXNzZXRzVXJsOiAnaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbicsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJvZHVjdGlvbjoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHBzOi8vYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJywgLy8gXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwczovL2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIHBvcnQ6ICcnLFxuICAgICAgfSxcbiAgICAgIHdzOiB7XG4gICAgICAgIHVybDogJ3dzczovL2FwaS5iZWxsaXMuY29tLmNuJyxcbiAgICAgIH0sXG4gICAgICB1cGxvYWQ6IHtcbiAgICAgICAgdXJsOiAnL2FwaS91cGxvYWQnLFxuICAgICAgfSxcbiAgICAgIGNkbjoge1xuICAgICAgICBzdGF0aWNBc3NldHNVcmw6ICdodHRwczovL2FsbC5iZWxsaXMuY29tLmNuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU5MTREXHU3RjZFXHU2NUI5XHU2ODQ4XHVGRjA4XHU0RUNFIC5lbnYgXHU4QkZCXHU1M0Q2XHVGRjBDXHU5RUQ4XHU4QkE0IGRlZmF1bHRcdUZGMDlcbiAqL1xuZnVuY3Rpb24gZ2V0Q29uZmlnU2NoZW1lKCk6IENvbmZpZ1NjaGVtZSB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NTcyOCBOb2RlLmpzIFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ2ltcG9ydC5tZXRhLmVudiBcdTUzRUZcdTgwRkRcdTY3MkFcdTVCOUFcdTRFNDlcbiAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSA9PT0gJ3VuZGVmaW5lZCcgfHwgIWltcG9ydC5tZXRhLmVudikge1xuICAgIHJldHVybiAnZGVmYXVsdCc7XG4gIH1cbiAgcmV0dXJuIChpbXBvcnQubWV0YS5lbnYuVklURV9DT05GSUdfU0NIRU1FIGFzIENvbmZpZ1NjaGVtZSkgfHwgJ2RlZmF1bHQnO1xufVxuXG4vKipcbiAqIFx1NjhDMFx1NkQ0Qlx1NUY1M1x1NTI0RFx1NzNBRlx1NTg4M1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW52aXJvbm1lbnQoKTogRW52aXJvbm1lbnQge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBcdTU3MjggTm9kZS5qcyBcdTczQUZcdTU4ODNcdTRFMkRcdUZGMDhcdTU5ODIgVml0ZSBcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMDlcdUZGMENpbXBvcnQubWV0YS5lbnYgXHU1M0VGXHU4MEZEXHU2NzJBXHU1QjlBXHU0RTQ5XG4gICAgLy8gXHU0RjdGXHU3NTI4XHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjBDXHU2M0QwXHU0RjlCXHU1NDBFXHU1OTA3XHU2NUI5XHU2ODQ4XG4gICAgY29uc3QgcHJvZEZsYWcgPVxuICAgICAgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5QUk9EKSA/P1xuICAgICAgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpO1xuICAgIHJldHVybiBwcm9kRmxhZyA/ICdwcm9kdWN0aW9uJyA6ICdkZXZlbG9wbWVudCc7XG4gIH1cblxuICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgY29uc3QgcG9ydCA9IHdpbmRvdy5sb2NhdGlvbi5wb3J0IHx8ICcnO1xuXG4gIC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1RkYxQWhvc3RuYW1lIFx1NEUzQSB0ZXN0LmJlbGxpcy5jb20uY24gXHU2MjE2XHU0RUU1IC50ZXN0LmJlbGxpcy5jb20uY24gXHU3RUQzXHU1QzNFXG4gIC8vIFx1NEY4Qlx1NTk4Mlx1RkYxQXRlc3QuYmVsbGlzLmNvbS5jbiwgYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuXG4gIGlmIChob3N0bmFtZSA9PT0gJ3Rlc3QuYmVsbGlzLmNvbS5jbicgfHwgaG9zdG5hbWUuZW5kc1dpdGgoJy50ZXN0LmJlbGxpcy5jb20uY24nKSkge1xuICAgIHJldHVybiAndGVzdCc7XG4gIH1cblxuICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFob3N0bmFtZSBcdTRFM0EgYmVsbGlzLmNvbS5jbiBcdTYyMTZcdTRFRTUgLmJlbGxpcy5jb20uY24gXHU3RUQzXHU1QzNFXHVGRjBDXHU0RjQ2XHU0RTBEXHU1MzA1XHU1NDJCIC50ZXN0LmJlbGxpcy5jb20uY25cbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1M0VBXHU2OEMwXHU2N0U1IGhvc3RuYW1lXHVGRjBDXHU5MDdGXHU1MTREXHU4REVGXHU1Rjg0XHU0RTJEXHU3Njg0IC90ZXN0LyBcdTg4QUJcdThCRUZcdTUyMjRcbiAgaWYgKFxuICAgIChob3N0bmFtZSA9PT0gJ2JlbGxpcy5jb20uY24nIHx8IGhvc3RuYW1lLmVuZHNXaXRoKCcuYmVsbGlzLmNvbS5jbicpKSAmJlxuICAgICFob3N0bmFtZS5pbmNsdWRlcygnLnRlc3QuYmVsbGlzLmNvbS5jbicpXG4gICkge1xuICAgIHJldHVybiAncHJvZHVjdGlvbic7XG4gIH1cblxuICAvLyBcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGREQgZ2V0QWxsUHJlUG9ydHMgXHU1NDhDIGdldEFsbERldlBvcnRzIFx1NTNFRlx1NEVFNVx1NUI4OVx1NTE2OFx1OEMwM1x1NzUyOFxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwQ1x1NEY3Rlx1NzUyOCB0cnktY2F0Y2ggXHU2MzU1XHU4M0I3XHU5NTE5XHU4QkVGXG4gIHRyeSB7XG4gICAgY29uc3QgcHJlUG9ydHMgPSBnZXRBbGxQcmVQb3J0cygpO1xuICAgIGlmIChwcmVQb3J0cy5pbmNsdWRlcyhwb3J0KSkge1xuICAgICAgcmV0dXJuICdwcmV2aWV3JztcbiAgICB9XG5cbiAgICBjb25zdCBkZXZQb3J0cyA9IGdldEFsbERldlBvcnRzKCk7XG4gICAgaWYgKGRldlBvcnRzLmluY2x1ZGVzKHBvcnQpKSB7XG4gICAgICByZXR1cm4gJ2RldmVsb3BtZW50JztcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDIGdldEFsbFByZVBvcnRzIFx1NjIxNiBnZXRBbGxEZXZQb3J0cyBcdTYyOUJcdTUxRkFcdTk1MTlcdThCRUZcdUZGMDhcdTU5ODIgQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOVxuICAgIC8vIFx1OEJCMFx1NUY1NVx1OEI2Nlx1NTQ0QVx1NUU3Nlx1N0VFN1x1N0VFRFx1NEY3Rlx1NzUyOFx1NTE3Nlx1NEVENlx1NjVCOVx1NkNENVx1NTIyNFx1NjVBRFx1NzNBRlx1NTg4M1xuICAgIGlmIChpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICBsb2dnZXIud2FybignW3VuaWZpZWQtZW52LWNvbmZpZ10gZ2V0QWxsUHJlUG9ydHMvZ2V0QWxsRGV2UG9ydHMgXHU4QzAzXHU3NTI4XHU1OTMxXHU4RDI1XHVGRjBDXHU0RjdGXHU3NTI4XHU1OTA3XHU3NTI4XHU2NUI5XHU2Q0Q1XHU1MjI0XHU2NUFEXHU3M0FGXHU1ODgzOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdUZGMUFcdTk2MzJcdTVGQTFcdTYwMjdcdTU3MzBcdThCQkZcdTk1RUUgaW1wb3J0Lm1ldGEuZW52XG4gIGNvbnN0IHByb2RGbGFnID1cbiAgICAodHlwZW9mIGltcG9ydC5tZXRhICE9PSAndW5kZWZpbmVkJyAmJiBpbXBvcnQubWV0YS5lbnYgJiYgaW1wb3J0Lm1ldGEuZW52LlBST0QpID8/XG4gICAgZmFsc2U7XG4gIHJldHVybiBwcm9kRmxhZyA/ICdwcm9kdWN0aW9uJyA6ICdkZXZlbG9wbWVudCc7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzXHU3Njg0XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnZDb25maWcoKTogRW52aXJvbm1lbnRDb25maWcge1xuICBjb25zdCBzY2hlbWUgPSBnZXRDb25maWdTY2hlbWUoKTtcbiAgY29uc3QgZW52ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgY29uc3QgY29uZmlnID0gY29uZmlnU2NoZW1lc1tzY2hlbWVdW2Vudl07XG5cbiAgLy8gXHU2NTJGXHU2MzAxXHU5MDFBXHU4RkM3XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4OTg2XHU3NkQ2IENETiBVUkxcbiAgLy8gXHU1NzI4XHU2RDRGXHU4OUM4XHU1NjY4XHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU1M0VGXHU0RUU1XHU5MDFBXHU4RkM3IFZJVEVfQ0ROX1NUQVRJQ19BU1NFVFNfVVJMIFx1ODk4Nlx1NzZENlxuICAvLyBcdTU3MjggTm9kZS5qcyBcdTczQUZcdTU4ODNcdTRFMkRcdUZGMDhcdTU5ODIgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDlcdUZGMENcdTUzRUZcdTRFRTVcdTkwMUFcdThGQzcgQ0ROX1NUQVRJQ19BU1NFVFNfVVJMIFx1ODk4Nlx1NzZENlxuICBpZiAoY29uZmlnLmNkbj8uc3RhdGljQXNzZXRzVXJsKSB7XG4gICAgbGV0IGVudkNkblVybDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdUZGMUFcdTRFQ0UgaW1wb3J0Lm1ldGEuZW52IFx1OEJGQlx1NTNENlxuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52KSB7XG4gICAgICAgIGVudkNkblVybCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0NETl9TVEFUSUNfQVNTRVRTX1VSTDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm9kZS5qcyBcdTczQUZcdTU4ODNcdUZGMUFcdTRFQ0UgcHJvY2Vzcy5lbnYgXHU4QkZCXHU1M0Q2XG4gICAgICBlbnZDZG5VcmwgPSBwcm9jZXNzLmVudi5DRE5fU1RBVElDX0FTU0VUU19VUkwgfHwgcHJvY2Vzcy5lbnYuVklURV9DRE5fU1RBVElDX0FTU0VUU19VUkw7XG4gICAgfVxuXG4gICAgaWYgKGVudkNkblVybCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICBjZG46IHtcbiAgICAgICAgICBzdGF0aWNBc3NldHNVcmw6IGVudkNkblVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDhcdTdFREZcdTRFMDBcdTg5QzRcdTUyMTlcdUZGMENcdTU3RkFcdTRFOEVcdTVFOTRcdTc1MjhcdThFQUJcdTRFRkRcdTkxNERcdTdGNkVcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWFpbkFwcChcbiAgcm91dGVQYXRoPzogc3RyaW5nLFxuICBsb2NhdGlvblBhdGg/OiBzdHJpbmcsXG4gIGlzU3RhbmRhbG9uZT86IGJvb2xlYW5cbik6IGJvb2xlYW4ge1xuICAvLyBcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdTY1RjZcbiAgaWYgKGlzU3RhbmRhbG9uZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU1NzI4IE5vZGUuanMgXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDd2luZG93IFx1NjcyQVx1NUI5QVx1NEU0OVxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gXHU1NzI4IE5vZGUuanMgXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjA4XHU1OTgyIFZpdGUgXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU4RkQ0XHU1NkRFIHRydWVcdUZGMDhcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBxaWFua3VuV2luZG93ID0gKHdpbmRvdyBhcyBhbnkpLl9fUE9XRVJFRF9CWV9RSUFOS1VOX187XG4gICAgaXNTdGFuZGFsb25lID0gIXFpYW5rdW5XaW5kb3c7XG4gIH1cblxuICBjb25zdCBlbnYgPSBnZXRFbnZpcm9ubWVudCgpO1xuICAvLyBcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggbG9jYXRpb25QYXRoXHVGRjA4XHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA5XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU0RjdGXHU3NTI4IHJvdXRlUGF0aFx1RkYwQ1x1NjcwMFx1NTQwRVx1NEY3Rlx1NzUyOCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcbiAgY29uc3QgcGF0aCA9IGxvY2F0aW9uUGF0aCB8fCByb3V0ZVBhdGggfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lIDogJycpO1xuXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NTM3M1x1NEY3RiBpc1N0YW5kYWxvbmUgXHU0RTNBIHRydWVcdUZGMENcdTRFNUZcdTg5ODFcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTUzMzlcdTkxNERcdTVCNTBcdTVFOTRcdTc1MjhcbiAgLy8gXHU1NkUwXHU0RTNBXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1NDBDXHU0RTAwXHU0RTJBXHU3QUVGXHU1M0UzXHVGRjA4ODA4MFx1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OTAxQVx1OEZDN1x1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1NTIyNFx1NjVBRFxuICBpZiAoaXNTdGFuZGFsb25lICYmIGVudiA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgIC8vIFx1NTE0OFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjYyRlx1NzY3Qlx1NUY1NVx1N0I0OVx1NTE2Q1x1NUYwMFx1OTg3NVx1OTc2MlxuICAgIGlmIChwYXRoID09PSAnL2xvZ2luJyB8fCBwYXRoID09PSAnL2ZvcmdldC1wYXNzd29yZCcgfHwgcGF0aCA9PT0gJy9yZWdpc3RlcicpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTUzMzlcdTkxNERcdTRFRkJcdTRGNTVcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODQgcGF0aFByZWZpeFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjM5Mlx1OTY2NFx1NTE2Q1x1NUYwMFx1NUU5NFx1NzUyOFx1RkYwOFx1NTk4MiBob21lXHVGRjA5XHVGRjBDXHU1QjgzXHU0RUVDXHU4NjdEXHU3MTM2IHBhdGhQcmVmaXggXHU2NjJGICcvJ1x1RkYwQ1x1NEY0Nlx1NEUwRFx1NUU5NFx1OEJFNVx1NUY3MVx1NTRDRFx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NzUzMVx1NzY4NFx1NTIyNFx1NjVBRFxuICAgIGNvbnN0IGFwcHMgPSBnZXRBbGxBcHBzKCk7XG4gICAgY29uc3QgbWFpbkFwcCA9IGFwcHMuZmluZChhcHAgPT4gYXBwLnR5cGUgPT09ICdtYWluJyk7XG4gICAgY29uc3QgbWFpbkFwcFJvdXRlcyA9IG1haW5BcHA/LnJvdXRlcz8ubWFpbkFwcFJvdXRlcyB8fCBbXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGFwcCBvZiBhcHBzKSB7XG4gICAgICAvLyBcdThERjNcdThGQzdcdTRFM0JcdTVFOTRcdTc1MjhcdTMwMDFcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdUZGMDhcdTU5ODIgaG9tZSwgZG9jcywgbGF5b3V0LCBtb2JpbGVcdUZGMDlcdTU0OENcdTUxNkNcdTVGMDBcdTVFOTRcdTc1MjhcbiAgICAgIC8vIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NTcyOCBTUEVDSUFMX0FQUF9DT05GSUdTIFx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1NUY3MVx1NTRDRFx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NzUzMVx1NzY4NFx1NTIyNFx1NjVBRFxuICAgICAgaWYgKGFwcC50eXBlID09PSAnbWFpbicgfHwgaXNTcGVjaWFsQXBwQnlJZChhcHAuaWQpIHx8IChhcHAudHlwZSA9PT0gJ3N1YicgJiYgYXBwLm1ldGFkYXRhPy5wdWJsaWMgPT09IHRydWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoYXBwLnR5cGUgPT09ICdzdWInICYmIGFwcC5lbmFibGVkKSB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoUHJlZml4ID0gYXBwLnBhdGhQcmVmaXguZW5kc1dpdGgoJy8nKVxuICAgICAgICAgID8gYXBwLnBhdGhQcmVmaXguc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBhcHAucGF0aFByZWZpeDtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aCAhPT0gJy8nXG4gICAgICAgICAgPyBwYXRoLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogcGF0aDtcblxuICAgICAgICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdTYyMTZcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcbiAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoID09PSBub3JtYWxpemVkUGF0aFByZWZpeCB8fCBub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKG5vcm1hbGl6ZWRQYXRoUHJlZml4ICsgJy8nKSkge1xuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTIzMFx1NUI1MFx1NUU5NFx1NzUyOFx1RkYwQ1x1NEUwRFx1NjYyRlx1NEUzQlx1NUU5NFx1NzUyOFxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTUzMzlcdTkxNERcdTRFM0JcdTVFOTRcdTc1MjhcdTc2ODRcdThERUZcdTc1MzFcdTkxNERcdTdGNkVcdUZGMENcdTRGMThcdTUxNDhcdTUyMjRcdTY1QURcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcbiAgICAvLyBcdThGRDlcdTY4MzdcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNEQgaG9tZSBcdTVFOTRcdTc1MjhcdTc2ODQgcGF0aFByZWZpeCAnLycgXHU1RjcxXHU1NENEXHU0RTNCXHU1RTk0XHU3NTI4XHU4REVGXHU3NTMxXHU3Njg0XHU1MjI0XHU2NUFEXG4gICAgaWYgKG1haW5BcHBSb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aCAhPT0gJy8nXG4gICAgICAgID8gcGF0aC5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBwYXRoO1xuICAgICAgaWYgKG1haW5BcHBSb3V0ZXMuc29tZShyb3V0ZSA9PiB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRSb3V0ZSA9IHJvdXRlLmVuZHNXaXRoKCcvJykgJiYgcm91dGUgIT09ICcvJ1xuICAgICAgICAgID8gcm91dGUuc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiByb3V0ZTtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRQYXRoID09PSBub3JtYWxpemVkUm91dGUgfHwgbm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUm91dGUgKyAnLycpO1xuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MzM5XHU5MTREXHU1MjMwXHU1QjUwXHU1RTk0XHU3NTI4XHVGRjBDXHU1MjI0XHU2NUFEXHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBcdTk3NUVcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTc2ODRcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdTZBMjFcdTVGMEZcdUZGMDhcdTU5ODJcdTk4ODRcdTg5QzgvXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU3Njg0XHU3MkVDXHU3QUNCXHU4RkQwXHU4ODRDXHVGRjA5XG4gIGlmIChpc1N0YW5kYWxvbmUpIHtcbiAgICBpZiAocGF0aCA9PT0gJy9sb2dpbicgfHwgcGF0aCA9PT0gJy9mb3JnZXQtcGFzc3dvcmQnIHx8IHBhdGggPT09ICcvcmVnaXN0ZXInKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gcWlhbmt1biBcdTZBMjFcdTVGMEZcdTRFMEJcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTk3NUVcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdUZGMDlcbiAgY29uc3QgaG9zdG5hbWUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA6ICcnO1xuXG4gIGlmIChwYXRoID09PSAnL2xvZ2luJyB8fCBwYXRoID09PSAnL2ZvcmdldC1wYXNzd29yZCcgfHwgcGF0aCA9PT0gJy9yZWdpc3RlcicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdUZGMUFcdTkwMUFcdThGQzdcdTVCNTBcdTU3REZcdTU0MERcdTUyMjRcdTY1QURcdUZGMDhcdTdDN0JcdTRGM0NcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcbiAgaWYgKGVudiA9PT0gJ3Rlc3QnICYmIGhvc3RuYW1lKSB7XG4gICAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnQnlUZXN0SG9zdChob3N0bmFtZSk7XG4gICAgaWYgKGFwcENvbmZpZykge1xuICAgICAgLy8gXHU5MDFBXHU4RkM3XHU2RDRCXHU4QkQ1XHU1N0RGXHU1NDBEXHU2MjdFXHU1MjMwXHU1QkY5XHU1RTk0XHU3Njg0XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjBDXHU3MTM2XHU1NDBFXHU5MDFBXHU4RkM3XHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU2MjdFXHU1MjMwXHU1RTk0XHU3NTI4XHU4RUFCXHU0RUZEXG4gICAgICBjb25zdCBhcHBOYW1lID0gYXBwQ29uZmlnLmFwcE5hbWUucmVwbGFjZSgnLWFwcCcsICcnKTtcbiAgICAgIGNvbnN0IGFwcCA9IGdldEFsbEFwcHMoKS5maW5kKGEgPT4gYS5pZCA9PT0gYXBwTmFtZSk7XG4gICAgICBpZiAoYXBwICYmIGFwcC50eXBlID09PSAnc3ViJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NEUzQlx1NTdERlx1NTQwRFx1RkYwOHRlc3QuYmVsbGlzLmNvbS5jblx1RkYwOVx1NjIxNlx1NTE3Nlx1NEVENlx1NjcyQVx1NTMzOVx1OTE0RFx1NzY4NFx1NTdERlx1NTQwRFx1RkYwQ1x1NTIyNFx1NjVBRFx1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU5MDFBXHU4RkM3XHU1QjUwXHU1N0RGXHU1NDBEXHU1MjI0XHU2NUFEXHVGRjA4XHU1N0ZBXHU0RThFXHU1RTk0XHU3NTI4XHU4RUFCXHU0RUZEXHU5MTREXHU3RjZFXHVGRjA5XG4gIGlmIChlbnYgPT09ICdwcm9kdWN0aW9uJykge1xuICAgIGNvbnN0IGFwcCA9IGdldEFsbEFwcHMoKS5maW5kKGEgPT4gYS5zdWJkb21haW4gPT09IGhvc3RuYW1lKTtcbiAgICBpZiAoYXBwICYmIGFwcC50eXBlID09PSAnc3ViJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFx1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1RkYxQVx1OTAxQVx1OEZDN1x1N0FFRlx1NTNFM1x1NTIyNFx1NjVBRFx1RkYwOFx1N0M3Qlx1NEYzQ1x1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1OTAxQVx1OEZDN1x1NUI1MFx1NTdERlx1NTQwRFx1NTIyNFx1NjVBRFx1RkYwOVxuICAvLyBcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTkwRkRcdTY3MDlcdTcyRUNcdTdBQ0JcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTU5ODIgYWRtaW4tYXBwIFx1NTcyOCA0MTgxXHVGRjA5XHVGRjBDXHU4QkJGXHU5NUVFXHU4QkU1XHU3QUVGXHU1M0UzXHU2NUY2XHU1RTk0XHU4QkU1XHU4QkM2XHU1MjJCXHU0RTNBXHU1QkY5XHU1RTk0XHU3Njg0XHU1QjUwXHU1RTk0XHU3NTI4XG4gIGlmIChlbnYgPT09ICdwcmV2aWV3Jykge1xuICAgIGNvbnN0IHBvcnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5wb3J0IHx8ICcnIDogJyc7XG4gICAgaWYgKHBvcnQpIHtcbiAgICAgIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZ0J5UHJlUG9ydChwb3J0KTtcbiAgICAgIGlmIChhcHBDb25maWcpIHtcbiAgICAgICAgLy8gXHU5MDFBXHU4RkM3XHU3QUVGXHU1M0UzXHU2MjdFXHU1MjMwXHU1QkY5XHU1RTk0XHU3Njg0XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjBDXHU3MTM2XHU1NDBFXHU5MDFBXHU4RkM3XHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU2MjdFXHU1MjMwXHU1RTk0XHU3NTI4XHU4RUFCXHU0RUZEXG4gICAgICAgIGNvbnN0IGFwcE5hbWUgPSBhcHBDb25maWcuYXBwTmFtZS5yZXBsYWNlKCctYXBwJywgJycpO1xuICAgICAgICBjb25zdCBhcHAgPSBnZXRBbGxBcHBzKCkuZmluZChhID0+IGEuaWQgPT09IGFwcE5hbWUpO1xuICAgICAgICBpZiAoYXBwICYmIGFwcC50eXBlID09PSAnc3ViJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDg0MTgwXHVGRjA5XHU2MjE2XHU1MTc2XHU0RUQ2XHU2NzJBXHU1MzM5XHU5MTREXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjBDXHU1MjI0XHU2NUFEXHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMUFcdTkwMUFcdThGQzdcdThERUZcdTVGODRcdTUyMjRcdTY1QURcdUZGMDhcdTU3RkFcdTRFOEVcdTVFOTRcdTc1MjhcdThFQUJcdTRFRkRcdTkxNERcdTdGNkVcdUZGMDlcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1NDBDXHU0RTAwXHU0RTJBXHU3QUVGXHU1M0UzXHVGRjA4ODA4MFx1RkYwOVx1RkYwQ1x1NjI0MFx1NEVFNVx1NTNFQVx1ODBGRFx1OTAxQVx1OEZDN1x1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1NTIyNFx1NjVBRFxuICAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdThERUZcdTVGODRcdUZGMUEvZGF0YS8uLi5cdTMwMDEvcHJvZmlsZSBcdTdCNDlcbiAgLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU4REVGXHU1Rjg0XHVGRjFBL2xvZ2lzdGljcy8uLi5cdTMwMDEvYWRtaW4vLi4uIFx1N0I0OVxuICBjb25zdCBhcHBzID0gZ2V0QWxsQXBwcygpO1xuICBjb25zdCBtYWluQXBwID0gYXBwcy5maW5kKGFwcCA9PiBhcHAudHlwZSA9PT0gJ21haW4nKTtcbiAgY29uc3QgbWFpbkFwcFJvdXRlcyA9IG1haW5BcHA/LnJvdXRlcz8ubWFpbkFwcFJvdXRlcyB8fCBbXTtcblxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTUzMzlcdTkxNERcdTRFM0JcdTVFOTRcdTc1MjhcdTc2ODRcdThERUZcdTc1MzFcdTkxNERcdTdGNkVcdUZGMENcdTRGMThcdTUxNDhcdTUyMjRcdTY1QURcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcbiAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIGhvbWUgXHU1RTk0XHU3NTI4XHU3Njg0IHBhdGhQcmVmaXggJy8nIFx1NUY3MVx1NTRDRFx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NzUzMVx1NzY4NFx1NTIyNFx1NjVBRFxuICBpZiAobWFpbkFwcFJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aCAhPT0gJy8nXG4gICAgICA/IHBhdGguc2xpY2UoMCwgLTEpXG4gICAgICA6IHBhdGg7XG4gICAgaWYgKG1haW5BcHBSb3V0ZXMuc29tZShyb3V0ZSA9PiB7XG4gICAgICBjb25zdCBub3JtYWxpemVkUm91dGUgPSByb3V0ZS5lbmRzV2l0aCgnLycpICYmIHJvdXRlICE9PSAnLydcbiAgICAgICAgPyByb3V0ZS5zbGljZSgwLCAtMSlcbiAgICAgICAgOiByb3V0ZTtcbiAgICAgIHJldHVybiBub3JtYWxpemVkUGF0aCA9PT0gbm9ybWFsaXplZFJvdXRlIHx8IG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgobm9ybWFsaXplZFJvdXRlICsgJy8nKTtcbiAgICB9KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gXHU1MTQ4XHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XHU4REVGXHU1Rjg0XHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0IHBhdGhQcmVmaXggXHU0RjE4XHU1MTQ4XHU3RUE3XHU2NkY0XHU5QUQ4XHVGRjA5XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjM5Mlx1OTY2NFx1NTE2Q1x1NUYwMFx1NUU5NFx1NzUyOFx1RkYwOFx1NTk4MiBob21lXHVGRjA5XHVGRjBDXHU1QjgzXHU0RUVDXHU4NjdEXHU3MTM2IHBhdGhQcmVmaXggXHU2NjJGICcvJ1x1RkYwQ1x1NEY0Nlx1NEUwRFx1NUU5NFx1OEJFNVx1NUY3MVx1NTRDRFx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NzUzMVx1NzY4NFx1NTIyNFx1NjVBRFxuICAgIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpIHtcbiAgICAgIC8vIFx1OERGM1x1OEZDN1x1NEUzQlx1NUU5NFx1NzUyOFx1MzAwMVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1RkYwOFx1NTk4MiBob21lLCBkb2NzLCBsYXlvdXQsIG1vYmlsZVx1RkYwOVx1NTQ4Q1x1NTE2Q1x1NUYwMFx1NUU5NFx1NzUyOFxuICAgICAgLy8gXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XHU1NzI4IFNQRUNJQUxfQVBQX0NPTkZJR1MgXHU0RTJEXHU1QjlBXHU0RTQ5XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU1RjcxXHU1NENEXHU0RTNCXHU1RTk0XHU3NTI4XHU4REVGXHU3NTMxXHU3Njg0XHU1MjI0XHU2NUFEXG4gICAgICBpZiAoYXBwLnR5cGUgPT09ICdtYWluJyB8fCBpc1NwZWNpYWxBcHBCeUlkKGFwcC5pZCkgfHwgKGFwcC50eXBlID09PSAnc3ViJyAmJiBhcHAubWV0YWRhdGE/LnB1YmxpYyA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgXG4gICAgaWYgKGFwcC50eXBlID09PSAnc3ViJyAmJiBhcHAuZW5hYmxlZCkge1xuICAgICAgLy8gXHU2NTJGXHU2MzAxIHBhdGhQcmVmaXggXHU1RTI2XHU2MjE2XHU0RTBEXHU1RTI2XHU1QzNFXHU5MEU4XHU2NTlDXHU2NzYwXG4gICAgICBjb25zdCBub3JtYWxpemVkUGF0aFByZWZpeCA9IGFwcC5wYXRoUHJlZml4LmVuZHNXaXRoKCcvJylcbiAgICAgICAgPyBhcHAucGF0aFByZWZpeC5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBhcHAucGF0aFByZWZpeDtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gcGF0aC5lbmRzV2l0aCgnLycpICYmIHBhdGggIT09ICcvJ1xuICAgICAgICA/IHBhdGguc2xpY2UoMCwgLTEpXG4gICAgICAgIDogcGF0aDtcblxuICAgICAgLy8gXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXHU2MjE2XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHU1MzM5XHU5MTREXG4gICAgICAvLyBcdTRGOEJcdTU5ODJcdUZGMUEvbG9naXN0aWNzIFx1NjIxNiAvbG9naXN0aWNzL3dhcmVob3VzZS9pbnZlbnRvcnkvaW5mbyBcdTkwRkRcdTUzMzlcdTkxNERcdTcyNjlcdTZENDFcdTVFOTRcdTc1MjhcbiAgICAgIGNvbnN0IGlzTWF0Y2ggPSBub3JtYWxpemVkUGF0aCA9PT0gbm9ybWFsaXplZFBhdGhQcmVmaXggfHwgbm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUGF0aFByZWZpeCArICcvJyk7XG5cbiAgICAgIGlmIChpc01hdGNoKSB7XG4gICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTIzMFx1NUI1MFx1NUU5NFx1NzUyOFx1RkYwQ1x1NEUwRFx1NjYyRlx1NEUzQlx1NUU5NFx1NzUyOFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IGxheW91dC1hcHAgXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjBDXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU2NjJGXHU2ODM5XHU4REVGXHU1Rjg0ICcvJ1x1RkYwQ1x1NEY0Nlx1NUI5RVx1OTY0NSBsb2NhdGlvblBhdGggXHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XHU4REVGXHU1Rjg0XHVGRjBDXG4gIC8vIFx1OTcwMFx1ODk4MVx1NTE4RFx1NkIyMVx1NjhDMFx1NjdFNSBsb2NhdGlvblBhdGhcdUZGMDhcdTU2RTBcdTRFM0Egcm91dGUucGF0aCBcdTUzRUZcdTgwRkRcdTY2MkYgJy8nXHVGRjBDXHU0RjQ2IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSBcdTY2MkZcdTVCNTBcdTVFOTRcdTc1MjhcdThERUZcdTVGODRcdUZGMDlcbiAgaWYgKHBhdGggPT09ICcvJyAmJiBsb2NhdGlvblBhdGggJiYgbG9jYXRpb25QYXRoICE9PSAnLycpIHtcbiAgICAvLyBcdTUxNDhcdTY4QzBcdTY3RTUgbG9jYXRpb25QYXRoIFx1NjYyRlx1NTQyNlx1NTMzOVx1OTE0RFx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NzUzMVxuICAgIGlmIChtYWluQXBwUm91dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRMb2NhdGlvblBhdGggPSBsb2NhdGlvblBhdGguZW5kc1dpdGgoJy8nKSAmJiBsb2NhdGlvblBhdGggIT09ICcvJ1xuICAgICAgICA/IGxvY2F0aW9uUGF0aC5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBsb2NhdGlvblBhdGg7XG4gICAgICBpZiAobWFpbkFwcFJvdXRlcy5zb21lKHJvdXRlID0+IHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFJvdXRlID0gcm91dGUuZW5kc1dpdGgoJy8nKSAmJiByb3V0ZSAhPT0gJy8nXG4gICAgICAgICAgPyByb3V0ZS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IHJvdXRlO1xuICAgICAgICByZXR1cm4gbm9ybWFsaXplZExvY2F0aW9uUGF0aCA9PT0gbm9ybWFsaXplZFJvdXRlIHx8IG5vcm1hbGl6ZWRMb2NhdGlvblBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUm91dGUgKyAnLycpO1xuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NEY3Rlx1NzUyOCBsb2NhdGlvblBhdGggXHU5MUNEXHU2NUIwXHU2OEMwXHU2N0U1XG4gICAgY29uc3Qgbm9ybWFsaXplZExvY2F0aW9uUGF0aCA9IGxvY2F0aW9uUGF0aC5lbmRzV2l0aCgnLycpICYmIGxvY2F0aW9uUGF0aCAhPT0gJy8nXG4gICAgICA/IGxvY2F0aW9uUGF0aC5zbGljZSgwLCAtMSlcbiAgICAgIDogbG9jYXRpb25QYXRoO1xuXG4gICAgZm9yIChjb25zdCBhcHAgb2YgYXBwcykge1xuICAgICAgLy8gXHU4REYzXHU4RkM3XHU0RTNCXHU1RTk0XHU3NTI4XHUzMDAxXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XHVGRjA4XHU1OTgyIGhvbWUsIGRvY3MsIGxheW91dCwgbW9iaWxlXHVGRjA5XHU1NDhDXHU1MTZDXHU1RjAwXHU1RTk0XHU3NTI4XG4gICAgICAvLyBcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdTU3MjggU1BFQ0lBTF9BUFBfQ09ORklHUyBcdTRFMkRcdTVCOUFcdTRFNDlcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTVGNzFcdTU0Q0RcdTRFM0JcdTVFOTRcdTc1MjhcdThERUZcdTc1MzFcdTc2ODRcdTUyMjRcdTY1QURcbiAgICAgIGlmIChhcHAudHlwZSA9PT0gJ21haW4nIHx8IGlzU3BlY2lhbEFwcEJ5SWQoYXBwLmlkKSB8fCAoYXBwLnR5cGUgPT09ICdzdWInICYmIGFwcC5tZXRhZGF0YT8ucHVibGljID09PSB0cnVlKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGFwcC50eXBlID09PSAnc3ViJyAmJiBhcHAuZW5hYmxlZCkge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aFByZWZpeCA9IGFwcC5wYXRoUHJlZml4LmVuZHNXaXRoKCcvJylcbiAgICAgICAgICA/IGFwcC5wYXRoUHJlZml4LnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogYXBwLnBhdGhQcmVmaXg7XG5cbiAgICAgICAgY29uc3QgaXNNYXRjaCA9IG5vcm1hbGl6ZWRMb2NhdGlvblBhdGggPT09IG5vcm1hbGl6ZWRQYXRoUHJlZml4IHx8IG5vcm1hbGl6ZWRMb2NhdGlvblBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUGF0aFByZWZpeCArICcvJyk7XG5cbiAgICAgICAgaWYgKGlzTWF0Y2gpIHtcbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNERcdTUyMzBcdTVCNTBcdTVFOTRcdTc1MjhcdUZGMENcdTRFMERcdTY2MkZcdTRFM0JcdTVFOTRcdTc1MjhcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUzMzlcdTkxNERcdTUyMzBcdTVCNTBcdTVFOTRcdTc1MjhcdUZGMENcdTUyMjRcdTY1QURcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcbiAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHU3Njg0IHBhdGhQcmVmaXggXHU2NjJGICcvJ1x1RkYwQ1x1NjI0MFx1NEVFNVx1NjI0MFx1NjcwOVx1NEUwRFx1NTMzOVx1OTE0RFx1NUI1MFx1NUU5NFx1NzUyOFx1NzY4NFx1OERFRlx1NUY4NFx1OTBGRFx1NjYyRlx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NUY4NFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTZGQzBcdTZEM0JcdTc2ODRcdTVCNTBcdTVFOTRcdTc1MjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRTdWJBcHAoKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IGVudiA9IGdldEVudmlyb25tZW50KCk7XG4gIGNvbnN0IHBhdGggPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA6ICcnO1xuICBjb25zdCBob3N0bmFtZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lIDogJyc7XG4gIGNvbnN0IHBvcnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5wb3J0IHx8ICcnIDogJyc7XG5cbiAgLy8gXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHVGRjFBXHU5MDFBXHU4RkM3XHU1QjUwXHU1N0RGXHU1NDBEXHU1MjI0XHU2NUFEXHVGRjA4XHU3QzdCXHU0RjNDXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XG4gIGlmIChlbnYgPT09ICd0ZXN0JyAmJiBob3N0bmFtZSkge1xuICAgIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZ0J5VGVzdEhvc3QoaG9zdG5hbWUpO1xuICAgIGlmIChhcHBDb25maWcpIHtcbiAgICAgIC8vIFx1OTAxQVx1OEZDN1x1NkQ0Qlx1OEJENVx1NTdERlx1NTQwRFx1NjI3RVx1NTIzMFx1NUJGOVx1NUU5NFx1NzY4NFx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1RkYwQ1x1NzEzNlx1NTQwRVx1OTAxQVx1OEZDN1x1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1NjI3RVx1NTIzMFx1NUU5NFx1NzUyOFx1OEVBQlx1NEVGRFxuICAgICAgY29uc3QgYXBwTmFtZSA9IGFwcENvbmZpZy5hcHBOYW1lLnJlcGxhY2UoJy1hcHAnLCAnJyk7XG4gICAgICBjb25zdCBhcHAgPSBnZXRBbGxBcHBzKCkuZmluZChhID0+IGEuaWQgPT09IGFwcE5hbWUpO1xuICAgICAgaWYgKGFwcCAmJiBhcHAudHlwZSA9PT0gJ3N1YicgJiYgYXBwLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIGFwcC5pZDtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHU0RTNCXHU1N0RGXHU1NDBEXHVGRjA4dGVzdC5iZWxsaXMuY29tLmNuXHVGRjA5XHU2MjE2XHU1MTc2XHU0RUQ2XHU2NzJBXHU1MzM5XHU5MTREXHU3Njg0XHU1N0RGXHU1NDBEXHVGRjBDXHU4RkQ0XHU1NkRFIG51bGxcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1OTAxQVx1OEZDN1x1NUI1MFx1NTdERlx1NTQwRFx1NTIyNFx1NjVBRFx1RkYwOFx1NEYxOFx1NTE0OFx1N0VBN1x1NjcwMFx1OUFEOFx1RkYwOVxuICBpZiAoZW52ID09PSAncHJvZHVjdGlvbicgJiYgaG9zdG5hbWUpIHtcbiAgICBjb25zdCBhcHAgPSBnZXRBbGxBcHBzKCkuZmluZChhID0+IGEuc3ViZG9tYWluID09PSBob3N0bmFtZSk7XG4gICAgaWYgKGFwcCAmJiBhcHAudHlwZSA9PT0gJ3N1YicgJiYgYXBwLmVuYWJsZWQpIHtcbiAgICAgIHJldHVybiBhcHAuaWQ7XG4gICAgfVxuICAgIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTk4Mlx1Njc5Q1x1NEUwRFx1NjYyRlx1NUI1MFx1NTdERlx1NTQwRFx1RkYwQ1x1NTIxOVx1NEUwRFx1NjYyRlx1NUI1MFx1NUU5NFx1NzUyOFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHVGRjFBXHU5MDFBXHU4RkM3XHU3QUVGXHU1M0UzXHU1MjI0XHU2NUFEXHVGRjA4XHU3QzdCXHU0RjNDXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU5MDFBXHU4RkM3XHU1QjUwXHU1N0RGXHU1NDBEXHU1MjI0XHU2NUFEXHVGRjA5XG4gIC8vIFx1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1OTBGRFx1NjcwOVx1NzJFQ1x1N0FDQlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NTk4MiBhZG1pbi1hcHAgXHU1NzI4IDQxODFcdUZGMDlcdUZGMENcdThCQkZcdTk1RUVcdThCRTVcdTdBRUZcdTUzRTNcdTY1RjZcdTVFOTRcdThCRTVcdThCQzZcdTUyMkJcdTRFM0FcdTVCRjlcdTVFOTRcdTc2ODRcdTVCNTBcdTVFOTRcdTc1MjhcbiAgaWYgKGVudiA9PT0gJ3ByZXZpZXcnICYmIHBvcnQpIHtcbiAgICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydCk7XG4gICAgaWYgKGFwcENvbmZpZykge1xuICAgICAgLy8gXHU5MDFBXHU4RkM3XHU3QUVGXHU1M0UzXHU2MjdFXHU1MjMwXHU1QkY5XHU1RTk0XHU3Njg0XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjBDXHU3MTM2XHU1NDBFXHU5MDFBXHU4RkM3XHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU2MjdFXHU1MjMwXHU1RTk0XHU3NTI4XHU4RUFCXHU0RUZEXG4gICAgICBjb25zdCBhcHBOYW1lID0gYXBwQ29uZmlnLmFwcE5hbWUucmVwbGFjZSgnLWFwcCcsICcnKTtcbiAgICAgIGNvbnN0IGFwcCA9IGdldEFsbEFwcHMoKS5maW5kKGEgPT4gYS5pZCA9PT0gYXBwTmFtZSk7XG4gICAgICBpZiAoYXBwICYmIGFwcC50eXBlID09PSAnc3ViJyAmJiBhcHAuZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gYXBwLmlkO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDg0MTgwXHVGRjA5XHU2MjE2XHU1MTc2XHU0RUQ2XHU2NzJBXHU1MzM5XHU5MTREXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjBDXHU4RkQ0XHU1NkRFIG51bGxcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1RkYxQVx1OTAxQVx1OEZDN1x1OERFRlx1NUY4NFx1NTIyNFx1NjVBRFx1RkYwOFx1NEUwRSBpc01haW5BcHAgXHU0RjdGXHU3NTI4XHU3NkY4XHU1NDBDXHU3Njg0XHU1MzM5XHU5MTREXHU5MDNCXHU4RjkxXHVGRjA5XG4gIGNvbnN0IGFwcHMgPSBnZXRBbGxBcHBzKCk7XG4gIGNvbnN0IG1haW5BcHAgPSBhcHBzLmZpbmQoYXBwID0+IGFwcC50eXBlID09PSAnbWFpbicpO1xuICBjb25zdCBtYWluQXBwUm91dGVzID0gbWFpbkFwcD8ucm91dGVzPy5tYWluQXBwUm91dGVzIHx8IFtdO1xuXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTk4Mlx1Njc5Q1x1OERFRlx1NUY4NFx1NTMzOVx1OTE0RFx1NEUzQlx1NUU5NFx1NzUyOFx1NzY4NFx1OERFRlx1NzUzMVx1OTE0RFx1N0Y2RVx1RkYwQ1x1NEYxOFx1NTE0OFx1NTIyNFx1NjVBRFx1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwQ1x1OEZENFx1NTZERSBudWxsXG4gIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBob21lIFx1NUU5NFx1NzUyOFx1NzY4NCBwYXRoUHJlZml4ICcvJyBcdTVGNzFcdTU0Q0RcdTRFM0JcdTVFOTRcdTc1MjhcdThERUZcdTc1MzFcdTc2ODRcdTUyMjRcdTY1QURcbiAgaWYgKG1haW5BcHBSb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gcGF0aC5lbmRzV2l0aCgnLycpICYmIHBhdGggIT09ICcvJ1xuICAgICAgPyBwYXRoLnNsaWNlKDAsIC0xKVxuICAgICAgOiBwYXRoO1xuICAgIGlmIChtYWluQXBwUm91dGVzLnNvbWUocm91dGUgPT4ge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFJvdXRlID0gcm91dGUuZW5kc1dpdGgoJy8nKSAmJiByb3V0ZSAhPT0gJy8nXG4gICAgICAgID8gcm91dGUuc2xpY2UoMCwgLTEpXG4gICAgICAgIDogcm91dGU7XG4gICAgICByZXR1cm4gbm9ybWFsaXplZFBhdGggPT09IG5vcm1hbGl6ZWRSb3V0ZSB8fCBub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKG5vcm1hbGl6ZWRSb3V0ZSArICcvJyk7XG4gICAgfSkpIHtcbiAgICAgIHJldHVybiBudWxsOyAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdThERUZcdTc1MzFcdUZGMENcdThGRDRcdTU2REUgbnVsbFxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpIHtcbiAgICAvLyBcdThERjNcdThGQzdcdTRFM0JcdTVFOTRcdTc1MjhcdTU0OENcdTUxNkNcdTVGMDBcdTVFOTRcdTc1MjhcdUZGMDhcdTU5ODIgaG9tZVx1RkYwOVx1RkYwQ1x1NUI4M1x1NEVFQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1OEJDNlx1NTIyQlx1NEUzQVx1NUI1MFx1NUU5NFx1NzUyOFxuICAgIGlmIChhcHAudHlwZSA9PT0gJ21haW4nIHx8IChhcHAudHlwZSA9PT0gJ3N1YicgJiYgYXBwLm1ldGFkYXRhPy5wdWJsaWMgPT09IHRydWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGFwcC50eXBlID09PSAnc3ViJyAmJiBhcHAuZW5hYmxlZCkge1xuICAgICAgLy8gXHU2NTJGXHU2MzAxIHBhdGhQcmVmaXggXHU1RTI2XHU2MjE2XHU0RTBEXHU1RTI2XHU1QzNFXHU5MEU4XHU2NTlDXHU2NzYwXHVGRjA4XHU0RTBFIGlzTWFpbkFwcCBcdTRGN0ZcdTc1MjhcdTc2RjhcdTU0MENcdTc2ODRcdTUzMzlcdTkxNERcdTkwM0JcdThGOTFcdUZGMDlcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoUHJlZml4ID0gYXBwLnBhdGhQcmVmaXguZW5kc1dpdGgoJy8nKVxuICAgICAgICA/IGFwcC5wYXRoUHJlZml4LnNsaWNlKDAsIC0xKVxuICAgICAgICA6IGFwcC5wYXRoUHJlZml4O1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aCAhPT0gJy8nXG4gICAgICAgID8gcGF0aC5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBwYXRoO1xuXG4gICAgICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdTYyMTZcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcbiAgICAgIGlmIChub3JtYWxpemVkUGF0aCA9PT0gbm9ybWFsaXplZFBhdGhQcmVmaXggfHwgbm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUGF0aFByZWZpeCArICcvJykpIHtcbiAgICAgICAgcmV0dXJuIGFwcC5pZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUzMzlcdTkxNERcdTUyMzBcdTRFRkJcdTRGNTVcdTVCNTBcdTVFOTRcdTc1MjhcdUZGMENcdThGRDRcdTU2REUgbnVsbFxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRFMERcdTUxOERcdTUxNDhcdThDMDNcdTc1MjggaXNNYWluQXBwKCkgXHU2NzY1XHU1MjI0XHU2NUFEXHVGRjBDXHU1NkUwXHU0RTNBIGlzTWFpbkFwcCgpIFx1NzY4NFx1OTAzQlx1OEY5MVx1NTNFRlx1ODBGRFx1NTcyOFx1NEUwRFx1NTQwQ1x1NzNBRlx1NTg4M1x1NEUwQlx1NjcwOVx1NURFRVx1NUYwMlxuICAvLyBcdTc2RjRcdTYzQTVcdTkwMUFcdThGQzdcdThERUZcdTVGODRcdTUzMzlcdTkxNERcdTY3NjVcdTUyMjRcdTY1QURcdTY2RjRcdTUzRUZcdTk3NjBcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0XHU1MTY1XHU1M0UzXHU1NzMwXHU1NzQwXHVGRjA4XHU1N0ZBXHU0RThFXHU1RTk0XHU3NTI4XHU4RUFCXHU0RUZEXHU5MTREXHU3RjZFXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdWJBcHBFbnRyeShhcHBJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYXBwID0gZ2V0QXBwQnlJZChhcHBJZCk7XG4gIGlmICghYXBwKSB7XG4gICAgbG9nZ2VyLndhcm4oYFt1bmlmaWVkLWVudi1jb25maWddIFx1NjcyQVx1NjI3RVx1NTIzMFx1NUU5NFx1NzUyODogJHthcHBJZH1gKTtcbiAgICByZXR1cm4gYC8ke2FwcElkfS9gO1xuICB9XG5cbiAgY29uc3QgZW52ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgY29uc3QgZW52Q29uZmlnID0gZ2V0RW52Q29uZmlnKCk7XG4gIGNvbnN0IGFwcEVudkNvbmZpZyA9IGdldEFwcENvbmZpZyhgJHthcHBJZH0tYXBwYCk7XG5cbiAgaWYgKCFhcHBFbnZDb25maWcpIHtcbiAgICBsb2dnZXIud2FybihgW3VuaWZpZWQtZW52LWNvbmZpZ10gXHU2NzJBXHU2MjdFXHU1MjMwXHU1RTk0XHU3NTI4XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFOiAke2FwcElkfS1hcHBgKTtcbiAgICByZXR1cm4gYC8ke2FwcElkfS9gO1xuICB9XG5cbiAgc3dpdGNoIChlbnYpIHtcbiAgICBjYXNlICd0ZXN0JzpcbiAgICAgIC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1RkYxQVx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOFx1NkQ0Qlx1OEJENVx1NUI1MFx1NTdERlx1NTQwRFx1NjgzOVx1OERFRlx1NUY4NFx1RkYwQ1x1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzZGNFx1NjNBNVx1OTBFOFx1N0Y3Mlx1NTIzMFx1NUI1MFx1NTdERlx1NTQwRFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NEUwRVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaWYgKGFwcEVudkNvbmZpZy50ZXN0SG9zdCkge1xuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgID8gd2luZG93LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgOiAnaHR0cHM6JztcbiAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfS8vJHthcHBFbnZDb25maWcudGVzdEhvc3R9L2A7XG4gICAgICB9XG4gICAgICByZXR1cm4gYC8ke2FwcElkfS9gO1xuXG4gICAgY2FzZSAncHJvZHVjdGlvbic6XG4gICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdTVCNTBcdTU3REZcdTU0MERcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTc2RjRcdTYzQTVcdTkwRThcdTdGNzJcdTUyMzBcdTVCNTBcdTU3REZcdTU0MERcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgIGlmIChhcHAuc3ViZG9tYWluICYmIGFwcEVudkNvbmZpZy5wcm9kSG9zdCkge1xuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgID8gd2luZG93LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgOiAnaHR0cHM6JztcbiAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfS8vJHthcHBFbnZDb25maWcucHJvZEhvc3R9L2A7XG4gICAgICB9XG4gICAgICByZXR1cm4gYC8ke2FwcElkfS9gO1xuXG4gICAgY2FzZSAncHJldmlldyc6XG4gICAgICByZXR1cm4gYGh0dHA6Ly8ke2FwcEVudkNvbmZpZy5wcmVIb3N0fToke2FwcEVudkNvbmZpZy5wcmVQb3J0fSR7ZW52Q29uZmlnLm1pY3JvQXBwLmVudHJ5UHJlZml4fWA7XG5cbiAgICBjYXNlICdkZXZlbG9wbWVudCc6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgJHtlbnZDb25maWcubWljcm9BcHAuYmFzZVVSTH06JHthcHBFbnZDb25maWcuZGV2UG9ydH1gO1xuICB9XG59XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwIHFpYW5rdW4gYWN0aXZlUnVsZVx1RkYwOFx1NTdGQVx1NEU4RVx1NUU5NFx1NzUyOFx1OEVBQlx1NEVGRFx1OTE0RFx1N0Y2RVx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ViQXBwQWN0aXZlUnVsZShhcHBJZDogc3RyaW5nKTogc3RyaW5nIHwgKChsb2NhdGlvbjogTG9jYXRpb24pID0+IGJvb2xlYW4pIHtcbiAgY29uc3QgYXBwID0gZ2V0QXBwQnlJZChhcHBJZCk7XG4gIGlmICghYXBwKSB7XG4gICAgbG9nZ2VyLndhcm4oYFt1bmlmaWVkLWVudi1jb25maWddIFx1NjcyQVx1NjI3RVx1NTIzMFx1NUU5NFx1NzUyODogJHthcHBJZH1gKTtcbiAgICByZXR1cm4gYC8ke2FwcElkfWA7XG4gIH1cblxuICBjb25zdCBlbnYgPSBnZXRFbnZpcm9ubWVudCgpO1xuICBjb25zdCBhcHBFbnZDb25maWcgPSBnZXRBcHBDb25maWcoYCR7YXBwSWR9LWFwcGApO1xuXG4gIC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NTQ4Q1x1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1OTAxQVx1OEZDN1x1NUI1MFx1NTdERlx1NTQwRFx1NTIyNFx1NjVBRFxuICBpZiAoKGVudiA9PT0gJ3Rlc3QnIHx8IGVudiA9PT0gJ3Byb2R1Y3Rpb24nKSAmJiBhcHBFbnZDb25maWcpIHtcbiAgICByZXR1cm4gKGxvY2F0aW9uOiBMb2NhdGlvbikgPT4ge1xuICAgICAgLy8gXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHVGRjFBXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU0RTNBXHU2RDRCXHU4QkQ1XHU1QjUwXHU1N0RGXHU1NDBEXG4gICAgICBpZiAoZW52ID09PSAndGVzdCcgJiYgYXBwRW52Q29uZmlnLnRlc3RIb3N0KSB7XG4gICAgICAgIGlmIChsb2NhdGlvbi5ob3N0bmFtZSA9PT0gYXBwRW52Q29uZmlnLnRlc3RIb3N0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NEUzQVx1NzUxRlx1NEVBN1x1NUI1MFx1NTdERlx1NTQwRFxuICAgICAgaWYgKGVudiA9PT0gJ3Byb2R1Y3Rpb24nICYmIGFwcC5zdWJkb21haW4gJiYgbG9jYXRpb24uaG9zdG5hbWUgPT09IGFwcC5zdWJkb21haW4pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICAvLyBcdThERUZcdTVGODRcdTUzMzlcdTkxNERcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdUZGMDlcbiAgICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZS5zdGFydHNXaXRoKGFwcC5wYXRoUHJlZml4KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIChsb2NhdGlvbjogTG9jYXRpb24pID0+IHtcbiAgICByZXR1cm4gbG9jYXRpb24ucGF0aG5hbWUuc3RhcnRzV2l0aChhcHAucGF0aFByZWZpeCk7XG4gIH07XG59XG5cbi8vIFx1NUJGQ1x1NTFGQVx1NTM1NVx1NEY4Qlx1RkYwOFx1NUVGNlx1OEZERlx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1OTVFRVx1OTg5OFx1RkYwOVxuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RTBEXHU4OTgxXHU1NzI4XHU2QTIxXHU1NzU3XHU5ODc2XHU1QzQyXHU3NkY0XHU2M0E1XHU4QzAzXHU3NTI4IGdldEVudmlyb25tZW50KClcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTRGOURcdThENTYgQVBQX0VOVl9DT05GSUdTXG4vLyBcdTU5ODJcdTY3OUMgdW5pZmllZC1lbnYtY29uZmlnLnRzIFx1NTcyOCBhcHAtZW52LmNvbmZpZy50cyBcdTRFNEJcdTUyNERcdTUyQTBcdThGN0RcdUZGMENcdTRGMUFcdTVCRkNcdTgxRjRcdTUyMURcdTU5Q0JcdTUzMTZcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThcbi8vIFx1NEY3Rlx1NzUyOCBnZXR0ZXIgXHU1MUZEXHU2NTcwXHU1RUY2XHU4RkRGXHU1MjFEXHU1OUNCXHU1MzE2XHVGRjBDXHU1M0VBXHU1NzI4XHU5OTk2XHU2QjIxXHU4QkJGXHU5NUVFXHU2NUY2XHU4QkExXHU3Qjk3XG5sZXQgX2N1cnJlbnRFbnZpcm9ubWVudDogRW52aXJvbm1lbnQgfCBudWxsID0gbnVsbDtcbmxldCBfZW52Q29uZmlnOiBFbnZpcm9ubWVudENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudEVudmlyb25tZW50KCk6IEVudmlyb25tZW50IHtcbiAgaWYgKF9jdXJyZW50RW52aXJvbm1lbnQgPT09IG51bGwpIHtcbiAgICBfY3VycmVudEVudmlyb25tZW50ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgfVxuICByZXR1cm4gX2N1cnJlbnRFbnZpcm9ubWVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRFbnZDb25maWcoKTogRW52aXJvbm1lbnRDb25maWcge1xuICBpZiAoX2VudkNvbmZpZyA9PT0gbnVsbCkge1xuICAgIF9lbnZDb25maWcgPSBnZXRFbnZDb25maWcoKTtcbiAgfVxuICByZXR1cm4gX2VudkNvbmZpZztcbn1cblxuLy8gXHU0RTNBXHU0RTg2XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjBDXHU0RkREXHU3NTU5XHU1QkZDXHU1MUZBXHVGRjBDXHU0RjQ2XHU0RjdGXHU3NTI4XHU1RUY2XHU4RkRGXHU1MjFEXHU1OUNCXHU1MzE2XHU3Njg0IGdldHRlclxuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU0RTlCXHU1QkZDXHU1MUZBXHU0RjFBXHU1NzI4XHU5OTk2XHU2QjIxXHU4QkJGXHU5NUVFXHU2NUY2XHU4QkExXHU3Qjk3XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU1NzI4XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU2NUY2XG4vLyBcdTU5ODJcdTY3OUNcdTRFRTNcdTc4MDFcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTY1RjZcdTdBQ0JcdTUzNzNcdThCQkZcdTk1RUVcdThGRDlcdTRFOUJcdTVCRkNcdTUxRkFcdUZGMENcdTRFQ0RcdTcxMzZcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTUyMURcdTU5Q0JcdTUzMTZcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThcbi8vIFx1NUVGQVx1OEJBRVx1NEY3Rlx1NzUyOCBnZXRDdXJyZW50RW52aXJvbm1lbnQoKSBcdTU0OEMgZ2V0Q3VycmVudEVudkNvbmZpZygpIFx1NTFGRFx1NjU3MFx1NEVFM1x1NjZGRlxuZXhwb3J0IGNvbnN0IGN1cnJlbnRFbnZpcm9ubWVudCA9IGdldEN1cnJlbnRFbnZpcm9ubWVudCgpO1xuZXhwb3J0IGNvbnN0IGVudkNvbmZpZyA9IGdldEN1cnJlbnRFbnZDb25maWcoKTtcblxuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU3OUZCXHU5NjY0XHU0RTg2IGN1cnJlbnRTdWJBcHAgXHU1NDhDIGlzTWFpbkFwcE5vdyBcdTc2ODRcdTk4NzZcdTVDNDJcdTVCRkNcdTUxRkFcbi8vIFx1NTZFMFx1NEUzQVx1NUI4M1x1NEVFQ1x1NEYxQVx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NjVGNlx1OEMwM1x1NzUyOCBnZXRDdXJyZW50U3ViQXBwKCkgXHU1NDhDIGlzTWFpbkFwcCgpXG4vLyBcdThGRDlcdTRFOUJcdTUxRkRcdTY1NzBcdTRGOURcdThENTYgZ2V0QWxsQXBwcygpXHVGRjBDXHU1M0VGXHU4MEZEXHU1QkZDXHU4MUY0XHU1MjFEXHU1OUNCXHU1MzE2XHU5ODdBXHU1RThGXHU5NUVFXHU5ODk4XG4vLyBcdThCRjdcdTRGN0ZcdTc1MjggZ2V0Q3VycmVudFN1YkFwcCgpIFx1NTQ4QyBpc01haW5BcHAoKSBcdTUxRkRcdTY1NzBcdTY3NjVcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTUwM0NcblxuLy8gXHU0RUNFIGFwcC1lbnYuY29uZmlnIFx1OTFDRFx1NjVCMFx1NUJGQ1x1NTFGQVx1RkYwQ1x1NEVFNVx1NEZCRlx1NEVDRSB1bmlmaWVkLWVudi1jb25maWcgXHU3RURGXHU0RTAwXHU1QkZDXHU1MTY1XG5leHBvcnQgeyBnZXRBcHBDb25maWcsIGdldEFwcENvbmZpZ0J5VGVzdEhvc3QsIGdldEFwcENvbmZpZ0J5UHJlUG9ydCwgZ2V0QXBwQ29uZmlnQnlEZXZQb3J0LCBpc1NwZWNpYWxBcHBCeUlkLCBpc1NwZWNpYWxBcHAsIGlzQnVzaW5lc3NBcHAgfSBmcm9tICcuL2FwcC1lbnYuY29uZmlnJztcbmV4cG9ydCB0eXBlIHsgQXBwRW52Q29uZmlnIH0gZnJvbSAnLi9hcHAtZW52LmNvbmZpZyc7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFx1dGlsc1xcXFxlbnYtaW5mby50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvdXRpbHMvZW52LWluZm8udHNcIjsvKipcbiAqIFx1NTE2OFx1NUM0MFx1NzNBRlx1NTg4M1x1NEZFMVx1NjA2Rlx1NURFNVx1NTE3N1x1NTFGRFx1NjU3MFxuICogXHU2M0QwXHU0RjlCXHU5NzVFXHU1NENEXHU1RTk0XHU1RjBGXHU3Njg0XHU3M0FGXHU1ODgzXHU0RkUxXHU2MDZGXHU4M0I3XHU1M0Q2XHU1MUZEXHU2NTcwXHVGRjBDXHU2NUI5XHU0RkJGXHU1NzI4XHU5NzVFIFZ1ZSBcdTRFRTNcdTc4MDFcdTRFMkRcdTRGN0ZcdTc1MjhcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEVudmlyb25tZW50IH0gZnJvbSAnLi4vY29uZmlncy91bmlmaWVkLWVudi1jb25maWcnO1xuaW1wb3J0IHsgZ2V0RW52aXJvbm1lbnQsIGdldEN1cnJlbnRTdWJBcHAgfSBmcm9tICcuLi9jb25maWdzL3VuaWZpZWQtZW52LWNvbmZpZyc7XG5pbXBvcnQgeyBnZXRBcHBDb25maWcgfSBmcm9tICcuLi9jb25maWdzL2FwcC1lbnYuY29uZmlnJztcblxuLyoqXG4gKiBcdTczQUZcdTU4ODNcdTRGRTFcdTYwNkZcdTYzQTVcdTUzRTNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbnZJbmZvIHtcbiAgZW52aXJvbm1lbnQ6IEVudmlyb25tZW50O1xuICBpc0RldjogYm9vbGVhbjtcbiAgaXNQcmV2aWV3OiBib29sZWFuO1xuICBpc1Rlc3Q6IGJvb2xlYW47XG4gIGlzUHJvZHVjdGlvbjogYm9vbGVhbjtcbiAgY3VycmVudEFwcDogc3RyaW5nIHwgbnVsbDtcbiAgY3VycmVudEFwcENvbmZpZzogUmV0dXJuVHlwZTx0eXBlb2YgZ2V0QXBwQ29uZmlnPiB8IG51bGw7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzXHU0RkUxXHU2MDZGXG4gKiBAcmV0dXJucyBcdTVGNTNcdTUyNERcdTczQUZcdTU4ODNcdTU0OENcdTVFOTRcdTc1MjhcdTRGRTFcdTYwNkZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudkluZm8oKTogRW52SW5mbyB7XG4gIGNvbnN0IGVudmlyb25tZW50ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgY29uc3QgY3VycmVudEFwcCA9IGdldEN1cnJlbnRTdWJBcHAoKTtcbiAgXG4gIHJldHVybiB7XG4gICAgZW52aXJvbm1lbnQsXG4gICAgaXNEZXY6IGVudmlyb25tZW50ID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgIGlzUHJldmlldzogZW52aXJvbm1lbnQgPT09ICdwcmV2aWV3JyxcbiAgICBpc1Rlc3Q6IGVudmlyb25tZW50ID09PSAndGVzdCcsXG4gICAgaXNQcm9kdWN0aW9uOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgIGN1cnJlbnRBcHAsXG4gICAgY3VycmVudEFwcENvbmZpZzogY3VycmVudEFwcCA/IGdldEFwcENvbmZpZyhgJHtjdXJyZW50QXBwfS1hcHBgKSA6IG51bGwsXG4gIH07XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzXG4gKiBAcmV0dXJucyBcdTVGNTNcdTUyNERcdTczQUZcdTU4ODNcdTdDN0JcdTU3OEJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRFbnZpcm9ubWVudCgpOiBFbnZpcm9ubWVudCB7XG4gIHJldHVybiBnZXRFbnZpcm9ubWVudCgpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOCBJRFxuICogQHJldHVybnMgXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4IElEXHVGRjA4XHU1OTgyICdhZG1pbidcdTMwMDEnc3lzdGVtJ1x1RkYwOVx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTIxOVx1NEUzQSBudWxsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50QXBwSWQoKTogc3RyaW5nIHwgbnVsbCB7XG4gIHJldHVybiBnZXRDdXJyZW50U3ViQXBwKCk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKiBAcmV0dXJucyBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODRcdTkxNERcdTdGNkVcdTRGRTFcdTYwNkZcdUZGMENcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUyMTlcdTRFM0EgbnVsbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudEFwcENvbmZpZygpOiBSZXR1cm5UeXBlPHR5cGVvZiBnZXRBcHBDb25maWc+IHwgbnVsbCB7XG4gIGNvbnN0IGN1cnJlbnRBcHAgPSBnZXRDdXJyZW50U3ViQXBwKCk7XG4gIGlmICghY3VycmVudEFwcCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBnZXRBcHBDb25maWcoYCR7Y3VycmVudEFwcH0tYXBwYCk7XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFx1dGlsc1xcXFxsb2dnZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxccGFja2FnZXNcXFxcc2hhcmVkLWNvcmVcXFxcc3JjXFxcXHV0aWxzXFxcXGxvZ2dlclxcXFxpbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvdXRpbHMvbG9nZ2VyL2luZGV4LnRzXCI7LyoqXG4gKiBcdTdFREZcdTRFMDBcdTY1RTVcdTVGRDdcdTZBMjFcdTU3NTdcbiAqIFx1NTdGQVx1NEU4RSBQaW5vIFx1NzY4NFx1NjVFNVx1NUZEN1x1N0NGQlx1N0VERlx1RkYwQ1x1OTZDNlx1NjIxMFx1NTIzMFx1NzNCMFx1NjcwOVx1NzY4NFx1NjVFNVx1NUZEN1x1NEUwQVx1NjJBNVx1NjczQVx1NTIzNlxuICovXG5cbmltcG9ydCBwaW5vIGZyb20gJ3Bpbm8nO1xuaW1wb3J0IHsgY3JlYXRlUGlub0xvZ2dlciB9IGZyb20gJy4vcGluby1jb25maWcnO1xuaW1wb3J0IHsgY3JlYXRlTG9nVHJhbnNwb3J0IH0gZnJvbSAnLi90cmFuc3BvcnRzJztcbmltcG9ydCB0eXBlIHsgTG9nQ29udGV4dCwgTG9nTGV2ZWwsIExvZ2dlck9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGdldEN1cnJlbnRBcHBJZCB9IGZyb20gJy4uL2Vudi1pbmZvJztcblxuLy8gXHU1MTY4XHU1QzQwXHU0RTBBXHU0RTBCXHU2NTg3XHVGRjA4XHU3NTI4XHU2MjM3XHU0RkUxXHU2MDZGXHUzMDAxXHU4QkY3XHU2QzQySURcdTdCNDlcdUZGMDlcbmxldCBnbG9iYWxDb250ZXh0OiBMb2dDb250ZXh0ID0ge307XG5cbi8qKlxuICogXHU4QkJFXHU3RjZFXHU1MTY4XHU1QzQwXHU2NUU1XHU1RkQ3XHU0RTBBXHU0RTBCXHU2NTg3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRMb2dDb250ZXh0KGNvbnRleHQ6IExvZ0NvbnRleHQpIHtcbiAgZ2xvYmFsQ29udGV4dCA9IHsgLi4uZ2xvYmFsQ29udGV4dCwgLi4uY29udGV4dCB9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NTE2OFx1NUM0MFx1NjVFNVx1NUZEN1x1NEUwQVx1NEUwQlx1NjU4N1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9nQ29udGV4dCgpOiBMb2dDb250ZXh0IHtcbiAgcmV0dXJuIHsgLi4uZ2xvYmFsQ29udGV4dCB9O1xufVxuXG4vKipcbiAqIFx1NkUwNVx1OTY2NFx1NTE2OFx1NUM0MFx1NjVFNVx1NUZEN1x1NEUwQVx1NEUwQlx1NjU4N1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJMb2dDb250ZXh0KCkge1xuICBnbG9iYWxDb250ZXh0ID0ge307XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU1RTI2XHU0RTBBXHU0RTBCXHU2NTg3XHU3Njg0IGxvZ2dlciBcdTVCOUVcdTRGOEJcbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9nZ2VyV2l0aENvbnRleHQoY29udGV4dD86IExvZ0NvbnRleHQpOiBwaW5vLkxvZ2dlciB7XG4gIC8vIFx1NUI4OVx1NTE2OFx1ODNCN1x1NTNENiBhcHBJZFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICBsZXQgYXBwSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICB0cnkge1xuICAgIGFwcElkID0gY29udGV4dD8uYXBwSWQgfHwgZ2xvYmFsQ29udGV4dC5hcHBJZCB8fCBnZXRDdXJyZW50QXBwSWQoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUMgZ2V0Q3VycmVudEFwcElkIFx1NTkzMVx1OEQyNVx1RkYwOFx1NTNFRlx1ODBGRFx1NTZFMFx1NEUzQVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1NEY3Rlx1NzUyOCBudWxsXG4gICAgLy8gXHU4RkQ5XHU1NzI4XHU2QTIxXHU1NzU3XHU1MjFEXHU1OUNCXHU1MzE2XHU5NjM2XHU2QkI1XHU2NjJGXHU2QjYzXHU1RTM4XHU3Njg0XG4gICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1IGltcG9ydC5tZXRhLmVudiBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICB0cnkge1xuICAgICAgaWYgKGltcG9ydC5tZXRhPy5lbnY/LkRFVikge1xuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTUzRUZcdTRFRTVcdThCQjBcdTVGNTVcdThCNjZcdTU0NEFcdUZGMENcdTRGNDZcdTRFMERcdTVGNzFcdTU0Q0QgbG9nZ2VyIFx1NTIxRFx1NTlDQlx1NTMxNlxuICAgICAgICBjb25zb2xlLndhcm4oJ1tsb2dnZXJdIGdldEN1cnJlbnRBcHBJZCgpIFx1OEMwM1x1NzUyOFx1NTkzMVx1OEQyNVx1RkYwQ1x1NTNFRlx1ODBGRFx1NjYyRlx1NkEyMVx1NTc1N1x1NTIxRFx1NTlDQlx1NTMxNlx1OTYzNlx1NkJCNTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gaW1wb3J0Lm1ldGEuZW52IFx1NTNFRlx1ODBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwOFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1RkYwOVx1RkYwQ1x1NUZGRFx1NzU2NVxuICAgIH1cbiAgfVxuICBcbiAgY29uc3QgbWVyZ2VkQ29udGV4dCA9IHtcbiAgICAuLi5nbG9iYWxDb250ZXh0LFxuICAgIC4uLmNvbnRleHQsXG4gICAgYXBwSWQ6IGFwcElkIHx8IHVuZGVmaW5lZCxcbiAgfTtcblxuICAvLyBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDAgbG9nZ2VyXHVGRjBDXHU0RjIwXHU1MTY1XHU0RTBBXHU0RTBCXHU2NTg3XHU3NTI4XHU0RThFXHU0RjIwXHU4RjkzXHU1NjY4XG4gIGNvbnN0IGJhc2VMb2dnZXIgPSBjcmVhdGVQaW5vTG9nZ2VyKG1lcmdlZENvbnRleHQpO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NjcwOVx1NEUwQVx1NEUwQlx1NjU4N1x1RkYwQ1x1NTIxQlx1NUVGQVx1NUI1MCBsb2dnZXJcbiAgaWYgKE9iamVjdC5rZXlzKG1lcmdlZENvbnRleHQpLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gYmFzZUxvZ2dlci5jaGlsZChtZXJnZWRDb250ZXh0KTtcbiAgfVxuXG4gIHJldHVybiBiYXNlTG9nZ2VyO1xufVxuXG4vLyBcdTUyMUJcdTVFRkFcdTlFRDhcdThCQTQgbG9nZ2VyIFx1NUI5RVx1NEY4QlxubGV0IGRlZmF1bHRMb2dnZXI6IHBpbm8uTG9nZ2VyID0gY3JlYXRlTG9nZ2VyV2l0aENvbnRleHQoKTtcblxuLyoqXG4gKiBcdTkxQ0RcdTY1QjBcdTUyMURcdTU5Q0JcdTUzMTYgbG9nZ2VyXHVGRjA4XHU1RjUzXHU0RTBBXHU0RTBCXHU2NTg3XHU1M0Q4XHU1MzE2XHU2NUY2XHU4QzAzXHU3NTI4XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWluaXRpYWxpemVMb2dnZXIoY29udGV4dD86IExvZ0NvbnRleHQpIHtcbiAgZGVmYXVsdExvZ2dlciA9IGNyZWF0ZUxvZ2dlcldpdGhDb250ZXh0KGNvbnRleHQpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBsb2dnZXIgXHU1QjlFXHU0RjhCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2dnZXIoY29udGV4dD86IExvZ0NvbnRleHQpOiBwaW5vLkxvZ2dlciB7XG4gIGlmIChjb250ZXh0KSB7XG4gICAgcmV0dXJuIGNyZWF0ZUxvZ2dlcldpdGhDb250ZXh0KGNvbnRleHQpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0TG9nZ2VyO1xufVxuXG4vKipcbiAqIFx1NEZCRlx1NjM3N1x1NzY4NFx1NjVFNVx1NUZEN1x1NjVCOVx1NkNENVxuICovXG5leHBvcnQgY29uc3QgbG9nZ2VyID0ge1xuICAvKipcbiAgICogRGVidWcgXHU3RUE3XHU1MjJCXHU2NUU1XHU1RkQ3XG4gICAqL1xuICBkZWJ1ZzogKG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogYW55W10pID0+IHtcbiAgICBkZWZhdWx0TG9nZ2VyLmRlYnVnKHsgLi4uYXJncyB9LCBtZXNzYWdlKTtcbiAgfSxcblxuICAvKipcbiAgICogSW5mbyBcdTdFQTdcdTUyMkJcdTY1RTVcdTVGRDdcbiAgICovXG4gIGluZm86IChtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgZGVmYXVsdExvZ2dlci5pbmZvKHsgLi4uYXJncyB9LCBtZXNzYWdlKTtcbiAgfSxcblxuICAvKipcbiAgICogV2FybiBcdTdFQTdcdTUyMkJcdTY1RTVcdTVGRDdcbiAgICovXG4gIHdhcm46IChtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgZGVmYXVsdExvZ2dlci53YXJuKHsgLi4uYXJncyB9LCBtZXNzYWdlKTtcbiAgfSxcblxuICAvKipcbiAgICogRXJyb3IgXHU3RUE3XHU1MjJCXHU2NUU1XHU1RkQ3XG4gICAqL1xuICBlcnJvcjogKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I/OiBFcnJvciB8IGFueSwgLi4uYXJnczogYW55W10pID0+IHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgZGVmYXVsdExvZ2dlci5lcnJvcih7IGVycjogZXJyb3IsIC4uLmFyZ3MgfSwgbWVzc2FnZSk7XG4gICAgfSBlbHNlIGlmIChlcnJvcikge1xuICAgICAgZGVmYXVsdExvZ2dlci5lcnJvcih7IC4uLmVycm9yLCAuLi5hcmdzIH0sIG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZhdWx0TG9nZ2VyLmVycm9yKHsgLi4uYXJncyB9LCBtZXNzYWdlKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZhdGFsIFx1N0VBN1x1NTIyQlx1NjVFNVx1NUZEN1xuICAgKi9cbiAgZmF0YWw6IChtZXNzYWdlOiBzdHJpbmcsIGVycm9yPzogRXJyb3IgfCBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGRlZmF1bHRMb2dnZXIuZmF0YWwoeyBlcnI6IGVycm9yLCAuLi5hcmdzIH0sIG1lc3NhZ2UpO1xuICAgIH0gZWxzZSBpZiAoZXJyb3IpIHtcbiAgICAgIGRlZmF1bHRMb2dnZXIuZmF0YWwoeyAuLi5lcnJvciwgLi4uYXJncyB9LCBtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmYXVsdExvZ2dlci5mYXRhbCh7IC4uLmFyZ3MgfSwgbWVzc2FnZSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcdTVFMjZcdTRFMEFcdTRFMEJcdTY1ODdcdTc2ODRcdTVCNTAgbG9nZ2VyXG4gICAqL1xuICBjaGlsZDogKGNvbnRleHQ6IExvZ0NvbnRleHQpID0+IHtcbiAgICByZXR1cm4gY3JlYXRlTG9nZ2VyV2l0aENvbnRleHQoY29udGV4dCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1OEJCRVx1N0Y2RVx1NjVFNVx1NUZEN1x1N0VBN1x1NTIyQlxuICAgKi9cbiAgc2V0TGV2ZWw6IChsZXZlbDogTG9nTGV2ZWwpID0+IHtcbiAgICBkZWZhdWx0TG9nZ2VyLmxldmVsID0gbGV2ZWw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NjVFNVx1NUZEN1x1N0VBN1x1NTIyQlxuICAgKi9cbiAgZ2V0TGV2ZWw6ICgpID0+IHtcbiAgICByZXR1cm4gZGVmYXVsdExvZ2dlci5sZXZlbDtcbiAgfSxcbn07XG5cbi8vIFx1NUJGQ1x1NTFGQVx1N0M3Qlx1NTc4QlxuZXhwb3J0IHR5cGUgeyBMb2dDb250ZXh0LCBMb2dMZXZlbCwgTG9nZ2VyT3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnO1xuZXhwb3J0IHR5cGUgeyBMb2dnZXIgfSBmcm9tICdwaW5vJztcblxuLy8gXHU5RUQ4XHU4QkE0XHU1QkZDXHU1MUZBIGxvZ2dlclxuZXhwb3J0IGRlZmF1bHQgbG9nZ2VyO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7aW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZS9jbGllbnRcIiAvPlxuXG4vKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgdGVzdEhvc3Q/OiBzdHJpbmc7IC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOFx1NUI1MFx1NTdERlx1NTQwRFx1RkYwOFx1NTk4MiBhZG1pbi50ZXN0LmJlbGxpcy5jb20uY25cdUZGMDlcdUZGMENcdTRFMERcdTRGN0ZcdTc1MjhcdTdBRUZcdTUzRTNcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTRFM0JcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuY29uc3QgTUFJTl9BUFBfQ09ORklHOiBBcHBFbnZDb25maWcgPSB7XG4gIGFwcE5hbWU6ICdtYWluLWFwcCcsXG4gIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gIGRldlBvcnQ6ICc4MDgwJyxcbiAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gIHByZVBvcnQ6ICc0MTgwJyxcbiAgdGVzdEhvc3Q6ICd0ZXN0LmJlbGxpcy5jb20uY24nLFxuICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxufTtcblxuLyoqXG4gKiBcdTRFMUFcdTUyQTFcdTVCNTBcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgQlVTSU5FU1NfQVBQX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHRlc3RIb3N0OiAnYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2FkbWluLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2Rhc2hib2FyZC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgyJyxcbiAgICB0ZXN0SG9zdDogJ2Rhc2hib2FyZC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZGFzaGJvYXJkLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2VuZ2luZWVyaW5nLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHRlc3RIb3N0OiAnZW5naW5lZXJpbmcudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NCcsXG4gICAgdGVzdEhvc3Q6ICdmaW5hbmNlLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xvZ2lzdGljcy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg2JyxcbiAgICB0ZXN0SG9zdDogJ2xvZ2lzdGljcy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnbG9naXN0aWNzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ29wZXJhdGlvbnMtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg4JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4OCcsXG4gICAgdGVzdEhvc3Q6ICdvcGVyYXRpb25zLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdvcGVyYXRpb25zLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3BlcnNvbm5lbC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODknLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg5JyxcbiAgICB0ZXN0SG9zdDogJ3BlcnNvbm5lbC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAncGVyc29ubmVsLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3Byb2R1Y3Rpb24tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkwJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MCcsXG4gICAgdGVzdEhvc3Q6ICdwcm9kdWN0aW9uLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdwcm9kdWN0aW9uLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3F1YWxpdHktYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgdGVzdEhvc3Q6ICdxdWFsaXR5LnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdxdWFsaXR5LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkyJyxcbiAgICB0ZXN0SG9zdDogJ3N5c3RlbS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnc3lzdGVtLmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgU1BFQ0lBTF9BUFBfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnZG9jcy1hcHAnLFxuICAgIGRldkhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIGRldlBvcnQ6ICc4MDkzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MycsXG4gICAgdGVzdEhvc3Q6ICdkb2NzLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdkb2NzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2hvbWUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgdGVzdEhvc3Q6ICd3d3cudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3d3dy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsYXlvdXQtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5NCcsXG4gICAgdGVzdEhvc3Q6ICdsYXlvdXQudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2xheW91dC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb2JpbGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg3JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NycsXG4gICAgdGVzdEhvc3Q6ICdtb2JpbGUudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ21vYmlsZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKiBcdTU0MDhcdTVFNzZcdTRFM0JcdTVFOTRcdTc1MjhcdTMwMDFcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdTU0OENcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIE1BSU5fQVBQX0NPTkZJRyxcbiAgLi4uQlVTSU5FU1NfQVBQX0NPTkZJR1MsXG4gIC4uLlNQRUNJQUxfQVBQX0NPTkZJR1MsXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NEY3Rlx1NzUyOCB0cnktY2F0Y2ggXHU2MzU1XHU4M0I3XHU1M0VGXHU4MEZEXHU3Njg0IFREWiAoVGVtcG9yYWwgRGVhZCBab25lKSBcdTk1MTlcdThCRUZcbiAgLy8gXHU1OTgyXHU2NzlDIEFQUF9FTlZfQ09ORklHUyBcdThGRDhcdTZDQTFcdTY3MDlcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTc1MzFcdTRFOEVcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTYyMTZcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgdHJ5IHtcbiAgICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnYmVmb3JlIGluaXRpYWxpemF0aW9uJykpIHtcbiAgICAgIGlmICh0eXBlb2YgaW1wb3J0Lm1ldGEgIT09ICd1bmRlZmluZWQnICYmIGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdbYXBwLWVudi5jb25maWddIEFQUF9FTlZfQ09ORklHUyBcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU5MUNEXHU2NUIwXHU2MjlCXHU1MUZBXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU0RjdGXHU3NTI4IHRyeS1jYXRjaCBcdTYzNTVcdTgzQjdcdTUzRUZcdTgwRkRcdTc2ODQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIFx1OTUxOVx1OEJFRlxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NzUzMVx1NEU4RVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NjIxNlx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICB0cnkge1xuICAgIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdiZWZvcmUgaW5pdGlhbGl6YXRpb24nKSkge1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTVCNTBcdTU3REZcdTU0MERcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5VGVzdEhvc3QodGVzdEhvc3Q6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcudGVzdEhvc3QgPT09IHRlc3RIb3N0KTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggU1BFQ0lBTF9BUFBfQ09ORklHUyBcdTRFMkRcdUZGMDlcbiAqIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NTMwNVx1NjJFQ1x1RkYxQWRvY3MtYXBwLCBob21lLWFwcCwgbGF5b3V0LWFwcCwgbW9iaWxlLWFwcFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcGVjaWFsQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gU1BFQ0lBTF9BUFBfQ09ORklHUy5zb21lKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggQlVTSU5FU1NfQVBQX0NPTkZJR1MgXHU0RTJEXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gQlVTSU5FU1NfQVBQX0NPTkZJR1Muc29tZSgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4IElEIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFxuICogXHU1RTk0XHU3NTI4IElEIFx1NjYyRiBhcHBOYW1lIFx1NTNCQlx1NjM4OSAnLWFwcCcgXHU1NDBFXHU3RjAwXHU1NDBFXHU3Njg0XHU1MDNDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpYWxBcHBCeUlkKGFwcElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYXBwTmFtZSA9IGAke2FwcElkfS1hcHBgO1xuICByZXR1cm4gaXNTcGVjaWFsQXBwKGFwcE5hbWUpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZW5naW5lZXJpbmctYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZW5naW5lZXJpbmctYXBwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvZW5naW5lZXJpbmctYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvc3ViYXBwLmNvbmZpZyc7XG5pbXBvcnQgeyBwcm94eSBhcyBtYWluUHJveHkgfSBmcm9tICcuLi9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhcbiAgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyh7XG4gICAgYXBwTmFtZTogJ2VuZ2luZWVyaW5nLWFwcCcsXG4gICAgYXBwRGlyOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICBxaWFua3VuTmFtZTogJ2VuZ2luZWVyaW5nJyxcbiAgICBjdXN0b21TZXJ2ZXI6IHsgcHJveHk6IG1haW5Qcm94eSB9LFxuICAgIHByb3h5OiBtYWluUHJveHksXG4gIH0pXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGZhY3Rvcmllc1xcXFxzdWJhcHAuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvc3ViYXBwLmNvbmZpZy50c1wiOy8qKlxuICogXHU1QjUwXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHU1REU1XHU1MzgyXG4gKiBcdTc1MUZcdTYyMTBcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODRcdTVCOENcdTY1NzQgVml0ZSBcdTkxNERcdTdGNkVcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbW9kdWxlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCc7XG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbi8vIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NzY4NFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOEVTTSBcdTY1QjlcdTVGMEZcdUZGMDlcbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG4vLyBcdTVFRjZcdThGREZcdTUyQTBcdThGN0QgVnVlSTE4blBsdWdpblx1RkYwQ1x1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1ODlFM1x1Njc5MFxuLy8gXHU0RjdGXHU3NTI4XHU1MUZEXHU2NTcwXHU1MTg1XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjBDXHU3ODZFXHU0RkREXHU0RUNFXHU4QzAzXHU3NTI4XHU4MDA1XHU3Njg0IG5vZGVfbW9kdWxlcyBcdTg5RTNcdTY3OTBcbmltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICdub2RlOnVybCc7XG5mdW5jdGlvbiBnZXRWdWVJMThuUGx1Z2luKGFwcERpcjogc3RyaW5nKSB7XG4gIC8vIFx1NEY3Rlx1NzUyOCBjcmVhdGVSZXF1aXJlIFx1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1ODlFM1x1Njc5MFx1NTMwNVxuICAvLyBcdTkwMUFcdThGQzcgZmlsZTovLyBVUkwgXHU1MjFCXHU1RUZBXHU2QjYzXHU3ODZFXHU3Njg0IHJlcXVpcmUgXHU0RTBBXHU0RTBCXHU2NTg3XG4gIGNvbnN0IGFwcERpclVybCA9IHBhdGhUb0ZpbGVVUkwocmVzb2x2ZShhcHBEaXIsICdwYWNrYWdlLmpzb24nKSkuaHJlZjtcbiAgY29uc3QgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoYXBwRGlyVXJsKTtcbiAgY29uc3QgcGx1Z2luID0gcmVxdWlyZSgnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZScpO1xuICByZXR1cm4gcGx1Z2luLmRlZmF1bHQgfHwgcGx1Z2luO1xufVxuaW1wb3J0IHsgY3JlYXRlQXV0b0ltcG9ydENvbmZpZywgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyB9IGZyb20gJy4uLy4uL2F1dG8taW1wb3J0LmNvbmZpZyc7XG5pbXBvcnQgeyBidGMsIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbiB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZywgZ2V0QmFzZVVybCwgZ2V0UHVibGljRGlyIH0gZnJvbSAnLi4vLi4vdml0ZS1hcHAtY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZUJhc2VSZXNvbHZlIH0gZnJvbSAnLi4vYmFzZS5jb25maWcnO1xuaW1wb3J0IHsgY3JlYXRlUm9sbHVwQ29uZmlnIH0gZnJvbSAnLi4vcGx1Z2lucy9yb2xsdXAtY29uZmlnJztcbmltcG9ydCB7XG4gIGNsZWFuRGlzdFBsdWdpbixcbiAgY2h1bmtWZXJpZnlQbHVnaW4sXG4gIG9wdGltaXplQ2h1bmtzUGx1Z2luLFxuICBlbnN1cmVCYXNlVXJsUGx1Z2luLFxuICBjb3JzUGx1Z2luLFxuICBlbnN1cmVDc3NQbHVnaW4sXG4gIGFkZFZlcnNpb25QbHVnaW4sXG4gIHJlcGxhY2VJY29uc1dpdGhDZG5QbHVnaW4sXG4gIHJlc29sdmVMb2dvUGx1Z2luLFxuICB1cGxvYWRDZG5QbHVnaW4sXG4gIGNkbkFzc2V0c1BsdWdpbixcbiAgY2RuSW1wb3J0UGx1Z2luLFxuICByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbixcbiAgbG9jYWxlc1N0YXRpY1BsdWdpbixcbn0gZnJvbSAnLi4vcGx1Z2lucyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN1YkFwcFZpdGVDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gICAqL1xuICBhcHBEaXI6IHN0cmluZztcbiAgLyoqXG4gICAqIFFpYW5rdW4gXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdhZG1pbidcdUZGMDlcbiAgICovXG4gIHFpYW5rdW5OYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdTUyMTdcdTg4NjhcbiAgICovXG4gIGN1c3RvbVBsdWdpbnM/OiBQbHVnaW5bXTtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1Njc4NFx1NUVGQVx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tQnVpbGQ/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ2J1aWxkJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gICAqL1xuICBjdXN0b21TZXJ2ZXI/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ3NlcnZlciddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tUHJldmlldz86IFBhcnRpYWw8VXNlckNvbmZpZ1sncHJldmlldyddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEYxOFx1NTMxNlx1NEY5RFx1OEQ1Nlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tT3B0aW1pemVEZXBzPzogUGFydGlhbDxVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDkgQ1NTIFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tQ3NzPzogUGFydGlhbDxVc2VyQ29uZmlnWydjc3MnXT47XG4gIC8qKlxuICAgKiBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcbiAgICovXG4gIHByb3h5PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgLyoqXG4gICAqIEJUQyBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcbiAgICovXG4gIGJ0Y09wdGlvbnM/OiB7XG4gICAgdHlwZT86ICdzdWJhcHAnO1xuICAgIHByb3h5PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBlcHM/OiB7XG4gICAgICBlbmFibGU/OiBib29sZWFuO1xuICAgICAgZGljdD86IGJvb2xlYW47XG4gICAgICBkaXN0Pzogc3RyaW5nO1xuICAgIH07XG4gICAgc3ZnPzoge1xuICAgICAgc2tpcE5hbWVzPzogc3RyaW5nW107XG4gICAgfTtcbiAgfTtcbiAgLyoqXG4gICAqIFZ1ZUkxOG4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICB2dWVJMThuT3B0aW9ucz86IHtcbiAgICBpbmNsdWRlPzogc3RyaW5nW107XG4gICAgcnVudGltZU9ubHk/OiBib29sZWFuO1xuICB9O1xuICAvKipcbiAgICogUWlhbmt1biBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcbiAgICovXG4gIHFpYW5rdW5PcHRpb25zPzoge1xuICAgIHVzZURldk1vZGU/OiBib29sZWFuO1xuICB9O1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NUI1MFx1NUU5NFx1NzUyOCBWaXRlIFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyhvcHRpb25zOiBTdWJBcHBWaXRlQ29uZmlnT3B0aW9ucyk6IFVzZXJDb25maWcge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICBhcHBEaXIsXG4gICAgcWlhbmt1bk5hbWUsXG4gICAgY3VzdG9tUGx1Z2lucyA9IFtdLFxuICAgIGN1c3RvbUJ1aWxkLFxuICAgIGN1c3RvbVNlcnZlcixcbiAgICBjdXN0b21QcmV2aWV3LFxuICAgIGN1c3RvbU9wdGltaXplRGVwcyxcbiAgICBjdXN0b21Dc3MsXG4gICAgcHJveHkgPSB7fSxcbiAgICBidGNPcHRpb25zID0ge30sXG4gICAgdnVlSTE4bk9wdGlvbnMsXG4gICAgcWlhbmt1bk9wdGlvbnMgPSB7IHVzZURldk1vZGU6IHRydWUgfSxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoYXBwTmFtZSk7XG4gIC8vIFx1NEY3Rlx1NzUyOFx1NUJGQ1x1NTE2NVx1NzY4NCBjcmVhdGVQYXRoSGVscGVyc1xuICBjb25zdCB7IHdpdGhSb290IH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIC8vIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVxuICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICBjb25zdCBiYXNlVXJsID0gZ2V0QmFzZVVybChhcHBOYW1lLCBpc1ByZXZpZXdCdWlsZCk7XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUI1MFx1NUU5NFx1NzUyOFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1Nzk4MVx1NzUyOCBwdWJsaWNEaXJcdUZGMENcdTkwN0ZcdTUxNERcdTYyNTNcdTUzMDVcdTU2RkVcdTY4MDdcdTdCNDlcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcbiAgLy8gXHU1NkZFXHU2ODA3XHU3QjQ5XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1RTk0XHU4QkU1XHU3NTMxIGxheW91dC1hcHAgXHU3RURGXHU0RTAwXHU3QkExXHU3NDA2XG4gIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEVDRFx1NzEzNlx1OTcwMFx1ODk4MSBwdWJsaWNEaXIgXHU2NzY1XHU2NzBEXHU1MkExXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XG4gIGNvbnN0IHB1YmxpY0RpciA9IGlzUHJldmlld0J1aWxkID8gZ2V0UHVibGljRGlyKGFwcE5hbWUsIGFwcERpcikgOiBmYWxzZTtcblxuICAvLyBcdTgzQjdcdTUzRDZcdTRFM0JcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAgY29uc3QgbWFpbkFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoJ21haW4tYXBwJyk7XG4gIGNvbnN0IG1haW5BcHBQb3J0ID0gbWFpbkFwcENvbmZpZy5wcmVQb3J0LnRvU3RyaW5nKCk7XG5cbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBRVBTIFx1NzY4NCBvdXRwdXREaXIgXHU1RkM1XHU5ODdCXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1N0ZBXHU0RThFIGFwcERpciBcdTg5RTNcdTY3OTBcbiAgLy8gXHU5MDdGXHU1MTREXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU1NkUwXHU0RTNBXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHU1M0Q4XHU1MzE2XHU4MDBDXHU1NzI4IGRpc3QgXHU3NkVFXHU1RjU1XHU0RTBCXHU1MjFCXHU1RUZBIGJ1aWxkIFx1NzZFRVx1NUY1NVxuICBjb25zdCBlcHNPdXRwdXREaXIgPSByZXNvbHZlKGFwcERpciwgJ2J1aWxkJywgJ2VwcycpO1xuXG4gIC8vIFx1NTE3MVx1NEVBQlx1NzY4NCBFUFMgXHU2NTcwXHU2MzZFXHU2RTkwXHU3NkVFXHU1RjU1XHVGRjA4XHU0RUNFIG1haW4tYXBwIFx1OEJGQlx1NTNENlx1RkYwOVxuICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTRGMThcdTUxNDhcdTRFQ0UgbWFpbi1hcHAgXHU3Njg0IGJ1aWxkL2VwcyBcdThCRkJcdTUzRDYgRVBTIFx1NjU3MFx1NjM2RVx1RkYwQ1x1NUI5RVx1NzNCMFx1NzcxRlx1NkI2M1x1NzY4NFx1NTE3MVx1NEVBQlxuICBjb25zdCBzaGFyZWRFcHNEaXIgPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL2FwcHMvbWFpbi1hcHAvYnVpbGQvZXBzJyk7XG5cbiAgLy8gXHU3ODZFXHU0RkREIGVwcyBlbmFibGUgXHU1OUNCXHU3RUM4XHU0RTNBIGJvb2xlYW4gXHU3QzdCXHU1NzhCXG4gIGNvbnN0IGVwc0VuYWJsZTogYm9vbGVhbiA9IGJ0Y09wdGlvbnMuZXBzPy5lbmFibGUgPz8gdHJ1ZTtcblxuICAvLyBcdTY3ODRcdTVFRkEgZXBzIFx1OTE0RFx1N0Y2RVx1RkYwQ1x1Nzg2RVx1NEZERCBlbmFibGUgXHU1OUNCXHU3RUM4XHU0RTNBIGJvb2xlYW5cbiAgY29uc3QgZXBzQ29uZmlnOiB7XG4gICAgZW5hYmxlOiBib29sZWFuO1xuICAgIGRpY3Q6IGJvb2xlYW47XG4gICAgZGljdEFwaT86IHN0cmluZztcbiAgICBkaXN0OiBzdHJpbmc7XG4gICAgc2hhcmVkRXBzRGlyOiBzdHJpbmc7XG4gIH0gPSB7XG4gICAgZW5hYmxlOiBlcHNFbmFibGUsXG4gICAgZGljdDogYnRjT3B0aW9ucy5lcHM/LmRpY3QgPz8gdHJ1ZSwgLy8gXHU5RUQ4XHU4QkE0XHU1NDJGXHU3NTI4XHU1QjU3XHU1MTc4XHU1MjlGXHU4MEZEXG4gICAgZGljdEFwaTogYnRjT3B0aW9ucy5lcHM/LmRpY3RBcGkgfHwgJy9hcGkvc3lzdGVtL2F1dGgvZGljdCcsIC8vIFx1OUVEOFx1OEJBNFx1NUI1N1x1NTE3OFx1NjNBNVx1NTNFM1xuICAgIGRpc3Q6IGVwc091dHB1dERpcixcbiAgICBzaGFyZWRFcHNEaXI6IHNoYXJlZEVwc0RpcixcbiAgfTtcblxuICAvLyBcdTY3ODRcdTVFRkFcdTYzRDJcdTRFRjZcdTUyMTdcdTg4NjhcbiAgY29uc3QgcGx1Z2luczogUGx1Z2luW10gPSBbXG4gICAgLy8gMS4gXHU2RTA1XHU3NDA2XHU2M0QyXHU0RUY2XG4gICAgY2xlYW5EaXN0UGx1Z2luKGFwcERpciksXG4gICAgLy8gMi4gQ09SUyBcdTYzRDJcdTRFRjZcbiAgICBjb3JzUGx1Z2luKCksXG4gICAgLy8gMy4gXHU4OUUzXHU2NzkwIEBidGMvKiBcdTUzMDVcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjggTG9nbyBcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdUZGMENcdTc4NkVcdTRGRERcdTgwRkRcdTU5MUZcdTg5RTNcdTY3OTBcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTc2ODQgQGJ0Yy8qIFx1NkEyMVx1NTc1N1x1RkYwOVxuICAgIHJlc29sdmVCdGNJbXBvcnRzUGx1Z2luKHsgYXBwRGlyIH0pLFxuICAgIC8vIDQuIExvZ28gXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjBDXHU3ODZFXHU0RkREIC9sb2dvLnBuZyBcdTgwRkRcdTg4QUJcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICByZXNvbHZlTG9nb1BsdWdpbihhcHBEaXIpLFxuICAgIC8vIDQuNS4gTG9jYWxlcyBcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdTYzRDJcdTRFRjZcdUZGMDhcdTYzRDBcdTRGOUIgc3JjL2xvY2FsZXMvKi5qc29uIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEY5Qlx1NEUzQlx1NUU5NFx1NzUyOFx1OTAxQVx1OEZDNyBmZXRjaCBcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBsb2NhbGVzU3RhdGljUGx1Z2luKGFwcERpciksXG4gICAgLy8gNS4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU2ODM4XHU1RkMzXHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjA5XG4gICAgLi4uY3VzdG9tUGx1Z2lucyxcbiAgICAvLyA0LiBWdWUgXHU2M0QyXHU0RUY2XG4gICAgdnVlKHtcbiAgICAgIHNjcmlwdDoge1xuICAgICAgICBmczoge1xuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXG4gICAgICAgICAgcmVhZEZpbGU6IChmaWxlOiBzdHJpbmcpID0+IHJlYWRGaWxlU3luYyhmaWxlLCAndXRmLTgnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgLy8gNC41LiBWdWUgSlNYIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBUU1ggXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0IEpTWCBcdThCRURcdTZDRDVcdUZGMDlcbiAgICB2dWVKc3goKSxcbiAgICAvLyA1LiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXG4gICAgLy8gNi4gXHU3RUM0XHU0RUY2XHU4MUVBXHU1MkE4XHU2Q0U4XHU1MThDXHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgLy8gNy4gVW5vQ1NTIFx1NjNEMlx1NEVGNlxuICAgIFVub0NTUyh7XG4gICAgICBjb25maWdGaWxlOiB3aXRoUm9vdCgndW5vLmNvbmZpZy50cycpLFxuICAgIH0pLFxuICAgIC8vIDguIEJUQyBcdTRFMUFcdTUyQTFcdTYzRDJcdTRFRjZcbiAgICBidGMoe1xuICAgICAgdHlwZTogJ3N1YmFwcCcgYXMgYW55LFxuICAgICAgcHJveHksXG4gICAgICBlcHM6IGVwc0NvbmZpZyBhcyBhbnksIC8vIFx1N0M3Qlx1NTc4Qlx1NjVBRFx1OEEwMFx1RkYxQVx1Nzg2RVx1NEZERCBlbmFibGUgXHU1OUNCXHU3RUM4XHU0RTNBIGJvb2xlYW5cbiAgICAgIHN2Zzoge1xuICAgICAgICBza2lwTmFtZXM6IFsnYmFzZScsICdpY29ucyddLFxuICAgICAgICAuLi5idGNPcHRpb25zLnN2ZyxcbiAgICAgIH0sXG4gICAgICAuLi5idGNPcHRpb25zLFxuICAgIH0pLFxuICAgIC8vIDkuIFZ1ZUkxOG4gXHU2M0QyXHU0RUY2XG4gICAgZ2V0VnVlSTE4blBsdWdpbihhcHBEaXIpKHtcbiAgICAgIGluY2x1ZGU6IHZ1ZUkxOG5PcHRpb25zPy5pbmNsdWRlIHx8IFtcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMvbG9jYWxlcy8qKicpXG4gICAgICBdLFxuICAgICAgcnVudGltZU9ubHk6IHZ1ZUkxOG5PcHRpb25zPy5ydW50aW1lT25seSA/PyB0cnVlLFxuICAgIH0pLFxuICAgIC8vIDEwLiBDU1MgXHU5QThDXHU4QkMxXHU2M0QyXHU0RUY2XG4gICAgZW5zdXJlQ3NzUGx1Z2luKCksXG4gICAgLy8gMTEuIFFpYW5rdW4gXHU2M0QyXHU0RUY2XG4gICAgcWlhbmt1bihxaWFua3VuTmFtZSwgcWlhbmt1bk9wdGlvbnMpLFxuICAgIC8vIDEyLiBcdTRGRUVcdTU5MEQgY2h1bmsgXHU1RjE1XHU3NTI4XHU2M0QyXHU0RUY2XG4gICAgZml4Q2h1bmtSZWZlcmVuY2VzUGx1Z2luKCksXG4gICAgLy8gMTUuIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbiAgICBlbnN1cmVCYXNlVXJsUGx1Z2luKGJhc2VVcmwsIGFwcENvbmZpZy5kZXZIb3N0LCBhcHBDb25maWcucHJlUG9ydCwgbWFpbkFwcFBvcnQpLFxuICAgIC8vIDE2LiBcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdUZGMDhcdTRFM0EgSFRNTCBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDlcbiAgICBhZGRWZXJzaW9uUGx1Z2luKCksXG4gICAgLy8gMTYuNS4gQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlx1NEU0Qlx1NTQwRVx1RkYwQ1x1Nzg2RVx1NEZERFx1NzI0OFx1NjcyQ1x1NTNGN1x1NTNDMlx1NjU3MFx1ODhBQlx1NEZERFx1NzU1OVx1RkYwOVxuICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MCBVUkxcdUZGMDg8c2NyaXB0Plx1MzAwMTxsaW5rPlx1MzAwMTxpbWc+IFx1N0I0OVx1RkYwOVxuICAgIGNkbkFzc2V0c1BsdWdpbih7XG4gICAgICBhcHBOYW1lLFxuICAgICAgZW5hYmxlZDogIWlzUHJldmlld0J1aWxkICYmIHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnLFxuICAgIH0pLFxuICAgIC8vIDE2LjYuIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTYzRDJcdTRFRjZcdUZGMDhcdThGNkNcdTYzNjJcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjA5XG4gICAgLy8gXHU1QzA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcdUZGMENcdTRFMEUgY2RuQXNzZXRzUGx1Z2luIFx1OTE0RFx1NTQwOFx1NUI5RVx1NzNCMFx1NUI4Q1x1NjU3NFx1NzY4NCBDRE4gXHU1MkEwXHU5MDFGXG4gICAgY2RuSW1wb3J0UGx1Z2luKHtcbiAgICAgIGFwcE5hbWUsXG4gICAgICBlbmFibGVkOiAhaXNQcmV2aWV3QnVpbGQgJiYgcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScsXG4gICAgfSksXG4gICAgLy8gMTYuNy4gXHU2NkZGXHU2MzYyXHU1NkZFXHU2ODA3XHU4REVGXHU1Rjg0XHU0RTNBIENETiBVUkxcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcbiAgICByZXBsYWNlSWNvbnNXaXRoQ2RuUGx1Z2luKCksXG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RTBEXHU1MThEXHU5NzAwXHU4OTgxIHJlc29sdmVFeHRlcm5hbEltcG9ydHNQbHVnaW5cdUZGMENcdTU2RTBcdTRFM0FcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVxuICAgIC8vIDE3LiBcdTRGMThcdTUzMTYgY2h1bmtzIFx1NjNEMlx1NEVGNlxuICAgIG9wdGltaXplQ2h1bmtzUGx1Z2luKCksXG4gICAgLy8gMTguIENodW5rIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxuICAgIGNodW5rVmVyaWZ5UGx1Z2luKCksXG4gICAgLy8gMTkuIENETiBcdTRFMEFcdTRGMjBcdTYzRDJcdTRFRjZcdUZGMDhcdTRFQzVcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTRFMTRcdTU0MkZcdTc1MjhcdTY1RjZcdUZGMDlcbiAgICAuLi4ocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9VUExPQUQgPT09ICd0cnVlJyAmJiAhaXNQcmV2aWV3QnVpbGRcbiAgICAgID8gW3VwbG9hZENkblBsdWdpbihhcHBOYW1lLCBhcHBEaXIpXVxuICAgICAgOiBbXSksXG4gIF07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gIGNvbnN0IGJ1aWxkQ29uZmlnOiBVc2VyQ29uZmlnWydidWlsZCddID0ge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTRFRTNcdTc4MDFcdTUzOEJcdTdGMjlcdUZGMENcdTkwN0ZcdTUxNEQgVGVyc2VyIFx1NTM4Qlx1N0YyOVx1NUJGQ1x1ODFGNFx1NzY4NFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NTIwNlx1OTY5NFx1N0IyNlx1NEUyMlx1NTkzMVx1OTVFRVx1OTg5OFxuICAgIG1pbmlmeTogZmFsc2UsXG5cbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMTAgKiAxMDI0LFxuICAgIG91dERpcjogcHJvY2Vzcy5lbnYuQlVJTERfT1VUX0RJUiB8fCAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjggVml0ZSBcdTc2ODRcdTgxRUFcdTUyQThcdTZFMDVcdTc0MDZcdUZGMENcdTU2RTBcdTRFM0FcdTYyMTFcdTRFRUNcdTVERjJcdTdFQ0ZcdTY3MDkgY2xlYW5EaXN0UGx1Z2luIFx1NTcyOFx1Njc4NFx1NUVGQVx1NTI0RFx1NkUwNVx1NzQwNlxuICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFx1RkYwOEVCVVNZXHVGRjA5XG4gICAgLy8gY2xlYW5EaXN0UGx1Z2luIFx1NURGMlx1N0VDRlx1NjcwOVx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwODVcdTZCMjFcdUZGMENcdTkwMTJcdTU4OUVcdTdCNDlcdTVGODVcdTY1RjZcdTk1RjRcdUZGMDlcdUZGMENcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdTRGMUFcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdUZGMENcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTUyMjBcdTk2NjRcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjZcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgLy8gXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcdTU0OEMgQGNvbmZpZ3MgXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgcm9sbHVwT3B0aW9uczogY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWUsIHtcbiAgICAgIGV4dGVybmFsQnRjUGFja2FnZXM6IGZhbHNlLCAvLyBcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVxuICAgICAgZXh0ZXJuYWxDb25maWdzUGFja2FnZXM6IGZhbHNlLCAvLyBcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTYyNTNcdTUzMDUgQGNvbmZpZ3MgXHU1MzA1XG4gICAgfSksXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIC4uLmN1c3RvbUJ1aWxkLFxuICB9O1xuXG4gIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggY3VzdG9tU2VydmVyLnByb3h5XHVGRjBDXHU1OTgyXHU2NzlDXHU0RTBEXHU1QjU4XHU1NzI4XHU1MjE5XHU0RjdGXHU3NTI4IHByb3h5IFx1NTNDMlx1NjU3MFxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFjdXN0b21TZXJ2ZXIgXHU0RjFBXHU1NzI4XHU2NzAwXHU1NDBFXHU1QzU1XHU1RjAwXHVGRjBDXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCIHByb3h5IFx1NEYxQVx1ODk4Nlx1NzZENlx1OEZEOVx1OTFDQ1x1NzY4NFx1OEJCRVx1N0Y2RVxuICBjb25zdCBmaW5hbFByb3h5ID0gY3VzdG9tU2VydmVyPy5wcm94eSAhPT0gdW5kZWZpbmVkID8gY3VzdG9tU2VydmVyLnByb3h5IDogcHJveHk7XG4gIGNvbnN0IHsgcHJveHk6IF9jdXN0b21Qcm94eSwgLi4ucmVzdEN1c3RvbVNlcnZlciB9ID0gY3VzdG9tU2VydmVyIHx8IHt9O1xuICBjb25zdCBzZXJ2ZXJDb25maWc6IFVzZXJDb25maWdbJ3NlcnZlciddID0ge1xuICAgIHBvcnQ6IGFwcENvbmZpZy5kZXZQb3J0LFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGNvcnM6IHRydWUsXG4gICAgb3JpZ2luOiBgaHR0cDovLyR7YXBwQ29uZmlnLmRldkhvc3R9OiR7YXBwQ29uZmlnLmRldlBvcnR9YCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoJyxcbiAgICB9LFxuICAgIGhtcjoge1xuICAgICAgaG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gICAgcHJveHk6IGZpbmFsUHJveHksXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgICBhbGxvdzogW1xuICAgICAgICB3aXRoUm9vdCgnLicpLFxuICAgICAgXSxcbiAgICAgIGNhY2hlZENoZWNrczogdHJ1ZSxcbiAgICB9LFxuICAgIC4uLnJlc3RDdXN0b21TZXJ2ZXIsXG4gIH07XG5cbiAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1NEVDRVx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NCBkaXN0L3twcm9kSG9zdH0gXHU4QkZCXHU1M0Q2XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU0RUNFIGFwcHMve2FwcE5hbWV9L2Rpc3QgXHU4QkZCXHU1M0Q2XG4gIGNvbnN0IHJvb3REaXN0RGlyID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9kaXN0Jyk7XG4gIGNvbnN0IHByZXZpZXdSb290ID0gcmVzb2x2ZShyb290RGlzdERpciwgYXBwQ29uZmlnLnByb2RIb3N0KTtcblxuICBjb25zdCBwcmV2aWV3Q29uZmlnOiBVc2VyQ29uZmlnWydwcmV2aWV3J10gPSB7XG4gICAgcG9ydDogYXBwQ29uZmlnLnByZVBvcnQsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBvcGVuOiBmYWxzZSxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcHJveHksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IGFwcENvbmZpZy5tYWluQXBwT3JpZ2luLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICB9LFxuICAgIC4uLmN1c3RvbVByZXZpZXcsXG4gIH0gYXMgYW55O1xuXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEJCRVx1N0Y2RVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1NzY4NFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUzQSBkaXN0L3twcm9kSG9zdH1cbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBcm9vdCBcdTVDNUVcdTYwMjdcdTU3MjhcdTY1QjBcdTcyNDhcdTY3MkNcdTc2ODQgVml0ZSBcdTdDN0JcdTU3OEJcdTRFMkRcdTUzRUZcdTgwRkRcdTY3MkFcdTVCOUFcdTRFNDlcdUZGMENcdTRGNDZcdThGRDBcdTg4NENcdTY1RjZcdTRFQ0RcdTY1MkZcdTYzMDFcbiAgKHByZXZpZXdDb25maWcgYXMgYW55KS5yb290ID0gcHJldmlld1Jvb3Q7XG5cbiAgY29uc3QgYXBwQ2FjaGVEaXIgPSByZXNvbHZlKGFwcERpciwgJ25vZGVfbW9kdWxlcy8udml0ZScpO1xuXG4gIGNvbnN0IG9wdGltaXplRGVwc0NvbmZpZzogVXNlckNvbmZpZ1snb3B0aW1pemVEZXBzJ10gPSB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgLy8gXHU2ODM4XHU1RkMzXHU0RjlEXHU4RDU2XHVGRjFBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU1Qjg5XHU4OEM1XHU3Njg0XHU0RjlEXHU4RDU2XG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICAnZWxlbWVudC1wbHVzJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9sb2NhbGUvbGFuZy96aC1jbicsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL2VuJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jYXNjYWRlci9zdHlsZS9jc3MnLFxuICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU1REYyXHU0RUNFIGluY2x1ZGUgXHU0RTJEXHU3OUZCXHU5NjY0XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJyxcbiAgICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnLFxuICAgICAgJ3ZpdGUtcGx1Z2luLXFpYW5rdW4vZGlzdC9oZWxwZXInLFxuICAgICAgJ3FpYW5rdW4nLFxuICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThGRDlcdTRFOUJcdTRGOURcdThENTZcdTczQjBcdTU3MjhcdTVERjJcdTdFQ0ZcdTU3MjhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODQgcGFja2FnZS5qc29uIFx1NEUyRFx1NThGMFx1NjYwRVxuICAgICAgLy8gXHU5MDFBXHU4RkM3IEBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU5NUY0XHU2M0E1XHU0RjdGXHU3NTI4XHVGRjBDXHU0RjQ2XHU5NzAwXHU4OTgxXHU1NzI4XHU1RTk0XHU3NTI4XHU0RTJEXHU2NjNFXHU1RjBGXHU1OEYwXHU2NjBFXHU0RUU1XHU0RkJGIFZpdGUgXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXG4gICAgICAnbG9kYXNoLWVzJyxcbiAgICAgICdjaGFyZGV0JyxcbiAgICAgICd4bHN4JyxcbiAgICAgICd2dWUtaTE4bicsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFlY2hhcnRzIFx1NzZGOFx1NTE3M1x1NEY5RFx1OEQ1Nlx1OTcwMFx1ODk4MVx1ODhBQlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gXHU4NjdEXHU3MTM2XHU1M0VBXHU1NzI4XHU5MEU4XHU1MjA2XHU1RTk0XHU3NTI4XHU0RTJEXHU0RjdGXHU3NTI4XHVGRjBDXHU0RjQ2XHU2REZCXHU1MkEwXHU1MjMwIGluY2x1ZGUgXHU0RTJEXHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU0RjE4XHU1MzE2XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTVFOTRcdTc1MjhcdTY3MkFcdTVCODlcdTg4QzVcdThGRDlcdTRFOUJcdTRGOURcdThENTZcdUZGMENWaXRlIFx1NEYxQVx1NUZGRFx1NzU2NVx1NUI4M1x1NEVFQ1x1RkYwOFx1NEUwRFx1NEYxQVx1NjJBNVx1OTUxOVx1RkYwOVxuICAgICAgJ2VjaGFydHMvY29yZScsXG4gICAgICAnZWNoYXJ0cycsXG4gICAgICAndnVlLWVjaGFydHMnLFxuICAgIF0sXG4gICAgLy8gXHU2MzkyXHU5NjY0XHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU0RjE4XHU1MzE2XHU3Njg0XHU0RjlEXHU4RDU2XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBZXhjbHVkZSBcdTRGN0ZcdTc1MjhcdTUzMDVcdTU0MERcdTYyMTZcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdTZBMjFcdTVGMEZcbiAgICBleGNsdWRlOiBbXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZSBcdTY2MkZcdTY3MkNcdTU3MzBcdTUyMkJcdTU0MERcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTY2MkYgbnBtIFx1NTMwNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NEYxOFx1NTMxNlxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBZXhjbHVkZSBcdTUzRUFcdTY1MkZcdTYzMDFcdTVCNTdcdTdCMjZcdTRFMzJcdTZBMjFcdTVGMEZcdUZGMENcdTRFMERcdTY1MkZcdTYzMDFcdTZCNjNcdTUyMTlcdTg4NjhcdThGQkVcdTVGMEZcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTYzOTJcdTk2NjQgQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1x1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NjYyRlx1NjcyQ1x1NTczMFx1NTMwNVx1RkYwQ1x1NTMwNVx1NTQyQiBUU1ggXHU2NTg3XHU0RUY2XG4gICAgICAvLyBcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTVFOTRcdThCRTVcdTc2RjRcdTYzQTVcdTRFQ0VcdTZFOTBcdTc4MDFcdTVCRkNcdTUxNjVcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTk4ODRcdTY3ODRcdTVFRkFcbiAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBKU1ggXHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgXSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1NUYzQVx1NTIzNlx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1Nlx1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1Nlx1OTBGRFx1ODhBQlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgIC8vIFx1OEZEOVx1NEYxQVx1NTcyOFx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1NjVGNlx1Njc4NFx1NUVGQVx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEU0Qlx1NTQwRVx1NUMzMVx1NEUwRFx1NEYxQVx1NTE4RFx1ODlFNlx1NTNEMVx1NEU4NlxuICAgIGZvcmNlOiBmYWxzZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzQzJcdTgwMDMgY29vbC1hZG1pbiBcdTc2ODRcdTUwNUFcdTZDRDVcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRFMERcdTUxOERcdTUzMDVcdTU0MkIgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2luZGV4LnRzXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcdUZGMENcdTVFOTRcdThCRTVcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTc2RjRcdTYzQTVcdTU5MDRcdTc0MDZcbiAgICAvLyBzaGFyZWQtY29tcG9uZW50cyBcdTRFMkRcdTc2ODRcdTRGOURcdThENTZcdUZGMDhcdTU5ODIgbHVuciwgY2hhcmRldCBcdTdCNDlcdUZGMDlcdTRGMUFcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTg4QUJcdTgxRUFcdTUyQThcdTUzRDFcdTczQjBcdTU0OENcdTRGMThcdTUzMTZcbiAgICBlbnRyaWVzOiBbXG4gICAgICAvLyBcdTVFOTRcdTc1MjhcdTc2ODRcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL21haW4udHMnKSxcbiAgICBdLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBwbHVnaW5zOiBbXSxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NEY5RFx1OEQ1Nlx1OTg4NFx1Njc4NFx1NUVGQVx1NjVGNlx1NEU1Rlx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEpTWCBcdThGNkNcdTYzNjJcdTY1QjlcdTVGMEZcbiAgICAgIGpzeDogJ3ByZXNlcnZlJywgLy8gXHU0RkREXHU3NTU5IEpTWFx1RkYwQ1x1OEJBOSB2dWVKc3ggXHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XG4gICAgICBqc3hGYWN0b3J5OiAnaCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IGggXHU1MUZEXHU2NTcwXHU0RjVDXHU0RTNBIEpTWCBcdTVERTVcdTUzODJcdTUxRkRcdTY1NzBcbiAgICAgIGpzeEZyYWdtZW50OiAnRnJhZ21lbnQnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBGcmFnbWVudFxuICAgIH0sXG4gICAgLi4uY3VzdG9tT3B0aW1pemVEZXBzLFxuICB9O1xuXG4gIC8vIENTUyBcdTkxNERcdTdGNkVcbiAgY29uc3QgY3NzQ29uZmlnOiBVc2VyQ29uZmlnWydjc3MnXSA9IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaScsICdpbXBvcnQnXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBkZXZTb3VyY2VtYXA6IGZhbHNlLFxuICAgIC4uLmN1c3RvbUNzcyxcbiAgfTtcblxuICAvLyBcdThGRDRcdTU2REVcdTVCOENcdTY1NzRcdTkxNERcdTdGNkVcbiAgLy8gXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXHVGRjA4XHU1NkUwXHU0RTNBXHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcdUZGMDlcbiAgY29uc3QgYmFzZVJlc29sdmUgPSBjcmVhdGVCYXNlUmVzb2x2ZShhcHBEaXIsIGFwcE5hbWUpO1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc1MUZcdTRFQTcvXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU0RTBEXHU1MThEXHU0RjdGXHU3NTI4XHU2NzJDXHU1NzMwIHZpcnR1YWw6ZXBzXHVGRjA4XHU3NTMxIGxheW91dC1hcHAgXHU2M0QwXHU0RjlCXHU1MTcxXHU0RUFCIEVQUyBcdTY3MERcdTUyQTFcdUZGMDlcbiAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREXHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzXHU0RUE3XHU3NTFGXHU1QkY5XHU4MUVBXHU4RUFCIGVwcy1zZXJ2aWNlLXh4eC5qcyBcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMENcdTVCRkNcdTgxRjRcdTUxNzFcdTRFQUJcdTRFMERcdTc1MUZcdTY1NDhcdTYyMTYgNDA0XHUzMDAyXG4gIGNvbnN0IHNob3VsZFVzZVNoYXJlZEVwcyA9IChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB8fCBpc1ByZXZpZXdCdWlsZDtcbiAgY29uc3Qgc2hhcmVkRXBzU3R1YiA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vY29uZmlncy92aXRlL3N0dWJzL3ZpcnR1YWwtZXBzLWVtcHR5LnRzJyk7XG4gIGNvbnN0IGZpbmFsUmVzb2x2ZSA9IHNob3VsZFVzZVNoYXJlZEVwc1xuICAgID8ge1xuICAgICAgICAuLi5iYXNlUmVzb2x2ZSxcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkREXHU2MzAxXHU1MjJCXHU1NDBEXHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHVGRjBDXHU2REZCXHU1MkEwIHZpcnR1YWw6ZXBzIFx1NTIyQlx1NTQwRFxuICAgICAgICBhbGlhczogQXJyYXkuaXNBcnJheShiYXNlUmVzb2x2ZT8uYWxpYXMpXG4gICAgICAgICAgPyBbXG4gICAgICAgICAgICAgIC4uLmJhc2VSZXNvbHZlLmFsaWFzLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmluZDogJ3ZpcnR1YWw6ZXBzJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudDogc2hhcmVkRXBzU3R1YixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgLi4uKGJhc2VSZXNvbHZlPy5hbGlhcyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHx8IHt9KSxcbiAgICAgICAgICAgICAgJ3ZpcnR1YWw6ZXBzJzogc2hhcmVkRXBzU3R1YixcbiAgICAgICAgICAgIH0sXG4gICAgICB9XG4gICAgOiBiYXNlUmVzb2x2ZTtcblxuICBjb25zdCBjb25maWc6IGFueSA9IHtcbiAgICBiYXNlOiBiYXNlVXJsLFxuICAgIHB1YmxpY0RpcixcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTcyRUNcdTdBQ0JcdTc2ODRcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMERcdTU0MENcdTVFOTRcdTc1MjhcdTc2ODRcdTkxNERcdTdGNkVcdTVERUVcdTVGMDJcdTVCRkNcdTgxRjRcdTdGMTNcdTVCNThcdTUxQjJcdTdBODFcbiAgICAvLyBcdTg2N0RcdTcxMzZcdThGRDlcdTRGMUFcdTU4OUVcdTUyQTBcdTRFMDBcdTRFOUJcdTVCNThcdTUwQThcdTdBN0FcdTk1RjRcdUZGMENcdTRGNDZcdTUzRUZcdTRFRTVcdTc4NkVcdTRGRERcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTc2ODRcdTdGMTNcdTVCNThcdTcyQjZcdTYwMDFcdTRFMDBcdTgxRjRcdUZGMENcdTkwN0ZcdTUxNERcdTk4OTFcdTdFNDFcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcbiAgICBjYWNoZURpcjogYXBwQ2FjaGVEaXIsXG4gICAgcGx1Z2lucyxcbiAgICBlc2J1aWxkOiB7XG4gICAgICBjaGFyc2V0OiAndXRmOCcsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGREQgZXNidWlsZCBcdTZCNjNcdTc4NkVcdTU5MDRcdTc0MDYgSlNYXHVGRjBDXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTgwMENcdTRFMERcdTY2MkYgUmVhY3QuY3JlYXRlRWxlbWVudFxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1MzczXHU0RjdGIGVzYnVpbGQgXHU1OTA0XHU3NDA2XHU2N0QwXHU0RTlCIEpTWCBcdTY1ODdcdTRFRjZcdUZGMENcdTRFNUZcdTRGMUFcdTRGN0ZcdTc1MjhcdTZCNjNcdTc4NkVcdTc2ODRcdThGNkNcdTYzNjJcdTY1QjlcdTVGMEZcbiAgICAgIGpzeDogJ3ByZXNlcnZlJywgLy8gXHU0RkREXHU3NTU5IEpTWFx1RkYwQ1x1OEJBOSB2dWVKc3ggXHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XG4gICAgICBqc3hGYWN0b3J5OiAnaCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IGggXHU1MUZEXHU2NTcwXHU0RjVDXHU0RTNBIEpTWCBcdTVERTVcdTUzODJcdTUxRkRcdTY1NzBcbiAgICAgIGpzeEZyYWdtZW50OiAnRnJhZ21lbnQnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBGcmFnbWVudFxuICAgIH0sXG4gICAgc2VydmVyOiBzZXJ2ZXJDb25maWcsXG4gICAgcHJldmlldzogcHJldmlld0NvbmZpZyxcbiAgICBvcHRpbWl6ZURlcHM6IG9wdGltaXplRGVwc0NvbmZpZyxcbiAgICBjc3M6IGNzc0NvbmZpZyxcbiAgICBidWlsZDogYnVpbGRDb25maWcsXG4gIH07XG5cbiAgLy8gXHU2NjBFXHU3ODZFXHU1OTA0XHU3NDA2XHU1M0VGXHU5MDA5XHU1QzVFXHU2MDI3XHU3Njg0IHVuZGVmaW5lZFx1RkYwOGV4YWN0T3B0aW9uYWxQcm9wZXJ0eVR5cGVzXHVGRjA5XG4gIGlmIChmaW5hbFJlc29sdmUgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbmZpZy5yZXNvbHZlID0gZmluYWxSZXNvbHZlO1xuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcXFxccGF0aC1oZWxwZXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHNcIjsvKipcbiAqIFx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxuICogXHU2M0QwXHU0RjlCXHU3RURGXHU0RTAwXHU3Njg0XHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU1MUZEXHU2NTcwXHVGRjBDXHU3NTI4XHU0RThFIFZpdGUgXHU5MTREXHU3RjZFXHU0RTJEXHU3Njg0XHU1MjJCXHU1NDBEXHU1NDhDXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXG4gKi9cblxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIFx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyOiBzdHJpbmcpIHtcbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MFx1NUU5NFx1NzUyOCBzcmMgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB3aXRoU3JjID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiByZXNvbHZlKGFwcERpciwgcmVsYXRpdmVQYXRoKTtcblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIHBhY2thZ2VzIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFBhY2thZ2VzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzJywgcmVsYXRpdmVQYXRoKTtcblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwXHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB3aXRoUm9vdCA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLicsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBjb25maWdzIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aENvbmZpZ3MgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vY29uZmlncycsIHJlbGF0aXZlUGF0aCk7XG5cbiAgcmV0dXJuIHsgd2l0aFNyYywgd2l0aFBhY2thZ2VzLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhdXRvLWltcG9ydC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHNcIjtcdUZFRkYvKipcbiAqIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVx1NkEyMVx1Njc3RlxuICogXHU0RjlCXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHVGRjA4YWRtaW4tYXBwLCBsb2dpc3RpY3MtYXBwIFx1N0I0OVx1RkYwOVx1NEY3Rlx1NzUyOFxuICovXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIEF1dG8gSW1wb3J0IFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpIHtcbiAgcmV0dXJuIEF1dG9JbXBvcnQoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgIHtcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiBbXG4gICAgICAgICAgJ3VzZUNydWQnLFxuICAgICAgICAgICd1c2VEaWN0JyxcbiAgICAgICAgICAndXNlUGVybWlzc2lvbicsXG4gICAgICAgICAgJ3VzZVJlcXVlc3QnLFxuICAgICAgICAgICdjcmVhdGVJMThuUGx1Z2luJyxcbiAgICAgICAgICAndXNlSTE4bicsXG4gICAgICAgIF0sXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IFtcbiAgICAgICAgICAnZm9ybWF0RGF0ZScsXG4gICAgICAgICAgJ2Zvcm1hdERhdGVUaW1lJyxcbiAgICAgICAgICAnZm9ybWF0TW9uZXknLFxuICAgICAgICAgICdmb3JtYXROdW1iZXInLFxuICAgICAgICAgICdpc0VtYWlsJyxcbiAgICAgICAgICAnaXNQaG9uZScsXG4gICAgICAgICAgJ3N0b3JhZ2UnLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcbiAgICAgIH0pLFxuICAgIF0sXG5cbiAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxuXG4gICAgZXNsaW50cmM6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxuICAgIH0sXG5cbiAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU5ODlEXHU1OTE2XHU3Njg0XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFXHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHVGRjA5XG4gICAqL1xuICBleHRyYURpcnM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xuICAgKi9cbiAgaW5jbHVkZVNoYXJlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENvbXBvbmVudHMgXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudHNDb25maWcob3B0aW9uczogQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IGV4dHJhRGlycyA9IFtdLCBpbmNsdWRlU2hhcmVkID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICBjb25zdCBkaXJzID0gW1xuICAgICdzcmMvY29tcG9uZW50cycsIC8vIFx1NUU5NFx1NzUyOFx1N0VBN1x1N0VDNFx1NEVGNlxuICAgIC4uLmV4dHJhRGlycywgLy8gXHU5ODlEXHU1OTE2XHU3Njg0XHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XG4gIF07XG5cbiAgLy8gXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHVGRjBDXHU2REZCXHU1MkEwXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XG4gIGlmIChpbmNsdWRlU2hhcmVkKSB7XG4gICAgLy8gXHU2REZCXHU1MkEwXHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XHVGRjBDXHU2NTJGXHU2MzAxXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XG4gICAgZGlycy5wdXNoKFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Jhc2ljJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9sYXlvdXQnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Zvcm0nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2RhdGEnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2ZlZWRiYWNrJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9vdGhlcnMnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBDb21wb25lbnRzKHtcbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RCBWaXRlIHJlbG9hZGluZ1xuICAgICAgfSksXG4gICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTg5RTNcdTY3OTBcdTU2NjhcdUZGMUFAYnRjL3NoYXJlZC1jb21wb25lbnRzXG4gICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICAvLyBcdTVDMDYga2ViYWItY2FzZSBcdThGNkNcdTYzNjJcdTRFM0EgUGFzY2FsQ2FzZVxuICAgICAgICAvLyBcdTRGOEJcdTU5ODI6IGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgIGNvbnN0IGNvbnZlcnRUb1Bhc2NhbENhc2UgPSAobmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdCdGMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7IC8vIFx1NURGMlx1N0VDRlx1NjYyRiBQYXNjYWxDYXNlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgICAgLy8gYnRjLXN2ZyAtPiBCdGNTdmdcbiAgICAgICAgICAgIHJldHVybiBuYW1lXG4gICAgICAgICAgICAgIC5zcGxpdCgnLScpXG4gICAgICAgICAgICAgIC5tYXAocGFydCA9PiBwYXJ0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFydC5zbGljZSgxKSlcbiAgICAgICAgICAgICAgLmpvaW4oJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdCdGMnKSB8fCBjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgIGNvbnN0IHBhc2NhbE5hbWUgPSBjb252ZXJ0VG9QYXNjYWxDYXNlKGNvbXBvbmVudE5hbWUpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwYXNjYWxOYW1lLFxuICAgICAgICAgICAgZnJvbTogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSxcbiAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICBkaXJzLFxuICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ3RzeCddLCAvLyBcdTY1MkZcdTYzMDEgLnZ1ZSBcdTU0OEMgLnRzeCBcdTY1ODdcdTRFRjZcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTkxQ0RcdTY1QjBcdTYyNkJcdTYzQ0ZcdTdFQzRcdTRFRjZcbiAgICBkZWVwOiB0cnVlLFxuICAgIC8vIFx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOSBCdGMgXHU1RjAwXHU1OTM0XHU3Njg0XHU3RUM0XHU0RUY2XG4gICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnRzeCQvLCAvQnRjW0EtWl0vLCAvYnRjLVthLXpdL10sXG4gIH0pO1xufVxuLy8gVVRGLTggZW5jb2RpbmcgZml4XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGUtYXBwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUtYXBwLWNvbmZpZy50c1wiOy8qKlxuICogVml0ZSBcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIFx1NzUyOFx1NEU4RVx1NEVDRVx1N0VERlx1NEUwMFx1OTE0RFx1N0Y2RVx1NEUyRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICovXG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEFwcENvbmZpZyB9IGZyb20gJy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnJztcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdUZGMDhcdTc1MjhcdTRFOEUgdml0ZS5jb25maWcudHNcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZpdGVBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKToge1xuICBkZXZQb3J0OiBudW1iZXI7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgcHJlUG9ydDogbnVtYmVyO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByb2RIb3N0OiBzdHJpbmc7XG4gIG1haW5BcHBPcmlnaW46IHN0cmluZztcbn0ge1xuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XG4gIGlmICghYXBwQ29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdTY3MkFcdTYyN0VcdTUyMzAgJHthcHBOYW1lfSBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVgKTtcbiAgfVxuXG4gIGNvbnN0IG1haW5BcHBDb25maWcgPSBnZXRBcHBDb25maWcoJ21haW4tYXBwJyk7XG4gIGNvbnN0IG1haW5BcHBPcmlnaW4gPSBtYWluQXBwQ29uZmlnXG4gICAgPyBgaHR0cDovLyR7bWFpbkFwcENvbmZpZy5wcmVIb3N0fToke21haW5BcHBDb25maWcucHJlUG9ydH1gXG4gICAgOiAnaHR0cDovL2xvY2FsaG9zdDo0MTgwJztcblxuICByZXR1cm4ge1xuICAgIGRldlBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5kZXZQb3J0LCAxMCksXG4gICAgZGV2SG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgcHJlUG9ydDogcGFyc2VJbnQoYXBwQ29uZmlnLnByZVBvcnQsIDEwKSxcbiAgICBwcmVIb3N0OiBhcHBDb25maWcucHJlSG9zdCxcbiAgICBwcm9kSG9zdDogYXBwQ29uZmlnLnByb2RIb3N0LFxuICAgIG1haW5BcHBPcmlnaW4sXG4gIH07XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU3QzdCXHU1NzhCXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEByZXR1cm5zIFx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwVHlwZShhcHBOYW1lOiBzdHJpbmcpOiAnbWFpbicgfCAnc3ViJyB8ICdsYXlvdXQnIHwgJ21vYmlsZScge1xuICBpZiAoYXBwTmFtZSA9PT0gJ21haW4tYXBwJykgcmV0dXJuICdtYWluJztcbiAgaWYgKGFwcE5hbWUgPT09ICdsYXlvdXQtYXBwJykgcmV0dXJuICdsYXlvdXQnO1xuICBpZiAoYXBwTmFtZSA9PT0gJ21vYmlsZS1hcHAnKSByZXR1cm4gJ21vYmlsZSc7XG4gIHJldHVybiAnc3ViJzsgLy8gXHU1MTc2XHU0RUQ2XHU5MEZEXHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IGJhc2UgVVJMXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEBwYXJhbSBpc1ByZXZpZXdCdWlsZCBcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcbiAqIEByZXR1cm5zIGJhc2UgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsKGFwcE5hbWU6IHN0cmluZywgaXNQcmV2aWV3QnVpbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZyhhcHBOYW1lKTtcbiAgaWYgKCFhcHBDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xuICB9XG4gIFxuICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgcmV0dXJuIGBodHRwOi8vJHthcHBDb25maWcucHJlSG9zdH06JHthcHBDb25maWcucHJlUG9ydH0vYDtcbiAgfVxuICBcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU0RjdGXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU4QkE5XHU2RDRGXHU4OUM4XHU1NjY4XHU2ODM5XHU2MzZFXHU1N0RGXHU1NDBEXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHVGRjA5XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NUI1MFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzZGNFx1NjNBNVx1OTBFOFx1N0Y3Mlx1NTIzMFx1NUI1MFx1NTdERlx1NTQwRFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NTk4MiBwcm9kdWN0aW9uLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgcmV0dXJuICcvJztcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgcHVibGljRGlyIFx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHJldHVybnMgcHVibGljRGlyIFx1OERFRlx1NUY4NFx1NjIxNiBmYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljRGlyKGFwcE5hbWU6IHN0cmluZywgYXBwRGlyOiBzdHJpbmcpOiBzdHJpbmcgfCBmYWxzZSB7XG4gIC8vIG1haW4tYXBwXHUzMDAxYWRtaW4tYXBwXHUzMDAxbW9iaWxlLWFwcCBcdTU0OEMgc3lzdGVtLWFwcCBcdTRGN0ZcdTc1MjhcdTgxRUFcdTVERjFcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVxuICBpZiAoYXBwTmFtZSA9PT0gJ21haW4tYXBwJyB8fCBhcHBOYW1lID09PSAnYWRtaW4tYXBwJyB8fCBhcHBOYW1lID09PSAnbW9iaWxlLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ3N5c3RlbS1hcHAnKSB7XG4gICAgcmV0dXJuIHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XG4gIH1cbiAgXG4gIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTE3MVx1NEVBQlx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XG4gIHJldHVybiByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYycpO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxiYXNlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvYmFzZS5jb25maWcudHNcIjsvKipcbiAqIFx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVx1NkEyMVx1NTc1N1xuICogXHU2M0QwXHU0RjlCXHU1MTZDXHU1MTcxXHU3Njg0XHU1MjJCXHU1NDBEXHU1NDhDIHJlc29sdmUgXHU5MTREXHU3RjZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4vdXRpbHMvcGF0aC1oZWxwZXJzJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDBcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEByZXR1cm5zIFx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmFzZUFsaWFzZXMoXG4gIGFwcERpcjogc3RyaW5nLCBcbiAgX2FwcE5hbWU6IHN0cmluZ1xuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gIGNvbnN0IHsgd2l0aFNyYywgd2l0aFJvb3QsIHdpdGhDb25maWdzLCB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG5cbiAgY29uc3QgYWxpYXNlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAnQCc6IHdpdGhTcmMoJ3NyYycpLFxuICAgICdAbW9kdWxlcyc6IHdpdGhTcmMoJ3NyYy9tb2R1bGVzJyksXG4gICAgJ0BzZXJ2aWNlcyc6IHdpdGhTcmMoJ3NyYy9zZXJ2aWNlcycpLFxuICAgICdAY29tcG9uZW50cyc6IHdpdGhTcmMoJ3NyYy9jb21wb25lbnRzJyksXG4gICAgJ0B1dGlscyc6IHdpdGhTcmMoJ3NyYy91dGlscycpLFxuICAgICdAYXV0aCc6IHdpdGhSb290KCdhdXRoJyksXG4gICAgJ0Bjb25maWdzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvY29uZmlncycpLFxuICAgICdAYnRjL2F1dGgtc2hhcmVkJzogd2l0aFJvb3QoJ2F1dGgvc2hhcmVkJyksXG4gICAgLy8gQGJ0Yy8qIFx1NTMwNVx1NTIyQlx1NTQwRFx1RkYxQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NTMwNVx1RkYwQ1x1NjI0MFx1NEVFNVx1NTlDQlx1N0VDOFx1NEY3Rlx1NzUyOFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NkU5MFx1NzgwMVxuICAgICdAYnRjL3NoYXJlZC1jb3JlJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgJ0BidGMvc2hhcmVkLXJvdXRlcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLXJvdXRlci9zcmMnKSxcbiAgICAvLyBcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMUFcdTVFOUZcdTVGMDNcdTUzMDVcdTc2ODRcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTVGNTJcdTVFNzZcdTU0MEVcdTc2ODRcdTRGNERcdTdGNkVcbiAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy91dGlscycpLFxuICAgICdAYnRjL3NoYXJlZC1wbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxuICAgICdAYnRjL2kxOG4nOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9pMThuJyksXG4gICAgJ0BidGMvc3ViYXBwLW1hbmlmZXN0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL21hbmlmZXN0JyksXG4gICAgJ0BidGMvZW52Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvZW52JyksXG4gICAgXG4gICAgLy8gc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHU3Njg0XHU1MjJCXHU1NDBEXHVGRjA4XHU3NTI4XHU0RThFXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NzY4NFx1NUJGQ1x1NTE2NVx1RkYwOVxuICAgICdAYnRjLWNvbW1vbic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbW1vbicpLFxuICAgICdAYnRjLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzJyksXG4gICAgJ0BidGMtY3J1ZCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQnKSxcbiAgICAnQGJ0Yy1zdHlsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMnKSxcbiAgICAnQGJ0Yy1sb2NhbGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcycpLFxuICAgICdAYnRjLWFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLFxuICAgICdAYXNzZXRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksIC8vIEBhc3NldHMgXHU1MjJCXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1QkZDXHU1MTY1XG4gICAgJ0BidGMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscycpLFxuICAgICdAcGx1Z2lucyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMnKSxcbiAgICBcbiAgICAvLyBcdTU2RkVcdTg4NjhcdTc2RjhcdTUxNzNcdTUyMkJcdTU0MERcbiAgICAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXInKSxcbiAgICAnQGNoYXJ0cy11dGlscy9jb2xvcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jb2xvcicpLFxuICAgICdAY2hhcnRzLXV0aWxzL2dyYWRpZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2dyYWRpZW50JyksXG4gICAgJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnKSxcbiAgICAnQGNoYXJ0cy10eXBlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcycpLFxuICAgICdAY2hhcnRzLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzJyksXG4gICAgJ0BjaGFydHMtY29tcG9zYWJsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMnKSxcblxuICAgIC8vIEVsZW1lbnQgUGx1cyBcdTUyMkJcdTU0MERcdUZGMDhcdTU5Q0JcdTdFQzhcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICAnZWxlbWVudC1wbHVzL2VzJzogJ2VsZW1lbnQtcGx1cy9lcycsXG4gICAgJ2VsZW1lbnQtcGx1cy9kaXN0JzogJ2VsZW1lbnQtcGx1cy9kaXN0JyxcbiAgfTtcblxuICByZXR1cm4gYWxpYXNlcztcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDAgcmVzb2x2ZSBcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEByZXR1cm5zIHJlc29sdmUgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlUmVzb2x2ZShcbiAgYXBwRGlyOiBzdHJpbmcsIFxuICBhcHBOYW1lOiBzdHJpbmdcbik6IFVzZXJDb25maWdbJ3Jlc29sdmUnXSB7XG4gIGNvbnN0IHsgd2l0aFBhY2thZ2VzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuICBjb25zdCBhbGlhc2VzID0gY3JlYXRlQmFzZUFsaWFzZXMoYXBwRGlyLCBhcHBOYW1lKTtcbiAgXG4gIC8vIFx1NEY3Rlx1NzUyOFx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwQ1x1Nzg2RVx1NEZERFx1NjZGNFx1NTE3N1x1NEY1M1x1NzY4NFx1NTIyQlx1NTQwRFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFxuICAvLyBWaXRlIFx1NEYxQVx1NjMwOVx1NjU3MFx1N0VDNFx1OTg3QVx1NUU4Rlx1NTMzOVx1OTE0RFx1RkYwQ1x1N0IyQ1x1NEUwMFx1NEUyQVx1NTMzOVx1OTE0RFx1NzY4NFx1NTIyQlx1NTQwRFx1NEYxQVx1ODhBQlx1NEY3Rlx1NzUyOFxuICBjb25zdCBhbGlhc0FycmF5OiBBcnJheTx7IGZpbmQ6IHN0cmluZyB8IFJlZ0V4cDsgcmVwbGFjZW1lbnQ6IHN0cmluZyB9PiA9IFtcbiAgICAvLyBsb2NhbGVzIFx1NUI1MFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NEY3Rlx1NzUyOFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NkU5MFx1NzgwMVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb3JlL2xvY2FsZXMvemgtQ04nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvcmUvbG9jYWxlcy9lbi1VUycsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL2VuLVVTJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9sb2NhbGVzL3poLUNOLmpzb24nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvemgtQ04uanNvbicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvbG9jYWxlcy9lbi1VUy5qc29uJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzL2VuLVVTLmpzb24nKSxcbiAgICB9LFxuICAgIC8vIFx1NTE3Nlx1NEVENlx1NTIyQlx1NTQwRFx1RkYwOFx1NEVDRVx1NUJGOVx1OEM2MVx1OEY2Q1x1NjM2Mlx1NEUzQVx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1RkYwOVxuICAgIC4uLk9iamVjdC5lbnRyaWVzKGFsaWFzZXMpLm1hcCgoW2ZpbmQsIHJlcGxhY2VtZW50XSkgPT4gKHtcbiAgICAgIGZpbmQsXG4gICAgICByZXBsYWNlbWVudCxcbiAgICB9KSksXG4gIF07XG4gIFxuICByZXR1cm4ge1xuICAgIGFsaWFzOiBhbGlhc0FycmF5LFxuICAgIGRlZHVwZTogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdlbGVtZW50LXBsdXMnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnXSxcbiAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy5tdHMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcudnVlJ10sXG4gICAgLy8gXHU3ODZFXHU0RkREIFZpdGUgXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IHBhY2thZ2UuanNvbiBcdTc2ODQgZXhwb3J0cyBcdTkxNERcdTdGNkVcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZERkJcdTUyQTAgJ2RldmVsb3BtZW50JyBcdTY3NjFcdTRFRjZcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdTRGN0ZcdTc1MjhcdTZFOTBcdTc4MDFcbiAgICBjb25kaXRpb25zOiBbJ2RldmVsb3BtZW50JywgJ2ltcG9ydCcsICdtb2R1bGUnLCAnYnJvd3NlcicsICdkZWZhdWx0J10sXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxtYW51YWwtY2h1bmtzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHNcIjsvKipcbiAqIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTkxNERcdTdGNkVcbiAqIFx1NUI5QVx1NEU0OVx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1N0I1Nlx1NzU2NVx1RkYwQ1x1NUMwNlx1NEUwRFx1NTQwQ1x1N0M3Qlx1NTc4Qlx1NzY4NFx1NEVFM1x1NzgwMVx1NjI1M1x1NTMwNVx1NTIzMFx1NEUwRFx1NTQwQ1x1NzY4NCBjaHVua1xuICovXG5cbi8qKlxuICogXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU2MEM1XHU1MUI1XHU5MTREXHU3RjZFXG4gKiBcdTVCOUFcdTRFNDlcdTU0RUFcdTRFOUJcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0RUFcdTRFOUJcdTVFOTNcdUZGMENcdTc1MjhcdTRFOEVcdTY3NjFcdTRFRjZcdTYyNTNcdTUzMDVcbiAqL1xuY29uc3QgQVBQX1VTQUdFOiBSZWNvcmQ8c3RyaW5nLCB7IGVjaGFydHM6IGJvb2xlYW47IG1vbmFjbzogYm9vbGVhbjsgdGhyZWU6IGJvb2xlYW4gfT4gPSB7XG4gICdsYXlvdXQtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ3N5c3RlbS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnYWRtaW4tYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2ZpbmFuY2UtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2xvZ2lzdGljcy1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAncXVhbGl0eS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAncHJvZHVjdGlvbi1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnZW5naW5lZXJpbmctYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ21vbml0b3ItYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ21vYmlsZS1hcHAnOiB7IGVjaGFydHM6IGZhbHNlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbn07XG5cbi8qKlxuICogXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXG4gKi9cbmNvbnN0IGlzUHJvZHVjdGlvbiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbic7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NzUyOFx1NEU4RVx1OEZDN1x1NkVFNFx1NzI3OVx1NUI5QVx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdFx1RkYwOVxuICogQHJldHVybnMgbWFudWFsQ2h1bmtzIFx1NTFGRFx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3koYXBwTmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGlzTGF5b3V0QXBwID0gYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnO1xuICBjb25zdCBpc01haW5BcHAgPSBhcHBOYW1lID09PSAnbWFpbi1hcHAnO1xuICBjb25zdCBhcHBVc2FnZSA9IEFQUF9VU0FHRVthcHBOYW1lXSB8fCB7IGVjaGFydHM6IGZhbHNlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfTtcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTE0XHU5NzVFIGxheW91dC1hcHAgXHU2NUY2XHVGRjBDXHU1MTcxXHU0RUFCXHU4RDQ0XHU2RTkwXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjA4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XG4gIC8vIFx1NEY0NiBtYWluLWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgxRUFcdTVERjFcdTc2ODQgRVBTIFx1NjcwRFx1NTJBMVxuICBjb25zdCBza2lwU2hhcmVkUmVzb3VyY2VzID0gaXNQcm9kdWN0aW9uICYmICFpc0xheW91dEFwcCAmJiAhaXNNYWluQXBwO1xuXG4gIHJldHVybiAoaWQ6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gICAgLy8gMC4gRVBTIFx1NjcwRFx1NTJBMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygndmlydHVhbDplcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnXFxcXDB2aXJ0dWFsOmVwcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlcy9lcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnc2VydmljZXNcXFxcZXBzJykpIHtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NzY4NFx1NUI1MFx1NUU5NFx1NzUyOFx1NEUwRFx1NUU5NFx1OEJFNVx1NTE4RFx1NTM1NVx1NzJFQ1x1NjJDNlx1NTFGQSBlcHMtc2VydmljZSBjaHVua1xuICAgICAgLy8gXHU1NDI2XHU1MjE5XHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzXHU0RjFBXHU0RUE3XHU3NTFGXHU1QkY5XHU4MUVBXHU4RUFCIC9hc3NldHMvZXBzLXNlcnZpY2UteHh4LmpzIFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwQ1x1NUJGQ1x1ODFGNFwiXHU1MTcxXHU0RUFCXHU2NzJBXHU3NTFGXHU2NTQ4ICsgNDA0XCJcdTk4Q0VcdTk2NjlcdTMwMDJcbiAgICAgIC8vIGxheW91dC1hcHAgXHU4RDFGXHU4RDIzXHU2M0QwXHU0RjlCXHU1MTcxXHU0RUFCIGVwcy1zZXJ2aWNlXHVGRjBDXHU1RTc2XHU1QzA2XHU2NzBEXHU1MkExXHU2MzAyXHU1MjMwIHdpbmRvdy5fX0FQUF9FUFNfU0VSVklDRV9fXHUzMDAyXG4gICAgICAvLyBtYWluLWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgxRUFcdTVERjFcdTc2ODQgRVBTIFx1NjcwRFx1NTJBMVx1RkYwOFx1NzJFQ1x1N0FDQlx1OEZEMFx1ODg0Q1x1NjVGNlx1NEUwRFx1NEY5RFx1OEQ1NiBsYXlvdXQtYXBwXHVGRjA5XG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdlcHMtc2VydmljZSc7XG4gICAgfVxuXG4gICAgLy8gMC4zLiBBdXRoIEFQSSBcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTc1MzEgc3lzdGVtLWFwcCBcdTYzRDBcdTRGOUJcdUZGMDlcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ21vZHVsZXMvYXBpLXNlcnZpY2VzL2F1dGgnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbW9kdWxlc1xcXFxhcGktc2VydmljZXNcXFxcYXV0aCcpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdhcGktc2VydmljZXMvYXV0aCcpKSB7XG4gICAgICByZXR1cm4gJ2F1dGgtYXBpJztcbiAgICB9XG5cbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFtZW51UmVnaXN0cnkgXHU0RjlEXHU4RDU2IFZ1ZVx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTQ4QyB2ZW5kb3IgXHU0RTAwXHU4RDc3XHU2MjUzXHU1MzA1XHVGRjBDXHU0RTBEXHU4MEZEXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAvLyBcdThGRDlcdTY4MzdcdTc4NkVcdTRGREQgVnVlIFx1NzY4NCByZWYgXHU1NzI4IG1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjhcdTRFNEJcdTUyNERcdTVERjJcdTdFQ0ZcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICAvLyBcdTVGQzVcdTk4N0JcdTU3MjhcdTY4QzBcdTY3RTUgbGF5b3V0LWJyaWRnZSBcdTRFNEJcdTUyNERcdTY4QzBcdTY3RTVcdUZGMENcdTU2RTBcdTRFM0EgbGF5b3V0LWJyaWRnZSBcdTRGMUFcdTVCRkNcdTUxNjUgbWVudVJlZ2lzdHJ5XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3NoYXJlZC1jb21wb25lbnRzL3N0b3JlL21lbnVSZWdpc3RyeScpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU1QzA2IG1lbnVSZWdpc3RyeSBcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgfVxuICAgIFxuICAgIC8vIDAuNS4gXHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU0RUUzXHU3ODAxXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1QzA2XHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU3Njg0XHU0RUUzXHU3ODAxXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnkgY2h1bmtcdUZGMENcdTRGNDYgbWVudVJlZ2lzdHJ5IFx1NjcyQ1x1OEVBQlx1NEY5RFx1OEQ1NiBWdWVcdUZGMENcdTk3MDBcdTg5ODFcdTY1M0VcdTU3MjggdmVuZG9yIFx1NEU0Qlx1NTQwRVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQW1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCByZWZcdUZGMENcdTYyNDBcdTRFRTVcdTRFMERcdTgwRkRcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMENcdTVFOTRcdThCRTVcdTU0OEMgdmVuZG9yIFx1NEUwMFx1OEQ3N1xuICAgIC8vIFx1NTNFQVx1NUMwNiBtYW5pZmVzdCBcdTY1NzBcdTYzNkVcdTU0OEMgbGF5b3V0LWJyaWRnZSBcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxuICAgIC8vIFx1NEY0NiBsYXlvdXQtYnJpZGdlIFx1NEYxQVx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcdUZGMENcdTYyNDBcdTRFRTUgbGF5b3V0LWJyaWRnZSBcdTRFNUZcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdjb25maWdzL2xheW91dC1icmlkZ2UnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UnKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQWxheW91dC1icmlkZ2UgXHU1QkZDXHU1MTY1IG1lbnVSZWdpc3RyeVx1RkYwQ1x1NjI0MFx1NEVFNVx1NEU1Rlx1NUU5NFx1OEJFNVx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYwOVx1RkYxQVx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IHN1YmFwcC1tYW5pZmVzdHNcdUZGMUFcdTUzRUFcdTUzMDVcdTU0MkJcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3N1YmFwcC1tYW5pZmVzdHMnKSB8fCBpZC5pbmNsdWRlcygnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJykpIHtcbiAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdCBKU09OIFx1NjU4N1x1NEVGNlxuICAgICAgY29uc3Qgb3RoZXJBcHBzID0gWydmaW5hbmNlJywgJ2xvZ2lzdGljcycsICdzeXN0ZW0nLCAncXVhbGl0eScsICdlbmdpbmVlcmluZycsICdwcm9kdWN0aW9uJywgJ21vbml0b3InLCAnYWRtaW4nXTtcbiAgICAgIGNvbnN0IGN1cnJlbnRBcHBOYW1lID0gYXBwTmFtZS5yZXBsYWNlKCctYXBwJywgJycpO1xuICAgICAgY29uc3Qgc2hvdWxkRXhjbHVkZSA9IG90aGVyQXBwc1xuICAgICAgICAuZmlsdGVyKGFwcCA9PiBhcHAgIT09IGN1cnJlbnRBcHBOYW1lKVxuICAgICAgICAuc29tZShhcHAgPT4gaWQuaW5jbHVkZXMoYG1hbmlmZXN0cy8ke2FwcH0uanNvbmApKTtcbiAgICAgIFxuICAgICAgaWYgKHNob3VsZEV4Y2x1ZGUpIHtcbiAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFcdTUzRUFcdTYyNTNcdTUzMDVcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3QgXHU1NDhDXHU1MTcxXHU0RUFCXHU0RUUzXHU3ODAxXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ21lbnUtcmVnaXN0cnknO1xuICAgIH1cblxuICAgIC8vIDEuIFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYxQUVDaGFydHNcdUZGMDhcdTdFQUYgZWNoYXJ0cyBcdTU0OEMgenJlbmRlclx1RkYwQ1x1NEUwRFx1NTMwNVx1NTQyQiB2dWUtZWNoYXJ0c1x1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2VjaGFydHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3pyZW5kZXInKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQVx1NkI2M1x1NUUzOFx1NjI1M1x1NTMwNVxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjFBXHU1OTgyXHU2NzlDXHU0RjdGXHU3NTI4IGVjaGFydHNcdUZGMENcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMERcdTYyNTNcdTUzMDVcdUZGMDhcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdUZGMDlcdUZGMENcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTZCNjNcdTVFMzhcdTYyNTNcdTUzMDVcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzICYmIGFwcFVzYWdlLmVjaGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1NEUwRFx1NEY3Rlx1NzUyOCBlY2hhcnRzXHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XG4gICAgICBpZiAoIWFwcFVzYWdlLmVjaGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnZWNoYXJ0cy12ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIDIuIFx1NTE3Nlx1NEVENlx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOFx1NUI4Q1x1NTE2OFx1NzJFQ1x1N0FDQlx1RkYwOS0gXHU2NzYxXHU0RUY2XHU2MjUzXHU1MzA1XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvcicpKSB7XG4gICAgICAvLyBcdTUzRUFcdTY3MDlcdTRGN0ZcdTc1MjhcdTc2ODRcdTVFOTRcdTc1MjhcdTYyNERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UubW9uYWNvKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ2xpYi1tb25hY28nO1xuICAgIH1cbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy90aHJlZScpKSB7XG4gICAgICAvLyBcdTUzRUFcdTY3MDlcdTRGN0ZcdTc1MjhcdTc2ODRcdTVFOTRcdTc1MjhcdTYyNERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UudGhyZWUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnbGliLXRocmVlJztcbiAgICB9XG5cbiAgICAvLyAzLiBWdWUgXHU3NTFGXHU2MDAxXHU1RTkzICsgXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2IFZ1ZSBcdTc2ODRcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTMgKyBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcGluaWEnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1lY2hhcnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbG9kYXNoJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdnVlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb3JlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC11dGlscycpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU2QjYzXHU1RTM4XHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XHVGRjFBXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCB2aXRlLXBsdWdpbiBcdTc2RjhcdTUxNzNcdTRFRTNcdTc4MDFcdTRFNUZcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy92aXRlLXBsdWdpbicpIHx8IGlkLmluY2x1ZGVzKCdAYnRjL3ZpdGUtcGx1Z2luJykpIHtcbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG5cbiAgICAvLyA0LiBcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBcdThGRDRcdTU2REUgdW5kZWZpbmVkIFx1ODg2OFx1NzkzQVx1NTQwOFx1NUU3Nlx1NTIzMFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccm9sbHVwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yb2xsdXAtY29uZmlnLnRzXCI7LyoqXG4gKiBSb2xsdXAgXHU5MTREXHU3RjZFXHU2QTIxXHU1NzU3XG4gKiBcdTYzRDBcdTRGOUJcdTUxNkNcdTUxNzFcdTc2ODQgUm9sbHVwIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB0eXBlIHsgUm9sbHVwT3B0aW9ucywgV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCwgT3V0cHV0QXNzZXQsIFdhcm5pbmcgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3kgfSBmcm9tICcuL21hbnVhbC1jaHVua3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJvbGx1cENvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0OiAnYXNzZXRzJ1x1RkYwOVxuICAgKi9cbiAgYXNzZXREaXI/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBjaHVuayBcdTY1ODdcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTlFRDhcdThCQTQ6IFx1NEUwRSBhc3NldERpciBcdTc2RjhcdTU0MENcdUZGMDlcbiAgICovXG4gIGNodW5rRGlyPzogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QzA2IHNpbmdsZS1zcGEgXHU1NDhDIHFpYW5rdW4gXHU2ODA3XHU4QkIwXHU0RTNBXHU1OTE2XHU5MEU4XHU1RTkzXHVGRjA4XHU5RUQ4XHU4QkE0OiB0cnVlXHVGRjA5XG4gICAqIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOGxheW91dC1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgICogXHU1QjUwXHU1RTk0XHU3NTI4XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTYyNTNcdTUzMDVcbiAgICovXG4gIGV4dGVybmFsU2luZ2xlU3BhPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBAYnRjIFx1NTMwNVx1NjgwN1x1OEJCMFx1NEUzQVx1NTkxNlx1OTBFOFx1NUU5M1x1RkYwOFx1OUVEOFx1OEJBNDogZmFsc2VcdUZGMDlcbiAgICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAqL1xuICBleHRlcm5hbEJ0Y1BhY2thZ2VzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBAY29uZmlncyBcdTUzMDVcdTY4MDdcdThCQjBcdTRFM0FcdTU5MTZcdTkwRThcdTVFOTNcdUZGMDhcdTlFRDhcdThCQTQ6IHRydWVcdUZGMDlcbiAgICogXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bWFpbi1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgICogXHU1QjUwXHU1RTk0XHU3NTI4XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdTUxNzFcdTRFQUJcdThENDRcdTZFOTBcbiAgICovXG4gIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgUm9sbHVwIFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqIEByZXR1cm5zIFJvbGx1cCBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvbGx1cENvbmZpZyhhcHBOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBSb2xsdXBDb25maWdPcHRpb25zKTogUm9sbHVwT3B0aW9ucyB7XG4gIGNvbnN0IG1hbnVhbENodW5rcyA9IGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5KGFwcE5hbWUpO1xuICBjb25zdCBhc3NldERpciA9IG9wdGlvbnM/LmFzc2V0RGlyIHx8ICdhc3NldHMnO1xuICBjb25zdCBjaHVua0RpciA9IG9wdGlvbnM/LmNodW5rRGlyIHx8IGFzc2V0RGlyO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1biBcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMDhcdTVCNTBcdTVFOTRcdTc1MjhcdUZGMDlcbiAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bGF5b3V0LWFwcFx1RkYwOVx1OTcwMFx1ODk4MVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBleHRlcm5hbFNpbmdsZVNwYTogZmFsc2VcbiAgLy8gQHRzLWlnbm9yZTogXHU1M0VGXHU4MEZEXHU1NzI4XHU2NzJBXHU2NzY1XHU0RjdGXHU3NTI4XG4gIGNvbnN0IF9leHRlcm5hbFNpbmdsZVNwYSA9IG9wdGlvbnM/LmV4dGVybmFsU2luZ2xlU3BhICE9PSBmYWxzZTtcbiAgLy8gXHU5RUQ4XHU4QkE0XHU1QzA2IEBidGMgXHU1MzA1XHU2MjUzXHU1MzA1XHU1MjMwXHU1RTk0XHU3NTI4XHU0RTJEXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XHVGRjA5XG4gIC8vIFx1NTk4Mlx1Njc5Q1x1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU1MjE5XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU0RTBEXHU2M0E4XHU4MzUwXHVGRjA5XG4gIGNvbnN0IGV4dGVybmFsQnRjUGFja2FnZXMgPSBvcHRpb25zPy5leHRlcm5hbEJ0Y1BhY2thZ2VzID09PSB0cnVlO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgQGNvbmZpZ3MgXHU1MzA1XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XG4gIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU5NzAwXHU4OTgxXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzOiBmYWxzZVx1RkYwQ1x1NEVFNVx1NEZCRlx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1xuICBjb25zdCBleHRlcm5hbENvbmZpZ3NQYWNrYWdlcyA9IG9wdGlvbnM/LmV4dGVybmFsQ29uZmlnc1BhY2thZ2VzICE9PSBmYWxzZTtcblxuICAvLyBcdTY3ODRcdTVFRkEgZXh0ZXJuYWwgXHU2NTcwXHU3RUM0XG4gIC8vIFJvbGx1cCBcdTc2ODQgZXh0ZXJuYWwgXHU2NTJGXHU2MzAxXHU1QjU3XHU3QjI2XHU0RTMyXHUzMDAxXHU2QjYzXHU1MjE5XHU4ODY4XHU4RkJFXHU1RjBGXHU2MjE2XHU1MUZEXHU2NTcwXG4gIGNvbnN0IGV4dGVybmFsOiAoc3RyaW5nIHwgUmVnRXhwIHwgKChpZDogc3RyaW5nKSA9PiBib29sZWFuKSlbXSA9IFtcbiAgICAvLyB2aXRlLXBsdWdpbiBcdTY2MkZcdTY3ODRcdTVFRkFcdTY1RjZcdTYzRDJcdTRFRjZcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdThGRDBcdTg4NENcdTY1RjZcdTRFRTNcdTc4MDFcdTRFMkRcbiAgICAnQGJ0Yy92aXRlLXBsdWdpbicsXG4gICAgL15AYnRjXFwvdml0ZS1wbHVnaW4vLFxuICAgIC8vIEBidGMgXHU1MzA1XHVGRjFBXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXG4gICAgLy8gXHU5RUQ4XHU4QkE0XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBQ1NTIFx1NjU4N1x1NEVGNlx1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwQ1x1NUU5NFx1OEJFNVx1ODhBQiBWaXRlIFx1NTkwNFx1NzQwNlx1NUU3Nlx1NjI1M1x1NTMwNVxuICAgIC4uLihleHRlcm5hbEJ0Y1BhY2thZ2VzID8gW1xuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvJykpIHtcbiAgICAgICAgICAvLyBcdTYzOTJcdTk2NjQgQ1NTIFx1NjU4N1x1NEVGNlx1RkYwOC5jc3MsIC5zY3NzLCAuc2FzcywgLmxlc3MgXHU3QjQ5XHVGRjA5XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvcmUvJykpIHtcbiAgICAgICAgICByZXR1cm4gIS9cXC4oY3NzfHNjc3N8c2Fzc3xsZXNzfHN0eWwpJC9pLnRlc3QoaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLXV0aWxzLycpKSB7XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgIF0gOiBbXSksXG4gICAgLy8gQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzIFx1NTMwNVx1RkYxQVx1NjgzOVx1NjM2RVx1OTE0RFx1N0Y2RVx1NTFCM1x1NUI5QVx1NjYyRlx1NTQyNlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFxuICAgIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU1RTk0XHU4QkU1XHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgLi4uKGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzID8gW1xuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvYXBwLXNjYW5uZXInLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9hcHAtZW52LmNvbmZpZycsXG4gICAgICAvXkBidGNcXC9zaGFyZWQtY29yZVxcL2NvbmZpZ3NcXC8uKi8sXG4gICAgXSA6IFtdKSxcbiAgXTtcblxuICByZXR1cm4ge1xuICAgIHByZXNlcnZlRW50cnlTaWduYXR1cmVzOiAnc3RyaWN0JyxcbiAgICBvbndhcm4od2FybmluZzogV2FybmluZywgd2FybjogV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCkge1xuICAgICAgLy8gXHU4RkM3XHU2RUU0XHU1REYyXHU3N0U1XHU4QjY2XHU1NDRBXG4gICAgICBpZiAod2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScgfHxcbiAgICAgICAgICAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnZHluYW1pY2FsbHkgaW1wb3J0ZWQnKSAmJlxuICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ3N0YXRpY2FsbHkgaW1wb3J0ZWQnKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJiB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ0dlbmVyYXRlZCBhbiBlbXB0eSBjaHVuaycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1OEZDN1x1NkVFNCBAYnRjIFx1NTMwNVx1NzY4NFx1OEI2Nlx1NTQ0QVx1RkYwQ1x1NTZFMFx1NEUzQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NTMwNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1NjcwOSB1bnJlc29sdmVkIGltcG9ydCBcdThCNjZcdTU0NEFcbiAgICAgIHdhcm4od2FybmluZyk7XG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGZvcm1hdDogJ2VzbScsXG4gICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsXG4gICAgICBtYW51YWxDaHVua3MsXG4gICAgICBwcmVzZXJ2ZU1vZHVsZXM6IGZhbHNlLFxuICAgICAgZ2VuZXJhdGVkQ29kZToge1xuICAgICAgICBjb25zdEJpbmRpbmdzOiBmYWxzZSwgLy8gXHU0RTBEXHU0RjdGXHU3NTI4IGNvbnN0XHVGRjBDXHU5MDdGXHU1MTREIFREWiBcdTk1RUVcdTk4OThcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkREXHU3NTU5XHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU1MzhCXHU3RjI5XHU2MjEwXHU1MzU1XHU1QjU3XHU2QkNEXG4gICAgICAgIC8vIFx1OEZEOVx1NTNFRlx1NEVFNVx1OTYzMlx1NkI2MiBcImRvZXMgbm90IHByb3ZpZGUgYW4gZXhwb3J0IG5hbWVkICdjJ1wiIFx1OTUxOVx1OEJFRlxuICAgICAgICBwcmVzZXJ2ZU1vZHVsZXNSb290OiB1bmRlZmluZWQsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NEU0Qlx1OTVGNFx1NjcwOVx1NkI2M1x1Nzg2RVx1NzY4NFx1NTIwNlx1OTY5NFx1N0IyNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUI1N1x1N0IyNlx1NEUzMlx1NTQ4Q1x1NjU3MFx1NUI1N1x1OEZERVx1NjNBNVxuICAgICAgICBvYmplY3RTaG9ydGhhbmQ6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTVCRjlcdThDNjFcdTdCODBcdTUxOTlcdUZGMENcdTc4NkVcdTRGRERcdTVDNUVcdTYwMjdcdTU0MERcdTU0OENcdTUwM0NcdTkwRkRcdTVCOENcdTY1NzRcbiAgICAgICAgYXJyb3dGdW5jdGlvbnM6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTdCQURcdTU5MzRcdTUxRkRcdTY1NzBcdUZGMENcdTRGN0ZcdTc1MjhcdTY2NkVcdTkwMUFcdTUxRkRcdTY1NzBcdUZGMENcdTY2RjRcdTVCODlcdTUxNjhcbiAgICAgIH0sXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcdTRFMERcdTg4QUJcdTUzOEJcdTdGMjlcbiAgICAgIC8vIFx1ODY3RFx1NzEzNiB0ZXJzZXIgXHU3Njg0IG1hbmdsZSBcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRGNDYgUm9sbHVwIFx1NzY4NFx1NEVFM1x1NzgwMVx1NzUxRlx1NjIxMFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTM4Qlx1N0YyOVx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFxuICAgICAgY2h1bmtGaWxlTmFtZXM6IGAke2NodW5rRGlyfS9bbmFtZV0tW2hhc2hdLmpzYCxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NEY3Rlx1NzUyOFx1N0EzM1x1NUI5QVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NUUyNiBoYXNoXHVGRjA5XHVGRjBDXHU5NjREXHU0RjRFXHU5MEU4XHU3RjcyL1x1N0YxM1x1NUI1OFx1NUJGQ1x1ODFGNFx1NzY4NCBpbmRleC14eHguanMgNDA0IFx1OThDRVx1OTY2OVxuICAgICAgLy8gTmdpbnggXHU1QkY5XHU4QkU1XHU2NTg3XHU0RUY2XHU1RTk0XHU5MTREXHU3RjZFIG5vLWNhY2hlXHVGRjFCXHU1MTc2XHU0RUQ2IGNodW5rIFx1NEVDRFx1NEZERFx1NjMwMSBoYXNoICsgaW1tdXRhYmxlXG4gICAgICBlbnRyeUZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS5qc2AsXG4gICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogT3V0cHV0QXNzZXQpID0+IHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBZmF2aWNvbi5pY28gXHU1NDhDIGljb25zIFx1NzZFRVx1NUY1NVx1NzY4NFx1NjU4N1x1NEVGNlx1NEUwRFx1NUU5NFx1OEJFNVx1NkRGQlx1NTJBMCBoYXNoXHVGRjBDXHU1RTk0XHU4QkU1XHU0RkREXHU2MzAxXHU1NzI4XHU1MzlGXHU0RjREXHU3RjZFXG4gICAgICAgIC8vIFx1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlx1NEYxQVx1ODhBQiBwdWJsaWNEaXIgXHU2MjE2IGNvcHlJY29uc1BsdWdpbiBcdTU5MERcdTUyMzZcdTUyMzBcdTZCNjNcdTc4NkVcdTc2ODRcdTRGNERcdTdGNkVcbiAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnZmF2aWNvbicpIHx8IGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnaWNvbnMvJykpIHtcbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY1ODdcdTRFRjZcdTU0MERcdTUzMDVcdTU0MkIgZmF2aWNvbiBcdTYyMTYgaWNvbnNcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkIgaGFzaFx1RkYwOVxuICAgICAgICAgIC8vIFx1NEY0Nlx1OEZEOVx1NzlDRFx1NjBDNVx1NTFCNVx1NUU5NFx1OEJFNVx1NUY4OFx1NUMxMVx1RkYwQ1x1NTZFMFx1NEUzQSBwdWJsaWNEaXIgXHU0RjFBXHU3NkY0XHU2M0E1XHU1OTBEXHU1MjM2XHU4RkQ5XHU0RTlCXHU2NTg3XHU0RUY2XG4gICAgICAgICAgcmV0dXJuIGFzc2V0SW5mby5uYW1lIHx8IGAke2Fzc2V0RGlyfS9bbmFtZV0uW2V4dF1gO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhc3NldEluZm8ubmFtZT8uZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5jc3NgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZXh0ZXJuYWwsXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjbGVhbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50c1wiOy8qKlxuICogXHU2RTA1XHU3NDA2XHU2Nzg0XHU1RUZBXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgbG9nZ2VyLmluZm8obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBsb2dnZXIuaW5mbyhtZXNzYWdlLnJlcGxhY2UoL1teXFx4MDAtXFx4N0ZdL2csICcnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcdThGOTNcdTUxRkFcdThCNjZcdTU0NEFcdUZGMDhcdTkwN0ZcdTUxNEQgV2luZG93cyBcdTYzQTdcdTUyMzZcdTUzRjBcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcbiAqL1xuZnVuY3Rpb24gc2FmZVdhcm4obWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgbG9nZ2VyLndhcm4obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBsb2dnZXIud2FybihtZXNzYWdlLnJlcGxhY2UoL1teXFx4MDAtXFx4N0ZdL2csICcnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqIFx1NkRGQlx1NTJBMFx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1NEVFNVx1NTkwNFx1NzQwNiBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5EaXN0UGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2xlYW4tZGlzdC1wbHVnaW4nLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdkaXN0Jyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhkaXN0RGlyKSkge1xuICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNlx1NjVFN1x1NzY4NCBkaXN0IFx1NzZFRVx1NUY1NS4uLicpO1xuXG4gICAgICAgIC8vIFx1NkRGQlx1NTJBMFx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwQ1x1NTkwNFx1NzQwNiBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFxuICAgICAgICBsZXQgcmV0cmllcyA9IDU7IC8vIFx1NTg5RVx1NTJBMFx1OTFDRFx1OEJENVx1NkIyMVx1NjU3MFxuICAgICAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuXG4gICAgICAgIHdoaWxlIChyZXRyaWVzID4gMCAmJiAhc3VjY2Vzcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBybVN5bmMoZGlzdERpciwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1MjcwNSBkaXN0IFx1NzZFRVx1NUY1NVx1NURGMlx1NkUwNVx1NzQwNicpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHJpZXMtLTtcbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRUJVU1knIHx8IGVycm9yLmNvZGUgPT09ICdFTk9URU1QVFknKSB7XG4gICAgICAgICAgICAgIGlmIChyZXRyaWVzID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRUaW1lID0gKDYgLSByZXRyaWVzKSAqIDIwMDsgLy8gXHU5MDEyXHU1ODlFXHU3QjQ5XHU1Rjg1XHU2NUY2XHU5NUY0XHVGRjFBMjAwbXMsIDQwMG1zLCA2MDBtcywgODAwbXMsIDEwMDBtc1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKGBbY2xlYW4tZGlzdC1wbHVnaW5dIFx1MjZBMFx1RkUwRiAgXHU3NkVFXHU1RjU1XHU4OEFCXHU1MzYwXHU3NTI4XHVGRjBDXHU3QjQ5XHU1Rjg1ICR7d2FpdFRpbWV9bXMgXHU1NDBFXHU5MUNEXHU4QkQ1Li4uIChcdTUyNjlcdTRGNTkgJHtyZXRyaWVzfSBcdTZCMjEpYCk7XG4gICAgICAgICAgICAgICAgLy8gXHU1NDBDXHU2QjY1XHU3QjQ5XHU1Rjg1XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB3YWl0VGltZSkge1xuICAgICAgICAgICAgICAgICAgLy8gXHU1RkQ5XHU3QjQ5XHU1Rjg1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1Mjc0QyBcdTY1RTBcdTZDRDVcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdUZGMDhcdTUzRUZcdTgwRkRcdTg4QUJcdTUxNzZcdTRFRDZcdTdBMEJcdTVFOEZcdTUzNjBcdTc1MjhcdUZGMDknKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTYzRDBcdTc5M0FcdUZGMUFcdThCRjdcdTUxNzNcdTk1RURcdTUzRUZcdTgwRkRcdTUzNjBcdTc1MjhcdTY1ODdcdTRFRjZcdTc2ODRcdTdBMEJcdTVFOEZcdUZGMDhcdTU5ODJcdTY1ODdcdTRFRjZcdThENDRcdTZFOTBcdTdCQTFcdTc0MDZcdTU2NjhcdTMwMDFcdTdGMTZcdThGOTFcdTU2NjhcdTdCNDlcdUZGMDknKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTYyMTZcdTgwMDVcdTYyNEJcdTUyQThcdTUyMjBcdTk2NjQgZGlzdCBcdTc2RUVcdTVGNTVcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkEnKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTY3ODRcdTVFRkFcdTVDMDZcdTdFRTdcdTdFRURcdUZGMENcdTRGNDZcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTZFMDVcdTc0MDZcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjYnKTtcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTsgLy8gXHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgLy8gXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU2RTA1XHU3NDA2XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHVGRjBDXHU3NkY0XHU2M0E1XHU2MjlCXHU1MUZBXG4gICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNTogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTY3ODRcdTVFRkFcdTVDMDZcdTdFRTdcdTdFRURcdUZGMENcdTRGNDZcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIFx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NjVFMFx1OTcwMFx1NkUwNVx1NzQwNicpO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2h1bmsudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2h1bmsudHNcIjsvKipcbiAqIENodW5rIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU1MzA1XHU2MkVDIGNodW5rIFx1OUE4Q1x1OEJDMVx1NTQ4Q1x1NEYxOFx1NTMxNlxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcblxuLyoqXG4gKiBcdTlBOENcdThCQzFcdTYyNDBcdTY3MDkgY2h1bmsgXHU3NTFGXHU2MjEwXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaHVua1ZlcmlmeVBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjaHVuay12ZXJpZnktcGx1Z2luJyxcbiAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGxvZ2dlci5pbmZvKCdcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NzUxRlx1NjIxMFx1NzY4NFx1NjI0MFx1NjcwOSBjaHVuayBcdTY1ODdcdTRFRjZcdUZGMUEnKTtcbiAgICAgIGNvbnN0IGpzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICBjb25zdCBjc3NDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG5cbiAgICAgIGxvZ2dlci5pbmZvKGBcXG5KUyBjaHVua1x1RkYwOFx1NTE3MSAke2pzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBqc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGxvZ2dlci5pbmZvKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIGxvZ2dlci5pbmZvKGBcXG5DU1MgY2h1bmtcdUZGMDhcdTUxNzEgJHtjc3NDaHVua3MubGVuZ3RofSBcdTRFMkFcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGNzc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGxvZ2dlci5pbmZvKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIGNvbnN0IGluZGV4Q2h1bmsgPSBqc0NodW5rcy5maW5kKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnaW5kZXgtJykpO1xuICAgICAgY29uc3QgaW5kZXhTaXplID0gaW5kZXhDaHVuayA/IChidW5kbGVbaW5kZXhDaHVua10gYXMgYW55KT8uY29kZT8ubGVuZ3RoIHx8IDAgOiAwO1xuICAgICAgY29uc3QgaW5kZXhTaXplS0IgPSBpbmRleFNpemUgLyAxMDI0O1xuICAgICAgY29uc3QgaW5kZXhTaXplTUIgPSBpbmRleFNpemVLQiAvIDEwMjQ7XG5cbiAgICAgIGNvbnN0IG1pc3NpbmdSZXF1aXJlZENodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmICghaW5kZXhDaHVuaykge1xuICAgICAgICBtaXNzaW5nUmVxdWlyZWRDaHVua3MucHVzaCgnaW5kZXgnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzRXBzU2VydmljZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdlcHMtc2VydmljZScpKTtcbiAgICAgIGNvbnN0IGhhc0F1dGhBcGkgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnYXV0aC1hcGknKSk7XG4gICAgICBjb25zdCBoYXNFY2hhcnRzVmVuZG9yID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2VjaGFydHMtdmVuZG9yJykpO1xuICAgICAgY29uc3QgaGFzTGliTW9uYWNvID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2xpYi1tb25hY28nKSk7XG4gICAgICBjb25zdCBoYXNMaWJUaHJlZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdsaWItdGhyZWUnKSk7XG5cbiAgICAgIGxvZ2dlci5pbmZvKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHVEODNEXHVEQ0U2IFx1Njc4NFx1NUVGQVx1NjBDNVx1NTFCNVx1RkYwOFx1NUU3M1x1ODg2MVx1NjJDNlx1NTIwNlx1N0I1Nlx1NzU2NVx1RkYwOVx1RkYxQWApO1xuICAgICAgaWYgKGluZGV4Q2h1bmspIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYCAgXHUyNzA1IGluZGV4OiBcdTRFM0JcdTY1ODdcdTRFRjZcdUZGMDhWdWVcdTc1MUZcdTYwMDEgKyBFbGVtZW50IFBsdXMgKyBcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdUZGMENcdTRGNTNcdTc5RUZ+JHtpbmRleFNpemVNQi50b0ZpeGVkKDIpfU1CIFx1NjcyQVx1NTM4Qlx1N0YyOVx1RkYwQ2d6aXBcdTU0MEV+JHsoaW5kZXhTaXplTUIgKiAwLjMpLnRvRml4ZWQoMil9TUJcdUZGMDlgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGAgIFx1Mjc0QyBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNFcHNTZXJ2aWNlKSBsb2dnZXIuaW5mbyhgICBcdTI3MDUgZXBzLXNlcnZpY2U6IEVQUyBcdTY3MERcdTUyQTFcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNBdXRoQXBpKSBsb2dnZXIuaW5mbyhgICBcdTI3MDUgYXV0aC1hcGk6IEF1dGggQVBJXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjBDXHU3NTMxIHN5c3RlbS1hcHAgXHU2M0QwXHU0RjlCXHVGRjA5YCk7XG4gICAgICBpZiAoaGFzRWNoYXJ0c1ZlbmRvcikgbG9nZ2VyLmluZm8oYCAgXHUyNzA1IGVjaGFydHMtdmVuZG9yOiBFQ2hhcnRzICsgenJlbmRlclx1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwQ1x1NjVFMFx1NEY5RFx1OEQ1Nlx1OTVFRVx1OTg5OFx1RkYwOWApO1xuICAgICAgaWYgKGhhc0xpYk1vbmFjbykgbG9nZ2VyLmluZm8oYCAgXHUyNzA1IGxpYi1tb25hY286IE1vbmFjbyBFZGl0b3JcdUZGMDhcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNMaWJUaHJlZSkgbG9nZ2VyLmluZm8oYCAgXHUyNzA1IGxpYi10aHJlZTogVGhyZWUuanNcdUZGMDhcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMDlgKTtcbiAgICAgIGxvZ2dlci5pbmZvKGAgIFx1MjEzOVx1RkUwRiAgXHU0RTFBXHU1MkExXHU0RUUzXHU3ODAxXHU1NDhDIFZ1ZSBcdTc1MUZcdTYwMDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcdUZGMENcdTkwN0ZcdTUxNERcdTUyMURcdTU5Q0JcdTUzMTZcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThgKTtcblxuICAgICAgaWYgKG1pc3NpbmdSZXF1aXJlZENodW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTdGM0FcdTU5MzFcdTY4MzhcdTVGQzMgY2h1bmtcdUZGMUFgLCBtaXNzaW5nUmVxdWlyZWRDaHVua3MpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjgzOFx1NUZDMyBjaHVuayBcdTdGM0FcdTU5MzFcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjgzOFx1NUZDMyBjaHVuayBcdTUxNjhcdTkwRThcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU5QThDXHU4QkMxXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTAwXHU4MUY0XHU2MDI3XG4gICAgICBsb2dnZXIuaW5mbygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1REQwRCBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjcuLi4nKTtcbiAgICAgIGNvbnN0IGFsbENodW5rRmlsZXMgPSBuZXcgU2V0KFsuLi5qc0NodW5rcywgLi4uY3NzQ2h1bmtzXSk7XG4gICAgICBjb25zdCByZWZlcmVuY2VkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICBjb25zdCBtaXNzaW5nRmlsZXM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyByZWZlcmVuY2VkQnk6IHN0cmluZ1tdOyBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdIH0+ID0gW107XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSkge1xuICAgICAgICAgIGNvbnN0IGNvZGVXaXRob3V0Q29tbWVudHMgPSBjaHVua0FueS5jb2RlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwvLiokL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2csICcnKTtcblxuICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccypbXCInXShcXC8/YXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpW1wiJ11cXHMqXFwpL2c7XG4gICAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBpbXBvcnRQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1cmxQYXR0ZXJuID0gL25ld1xccytVUkxcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXS9nO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB1cmxQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBbcmVmZXJlbmNlZEZpbGUsIHJlZmVyZW5jZWRCeV0gb2YgcmVmZXJlbmNlZEZpbGVzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHJlZmVyZW5jZWRGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgIGxldCBleGlzdHMgPSBhbGxDaHVua0ZpbGVzLmhhcyhmaWxlTmFtZSk7XG4gICAgICAgIGxldCBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeCwgLCBleHRdID0gbWF0Y2g7XG4gICAgICAgICAgICBwb3NzaWJsZU1hdGNoZXMgPSBBcnJheS5mcm9tKGFsbENodW5rRmlsZXMpLmZpbHRlcihjaHVua0ZpbGUgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjaHVua01hdGNoID0gY2h1bmtGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICBpZiAoY2h1bmtNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFssIGNodW5rTmFtZVByZWZpeCwgLCBjaHVua0V4dF0gPSBjaHVua01hdGNoO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaHVua05hbWVQcmVmaXggPT09IG5hbWVQcmVmaXggJiYgY2h1bmtFeHQgPT09IGV4dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4aXN0cyA9IHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgbWlzc2luZ0ZpbGVzLnB1c2goeyBmaWxlOiByZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5LCBwb3NzaWJsZU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTUzRDFcdTczQjAgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUFgKTtcbiAgICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPD0gNSkge1xuICAgICAgICAgIGxvZ2dlci53YXJuKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdThCNjZcdTU0NEFcdUZGMUFcdTUzRDFcdTczQjAgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTRGNDZcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwQ1x1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVx1RkYwMVx1NjcwOSAke21pc3NpbmdGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOFx1NzY4NFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOGApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuaW5mbyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTkwRkRcdTZCNjNcdTc4NkVcdUZGMDhcdTUxNzFcdTlBOENcdThCQzEgJHtyZWZlcmVuY2VkRmlsZXMuc2l6ZX0gXHU0RTJBXHU1RjE1XHU3NTI4XHVGRjA5YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbi8qKlxuICogXHU0RjE4XHU1MzE2XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHU2M0QyXHU0RUY2XHVGRjFBXHU1OTA0XHU3NDA2XHU3QTdBIGNodW5rXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZUNodW5rc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdvcHRpbWl6ZS1jaHVua3MnLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgZW1wdHlDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBjaHVua1JlZmVyZW5jZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSAmJiBjaHVua0FueS5jb2RlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBlbXB0eUNodW5rcy5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpbXBvcnRlZCBvZiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgICBpZiAoIWNodW5rUmVmZXJlbmNlcy5oYXMoaW1wb3J0ZWQpKSB7XG4gICAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5zZXQoaW1wb3J0ZWQsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5nZXQoaW1wb3J0ZWQpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtcHR5Q2h1bmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNodW5rc1RvUmVtb3ZlOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtzVG9LZWVwOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGVtcHR5Q2h1bmsgb2YgZW1wdHlDaHVua3MpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZEJ5ID0gY2h1bmtSZWZlcmVuY2VzLmdldChlbXB0eUNodW5rKSB8fCBbXTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZWRCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgICAgaWYgKGNodW5rICYmIChjaHVuayBhcyBhbnkpLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSAnZXhwb3J0IHt9JztcbiAgICAgICAgICAgIGNodW5rc1RvS2VlcC5wdXNoKGVtcHR5Q2h1bmspO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVuazogJHtlbXB0eUNodW5rfSAoXHU4OEFCICR7cmVmZXJlbmNlZEJ5Lmxlbmd0aH0gXHU0RTJBIGNodW5rIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNilgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2h1bmtzVG9SZW1vdmUucHVzaChlbXB0eUNodW5rKTtcbiAgICAgICAgICBkZWxldGUgYnVuZGxlW2VtcHR5Q2h1bmtdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaHVua3NUb1JlbW92ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbb3B0aW1pemUtY2h1bmtzXSBcdTc5RkJcdTk2NjRcdTRFODYgJHtjaHVua3NUb1JlbW92ZS5sZW5ndGh9IFx1NEUyQVx1NjcyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVuazpgLCBjaHVua3NUb1JlbW92ZSk7XG4gICAgICB9XG4gICAgICBpZiAoY2h1bmtzVG9LZWVwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1NEU4NiAke2NodW5rc1RvS2VlcC5sZW5ndGh9IFx1NEUyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVua1x1RkYwOFx1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNlx1RkYwOTpgLCBjaHVua3NUb0tlZXApO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXJsLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VybC50c1wiOy8qKlxuICogVVJMIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NkI2M1x1Nzg2RVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgQ2h1bmtJbmZvLCBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlIGFzIHJlc29sdmVQYXRoLCBkaXJuYW1lIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVzdGFtcEZvclF1ZXJ5KCk6IHN0cmluZyB7XG4gIC8vIFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOFx1NTE2OFx1OTFDRlx1Njc4NFx1NUVGQVx1ODExQVx1NjcyQ1x1NkNFOFx1NTE2NVx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwOFx1NEUwRSBhZGRWZXJzaW9uUGx1Z2luIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwOVxuICBpZiAocHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QO1xuICB9XG4gIC8vIFx1NTE3Nlx1NkIyMVx1OEJGQlx1NTNENiAuYnVpbGQtdGltZXN0YW1wXHVGRjA4XHU0RTBFIGFkZFZlcnNpb25QbHVnaW4gXHU3Njg0XHU1QjlFXHU3M0IwXHU0RTAwXHU4MUY0XHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcEZpbGUgPSByZXNvbHZlUGF0aChfX2Rpcm5hbWUsICcuLi8uLi8uLi8uYnVpbGQtdGltZXN0YW1wJyk7XG4gIGlmIChleGlzdHNTeW5jKHRpbWVzdGFtcEZpbGUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRzID0gcmVhZEZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsICd1dGYtOCcpLnRyaW0oKTtcbiAgICAgIGlmICh0cykgcmV0dXJuIHRzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlXG4gICAgfVxuICB9XG4gIC8vIFx1NjcwMFx1NTQwRVx1NTE1Q1x1NUU5NVx1RkYxQVx1NzUxRlx1NjIxMFx1NEUwMFx1NEUyQVx1RkYwOFx1NEUwRFx1NTE5OVx1NTZERVx1NjU4N1x1NEVGNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTI2Rlx1NEY1Q1x1NzUyOFx1RkYwOVxuICByZXR1cm4gRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQmFzZVVybFBsdWdpbihiYXNlVXJsOiBzdHJpbmcsIGFwcEhvc3Q6IHN0cmluZywgYXBwUG9ydDogbnVtYmVyLCBtYWluQXBwUG9ydDogc3RyaW5nKTogUGx1Z2luIHtcbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBiYXNlVXJsLnN0YXJ0c1dpdGgoJ2h0dHAnKTtcbiAgY29uc3QgcWlhbmt1bkluZGV4SW1wb3J0UmVnZXggPSAvaW1wb3J0XFwoKFsnXCJdKVxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS0oW14nXCJdKylcXDFcXCkvZztcbiAgY29uc3QgYnVpbGRUaW1lc3RhbXAgPSBnZXRCdWlsZFRpbWVzdGFtcEZvclF1ZXJ5KCk7XG4gIGNvbnN0IHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4ID0gL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZztcblxuICAvKipcbiAgICogXHU0RkVFXHU1OTBEIHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU3NTFGXHU2MjEwXHU3Njg0XHU1MzA1XHU4OEM1XHU1NjY4XHU5MUNDXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKSBcdTc2ODRcdTk1RUVcdTk4OThcdUZGMUFcbiAgICogLSBcdTU3MjggcWlhbmt1biBcdTZDOTlcdTdCQjFcdTkxQ0NcdUZGMENcdThGRDlcdTRGMUFcdTYzMDlcdTIwMUNcdTVCQkZcdTRFM0Igb3JpZ2luXHUyMDFEXHU4OUUzXHU2NzkwXHVGRjBDXHU1QkZDXHU4MUY0XHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzIGNodW5rIFx1ODhBQlx1OTUxOVx1OEJFRlx1OEJGN1x1NkM0Mlx1NTIzMCBsYXlvdXQgXHU1N0RGXHU1NDBEXG4gICAqIC0gXHU4RkQ5XHU5MUNDXHU2NTM5XHU0RTNBXHVGRjFBXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IHFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU3Njg0IF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXHVGRjA4XHU5MDFBXHU1RTM4XHU0RTNBXHU1QjUwXHU1RTk0XHU3NTI4IG9yaWdpblx1RkYwOVx1RkYwQ1x1NTQyNlx1NTIxOVx1NTZERVx1OTAwMFx1NTIzMCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gICAqL1xuICBmdW5jdGlvbiBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMoY29kZTogc3RyaW5nKTogeyBjb2RlOiBzdHJpbmc7IG1vZGlmaWVkOiBib29sZWFuIH0ge1xuICAgIGlmICghcWlhbmt1bkluZGV4SW1wb3J0UmVnZXgudGVzdChjb2RlKSkge1xuICAgICAgcmV0dXJuIHsgY29kZSwgbW9kaWZpZWQ6IGZhbHNlIH07XG4gICAgfVxuICAgIHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cbiAgICBjb25zdCBoZWxwZXJOYW1lID0gJ19fYnRjUWlhbmt1bkFzc2V0T3JpZ2luJztcbiAgICBjb25zdCB0c05hbWUgPSAnX19idGNCdWlsZFYnO1xuICAgIGNvbnN0IGhlbHBlckRlY2wgPVxuICAgICAgYGNvbnN0ICR7aGVscGVyTmFtZX09KCgpPT57dHJ5e2NvbnN0IHA9d2luZG93JiZ3aW5kb3cuX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX187YCArXG4gICAgICBgaWYocCYmdHlwZW9mIHA9PT0nc3RyaW5nJyl7Y29uc3Qgcz1wLnJlcGxhY2UoL1xcXFwvJC8sJycpO2AgK1xuICAgICAgYGlmKHMuc3RhcnRzV2l0aCgnaHR0cCcpfHxzLnN0YXJ0c1dpdGgoJy8vJykpcmV0dXJuIHM7YCArXG4gICAgICBgcmV0dXJuICh3aW5kb3cubG9jYXRpb24mJndpbmRvdy5sb2NhdGlvbi5vcmlnaW4/d2luZG93LmxvY2F0aW9uLm9yaWdpbjonJykrczt9YCArXG4gICAgICBgfWNhdGNoe31yZXR1cm4gKHdpbmRvdy5sb2NhdGlvbiYmd2luZG93LmxvY2F0aW9uLm9yaWdpbik/d2luZG93LmxvY2F0aW9uLm9yaWdpbjonJzt9KSgpO2A7XG4gICAgY29uc3QgdHNEZWNsID0gYGNvbnN0ICR7dHNOYW1lfT0nJHtidWlsZFRpbWVzdGFtcH0nO2A7XG5cbiAgICBsZXQgbmV3Q29kZSA9IGNvZGUucmVwbGFjZShxaWFua3VuSW5kZXhJbXBvcnRSZWdleCwgKF9tLCBfcSwgX2tpbmQsIHJlc3QpID0+IHtcbiAgICAgIC8vIHJlc3Q6IFwieHh4eC5qc1wiIFx1OTFDQ1x1NzY4NFx1NEY1OVx1NEUwQlx1OTBFOFx1NTIwNlx1RkYwOGhhc2ggKyAuanNcdUZGMDlcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEZGRFx1NTJBMCA/dj0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJGXHU0RTNCL1x1NkQ0Rlx1ODlDOFx1NTY2OC9DRE4gXHU1OTBEXHU3NTI4XHU2NUU3XHU1MTY1XHU1M0UzXHU4MTFBXHU2NzJDXHU1QkZDXHU4MUY0XHU2MzAxXHU3RUVEXHU4QkY3XHU2QzQyXHU2NUU3IGNodW5rXG4gICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7aGVscGVyTmFtZX0gKyAnL2Fzc2V0cy8ke19raW5kfS0ke3Jlc3R9JyArICc/dj0nICsgJHt0c05hbWV9KSlgO1xuICAgIH0pO1xuXG4gICAgaWYgKCFuZXdDb2RlLmluY2x1ZGVzKGhlbHBlckRlY2wpKSB7XG4gICAgICAvLyBcdTVDM0RcdTkxQ0ZcdTVDMTFcdTRGQjVcdTUxNjVcdUZGMUFcdTUzRUFcdTU3MjhcdTk3MDBcdTg5ODFcdTY1RjZcdTYzRDJcdTUxNjUgaGVscGVyXHVGRjBDXHU0RTAwXHU2QjIxXHU1MzczXHU1M0VGXG4gICAgICBuZXdDb2RlID0gYCR7dHNEZWNsfVxcbiR7aGVscGVyRGVjbH1cXG4ke25ld0NvZGV9YDtcbiAgICB9XG4gICAgcmV0dXJuIHsgY29kZTogbmV3Q29kZSwgbW9kaWZpZWQ6IHRydWUgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Vuc3VyZS1iYXNlLXVybCcsXG4gICAgcmVuZGVyQ2h1bmsoY29kZTogc3RyaW5nLCBjaHVuazogQ2h1bmtJbmZvLCBfb3B0aW9uczogYW55KSB7XG4gICAgICAvLyBcdTRFMERcdTUxOERcdThERjNcdThGQzcgdmVuZG9yIFx1N0I0OVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OTBGRFx1NkI2M1x1Nzg2RVxuICAgICAgLy8gXHU1NkUwXHU0RTNBIHZlbmRvciBcdTdCNDlcdTVFOTNcdTRFMkRcdTRFNUZcdTUzRUZcdTgwRkRcdTUzMDVcdTU0MkJcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRcblxuICAgICAgbGV0IG5ld0NvZGUgPSBjb2RlO1xuICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NTMwNVx1ODhDNVx1NTY2OFx1NzY4NFx1N0VERFx1NUJGOSAvYXNzZXRzL2luZGV4LXh4eC5qcyBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMDhcdThERThcdTU3REZcdTVCQkZcdTRFM0JcdTRGMUEgNDA0XHVGRjA5XG4gICAgICB7XG4gICAgICAgIGNvbnN0IHBhdGNoZWQgPSBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMobmV3Q29kZSk7XG4gICAgICAgIGlmIChwYXRjaGVkLm1vZGlmaWVkKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IHBhdGNoZWQuY29kZTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKShcXD9bXlwiJ2BcXHNdKik/L2c7XG4gICAgICAgIGlmIChyZWxhdGl2ZVBhdGhSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaCwgcXVvdGUsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MERcdTk1MTlcdThCRUZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTMgLT4gXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXHVGRjA5XG4gICAgICAvLyBcdTUzMzlcdTkxNEQgaHR0cDovL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IGh0dHA6Ly8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRIdHRwUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaCwgaG9zdCwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICByZXR1cm4gYGh0dHA6Ly8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICB9KTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgLy9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiAvLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgY29uc3Qgd3JvbmdQb3J0UHJvdG9jb2xSZWdleCA9IG5ldyBSZWdFeHAoYC8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaCwgaG9zdCwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICByZXR1cm4gYC8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKGh0dHA6Ly8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoLy8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKGh0dHA6Ly8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoLy8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXTtcblxuICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICAgIGlmIChwYXR0ZXJuLnJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHBhdHRlcm4ucmVnZXgsIHBhdHRlcm4ucmVwbGFjZW1lbnQgYXMgYW55KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0ICgke21haW5BcHBQb3J0fSAtPiAke2FwcFBvcnR9KWApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IG5ld0NvZGUsXG4gICAgICAgICAgbWFwOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGM6IGFueSA9IGNodW5rO1xuICAgICAgICBpZiAoYy50eXBlID09PSAnY2h1bmsnICYmIGMuY29kZSkge1xuICAgICAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAgICAgbGV0IG5ld0NvZGUgPSBjLmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTUzMDVcdTg4QzVcdTU2NjhcdTc2ODRcdTdFRERcdTVCRjkgL2Fzc2V0cy9pbmRleC14eHguanMgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjA4XHU4REU4XHU1N0RGXHU1QkJGXHU0RTNCXHU0RjFBIDQwNFx1RkYwOVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGNoZWQgPSBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMobmV3Q29kZSk7XG4gICAgICAgICAgICBpZiAocGF0Y2hlZC5tb2RpZmllZCkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gcGF0Y2hlZC5jb2RlO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRFx1OTUxOVx1OEJFRlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFMyAtPiBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDlcbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgaHR0cDovL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IGh0dHA6Ly8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgICAgIHJldHVybiBgaHR0cDovLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgLy9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiAvLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgICAgIHJldHVybiBgLy8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5jb2RlID0gbmV3Q29kZTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU0RTJEXHU0RkVFXHU1OTBEXHU0RTg2ICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFxuICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTk4Mlx1Njc5QyBWaXRlIFx1OTE0RFx1N0Y2RVx1NkI2M1x1Nzg2RVx1RkYwOGJhc2U6ICcvJywgYXNzZXRzRGlyOiAnYXNzZXRzJywgcm9sbHVwT3B0aW9ucy5vdXRwdXQuY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcydcdUZGMDlcdUZGMENcbiAgICAgICAgICAvLyBWaXRlIFx1NUU5NFx1OEJFNVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NkI2M1x1Nzg2RVx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFx1MzAwMlxuICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NTNFQVx1NTkwNFx1NzQwNlx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NzY4NFx1N0FFRlx1NTNFM1x1NEZFRVx1NTkwRFx1RkYwQ1x1NEVFNVx1NTNDQVx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMlxuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9ICgoYyBhcyBhbnkpLnNvdXJjZSkgYXMgc3RyaW5nO1xuICAgICAgICAgIGxldCBodG1sTW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NCAuL2Fzc2V0cy8gXHU0RTNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IC9hc3NldHMvXHVGRjA4XHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHVGRjA5XG4gICAgICAgICAgY29uc3QgcmVsYXRpdmVBc3NldFJlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwuXFwvYXNzZXRzXFwvW15cIiddKykoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocmVsYXRpdmVBc3NldFJlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocmVsYXRpdmVBc3NldFJlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC4vLCAnJyk7XG4gICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODQ6ICR7cGF0aH0gLT4gJHthYnNvbHV0ZVBhdGh9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBgJHthdHRyfT1cIiR7YWJzb2x1dGVQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU1MjMwIGluZGV4Lmh0bWwgXHU1MTg1XHU4MDU0XHU4MTFBXHU2NzJDXHU0RTJEXHU3Njg0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKVxuICAgICAgICAgIC8vIFx1OEJGNFx1NjYwRVx1RkYxQXFpYW5rdW4gXHU0RjFBXHU2MjhBXHU4QkU1XHU1MTg1XHU4MDU0XHU4MTFBXHU2NzJDIGV2YWwgXHU2MjEwIFZNIFx1NjI2N1x1ODg0Q1x1RkYxQlx1NTk4Mlx1Njc5Q1x1NEVDRFx1NjYyRiAvYXNzZXRzLyBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTVDMzFcdTRGMUFcdTYzMDlcdTVCQkZcdTRFM0JcdTU3REZcdTU0MERcdTg5RTNcdTY3OTBcdUZGMDhcdTVCRkNcdTgxRjQgbGF5b3V0IFx1NTdERlx1NTQwRCA0MDRcdUZGMDlcdTMwMDJcbiAgICAgICAgICAvLyBcdThGRDlcdTkxQ0NcdTY1MzlcdTRFM0FcdUZGMUFcdTRGMThcdTUxNDhcdTc1MjggX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDhcdTVCNTBcdTVFOTRcdTc1MjggcHVibGljUGF0aC9vcmlnaW5cdUZGMDlcdUZGMENcdTVFNzZcdThGRkRcdTUyQTAgP3Y9IFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwQ1x1OTA3Rlx1NTE0RFx1N0YxM1x1NUI1OFx1NjVFN1x1NTE2NVx1NTNFM1x1MzAwMlxuICAgICAgICAgIGlmIChxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgcWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPVxuICAgICAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICAgICAgYDooKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykpYDtcbiAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleCwgKF9tLCBfcSwgYWJzUGF0aCkgPT4ge1xuICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScgKyAnP3Y9JHtidWlsZFRpbWVzdGFtcH0nKSlgO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEIGluZGV4Lmh0bWwgXHU1MTg1XHU4MDU0IGltcG9ydCgvYXNzZXRzL2luZGV4LSouanMpIFx1NUU3Nlx1OEZGRFx1NTJBMCB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjA4XHU1OTgyIC9pbmRleC5qc1x1RkYwOVx1RkYwQ1x1OEJGNFx1NjYwRVx1OTE0RFx1N0Y2RVx1NjcwOVx1OTVFRVx1OTg5OFx1RkYwQ1x1OEJCMFx1NUY1NVx1OEI2Nlx1NTQ0QVxuICAgICAgICAgIC8vIFx1NkI2M1x1NUUzOFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ1ZpdGUgXHU1RTk0XHU4QkU1XHU3NTFGXHU2MjEwIC9hc3NldHMvW25hbWVdLVtoYXNoXS5qcyBcdThGRDlcdTY4MzdcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgICBjb25zdCByb290SnNSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLyhbXi9dK1xcLihqc3xtanMpKSkoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocm9vdEpzUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBodG1sQ29udGVudC5tYXRjaChyb290SnNSZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICBsb2dnZXIud2FybihgW2Vuc3VyZS1iYXNlLXVybF0gXHUyNkEwXHVGRTBGICBcdTY4QzBcdTZENEJcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDhiYXNlLCBhc3NldHNEaXIsIHJvbGx1cE9wdGlvbnMub3V0cHV0LmNodW5rRmlsZU5hbWVzXHVGRjA5OmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RKc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgX2V4dCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFwYXRoLnN0YXJ0c1dpdGgoJy9mYXZpY29uJykgJiYgIXBhdGguc3RhcnRzV2l0aCgnL2xvZ28nKSAmJiAhcGF0aC5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8c3ZnfGljb3xqc29uKSQvKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjA4XHU1MTVDXHU1RTk1XHVGRjA5OiAke3BhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthdHRyfT1cIiR7bmV3UGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tYXRjaDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgcm9vdENzc1JlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvKFteL10rXFwuY3NzKSkoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocm9vdENzc1JlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gaHRtbENvbnRlbnQubWF0Y2gocm9vdENzc1JlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci53YXJuKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTI2QTBcdUZFMEYgIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NSBDU1MgXHU4REVGXHU1Rjg0XHVGRjBDXHU4RkQ5XHU5MDFBXHU1RTM4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MUZBXHU3M0IwXHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IFZpdGUgXHU5MTREXHU3RjZFOmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RDc3NSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgZmlsZU5hbWUsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNvcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50c1wiOy8qKlxuICogQ09SUyBcdTYzRDJcdTRFRjZcbiAqIFx1NjUyRlx1NjMwMSBjcmVkZW50aWFscyBcdTc2ODQgQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuXG4vKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3JzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGNvbnN0IGNvcnNEZXZNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcblxuICBjb25zdCBjb3JzUHJldmlld01pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgfVxuXG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY29ycy13aXRoLWNyZWRlbnRpYWxzJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNEZXZNaWRkbGV3YXJlIH0sXG4gICAgICAgICAgLi4uZmlsdGVyZWRTdGFjayxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoY29yc0Rldk1pZGRsZXdhcmUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29uZmlndXJlUHJldmlld1NlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhY2spKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3RhY2sgPSBzdGFjay5maWx0ZXIoKGl0ZW06IGFueSkgPT5cbiAgICAgICAgICBpdGVtLmhhbmRsZSAhPT0gY29yc0Rldk1pZGRsZXdhcmUgJiYgaXRlbS5oYW5kbGUgIT09IGNvcnNQcmV2aWV3TWlkZGxld2FyZVxuICAgICAgICApO1xuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc1ByZXZpZXdNaWRkbGV3YXJlIH0sXG4gICAgICAgICAgLi4uZmlsdGVyZWRTdGFjayxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoY29yc1ByZXZpZXdNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNzcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHNcIjsvKipcbiAqIENTUyBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU2MjUzXHU1MzA1XG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU2MjUzXHU1MzA1XHU3Njg0XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVDc3NQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZW5zdXJlLWNzcy1wbHVnaW4nLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QganNGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgbGV0IGhhc0lubGluZUNzcyA9IGZhbHNlO1xuICAgICAgY29uc3Qgc3VzcGljaW91c0ZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBqc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rICYmIGNodW5rLmNvZGUgJiYgdHlwZW9mIGNodW5rLmNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgY29kZSA9IGNodW5rLmNvZGU7XG5cbiAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSBjb2RlLmluY2x1ZGVzKCdtb2R1bGVwcmVsb2FkJykgfHwgY29kZS5pbmNsdWRlcygncmVsTGlzdCcpO1xuICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IGlzS25vd25MaWJyYXJ5ID0gZmlsZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3ZlbmRvcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtaTE4bicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ21vZHVsZS0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnYXBwLWNvbXBvc2FibGVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2FwcC1wYWdlcycpO1xuICAgICAgICAgIGlmIChpc0tub3duTGlicmFyeSkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24gPSAvZG9jdW1lbnRcXC5jcmVhdGVFbGVtZW50XFwoWydcIl1zdHlsZVsnXCJdXFwpLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFwuKHRleHRDb250ZW50fGlubmVySFRNTClcXHMqPS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MTAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IGhhc0luc2VydFN0eWxlV2l0aENzcyA9IC9pbnNlcnRTdHlsZVxccypcXCgvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC90ZXh0XFwvY3NzLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3Qgc3R5bGVUYWdNYXRjaCA9IGNvZGUubWF0Y2goLzxzdHlsZVtePl0qPi8pO1xuICAgICAgICAgIGNvbnN0IGhhc1N0eWxlVGFnV2l0aENvbnRlbnQgPSBzdHlsZVRhZ01hdGNoICYmXG4gICAgICAgICAgICAhc3R5bGVUYWdNYXRjaFswXS5pbmNsdWRlcyhcIidcIikgJiZcbiAgICAgICAgICAgICFzdHlsZVRhZ01hdGNoWzBdLmluY2x1ZGVzKCdcIicpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3QgaGFzSW5saW5lQ3NzU3RyaW5nID0gL1snXCJgXVteJ1wiYF17NTAsfTpcXHMqW14nXCJgXXsxMCx9O1xccypbXidcImBdezEwLH1bJ1wiYF0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC8oY29sb3J8YmFja2dyb3VuZHx3aWR0aHxoZWlnaHR8bWFyZ2lufHBhZGRpbmd8Ym9yZGVyfGRpc3BsYXl8cG9zaXRpb258ZmxleHxncmlkKS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGlmIChoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbiB8fCBoYXNJbnNlcnRTdHlsZVdpdGhDc3MgfHwgaGFzU3R5bGVUYWdXaXRoQ29udGVudCB8fCBoYXNJbmxpbmVDc3NTdHJpbmcpIHtcbiAgICAgICAgICAgIGhhc0lubGluZUNzcyA9IHRydWU7XG4gICAgICAgICAgICBzdXNwaWNpb3VzRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgaWYgKGhhc1N0eWxlRWxlbWVudENyZWF0aW9uKSBwYXR0ZXJucy5wdXNoKCdcdTUyQThcdTYwMDFcdTUyMUJcdTVFRkEgc3R5bGUgXHU1MTQzXHU3RDIwJyk7XG4gICAgICAgICAgICBpZiAoaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzKSBwYXR0ZXJucy5wdXNoKCdpbnNlcnRTdHlsZSBcdTUxRkRcdTY1NzAnKTtcbiAgICAgICAgICAgIGlmIChoYXNTdHlsZVRhZ1dpdGhDb250ZW50KSBwYXR0ZXJucy5wdXNoKCc8c3R5bGU+IFx1NjgwN1x1N0I3RScpO1xuICAgICAgICAgICAgaWYgKGhhc0lubGluZUNzc1N0cmluZykgcGF0dGVybnMucHVzaCgnXHU1MTg1XHU4MDU0IENTUyBcdTVCNTdcdTdCMjZcdTRFMzInKTtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTU3MjggJHtmaWxlfSBcdTRFMkRcdTY4QzBcdTZENEJcdTUyMzBcdTUzRUZcdTgwRkRcdTc2ODRcdTUxODVcdTgwNTQgQ1NTXHVGRjA4XHU2QTIxXHU1RjBGXHVGRjFBJHtwYXR0ZXJucy5qb2luKCcsICcpfVx1RkYwOWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChoYXNJbmxpbmVDc3MpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NjhDMFx1NkQ0Qlx1NTIzMCBDU1MgXHU1M0VGXHU4MEZEXHU4OEFCXHU1MTg1XHU4MDU0XHU1MjMwIEpTIFx1NEUyRFx1RkYwQ1x1OEZEOVx1NEYxQVx1NUJGQ1x1ODFGNCBxaWFua3VuIFx1NjVFMFx1NkNENVx1NkI2M1x1Nzg2RVx1NTJBMFx1OEY3RFx1NjgzN1x1NUYwRicpO1xuICAgICAgICBsb2dnZXIud2FybihgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTUzRUZcdTc1OTFcdTY1ODdcdTRFRjZcdUZGMUEke3N1c3BpY2lvdXNGaWxlcy5qb2luKCcsICcpfWApO1xuICAgICAgICBsb2dnZXIud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTUgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTkxNERcdTdGNkVcdTU0OEMgYnVpbGQuYXNzZXRzSW5saW5lTGltaXQgXHU4QkJFXHU3RjZFJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGNzc0ZpbGVzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuICAgICAgaWYgKGNzc0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzRDIFx1OTUxOVx1OEJFRlx1RkYxQVx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NjVFMCBDU1MgXHU2NTg3XHU0RUY2XHVGRjAxJyk7XG4gICAgICAgIGxvZ2dlci5lcnJvcignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTVcdUZGMUEnKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCcxLiBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTk3NTlcdTYwMDFcdTVCRkNcdTUxNjVcdTUxNjhcdTVDNDBcdTY4MzdcdTVGMEZcdUZGMDhpbmRleC5jc3MvdW5vLmNzcy9lbGVtZW50LXBsdXMuY3NzXHVGRjA5Jyk7XG4gICAgICAgIGxvZ2dlci5lcnJvcignMi4gXHU2NjJGXHU1NDI2XHU2NzA5IFZ1ZSBcdTdFQzRcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjggPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCczLiBVbm9DU1MgXHU5MTREXHU3RjZFXHU2NjJGXHU1NDI2XHU2QjYzXHU3ODZFXHVGRjBDXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1IEB1bm9jc3MgYWxsJyk7XG4gICAgICAgIGxvZ2dlci5lcnJvcignNC4gdml0ZS1wbHVnaW4tcWlhbmt1biBcdTc2ODQgdXNlRGV2TW9kZSBcdTY2MkZcdTU0MjZcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTZCNjNcdTc4NkVcdTUxNzNcdTk1RUQnKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCc1LiBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdTY2MkZcdTU0MjZcdThCQkVcdTdGNkVcdTRFM0EgMFx1RkYwOFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1RkYwOScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzA1IFx1NjIxMFx1NTI5Rlx1NjI1M1x1NTMwNSAke2Nzc0ZpbGVzLmxlbmd0aH0gXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMUFgLCBjc3NGaWxlcyk7XG4gICAgICAgIGNzc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgY29uc3QgYXNzZXQgPSBidW5kbGVbZmlsZV0gYXMgYW55O1xuICAgICAgICAgIGlmIChhc3NldCAmJiBhc3NldC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVLQiA9IChhc3NldC5zb3VyY2UubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgIC0gJHtmaWxlfTogJHtzaXplS0J9S0JgKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFzc2V0ICYmIGFzc2V0LmZpbGVOYW1lKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgICAtICR7YXNzZXQuZmlsZU5hbWUgfHwgZmlsZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdmVyc2lvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy92ZXJzaW9uLnRzXCI7LyoqXG4gKiBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqIFx1NEUzQSBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NTE2OFx1NUM0MFx1N0VERlx1NEUwMFx1NzY4NFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1xuICogXHU3NTI4XHU0RThFXHU2RDRGXHU4OUM4XHU1NjY4XHU3RjEzXHU1QjU4XHU2M0E3XHU1MjM2XHVGRjBDXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU5MEZEXHU0RjFBXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlLCBkaXJuYW1lIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjIxNlx1NzUxRlx1NjIxMFx1NTE2OFx1NUM0MFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1xuICogXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHVGRjBDXHU5MEZEXHU2Q0ExXHU2NzA5XHU1MjE5XHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XG4gKi9cbmZ1bmN0aW9uIGdldEJ1aWxkVGltZXN0YW1wKCk6IHN0cmluZyB7XG4gIC8vIDEuIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwOFx1NzUzMVx1Njc4NFx1NUVGQVx1ODExQVx1NjcyQ1x1OEJCRVx1N0Y2RVx1RkYwOVxuICBpZiAocHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QO1xuICB9XG5cbiAgLy8gMi4gXHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcEZpbGUgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5idWlsZC10aW1lc3RhbXAnKTtcbiAgaWYgKGV4aXN0c1N5bmModGltZXN0YW1wRmlsZSkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gcmVhZEZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsICd1dGYtOCcpLnRyaW0oKTtcbiAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gXHU1RkZEXHU3NTY1XHU4QkZCXHU1M0Q2XHU5NTE5XHU4QkVGXG4gICAgfVxuICB9XG5cbiAgLy8gMy4gXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHU1RTc2XHU0RkREXHU1QjU4XHU1MjMwXHU2NTg3XHU0RUY2XHVGRjA4XHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU1NDBDXHU0RTAwXHU0RTJBXHVGRjA5XG4gIC8vIFx1NEY3Rlx1NzUyODM2XHU4RkRCXHU1MjM2XHU3RjE2XHU3ODAxXHVGRjBDXHU3NTFGXHU2MjEwXHU2NkY0XHU3N0VEXHU3Njg0XHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU1MzA1XHU1NDJCXHU1QjU3XHU2QkNEXHU1NDhDXHU2NTcwXHU1QjU3XHVGRjBDXHU1OTgyIGwzazJqMWhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG4gIHRyeSB7XG4gICAgd3JpdGVGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCB0aW1lc3RhbXAsICd1dGYtOCcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NUZGRFx1NzU2NVx1NTE5OVx1NTE2NVx1OTUxOVx1OEJFRlxuICB9XG4gIHJldHVybiB0aW1lc3RhbXA7XG59XG5cbi8qKlxuICogXHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRWZXJzaW9uUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGNvbnN0IGJ1aWxkVGltZXN0YW1wID0gZ2V0QnVpbGRUaW1lc3RhbXAoKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdhZGQtdmVyc2lvbicsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGxvZ2dlci5pbmZvKGBbYWRkLXZlcnNpb25dIFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGNzogJHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICB9LFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEY3Rlx1NzUyOCB0cmFuc2Zvcm1JbmRleEh0bWxcdUZGMDhWaXRlIFx1NTE4NVx1OTBFOFx1NjYyRlx1NTcyOFx1NTQwRVx1N0Y2RVx1OTYzNlx1NkJCNVx1NzUxRlx1NjIxMC9cdTUxOTlcdTUxNjUgaW5kZXguaHRtbFx1RkYwQ2dlbmVyYXRlQnVuZGxlIFx1NUY4OFx1NUJCOVx1NjYxM1x1NjJGRlx1NEUwRFx1NTIzMFx1NjcwMFx1N0VDOCBIVE1MXHVGRjA5XG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3Bvc3QnLFxuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIGxldCBuZXdIdG1sID0gaHRtbDtcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gMCkgXHU3OUZCXHU5NjY0XHU3QTdBXHU3Njg0IDxzdHlsZT48L3N0eWxlPiBcdTY4MDdcdTdCN0VcbiAgICAgICAgLy8gXHU4QkY0XHU2NjBFXHVGRjFBXHU1NzI4XHU1RkFFXHU1MjREXHU3QUVGXHU2N0I2XHU2Nzg0XHU0RTBCXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU4OEFCIHFpYW5rdW4gXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTNCXHU1RTk0XHU3NTI4XHU1REYyXHU3RUNGXHU2M0QwXHU0RjlCXHU0RTg2IGxvYWRpbmdcdUZGMENcbiAgICAgICAgLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0IHN0eWxlIFx1NjgwN1x1N0I3RVx1NTNFRlx1ODBGRFx1ODhBQlx1NTkwNFx1NzQwNlx1NjIxMFx1N0E3QVx1NzY4NFx1MzAwMlx1NzlGQlx1OTY2NFx1N0E3QVx1NjgwN1x1N0I3RVx1NTNFRlx1NEVFNVx1N0I4MFx1NTMxNiBIVE1MIFx1N0VEM1x1Njc4NFx1MzAwMlxuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMEJcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdUZGMENzdHlsZSBcdTY4MDdcdTdCN0VcdTY3MDlcdTUxODVcdTVCQjlcdUZGMDhsb2FkaW5nIFx1NjgzN1x1NUYwRlx1RkYwOVx1RkYwQ1x1NEUwRFx1NEYxQVx1ODhBQlx1NzlGQlx1OTY2NFx1MzAwMlxuICAgICAgICBjb25zdCBlbXB0eVN0eWxlUmVnZXggPSAvPHN0eWxlPlxccyo8XFwvc3R5bGU+L2dpO1xuICAgICAgICBpZiAoZW1wdHlTdHlsZVJlZ2V4LnRlc3QobmV3SHRtbCkpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKGVtcHR5U3R5bGVSZWdleCwgJycpO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEpIFx1NEUzQSA8c2NyaXB0IHNyYz4gXHU2REZCXHU1MkEwL1x1NjZGNFx1NjVCMCB2XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEUwRFx1ODk4MVx1N0VEOSBFU00gbW9kdWxlIHNjcmlwdFx1RkYwOHR5cGU9XCJtb2R1bGVcIlx1RkYwOVx1OEZGRFx1NTJBMCA/dlxuICAgICAgICAvLyBcdTU0MjZcdTUyMTlcdTU0MENcdTRFMDBcdTRFMkFcdTZBMjFcdTU3NTdcdTRGMUFcdTU0MENcdTY1RjZcdTRFRTVcdTMwMENcdTVFMjYgdlx1MzAwRFx1NTQ4Q1x1MzAwQ1x1NEUwRFx1NUUyNiB2XHUzMDBEXHVGRjA4XHU5NzU5XHU2MDAxIGltcG9ydCBcdTc1MUZcdTYyMTBcdTc2ODQgVVJMXHVGRjA5XHU0RTI0XHU1OTU3IFVSTCBcdTg4QUJcdTUyQTBcdThGN0RcdUZGMENcbiAgICAgICAgLy8gXHU1NzI4XHU1RkFFXHU1MjREXHU3QUVGL1x1OTFDRFx1NTkwRFx1NTJBMFx1OEY3RFx1NTE2NVx1NTNFM1x1ODExQVx1NjcyQ1x1NTczQVx1NjY2Rlx1NEUwQlx1NEYxQVx1NUJGQ1x1ODFGNFx1NkEyMVx1NTc1N1x1NjI2N1x1ODg0Q1x1NEUyNFx1NkIyMVx1RkYwQ1x1NEVDRVx1ODAwQ1x1ODlFNlx1NTNEMVx1N0M3Qlx1NEYzQyBFQ2hhcnRzIFx1NzY4NFx1OTFDRFx1NTkwRFx1NkNFOFx1NTE4Q1x1NjVBRFx1OEEwMFx1MzAwMlxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlU2NyaXB0ID0gL3R5cGVcXHMqPVxccypbXCInXW1vZHVsZVtcIiddL2kudGVzdChtYXRjaCk7XG4gICAgICAgICAgICBjb25zdCBpc0Fzc2V0cyA9IHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKTtcblxuICAgICAgICAgICAgLy8gXHU1QkY5IG1vZHVsZSBzY3JpcHRcdUZGMUFcdTVGM0FcdTUyMzZcdTc5RkJcdTk2NjQgdlx1RkYwQ1x1NEZERFx1OEJDMSBVUkwgXHU0RTBFXHU2MjUzXHU1MzA1XHU0RUE3XHU3MjY5XHU1MTg1XHU5MEU4IGltcG9ydCBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcbiAgICAgICAgICAgIGlmIChpc01vZHVsZVNjcmlwdCAmJiBpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csICcnKS5yZXBsYWNlKC9cXD8mLywgJz8nKS5yZXBsYWNlKC9bPyZdJC8sICcnKTtcbiAgICAgICAgICAgICAgaWYgKGNsZWFuZWQgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2xlYW5lZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNyYy5pbmNsdWRlcygnP3Y9JykgfHwgc3JjLmluY2x1ZGVzKCcmdj0nKSkge1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwID0gc3JjLmluY2x1ZGVzKCc/JykgPyAnJicgOiAnPyc7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtzcmN9JHtzZXB9dj0ke2J1aWxkVGltZXN0YW1wfSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyAyKSBcdTRFM0EgPGxpbmsgaHJlZj4gXHU2REZCXHU1MkEwL1x1NjZGNFx1NjVCMCB2XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFx1NTQwQ1x1NEUwQVx1RkYxQW1vZHVsZXByZWxvYWQgXHU1QzVFXHU0RThFIEVTTSBcdTRGOURcdThENTZcdTU2RkVcdTc2ODRcdTRFMDBcdTkwRThcdTUyMDZcdUZGMENcdThGRkRcdTUyQTAgP3YgXHU0RjFBXHU4QkE5XHU5ODg0XHU1MkEwXHU4RjdEIFVSTCBcdTRFMEUgaW1wb3J0IFVSTCBcdTRFMERcdTRFMDBcdTgxRjRcdUZGMENcbiAgICAgICAgLy8gXHU5MDIwXHU2MjEwXHU5MUNEXHU1OTBEXHU4QkY3XHU2QzQyXHU3NTFBXHU4MUYzXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHVGRjA4XHU1NzI4XHU2N0QwXHU0RTlCIGxvYWRlciBcdTU3M0FcdTY2NkZcdTRFMEJcdUZGMDlcdTMwMDJcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvKDxsaW5rW14+XSpcXHMraHJlZj1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBocmVmOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSAvXFxzcmVsXFxzKj1cXHMqW1wiJ11tb2R1bGVwcmVsb2FkW1wiJ10vaS50ZXN0KG1hdGNoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXNzZXRzID0gaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnLi9hc3NldHMvJyk7XG5cbiAgICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQgJiYgaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZCA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgJycpLnJlcGxhY2UoL1xcPyYvLCAnPycpLnJlcGxhY2UoL1s/Jl0kLywgJycpO1xuICAgICAgICAgICAgICBpZiAoY2xlYW5lZCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2xlYW5lZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhyZWYuaW5jbHVkZXMoJz92PScpIHx8IGhyZWYuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBocmVmLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7dXBkYXRlZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGhyZWYuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2hyZWZ9JHtzZXB9dj0ke2J1aWxkVGltZXN0YW1wfSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyAzKSBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODRcdTUxODVcdTgwNTQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU1QkJGXHU0RTNCXHU1N0RGXHU1NDBEXHU4OUUzXHU2NzkwXG4gICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1OEZEOVx1OTFDQ1x1NEU1Rlx1NEUwRFx1ODk4MVx1OEZGRFx1NTJBMCA/dlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUY2Mlx1NjIxMFx1MzAwQ1x1NUUyNiB2IC8gXHU0RTBEXHU1RTI2IHZcdTMwMERcdTRFMjRcdTU5NTdcdTUxNjVcdTUzRTMgVVJMXHVGRjBDXHU1QkZDXHU4MUY0XHU1MTY1XHU1M0UzXHU2QTIxXHU1NzU3XHU4OEFCXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHUzMDAyXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBxaWFua3VuIHNhbmRib3ggXHU0RTJEXHU2NkY0XHU1M0VGXHU5NzYwXHU3Njg0XHU1MTk5XHU2Q0Q1XHU2NjJGXHU3NkY0XHU2M0E1XHU4QkZCXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXG4gICAgICAgIC8vIFx1ODAwQ1x1NEUwRFx1NjYyRiB3aW5kb3cuX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDh3aW5kb3cgXHU1M0VGXHU4MEZEXHU4OEFCIHByb3h5IFx1OTFDRFx1NTE5OS9cdTRFMERcdTUzMDVcdTU0MkIgbG9jYXRpb25cdUZGMDlcdTMwMDJcbiAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2csXG4gICAgICAgICAgKF9tOiBzdHJpbmcsIF9xOiBzdHJpbmcsIGFic1BhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nKSlgO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYFthZGQtdmVyc2lvbl0gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3OiB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccHVibGljLWltYWdlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9wdWJsaWMtaW1hZ2VzLnRzXCI7LyoqXG4gKiBQdWJsaWMgXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1OTA0XHU3NDA2XHU2M0QyXHU0RUY2XG4gKiBcdTVDMDYgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NTZGRVx1NzI0N1x1NjU4N1x1NEVGNlx1NjI1M1x1NTMwNVx1NTIzMCBhc3NldHMgXHU3NkVFXHU1RjU1XHU1RTc2XHU2REZCXHU1MkEwXHU1NEM4XHU1RTBDXHU1MDNDXG4gKiBcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDYgbG9nby5wbmdcdUZGMUFcdTRGRERcdTYzMDFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTY1ODdcdTRFRjZcdTU0MERcdTRFMERcdTUzRDhcbiAqL1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnQGJ0Yy9zaGFyZWQtY29yZSc7XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyByZXNvbHZlLCBqb2luLCBleHRuYW1lLCBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMsIHdyaXRlRmlsZVN5bmMsIG1rZGlyU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcHVibGljSW1hZ2VzVG9Bc3NldHNQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBjb25zdCBpbWFnZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IGVtaXR0ZWRGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IHB1YmxpY0ltYWdlRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBcbiAgLy8gXHU5NzAwXHU4OTgxXHU3Mjc5XHU2QjhBXHU1OTA0XHU3NDA2XHU3Njg0XHU2NTg3XHU0RUY2XHU1MjE3XHU4ODY4XHVGRjFBXHU2NTNFXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHVGRjBDXHU0RTBEXHU0RjdGXHU3NTI4IGhhc2hcdUZGMDhcdTRFQzVcdTc1MjhcdTRFOEUgQ1NTIFx1OERFRlx1NUY4NFx1NjZGRlx1NjM2Mlx1RkYwOVxuICBjb25zdCByb290SW1hZ2VGaWxlcyA9IFsnbG9nby5wbmcnLCAnbG9naW5fY3V0X2RhcmsucG5nJywgJ2xvZ2luX2N1dF9saWdodC5wbmcnXTtcblxuICBjb25zdCBpc1ZpcnR1YWxNb2R1bGVJZCA9IChpZDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIGlkLmluY2x1ZGVzKCdcXDAnKSB8fCBpZC5pbmNsdWRlcygncHVibGljLWltYWdlOicpO1xuICB9O1xuXG4gIGNvbnN0IGV4dHJhY3RPcmlnaW5hbFBhdGggPSAoaWQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgIGlmICghaXNWaXJ0dWFsTW9kdWxlSWQoaWQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gaWQucmVwbGFjZSgvXFwwcHVibGljLWltYWdlOi9nLCAnJykucmVwbGFjZSgvXFwwL2csICcnKTtcbiAgICBpZiAob3JpZ2luYWxQYXRoLmluY2x1ZGVzKCdcXDAnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBvcmlnaW5hbFBhdGg7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncHVibGljLWltYWdlcy10by1hc3NldHMnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zdCBwdWJsaWNEaXIgPSByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICAgICAgaWYgKCFleGlzdHNTeW5jKHB1YmxpY0RpcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbWFnZUV4dGVuc2lvbnMgPSBbJy5wbmcnLCAnLmpwZycsICcuanBlZycsICcuZ2lmJywgJy53ZWJwJywgJy5zdmcnLCAnLmljbyddO1xuICAgICAgLy8gXHU2MzkyXHU5NjY0IGZhdmljb24uaWNvXHVGRjBDXHU3RURGXHU0RTAwXHU0RjdGXHU3NTI4IGxvZ28ucG5nIFx1NEY1Q1x1NEUzQSBmYXZpY29uXG4gICAgICBjb25zdCBleGNsdWRlZEZpbGVzID0gWydmYXZpY29uLmljbyddO1xuICAgICAgY29uc3QgZmlsZXMgPSByZWFkZGlyU3luYyhwdWJsaWNEaXIpO1xuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2MzkyXHU5NjY0XHU3Njg0XHU2NTg3XHU0RUY2XG4gICAgICAgIGlmIChleGNsdWRlZEZpbGVzLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyM0VEXHVGRTBGICBcdThERjNcdThGQzcgJHtmaWxlfVx1RkYwOFx1N0VERlx1NEUwMFx1NEY3Rlx1NzUyOCBsb2dvLnBuZyBcdTRGNUNcdTRFM0EgZmF2aWNvblx1RkYwOWApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBleHQgPSBleHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChpbWFnZUV4dGVuc2lvbnMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgIC8vIFx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1OTcwMFx1ODk4MVx1NzI3OVx1NkI4QVx1NTkwNFx1NzQwNlx1RkYxQVx1NEZERFx1NjMwMVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwQ1x1NjU4N1x1NEVGNlx1NTQwRFx1NEUwRFx1NTNEOFx1RkYwQ1x1NEUwRFx1NEY3Rlx1NzUyOFx1NTRDOFx1NUUwQ1x1NTAzQ1xuICAgICAgICAgIGlmIChyb290SW1hZ2VGaWxlcy5pbmNsdWRlcyhmaWxlKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVEQ0U2IFx1NTkwNFx1NzQwNiAke2ZpbGV9XHVGRjBDXHU1QzA2XHU1OTBEXHU1MjM2XHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU2NUUwXHU1NEM4XHU1RTBDXHU1MDNDXHVGRjA5YCk7XG4gICAgICAgICAgICAvLyBcdThCQjBcdTVGNTVcdTY1ODdcdTRFRjZcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTU3Mjggd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU1OTBEXHU1MjM2XHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgICAgICBwdWJsaWNJbWFnZUZpbGVzLnNldChmaWxlLCBqb2luKHB1YmxpY0RpciwgZmlsZSkpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBqb2luKHB1YmxpY0RpciwgZmlsZSk7XG4gICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0U3luYyhmaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICBwdWJsaWNJbWFnZUZpbGVzLnNldChgLyR7ZmlsZX1gLCBmaWxlUGF0aCk7XG4gICAgICAgICAgICBwdWJsaWNJbWFnZUZpbGVzLnNldChmaWxlLCBmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbGVDb250ZW50ID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVJvbGx1cCBcdTc2ODQgZW1pdEZpbGUgXHU0RjFBXHU1QzA2XHU2NTg3XHU0RUY2XHU2NTNFXHU1NzI4IGFzc2V0c0Rpclx1RkYwOFx1OUVEOFx1OEJBNFx1NjYyRiAnYXNzZXRzJ1x1RkYwOVxuICAgICAgICAgICAgLy8gXHU2MjExXHU0RUVDXHU0RTBEXHU1NzI4IGVtaXRGaWxlIFx1NjVGNlx1NjMwN1x1NUI5QSBmaWxlTmFtZVx1RkYwQ1x1OEJBOSBSb2xsdXAgXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjBDXHU3MTM2XHU1NDBFXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1ODNCN1x1NTNENlx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlSWQgPSAodGhpcyBhcyBhbnkpLmVtaXRGaWxlKHtcbiAgICAgICAgICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgICAgICAgICAgbmFtZTogZmlsZSwgLy8gXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU4REVGXHU1Rjg0XHVGRjA5XHVGRjBDUm9sbHVwIFx1NEYxQVx1ODFFQVx1NTJBOFx1NkRGQlx1NTJBMFx1NTRDOFx1NUUwQ1x1NTAzQ1x1NUU3Nlx1NjUzRVx1NTcyOCBhc3NldHNEaXJcbiAgICAgICAgICAgICAgc291cmNlOiBmaWxlQ29udGVudCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZW1pdHRlZEZpbGVzLnNldChmaWxlLCByZWZlcmVuY2VJZCk7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDRTYgXHU1QzA2ICR7ZmlsZX0gXHU2MjUzXHU1MzA1IChyZWZlcmVuY2VJZDogJHtyZWZlcmVuY2VJZH0pYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZywgX2ltcG9ydGVyOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcgfCBudWxsIHwgeyBpZDogc3RyaW5nOyBleHRlcm5hbD86IGJvb2xlYW4gfSB7XG4gICAgICBpZiAoaXNWaXJ0dWFsTW9kdWxlSWQoaWQpKSB7XG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdcXDBwdWJsaWMtaW1hZ2U6JykgfHwgaWQuaW5jbHVkZXMoJ1xcMHB1YmxpYy1pbWFnZTonKSkge1xuICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTA0XHU3NDA2IC9sb2dvLnBuZyBcdTc2ODRcdTg5RTNcdTY3OTBcdUZGMENcdThCQTkgUm9sbHVwIFx1ODBGRFx1NTkxRlx1NjI3RVx1NTIzMFx1NUI4M1xuICAgICAgLy8gXHU1MzczXHU0RjdGIHB1YmxpY0RpciBcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTYyMTFcdTRFRUNcdTRFQ0RcdTcxMzZcdTk3MDBcdTg5ODFcdThCQTlcdTY3ODRcdTVFRkFcdTY1RjZcdTgwRkRcdTU5MUZcdTg5RTNcdTY3OTBcdThGRDlcdTRFMkFcdThERUZcdTVGODRcbiAgICAgIGlmIChpZCA9PT0gJy9sb2dvLnBuZycgfHwgaWQgPT09ICdsb2dvLnBuZycpIHtcbiAgICAgICAgY29uc3QgbG9nb1BhdGggPSBwdWJsaWNJbWFnZUZpbGVzLmdldCgnbG9nby5wbmcnKTtcbiAgICAgICAgaWYgKGxvZ29QYXRoICYmIGV4aXN0c1N5bmMobG9nb1BhdGgpKSB7XG4gICAgICAgICAgLy8gXHU4RkQ0XHU1NkRFXHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjBDXHU4QkE5IFJvbGx1cCBcdTgwRkRcdTU5MUZcdTU5MDRcdTc0MDZcbiAgICAgICAgICByZXR1cm4gbG9nb1BhdGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4RkQ0XHU1NkRFXHU4NjVBXHU2MkRGXHU2QTIxXHU1NzU3IElEXG4gICAgICAgIHJldHVybiBgXFwwcHVibGljLWltYWdlOi9sb2dvLnBuZ2A7XG4gICAgICB9XG5cbiAgICAgIGlmIChpZC5zdGFydHNXaXRoKCcvJykgJiYgcHVibGljSW1hZ2VGaWxlcy5oYXMoaWQpKSB7XG4gICAgICAgIHJldHVybiBgXFwwcHVibGljLWltYWdlOiR7aWR9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgbG9hZChpZDogc3RyaW5nKSB7XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5MDRcdTc0MDZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTc2ODRcdTUyQTBcdThGN0RcbiAgICAgIC8vIFx1NTk4Mlx1Njc5QyBpZCBcdTY2MkZcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTRFMERcdTY2MkZcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcdUZGMDlcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICAgIGZvciAoY29uc3Qgcm9vdEZpbGUgb2Ygcm9vdEltYWdlRmlsZXMpIHtcbiAgICAgICAgaWYgKGlkLmVuZHNXaXRoKHJvb3RGaWxlKSAmJiBleGlzdHNTeW5jKGlkKSkge1xuICAgICAgICAgIC8vIFx1NUJGOVx1NEU4RVx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYwQ1x1OEZENFx1NTZERVx1NEUwMFx1NEUyQVx1NUJGQ1x1NTFGQVx1OERFRlx1NUY4NFx1NzY4NFx1NkEyMVx1NTc1N1xuICAgICAgICAgIC8vIFx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1RkYwQ1x1NTZGRVx1NzI0N1x1NEYxQVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwQ1x1NjI0MFx1NEVFNVx1OEZENFx1NTZERSBcIi9cdTY1ODdcdTRFRjZcdTU0MERcIlxuICAgICAgICAgIHJldHVybiBgZXhwb3J0IGRlZmF1bHQgXCIvJHtyb290RmlsZX1cIjtgO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNWaXJ0dWFsTW9kdWxlSWQoaWQpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvcmlnaW5hbFBhdGggPSBleHRyYWN0T3JpZ2luYWxQYXRoKGlkKTtcbiAgICAgIGlmICghb3JpZ2luYWxQYXRoKSB7XG4gICAgICAgIC8vIFx1NzI3OVx1NkI4QVx1NTkwNFx1NzQwNlx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1xuICAgICAgICBmb3IgKGNvbnN0IHJvb3RGaWxlIG9mIHJvb3RJbWFnZUZpbGVzKSB7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKHJvb3RGaWxlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCBcIi8ke3Jvb3RGaWxlfVwiO2A7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU2NUUwXHU2Q0Q1XHU2M0QwXHU1M0Q2XHU1MzlGXHU1OUNCXHU4REVGXHU1Rjg0XHVGRjBDXHU4REYzXHU4RkM3OiAke2lkfWApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZU5hbWUgPSBiYXNlbmFtZShvcmlnaW5hbFBhdGgpO1xuXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcdThERUZcdTVGODRcbiAgICAgIGlmIChyb290SW1hZ2VGaWxlcy5pbmNsdWRlcyhmaWxlTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCBcIi8ke2ZpbGVOYW1lfVwiO2A7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlZmVyZW5jZUlkID0gZW1pdHRlZEZpbGVzLmdldChmaWxlTmFtZSk7XG4gICAgICBpZiAocmVmZXJlbmNlSWQpIHtcbiAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCBcIi8ke2ZpbGVOYW1lfVwiO2A7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBidW5kbGVBc3NldHMgPSBPYmplY3QuZW50cmllcyhidW5kbGUpLmZpbHRlcigoW18sIGNodW5rXSkgPT4gKGNodW5rIGFzIGFueSkudHlwZSA9PT0gJ2Fzc2V0Jyk7XG4gICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDQ0IgYnVuZGxlIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NjU3MFx1OTFDRjogJHtidW5kbGVBc3NldHMubGVuZ3RofWApO1xuXG4gICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMEQgXHU1RjAwXHU1OUNCXHU1OTA0XHU3NDA2ICR7ZW1pdHRlZEZpbGVzLnNpemV9IFx1NEUyQVx1NURGMlx1NTNEMVx1NTFGQVx1NzY4NFx1NjU4N1x1NEVGNmApO1xuICAgICAgZm9yIChjb25zdCBbb3JpZ2luYWxGaWxlLCByZWZlcmVuY2VJZF0gb2YgZW1pdHRlZEZpbGVzLmVudHJpZXMoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGFjdHVhbEZpbGVOYW1lID0gKHRoaXMgYXMgYW55KS5nZXRGaWxlTmFtZShyZWZlcmVuY2VJZCk7XG5cbiAgICAgICAgICBpZiAoIWFjdHVhbEZpbGVOYW1lKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1NjVFMFx1NkNENVx1ODNCN1x1NTNENiAke29yaWdpbmFsRmlsZX0gXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEIChyZWZlcmVuY2VJZDogJHtyZWZlcmVuY2VJZH0pYCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBhc3NldENodW5rID0gYnVuZGxlW2FjdHVhbEZpbGVOYW1lXTtcbiAgICAgICAgICBpZiAoIWFzc2V0Q2h1bmsgfHwgYXNzZXRDaHVuay50eXBlICE9PSAnYXNzZXQnKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1NTcyOCBidW5kbGUgXHU0RTJEXHU2NzJBXHU2MjdFXHU1MjMwICR7YWN0dWFsRmlsZU5hbWV9IChcdTUzOUZcdTU5Q0JcdTY1ODdcdTRFRjY6ICR7b3JpZ2luYWxGaWxlfSlgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZERFx1NjMwMVx1NUI4Q1x1NjU3NFx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NTMwNVx1NjJFQyBhc3NldHMvIFx1NTI0RFx1N0YwMFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICAgICAgICAgIC8vIFJvbGx1cCBcdTRGMUFcdTVDMDZcdTY1ODdcdTRFRjZcdTY1M0VcdTU3MjggYXNzZXRzIFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjI0MFx1NEVFNVx1OERFRlx1NUY4NFx1NUU5NFx1OEJFNVx1NjYyRiBhc3NldHMvZmlsZW5hbWVcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZVdpdGhQYXRoID0gYWN0dWFsRmlsZU5hbWU7IC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NTlDQlx1OERFRlx1NUY4NFx1RkYwQ1x1NTMwNVx1NjJFQyBhc3NldHMvIFx1NTI0RFx1N0YwMFxuICAgICAgICAgIGltYWdlTWFwLnNldChvcmlnaW5hbEZpbGUsIGZpbGVOYW1lV2l0aFBhdGgpO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjcwNSAke29yaWdpbmFsRmlsZX0gLT4gJHtmaWxlTmFtZVdpdGhQYXRofSAoUm9sbHVwIFx1NzUxRlx1NjIxMFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRClgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBsb2dnZXIud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1NTkwNFx1NzQwNiAke29yaWdpbmFsRmlsZX0gXHU2NUY2XHU1MUZBXHU5NTE5OmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaW1hZ2VNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICBsb2dnZXIud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIGltYWdlTWFwIFx1NEUzQVx1N0E3QVx1RkYwQ1x1NTNFRlx1ODBGRCBlbWl0RmlsZSBcdTZDQTFcdTY3MDlcdTYyMTBcdTUyOUZcdTYyNjdcdTg4NENgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1RENERCBpbWFnZU1hcCBcdTUxODVcdTVCQjk6YCwgQXJyYXkuZnJvbShpbWFnZU1hcC5lbnRyaWVzKCkpLm1hcCgoW2ssIHZdKSA9PiBgJHtrfSAtPiAke3Z9YCkuam9pbignLCAnKSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjOiBhbnkgPSBjaHVuaztcbiAgICAgICAgaWYgKGMudHlwZSA9PT0gJ2NodW5rJyAmJiBjLmNvZGUpIHtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGMuY29kZTtcblxuICAgICAgICAgIGZvciAoY29uc3QgW29yaWdpbmFsRmlsZSwgaGFzaGVkRmlsZV0gb2YgaW1hZ2VNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbFBhdGggPSBgLyR7b3JpZ2luYWxGaWxlfWA7XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFoYXNoZWRGaWxlIFx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1NTMwNVx1NTQyQiBhc3NldHMvIFx1NTI0RFx1N0YwMFx1RkYwQ1x1OTcwMFx1ODk4MVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGhhc2hlZEZpbGUuc3RhcnRzV2l0aCgnYXNzZXRzLycpID8gYC8ke2hhc2hlZEZpbGV9YCA6IGAvJHtoYXNoZWRGaWxlfWA7XG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkUGF0aCA9IG9yaWdpbmFsUGF0aC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuXG4gICAgICAgICAgICBjb25zdCBzdHJpbmdQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKFtcIidcXGBdKSR7ZXNjYXBlZFBhdGh9KFtcIidcXGBdKWAsICdnJyk7XG4gICAgICAgICAgICBpZiAobmV3Q29kZS5pbmNsdWRlcyhvcmlnaW5hbFBhdGgpKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uoc3RyaW5nUGF0dGVybiwgYCQxJHtuZXdQYXRofSQyYCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGMuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1NTZGRVx1NzI0N1x1NUYxNVx1NzUyOGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy5jc3MnKSAmJiAoYyBhcyBhbnkpLnNvdXJjZSkge1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgICAgIGxldCBuZXdTb3VyY2UgPSB0eXBlb2YgKGMgYXMgYW55KS5zb3VyY2UgPT09ICdzdHJpbmcnID8gKGMgYXMgYW55KS5zb3VyY2UgOiBCdWZmZXIuZnJvbSgoYyBhcyBhbnkpLnNvdXJjZSkudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgICAgICAgICAvLyBcdTk5OTZcdTUxNDhcdTU5MDRcdTc0MDZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdUZGMUFcdTY2RkZcdTYzNjJcdTRFM0FcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAgICAgICAgICBmb3IgKGNvbnN0IHJvb3RGaWxlIG9mIHJvb3RJbWFnZUZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCByb290UGF0aCA9IGAvJHtyb290RmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREIGFzc2V0cyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMDhWaXRlIFx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1NTkwNFx1NzQwNlx1OEZDN1x1RkYwQ1x1NkRGQlx1NTJBMFx1NEU4NiBoYXNoXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTY4M0NcdTVGMEZcdTUzRUZcdTgwRkRcdTY2MkZcdUZGMUEvYXNzZXRzL2xvZ2luX2N1dF9kYXJrLUNoS0Q1VXBvLnBuZyBcdTYyMTYgdXJsKC9hc3NldHMvbG9naW5fY3V0X2RhcmstQ2hLRDVVcG8ucG5nKVxuICAgICAgICAgICAgLy8gXHU5NzAwXHU4OTgxXHU1MzM5XHU5MTREXHU2NTg3XHU0RUY2XHU1NDBEXHU5MEU4XHU1MjA2XHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5KyBoYXNoICsgXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZVdpdGhvdXRFeHQgPSByb290RmlsZS5yZXBsYWNlKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnx3ZWJwfHN2Z3xpY28pJC9pLCAnJyk7XG4gICAgICAgICAgICBjb25zdCBmaWxlRXh0ID0gcm9vdEZpbGUubWF0Y2goL1xcLihwbmd8anBnfGpwZWd8Z2lmfHdlYnB8c3ZnfGljbykkL2kpPy5bMF0gfHwgJy5wbmcnO1xuICAgICAgICAgICAgLy8gXHU4RjZDXHU0RTQ5XHU3Mjc5XHU2QjhBXHU1QjU3XHU3QjI2XHVGRjBDXHU0RjQ2XHU0RkREXHU3NTU5XHU0RTBCXHU1MjEyXHU3RUJGXG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkRmlsZU5hbWUgPSBmaWxlTmFtZVdpdGhvdXRFeHQucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCAvYXNzZXRzL1x1NjU4N1x1NEVGNlx1NTQwRC1oYXNoLlx1NjI2OVx1NUM1NVx1NTQwRCBcdTY4M0NcdTVGMEZcdUZGMDhcdTU3MjggdXJsKCkgXHU0RTJEXHU2MjE2XHU3NkY0XHU2M0E1XHU1RjE1XHU3NTI4XHVGRjA5XG4gICAgICAgICAgICBjb25zdCBhc3NldHNQYXR0ZXJuID0gbmV3IFJlZ0V4cChgL2Fzc2V0cy8ke2VzY2FwZWRGaWxlTmFtZX0tW0EtWmEtejAtOV17NCx9JHtmaWxlRXh0LnJlcGxhY2UoJy4nLCAnXFxcXC4nKX1gLCAnZycpO1xuICAgICAgICAgICAgaWYgKGFzc2V0c1BhdHRlcm4udGVzdChuZXdTb3VyY2UpKSB7XG4gICAgICAgICAgICAgIG5ld1NvdXJjZSA9IG5ld1NvdXJjZS5yZXBsYWNlKGFzc2V0c1BhdHRlcm4sIHJvb3RQYXRoKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwIENTUyAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTVGMTVcdTc1Mjg6IC9hc3NldHMvJHtyb290RmlsZX0gLT4gJHtyb290UGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NEU1Rlx1NTMzOVx1OTE0RFx1NzZGNFx1NjNBNVx1NzY4NFx1NjgzOVx1OERFRlx1NUY4NFx1NUYxNVx1NzUyOFx1RkYwOFx1NURGMlx1N0VDRlx1NjYyRlx1NjgzOVx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NjUzOVx1RkYwOVxuICAgICAgICAgICAgY29uc3Qgcm9vdFBhdHRlcm4gPSBuZXcgUmVnRXhwKGB1cmxcXFxcKFtcIiddPyR7cm9vdFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKX0oXFxcXD9bXlwiJyldKik/W1wiJ10/XFxcXClgLCAnZycpO1xuICAgICAgICAgICAgaWYgKHJvb3RQYXR0ZXJuLnRlc3QobmV3U291cmNlKSkge1xuICAgICAgICAgICAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkZcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTY1MzlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTcxMzZcdTU0MEVcdTU5MDRcdTc0MDZcdTUxNzZcdTRFRDZcdTU2RkVcdTcyNDdcdUZGMDhcdTVFMjYgaGFzaCBcdTc2ODRcdUZGMDlcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHU0RTg2XG4gICAgICAgICAgICBpZiAocm9vdEltYWdlRmlsZXMuaW5jbHVkZXMob3JpZ2luYWxGaWxlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gYC8ke29yaWdpbmFsRmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBaGFzaGVkRmlsZSBcdTUzRUZcdTgwRkRcdTVERjJcdTdFQ0ZcdTUzMDVcdTU0MkIgYXNzZXRzLyBcdTUyNERcdTdGMDBcdUZGMENcdTk3MDBcdTg5ODFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBoYXNoZWRGaWxlLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSA/IGAvJHtoYXNoZWRGaWxlfWAgOiBgLyR7aGFzaGVkRmlsZX1gO1xuICAgICAgICAgICAgY29uc3QgZXNjYXBlZFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcblxuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1OTFBXHU3OUNEIFVSTCBcdTY4M0NcdTVGMEZcdUZGMUFcbiAgICAgICAgICAgIC8vIDEuIHVybCgvcGF0aCkgLSBcdTY1RTBcdTVGMTVcdTUzRjdcbiAgICAgICAgICAgIC8vIDIuIHVybChcIi9wYXRoXCIpIC0gXHU1M0NDXHU1RjE1XHU1M0Y3XG4gICAgICAgICAgICAvLyAzLiB1cmwoJy9wYXRoJykgLSBcdTUzNTVcdTVGMTVcdTUzRjdcbiAgICAgICAgICAgIC8vIDQuIHVybCgvcGF0aD9xdWVyeSkgLSBcdTVFMjZcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICAgICAgICAgIGNvbnN0IHVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGB1cmxcXFxcKCR7ZXNjYXBlZFBhdGh9KFxcXFw/W14pXSopP1xcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgdXJsXFxcXChbXCInXSR7ZXNjYXBlZFBhdGh9KFxcXFw/W15cIiddKik/W1wiJ11cXFxcKWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdXJsUGF0dGVybnMpIHtcbiAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChuZXdTb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgbmV3U291cmNlID0gbmV3U291cmNlLnJlcGxhY2UocGF0dGVybiwgKG1hdGNoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnlNYXRjaCA9IG1hdGNoLm1hdGNoKC8oXFw/W14pXSopLyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5TWF0Y2ggPyBxdWVyeU1hdGNoWzFdIDogJyc7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2gucmVwbGFjZShvcmlnaW5hbFBhdGgsIG5ld1BhdGgpLnJlcGxhY2UoL1xcP1teKV0qLywgcXVlcnkgPyBxdWVyeSA6ICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVERDA0IFx1NjZGNFx1NjVCMCBDU1MgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4OiAke29yaWdpbmFsUGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoYyBhcyBhbnkpLnNvdXJjZSA9IG5ld1NvdXJjZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKG9wdGlvbnM6IE91dHB1dE9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG91dHB1dERpciA9IG9wdGlvbnMuZGlyIHx8IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcpO1xuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5MERcdTUyMzZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTRFMERcdTRGN0ZcdTc1MjhcdTU0QzhcdTVFMENcdTUwM0NcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDlcbiAgICAgIGZvciAoY29uc3Qgcm9vdEZpbGUgb2Ygcm9vdEltYWdlRmlsZXMpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwdWJsaWNJbWFnZUZpbGVzLmdldChyb290RmlsZSk7XG4gICAgICAgIGlmIChmaWxlUGF0aCAmJiBleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVEZXN0ID0gam9pbihvdXRwdXREaXIsIHJvb3RGaWxlKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlRGVzdCwgZmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNzA1IFx1NURGMlx1NTkwRFx1NTIzNiAke3Jvb3RGaWxlfSBcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTU6ICR7ZmlsZURlc3R9YCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU1OTBEXHU1MjM2ICR7cm9vdEZpbGV9IFx1NTkzMVx1OEQyNTpgLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTkwRFx1NTIzNiBicmlkZ2UuaHRtbCBcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEVcdThERThcdTVCNTBcdTU3REZcdTkwMUFcdTRGRTFcdUZGMDlcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWJyaWRnZS5odG1sIFx1NUU5NFx1OEJFNVx1NTNFQVx1NTcyOCBtYWluLWFwcCBcdTRFMkRcdTVCNThcdTU3MjhcdUZGMENcdTU2RTBcdTRFM0FcdTYyNDBcdTY3MDlcdTVCNTBcdTVFOTRcdTc1MjhcdTkwRkRcdThCQkZcdTk1RUVcdTRFM0JcdTU3REZcdTc2ODQgYnJpZGdlLmh0bWxcbiAgICAgIGNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XG4gICAgICBjb25zdCBicmlkZ2VIdG1sUGF0aCA9IGpvaW4ocHVibGljRGlyLCAnYnJpZGdlLmh0bWwnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGJyaWRnZUh0bWxQYXRoKSkge1xuICAgICAgICBjb25zdCBicmlkZ2VIdG1sRGVzdCA9IGpvaW4ob3V0cHV0RGlyLCAnYnJpZGdlLmh0bWwnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhicmlkZ2VIdG1sUGF0aCk7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhicmlkZ2VIdG1sRGVzdCwgZmlsZUNvbnRlbnQpO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjcwNSBcdTVERjJcdTU5MERcdTUyMzYgYnJpZGdlLmh0bWwgXHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1OiAke2JyaWRnZUh0bWxEZXN0fWApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3NEMgXHU1OTBEXHU1MjM2IGJyaWRnZS5odG1sIFx1NTkzMVx1OEQyNTpgLCBlcnJvcik7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFx1NjI5Qlx1NTFGQVx1OTUxOVx1OEJFRlx1RkYwQ1x1Nzg2RVx1NEZERFx1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBicmlkZ2UuaHRtbCBcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY2MkYgbWFpbi1hcHBcdUZGMDhcdTVFOTRcdThCRTVcdTVCNThcdTU3MjhcdUZGMDlcbiAgICAgICAgY29uc3QgYXBwTmFtZSA9IGFwcERpci5zcGxpdCgvWy9cXFxcXS8pLnBvcCgpIHx8ICcnO1xuICAgICAgICBpZiAoYXBwTmFtZSA9PT0gJ21haW4tYXBwJykge1xuICAgICAgICAgIGxvZ2dlci53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBOiBtYWluLWFwcCBcdTc2ODQgcHVibGljL2JyaWRnZS5odG1sIFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwMWApO1xuICAgICAgICAgIGxvZ2dlci53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU4RkQ5XHU0RjFBXHU1QkZDXHU4MUY0XHU4REU4XHU1QjUwXHU1N0RGXHU5MDFBXHU0RkUxXHU1OTMxXHU4RDI1XHUzMDAyXHU4QkY3XHU3ODZFXHU0RkREIGJyaWRnZS5odG1sIFx1NUI1OFx1NTcyOFx1NEU4RSBwdWJsaWMgXHU3NkVFXHU1RjU1XHUzMDAyYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHU0RTBEXHU5NzAwXHU4OTgxIGJyaWRnZS5odG1sXHVGRjA4XHU1QjgzXHU0RUVDXHU4QkJGXHU5NUVFXHU0RTNCXHU1N0RGXHU3Njg0IGJyaWRnZS5odG1sXHVGRjA5XG4gICAgICB9XG5cbiAgICAgIGlmIChpbWFnZU1hcC5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYXNzZXRzRGlyUGF0aCA9IGpvaW4ob3V0cHV0RGlyLCAnYXNzZXRzJyk7XG5cbiAgICAgIGlmICghZXhpc3RzU3luYyhhc3NldHNEaXJQYXRoKSkge1xuICAgICAgICBta2RpclN5bmMoYXNzZXRzRGlyUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4SHRtbFBhdGggPSBqb2luKG91dHB1dERpciwgJ2luZGV4Lmh0bWwnKTtcblxuICAgICAgaWYgKGV4aXN0c1N5bmMoaW5kZXhIdG1sUGF0aCkpIHtcbiAgICAgICAgbGV0IGh0bWwgPSByZWFkRmlsZVN5bmMoaW5kZXhIdG1sUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgW29yaWdpbmFsRmlsZSwgaGFzaGVkRmlsZV0gb2YgaW1hZ2VNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2NTg3XHU0RUY2XHU1NDBEXG4gICAgICAgICAgaWYgKHJvb3RJbWFnZUZpbGVzLmluY2x1ZGVzKG9yaWdpbmFsRmlsZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IGAvJHtvcmlnaW5hbEZpbGV9YDtcbiAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC8ke2hhc2hlZEZpbGV9YDtcblxuICAgICAgICAgIGlmIChodG1sLmluY2x1ZGVzKG9yaWdpbmFsUGF0aCkpIHtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UobmV3IFJlZ0V4cChvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKSwgJ2cnKSwgbmV3UGF0aCk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4OiAke29yaWdpbmFsUGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgIHdyaXRlRmlsZVN5bmMoaW5kZXhIdG1sUGF0aCwgaHRtbCwgJ3V0Zi04Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYXNzZXRzRGlyID0gam9pbihvdXRwdXREaXIsICdhc3NldHMnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGFzc2V0c0RpcikpIHtcbiAgICAgICAgY29uc3QganNGaWxlcyA9IHJlYWRkaXJTeW5jKGFzc2V0c0RpcikuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzJykgfHwgZi5lbmRzV2l0aCgnLm1qcycpKTtcbiAgICAgICAgY29uc3QgY3NzRmlsZXMgPSByZWFkZGlyU3luYyhhc3NldHNEaXIpLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy5jc3MnKSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIFsuLi5qc0ZpbGVzLCAuLi5jc3NGaWxlc10pIHtcbiAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGpvaW4oYXNzZXRzRGlyLCBmaWxlKTtcbiAgICAgICAgICBsZXQgY29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTk5OTZcdTUxNDhcdTU5MDRcdTc0MDZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdUZGMUFcdTY2RkZcdTYzNjJcdTRFM0FcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAgICAgICAgICBmb3IgKGNvbnN0IHJvb3RGaWxlIG9mIHJvb3RJbWFnZUZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCByb290UGF0aCA9IGAvJHtyb290RmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREIGFzc2V0cyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMDhWaXRlIFx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1NTkwNFx1NzQwNlx1OEZDN1x1RkYwQ1x1NkRGQlx1NTJBMFx1NEU4NiBoYXNoXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTY4M0NcdTVGMEZcdTUzRUZcdTgwRkRcdTY2MkZcdUZGMUEvYXNzZXRzL2xvZ2luX2N1dF9kYXJrLUNoS0Q1VXBvLnBuZ1xuICAgICAgICAgICAgLy8gXHU5NzAwXHU4OTgxXHU1MzM5XHU5MTREXHU2NTg3XHU0RUY2XHU1NDBEXHU5MEU4XHU1MjA2XHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5KyBoYXNoICsgXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZVdpdGhvdXRFeHQgPSByb290RmlsZS5yZXBsYWNlKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnx3ZWJwfHN2Z3xpY28pJC9pLCAnJyk7XG4gICAgICAgICAgICBjb25zdCBmaWxlRXh0ID0gcm9vdEZpbGUubWF0Y2goL1xcLihwbmd8anBnfGpwZWd8Z2lmfHdlYnB8c3ZnfGljbykkL2kpPy5bMF0gfHwgJy5wbmcnO1xuICAgICAgICAgICAgLy8gXHU4RjZDXHU0RTQ5XHU3Mjc5XHU2QjhBXHU1QjU3XHU3QjI2XHVGRjBDXHU0RjQ2XHU0RkREXHU3NTU5XHU0RTBCXHU1MjEyXHU3RUJGXG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkRmlsZU5hbWUgPSBmaWxlTmFtZVdpdGhvdXRFeHQucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCAvYXNzZXRzL1x1NjU4N1x1NEVGNlx1NTQwRC1oYXNoLlx1NjI2OVx1NUM1NVx1NTQwRCBcdTY4M0NcdTVGMEZcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0c1BhdHRlcm4gPSBuZXcgUmVnRXhwKGAvYXNzZXRzLyR7ZXNjYXBlZEZpbGVOYW1lfS1bQS1aYS16MC05XXs0LH0ke2ZpbGVFeHQucmVwbGFjZSgnLicsICdcXFxcLicpfWAsICdnJyk7XG4gICAgICAgICAgICBpZiAoYXNzZXRzUGF0dGVybi50ZXN0KGNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoYXNzZXRzUGF0dGVybiwgcm9vdFBhdGgpO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1REQwNCBcdTY2RjRcdTY1QjAgJHtmaWxlfSBcdTRFMkRcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTVGMTVcdTc1Mjg6IC9hc3NldHMvJHtyb290RmlsZX0gLT4gJHtyb290UGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTcxMzZcdTU0MEVcdTU5MDRcdTc0MDZcdTUxNzZcdTRFRDZcdTU2RkVcdTcyNDdcdUZGMDhcdTVFMjYgaGFzaCBcdTc2ODRcdUZGMDlcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHU0RTg2XG4gICAgICAgICAgICBpZiAocm9vdEltYWdlRmlsZXMuaW5jbHVkZXMob3JpZ2luYWxGaWxlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gYC8ke29yaWdpbmFsRmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBaGFzaGVkRmlsZSBcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTU5ODIgYXNzZXRzL2xvZ2luX2N1dF9kYXJrLUNoS0Q1VXBvLnBuZ1x1RkYwOVxuICAgICAgICAgICAgLy8gXHU5NzAwXHU4OTgxXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU0RUU1IC8gXHU1RjAwXHU1OTM0XG4gICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gaGFzaGVkRmlsZS5zdGFydHNXaXRoKCdhc3NldHMvJykgPyBgLyR7aGFzaGVkRmlsZX1gIDogYC8ke2hhc2hlZEZpbGV9YDtcblxuICAgICAgICAgICAgY29uc3QgZXNjYXBlZFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTkxQVx1NzlDRFx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTMwNVx1NjJFQ1x1NUUyNlx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NzY4NFxuICAgICAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU1QjU3XHU3QjI2XHU0RTMyXHU2MkZDXHU2M0E1XHU5MDdGXHU1MTREXHU2QTIxXHU2NzdGXHU1QjU3XHU3QjI2XHU0RTMyXHU0RTJEXHU3Njg0XHU1M0NEXHU1RjE1XHU1M0Y3XHU4RjZDXHU0RTQ5XHU5NUVFXHU5ODk4XG4gICAgICAgICAgICBjb25zdCBiYWNrdGljayA9ICdgJztcbiAgICAgICAgICAgIGNvbnN0IHF1b3RlUGF0dGVybiA9ICdbXCJcXCcnICsgYmFja3RpY2sgKyAnXSc7XG4gICAgICAgICAgICBjb25zdCBuZWdhdGVkUXVvdGVQYXR0ZXJuID0gJ1teXCInICsgXCInXCIgKyBiYWNrdGljayArICddJztcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICAgICAgICBuZXcgUmVnRXhwKCcoJyArIHF1b3RlUGF0dGVybiArICcpJyArIGVzY2FwZWRQYXRoICsgJyhcXFxcPycgKyBuZWdhdGVkUXVvdGVQYXR0ZXJuICsgJyopPygnICsgcXVvdGVQYXR0ZXJuICsgJyknLCAnZycpLFxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGB1cmxcXFxcKCR7ZXNjYXBlZFBhdGh9KFxcXFw/W14pXSopP1xcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgdXJsXFxcXChbJ1wiXSR7ZXNjYXBlZFBhdGh9KFxcXFw/W15cIiddKik/WydcIl1cXFxcKWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChjb250ZW50KSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygndXJsJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKG1hdGNoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWVyeU1hdGNoID0gbWF0Y2gubWF0Y2goLyhcXD9bXildKikvKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBxdWVyeU1hdGNoID8gcXVlcnlNYXRjaFsxXSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2gucmVwbGFjZShvcmlnaW5hbFBhdGgsIG5ld1BhdGgpLnJlcGxhY2UoL1xcP1teKV0qLywgcXVlcnkgPyBxdWVyeSA6ICcnKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTVCRjlcdTRFOEVcdTVCNTdcdTdCMjZcdTRFMzJcdTVGMTVcdTc1MjhcdUZGMENcdTRFNUZcdTRGRERcdTc1NTlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTE6IHN0cmluZywgX3BhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcXVvdGUyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlMX0ke25ld1BhdGh9JHtxdWVyeSB8fCAnJ30ke3F1b3RlMn1gO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwICR7ZmlsZX0gXHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4OiAke29yaWdpbmFsUGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgaWYgKGltYWdlTWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvdXRwdXREaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnKTtcblxuICAgICAgZm9yIChjb25zdCBbb3JpZ2luYWxGaWxlLCBoYXNoZWRGaWxlXSBvZiBpbWFnZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1NzI4IGFzc2V0cyBcdTc2RUVcdTVGNTVcdTYyMTZcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gam9pbihvdXRwdXREaXIsIGhhc2hlZEZpbGUpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhleHBlY3RlZFBhdGgpKSB7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNzA1IFx1NjU4N1x1NEVGNlx1NURGMlx1NkI2M1x1Nzg2RVx1NzUxRlx1NjIxMDogJHtoYXNoZWRGaWxlfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVx1RkYwOFx1NTk4Mlx1Njc5QyBoYXNoZWRGaWxlIFx1NEUwRFx1NTMwNVx1NTQyQiBhc3NldHMvXHVGRjA5XG4gICAgICAgICAgY29uc3Qgcm9vdFBhdGggPSBoYXNoZWRGaWxlLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKVxuICAgICAgICAgICAgPyBqb2luKG91dHB1dERpciwgaGFzaGVkRmlsZS5yZXBsYWNlKCdhc3NldHMvJywgJycpKVxuICAgICAgICAgICAgOiBqb2luKG91dHB1dERpciwgaGFzaGVkRmlsZSk7XG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMocm9vdFBhdGgpKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgXHU2NTg3XHU0RUY2XHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1OiAke2hhc2hlZEZpbGUucmVwbGFjZSgnYXNzZXRzLycsICcnKX1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNkEwXHVGRTBGICBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3Mjg6ICR7aGFzaGVkRmlsZX0gKFx1NTM5Rlx1NTlDQlx1NjU4N1x1NEVGNjogJHtvcmlnaW5hbEZpbGV9KWApO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gICBcdTY4QzBcdTY3RTVcdThERUZcdTVGODQ6ICR7ZXhwZWN0ZWRQYXRofWApO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gICBcdTY4QzBcdTY3RTVcdThERUZcdTVGODQ6ICR7cm9vdFBhdGh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvbHZlLWxvZ28udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcmVzb2x2ZS1sb2dvLnRzXCI7LyoqXG4gKiBMb2dvIFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NjNEMlx1NEVGNlxuICogXHU3NTI4XHU0RThFXHU1NzI4XHU1QjUwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU4OUUzXHU2NzkwIC9sb2dvLnBuZyBcdThERUZcdTVGODRcbiAqIFx1NUY1MyBwdWJsaWNEaXIgXHU4OEFCXHU3OTgxXHU3NTI4XHU2NUY2XHVGRjBDXHU5NzAwXHU4OTgxXHU2MjRCXHU1MkE4XHU4OUUzXHU2NzkwIGxvZ28ucG5nIFx1NzY4NFx1OERFRlx1NUY4NFx1NUU3Nlx1NTkwRFx1NTIzNlx1NjU4N1x1NEVGNlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgY29weUZpbGVTeW5jLCBta2RpclN5bmMgfSBmcm9tICdub2RlOmZzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVMb2dvUGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgbGV0IHZpdGVDb25maWc6IFJlc29sdmVkQ29uZmlnIHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVzb2x2ZS1sb2dvJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG5cbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZykge1xuICAgICAgLy8gXHU1OTA0XHU3NDA2IC9sb2dvLnBuZyBcdTYyMTYgbG9nby5wbmcgXHU3Njg0XHU4OUUzXHU2NzkwXG4gICAgICBpZiAoaWQgPT09ICcvbG9nby5wbmcnIHx8IGlkID09PSAnbG9nby5wbmcnKSB7XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1x1ODNCN1x1NTNENiBsb2dvLnBuZ1xuICAgICAgICBjb25zdCBzaGFyZWRMb2dvUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvcHVibGljL2xvZ28ucG5nJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHNoYXJlZExvZ29QYXRoKSkge1xuICAgICAgICAgIHJldHVybiBzaGFyZWRMb2dvUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHU4M0I3XHU1M0Q2XHVGRjA4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU1M0VGXHU4MEZEXHU4RkQ4XHU2NzA5XHVGRjA5XG4gICAgICAgIGNvbnN0IGFwcExvZ29QYXRoID0gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMvbG9nby5wbmcnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYXBwTG9nb1BhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcExvZ29QYXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU5MEZEXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4RkQ0XHU1NkRFXHU4NjVBXHU2MkRGXHU2QTIxXHU1NzU3IElEXG4gICAgICAgIHJldHVybiBgXFwwbG9nby5wbmdgO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIGxvYWQoaWQ6IHN0cmluZykge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU4NjVBXHU2MkRGXHU2QTIxXHU1NzU3XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU1MTg1XHU1QkI5XHVGRjA4XHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHU0RjFBXHU1NzI4IGNsb3NlQnVuZGxlIFx1NjVGNlx1NTkwRFx1NTIzNlx1RkYwOVxuICAgICAgaWYgKGlkID09PSAnXFwwbG9nby5wbmcnKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NTcyOFx1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1NTQwRVx1NTkwRFx1NTIzNiBsb2dvLnBuZyBcdTUyMzAgZGlzdCBcdTc2RUVcdTVGNTVcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdml0ZUNvbmZpZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb3QgPSB2aXRlQ29uZmlnLnJvb3QgfHwgYXBwRGlyO1xuXG4gICAgICAgIC8vIFx1NEYxOFx1NTE0OFx1NEVDRVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1x1ODNCN1x1NTNENiBsb2dvLnBuZ1xuICAgICAgICBjb25zdCBzaGFyZWRMb2dvUGF0aCA9IHJlc29sdmUocm9vdCwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYy9sb2dvLnBuZycpO1xuICAgICAgICBsZXQgbG9nb1NvdXJjZVBhdGg6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmIChleGlzdHNTeW5jKHNoYXJlZExvZ29QYXRoKSkge1xuICAgICAgICAgIGxvZ29Tb3VyY2VQYXRoID0gc2hhcmVkTG9nb1BhdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU1RTk0XHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTgzQjdcdTUzRDZcbiAgICAgICAgICBjb25zdCBhcHBMb2dvUGF0aCA9IHJlc29sdmUocm9vdCwgJ3B1YmxpYy9sb2dvLnBuZycpO1xuICAgICAgICAgIGlmIChleGlzdHNTeW5jKGFwcExvZ29QYXRoKSkge1xuICAgICAgICAgICAgbG9nb1NvdXJjZVBhdGggPSBhcHBMb2dvUGF0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxvZ29Tb3VyY2VQYXRoKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBcdTU5ODJcdTY3OUNcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTk3NTlcdTlFRDhcdThERjNcdThGQzdcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1ODNCN1x1NTNENlx1Njc4NFx1NUVGQVx1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVxuICAgICAgICBjb25zdCBvdXREaXIgPSB2aXRlQ29uZmlnLmJ1aWxkLm91dERpciB8fCAnZGlzdCc7XG4gICAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKHJvb3QsIG91dERpcik7XG5cbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThERjNcdThGQzdcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvZ29EZXN0UGF0aCA9IHJlc29sdmUoZGlzdERpciwgJ2xvZ28ucG5nJyk7XG5cbiAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU2ODA3XHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XG4gICAgICAgIGNvbnN0IGRlc3REaXIgPSBkaXJuYW1lKGxvZ29EZXN0UGF0aCk7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhkZXN0RGlyKSkge1xuICAgICAgICAgIG1rZGlyU3luYyhkZXN0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTkwRFx1NTIzNlx1NjU4N1x1NEVGNlxuICAgICAgICBjb3B5RmlsZVN5bmMobG9nb1NvdXJjZVBhdGgsIGxvZ29EZXN0UGF0aCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNvcHktaWNvbnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY29weS1pY29ucy50c1wiOy8qKlxuICogXHU1OTBEXHU1MjM2IGljb25zIFx1NzZFRVx1NUY1NVx1NjNEMlx1NEVGNlxuICogXHU3NTI4XHU0RThFXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU1OTBEXHU1MjM2IHB1YmxpYy9pY29ucyBcdTc2RUVcdTVGNTVcdTUyMzAgZGlzdC9pY29uc1xuICogXHU0RTNCXHU4OTgxXHU3NTI4XHU0RThFIGFkbWluLWFwcFx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1OTcwMFx1ODk4MVx1NjYzRVx1NzkzQVx1NTZGRVx1NjgwN1x1NTE4NVx1NUJCOVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCBjb3B5RmlsZVN5bmMsIG1rZGlyU3luYywgcmVhZGRpclN5bmMsIHN0YXRTeW5jLCB3cml0ZUZpbGVTeW5jLCB1bmxpbmtTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5SWNvbnNQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgdml0ZUNvbmZpZzogUmVzb2x2ZWRDb25maWcgfCBudWxsID0gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3B5LWljb25zJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG5cbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdml0ZUNvbmZpZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb3QgPSB2aXRlQ29uZmlnLnJvb3QgfHwgYXBwRGlyO1xuICAgICAgICBjb25zdCBpY29uc1NvdXJjZURpciA9IHJlc29sdmUocm9vdCwgJ3B1YmxpYy9pY29ucycpO1xuXG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NkU5MFx1NzZFRVx1NUY1NVx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoaWNvbnNTb3VyY2VEaXIpKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBcdTU5ODJcdTY3OUNcdTZFOTBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTk3NTlcdTlFRDhcdThERjNcdThGQzdcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1ODNCN1x1NTNENlx1Njc4NFx1NUVGQVx1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVxuICAgICAgICBjb25zdCBvdXREaXIgPSB2aXRlQ29uZmlnLmJ1aWxkLm91dERpciB8fCAnZGlzdCc7XG4gICAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKHJvb3QsIG91dERpcik7XG5cbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThERjNcdThGQzdcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGljb25zRGVzdERpciA9IHJlc29sdmUoZGlzdERpciwgJ2ljb25zJyk7XG5cbiAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU2ODA3XHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhpY29uc0Rlc3REaXIpKSB7XG4gICAgICAgICAgbWtkaXJTeW5jKGljb25zRGVzdERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTU5MERcdTUyMzYgaWNvbnMgXHU3NkVFXHU1RjU1XHU0RTJEXHU3Njg0XHU2MjQwXHU2NzA5XHU2NTg3XHU0RUY2XG4gICAgICAgIGNvbnN0IGZpbGVzID0gcmVhZGRpclN5bmMoaWNvbnNTb3VyY2VEaXIpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gcmVzb2x2ZShpY29uc1NvdXJjZURpciwgZmlsZSk7XG4gICAgICAgICAgY29uc3QgZGVzdFBhdGggPSByZXNvbHZlKGljb25zRGVzdERpciwgZmlsZSk7XG5cbiAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKHNvdXJjZVBhdGgpO1xuICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgY29weUZpbGVTeW5jKHNvdXJjZVBhdGgsIGRlc3RQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTRFMERcdTUxOERcdTU5MERcdTUyMzYgZmF2aWNvbi5pY29cdUZGMENcdTdFREZcdTRFMDBcdTRGN0ZcdTc1MjggbG9nby5wbmcgXHU0RjVDXHU0RTNBIGZhdmljb25cbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHU1QjU4XHU1NzI4IGZhdmljb24uaWNvXHVGRjBDXHU1MjIwXHU5NjY0XHU1QjgzXHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGIFZpdGUgXHU3Njg0IHB1YmxpY0RpciBcdTU5MERcdTUyMzZcdTc2ODRcdUZGMDlcbiAgICAgICAgY29uc3QgZmF2aWNvbkRlc3QgPSByZXNvbHZlKGRpc3REaXIsICdmYXZpY29uLmljbycpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhmYXZpY29uRGVzdCkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdW5saW5rU3luYyhmYXZpY29uRGVzdCk7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgW2NvcHktaWNvbnNdIFx1NURGMlx1NTIyMFx1OTY2NFx1NEUwRFx1OTcwMFx1ODk4MVx1NzY4NCBmYXZpY29uLmljbzogJHtmYXZpY29uRGVzdH1gKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU1RTc2XHU1OTBEXHU1MjM2IHNpdGUud2VibWFuaWZlc3RcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcbiAgICAgICAgY29uc3QgbWFuaWZlc3RTb3VyY2UgPSByZXNvbHZlKHJvb3QsICdwdWJsaWMvaWNvbnMvc2l0ZS53ZWJtYW5pZmVzdCcpO1xuICAgICAgICBjb25zdCBtYW5pZmVzdERlc3QgPSByZXNvbHZlKGljb25zRGVzdERpciwgJ3NpdGUud2VibWFuaWZlc3QnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMobWFuaWZlc3RTb3VyY2UpKSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKG1hbmlmZXN0U291cmNlLCBtYW5pZmVzdERlc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRSBwdWJsaWMgXHU2ODM5XHU3NkVFXHU1RjU1XHU1OTBEXHU1MjM2XG4gICAgICAgICAgY29uc3QgbWFuaWZlc3RTb3VyY2VSb290ID0gcmVzb2x2ZShyb290LCAncHVibGljL3NpdGUud2VibWFuaWZlc3QnKTtcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhtYW5pZmVzdFNvdXJjZVJvb3QpKSB7XG4gICAgICAgICAgICBjb3B5RmlsZVN5bmMobWFuaWZlc3RTb3VyY2VSb290LCBtYW5pZmVzdERlc3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTkwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTc1MUZcdTYyMTBcdTRFMDBcdTRFMkFcdTU3RkFcdTY3MkNcdTc2ODQgc2l0ZS53ZWJtYW5pZmVzdFxuICAgICAgICAgICAgY29uc3QgbWFuaWZlc3QgPSB7XG4gICAgICAgICAgICAgIG5hbWU6ICdCVEMgU2hvcEZsb3cgQWRtaW4nLFxuICAgICAgICAgICAgICBzaG9ydF9uYW1lOiAnQlRDIEFkbWluJyxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCVEMgU2hvcEZsb3cgXHU3QkExXHU3NDA2XHU1RTk0XHU3NTI4JyxcbiAgICAgICAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICAgICAgICB0aGVtZV9jb2xvcjogJyM0MDQwNDAnLFxuICAgICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHNyYzogJy9pY29ucy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgc3JjOiAnL2ljb25zL2Zhdmljb24tMzJ4MzIucG5nJyxcbiAgICAgICAgICAgICAgICAgIHNpemVzOiAnMzJ4MzInLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvZmF2aWNvbi0xNngxNi5wbmcnLFxuICAgICAgICAgICAgICAgICAgc2l6ZXM6ICcxNngxNicsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMobWFuaWZlc3REZXN0LCBKU09OLnN0cmluZ2lmeShtYW5pZmVzdCwgbnVsbCwgMiksICd1dGYtOCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2dlci5pbmZvKGBbY29weS1pY29uc10gXHU1REYyXHU1OTBEXHU1MjM2IGljb25zIFx1NzZFRVx1NUY1NVx1NTIzMDogJHtpY29uc0Rlc3REaXJ9YCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1tjb3B5LWljb25zXSBcdTU5MERcdTUyMzYgaWNvbnMgXHU3NkVFXHU1RjU1XHU1OTMxXHU4RDI1OicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVwbG9hZC1pY29ucy10by1vc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWljb25zLXRvLW9zcy50c1wiOy8qKlxuICogXHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TUyBcdTc2ODQgVml0ZSBcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1NTQwRVx1RkYwQ1x1ODFFQVx1NTJBOFx1NEUwQVx1NEYyMFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NTIzMCBPU1NcdUZGMDhcdTU3RkFcdTRFOEVcdTY1ODdcdTRFRjZcdTYzMDdcdTdFQjlcdTc2ODRcdTU4OUVcdTkxQ0ZcdTRFMEFcdTRGMjBcdUZGMDlcbiAqL1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnQGJ0Yy9zaGFyZWQtY29yZSc7XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHJlc29sdmUoX19maWxlbmFtZSwgJy4uJyk7XG5jb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4nKTtcblxuZnVuY3Rpb24gdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpOiB2b2lkIHtcbiAgLy8gXHU1M0VBXHU1NzI4IFdpbmRvd3MgXHU0RTE0XHU3RjNBXHU1QzExXHU1MUVEXHU4QkMxXHU2NUY2XHU1QzFEXHU4QkQ1XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSByZXR1cm47XG4gIGlmIChwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCAmJiBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHJldHVybjtcblxuICB0cnkge1xuICAgIC8vIFx1OTAxQVx1OEZDNyBQb3dlclNoZWxsICsgQ3JlZGVudGlhbE1hbmFnZXIgXHU4QkZCXHU1M0Q2XHVGRjA4XHU0RTBEXHU4RjkzXHU1MUZBXHU2NjBFXHU2NTg3XHU1MjMwXHU2NUU1XHU1RkQ3XHVGRjA5XG4gICAgY29uc3QgcHMgPSBbXG4gICAgICBgJEVycm9yQWN0aW9uUHJlZmVyZW5jZT0nU3RvcCdgLFxuICAgICAgYEltcG9ydC1Nb2R1bGUgQ3JlZGVudGlhbE1hbmFnZXJgLFxuICAgICAgYCRpZD0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkJyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJHNlYz0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkU2VjcmV0JyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJG91dD1bcHNjdXN0b21vYmplY3RdQHsgaWQ9JGlkOyBzZWNyZXQ9JHNlYyB9IHwgQ29udmVydFRvLUpzb24gLUNvbXByZXNzYCxcbiAgICAgIGBXcml0ZS1PdXRwdXQgJG91dGAsXG4gICAgXS5qb2luKCc7ICcpO1xuXG4gICAgY29uc3QgcmF3ID0gZXhlY1N5bmMoYHBvd2Vyc2hlbGwgLU5vUHJvZmlsZSAtTm9uSW50ZXJhY3RpdmUgLUNvbW1hbmQgXCIke3BzLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsIHtcbiAgICAgIHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgJ2lnbm9yZSddLFxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGpzb25UZXh0ID0gKHJhdyB8fCAnJykudHJpbSgpO1xuICAgIGlmICghanNvblRleHQpIHJldHVybjtcblxuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIHsgaWQ/OiBzdHJpbmc7IHNlY3JldD86IHN0cmluZyB9O1xuICAgIGlmIChwYXJzZWQ/LmlkICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgPSBwYXJzZWQuaWQ7XG4gICAgaWYgKHBhcnNlZD8uc2VjcmV0ICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCA9IHBhcnNlZC5zZWNyZXQ7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYxQVx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1NkQ0MVx1N0EwQlxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRJY29uc1RvT3NzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3VwbG9hZC1pY29ucy10by1vc3MnLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIC8vIFZpdGUgXHU3Njg0IGlzUHJvZHVjdGlvbiBcdTY2MkZcdTY3MDBcdTUzRUZcdTk3NjBcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTkwN0ZcdTUxNEQgTk9ERV9FTlYgLyBERVYgXHU3QjQ5XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1NzI4IENJIFx1NEUyRFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gXHU1M0VBXHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTBBXHU0RjIwXG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbkJ1aWxkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gV2luZG93cyBcdTY3MkNcdTU3MzBcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTY3OUNcdTY3MkFcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkUgZW52Ly5lbnYub3NzXHVGRjBDXHU1QzFEXHU4QkQ1XHU0RUNFXHU1MUVEXHU4QkMxXHU3QkExXHU3NDA2XHU1NjY4XHU4QkZCXHU1M0Q2XG4gICAgICB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOSBPU1MgXHU5MTREXHU3RjZFXG4gICAgICBpZiAoIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEIHx8ICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU0RTBBXHU0RjIwXHVGRjBDYWxsLmJlbGxpcy5jb20uY24gXHU0RUUzXHU3NDA2XHU1MjMwIE9TUyBcdTVDMDZcdThGRDRcdTU2REUgTm9TdWNoS2V5XHVGRjA4bG9nby5wbmcgLyBpY29ucy8qXHVGRjA5XG4gICAgICAgIGxvZ2dlci53YXJuKCdbdXBsb2FkLWljb25zLXRvLW9zc10gXHUyNkEwXHVGRTBGICBcdThERjNcdThGQzdcdTRFMEFcdTRGMjBcdUZGMDhcdTY3MkFcdTkxNERcdTdGNkUgT1NTIFx1NTFFRFx1OEJDMVx1RkYwOVx1MzAwMlx1OEZEOVx1NEYxQVx1NUJGQ1x1ODFGNCBodHRwczovL2FsbC5iZWxsaXMuY29tLmNuL2xvZ28ucG5nIFx1OEZENFx1NTZERSBOb1N1Y2hLZXknKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggQ0kgXHU0RTJEXHU1RkM1XHU5ODdCXHU3QjQ5XHU1Rjg1XHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwXHVGRjBDXHU1NDI2XHU1MjE5XHU2Nzg0XHU1RUZBXHU4RkRCXHU3QTBCXHU5MDAwXHU1MUZBXHU0RjFBXHU3NkY0XHU2M0E1XHU3RUM4XHU2QjYyXHU1QjUwXHU4RkRCXHU3QTBCXHVGRjBDXHU1QkZDXHU4MUY0XHU2NTg3XHU0RUY2XHU2NzJBXHU0RTBBXHU0RjIwXG4gICAgICBjb25zdCB1cGxvYWRTY3JpcHQgPSByZXNvbHZlKHByb2plY3RSb290LCAnc2NyaXB0cy91cGxvYWQtaWNvbnMtdG8tb3NzLm1qcycpO1xuICAgICAgbG9nZ2VyLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdUQ4M0RcdURFODAgXHU1RjAwXHU1OUNCXHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TUy4uLicpO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVByb21pc2UsIHJlamVjdFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bignbm9kZScsIFt1cGxvYWRTY3JpcHRdLCB7XG4gICAgICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10gXHUyNzA1IFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMCcpO1xuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXHU5RUQ4XHU4QkE0XHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHVGRjFBbGF5b3V0LWFwcCBkaXN0IFx1OTFDQ1x1NEVDRFx1NjcwOSBpY29ucy9sb2dvIFx1NEY1Q1x1NEUzQVx1NjcyQ1x1NTczMFx1NTQwRVx1NTkwN1x1RkYwQ1x1OTA3Rlx1NTE0RCA0MDRcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1OTcwMFx1NEUyNVx1NjgzQ1x1NTkzMVx1OEQyNVx1RkYwOENJIFx1NUYzQVx1NTIzNlx1NEUwQVx1NEYyMFx1NjIxMFx1NTI5Rlx1RkYwOVx1RkYwQ1x1OEJCRVx1N0Y2RSBPU1NfVVBMT0FEX1NUUklDVD10cnVlXG4gICAgICAgICAgICBjb25zdCBzdHJpY3QgPSBwcm9jZXNzLmVudi5PU1NfVVBMT0FEX1NUUklDVCA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBbdXBsb2FkLWljb25zLXRvLW9zc10gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsb2dnZXIud2FybihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccmVwbGFjZS1pY29ucy13aXRoLWNkbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzXCI7LyoqXG4gKiBcdTVDMDYgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdTU2RkVcdTY4MDdcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcdTRFM0EgQ0ROIFVSTCBcdTc2ODQgVml0ZSBcdTYzRDJcdTRFRjZcbiAqIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOCBDRE5cdUZGMENcdTVGMDBcdTUzRDEvXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RkREXHU2MzAxXHU2NzJDXHU1NzMwXHU4REVGXHU1Rjg0XG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VJY29uc1dpdGhDZG5QbHVnaW4oKTogUGx1Z2luIHtcbiAgbGV0IGlzUHJvZHVjdGlvbkJ1aWxkID0gZmFsc2U7XG4gIGxldCBjYWNoZWRMb2dvQ2RuT2s6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXBsYWNlLWljb25zLXdpdGgtY2RuJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICBpc1Byb2R1Y3Rpb25CdWlsZCA9ICEhY29uZmlnLmlzUHJvZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NjZGRlx1NjM2Mlx1RkYwOFx1NEY3Rlx1NzUyOCBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb25cdUZGMENcdTkwN0ZcdTUxNEQgQ0kgXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbkJ1aWxkKSB7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBcdTVFRjZcdThGREZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNERcdTU3Mjggdml0ZS5jb25maWcudHMgXHU1MkEwXHU4RjdEXHU2NUY2XHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XG4gICAgICAgIGNvbnN0IHsgZ2V0RW52Q29uZmlnIH0gPSBhd2FpdCBpbXBvcnQoJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy91bmlmaWVkLWVudi1jb25maWcnKTtcbiAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gICAgICAgIGNvbnN0IGVudkNvbmZpZyA9IGdldEVudkNvbmZpZygpO1xuICAgICAgICBjb25zdCBjZG5VcmwgPSBlbnZDb25maWcuY2RuPy5zdGF0aWNBc3NldHNVcmw7XG5cbiAgICAgICAgaWYgKCFjZG5VcmwpIHtcbiAgICAgICAgICAvLyBcdTY3MkFcdTkxNERcdTdGNkUgQ0ROXHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2ODM3XG4gICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjZG5CYXNlID0gY2RuVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG5cbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RUM1XHU1RjUzIENETiBcdTRFMEFcdTc4NkVcdTVCOUVcdTVCNThcdTU3MjggbG9nby5wbmcgXHU2NUY2XHU2MjREXHU2NkZGXHU2MzYyXG4gICAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NEZERFx1NzU1OVx1NjcyQ1x1NTczMCAvbG9nby5wbmdcdUZGMENcdTVFNzZcdTRGOURcdThENTZcdTVCNTBcdTVFOTRcdTc1MjggZGlzdC9sb2dvLnBuZyBcdTRGNUNcdTRFM0FcdTU0MEVcdTU5MDdcdUZGMENcdTkwN0ZcdTUxNEQgNDA0XG4gICAgICAgIGlmIChjYWNoZWRMb2dvQ2RuT2sgPT09IG51bGwpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Y2RuQmFzZX0vbG9nby5wbmdgLCB7IG1ldGhvZDogJ0hFQUQnLCByZWRpcmVjdDogJ2ZvbGxvdycgfSk7XG4gICAgICAgICAgICBjYWNoZWRMb2dvQ2RuT2sgPSAhIXJlcy5vaztcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGNhY2hlZExvZ29DZG5PayA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFxuICAgICAgICBsZXQgbmV3SHRtbCA9IGh0bWw7XG5cbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyIC9sb2dvLnBuZ1xuICAgICAgICBpZiAoY2FjaGVkTG9nb0Nkbk9rKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC9ocmVmPVtcIiddXFwvbG9nb1xcLnBuZ1tcIiddL2csXG4gICAgICAgICAgICBgaHJlZj1cIiR7Y2RuQmFzZX0vbG9nby5wbmdcImBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyIC9pY29ucy8gXHU4REVGXHU1Rjg0XG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2hyZWY9W1wiJ11cXC9pY29uc1xcLyhbXlwiJ10rKVtcIiddL2csXG4gICAgICAgICAgKG1hdGNoLCBpY29uRmlsZSkgPT4ge1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBc2l0ZS53ZWJtYW5pZmVzdCBcdTVGQzVcdTk4N0JcdTRGRERcdTYzMDFcdTU0MENcdTZFOTBcdUZGMDhcdTc1MzFcdTU0MDRcdTVCNTBcdTVFOTRcdTc1MjhcdTgxRUFcdThFQUJcdTYzRDBcdTRGOUJcdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdUZGMUFcbiAgICAgICAgICAgIC8vIC0gXHU0RjFBXHU4OUU2XHU1M0QxXHU4REU4XHU1N0RGL0NPUlNcbiAgICAgICAgICAgIC8vIC0gUFdBIHN0YXJ0X3VybCBcdTRGMUFcdTRFRTUgQ0ROIFx1NTdERlx1NTQwRFx1NEUzQVx1NTdGQVx1NTFDNlx1RkYwQ1x1NUJGQ1x1ODFGNFx1NUI4OVx1ODhDNS9cdTU0MkZcdTUyQThcdTg4NENcdTRFM0FcdTk1MTlcdThCRUZcbiAgICAgICAgICAgIGlmIChpY29uRmlsZSA9PT0gJ3NpdGUud2VibWFuaWZlc3QnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgaHJlZj1cIiR7Y2RuQmFzZX0vaWNvbnMvJHtpY29uRmlsZX1cImA7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBuZXdIdG1sO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXHU1OTMxXHU4RDI1XHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2ODM3XG4gICAgICAgIGxvZ2dlci53YXJuKCdbcmVwbGFjZS1pY29ucy13aXRoLWNkbl0gXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXHU1OTMxXHU4RDI1XHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU1NkZFXHU2ODA3XHU4REVGXHU1Rjg0OicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxkdXR5LXN0YXRpYy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9kdXR5LXN0YXRpYy50c1wiOy8qKlxuICogRHV0eSBcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1NUM0Mlx1OTc2Mlx1NjJFNlx1NjIyQSAvZHV0eS8gXHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFIHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTk3NTlcdTYwMDEgSFRNTCBcdTY1ODdcdTRFRjZcbiAqIFx1OTA3Rlx1NTE0RFx1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlx1ODhBQiBWdWUgUm91dGVyIFx1NTkwNFx1NzQwNlxuICogXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU1QzA2IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgSFRNTFx1MzAwMUNTU1x1MzAwMUpTIFx1NjU4N1x1NEVGNlx1NTkwRFx1NTIzNlx1NTIzMCBkaXN0L2R1dHkvIFx1NzZFRVx1NUY1NVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYywgZXhpc3RzU3luYywgcmVhZGRpclN5bmMsIHN0YXRTeW5jLCBjb3B5RmlsZVN5bmMsIG1rZGlyU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGpvaW4sIHJlc29sdmUsIGV4dG5hbWUgfSBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBEdXR5IFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGR1dHlTdGF0aWNQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgdml0ZUNvbmZpZzogUmVzb2x2ZWRDb25maWcgfCBudWxsID0gbnVsbDtcblxuICBjb25zdCBkdXR5TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiAvZHV0eS8gXHU4REVGXHU1Rjg0XHU3Njg0XHU4QkY3XHU2QzQyXG4gICAgaWYgKCFyZXEudXJsIHx8ICFyZXEudXJsLnN0YXJ0c1dpdGgoJy9kdXR5LycpKSB7XG4gICAgICBuZXh0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2M0QwXHU1M0Q2XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjBDXHU0RjhCXHU1OTgyIC9kdXR5L2FncmVlbWVudC5odG1sIC0+IGFncmVlbWVudC5odG1sXG4gICAgY29uc3QgZmlsZU5hbWUgPSByZXEudXJsLnJlcGxhY2UoJy9kdXR5LycsICcnKTtcblxuICAgIC8vIFx1Njc4NFx1NUVGQVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYxQXB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBwdWJsaWNEaXIgPSByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihwdWJsaWNEaXIsIGZpbGVOYW1lKTtcblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGlmICghZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgIC8vIFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1N0VFN1x1N0VFRFx1NEUwQlx1NEUwMFx1NEUyQVx1NEUyRFx1OTVGNFx1NEVGNlx1RkYwOFx1NTNFRlx1ODBGRFx1NEYxQVx1ODhBQiBWdWUgUm91dGVyIFx1NTkwNFx1NzQwNlx1NjIxNlx1OEZENFx1NTZERSA0MDRcdUZGMDlcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTZCNjNcdTc4NkVcdTc2ODQgQ29udGVudC1UeXBlXG4gICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy5odG1sJykpIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgfSBlbHNlIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgfSBlbHNlIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmpzJykpIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4RkQ0XHU1NkRFXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5lbmQoZmlsZUNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjVcdUZGMENcdTdFRTdcdTdFRURcdTRFMEJcdTRFMDBcdTRFMkFcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgIGxvZ2dlci5lcnJvcignW2R1dHktc3RhdGljXSBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjU6JywgZmlsZVBhdGgsIGVycm9yKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZHV0eS1zdGF0aWMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLCAvLyBcdTU3MjhcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdTYyNjdcdTg4NENcdUZGMENcdTc4NkVcdTRGRERcdTU3MjggVnVlIFJvdXRlciBcdTRFNEJcdTUyNERcdTU5MDRcdTc0MDZcbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgLy8gXHU0RjdGXHU3NTI4IHVzZSBcdTZERkJcdTUyQTBcdTRFMkRcdTk1RjRcdTRFRjZcdUZGMENcdTc1MzFcdTRFOEUgZW5mb3JjZTogJ3ByZSdcdUZGMENcdThGRDlcdTRGMUFcdTU3MjggVnVlIFx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShkdXR5TWlkZGxld2FyZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU0RTVGXHU0RjdGXHU3NTI4XHU3NkY4XHU1NDBDXHU3Njg0XHU5MDNCXHU4RjkxXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGR1dHlNaWRkbGV3YXJlKTtcbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKCkge1xuICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU1QzA2IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgSFRNTFx1MzAwMUNTU1x1MzAwMUpTIFx1NjU4N1x1NEVGNlx1NTkwRFx1NTIzNlx1NTIzMCBkaXN0L2R1dHkvIFx1NzZFRVx1NUY1NVxuICAgICAgaWYgKCF2aXRlQ29uZmlnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMnKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhwdWJsaWNEaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0RGlyID0gdml0ZUNvbmZpZy5idWlsZC5vdXREaXIgfHwgJ2Rpc3QnO1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCBvdXREaXIpO1xuICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHV0eURpciA9IHJlc29sdmUoZGlzdERpciwgJ2R1dHknKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhkdXR5RGlyKSkge1xuICAgICAgICBta2RpclN5bmMoZHV0eURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OTcwMFx1ODk4MVx1NTkwRFx1NTIzNlx1NzY4NFx1NjU4N1x1NEVGNlx1N0M3Qlx1NTc4Qlx1RkYwOFx1NjM5Mlx1OTY2NFx1NTZGRVx1NzI0N1x1RkYwQ1x1NTZGRVx1NzI0N1x1NzUzMSBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgIGNvbnN0IGR1dHlGaWxlRXh0ZW5zaW9ucyA9IFsnLmh0bWwnLCAnLmNzcycsICcuanMnXTtcbiAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NzY4NFx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYwOFx1NTZGRVx1NzI0N1x1NjU4N1x1NEVGNlx1NzUzMVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlx1RkYwOVxuICAgICAgY29uc3QgZXhjbHVkZWRGaWxlcyA9IFsnbG9nby5wbmcnLCAnbG9naW5fY3V0X2RhcmsucG5nJywgJ2xvZ2luX2N1dF9saWdodC5wbmcnLCAnc2Nhbi5wbmcnLCAnZmF2aWNvbi5pY28nXTtcblxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU2OEMwXHU2RDRCIHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODQgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCAzLnggXHU3QTMzXHU1QjlBXHU3MjQ4XHU2NzJDXHVGRjA5XG4gICAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHB1YmxpY0Rpcik7XG4gICAgICBsZXQganF1ZXJ5RmlsZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICBjb25zdCBqcXVlcnlGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgLy8gXHU2NTM2XHU5NkM2XHU2MjQwXHU2NzA5IGpRdWVyeSBcdTY1ODdcdTRFRjZcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCdqcXVlcnknKSAmJiBmaWxlLmVuZHNXaXRoKCcubWluLmpzJykpIHtcbiAgICAgICAgICBqcXVlcnlGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NEYxOFx1NTE0OFx1OTAwOVx1NjJFOSAzLnggXHU3MjQ4XHU2NzJDXHVGRjA4XHU3QTMzXHU1QjlBXHU3MjQ4XHVGRjA5XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU5MDA5XHU2MkU5XHU3QjJDXHU0RTAwXHU0RTJBXG4gICAgICBpZiAoanF1ZXJ5RmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzdGFibGVWZXJzaW9uID0ganF1ZXJ5RmlsZXMuZmluZChmID0+IGYuaW5jbHVkZXMoJ2pxdWVyeS0zLicpKTtcbiAgICAgICAganF1ZXJ5RmlsZSA9IChzdGFibGVWZXJzaW9uIHx8IGpxdWVyeUZpbGVzWzBdKSA/PyBudWxsO1xuICAgICAgICBpZiAoanF1ZXJ5RmlsZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBbZHV0eS1zdGF0aWNdIFx1RDgzRFx1RENDQiBcdTYyN0VcdTUyMzBcdTU5MUFcdTRFMkEgalF1ZXJ5IFx1NjU4N1x1NEVGNjogJHtqcXVlcnlGaWxlcy5qb2luKCcsICcpfWApO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBbZHV0eS1zdGF0aWNdIFx1RDgzRFx1RENDQyBcdTRGN0ZcdTc1Mjg6ICR7anF1ZXJ5RmlsZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MERcdTUyMzYgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICAgICAgaWYgKGpxdWVyeUZpbGUpIHtcbiAgICAgICAgY29uc3QganF1ZXJ5U291cmNlUGF0aCA9IHJlc29sdmUocHVibGljRGlyLCBqcXVlcnlGaWxlKTtcbiAgICAgICAgY29uc3QganF1ZXJ5RGVzdFBhdGggPSByZXNvbHZlKGR1dHlEaXIsIGpxdWVyeUZpbGUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvcHlGaWxlU3luYyhqcXVlcnlTb3VyY2VQYXRoLCBqcXVlcnlEZXN0UGF0aCk7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYFtkdXR5LXN0YXRpY10gXHVEODNEXHVEQ0U2IFx1NURGMlx1NTkwRFx1NTIzNiAke2pxdWVyeUZpbGV9IFx1NTIzMCBkaXN0L2R1dHkvYCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGBbZHV0eS1zdGF0aWNdIFx1MjZBMFx1RkUwRiAgXHU1OTBEXHU1MjM2IGpRdWVyeSBcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjU6YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIud2FybihgW2R1dHktc3RhdGljXSBcdTI2QTBcdUZFMEYgIFx1OEI2Nlx1NTQ0QTogXHU2NzJBXHU2MjdFXHU1MjMwIGpRdWVyeSBcdTY1ODdcdTRFRjZcdUZGMDhqcXVlcnkqLm1pbi5qc1x1RkYwOVx1NTcyOCBwdWJsaWMgXHU3NkVFXHU1RjU1YCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBjb3BpZWRDb3VudCA9IDA7XG5cbiAgICAgIC8vIFx1NTE4RFx1NkIyMVx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYwQ1x1NzUyOFx1NEU4RVx1NTkwRFx1NTIzNlx1NTE3Nlx1NEVENlx1NjU4N1x1NEVGNlx1RkYwOFx1NEUwRFx1NTMwNVx1NjJFQ2pRdWVyeVx1RkYwQ1x1NTZFMFx1NEUzQVx1NURGMlx1N0VDRlx1NTkwRFx1NTIzNlx1OEZDN1x1NEU4Nlx1RkYwOVxuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgIC8vIFx1OERGM1x1OEZDN1x1NjM5Mlx1OTY2NFx1NzY4NFx1NjU4N1x1NEVGNlxuICAgICAgICBpZiAoZXhjbHVkZWRGaWxlcy5pbmNsdWRlcyhmaWxlKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU4REYzXHU4RkM3IGpRdWVyeSBcdTY1ODdcdTRFRjZcdUZGMDhcdTVERjJcdTdFQ0ZcdTU3MjhcdTRFMEFcdTk3NjJcdTUzNTVcdTcyRUNcdTU5MDRcdTc0MDZcdTRFODZcdUZGMDlcbiAgICAgICAgaWYgKGpxdWVyeUZpbGUgJiYgZmlsZSA9PT0ganF1ZXJ5RmlsZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXh0ID0gZXh0bmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoZHV0eUZpbGVFeHRlbnNpb25zLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gcmVzb2x2ZShwdWJsaWNEaXIsIGZpbGUpO1xuICAgICAgICAgIGNvbnN0IGRlc3RQYXRoID0gcmVzb2x2ZShkdXR5RGlyLCBmaWxlKTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKHNvdXJjZVBhdGgpO1xuICAgICAgICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NUJGOVx1NEU4RUhUTUxcdTY1ODdcdTRFRjZcdUZGMENcdTk3MDBcdTg5ODFcdTY2RkZcdTYzNjJcdTUxNzZcdTRFMkRcdTc2ODRDU1NcdTU0OENKU1x1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBpZiAoZXh0ID09PSAnLmh0bWwnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoc291cmNlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgICAgLy8gXHU2NkZGXHU2MzYyIGpRdWVyeSBDRE4gXHU4REVGXHU1Rjg0XHU0RTNBXHU2NzJDXHU1NzMwXHU4REVGXHU1Rjg0XHVGRjA4XHU2NTJGXHU2MzAxXHU0RUZCXHU2MTBGXHU3MjQ4XHU2NzJDXHU3Njg0alF1ZXJ5IENETlx1OTRGRVx1NjNBNVx1RkYwOVxuICAgICAgICAgICAgICAgIGlmIChqcXVlcnlGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjJcdTU0MDRcdTc5Q0RcdTUzRUZcdTgwRkRcdTc2ODQgalF1ZXJ5IENETiBcdTk0RkVcdTYzQTVcdTY4M0NcdTVGMEZcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC9odHRwczpcXC9cXC9jb2RlXFwuanF1ZXJ5XFwuY29tXFwvanF1ZXJ5LVteXCInXFxzXStcXC5taW5cXC5qcy9nLFxuICAgICAgICAgICAgICAgICAgICBgL2R1dHkvJHtqcXVlcnlGaWxlfWBcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAvLyBcdTRFNUZcdTY2RkZcdTYzNjJcdTUxNzZcdTRFRDZcdTUzRUZcdTgwRkRcdTc2ODQgQ0ROIFx1OTRGRVx1NjNBNVx1NjgzQ1x1NUYwRlxuICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL2h0dHBzPzpcXC9cXC9bXlwiJ1xcc10qanF1ZXJ5W15cIidcXHNdKlxcLm1pblxcLmpzL2csXG4gICAgICAgICAgICAgICAgICAgIGAvZHV0eS8ke2pxdWVyeUZpbGV9YFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gXHU2NkZGXHU2MzYyIENTUyBcdThERUZcdTVGODRcdUZGMUEvaW5kZXguY3NzIC0+IC9kdXR5L2luZGV4LmNzc1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2hyZWY9W1wiJ11cXC9pbmRleFxcLmNzc1tcIiddL2csICdocmVmPVwiL2R1dHkvaW5kZXguY3NzXCInKTtcbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgSlMgXHU4REVGXHU1Rjg0XHVGRjFBL2luZGV4LmpzIC0+IC9kdXR5L2luZGV4LmpzXG4gICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvc3JjPVtcIiddXFwvaW5kZXhcXC5qc1tcIiddL2csICdzcmM9XCIvZHV0eS9pbmRleC5qc1wiJyk7XG4gICAgICAgICAgICAgICAgLy8gXHU2NkZGXHU2MzYyIGxvZ28gXHU4REVGXHU1Rjg0XHVGRjFBL2xvZ28ucG5nIC0+IC9sb2dvLnBuZyAoXHU0RkREXHU2MzAxXHU2ODM5XHU4REVGXHU1Rjg0XHVGRjBDXHU1NkUwXHU0RTNBbG9nb1x1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NSlcbiAgICAgICAgICAgICAgICAvLyBsb2dvLnBuZyBcdTc1MzEgcHVibGljSW1hZ2VzVG9Bc3NldHNQbHVnaW4gXHU1OTA0XHU3NDA2XHVGRjBDXHU0RkREXHU2MzAxXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHVGRjBDXHU2MjQwXHU0RUU1XHU0RTBEXHU5NzAwXHU4OTgxXHU0RkVFXHU2NTM5XG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhkZXN0UGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ1NTIFx1NTQ4QyBKUyBcdTY1ODdcdTRFRjZcdTc2RjRcdTYzQTVcdTU5MERcdTUyMzZcbiAgICAgICAgICAgICAgICBjb3B5RmlsZVN5bmMoc291cmNlUGF0aCwgZGVzdFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvcGllZENvdW50Kys7XG4gICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBbZHV0eS1zdGF0aWNdIFx1RDgzRFx1RENFNiBcdTVERjJcdTU5MERcdTUyMzYgJHtmaWxlfSBcdTUyMzAgZGlzdC9kdXR5L2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFtkdXR5LXN0YXRpY10gXHUyNkEwXHVGRTBGICBcdTU5MERcdTUyMzZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUgJHtmaWxlfTpgLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjb3BpZWRDb3VudCA+IDApIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFtkdXR5LXN0YXRpY10gXHUyNzA1IFx1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1RkYxQVx1NURGMlx1NTkwRFx1NTIzNiAke2NvcGllZENvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjZcdTUyMzAgZGlzdC9kdXR5L2ApO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGxvY2FsZXMtc3RhdGljLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2xvY2FsZXMtc3RhdGljLnRzXCI7LyoqXG4gKiBMb2NhbGVzIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU1QzQyXHU5NzYyXHU2M0QwXHU0RjlCIHNyYy9sb2NhbGVzLyouanNvbiBcdTY1ODdcdTRFRjZcdUZGMENcdTRGOUJcdTRFM0JcdTVFOTRcdTc1MjhcdTkwMUFcdThGQzcgZmV0Y2ggXHU1MkEwXHU4RjdEXG4gKi9cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIExvY2FsZXMgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9jYWxlc1N0YXRpY1BsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGxvY2FsZXNNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJyAmJiByZXEudXJsPy5tYXRjaCgvXlxcL3NyY1xcL2xvY2FsZXNcXC9bXi9dK1xcLmpzb24kLykpIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUnKTtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiBHRVQgXHU4QkY3XHU2QzQyXHU1NDhDIC9zcmMvbG9jYWxlcy8qLmpzb24gXHU4REVGXHU1Rjg0XG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnIHx8ICFyZXEudXJsIHx8ICFyZXEudXJsLm1hdGNoKC9eXFwvc3JjXFwvbG9jYWxlc1xcL1teL10rXFwuanNvbiQvKSkge1xuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjNEMFx1NTNENlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwQ1x1NEY4Qlx1NTk4MiAvc3JjL2xvY2FsZXMvemgtQ04uanNvbiAtPiBzcmMvbG9jYWxlcy96aC1DTi5qc29uXG4gICAgY29uc3QgZmlsZVBhdGggPSByZXEudXJsLnJlcGxhY2UoL15cXC8vLCAnJyk7XG5cbiAgICAvLyBcdTY3ODRcdTVFRkFcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCBmaWxlUGF0aCk7XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBpZiAoIWV4aXN0c1N5bmMoZnVsbFBhdGgpKSB7XG4gICAgICAvLyBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThCQjBcdTVGNTVcdThCNjZcdTU0NEFcdTVFNzZcdTdFRTdcdTdFRURcdTRFMEJcdTRFMDBcdTRFMkFcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgIGxvZ2dlci53YXJuKGBbbG9jYWxlcy1zdGF0aWNdIEZpbGUgbm90IGZvdW5kOiAke2Z1bGxQYXRofSAocmVxdWVzdGVkOiAke3JlcS51cmx9KWApO1xuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKTtcblxuICAgICAgLy8gXHU4QkJFXHU3RjZFXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgICAvLyBcdThGRDRcdTU2REVcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLmVuZChjb250ZW50KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1XHVGRjBDXHU3RUU3XHU3RUVEXHU0RTBCXHU0RTAwXHU0RTJBXHU0RTJEXHU5NUY0XHU0RUY2XG4gICAgICBsb2dnZXIud2FybihgW2xvY2FsZXMtc3RhdGljXSBGYWlsZWQgdG8gcmVhZCBmaWxlOiAke2Z1bGxQYXRofWAsIGVycm9yKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tbG9jYWxlcy1zdGF0aWMnLFxuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG5cbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICAvLyBcdTU3MjggVml0ZSBcdTUxODVcdTkwRThcdTRFMkRcdTk1RjRcdTRFRjZcdTRFNEJcdTUyNERcdTYyRTZcdTYyMkFcdThCRjdcdTZDNDJcdUZGMENcdTYzRDBcdTRGOUIgbG9jYWxlcyBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NEY3Rlx1NzUyOCB1c2UgXHU1QzA2XHU0RTJEXHU5NUY0XHU0RUY2XHU2REZCXHU1MkEwXHU1MjMwXHU0RTJEXHU5NUY0XHU0RUY2XHU2ODA4XHVGRjBDVml0ZSBcdTRGMUFcdTYzMDlcdTcxNjdcdTZDRThcdTUxOENcdTk4N0FcdTVFOEZcdTYyNjdcdTg4NENcbiAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1OTcwMFx1ODk4MVx1NTcyOCBTUEEgZmFsbGJhY2sgXHU0RTRCXHU1MjREXHU1OTA0XHU3NDA2XHVGRjBDXHU2MjQwXHU0RUU1XHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IHVzZVxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShsb2NhbGVzTWlkZGxld2FyZSk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cGxvYWQtY2RuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHNcIjsvKipcbiAqIFx1NEUwQVx1NEYyMFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NTIzMCBDRE4gXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdUZGMENcdTgxRUFcdTUyQThcdTRFMEFcdTRGMjBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTUyMzAgT1NTL0NETlx1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcbmNvbnN0IHByb2plY3RSb290ID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLicpO1xuXG5mdW5jdGlvbiB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk6IHZvaWQge1xuICAvLyBcdTUzRUFcdTU3MjggV2luZG93cyBcdTRFMTRcdTdGM0FcdTVDMTFcdTUxRURcdThCQzFcdTY1RjZcdTVDMURcdThCRDVcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHJldHVybjtcbiAgaWYgKHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEICYmIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgLy8gXHU5MDFBXHU4RkM3IFBvd2VyU2hlbGwgKyBDcmVkZW50aWFsTWFuYWdlciBcdThCRkJcdTUzRDZcdUZGMDhcdTRFMERcdThGOTNcdTUxRkFcdTY2MEVcdTY1ODdcdTUyMzBcdTY1RTVcdTVGRDdcdUZGMDlcbiAgICBjb25zdCBwcyA9IFtcbiAgICAgIGAkRXJyb3JBY3Rpb25QcmVmZXJlbmNlPSdTdG9wJ2AsXG4gICAgICBgSW1wb3J0LU1vZHVsZSBDcmVkZW50aWFsTWFuYWdlcmAsXG4gICAgICBgJGlkPShHZXQtU3RvcmVkQ3JlZGVudGlhbCAtVGFyZ2V0ICdBbGliYWJhQ2xvdWQnIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlKS5HZXROZXR3b3JrQ3JlZGVudGlhbCgpLlBhc3N3b3JkYCxcbiAgICAgIGAkc2VjPShHZXQtU3RvcmVkQ3JlZGVudGlhbCAtVGFyZ2V0ICdBbGliYWJhQ2xvdWRTZWNyZXQnIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlKS5HZXROZXR3b3JrQ3JlZGVudGlhbCgpLlBhc3N3b3JkYCxcbiAgICAgIGAkb3V0PVtwc2N1c3RvbW9iamVjdF1AeyBpZD0kaWQ7IHNlY3JldD0kc2VjIH0gfCBDb252ZXJ0VG8tSnNvbiAtQ29tcHJlc3NgLFxuICAgICAgYFdyaXRlLU91dHB1dCAkb3V0YCxcbiAgICBdLmpvaW4oJzsgJyk7XG5cbiAgICBjb25zdCByYXcgPSBleGVjU3luYyhgcG93ZXJzaGVsbCAtTm9Qcm9maWxlIC1Ob25JbnRlcmFjdGl2ZSAtQ29tbWFuZCBcIiR7cHMucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpfVwiYCwge1xuICAgICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCAnaWdub3JlJ10sXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgY29uc3QganNvblRleHQgPSAocmF3IHx8ICcnKS50cmltKCk7XG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uVGV4dCkgYXMgeyBpZD86IHN0cmluZzsgc2VjcmV0Pzogc3RyaW5nIH07XG4gICAgaWYgKHBhcnNlZD8uaWQgJiYgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCA9IHBhcnNlZC5pZDtcbiAgICBpZiAocGFyc2VkPy5zZWNyZXQgJiYgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUID0gcGFyc2VkLnNlY3JldDtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XHVGRjFBXHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHU2RDQxXHU3QTBCXG4gIH1cbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQ0ROIFx1NEUwQVx1NEYyMFx1NjNEMlx1NEVGNlxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdzeXN0ZW0tYXBwJ1x1RkYwOVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZENkblBsdWdpbihhcHBOYW1lOiBzdHJpbmcsIF9hcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3VwbG9hZC1jZG4nLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIC8vIFZpdGUgXHU3Njg0IGlzUHJvZHVjdGlvbiBcdTY2MkZcdTY3MDBcdTUzRUZcdTk3NjBcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTkwN0ZcdTUxNEQgTk9ERV9FTlYgLyBERVYgXHU3QjQ5XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1NzI4IENJIFx1NEUyRFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTRFMEFcdTRGMjBcbiAgICAgIGlmIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX1VQTE9BRCAhPT0gJ3RydWUnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU4REYzXHU4RkM3XHU0RTBBXHU0RjIwXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuU0tJUF9DRE5fVVBMT0FEID09PSAndHJ1ZScpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFt1cGxvYWQtY2RuXSBcdTIzRURcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4U0tJUF9DRE5fVVBMT0FEPXRydWVcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTRFMEFcdTRGMjBcbiAgICAgIGlmICghaXNQcm9kdWN0aW9uQnVpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXaW5kb3dzIFx1NjcyQ1x1NTczMFx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NjcyQVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBlbnYvLmVudi5vc3NcdUZGMENcdTVDMURcdThCRDVcdTRFQ0VcdTUxRURcdThCQzFcdTdCQTFcdTc0MDZcdTU2NjhcdThCRkJcdTUzRDZcbiAgICAgIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5IE9TUyBcdTkxNERcdTdGNkVcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgfHwgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkge1xuICAgICAgICBsb2dnZXIud2FybihgW3VwbG9hZC1jZG5dIFx1MjZBMFx1RkUwRiAgXHU4REYzXHU4RkM3ICR7YXBwTmFtZX0gXHU3Njg0IENETiBcdTRFMEFcdTRGMjBcdUZGMDhcdTY3MkFcdTkxNERcdTdGNkUgT1NTIFx1NTFFRFx1OEJDMVx1RkYwOWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBDSSBcdTRFMkRcdTVGQzVcdTk4N0JcdTdCNDlcdTVGODVcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBcdUZGMENcdTU0MjZcdTUyMTlcdTY3ODRcdTVFRkFcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdTRGMUFcdTc2RjRcdTYzQTVcdTdFQzhcdTZCNjJcdTVCNTBcdThGREJcdTdBMEJcdUZGMENcdTVCRkNcdTgxRjRcdTY1ODdcdTRFRjZcdTY3MkFcdTRFMEFcdTRGMjBcbiAgICAgIGNvbnN0IHVwbG9hZFNjcmlwdCA9IHJlc29sdmUocHJvamVjdFJvb3QsICdzY3JpcHRzL3VwbG9hZC1hcHAtdG8tY2RuLm1qcycpO1xuICAgICAgbG9nZ2VyLmluZm8oYFt1cGxvYWQtY2RuXSBcdUQ4M0RcdURFODAgXHU1RjAwXHU1OUNCXHU0RTBBXHU0RjIwICR7YXBwTmFtZX0gXHU1MjMwIENETi4uLmApO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVByb21pc2UsIHJlamVjdFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bignbm9kZScsIFt1cGxvYWRTY3JpcHQsIGFwcE5hbWVdLCB7XG4gICAgICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBbdXBsb2FkLWNkbl0gXHUyNzA1ICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwYCk7XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTlFRDhcdThCQTRcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1jZG5dICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsb2dnZXIud2FybihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2RuLWFzc2V0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4tYXNzZXRzLnRzXCI7LyoqXG4gKiBDRE4gXHU4RDQ0XHU2RTkwXHU1MkEwXHU5MDFGXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTRGRUVcdTY1MzkgSFRNTCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTAgVVJMXHVGRjBDXHU1QzA2XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAqIFx1NjUyRlx1NjMwMVx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MCAoL2Fzc2V0cy8pIFx1NTQ4Q1x1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MCAoL2Fzc2V0cy9sYXlvdXQvKVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBDZG5Bc3NldHNQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTUyQTBcdTkwMUZcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQ0ROIFx1NTdERlx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQWFsbC5iZWxsaXMuY29tLmNuXHVGRjA5XG4gICAqL1xuICBjZG5Eb21haW4/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2RuQXNzZXRzUGx1Z2luKG9wdGlvbnM6IENkbkFzc2V0c1BsdWdpbk9wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdTY3NjFcdTRFRjZcdTVGQzVcdTk4N0JcdTY2MEVcdTc4NkVcdTY4QzBcdTY3RTUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gICAgLy8gXHU1OTgyXHU2NzlDIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1ODhBQlx1OEJCRVx1N0Y2RVx1NEUzQSAnZmFsc2UnXHVGRjBDXHU1MjE5XHU3OTgxXHU3NTI4IENETlxuICAgIC8vIFx1NTNFQVx1NjcwOVx1NTcyOFx1NjYwRVx1Nzg2RVx1NTQyRlx1NzUyOFx1RkYwOEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OPXRydWVcdUZGMDlcdTYyMTZcdTY3MkFcdThCQkVcdTdGNkVcdTRFMTRcdTY2MkZcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTYyNERcdTU0MkZcdTc1MjggQ0ROXG4gICAgZW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OID09PSAndHJ1ZScgfHwgXG4gICAgICAgICAgICAgIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgIT09ICd0cnVlJyksXG4gICAgY2RuRG9tYWluID0gJ2h0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24nLFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjZG4tYXNzZXRzJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFtjZG4tYXNzZXRzXSBDRE4gXHU1MkEwXHU5MDFGXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1RTk0XHU3NTI4OiAke2FwcE5hbWV9LCBDRE4gXHU1N0RGXHU1NDBEOiAke2NkbkRvbWFpbn1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbY2RuLWFzc2V0c10gQ0ROIFx1NTJBMFx1OTAxRlx1NURGMlx1Nzk4MVx1NzUyOGApO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3Bvc3QnLCAvLyBcdTU3MjggYWRkVmVyc2lvblBsdWdpbiBcdTRFNEJcdTU0MEVcdTYyNjdcdTg4NENcbiAgICAgIGhhbmRsZXIoaHRtbCkge1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NjYyRlx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEU1Rlx1OTcwMFx1ODk4MVx1NkNFOFx1NTE2NVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIC8vIFx1NTZFMFx1NEUzQVx1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NTNFRlx1ODBGRFx1NEY3Rlx1NzUyOFx1NEU0Qlx1NTI0RFx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1NTQyQiBDRE4gVVJMIFx1NzY4NFx1NEVBN1x1NzI2OVxuICAgICAgICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICAgICAgICBjb25zdCBuZWVkc0Vhcmx5Q29udmVydGVyID0gaXNQcmV2aWV3QnVpbGQgJiYgIWVuYWJsZWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWVuYWJsZWQgJiYgIW5lZWRzRWFybHlDb252ZXJ0ZXIpIHtcbiAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdIdG1sID0gaHRtbDtcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gMSkgXHU1OTA0XHU3NDA2IDxzY3JpcHQgc3JjPiBcdTY4MDdcdTdCN0VcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxzY3JpcHRbXj5dKlxccytzcmM9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMveHh4LmpzXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBLi9hc3NldHMveHh4LmpzIFx1NjIxNiBhc3NldHMveHh4LmpzXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykgfHwgc3JjLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gc3JjLnN0YXJ0c1dpdGgoJy4vJykgPyBzcmMuc3Vic3RyaW5nKDIpIDogc3JjO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAvJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0vJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMikgXHU1OTA0XHU3NDA2IDxsaW5rIGhyZWY+IFx1NjgwN1x1N0I3RVx1RkYwOENTU1x1MzAwMW1vZHVsZXByZWxvYWQgXHU3QjQ5XHVGRjA5XHVGRjA4XHU0RUM1XHU1NzI4IENETiBcdTU0MkZcdTc1MjhcdTY1RjZcdThGNkNcdTYzNjJcdUZGMDlcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8bGlua1tePl0qXFxzK2hyZWY9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBocmVmOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMveHh4LmNzc1xuICAgICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtocmVmfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy9sYXlvdXQveHh4LmNzc1xuICAgICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7aHJlZn1gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSB8fCBocmVmLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gaHJlZi5zdGFydHNXaXRoKCcuLycpID8gaHJlZi5zdWJzdHJpbmcoMikgOiBocmVmO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAvJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0vJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMykgXHU1OTA0XHU3NDA2IDxpbWcgc3JjPiBcdTY4MDdcdTdCN0VcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxpbWdbXj5dKlxccytzcmM9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHgucG5nXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHgucG5nXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDQpIFx1NTkwNFx1NzQwNlx1NTE4NVx1ODA1NFx1NzY4NCBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdUZGMDhcdTU3MjggSFRNTCBcdTZBMjFcdTY3N0ZcdTRFMkRcdUZGMDlcbiAgICAgICAgLy8gXHU0RkVFXHU1OTBEIHFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU3Njg0XHU1MTg1XHU4MDU0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKVxuICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgIFxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2csXG4gICAgICAgICAgKF9tOiBzdHJpbmcsIF9xOiBzdHJpbmcsIGFic1BhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU5MDNCXHU4RjkxXHVGRjBDXHU0RjQ2XHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU2QjYzXHU3ODZFXG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScpKWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyA1KSBcdTZDRThcdTUxNjVcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTUyMURcdTU5Q0JcdTUzMTZcdTgxMUFcdTY3MkNcdTU0OENcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NEU1Rlx1OTcwMFx1ODk4MVx1NkNFOFx1NTE2NVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIGlmICghbmV3SHRtbC5pbmNsdWRlcygnX19CVENfUkVTT1VSQ0VfTE9BREVSX18nKSB8fCBuZWVkc0Vhcmx5Q29udmVydGVyKSB7XG4gICAgICAgICAgLy8gXHU2ODM5XHU2MzZFIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTFCM1x1NUI5QVx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE5cbiAgICAgICAgICBjb25zdCBjZG5FbmFibGVkID0gcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZSc7XG4gICAgICAgICAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1x1RkYwOFx1NTcyOFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NkNFOFx1NTE2NVx1RkYwQ1x1NzUyOFx1NEU4RVx1NTcyOCBIVE1MIFx1ODlFM1x1Njc5MFx1NTI0RFx1OEY2Q1x1NjM2MiBDRE4gVVJMXHVGRjA5XG4gICAgICAgICAgLy8gXHU1MzczXHU0RjdGIENETiBcdTYzRDJcdTRFRjZcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFNUZcdTUzRUZcdTgwRkRcdTRGN0ZcdTc1MjhcdTUzMDVcdTU0MkIgQ0ROIFVSTCBcdTc2ODRcdTY1RTdcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcbiAgICAgICAgICBjb25zdCBlYXJseVVybENvbnZlcnRlclNjcmlwdCA9IGlzUHJldmlld0J1aWxkID8gYFxuPHNjcmlwdD5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBIVE1MIFx1ODlFM1x1Njc5MFx1NEU0Qlx1NTI0RFx1NUMzMVx1NTkwNFx1NzQwNiBDRE4gVVJMXHVGRjBDXHU5MDdGXHU1MTREXHU2RDRGXHU4OUM4XHU1NjY4XHU4QkY3XHU2QzQyIENETiBcdThENDRcdTZFOTBcbiAgICAvLyBcdThGRDlcdTRFMkFcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCBjb252ZXJ0Q2RuVXJsID0gKHVybCkgPT4ge1xuICAgICAgICBpZiAoIXVybCB8fCAoIXVybC5zdGFydHNXaXRoKCdodHRwOi8vJykgJiYgIXVybC5zdGFydHNXaXRoKCdodHRwczovLycpKSkge1xuICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKHVybCk7XG4gICAgICAgICAgaWYgKHVybE9iai5ob3N0bmFtZS5pbmNsdWRlcygnYWxsLmJlbGxpcy5jb20uY24nKSB8fCBcbiAgICAgICAgICAgICAgdXJsT2JqLmhvc3RuYW1lLmluY2x1ZGVzKCdiZWxsaXMxLm9zcy1jbi1zaGVuemhlbi5hbGl5dW5jcy5jb20nKSkge1xuICAgICAgICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU4REVGXHU1Rjg0XHU5MEU4XHU1MjA2XHVGRjBDXHU1M0JCXHU2Mzg5XHU1RTk0XHU3NTI4XHU1MjREXHU3RjAwXG4gICAgICAgICAgICBsZXQgcGF0aCA9IHVybE9iai5wYXRobmFtZTtcbiAgICAgICAgICAgIGlmIChwYXRoLmluY2x1ZGVzKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZyhwYXRoLmluZGV4T2YoJy9hc3NldHMvJykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoLmluY2x1ZGVzKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHJpbmcocGF0aC5pbmRleE9mKCcvYXNzZXRzL2xheW91dC8nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTRGRERcdTc1NTlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdTU0OENcdTU0QzhcdTVFMENcbiAgICAgICAgICAgIHJldHVybiBwYXRoICsgKHVybE9iai5zZWFyY2ggfHwgJycpICsgKHVybE9iai5oYXNoIHx8ICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBVUkwgXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzlGIFVSTFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBcdTYyRTZcdTYyMkEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudFx1RkYwQ1x1NTcyOFx1NTIxQlx1NUVGQSBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU2NUY2XHU4RjZDXHU2MzYyIFVSTFxuICAgICAgY29uc3Qgb3JpZ2luYWxDcmVhdGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5iaW5kKGRvY3VtZW50KTtcbiAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbih0YWdOYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBvcmlnaW5hbENyZWF0ZUVsZW1lbnQodGFnTmFtZSwgb3B0aW9ucyk7XG4gICAgICAgIGlmICh0YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzY3JpcHQnIHx8IHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2xpbmsnKSB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxTZXRBdHRyaWJ1dGUgPSBlbGVtZW50LnNldEF0dHJpYnV0ZS5iaW5kKGVsZW1lbnQpO1xuICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICgobmFtZSA9PT0gJ3NyYycgfHwgbmFtZSA9PT0gJ2hyZWYnKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5VcmwodmFsdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxTZXRBdHRyaWJ1dGUobmFtZSwgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NURGMlx1NUI1OFx1NTcyOFx1NzY4NCBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHVGRjA4XHU1OTgyXHU2NzlDIERPTSBcdTVERjJcdTdFQ0ZcdTkwRThcdTUyMDZcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIGNvbnN0IHByb2Nlc3NFeGlzdGluZ1RhZ3MgPSAoKSA9PiB7XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyY10nKS5mb3JFYWNoKChzY3JpcHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNyYyA9IHNjcmlwdC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRVcmwgPSBjb252ZXJ0Q2RuVXJsKHNyYyk7XG4gICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRVcmwgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaW5rW2hyZWZdJykuZm9yRWFjaCgobGluaykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgICAgICBpZiAoaHJlZikge1xuICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRVcmwgPSBjb252ZXJ0Q2RuVXJsKGhyZWYpO1xuICAgICAgICAgICAgICBpZiAoY29udmVydGVkVXJsICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NTkwNFx1NzQwNlx1RkYwOFx1NTk4Mlx1Njc5QyBET00gXHU1REYyXHU3RUNGXHU5MEU4XHU1MjA2XHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdpbnRlcmFjdGl2ZScpIHtcbiAgICAgICAgcHJvY2Vzc0V4aXN0aW5nVGFncygpO1xuICAgICAgICAvLyBcdTc2RDFcdTU0MkMgRE9NIFx1NTNEOFx1NTMxNlx1RkYwQ1x1NTkwNFx1NzQwNlx1NTQwRVx1N0VFRFx1NkRGQlx1NTJBMFx1NzY4NFx1NjgwN1x1N0I3RVxuICAgICAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBwcm9jZXNzRXhpc3RpbmdUYWdzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvY2Vzc0V4aXN0aW5nVGFncygpO1xuICAgICAgfVxuICAgIH1cbiAgfSkoKTtcbjwvc2NyaXB0PmAgOiAnJztcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCBsb2FkZXJTY3JpcHQgPSBgXG48c2NyaXB0PlxuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gXHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU1NjY4XHU1QzA2XHU1NzI4XHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU0RTJEXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAgLy8gXHU4RkQ5XHU5MUNDXHU1M0VBXHU4QkJFXHU3RjZFXHU1N0ZBXHU3ODQwXHU5MTREXHU3RjZFXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuX19CVENfQ0ROX0NPTkZJR19fID0ge1xuICAgICAgICBhcHBOYW1lOiAnJHthcHBOYW1lfScsXG4gICAgICAgIGNkbkRvbWFpbjogJyR7Y2RuRG9tYWlufScsXG4gICAgICAgIG9zc0RvbWFpbjogJ2h0dHBzOi8vYmVsbGlzMS5vc3MtY24tc2hlbnpoZW4uYWxpeXVuY3MuY29tJyxcbiAgICAgICAgZW5hYmxlZDogJHtjZG5FbmFibGVkfVxuICAgICAgfTtcbiAgICB9XG4gIH0pKCk7XG48L3NjcmlwdD5gO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NTcyOCA8L2hlYWQ+IFx1NEU0Qlx1NTI0RFx1NkNFOFx1NTE2NVx1RkYwOFx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU1NzI4XHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdUZGMDlcbiAgICAgICAgICBpZiAobmV3SHRtbC5pbmNsdWRlcygnPC9oZWFkPicpKSB7XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOCA8aGVhZD4gXHU3Njg0XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU1NzI4XHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2XHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTdFQ0ZcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NjgwN1x1N0I3RVx1RkYwQ1x1NTcyOFx1N0IyQ1x1NEUwMFx1NEUyQSBzY3JpcHQgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XG4gICAgICAgICAgICBpZiAoZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQgJiYgbmV3SHRtbC5pbmNsdWRlcygnPHNjcmlwdCcpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NTcyOFx1N0IyQ1x1NEUwMFx1NEUyQSA8c2NyaXB0PiBcdTYyMTYgPGxpbms+IFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1NjNEMlx1NTE2NVx1NjVFOVx1NjcxRlx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICAgICAgICBjb25zdCBmaXJzdFRhZ01hdGNoID0gbmV3SHRtbC5tYXRjaCgvPChzY3JpcHR8bGluaylbXj5dKj4vaSk7XG4gICAgICAgICAgICAgIGlmIChmaXJzdFRhZ01hdGNoICYmIGZpcnN0VGFnTWF0Y2guaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnNsaWNlKDAsIGZpcnN0VGFnTWF0Y2guaW5kZXgpICsgZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQgKyBuZXdIdG1sLnNsaWNlKGZpcnN0VGFnTWF0Y2guaW5kZXgpO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTYyN0VcdTUyMzAgc2NyaXB0IFx1NjIxNiBsaW5rIFx1NjgwN1x1N0I3RVx1RkYwQ1x1NTcyOCA8L2hlYWQ+IFx1NEU0Qlx1NTI0RFx1NjNEMlx1NTE2NVxuICAgICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvaGVhZD4nLCBgJHtlYXJseVVybENvbnZlcnRlclNjcmlwdH1cXG48L2hlYWQ+YCk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTZDRThcdTUxNjVcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTkxNERcdTdGNkVcdTgxMUFcdTY3MkNcbiAgICAgICAgICAgIGlmICghbmV3SHRtbC5pbmNsdWRlcygnX19CVENfUkVTT1VSQ0VfTE9BREVSX18nKSkge1xuICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2hlYWQ+JywgYCR7bG9hZGVyU2NyaXB0fVxcbjwvaGVhZD5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobmV3SHRtbC5pbmNsdWRlcygnPC9ib2R5PicpKSB7XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDkgPC9oZWFkPlx1RkYwQ1x1NTcyOCA8L2JvZHk+IFx1NEU0Qlx1NTI0RFx1NkNFOFx1NTE2NVxuICAgICAgICAgICAgaWYgKGVhcmx5VXJsQ29udmVydGVyU2NyaXB0KSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvYm9keT4nLCBgJHtlYXJseVVybENvbnZlcnRlclNjcmlwdH1cXG48L2JvZHk+YCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbmV3SHRtbC5pbmNsdWRlcygnX19CVENfUkVTT1VSQ0VfTE9BREVSX18nKSkge1xuICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2JvZHk+JywgYCR7bG9hZGVyU2NyaXB0fVxcbjwvYm9keT5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBbY2RuLWFzc2V0c10gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2RuLWltcG9ydC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4taW1wb3J0LnRzXCI7LyoqXG4gKiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdThGNkNcdTYzNjJcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjBDXHU1QzA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAqIFx1NEUwRSBjZG5Bc3NldHNQbHVnaW4gXHU5MTREXHU1NDA4XHVGRjBDXHU1QjlFXHU3M0IwXHU1QjhDXHU2NTc0XHU3Njg0IENETiBcdTUyQTBcdTkwMUZcbiAqL1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnQGJ0Yy9zaGFyZWQtY29yZSc7XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2RuSW1wb3J0UGx1Z2luT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ2xvZ2lzdGljcy1hcHAnXHVGRjA5XG4gICAqL1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NTJBMFx1OTAxRlx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTQyRlx1NzUyOFx1RkYwOVxuICAgKi9cbiAgZW5hYmxlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDRE4gXHU1N0RGXHU1NDBEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBYWxsLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgICovXG4gIGNkbkRvbWFpbj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZG5JbXBvcnRQbHVnaW4ob3B0aW9uczogQ2RuSW1wb3J0UGx1Z2luT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IHtcbiAgICBhcHBOYW1lLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OUVEOFx1OEJBNFx1NTQyRlx1NzUyOFx1Njc2MVx1NEVGNlx1NUZDNVx1OTg3Qlx1NjYwRVx1Nzg2RVx1NjhDMFx1NjdFNSBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAgICAvLyBcdTU5ODJcdTY3OUMgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU4OEFCXHU4QkJFXHU3RjZFXHU0RTNBICdmYWxzZSdcdUZGMENcdTUyMTlcdTc5ODFcdTc1MjggQ0ROXG4gICAgLy8gXHU1M0VBXHU2NzA5XHU1NzI4XHU2NjBFXHU3ODZFXHU1NDJGXHU3NTI4XHVGRjA4RU5BQkxFX0NETl9BQ0NFTEVSQVRJT049dHJ1ZVx1RkYwOVx1NjIxNlx1NjcyQVx1OEJCRVx1N0Y2RVx1NEUxNFx1NjYyRlx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NjVGNlx1RkYwQ1x1NjI0RFx1NTQyRlx1NzUyOCBDRE5cbiAgICBlbmFibGVkID0gcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gPT09ICd0cnVlJyB8fCBcbiAgICAgICAgICAgICAgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyAhPT0gJ3RydWUnKSxcbiAgICBjZG5Eb21haW4gPSAnaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbicsXG4gIH0gPSBvcHRpb25zO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Nkbi1pbXBvcnQnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBsb2dnZXIuaW5mbyhgW2Nkbi1pbXBvcnRdIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTVERjJcdTU0MkZcdTc1MjhcdUZGMENcdTVFOTRcdTc1Mjg6ICR7YXBwTmFtZX0sIENETiBcdTU3REZcdTU0MEQ6ICR7Y2RuRG9tYWlufWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFtjZG4taW1wb3J0XSBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU1REYyXHU3OTgxXHU3NTI4YCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW5kZXJDaHVuayhjb2RlOiBzdHJpbmcsIGNodW5rOiBhbnkpIHtcbiAgICAgIC8vIFx1NTcyOCByZW5kZXJDaHVuayBcdTk2MzZcdTZCQjVcdTU5MDRcdTc0MDZcdTY3ODRcdTVFRkFcdTU0MEVcdTc2ODRcdTRFRTNcdTc4MDFcbiAgICAgIC8vIFx1NkI2NFx1NjVGNiBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdTVERjJcdTdFQ0ZcdTg4QUIgVml0ZSBcdThGNkNcdTYzNjJcdTRFM0FcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTc2ODQgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyIC4vaW5kZXgteHh4LmpzXHVGRjA5XG4gICAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiBKUyBjaHVuayBcdTY1ODdcdTRFRjZcbiAgICAgIGlmICghY2h1bmsuZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThERjNcdThGQzdcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMDhpbmRleC14eHguanNcdUZGMDlcdUZGMENcdTU2RTBcdTRFM0FcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTY2MkZcdTkwMUFcdThGQzcgc2NyaXB0IFx1NjgwN1x1N0I3RVx1NzZGNFx1NjNBNVx1NTJBMFx1OEY3RFx1NzY4NFx1RkYwQ1x1NURGMlx1NTcyOCBIVE1MIFx1NEUyRFx1NTkwNFx1NzQwNlxuICAgICAgaWYgKGNodW5rLmlzRW50cnkgfHwgY2h1bmsuZmlsZU5hbWUubWF0Y2goL15pbmRleC1bYS16QS1aMC05XStcXC5qcyQvKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgICBsZXQgbmV3Q29kZSA9IGNvZGU7XG5cbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdUZGMENcdThCQzZcdTUyMkJcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTc2ODRcdThENDRcdTZFOTBcbiAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NkEyMVx1NUYwRlx1RkYxQWltcG9ydCgnLi4uJykgXHU2MjE2IGltcG9ydChcIi4uLlwiKVxuICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKihbJ1wiXSkoW14nXCJdKylcXDFcXHMqXFwpL2c7XG5cbiAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UoaW1wb3J0UGF0dGVybiwgKG1hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHNwZWNpZmllcjogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOC4veHh4LmpzXHVGRjA5XHU1NDhDIC9hc3NldHMvIFx1OERFRlx1NUY4NFxuICAgICAgICAvLyBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDhodHRwOi8vXHUzMDAxaHR0cHM6Ly9cdUZGMDlcdTU0OEMgbm9kZV9tb2R1bGVzIFx1OERFRlx1NUY4NFx1NEUwRFx1NTkwNFx1NzQwNlxuICAgICAgICBjb25zdCBpc1JlbGF0aXZlUGF0aCA9IHNwZWNpZmllci5zdGFydHNXaXRoKCcuLycpO1xuICAgICAgICBjb25zdCBpc0Fzc2V0c1BhdGggPSBzcGVjaWZpZXIuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghaXNSZWxhdGl2ZVBhdGggJiYgIWlzQXNzZXRzUGF0aCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaDsgLy8gXHU5NzVFXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU0RTE0XHU5NzVFIC9hc3NldHMvIFx1OERFRlx1NUY4NFx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFx1ODlDNFx1ODMwM1x1NTMxNlx1OERFRlx1NUY4NFxuICAgICAgICBsZXQgbm9ybWFsaXplZFBhdGg6IHN0cmluZztcbiAgICAgICAgaWYgKGlzUmVsYXRpdmVQYXRoKSB7XG4gICAgICAgICAgLy8gXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBLi9pbmRleC14eHguanMgLT4gL2Fzc2V0cy9pbmRleC14eHguanNcbiAgICAgICAgICAvLyBcdTYyMTZcdTgwMDVcdUZGMUEuL2Fzc2V0cy94eHguanMgLT4gL2Fzc2V0cy94eHguanNcbiAgICAgICAgICBpZiAoc3BlY2lmaWVyLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkUGF0aCA9ICcvJyArIHNwZWNpZmllci5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFZpdGUgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjFBLi9pbmRleC14eHguanMgLT4gL2Fzc2V0cy9pbmRleC14eHguanNcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRQYXRoID0gJy9hc3NldHMvJyArIHNwZWNpZmllci5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NURGMlx1N0VDRlx1NjYyRlx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCAvYXNzZXRzL3h4eC5qc1xuICAgICAgICAgIG5vcm1hbGl6ZWRQYXRoID0gc3BlY2lmaWVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU2NjJGXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAgIGNvbnN0IGlzTGF5b3V0UmVzb3VyY2UgPSBub3JtYWxpemVkUGF0aC5pbmNsdWRlcygnL2Fzc2V0cy9sYXlvdXQvJyk7XG5cbiAgICAgICAgLy8gXHU3NTFGXHU2MjEwIENETiBVUkxcbiAgICAgICAgbGV0IGNkblVybDogc3RyaW5nO1xuICAgICAgICBpZiAoaXNMYXlvdXRSZXNvdXJjZSkge1xuICAgICAgICAgIC8vIFx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFxuICAgICAgICAgIGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcbiAgICAgICAgICBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdThGNkNcdTYzNjJcdTRFM0EgQ0ROIFVSTFxuICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7Y2RuVXJsfSR7cXVvdGV9KWA7XG4gICAgICB9KTtcblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbY2RuLWltcG9ydF0gXHU1REYyXHU4RjZDXHU2MzYyIGNodW5rICR7Y2h1bmsuZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NEUzQSBDRE4gVVJMYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RpZmllZCA/IHsgY29kZTogbmV3Q29kZSwgbWFwOiBudWxsIH0gOiBudWxsO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccmVzb2x2ZS1leHRlcm5hbC1pbXBvcnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtZXh0ZXJuYWwtaW1wb3J0cy50c1wiOy8qKlxuICogXHU4OUUzXHU2NzkwXHU1OTE2XHU5MEU4XHU2QTIxXHU1NzU3XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTU5MDRcdTc0MDZcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTRFMkRcdTc2ODQgZXh0ZXJuYWwgXHU2QTIxXHU1NzU3XHU1MjJCXHU1NDBEXHVGRjA4XHU1OTgyIEBidGMvc2hhcmVkLWNvcmVcdUZGMDlcbiAqIFx1NzUzMVx1NEU4RVx1NUI1MFx1NUU5NFx1NzUyOFx1NUMwNlx1OEZEOVx1NEU5Qlx1NkEyMVx1NTc1N1x1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwQ1JvbGx1cCBcdTRFMERcdTRGMUFcdTg5RTNcdTY3OTBcdTVCODNcdTRFRUNcdUZGMENcdTVCRkNcdTgxRjRcdThGRDBcdTg4NENcdTY1RjZcdTZENEZcdTg5QzhcdTU2NjhcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTBcdTUyMkJcdTU0MERcbiAqIFx1OEZEOVx1NEUyQVx1NjNEMlx1NEVGNlx1NEYxQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NUMwNlx1OEZEOVx1NEU5Qlx1NTIyQlx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1OEZEMFx1ODg0Q1x1NjVGNlx1ODlFM1x1Njc5MFx1OTAzQlx1OEY5MVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlRXh0ZXJuYWxJbXBvcnRzT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTk3MDBcdTg5ODFcdTg5RTNcdTY3OTBcdTc2ODRcdTU5MTZcdTkwRThcdTZBMjFcdTU3NTdcdTUyMkJcdTU0MERcdTUyMTdcdTg4NjhcbiAgICogXHU0RjhCXHU1OTgyXHVGRjFBWydAYnRjL3NoYXJlZC1jb3JlJywgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnXVxuICAgKi9cbiAgZXh0ZXJuYWxzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjhcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFcdTRFQzVcdTU3MjhcdTVCNTBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1OEZEMFx1ODg0Q1x1NjVGNlx1NkEyMVx1NTc1N1x1ODlFM1x1Njc5MFx1NTFGRFx1NjU3MFx1NEVFM1x1NzgwMVxuICogQHBhcmFtIG1vZHVsZVNwZWNpZmllciBcdTZBMjFcdTU3NTdcdThCRjRcdTY2MEVcdTdCMjZcdUZGMDhcdTU5ODIgJ0BidGMvc2hhcmVkLWNvcmUnXHVGRjA5XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJ1bnRpbWVSZXNvbHZlQ29kZShtb2R1bGVTcGVjaWZpZXI6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NjgzOVx1NjM2RVx1NkEyMVx1NTc1N1x1NTQwRFx1NzlGMFx1Nzg2RVx1NUI5QVx1NTE2OFx1NUM0MFx1NTNEOFx1OTFDRlx1NTQwRFxuICBsZXQgZ2xvYmFsVmFyTmFtZSA9ICdfX0JUQ19TSEFSRURfQ09SRV9fJztcbiAgaWYgKG1vZHVsZVNwZWNpZmllciA9PT0gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnKSB7XG4gICAgZ2xvYmFsVmFyTmFtZSA9ICdfX0JUQ19TSEFSRURfQ09NUE9ORU5UU19fJztcbiAgfSBlbHNlIGlmIChtb2R1bGVTcGVjaWZpZXIgPT09ICdAYnRjL3NoYXJlZC11dGlscycpIHtcbiAgICBnbG9iYWxWYXJOYW1lID0gJ19fQlRDX1NIQVJFRF9VVElMU19fJztcbiAgfSBlbHNlIGlmIChtb2R1bGVTcGVjaWZpZXIuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29yZS8nKSkge1xuICAgIC8vIFx1NUI1MFx1OERFRlx1NUY4NFx1OEJCRlx1OTVFRVx1RkYwOFx1NTk4MiBAYnRjL3NoYXJlZC1jb3JlL2NvbXBvc2FibGVzL3VzZXItY2hlY2tcdUZGMDlcbiAgICAvLyBcdTk3MDBcdTg5ODFcdTRFQ0VcdTRFM0JcdTZBMjFcdTU3NTdcdTgzQjdcdTUzRDZcdTVCNTBcdTZBMjFcdTU3NTdcbiAgICBjb25zdCBzdWJQYXRoID0gbW9kdWxlU3BlY2lmaWVyLnJlcGxhY2UoJ0BidGMvc2hhcmVkLWNvcmUvJywgJycpO1xuICAgIGNvbnN0IGVzY2FwZWRTdWJQYXRoID0gSlNPTi5zdHJpbmdpZnkoc3ViUGF0aCk7XG4gICAgY29uc3QgZXNjYXBlZFNwZWNpZmllciA9IEpTT04uc3RyaW5naWZ5KG1vZHVsZVNwZWNpZmllcik7XG4gICAgXG4gICAgcmV0dXJuIGAoYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCB3aW4gPSB3aW5kb3c7XG4gICAgICAvLyAxLiBcdTVDMURcdThCRDVcdTRFQ0VcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcdThCQkZcdTk1RUVcdTRFM0JcdTZBMjFcdTU3NTdcbiAgICAgIGlmICh3aW4uX19CVENfU0hBUkVEX0NPUkVfXykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG1haW5Nb2R1bGUgPSB3aW4uX19CVENfU0hBUkVEX0NPUkVfXztcbiAgICAgICAgICBjb25zdCBwYXRoUGFydHMgPSAke2VzY2FwZWRTdWJQYXRofS5zcGxpdCgnLycpO1xuICAgICAgICAgIGxldCBzdWJNb2R1bGUgPSBtYWluTW9kdWxlO1xuICAgICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBwYXRoUGFydHMpIHtcbiAgICAgICAgICAgIGlmIChzdWJNb2R1bGUgJiYgdHlwZW9mIHN1Yk1vZHVsZSA9PT0gJ29iamVjdCcgJiYgcGFydCBpbiBzdWJNb2R1bGUpIHtcbiAgICAgICAgICAgICAgc3ViTW9kdWxlID0gc3ViTW9kdWxlW3BhcnRdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYWNjZXNzIHBhdGggcGFydDogJyArIHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc3ViTW9kdWxlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4QkJGXHU5NUVFXHU1OTMxXHU4RDI1XHVGRjBDXHU2MjlCXHU1MUZBXHU5NTE5XHU4QkVGXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gYWNjZXNzIHN1Yi1tb2R1bGUgZnJvbSBfX0JUQ19TSEFSRURfQ09SRV9fOiAnICsgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gMi4gXHU1QzFEXHU4QkQ1XHU0RUNFIHFpYW5rdW4gXHU1MTY4XHU1QzQwXHU1QkY5XHU4QzYxXHU4QkJGXHU5NUVFXG4gICAgICBpZiAod2luLl9fUE9XRVJFRF9CWV9RSUFOS1VOX18gJiYgd2luLl9fUUlBTktVTl9ERVZFTE9QTUVOVF9fKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudFdpbmRvdyA9IHdpbi5fX1FJQU5LVU5fREVWRUxPUE1FTlRfXztcbiAgICAgICAgaWYgKHBhcmVudFdpbmRvdyAmJiBwYXJlbnRXaW5kb3cuX19CVENfU0hBUkVEX0NPUkVfXykge1xuICAgICAgICAgIGNvbnN0IG1haW5Nb2R1bGUgPSBwYXJlbnRXaW5kb3cuX19CVENfU0hBUkVEX0NPUkVfXztcbiAgICAgICAgICBjb25zdCBwYXRoUGFydHMgPSAke2VzY2FwZWRTdWJQYXRofS5zcGxpdCgnLycpO1xuICAgICAgICAgIGxldCBzdWJNb2R1bGUgPSBtYWluTW9kdWxlO1xuICAgICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBwYXRoUGFydHMpIHtcbiAgICAgICAgICAgIGlmIChzdWJNb2R1bGUgJiYgdHlwZW9mIHN1Yk1vZHVsZSA9PT0gJ29iamVjdCcgJiYgcGFydCBpbiBzdWJNb2R1bGUpIHtcbiAgICAgICAgICAgICAgc3ViTW9kdWxlID0gc3ViTW9kdWxlW3BhcnRdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYWNjZXNzIHBhdGggcGFydDogJyArIHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc3ViTW9kdWxlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyAzLiBcdTYyOUJcdTUxRkFcdTk1MTlcdThCRUZcdUZGMENcdThCRjRcdTY2MEVcdTZBMjFcdTU3NTdcdTRFMERcdTUzRUZcdTc1MjhcbiAgICAgIHRocm93IG5ldyBFcnJvcignTW9kdWxlICR7ZXNjYXBlZFNwZWNpZmllcn0gaXMgbm90IGF2YWlsYWJsZS4gSXQgc2hvdWxkIGJlIHByb3ZpZGVkIGJ5IGxheW91dC1hcHAuJyk7XG4gICAgfSkoKWA7XG4gIH1cblxuICBjb25zdCBlc2NhcGVkU3BlY2lmaWVyID0gSlNPTi5zdHJpbmdpZnkobW9kdWxlU3BlY2lmaWVyKTtcbiAgXG4gIHJldHVybiBgKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHdpbiA9IHdpbmRvdztcbiAgICAvLyAxLiBcdTVDMURcdThCRDVcdTRFQ0VcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcdThCQkZcdTk1RUVcbiAgICBpZiAod2luLiR7Z2xvYmFsVmFyTmFtZX0pIHtcbiAgICAgIHJldHVybiB3aW4uJHtnbG9iYWxWYXJOYW1lfTtcbiAgICB9XG4gICAgLy8gMi4gXHU1QzFEXHU4QkQ1XHU0RUNFIHFpYW5rdW4gXHU1MTY4XHU1QzQwXHU1QkY5XHU4QzYxXHU4QkJGXHU5NUVFXG4gICAgaWYgKHdpbi5fX1BPV0VSRURfQllfUUlBTktVTl9fICYmIHdpbi5fX1FJQU5LVU5fREVWRUxPUE1FTlRfXykge1xuICAgICAgY29uc3QgcGFyZW50V2luZG93ID0gd2luLl9fUUlBTktVTl9ERVZFTE9QTUVOVF9fO1xuICAgICAgaWYgKHBhcmVudFdpbmRvdyAmJiBwYXJlbnRXaW5kb3cuJHtnbG9iYWxWYXJOYW1lfSkge1xuICAgICAgICByZXR1cm4gcGFyZW50V2luZG93LiR7Z2xvYmFsVmFyTmFtZX07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIDMuIFx1NjI5Qlx1NTFGQVx1OTUxOVx1OEJFRlx1RkYwQ1x1OEJGNFx1NjYwRVx1NkEyMVx1NTc1N1x1NEUwRFx1NTNFRlx1NzUyOFx1RkYwOFx1NEUwRFx1NUU5NFx1OEJFNVx1NUMxRFx1OEJENVx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1NTZFMFx1NEUzQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1NTIyQlx1NTQwRFx1RkYwOVxuICAgIHRocm93IG5ldyBFcnJvcignTW9kdWxlICR7ZXNjYXBlZFNwZWNpZmllcn0gaXMgbm90IGF2YWlsYWJsZS4gSXQgc2hvdWxkIGJlIHByb3ZpZGVkIGJ5IGxheW91dC1hcHAgYXMgd2luZG93LiR7Z2xvYmFsVmFyTmFtZX0nKTtcbiAgfSkoKWA7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU1OTE2XHU5MEU4XHU2QTIxXHU1NzU3XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXh0ZXJuYWxJbXBvcnRzUGx1Z2luKG9wdGlvbnM/OiBSZXNvbHZlRXh0ZXJuYWxJbXBvcnRzT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IHtcbiAgICBleHRlcm5hbHMgPSBbJ0BidGMvc2hhcmVkLWNvcmUnLCAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsICdAYnRjL3NoYXJlZC11dGlscyddLFxuICAgIGVuYWJsZWQgPSB0cnVlLFxuICB9ID0gb3B0aW9ucyB8fCB7fTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXNvbHZlLWV4dGVybmFsLWltcG9ydHMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBsb2dnZXIuaW5mbyhgW3Jlc29sdmUtZXh0ZXJuYWwtaW1wb3J0c10gXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1QzA2XHU4OUUzXHU2NzkwXHU1OTE2XHU5MEU4XHU2QTIxXHU1NzU3OiAke2V4dGVybmFscy5qb2luKCcsICcpfWApO1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gXHU1NzI4IHRyYW5zZm9ybSBcdTk2MzZcdTZCQjVcdTU5MDRcdTc0MDZcdTZFOTBcdTc4MDFcdUZGMENcdTc4NkVcdTRGRERcdTU3MjggVml0ZSBcdTc2ODRcdTk4ODRcdTUyQTBcdThGN0RcdTY3M0FcdTUyMzZcdTRFNEJcdTUyNERcdTU5MDRcdTc0MDZcbiAgICB0cmFuc2Zvcm0oY29kZTogc3RyaW5nLCBpZDogc3RyaW5nKSB7XG4gICAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiBUeXBlU2NyaXB0L0phdmFTY3JpcHQvVnVlIFx1NjU4N1x1NEVGNlxuICAgICAgaWYgKCFpZC5tYXRjaCgvXFwuKHRzfGpzfHRzeHxqc3h8dnVlKSQvKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4REYzXHU4RkM3IG5vZGVfbW9kdWxlcyBcdTRFMkRcdTc2ODRcdTY1ODdcdTRFRjZcbiAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgbGV0IG5ld0NvZGUgPSBjb2RlO1xuXG4gICAgICAvLyBcdTUzMzlcdTkxNERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMUFpbXBvcnQoJ0BidGMvc2hhcmVkLWNvcmUnKSBcdTYyMTYgaW1wb3J0KFwiQGJ0Yy9zaGFyZWQtY29yZVwiKVxuICAgICAgLy8gXHU1MzA1XHU2MkVDXHU1RTI2XHU5MDA5XHU5ODc5XHU3Njg0XHU2MEM1XHU1MUI1XHVGRjFBaW1wb3J0KCdAYnRjL3NoYXJlZC1jb3JlJywgeyBhc3NlcnQ6IHsgdHlwZTogJ2pzb24nIH0gfSlcbiAgICAgIC8vIFx1NEVFNVx1NTNDQSBhd2FpdCBpbXBvcnQoJ0BidGMvc2hhcmVkLWNvcmUnKVxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RjdGXHU3NTI4XHU5NzVFXHU4RDJBXHU1QTZBXHU1MzM5XHU5MTREXHVGRjBDXHU5MDdGXHU1MTREXHU1MzM5XHU5MTREXHU1MjMwXHU1MTc2XHU0RUQ2XHU1MTg1XHU1QkI5XG4gICAgICBjb25zdCBkeW5hbWljSW1wb3J0UGF0dGVybiA9IC8oPzphd2FpdFxccyspP2ltcG9ydFxccypcXChcXHMqKFsnXCJdKShbXidcIl0rKVxcMSg/OlxccyosXFxzKlteKV0rKT9cXHMqXFwpL2c7XG5cbiAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UoZHluYW1pY0ltcG9ydFBhdHRlcm4sIChtYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBzcGVjaWZpZXI6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY2MkZcdTk3MDBcdTg5ODFcdTU5MDRcdTc0MDZcdTc2ODRcdTU5MTZcdTkwRThcdTZBMjFcdTU3NTdcbiAgICAgICAgY29uc3QgaXNFeHRlcm5hbCA9IGV4dGVybmFscy5zb21lKGV4dGVybmFsID0+IHtcbiAgICAgICAgICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdTYyMTZcdTVCNTBcdThERUZcdTVGODRcdTUzMzlcdTkxNERcdUZGMDhcdTU5ODIgQGJ0Yy9zaGFyZWQtY29yZS9jb21wb3NhYmxlcy91c2VyLWNoZWNrXHVGRjA5XG4gICAgICAgICAgcmV0dXJuIHNwZWNpZmllciA9PT0gZXh0ZXJuYWwgfHwgc3BlY2lmaWVyLnN0YXJ0c1dpdGgoZXh0ZXJuYWwgKyAnLycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWlzRXh0ZXJuYWwpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7IC8vIFx1NEUwRFx1NjYyRlx1NTkxNlx1OTBFOFx1NkEyMVx1NTc1N1x1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFx1NzUxRlx1NjIxMFx1OEZEMFx1ODg0Q1x1NjVGNlx1ODlFM1x1Njc5MFx1NEVFM1x1NzgwMVxuICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IGNyZWF0ZVJ1bnRpbWVSZXNvbHZlQ29kZShzcGVjaWZpZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MzlGXHU1MzM5XHU5MTREXHU1MzA1XHU1NDJCIGF3YWl0XHVGRjBDXHU0RkREXHU3NTU5XHU1QjgzXG4gICAgICAgIGlmIChtYXRjaC5zdGFydHNXaXRoKCdhd2FpdCcpKSB7XG4gICAgICAgICAgcmV0dXJuIGBhd2FpdCAke3JlcGxhY2VtZW50fWA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXBsYWNlbWVudDtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYFtyZXNvbHZlLWV4dGVybmFsLWltcG9ydHNdIFx1NURGMlx1OEY2Q1x1NjM2Mlx1NjU4N1x1NEVGNiAke2lkLnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKX0gXHU0RTJEXHU3Njg0XHU1OTE2XHU5MEU4XHU2QTIxXHU1NzU3XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RpZmllZCA/IHsgY29kZTogbmV3Q29kZSwgbWFwOiBudWxsIH0gOiBudWxsO1xuICAgIH0sXG4gICAgLy8gXHU1NDBDXHU2NUY2XHU1NzI4IHJlbmRlckNodW5rIFx1OTYzNlx1NkJCNVx1NTkwNFx1NzQwNlx1RkYwQ1x1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1RkYwOFx1NTkwNFx1NzQwNiB0cmFuc2Zvcm0gXHU5NjM2XHU2QkI1XHU1M0VGXHU4MEZEXHU5MDU3XHU2RjBGXHU3Njg0XHU2MEM1XHU1MUI1XHVGRjA5XG4gICAgcmVuZGVyQ2h1bmsoY29kZTogc3RyaW5nLCBjaHVuazogYW55KSB7XG4gICAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiBKUyBjaHVuayBcdTY1ODdcdTRFRjZcbiAgICAgIGlmICghY2h1bmsuZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcbiAgICAgIGxldCBuZXdDb2RlID0gY29kZTtcblxuICAgICAgLy8gXHU1MzM5XHU5MTREIF9fdml0ZVByZWxvYWQgXHU1MzA1XHU4OEM1XHU3Njg0XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XG4gICAgICAvLyBcdTRGOEJcdTU5ODJcdUZGMUFfX3ZpdGVQcmVsb2FkKGFzeW5jICgpID0+IHsgY29uc3QgeyByb3V0ZUxvYWRpbmdTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoXCJAYnRjL3NoYXJlZC1jb3JlXCIpOyByZXR1cm4geyByb3V0ZUxvYWRpbmdTZXJ2aWNlIH07IH0sIHRydWUgPyBbXSA6IHZvaWQgMClcbiAgICAgIGNvbnN0IHZpdGVQcmVsb2FkUGF0dGVybiA9IC9fX3ZpdGVQcmVsb2FkXFxzKlxcKFxccyphc3luY1xccypcXChcXClcXHMqPT5cXHMqXFx7W159XSphd2FpdFxccytpbXBvcnRcXHMqXFwoXFxzKihbJ1wiXSkoW14nXCJdKylcXDFcXHMqXFwpW159XSpcXH1cXHMqLFxccypbXildK1xcKS9nO1xuICAgICAgXG4gICAgICAvLyBcdTUxNDhcdTU5MDRcdTc0MDYgX192aXRlUHJlbG9hZCBcdTUzMDVcdTg4QzVcdTc2ODRcdTYwQzVcdTUxQjVcbiAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uodml0ZVByZWxvYWRQYXR0ZXJuLCAobWF0Y2g6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBcdTRFQ0VcdTUzMzlcdTkxNERcdTRFMkRcdTYzRDBcdTUzRDYgaW1wb3J0IFx1NzY4NFx1NkEyMVx1NTc1N1x1OEJGNFx1NjYwRVx1N0IyNlxuICAgICAgICBjb25zdCBpbXBvcnRNYXRjaCA9IG1hdGNoLm1hdGNoKC9pbXBvcnRcXHMqXFwoXFxzKihbJ1wiXSkoW14nXCJdKylcXDEvKTtcbiAgICAgICAgaWYgKCFpbXBvcnRNYXRjaCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3Qgc3BlY2lmaWVyID0gaW1wb3J0TWF0Y2hbMl07XG4gICAgICAgIGNvbnN0IGlzRXh0ZXJuYWwgPSBleHRlcm5hbHMuc29tZShleHRlcm5hbCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNwZWNpZmllciA9PT0gZXh0ZXJuYWwgfHwgc3BlY2lmaWVyLnN0YXJ0c1dpdGgoZXh0ZXJuYWwgKyAnLycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWlzRXh0ZXJuYWwpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgIH1cblxuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gY3JlYXRlUnVudGltZVJlc29sdmVDb2RlKHNwZWNpZmllcik7XG4gICAgICAgIFxuICAgICAgICAvLyBcdTYzRDBcdTUzRDZcdTUzOUZcdTUzMzlcdTkxNERcdTRFMkRcdTc2ODRcdTg5RTNcdTY3ODRcdThENEJcdTUwM0NcdTkwRThcdTUyMDZcbiAgICAgICAgLy8gXHU0RjhCXHU1OTgyXHVGRjFBY29uc3QgeyByb3V0ZUxvYWRpbmdTZXJ2aWNlOiByb3V0ZUxvYWRpbmdTZXJ2aWNlMiB9ID0gYXdhaXQgaW1wb3J0KFwiQGJ0Yy9zaGFyZWQtY29yZVwiKTtcbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyXHU0RTNBXHVGRjFBY29uc3Qgc2hhcmVkQ29yZU1vZHVsZSA9IGF3YWl0IC4uLjsgY29uc3Qgcm91dGVMb2FkaW5nU2VydmljZSA9IHNoYXJlZENvcmVNb2R1bGUucm91dGVMb2FkaW5nU2VydmljZTtcbiAgICAgICAgLy8gXHU0RjQ2XHU4RkQ5XHU2ODM3XHU2QkQ0XHU4RjgzXHU1OTBEXHU2NzQyXHVGRjBDXHU3NkY0XHU2M0E1XHU2NkZGXHU2MzYyXHU2NTc0XHU0RTJBIF9fdml0ZVByZWxvYWQgXHU4QzAzXHU3NTI4XHU0RTNBIGF3YWl0IFx1OEMwM1x1NzUyOFxuICAgICAgICByZXR1cm4gYGF3YWl0ICR7cmVwbGFjZW1lbnR9YDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTUzMzlcdTkxNERcdTY2NkVcdTkwMUFcdTc2ODRcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMUFpbXBvcnQoJ0BidGMvc2hhcmVkLWNvcmUnKSBcdTYyMTYgYXdhaXQgaW1wb3J0KFwiQGJ0Yy9zaGFyZWQtY29yZVwiKVxuICAgICAgY29uc3QgZHluYW1pY0ltcG9ydFBhdHRlcm4gPSAvKD86YXdhaXRcXHMrKT9pbXBvcnRcXHMqXFwoXFxzKihbJ1wiXSkoW14nXCJdKylcXDEoPzpcXHMqLFxccypbXildKyk/XFxzKlxcKS9nO1xuXG4gICAgICAvLyBcdTUxOERcdTU5MDRcdTc0MDZcdTY2NkVcdTkwMUFcdTc2ODRcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMDhcdTRFMERcdTUzMDVcdTYyRUNcdTVERjJcdTdFQ0ZcdTg4QUIgX192aXRlUHJlbG9hZCBcdTUzMDVcdTg4QzVcdTc2ODRcdUZGMDlcbiAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UoZHluYW1pY0ltcG9ydFBhdHRlcm4sIChtYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBzcGVjaWZpZXI6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTU3MjggX192aXRlUHJlbG9hZCBcdTRFMkRcdUZGMDhcdTVERjJcdTdFQ0ZcdTg4QUJcdTRFMEFcdTk3NjJcdTc2ODRcdTU5MDRcdTc0MDZcdThGQzdcdTRFODZcdUZGMDlcbiAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU3QjgwXHU1MzU1XHU3Njg0XHU2OEMwXHU2N0U1XHVGRjFBXHU1OTgyXHU2NzlDXHU1MjREXHU5NzYyXHU2NzA5IF9fdml0ZVByZWxvYWRcdUZGMENcdThERjNcdThGQzdcdUZGMDhcdTRGNDZcdTVCOUVcdTk2NDVcdTRFMEFcdTVFOTRcdThCRTVcdTVERjJcdTdFQ0ZcdTg4QUJcdTY2RkZcdTYzNjJcdTRFODZcdUZGMDlcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlzRXh0ZXJuYWwgPSBleHRlcm5hbHMuc29tZShleHRlcm5hbCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNwZWNpZmllciA9PT0gZXh0ZXJuYWwgfHwgc3BlY2lmaWVyLnN0YXJ0c1dpdGgoZXh0ZXJuYWwgKyAnLycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWlzRXh0ZXJuYWwpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgIH1cblxuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gY3JlYXRlUnVudGltZVJlc29sdmVDb2RlKHNwZWNpZmllcik7XG4gICAgICAgIFxuICAgICAgICBpZiAobWF0Y2guc3RhcnRzV2l0aCgnYXdhaXQnKSkge1xuICAgICAgICAgIHJldHVybiBgYXdhaXQgJHtyZXBsYWNlbWVudH1gO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnQ7XG4gICAgICB9KTtcblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcmVzb2x2ZS1leHRlcm5hbC1pbXBvcnRzXSBcdTVERjJcdThGNkNcdTYzNjIgY2h1bmsgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU1OTE2XHU5MEU4XHU2QTIxXHU1NzU3XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RpZmllZCA/IHsgY29kZTogbmV3Q29kZSwgbWFwOiBudWxsIH0gOiBudWxsO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHJlc29sdmUtYnRjLWltcG9ydHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcmVzb2x2ZS1idGMtaW1wb3J0cy50c1wiOy8qKlxuICogXHU4OUUzXHU2NzkwIEBidGMvKiBcdTUzMDVcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAqIFx1NTkwNFx1NzQwNlx1NEVDRVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1RkYwOFx1NTk4MiBzaGFyZWQtY29yZS9kaXN0L2luZGV4Lm1qc1x1RkYwOVx1NEUyRFx1NUJGQ1x1NTE2NVx1NzY4NCBAYnRjLyogXHU2QTIxXHU1NzU3XG4gKiBcdTU0MENcdTY1RjZcdTU5MDRcdTc0MDYgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHU3Njg0XHU1MjJCXHU1NDBEXHVGRjA4XHU1OTgyIEBidGMtY29tcG9uZW50cywgQGJ0Yy1jb21tb24gXHU3QjQ5XHVGRjA5XG4gKiBcdTc4NkVcdTRGREQgUm9sbHVwIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1ODlFM1x1Njc5MFx1OEZEOVx1NEU5Qlx1NUJGQ1x1NTE2NVx1RkYwQ1x1NTM3M1x1NEY3Rlx1NUI4M1x1NEVFQ1x1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVxuICovXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdAYnRjL3NoYXJlZC1jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvcGF0aC1oZWxwZXJzJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlQnRjSW1wb3J0c09wdGlvbnMge1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gICAqL1xuICBhcHBEaXI6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQXRydWVcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbihvcHRpb25zOiBSZXNvbHZlQnRjSW1wb3J0c09wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7IGFwcERpciwgZW5hYmxlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgaWYgKCFlbmFibGVkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdyZXNvbHZlLWJ0Yy1pbXBvcnRzJyxcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB7IHdpdGhQYWNrYWdlcywgd2l0aFJvb3QsIHdpdGhDb25maWdzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTY3RTVcdTVCRkNcdTUxNjVcdTY2MkZcdTU0MjZcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTYyMTYgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXG4gICAqL1xuICBmdW5jdGlvbiBpc0Zyb21CdWlsdFBhY2thZ2VPclNoYXJlZENvbXBvbmVudHMoaW1wb3J0ZXI/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIWltcG9ydGVyKSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgLy8gXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHVGRjA4XHU1OTgyIHNoYXJlZC1jb3JlL2Rpc3QvaW5kZXgubWpzXHVGRjA5XG4gICAgY29uc3QgaXNGcm9tQnVpbHRQYWNrYWdlID0gKFxuICAgICAgaW1wb3J0ZXIuaW5jbHVkZXMoJy9kaXN0LycpIHx8XG4gICAgICBpbXBvcnRlci5pbmNsdWRlcygnXFxcXGRpc3RcXFxcJykgfHxcbiAgICAgIChpbXBvcnRlci5lbmRzV2l0aCgnLm1qcycpICYmICFpbXBvcnRlci5pbmNsdWRlcygnL3NyYy8nKSkgfHxcbiAgICAgIChpbXBvcnRlci5lbmRzV2l0aCgnLmpzJykgJiYgIWltcG9ydGVyLmluY2x1ZGVzKCcvc3JjLycpICYmICFpbXBvcnRlci5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpXG4gICAgKTtcbiAgICBcbiAgICAvLyBcdTY3NjVcdTgxRUEgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXHVGRjA4XHU5NzAwXHU4OTgxXHU4OUUzXHU2NzkwXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXHVGRjA5XG4gICAgY29uc3QgaXNGcm9tU2hhcmVkQ29tcG9uZW50cyA9IGltcG9ydGVyLmluY2x1ZGVzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKTtcbiAgICBcbiAgICByZXR1cm4gaXNGcm9tQnVpbHRQYWNrYWdlIHx8IGlzRnJvbVNoYXJlZENvbXBvbmVudHM7XG4gIH1cblxuICAvKipcbiAgICogXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU2NzA5XHU2QjYzXHU3ODZFXHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXG4gICAqIFx1NTk4Mlx1Njc5Q1x1OERFRlx1NUY4NFx1NkNBMVx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwQ1x1NUMxRFx1OEJENVx1NkRGQlx1NTJBMFx1NUUzOFx1ODlDMVx1NzY4NFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgKi9cbiAgZnVuY3Rpb24gZW5zdXJlRmlsZUV4dGVuc2lvbihmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTVERjJcdTdFQ0ZcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcbiAgICBpZiAoL1xcLih0c3x0c3h8anN8anN4fHZ1ZXxqc29ufGNzc3xzY3NzfHNhc3N8bGVzcykkL2kudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBmaWxlUGF0aDtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU2MzA5XHU0RjE4XHU1MTQ4XHU3RUE3XHU1QzFEXHU4QkQ1XHU2REZCXHU1MkEwXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjFBLnRzeCwgLnRzLCAuanN4LCAuanNcbiAgICBjb25zdCBleHRlbnNpb25zID0gWycudHN4JywgJy50cycsICcuanN4JywgJy5qcyddO1xuICAgIGZvciAoY29uc3QgZXh0IG9mIGV4dGVuc2lvbnMpIHtcbiAgICAgIGNvbnN0IHBhdGhXaXRoRXh0ID0gYCR7ZmlsZVBhdGh9JHtleHR9YDtcbiAgICAgIGlmIChleGlzdHNTeW5jKHBhdGhXaXRoRXh0KSkge1xuICAgICAgICByZXR1cm4gcGF0aFdpdGhFeHQ7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjI0MFx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1OTBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OEZENFx1NTZERVx1NTM5Rlx1OERFRlx1NUY4NFx1RkYwQ1x1OEJBOSBWaXRlIFx1NzY4NFx1NjI2OVx1NUM1NVx1NTQwRFx1ODlFM1x1Njc5MFx1NjczQVx1NTIzNlx1NTkwNFx1NzQwNlxuICAgIHJldHVybiBmaWxlUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXG4gICAqL1xuICBmdW5jdGlvbiByZXNvbHZlU2hhcmVkQ29tcG9uZW50c0FsaWFzKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCB7IHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1jb21wb25lbnRzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1jb21wb25lbnRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWNvbXBvbmVudHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWNvbXBvbmVudHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtY29tbW9uXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1jb21tb24nIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtY29tbW9uLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1jb21tb24vJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24vJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1jcnVkXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1jcnVkJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWNydWQvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWNydWQvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jcnVkLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtc3R5bGVzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1zdHlsZXMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtc3R5bGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1zdHlsZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1sb2NhbGVzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1sb2NhbGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWxvY2FsZXMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWxvY2FsZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtYXNzZXRzIFx1NTQ4QyBAYXNzZXRzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1hc3NldHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtYXNzZXRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1hc3NldHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAYXNzZXRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYXNzZXRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGFzc2V0cy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLXV0aWxzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy11dGlscycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy11dGlscy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtdXRpbHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAcGx1Z2luc1xuICAgIGlmIChpZCA9PT0gJ0BwbHVnaW5zJyB8fCBpZC5zdGFydHNXaXRoKCdAcGx1Z2lucy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BwbHVnaW5zLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNlx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NjMwOVx1NEVDRVx1NTE3N1x1NEY1M1x1NTIzMFx1NEUwMFx1ODIyQ1x1NzY4NFx1OTg3QVx1NUU4Rlx1RkYwOVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTE3N1x1NEY1M1x1NzY4NFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFx1NUZDNVx1OTg3Qlx1NTcyOFx1OTAxQVx1NzUyOFx1NTIyQlx1NTQwRFx1NEU0Qlx1NTI0RFx1NjhDMFx1NjdFNVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMvY3NzLXZhcicgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy11dGlscy9jc3MtdmFyLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy9jc3MtdmFyJywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzL2NvbG9yJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzL2NvbG9yLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy9jb2xvcicsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY29sb3Ike3N1YlBhdGggPyAnLycgKyBzdWJQYXRoIDogJyd9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXV0aWxzL2dyYWRpZW50JywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudC8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXR5cGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXR5cGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy10eXBlcy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXV0aWxzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy1jb21wb3NhYmxlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy1jb21wb3NhYmxlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtY29tcG9zYWJsZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVzb2x2ZS1idGMtaW1wb3J0cycsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGxvZ2dlci5pbmZvKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1QzA2XHU4OUUzXHU2NzkwXHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1XHU0RTJEXHU1QkZDXHU1MTY1XHU3Njg0IEBidGMvKiBcdTZBMjFcdTU3NTdcdTU0OEMgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEJyk7XG4gICAgfSxcbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZywgaW1wb3J0ZXI/OiBzdHJpbmcpIHtcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NUJGQ1x1NTE2NVx1NjYyRlx1NTQyNlx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1NjIxNiBzaGFyZWQtY29tcG9uZW50cyBcdTZFOTBcdTc4MDFcbiAgICAgIGNvbnN0IHNob3VsZFJlc29sdmUgPSBpc0Zyb21CdWlsdFBhY2thZ2VPclNoYXJlZENvbXBvbmVudHMoaW1wb3J0ZXIpO1xuICAgICAgXG4gICAgICBpZiAoIXNob3VsZFJlc29sdmUpIHtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1QkZDXHU1MTY1XHU0RTBEXHU2NjJGXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU2MjE2IHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVx1RkYwQ1x1OEJBOVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1RkYwOFx1NTk4Mlx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVx1RkYwOVx1NTkwNFx1NzQwNlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU5OTk2XHU1MTQ4XHU1OTA0XHU3NDA2IHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRFx1RkYwOFx1OEZEOVx1NEU5Qlx1NTIyQlx1NTQwRFx1NTNFRlx1ODBGRFx1NTcyOFx1NEVGQlx1NEY1NVx1NTczMFx1NjVCOVx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgICAgY29uc3Qgc2hhcmVkQ29tcG9uZW50c0FsaWFzID0gcmVzb2x2ZVNoYXJlZENvbXBvbmVudHNBbGlhcyhpZCk7XG4gICAgICBpZiAoc2hhcmVkQ29tcG9uZW50c0FsaWFzKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRCAke2lkfSAoXHU2NzY1XHU4MUVBICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NoYXJlZENvbXBvbmVudHNBbGlhcy5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzaGFyZWRDb21wb25lbnRzQWxpYXM7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAY29uZmlncyBcdTUzMDVcdTc2ODRcdTVCRkNcdTUxNjVcdUZGMDhcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTY1RjZcdUZGMENcdTczQjBcdTU3MjhcdTYzMDdcdTU0MTEgc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3NcdUZGMDlcbiAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAY29uZmlncy8nKSkge1xuICAgICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNvbmZpZ3MvJywgJycpO1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gd2l0aENvbmZpZ3Moc3ViUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbmFsUGF0aCA9IGVuc3VyZUZpbGVFeHRlbnNpb24oc291cmNlUGF0aCk7XG4gICAgICAgIFxuICAgICAgICBsb2dnZXIuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCBAY29uZmlncyBcdTUzMDUgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtmaW5hbFBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gZmluYWxQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy8qIFx1NTMwNVx1NzY4NFx1NUJGQ1x1NTE2NVxuICAgICAgaWYgKCFpZC5zdGFydHNXaXRoKCdAYnRjLycpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC1jb21wb25lbnRzLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtY29yZVxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9zaGFyZWQtY29yZScgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29yZS8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC1jb3JlJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29yZS9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC1jb3JlLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtdXRpbHNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLXV0aWxzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC11dGlscy8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC11dGlscydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLXV0aWxzL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC11dGlscy9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC11dGlscy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBsb2dnZXIuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc291cmNlUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvc2hhcmVkLXBsdWdpbnNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLXBsdWdpbnMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLXBsdWdpbnMvJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9zaGFyZWQtcGx1Z2lucydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLXBsdWdpbnMvc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgc2hhcmVkLXBsdWdpbnMvc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9zaGFyZWQtcGx1Z2lucy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBsb2dnZXIuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihzb3VyY2VQYXRoKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvaTE4blxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9pMThuJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL2kxOG4vJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9pMThuJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdpMThuL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYGkxOG4vc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9pMThuLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKHNvdXJjZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9hdXRoLXNoYXJlZFxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9hdXRoLXNoYXJlZCcgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9hdXRoLXNoYXJlZC8nKSkge1xuICAgICAgICBsZXQgc291cmNlUGF0aDogc3RyaW5nO1xuICAgICAgICBpZiAoaWQgPT09ICdAYnRjL2F1dGgtc2hhcmVkJykge1xuICAgICAgICAgIC8vIEBidGMvYXV0aC1zaGFyZWQgXHU2Q0ExXHU2NzA5XHU2ODM5IGluZGV4LnRzXHVGRjBDXHU0RjdGXHU3NTI4IGNvbXBvc2FibGVzL2luZGV4LnRzIFx1NEY1Q1x1NEUzQVx1NTE2NVx1NTNFM1xuICAgICAgICAgIHNvdXJjZVBhdGggPSB3aXRoUm9vdCgnYXV0aC9zaGFyZWQvY29tcG9zYWJsZXMvaW5kZXgudHMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy9hdXRoLXNoYXJlZC8nLCAnJyk7XG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU2Q0ExXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjBDXHU2REZCXHU1MkEwIC50cyBcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgICAgICBzb3VyY2VQYXRoID0gd2l0aFJvb3QoYGF1dGgvc2hhcmVkLyR7c3ViUGF0aH0ke3N1YlBhdGguaW5jbHVkZXMoJy4nKSA/ICcnIDogJy50cyd9YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxvZ2dlci5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzZcdTRFRDYgQGJ0Yy8qIFx1NTMwNVx1RkYwQ1x1OEZENFx1NTZERSBudWxsIFx1OEJBOVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eS50c1wiO2ltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuaW1wb3J0IHR5cGUgeyBJbmNvbWluZ01lc3NhZ2UsIFNlcnZlclJlc3BvbnNlIH0gZnJvbSAnaHR0cCc7XG5cbi8vIFZpdGUgXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHU3QzdCXHU1NzhCXG5pbnRlcmZhY2UgUHJveHlPcHRpb25zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG4gIGNoYW5nZU9yaWdpbj86IGJvb2xlYW47XG4gIHNlY3VyZT86IGJvb2xlYW47XG4gIGNvbmZpZ3VyZT86IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHZvaWQ7XG59XG5cbmNvbnN0IHByb3h5OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBQcm94eU9wdGlvbnM+ID0ge1xuICAnL2FwaSc6IHtcbiAgICB0YXJnZXQ6ICdodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICAvLyBcdTRFMERcdTUxOERcdTY2RkZcdTYzNjJcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdThGNkNcdTUzRDEgL2FwaSBcdTUyMzBcdTU0MEVcdTdBRUZcdUZGMDhcdTU0MEVcdTdBRUZcdTVERjJcdTY1MzlcdTRFM0FcdTRGN0ZcdTc1MjggL2FwaVx1RkYwOVxuICAgIC8vIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcvYWRtaW4nKSAvLyBcdTVERjJcdTc5RkJcdTk2NjRcdUZGMUFcdTU0MEVcdTdBRUZcdTVERjJcdTY1MzlcdTRFM0FcdTRGN0ZcdTc1MjggL2FwaVxuICAgIC8vIFx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1NkRGQlx1NTJBMCBDT1JTIFx1NTkzNFxuICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4ge1xuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU0RUUzXHU3NDA2XHU1NENEXHU1RTk0XG4gICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXM6IEluY29taW5nTWVzc2FnZSwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJztcbiAgICAgICAgaWYgKHByb3h5UmVzLmhlYWRlcnMpIHtcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nXSA9IG9yaWdpbiBhcyBzdHJpbmc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnXSA9ICd0cnVlJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJ10gPSAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnO1xuICAgICAgICAgIGNvbnN0IHJlcXVlc3RIZWFkZXJzID0gcmVxLmhlYWRlcnNbJ2FjY2Vzcy1jb250cm9sLXJlcXVlc3QtaGVhZGVycyddIHx8ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyddID0gcmVxdWVzdEhlYWRlcnMgYXMgc3RyaW5nO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBTZXQtQ29va2llIFx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1Nzg2RVx1NEZERFx1OERFOFx1NTdERlx1OEJGN1x1NkM0Mlx1NjVGNiBjb29raWUgXHU4MEZEXHU1OTFGXHU2QjYzXHU3ODZFXHU4QkJFXHU3RjZFXG4gICAgICAgICAgLy8gXHU1NzI4XHU5ODg0XHU4OUM4XHU2QTIxXHU1RjBGXHU0RTBCXHVGRjA4XHU0RTBEXHU1NDBDXHU3QUVGXHU1M0UzXHVGRjA5XHVGRjBDXHU5NzAwXHU4OTgxXHU4QkJFXHU3RjZFIFNhbWVTaXRlPU5vbmU7IFNlY3VyZVxuICAgICAgICAgIGNvbnN0IHNldENvb2tpZUhlYWRlciA9IHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXTtcbiAgICAgICAgICBpZiAoc2V0Q29va2llSGVhZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBjb29raWVzID0gQXJyYXkuaXNBcnJheShzZXRDb29raWVIZWFkZXIpID8gc2V0Q29va2llSGVhZGVyIDogW3NldENvb2tpZUhlYWRlcl07XG4gICAgICAgICAgICBjb25zdCBmaXhlZENvb2tpZXMgPSBjb29raWVzLm1hcCgoY29va2llOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDIGNvb2tpZSBcdTRFMERcdTUzMDVcdTU0MkIgU2FtZVNpdGVcdUZGMENcdTYyMTZcdTgwMDUgU2FtZVNpdGUgXHU0RTBEXHU2NjJGIE5vbmVcdUZGMENcdTk3MDBcdTg5ODFcdTRGRUVcdTU5MERcbiAgICAgICAgICAgICAgaWYgKCFjb29raWUuaW5jbHVkZXMoJ1NhbWVTaXRlPU5vbmUnKSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NzlGQlx1OTY2NFx1NzNCMFx1NjcwOVx1NzY4NCBTYW1lU2l0ZSBcdThCQkVcdTdGNkVcdUZGMDhcdTU5ODJcdTY3OUNcdTY3MDlcdUZGMDlcbiAgICAgICAgICAgICAgICBsZXQgZml4ZWRDb29raWUgPSBjb29raWUucmVwbGFjZSgvO1xccypTYW1lU2l0ZT0oU3RyaWN0fExheHxOb25lKS9naSwgJycpO1xuICAgICAgICAgICAgICAgIC8vIFx1NkRGQlx1NTJBMCBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcdUZGMDhcdTVCRjlcdTRFOEVcdThERThcdTU3REZcdThCRjdcdTZDNDJcdUZGMDlcbiAgICAgICAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFTZWN1cmUgXHU5NzAwXHU4OTgxIEhUVFBTXHVGRjBDXHU0RjQ2XHU1NzI4XHU1RjAwXHU1M0QxL1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NjIxMVx1NEVFQ1x1NEVDRFx1NzEzNlx1NkRGQlx1NTJBMFx1NUI4M1xuICAgICAgICAgICAgICAgIC8vIFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEYxQVx1NUZGRFx1NzU2NSBTZWN1cmVcdUZGMDhcdTU5ODJcdTY3OUNcdTUzNEZcdThCQUVcdTY2MkYgSFRUUFx1RkYwOVxuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llICs9ICc7IFNhbWVTaXRlPU5vbmU7IFNlY3VyZSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVkQ29va2llO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBjb29raWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXSA9IGZpeGVkQ29va2llcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU4QkIwXHU1RjU1XHU1NDBFXHU3QUVGXHU1NENEXHU1RTk0XHU3MkI2XHU2MDAxXG4gICAgICAgIGlmIChwcm94eVJlcy5zdGF0dXNDb2RlICYmIHByb3h5UmVzLnN0YXR1c0NvZGUgPj0gNTAwKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGBbUHJveHldIEJhY2tlbmQgcmV0dXJuZWQgJHtwcm94eVJlcy5zdGF0dXNDb2RlfSBmb3IgJHtyZXEubWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcbiAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tQcm94eV0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tQcm94eV0gUmVxdWVzdCBVUkw6JywgcmVxLnVybCk7XG4gICAgICAgIGxvZ2dlci5lcnJvcignW1Byb3h5XSBUYXJnZXQ6JywgJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnKTtcbiAgICAgICAgaWYgKHJlcyAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdThGRDlcdTkxQ0NcdTU3MjhcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdTRFMkRcdUZGMENcdTY1RTBcdTZDRDVcdTRGN0ZcdTc1MjggaTE4blx1RkYwQ1x1NjI0MFx1NEVFNVx1NEZERFx1NzU1OVx1NTM5Rlx1NTlDQlx1OTUxOVx1OEJFRlx1NkQ4OFx1NjA2RlxuICAgICAgICAgIC8vIFx1NUI5RVx1OTY0NVx1OTUxOVx1OEJFRlx1NkQ4OFx1NjA2Rlx1NUU5NFx1OEJFNVx1NTcyOFx1NTQwRVx1N0FFRlx1NjIxNlx1NTI0RFx1N0FFRlx1OTUxOVx1OEJFRlx1NTkwNFx1NzQwNlx1NEUyRFx1NEY3Rlx1NzUyOCBpMThuXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBjb2RlOiA1MDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnUHJveHkgZXJyb3I6IFVuYWJsZSB0byBjb25uZWN0IHRvIGJhY2tlbmQgc2VydmVyIGh0dHA6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NzZEMVx1NTQyQ1x1NEVFM1x1NzQwNlx1OEJGN1x1NkM0Mlx1RkYwOFx1NzUyOFx1NEU4RVx1OEMwM1x1OEJENVx1RkYwOVxuICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxOiBhbnksIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBbUHJveHldICR7cmVxLm1ldGhvZH0gJHtyZXEudXJsfSAtPiBodHRwOi8vMTAuODAuOS43Njo4MTE1JHtyZXEudXJsfWApO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfVxufTtcblxuZXhwb3J0IHsgcHJveHkgfTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBTUEsU0FBUyxTQUFTO0FBTmxCLElBU00sV0F3QkYsS0F5QlM7QUExRGI7QUFBQTtBQUFBO0FBSUE7QUFLQSxJQUFNLFlBQVksRUFBRSxPQUFPO0FBQUE7QUFBQSxNQUV6QixVQUFVLEVBQUUsS0FBSyxDQUFDLGVBQWUsUUFBUSxZQUFZLENBQUMsRUFBRSxRQUFRLGFBQWE7QUFBQSxNQUM3RSxNQUFNLEVBQUUsS0FBSyxDQUFDLGVBQWUsV0FBVyxZQUFZLENBQUMsRUFBRSxRQUFRLGFBQWE7QUFBQTtB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QUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1YsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsUUFDVixVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxRQUNWLFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1YsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsUUFDVixVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxRQUNWLFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1YsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxT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YUFBYTtBQUFBLElBQ2IsY0FBYyxFQUFFLE1BQWlCO0FBQUEsSUFDakM7QUFBQSxFQUNGLENBQUM7QUFDSDsiLAogICJuYW1lcyI6IFsibGV2ZWwiLCAieiIsICJyZXBvcnRWYWxpZGF0aW9uRXJyb3IiLCAicHJvZEZsYWciLCAiZW52IiwgImZpbGVVUkxUb1BhdGgiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgImxvZ2dlciIsICJyZXNvbHZlIiwgImxvZ2dlciIsICJyZXNvbHZlIiwgImxvZ2dlciIsICJsb2dnZXIiLCAibG9nZ2VyIiwgImV4aXN0c1N5bmMiLCAiZXhpc3RzU3luYyIsICJsb2dnZXIiLCAiZmlsZU5hbWUiLCAib3JpZ2luIiwgImxvZ2dlciIsICJsb2dnZXIiLCAibG9nZ2VyIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJkaXJuYW1lIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJ0aW1lc3RhbXAiLCAicmVhZEZpbGVTeW5jIiwgImxvZ2dlciIsICJsb2dnZXIiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImRpcm5hbWUiLCAibG9nZ2VyIiwgImxvZ2dlciIsICJyZXNvbHZlIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX19kaXJuYW1lIiwgInJlc29sdmUiLCAibG9nZ2VyIiwgImdldEVudkNvbmZpZyIsICJlbnZDb25maWciLCAibG9nZ2VyIiwgImxvZ2dlciIsICJsb2dnZXIiLCAicmVhZEZpbGVTeW5jIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAibG9nZ2VyIiwgInJlYWRGaWxlU3luYyIsICJsb2dnZXIiLCAicmVzb2x2ZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInByb2plY3RSb290IiwgImxvZ2dlciIsICJsb2dnZXIiLCAibG9nZ2VyIiwgImlzUHJldmlld0J1aWxkIiwgImxvZ2dlciIsICJsb2dnZXIiLCAibG9nZ2VyIiwgImxvZ2dlciIsICJleGlzdHNTeW5jIiwgImV4aXN0c1N5bmMiLCAid2l0aFBhY2thZ2VzIiwgImxvZ2dlciIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX2Rpcm5hbWUiLCAiZGlybmFtZSIsICJyZXNvbHZlIiwgInJlcXVpcmUiLCAicHJveHkiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAibG9nZ2VyIiwgInByb3h5IiwgImxvZ2dlciIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImZpbGVVUkxUb1BhdGgiXQp9Cg==
