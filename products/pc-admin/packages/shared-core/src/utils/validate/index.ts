/**
 * 验证邮箱
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证手机号（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证身份证号（中国大陆）
 * @param idCard 身份证号
 * @returns 是否有效
 */
export function isIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}

/**
 * 验证URL
 * @param url URL地址
 * @returns 是否有效
 */
export function isUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

/**
 * 验证是否为空
 * @param value 值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}