<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="resourceService"
      :right-service="wrappedFieldService"
      :table-columns="fieldColumns"
      :form-items="fieldFormItems"
      :op="opConfig"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-create-time="false"
      left-title="title.governance.dictionary.fields.resources"
      :right-title="t('data.dictionary.field.list')"
      :search-placeholder="t('data.dictionary.field.search_placeholder')"
      :show-unassigned="false"
      :enable-key-search="true"
      left-size="middle"
      id-field="id"
      label-field="resourceNameCn"
      @select="onResourceSelect"
      @form-submit="handleFormSubmit"
    >
    </BtcMasterTableGroup>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from '@/utils/use-message';
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService } from '@btc/shared-core';
import { BtcMasterTableGroup } from '@btc/shared-components';

defineOptions({
  name: 'AdminDictionaryFields'
});

const { t } = useI18n();
const message = useMessage();
const router = useRouter();
const tableGroupRef = ref();
const selectedResource = ref<any>(null);

// 从 config.ts 读取配置
const { columns: baseFieldColumns } = usePageColumns('governance.dictionary.fields');
const { formItems: baseFieldFormItems } = usePageForms('governance.dictionary.fields');
const pageConfig = getPageConfigFull('governance.dictionary.fields');

// 使用 config.ts 中定义的服务
const resourceService = pageConfig?.service?.resourceService;
const fieldService = pageConfig?.service?.dictInfo;

// 字段服务（右侧表）- 需要自定义 page 方法
const wrappedFieldService = {
  ...fieldService,
  // 自定义 page 方法，简化 keyword 对象，只保留 entityClass
  page: async (params: any) => {
    // 获取当前选中的资源
    const currentResource = selectedResource.value || tableGroupRef.value?.viewGroupRef?.selectedItem;

    // 保留原有参数结构，但简化 keyword 对象
    const simplifiedParams: any = {
      page: params.page || 1,
      size: params.size || 20,
    };

    // 如果有选中的资源，在 keyword 中只保留 entityClass（使用 resourceCode）
    if (currentResource && currentResource.resourceCode) {
      simplifiedParams.keyword = {
        entityClass: currentResource.resourceCode
      };
    }

    // 调用原始的 page 方法
    if (fieldService?.page) {
      return fieldService.page(simplifiedParams);
    }

    return { list: [], total: 0 };
  },
};

// 操作按钮配置
const opConfig = computed(() => ({
  buttons: [
    {
      label: t('common.button.detail'),
      type: 'warning',
      icon: 'dict',
      onClick: ({ scope }: { scope: any }) => goToDictionaryValues(scope.row),
    },
  ],
}));

// 资源选择处理
const onResourceSelect = (resource: any) => {
  selectedResource.value = resource;
};

// 表单提交处理 - 自动填充 domainId
const handleFormSubmit = (data: any, event: any) => {
  // 如果有选中资源，自动填充 domainId
  if (selectedResource.value) {
    data.domainId = selectedResource.value.id;
  }

  // 继续默认提交流程
  if (!event.defaultPrevented && typeof event.next === 'function') {
    event.next(data);
  }
};

// 跳转到字典值管理页面
const goToDictionaryValues = (field: any) => {
  if (!field || !field.id) {
    message.warning(t('data.dictionary.field.select_required'));
    return;
  }

  router.push({
    path: '/governance/dictionary/values',
    query: {
      fieldId: field.id,
      fieldName: field.fieldName || field.dictName,
      dictCode: field.dictCode,
      // 传递上下文信息
      domainId: selectedResource.value?.id,
    }
  });
};

// 字段表格列 - 从 config.ts 读取（移除 selection 列，因为页面设置了 show-add-btn="false"）
const fieldColumns = computed(() => {
  return baseFieldColumns.value.filter(col => col.type !== 'selection');
});

// 字段表单 - 扩展以支持动态 domainId
const fieldFormItems = computed(() => {
  const currentResource = selectedResource.value ||
    (tableGroupRef.value?.viewGroupRef?.selectedItem);

  return baseFieldFormItems.value.map(item => {
    // 如果表单项是 domainId，添加动态 value 和 disabled
    if (item.prop === 'domainId') {
      return {
        ...item,
        value: currentResource?.id,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            disabled: true,
            placeholder: currentResource?.id ? currentResource.id : t('data.dictionary.field.domain_select_required')
          }
        }
      };
    }
    return item;
  });
});

</script>

<style lang="scss" scoped>

</style>

