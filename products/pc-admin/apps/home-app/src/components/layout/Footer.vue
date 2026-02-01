<template>
  <footer class="footer">
    <div class="s-bottom-layer-content">
      <router-link to="/about" class="footer-link">关于我们</router-link>
      <router-link to="/news" class="footer-link">新闻动态</router-link>
      <router-link to="/terms" class="footer-link">服务条款</router-link>
      <router-link to="/help" class="footer-link">帮助中心</router-link>
      <!-- 企业服务暂时隐藏，保留逻辑 -->
      <a href="https://business.bellis.com.cn" class="footer-link" style="display: none;">
        企业服务
      </a>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link beian-link"
      >
        桂ICP备2025062018号-1
      </a>
      <span class="copyright-text">{{ copyrightText }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 设置版权信息（从 2012 年到当前年份）
const currentYear = new Date().getFullYear();
const startYear = 2012;
const copyrightYear =
  currentYear > startYear ? `${startYear}-${currentYear}` : startYear.toString();
const copyrightText = computed(() => `© ${copyrightYear} BTC. All rights reserved.`);
</script>

