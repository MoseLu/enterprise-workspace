<template>
  <el-col
    class="btc-col"
    v-bind="$attrs"
  >
    <slot />
  </el-col>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcCol',
  inheritAttrs: false,
});
</script>

<style lang="scss" scoped>
.btc-col {
  // 可以在这里添加自定义样式
}
</style>
