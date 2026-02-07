/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { AppLevelLocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '系统应用',
    },
    // 系统相关
    common: {
      system: {
        btc_shop_management: 'BTC车间管理',
        bellis: '拜里斯',
        address: '深圳市南山区科技园',
        loading_resources: '正在加载系统资源...',
        loading_resources_subtitle: '初次加载可能需要较多时间，请耐心等待',
        simplified_chinese: '简体中文',
        english: 'English',
      },
    },
    // 配置相关
    config: {
      locale: {
        'zh-CN': '简体中文',
      },
    },
    // 代理相关错误消息
    proxy: {
      error: {
        processLoginResponse: '代理处理登录响应时出错',
        readResponseStream: '代理读取响应流时出错',
        processResponse: '代理处理响应时出错',
        connectBackend: '代理错误：无法连接到后端服务器',
      },
    },
  },
  'en-US': {
    subapp: {
      name: 'System Application',
    },
    // 系统相关
    common: {
      system: {
        btc_shop_management: 'BTC Shop Management',
        bellis: 'Bellis',
        address: 'Nanshan District, Shenzhen',
        loading_resources: 'Loading system resources...',
        loading_resources_subtitle: 'Initial loading may take some time, please wait patiently',
        simplified_chinese: 'Simplified Chinese',
        english: 'English',
      },
    },
    // 配置相关
    config: {
      locale: {
        'zh-CN': 'Simplified Chinese',
      },
    },
    // 代理相关错误消息
    proxy: {
      error: {
        processLoginResponse: 'Error processing login response',
        readResponseStream: 'Error reading response stream',
        processResponse: 'Error processing response',
        connectBackend: 'Proxy error: Unable to connect to backend server',
      },
    },
  },
} satisfies AppLevelLocaleConfig;
