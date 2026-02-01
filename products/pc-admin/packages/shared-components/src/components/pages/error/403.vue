<template>
  <div class="page">
    <div class="page__wrap">
      <btc-svg name="403" class="page__icon" :size="200" />
      <h1 class="page__code">
        <span v-for="c in codes" :key="c">
          {{ c }}
        </span>
      </h1>
      <p class="page__desc">{{ desc }}</p>

      <div class="page__btns">
        <el-button @click="home">{{ t('common.back_home') }}</el-button>
        <el-button type="primary" @click="goBack">{{ t('common.go_back') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcError403',
});

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';

const props = withDefaults(defineProps<{
  code?: number;
  desc?: string;
}>(), {
  code: 403,
  desc: '',
});

const router = useRouter();
const { t } = useI18n();

const codes = computed(() => {
  return (props.code || 403).toString().split('');
});

const desc = computed(() => {
  return props.desc || t('common.forbidden');
});

function home() {
  router.push('/');
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
}
</script>

<style lang="scss" scoped>
.page {
  // 确保页面容器本身也垂直居中
  justify-content: center;
  align-items: center;
  
  &__wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 1;
    flex-shrink: 0; // 防止被压缩
  }

  &__icon {
    margin-bottom: 20px;
    color: var(--el-text-color-secondary);
    opacity: 0.8;
  }

  &__code {
    font-size: 120px;
    font-weight: normal;
    color: var(--el-text-color-secondary);
    font-family: Consolas, monospace;
    margin: 0;
    line-height: 1;
    animation: dou 1s infinite linear;
    position: relative;
  }

  &__desc {
    font-size: 16px;
    font-weight: 400;
    color: var(--el-text-color-regular);
    margin-top: 30px;
    margin-bottom: 0;
  }

  &__btns {
    display: flex;
    margin-top: 40px;
    gap: 12px;
  }
}

@keyframes dou {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
