<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedMenuService"
      :table-columns="menuColumns"
      :form-items="menuFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="title.navigation.menus.domains"
      right-title="菜单列表"
      search-placeholder="搜索菜单..."
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
      :left-size="'small'"
      @select="onDomainSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcMasterTableGroup } from '@btc/shared-components';
import { usePageColumns, usePageForms, getPageConfigFull, usePageService, useI18n } from '@btc/shared-core';

defineOptions({
  name: 'NavigationMenus',
});

const { t } = useI18n();
const tableGroupRef = ref();
const selectedModule = ref<any>(null);

// 从 config.ts 读取配置
const { columns: menuColumns } = usePageColumns('navigation.menus');
const { formItems: menuFormItems } = usePageForms('navigation.menus');
const pageConfig = getPageConfigFull('navigation.menus');

// 使用 config.ts 中定义的服务
const domainService = pageConfig?.service?.domainService;
const wrappedMenuService = usePageService('navigation.menus', 'menu', {
  showSuccessMessage: true,
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedModule.value = domain;
};


</script>

<style lang="scss" scoped>

</style>
