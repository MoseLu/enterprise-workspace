<template>
  <div class="btc-double-layout" :class="[isExpand ? 'is-expand' : 'is-collapse']">
    <div class="btc-double-layout__wrap">
      <!-- 左侧 -->
      <div class="btc-double-layout__left">
        <div class="btc-double-layout__left-header">
          <slot name="left-header">
            <span class="label">{{ leftTitleDisplay }}</span>
          </slot>
        </div>
        <div class="btc-double-layout__left-content">
          <slot name="left">
            <!-- 默认空内容 -->
          </slot>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="btc-double-layout__right">
        <div class="head">
          <div class="icon" @click="expand()">
            <BtcSvg name="back" :class="{ 'is-fold': !isExpand }" />
          </div>

          <slot name="right-header">
            <span class="title">{{ rightTitleDisplay }}</span>
          </slot>

          <div class="right-op">
            <slot name="right-op"></slot>
          </div>
        </div>

        <div class="content">
          <slot name="right">
            <!-- 默认空内容 -->
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import BtcSvg from '../../basic/btc-svg/index.vue';

defineOptions({
  name: 'BtcDoubleLayout',
  components: {
    BtcSvg,
  },
});

const props = withDefaults(defineProps<{
  leftTitle?: string;
  rightTitle?: string;
  leftWidth?: string; // 直接指定左侧宽度（优先级最高）
  leftSize?: 'small' | 'default' | 'large'; // 左侧宽度类型：small（150px）、default（300px）、large（400px）
}>(), {
  leftSize: 'default',
});

// 国际化
const { t } = useI18n();

// 判断字符串是否是国际化 key（包含点号）
const isI18nKey = (str: string | undefined): boolean => {
  if (!str) return false;
  return typeof str === 'string' && str.includes('.') && /^[a-zA-Z]/.test(str);
};

// 显示左侧标题（支持国际化）
const leftTitleDisplay = computed(() => {
  if (!props.leftTitle) return '左侧';
  return isI18nKey(props.leftTitle) ? t(props.leftTitle) : props.leftTitle;
});

// 显示右侧标题（支持国际化）
const rightTitleDisplay = computed(() => {
  if (!props.rightTitle) return '右侧';
  return isI18nKey(props.rightTitle) ? t(props.rightTitle) : props.rightTitle;
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

// 是否展开
const isExpand = ref(true);

// 收起、展开
function expand(value?: boolean) {
  isExpand.value = value === undefined ? !isExpand.value : value;
}

defineExpose({
  isExpand,
  expand,
});
</script>

<style lang="scss" scoped>
.btc-double-layout {
  height: 100%;
  width: 100%;

  $left-width: v-bind('leftPaneWidth');
  $bg: var(--el-bg-color);

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 26px;
    width: 26px;
    font-size: 16px;
    border-radius: 4px;
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
    transition: width 0.3s;
    // 确保左侧栏在右侧栏下方
    z-index: 0;

    &-header {
      height: 40px;
      min-height: 40px;
      max-height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding: 0 10px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;
      background-color: $bg;
      box-sizing: border-box;

      .label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
    transition: width 0.3s;
    background-color: $bg;
    // 确保右侧栏在折叠时能够覆盖左侧栏
    z-index: 1;

    .head {
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
        text-overflow: ellipsis;
        flex: 1;
        text-align: center;
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
        padding: 10px 0;
      }
    }

    .content {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
  }

  &.is-expand {
    .btc-double-layout__right {
      width: calc(100% - $left-width);
      border-left: 1px solid var(--el-border-color-extra-light);
    }
  }

  &.is-collapse {
    .btc-double-layout__right {
      width: 100%;
    }
  }
}
</style>
