<template>
  <el-tag
    :type="computedType"
    :size="size"
    :effect="effect"
    :round="round"
    :closable="closable"
    :disable-transitions="disableTransitions"
    :hit="hit"
    :color="props.color"
    :class="tagClass"
    :style="customStyle"
    @click="(e: MouseEvent) => emit('click', e)"
    @close="(e: MouseEvent) => emit('close', e)"
  >
    <slot />
  </el-tag>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';

defineOptions({
  name: 'BtcTag'
});

export interface BtcTagProps {
  /**
   * 标签类型，支持17种颜色方案
   * 基础类型：primary, success, warning, danger, info（使用 el-tag 原生样式）
   * 扩展类型：purple, pink, cyan, teal, indigo, orange, brown, gray, lime, olive, navy, maroon（使用 color 属性）
   */
  type?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'pink'
    | 'cyan'
    | 'teal'
    | 'indigo'
    | 'orange'
    | 'brown'
    | 'gray'
    | 'lime'
    | 'olive'
    | 'navy'
    | 'maroon';
  /**
   * 尺寸
   */
  size?: 'large' | 'default' | 'small';
  /**
   * 主题（默认 plain）
   */
  effect?: 'dark' | 'light' | 'plain';
  /**
   * 是否圆角
   */
  round?: boolean;
  /**
   * 是否可关闭
   */
  closable?: boolean;
  /**
   * 是否禁用过渡动画
   */
  disableTransitions?: boolean;
  /**
   * 是否有边框描边
   */
  hit?: boolean;
  /**
   * 自定义颜色（优先级高于 type 映射的颜色）
   */
  color?: string;
}

const props = withDefaults(defineProps<BtcTagProps>(), {
  type: 'primary',
  effect: 'plain',
  round: false,
  closable: false,
  disableTransitions: false,
  hit: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  close: [event: MouseEvent];
}>();

// 基础类型（Element Plus 原生支持）
// 使用 markRaw 避免被 Vue 响应式系统处理，防止组件卸载时的错误
const baseTypes = markRaw(['primary', 'success', 'warning', 'danger', 'info']);

// 扩展颜色到基础颜色的映射（用于 color 属性）
// 使用 markRaw 避免被 Vue 响应式系统处理，防止组件卸载时的错误
const extendedColorMap = markRaw<Record<string, string>>({
  purple: '#9c27b0',
  pink: '#e91e63',
  cyan: '#00bcd4',
  teal: '#009688',
  indigo: '#3f51b5',
  orange: '#ff9800',
  brown: '#795548',
  gray: '#616161',
  lime: '#827717',
  olive: '#558b2f',
  navy: '#1976d2',
  maroon: '#c2185b',
});

// 计算最终使用的 type（如果是扩展类型，返回 undefined，通过 CSS 类名和变量处理）
const computedType = computed(() => {
  if (props.type && baseTypes.includes(props.type)) {
    return props.type as 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }
  return undefined;
});

// 计算标签类名（扩展类型添加特定类名，通过 CSS 变量处理样式）
const tagClass = computed(() => {
  // 如果明确指定了 color，不使用扩展类型的样式
  if (props.color) {
    return '';
  }
  // 扩展类型：添加对应的类名，通过 CSS 变量处理样式
  if (props.type && !baseTypes.includes(props.type)) {
    return `btc-tag--${props.type}`;
  }
  return '';
});

// 自定义样式（当前不需要）
const customStyle = computed<Record<string, string>>(() => {
  return {};
});

</script>

<style lang="scss">
// 扩展颜色类型的样式定义（模拟 el-tag 的 type 系统，使用 CSS 变量）
// 注意：不使用 scoped，因为需要穿透到 el-tag 内部
// 使用更具体的选择器确保只影响正确的元素

// 为每个扩展颜色类型定义 light 效果的样式
@mixin extended-tag-light($color) {
  --el-tag-text-color: #{$color};
  --el-tag-bg-color: #{color-mix(in srgb, #{$color} 10%, var(--el-bg-color, #fff))};
  --el-tag-border-color: #{color-mix(in srgb, #{$color} 20%, var(--el-bg-color, #fff))};
  --el-tag-hover-color: #{$color};
}

// 为每个扩展颜色类型定义 dark 效果的样式
@mixin extended-tag-dark($color) {
  --el-tag-text-color: #fff;
  --el-tag-bg-color: #{$color};
  --el-tag-border-color: #{$color};
  --el-tag-hover-color: #{$color};
}

// 为每个扩展颜色类型定义 plain 效果的样式
@mixin extended-tag-plain($color) {
  --el-tag-text-color: #{$color};
  --el-tag-bg-color: transparent;
  --el-tag-border-color: #{$color};
  --el-tag-hover-color: #{$color};
}

// purple
.el-tag.btc-tag--purple.el-tag--light {
  @include extended-tag-light(#9c27b0);
}

.el-tag.btc-tag--purple.el-tag--dark {
  @include extended-tag-dark(#9c27b0);
}

.el-tag.btc-tag--purple.el-tag--plain {
  @include extended-tag-plain(#9c27b0);
}

// pink
.el-tag.btc-tag--pink.el-tag--light {
  @include extended-tag-light(#e91e63);
}

.el-tag.btc-tag--pink.el-tag--dark {
  @include extended-tag-dark(#e91e63);
}

.el-tag.btc-tag--pink.el-tag--plain {
  @include extended-tag-plain(#e91e63);
}

// cyan
.el-tag.btc-tag--cyan.el-tag--light {
  @include extended-tag-light(#00bcd4);
}

.el-tag.btc-tag--cyan.el-tag--dark {
  @include extended-tag-dark(#00bcd4);
}

.el-tag.btc-tag--cyan.el-tag--plain {
  @include extended-tag-plain(#00bcd4);
}

// teal
.el-tag.btc-tag--teal.el-tag--light {
  @include extended-tag-light(#009688);
}

.el-tag.btc-tag--teal.el-tag--dark {
  @include extended-tag-dark(#009688);
}

.el-tag.btc-tag--teal.el-tag--plain {
  @include extended-tag-plain(#009688);
}

// indigo
.el-tag.btc-tag--indigo.el-tag--light {
  @include extended-tag-light(#3f51b5);
}

.el-tag.btc-tag--indigo.el-tag--dark {
  @include extended-tag-dark(#3f51b5);
}

.el-tag.btc-tag--indigo.el-tag--plain {
  @include extended-tag-plain(#3f51b5);
}

// orange
.el-tag.btc-tag--orange.el-tag--light {
  @include extended-tag-light(#ff9800);
}

.el-tag.btc-tag--orange.el-tag--dark {
  @include extended-tag-dark(#ff9800);
}

.el-tag.btc-tag--orange.el-tag--plain {
  @include extended-tag-plain(#ff9800);
}

// brown
.el-tag.btc-tag--brown.el-tag--light {
  @include extended-tag-light(#795548);
}

.el-tag.btc-tag--brown.el-tag--dark {
  @include extended-tag-dark(#795548);
}

.el-tag.btc-tag--brown.el-tag--plain {
  @include extended-tag-plain(#795548);
}

// gray
.el-tag.btc-tag--gray.el-tag--light {
  @include extended-tag-light(#616161);
}

.el-tag.btc-tag--gray.el-tag--dark {
  @include extended-tag-dark(#616161);
}

.el-tag.btc-tag--gray.el-tag--plain {
  @include extended-tag-plain(#616161);
}

// lime
.el-tag.btc-tag--lime.el-tag--light {
  @include extended-tag-light(#827717);
}

.el-tag.btc-tag--lime.el-tag--dark {
  @include extended-tag-dark(#827717);
}

.el-tag.btc-tag--lime.el-tag--plain {
  @include extended-tag-plain(#827717);
}

// olive
.el-tag.btc-tag--olive.el-tag--light {
  @include extended-tag-light(#558b2f);
}

.el-tag.btc-tag--olive.el-tag--dark {
  @include extended-tag-dark(#558b2f);
}

.el-tag.btc-tag--olive.el-tag--plain {
  @include extended-tag-plain(#558b2f);
}

// navy
.el-tag.btc-tag--navy.el-tag--light {
  @include extended-tag-light(#1976d2);
}

.el-tag.btc-tag--navy.el-tag--dark {
  @include extended-tag-dark(#1976d2);
}

.el-tag.btc-tag--navy.el-tag--plain {
  @include extended-tag-plain(#1976d2);
}

// maroon
.el-tag.btc-tag--maroon.el-tag--light {
  @include extended-tag-light(#c2185b);
}

.el-tag.btc-tag--maroon.el-tag--dark {
  @include extended-tag-dark(#c2185b);
}

.el-tag.btc-tag--maroon.el-tag--plain {
  @include extended-tag-plain(#c2185b);
}

// 深色模式下的适配（对于 light 效果，使用 color-mix 混合深色背景）
html.dark {
  .el-tag.btc-tag--purple.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #9c27b0 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #9c27b0 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--pink.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #e91e63 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #e91e63 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--cyan.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #00bcd4 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #00bcd4 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--teal.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #009688 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #009688 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--indigo.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #3f51b5 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #3f51b5 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--orange.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #ff9800 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #ff9800 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--brown.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #795548 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #795548 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--gray.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #616161 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #616161 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--lime.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #827717 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #827717 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--olive.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #558b2f 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #558b2f 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--navy.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #1976d2 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #1976d2 30%, var(--el-bg-color))};
  }

  .el-tag.btc-tag--maroon.el-tag--light {
    --el-tag-bg-color: #{color-mix(in srgb, #c2185b 15%, var(--el-bg-color))};
    --el-tag-border-color: #{color-mix(in srgb, #c2185b 30%, var(--el-bg-color))};
  }
}

// hit 边框颜色：为每个标签类型设置对应的 hit 边框颜色，而不是默认的主题色
// 基础类型使用 Element Plus 的 CSS 变量
.el-tag.el-tag--primary.is-hit {
  border-color: var(--el-color-primary) !important;
}

.el-tag.el-tag--success.is-hit {
  border-color: var(--el-color-success) !important;
}

.el-tag.el-tag--warning.is-hit {
  border-color: var(--el-color-warning) !important;
}

.el-tag.el-tag--danger.is-hit {
  border-color: var(--el-color-danger) !important;
}

.el-tag.el-tag--info.is-hit {
  border-color: var(--el-color-info) !important;
}

// 扩展类型的 hit 边框颜色
.el-tag.btc-tag--purple.is-hit {
  border-color: #9c27b0 !important;
}

.el-tag.btc-tag--pink.is-hit {
  border-color: #e91e63 !important;
}

.el-tag.btc-tag--cyan.is-hit {
  border-color: #00bcd4 !important;
}

.el-tag.btc-tag--teal.is-hit {
  border-color: #009688 !important;
}

.el-tag.btc-tag--indigo.is-hit {
  border-color: #3f51b5 !important;
}

.el-tag.btc-tag--orange.is-hit {
  border-color: #ff9800 !important;
}

.el-tag.btc-tag--brown.is-hit {
  border-color: #795548 !important;
}

.el-tag.btc-tag--gray.is-hit {
  border-color: #616161 !important;
}

.el-tag.btc-tag--lime.is-hit {
  border-color: #827717 !important;
}

.el-tag.btc-tag--olive.is-hit {
  border-color: #558b2f !important;
}

.el-tag.btc-tag--navy.is-hit {
  border-color: #1976d2 !important;
}

.el-tag.btc-tag--maroon.is-hit {
  border-color: #c2185b !important;
}

// 表格中的 small 尺寸标签，使用适中的 padding 以保持美观
.el-table .el-tag.el-tag--small {
  padding: 0 6px !important;
}
</style>
