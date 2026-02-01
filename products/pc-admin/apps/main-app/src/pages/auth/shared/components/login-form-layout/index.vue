<template>
  <div class="login-form-layout">
    <!-- 表单区域 -->
    <div class="form-container">
      <slot name="form" />
    </div>

    <!-- 按钮和忘记密码区域（使用 gap 控制它们之间的间距） -->
    <div class="bottom-section">
      <!-- 按钮区域 -->
      <div class="button-container">
        <slot name="button" />
      </div>

      <!-- 额外内容（如忘记密码链接） -->
      <!-- 始终存在，确保按钮位置固定，即使没有内容也占位 -->
      <div class="extra-container">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcLoginFormLayout'
});
</script>

<style lang="scss" scoped>
.login-form-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  // 让父容器的 flex: 0.6 决定高度，然后内容自然撑开

  // 表单容器：包含表单和按钮，使用固定高度值，确保两种登录方式高度一致
  .form-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 180px; // 增加高度以包含按钮（135px 表单 + 45px 按钮）
    flex-shrink: 0; // 不收缩，保持固定高度
    // 使用 flex 布局让表单项从顶部开始排列
    justify-content: flex-start;
    // 确保容器有足够空间，内容不被挤压
    overflow: visible;

    // 让表单内容使用 flex 布局，表单项从顶部开始排列
    :deep(.form) {
      display: flex;
      flex-direction: column;
      width: 100%;
      // 表单内容自然布局，不强制填满容器，保持表单项的原有间距
      justify-content: flex-start;
      // 使用 gap 统一管理表单项之间的间距，替代 margin-bottom
      gap: 24px;

      .el-form-item {
        flex-shrink: 0; // 表单项不收缩，保持原有高度
        // 移除 margin-bottom，使用 gap 来控制间距
        margin-bottom: 0;
        
        // 确保按钮表单项的按钮样式正确
        &:last-child {
          margin-top: 0; // 按钮表单项不需要额外的上边距
          
          .el-button {
            width: 100%;
            height: 45px; // 统一按钮高度
            min-height: 45px; // 确保最小高度一致
          }
        }
      }
    }
  }

  // 底部区域：包含按钮和忘记密码，根据内容自然高度，不占据多余空间
  .bottom-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex-shrink: 0; // 不收缩，但不使用 flex: 1，让内容自然撑开
    // 移除 flex: 1，避免占据多余的空白空间
    justify-content: flex-start; // 内容靠上对齐
  }

  .button-container {
    width: 100%;
    // 按钮现在在表单内部，这个容器可能为空，但保留以保持布局一致性
    // 如果 button 插槽有内容，则显示；否则为空，不影响布局

    :deep(.el-button) {
      width: 100%;
      height: 45px; // 统一按钮高度
      min-height: 45px; // 确保最小高度一致
      // 关键：不覆盖按钮的背景色，让 glassmorphism 样式生效
      // 只设置尺寸相关属性，不设置背景色
    }
  }

  .extra-container {
    flex-shrink: 0; // 额外内容区域（忘记密码）不收缩
    width: 100%;
    // 始终占据相同高度，确保按钮位置一致
    // 即使没有内容（手机号登录），也占据与忘记密码链接相同的高度
    min-height: 32px; // 约为忘记密码链接的高度（16px margin-top + 内容高度）
  }

  // 通过让 form-container 使用 flex: 1 占据空间
  // 按钮和忘记密码使用 flex-shrink: 0 固定
  // 这样无论表单内容多少，按钮的绝对位置都一致
}
</style>

