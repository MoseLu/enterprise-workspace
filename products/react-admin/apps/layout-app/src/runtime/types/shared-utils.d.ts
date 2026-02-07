declare module '@btc/shared-utils' {
  // 直接导入类型
  import type { StorageUtil } from '../../../packages/shared-utils/src/storage';
  
  // 重新导出所有内容
  export * from '../../../packages/shared-utils/src/index';
  
  // 明确导出 storage
  export const storage: StorageUtil;
}

