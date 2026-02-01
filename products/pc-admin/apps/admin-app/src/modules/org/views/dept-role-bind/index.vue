<template>
  <div class="dept-role-bind">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ t('org.dept.info') }}</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('org.dept.name')">{{ deptInfo.deptNameCn }}</el-descriptions-item>
        <el-descriptions-item :label="t('org.dept.code')">{{ deptInfo.deptCode }}</el-descriptions-item>
        <el-descriptions-item :label="t('org.dept.sort')">{{ deptInfo.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="ID">{{ deptInfo.deptId }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="roles-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>{{ t('org.dept.role_bind') }}</span>
          <el-button type="primary" size="small" @click="handleSave" :loading="saving">{{ t('org.dept.save_bind') }}</el-button>
        </div>
      </template>

      <el-transfer
        v-model="selectedRoles"
        :data="allRoles"
        :titles="[t('org.dept.available_roles'), t('org.dept.bound_roles')]"
        filterable
        :filter-placeholder="t('org.dept.search_roles')"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import { createMockCrudService } from '@utils/http';

const { t } = useI18n();
const message = useMessage();
const route = useRoute();
const deptId = route.params.id;

const deptInfo = ref<any>({});
const allRoles = ref<any[]>([]);
const selectedRoles = ref<any[]>([]);
const saving = ref(false);

// Mock服务
const departmentService = createMockCrudService('btc_departments');
const roleService = createMockCrudService('btc_roles', {

});

// 加载部门信息
const loadDeptInfo = async () => {
  try {
    const data = await departmentService.info({ deptId });
    deptInfo.value = data;
  } catch (_error) {
    message.error(t('org.dept.load_info_error'));
  }
};

// 加载角色列表
const loadRoles = async () => {
  try {
    const roles = await roleService.list({});
    allRoles.value = roles.map((role: any) => ({
      key: role.id,
      label: `${role.roleName}（${role.roleCode}）`,
      disabled: false,
    }));

    // Mock：随机选择一些已绑定的角色
    selectedRoles.value = [1, 3]; // 模拟绑定管理员和员工
  } catch (_error) {
    message.error(t('org.role.load_list_error'));
  }
};

// 保存绑定
const handleSave = async () => {
  saving.value = true;
  try {
    // Mock：模拟异步保存
    await new Promise(resolve => setTimeout(resolve, 500));

    // 这里应该调用后端API保存绑定关系
    // await http.post(`/departments/${deptId}/roles`, { roleIds: selectedRoles.value });

    message.success(t('crud.message.save_success'));
  } catch (_error) {
    message.error(t('crud.message.save_error'));
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadDeptInfo();
  loadRoles();
});
</script>

<style lang="scss" scoped>
.dept-role-bind {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card, .roles-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}
</style>
