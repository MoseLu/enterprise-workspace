<template>
  <div class="toolbar">
    <!-- 刷新按钮 -->
    <BtcTableButton
      v-if="isMinimal"
      class="btc-crud-action-icon"
      :config="refreshButtonConfig"
    />
    <btc-button
      v-else
      class="btc-crud-btn"
      @click="onRefresh"
    >
      <BtcSvg class="btc-crud-btn__icon" name="refresh" />
      <span class="btc-crud-btn__text">{{ t('common.button.refresh') }}</span>
    </btc-button>

    <BtcCrudFlex1 />

    <!-- 物料编码筛选 -->
    <div class="material-code-filter">
      <el-input
        :model-value="materialCodeFilter"
        :placeholder="materialCodePlaceholder"
        clearable
        size="default"
        style="width: 200px;"
        @update:model-value="(val: string) => $emit('update:materialCodeFilter', val)"
        @clear="onMaterialCodeClear"
        @keyup.enter="onMaterialCodeSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 仓位筛选 -->
    <div class="position-filter">
      <el-input
        :model-value="positionFilter"
        :placeholder="positionPlaceholder"
        clearable
        size="default"
        style="width: 200px;"
        @update:model-value="(val: string) => $emit('update:positionFilter', val)"
        @clear="onPositionClear"
        @keyup.enter="onPositionSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 打印按钮 -->
    <BtcTableButton
      v-if="isMinimal"
      class="btc-crud-action-icon"
      :config="printButtonConfig"
    />
    <btc-button
      v-else
      type="primary"
      class="btc-crud-btn btc-crud-btn--with-icon"
      @click="onPrint"
    >
      <BtcSvg class="btc-crud-btn__icon" name="print" />
      <span class="btc-crud-btn__text">{{ t('inventory.ticket.print.print') }}</span>
    </btc-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n, useThemePlugin } from '@btc/shared-core';
import { BtcTableButton, BtcCrudFlex1, BtcSvg } from '@btc/shared-components';
import type { BtcTableButtonConfig } from '@btc/shared-components';
import { ElInput, ElIcon } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

defineOptions({
  name: 'BtcInventoryTicketPrintToolbar',
});

interface Props {
  positionFilter: string;
  positionPlaceholder: string;
  materialCodeFilter: string;
  materialCodePlaceholder: string;
  onRefresh: () => void;
  onPrint: () => void;
  onPositionSearch: () => void;
  onPositionClear: () => void;
  onMaterialCodeSearch: () => void;
  onMaterialCodeClear: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  positionFilter: '',
  positionPlaceholder: '',
  materialCodeFilter: '',
  materialCodePlaceholder: '',
});

const emit = defineEmits<{
  'update:positionFilter': [value: string];
  'update:materialCodeFilter': [value: string];
}>();

const { t } = useI18n();
const theme = useThemePlugin();

// 按钮风格判断
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

// 刷新按钮配置
const refreshButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'refresh',
  tooltip: t('common.button.refresh'),
  ariaLabel: t('common.button.refresh'),
  type: 'default',
  onClick: props.onRefresh,
}));

// 打印按钮配置
const printButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'print',
  tooltip: t('inventory.ticket.print.print'),
  ariaLabel: t('inventory.ticket.print.print'),
  type: 'primary',
  onClick: props.onPrint,
}));

// 定义处理函数，直接使用 props 中的函数
const onRefresh = () => {
  props.onRefresh?.();
};

const onPrint = () => {
  props.onPrint?.();
};

const onPositionSearch = () => {
  props.onPositionSearch?.();
};

const onPositionClear = () => {
  props.onPositionClear?.();
};

const onMaterialCodeSearch = () => {
  props.onMaterialCodeSearch?.();
};

const onMaterialCodeClear = () => {
  props.onMaterialCodeClear?.();
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-bottom: 10px;
}

.position-filter,
.material-code-filter {
  display: flex;
  align-items: center;

  &--inline {
    margin-left: 10px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 4px;
    }
  }
}
</style>

