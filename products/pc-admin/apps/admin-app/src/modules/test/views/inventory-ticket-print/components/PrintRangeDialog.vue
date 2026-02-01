<template>
  <btc-dialog
    v-model="visible"
    :title="t('inventory.ticket.print.select_range')"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <div class="print-range-dialog">
      <div class="range-input-group">
        <el-input-number
          v-model="startIndex"
          :min="1"
          :max="maxIndex"
          :placeholder="t('inventory.ticket.print.start_index')"
          style="width: 100%"
        />
        <span class="range-separator">{{ t('inventory.ticket.print.to') }}</span>
        <el-input-number
          v-model="endIndex"
          :min="1"
          :max="maxIndex"
          :placeholder="t('inventory.ticket.print.end_index')"
          style="width: 100%"
        />
      </div>
      <div class="range-hint">
        {{ t('inventory.ticket.print.range_hint', { total: maxIndex }) }}
      </div>
    </div>
    <template #footer>
      <btc-button @click="handleCancel">{{ t('common.button.cancel') }}</btc-button>
      <btc-button type="primary" @click="handleConfirm">{{ t('common.button.confirm') }}</btc-button>
    </template>
  </btc-dialog>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { ElInputNumber } from 'element-plus';

defineOptions({
  name: 'PrintRangeDialog',
});

interface Props {
  modelValue: boolean;
  totalCount: number;
  defaultRange?: { start: number; end: number };
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  totalCount: 0,
  defaultRange: () => ({ start: 1, end: 1 }),
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [range: { start: number; end: number }];
}>();

const { t } = useI18n();

const visible = ref(props.modelValue);
const startIndex = ref(1);
const endIndex = ref(1);
const maxIndex = ref(1);

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val && props.totalCount > 0) {
    maxIndex.value = props.totalCount;
    // 对话框打开时，使用默认范围
    if (props.defaultRange && props.defaultRange.start && props.defaultRange.end) {
      startIndex.value = Math.max(1, Math.min(props.defaultRange.start, props.totalCount));
      endIndex.value = Math.max(startIndex.value, Math.min(props.defaultRange.end, props.totalCount));
    } else {
      // 如果没有默认范围，使用1-50或总数
      startIndex.value = 1;
      endIndex.value = Math.min(50, props.totalCount);
    }
  }
});

watch(() => props.totalCount, (val) => {
  if (val > 0) {
    maxIndex.value = val;
    if (visible.value) {
      // 如果当前设置的结束位置超过新的总数，调整到总数
      if (endIndex.value > val) {
        endIndex.value = val;
      }
      // 如果当前设置的起始位置超过新的总数，调整到1
      if (startIndex.value > val) {
        startIndex.value = 1;
        endIndex.value = Math.min(50, val);
      }
    }
  }
});

// 监听默认范围变化，如果对话框已打开，更新范围
watch(() => props.defaultRange, (newRange) => {
  if (visible.value && newRange && newRange.start && newRange.end && props.totalCount > 0) {
    startIndex.value = Math.max(1, Math.min(newRange.start, props.totalCount));
    endIndex.value = Math.max(startIndex.value, Math.min(newRange.end, props.totalCount));
  }
}, { deep: true });

const handleConfirm = () => {
  if (maxIndex.value <= 0) {
    // 如果没有数据，不允许确认
    return;
  }

  const start = Math.max(1, Math.min(startIndex.value || 1, maxIndex.value));
  const end = Math.max(start, Math.min(endIndex.value || maxIndex.value, maxIndex.value));

  emit('confirm', { start, end });
  visible.value = false;
  emit('update:modelValue', false);
};

const handleCancel = () => {
  visible.value = false;
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.print-range-dialog {
  padding: 20px 0;
}

.range-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.range-separator {
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.range-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}
</style>
