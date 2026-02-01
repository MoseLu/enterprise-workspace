<template>
  <div class="column-layout-test">
    <BtcSplitter direction="horizontal">
      <!-- 第一栏 -->
      <BtcSplitterPanel :size="'300px'">
        <template #header>
          <span class="title">第一栏标题</span>
        </template>
        <template #content>
          <div class="placeholder-content">
            <h3>第一栏内容</h3>
            <p>这是第一栏的占位内容，用于测试分栏布局。</p>
          </div>
        </template>
      </BtcSplitterPanel>

      <!-- 第二栏 -->
      <BtcSplitterPanel>
        <template #header>
          <span class="title">第二栏标题</span>
        </template>
        <template #content>
          <div class="placeholder-content">
            <h3>第二栏内容</h3>
            <p>这是第二栏的占位内容，用于测试分栏布局。</p>
            <p>点击本栏头部的折叠按钮，可以控制第一栏的显示/隐藏。</p>
          </div>
        </template>
      </BtcSplitterPanel>

      <!-- 第三栏 -->
      <BtcSplitterPanel :size="'300px'">
        <template #header>
          <span class="title">第三栏标题</span>
        </template>
        <template #content>
          <div class="placeholder-content">
            <h3>第三栏内容</h3>
            <p>这是第三栏的占位内容，用于测试分栏布局。</p>
            <p>点击本栏头部的折叠按钮，可以控制前两栏的显示/隐藏。</p>
            <p>点击中间栏头部的折叠按钮，可以控制第一栏的显示/隐藏。</p>
          </div>
        </template>
      </BtcSplitterPanel>
    </BtcSplitter>
  </div>
</template>

<script setup lang="ts">
import { BtcSplitter, BtcSplitterPanel } from '@btc/shared-components';

defineOptions({
  name: 'ColumnLayoutTest',
});
</script>

<style scoped lang="scss">
.column-layout-test {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  // 确保标题栏样式正确显示
  :deep(.btc-splitter-panel__header) {
    // 标题栏应该有明显的背景色和边框
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-extra-light);
  }

  // 确保内容栏样式正确显示
  :deep(.btc-splitter-panel__content) {
    // 内容栏应该有明显的背景色
    background-color: var(--el-bg-color);
  }

  .placeholder-content {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
    background-color: var(--el-bg-color);

    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 8px 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }
  }
}
</style>
