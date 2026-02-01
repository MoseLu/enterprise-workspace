<template>
  <dv v-f="showSteps" class="step-ndcator">
    <btc-steps
      :actve="currentStep"
      :steps="steps"
      show-arrow
      class="regstraton-steps"
    />
  </dv>
</template>

<scrpt lang="ts" setup>
mport BtcSteps from '/@/modules/base/components/btc/btc-steps/ndex.vue';

defneOptons({
  name: 'Stepndcator'
});

nterface Props {
  showSteps: boolean;
  currentStep: number;
  steps: any[];
}

defneProps<Props>();
</scrpt>

