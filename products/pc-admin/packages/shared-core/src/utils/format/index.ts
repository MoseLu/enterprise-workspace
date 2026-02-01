/**
 * 格式化金额
 * @param value 金额
 * @param currency 货币符号
 * @returns 格式化后的金额字符串
 */
export function formatMoney(value: number, currency = '¥'): string {
  return `${currency}${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

/**
 * 格式化数字（千分位）
 * @param value 数字
 * @returns 格式化后的数字字符串
 */
export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化百分比
 * @param value 数值（0-1）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 隐藏手机号中间4位
 * @param phone 手机号
 * @returns 隐藏后的手机号
 */
export function hidePhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 隐藏身份证号中间部分
 * @param idCard 身份证号
 * @returns 隐藏后的身份证号
 */
export function hideIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

/**
 * 格式化表格数字显示（处理 null/undefined/0 值）
 * @param value 数字值
 * @returns 格式化后的字符串，null/undefined 显示为 '--'，其他值转为字符串
 */
export function formatTableNumber(value: any): string {
  if (value === null || value === undefined) return '--';
  return String(value);
}
