<template>
  <div class="strategy-node-properties">
    <!-- 基础属性 -->
    <div class="property-section">
      <h4 class="section-title">基础属性</h4>

      <btc-config-form :model="nodeForm" label-width="60px" size="small">
        <btc-config-form-item label="节点名称" prop="name">
          <el-input
            v-model="nodeForm.name"
            @blur="updateNode"
            placeholder="请输入节点名称"
          />
        </btc-config-form-item>

        <btc-config-form-item label="节点描述" prop="description">
          <el-input
            v-model="nodeForm.description"
            type="textarea"
            :rows="2"
            @blur="updateNode"
            placeholder="请输入节点描述"
          />
        </btc-config-form-item>

        <btc-config-form-item label="节点类型" prop="type">
          <el-select v-model="nodeForm.type" @change="handleTypeChange" disabled>
            <el-option
              v-for="type in nodeTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </btc-config-form-item>
      </btc-config-form>
    </div>

    <!-- 样式属性 -->
    <div class="property-section">
      <h4 class="section-title">样式属性</h4>

      <btc-config-form :model="styleForm" label-width="60px" size="small">
        <btc-config-form-item label="宽度" prop="width">
          <el-input-number
            v-model="styleForm.width"
            :min="80"
            :max="300"
            @change="updateStyle"
          />
        </btc-config-form-item>

        <btc-config-form-item label="高度" prop="height">
          <el-input-number
            v-model="styleForm.height"
            :min="60"
            :max="200"
            @change="updateStyle"
          />
        </btc-config-form-item>

        <btc-config-form-item label="背景色" prop="backgroundColor">
          <!-- 暂时禁用 el-color-picker，避免 getBoundingClientRect 错误 -->
          <!-- <el-color-picker
            v-model="styleForm.backgroundColor"
            @change="updateStyle"
            show-alpha
            :teleported="false"
            style="width: 100%"
          /> -->
          <el-input v-model="styleForm.backgroundColor" placeholder="请输入颜色值，如 #ff0000" />
        </btc-config-form-item>

        <btc-config-form-item label="边框色" prop="borderColor">
          <!-- 暂时禁用 el-color-picker，避免 getBoundingClientRect 错误 -->
          <!-- <el-color-picker
            v-model="styleForm.borderColor"
            @change="updateStyle"
            :teleported="false"
            style="width: 100%"
          /> -->
          <el-input v-model="styleForm.borderColor" placeholder="请输入颜色值，如 #ff0000" />
        </btc-config-form-item>
      </btc-config-form>
    </div>

    <!-- 节点配置 -->
    <div class="property-section">
      <h4 class="section-title">节点配置</h4>

      <!-- 条件节点配置 -->
      <ConditionNodeConfig
        v-if="node.type === 'CONDITION'"
        :conditions="node.data.conditions || []"
        @update="updateConditions"
      />

      <!-- 动作节点配置 -->
      <ActionNodeConfig
        v-else-if="node.type === 'ACTION'"
        :actions="node.data.actions || []"
        @update="updateActions"
      />

      <!-- 决策节点配置 -->
      <DecisionNodeConfig
        v-else-if="node.type === 'DECISION'"
        :rules="node.data.rules || []"
        @update="updateRules"
      />

      <!-- 网关节点配置 -->
      <GatewayNodeConfig
        v-else-if="node.type === 'GATEWAY'"
        :config="node.data.config || {}"
        @update="updateConfig"
      />

      <!-- 开始/结束节点 -->
      <div v-else class="node-config-empty">
        <BtcEmpty
          description="此节点类型无需额外配置"
          :image-size="60"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import type {
  StrategyNode as IStrategyNode,
  NodeType,
  StrategyCondition,
  StrategyAction,
  StrategyRule
} from '@/types/strategy';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';
import { BtcEmpty } from '@btc/shared-components';
import ConditionNodeConfig from './ConditionNodeConfig.vue';
import ActionNodeConfig from './ActionNodeConfig.vue';
import DecisionNodeConfig from './DecisionNodeConfig.vue';
import GatewayNodeConfig from './GatewayNodeConfig.vue';

// Props
interface Props {
  node: IStrategyNode;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [nodeId: string, properties: Partial<IStrategyNode>];
}>();

const { t } = useI18n();

// 响应式数据
const nodeForm = ref({
  name: props.node.name,
  description: props.node.description || '',
  type: props.node.type
});

const styleForm = ref({
  width: props.node.style?.width || 120,
  height: props.node.style?.height || 80,
  backgroundColor: props.node.style?.backgroundColor || '#ffffff',
  borderColor: props.node.style?.borderColor || '#409eff'
});
// 节点类型选项
const nodeTypes = computed(() => [
  { value: 'START', label: `${t('common.strategy.designer.node_types.start')}${t('common.strategy.designer.node_types.node')}` },
  { value: 'END', label: `${t('common.strategy.designer.node_types.end')}${t('common.strategy.designer.node_types.node')}` },
  { value: 'CONDITION', label: `${t('common.strategy.designer.node_types.condition')}${t('common.strategy.designer.node_types.node')}` },
  { value: 'ACTION', label: `${t('common.strategy.designer.node_types.action')}${t('common.strategy.designer.node_types.node')}` },
  { value: 'DECISION', label: `${t('common.strategy.designer.node_types.decision')}${t('common.strategy.designer.node_types.node')}` },
  { value: 'GATEWAY', label: `${t('common.strategy.designer.node_types.gateway')}${t('common.strategy.designer.node_types.node')}` }
]);

// 监听节点变化
watch(() => props.node, (newNode) => {
  nodeForm.value = {
    name: newNode.name,
    description: newNode.description || '',
    type: newNode.type
  };

  styleForm.value = {
    width: newNode.style?.width || 120,
    height: newNode.style?.height || 80,
    backgroundColor: newNode.style?.backgroundColor || '#ffffff',
    borderColor: newNode.style?.borderColor || '#409eff'
  };
}, { deep: true });

// 事件处理
const updateNode = () => {
  emit('update', props.node.id, {
    name: nodeForm.value.name,
    description: nodeForm.value.description
  });
};

const updateStyle = () => {
  emit('update', props.node.id, {
    style: {
      ...props.node.style,
      width: styleForm.value.width,
      height: styleForm.value.height,
      backgroundColor: styleForm.value.backgroundColor,
      borderColor: styleForm.value.borderColor
    }
  });
};

const handleTypeChange = (newType: NodeType) => {
  // 类型改变时重置数据
  emit('update', props.node.id, {
    type: newType,
    data: {
      conditions: [],
      actions: [],
      rules: [],
      config: {}
    }
  });
};

const updateConditions = (conditions: StrategyCondition[]) => {
  emit('update', props.node.id, {
    data: {
      ...props.node.data,
      conditions
    }
  });
};

const updateActions = (actions: StrategyAction[]) => {
  emit('update', props.node.id, {
    data: {
      ...props.node.data,
      actions
    }
  });
};

const updateRules = (rules: StrategyRule[]) => {
  emit('update', props.node.id, {
    data: {
      ...props.node.data,
      rules
    }
  });
};

const updateConfig = (config: Record<string, any>) => {
  emit('update', props.node.id, {
    data: {
      ...props.node.data,
      config
    }
  });
};
</script>

<style lang="scss" scoped>
.strategy-node-properties {
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

  .node-config-empty {
    padding: 20px 0;
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
}
</style>
