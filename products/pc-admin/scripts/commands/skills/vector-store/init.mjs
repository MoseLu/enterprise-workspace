/**
 * 初始化向量数据库
 * 使用本地 SQLite + 文件存储方案
 */

import { initStore } from './local-vector-store.mjs';

/**
 * 初始化向量存储（兼容旧 API）
 */
function initChroma() {
  try {
    const store = initStore();
    return store;
  } catch (error) {
    console.error('❌ Failed to initialize vector store:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 初始化本地向量存储...\n');
  
  try {
    const store = initStore();
    const count = store.getCount();
    console.log(`\n📊 当前已索引资源: ${count} 个\n`);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('init.mjs');

if (isMainModule) {
  main();
}

export { initChroma, initStore };
