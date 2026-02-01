<template>
  <div class="page">
    <BtcCrud
      ref="crudRef"
      :service="dictionaryValueService"
    >
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
          <BtcImportBtn
            :columns="dictionaryValueColumns"
            :on-submit="handleImport"
          />
        </div>
        <BtcCrudFlex1 />
        <BtcCrudSearchKey :placeholder="t('data.dictionary.value.search_placeholder')" />
        <BtcCrudActions />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable
          :columns="dictionaryValueColumns"
          :op="{ buttons: ['edit', 'delete'] }"
          border
        />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>
      <BtcUpsert
        :items="dictionaryValueFormItems"
        width="800px"
      />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n, usePageColumns, usePageForms, usePageService, logger } from '@btc/shared-core';
import {
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcImportBtn,
  BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
  BtcCrudActions,
} from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'AdminDictionaryValues'
});

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

// 从 config.ts 读取配置
const { columns: dictionaryValueColumns } = usePageColumns('governance.dictionary.values');
const { formItems: dictionaryValueFormItems } = usePageForms('governance.dictionary.values');
const dictionaryValueService = usePageService('governance.dictionary.values', 'dictData', {
  showSuccessMessage: true,
});

// 处理导入
const handleImport = async (
  data: any,
  { done, close }: { done: () => void; close: () => void }
) => {
  try {
    const rows = (data?.list || data?.rows || []).map((row: Record<string, any>) => {
      const { _index, ...rest } = row || {};
      return rest;
    });
    if (!rows.length) {
      const warnMessage = data?.filename
        ? t('common.import.no_data_or_mapping')
        : t('common.import.select_file');
      message.warning(warnMessage);
      done();
      return;
    }

    // 调用字典数据的导入 API（传递与表格 columns 一致的字段）
    const payload = rows.map((row: Record<string, any>) => ({
      dictTypeCode: row.dictTypeCode,
      dictValue: row.dictValue,
      dictLabel: row.dictLabel,
    }));

    const response = await service.admin?.dict?.dictData?.import?.(payload);

    // 检查响应中的 code 字段
    let responseData: any = response;
    if (response && typeof response === 'object' && 'data' in response) {
      responseData = (response as any).data;
    }

    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      const code = responseData.code;
      if (code !== 200 && code !== 1000 && code !== 2000) {
        const errorMsg = responseData.msg || responseData.message || t('common.import.failed');
        message.error(errorMsg);
        done();
        return;
      }
    }

    message.success(t('common.import.success'));
    crudRef.value?.crud?.refresh?.();
    close();
  } catch (error: any) {
    logger.error('[DictionaryValues] import failed:', error);
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('common.import.failed');
    message.error(errorMsg);
    done();
  }
};

</script>

<style lang="scss" scoped>

</style>

