<template>
  <div class="properties-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
      <div class="panel-actions">
        <el-button
          v-if="selectedNode"
          type="danger"
          size="small"
          @click="deleteSelected"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <div class="panel-content">
      <!-- 节点属性配置 -->
      <div v-if="selectedNode" class="node-properties">
        <h4>节点属性</h4>

        <!-- 文本配置 -->
        <div class="text-config">
          <h5>文本配置</h5>

          <div class="config-item">
            <label>字体大小</label>
            <el-input-number
              v-model="nodeTextConfig.fontSize"
              :min="8"
              :max="32"
              :step="1"
              size="small"
            />
          </div>

          <div class="config-item">
            <label>字体族</label>
            <el-select v-model="nodeTextConfig.fontFamily" size="small">
              <el-option
                v-for="font in fontFamilyOptions"
                :key="font.value"
                :label="font.label"
                :value="font.value"
              />
            </el-select>
          </div>

          <div class="config-item">
            <label>字体粗细</label>
            <el-select v-model="nodeTextConfig.fontWeight" size="small">
              <el-option
                v-for="weight in fontWeightOptions"
                :key="weight.value"
                :label="weight.label"
                :value="weight.value"
              />
            </el-select>
          </div>

          <div class="config-item">
            <label>字体样式</label>
            <el-select v-model="nodeTextConfig.fontStyle" size="small">
              <el-option
                v-for="style in fontStyleOptions"
                :key="style.value"
                :label="style.label"
                :value="style.value"
              />
            </el-select>
          </div>

          <!-- 字体预览 -->
          <div class="font-preview">
            <label>预览效果</label>
            <div
              class="preview-text"
              :style="{
                fontSize: nodeTextConfig.fontSize + 'px',
                fontFamily: nodeTextConfig.fontFamily,
                fontWeight: nodeTextConfig.fontWeight,
                fontStyle: nodeTextConfig.fontStyle,
                color: getNodeTextColor(selectedNode.type)
              }"
            >
              {{ selectedNode.text || getNodeText(selectedNode.type) }}
            </div>
          </div>
        </div>

        <!-- 节点类型特定配置 -->
        <div class="node-specific-config">
          <component
            :is="getNodeConfigComponent(selectedNode.type)"
            :model-value="selectedNode"
            @update:model-value="updateNode"
          />
        </div>
      </div>

      <!-- 连接线属性配置 -->
      <div v-else-if="selectedConnection" class="connection-properties">
        <h4>连接线属性</h4>
        <StrategyConnectionProperties
          :model-value="selectedConnection"
          @update:model-value="updateConnection"
        />
      </div>

      <!-- 默认提示 -->
      <div v-else class="empty-state">
        <BtcEmpty description="请选择一个节点或连接线" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import type { StrategyNode, StrategyConnection, NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';
import StrategyConnectionProperties from './StrategyConnectionProperties.vue';
import ActionNodeConfig from './ActionNodeConfig.vue';
import ConditionNodeConfig from './ConditionNodeConfig.vue';
import DecisionNodeConfig from './DecisionNodeConfig.vue';
import GatewayNodeConfig from './GatewayNodeConfig.vue';
import { BtcEmpty } from '@btc/shared-components';

interface Props {
  selectedNode: StrategyNode | null;
  selectedConnection: StrategyConnection | null;
  nodeTextConfig: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
  };
}

interface Emits {
  (e: 'update:nodeTextConfig', value: any): void;
  (e: 'update-node', node: StrategyNode): void;
  (e: 'update-connection', connection: StrategyConnection): void;
  (e: 'delete-selected'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
// 字体配置选项
const fontFamilyOptions = [
  { label: t('common.strategy.designer.font_family.system_default'), value: 'system-ui, -apple-system, sans-serif' },
  { label: t('common.strategy.designer.font_family.monospace'), value: '"JetBrains Mono", "Fira Code", monospace' },
  { label: t('common.strategy.designer.font_family.serif'), value: '"Times New Roman", "Georgia", serif' },
  { label: t('common.strategy.designer.font_family.rounded'), value: '"Segoe UI", "PingFang SC", sans-serif' },
  { label: t('common.strategy.designer.font_family.bold'), value: '"Impact", "Arial Black", sans-serif' }
];

const fontWeightOptions = [
  { label: t('common.strategy.designer.font_weight.thin'), value: '100' },
  { label: t('common.strategy.designer.font_weight.extra_light'), value: '200' },
  { label: t('common.strategy.designer.font_weight.light'), value: '300' },
  { label: t('common.strategy.designer.font_weight.normal'), value: '400' },
  { label: t('common.strategy.designer.font_weight.medium'), value: '500' },
  { label: t('common.strategy.designer.font_weight.bold'), value: '700' }
];

const fontStyleOptions = [
  { label: t('common.strategy.designer.font_style.normal'), value: 'normal' },
  { label: t('common.strategy.designer.font_style.italic'), value: 'italic' },
  { label: t('common.strategy.designer.font_style.oblique'), value: 'oblique' }
];

// 计算属性
const nodeTextConfig = computed({
  get: () => props.nodeTextConfig,
  set: (value) => emit('update:nodeTextConfig', value)
});

// 方法
const getNodeConfigComponent = (type: NodeType) => {
  const componentMap = {
    [NodeTypeEnum.ACTION]: ActionNodeConfig,
    [NodeTypeEnum.CONDITION]: ConditionNodeConfig,
    [NodeTypeEnum.DECISION]: DecisionNodeConfig,
    [NodeTypeEnum.GATEWAY]: GatewayNodeConfig
  };
  return componentMap[type] || null;
};

const updateNode = (node: StrategyNode) => {
  emit('update-node', node);
};

const updateConnection = (connection: StrategyConnection) => {
  emit('update-connection', connection);
};

const deleteSelected = () => {
  emit('delete-selected');
};

const getNodeTextColor = (type: NodeType): string => {
  return '#ffffff';
};

const getNodeText = (type: NodeType): string => {
  const textMap = {
    [NodeTypeEnum.START]: t('common.strategy.designer.node_types.start'),
    [NodeTypeEnum.END]: t('common.strategy.designer.node_types.end'),
    [NodeTypeEnum.CONDITION]: t('common.strategy.designer.node_types.condition'),
    [NodeTypeEnum.ACTION]: t('common.strategy.designer.node_types.action'),
    [NodeTypeEnum.DECISION]: t('common.strategy.designer.node_types.decision'),
    [NodeTypeEnum.GATEWAY]: t('common.strategy.designer.node_types.gateway')
  };
  return textMap[type] || t('common.strategy.designer.node_types.node');
};
</script>

<style lang="scss">
@use '../styles/properties-panel.scss';
</style>
