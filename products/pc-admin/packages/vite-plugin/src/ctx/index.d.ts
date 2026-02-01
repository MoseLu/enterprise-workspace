import type { Plugin } from 'vite';
export interface CtxData {
    modules?: string[];
    serviceLang?: string;
}
/**
 * 鍒涘缓涓婁笅鏂囨暟鎹? */
export declare function createCtx(): Promise<CtxData>;
/**
 * 涓婁笅鏂囨彃浠讹紙鑷姩鎵弿妯″潡锛? * 鎵弿 src/modules/ 鐩綍锛岃幏鍙栨墍鏈夋ā鍧楀悕鍜屾湇鍔¤瑷€绫诲瀷
 */
export declare function ctxPlugin(): Plugin;

