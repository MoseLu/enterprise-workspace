<template>
  <el-row
    class="btc-row"
    v-bind="$attrs"
  >
    <slot />
  </el-row>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcRow',
  inheritAttrs: false,
});
</script>

<style lang="scss" scoped>
.btc-row {
  // 可以在这里添加自定义样式
}
</style>
