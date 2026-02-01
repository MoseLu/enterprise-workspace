<template>
  <div class="btc-comm__icon" @click="toCode">
    <btc-svg name="github" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcGithubCode'
});

function toCode() {
  window.open('https://github.com/BellisGit/btc-shopflow.git', '_blank');
}
</script>


