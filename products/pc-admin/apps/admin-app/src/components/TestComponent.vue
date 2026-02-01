<template>
  <div class="test-component">
    <p>这是一个测试组件，用于验证 Tag 插件是否正常工作。</p>
    <p>
      在 Vue DevTools 中，这个组件应该显示为 <strong>TestComponent</strong>，而不是
      <code>&lt;Anonymous&gt;</code>
    </p>
  </div>
</template>

<script setup lang="ts" name="TestComponent">
// 使用 name 属性，Tag 插件会自动添加组件名称
</script>

<style scoped>
.test-component {
  padding: 1rem;
  background: white;
  border-radius: 4px;
  border: 2px solid #42b883;
}

strong {
  color: #42b883;
}

code {
  background: var(--el-fill-color-light);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>
