<template>
  <div class="divider" ref="dividerRef">
    <div class="divider-line left-arrows" ref="leftLineRef">
      <el-icon 
        v-for="n in leftArrowCount" 
        :key="`left-${n}`" 
        class="arrow"
        :style="{ animationDelay: `${(n - 1) * 0.2}s` }"
      >
        <ArrowRight />
      </el-icon>
    </div>
    <span class="divider-text">{{ $t('auth.login.third_party.divider') }}</span>
    <div class="divider-line right-arrows" ref="rightLineRef">
      <el-icon 
        v-for="n in rightArrowCount" 
        :key="`right-${n}`" 
        class="arrow"
        :style="{ animationDelay: `${(n - 1) * 0.2}s` }"
      >
        <ArrowLeft />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ArrowRight, ArrowLeft } from '@element-plus/icons-vue';

defineOptions({
  name: 'BtcAuthDivider'
});

const dividerRef = ref<HTMLElement>();
const leftLineRef = ref<HTMLElement>();
const rightLineRef = ref<HTMLElement>();
const leftArrowCount = ref(3);
const rightArrowCount = ref(3);

// 计算箭头数量
const calculateArrowCount = () => {
  if (!leftLineRef.value || !rightLineRef.value) return;
  
  // 箭头的基础宽度（更密集的间距）
  const arrowWidth = 16; // 12px图标 + 4px间距
  const minSpacing = 4; // 最小间距
  
  // 获取每侧可用宽度
  const leftWidth = leftLineRef.value.offsetWidth;
  const rightWidth = rightLineRef.value.offsetWidth;
  
  // 计算每侧可以放置的箭头数量
  const leftCount = Math.max(2, Math.floor((leftWidth - minSpacing) / arrowWidth));
  const rightCount = Math.max(2, Math.floor((rightWidth - minSpacing) / arrowWidth));
  
  leftArrowCount.value = Math.min(leftCount, 12); // 最多12个箭头
  rightArrowCount.value = Math.min(rightCount, 12);
};

// 监听窗口大小变化
const handleResize = () => {
  nextTick(() => {
    calculateArrowCount();
  });
};

onMounted(() => {
  nextTick(() => {
    calculateArrowCount();
  });
  
  window.addEventListener('resize', handleResize);
});

// 清理事件监听器
import { onUnmounted } from 'vue';
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;

  .divider-line {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    min-height: 16px;

    .arrow {
      color: var(--el-text-color-primary);
      font-size: 12px;
      transition: all 0.3s ease;
      opacity: 0.9;
      flex-shrink: 0;

      &:hover {
        color: var(--el-color-primary);
        opacity: 1;
        transform: scale(1.2);
      }
    }

    &.left-arrows {
      justify-content: space-evenly;
      padding-right: 8px;

      .arrow {
        animation: arrowFlowRight 2.5s ease-in-out infinite;
      }
    }

    &.right-arrows {
      justify-content: space-evenly;
      padding-left: 8px;

      .arrow {
        animation: arrowFlowLeft 2.5s ease-in-out infinite;
      }
    }
  }

  .divider-text {
    padding: 0 16px;
    color: var(--el-text-color-primary);
    font-size: 14px;
    white-space: nowrap;
    font-weight: 600;
    flex-shrink: 0;
  }
}

@keyframes arrowFlowRight {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.8;
  }
  50% {
    transform: translateX(2px);
    opacity: 1;
  }
}

@keyframes arrowFlowLeft {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-2px);
    opacity: 1;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .divider {
    .divider-line {
      &.left-arrows {
        padding-right: 6px;
      }

      &.right-arrows {
        padding-left: 6px;
      }
    }

    .divider-text {
      padding: 0 12px;
      font-size: 13px;
    }
  }
}

@media (max-width: 480px) {
  .divider {
    .divider-line {
      &.left-arrows {
        padding-right: 4px;
      }

      &.right-arrows {
        padding-left: 4px;
      }
    }

    .divider-text {
      padding: 0 8px;
      font-size: 12px;
    }
  }
}
</style>

<style lang="scss">
// 暗色主题适配 - 使用全局样式避免 & 语法错误
html.dark {
  .divider {
    .arrow {
      color: var(--el-text-color-primary);
      opacity: 0.95;
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
    
    .divider-text {
      color: var(--el-text-color-primary);
    }
  }
}
</style>
