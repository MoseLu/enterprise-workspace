<template>
  <div class="page">
    <BtcCrudRow>
      <BtcCrudFlex1 />
      <el-form
        ref="formRef"
        :model="simulatorForm"
        :rules="formRules"
        inline
        class="simulator-form"
      >
        <el-form-item prop="user">
          <el-select v-model="simulatorForm.user" :placeholder="t('common.ops.simulator.select_user')" style="width: 120px" size="default">
            <el-option :label="t('common.ops.simulator.admin')" value="admin" />
            <el-option :label="t('common.ops.simulator.manager')" value="manager" />
            <el-option :label="t('common.ops.simulator.employee')" value="employee" />
          </el-select>
        </el-form-item>
        <el-form-item prop="resource">
          <el-select v-model="simulatorForm.resource" :placeholder="t('common.ops.simulator.select_resource')" style="width: 120px" size="default">
            <el-option :label="t('common.ops.simulator.user_resource')" value="user" />
            <el-option :label="t('common.ops.simulator.role_resource')" value="role" />
            <el-option :label="t('common.ops.simulator.system_resource')" value="system" />
            <el-option :label="t('common.ops.simulator.order_resource')" value="order" />
          </el-select>
        </el-form-item>
        <el-form-item prop="action">
          <el-select v-model="simulatorForm.action" :placeholder="t('common.ops.simulator.select_action')" style="width: 120px" size="default">
            <el-option :label="t('common.ops.simulator.view')" value="view" />
            <el-option :label="t('common.ops.simulator.edit')" value="edit" />
            <el-option :label="t('common.ops.simulator.delete')" value="delete" />
            <el-option :label="t('common.ops.simulator.create')" value="create" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleSimulate" :loading="simulating" size="default">
        <el-icon><VideoPlay /></el-icon>
        {{ t('common.ops.simulator.start') }}
      </el-button>
    </BtcCrudRow>

    <div class="simulator-container">

        <!-- 模拟结果 -->
        <div class="simulator-result" v-if="simulationResult">
          <el-alert
            :title="simulationResult.decision === 'allow' ? t('common.ops.simulator.allow_access') : t('common.ops.simulator.deny_access')"
            :type="simulationResult.decision === 'allow' ? 'success' : 'error'"
            :description="simulationResult.reason"
            show-icon
            :closable="false"
          />

          <!-- 匹配策略 -->
          <div class="matched-policies" v-if="simulationResult.matchedPolicies.length > 0">
            <h4>{{ t('common.ops.simulator.matched_policies') }}</h4>
            <el-table :data="simulationResult.matchedPolicies" border>
              <el-table-column prop="policyName" :label="t('common.ops.simulator.policy_name')" />
              <el-table-column prop="policyType" :label="t('common.ops.simulator.policy_type')" />
              <el-table-column prop="effect" :label="t('common.ops.simulator.effect')">
                <template #default="{ row }">
                  <el-tag :type="row.effect === 'allow' ? 'success' : 'danger'">
                    {{ row.effect === 'allow' ? t('common.ops.simulator.allow') : t('common.ops.simulator.deny') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" :label="t('common.ops.simulator.priority')" />
            </el-table>
          </div>

          <!-- 执行步骤 -->
          <div class="execution-steps" v-if="simulationResult.steps.length > 0">
            <h4>{{ t('common.ops.simulator.execution_steps') }}</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(step, index) in simulationResult.steps"
                :key="index"
                :timestamp="step.timestamp"
                :type="step.type"
              >
                {{ step.description }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { VideoPlay } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { BtcCrudRow, BtcCrudFlex1, BtcMessage, ExcelPlugin } from '@btc/shared-components';

defineOptions({
  name: 'OpsSimulator'
});

const { t } = useI18n();

// 表单引用
const formRef = ref();
const simulatorForm = reactive({
  user: '',
  resource: '',
  action: ''
});

const formRules = {
  user: [{ required: true, message: t('common.ops.simulator.select_user'), trigger: 'change' }],
  resource: [{ required: true, message: t('common.ops.simulator.select_resource'), trigger: 'change' }],
  action: [{ required: true, message: t('common.ops.simulator.select_action'), trigger: 'change' }]
};

// 模拟结果
const simulationResult = ref<any>(null);
const simulating = ref(false);

// 模拟权限检查
const simulatePermission = (user: string, resource: string, action: string) => {
  // 权限配置
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      user: ['view', 'edit', 'delete', 'create'],
      role: ['view', 'edit', 'delete', 'create'],
      system: ['view', 'edit'],
      order: ['view', 'edit', 'delete', 'create']
    },
    manager: {
      user: ['view'],
      role: ['view'],
      system: ['view'],
      order: ['view', 'edit', 'create']
    },
    employee: {
      user: ['view'],
      role: [],
      system: [],
      order: ['view']
    }
  };

  const userPermissions = permissions[user] || {};
  const resourcePermissions = userPermissions[resource] || [];
  const hasPermission = resourcePermissions.includes(action);

  return {
    decision: hasPermission ? 'allow' : 'deny',
    reason: hasPermission
      ? t('common.ops.simulator.user_has_permission', { user, resource, action })
      : t('common.ops.simulator.user_no_permission', { user, resource, action }),
    matchedPolicies: hasPermission ? [
      { policyName: t('common.ops.simulator.admin_policy'), policyType: 'RBAC', effect: 'allow', priority: 100 },
    ] : [
      { policyName: t('common.ops.simulator.default_deny_policy'), policyType: 'RBAC', effect: 'deny', priority: 200 },
    ],
    steps: [
      {
        description: t('common.ops.simulator.check_user_permission', { user }),
        timestamp: new Date().toLocaleTimeString(),
        type: 'primary'
      },
      {
        description: t('common.ops.simulator.verify_resource_access', { resource }),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info'
      },
      {
        description: t('common.ops.simulator.execute_action_check', { action }),
        timestamp: new Date().toLocaleTimeString(),
        type: hasPermission ? 'success' : 'danger'
      },
      {
        description: hasPermission ? t('common.ops.simulator.permission_verify_passed') : t('common.ops.simulator.permission_verify_failed'),
        timestamp: new Date().toLocaleTimeString(),
        type: hasPermission ? 'success' : 'danger'
      }
    ]
  };
};

// 处理模拟
const handleSimulate = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    simulating.value = true;

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = simulatePermission(
      simulatorForm.user,
      simulatorForm.resource,
      simulatorForm.action
    );

    simulationResult.value = result;

    BtcMessage.success(t('common.ops.simulator.simulation_complete'));
  } catch (_error) {
    BtcMessage.error(t('common.ops.simulator.form_validation_failed'));
  } finally {
    simulating.value = false;
  }
};
</script>

<style lang="scss" scoped>


.simulator-form {
  display: inline-flex;
  align-items: center;
  gap: 10px; /* 表单项之间的间距 */

  .el-form-item {
    margin-bottom: 0;
    margin-right: 0; /* 移除默认的右边距，让 gap 生效 */
  }
}

.simulator-container {

  .simulator-result {
    .matched-policies,
    .execution-steps {
      margin-top: 20px;

      h4 {
        margin-bottom: 15px;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
