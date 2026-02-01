<template>
  <div class="page">
    <h1>测试 btc-grid-group 组件</h1>
    <!-- BtcGridGroup 组件不存在，已移除 -->
    <div style="padding: 20px; border: 1px solid #ccc;">
      <p style="color: red;">BtcGridGroup 组件不存在，已从导出中移除</p>
    </div>
    <!-- <btc-grid-group left-width="200px" right-width="200px"> -->
      <!-- 顶栏左侧 -->
      <template #headerLeft>
        <div style="background: red; padding: 10px; color: white;">左侧</div>
      </template>

      <!-- 顶栏中间 -->
      <template #headerMiddle>
        <div style="background: green; padding: 10px; color: white;">中间</div>
      </template>

      <!-- 顶栏右侧 -->
      <template #headerRight>
        <div style="background: blue; padding: 10px; color: white;">右侧</div>
      </template>

      <!-- 内容左侧 -->
      <template #bodyLeft>
        <div style="background: orange; padding: 10px; color: white; height: 100%;">内容左侧</div>
      </template>

      <!-- 内容中间 -->
      <template #bodyMiddle>
        <div style="background: purple; padding: 10px; color: white; height: 100%;">内容中间 - 这里是画布区域</div>
      </template>

      <!-- 内容右侧 -->
      <template #bodyRight>
        <div style="background: pink; padding: 10px; color: white; height: 100%;">内容右侧</div>
      </template>
    <!-- </btc-grid-group> -->
  </div>
</template>

<script setup lang="ts">
// import { BtcGridGroup } from '@btc/shared-components'; // 组件不存在，已移除

defineOptions({
  name: 'BtcTestGridGroup',
});
</script>

<style scoped>

</style>

