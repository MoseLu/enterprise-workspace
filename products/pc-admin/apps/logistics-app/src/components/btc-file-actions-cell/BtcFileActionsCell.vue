<template>
  <div class="btc-table-op">
    <el-button text type="success" @click="handleShare">
      分享
    </el-button>
    <el-button text type="primary" @click="handleDetail">
      详情
    </el-button>
    <el-button text type="danger" @click="handleDelete">
      删除
    </el-button>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    row: Record<string, any>;
    onShare?: (row: Record<string, any>) => void;
    onDetail?: (row: Record<string, any>) => void;
    onDelete?: (row: Record<string, any>) => void;
  }>(),
  {
    row: () => ({}),
    onShare: undefined,
    onDetail: undefined,
    onDelete: undefined,
  }
);

const handleShare = () => {
  props.onShare?.(props.row);
};

const handleDetail = () => {
  props.onDetail?.(props.row);
};

const handleDelete = () => {
  props.onDelete?.(props.row);
};
</script>

<style scoped lang="scss"></style>

