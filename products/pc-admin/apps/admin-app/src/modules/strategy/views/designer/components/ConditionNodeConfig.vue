<template>
  <div class="condition-node-config">
    <div class="config-header">
      <span>条件配置</span>
      <el-button size="small" type="primary" @click="addCondition">
        <el-icon><Plus /></el-icon>
        添加条件
      </el-button>
    </div>

    <div v-if="conditions.length === 0" class="empty-state">
      <BtcEmpty description="暂无条件，请添加条件" :image-size="60" />
    </div>

    <div v-else class="conditions-list">
      <div
        v-for="(condition, index) in conditions"
        :key="condition.id"
        class="condition-item"
      >
        <div class="condition-header">
          <span class="condition-index">条件 {{ index + 1 }}</span>
          <el-button
            size="small"
            type="danger"
            text
            @click="removeCondition(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <btc-config-form :model="condition" size="small" label-width="60px">
          <btc-config-form-item label="字段" prop="field">
            <el-input
              v-model="condition.field"
              placeholder="如：user.role"
              @blur="emitUpdate"
            />
          </btc-config-form-item>

          <btc-config-form-item label="操作符" prop="operator">
            <el-select
              v-model="condition.operator"
              placeholder="选择操作符"
              @change="emitUpdate"
            >
              <el-option
                v-for="op in operators"
                :key="op.value"
                :label="op.label"
                :value="op.value"
              />
            </el-select>
          </btc-config-form-item>

          <btc-config-form-item label="值" prop="value">
            <el-input
              v-model="condition.value"
              placeholder="比较值"
              @blur="emitUpdate"
            />
          </btc-config-form-item>

          <btc-config-form-item v-if="index > 0" label="逻辑" prop="logicalOperator">
            <el-radio-group
              v-model="condition.logicalOperator"
              @change="emitUpdate"
            >
              <el-radio value="AND">且</el-radio>
              <el-radio value="OR">或</el-radio>
            </el-radio-group>
          </btc-config-form-item>
        </btc-config-form>
      </div>
    </div>

    <!-- 表达式预览 -->
    <div v-if="conditions.length > 0" class="expression-preview">
      <h5>表达式预览</h5>
      <div class="expression-text">
        {{ generateExpression() }}
      </div>
    </div>

    <!-- 测试工具 -->
    <div class="test-section">
      <h5>条件测试</h5>
      <btc-config-form :model="{ testData }" size="small" label-width="80px">
        <btc-config-form-item label="测试数据" prop="testData">
          <el-input
            v-model="testData"
            type="textarea"
            :rows="3"
            placeholder='{"user": {"role": "admin"}, "resource": {"type": "document"}}'
          />
        </btc-config-form-item>
        <btc-config-form-item>
          <el-button type="primary" @click="testConditions">测试条件</el-button>
        </btc-config-form-item>
      </btc-config-form>

      <div v-if="testResult !== null" class="test-result">
        <el-alert
          :type="testResult ? 'success' : 'error'"
          :title="testResult ? '条件满足' : '条件不满足'"
          show-icon
          :closable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import { Plus, Delete } from '@element-plus/icons-vue';
import type { StrategyCondition } from '@/types/strategy';
import { BtcEmpty } from '@btc/shared-components';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';

// Props
interface Props {
  conditions: StrategyCondition[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [conditions: StrategyCondition[]];
}>();

// 响应式数据
const testData = ref('{"user": {"role": "admin"}, "resource": {"type": "document"}}');
const testResult = ref<boolean | null>(null);

// 操作符选项
const { t } = useI18n();
const operators = [
  { value: 'eq', label: t('common.strategy.designer.operators.eq') },
  { value: 'ne', label: t('common.strategy.designer.operators.ne') },
  { value: 'gt', label: t('common.strategy.designer.operators.gt') },
  { value: 'gte', label: t('common.strategy.designer.operators.gte') },
  { value: 'lt', label: t('common.strategy.designer.operators.lt') },
  { value: 'lte', label: t('common.strategy.designer.operators.lte') },
  { value: 'in', label: t('common.strategy.designer.operators.in') },
  { value: 'nin', label: t('common.strategy.designer.operators.nin') },
  { value: 'contains', label: t('common.strategy.designer.operators.contains') },
  { value: 'startsWith', label: t('common.strategy.designer.operators.startsWith') },
  { value: 'endsWith', label: t('common.strategy.designer.operators.endsWith') },
  { value: 'regex', label: t('common.strategy.designer.operators.regex') },
  { value: 'exists', label: t('common.strategy.designer.operators.exists') },
  { value: 'notExists', label: t('common.strategy.designer.operators.notExists') }
];

// 计算属性
const conditions = computed({
  get: () => props.conditions,
  set: (value) => emit('update', value)
});

// 工具函数
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const addCondition = () => {
  const newCondition: StrategyCondition = {
    id: generateId(),
    field: '',
    operator: 'eq',
    value: '',
    logicalOperator: conditions.value.length > 0 ? 'AND' : undefined
  };

  conditions.value = [...conditions.value, newCondition];
};

const removeCondition = (index: number) => {
  const newConditions = [...conditions.value];
  newConditions.splice(index, 1);

  // 如果删除的是第一个条件，需要移除下一个条件的逻辑操作符
  if (index === 0 && newConditions.length > 0) {
    newConditions[0].logicalOperator = undefined;
  }

  conditions.value = newConditions;
};

const emitUpdate = () => {
  emit('update', conditions.value);
};

const generateExpression = (): string => {
  if (conditions.value.length === 0) return '';

  return conditions.value.map((condition, index) => {
    let expr = `${condition.field} ${getOperatorSymbol(condition.operator)} ${formatValue(condition.value)}`;

    if (index > 0 && condition.logicalOperator) {
      expr = `${condition.logicalOperator} ${expr}`;
    }

    return expr;
  }).join(' ');
};

const getOperatorSymbol = (operator: string): string => {
  const symbolMap: Record<string, string> = {
    'eq': '==',
    'ne': '!=',
    'gt': '>',
    'gte': '>=',
    'lt': '<',
    'lte': '<=',
    'in': 'in',
    'nin': 'not in',
    'contains': 'contains',
    'startsWith': 'starts with',
    'endsWith': 'ends with',
    'regex': 'matches',
    'exists': 'exists',
    'notExists': 'not exists'
  };
  return symbolMap[operator] || operator;
};

const formatValue = (value: any): string => {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
};

const testConditions = () => {
  try {
    const data = JSON.parse(testData.value);
    const result = evaluateConditions(conditions.value, data);
    testResult.value = result;
  } catch (error) {
    BtcMessage.error(t('common.strategy.designer.test_data_invalid_json'));
    testResult.value = null;
  }
};

const evaluateConditions = (conditions: StrategyCondition[], data: any): boolean => {
  if (conditions.length === 0) return true;

  let result = evaluateSingleCondition(conditions[0], data);

  for (let i = 1; i < conditions.length; i++) {
    const condition = conditions[i];
    const conditionResult = evaluateSingleCondition(condition, data);

    if (condition.logicalOperator === 'OR') {
      result = result || conditionResult;
    } else {
      result = result && conditionResult;
    }
  }

  return result;
};

const evaluateSingleCondition = (condition: StrategyCondition, data: any): boolean => {
  const fieldValue = getFieldValue(data, condition.field);
  const compareValue = parseValue(condition.value);

  switch (condition.operator) {
    case 'eq':
      return fieldValue === compareValue;
    case 'ne':
      return fieldValue !== compareValue;
    case 'gt':
      return Number(fieldValue) > Number(compareValue);
    case 'gte':
      return Number(fieldValue) >= Number(compareValue);
    case 'lt':
      return Number(fieldValue) < Number(compareValue);
    case 'lte':
      return Number(fieldValue) <= Number(compareValue);
    case 'in':
      return Array.isArray(compareValue) && compareValue.includes(fieldValue);
    case 'nin':
      return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
    case 'contains':
      return String(fieldValue).includes(String(compareValue));
    case 'startsWith':
      return String(fieldValue).startsWith(String(compareValue));
    case 'endsWith':
      return String(fieldValue).endsWith(String(compareValue));
    case 'regex':
      return new RegExp(String(compareValue)).test(String(fieldValue));
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    case 'notExists':
      return fieldValue === undefined || fieldValue === null;
    default:
      return false;
  }
};

const getFieldValue = (data: any, field: string): any => {
  const keys = field.split('.');
  let value = data;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
};

const parseValue = (value: string): any => {
  // 尝试解析为JSON
  try {
    return JSON.parse(value);
  } catch {
    // 如果不是有效JSON，返回原字符串
    return value;
  }
};
</script>

<style lang="scss" scoped>
.condition-node-config {
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

  .conditions-list {
    .condition-item {
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      background: var(--el-bg-color-page);

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .condition-index {
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

  .expression-preview {
    margin-top: 16px;
    padding: 12px;
    background: var(--el-color-info-light-9);
    border-radius: 6px;

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: var(--el-text-color-primary);
    }

    .expression-text {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 11px;
      color: var(--el-text-color-regular);
      background: white;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--el-border-color-light);
      word-break: break-all;
    }
  }

  .test-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);

    h5 {
      margin: 0 0 12px 0;
      font-size: 12px;
      color: var(--el-text-color-primary);
    }

    .test-result {
      margin-top: 12px;
    }

    :deep(.el-form-item) {
      margin-bottom: 12px;

      .el-form-item__label {
        font-size: 11px;
      }
    }
  }
}
</style>
