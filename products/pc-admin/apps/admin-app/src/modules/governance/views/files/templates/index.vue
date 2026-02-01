<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedTemplateService"
      :table-columns="templateColumns"
      :form-items="templateFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="title.governance.files.templates.domains"
      right-title="受控文件列表"
      search-placeholder="搜索受控文件..."
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
      @select="onDomainSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcMasterTableGroup } from '@btc/shared-components';
import { usePageColumns, usePageForms, getPageConfigFull, usePageService, useI18n } from '@btc/shared-core';

defineOptions({
  name: 'AdminGovernanceFilesTemplates'
});

const { t } = useI18n();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 从 config.ts 读取配置
const { columns: templateColumns } = usePageColumns('governance.files.templates');
const { formItems: templateFormItems } = usePageForms('governance.files.templates');
const pageConfig = getPageConfigFull('governance.files.templates');

// 使用 config.ts 中定义的服务
const domainService = pageConfig?.service?.domainService;
const wrappedTemplateService = usePageService('governance.files.templates', 'processTemplate', {
  showSuccessMessage: true,
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

</script>

<style lang="scss" scoped>

</style>

