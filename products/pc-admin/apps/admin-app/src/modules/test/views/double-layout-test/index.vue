<template>
  <div class="multi-column-layout-test">
    <BtcTabs v-model="activeTab" :tabs="tabs">
      <!-- 双栏测试 -->
      <template #columns-2>
        <BtcViews
          :columns="2"
          left-title="左侧栏"
          right-title="右侧栏"
          :left-width="'300px'"
        >
          <template #left-header>
            <span class="title">左侧栏标题</span>
          </template>
          <template #left>
            <div class="placeholder-content">
              <h3>左侧栏内容</h3>
              <p>这是双栏布局的左侧栏内容。</p>
              <p>点击右侧栏头部的折叠按钮，可以折叠/展开左侧栏。</p>
              <div v-for="i in 20" :key="i" class="list-item">
                列表项 {{ i }}
              </div>
            </div>
          </template>
          <template #right-header>
            <span class="title">右侧栏标题</span>
          </template>
          <template #right>
            <div class="placeholder-content">
              <h3>右侧栏内容</h3>
              <p>这是双栏布局的右侧栏内容。</p>
              <p>右侧栏会自动占据剩余空间。</p>
              <div v-for="i in 30" :key="i" class="list-item">
                内容项 {{ i }}
              </div>
            </div>
          </template>
        </BtcViews>
      </template>

      <!-- 三栏测试 -->
      <template #columns-3>
        <BtcViews
          :columns="3"
          left-title="左侧栏"
          middle-title="中间栏"
          right-title="右侧栏"
          :left-width="'300px'"
          :middle-width="'200px'"
        >
          <template #left-header>
            <span class="title">左侧栏标题</span>
          </template>
          <template #left>
            <div class="placeholder-content">
              <h3>左侧栏内容</h3>
              <p>这是三栏布局的左侧栏内容。</p>
              <div v-for="i in 15" :key="i" class="list-item">
                列表项 {{ i }}
              </div>
            </div>
          </template>
          <template #middle-header>
            <span class="title">中间栏标题</span>
          </template>
          <template #middle>
            <div class="placeholder-content">
              <h3>中间栏内容</h3>
              <p>这是三栏布局的中间栏内容。</p>
              <p>点击中间栏头部的折叠按钮，可以折叠/展开中间栏。</p>
              <div v-for="i in 10" :key="i" class="list-item">
                中间项 {{ i }}
              </div>
            </div>
          </template>
          <template #right-header>
            <span class="title">右侧栏标题</span>
          </template>
          <template #right>
            <div class="placeholder-content">
              <h3>右侧栏内容</h3>
              <p>这是三栏布局的右侧栏内容。</p>
              <p>点击右侧栏头部的折叠按钮，可以折叠/展开左侧栏。</p>
              <div v-for="i in 25" :key="i" class="list-item">
                内容项 {{ i }}
              </div>
            </div>
          </template>
        </BtcViews>
      </template>

      <!-- 四栏测试 -->
      <template #columns-4>
        <BtcViews
          :columns="4"
          left-title="左侧栏"
          middle-title="中间栏"
          right-title="右侧栏"
          fourth-title="第四栏"
          :left-width="'250px'"
          :middle-width="'200px'"
          :right-width="'200px'"
        >
          <template #left-header>
            <span class="title">左侧栏标题</span>
          </template>
          <template #left>
            <div class="placeholder-content">
              <h3>左侧栏内容</h3>
              <p>这是四栏布局的左侧栏内容。</p>
              <div v-for="i in 12" :key="i" class="list-item">
                列表项 {{ i }}
              </div>
            </div>
          </template>
          <template #middle-header>
            <span class="title">中间栏标题</span>
          </template>
          <template #middle>
            <div class="placeholder-content">
              <h3>中间栏内容</h3>
              <p>这是四栏布局的中间栏内容。</p>
              <p>点击中间栏头部的折叠按钮，可以折叠/展开中间栏。</p>
              <div v-for="i in 8" :key="i" class="list-item">
                中间项 {{ i }}
              </div>
            </div>
          </template>
          <template #right-header>
            <span class="title">右侧栏标题</span>
          </template>
          <template #right>
            <div class="placeholder-content">
              <h3>右侧栏内容</h3>
              <p>这是四栏布局的右侧栏内容。</p>
              <p>点击右侧栏头部的折叠按钮，可以折叠/展开左侧栏。</p>
              <div v-for="i in 20" :key="i" class="list-item">
                内容项 {{ i }}
              </div>
            </div>
          </template>
          <template #fourth-header>
            <span class="title">第四栏标题</span>
          </template>
          <template #fourth>
            <div class="placeholder-content">
              <h3>第四栏内容（垂直分栏）</h3>
              <p>这是四栏布局的第四栏内容。</p>
              <p>第四栏位于右侧栏内部，是垂直分栏。</p>
              <p>点击第四栏头部的折叠按钮，可以折叠/展开第四栏。</p>
              <div v-for="i in 15" :key="i" class="list-item">
                第四栏项 {{ i }}
              </div>
            </div>
          </template>
        </BtcViews>
      </template>
    </BtcTabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcViews, BtcTabs } from '@btc/shared-components';
import type { BtcTab } from '@btc/shared-components';

defineOptions({
  name: 'MultiColumnLayoutTest',
});

const activeTab = ref('columns-2');

const tabs: BtcTab[] = [
  {
    name: 'columns-2',
    label: '双栏布局',
  },
  {
    name: 'columns-3',
    label: '三栏布局',
  },
  {
    name: 'columns-4',
    label: '四栏布局',
  },
];
</script>

<style scoped lang="scss">
.multi-column-layout-test {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  .placeholder-content {
    padding: 20px;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    background-color: var(--el-bg-color);
    text-align: center;
    box-sizing: border-box;

    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      color: var(--el-text-color-primary);
      text-align: center;
    }

    p {
      margin: 8px 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
      text-align: center;
    }

    .list-item {
      padding: 10px;
      border-bottom: 1px solid var(--el-border-color-light);
      text-align: left;
    }
  }
}
</style>
