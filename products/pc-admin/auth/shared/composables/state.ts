/**
 * 状态管理工具函数
 */

import { ref, computed } from 'vue';

/**
 * 创建加载状态
 * @param initialValue 初始值
 * @returns 加载状态的 ref
 */
export function createLoadingState(initialValue: boolean = false) {
  const loading = ref(initialValue);

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const toggleLoading = () => {
    loading.value = !loading.value;
  };

  return {
    loading,
    setLoading,
    toggleLoading
  };
}

/**
 * 创建计数状态
 * @param initialValue 初始值
 * @param max 最大值
 * @returns 计数状态管理对象
 */
export function createCountState(initialValue: number = 0, max?: number) {
  const count = ref(initialValue);

  const setCount = (value: number) => {
    if (max !== undefined) {
      count.value = Math.min(Math.max(value, 0), max);
    } else {
      count.value = Math.max(value, 0);
    }
  };

  const increment = (step: number = 1) => {
    setCount(count.value + step);
  };

  const decrement = (step: number = 1) => {
    setCount(count.value - step);
  };

  const reset = () => {
    count.value = initialValue;
  };

  return {
    count,
    setCount,
    increment,
    decrement,
    reset
  };
}

/**
 * 创建步骤状态
 * @param totalSteps 总步骤数
 * @param initialStep 初始步骤
 * @returns 步骤状态管理对象
 */
export function createStepState(totalSteps: number, initialStep: number = 0) {
  const currentStep = ref(initialStep);

  const nextStep = () => {
    if (currentStep.value < totalSteps - 1) {
      currentStep.value++;
    }
  };

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  const setStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      currentStep.value = step;
    }
  };

  const resetStep = () => {
    currentStep.value = initialStep;
  };

  const isFirstStep = computed(() => currentStep.value === 0);
  const isLastStep = computed(() => currentStep.value === totalSteps - 1);

  return {
    currentStep,
    nextStep,
    prevStep,
    setStep,
    resetStep,
    isFirstStep,
    isLastStep
  };
}

/**
 * 创建进度状态
 * @param initialProgress 初始进度
 * @returns 进度状态管理对象
 */
export function createProgressState(initialProgress: number = 0) {
  const progress = ref(initialProgress);

  const setProgress = (value: number) => {
    progress.value = Math.min(Math.max(value, 0), 100);
  };

  const incrementProgress = (step: number = 1) => {
    setProgress(progress.value + step);
  };

  const resetProgress = () => {
    progress.value = initialProgress;
  };

  const isComplete = computed(() => progress.value >= 100);

  return {
    progress,
    setProgress,
    incrementProgress,
    resetProgress,
    isComplete
  };
}
