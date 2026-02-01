<template>
  <!-- 使用包装元素，让 el-color-picker 的触发器与自定义按钮重叠 -->
  <div ref="wrapperRef" class="btc-color-picker-wrapper">
    <!-- 自定义触发按钮 -->
    <div class="btc-color-picker-trigger-wrapper" @click="handleTriggerClick">
      <slot name="reference">
        <div class="btc-color-picker-trigger">
          <el-button :size="triggerSize as any" :type="triggerType ?? 'default'">
            <span v-if="modelValue">{{ modelValue }}</span>
            <span v-else>{{ placeholder }}</span>
          </el-button>
        </div>
      </slot>
    </div>
    <!-- el-color-picker，让触发器与自定义按钮重叠，以便 popover 能正确定位 -->
    <el-color-picker
      ref="colorPickerRef"
      :model-value="localColor ?? null"
      :show-alpha="showAlpha ?? true"
      :predefine="predefineColors as any"
      :popper-class="popperClassComputed"
      :popper-style="{ position: 'fixed' } as any"
      :teleported="teleported ?? false"
      class="btc-color-picker-overlay"
      @change="handleColorChange"
      @active-change="handleActiveColorChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { ElColorPicker, ElButton } from 'element-plus';
import type { ColorPickerInstance } from 'element-plus';

defineOptions({
  name: 'BtcColorPicker'
});

type Placement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';

interface BtcColorPickerProps {
  modelValue?: string | null;
  predefineColors?: string[];
  showAlpha?: boolean;
  placeholder?: string;
  teleported?: boolean;
  popperClass?: string | object;
  popperStyle?: string | object;
  triggerSize?: 'large' | 'default' | 'small';
  triggerType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
  // 是否立即更新（不需要点击确认）
  immediate?: boolean;
  // 以下属性已废弃，保留仅为了向后兼容（el-color-picker 不支持这些属性）
  /** @deprecated placement 属性已废弃，el-color-picker 不支持自定义位置 */
  placement?: Placement;
  /** @deprecated offset 属性已废弃，el-color-picker 不支持自定义偏移 */
  offset?: number;
}

const props = withDefaults(defineProps<BtcColorPickerProps>(), {
  modelValue: null,
  predefineColors: () => [
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'rgba(144, 240, 144, 0.5)',
    'hsl(181, 100%, 37%)',
    'rgba(31, 147, 255, 0.73)',
    'rgba(199, 21, 133, 0.47)',
  ] as any,
  showAlpha: true,
  placeholder: '选择颜色',
  teleported: false,
  popperClass: '' as any,
  triggerSize: 'default' as any,
  triggerType: 'default',
  immediate: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
  'change': [value: string | null];
  'confirm': [value: string | null];
  'clear': [];
  'active-change': [value: string | null];
  'show': [];
  'hide': [];
}>();

const colorPickerRef = ref<ColorPickerInstance | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const localColor = ref<string | null>(props.modelValue || null);

// 计算 popper-class，解决类型问题
const popperClassComputed = computed(() => {
  const baseClass = 'btc-color-picker-popover';
  const additionalClass = typeof props.popperClass === 'string' ? props.popperClass : '';
  return `${baseClass} ${additionalClass}`.trim() as any;
});

// 同步外部传入的值
watch(() => props.modelValue, (newValue) => {
  localColor.value = newValue || null;
}, { immediate: true });

// 在组件挂载后，为 .color-item 添加点击事件
onMounted(() => {
  nextTick(() => {
    if (wrapperRef.value) {
      const colorItem = wrapperRef.value.querySelector('.color-item');
      if (colorItem) {
        colorItem.addEventListener('click', handleTriggerClick);
      }
    }
  });
});

onUnmounted(() => {
  if (wrapperRef.value) {
    const colorItem = wrapperRef.value.querySelector('.color-item');
    if (colorItem) {
      colorItem.removeEventListener('click', handleTriggerClick);
    }
  }
});

// 监听本地颜色变化
watch(localColor, (newColor) => {
  if (props.immediate) {
    emit('update:modelValue', newColor);
    emit('change', newColor);
  }
});

// 触发按钮点击：显示颜色选择器
function handleTriggerClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  nextTick(() => {
    colorPickerRef.value?.show();
    emit('show');
  });
}

// 颜色变化事件
function handleColorChange(color: string | null) {
  localColor.value = color;
  emit('update:modelValue', color);
  emit('change', color);

  if (props.immediate) {
    // 立即模式：颜色变化即确认
    emit('confirm', color);
  }
}

// 活动颜色变化事件（拖拽过程中）
function handleActiveColorChange(color: string | null) {
  emit('active-change', color);
}

// 暴露方法供外部调用
defineExpose({
  show: () => colorPickerRef.value?.show(),
  hide: () => colorPickerRef.value?.hide(),
  focus: () => colorPickerRef.value?.focus(),
  blur: () => colorPickerRef.value?.blur(),
});
</script>

<style lang="scss">
// 颜色选择器样式
// 注意：不使用 scoped，因为弹窗是 teleported 到 body 的

// 包装元素：提供定位上下文，让 el-color-picker 的触发器与自定义按钮重叠
.btc-color-picker-wrapper {
  display: inline-block;
  position: relative;

  // 自定义触发按钮容器
  .btc-color-picker-trigger-wrapper {
    position: relative;
    z-index: 1;
    display: inline-block;

    .color-item {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 23px !important;
      height: 23px !important;
      cursor: pointer !important;
      border-radius: 23px !important;
      transition: all 0.3s !important;
      flex-shrink: 0 !important;
      vertical-align: top !important;
      margin-top: 0 !important;

      &:hover {
        transform: scale(1.1);
      }

      .el-icon {
        font-size: 14px;
        color: #fff !important;
      }

      // 自定义颜色：静态圆形彩虹色渐变（未选择颜色时）
      &.custom-color.is-custom {
        background: conic-gradient(
          from 0deg,
          #ff0000,
          #ff7f00,
          #ffff00,
          #00ff00,
          #0000ff,
          #4b0082,
          #9400d3,
          #ff0000
        ) !important;
      }
    }
  }
}

// 让 el-color-picker 的触发器与自定义按钮重叠
.btc-color-picker-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: 0 !important;
  overflow: visible !important;

  // 隐藏默认触发器
  :deep(.el-color-picker__trigger) {
    display: none !important;
  }
}

// 颜色选择器弹窗样式
// 确保 popover 使用 fixed 定位，不受父容器 overflow 影响
.btc-color-picker-popover {
  position: fixed !important;
  z-index: 2030 !important;
}

// 暗色模式
html.dark .btc-color-picker-popover .el-color-picker-panel,
html.dark .btc-color-picker-popover .el-color-picker-panel.is-border {
  --el-color-picker-alpha-bg-a: #333333 !important;
}

html.dark .btc-color-picker-popover .el-color-predefine {
  --el-color-picker-alpha-bg-a: #333333 !important;
}
</style>
