<template>
  <div class="pic-captcha" @click="refresh">
    <div v-if="svg" class="svg" v-html="svg" />
    <img v-else-if="base64" class="base64" :src="base64" alt="" />

    <template v-else>
      <el-icon class="is-loading" :size="18">
        <Loading />
      </el-icon>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Loading } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { BtcAlert } from '@btc/shared-components';
import { http } from '@/utils/http';

defineOptions({
  name: 'PicCaptcha'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change'): void;
}>();

const props = defineProps<{
  modelValue: string;
}>();

const { t } = useI18n();

// base64
const base64 = ref('');

// svg
const svg = ref('');

// 刷新验证码
async function refresh() {
  svg.value = '';
  base64.value = '';

  try {
    // 调用验证码接口
    const response = await http.post<{
      captchaId: string;
      data: string;
    }>('/base/open/captcha', {
      height: 45,
      width: 150,
      color: '#2c3142'
    });

    if (response && response.captchaId && response.data) {
      const { captchaId, data } = response;

      if (data.includes(';base64,')) {
        base64.value = data;
      } else {
        svg.value = data;
      }

      emit('update:modelValue', captchaId);
      emit('change');
    } else {
      BtcAlert(t('验证码获取失败'), {
        title: t('提示'),
        type: 'error'
      });
    }
  } catch (err: any) {
    BtcAlert(err.message || t('验证码获取失败'), {
      title: t('提示'),
      type: 'error'
    });
  }
}

onMounted(() => {
  refresh();
});

defineExpose({
  refresh
});
</script>

<style lang="scss" scoped>
.pic-captcha {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 45px;
  width: 150px;
  position: relative;
  user-select: none;

  .svg {
    height: 100%;
    position: relative;
  }

  .base64 {
    height: 100%;
  }

  .is-loading {
    position: absolute;
    right: 15px;
  }
}
</style>

