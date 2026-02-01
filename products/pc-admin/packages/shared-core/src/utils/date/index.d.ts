/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export declare function formatDate(date: Date | string | number, format?: string): string;
/**
 * 格式化日期时间
 * @param date 日期对象或字符串
 * @returns 格式化后的日期时间字符串
 */
export declare function formatDateTime(date: Date | string | number): string;
/**
 * 格式化日期时间（用户友好格式）
 * @param date 日期对象或字符串
 * @returns 格式化后的日期时间字符串
 */
export declare function formatDateTimeFriendly(date: Date | string | number | null | undefined): string;
/**
 * 检查是否为时间字段
 * @param fieldName 字段名
 * @returns 是否为时间字段
 */
export declare function isDateTimeField(fieldName: string): boolean;
/**
 * 获取日期范围
 * @param type 范围类型
 * @returns [开始时间, 结束时间]
 */
export declare function getDateRange(type: 'today' | 'week' | 'month'): [string, string];
/**
 * 计算日期差
 * @param date1 日期1
 * @param date2 日期2
 * @param unit 单位
 * @returns 日期差
 */
export declare function dateDiff(date1: Date | string, date2: Date | string, unit?: 'day' | 'hour' | 'minute'): number;
//# sourceMappingURL=index.d.ts.map