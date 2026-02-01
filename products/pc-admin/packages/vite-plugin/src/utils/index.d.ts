import prettier from 'prettier';
/**
 * 鑾峰彇椤圭洰鏍圭洰褰? */
export declare function setRootDir(root: string): void;
export declare function rootDir(path: string): string;
/**
 * 棣栧瓧姣嶅ぇ鍐? */
export declare function firstUpperCase(value: string): string;
/**
 * 妯潬杞┘宄? */
export declare function toCamel(str: string): string;
/**
 * 鍒涘缓鐩綍
 */
export declare function createDir(path: string, recursive?: boolean): void;
/**
 * 璇诲彇鏂囦欢
 */
export declare function readFile(path: string, json?: boolean): any;
/**
 * 鍐欏叆鏂囦欢
 */
export declare function writeFile(path: string, data: string): void;
/**
 * 瑙ｆ瀽 body
 */
export declare function parseJson(req: any): Promise<any>;
/**
 * 鏍煎紡鍖栧唴瀹? */
export declare function formatContent(content: string, options?: prettier.Options): Promise<string>;
/**
 * 閿欒鏃ュ織
 */
export declare function error(message: string): void;
/**
 * 鎴愬姛鏃ュ織
 */
export declare function success(message: string): void;
/**
 * 姣旇緝涓や釜鐗堟湰鍙? */
export declare function compareVersion(version1: string, version2: string): number;

