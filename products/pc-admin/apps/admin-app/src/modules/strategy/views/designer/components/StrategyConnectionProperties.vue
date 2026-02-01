<template>
  <div class="strategy-connection-properties">
    <div class="property-section">
      <h4 class="section-title">连接属性</h4>

      <btc-config-form :model="connectionForm" label-width="60px" size="small">
        <btc-config-form-item label="连接类型" prop="type">
          <el-select v-model="connectionForm.type" @change="updateConnection">
            <el-option label="顺序连接" value="SEQUENCE" />
            <el-option label="条件连接" value="CONDITIONAL" />
          </el-select>
        </btc-config-form-item>

        <btc-config-form-item label="连接标签" prop="label">
          <el-input
            v-model="connectionForm.label"
            placeholder="连接描述"
            @blur="updateConnection"
          />
        </btc-config-form-item>

        <btc-config-form-item v-if="connectionForm.type === 'CONDITIONAL'" label="条件" prop="condition">
          <el-input
            v-model="conditionExpression"
            type="textarea"
            :rows="2"
            placeholder="如：result === true"
            @blur="updateCondition"
          />
        </btc-config-form-item>
      </btc-config-form>
    </div>

    <div class="property-section">
      <h4 class="section-title">样式属性</h4>

      <btc-config-form :model="styleForm" label-width="60px" size="small">
        <btc-config-form-item label="线条颜色" prop="strokeColor">
          <!-- 暂时禁用 el-color-picker，避免 getBoundingClientRect 错误 -->
          <!-- <el-color-picker
            v-model="styleForm.strokeColor"
            @change="updateStyle"
            :teleported="false"
            style="width: 100%"
          /> -->
          <el-input v-model="styleForm.strokeColor" placeholder="请输入颜色值，如 #ff0000" />
        </btc-config-form-item>

        <btc-config-form-item label="线条宽度" prop="strokeWidth">
          <el-input-number
            v-model="styleForm.strokeWidth"
            :min="1"
            :max="10"
            @change="updateStyle"
          />
        </btc-config-form-item>

        <btc-config-form-item label="线条样式" prop="strokeDasharray">
          <el-select v-model="styleForm.strokeDasharray" @change="updateStyle">
            <el-option label="实线" value="" />
            <el-option label="虚线" value="5,5" />
            <el-option label="点线" value="2,2" />
            <el-option label="点划线" value="10,5,2,5" />
          </el-select>
        </btc-config-form-item>
      </btc-config-form>
    </div>

    <!-- 连接信息 -->
    <div class="property-section">
      <h4 class="section-title">连接信息</h4>

      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="源节点ID">
          {{ connection.sourceNodeId }}
        </el-descriptions-item>
        <el-descriptions-item label="目标节点ID">
          {{ connection.targetNodeId }}
        </el-descriptions-item>
        <el-descriptions-item label="源句柄">
          {{ connection.sourceHandle || '默认' }}
        </el-descriptions-item>
        <el-descriptions-item label="目标句柄">
          {{ connection.targetHandle || '默认' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { StrategyConnection, StrategyCondition } from '@/types/strategy';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';

// Props
interface Props {
  connection: StrategyConnection;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [connectionId: string, properties: Partial<StrategyConnection>];
}>();

// 响应式数据
const connectionForm = ref({
  type: props.connection.type,
  label: props.connection.label || ''
});

const styleForm = ref({
  strokeColor: props.connection.style?.strokeColor || '#409eff',
  strokeWidth: props.connection.style?.strokeWidth || 2,
  strokeDasharray: props.connection.style?.strokeDasharray || ''
});

const conditionExpression = ref(
  props.connection.condition?.field && props.connection.condition?.operator && props.connection.condition?.value
    ? `${props.connection.condition.field} ${props.connection.condition.operator} ${props.connection.condition.value}`
    : ''
);

// 监听连接变化
watch(() => props.connection, (newConnection) => {
  connectionForm.value = {
    type: newConnection.type,
    label: newConnection.label || ''
  };

  styleForm.value = {
    strokeColor: newConnection.style?.strokeColor || '#409eff',
    strokeWidth: newConnection.style?.strokeWidth || 2,
    strokeDasharray: newConnection.style?.strokeDasharray || ''
  };

  conditionExpression.value =
    newConnection.condition?.field && newConnection.condition?.operator && newConnection.condition?.value
      ? `${newConnection.condition.field} ${newConnection.condition.operator} ${newConnection.condition.value}`
      : '';
}, { deep: true });

// 事件处理
const updateConnection = () => {
  emit('update', props.connection.id, {
    type: connectionForm.value.type,
    label: connectionForm.value.label
  });
};

const updateStyle = () => {
  emit('update', props.connection.id, {
    style: {
      ...props.connection.style,
      strokeColor: styleForm.value.strokeColor,
      strokeWidth: styleForm.value.strokeWidth,
      strokeDasharray: styleForm.value.strokeDasharray
    }
  });
};

const updateCondition = () => {
  if (!conditionExpression.value.trim()) {
    emit('update', props.connection.id, {
      condition: undefined
    });
    return;
  }

  // 简单解析表达式（实际项目中可能需要更复杂的解析器）
  const parts = conditionExpression.value.trim().split(/\s+/);
  if (parts.length >= 3) {
    const condition: StrategyCondition = {
      id: Date.now().toString(),
      field: parts[0],
      operator: parts[1],
      value: parts.slice(2).join(' ')
    };

    emit('update', props.connection.id, {
      condition
    });
  }
};
</script>

<style lang="scss" scoped>
.strategy-connection-properties {
  .property-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
      padding-bottom: 8px;
    }
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

  :deep(.el-color-picker) {
    width: 100%;

    .el-color-picker__trigger {
      width: 100%;
    }
  }

  :deep(.el-descriptions) {
    .el-descriptions__label {
      font-size: 12px;
    }

    .el-descriptions__content {
      font-size: 12px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
  }
}
</style>
