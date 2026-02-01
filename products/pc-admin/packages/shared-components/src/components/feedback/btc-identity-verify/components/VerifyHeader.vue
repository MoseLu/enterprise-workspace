<template>
  <div class="identity-verify__header">
    <!-- Header左侧：标题 -->
    <div class="identity-verify__header-left">
      <div class="identity-verify__header-title">验证身份</div>
    </div>
    <!-- Header右侧：提示语 -->
    <div class="identity-verify__header-right">
      <div class="identity-verify__header-desc">
        为确保账号
        <span class="identity-verify__header-account">{{ accountName }}</span>
        是您本人操作，请任意选择一种方式验证身份
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcIdentityVerifyHeader'
});

interface Props {
  accountName?: string;
}

withDefaults(defineProps<Props>(), {
  accountName: '您'
});
</script>

<style lang="scss" scoped>
@use '../styles/header.scss' as *;
</style>

