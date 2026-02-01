<template>
  <div v-if="currentMode !== 'qr'" class="login-tabs">
    <div class="tabs-wrapper">
      <BtcTabs
        :model-value="currentMode"
        :tabs="tabs"
        @tab-change="handleTabChange"
      />
    </div>
    <div class="register-link">
      <router-link to="/register" class="register-link-a">
        {{ $t('auth.login.tabs.go_to_register') }}
        <el-icon class="arrow-right">
          <ArrowRight />
        </el-icon>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import { BtcTabs } from '@btc/shared-components';
import type { LoginMode } from '../../composables/useAuthTabs';

defineOptions({
  name: 'BtcLoginTabs'
});

interface Props {
  currentMode: LoginMode;
}

const props = defineProps<Props>();
const { t } = useI18n();
const router = useRouter();

const emit = defineEmits<{
  'tab-change': [mode: 'password' | 'sms'];
  'go-to-register': [];
}>();

const tabs = [
  { name: 'password', label: t('auth.login.account') },
  { name: 'sms', label: t('auth.login.phone') }
];

function handleTabChange(tab: any, index: number) {
  const mode = (tab?.name || tabs[index]?.name) as 'password' | 'sms';
  if (mode) {
    emit('tab-change', mode);
  }
}
</script>
