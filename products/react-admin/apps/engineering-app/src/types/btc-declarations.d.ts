/**
 * 类型声明文件
 */

// 窗口扩展声明
declare interface Window {
  // qiankun 环境下由主应用注入
  __POWERED_BY_QIANKUN__?: boolean;
  __QIANKUN__?: {
    mounted?: boolean;
  };
  // 子应用间通信
  __APP_EMITTER__?: import('mitt').Emitter;
  // 布局应用标识
  __USE_LAYOUT_APP__?: boolean;
  __IS_LAYOUT_APP__?: boolean;
  // 退出登录回调
  __APP_LOGOUT__?: () => void;
  // 跨域通信桥
  __CROSS_DOMAIN_BRIDGE__?: {
    url: string;
    loaded: boolean;
  };
  // 域名缓存
  __DOMAIN_CACHE__?: Record<string, unknown>;
}

// Import.meta 扩展
declare interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_BASE_URL_PROD: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_ENABLE_CDN_I18N: string;
  readonly VITE_USE_MOCK: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
