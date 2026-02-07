/**
 * 开发服务器代理配置
 * 用于在开发环境下解决跨域问题
 */

// 从 admin-app 导入相同的代理配置
import { config as adminProxyConfig } from '../../../pc-admin/apps/admin-app/src/config/proxy';

export type ProxyConfig = Record<string, any>;

/**
 * 获取代理配置
 */
export function getProxyConfig(): ProxyConfig {
  // 继承 admin-app 的代理配置
  const proxy: ProxyConfig = {};

  // 添加开发环境代理配置
  if (adminProxyConfig) {
    Object.assign(proxy, adminProxyConfig);
  }

  // 添加 engineering-app 特定的代理配置
  proxy['/api/engineering'] = {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
  };

  return proxy;
}
