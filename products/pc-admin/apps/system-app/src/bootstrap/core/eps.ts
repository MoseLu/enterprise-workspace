/**
 * EPS 服务初始化
 */

import type { App } from 'vue';
import '../../services/eps'; // 导入 EPS 服务以触发初始化

/**
 * 初始化 EPS 服务
 */
export function setupEps(_app: App) {
  // EPS 服务在导入时自动初始化
  // 通过导入 eps.ts 文件，createEps() 函数会自动执行
}
