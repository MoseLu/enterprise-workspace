<template>
  <div class="zoom-controls">
    <el-button @click="$emit('zoom-out')" :disabled="scale <= minScale" circle>
      <el-icon><ZoomOut /></el-icon>
    </el-button>
    <div class="zoom-center">
      <el-dropdown @command="$emit('zoom-command', $event)" trigger="click" placement="bottom">
        <el-input
          v-model="model"
          @blur="$emit('scale-blur')"
          @keydown.enter="$emit('scale-enter')"
          @input="$emit('scale-input', model)"
          class="zoom-input"
          size="small"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="fit">
              <el-icon><FullScreen /></el-icon>
              适应窗口大小
            </el-dropdown-item>
            <el-dropdown-item divided command="100">100%</el-dropdown-item>
            <el-dropdown-item command="125">125%</el-dropdown-item>
            <el-dropdown-item command="150">150%</el-dropdown-item>
            <el-dropdown-item command="175">175%</el-dropdown-item>
            <el-dropdown-item command="200">200%</el-dropdown-item>
            <el-dropdown-item command="250">250%</el-dropdown-item>
            <el-dropdown-item command="300">300%</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-button @click="$emit('zoom-in')" :disabled="scale >= maxScale" circle>
      <el-icon><ZoomIn /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ZoomIn, ZoomOut, FullScreen } from '@element-plus/icons-vue';

const props = defineProps<{
  scale: number;
  minScale: number;
  maxScale: number;
  scaleInputValue: string;
}>();

defineEmits([
  'zoom-in',
  'zoom-out',
  'zoom-command',
  'scale-blur',
  'scale-enter',
  'scale-input'
]);

const model = ref(props.scaleInputValue);
watch(() => props.scaleInputValue, v => { model.value = v; });
</script>

<style scoped lang="scss">
.zoom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
}

.zoom-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.zoom-input :deep(.el-input__inner) {
  width: 100px;
  height: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  padding: 0 8px;
}

.zoom-controls :deep(.el-button) {
  padding: 8px;
  min-width: 32px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  
  .el-icon {
    font-size: 18px;
  }
}
</style>


