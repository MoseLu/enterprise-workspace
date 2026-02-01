import type { Plugin } from 'vite';
/**
 * 鍒涘缓 SVG sprite
 */
export declare function createSvg(): Promise<{
    code: string;
    svgIcons: string[];
}>;
/**
 * SVG 鍥炬爣鎻掍欢
 * 鎵弿椤圭洰涓殑 SVG 鏂囦欢锛岃嚜鍔ㄧ敓鎴?SVG sprite
 */
export declare function svgPlugin(): Plugin;

