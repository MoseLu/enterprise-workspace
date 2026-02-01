<template>
  <div class="page">
    <router-view v-slot="{ Component }">
      <div class="page__body">
        <component :is="Component" />
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LogisticsWarehouse',
});
</script>

<style scoped lang="scss">


.page__body {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.page__body > * {
  flex: 1 1 auto;
  min-width: 0;
}
</style>


