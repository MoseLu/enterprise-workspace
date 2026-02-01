<template>
  <div class="page">
    <div class="preview-container">
      <!-- ???? -->
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <el-select
          v-model="selectedRole"
          :placeholder="t('navigation.preview.select_role')"
          @change="handleRoleChange"
          style="width: 200px;"
        >
          <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
          />
        </el-select>
        <el-button type="primary" @click="handleRefresh" style="margin-left: 10px;">
          <el-icon><Refresh /></el-icon>
          {{ t('navigation.preview.refresh') }}
        </el-button>
      </BtcCrudRow>

      <!-- ???? -->
      <div class="menu-preview" v-if="selectedRole && filteredMenus.length > 0">
        <el-menu
          :default-active="activeMenu"
          class="preview-menu"
          mode="vertical"
          @select="handleMenuSelect"
        >
          <template v-for="menu in filteredMenus" :key="menu.id">
            <el-sub-menu
              v-if="menu.children && menu.children.length > 0"
              :index="menu.id.toString()"
            >
              <template #title>
                <el-icon v-if="menu.icon">
                  <component :is="menu.icon" />
                </el-icon>
                <span>{{ menu.label }}</span>
              </template>
              <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="child.id.toString()"
              >
                <el-icon v-if="child.icon">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.label }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.id.toString()">
              <el-icon v-if="menu.icon">
                <component :is="menu.icon" />
              </el-icon>
              <span>{{ menu.label }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import { Refresh, User } from '@element-plus/icons-vue';
import { service } from '@services/eps';

const { t } = useI18n();

defineOptions({
  name: 'NavigationMenuPreview'
});

// Mock??
const message = useMessage();
const _userService = service.admin?.iam?.user;
const _roleService = service.admin?.iam?.role;

const menuService = service.admin?.iam?.menu;

// ?????
const roles = ref<any[]>([]);
const menus = ref<any[]>([]);
const selectedRole = ref<number | null>(null);
const activeMenu = ref('');

// ??????
const filteredMenus = computed(() => {
  if (!selectedRole.value) return [];

  const filterMenus = (menuList: any[]): any[] => {
    return menuList
      .filter(menu => menu.roles && menu.roles.includes(selectedRole.value))
      .map(menu => ({
        ...menu,
        children: menu.children ? filterMenus(menu.children) : []
      }))
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
  };

  return filterMenus(menus.value);
});

// ??????
const handleRoleChange = (roleId: number) => {
  selectedRole.value = roleId;
  activeMenu.value = '';
  message.success(`??????: ${roles.value.find(r => r.id === roleId)?.roleName}`);
};

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
  const menu = menus.value.find(m => m.id.toString() === index);
  if (menu) {
    message.info(`?????: ${menu.label}`);
  }
};

const handleRefresh = () => {
  loadData();
  message.success('????');
};

// ??????
const buildTree = (data: any[], parentId: any = null): any[] => {
  // ?? data ???
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(data, item.id)
    }));
};

// ????
const loadData = async () => {
  const [rolesData, menusData] = await Promise.all([
    _roleService.list({}),
    menuService.list({})
  ]);

  // ?? rolesData ???
  roles.value = Array.isArray(rolesData) ? rolesData : (rolesData?.list || []);
  // ?? menusData ??????????????
  const menuList = Array.isArray(menusData) ? menusData : (menusData?.list || []);
  menus.value = buildTree(menuList);
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>


.preview-container {
  min-height: 400px;
}

.menu-preview {
  .preview-menu {
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    width: 300px;
  }
}
</style>

