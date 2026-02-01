/**
 * 数字工具函数
 */
/**
 * 数字精度处理
 * @param num 数字
 * @param precision 精度
 * @returns 处理后的数字
 */
export declare function toPrecision(num: number, precision?: number): number;
/**
 * 数字范围限制
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
export declare function clamp(num: number, min: number, max: number): number;
/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @param integer 是否为整数
 * @returns 随机数
 */
export declare function random(min?: number, max?: number, integer?: boolean): number;
/**
 * 判断是否为偶数
 * @param num 数字
 * @returns 是否为偶数
 */
export declare function isEven(num: number): boolean;
/**
 * 判断是否为奇数
 * @param num 数字
 * @returns 是否为奇数
 */
export declare function isOdd(num: number): boolean;
/**
 * 数字补零
 * @param num 数字
 * @param length 长度
 * @returns 补零后的字符串
 */
export declare function padZero(num: number, length?: number): string;
//# sourceMappingURL=index.d.ts.map