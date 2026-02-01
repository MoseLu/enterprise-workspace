<template>
  <div
    class="btc-views"
    :class="[
      isExpand ? 'is-expand' : 'is-collapse',
      `is-columns-${props.columns}`,
      { 'is-middle-collapsed': isMiddleCollapsed, 'is-right-collapsed': isRightCollapsed }
    ]"
  >
    <div class="btc-views__wrap">
      <!-- 使用 v-for 动态渲染栏 -->
      <template v-for="(column, index) in columnConfigs" :key="column.index">
        <!-- 第一栏（左侧） -->
        <div v-if="column.index === 0" :class="column.class">
          <div class="btc-views__left-header">
            <slot :name="column.headerSlotName">
              <span class="title">{{ column.title }}</span>
            </slot>
          </div>
          <div class="btc-views__left-content">
            <slot :name="column.slotName">
              <!-- 默认空内容 -->
            </slot>
          </div>
        </div>

        <!-- 中间栏（第二栏，三栏、四栏时） -->
        <div v-else-if="column.index === 1 && props.columns >= 3" :class="column.class">
          <div class="btc-views__middle-header">
            <div class="icon" @click.stop="handleButtonClick(column.index)">
              <BtcSvg name="back" :class="{ 'is-fold': getButtonFoldState(column.index) }" />
            </div>
            <slot :name="column.headerSlotName">
              <span class="title">{{ column.title }}</span>
            </slot>
          </div>
          <div class="btc-views__middle-content">
            <slot :name="column.slotName">
              <!-- 默认空内容 -->
            </slot>
          </div>
        </div>

        <!-- 右侧栏（最后一栏） -->
        <div v-else-if="column.index === (props.columns >= 3 ? 2 : 1)" :class="column.class">
          <div class="btc-views__right-header">
            <div class="icon" @click.stop="handleButtonClick(column.index)">
              <BtcSvg name="back" :class="{ 'is-fold': getButtonFoldState(column.index) }" />
            </div>

            <slot :name="column.headerSlotName">
              <span class="title">{{ column.title }}</span>
            </slot>

            <div class="right-op">
              <slot name="right-op"></slot>
            </div>
          </div>

          <div class="btc-views__right-content">
            <!-- 四栏时，右侧内容区域包含第四栏（垂直分栏） -->
            <template v-if="props.columns === 4">
              <div class="btc-views__right-main">
                <slot :name="column.slotName">
                  <!-- 默认空内容 -->
                </slot>
              </div>
              <div class="btc-views__fourth">
                <div class="btc-views__fourth-header" :class="{ 'no-title': !props.fourthTitle && !$slots['fourth-header'] }">
                  <div class="icon" @click.stop="handleButtonClick(3)">
                    <BtcSvg name="back" :class="{ 'is-fold': getButtonFoldState(3) }" />
                  </div>
                  <slot name="fourth-header">
                    <span v-if="props.fourthTitle" class="title">{{ props.fourthTitle }}</span>
                  </slot>
                </div>
                <div class="btc-views__fourth-content">
                  <slot name="fourth">
                    <!-- 默认空内容 -->
                  </slot>
                </div>
              </div>
            </template>
            <template v-else>
              <slot :name="column.slotName">
                <!-- 默认空内容 -->
              </slot>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BtcSvg from '../../basic/btc-svg/index.vue';
;


defineOptions({
  name: 'BtcViews',
  components: {
    BtcSvg,
  },
});

const props = withDefaults(defineProps<{
  leftTitle?: string;
  rightTitle?: string;
  middleTitle?: string; // 中间栏标题（三栏、四栏时）
  fourthTitle?: string; // 第四栏标题（四栏时）
  leftWidth?: string; // 直接指定左侧宽度（优先级最高）
  leftSize?: 'small' | 'default' | 'large'; // 左侧宽度类型：small（150px）、default（300px）、large（400px）
  columns?: 2 | 3 | 4; // 分栏数量：2栏、3栏、4栏
  middleWidth?: string; // 中间栏宽度（三栏、四栏时）
  rightWidth?: string; // 右侧栏宽度（四栏时）
}>(), {
  leftSize: 'default',
  columns: 2,
});

// 生成栏的配置数组
const columnConfigs = computed(() => {
  const configs: Array<{
    index: number;
    name: string;
    slotName: string;
    headerSlotName: string;
    title: string;
    width: string;
    class: string;
  }> = [];
  
  // 第一栏（左侧）
  configs.push({
    index: 0,
    name: 'left',
    slotName: 'left',
    headerSlotName: 'left-header',
    title: props.leftTitle || '',
    width: leftPaneWidth.value,
    class: 'btc-views__left',
  });
  
  // 中间栏（第二栏，三栏、四栏时）
  if (props.columns >= 3) {
    configs.push({
      index: 1,
      name: 'middle',
      slotName: 'middle',
      headerSlotName: 'middle-header',
      title: props.middleTitle || '',
      width: middlePaneWidth.value,
      class: 'btc-views__middle',
    });
  }
  
  // 右侧栏（最后一栏）
  configs.push({
    index: props.columns >= 3 ? 2 : 1,
    name: 'right',
    slotName: 'right',
    headerSlotName: 'right-header',
    title: props.rightTitle || '',
    width: 'auto', // 右侧栏宽度自适应
    class: 'btc-views__right',
  });
  
  return configs;
});

// 计算左侧宽度：如果指定了 leftWidth 则使用，否则根据 leftSize 计算
const leftPaneWidth = computed(() => {
  // 如果明确指定了 leftWidth，优先使用
  if (props.leftWidth && typeof props.leftWidth === 'string' && props.leftWidth.trim()) {
    return props.leftWidth;
  }
  // 根据 leftSize 计算宽度：small 为 150px，default 为 300px，large 为 400px
  if (props.leftSize === 'small') {
    return '150px';
  } else if (props.leftSize === 'large') {
    return '400px';
  }
  return '300px';
});

// 计算中间栏宽度（三栏、四栏时）
const middlePaneWidth = computed(() => {
  if (props.middleWidth && typeof props.middleWidth === 'string' && props.middleWidth.trim()) {
    return props.middleWidth;
  }
  return '200px'; // 默认中间栏宽度
});

// 计算右侧栏宽度（四栏时）
const rightPaneWidth = computed(() => {
  if (props.rightWidth && typeof props.rightWidth === 'string' && props.rightWidth.trim()) {
    return props.rightWidth;
  }
  return '250px'; // 默认右侧栏宽度
});

// ========== 单一状态源：管理布局模式 ==========
// 核心思路：使用单一状态源替代分散的布尔状态，避免状态互斥和 Computed 追踪问题
type LayoutMode = 'full' | 'hide-col1' | 'hide-col1-col2' | 'hide-col4';

// 单一状态源：管理当前布局模式（所有状态变化都只修改这个变量）
const layoutMode = ref<LayoutMode>('full');

// 监听 columns 变化，重置布局模式
watch(() => props.columns, () => {
  layoutMode.value = 'full';
});

// ========== 派生状态：从单一状态源派生所有布局和按钮状态 ==========

// 派生：第一栏是否展开（用于 CSS 类名）
const isExpand = computed(() => {
  return layoutMode.value === 'full';
});

// 派生：第二栏是否折叠（用于 CSS 类名）
const isMiddleCollapsed = computed(() => {
  if (props.columns >= 3) {
    return layoutMode.value === 'hide-col1-col2';
  }
  return false;
});

// 派生：第四栏是否折叠（用于 CSS 类名，仅四栏模式）
const isRightCollapsed = computed(() => {
  if (props.columns === 4) {
    return layoutMode.value === 'hide-col4';
  }
  return false;
});

// 派生：按钮的图标状态（是否折叠）
// 所有按钮状态都从 layoutMode 派生，避免状态互斥
const getButtonFoldState = (columnIndex: number): boolean => {
  if (props.columns === 2) {
    // 双栏：右侧栏按钮（index=1）控制第一栏
    if (columnIndex === 1) {
      return layoutMode.value === 'hide-col1';
    }
  } else if (props.columns === 3) {
    // 三栏：第二栏按钮（index=1）控制第一栏，第三栏按钮（index=2）控制第一、二栏整体
    if (columnIndex === 1) {
      return layoutMode.value === 'hide-col1';
    } else if (columnIndex === 2) {
      return layoutMode.value === 'hide-col1-col2';
    }
  } else if (props.columns === 4) {
    // 四栏：第二栏按钮（index=1）控制第一栏，第三栏按钮（index=2）控制第一、二栏整体，第四栏按钮（index=3）控制第四栏
    if (columnIndex === 1) {
      return layoutMode.value === 'hide-col1';
    } else if (columnIndex === 2) {
      return layoutMode.value === 'hide-col1-col2';
    } else if (columnIndex === 3) {
      return layoutMode.value === 'hide-col4';
    }
  }
  return false;
};

// ========== 按钮点击逻辑：切换单一状态源 ==========
// 核心方法：按钮点击只切换 layoutMode，所有派生状态会自动同步更新
const handleButtonClick = (columnIndex: number) => {
  if (props.columns === 2) {
    // 双栏：右侧栏按钮（index=1）切换第一栏
    if (columnIndex === 1) {
      layoutMode.value = layoutMode.value === 'hide-col1' ? 'full' : 'hide-col1';
    }
  } else if (props.columns === 3) {
    // 三栏：第二栏按钮（index=1）切换第一栏，第三栏按钮（index=2）切换第一、二栏整体
    if (columnIndex === 1) {
      if (layoutMode.value === 'hide-col1') {
        layoutMode.value = 'full';
      } else if (layoutMode.value === 'hide-col1-col2') {
        layoutMode.value = 'hide-col1';
      } else {
        layoutMode.value = 'hide-col1';
      }
    } else if (columnIndex === 2) {
      if (layoutMode.value === 'hide-col1-col2') {
        layoutMode.value = 'full';
      } else {
        layoutMode.value = 'hide-col1-col2';
      }
    }
  } else if (props.columns === 4) {
    // 四栏：第二栏按钮（index=1）切换第一栏，第三栏按钮（index=2）切换第一、二栏整体，第四栏按钮（index=3）切换第四栏
    if (columnIndex === 1) {
      if (layoutMode.value === 'hide-col1') {
        layoutMode.value = 'full';
      } else if (layoutMode.value === 'hide-col1-col2') {
        layoutMode.value = 'hide-col1';
      } else {
        layoutMode.value = 'hide-col1';
      }
    } else if (columnIndex === 2) {
      if (layoutMode.value === 'hide-col1-col2') {
        layoutMode.value = 'full';
      } else {
        layoutMode.value = 'hide-col1-col2';
      }
    } else if (columnIndex === 3) {
      layoutMode.value = layoutMode.value === 'hide-col4' ? 'full' : 'hide-col4';
    }
  }
};

// ========== 兼容旧 API 的函数 ==========
function expand(value?: boolean) {
  if (value === undefined) {
    layoutMode.value = layoutMode.value === 'hide-col1' || layoutMode.value === 'hide-col1-col2' ? 'full' : 'hide-col1';
  } else {
    layoutMode.value = value ? 'full' : 'hide-col1';
  }
}

function expandBoth(value?: boolean) {
  if (props.columns >= 3) {
    if (value === undefined) {
      layoutMode.value = layoutMode.value === 'hide-col1-col2' ? 'full' : 'hide-col1-col2';
    } else {
      layoutMode.value = value ? 'full' : 'hide-col1-col2';
    }
  } else {
    expand(value);
  }
}

function toggleMiddle(value?: boolean) {
  if (props.columns >= 3) {
    console.warn('[BtcViews] toggleMiddle 在三栏模式下不支持独立控制第二栏');
  }
}

function toggleRight(value?: boolean) {
  if (props.columns === 4) {
    if (value === undefined) {
      layoutMode.value = layoutMode.value === 'hide-col4' ? 'full' : 'hide-col4';
    } else {
      layoutMode.value = value ? 'full' : 'hide-col4';
    }
  }
}

defineExpose({
  isExpand,
  expand,
  expandBoth,
  isMiddleCollapsed,
  toggleMiddle,
  isRightCollapsed,
  toggleRight,
});
</script>

<style lang="scss" scoped>
.btc-views {
  height: 100%;
  width: 100%;

  $left-width: v-bind('leftPaneWidth');
  $middle-width: v-bind('middlePaneWidth');
  $right-width: v-bind('rightPaneWidth');
  $bg: var(--el-bg-color);

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 26px;
    width: 26px;
    font-size: 16px;
    border-radius: 100%;
    color: var(--el-text-color-regular);
    transition: transform 0.2s ease-in-out;

    .btc-svg {
      outline: none;
      font-size: 16px;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .is-fold {
      transform: rotate(180deg);
    }
  }

  &__wrap {
    display: flex;
    height: 100%;
    width: 100%;
    position: relative;
  }

  &__left {
    position: relative;
    height: 100%;
    width: $left-width;
    background-color: $bg;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;

    &-header {
      height: 40px;
      min-height: 40px;
      max-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 14px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;
      background-color: $bg;
      box-sizing: border-box;
      padding: 0 10px;
      width: 100%;

      .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 15px;
        font-weight: 500;
        flex: 1;
      }
    }

    &-content {
      flex: 1;
      overflow: hidden;
      box-sizing: border-box;
      min-height: 0;
      width: 100%;
    }
  }

  // 中间栏（三栏、四栏时）
  &__middle {
    position: absolute;
    left: $left-width;
    top: 0;
    height: 100%;
    width: $middle-width;
    background-color: $bg;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-left: 1px solid var(--el-border-color-extra-light);
    z-index: 1;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width, left;

    &-header {
      height: 40px;
      min-height: 40px;
      max-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 14px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;
      background-color: $bg;
      box-sizing: border-box;
      padding: 0 10px;
      width: 100%;

      .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 15px;
        font-weight: 500;
        flex: 1;
      }

      .icon {
        position: absolute;
        left: 10px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 100%;
      }
    }

    &-content {
      flex: 1;
      overflow: hidden;
      box-sizing: border-box;
      min-height: 0;
      width: 100%;
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 100%;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: $bg;
    z-index: 2;
    will-change: width, left;

    &-header {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      position: relative;
      font-size: 14px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;

      .title {
        white-space: nowrap;
        overflow: hidden;
      }

      .icon {
        position: absolute;
        left: 10px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 100%;
      }

      .right-op {
        position: absolute;
        right: 10px;
      }
    }

    &-content {
      height: calc(100% - 40px);
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    // 四栏时，右侧主内容区域（第三栏）
    &-main {
      flex: 1;
      overflow: hidden;
      box-sizing: border-box;
      min-height: 0;
      width: 100%;
    }
  }

  // 第四栏（四栏时，垂直分栏，位于第三栏下方）
  &__fourth {
    width: 100%;
    height: $right-width;
    background-color: $bg;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-top: 1px solid var(--el-border-color-extra-light);
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: height;
    flex-shrink: 0;

    &-header {
      height: 40px;
      min-height: 40px;
      max-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 14px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;
      background-color: $bg;
      box-sizing: border-box;
      padding: 0 10px;
      width: 100%;

      .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 15px;
        font-weight: 500;
        flex: 1;
      }

      .icon {
        position: absolute;
        left: 10px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 100%;
      }

      // 没有标题时，只显示折叠按钮
      &.no-title {
        justify-content: flex-start;
        border-bottom: none; // 没有标题时隐藏下边框
        
        .icon {
          position: static; // 改为正常流布局
          margin-left: 0;
        }
      }
    }

    &-content {
      flex: 1;
      overflow: hidden;
      box-sizing: border-box;
      min-height: 0;
      width: 100%;
      display: flex;
      flex-direction: column;

      // 确保内部内容占满整个高度并可滚动
      > * {
        flex: 1;
        min-height: 0;
        overflow: auto;
      }
    }
  }

  // 双栏模式
  &.is-columns-2 {
    // 双栏模式下，右侧内容占满整个空间
    .btc-views__right-content > * {
      width: 100%;
      height: 100%;
    }

    &.is-expand {
      .btc-views__right {
        width: calc(100% - $left-width);
        border-left: 1px solid var(--el-border-color-extra-light);
      }
    }

    &.is-collapse {
      .btc-views__right {
        width: 100%;
      }
    }
  }

  // 三栏模式
  &.is-columns-3 {
    // 三栏模式下，右侧内容占满整个空间
    .btc-views__right-content > * {
      width: 100%;
      height: 100%;
    }

    &.is-expand {
      .btc-views__middle {
        width: $middle-width;
        left: $left-width;
      }

      .btc-views__right {
        width: calc(100% - $left-width - $middle-width);
        left: calc($left-width + $middle-width);
        border-left: 1px solid var(--el-border-color-extra-light);
      }
    }

    &.is-collapse {
      .btc-views__left {
        width: 0;
        overflow: hidden;
        
        .btc-views__left-content {
          width: $left-width;
          min-width: $left-width;
        }
      }

      .btc-views__middle {
        left: 0;
        width: calc($left-width + $middle-width);
        
        // 关键：保持内容区域宽度不变，避免文本重新布局
        .btc-views__middle-content {
          width: $middle-width;
          min-width: $middle-width;
        }
      }

      &:not(.is-middle-collapsed) {
        .btc-views__right {
          width: calc(100% - $left-width - $middle-width);
          left: calc($left-width + $middle-width);
          border-left: 1px solid var(--el-border-color-extra-light);
        }
      }
    }

    &.is-middle-collapsed {
      .btc-views__middle {
        width: 0;
        overflow: hidden;
        
        .btc-views__middle-content {
          width: $middle-width;
          min-width: $middle-width;
        }
      }

      &.is-expand {
        .btc-views__middle {
          left: $left-width;
        }

        .btc-views__right {
          width: calc(100% - $left-width);
          left: $left-width;
          border-left: 1px solid var(--el-border-color-extra-light);
        }
      }

      &.is-collapse {
        .btc-views__middle {
          left: 0;
        }

        .btc-views__right {
          width: 100%;
          left: 0;
        }
      }
    }
  }

  // 四栏模式（第四栏是垂直分栏，位于第三栏下方）
  &.is-columns-4 {
    .btc-views__middle {
      width: $middle-width;
      left: $left-width;
    }

    .btc-views__right {
      width: calc(100% - $left-width - $middle-width);
      left: calc($left-width + $middle-width);
    }

    .btc-views__fourth {
      height: $right-width;
    }

    &.is-expand {
      .btc-views__right {
        border-left: 1px solid var(--el-border-color-extra-light);
      }
    }

    // 第一栏折叠：中间栏向左移动，覆盖第一栏
    &.is-collapse {
      .btc-views__middle {
        left: 0;
      }

      &:not(.is-middle-collapsed) {
        .btc-views__right {
          left: calc($left-width + $middle-width);
        }
      }
    }

    // 第二栏折叠：右侧栏向左移动，覆盖第二栏
    &.is-middle-collapsed {
      .btc-views__right {
        left: $left-width;
      }

      &.is-collapse {
        .btc-views__right {
          left: 0;
        }
      }
    }

    // 第四栏折叠（垂直分栏折叠）
    &.is-right-collapsed {
      .btc-views__fourth {
        height: 0;
        overflow: hidden;
        border-top: none; // 折叠时隐藏边框
      }

      // 第三栏占据全部高度
      .btc-views__right-main {
        flex: 1;
      }
    }
  }
}
</style>
