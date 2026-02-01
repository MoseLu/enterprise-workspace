/**
 * Vite 插件：服务端注入页面标题
 *
 * 目的：在 Vite dev server 返回 HTML 时，根据请求路径和语言替换 __PAGE_TITLE__ 占位符
 * 效果：刷新时浏览器标签从第一帧就显示正确标题，无闪烁
 */
import type { Plugin } from 'vite';
/**
 * 创建标题注入插件
 */
export declare function titleInjectPlugin(): Plugin;
