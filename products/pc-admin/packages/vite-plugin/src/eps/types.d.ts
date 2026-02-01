/**
 * EPS 鎻掍欢绫诲瀷瀹氫箟
 */
export interface ApiMethod {
    path: string;
    method: string;
    name: string;
    summary?: string;
}
export interface ApiModule {
    name: string;
    prefix: string;
    api: ApiMethod[];
}
export interface EpsData {
    [moduleName: string]: ApiMethod[];
}
export interface EpsPluginOptions {
    /**
     * EPS 鍏冩暟鎹?URL
     */
    epsUrl: string;
    /**
     * 杈撳嚭鐩綍
     */
    outputDir?: string;
    /**
     * 鏄惁鐩戝惉鍙樺寲
     */
    watch?: boolean;
}

