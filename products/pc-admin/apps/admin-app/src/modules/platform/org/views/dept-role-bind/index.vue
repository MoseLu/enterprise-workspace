<template>
  <div class="dept-role-bind">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>部门信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="部门名称">{{ deptInfo.deptNameCn }}</el-descriptions-item>
        <el-descriptions-item label="部门编码">{{ deptInfo.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ deptInfo.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="ID">{{ deptInfo.deptId }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="roles-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>角色绑定</span>
          <el-button type="primary" size="small" @click="handleSave" :loading="saving">保存绑定</el-button>
        </div>
      </template>

      <el-transfer
        v-model="selectedRoles"
        :data="allRoles"
        :titles="['可用角色', '已绑定角�?]"
        filterable
        filter-placeholder="搜索角色"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import { service } from '@services/eps';

const route = useRoute();
const deptId = route.params.id;
const message = useMessage();

const deptInfo = ref<any>({});
const allRoles = ref<any[]>([]);
const selectedRoles = ref<any[]>([]);
const saving = ref(false);

// Mock服务
const departmentService = service.admin?.iam?.department;
const roleService = service.admin?.iam?.role;

// 加载部门信息
const loadDeptInfo = async () => {
  try {
    const data = await departmentService.info({ deptId });
    deptInfo.value = data;
  } catch (_error) {
    message.error(t('common.org.departments.load_dept_info_failed'));
  }
};

// 加载角色列表
const loadRoles = async () => {
  try {
    const roles = await roleService.list({});
    allRoles.value = roles.map((role: any) => ({
      key: role.id,
      label: `${role.roleName}�?{role.roleCode}）`,
      disabled: false,
    }));

    // Mock：随机选择一些已绑定的角�?    selectedRoles.value = [1, 3]; // 默认绑定管理员和员工
  } catch (_error) {
    message.error(t('common.org.load_roles_failed'));
  }
};

// 保存绑定
const handleSave = async () => {
  saving.value = true;
  try {
    // Mock：延迟模拟保�?    await new Promise(resolve => setTimeout(resolve, 500));

    // 这里应该调用后端API保存绑定关系
    // await http.post(`/departments/${deptId}/roles`, { roleIds: selectedRoles.value });

    message.success(t('common.save_success'));
  } catch (_error) {
    message.error(t('common.save_failed'));
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


