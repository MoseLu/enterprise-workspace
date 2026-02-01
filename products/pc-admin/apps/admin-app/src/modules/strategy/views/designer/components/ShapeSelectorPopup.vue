<template>
  <div
    v-if="visible"
    class="shape-selector-popup"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px'
    }"
    @click.stop
  >
    <div class="shape-grid">
      <div
        v-for="component in components"
        :key="component.type"
        class="shape-item"
        @click="$emit('select', component)"
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle
            v-if="component.type === 'START' || component.type === 'END'"
            cx="20" cy="20" r="12"
            :fill="getFill(component.type)"
            :stroke="getStroke(component.type)"
            stroke-width="2"
          />
          <path
            v-else-if="component.type === 'CONDITION'"
            d="M 20 5 L 35 20 L 20 35 L 5 20 Z"
            :fill="getFill(component.type)"
            :stroke="getStroke(component.type)"
            stroke-width="2"
          />
          <rect
            v-else-if="component.type === 'ACTION'"
            x="5" y="5" width="30" height="30"
            :fill="getFill(component.type)"
            :stroke="getStroke(component.type)"
            stroke-width="2"
            rx="4"
            ry="4"
          />
          <rect
            v-else
            x="5" y="5" width="30" height="30"
            :fill="getFill(component.type)"
            :stroke="getStroke(component.type)"
            stroke-width="2"
            rx="4"
            ry="4"
          />
        </svg>
        <span class="shape-name">{{ component.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  visible: boolean;
  position: { x: number; y: number };
  components: Array<{ type: string; name: string }>;
  getFill: (type: string) => string;
  getStroke: (type: string) => string;
}>();

defineEmits(['select']);
</script>

<style scoped lang="scss">
.shape-selector-popup {
  position: fixed;  // 使用 fixed 定位在画布坐标
  background: var(--el-bg-color);  // 使用主题背景色
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);  // 使用主题浅色阴影
  padding: 8px;
  z-index: 1001;  // 确保在节点上方

  // 暗色主题下的特殊处理
  @media (prefers-color-scheme: dark) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .shape-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .shape-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: var(--el-color-primary-light-9);
    }

    svg {
      margin-bottom: 4px;
    }

    .shape-name {
      font-size: 12px;
      color: var(--el-text-color-primary);
    }
  }
}
</style>

