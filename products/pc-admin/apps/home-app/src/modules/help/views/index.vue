<template>
  <div class="page">
    <!-- 主内容区 -->
    <section class="main-content">
      <!-- SVG几何背景 -->
      <GeometricBackground>
        <!-- 内容区域 -->
      <div class="content">
        <div class="container">
          <h2>帮助中心</h2>
          <p>这里将提供帮助文档和常见问题解答。</p>
          <!-- 后续可以添加帮助内容 -->
        </div>
      </div>
      </GeometricBackground>
    </section>
  </div>
</template>

<script setup lang="ts">
import GeometricBackground from '@/components/GeometricBackground.vue';

defineOptions({
  name: 'HelpPage',
});
</script>

<style scoped lang="scss">
@use '../styles/index.scss' as *;
</style>

