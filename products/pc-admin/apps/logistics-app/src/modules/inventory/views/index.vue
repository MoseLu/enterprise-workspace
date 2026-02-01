<template>
  <div class="page">
    <router-view v-slot="{ Component }">
      <div class="inventory__content">
        <component :is="Component" />
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LogisticsInventory',
});
</script>

<style scoped lang="scss">


.inventory__content {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.inventory__content > * {
  flex: 1 1 auto;
  min-width: 0;
}
</style>
