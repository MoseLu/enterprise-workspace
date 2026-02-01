<template>
  <div class="dictionary-file-categories">
    <btc-crud ref="crudRef" :service="categoryService">
      <btc-crud-row>
        <btc-refresh-btn />
        <btc-add-btn />
        <btc-multi-delete-btn />
        <btc-crud-flex1 />
        <btc-crud-search-key />
        <btc-crud-actions />
      </btc-crud-row>

      <btc-crud-row>
        <btc-table
          ref="tableRef"
          :columns="columns"
          border
          :op="{ buttons: ['edit', 'delete'] }"
        />
      </btc-crud-row>

      <btc-crud-row>
        <btc-crud-flex1 />
        <btc-pagination />
      </btc-crud-row>

      <btc-upsert ref="upsertRef" :items="formItems" width="520px" />
    </btc-crud>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n, type CrudService, usePageColumns, usePageForms, getPageConfigFull } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'DictionaryFileCategories',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const epsCategoryService = service.upload?.file?.category;

function ensureMethod(method: string) {
  const fn = (epsCategoryService as Record<string, any>)?.[method];
  if (typeof fn !== 'function') {
    throw new Error(`[DictionaryFileCategories] EPS 服务 upload.file.category.${method} 未加载，请先同步 EPS 元数据`);
  }
  return fn;
}

function normalizePageResponse(response: any, page: number, size: number) {
  if (!response) {
    return {
      list: [],
      total: 0,
      pagination: { page, size, total: 0 }
    };
  }

  if (Array.isArray(response.list) && response.pagination) {
    const { pagination } = response;
    const total = Number(
      pagination.total ?? pagination.count ?? response.total ?? response.pagination?.total ?? 0
    );
    return {
      list: response.list,
      total,
      pagination: {
        page: Number(pagination.page ?? page),
        size: Number(pagination.size ?? size),
        total
      }
    };
  }

  if (Array.isArray(response.records)) {
    const total = Number(response.total ?? response.pagination?.total ?? 0);
    return {
      list: response.records,
      total,
      pagination: {
        page: Number(response.current ?? page),
        size: Number(response.size ?? size),
        total
      }
    };
  }

  if (Array.isArray(response.list) && typeof response.total !== 'undefined') {
    return {
      list: response.list,
      total: Number(response.total ?? 0),
      pagination: {
        page,
        size,
        total: Number(response.total ?? 0)
      }
    };
  }

  if (Array.isArray(response)) {
    return {
      list: response,
      total: response.length,
      pagination: { page, size, total: response.length }
    };
  }

  return {
    list: [],
    total: 0,
    pagination: { page, size, total: 0 }
  };
}

const categoryService: CrudService<any> = {
  async page(params: any = {}) {
    const page = Number(params.page ?? 1);
    const size = Number(params.size ?? 20);
    const keyword = params.keyword ? String(params.keyword) : undefined;

    const payload: Record<string, any> = { page, size };
    if (keyword) {
      payload.keyword = keyword;
    }

    const pageFn = ensureMethod('page');
    const response = await pageFn(payload);
    const normalized = normalizePageResponse(response, page, size);
    return {
      list: normalized.list,
      total: normalized.total,
      pagination: normalized.pagination,
    };
  },
  async add(data: any) {
    const addFn = ensureMethod('add');
    await addFn(data);
  },
  async update(data: any) {
    const updateFn = ensureMethod('update');
    await updateFn(data);
  },
  async delete(id: string | number) {
    const deleteFn = ensureMethod('delete');
    await deleteFn(id);
  },
  async deleteBatch(ids: (string | number)[]) {
    const deleteFn = ensureMethod('delete');
    await Promise.all(ids.map((id) => deleteFn(id)));
  },
};

// 从 config.ts 读取配置
const { columns } = usePageColumns('data.dictionary.file-categories');
const { formItems } = usePageForms('data.dictionary.file-categories');
const pageConfig = getPageConfigFull('data.dictionary.file-categories');
</script>

<style scoped lang="scss">
.dictionary-file-categories {
  height: 100%;
}
</style>

