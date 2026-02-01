import { ref, computed } from 'vue';

export function useAuthStepForm() {
  // 响应式数据
  const currentStep = ref(0);
  const steps = ref([
    { title: '步骤1' },
    { title: '步骤2' }
  ]);
  const stepDescriptions = ref([
    '请完成当前步骤',
    '请完成当前步骤'
  ]);
  const nextButtonText = ref('下一步');
  const prevButtonText = ref('上一步');
  const finishButtonText = ref('完成');
  const showSteps = ref(true);
  const loading = ref(false);
  const canProceed = ref(true);

  // 计算属性
  const isFirstStep = computed(() => currentStep.value === 0);
  const isLastStep = computed(() => currentStep.value === steps.value.length - 1);

  // 设置步骤
  function setStep(step: number) {
    if (step >= 0 && step < steps.value.length) {
      currentStep.value = step;
    }
  }

  // 下一步
  function nextStep() {
    if (currentStep.value < steps.value.length - 1) {
      currentStep.value++;
    }
  }

  // 上一步
  function prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  // 重置步骤
  function resetStep() {
    currentStep.value = 0;
  }

  // 更新步骤状态
  function updateStepStatus(stepIndex: number, status: 'pending' | 'success' | 'error') {
    if (stepIndex >= 0 && stepIndex < steps.value.length) {
      steps.value[stepIndex] = {
        ...steps.value[stepIndex],
        status
      };
    }
  }

  return {
    // 数据
    currentStep,
    steps,
    stepDescriptions,
    nextButtonText,
    prevButtonText,
    finishButtonText,
    showSteps,
    loading,
    canProceed,

    // 计算属性
    isFirstStep,
    isLastStep,

    // 方法
    setStep,
    nextStep,
    prevStep,
    resetStep,
    updateStepStatus
  };
}
