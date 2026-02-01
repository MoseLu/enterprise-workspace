<template>
  <div class="role-perm-bind">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>????</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="????">{{ roleInfo.roleName }}</el-descriptions-item>
        <el-descriptions-item label="????">{{ roleInfo.roleCode }}</el-descriptions-item>
        <el-descriptions-item label="????">{{ roleInfo.roleType }}</el-descriptions-item>
        <el-descriptions-item label="??">{{ roleInfo.description }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="perms-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>????</span>
          <div>
            <el-button @click="handleCancel">??</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">??</el-button>
          </div>
        </div>
      </template>

      <el-tree
        ref="treeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="{ children: 'children', label: 'label' }"
        :default-checked-keys="checkedPermissions"
        @check="handleCheck"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from '@/utils/use-message';
import { service } from '@services/eps';

const route = useRoute();
const message = useMessage();
const router = useRouter();
const roleId = route.params.id;

const roleInfo = ref<any>({});
const permissionTree = ref<any[]>([]);
const checkedPermissions = ref<number[]>([]);
const saving = ref(false);
const treeRef = ref();

// Mock??
const roleService = service.admin?.iam?.role;

// Mock?????
const loadPermissionTree = () => {
  permissionTree.value = [
    {
      id: 'user',
      label: '????',
      children: [
        { id: 1, label: '????' },
        { id: 2, label: '????' },
        { id: 3, label: '????' },
      ]
    },
    {
      id: 'role',
      label: '????',
      children: [
        { id: 4, label: '????' },
        { id: 5, label: '????' },
      ]
    },
    {
      id: 'dept',
      label: '????',
      children: [
        { id: 6, label: '????' },
        { id: 7, label: '????' },
      ]
    }
  ];

  // ????????
  checkedPermissions.value = [1, 4, 6];
};

// ??????
const loadRoleInfo = async () => {
  try {
    const data = await roleService.info({ id: roleId });
    roleInfo.value = data;
  } catch (_error) {
    message.error('????????');
  }
};

// ??????
const handleCheck = () => {
  // ????????????
};

// ??
const handleSave = async () => {
  saving.value = true;
  try {
    const _checkedKeys = treeRef.value?.getCheckedKeys() || [];

    await new Promise(resolve => setTimeout(resolve, 500));

    // ????????API
    // await http.post(`/roles/${roleId}/permissions`, { permissionIds: checkedKeys });

    message.success('????');
    router.back();
  } catch (_error) {
    message.error('????');
  } finally {
    saving.value = false;
  }
};

// ??
const handleCancel = () => {
  router.back();
};

onMounted(() => {
  loadRoleInfo();
  loadPermissionTree();
});
</script>

<style lang="scss" scoped>
.role-perm-bind {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

