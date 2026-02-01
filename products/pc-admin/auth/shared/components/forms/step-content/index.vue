<template>
  <div class="step-content">
    <!-- 步骤描述插槽 -->
    <div class="step-description">
      <slot name="step-description" :currentStep="currentStep">
        <p>{{ stepDescriptions[currentStep] || '请完成当前步�? }}</p>
      </slot>
    </div>

    <!-- 步骤内容插槽 -->
    <div class="step-body">
      <slot :currentStep="currentStep" :isFirstStep="isFirstStep" :isLastStep="isLastStep">
        <div class="default-step-content">
          <p>步骤 {{ currentStep + 1 }} 内容</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'StepContent'
});

interface Props {
  currentStep: number;
  stepDescriptions: string[];
  isFirstStep: boolean;
  isLastStep: boolean;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.step-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;

  .step-description {
    text-align: center;

    p {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }

  .step-body {
    flex: 1;
    min-height: 200px;

    .default-step-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      p {
        margin: 0;
        color: var(--el-text-color-placeholder);
        font-size: 16px;
      }
    }
  }
}
</style>
