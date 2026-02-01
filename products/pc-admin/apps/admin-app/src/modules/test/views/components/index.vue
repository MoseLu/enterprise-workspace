<template>
  <div class="page">
    <!-- 搜索栏 -->
    <BtcCrudRow class="search-row">
      <BtcCrudFlex1 />
      <el-input
        v-model="searchKeyword"
        placeholder="搜索测试功能..."
        clearable
        size="large"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </BtcCrudRow>

    <!-- 测试实例卡片网格 -->
    <div class="test-grid">
      <div
        v-for="testInstance in filteredTestInstances"
        :key="testInstance.name"
        class="test-card"
        @click="openTestInstance(testInstance)"
      >
        <div class="test-card-header">
          <div class="test-icon">
            <img :src="logoUrl" alt="BTC Logo" class="test-logo" />
          </div>
          <div class="test-info">
            <h3 class="test-title">{{ t(testInstance.title) }}</h3>
            <p class="test-description">{{ testInstance.description }}</p>
          </div>
        </div>

        <div class="test-card-body">
          <div class="test-tags">
            <el-tag
              v-for="(tag, index) in testInstance.tags"
              :key="tag"
              :type="getTagType(tag, index)"
              size="small"
              class="test-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="test-card-footer">
          <el-button type="primary" size="small" class="test-button">
            开始测试
          </el-button>
        </div>
      </div>
    </div>

    <!-- 测试实例弹窗 -->
    <BtcDialog
      v-model="dialogVisible"
      :title="currentTestInstance ? t(currentTestInstance.title) : ''"
      :width="getDialogWidth()"
      :height="getDialogHeight()"
      :controls="['fullscreen', 'close']"
      class="test-dialog"
    >
      <component
        v-if="currentTestInstance"
        :is="currentTestInstance.component"
        :key="currentTestInstance.name"
      />
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { BtcMessage, BtcCrudRow, BtcCrudFlex1 } from '@btc/shared-components';
import { BtcDialog } from '@btc/shared-components';
import { useI18n, logger } from '@btc/shared-core';
import {
  getAllTestInstanceConfigs,
  loadTestInstanceComponent,
  type TestInstanceConfig
} from '@/utils/test-instance-scanner';

defineOptions({
  name: 'TestCenterPage',
});

const { t } = useI18n();

// Logo URL（使用动态绑定避免 Vite 模块解析问题）
const logoUrl = '/logo.png';

// 搜索关键词
const searchKeyword = ref('');

// 对话框状态
const dialogVisible = ref(false);
const currentTestInstance = ref<any>(null);

// 测试实例接口（扩展配置接口）
interface TestInstance extends TestInstanceConfig {
  component: any;
}

// 所有测试实例（使用 shallowRef 避免深层响应式）
const testInstances = shallowRef<TestInstance[]>([]);

// 动态导入所有测试实例
const loadTestInstances = async () => {
  try {
    // 获取所有测试实例配置
    const configs = getAllTestInstanceConfigs();

    // 动态导入所有测试实例组件
    const testModules = await Promise.all(
      configs.map(async (config) => {
        try {
          const component = await loadTestInstanceComponent(config.name);
          return {
            ...config,
            component: markRaw(component) // 使用 markRaw 标记组件为非响应式
          };
        } catch (error) {
          console.warn(`Failed to load test instance: ${config.name}`, error);
          return null;
        }
      })
    );

    // 过滤掉加载失败的实例
    testInstances.value = testModules.filter(Boolean) as TestInstance[];
  } catch (error) {
    logger.error('加载测试实例失败:', error);
    BtcMessage.error('加载测试实例失败');
  }
};

// 过滤后的测试实例
const filteredTestInstances = computed(() => {
  if (!searchKeyword.value) {
    return testInstances.value;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return testInstances.value.filter(instance =>
    instance.title.toLowerCase().includes(keyword) ||
    instance.description.toLowerCase().includes(keyword) ||
    instance.tags.some(tag => tag.toLowerCase().includes(keyword))
  );
});

// 获取标签类型 - 按照固定顺序：primary, success, warning, danger
const getTagType = (tag: string, index: number): 'primary' | 'success' | 'warning' | 'danger' => {
  const typeOrder: ('primary' | 'success' | 'warning' | 'danger')[] = ['primary', 'success', 'warning', 'danger'];
  return typeOrder[index % 4];
};

// 获取弹窗宽度 - 统一尺寸（百分比）
const getDialogWidth = () => {
  return '60%';  // 约等于900px在1500px屏幕上的比例
};

// 获取弹窗高度 - 统一尺寸（百分比）
const getDialogHeight = () => {
  return '60vh'; // 约等于600px在1000px视口高度上的比例
};

// 打开测试实例
const openTestInstance = (instance: TestInstance) => {
  currentTestInstance.value = instance;
  dialogVisible.value = true;
};

// 组件挂载时加载测试实例
onMounted(() => {
  loadTestInstances();
});
</script>

<style lang="scss" scoped>


.search-row {
  margin-bottom: 10px;
}

.search-input {
  width: var(--card-min-width);
  max-width: 100%;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width), 1fr));
  gap: 20px;
  width: 100%;
}

.test-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--el-box-shadow-light);
  display: grid; // 使用 Grid 严格分区
  grid-template-rows: 35% 40% 25%; // 提高头部比例，避免描述被截断
  gap: 8px; // 区域间间距，不影响比例
  height: 240px; // 固定卡片高度
  box-sizing: border-box; // 确保 padding 包含在总高度内

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow);
    border-color: var(--el-color-primary);
  }
}

.test-card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-sizing: border-box;
  overflow: hidden; // 防止内容溢出
}

.test-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--el-color-primary-light-9);
  border-radius: var(--el-border-radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.test-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.test-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden; // 防止内容溢出
}

.test-title {
  margin: 0 0 4px 0; // 减少间距
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; // 标题单行显示
}

.test-description {
  margin: 0;
  font-size: 13px; // 稍微减小字体
  color: var(--el-text-color-regular);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3; // 提高为 3 行
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1; // 占用剩余空间
}

.test-card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  overflow: hidden; // 防止内容溢出
}

.test-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  overflow: hidden; // 防止标签溢出
}

.test-tag {
  font-size: 12px;
}

.test-card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-sizing: border-box;
}

.test-button {
  font-size: 14px;
  padding: 8px 20px;
}

.test-dialog {
  // BtcDialog 的样式由组件内部控制，这里只需要基本样式
}

// 响应式设计
@media (max-width: 768px) {
  .test-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .search-section .search-input {
    width: 100%;
  }

  .test-card {
    padding: 15px;
  }

  .test-card-header {
    gap: 12px;
  }

  .test-icon {
    width: 40px;
    height: 40px;
  }

  .test-title {
    font-size: 15px;
  }

  .test-description {
    font-size: 13px;
  }
}
</style>
