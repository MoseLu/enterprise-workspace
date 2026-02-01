<template>
  <div class="login-options">
    <div class="login-option" @click="onWechatLogin">
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" class="wechat-icon">
        <path fill="currentColor" d="M20.314 18.59c1.333-.968 2.186-2.397 2.186-3.986 0-2.91-2.833-5.27-6.325-5.27-3.494 0-6.325 2.36-6.325 5.27 0 2.911 2.831 5.271 6.325 5.271.698.001 1.393-.096 2.064-.288l.186-.029c.122 0 .232.038.336.097l1.386.8.12.04a.21.21 0 0 0 .212-.211l-.034-.154-.285-1.063-.023-.135a.42.42 0 0 1 .177-.343ZM9.09 3.513C4.9 3.514 1.5 6.346 1.5 9.84c0 1.905 1.022 3.622 2.622 4.781a.505.505 0 0 1 .213.412l-.026.16-.343 1.276-.04.185c0 .14.113.254.252.254l.146-.047 1.663-.96a.793.793 0 0 1 .403-.116l.222.032c.806.231 1.64.348 2.478.348l.417-.01a4.888 4.888 0 0 1-.255-1.55c0-3.186 3.1-5.77 6.923-5.77l.411.011c-.57-3.02-3.71-5.332-7.494-5.332Zm4.976 10.248a.843.843 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001Zm4.217 0a1.012 1.012 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001ZM6.561 8.827a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Zm5.061 0a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Z" clip-rule="evenodd"></path>
      </svg>
      <span>{{ $t('auth.login.third_party.wechat') }}</span>
    </div>
    <div class="login-option" @click="onAppLogin">
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" class="app-icon">
        <path fill="currentColor" d="M7 2C5.9 2 5 2.9 5 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H7zm0 2h10v12H7V4zm0 14h10v2H7v-2z"/>
        <circle fill="currentColor" cx="12" cy="19" r="1"/>
        <rect fill="currentColor" x="8" y="6" width="8" height="1" rx="0.5"/>
        <rect fill="currentColor" x="8" y="8" width="6" height="1" rx="0.5"/>
        <rect fill="currentColor" x="8" y="10" width="7" height="1" rx="0.5"/>
      </svg>
      <span>{{ $t('auth.login.third_party.app') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BtcMessage } from '@btc/shared-components';

defineOptions({
  name: 'BtcLoginOptions'
});

// 微信登录
function onWechatLogin() {
  BtcMessage.info('微信登录功能暂未开启');
}

// APP登录
function onAppLogin() {
  BtcMessage.info('APP登录功能暂未开启');
}
</script>
