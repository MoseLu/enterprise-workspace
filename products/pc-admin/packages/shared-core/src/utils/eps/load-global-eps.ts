;
/**
 * 全局 EPS 服务加载器
 * 用于在生产环境下从 system-app 加载全局共享的 EPS 服务
 */

/**
 * 从 system-app 加载全局 EPS 服务
 * 在生产环境下，子应用可以通过加载 system-app 的 EPS 服务脚本获取全局服务
 */
export async function loadGlobalEpsService(): Promise<any> {
  if (typeof window === 'undefined') {
    return null;
  }

  // 检查是否已经是生产环境子域名
  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  if (!isProductionSubdomain) {
    // 非生产环境，不需要加载全局服务
    return null;
  }

  // 检查全局服务是否已经存在
  const existingService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
  if (existingService && typeof existingService === 'object' && Object.keys(existingService).length > 0) {
    return existingService;
  }

  // 尝试从 system-app 加载全局 EPS 服务
  // 通过动态加载 system-app 的 EPS 服务脚本
  try {
    // 加载 system-app 的 EPS 服务脚本
    // 注意：这需要 system-app 暴露一个全局 EPS 服务脚本
    // 目前先尝试直接访问全局变量，如果不存在则返回 null
    
    // 尝试通过动态 script 标签加载（如果 system-app 提供了独立的 EPS 服务脚本）
    // 目前暂时不实现，因为需要额外的构建配置
    // 这里返回 null，让子应用使用本地构建的服务
    
    return null;
  } catch (error) {
    console.warn('[loadGlobalEpsService] 加载全局 EPS 服务失败:', error);
    return null;
  }
}

/**
 * 等待全局 EPS 服务可用
 */
export async function waitForGlobalEpsService(maxWaitTime = 3000, interval = 100): Promise<any> {
  if (typeof window === 'undefined') {
    return null;
  }

  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
    
    if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
      return globalService;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return null;
}

