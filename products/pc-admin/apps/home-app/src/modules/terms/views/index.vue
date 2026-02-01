<template>
  <div class="page">
    <!-- 主内容区 -->
    <section class="main-content">
      <!-- SVG几何背景 -->
      <GeometricBackground>
        <!-- 内容区域 -->
      <div class="content">
        <div class="container">
          <h2>服务条款</h2>
          <p>这里是服务条款的内容。</p>
          <!-- 后续可以添加详细的服务条款内容 -->
        </div>
      </div>
      </GeometricBackground>
    </section>
  </div>
</template>

<script setup lang="ts">
import GeometricBackground from '@/components/GeometricBackground.vue';

defineOptions({
  name: 'TermsPage',
});
</script>

<style scoped lang="scss">
@use '../styles/index.scss' as *;
</style>

