<template>
  <div
    class="btc-filter-glass-group"
    :style="{ bottom: typeof stickyTop === 'number' ? `${stickyTop}px` : stickyTop }"
  >
    <div class="btc-filter-glass-group__container">
        <div
          class="btc-filter-glass-group__wrapper"
          :class="{ 'is-collapsed': isCollapsed }"
        >
          <!-- 左侧搜索框 -->
          <div class="btc-filter-glass-group__search">
            <div class="btc-filter-glass-group__input-wrapper">
              <input
                v-model="searchKeyword"
                placeholder="搜索图片..."
                class="btc-filter-glass-group__native-input"
                type="text"
              />
            </div>
          </div>

          <!-- 右侧分类标签 (折叠时隐藏) -->
          <div class="btc-filter-glass-group__categories">
            <el-popover
              v-for="category in categories"
              :key="category.id"
              v-model:visible="visiblePopovers[category.id]"
              placement="top"
              popper-class="btc-filter-glass-group__popover"
              trigger="click"
            >
              <template #reference>
                <div
                  class="btc-filter-glass-group__category-tag"
                  :class="{ 'is-selected': hasSelectedOptions(category.id) }"
                >
                  <span class="btc-filter-glass-group__category-text">{{ getCategoryLabel(category) }}</span>
                  <el-icon
                    v-if="hasSelectedOptions(category.id)"
                    class="btc-filter-glass-group__close-icon"
                    @click.stop="handleClearCategory(category.id)"
                  >
                    <CircleClose />
                  </el-icon>
                </div>
              </template>

              <!-- 上拉菜单内容 -->
              <div class="btc-filter-glass-group__menu">
                <div
                  v-for="option in category.options"
                  :key="option.value"
                  class="btc-filter-glass-group__menu-item"
                  @click="handleOptionClick(category.id, option.value)"
                >
                  <span class="btc-filter-glass-group__menu-label">{{ option.label }}</span>
                </div>
              </div>
            </el-popover>
          </div>
        </div>

        <!-- 外部右侧折叠按钮 -->
        <div class="btc-filter-glass-group__toggle" @click="toggleCollapse">
          <BtcSvg
            v-if="isCollapsed"
            name="expand-fullscreen"
            :size="18"
          />
          <BtcSvg
            v-else
            name="collapse-fullscreen"
            :size="18"
          />
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElPopover, ElIcon } from 'element-plus';
import { CircleClose } from '@element-plus/icons-vue';
import { BtcSvg } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '../../../data/btc-filter-list/types';

defineOptions({
  name: 'BtcFilterGlassGroup',
});

interface Props {
  categories?: FilterCategory[];
  stickyTop?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  stickyTop: 24, // 默认底部距离调整为 24px
});

const emit = defineEmits<{
  'filter-change': [result: FilterResult[]];
  'collapse-change': [collapsed: boolean];
}>();

// 搜索关键词
const searchKeyword = ref('');

// 折叠状态
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('collapse-change', isCollapsed.value);
};

// 存储每个分类的选中值（单选，使用单个值而不是数组）
const selectedValues = ref<Record<string, any>>({});

// 控制 popover 显示状态
const visiblePopovers = ref<Record<string, boolean>>({});

// 初始化选中值和 popover 状态
const initSelectedValues = () => {
  props.categories.forEach(category => {
    if (!(category.id in selectedValues.value)) {
      selectedValues.value[category.id] = undefined;
    }
    if (!visiblePopovers.value[category.id]) {
      visiblePopovers.value[category.id] = false;
    }
  });
};

// 初始化
initSelectedValues();

// 监听 categories 变化，重新初始化
watch(() => props.categories, () => {
  initSelectedValues();
}, { deep: true });

// 判断是否有选中的选项
const hasSelectedOptions = (categoryId: string) => {
  return selectedValues.value[categoryId] !== undefined && selectedValues.value[categoryId] !== null;
};

const getCategoryLabel = (category: FilterCategory) => {
  const selectedValue = selectedValues.value[category.id];

  // 没有选中时，显示分类名称
  if (selectedValue === undefined || selectedValue === null) {
    return category.name;
  }

  // 有选中时，显示：分类名称 | 选项 label
  const option = category.options.find(opt => opt.value === selectedValue);
  if (option) {
    return `${category.name} | ${option.label}`;
  }

  // 如果找不到选项，显示分类名称
  return category.name;
};

// 处理选项点击（单选逻辑）
const handleOptionClick = (categoryId: string, optionValue: any) => {
  // 选中该选项（单选，直接替换）
  selectedValues.value[categoryId] = optionValue;

  // 关闭当前分类的 popover
  visiblePopovers.value[categoryId] = false;

  // 触发筛选变化事件（为了保持类型兼容，将单个值包装成数组）
  const filterResult: FilterResult[] = Object.keys(selectedValues.value)
    .filter(key => selectedValues.value[key] !== undefined && selectedValues.value[key] !== null)
    .map(key => ({
      name: key,
      value: [selectedValues.value[key]], // 将单个值包装成数组以保持类型兼容
    }));

  emit('filter-change', filterResult);
};

// 清除分类选中
const handleClearCategory = (categoryId: string) => {
  selectedValues.value[categoryId] = undefined;

  // 触发筛选变化事件
  const filterResult: FilterResult[] = Object.keys(selectedValues.value)
    .filter(key => selectedValues.value[key] !== undefined && selectedValues.value[key] !== null)
    .map(key => ({
      name: key,
      value: [selectedValues.value[key]], // 将单个值包装成数组以保持类型兼容
    }));

  emit('filter-change', filterResult);
};
</script>

<style lang="scss" scoped>
.btc-filter-glass-group {
  --btc-glass-bg: var(--btc-surface-panel);
  --btc-glass-border: var(--btc-border-muted);
  --btc-glass-shadow: var(--btc-shadow-panel);
  --btc-glass-blur: var(--btc-effect-blur);
  // 强制使用深色文字，因为背景已改为浅色玻璃态
  --btc-glass-text: #333333;
  --btc-glass-text-muted: #666666;
  --btc-glass-accent: var(--el-color-primary);
  --btc-glass-accent-weak: color-mix(in srgb, var(--btc-glass-accent) 35%, transparent);

  position: absolute;
  bottom: var(--btc-spacing-6); // 默认底部距离
  left: 50%; // 水平居中
  transform: translateX(-50%); // 水平居中
  z-index: 100; // 提高层级
  width: fit-content;
  margin: 0; // 移除 margin

  &__container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    margin: 0 auto;
  }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: var(--btc-spacing-5); // 增加整体间距
    padding: var(--btc-spacing-2) var(--btc-spacing-4); // 增加内边距，使组件更饱满
    background: var(--btc-glass-bg);
    backdrop-filter: blur(var(--btc-glass-blur));
    -webkit-backdrop-filter: blur(var(--btc-glass-blur));
    border-radius: var(--btc-spacing-96); // 胶囊圆角
    box-shadow: var(--btc-glass-shadow);
    border: 1px solid var(--btc-glass-border);
    overflow: hidden;
    transition: all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1); // 使用示例页面的弹性贝塞尔曲线
    will-change: width, padding;
    color: var(--btc-glass-text);

    &.is-collapsed {
      padding: var(--btc-spacing-2); // 缩小内边距
      gap: 0;

      .btc-filter-glass-group__search {
        max-width: calc(var(--btc-spacing-48) + var(--btc-spacing-4));
      }
    }

    // 暗黑模式
    html.dark & {
      background: var(--btc-glass-bg);
      border-color: var(--btc-glass-border);
      box-shadow: var(--btc-glass-shadow);
    }

    // 移动端优化
    @media (max-width: 768px) {
      padding: var(--btc-spacing-2-5) var(--btc-spacing-4);
      gap: var(--btc-spacing-3);
      border-radius: var(--btc-spacing-10);
    }
  }

  &__search {
    flex: 1;
    min-width: calc(var(--btc-spacing-48) + var(--btc-spacing-4));
    max-width: calc(var(--btc-spacing-72) + var(--btc-spacing-3));

    @media (max-width: 768px) {
      min-width: calc(var(--btc-spacing-32) + var(--btc-spacing-4));
      max-width: calc(var(--btc-spacing-48) + var(--btc-spacing-4));
    }
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--btc-spacing-2);
    background: var(--btc-glass-bg);
    backdrop-filter: blur(calc(var(--btc-glass-blur) * 0.5));
    -webkit-backdrop-filter: blur(calc(var(--btc-glass-blur) * 0.5));
    border-radius: var(--btc-spacing-10);
    padding: 0 var(--btc-spacing-4);
    border: 1px solid var(--btc-glass-border);
    box-shadow: inset 0 var(--btc-spacing-1) var(--btc-spacing-2) color-mix(in srgb, var(--btc-glass-text) 10%, transparent),
      0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 10%, transparent);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    height: calc(var(--btc-spacing-10) + var(--btc-spacing-0-5)); // 40px + 2px
    box-sizing: border-box;

    &:hover {
      background: var(--btc-glass-bg);
      border-color: var(--btc-border-base);
      box-shadow: inset 0 var(--btc-spacing-1) var(--btc-spacing-2) color-mix(in srgb, var(--btc-glass-text) 10%, transparent),
        0 var(--btc-spacing-1) var(--btc-spacing-4) color-mix(in srgb, var(--btc-glass-text) 8%, transparent),
        0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
    }

    &:focus-within {
      background: var(--btc-glass-bg);
      border: 1px solid var(--btc-glass-accent);
      box-shadow: 0 0 var(--btc-spacing-5) var(--btc-glass-accent-weak),
        inset 0 var(--btc-spacing-1) var(--btc-spacing-2) color-mix(in srgb, var(--btc-glass-text) 10%, transparent),
        0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
    }

    html.dark & {
      background: var(--btc-glass-bg);
      border-color: var(--btc-glass-border);
      box-shadow: inset 0 var(--btc-spacing-1) var(--btc-spacing-2) color-mix(in srgb, var(--btc-glass-text) 16%, transparent),
        0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 8%, transparent);

      &:hover, &:focus-within {
        background: var(--btc-glass-bg);
        border-color: var(--btc-border-base);
        box-shadow: 0 0 var(--btc-spacing-5) var(--btc-glass-accent-weak),
          inset 0 var(--btc-spacing-1) var(--btc-spacing-2) color-mix(in srgb, var(--btc-glass-text) 16%, transparent),
          0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 10%, transparent);
      }
    }
  }

  &__native-input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font-size: var(--btc-spacing-3-5); // 稍微增大字体
    color: var(--btc-glass-text);
    padding: 0;
    font-weight: 400;

    &::placeholder {
      color: var(--btc-glass-text-muted);
      font-weight: 400;
    }
  }

  &__categories {
    display: flex;
    align-items: center;
    gap: var(--btc-spacing-4); // 增加间距
    flex-wrap: nowrap;
    overflow: hidden;
    max-width: calc(var(--btc-spacing-80) + var(--btc-spacing-20));
    opacity: 1;
    transition: max-width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), gap 0.55s ease; // 同步动画曲线
    will-change: max-width;
    transform: translateZ(0); // 开启硬件加速

    .is-collapsed & {
      max-width: 0;
      gap: 0;
      // 移除 opacity: 0，防止提前隐藏，实现"跟着一起折叠"的裁切效果
    }

    @media (max-width: 768px) {
      gap: var(--btc-spacing-3);
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--btc-spacing-11); // 稍微增大，更易点击
    height: var(--btc-spacing-11);
    border-radius: 50%;
    background: var(--btc-glass-bg);
    backdrop-filter: blur(var(--btc-glass-blur));
    -webkit-backdrop-filter: blur(var(--btc-glass-blur));
    border: 1px solid var(--btc-glass-border);
    box-shadow: 0 0 var(--btc-spacing-2-5) var(--btc-glass-accent-weak),
      inset 0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
    cursor: pointer;
    margin-left: var(--btc-spacing-4); // 增加与 wrapper 的间距
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--btc-glass-text);
    flex-shrink: 0;

    &:hover {
      transform: scale(1.08); // 稍微增大缩放
      background: var(--btc-glass-bg);
      box-shadow: 0 var(--btc-spacing-1-5) var(--btc-spacing-5) var(--btc-glass-accent-weak),
        inset 0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 16%, transparent);
    }

    &:active {
      transform: scale(1.02);
    }
  }

  &__category-tag {
    padding: var(--btc-spacing-2) var(--btc-spacing-5); // 增加内边距
    border-radius: 9999px; // 椭圆形（胶囊状）
    background: var(--btc-glass-bg);
    backdrop-filter: blur(calc(var(--btc-glass-blur) * 0.4));
    -webkit-backdrop-filter: blur(calc(var(--btc-glass-blur) * 0.4));
    color: var(--btc-glass-text);
    font-size: var(--btc-spacing-3-5);
    font-weight: 400; // 正常字重
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); // 更流畅的过渡
    white-space: nowrap;
    border: 1px solid var(--btc-glass-border);
    box-shadow: 0 var(--btc-spacing-1) var(--btc-spacing-4) color-mix(in srgb, var(--btc-glass-text) 10%, transparent),
      inset 0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--btc-spacing-2); // 增加间距以容纳关闭按钮
    user-select: none; // 防止文字选中
    -webkit-user-select: none;

    &:hover {
      background: var(--btc-glass-bg);
      border-color: var(--btc-border-base);
      color: var(--btc-glass-text);
      // transform: translateY(-1px); // 移除上浮效果
      box-shadow: 0 var(--btc-spacing-2) var(--btc-spacing-4) color-mix(in srgb, var(--btc-glass-text) 12%, transparent),
        inset 0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 16%, transparent);
    }

    &:active {
      transform: translateY(0); // 按下时恢复
      box-shadow: 0 var(--btc-spacing-1) var(--btc-spacing-4) color-mix(in srgb, var(--btc-glass-text) 10%, transparent),
        inset 0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
    }

    &.is-selected {
      // 选中态样式优化：保持极简玻璃态
      background: color-mix(in srgb, var(--btc-glass-accent) 10%, var(--btc-glass-bg)); // 微弱的强调色背景
      border-color: color-mix(in srgb, var(--btc-glass-accent) 50%, var(--btc-glass-border)); // 边框稍微明显

      // 移除强烈的外发光，保持与悬浮态相似的阴影，但稍微加深
      box-shadow: 0 var(--btc-spacing-1) var(--btc-spacing-3) color-mix(in srgb, var(--btc-glass-text) 8%, transparent),
        inset 0 var(--btc-spacing-0-5) 0 color-mix(in srgb, var(--btc-glass-text) 10%, transparent);

      // 保持模糊
      backdrop-filter: blur(var(--btc-glass-blur));
      -webkit-backdrop-filter: blur(var(--btc-glass-blur));

      // 文字加粗以区分
      font-weight: 500;
      color: var(--btc-glass-text);
    }

    @media (max-width: 768px) {
      padding: var(--btc-spacing-1-5) var(--btc-spacing-4);
      font-size: var(--btc-spacing-3);
      gap: var(--btc-spacing-1-5);
    }
  }

  &__category-text {
    flex: 1;
  }

  &__close-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--btc-spacing-4);
    height: var(--btc-spacing-4);
    font-size: var(--btc-spacing-3-5);
    color: var(--btc-glass-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: var(--btc-spacing-1);

    &:hover {
      color: var(--btc-glass-text);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__count {
    font-size: var(--btc-spacing-3);
    opacity: 0.9;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    gap: var(--btc-spacing-1);
    max-height: calc(var(--btc-spacing-72) + var(--btc-spacing-3));
    overflow-y: auto;
    padding: var(--btc-spacing-2) 0;

    // 隐藏滚动条但保持滚动功能
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: var(--btc-spacing-3) calc(var(--btc-spacing-4) + var(--btc-spacing-0-5));
    border-radius: var(--btc-spacing-2);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--btc-glass-text);
    font-size: var(--btc-spacing-3-5);
    font-weight: 400;
    min-width: var(--btc-spacing-32);

    &:hover {
      background: color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
      transform: translateX(2px); // 轻微右移效果
    }
  }

  &__menu-label {
    flex: 1;
  }

  // 图标切换动画
}
</style>

<style lang="scss">
// 全局样式：上拉菜单的玻璃态效果
// 注意：el-popover 挂载在 body 下，必须使用全局样式
.el-popper.btc-filter-glass-group__popover {
  // 参考 HaoWallpaper 风格
  background: var(--btc-glass-bg) !important;
  backdrop-filter: blur(var(--btc-glass-blur)) !important;
  -webkit-backdrop-filter: blur(var(--btc-glass-blur)) !important;
  border-radius: var(--btc-spacing-4) !important;
  border: 1px solid var(--btc-glass-border) !important;
  box-shadow: var(--btc-glass-shadow) !important;
  padding: var(--btc-spacing-1-5) !important;

  // 覆盖 Element Plus 默认变量
  --el-popover-bg-color: transparent !important;
  --el-popover-border-color: transparent !important;
  --el-popover-padding: var(--btc-spacing-1-5) !important;
  min-width: unset !important; // 移除默认最小宽度，实现自适应

  // 菜单项文字颜色调整为白色，以适应深色背景
  .btc-filter-glass-group__menu-item {
    color: var(--btc-glass-text);

    &:hover {
      background: color-mix(in srgb, var(--btc-glass-text) 12%, transparent);
    }
  }

  html.dark & {
    background: var(--btc-glass-bg) !important;
    border-color: var(--btc-glass-border) !important;
  }

  // 隐藏箭头
  .el-popper__arrow {
    display: none !important;
  }
}
</style>
