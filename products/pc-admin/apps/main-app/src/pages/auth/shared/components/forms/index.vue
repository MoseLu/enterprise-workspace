<template>
  <div class="auth-step-form">
    <StepIndicator
      :showSteps="modelShowSteps"
      :currentStep="currentStep"
      :steps="modelSteps"
    />

    <StepContent
      :currentStep="currentStep"
      :stepDescriptions="modelStepDescriptions"
      :isFirstStep="isFirstStep"
      :isLastStep="isLastStep"
    >
      <template #step-description="{ currentStep }">
        <slot name="step-description" :currentStep="currentStep">
          <p>{{ modelStepDescriptions[currentStep] || '请完成当前步�? }}</p>
        </slot>
      </template>

      <template #default="{ currentStep, isFirstStep, isLastStep }">
        <slot :currentStep="currentStep" :isFirstStep="isFirstStep" :isLastStep="isLastStep">
          <div class="default-step-content">
            <p>步骤 {{ currentStep + 1 }} 内容</p>
          </div>
        </slot>
      </template>
    </StepContent>

    <StepActions
      :currentStep="currentStep"
      :isFirstStep="isFirstStep"
      :isLastStep="isLastStep"
      :canProceed="canProceed"
      :loading="loading"
      :prevButtonText="prevButtonText"
      :nextButtonText="nextButtonText"
      :finishButtonText="finishButtonText"
      @prevStep="handlePrevStep"
      @nextStep="handleNextStep"
      @finish="handleFinish"
    >
      <template #step-actions="{ currentStep, isFirstStep, isLastStep }">
        <slot name="step-actions" :currentStep="currentStep" :isFirstStep="isFirstStep" :isLastStep="isLastStep">
          <el-button
            v-if="!isFirstStep"
            @click="handlePrevStep"
            :disabled="loading"
          >
            {{ prevButtonText }}
          </el-button>

          <el-button
            v-if="!isLastStep"
            type="primary"
            @click="handleNextStep"
            :disabled="!canProceed || loading"
            :loading="loading"
          >
            {{ nextButtonText }}
          </el-button>

          <el-button
            v-if="isLastStep"
            type="primary"
            @click="handleFinish"
            :disabled="!canProceed || loading"
            :loading="loading"
          >
            {{ finishButtonText }}
          </el-button>
        </slot>
      </template>
    </StepActions>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import StepIndicator from './step-indicator/index.vue';
import StepContent from './step-content/index.vue';
import StepActions from './step-actions/index.vue';

defineOptions({
  name: 'AuthStepForm'
});

interface Props {
  currentStep: number;
  steps: string[];
  stepDescriptions: string[];
  showSteps?: boolean;
  canProceed?: boolean;
  loading?: boolean;
  prevButtonText?: string;
  nextButtonText?: string;
  finishButtonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showSteps: true,
  canProceed: true,
  loading: false,
  prevButtonText: '上一步,
  nextButtonText: '下一步,
  finishButtonText: '完成'
});

const emit = defineEmits<{
  (e: 'prevStep'): void;
  (e: 'nextStep'): void;
  (e: 'finish'): void;
  (e: 'update:currentStep', step: number): void;
}>();

// 计算属性
const modelShowSteps = computed(() => props.showSteps);
const modelSteps = computed(() => props.steps);
const modelStepDescriptions = computed(() => props.stepDescriptions);

const isFirstStep = computed(() => props.currentStep === 0);
const isLastStep = computed(() => props.currentStep === props.steps.length - 1);

// 方法
const handlePrevStep = () => {
  if (!isFirstStep.value) {
    const newStep = props.currentStep - 1;
    emit('update:currentStep', newStep);
    emit('prevStep');
  }
};

const handleNextStep = () => {
  if (!isLastStep.value && props.canProceed) {
    const newStep = props.currentStep + 1;
    emit('update:currentStep', newStep);
    emit('nextStep');
  }
};

const handleFinish = () => {
  if (isLastStep.value && props.canProceed) {
    emit('finish');
  }
};
</script>

<style lang="scss" scoped>
.auth-step-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .default-step-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;

    p {
      margin: 0;
      color: var(--el-text-color-placeholder);
      font-size: 16px;
    }
  }
}
</style>
