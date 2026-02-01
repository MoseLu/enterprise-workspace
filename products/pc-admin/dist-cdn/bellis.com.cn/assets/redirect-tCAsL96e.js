const LOGOUT_REDIRECT_KEY = "btc_logout_redirect_path";
const SUB_APP_PREFIXES = ["/admin", "/logistics", "/engineering", "/quality", "/production", "/finance", "/operations", "/docs", "/dashboard", "/personnel"];
const SUB_APP_DEV_PORTS = {
  "admin": "8081",
  "logistics": "8082",
  "quality": "8083",
  "production": "8084",
  "engineering": "8085",
  "finance": "8086",
  "operations": "8087",
  "docs": "8087",
  "dashboard": "8089",
  "personnel": "8090"
};
const SUB_APP_SUBDOMAINS = {
  "admin": "admin.bellis.com.cn",
  "logistics": "logistics.bellis.com.cn",
  "quality": "quality.bellis.com.cn",
  "production": "production.bellis.com.cn",
  "engineering": "engineering.bellis.com.cn",
  "finance": "finance.bellis.com.cn",
  "operations": "operations.bellis.com.cn",
  "docs": "docs.bellis.com.cn",
  "dashboard": "dashboard.bellis.com.cn",
  "personnel": "personnel.bellis.com.cn"
};
function extractSubAppName(path) {
  for (const prefix of SUB_APP_PREFIXES) {
    if (path.startsWith(prefix)) {
      return prefix.substring(1);
    }
  }
  return null;
}
function extractSubAppNameFromHost(hostname) {
  const hostnameLower = hostname.toLowerCase();
  for (const [appName, subdomain] of Object.entries(SUB_APP_SUBDOMAINS)) {
    if (hostnameLower === subdomain || hostnameLower.startsWith(`${subdomain}:`)) {
      return appName;
    }
  }
  const portMatch = hostname.match(/:(\d+)$/);
  if (portMatch) {
    const port = portMatch[1];
    for (const [appName, appPort] of Object.entries(SUB_APP_DEV_PORTS)) {
      if (port === appPort) {
        return appName;
      }
    }
  }
  return null;
}
function getCurrentUnifiedPath() {
  if (typeof window === "undefined") {
    return "/";
  }
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  const subAppName = extractSubAppNameFromHost(hostname);
  if (subAppName) {
    if (pathname.startsWith(`/${subAppName}`)) {
      return pathname;
    }
    if (pathname === "/") {
      return `/${subAppName}`;
    }
    return `/${subAppName}${pathname}`;
  }
  const subAppNameFromPath = extractSubAppName(pathname);
  if (subAppNameFromPath) {
    return pathname;
  }
  return pathname || "/";
}
function getAndClearLogoutRedirectPath() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const savedPath = localStorage.getItem(LOGOUT_REDIRECT_KEY);
    if (savedPath) {
      localStorage.removeItem(LOGOUT_REDIRECT_KEY);
      return savedPath;
    }
    return null;
  } catch (error) {
    console.warn("[getAndClearLogoutRedirectPath] Failed to get logout redirect path:", error);
    return null;
  }
}
function buildLogoutUrl(baseLoginUrl = "/login") {
  if (typeof window === "undefined") {
    return baseLoginUrl;
  }
  try {
    const currentPath = getCurrentUnifiedPath();
    if (currentPath === "/login" || currentPath.startsWith("/login?")) {
      return baseLoginUrl.includes("?") ? `${baseLoginUrl}&logout=1` : `${baseLoginUrl}?logout=1`;
    }
    const separator = baseLoginUrl.includes("?") ? "&" : "?";
    const encodedPath = encodeURIComponent(currentPath);
    return `${baseLoginUrl}${separator}logout=1&redirect=${encodedPath}`;
  } catch (error) {
    console.warn("[buildLogoutUrl] Failed to build logout URL:", error);
    return baseLoginUrl.includes("?") ? `${baseLoginUrl}&logout=1` : `${baseLoginUrl}?logout=1`;
  }
}
function handleCrossAppRedirect(redirectPath, _router) {
  if (typeof window === "undefined") {
    return false;
  }
  if (redirectPath === "/" || redirectPath.startsWith("/data") || redirectPath.startsWith("/profile") || redirectPath.startsWith("/login") || redirectPath.startsWith("/forget-password") || redirectPath.startsWith("/register")) {
    return false;
  }
  const subAppName = extractSubAppName(redirectPath);
  if (!subAppName) {
    return false;
  }
  const appPrefix = `/${subAppName}`;
  const subAppPath = redirectPath.startsWith(`${appPrefix}/`) ? redirectPath.substring(appPrefix.length) : redirectPath === appPrefix ? "/" : redirectPath;
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isProduction = hostname.includes("bellis.com.cn");
  const isDevelopment = hostname === "localhost" || hostname === "127.0.0.1";
  let targetUrl;
  if (isProduction) {
    const subdomain = SUB_APP_SUBDOMAINS[subAppName];
    if (!subdomain) {
      return false;
    }
    targetUrl = `${protocol}//${subdomain}${subAppPath}`;
  } else if (isDevelopment) {
    const port = SUB_APP_DEV_PORTS[subAppName];
    if (!port) {
      return false;
    }
    targetUrl = `${protocol}//${hostname}:${port}${subAppPath}`;
  } else {
    return false;
  }
  window.location.href = targetUrl;
  return true;
}
export {
  buildLogoutUrl,
  getAndClearLogoutRedirectPath,
  getCurrentUnifiedPath,
  handleCrossAppRedirect
};
