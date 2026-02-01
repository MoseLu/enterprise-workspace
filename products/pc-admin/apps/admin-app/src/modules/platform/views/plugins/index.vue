<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedPluginService"
      :table-columns="pluginColumns"
      :form-items="pluginFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="title.platform.domains"
      right-title="插件列表"
      search-placeholder="搜索插件..."
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
const { columns: pluginColumns } = usePageColumns('platform.plugins');
const { formItems: pluginFormItems } = usePageForms('platform.plugins');
const pageConfig = getPageConfigFull('platform.plugins');

// 使用 config.ts 中定义的服务
const domainService = pageConfig?.service?.domainService;
const wrappedPluginService = usePageService('platform.plugins', 'plugin', {
  showSuccessMessage: true,
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};



</script>

<style lang="scss" scoped>

</style>

