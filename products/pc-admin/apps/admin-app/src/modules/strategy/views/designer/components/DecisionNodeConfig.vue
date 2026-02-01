<template>
  <div class="decision-node-config">
    <div class="config-header">
      <span>决策规则</span>
      <el-button size="small" type="primary" @click="addRule">
        <el-icon><Plus /></el-icon>
        添加规则
      </el-button>
    </div>

    <div v-if="rules.length === 0" class="empty-state">
      <BtcEmpty description="暂无规则，请添加决策规则" :image-size="60" />
    </div>

    <div v-else class="rules-list">
      <div
        v-for="(rule, index) in rules"
        :key="rule.id"
        class="rule-item"
      >
        <div class="rule-header">
          <span class="rule-index">规则 {{ index + 1 }}</span>
          <el-button
            size="small"
            type="danger"
            text
            @click="removeRule(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <btc-config-form :model="rule" size="small" label-width="60px">
          <btc-config-form-item label="表达式" prop="expression">
            <el-input
              v-model="rule.expression"
              type="textarea"
              :rows="2"
              placeholder="如：user.score > 80 ? 'high' : 'low'"
              @blur="emitUpdate"
            />
          </btc-config-form-item>

          <btc-config-form-item label="变量" prop="variablesJson">
            <el-input
              v-model="rule.variablesJson"
              type="textarea"
              :rows="2"
              placeholder='{"user": {"score": 0}}'
              @blur="updateVariables(rule)"
            />
          </btc-config-form-item>

          <btc-config-form-item label="描述" prop="description">
            <el-input
              v-model="rule.description"
              placeholder="规则描述"
              @blur="emitUpdate"
            />
          </btc-config-form-item>
        </btc-config-form>
      </div>
    </div>

    <!-- 表达式帮助 -->
    <div class="expression-help">
      <h5>表达式语法帮助</h5>
      <div class="help-content">
        <p><strong>基本语法：</strong></p>
        <ul>
          <li>条件判断：<code>condition ? value1 : value2</code></li>
          <li>比较操作：<code>&gt;</code>, <code>&lt;</code>, <code>==</code>, <code>!=</code></li>
          <li>逻辑操作：<code>&amp;&amp;</code>, <code>||</code>, <code>!</code></li>
          <li>数学运算：<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code></li>
        </ul>
        <p><strong>示例：</strong></p>
        <ul>
          <li><code>user.age >= 18 ? 'adult' : 'minor'</code></li>
          <li><code>order.amount > 1000 && user.vip ? 'discount' : 'normal'</code></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { Plus, Delete } from '@element-plus/icons-vue';
import type { StrategyRule } from '@/types/strategy';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';
import { BtcEmpty } from '@btc/shared-components';

// Props
interface Props {
  rules: StrategyRule[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [rules: StrategyRule[]];
}>();

// 扩展规则接口以支持JSON编辑
interface ExtendedRule extends StrategyRule {
  variablesJson?: string;
}

const { t } = useI18n();

// 计算属性
const rules = computed({
  get: () => props.rules.map(rule => ({
    ...rule,
    variablesJson: JSON.stringify(rule.variables || {}, null, 2)
  })) as ExtendedRule[],
  set: (value) => {
    const normalizedRules = value.map(rule => ({
      id: rule.id,
      expression: rule.expression,
      variables: rule.variables || {},
      description: rule.description
    }));
    emit('update', normalizedRules);
  }
});

// 工具函数
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const addRule = () => {
  const newRule: ExtendedRule = {
    id: generateId(),
    expression: '',
    variables: {},
    variablesJson: '{}',
    description: ''
  };

  rules.value = [...rules.value, newRule];
};

const removeRule = (index: number) => {
  const newRules = [...rules.value];
  newRules.splice(index, 1);
  rules.value = newRules;
};

const updateVariables = (rule: ExtendedRule) => {
  try {
    rule.variables = JSON.parse(rule.variablesJson || '{}');
    emitUpdate();
  } catch (error) {
    BtcMessage.error(t('common.strategy.designer.variable_invalid_json'));
  }
};

const emitUpdate = () => {
  const normalizedRules = rules.value.map(rule => ({
    id: rule.id,
    expression: rule.expression,
    variables: rule.variables || {},
    description: rule.description
  }));
  emit('update', normalizedRules);
};
</script>

<style lang="scss" scoped>
.decision-node-config {
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

  .rules-list {
    .rule-item {
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      background: var(--el-bg-color-page);

      .rule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .rule-index {
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

  .expression-help {
    margin-top: 20px;
    padding: 12px;
    background: var(--el-color-info-light-9);
    border-radius: 6px;

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: var(--el-text-color-primary);
    }

    .help-content {
      font-size: 11px;
      color: var(--el-text-color-regular);

      p {
        margin: 4px 0;
      }

      ul {
        margin: 4px 0;
        padding-left: 16px;

        li {
          margin: 2px 0;
        }
      }

      code {
        background: var(--el-color-info-light-8);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }
    }
  }
}
</style>
