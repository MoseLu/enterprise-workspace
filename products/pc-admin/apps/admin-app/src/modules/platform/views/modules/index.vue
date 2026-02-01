<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedModuleService"
      :table-columns="moduleColumns"
      :form-items="moduleFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="title.platform.domains"
      right-title="模块列表"
      search-placeholder="搜索模块..."
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

const { t } = useI18n();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 从 config.ts 读取配置
const { columns: moduleColumns } = usePageColumns('platform.modules');
const { formItems: moduleFormItems } = usePageForms('platform.modules');
const pageConfig = getPageConfigFull('platform.modules');

// 使用 config.ts 中定义的服务
const domainService = pageConfig?.service?.domainService;
const wrappedModuleService = usePageService('platform.modules', 'module', {
  showSuccessMessage: true,
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};


</script>

<style lang="scss" scoped>

</style>

