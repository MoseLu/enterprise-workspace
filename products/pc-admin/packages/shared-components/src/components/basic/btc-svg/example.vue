<template>
  <div class="btc-svg-example">
    <h2>btc-svg 组件示例</h2>

    <!-- 基础用法 -->
    <section>
      <h3>基础用法</h3>
      <div class="demo-row">
        <btc-svg name="home" />
        <btc-svg name="user" />
        <btc-svg name="search" />
        <btc-svg name="set" />
      </div>
    </section>

    <!-- 不同大小 -->
    <section>
      <h3>不同大小</h3>
      <div class="demo-row">
        <btc-svg name="home" :size="16" />
        <btc-svg name="home" :size="24" />
        <btc-svg name="home" :size="32" />
        <btc-svg name="home" :size="48" />
      </div>
    </section>

    <!-- 自定义颜色 -->
    <section>
      <h3>自定义颜色</h3>
      <div class="demo-row">
        <btc-svg name="home" color="#409eff" :size="32" />
        <btc-svg name="home" color="#67c23a" :size="32" />
        <btc-svg name="home" color="#e6a23c" :size="32" />
        <btc-svg name="home" color="#f56c6c" :size="32" />
      </div>
    </section>

    <!-- 继承父元素颜色 -->
    <section>
      <h3>继承父元素颜色</h3>
      <div class="demo-row">
        <div style="color: #409eff">
          <btc-svg name="home" :size="32" />
        </div>
        <div style="color: #67c23a">
          <btc-svg name="user" :size="32" />
        </div>
        <div style="color: #e6a23c">
          <btc-svg name="search" :size="32" />
        </div>
      </div>
    </section>

    <!-- 在按钮中使用 -->
    <section>
      <h3>在按钮中使用</h3>
      <div class="demo-row">
        <el-button type="primary">
          <btc-svg name="home" :size="16" />
          首页
        </el-button>
        <el-button type="success">
          <btc-svg name="user" :size="16" />
          用户
        </el-button>
        <el-button type="warning">
          <btc-svg name="search" :size="16" />
          搜索
        </el-button>
      </div>
    </section>

    <!-- 国际化图标 -->
    <section>
      <h3>国际化图标</h3>
      <div class="demo-row">
        <el-button @click="locale = 'zh-CN'">
          <btc-svg name="icon-zh" :size="16" />
          中文
        </el-button>
        <el-button @click="locale = 'en-US'">
          <btc-svg name="icon-en" :size="16" />
          English
        </el-button>
        <el-button @click="locale = 'ja-JP'">
          <btc-svg name="icon-ja" :size="16" />
          日本語
        </el-button>
        <div class="current-locale">
          当前语言：
          <btc-svg :name="getLocaleIcon()" :size="24" color="#409eff" />
          {{ locale }}
        </div>
      </div>
    </section>

    <!-- 图标动画 -->
    <section>
      <h3>图标动画</h3>
      <div class="demo-row">
        <div class="demo-item">
          <btc-svg name="set" :size="24" animation="rotate" animation-trigger="hover" />
          <span>旋转（悬浮）</span>
        </div>
        <div class="demo-item">
          <btc-svg name="loading" :size="24" animation="spin" animation-trigger="always" />
          <span>持续旋转</span>
        </div>
        <div class="demo-item">
          <btc-svg name="bell" :size="24" animation="grow" animation-trigger="hover" />
          <span>略微变大（悬浮）</span>
        </div>
        <div class="demo-item">
          <btc-svg name="notification" :size="24" animation="pulse" animation-trigger="always" />
          <span>脉冲动画</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BtcSvg from './index.vue';

const locale = ref('zh-CN');

function getLocaleIcon() {
  const map: Record<string, string> = {
    'zh-CN': 'icon-zh',
    'en-US': 'icon-en',
    'ja-JP': 'icon-ja'
  };
  return map[locale.value] || 'icon-zh';
}
</script>

<style scoped lang="scss">
.btc-svg-example {
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    color: #303133;
  }

  section {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 15px;
      font-size: 16px;
      color: #606266;
    }
  }

  .demo-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    flex-wrap: wrap;

    .demo-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #606266;
    }

    .current-locale {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
