/**
 * 字符串工具函数
 */
/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export declare function capitalize(str: string): string;
/**
 * 驼峰命名转换
 * @param str 字符串
 * @returns 驼峰命名字符串
 */
export declare function camelCase(str: string): string;
/**
 * 短横线命名转换
 * @param str 字符串
 * @returns 短横线命名字符串
 */
export declare function kebabCase(str: string): string;
/**
 * 下划线命名转换
 * @param str 字符串
 * @returns 下划线命名字符串
 */
export declare function snakeCase(str: string): string;
/**
 * 截断字符串
 * @param str 字符串
 * @param length 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
export declare function truncate(str: string, length: number, suffix?: string): string;
/**
 * 移除字符串中的HTML标签
 * @param str 字符串
 * @returns 移除HTML标签后的字符串
 */
export declare function stripHtml(str: string): string;
/**
 * 转义HTML字符
 * @param str 字符串
 * @returns 转义后的字符串
 */
export declare function escapeHtml(str: string): string;
/**
 * 生成随机字符串
 * @param length 长度
 * @param chars 字符集
 * @returns 随机字符串
 */
export declare function randomString(length?: number, chars?: string): string;
/**
 * 字符串模板替换
 * @param template 模板字符串
 * @param data 数据对象
 * @returns 替换后的字符串
 */
export declare function template(template: string, data: Record<string, any>): string;
//# sourceMappingURL=index.d.ts.map