/**
 * home 模块入口
 */

// 导出配置（如果有）
try {
  export { default as config } from './config';
} catch {
  // 模块可能没有 config.ts
}
