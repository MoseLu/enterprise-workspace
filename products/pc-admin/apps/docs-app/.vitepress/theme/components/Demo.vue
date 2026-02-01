<template>
  <div class="demo-container">
    <div class="demo-preview">
      <slot />
    </div>

    <details class="demo-code" v-if="$slots.code">
      <summary>查看代码</summary>
      <slot name="code" />
    </details>
  </div>
</template>

<script setup lang="ts">
// ClientOnly is not needed for basic demo display
</script>

<style scoped>
.demo-container {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.demo-preview {
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.demo-code {
  border-top: 1px solid var(--vp-c-divider);
}

.demo-code summary {
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  background: var(--vp-c-bg);
  font-size: 14px;
  color: var(--vp-c-brand-1);
  transition: background-color 0.2s;
}

.demo-code summary:hover {
  background: var(--vp-c-bg-soft);
}

.demo-code[open] summary {
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-code :deep(pre) {
  margin: 0;
  border-radius: 0;
}
</style>

