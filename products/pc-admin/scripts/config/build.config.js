/**
 * 构建配置
 */

export const buildConfig = {
  // 构建输出目录
  distDir: 'dist',
  
  // CDN 构建配置
  cdn: {
    enabled: true,
    baseUrl: process.env.CDN_BASE_URL || '',
  },
  
  // 构建模式
  modes: {
    development: 'development',
    production: 'production',
    preview: 'preview',
  },
  
  // 构建选项
  options: {
    minify: true,
    sourcemap: true,
    analyze: false,
  },
};
