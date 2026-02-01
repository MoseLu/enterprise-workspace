/**
 * 表单验证工具函数
 */

/**
 * 确保字段是字符串类型
 * @param value 输入值
 * @param defaultValue 默认值
 * @returns 字符串值
 */
export function ensureString(value: any, defaultValue: string = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }
  return defaultValue;
}

/**
 * 清理表单数据，确保所有字段都是字符串类型
 * @param formData 表单数据
 * @returns 清理后的表单数据
 */
export function sanitizeFormData(formData: any) {
  const sanitized = { ...formData };
  Object.keys(sanitized).forEach(key => {
    if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].length > 0 ? String(sanitized[key][0]) : '';
    } else if (typeof sanitized[key] !== 'string') {
      sanitized[key] = String(sanitized[key] || '');
    }
  });
  return sanitized;
}

/**
 * 手机号验证
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 邮箱验证
 * @param email 邮箱
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 密码强度验证
 * @param password 密码
 * @returns 是否满足强度要求
 */
export function validatePasswordStrength(password: string): boolean {
  // 8-20位，包含字母和数字
  return /^(?=.*[a-zA-Z])(?=.*\d).{8,20}$/.test(password);
}

/**
 * 短信验证码验证
 * @param code 验证码
 * @returns 是否有效
 */
export function validateSmsCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
