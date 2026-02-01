<template>
  <div class="menu-perm-bind">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>菜单信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="菜单名称">{{ menuInfo.menuNameCn }}</el-descriptions-item>
        <el-descriptions-item label="菜单编码">{{ menuInfo.menuCode }}</el-descriptions-item>
        <el-descriptions-item label="路径">{{ menuInfo.menuPath }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ menuInfo.menuType }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="perms-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>权限绑定</span>
          <div>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
          </div>
        </div>
      </template>

      <el-transfer
        v-model="selectedPermissions"
        :data="allPermissions"
        :titles="['可用权限', '已绑定权�（]"
        filterable
        filter-placeholder="搜索权限"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from '@/utils/use-message';
import { service } from '@services/eps';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const menuId = route.params.id;

const menuInfo = ref<any>({});
const allPermissions = ref<any[]>([]);
const selectedPermissions = ref<number[]>([]);
const saving = ref(false);

// Mock服务
const menuService = service.admin.iam.sysmenu;
const permissionService = service.admin.iam.syspermission;

// 加载菜单信息
const loadMenuInfo = async () => {
  try {
    const data = await menuService.info({ id: menuId });
    menuInfo.value = data;
  } catch (_error) {
    message.error(t('common.navigation.menu.load_menu_info_failed'));
  }
};

// 加载权限列表
const loadPermissions = async () => {
  try {
    const permissions = await permissionService.list({});
    allPermissions.value = permissions.map((perm: any) => ({
      key: perm.id,
      label: `${perm.permissionName}�（{perm.permissionCode}）`,
      disabled: false,
    }));

    // Mock：默认选中一些权�（    selectedPermissions.value = [1, 4];
  } catch (_error) {
    message.error(t('common.navigation.menu.load_permissions_failed'));
  }
};

// 保存
const handleSave = async () => {
  saving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    // 这里应该调用后端API
    // await http.post(`/menus/${menuId}/permissions`, { permissionIds: selectedPermissions.value });

    message.success(t('common.save_success'));
    router.back();
  } catch (_error) {
    message.error(t('common.save_failed'));
  } finally {
    saving.value = false;
  }
};

// 取消
const handleCancel = () => {
  router.back();
};

onMounted(() => {
  loadMenuInfo();
  loadPermissions();
});
</script>

<style lang="scss" scoped>
.menu-perm-bind {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

