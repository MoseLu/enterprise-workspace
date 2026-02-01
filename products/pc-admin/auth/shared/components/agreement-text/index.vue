<template>
  <div class="agreement-text">
    <el-checkbox
      id="agreement-checkbox"
      name="agreement"
      v-model="agreed"
      size="small"
      @change="handleAgreementChange"
    >
      <span class="agreement-content">
        {{ t('未注册手机验证后自动登录，注册即代表同意') }}
        <a href="/duty/agreement.html" target="_blank" rel="noopener noreferrer" class="agreement-link">{{ t('《拜里斯科技软件协议》') }}</a>
      </span>
    </el-checkbox>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'BtcAgreementText'
});

const { t } = useI18n();

// 协议同意状态
const agreed = ref(false);

// 定义事件
const emit = defineEmits<{
  agreementChange: [agreed: boolean]
}>();

// 处理协议同意状态变化
const handleAgreementChange = (value: boolean) => {
  emit('agreementChange', value);
};

// 监听协议状态变化
watch(agreed, (newValue) => {
  emit('agreementChange', newValue);
});

// 暴露方法供父组件调用
defineExpose({
  agreed,
  resetAgreement: () => {
    agreed.value = false;
  },
  // 自动勾选协议
  checkAgreement: () => {
    agreed.value = true;
  }
});
</script>

<style lang="scss" scoped>
.agreement-text {
  text-align: left;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
  padding: 0;

  :deep(.el-checkbox) {
    align-items: flex-start;
    display: flex;

    .el-checkbox__input {
      margin-top: 0;
      align-self: flex-start;
      flex-shrink: 0;

      .el-checkbox__inner {
        margin-top: 3px;
      }
    }

    .el-checkbox__label {
      font-size: 12px;
      line-height: 1.6;
      padding-left: 8px;
      margin-top: 0;
    }
  }

  .agreement-content {
    color: var(--el-text-color-placeholder);
    display: inline;
  }

  .agreement-link {
    color: var(--el-color-primary);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
    margin-left: 2px;

    &:hover {
      color: var(--el-color-primary-light-3);
      text-decoration: underline;
    }
  }
}

// 暗色主题适配
html.dark {
  .agreement-text {
    .agreement-content {
      color: var(--el-text-color-placeholder);
    }

    .agreement-link {
      color: var(--el-color-primary);

      &:hover {
        color: var(--el-color-primary-light-3);
      }
    }
  }
}
</style>
