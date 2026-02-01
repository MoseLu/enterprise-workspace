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
      {{ t('© {year} {appName}', { year: copyrightYear, appName: app.info.name }) }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';

defineOptions({
  name: 'LoginFooter'
});

defineProps<{
  app: any;
  t: (key: string, params?: any) => string;
}>();

// 生成版权数据，从2012年到当前年份
const currentYear = dayjs().year();
const startYear = 2012;
const copyrightYear = currentYear > startYear ? `${startYear}-${currentYear}` : startYear.toString();
</script>

<style lang="scss">
@use './styles.scss';
</style>
