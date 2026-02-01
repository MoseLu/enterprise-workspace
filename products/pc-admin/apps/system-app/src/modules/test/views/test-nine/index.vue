<template>
  <div class="test-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">测试九</span>
        </div>
      </template>
      <div class="content">
        <p>这是测试九页面</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 测试九页面
</script>

<style scoped lang="scss">
.test-page {
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-x: hidden;

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .content {
    padding: 20px;
  }
}
</style>
