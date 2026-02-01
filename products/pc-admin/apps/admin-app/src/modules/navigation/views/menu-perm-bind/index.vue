<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('navigation.permission.bind_title') }}</span>
          <el-button type="primary" @click="handleSave" :loading="saving">
            {{ t('navigation.permission.save') }}
          </el-button>
        </div>
      </template>

      <el-transfer
        v-model="selectedPermissions"
        :data="allPermissions"
        :titles="[t('navigation.permission.all'), t('navigation.permission.selected')]"
        filterable
        :filter-placeholder="t('navigation.permission.search')"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import { service } from '@services/eps';

defineOptions({
  name: 'NavigationMenuPermBind'
});

const { t } = useI18n();

// Mock??
const message = useMessage();
const menuPermService = service.admin?.iam?.department;
const permissionService = service.admin?.iam?.permission;

// ????
const allPermissions = ref<any[]>([]);
const selectedPermissions = ref<number[]>([]);
const saving = ref(false);

// ??????
const loadPermissions = async () => {
  const permissions = await permissionService.list({});
  allPermissions.value = permissions.map(p => ({
    key: p.id,
    label: p.name,
    disabled: false
  }));
};

// ????????
const loadBoundPermissions = async () => {
  const boundPerms = await menuPermService.list({});
  selectedPermissions.value = boundPerms.map((p: any) => p.permissionId);
};

// ????
const handleSave = async () => {
  saving.value = true;
  try {
    // ??????
    const existing = await menuPermService.list({});
    for (const item of existing) {
      await menuPermService.remove(item.id);
    }

    // ?????
    for (const permissionId of selectedPermissions.value) {
      await menuPermService.add({
        menuId: 1, // ???????????ID
        permissionId,
        createTime: new Date().toISOString()
      });
    }

    message.success('????');
  } catch (_error) {
    message.error('????');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadPermissions();
  loadBoundPermissions();
});
</script>

<style lang="scss" scoped>


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

