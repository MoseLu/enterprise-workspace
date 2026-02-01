<template>
  <div class="step-actions">
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
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'StepActions'
});

interface Props {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  loading: boolean;
  prevButtonText?: string;
  nextButtonText?: string;
  finishButtonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  prevButtonText: '上一步,
  nextButtonText: '下一步,
  finishButtonText: '完成'
});

const emit = defineEmits<{
  (e: 'prevStep'): void;
  (e: 'nextStep'): void;
  (e: 'finish'): void;
}>();

const handlePrevStep = () => {
  emit('prevStep');
};

const handleNextStep = () => {
  emit('nextStep');
};

const handleFinish = () => {
  emit('finish');
};
</script>

<style lang="scss" scoped>
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 20px;

  .el-button {
    min-width: 100px;
  }
}
</style>
