/**
 * 常用验证器
 * 提供邮箱、手机号、URL 等常用验证规则
 */

import { z } from 'zod';

/**
 * 邮箱验证器
 */
export const emailValidator = z.string().email('邮箱格式不正确');

/**
 * 手机号验证器（中国大陆）
 */
export const phoneValidator = z
  .string()
  .regex(/^1[3-9]\d{9}$/, '手机号格式不正确');

/**
 * URL 验证器
 */
export const urlValidator = z.string().url('URL格式不正确');

/**
 * 身份证号验证器（中国大陆）
 */
export const idCardValidator = z
  .string()
  .regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, '身份证号格式不正确');

/**
 * 中文验证器
 */
export const chineseValidator = z
  .string()
  .regex(/^[\u4e00-\u9fa5]+$/, '只能包含中文');

/**
 * 数字字符串验证器
 */
export const numericStringValidator = z
  .string()
  .regex(/^\d+$/, '只能包含数字');

/**
 * 非空字符串验证器
 */
export const nonEmptyStringValidator = z
  .string()
  .min(1, '不能为空')
  .trim();

/**
 * 正整数验证器
 */
export const positiveIntegerValidator = z
  .number()
  .int('必须是整数')
  .positive('必须是正数');

/**
 * 非负整数验证器
 */
export const nonNegativeIntegerValidator = z
  .number()
  .int('必须是整数')
  .nonnegative('不能为负数');

/**
 * 日期字符串验证器（YYYY-MM-DD）
 */
export const dateStringValidator = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确（YYYY-MM-DD）');

/**
 * 日期时间字符串验证器（YYYY-MM-DD HH:mm:ss）
 */
export const datetimeStringValidator = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, '日期时间格式不正确（YYYY-MM-DD HH:mm:ss）');

/**
 * 密码强度验证器（必须包含字母和数字，长度8-20）
 */
export const passwordStrengthValidator = z
  .string()
  .min(8, '密码长度至少8个字符')
  .max(20, '密码长度最多20个字符')
  .refine(
    (val) => /[a-zA-Z]/.test(val) && /\d/.test(val),
    '密码必须包含字母和数字'
  );

/**
 * 短信验证码验证器（6位数字）
 */
export const smsCodeValidator = z
  .string()
  .length(6, '验证码必须是6位数字')
  .regex(/^\d{6}$/, '验证码必须是6位数字');

/**
 * 密码确认验证器（需要传入原始密码）
 * @param originalPassword 原始密码（可以是字符串或函数返回字符串）
 * @returns Zod schema
 */
export function confirmPasswordValidator(originalPassword: string | (() => string)) {
  return z.string().refine(
    (val) => {
      const original = typeof originalPassword === 'function' ? originalPassword() : originalPassword;
      return val === original;
    },
    '两次密码输入不一致'
  );
}
