<template>
  <div class="gateway-node-config">
    <div class="config-header">
      <span>{{ t('common.strategy.designer.gateway_config') }}</span>
    </div>

    <btc-config-form :model="configForm" size="small" label-width="80px">
      <btc-config-form-item :label="t('common.strategy.designer.gateway_type')" prop="gatewayType">
        <el-select v-model="configForm.gatewayType" @change="emitUpdate">
          <el-option
            v-for="type in gatewayTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </btc-config-form-item>

      <btc-config-form-item :label="t('common.strategy.designer.merge_strategy')" prop="mergeStrategy">
        <el-select v-model="configForm.mergeStrategy" @change="emitUpdate">
          <el-option :label="t('common.strategy.designer.merge_strategy_all')" value="all" />
          <el-option :label="t('common.strategy.designer.merge_strategy_any')" value="any" />
          <el-option :label="t('common.strategy.designer.merge_strategy_majority')" value="majority" />
          <el-option :label="t('common.strategy.designer.merge_strategy_custom')" value="custom" />
        </el-select>
      </btc-config-form-item>

      <btc-config-form-item v-if="configForm.mergeStrategy === 'custom'" :label="t('common.strategy.designer.custom_rule')" prop="customRule">
        <el-input
          v-model="configForm.customRule"
          type="textarea"
          :rows="3"
          :placeholder="t('common.strategy.designer.custom_rule_placeholder')"
          @blur="emitUpdate"
        />
      </btc-config-form-item>

      <btc-config-form-item :label="t('common.strategy.designer.timeout')" prop="timeout">
        <el-input-number
          v-model="configForm.timeout"
          :min="1000"
          :max="60000"
          :step="1000"
          @change="emitUpdate"
        />
        <span style="margin-left: 8px; font-size: 12px; color: var(--el-text-color-secondary);">{{ t('common.strategy.designer.milliseconds') }}</span>
      </btc-config-form-item>

      <btc-config-form-item :label="t('common.strategy.designer.parallel_execution')" prop="parallel">
        <el-switch
          v-model="configForm.parallel"
          @change="emitUpdate"
        />
      </btc-config-form-item>

      <btc-config-form-item :label="t('common.strategy.designer.failure_handling')" prop="failureHandling">
        <el-radio-group v-model="configForm.failureHandling" @change="emitUpdate">
          <el-radio value="continue">{{ t('common.strategy.designer.failure_handling_continue') }}</el-radio>
          <el-radio value="stop">{{ t('common.strategy.designer.failure_handling_stop') }}</el-radio>
          <el-radio value="retry">{{ t('common.strategy.designer.failure_handling_retry') }}</el-radio>
        </el-radio-group>
      </btc-config-form-item>

      <btc-config-form-item v-if="configForm.failureHandling === 'retry'" :label="t('common.strategy.designer.retry_count')" prop="retryCount">
        <el-input-number
          v-model="configForm.retryCount"
          :min="1"
          :max="10"
          @change="emitUpdate"
        />
      </btc-config-form-item>
    </btc-config-form>

    <!-- 配置预览 -->
    <div class="config-preview">
      <h5>{{ t('common.strategy.designer.config_preview') }}</h5>
      <pre class="config-json">{{ JSON.stringify(configForm, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';

// Props
interface Props {
  config: Record<string, any>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [config: Record<string, any>];
}>();

const { t } = useI18n();

// 网关类型选项
const gatewayTypes = [
  { value: 'parallel', label: t('common.strategy.designer.gateway_types.parallel') },
  { value: 'exclusive', label: t('common.strategy.designer.gateway_types.exclusive') },
  { value: 'inclusive', label: t('common.strategy.designer.gateway_types.inclusive') },
  { value: 'complex', label: t('common.strategy.designer.gateway_types.complex') }
];

// 配置表单
const configForm = ref({
  gatewayType: 'parallel',
  mergeStrategy: 'all',
  customRule: '',
  timeout: 5000,
  parallel: true,
  failureHandling: 'continue',
  retryCount: 3,
  ...props.config
});

// 监听配置变化
watch(() => props.config, (newConfig) => {
  configForm.value = {
    gatewayType: 'parallel',
    mergeStrategy: 'all',
    customRule: '',
    timeout: 5000,
    parallel: true,
    failureHandling: 'continue',
    retryCount: 3,
    ...newConfig
  };
}, { deep: true });

// 事件处理
const emitUpdate = () => {
  emit('update', { ...configForm.value });
};
</script>

<style lang="scss" scoped>
.gateway-node-config {
  .config-header {
    margin-bottom: 16px;
    font-weight: 500;
  }

  :deep(.btc-config-form-item) {
    margin-bottom: 16px;

    .btc-config-form-item__label {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }

    .el-input,
    .el-select,
    .el-input-number {
      width: 100%;
    }
  }

  .config-preview {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: var(--el-text-color-primary);
    }

    .config-json {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 10px;
      color: var(--el-text-color-regular);
      background: var(--el-bg-color-page);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--el-border-color-light);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
