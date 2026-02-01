/**
 * 跨应用重定向工具
 * 用于处理登录后跳转到子应用的逻辑
 */
import { storage } from '@btc/shared-core/utils/storage';
import { deleteCookie } from '@btc/shared-core/utils/storage/cookie';
import { getCookieDomain } from '@btc/shared-core/utils/storage/cross-domain';
import { REDIRECT_COOKIE_NAME } from '@btc/shared-core/configs/app-env.config';
/**
 * storage 键名：保存退出前的路径
 */
const LOGOUT_REDIRECT_KEY = 'btc_logout_redirect_path';
/**
 * 清除重定向相关的缓存（localStorage 和 cookie）
 * 用于清除之前保存的重定向路径和相关cookie
 */
export function clearRedirectCache() {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        // 清除 localStorage 中保存的退出前路径
        storage.remove(LOGOUT_REDIRECT_KEY);
    }
    catch (error) {
        console.warn('[clearRedirectCache] Failed to clear redirect cache:', error);
    }
}
/**
 * 清除重定向 Cookie
 * 用于处理 clearRedirectCookie=1 参数，清理重定向相关的 Cookie 缓存
 * 支持跨子域名清理（使用 getCookieDomain()）
 */
export function clearRedirectCookie() {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const domain = getCookieDomain();
        // 清理重定向 Cookie（覆盖所有路径，确保彻底清除）
        deleteCookie(REDIRECT_COOKIE_NAME, {
            domain,
            path: '/',
        });
        if (import.meta.env.DEV) {
            console.log('[clearRedirectCookie] Cleared redirect cookie:', REDIRECT_COOKIE_NAME);
        }
    }
    catch (error) {
        console.warn('[clearRedirectCookie] Failed to clear redirect cookie:', error);
    }
}
/**
 * 子应用路径前缀映射
 */
const SUB_APP_PREFIXES = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];
/**
 * 从路径中提取子应用名称
 * 例如：/admin/xxx -> admin
 */
function extractSubAppName(path) {
    for (const prefix of SUB_APP_PREFIXES) {
        if (path.startsWith(prefix)) {
            // 移除前缀的 / 后就是应用名称
            return prefix.substring(1);
        }
    }
    return null;
}
/**
 * 从子域名或端口中提取子应用名称
 * @param hostname - 主机名，例如 'admin.bellis.com.cn' 或 'localhost:8081'
 * @returns 子应用名称，例如 'admin'，如果不是子应用则返回 null
 */
async function extractSubAppNameFromHost(hostname) {
    try {
        // 使用统一的环境检测和配置
        const { getEnvironment } = await import('@btc/shared-core/configs/unified-env-config');
        const { getAppConfigByTestHost, getAppConfigByPrePort, getAppConfig, getAppConfigByDevPort } = await import('@btc/shared-core/configs/app-env.config');
        const env = getEnvironment();
        const port = typeof window !== 'undefined' ? window.location.port || '' : '';
        if (env === 'test' || env === 'production') {
            // 测试/生产环境：通过子域名查找
            const appConfig = getAppConfigByTestHost(hostname);
            if (!appConfig && env === 'production') {
                // 生产环境：尝试通过所有配置查找匹配的子域名
                const { APP_ENV_CONFIGS } = await import('@btc/shared-core/configs/app-env.config');
                const matched = APP_ENV_CONFIGS.find(config => config.prodHost === hostname);
                if (matched) {
                    return matched.appName.replace('-app', '');
                }
            }
            else if (appConfig) {
                return appConfig.appName.replace('-app', '');
            }
        }
        else if (env === 'preview' && port) {
            // 预览环境：通过端口查找
            const appConfig = getAppConfigByPrePort(port);
            if (appConfig) {
                return appConfig.appName.replace('-app', '');
            }
        }
        else if (env === 'development' && port) {
            // 开发环境：通过端口查找
            const appConfig = getAppConfigByDevPort(port);
            if (appConfig) {
                return appConfig.appName.replace('-app', '');
            }
        }
    }
    catch (error) {
        // 如果导入失败，静默返回 null
    }
    return null;
}
/**
 * 获取当前完整路径（转换为统一的路径格式）
 * 例如：
 * - 在 admin.bellis.com.cn/user/list 或 localhost:8081/user/list -> /admin/user/list
 * - 在 bellis.com.cn/admin/user/list -> /admin/user/list
 * - 在 bellis.com.cn/ -> /
 *
 * @returns 统一的路径格式，例如 '/admin/user/list' 或 '/'
 */
export async function getCurrentUnifiedPath() {
    if (typeof window === 'undefined') {
        return '/';
    }
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    // 尝试从 hostname 中提取子应用名称（使用统一的环境检测）
    const subAppName = await extractSubAppNameFromHost(hostname);
    if (subAppName) {
        // 如果在子应用中，路径格式为 /subApp/path
        // 如果 pathname 已经是 /admin/xxx 格式，直接返回
        // 否则拼接为 /subApp/pathname
        if (pathname.startsWith(`/${subAppName}`)) {
            return pathname;
        }
        // 如果 pathname 是根路径，返回 /subApp
        if (pathname === '/') {
            return `/${subAppName}`;
        }
        // 否则拼接为 /subApp/pathname
        return `/${subAppName}${pathname}`;
    }
    // 如果不在子应用中，检查 pathname 是否已经是子应用路径格式
    const subAppNameFromPath = extractSubAppName(pathname);
    if (subAppNameFromPath) {
        return pathname;
    }
    // 主应用路径，直接返回
    return pathname || '/';
}
/**
 * 同步版本的 getCurrentUnifiedPath（向后兼容）
 * 使用同步方式，但可能在某些环境下不够准确
 */
export function getCurrentUnifiedPathSync() {
    if (typeof window === 'undefined') {
        return '/';
    }
    const pathname = window.location.pathname;
    // 检查 pathname 是否已经是子应用路径格式
    const subAppNameFromPath = extractSubAppName(pathname);
    if (subAppNameFromPath) {
        return pathname;
    }
    // 主应用路径，直接返回
    return pathname || '/';
}
/**
 * 保存退出前的路径
 * 应该在退出登录时调用，保存当前路径以便登录后返回
 */
export async function saveLogoutRedirectPath() {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const currentPath = await getCurrentUnifiedPath();
        // 保存到 storage，以便在跨域跳转后仍能访问
        // 注意：由于跨域限制，storage 在不同子域名之间无法共享
        // 但可以在同一域名下使用（开发环境或主域名下）
        storage.set(LOGOUT_REDIRECT_KEY, currentPath);
    }
    catch (error) {
        console.warn('[saveLogoutRedirectPath] Failed to save logout redirect path:', error);
    }
}
/**
 * 获取并清除保存的退出前路径
 * 应该在登录成功后调用，获取保存的路径并清除
 *
 * @returns 保存的路径，如果没有则返回 null
 */
export function getAndClearLogoutRedirectPath() {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const savedPath = storage.get(LOGOUT_REDIRECT_KEY);
        if (savedPath) {
            // 获取后清除
            storage.remove(LOGOUT_REDIRECT_KEY);
            return savedPath;
        }
        return null;
    }
    catch (error) {
        console.warn('[getAndClearLogoutRedirectPath] Failed to get logout redirect path:', error);
        return null;
    }
}
/**
 * 验证并标准化重定向路径
 * 对 oauth_callback 参数进行解码、合法性校验和安全防护
 *
 * @param rawPath - 原始路径（可能是 URL 编码的）
 * @param defaultPath - 默认路径（如果验证失败或为空时使用）
 * @returns 标准化后的相对路径
 */
export function validateAndNormalizeRedirectPath(rawPath, defaultPath = '/dashboard') {
    // 空值兜底
    if (!rawPath || typeof rawPath !== 'string' || rawPath.trim() === '') {
        if (import.meta.env.DEV) {
            console.log('[validateAndNormalizeRedirectPath] Empty path, using default:', defaultPath);
        }
        return defaultPath;
    }
    // URL 解码
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(rawPath);
    }
    catch (e) {
        if (import.meta.env.DEV) {
            console.warn('[validateAndNormalizeRedirectPath] Failed to decode path, using default:', rawPath, e);
        }
        return defaultPath;
    }
    // 路径遍历防护：移除 /../、/./ 等非法片段
    // 先处理 /../ 和 ../ 的情况
    decodedPath = decodedPath.replace(/\/\.\.\/|\.\.\/|\.\./g, '');
    // 处理 /./ 的情况
    decodedPath = decodedPath.replace(/\/\.\//g, '/');
    // 处理开头的 ./
    if (decodedPath.startsWith('./')) {
        decodedPath = decodedPath.substring(2);
    }
    // 处理多个连续的斜杠
    decodedPath = decodedPath.replace(/\/+/g, '/');
    // 检查是否为绝对 URL
    if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
        try {
            const url = new URL(decodedPath);
            const hostname = url.hostname;
            // 动态获取允许的主机列表（从配置中读取）
            // 使用动态导入避免循环依赖
            const getAllowedHosts = async () => {
                try {
                    const { APP_ENV_CONFIGS } = await import('@btc/shared-core/configs/app-env.config');
                    const { getMainAppOrigin } = await import('@btc/shared-core/configs/app-env.config');
                    const allowedHosts = new Set([
                        'bellis.com.cn',
                        'test.bellis.com.cn',
                        'uat.bellis.com.cn',
                        'localhost',
                        '127.0.0.1',
                        '10.80.8.199',
                    ]);
                    // 添加所有应用的测试和生产环境主机
                    APP_ENV_CONFIGS.forEach(config => {
                        if (config.testHost)
                            allowedHosts.add(config.testHost);
                        if (config.prodHost)
                            allowedHosts.add(config.prodHost);
                        if (config.devHost)
                            allowedHosts.add(config.devHost);
                        if (config.preHost)
                            allowedHosts.add(config.preHost);
                    });
                    // 添加主应用地址的主机名
                    const mainOrigin = getMainAppOrigin();
                    try {
                        const mainUrl = new URL(mainOrigin);
                        allowedHosts.add(mainUrl.hostname);
                    }
                    catch (e) {
                        // 忽略解析错误
                    }
                    return allowedHosts;
                }
                catch (e) {
                    // 如果导入失败，返回基本白名单
                    return new Set(['bellis.com.cn', 'localhost', '127.0.0.1', '10.80.8.199']);
                }
            };
            // 验证域名白名单（同步检查，如果失败则使用默认路径）
            // 注意：这里使用同步方式，因为函数本身是同步的
            // 对于生产环境，强制要求 HTTPS
            const isProduction = hostname.includes('bellis.com.cn') && !hostname.includes('test.') && !hostname.includes('uat.');
            if (isProduction && url.protocol !== 'https:') {
                if (import.meta.env.DEV) {
                    console.warn('[validateAndNormalizeRedirectPath] Production environment requires HTTPS:', decodedPath);
                }
                return defaultPath;
            }
            // 检查 hostname 是否匹配允许的主机（简化版，同步检查）
            const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
            const isInternalIP = /^10\.\d+\.\d+\.\d+/.test(hostname) || /^192\.168\.\d+\.\d+/.test(hostname);
            const isBellisDomain = hostname === 'bellis.com.cn' || hostname.endsWith('.bellis.com.cn');
            if (!isLocalhost && !isInternalIP && !isBellisDomain) {
                if (import.meta.env.DEV) {
                    console.warn('[validateAndNormalizeRedirectPath] Hostname not allowed:', hostname);
                }
                return defaultPath;
            }
            // 禁止直接指向子应用独立端口（开发环境）
            // 检查端口是否不是主应用端口（8080）
            if (url.port && url.port !== '8080' && url.port !== '80' && url.port !== '443' && url.port !== '') {
                if (import.meta.env.DEV) {
                    console.warn('[validateAndNormalizeRedirectPath] Direct sub-app port access not allowed:', url.port);
                }
                return defaultPath;
            }
            // 提取相对路径部分
            return url.pathname + url.search + url.hash;
        }
        catch (e) {
            if (import.meta.env.DEV) {
                console.warn('[validateAndNormalizeRedirectPath] Invalid URL format, using default:', decodedPath, e);
            }
            return defaultPath;
        }
    }
    // 相对路径：确保以 / 开头
    if (!decodedPath.startsWith('/')) {
        decodedPath = `/${decodedPath}`;
    }
    // 最终验证：确保路径不是空的或只包含斜杠
    if (!decodedPath || decodedPath === '/' || decodedPath.trim() === '') {
        return defaultPath;
    }
    return decodedPath;
}
/**
 * 获取目标应用信息
 * 解析回调路径所属的微应用（主应用或子应用）
 *
 * @param path - 回调路径，例如 '/workbench/todo' 或 '/logistics/inventory/info'
 * @returns 应用信息对象，包含应用类型、路由前缀和应用地址
 */
export async function getTargetAppInfo(path) {
    // 确保路径以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // 提取一级路由前缀（例如 '/workbench/todo' -> '/workbench'）
    const pathParts = normalizedPath.split('/').filter(p => p);
    const firstRoute = pathParts.length > 0 ? `/${pathParts[0]}` : '/';
    try {
        // 动态导入以避免循环依赖
        const { getSubAppRouteMap, getAppConfig } = await import('@btc/shared-core/configs/app-env.config');
        const subAppRouteMap = getSubAppRouteMap();
        // 检查是否匹配子应用路由前缀
        if (subAppRouteMap[firstRoute]) {
            const appName = subAppRouteMap[firstRoute];
            const appConfig = getAppConfig(`${appName}-app`);
            return {
                appType: 'sub',
                appRoute: firstRoute,
                appOrigin: appConfig ? (appConfig.prodHost || appConfig.devHost) : undefined,
            };
        }
        // 无匹配，属于主应用
        return {
            appType: 'main',
            appRoute: '/',
        };
    }
    catch (error) {
        // 如果导入失败，默认判断为主应用
        if (import.meta.env.DEV) {
            console.warn('[getTargetAppInfo] Failed to determine app info, defaulting to main app:', error);
        }
        return {
            appType: 'main',
            appRoute: '/',
        };
    }
}
/**
 * 判断是否为跨应用跳转
 * qiankun 的「跨应用」不仅是跨域名，还包括「主应用↔子应用、子应用↔子应用」
 *
 * @param targetPath - 目标路径，例如 '/workbench/todo' 或 '/logistics/inventory/info'
 * @returns 如果是跨应用跳转，返回 true；否则返回 false
 */
export async function isCrossAppRedirect(targetPath) {
    try {
        // 获取当前所在应用（登录后所在应用，通常是主应用）
        const currentApp = {
            appType: 'main',
            appRoute: '/',
        };
        // 获取目标路径所属应用
        const targetApp = await getTargetAppInfo(targetPath);
        // 判断标准：
        // 1. 主应用↔子应用：跨应用
        // 2. 子应用↔子应用：跨应用（即使同域名也需特殊处理）
        // 3. 主应用↔主应用：同应用
        // 4. 子应用↔同一子应用：同应用
        if (currentApp.appType !== targetApp.appType) {
            // 主应用↔子应用：跨应用
            if (import.meta.env.DEV) {
                console.log('[isCrossAppRedirect] Cross-app redirect: main ↔ sub', {
                    current: currentApp,
                    target: targetApp,
                });
            }
            return true;
        }
        if (currentApp.appType === 'sub' && targetApp.appType === 'sub') {
            // 子应用↔子应用：检查是否是同一个子应用
            if (currentApp.appRoute !== targetApp.appRoute) {
                // 不同的子应用：跨应用
                if (import.meta.env.DEV) {
                    console.log('[isCrossAppRedirect] Cross-app redirect: sub ↔ sub (different apps)', {
                        current: currentApp,
                        target: targetApp,
                    });
                }
                return true;
            }
            // 同一个子应用：同应用
            if (import.meta.env.DEV) {
                console.log('[isCrossAppRedirect] Same-app redirect: sub ↔ sub (same app)', {
                    current: currentApp,
                    target: targetApp,
                });
            }
            return false;
        }
        // 主应用↔主应用：同应用
        if (import.meta.env.DEV) {
            console.log('[isCrossAppRedirect] Same-app redirect: main ↔ main', {
                current: currentApp,
                target: targetApp,
            });
        }
        return false;
    }
    catch (error) {
        // 如果判断失败，默认返回 false（同应用）
        if (import.meta.env.DEV) {
            console.warn('[isCrossAppRedirect] Failed to determine redirect type, defaulting to same-app:', error);
        }
        return false;
    }
}
/**
 * 构建退出登录的 URL，包含当前路径作为 oauth_callback 参数
 * 用于在退出登录时跳转到登录页，并传递当前路径以便登录后返回
 * 支持多参数URL，保留原有的查询参数
 *
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含 oauth_callback 参数的登录页 URL
 */
export async function buildLogoutUrl(baseLoginUrl = '/login') {
    if (typeof window === 'undefined') {
        return baseLoginUrl;
    }
    try {
        const currentPath = await getCurrentUnifiedPath();
        // 调试：打印当前路径
        if (import.meta.env.DEV) {
            console.log('[buildLogoutUrl] Current unified path:', currentPath);
            console.log('[buildLogoutUrl] Base login URL:', baseLoginUrl);
        }
        // 如果当前路径是登录页，不添加 oauth_callback 参数
        if (currentPath === '/login' || currentPath.startsWith('/login?')) {
            // 保留原有参数，添加 logout=1 和 clearRedirectCookie=1
            const separator = baseLoginUrl.includes('?') ? '&' : '?';
            const logoutUrl = `${baseLoginUrl}${separator}logout=1&clearRedirectCookie=1`;
            if (import.meta.env.DEV) {
                console.log('[buildLogoutUrl] Built logout URL (login page):', logoutUrl);
            }
            return logoutUrl;
        }
        // 使用 URLSearchParams 进行标准编码（开发环境和生产环境都需要编码）
        const separator = baseLoginUrl.includes('?') ? '&' : '?';
        // 对于相对路径（开发环境），手动构建查询字符串并编码
        if (!baseLoginUrl.startsWith('http://') && !baseLoginUrl.startsWith('https://')) {
            const logoutUrl = `${baseLoginUrl}${separator}logout=1&oauth_callback=${encodeURIComponent(currentPath)}&clearRedirectCookie=1`;
            if (import.meta.env.DEV) {
                console.log('[buildLogoutUrl] Built logout URL (relative path):', logoutUrl);
                console.log('[buildLogoutUrl] Contains clearRedirectCookie:', logoutUrl.includes('clearRedirectCookie=1'));
            }
            return logoutUrl;
        }
        // 对于完整URL（生产环境），使用 URLSearchParams 进行标准编码
        const urlObj = new URL(baseLoginUrl, window.location.origin);
        urlObj.searchParams.set('logout', '1');
        urlObj.searchParams.set('oauth_callback', currentPath);
        urlObj.searchParams.set('clearRedirectCookie', '1');
        const logoutUrl = urlObj.href;
        if (import.meta.env.DEV) {
            console.log('[buildLogoutUrl] Built logout URL (full URL):', logoutUrl);
            console.log('[buildLogoutUrl] Contains clearRedirectCookie:', logoutUrl.includes('clearRedirectCookie=1'));
        }
        return logoutUrl;
    }
    catch (error) {
        console.warn('[buildLogoutUrl] Failed to build logout URL:', error);
        // 回退方案：即使出错也要包含 clearRedirectCookie=1
        const separator = baseLoginUrl.includes('?') ? '&' : '?';
        try {
            const currentPath = window.location.pathname + window.location.search + window.location.hash;
            if (currentPath === '/login' || currentPath.startsWith('/login')) {
                return `${baseLoginUrl}${separator}logout=1&clearRedirectCookie=1`;
            }
            return `${baseLoginUrl}${separator}logout=1&oauth_callback=${encodeURIComponent(currentPath)}&clearRedirectCookie=1`;
        }
        catch (e) {
            return `${baseLoginUrl}${separator}logout=1&clearRedirectCookie=1`;
        }
    }
}
/**
 * 构建退出登录的 URL，使用完整URL作为 oauth_callback 参数
 * 用于跨子域名场景，确保登录后能精确跳转到对应子域名和页面
 * 根据当前环境（development/preview/test/production）构建正确的完整URL
 * 支持多参数URL，保留原有的查询参数
 *
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含完整URL作为oauth_callback参数的登录页 URL
 */
export async function buildLogoutUrlWithFullUrl(baseLoginUrl = '/login') {
    if (typeof window === 'undefined') {
        return baseLoginUrl;
    }
    try {
        // 使用统一的环境检测
        const { getEnvironment, getCurrentSubApp } = await import('@btc/shared-core/configs/unified-env-config');
        const { getAppConfig } = await import('@btc/shared-core/configs/app-env.config');
        const env = getEnvironment();
        const currentSubApp = getCurrentSubApp();
        // 获取当前完整路径（统一格式）
        const currentPath = await getCurrentUnifiedPath();
        // 如果当前在登录页，不添加 oauth_callback 参数
        if (currentPath === '/login' || currentPath.startsWith('/login')) {
            // 保留原有参数，添加 logout=1 和 clearRedirectCookie=1
            const separator = baseLoginUrl.includes('?') ? '&' : '?';
            return `${baseLoginUrl}${separator}logout=1&clearRedirectCookie=1`;
        }
        // 根据环境构建完整的URL
        let currentFullUrl;
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port || '';
        const search = window.location.search;
        const hash = window.location.hash;
        if (env === 'test' && currentSubApp) {
            // 测试环境：使用测试环境的子域名
            const appConfig = getAppConfig(`${currentSubApp}-app`);
            if (appConfig?.testHost) {
                currentFullUrl = `${protocol}//${appConfig.testHost}${currentPath}${search}${hash}`;
            }
            else {
                // 回退：使用当前URL
                currentFullUrl = window.location.href;
            }
        }
        else if (env === 'production' && currentSubApp) {
            // 生产环境：使用生产环境的子域名
            const appConfig = getAppConfig(`${currentSubApp}-app`);
            if (appConfig?.prodHost) {
                currentFullUrl = `${protocol}//${appConfig.prodHost}${currentPath}${search}${hash}`;
            }
            else {
                // 回退：使用当前URL
                currentFullUrl = window.location.href;
            }
        }
        else if (env === 'preview' && currentSubApp && port) {
            // 预览环境：使用预览环境的端口
            const appConfig = getAppConfig(`${currentSubApp}-app`);
            if (appConfig?.preHost && appConfig?.prePort) {
                currentFullUrl = `http://${appConfig.preHost}:${appConfig.prePort}/index.html#${currentPath}${search}${hash}`;
            }
            else {
                // 回退：使用当前URL
                currentFullUrl = window.location.href;
            }
        }
        else if (env === 'development' && currentSubApp) {
            // 开发环境：关键修复 - 使用相对路径，而不是完整 URL
            // 因为在开发环境下，所有应用都应该通过主应用（8080端口）来访问
            // 使用相对路径（如 /main/system/test/test-one）可以让 Vue Router 正确处理
            // 如果使用完整 URL（如 //10.80.8.199:8092/...），Vue Router 无法处理，会导致 404
            currentFullUrl = `${currentPath}${search}${hash}`;
        }
        else {
            // 主应用或其他情况：直接使用当前URL
            currentFullUrl = window.location.href;
        }
        // 解析 baseLoginUrl 的查询参数，保留原有参数
        const urlObj = new URL(baseLoginUrl, window.location.origin);
        urlObj.searchParams.set('logout', '1');
        urlObj.searchParams.set('oauth_callback', currentFullUrl);
        urlObj.searchParams.set('clearRedirectCookie', '1');
        // 返回相对路径或完整URL（取决于 baseLoginUrl 的格式）
        if (baseLoginUrl.startsWith('http://') || baseLoginUrl.startsWith('https://')) {
            return urlObj.href;
        }
        else {
            // 相对路径：返回路径和查询字符串
            return urlObj.pathname + urlObj.search;
        }
    }
    catch (error) {
        console.warn('[buildLogoutUrlWithFullUrl] Failed to build logout URL with full URL:', error);
        // 回退：使用当前URL
        try {
            const currentFullUrl = window.location.href;
            if (currentFullUrl.includes('/login')) {
                const separator = baseLoginUrl.includes('?') ? '&' : '?';
                return `${baseLoginUrl}${separator}logout=1&clearRedirectCookie=1`;
            }
            // 解析 baseLoginUrl 的查询参数，保留原有参数
            const urlObj = new URL(baseLoginUrl, window.location.origin);
            urlObj.searchParams.set('logout', '1');
            urlObj.searchParams.set('oauth_callback', currentFullUrl);
            urlObj.searchParams.set('clearRedirectCookie', '1');
            if (baseLoginUrl.startsWith('http://') || baseLoginUrl.startsWith('https://')) {
                return urlObj.href;
            }
            else {
                return urlObj.pathname + urlObj.search;
            }
        }
        catch (e) {
            const separator = baseLoginUrl.includes('?') ? '&' : '?';
            return `${baseLoginUrl}${separator}logout=1&clearRedirectCookie=1`;
        }
    }
}
/**
 * 处理跨应用重定向
 * 支持完整URL和路径格式两种redirect参数
 * - 如果redirect是完整URL（以http://或https://开头），直接跳转
 * - 如果redirect是路径格式（以/开头），使用现有的跨应用重定向逻辑
 *
 * @param redirectPath - 重定向路径或完整URL，例如 '/admin/xxx'、'/' 或 'https://admin.bellis.com.cn/user/list?page=1'
 * @param router - Vue Router实例（可选，保留参数以保持兼容性，但当前未使用）
 * @returns 如果需要跨应用跳转，返回true；否则返回false
 */
export async function handleCrossAppRedirect(redirectPath, _router) {
    if (typeof window === 'undefined') {
        return false;
    }
    // 关键：处理 protocol-relative URL（以 // 开头），将其转换为相对路径
    // 在开发环境下，buildLogoutUrlWithFullUrl 可能生成这种 URL，需要转换为相对路径让 Vue Router 处理
    if (redirectPath.startsWith('//')) {
        try {
            const url = new URL(redirectPath, window.location.protocol === 'https:' ? 'https:' : 'http:');
            // 提取路径部分，转换为相对路径
            const pathOnly = url.pathname + url.search + url.hash;
            // 递归调用，使用相对路径
            return await handleCrossAppRedirect(pathOnly, _router);
        }
        catch (error) {
            console.warn('[handleCrossAppRedirect] Invalid protocol-relative URL:', redirectPath, error);
            // 如果解析失败，尝试提取路径部分（使用正则表达式）
            const pathMatch = redirectPath.match(/\/\/[^\/]+(\/.*)/);
            if (pathMatch && pathMatch[1]) {
                return await handleCrossAppRedirect(pathMatch[1], _router);
            }
            return false;
        }
    }
    // 如果redirect是完整URL（以http://或https://开头），直接跳转
    if (redirectPath.startsWith('http://') || redirectPath.startsWith('https://')) {
        // 验证URL是否属于允许的域名（防止开放重定向攻击）
        try {
            const url = new URL(redirectPath);
            // 使用统一的环境检测
            const { getEnvironment } = await import('@btc/shared-core/configs/unified-env-config');
            const { getMainAppOrigin, APP_ENV_CONFIGS } = await import('@btc/shared-core/configs/app-env.config');
            const env = getEnvironment();
            // 关键：在开发环境下，如果 URL 是主应用地址，应该返回 false
            // 让 Vue Router 在主应用内处理路由，而不是直接跳转
            if (env === 'development') {
                const mainAppOrigin = getMainAppOrigin();
                try {
                    const mainUrl = new URL(mainAppOrigin);
                    // 如果 URL 的主机名和端口与主应用匹配，返回 false（让 Vue Router 处理）
                    if (url.hostname === mainUrl.hostname && url.port === mainUrl.port) {
                        if (import.meta.env.DEV) {
                            console.log('[handleCrossAppRedirect] Development: URL matches main app, letting Vue Router handle:', redirectPath);
                        }
                        return false;
                    }
                }
                catch (e) {
                    // 如果解析失败，继续后续验证
                }
            }
            // 动态获取允许的主机列表（从配置中读取，支持测试环境）
            const allowedHosts = new Set([
                'bellis.com.cn',
                'test.bellis.com.cn',
                'localhost',
                '127.0.0.1',
                '10.80.8.199',
            ]);
            // 添加所有应用的测试和生产环境主机
            APP_ENV_CONFIGS.forEach(config => {
                if (config.testHost) {
                    allowedHosts.add(config.testHost);
                }
                if (config.prodHost) {
                    allowedHosts.add(config.prodHost);
                }
                if (config.devHost) {
                    allowedHosts.add(config.devHost);
                }
                if (config.preHost) {
                    allowedHosts.add(config.preHost);
                }
            });
            // 添加主应用地址的主机名
            try {
                const mainAppOrigin = getMainAppOrigin();
                const mainUrl = new URL(mainAppOrigin);
                allowedHosts.add(mainUrl.hostname);
            }
            catch (e) {
                // 忽略解析错误
            }
            // 检查 hostname 是否匹配允许的主机
            const isAllowed = Array.from(allowedHosts).some(host => {
                if (url.hostname === host) {
                    return true;
                }
                // 支持子域名匹配，例如 admin.bellis.com.cn 匹配 bellis.com.cn
                if (host.includes('.')) {
                    return url.hostname === host || url.hostname.endsWith(`.${host}`);
                }
                return false;
            });
            if (isAllowed) {
                window.location.href = redirectPath;
                return true;
            }
            else {
                console.warn('[handleCrossAppRedirect] Redirect URL not allowed:', redirectPath);
                return false;
            }
        }
        catch (error) {
            console.warn('[handleCrossAppRedirect] Invalid redirect URL:', redirectPath, error);
            return false;
        }
    }
    // 如果路径是根路径或系统域路径，使用router跳转（主应用内部跳转）
    if (redirectPath === '/' ||
        redirectPath.startsWith('/data') ||
        redirectPath.startsWith('/profile') ||
        redirectPath.startsWith('/login') ||
        redirectPath.startsWith('/forget-password') ||
        redirectPath.startsWith('/register')) {
        // 主应用路径，不需要跨应用跳转
        return false;
    }
    // 检查是否是子应用路径
    const subAppName = extractSubAppName(redirectPath);
    if (!subAppName) {
        // 不是子应用路径，使用router跳转
        return false;
    }
    try {
        // 使用统一的环境检测和配置
        const { getEnvironment } = await import('@btc/shared-core/configs/unified-env-config');
        const { getAppConfig } = await import('@btc/shared-core/configs/app-env.config');
        const env = getEnvironment();
        // 关键修复：在开发环境下，所有应用都应该通过主应用（8080端口）来访问
        // 不应该跳转到子应用的独立端口，而是让 Vue Router 在主应用内处理路由
        // 这样可以确保路由匹配和认证检查都能正确执行
        if (env === 'development') {
            // 开发环境：返回 false，让 Vue Router 在主应用内处理路由
            // 主应用会通过 qiankun 加载对应的子应用
            return false;
        }
        // 提取子应用内的路径（移除应用前缀）
        const appPrefix = `/${subAppName}`;
        let subAppPath = redirectPath.startsWith(`${appPrefix}/`)
            ? redirectPath.substring(appPrefix.length)
            : redirectPath === appPrefix
                ? '/'
                : redirectPath;
        // 规范化路径：确保以 / 开头，但避免多个斜杠
        // 如果 subAppPath 为空或不是以 / 开头，添加 /
        if (!subAppPath || !subAppPath.startsWith('/')) {
            subAppPath = `/${subAppPath}`;
        }
        // 移除多余的斜杠（但保留单个 /）
        subAppPath = subAppPath.replace(/\/+/g, '/');
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const appConfig = getAppConfig(`${subAppName}-app`);
        if (!appConfig) {
            // 如果找不到对应的应用配置，使用router跳转（主应用内跳转）
            return false;
        }
        let targetUrl;
        if (env === 'test') {
            // 测试环境：使用测试环境的子域名
            if (appConfig.testHost) {
                targetUrl = `${protocol}//${appConfig.testHost}${subAppPath}`;
            }
            else {
                return false;
            }
        }
        else if (env === 'production') {
            // 生产环境：使用生产环境的子域名
            if (appConfig.prodHost) {
                targetUrl = `${protocol}//${appConfig.prodHost}${subAppPath}`;
            }
            else {
                return false;
            }
        }
        else if (env === 'preview') {
            // 预览环境：使用预览环境的端口
            if (appConfig.preHost && appConfig.prePort) {
                targetUrl = `http://${appConfig.preHost}:${appConfig.prePort}/index.html#${subAppPath}`;
            }
            else {
                return false;
            }
        }
        else {
            // 其他环境：假设在同一域名下，使用路径前缀（主应用路由）
            return false;
        }
        // 使用window.location进行跨应用跳转
        window.location.href = targetUrl;
        return true;
    }
    catch (error) {
        console.warn('[handleCrossAppRedirect] Failed to build target URL:', error);
        return false;
    }
}
