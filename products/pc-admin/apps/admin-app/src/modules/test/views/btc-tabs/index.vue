<template>
  <div class="btc-tabs-test">
    <h2>BtcTabs 组件测试</h2>
    <p>测试 btc-tabs 组件的功能和样式效果</p>

    <div class="test-container">
      <BtcTabs
        v-model="activeTab"
        :tabs="tabs"
        @tab-change="handleTabChange"
      >
        <template #tab-1>
          <div class="tab-content">
            <h3>第一个标签页</h3>
            <p>这是第一个标签页的内容。这里可以放置任何内容，包括表单、列表、图表等。</p>
            <el-button type="primary" @click="showMessage('第一个标签页')">
              测试按钮
            </el-button>
          </div>
        </template>

        <template #tab-2>
          <div class="tab-content">
            <h3>第二个标签页</h3>
            <p>这是第二个标签页的内容。展示了标签页切换的效果。</p>
            <el-form :model="form" label-width="100px">
              <el-form-item label="姓名">
                <el-input v-model="form.name" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template #tab-3>
          <div class="tab-content">
            <h3>第三个标签页</h3>
            <p>这是第三个标签页的内容。可以包含更复杂的内容。</p>
            <el-table :data="tableData" border>
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="age" label="年龄" />
              <el-table-column prop="address" label="地址" />
            </el-table>
          </div>
        </template>

        <template #tab-4>
          <div class="tab-content">
            <h3>第四个标签页（禁用）</h3>
            <p>这个标签页是禁用状态，无法点击。</p>
            <el-alert
              title="禁用状态"
              type="warning"
              description="此标签页已被禁用，无法切换"
              show-icon
            />
          </div>
        </template>
      </BtcTabs>
    </div>

    <div class="test-controls">
      <h4>测试控制</h4>
      <div class="control-buttons">
        <el-button @click="setActiveTab('tab-1')">切换到标签1</el-button>
        <el-button @click="setActiveTab('tab-2')">切换到标签2</el-button>
        <el-button @click="setActiveTab('tab-3')">切换到标签3</el-button>
        <el-button @click="addNewTab">添加新标签</el-button>
        <el-button @click="removeLastTab">删除最后标签</el-button>
      </div>
      <p>当前激活标签: {{ activeTab }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { BtcTabs } from '@btc/shared-components';
import type { BtcTab } from '@btc/shared-components';

defineOptions({
  name: 'BtcTabsTest'
});

// 当前激活的标签
const activeTab = ref('tab-1');

// 标签配置
const tabs = ref<BtcTab[]>([
  {
    name: 'tab-1',
    label: '基础功能',
    content: '基础功能标签页内容'
  },
  {
    name: 'tab-2',
    label: '表单测试',
    content: '表单测试标签页内容'
  },
  {
    name: 'tab-3',
    label: '表格展示',
    content: '表格展示标签页内容'
  },
  {
    name: 'tab-4',
    label: '禁用状态',
    content: '禁用状态标签页内容',
    disabled: true
  }
]);

// 表单数据
const form = reactive({
  name: '',
  email: ''
});

// 表格数据
const tableData = ref([
  {
    name: '张三',
    age: 25,
    address: '北京市朝阳区'
  },
  {
    name: '李四',
    age: 30,
    address: '上海市浦东新区'
  },
  {
    name: '王五',
    age: 28,
    address: '广州市天河区'
  }
]);

// 标签切换处理
const handleTabChange = (tab: BtcTab, index: number) => {
  BtcMessage.success(`切换到标签: ${tab.label} (索引: ${index})`);
};

// 显示消息
const showMessage = (tabName: string) => {
  BtcMessage.info(`来自 ${tabName} 的消息`);
};

// 设置激活标签
const setActiveTab = (tabName: string) => {
  activeTab.value = tabName;
};

// 添加新标签
const addNewTab = () => {
  const newIndex = tabs.value.length + 1;
  tabs.value.push({
    name: `tab-${newIndex}`,
    label: `新标签${newIndex}`,
    content: `新标签${newIndex}的内容`
  });
  BtcMessage.success(`添加了新标签: 新标签${newIndex}`);
};

// 删除最后标签
const removeLastTab = () => {
  if (tabs.value.length > 1) {
    const removedTab = tabs.value.pop();
    BtcMessage.success(`删除了标签: ${removedTab?.label}`);

    // 如果删除的是当前激活的标签，切换到第一个标签
    if (activeTab.value === removedTab?.name) {
      activeTab.value = tabs.value[0].name || 'tab-1';
    }
  } else {
    BtcMessage.warning('至少需要保留一个标签');
  }
};
</script>

<style scoped>
.btc-tabs-test {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.btc-tabs-test h2 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.btc-tabs-test p {
  margin: 0 0 20px 0;
  color: var(--el-text-color-regular);
}

.test-container {
  flex: 1;
  overflow: hidden;
  min-height: 400px;
}

.tab-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.tab-content h3 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.tab-content p {
  margin: 0 0 16px 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.test-controls {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: var(--el-border-radius-base);
}

.test-controls h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.control-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.control-buttons .el-button {
  margin: 0;
}

.test-controls p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
