import { _ as __vitePreload } from "./index-CeQEKVXA.js";
import "@btc/shared-core";
import "@btc/shared-utils";
import "@btc/shared-components";
function showLoading() {
  try {
    const shouldShowLoading = sessionStorage.getItem("__BTC_NAV_LOADING__") === "1";
    if (shouldShowLoading) {
      const loadingEl = document.getElementById("Loading");
      if (loadingEl) {
        const isAlreadyVisible = loadingEl.style.display === "flex" || loadingEl.style.visibility === "visible" || !loadingEl.classList.contains("is-hide");
        if (!isAlreadyVisible) {
          loadingEl.style.setProperty("display", "flex", "important");
          loadingEl.style.setProperty("visibility", "visible", "important");
          loadingEl.style.setProperty("opacity", "1", "important");
          loadingEl.classList.remove("is-hide");
        }
      }
    }
  } catch (e) {
  }
}
function removeLoadingElement() {
  const loadingEl = document.getElementById("Loading");
  if (loadingEl) {
    loadingEl.style.setProperty("display", "none", "important");
    loadingEl.style.setProperty("visibility", "hidden", "important");
    loadingEl.style.setProperty("opacity", "0", "important");
    loadingEl.style.setProperty("pointer-events", "none", "important");
    loadingEl.classList.add("is-hide");
    setTimeout(() => {
      try {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        } else if (loadingEl.isConnected) {
          loadingEl.remove();
        }
      } catch (error) {
        loadingEl.style.setProperty("display", "none", "important");
      }
    }, 350);
  }
}
function clearNavigationFlag() {
  try {
    sessionStorage.removeItem("__BTC_NAV_LOADING__");
  } catch (e) {
  }
}
function getCurrentAppId() {
  const hostname = window.location.hostname;
  const subdomainMap = {
    "admin.bellis.com.cn": "admin",
    "logistics.bellis.com.cn": "logistics",
    "engineering.bellis.com.cn": "engineering",
    "quality.bellis.com.cn": "quality",
    "production.bellis.com.cn": "production",
    "finance.bellis.com.cn": "finance",
    "monitor.bellis.com.cn": "monitor"
  };
  if (subdomainMap[hostname]) {
    return subdomainMap[hostname];
  }
  const pathname = window.location.pathname;
  if (pathname.startsWith("/admin")) {
    return "admin";
  } else if (pathname.startsWith("/logistics")) {
    return "logistics";
  } else if (pathname.startsWith("/engineering")) {
    return "engineering";
  } else if (pathname.startsWith("/quality")) {
    return "quality";
  } else if (pathname.startsWith("/production")) {
    return "production";
  } else if (pathname.startsWith("/finance")) {
    return "finance";
  } else if (pathname.startsWith("/monitor")) {
    return "monitor";
  }
  return "admin";
}
async function injectAppConfigFromManifest(appId) {
  try {
    const [
      { registerManifestMenusForApp, resolveAppLogoUrl, registerAppEnvAccessors },
      sharedComponents,
      { getManifest }
    ] = await Promise.all([
      __vitePreload(() => import("@configs/layout-bridge"), true ? [] : void 0),
      async function() {
        const win = window;
        if (win.__BTC_SHARED_COMPONENTS__) {
          return win.__BTC_SHARED_COMPONENTS__;
        }
        if (win.__POWERED_BY_QIANKUN__ && win.__QIANKUN_DEVELOPMENT__) {
          const parentWindow = win.__QIANKUN_DEVELOPMENT__;
          if (parentWindow && parentWindow.__BTC_SHARED_COMPONENTS__) {
            return parentWindow.__BTC_SHARED_COMPONENTS__;
          }
        }
        throw new Error('Module "@btc/shared-components" is not available. It should be provided by layout-app as window.__BTC_SHARED_COMPONENTS__');
      }(),
      __vitePreload(() => import("https://all.bellis.com.cn/admin-app/assets/index-NdaN1wEj.js"), true ? [] : void 0)
    ]);
    const { getMenuRegistry } = sharedComponents;
    let registry = getMenuRegistry();
    if (typeof window !== "undefined" && !window.__BTC_MENU_REGISTRY__) {
      window.__BTC_MENU_REGISTRY__ = registry;
    } else if (typeof window !== "undefined" && window.__BTC_MENU_REGISTRY__) {
      registry = window.__BTC_MENU_REGISTRY__;
    }
    registerAppEnvAccessors();
    window.__REGISTER_MENUS_FOR_APP__ = registerManifestMenusForApp;
    registerManifestMenusForApp(appId);
    window.__APP_GET_LOGO_URL__ = resolveAppLogoUrl;
    const manifest = getManifest(appId);
    if (manifest && manifest.app?.id) {
      window.__CURRENT_APP_MANIFEST__ = manifest;
    }
    if (false) ;
  } catch (error) {
    console.warn(`[initLayoutApp] 从 manifest 注入配置失败:`, error);
  }
}
async function initLayoutApp() {
  if (window.__POWERED_BY_QIANKUN__) {
    return;
  }
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);
  if (!shouldLoadLayout) {
    return;
  }
  const LOADER_FLAG = "__layout_app_loader__";
  if (window[LOADER_FLAG]) {
    return;
  }
  window[LOADER_FLAG] = true;
  showLoading();
  const currentAppId = getCurrentAppId();
  await injectAppConfigFromManifest(currentAppId);
  try {
    const [qiankun, { loadLayoutApp }] = await Promise.all([
      __vitePreload(() => import("https://all.bellis.com.cn/admin-app/assets/index-BLkD7w88.js"), true ? [] : void 0),
      async function() {
        const win = window;
        if (win.__BTC_SHARED_CORE__) {
          return win.__BTC_SHARED_CORE__;
        }
        if (win.__POWERED_BY_QIANKUN__ && win.__QIANKUN_DEVELOPMENT__) {
          const parentWindow = win.__QIANKUN_DEVELOPMENT__;
          if (parentWindow && parentWindow.__BTC_SHARED_CORE__) {
            return parentWindow.__BTC_SHARED_CORE__;
          }
        }
        throw new Error('Module "@btc/shared-utils/qiankun/load-layout-app" is not available. It should be provided by layout-app as window.__BTC_SHARED_CORE__');
      }()
    ]);
    await loadLayoutApp({
      registerMicroApps: qiankun.registerMicroApps,
      start: qiankun.start
    });
    window.__USE_LAYOUT_APP__ = true;
    clearNavigationFlag();
  } catch (error) {
    window.__USE_LAYOUT_APP__ = false;
    removeLoadingElement();
    clearNavigationFlag();
    const scripts = document.querySelectorAll('script[data-layout-app], script[src*="layout.bellis.com.cn"], script[src*="localhost:4188"]');
    scripts.forEach((script) => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    const baseTags = document.querySelectorAll("base[data-layout-app-base], base");
    baseTags.forEach((base) => {
      const baseElement = base;
      if (baseElement.hasAttribute("data-layout-app-base") || baseElement.href && (baseElement.href.includes("layout.bellis.com.cn") || baseElement.href.includes("localhost:4188"))) {
        if (baseElement.parentNode) {
          baseElement.parentNode.removeChild(baseElement);
        }
      }
    });
    const appContainer = document.querySelector("#app");
    if (appContainer) {
      const hasLayoutContent = appContainer.querySelector("#subapp-viewport") || appContainer.querySelector("#layout-app") || appContainer.querySelector("[data-layout-app]");
      if (hasLayoutContent || appContainer.children.length > 0) {
        appContainer.innerHTML = "";
      }
    }
    throw error;
  }
}
export {
  initLayoutApp
};
