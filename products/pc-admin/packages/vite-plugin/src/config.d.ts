/**
 * 鎻掍欢閰嶇疆绠＄悊
 */
export type Type = 'admin' | 'app' | 'uniapp-x';
export interface EpsMapping {
    type?: string;
    test?: string[];
    custom?: (params: {
        propertyName: string;
        type: string;
    }) => string | null;
}
export interface BtcPluginConfig {
    /**
     * 搴旂敤绫诲瀷
     */
    type: Type;
    /**
     * 鍚庣璇锋眰鍦板潃锛堢敤浜庤幏鍙栨湇鍔¤瑷€绫诲瀷绛夛級
     */
    reqUrl: string;
    /**
     * 鏄惁涓烘紨绀烘ā寮?     */
    demo: boolean;
    /**
     * 鏄惁鍚敤鍚嶇О鏍囩
     */
    nameTag: boolean;
    /**
     * EPS 閰嶇疆
     */
    eps: {
        enable: boolean;
        api: string;
        dist: string;
        mapping: EpsMapping[];
    };
    /**
     * SVG 閰嶇疆
     */
    svg: {
        skipNames?: string[];
    };
    /**
     * 鏄惁娓呯悊鏃ф枃浠?     */
    clean: boolean;
}
export declare const config: BtcPluginConfig;

