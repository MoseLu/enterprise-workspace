<template>
  <div class="ops-api-list">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="controllerService"
      :right-service="apiService"
      :table-columns="columns"
      :form-items="[]"
      :op="undefined"
      left-title="title.ops.apiList.controller"
      :right-title="t('common.ops.api_list.api_list')"
      :show-create-time="false"
      :show-update-time="false"
      :enable-key-search="true"
      left-width="320px"
      :search-placeholder="t('common.ops.api_list.search_placeholder')"
      @select="handleSelect"
      @load="handleControllerLoad"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OpsApiList'
});

import { computed, ref } from 'vue';
import { BtcMasterTableGroup } from '@btc/shared-components';
import { useI18n, usePageColumns, getPageConfigFull, type CrudService } from '@btc/shared-core';
import { sortByLocale } from '@btc/shared-utils';
import { sysApi } from '@/modules/api-services';

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('ops.api_list');
const pageConfig = getPageConfigFull('ops.api_list');

const { t } = useI18n();

interface ApiListRecord {
  controller: string;
  className: string;
  tags: string[];
  tagsText: string;
  methodName: string;
  httpMethods: string;
  paths: string;
  description: string;
  notes: string;
  parameters: Array<Record<string, any>>;
}

interface ApiControllerNode {
  id: string;
  label: string;
  name: string;
  className: string;
  simpleName: string;
  tags: string[];
  apis: ApiListRecord[];
}

const controllerList = ref<ApiControllerNode[]>([]);
const controllerMap = ref<Record<string, ApiControllerNode>>({});
const selectedControllerId = ref<string | null>(null);
const loadingDocs = ref(false);

const API_DOCS_TIMEOUT = 5000;
const API_DOCS_TIMEOUT_TOKEN = {};

async function fetchApiDocsWithFallback() {
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(API_DOCS_TIMEOUT_TOKEN), API_DOCS_TIMEOUT);
  });

  try {
    const result = await Promise.race([sysApi.apiDocs.list(), timeoutPromise]);
    if (result === API_DOCS_TIMEOUT_TOKEN) {
      console.warn('[OpsApiList] API docs fetch timeout, using empty list as fallback');
      return [];
    }
    return result;
  } catch (error) {
    console.warn('[OpsApiList] API docs fetch failed, using empty list as fallback', error);
    return [];
  }
}

function extractPayload(raw: any) {
  if (!raw) return {};
  if (raw.code !== undefined && raw.data !== undefined) {
    return raw.data;
  }
  return raw;
}

function normalizeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return value ? String(value) : '';
}

function buildControllers(payload: Record<string, any>): ApiControllerNode[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  // api-docs.json 的 data 是一个对象，key 是控制器的完整类名（className），value 是控制器对象
  // 需要将对象转换为数组进行处理
  const controllers = Array.isArray(payload) ? payload : Object.values(payload);

  return controllers.map((controller: any) => {
    // 从控制器对象中提取信息
    const className = controller?.className || '';
    const simpleName = controller?.simpleName || className.split('.').pop() || className;
    const tags: string[] = Array.isArray(controller?.tags) ? controller.tags : [];
    const tagsText = tags.length > 0 ? tags.join(' / ') : '';
    const apis = Array.isArray(controller?.apis) ? controller.apis : [];

    // 处理每个 API
    const apiRecords: ApiListRecord[] = apis.map((api: any) => {
      const description = api?.description || {};
      // api-docs.json 中 description 包含 summary 和 description 字段
      const summary = description?.summary || '';
      const descriptionText = description?.description || '';
      // 合并 summary 和 description 作为接口说明
      const fullDescription = summary && descriptionText
        ? `${summary}\n${descriptionText}`
        : (summary || descriptionText || '');

      const method = normalizeValue(api?.httpMethods).toUpperCase();
      const paths = normalizeValue(api?.paths);
      const parameters = Array.isArray(api?.parameters) ? api.parameters : [];

      return {
        controller: simpleName,
        className: className || simpleName,
        tags,
        tagsText,
        methodName: api?.methodName || '',
        httpMethods: method,
        paths,
        description: fullDescription,
        notes: descriptionText || '', // 使用 description 字段作为备注
        parameters,
      };
    });

    // 显示名称：优先使用 tags，其次使用 simpleName
    const displayName = tagsText || simpleName;

    return {
      id: className || simpleName,
      label: displayName,
      name: displayName,
      className: className || simpleName,
      simpleName,
      tags,
      apis: apiRecords,
    } satisfies ApiControllerNode;
  });
}

async function loadControllers(forceReload = false) {
  if (loadingDocs.value) {
    if (!forceReload) return;
  }
  if (!forceReload && controllerList.value.length) return;

  try {
    loadingDocs.value = true;
    const currentSelectedId = selectedControllerId.value;

    const response = await fetchApiDocsWithFallback();
    const payload = extractPayload(response);
    const nodes = buildControllers(payload);
    const sortedNodes = sortByLocale(nodes, (node) => node.label ?? '');

    controllerList.value = sortedNodes;
    controllerMap.value = sortedNodes.reduce<Record<string, ApiControllerNode>>((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

    if (currentSelectedId && controllerMap.value[currentSelectedId]) {
      selectedControllerId.value = currentSelectedId;
    } else if (sortedNodes.length > 0) {
      selectedControllerId.value = sortedNodes[0].id;
    } else {
      selectedControllerId.value = null;
    }
  } finally {
    loadingDocs.value = false;
  }
}

const controllerService = {
  async list(params?: { keyword?: string }) {
    const forceReload = params?.keyword === undefined;
    await loadControllers(forceReload);

    const keyword = params?.keyword ? params.keyword.toLowerCase() : '';
    const matched = keyword
      ? controllerList.value.filter((controller) => {
          return (
            controller.label.toLowerCase().includes(keyword) ||
            controller.className.toLowerCase().includes(keyword) ||
            controller.tags.some((tag) => tag.toLowerCase().includes(keyword))
          );
        })
      : controllerList.value;

    return sortByLocale(matched, (controller) => controller.label ?? '');
  },
};

const apiService: CrudService<ApiListRecord> = {
  async page(params: Record<string, any> = {}) {
    await loadControllers();

    const controllerId = selectedControllerId.value;
    const keyword = String(params.keyword || '').trim().toLowerCase();
    const page = Number(params.page || 1);
    const size = Number(params.size || 20);

    let records: ApiListRecord[] = [];
    if (controllerId && controllerMap.value[controllerId]) {
      records = controllerMap.value[controllerId].apis;
    }

    if (keyword) {
      records = records.filter((item) => {
        const candidates = [
          item.controller,
          item.className,
          item.methodName,
          item.httpMethods,
          item.paths,
          item.description,
          item.notes,
          item.tagsText,
        ];
        return candidates.some((value) => value && value.toLowerCase().includes(keyword));
      });
    }

    const total = records.length;
    const startIndex = (page - 1) * size;
    const list = records.slice(startIndex, startIndex + size);

    return {
      list,
      total,
    };
  },
  async add() {
    throw new Error(t('common.ops.api_list.add_not_supported'));
  },
  async update() {
    throw new Error(t('common.ops.api_list.update_not_supported'));
  },
  async delete() {
    throw new Error(t('common.ops.api_list.delete_not_supported'));
  },
  async deleteBatch() {
    throw new Error(t('common.ops.api_list.delete_not_supported'));
  },
};

// 扩展 columns 以支持特殊的 formatter、align 和组件
const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是 tagsText，添加 formatter 和 align
    if (col.prop === 'tagsText') {
      return {
        ...col,
        align: 'center',
        headerAlign: 'center',
        formatter: (row: ApiListRecord) => row.tagsText || '-',
      };
    }
    // 如果列是 controller、methodName、paths、description，添加 align
    if (['controller', 'methodName', 'paths', 'description'].includes(col.prop || '')) {
      return {
        ...col,
        align: 'center',
        headerAlign: 'center',
      };
    }
    // 如果列是 httpMethods，添加 dict 和 align
    if (col.prop === 'httpMethods') {
      return {
        ...col,
        align: 'center',
        headerAlign: 'center',
        dictColor: true,
        dict: [
          { value: 'GET', label: 'GET', type: 'success' },
          { value: 'POST', label: 'POST', type: 'primary' },
          { value: 'PUT', label: 'PUT', type: 'warning' },
          { value: 'DELETE', label: 'DELETE', type: 'danger' },
          { value: 'PATCH', label: 'PATCH', type: 'info' },
          { value: 'OPTIONS', label: 'OPTIONS', type: 'info' },
          { value: 'HEAD', label: 'HEAD', type: 'info' }
        ],
      };
    }
    // 如果列是 parameters，添加 BtcCodeJson 组件和 align
    if (col.prop === 'parameters') {
      return {
        ...col,
        align: 'center',
        headerAlign: 'center',
        component: {
          name: 'BtcCodeJson',
          props: {
            popover: true,
            maxLength: 800,
          },
        },
      };
    }
    // 如果列是 notes，添加 formatter 和 align
    if (col.prop === 'notes') {
      return {
        ...col,
        align: 'center',
        headerAlign: 'center',
        formatter: (row: ApiListRecord) => row.notes || '-',
        fixed: 'right' as const,
      };
    }
    return col;
  });
});

const tableGroupRef = ref();

function handleSelect(item: any) {
  selectedControllerId.value = item?.id || null;
}

function handleControllerLoad(list: ApiControllerNode[]) {
  if (!selectedControllerId.value && list.length > 0) {
    selectedControllerId.value = list[0].id;
  }
}
</script>

<style scoped lang="scss">
.ops-api-list {
  height: 100%;
  overflow: hidden;

  :deep(.btc-add-btn),
  :deep(.btc-multi-delete-btn),
  :deep(.btc-upsert) {
    display: none !important;
  }
}
</style>

