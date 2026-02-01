import { logger } from '../../../utils/logger.mjs';
/**
 * 子域名重定向脚本
 * 如果子应用通过子域名独立访问（非 qiankun 模式），自动重定向到主应用
 *
 * 使用方法：在子应用的 index.html 的 <head> 中添加：
 * <script src="/scripts/subdomain-redirect.js"></script>
 *
 * 或者在 <head> 中直接内联此脚本内容
 */

(function() {
  // 检测是否在 qiankun 模式下运行
  if (window.__POWERED_BY_QIANKUN__) {
    return; // 在 qiankun 模式下，不需要重定向
  }

  // 检测是否在生产环境的子域名下
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const pathname = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  // 子域名到路径的映射
  const subdomainMap = {
    'admin.bellis.com.cn': '/admin',
    'logistics.bellis.com.cn': '/logistics',
    'quality.bellis.com.cn': '/quality',
    'production.bellis.com.cn': '/production',
    'engineering.bellis.com.cn': '/engineering',
    'finance.bellis.com.cn': '/finance',
  };

  // 检查是否是子域名
  if (subdomainMap[hostname]) {
    // 构建主应用 URL
    const mainAppHost = 'bellis.com.cn';
    const basePath = subdomainMap[hostname];
    const targetPath = basePath + (pathname === '/' ? '' : pathname);
    const targetUrl = protocol + '//' + mainAppHost + targetPath + search + hash;

    // 重定向到主应用
    logger.info('[Subdomain Redirect] 检测到子域名访问，重定向到主应用:', targetUrl);
    window.location.replace(targetUrl);
  }
})();

