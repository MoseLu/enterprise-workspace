import { s as storage, a as syncSettingsToCookie, p as processURL, r as responseInterceptor, B as BtcMessage } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const APP_ENV_CONFIGS = [
  {
    appName: "system-app",
    devHost: "10.80.8.199",
    devPort: "8080",
    preHost: "localhost",
    prePort: "4180",
    prodHost: "bellis.com.cn"
  },
  {
    appName: "admin-app",
    devHost: "10.80.8.199",
    devPort: "8081",
    preHost: "localhost",
    prePort: "4181",
    prodHost: "admin.bellis.com.cn"
  },
  {
    appName: "logistics-app",
    devHost: "10.80.8.199",
    devPort: "8082",
    preHost: "localhost",
    prePort: "4182",
    prodHost: "logistics.bellis.com.cn"
  },
  {
    appName: "quality-app",
    devHost: "10.80.8.199",
    devPort: "8083",
    preHost: "localhost",
    prePort: "4183",
    prodHost: "quality.bellis.com.cn"
  },
  {
    appName: "production-app",
    devHost: "10.80.8.199",
    devPort: "8084",
    preHost: "localhost",
    prePort: "4184",
    prodHost: "production.bellis.com.cn"
  },
  {
    appName: "engineering-app",
    devHost: "10.80.8.199",
    devPort: "8085",
    preHost: "localhost",
    prePort: "4185",
    prodHost: "engineering.bellis.com.cn"
  },
  {
    appName: "finance-app",
    devHost: "10.80.8.199",
    devPort: "8086",
    preHost: "localhost",
    prePort: "4186",
    prodHost: "finance.bellis.com.cn"
  },
  {
    appName: "mobile-app",
    devHost: "10.80.8.199",
    devPort: "8091",
    preHost: "localhost",
    prePort: "4191",
    prodHost: "mobile.bellis.com.cn"
  },
  {
    appName: "docs-app",
    devHost: "localhost",
    devPort: "8092",
    preHost: "localhost",
    prePort: "4192",
    prodHost: "docs.bellis.com.cn"
  },
  {
    appName: "operations-app",
    devHost: "10.80.8.199",
    devPort: "8087",
    preHost: "localhost",
    prePort: "4187",
    prodHost: "operations.bellis.com.cn"
  },
  {
    appName: "layout-app",
    devHost: "10.80.8.199",
    devPort: "8088",
    preHost: "localhost",
    prePort: "4188",
    prodHost: "layout.bellis.com.cn"
  },
  {
    appName: "dashboard-app",
    devHost: "10.80.8.199",
    devPort: "8089",
    preHost: "localhost",
    prePort: "4189",
    prodHost: "dashboard.bellis.com.cn"
  },
  {
    appName: "personnel-app",
    devHost: "10.80.8.199",
    devPort: "8090",
    preHost: "localhost",
    prePort: "4190",
    prodHost: "personnel.bellis.com.cn"
  },
  {
    appName: "home-app",
    devHost: "10.80.8.199",
    devPort: "8095",
    preHost: "localhost",
    prePort: "4195",
    prodHost: "www.bellis.com.cn"
  }
];
function getAppConfig(appName) {
  return APP_ENV_CONFIGS.find((config2) => config2.appName === appName);
}
function getAllDevPorts() {
  try {
    return APP_ENV_CONFIGS.map((config2) => config2.devPort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes("before initialization")) {
      return [];
    }
    throw error;
  }
}
function getAllPrePorts() {
  try {
    return APP_ENV_CONFIGS.map((config2) => config2.prePort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes("before initialization")) {
      return [];
    }
    throw error;
  }
}
const adminAppIdentity = {
  id: "admin",
  name: "管理应用",
  description: "BTC车间管理系统 - 管理应用",
  pathPrefix: "/admin",
  subdomain: "admin.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const logisticsAppIdentity = {
  id: "logistics",
  name: "物流应用",
  description: "BTC车间管理系统 - 物流应用",
  pathPrefix: "/logistics",
  subdomain: "logistics.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const qualityAppIdentity = {
  id: "quality",
  name: "质量应用",
  description: "BTC车间管理系统 - 质量应用",
  pathPrefix: "/quality",
  subdomain: "quality.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const productionAppIdentity = {
  id: "production",
  name: "生产应用",
  description: "BTC车间管理系统 - 生产应用",
  pathPrefix: "/production",
  subdomain: "production.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const engineeringAppIdentity = {
  id: "engineering",
  name: "工程应用",
  description: "BTC车间管理系统 - 工程应用",
  pathPrefix: "/engineering",
  subdomain: "engineering.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const financeAppIdentity = {
  id: "finance",
  name: "财务应用",
  description: "BTC车间管理系统 - 财务应用",
  pathPrefix: "/finance",
  subdomain: "finance.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const operationsAppIdentity = {
  id: "operations",
  name: "运维应用",
  description: "BTC车间管理系统 - 运维应用",
  pathPrefix: "/operations",
  subdomain: "operations.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const systemAppIdentity = {
  id: "system",
  name: "系统主应用",
  description: "BTC车间管理系统 - 系统主应用",
  pathPrefix: "/",
  subdomain: "bellis.com.cn",
  // 修复：使用实际的域名（不带 www）
  type: "main",
  enabled: true,
  version: "1.0.0"
};
const layoutAppIdentity = {
  id: "layout",
  name: "布局应用",
  description: "BTC车间管理系统 - 布局应用",
  pathPrefix: "/",
  subdomain: "layout.bellis.com.cn",
  type: "layout",
  enabled: true,
  version: "1.0.0"
};
const docsSiteAppIdentity = {
  id: "docs",
  name: "文档应用",
  description: "BTC车间管理系统 - 文档应用",
  pathPrefix: "/docs",
  subdomain: "docs.bellis.com.cn",
  type: "docs",
  enabled: true,
  version: "1.0.0"
};
const mobileAppIdentity = {
  id: "mobile",
  name: "移动应用",
  description: "BTC车间管理系统 - 移动应用",
  pathPrefix: "/mobile",
  subdomain: "mobile.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const dashboardAppIdentity = {
  id: "dashboard",
  name: "看板应用",
  description: "BTC车间管理系统 - 看板应用",
  pathPrefix: "/dashboard",
  subdomain: "dashboard.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const personnelAppIdentity = {
  id: "personnel",
  name: "人事应用",
  description: "BTC车间管理系统 - 人事应用",
  pathPrefix: "/personnel",
  subdomain: "personnel.bellis.com.cn",
  type: "sub",
  enabled: true,
  version: "1.0.0"
};
const appFiles = {
  "../apps/admin-app/src/app": { default: adminAppIdentity },
  "../apps/logistics-app/src/app": { default: logisticsAppIdentity },
  "../apps/quality-app/src/app": { default: qualityAppIdentity },
  "../apps/production-app/src/app": { default: productionAppIdentity },
  "../apps/engineering-app/src/app": { default: engineeringAppIdentity },
  "../apps/finance-app/src/app": { default: financeAppIdentity },
  "../apps/operations-app/src/app": { default: operationsAppIdentity },
  "../apps/system-app/src/app": { default: systemAppIdentity },
  "../apps/layout-app/src/app": { default: layoutAppIdentity },
  "../apps/docs-app/src/app": { default: docsSiteAppIdentity },
  "../apps/mobile-app/src/app": { default: mobileAppIdentity },
  "../apps/dashboard-app/src/app": { default: dashboardAppIdentity },
  "../apps/personnel-app/src/app": { default: personnelAppIdentity }
};
const appRegistry = /* @__PURE__ */ (() => {
  return /* @__PURE__ */ new Map();
})();
let isInitialized = false;
function extractAppName(filePath) {
  const match = filePath.match(/apps\/(.+?)-app\//);
  return match && match[1] ? match[1] : "";
}
function validateAppIdentity(identity, appName) {
  if (!identity || typeof identity !== "object") {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：不是对象`);
    return false;
  }
  if (!identity.id || typeof identity.id !== "string") {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：缺少 id`);
    return false;
  }
  if (!identity.name || typeof identity.name !== "string") {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：缺少 name`);
    return false;
  }
  if (!identity.pathPrefix || typeof identity.pathPrefix !== "string") {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：缺少 pathPrefix`);
    return false;
  }
  if (!identity.type || !["main", "sub", "layout", "docs"].includes(identity.type)) {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：type 必须是 main、sub、layout 或 docs`);
    return false;
  }
  if (typeof identity.enabled !== "boolean") {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：enabled 必须是布尔值`);
    return false;
  }
  return true;
}
function scanAndRegisterApps() {
  appRegistry.clear();
  for (const [filePath, appConfigWrapper] of Object.entries(appFiles)) {
    try {
      const appConfig2 = appConfigWrapper.default;
      const appName = extractAppName(filePath);
      if (!appName) {
        continue;
      }
      if (!validateAppIdentity(appConfig2, appName)) {
        continue;
      }
      const identity = {
        ...appConfig2,
        id: appConfig2.id || appName
      };
      appRegistry.set(identity.id, identity);
    } catch (error) {
      console.error(`[app-scanner] ❌ 扫描应用配置失败: ${filePath}`, error);
    }
  }
  return appRegistry;
}
function getAllApps() {
  if (!isInitialized || appRegistry.size === 0) {
    scanAndRegisterApps();
    isInitialized = true;
  }
  return Array.from(appRegistry.values());
}
function getAppById(id) {
  if (!isInitialized || appRegistry.size === 0) {
    scanAndRegisterApps();
    isInitialized = true;
  }
  return appRegistry.get(id);
}
function getSubApps() {
  return getAllApps().filter((app) => app.type === "sub" && app.enabled);
}
function getMainApp() {
  return getAllApps().find((app) => app.type === "main");
}
function getAppByPathPrefix(pathPrefix) {
  return getAllApps().find((app) => app.pathPrefix === pathPrefix);
}
function getAppBySubdomain(subdomain) {
  return getAllApps().find((app) => app.subdomain === subdomain);
}
const __vite_import_meta_env__ = {};
var define_process_env_default = {};
const configSchemes = {
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
function getConfigScheme() {
  if (typeof import.meta === "undefined" || !__vite_import_meta_env__) {
    return "default";
  }
  return "default";
}
function getEnvironment() {
  if (typeof window === "undefined") {
    const prodFlag2 = (typeof import.meta !== "undefined" && __vite_import_meta_env__ && true) ?? true;
    return prodFlag2 ? "production" : "development";
  }
  const hostname = window.location.hostname;
  const port = window.location.port || "";
  if (hostname.includes("bellis.com.cn")) {
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
  }
  const prodFlag = (typeof import.meta !== "undefined" && __vite_import_meta_env__ && true) ?? false;
  return prodFlag ? "production" : "development";
}
function getEnvConfig() {
  const scheme = getConfigScheme();
  const env = getEnvironment();
  const config2 = configSchemes[scheme][env];
  if (config2.cdn?.staticAssetsUrl) {
    let envCdnUrl;
    if (typeof window !== "undefined") {
      if (typeof import.meta !== "undefined" && __vite_import_meta_env__) {
        envCdnUrl = void 0;
      }
    } else {
      envCdnUrl = define_process_env_default.CDN_STATIC_ASSETS_URL || define_process_env_default.VITE_CDN_STATIC_ASSETS_URL;
    }
    if (envCdnUrl) {
      return {
        ...config2,
        cdn: {
          staticAssetsUrl: envCdnUrl
        }
      };
    }
  }
  return config2;
}
function isMainApp(routePath, locationPath, isStandalone) {
  if (isStandalone === void 0) {
    if (typeof window === "undefined") {
      return true;
    }
    const qiankunWindow = window.__POWERED_BY_QIANKUN__;
    isStandalone = !qiankunWindow;
  }
  const env = getEnvironment();
  const path = locationPath || routePath || (typeof window !== "undefined" ? window.location.pathname : "");
  if (isStandalone && env === "development") {
    if (path === "/login" || path === "/forget-password" || path === "/register") {
      return false;
    }
    const apps2 = getAllApps();
    for (const app of apps2) {
      if (app.type === "sub" && app.enabled) {
        const normalizedPathPrefix = app.pathPrefix.endsWith("/") ? app.pathPrefix.slice(0, -1) : app.pathPrefix;
        const normalizedPath = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
        if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + "/")) {
          return false;
        }
      }
    }
    return true;
  }
  if (isStandalone) {
    if (path === "/login" || path === "/forget-password" || path === "/register") {
      return false;
    }
    return true;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  if (path === "/login" || path === "/forget-password" || path === "/register") {
    return false;
  }
  if (env === "production") {
    const app = getAllApps().find((a) => a.subdomain === hostname);
    if (app && app.type === "sub") {
      return false;
    }
    return true;
  }
  const apps = getAllApps();
  for (const app of apps) {
    if (app.type === "sub" && app.enabled) {
      const normalizedPathPrefix = app.pathPrefix.endsWith("/") ? app.pathPrefix.slice(0, -1) : app.pathPrefix;
      const normalizedPath = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
      const isMatch = normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + "/");
      if (isMatch) {
        return false;
      }
    }
  }
  if (path === "/" && locationPath && locationPath !== "/") {
    const normalizedLocationPath = locationPath.endsWith("/") && locationPath !== "/" ? locationPath.slice(0, -1) : locationPath;
    for (const app of apps) {
      if (app.type === "sub" && app.enabled) {
        const normalizedPathPrefix = app.pathPrefix.endsWith("/") ? app.pathPrefix.slice(0, -1) : app.pathPrefix;
        const isMatch = normalizedLocationPath === normalizedPathPrefix || normalizedLocationPath.startsWith(normalizedPathPrefix + "/");
        if (isMatch) {
          return false;
        }
      }
    }
  }
  return true;
}
function getCurrentSubApp() {
  const env = getEnvironment();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  if (env === "production" && hostname) {
    const app = getAllApps().find((a) => a.subdomain === hostname);
    if (app && app.type === "sub" && app.enabled) {
      return app.id;
    }
    return null;
  }
  const apps = getAllApps();
  for (const app of apps) {
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
let _currentEnvironment = null;
let _envConfig = null;
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
getCurrentEnvironment();
const envConfig = getCurrentEnvConfig();
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction$1 = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction$1(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$1(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$1(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$1(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$1(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
var utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$1,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config2, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config2 && (this.config = config2);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config2, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError$1.call(axiosError, msg, errCode, config2, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index2) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index2, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
var transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
var URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
var FormData$1 = typeof FormData !== "undefined" ? FormData : null;
var Blob$1 = typeof Blob !== "undefined" ? Blob : null;
var platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
var utils = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
});
var platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index2) {
    let name = path[index2++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index2 >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index2);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config2 = this || defaults;
  const context = response || config2;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config2, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config2, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config2, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
var isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
var cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure, sameSite) {
      if (typeof document === "undefined") return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils$1.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils$1.isString(path)) {
        cookie.push(`path=${path}`);
      }
      if (utils$1.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils$1.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config3 = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config3[prop] = configValue);
  });
  return config3;
}
var resolveConfig = (config2) => {
  const newConfig = mergeConfig$1({}, config2);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config2.params, config2.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils$1.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhrAdapter = isXHRAdapterSupported && function(config2) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config2);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config2,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config2, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config2, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config2,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config2, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config2));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = utils$1;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$1.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder
} = utils$1.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$1.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config2) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config2);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$1.isBlob(body)) {
      return body.size;
    }
    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$1.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config2) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config2);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config2);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config: config2,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config2, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError$1.from(err, err && err.code, config2, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config2) => {
  let env = config2 && config2.env || {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i = len, seed, target, map = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
function getAdapter$1(adapters2, config2) {
  adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
  const { length } = adapters2;
  let nameOrAdapter;
  let adapter;
  const rejectedReasons = {};
  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters2[i];
    let id;
    adapter = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter === void 0) {
        throw new AxiosError$1(`Unknown adapter '${id}'`);
      }
    }
    if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config2)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter;
  }
  if (!adapter) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError$1(
      `There is no suitable adapter to dispatch the request ` + s,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter;
}
var adapters = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: getAdapter$1,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters
};
function throwIfCancellationRequested(config2) {
  if (config2.cancelToken) {
    config2.cancelToken.throwIfRequested();
  }
  if (config2.signal && config2.signal.aborted) {
    throw new CanceledError$1(null, config2);
  }
}
function dispatchRequest(config2) {
  throwIfCancellationRequested(config2);
  config2.headers = AxiosHeaders$1.from(config2.headers);
  config2.data = transformData.call(
    config2,
    config2.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config2.method) !== -1) {
    config2.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config2.adapter || defaults.adapter, config2);
  return adapter(config2).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config2);
    response.data = transformData.call(
      config2,
      config2.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config2);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config2,
          config2.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.13.2";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
var validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config2) {
    try {
      return await this._request(configOrUrl, config2);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config2) {
    if (typeof configOrUrl === "string") {
      config2 = config2 || {};
      config2.url = configOrUrl;
    } else {
      config2 = configOrUrl || {};
    }
    config2 = mergeConfig$1(this.defaults, config2);
    const { transitional: transitional2, paramsSerializer, headers } = config2;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config2.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config2.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config2.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config2.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config2, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config2.method = (config2.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config2.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config2.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config2) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config2);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config2;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config2) {
    config2 = mergeConfig$1(this.defaults, config2);
    const fullPath = buildFullPath(config2.baseURL, config2.url, config2.allowAbsoluteUrls);
    return buildURL(fullPath, config2.params, config2.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config2) {
    return this.request(mergeConfig$1(config2 || {}, {
      method,
      url,
      data: (config2 || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config2) {
      return this.request(mergeConfig$1(config2 || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config2, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config2, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index2 = this._listeners.indexOf(listener);
    if (index2 !== -1) {
      this._listeners.splice(index2, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
function getCookieDomain() {
  if (typeof window === "undefined") {
    return void 0;
  }
  const hostname = window.location.hostname;
  if (hostname.includes("bellis.com.cn")) {
    return ".bellis.com.cn";
  }
  return void 0;
}
function getCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(value);
      } catch (e) {
        return value;
      }
    }
  }
  return null;
}
function setCookie(name, value, days = 7, options) {
  if (typeof document === "undefined") {
    return;
  }
  let expires = "";
  if (days) {
    const date = /* @__PURE__ */ new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
    expires = "; expires=" + date.toUTCString();
  }
  const path = options?.path || "/";
  let cookieString = `${name}=${value}${expires}; path=${path}`;
  const isPreview = window.location.port.startsWith("41");
  const isHttps = window.location.protocol === "https:";
  if (options?.sameSite) {
    if (options.sameSite === "None" && !isHttps) ;
    else {
      cookieString += `; SameSite=${options.sameSite}`;
    }
  } else if (isHttps) {
    cookieString += "; SameSite=None";
  } else ;
  if (isHttps && (options?.secure || isPreview && isHttps)) {
    cookieString += "; Secure";
  }
  if (options?.domain) {
    cookieString += `; Domain=${options.domain}`;
  }
  document.cookie = cookieString;
}
function deleteCookie(name, options) {
  if (typeof document === "undefined") {
    return;
  }
  const path = options?.path || "/";
  const domain = options?.domain;
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  if (domain) {
    cookieString += `; Domain=${domain}`;
  }
  document.cookie = cookieString;
}
const getUserFromCookie = () => {
  const userCookie = getCookie("btc_user");
  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      if (parsed && typeof parsed === "object" && "value" in parsed && !("name" in parsed)) {
        return parsed.value;
      }
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
};
const getItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
  }
};
const getAllSettings = () => {
  const settings = storage.get("settings");
  return settings || {};
};
const setAllSettings = (settings) => {
  syncSettingsToCookie(settings);
};
const userStorage = {
  get: () => {
    const cookieUser = getUserFromCookie();
    if (cookieUser) {
      return cookieUser;
    }
    const storageUser = storage.get("user");
    if (storageUser) {
      return storageUser;
    }
    try {
      const oldUserStr = localStorage.getItem("user");
      if (oldUserStr) {
        try {
          const oldUser = JSON.parse(oldUserStr);
          storage.set("user", oldUser);
          return oldUser;
        } catch {
          return null;
        }
      }
    } catch {
    }
    return null;
  },
  set: (user) => {
    const processedUser = { ...user };
    if (processedUser.name) {
      processedUser.username = processedUser.name;
      delete processedUser.name;
    }
    storage.set("user", processedUser);
  },
  remove: () => {
    try {
      const domain = getCookieDomain();
      if (domain !== void 0) {
        deleteCookie("btc_user", {
          domain,
          path: "/"
        });
      } else {
        deleteCookie("btc_user", {
          path: "/"
        });
      }
    } catch {
    }
    removeItem("btc_user");
  },
  clear: () => {
    userStorage.remove();
  },
  /**
   * 获取头像（从统一的 btc_user 存储中获取）
   */
  getAvatar() {
    const user = this.get();
    if (user?.avatar) {
      return user.avatar;
    }
    const oldAvatar = getItem("user_avatar");
    if (oldAvatar) {
      const currentUser = user || {};
      this.set({ ...currentUser, avatar: oldAvatar });
      return oldAvatar;
    }
    return null;
  },
  /**
   * 设置头像（存储到统一的 btc_user 中，不创建独立的 user_avatar key）
   */
  setAvatar(avatar) {
    const user = this.get() || {};
    this.set({ ...user, avatar });
  },
  /**
   * 获取用户名（从统一的 btc_user 存储中获取）
   * 注意：从 username 字段读取，不再使用 name 字段
   */
  getName() {
    const user = this.get();
    if (user?.username) {
      return user.username;
    }
    if (user?.name) {
      const currentUser = { ...user };
      currentUser.username = currentUser.name;
      delete currentUser.name;
      this.set(currentUser);
      return currentUser.username;
    }
    const oldName = getItem("user_name");
    if (oldName) {
      const currentUser = user || {};
      this.set({ ...currentUser, username: oldName });
      return oldName;
    }
    return null;
  },
  /**
   * 设置用户名（存储到统一的 btc_user 中，不创建独立的 user_name key）
   * 注意：实际存储为 username 字段，不存储 name 字段
   */
  setName(name) {
    const user = this.get() || {};
    this.set({ ...user, username: name });
  },
  /**
   * 获取用户名（登录用）
   */
  getUsername() {
    const user = this.get();
    if (user?.username) {
      return user.username;
    }
    const oldUsername = getItem("username");
    if (oldUsername) {
      const currentUser = user || {};
      this.set({ ...currentUser, username: oldUsername });
      return oldUsername;
    }
    return null;
  },
  /**
   * 设置用户名（登录用，存储到统一的 btc_user 中，不创建独立的 username key）
   */
  setUsername(username) {
    const user = this.get() || {};
    this.set({ ...user, username });
  }
};
const appStorage = {
  /**
   * 初始化存储管理器
   */
  init(_version) {
  },
  auth: {
    getToken: () => {
      const cookieToken = getCookie("access_token");
      if (cookieToken) {
        return cookieToken;
      }
      return getItem("token") || getItem("access_token");
    },
    setToken: (_token) => {
      removeItem("token");
      removeItem("access_token");
      const user = userStorage.get() || {};
      if (user.token) {
        delete user.token;
        userStorage.set(user);
      }
    },
    removeToken: () => {
      removeItem("token");
      removeItem("access_token");
      const user = userStorage.get() || {};
      if (user.token) {
        delete user.token;
        userStorage.set(user);
      }
    },
    clear: () => {
      removeItem("token");
      removeItem("access_token");
      removeItem("refreshToken");
      const user = userStorage.get() || {};
      if (user.token) {
        delete user.token;
        userStorage.set(user);
      }
    }
  },
  user: userStorage,
  settings: {
    get: () => {
      return getAllSettings();
    },
    set: (data) => {
      const current = getAllSettings();
      setAllSettings({ ...current, ...data });
    },
    getItem: (key) => {
      const settings = getAllSettings();
      return settings[key] ?? null;
    },
    setItem: (key, value) => {
      const settings = getAllSettings();
      settings[key] = value;
      setAllSettings(settings);
    },
    removeItem: (key) => {
      const settings = getAllSettings();
      delete settings[key];
      setAllSettings(settings);
    }
  }
};
var MenuTypeEnum;
(function(MenuTypeEnum2) {
  MenuTypeEnum2["LEFT"] = "left";
  MenuTypeEnum2["TOP"] = "top";
  MenuTypeEnum2["TOP_LEFT"] = "top-left";
  MenuTypeEnum2["DUAL_MENU"] = "dual-menu";
})(MenuTypeEnum || (MenuTypeEnum = {}));
var SystemThemeEnum;
(function(SystemThemeEnum2) {
  SystemThemeEnum2["DARK"] = "dark";
  SystemThemeEnum2["LIGHT"] = "light";
  SystemThemeEnum2["AUTO"] = "auto";
})(SystemThemeEnum || (SystemThemeEnum = {}));
var MenuThemeEnum;
(function(MenuThemeEnum2) {
  MenuThemeEnum2["DARK"] = "dark";
  MenuThemeEnum2["LIGHT"] = "light";
  MenuThemeEnum2["DESIGN"] = "design";
})(MenuThemeEnum || (MenuThemeEnum = {}));
var ContainerWidthEnum;
(function(ContainerWidthEnum2) {
  ContainerWidthEnum2["FULL"] = "100%";
  ContainerWidthEnum2["BOXED"] = "1200px";
})(ContainerWidthEnum || (ContainerWidthEnum = {}));
var BoxStyleType;
(function(BoxStyleType2) {
  BoxStyleType2["BORDER"] = "border-mode";
  BoxStyleType2["SHADOW"] = "shadow-mode";
})(BoxStyleType || (BoxStyleType = {}));
const systemSettingConfig = {
  // 默认设置
  default: {
    // 主题模式
    themeMode: "light",
    // 语言
    locale: "zh-CN",
    // 菜单设置
    defaultMenuWidth: 240,
    defaultMenuTheme: MenuThemeEnum.DESIGN,
    // 主题设置
    defaultSystemThemeType: "auto",
    defaultSystemThemeColor: "#409eff",
    // 界面显示设置
    defaultShowCrumbs: true,
    defaultShowWorkTab: true,
    defaultShowGlobalSearch: true,
    defaultColorWeak: false,
    // 布局设置
    defaultBoxBorderMode: false,
    defaultUniqueOpened: false,
    defaultTabStyle: "tab-default",
    defaultPageTransition: "slide-left",
    defaultCustomRadius: "0.25"
  }
};
var appConfig = {
  // 系统名称
  name: "BTC车间管理",
  // 系统简称
  shortName: "BTC ShopFlow",
  // 系统英文名
  enName: "BTC Shop Flow Management System",
  // 系统版本
  version: "1.0.0",
  // Logo 路径
  logo: "/logo.png",
  // Favicon 路径
  favicon: "/favicon.ico",
  // 公司/组织信息
  company: {
    name: "BTC",
    fullName: "BTC Technology",
    fullNameCn: "拜里斯",
    fullNameEn: "Bellis Technology",
    website: "https://www.btc.com",
    // Slogan 使用国际化键
    sloganKey: "app.slogan"
  },
  // Copyright 信息
  copyright: {
    year: (/* @__PURE__ */ new Date()).getFullYear(),
    text: "© ".concat((/* @__PURE__ */ new Date()).getFullYear(), " BTC. All rights reserved.")
  },
  // 联系方式
  contact: {
    email: "support@btc.com",
    phone: "400-123-4567",
    address: "深圳市南山区科技园"
  },
  // 加载页面文案
  loading: {
    title: "正在加载系统资源...",
    subTitle: "初次加载可能需要较多时间，请耐心等待"
  },
  // 路由配置
  router: {
    // 路由模式：'hash' | 'history'
    mode: "history",
    // 页面切换动画
    transition: "slide"
  },
  // 布局配置
  layout: {
    // 侧边栏宽度
    sidebarWidth: 210,
    // 侧边栏折叠宽度
    sidebarCollapseWidth: 64,
    // 顶栏高度
    topbarHeight: 48,
    // 标签栏高度
    tabbarHeight: 39
  },
  // 系统设置默认值（从子配置导入）
  systemSetting: systemSettingConfig
};
const config = {
  // 应用配置
  app: appConfig,
  // API 配置（从统一环境配置读取）
  api: {
    baseURL: envConfig.api.baseURL,
    timeout: envConfig.api.timeout
  },
  // 国际化配置
  i18n: {
    // 默认语言
    locale: localStorage.getItem("locale") || "zh-CN"
  },
  // 主题配置
  theme: {
    // 默认主题模式
    mode: localStorage.getItem("theme-mode") || "light"
  },
  // 文档配置
  docs: {
    url: envConfig.docs.url,
    port: envConfig.docs.port
  },
  // WebSocket 配置
  ws: {
    url: envConfig.ws.url
  },
  // 上传配置
  upload: {
    url: envConfig.upload.url
  }
};
class Http {
  constructor(baseURL = "") {
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      if (baseURL.startsWith("http://")) {
        console.warn("[HTTP] 构造函数：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:", baseURL);
        baseURL = "/api";
        localStorage.removeItem("dev_api_base_url");
      } else if (baseURL && baseURL !== "/api") {
        console.warn("[HTTP] 构造函数：检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:", baseURL);
        baseURL = "/api";
      }
    }
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 12e4,
      // 增加到 120 秒（2分钟），避免长时间请求超时
      withCredentials: true
      // 始终设置为 true，发送 cookie
    });
    this.axiosInstance.defaults.baseURL = this.baseURL;
    const originalRequest = this.axiosInstance.request;
    this.axiosInstance.request = (config2) => {
      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        if (config2.baseURL && config2.baseURL.startsWith("http://")) {
          console.error("[HTTP] 全局拦截器：检测到 HTTPS 页面，强制修复 HTTP baseURL:", config2.baseURL);
          config2.baseURL = "/api";
          this.axiosInstance.defaults.baseURL = "/api";
        }
        if (config2.url && config2.url.startsWith("http://")) {
          console.error("[HTTP] 全局拦截器：检测到 HTTPS 页面，强制修复 HTTP url:", config2.url);
          try {
            const urlObj = new URL(config2.url);
            config2.url = urlObj.pathname + urlObj.search;
            config2.baseURL = "/api";
            this.axiosInstance.defaults.baseURL = "/api";
          } catch (e) {
            config2.url = config2.url.replace(/^https?:\/\/[^/]+/, "");
            config2.baseURL = "/api";
            this.axiosInstance.defaults.baseURL = "/api";
          }
        }
        const finalURL = (config2.baseURL || "") + (config2.url || "");
        if (finalURL.startsWith("http://")) {
          console.error("[HTTP] 全局拦截器：检测到 HTTPS 页面，强制修复最终 URL:", finalURL);
          config2.baseURL = "/api";
          this.axiosInstance.defaults.baseURL = "/api";
          if (config2.url && config2.url.startsWith("http://")) {
            try {
              const urlObj = new URL(config2.url);
              config2.url = urlObj.pathname + urlObj.search;
            } catch (e) {
              config2.url = config2.url.replace(/^https?:\/\/[^/]+/, "");
            }
          }
        }
      }
      return originalRequest.call(this.axiosInstance, config2);
    };
    this.axiosInstance.interceptors.request.use(
      (config2) => {
        if (typeof window !== "undefined" && window.location.protocol === "https:") {
          const stored = localStorage.getItem("dev_api_base_url");
          if (stored && stored !== "/api") {
            console.warn("[HTTP] HTTPS 页面：清理 localStorage 中的非 /api baseURL:", stored);
            localStorage.removeItem("dev_api_base_url");
          }
          config2.baseURL = "/api";
          this.axiosInstance.defaults.baseURL = "/api";
          if (config2.url) {
            const processed = processURL("/api", config2.url);
            config2.url = processed.url;
            config2.baseURL = "/api";
          }
          if (config2.baseURL && config2.baseURL.startsWith("http://")) {
            console.error("[HTTP] 严重错误：HTTPS 页面下 baseURL 仍然是 HTTP URL，强制修复为 /api");
            config2.baseURL = "/api";
            this.axiosInstance.defaults.baseURL = "/api";
          }
          return config2;
        }
        const dynamicBaseURL = getDynamicBaseURL();
        if (config2.url) {
          const processed = processURL(dynamicBaseURL, config2.url);
          config2.url = processed.url;
          config2.baseURL = processed.baseURL;
        } else {
          config2.baseURL = dynamicBaseURL;
        }
        this.axiosInstance.defaults.baseURL = config2.baseURL;
        const token = getCookie("access_token");
        if (token) {
          config2.headers["Authorization"] = `Bearer ${token}`;
        }
        config2.withCredentials = true;
        config2.headers["X-Tenant-Id"] = "INTRA_1758330466";
        if (typeof window !== "undefined") {
          const hostname = window.location.hostname;
          const port = window.location.port || "";
          const isProduction = hostname.includes("bellis.com.cn") && !port.startsWith("41") && port !== "5173" && port !== "3000" && hostname !== "localhost" && !hostname.startsWith("127.0.0.1") && !hostname.startsWith("10.") && !hostname.startsWith("192.168.");
          if (isProduction) {
            config2.headers["x-forward-host"] = "bellis.com.cn";
          }
        }
        const isFormData2 = config2.data instanceof FormData || config2.data && config2.data.constructor?.name === "FormData";
        if (!isFormData2) {
          config2.headers["Content-Type"] = "application/json";
        } else {
          delete config2.headers["Content-Type"];
        }
        return config2;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    const interceptor = responseInterceptor.createResponseInterceptor();
    const onFulfilled = (response) => {
      const isLoginResponse = response.config?.url?.includes("/login");
      const result = interceptor.onFulfilled(response);
      if (isLoginResponse) {
        const originalResponseData = response.data;
        const isLoginSuccess = originalResponseData && typeof originalResponseData === "object" && originalResponseData.code === 200;
        if (isLoginSuccess) {
          const currentSettings = appStorage.settings.get() || {};
          appStorage.settings.set({ ...currentSettings, is_logged_in: true });
          if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
            try {
              sessionStorage.removeItem("__btc_user_check_polling_state");
            } catch (error) {
            }
          }
          try {
            __vitePreload(async () => {
              const { startUserCheckPolling } = await import("https://all.bellis.com.cn/system-app/assets/vendor-CQyebC7G.js").then(function(n) {
                return n.dz;
              });
              return { startUserCheckPolling };
            }, true ? [] : void 0).then(({ startUserCheckPolling }) => {
              startUserCheckPolling(true);
            }).catch((error) => {
              if (false) ;
            });
          } catch (error) {
          }
          try {
            __vitePreload(async () => {
              const { useCrossDomainBridge } = await import("https://all.bellis.com.cn/system-app/assets/vendor-CQyebC7G.js").then(function(n) {
                return n.dA;
              });
              return { useCrossDomainBridge };
            }, true ? [] : void 0).then(({ useCrossDomainBridge }) => {
              const bridge = useCrossDomainBridge();
              bridge.sendMessage("login", { timestamp: Date.now() });
              if (false) ;
            }).catch((error) => {
              if (false) ;
            });
          } catch (error) {
          }
          let tokenFromBody = null;
          if (originalResponseData) {
            tokenFromBody = originalResponseData.token || originalResponseData.accessToken;
          }
          if (!tokenFromBody && result) {
            if (typeof result === "object" && result !== null) {
              tokenFromBody = result.token || result.accessToken;
            }
          }
          if (tokenFromBody) {
            appStorage.auth.setToken(tokenFromBody);
            const isHttps = window.location.protocol === "https:";
            const domain = getCookieDomain();
            setCookie("access_token", tokenFromBody, 7, {
              ...isHttps && { sameSite: "None" },
              // IP 地址 + HTTP：不设置 SameSite
              secure: isHttps,
              // 仅在 HTTPS 时设置 Secure
              path: "/",
              ...domain !== void 0 && { domain }
              // 生产环境支持跨子域名共享
            });
          }
        }
      }
      return result;
    };
    const onRejected = async (error) => {
      return interceptor.onRejected(error);
    };
    this.axiosInstance.interceptors.response.use(
      onFulfilled,
      onRejected
    );
  }
  async get(url, params) {
    return this.axiosInstance.get(url, { params });
  }
  async post(url, data) {
    return this.axiosInstance.post(url, data);
  }
  async put(url, data) {
    return this.axiosInstance.put(url, data);
  }
  async delete(url, data) {
    return this.axiosInstance.delete(url, { data });
  }
  async request(options) {
    return this.axiosInstance.request(options);
  }
  getRetryStatus() {
    return { retryCount: 0, isRetrying: false };
  }
  resetRetry() {
  }
  recreateResponseInterceptor() {
  }
  /**
   * 动态修改 baseURL（用于开发环境切换 API 服务器）
   * 注意：在开发环境中，可以直接使用完整 URL 或 /api 路径
   * 但在 HTTPS 页面下，强制使用 /api，不允许 HTTP URL
   */
  setBaseURL(baseURL) {
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      if (baseURL.startsWith("http://")) {
        console.warn("[HTTP] 检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:", baseURL);
        baseURL = "/api";
        localStorage.removeItem("dev_api_base_url");
      } else if (baseURL !== "/api") {
        console.warn("[HTTP] 检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:", baseURL);
        baseURL = "/api";
      }
    }
    this.baseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
  }
  /**
   * 获取当前的 baseURL
   */
  getBaseURL() {
    return this.baseURL;
  }
}
function getDynamicBaseURL() {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    const stored = localStorage.getItem("dev_api_base_url");
    if (stored && stored !== "/api") {
      console.warn("[HTTP] HTTPS 页面：清理 localStorage 中的非 /api baseURL:", stored);
      localStorage.removeItem("dev_api_base_url");
    }
    return "/api";
  }
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("dev_api_base_url");
    if (stored && stored !== "/api") {
      console.warn("[HTTP] 清理 localStorage 中的非 /api baseURL:", stored);
      localStorage.removeItem("dev_api_base_url");
    }
  }
  return config.api.baseURL;
}
function getInitialBaseURL() {
  const baseURL = getDynamicBaseURL();
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (baseURL.startsWith("http://")) {
      console.error("[HTTP] 初始化：检测到 HTTPS 页面，强制修复 HTTP baseURL:", baseURL);
      return "/api";
    }
    if (baseURL && baseURL !== "/api") {
      console.warn("[HTTP] 初始化：检测到 HTTPS 页面，强制使用 /api，忽略 baseURL:", baseURL);
      return "/api";
    }
  }
  return baseURL;
}
let _httpInstance = null;
function createHttpInstance() {
  if (!_httpInstance) {
    _httpInstance = new Http(getInitialBaseURL());
  }
  return _httpInstance;
}
const http = new Proxy({}, {
  get(_target, prop) {
    const instance = createHttpInstance();
    const value = instance[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    const instance = createHttpInstance();
    instance[prop] = value;
    return true;
  }
});
var http$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Http,
  http
});
const DEFAULT_SUCCESS_MESSAGE = "操作成功";
const DEFAULT_ERROR_MESSAGE = "操作失败，请稍后重试";
function resolveShouldNotifySuccess(method, options) {
  if (options?.notifySuccess !== void 0) {
    return options.notifySuccess;
  }
  return method !== "get";
}
function resolveMessage(input, payload, fallback) {
  if (!input) {
    return fallback;
  }
  const message = typeof input === "function" ? input(payload) : input;
  if (!message) {
    return null;
  }
  return message;
}
async function executeRequest(executor, method, options) {
  const {
    silent = false,
    onSuccess,
    onError,
    successMessage,
    notifyError = false,
    errorMessage
  } = options || {};
  const shouldNotifySuccess = !silent && resolveShouldNotifySuccess(method, options);
  const shouldNotifyError = !silent && notifyError;
  try {
    const data = await executor();
    onSuccess?.(data);
    if (shouldNotifySuccess) {
      const message = resolveMessage(successMessage, data, DEFAULT_SUCCESS_MESSAGE);
      if (message) {
        BtcMessage.success(message);
      }
    }
    return data;
  } catch (error) {
    onError?.(error);
    if (shouldNotifyError) {
      const message = resolveMessage(errorMessage, error, DEFAULT_ERROR_MESSAGE);
      if (message) {
        BtcMessage.error(message);
      }
    }
    throw error;
  }
}
const requestAdapter = {
  get(url, params, options) {
    return executeRequest(() => http.get(url, params), "get", options);
  },
  post(url, data, options) {
    return executeRequest(() => http.post(url, data), "post", options);
  },
  put(url, data, options) {
    return executeRequest(() => http.put(url, data), "put", options);
  },
  delete(url, data, options) {
    return executeRequest(() => http.delete(url, data), "delete", options);
  },
  request(config2, options) {
    return executeRequest(() => http.request(config2), "request", options);
  }
};
const getRetryStatus = () => http.getRetryStatus();
const baseUrl = "/system/auth";
const authApi = {
  /**
   * 获取验证码
   * @param params 验证码参数（高度、宽度、颜色等）
   * @returns 验证码信息（包含 captchaId 和图片数据）
   */
  getCaptcha(params) {
    return requestAdapter.get(`${baseUrl}/captcha`, params);
  },
  /**
   * 发送邮箱验证码
   * @param data 邮箱和验证码类型
   * @returns Promise<void>
   */
  sendEmailCode(data) {
    return requestAdapter.post(`${baseUrl}/code/email/send`, data, { notifySuccess: false });
  },
  /**
   * 发送手机号验证码
   * @param data 手机号和验证码类型
   * @returns Promise<void>
   */
  sendSmsCode(data) {
    return requestAdapter.post(`${baseUrl}/code/sms/send`, data, { notifySuccess: false });
  },
  /**
   * 用户检查（检查用户登录状态，不属于 EPS 请求）
   * @returns 用户状态信息
   */
  userCheck() {
    return requestAdapter.get(`${baseUrl}/user-check`);
  },
  /**
   * 登录（账号密码）
   * @param data 登录信息（用户名、密码、验证码等）
   * @returns 登录响应（包含 token 和用户信息）
   */
  login(data) {
    return requestAdapter.post(`${baseUrl}/login`, data, { notifySuccess: false });
  },
  /**
   * 手机号登录
   * @param data 手机号和短信验证码
   * @returns 登录响应（包含 token 和用户信息）
   */
  loginBySms(data) {
    return requestAdapter.post(`${baseUrl}/login/sms`, data, { notifySuccess: false });
  },
  /**
   * 退出登录
   * @returns Promise<void>
   */
  logout() {
    return requestAdapter.get(`${baseUrl}/logout`);
  },
  /**
   * 批量退出登录
   * @param data 用户ID列表
   * @returns Promise<void>
   */
  logoutBatch(data) {
    return requestAdapter.post(`${baseUrl}/logout/batch`, data, { notifySuccess: false });
  },
  /**
   * 用户注册
   * @param data 注册信息（用户名、手机号、密码、验证码等）
   * @returns Promise<void>
   */
  register(data) {
    return requestAdapter.post(`${baseUrl}/register`, data, { notifySuccess: false });
  },
  /**
   * 重置密码
   * @param data 重置密码信息（手机号、验证码、新密码）
   * @returns Promise<void>
   */
  resetPassword(data) {
    return requestAdapter.post(`${baseUrl}/reset/password`, data, { notifySuccess: false });
  },
  /**
   * 验证码校验
   * @param data 验证码ID和验证码值
   * @returns Promise<void>
   */
  verifyCode(data) {
    return requestAdapter.post(`${baseUrl}/verify/code`, data, { notifySuccess: false });
  },
  /**
   * 验证短信验证码（用于身份验证，不登录）
   * @param data 手机号和短信验证码
   * @returns Promise<void>
   */
  verifySmsCode(data) {
    return requestAdapter.post(`${baseUrl}/verify/sms`, data, { notifySuccess: false });
  },
  /**
   * 验证邮箱验证码（用于身份验证）
   * @param data 邮箱和验证码
   * @returns Promise<void>
   */
  verifyEmailCode(data) {
    return requestAdapter.post(`${baseUrl}/verify/email`, data, { notifySuccess: false });
  }
};
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  authApi
});
export {
  index as A,
  BoxStyleType as B,
  ContainerWidthEnum as C,
  MenuTypeEnum as M,
  SystemThemeEnum as S,
  __vitePreload as _,
  getAppById as a,
  getAppBySubdomain as b,
  getAppByPathPrefix as c,
  getSubApps as d,
  getEnvironment as e,
  getMainApp as f,
  getCurrentSubApp as g,
  getAllApps as h,
  getAppConfig as i,
  getAllDevPorts as j,
  getAllPrePorts as k,
  getEnvConfig as l,
  isMainApp as m,
  axios as n,
  authApi as o,
  http as p,
  appConfig as q,
  requestAdapter as r,
  appStorage as s,
  getRetryStatus as t,
  getCookieDomain as u,
  deleteCookie as v,
  config as w,
  MenuThemeEnum as x,
  getCookie as y,
  http$1 as z
};
