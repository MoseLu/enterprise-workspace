<template>
  <div id="app-skeleton" class="app-skeleton">
    <div class="skeleton-content">
      <div class="skeleton-header"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AppSkeleton',
});
</script>

<style lang="scss" scoped>
// z-index 层级常量（与应用级loading保持一致）
$APP_Z_INDEX: 9999;

.app-skeleton {
  // 关键：骨架屏组件被渲染出来时就应该可见（显示/隐藏由父组件 v-if/v-show 控制）
  // 之前这里写成 display: none 会导致无论如何都显示不出来，从而在切换子应用时出现白屏。
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color);
  z-index: $APP_Z_INDEX; // 使用应用级loading的z-index，确保与应用级loading兼容
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-content {
  width: 80%;
  max-width: 800px;
  padding: 40px;
}

.skeleton-header {
  width: 40%;
  height: 32px;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  margin-bottom: 24px;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-line {
  width: 100%;
  height: 20px;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;

  &.short {
    width: 60%;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

