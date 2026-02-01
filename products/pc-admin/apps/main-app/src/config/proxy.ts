;
import type { IncomingMessage, ServerResponse } from 'http';
// 注意：在 Vite 配置加载阶段，不能直接导入 @btc/shared-core
// 因为此时 Vite 的 resolve.conditions 可能还没有应用，会尝试加载构建产物
// 而构建产物中的 chunk 文件（如 index-DD6oEX8b.mjs）在开发环境中可能无法正确解析
// 已移除所有控制台输出，避免日志噪音
const logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
};

// Vite 代理配置类型
interface ProxyOptions {
  target: string;
  changeOrigin?: boolean;
  secure?: boolean;
  selfHandleResponse?: boolean;
  configure?: (proxy: any, options: any) => void;
  rewrite?: (path: string) => string;
}

// 开发环境代理目标：从统一环境配置获取
// 开发环境：Vite 代理 /api 到配置的后端地址
// 生产环境：由 Nginx 代理，不需要 Vite 代理
// 注意：延迟导入 envConfig，避免在 vite.config 中导入时模块未构建的问题
function getBackendTarget(): string {
  try {
    // 动态导入，避免在 vite.config 加载时模块未构建
    const { envConfig } = require('@btc/shared-core/configs/unified-env-config');
    return envConfig?.api?.backendTarget || 'http://10.80.9.76:8115';
  } catch (error) {
    // 如果导入失败，使用默认值
    return 'http://10.80.9.76:8115';
  }
}

const backendTarget = getBackendTarget();

const proxy: Record<string, string | ProxyOptions> = {
  '/api': {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 启用手动处理响应，以便修改响应体
    selfHandleResponse: true,
    // 处理响应头，添加 CORS 头
    configure: (proxy: any) => {
      proxy.on('proxyRes', (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
        const origin = req.headers.origin || '*';
        const isLoginRequest = req.url?.includes('/login');
        let extractedToken: string | null = null;
        
        // 安全地检查是否为开发环境（在 Vite 配置中，import.meta.env 可能不可用）
        const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
        
        // 登录请求响应处理（已移除调试日志）

        if (proxyRes.headers) {
          // 关键：如果是登录请求，移除 Location 响应头，避免浏览器自动重定向
          // 后端可能返回 302 重定向，但前端应该自己处理导航，而不是让浏览器自动跳转
          if (isLoginRequest && proxyRes.headers['location']) {
            if (isDev) {
              logger.warn('[Proxy] 检测到登录响应包含 Location 头，已移除以避免浏览器自动重定向:', proxyRes.headers['location']);
            }
            delete proxyRes.headers['location'];
            delete proxyRes.headers['Location'];
          }
          
          // 关键：如果是登录请求且状态码是 302，改为 200，避免浏览器自动重定向
          if (isLoginRequest && proxyRes.statusCode === 302) {
            if (isDev) {
              logger.warn('[Proxy] 检测到登录响应状态码为 302，已改为 200 以避免浏览器自动重定向');
            }
            // 状态码会在 res.writeHead 时设置，这里先记录
          }
          
          proxyRes.headers['Access-Control-Allow-Origin'] = origin as string;
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
          const requestHeaders = req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id';
          proxyRes.headers['Access-Control-Allow-Headers'] = requestHeaders as string;

          // 关键：修复 Set-Cookie 响应头，确保跨域请求时 cookie 能够正确设置
          // 在预览模式下（不同端口），需要设置 SameSite=None; Secure
          const setCookieHeader = proxyRes.headers['set-cookie'];

          if (setCookieHeader) {
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

            const fixedCookies = cookies.map((cookie: string) => {
              // 提取 access_token 的值（用于添加到响应体）
              if (cookie.includes('access_token=')) {
                const tokenMatch = cookie.match(/access_token=([^;]+)/);
                if (tokenMatch && tokenMatch[1]) {
                  extractedToken = tokenMatch[1];
                }
              }

              let fixedCookie = cookie;

              // 关键：移除 Domain 设置，稍后会根据环境重新设置
              // 如果后端设置了 Domain={devHost} 或其他值，会导致 JavaScript 无法读取
              fixedCookie = fixedCookie.replace(/;\s*Domain=[^;]+/gi, '');

              // 确保 Path=/，让 cookie 在整个域名下可用
              if (!fixedCookie.includes('Path=')) {
                fixedCookie += '; Path=/';
              } else {
                // 如果已有 Path，确保是 /
                fixedCookie = fixedCookie.replace(/;\s*Path=[^;]+/gi, '; Path=/');
              }

              // 修复 SameSite 设置
              // 关键区别：
              // - localhost: 浏览器将不同端口视为同一站点，SameSite=Lax 可能允许跨端口 cookie
              // - IP 地址（如 devHost）: 浏览器将不同端口视为不同站点，SameSite=Lax 不允许跨站点 cookie
              // 所以在 IP 地址环境下，即使使用 SameSite=Lax，跨端口 cookie 也可能失败
              const forwardedProto = req.headers['x-forwarded-proto'];
              const isHttps = forwardedProto === 'https' ||
                             (req as any).socket?.encrypted === true ||
                             (req as any).connection?.encrypted === true;

              // 检测是否是 localhost（开发服务器）还是 IP 地址（预览服务器）
              const host = req.headers.host || '';
              const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
              const hostPart = host.split(':')[0];
              const isIpAddress = hostPart ? /^\d+\.\d+\.\d+\.\d+/.test(hostPart) : false;

              // 检测是否是生产环境（bellis.com.cn 域名）
              const isProduction = host.includes('bellis.com.cn');

              // 移除现有的 SameSite 设置
              fixedCookie = fixedCookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, '');

              if (isHttps) {
                // HTTPS 环境下：使用 SameSite=None; Secure（支持跨域）
                fixedCookie += '; SameSite=None; Secure';
              } else if (isLocalhost) {
                // localhost + HTTP：不设置 SameSite（让浏览器使用默认值，通常是 Lax）
                // localhost 上，浏览器对跨端口 cookie 更宽松
              } else if (isIpAddress) {
                // IP 地址 + HTTP：不设置 SameSite，让浏览器使用默认值（与开发服务器一致）
              } else {
                // 其他情况：不设置 SameSite
              }

              // 确保 HttpOnly 被移除（如果后端设置了 HttpOnly=false，但可能还有其他设置）
              if (fixedCookie.includes('HttpOnly') && !cookie.includes('HttpOnly=false')) {
                fixedCookie = fixedCookie.replace(/;\s*HttpOnly/gi, '');
              }

              // 确保 Secure 被移除（在 HTTP 环境下）
              if (!isHttps && fixedCookie.includes('Secure')) {
                fixedCookie = fixedCookie.replace(/;\s*Secure/gi, '');
              }

              // 生产环境：设置 domain 为 .bellis.com.cn 以支持跨子域名共享
              if (isProduction) {
                fixedCookie += '; Domain=.bellis.com.cn';
              }
              // 其他环境：不设置 domain，cookie 只在当前域名下有效

              return fixedCookie;
            });
            proxyRes.headers['set-cookie'] = fixedCookies;
          }

          // 关键：如果是登录接口的响应，且响应体中没有 token，则从 Set-Cookie 中提取并添加到响应体
          // 这样前端就可以从响应体中获取 token，即使 cookie 是 HttpOnly 的
          // 注意：使用 selfHandleResponse: true 时，需要手动处理所有响应
          const chunks: Buffer[] = [];

          proxyRes.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          proxyRes.on('end', () => {
            if (isLoginRequest && extractedToken) {
              // 保存原始响应头
              const originalHeaders: Record<string, string | string[] | undefined> = {};
              Object.keys(proxyRes.headers).forEach(key => {
                const lowerKey = key.toLowerCase();
                // 移除 content-length（会重新计算）和 location（避免浏览器自动重定向）
                if (lowerKey !== 'content-length' && lowerKey !== 'location') {
                  originalHeaders[key] = proxyRes.headers[key];
                }
              });

              try {
                const body = Buffer.concat(chunks).toString('utf8');
                let responseData: any;

                try {
                  responseData = JSON.parse(body);
                } catch {
                  // 如果不是 JSON，直接返回原始响应
                  // 关键：如果是登录请求且状态码是 302，改为 200，避免浏览器自动重定向
                  const statusCode = (isLoginRequest && proxyRes.statusCode === 302) ? 200 : (proxyRes.statusCode || 200);
                  res.writeHead(statusCode, originalHeaders);
                  res.end(body);
                  return;
                }

                // 如果响应体中没有 token，添加从 cookie 中提取的 token
                      if (!responseData.token && !responseData.accessToken && extractedToken) {
                        responseData.token = extractedToken;
                        responseData.accessToken = extractedToken;
                      }

                // 重新设置 Content-Length
                const newBody = JSON.stringify(responseData);
                originalHeaders['content-length'] = Buffer.byteLength(newBody).toString();

                // 发送修改后的响应
                // 关键：如果是登录请求且状态码是 302，改为 200，避免浏览器自动重定向
                const statusCode = (isLoginRequest && proxyRes.statusCode === 302) ? 200 : (proxyRes.statusCode || 200);
                res.writeHead(statusCode, originalHeaders);
                res.end(newBody);
              } catch (error) {
                logger.error('[Proxy] ✗ 处理登录响应时出错:', error);
                // 关键：如果是登录请求且状态码是 302，改为 200，避免浏览器自动重定向
                const statusCode = (isLoginRequest && proxyRes.statusCode === 302) ? 200 : (proxyRes.statusCode || 200);
                const errorHeaders = { ...proxyRes.headers };
                // 如果是登录请求，移除 Location 响应头
                if (isLoginRequest) {
                  delete errorHeaders['location'];
                  delete errorHeaders['Location'];
                }
                res.writeHead(statusCode, errorHeaders);
                res.end(Buffer.concat(chunks));
              }
            } else {
              // 非登录请求或没有 token 时，正常转发响应
              // 关键：如果是登录请求且状态码是 302，改为 200，避免浏览器自动重定向
              const statusCode = (isLoginRequest && proxyRes.statusCode === 302) ? 200 : (proxyRes.statusCode || 200);
              const headers = { ...proxyRes.headers };
              // 如果是登录请求，移除 Location 响应头
              if (isLoginRequest) {
                delete headers['location'];
                delete headers['Location'];
              }
              res.writeHead(statusCode, headers);
              res.end(Buffer.concat(chunks));
            }
          });

          proxyRes.on('error', (err: Error) => {
            logger.error('[Proxy] ✗ 读取响应流时出错:', err);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin as string,
              });
              res.end(JSON.stringify({ error: '代理处理响应时出错' }));
            }
          });
        }
      });

      // 处理错误
      proxy.on('error', (err: Error, req: IncomingMessage, res: ServerResponse) => {
        logger.error('[Proxy] Error:', err.message);
        logger.error('[Proxy] Request URL:', req.url);
        logger.error('[Proxy] Target:', backendTarget);
        if (res && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': req.headers.origin || '*',
          });
          res.end(JSON.stringify({
            code: 500,
            message: `代理错误：无法连接到后端服务器 ${backendTarget}`,
            error: err.message,
          }));
        }
      });
    },
  },
  // 代理 home-app 到开发服务器（Vue SPA）
  // 使用 home-app 的配置获取开发服务器地址
  '/home': (() => {
    try {
      const { getAppConfig } = require('@btc/shared-core/configs/app-env.config');
      const homeAppConfig = getAppConfig('home-app');
      if (homeAppConfig) {
        return {
          target: `http://${homeAppConfig.devHost}:${homeAppConfig.devPort}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/home/, ''),
        };
      }
    } catch (error) {
      // 如果导入失败，使用默认值
    }
    // 兜底配置（如果无法获取配置）
    return {
      target: 'http://localhost:8085',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/home/, ''),
    };
  })(),
};

export { proxy };

