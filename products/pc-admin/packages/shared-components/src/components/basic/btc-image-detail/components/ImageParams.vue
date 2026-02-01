<template>
  <div class="btc-image-params">
    <h3 class="btc-image-params__title">参数信息</h3>
    <el-descriptions :column="2" border>
      <el-descriptions-item v-if="image.chartType" label="图表类型">
        {{ getChartTypeName(image.chartType) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="image.dataSource" label="数据源">
        {{ image.dataSource }}
      </el-descriptions-item>
      <el-descriptions-item v-if="image.dataRange" label="数据时间范围" :span="2">
        {{ image.dataRange }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 图表配置参数 -->
    <div v-if="image.chartConfig && Object.keys(image.chartConfig).length > 0" class="btc-image-params__config">
      <h4 class="config-title">图表配置</h4>
      <el-collapse>
        <el-collapse-item name="config">
          <template #title>
            <span>查看配置详情</span>
          </template>
          <div class="config-content">
            <pre class="config-json">{{ formatConfig(image.chartConfig) }}</pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem, ElCollapse, ElCollapseItem } from 'element-plus';
import type { ImageItem } from '../../btc-image-container/types';

defineOptions({
  name: 'ImageParams',
});

interface Props {
  image: ImageItem;
}

defineProps<Props>();

// 图表类型名称映射
const getChartTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    line: '折线图',
    bar: '柱状图',
    pie: '饼图',
    scatter: '散点图',
    radar: '雷达图',
    area: '面积图',
  };
  return typeMap[type] || type;
};

// 格式化配置为 JSON
const formatConfig = (config: Record<string, any>): string => {
  return JSON.stringify(config, null, 2);
};
</script>

<style lang="scss" scoped>
.btc-image-params {
  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 16px 0;
  }

  &__config {
    margin-top: 20px;

    .config-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin: 0 0 12px 0;
    }

    .config-content {
      padding: 12px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;

      .config-json {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: var(--el-text-color-regular);
        white-space: pre-wrap;
        word-break: break-all;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
      }
    }
  }
}
</style>
