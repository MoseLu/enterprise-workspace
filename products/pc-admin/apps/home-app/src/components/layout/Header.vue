<template>
  <header ref="headerRef" class="header" :class="{ 'header-scrolled': isScrolled }">
    <div class="container">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <img :src="logoImg" alt="拜里斯科技" class="logo" />
        </router-link>
        <router-link to="/" class="nav-link home-link" :class="{ active: $route.name === 'Home' }">
          首页
        </router-link>
      </div>
      <nav class="nav">
        <router-link to="/about" class="nav-link" :class="{ active: $route.name === 'About' }">
          关于我们
        </router-link>
        <router-link to="/news" class="nav-link" :class="{ active: $route.name === 'News' }">
          新闻动态
        </router-link>
        <router-link to="/terms" class="nav-link" :class="{ active: $route.name === 'Terms' }">
          服务条款
        </router-link>
        <router-link to="/help" class="nav-link" :class="{ active: $route.name === 'Help' }">
          帮助中心
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import logoImg from '@/assets/logo/logo.png';

// Header 组件
const headerRef = ref<HTMLElement>();
const isScrolled = ref(false);

// 节流函数
function throttle(fn: () => void, delay: number) {
  let lastTime = 0;
  return () => {
    const now = Date.now();
    if (now - lastTime > delay) {
      fn();
      lastTime = now;
    }
  };
}

// 处理滚动事件
const handleScroll = throttle(() => {
  if (window.scrollY > 50) {
    isScrolled.value = true;
  } else {
    isScrolled.value = false;
  }
}, 100);

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

