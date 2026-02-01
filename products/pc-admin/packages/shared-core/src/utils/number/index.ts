/**
 * 数字工具函数
 */

/**
 * 数字精度处理
 * @param num 数字
 * @param precision 精度
 * @returns 处理后的数字
 */
export function toPrecision(num: number, precision = 2): number {
  return Number(num.toFixed(precision));
}

/**
 * 数字范围限制
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @param integer 是否为整数
 * @returns 随机数
 */
export function random(min = 0, max = 1, integer = false): number {
  const num = Math.random() * (max - min) + min;
  return integer ? Math.floor(num) : num;
}

/**
 * 判断是否为偶数
 * @param num 数字
 * @returns 是否为偶数
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * 判断是否为奇数
 * @param num 数字
 * @returns 是否为奇数
 */
export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

/**
 * 数字补零
 * @param num 数字
 * @param length 长度
 * @returns 补零后的字符串
 */
export function padZero(num: number, length = 2): string {
  return num.toString().padStart(length, '0');
}
