<template>
  <div class="btc-notification-wrapper">
    <el-notification
      :title="title"
      :message="message"
      :type="type"
      :duration="duration"
      :show-close="showClose"
      :position="position"
      :dangerously-use-html-string="dangerouslyUseHTMLString"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
// 缁勪欢鍚嶇О
defineOptions({
  name: 'BtcNotificationComponent',
});

// Props 瀹氫箟
interface Props {
  title?: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
  showClose?: boolean;
  position?: string;
  dangerouslyUseHTMLString?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '',
  type: 'info',
  duration: 4500,
  showClose: true,
  position: 'top-right',
  dangerouslyUseHTMLString: false,
});

// Emits 瀹氫箟
const emit = defineEmits<{
  close: [];
}>();

// 澶勭悊鍏抽棴浜嬩欢
const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
.btc-notification-wrapper {
  position: relative;
  display: inline-block;
}
</style>

