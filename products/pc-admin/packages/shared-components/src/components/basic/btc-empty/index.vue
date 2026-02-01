<template>
  <div class="btc-empty" :class="[`btc-empty--${size}`]">
    <el-empty
      :image="props.image ?? ($attrs.image as string)"
      :image-size="props.imageSize ?? ($attrs['image-size'] as number)"
      :description="props.description ?? ($attrs.description as string)"
    >
      <!-- 默认插槽：底部内容 -->
      <template v-if="$slots.default" #default>
        <slot />
      </template>
      <!-- 自定义图片插槽 -->
      <template v-if="$slots.image" #image>
        <slot name="image" />
      </template>
      <!-- 自定义描述插槽 -->
      <template v-if="$slots.description" #description>
        <slot name="description" />
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ElEmpty } from 'element-plus';

defineOptions({
  name: 'BtcEmpty',
  inheritAttrs: false,
  components: {
    ElEmpty,
  },
});

export interface BtcEmptyProps {
  /**
   * 空状态图片类型
   */
  image?: string;
  
  /**
   * 图片大小
   */
  imageSize?: number;
  
  /**
   * 描述文本
   */
  description?: string;
  
  /**
   * 尺寸大小
   */
  size?: 'small' | 'default' | 'large';
}

const props = withDefaults(defineProps<BtcEmptyProps>(), {
  imageSize: 100,
  size: 'default',
});
</script>

<style lang="scss" scoped>
.btc-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  box-sizing: border-box;
  // 关键：在 flex 布局中占据剩余空间
  flex: 1 1 auto;
  min-height: 0; // 允许收缩，避免内容溢出

  :deep(.el-empty) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  :deep(.el-empty__image) {
    margin-bottom: 16px;
    opacity: 0.8;
  }

  :deep(.el-empty__description) {
    margin-top: 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    line-height: 1.5;
  }

  // 小尺寸
  &--small {
    padding: 20px;

    :deep(.el-empty__image) {
      margin-bottom: 12px;
    }

    :deep(.el-empty__description) {
      font-size: 13px;
    }
  }

  // 大尺寸
  &--large {
    padding: 60px 20px;

    :deep(.el-empty__image) {
      margin-bottom: 20px;
    }

    :deep(.el-empty__description) {
      font-size: 15px;
    }
  }
}
</style>
