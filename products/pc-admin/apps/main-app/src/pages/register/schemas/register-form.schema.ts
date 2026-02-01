/**
 * 注册表单 Zod Schema
 */

import { z } from 'zod';
import { phoneValidator, passwordStrengthValidator, smsCodeValidator, confirmPasswordValidator } from '@btc/shared-core/utils/zod';

/**
 * 注册表单数据接口
 */
export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  smsCode: string;
  email?: string;
  realName?: string;
  department?: string;
  position?: string;
}

/**
 * 创建注册表单 Schema（需要传入表单数据以验证密码确认）
 * @param formData 表单数据对象（用于密码确认验证）
 * @returns Zod schema
 */
export function createRegisterFormSchema(formData?: { password?: string }) {
  return z.object({
    username: z
      .string()
      .min(2, '用户名长度至少2个字符')
      .max(50, '用户名长度最多50个字符'),
    password: passwordStrengthValidator,
    confirmPassword: formData?.password
      ? confirmPasswordValidator(() => formData.password!)
      : z.string().min(1, '请确认密码'),
    phone: phoneValidator,
    smsCode: smsCodeValidator,
    email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
    realName: z.string().optional().or(z.literal('')),
    department: z.string().optional().or(z.literal('')),
    position: z.string().optional().or(z.literal('')),
  });
}

/**
 * 基础注册表单 Schema（不包含密码确认，用于独立字段验证）
 */
export const registerFormFieldSchemas = {
  username: z
    .string()
    .min(2, '用户名长度至少2个字符')
    .max(50, '用户名长度最多50个字符'),
  password: passwordStrengthValidator,
  phone: phoneValidator,
  smsCode: smsCodeValidator,
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  realName: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
};

/**
 * 创建密码确认验证 Schema（需要传入原始密码）
 * @param originalPassword 原始密码
 * @returns Zod schema
 */
export function createConfirmPasswordSchema(originalPassword: string) {
  return confirmPasswordValidator(originalPassword);
}
