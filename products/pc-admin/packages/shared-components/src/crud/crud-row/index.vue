<template>
  <el-row
    class="btc-crud-row"
    :justify="justify"
    :align="align"
    :gutter="gutter"
  >
    <slot />
  </el-row>
</template>

<script setup lang="ts">
import type { RowJustify, RowAlign } from 'element-plus';

defineOptions({
  name: 'BtcCrudRow',
  inheritAttrs: false,
});

interface BtcRowProps {
  justify?: typeof RowJustify[keyof typeof RowJustify];
  align?: typeof RowAlign[keyof typeof RowAlign];
  gutter?: number;
}

withDefaults(defineProps<BtcRowProps>(), {
  justify: 'start',
  align: 'top',
  gutter: 0,
});

// BtcRow - 基于 el-row，完全对齐 cool-admin 的 cl-row
</script>
