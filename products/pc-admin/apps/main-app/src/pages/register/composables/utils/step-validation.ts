/**
 * 步骤表单验证工具函数
 */

import { BtcMessage } from '@btc/shared-components';
import { validatePhone, validateSmsCode } from '../../../auth/shared/composables/validation';

/**
 * 步骤验证结果
 */
export interface StepValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * 步骤验证配置
 */
export interface StepValidationConfig {
  step: number;
  fields: string[];
  validateFunction: (formData: Record<string, any>) => StepValidationResult;
}

/**
 * 内网用户注册步骤验证配置
 */
export const INERT_REGISTRATION_STEP_VALIDATIONS: StepValidationConfig[] = [
  {
    step: 0,
    fields: ['empId', 'initPassword'],
    validateFunction: (formData) => {
      if (!formData.empId) {
        return { isValid: false, message: '请输入工号' };
      }
      if (!formData.initPassword) {
        return { isValid: false, message: '请输入初始密码' };
      }
      return { isValid: true };
    }
  },
  {
    step: 1,
    fields: ['password', 'confirmPassword', 'phone', 'smsCode'],
    validateFunction: (formData) => {
      // 验证密码
      if (!formData.password) {
        return { isValid: false, message: '请输入系统登录密码' };
      }
      if (formData.password.length < 8 || formData.password.length > 20) {
        return { isValid: false, message: '密码长度8-20个字符' };
      }

      // 验证确认密码
      if (!formData.confirmPassword) {
        return { isValid: false, message: '请确认密码' };
      }
      if (formData.password !== formData.confirmPassword) {
        return { isValid: false, message: '两次输入的密码不一致' };
      }

      // 验证手机号
      if (!formData.phone) {
        return { isValid: false, message: '请输入手机号' };
      }
      if (!validatePhone(formData.phone)) {
        return { isValid: false, message: '请输入正确的手机号' };
      }

      // 验证短信验证码
      if (!formData.smsCode) {
        return { isValid: false, message: '请输入短信验证码' };
      }
      if (!validateSmsCode(formData.smsCode)) {
        return { isValid: false, message: '请输入6位数字验证码' };
      }

      return { isValid: true };
    }
  }
];

/**
 * 步骤验证器
 */
export class StepValidator {
  private validations: StepValidationConfig[];

  constructor(validations: StepValidationConfig[]) {
    this.validations = validations;
  }

  /**
   * 验证指定步骤
   */
  validateStep(step: number, formData: Record<string, any>): StepValidationResult {
    const validation = this.validations.find(v => v.step === step);
    if (!validation) {
      return { isValid: true };
    }

    return validation.validateFunction(formData);
  }

  /**
   * 验证所有步骤
   */
  validateAllSteps(formData: Record<string, any>): StepValidationResult {
    for (const validation of this.validations) {
      const result = validation.validateFunction(formData);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  }

  /**
   * 获取步骤的必填字段
   */
  getRequiredFields(step: number): string[] {
    const validation = this.validations.find(v => v.step === step);
    return validation ? validation.fields : [];
  }

  /**
   * 检查步骤是否可以进入下一步
   */
  canProceedToNext(step: number, formData: Record<string, any>): boolean {
    const result = this.validateStep(step, formData);
    return result.isValid;
  }
}

/**
 * 创建内网用户注册步骤验证器
 */
export function createInertRegistrationStepValidator(): StepValidator {
  return new StepValidator(INERT_REGISTRATION_STEP_VALIDATIONS);
}

/**
 * 步骤验证钩子函数
 */
export function useStepValidation(validator: StepValidator) {
  const validateCurrentStep = (step: number, formData: Record<string, any>): boolean => {
    // 对于第二步，如果用户还没有开始填写任何字段，则不显示错误信息
    if (step === 1) {
      const hasAnyInput = formData.password || formData.confirmPassword || formData.phone || formData.smsCode;
      if (!hasAnyInput) {
        return false; // 用户还没有开始填写，验证失败但不显示错误信息
      }
    }

    const result = validator.validateStep(step, formData);
    if (!result.isValid && result.message) {
      BtcMessage.warning(result.message);
    }
    return result.isValid;
  };

  const canProceed = (step: number, formData: Record<string, any>): boolean => {
    return validator.canProceedToNext(step, formData);
  };

  const getRequiredFields = (step: number): string[] => {
    return validator.getRequiredFields(step);
  };

  return {
    validateCurrentStep,
    canProceed,
    getRequiredFields
  };
}
