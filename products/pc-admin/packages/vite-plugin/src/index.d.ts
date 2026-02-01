/**
 * @btc/vite-plugin - BTC Vite 鎻掍欢闆嗗悎
 *
 * 鍖呭惈鍔熻兘锛? * - EPS: Endpoint Service锛圓PI 鑷姩鍖栵級
 * - SVG: SVG 鍥炬爣澶勭悊
 * - Ctx: 涓婁笅鏂囷紙妯″潡鎵弿锛? * - Tag: 缁勪欢鍚嶇О鏍囩
 * - File: 鏂囦欢鎿嶄綔
 * - Proxy: 浠ｇ悊閰嶇疆
 */
import type { Plugin } from 'vite';
import type { BtcPluginConfig } from './config';
/**
 * BTC 鎻掍欢涓诲叆鍙ｏ紙缁熶竴閰嶇疆锛? * @param options 閰嶇疆閫夐」
 * @returns Vite 鎻掍欢鏁扮粍
 */
export declare function btc(options?: Partial<BtcPluginConfig>): Plugin[];
export { epsPlugin } from './eps';
export { svgPlugin } from './svg';
export { ctxPlugin } from './ctx';
export { tagPlugin } from './tag';
export * from './eps/types';
export type { BtcPluginConfig } from './config';

