<template>
  <div class="s-bottom-layer-content">
    <a href="https://about.bellis.com.cn" class="footer-link">关于我们</a>
    <a href="https://news.bellis.com.cn" class="footer-link">新闻动态</a>
    <a href="https://terms.bellis.com.cn" class="footer-link">服务条款</a>
    <a href="https://help.bellis.com.cn" class="footer-link">帮助中心</a>
    <!-- 企业服务暂时隐藏，保留逻辑 -->
    <a href="https://business.bellis.com.cn" class="footer-link" style="display: none;">企业服务</a>
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="footer-link beian-link">
      桂ICP备2025062018号-1
    </a>
    <span class="copyright-text">
      {{ appConfig.copyright.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { appConfig } from '@/config/app';

defineOptions({
  name: 'BtcAuthFooter'
});
</script>
