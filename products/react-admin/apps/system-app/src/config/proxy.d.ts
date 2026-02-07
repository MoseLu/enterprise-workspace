/**
 * 代理配置
 */
export declare const proxy: {
  '/admin': {
    target: string;
    changeOrigin: boolean;
    rewrite: (path: string) => string;
  };
};
