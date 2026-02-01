/**
 * 注册步骤相关工具函数
 */

import { ref, computed } from 'vue';
import { createStepState } from '../../shared/composables/state';

/**
 * 步骤配置
 */
export interface StepConfig {
  title: string;
}

/**
 * 注册状态
 */
export type RegistrationStatus = 'pending' | 'processing' | 'success' | 'failed';

/**
 * 创建注册步骤配置
 * @returns 步骤配置数组
 */
export function createRegistrationSteps(): StepConfig[] {
  return [
    { title: '验证身份' },
    { title: '补充信息' },
    { title: '完成注册' }
  ];
}

/**
 * 创建ITL注册步骤配置（简化为两步）
 */
export function createITLRegistrationSteps(): StepConfig[] {
  return [
    { title: '验证身份' },
    { title: '等待审核' }
  ];
}

/**
 * 创建步骤描述配置
 * @returns 步骤描述数组
 */
export function createStepDescriptions(): string[] {
  return [
    '请输入您的工号和初始密码进行身份验证',
    '请确认您的员工信息并完善账号设置',
    '您的账号已成功创建，请妥善保管登录信息'
  ];
}

/**
 * 创建ITL步骤描述配置（用于内网员工注册）
 */
export function createITLStepDescriptions(): string[] {
  return [
    '请输入您的员工工号和初始密码以验证身份',
    '您的注册申请已提交，请等待管理员审核'
  ];
}

/**
 * 创建注册步骤状态管理
 * @param totalSteps 总步骤数
 * @returns 步骤状态管理对象
 */
export function createRegistrationStepState(totalSteps: number = 3) {
  const { currentStep, nextStep, prevStep, setStep, resetStep, isFirstStep, isLastStep } = createStepState(totalSteps);

  // 注册状态
  const registrationStatus = ref<RegistrationStatus>('pending');
  const registrationError = ref('');
  const registrationProgress = ref(0);

  // 计算属性 - 基于当前步骤
  const canProceed = computed(() => {
    // 这里需要根据具体的表单状态来判断
    // 在实际使用时，应该传入表单验证函数
    return true;
  });

  // 设置注册状态
  const setRegistrationStatus = (status: RegistrationStatus) => {
    registrationStatus.value = status;
  };

  // 设置注册错误
  const setRegistrationError = (error: string) => {
    registrationError.value = error;
  };

  // 设置注册进度
  const setRegistrationProgress = (progress: number) => {
    registrationProgress.value = Math.min(Math.max(progress, 0), 100);
  };

  // 重置注册状态
  const resetRegistrationState = () => {
    registrationStatus.value = 'pending';
    registrationError.value = '';
    registrationProgress.value = 0;
  };

  return {
    // 步骤状态
    currentStep,
    nextStep,
    prevStep,
    setStep,
    resetStep,
    isFirstStep,
    isLastStep,

    // 注册状态
    registrationStatus,
    registrationError,
    registrationProgress,

    // 计算属性
    canProceed,

    // 方法
    setRegistrationStatus,
    setRegistrationError,
    setRegistrationProgress,
    resetRegistrationState
  };
}

/**
 * 创建租户选择状态
 * @returns 租户选择状态对象
 */
export function createTenantSelectionState() {
  const currentStep = ref<'tenant-select' | 'INERT' | 'UK-HEAD' | 'SUPPLIER'>('tenant-select');
  const selectedTenant = ref<string>('');

  const handleTenantSelected = (tenant: string) => {
    selectedTenant.value = tenant;
    currentStep.value = tenant as any;
  };

  const backToTenantSelect = () => {
    currentStep.value = 'tenant-select';
    selectedTenant.value = '';
  };

  return {
    currentStep,
    selectedTenant,
    handleTenantSelected,
    backToTenantSelect
  };
}
