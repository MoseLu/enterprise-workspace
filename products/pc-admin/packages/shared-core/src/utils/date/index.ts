// 使用兼容方式导入 dayjs
import * as dayjsLib from 'dayjs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dayjs = (dayjsLib as any).default || dayjsLib;

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

/**
 * 格式化日期时间
 * @param date 日期对象或字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string | number): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化日期时间（用户友好格式）
 * @param date 日期对象或字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTimeFriendly(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 检查是否为时间字段
 * @param fieldName 字段名
 * @returns 是否为时间字段
 */
export function isDateTimeField(fieldName: string): boolean {
  return /^(createdAt|updatedAt|createTime|updateTime|deletedAt)$/i.test(fieldName);
}

/**
 * 获取日期范围
 * @param type 范围类型
 * @returns [开始时间, 结束时间]
 */
export function getDateRange(type: 'today' | 'week' | 'month'): [string, string] {
  const now = dayjs();

  switch (type) {
    case 'today':
      return [now.startOf('day').format(), now.endOf('day').format()];
    case 'week':
      return [now.startOf('week').format(), now.endOf('week').format()];
    case 'month':
      return [now.startOf('month').format(), now.endOf('month').format()];
  }
}

/**
 * 计算日期差
 * @param date1 日期1
 * @param date2 日期2
 * @param unit 单位
 * @returns 日期差
 */
export function dateDiff(
  date1: Date | string,
  date2: Date | string,
  unit: 'day' | 'hour' | 'minute' = 'day'
): number {
  return dayjs(date1).diff(dayjs(date2), unit);
}