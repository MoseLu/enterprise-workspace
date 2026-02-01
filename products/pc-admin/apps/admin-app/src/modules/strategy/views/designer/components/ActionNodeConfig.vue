<template>
  <div class="action-node-config">
    <div class="config-header">
      <span>动作配置</span>
      <el-button size="small" type="primary" @click="addAction">
        <el-icon><Plus /></el-icon>
        添加动作
      </el-button>
    </div>

    <div v-if="actions.length === 0" class="empty-state">
      <BtcEmpty description="暂无动作，请添加动作" :image-size="60" />
    </div>

    <div v-else class="actions-list">
      <div
        v-for="(action, index) in actions"
        :key="action.id"
        class="action-item"
      >
        <div class="action-header">
          <span class="action-index">动作 {{ index + 1 }}</span>
          <el-button
            size="small"
            type="danger"
            text
            @click="removeAction(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <btc-config-form :model="action" size="small" label-width="60px">
          <btc-config-form-item label="类型" prop="type">
            <el-select
              v-model="action.type"
              placeholder="选择动作类型"
              @change="emitUpdate"
            >
              <el-option
                v-for="type in actionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </btc-config-form-item>

          <btc-config-form-item label="参数" prop="parametersJson">
            <el-input
              v-model="action.parametersJson"
              type="textarea"
              :rows="3"
              placeholder='{"key": "value"}'
              @blur="updateParameters(action)"
            />
          </btc-config-form-item>

          <btc-config-form-item label="描述" prop="description">
            <el-input
              v-model="action.description"
              placeholder="动作描述"
              @blur="emitUpdate"
            />
          </btc-config-form-item>
        </btc-config-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { Plus, Delete } from '@element-plus/icons-vue';
import type { StrategyAction } from '@/types/strategy';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';
import { BtcEmpty } from '@btc/shared-components';

// Props
interface Props {
  actions: StrategyAction[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [actions: StrategyAction[]];
}>();

// 扩展动作接口以支持JSON编辑
interface ExtendedAction extends StrategyAction {
  parametersJson?: string;
}

// 动作类型选项
const { t } = useI18n();
const actionTypes = [
  { value: 'ALLOW_ACCESS', label: t('common.strategy.designer.action_types.allow_access') },
  { value: 'DENY_ACCESS', label: t('common.strategy.designer.action_types.deny_access') },
  { value: 'LOG_EVENT', label: t('common.strategy.designer.action_types.log_event') },
  { value: 'SEND_NOTIFICATION', label: t('common.strategy.designer.action_types.send_notification') },
  { value: 'UPDATE_DATA', label: t('common.strategy.designer.action_types.update_data') },
  { value: 'CALL_API', label: t('common.strategy.designer.action_types.call_api') },
  { value: 'EXECUTE_SCRIPT', label: t('common.strategy.designer.action_types.execute_script') },
  { value: 'SET_VARIABLE', label: t('common.strategy.designer.action_types.set_variable') }
];

// 计算属性
const actions = computed({
  get: () => props.actions.map(action => ({
    ...action,
    parametersJson: JSON.stringify(action.parameters || {}, null, 2)
  })) as ExtendedAction[],
  set: (value) => {
    const normalizedActions = value.map(action => ({
      id: action.id,
      type: action.type,
      parameters: action.parameters || {},
      description: action.description
    }));
    emit('update', normalizedActions);
  }
});

// 工具函数
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const addAction = () => {
  const newAction: ExtendedAction = {
    id: generateId(),
    type: 'ALLOW_ACCESS',
    parameters: {},
    parametersJson: '{}',
    description: ''
  };

  actions.value = [...actions.value, newAction];
};

const removeAction = (index: number) => {
  const newActions = [...actions.value];
  newActions.splice(index, 1);
  actions.value = newActions;
};

const updateParameters = (action: ExtendedAction) => {
  try {
    action.parameters = JSON.parse(action.parametersJson || '{}');
    emitUpdate();
  } catch (error) {
    BtcMessage.error(t('common.strategy.designer.invalid_json_format'));
  }
};

const emitUpdate = () => {
  const normalizedActions = actions.value.map(action => ({
    id: action.id,
    type: action.type,
    parameters: action.parameters || {},
    description: action.description
  }));
  emit('update', normalizedActions);
};
</script>

<style lang="scss" scoped>
.action-node-config {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .empty-state {
    padding: 20px 0;
  }

  .actions-list {
    .action-item {
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      background: var(--el-bg-color-page);

      .action-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .action-index {
          font-size: 12px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      :deep(.btc-config-form-item) {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .btc-config-form-item__label {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
