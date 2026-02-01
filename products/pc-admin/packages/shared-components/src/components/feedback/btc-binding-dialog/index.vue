<template>
  <BtcDialog
    v-model="visible"
    :width="dialogWidth"
    padding="0"
    :hide-header="true"
    :scrollbar="false"
    class="binding-dialog"
  >
    <div class="binding">
      <!-- 关闭按钮 -->
      <el-icon class="binding__close-icon" @click="handleClose">
        <Close />
      </el-icon>

      <!-- 顶部Header区域 -->
      <div class="binding__header">
        <div class="binding__header-title">
          {{ bindField === 'phone' ? '绑定手机号' : '绑定邮箱' }}
        </div>
        <div class="binding__header-desc">
          <template v-if="bindField === 'phone'">
            请输入您的手机号，验证码将发送至该手机号，验证成功后该手机号将绑定到您的账号
          </template>
          <template v-else>
            请输入您的邮箱地址，验证码将发送至该邮箱，验证成功后该邮箱将绑定到您的账号
          </template>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="binding__content">
        <div class="binding-form">
          <div class="binding-form__content">
            <!-- 手机号绑定表单 -->
            <template v-if="bindField === 'phone'">
              <div class="binding-form__item">
                <span class="binding-form__item-label">手机号</span>
                <el-input
                  v-model="phoneForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                  :disabled="verifying"
                />
              </div>

              <div class="binding-form__item binding-form__item-code">
                <label for="phone-sms-code-0" class="binding-form__item-label">验证码</label>
                <div class="binding-form__item-code-wrapper">
                  <component
                    :is="smsCodeInputComponent"
                    id-prefix="phone-sms-code"
                    v-model="phoneForm.smsCode"
                    size="small"
                    :disabled="!smsHasSent || verifying"
                    @complete="handleSmsCodeComplete"
                  />
                  <el-button
                    class="send-code-btn"
                    type="primary"
                    plain
                    size="large"
                    :disabled="!smsCanSend || !phoneForm.phone || verifying"
                    :loading="smsSending"
                    @click="handleSendSmsCode"
                  >
                    {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
                  </el-button>
                </div>
              </div>

              <div class="binding-form__item">
                <el-button
                  class="binding-form__item-button"
                  type="primary"
                  size="large"
                  :loading="verifying"
                  :disabled="!phoneForm.smsCode || phoneForm.smsCode.length !== 6"
                  @click="handleVerify"
                >
                  立即绑定
                </el-button>
              </div>

              <div v-if="verifyError" class="binding-form__item-error">
                {{ verifyError }}
              </div>
            </template>

            <!-- 邮箱绑定表单 -->
            <template v-else>
              <div class="binding-form__item">
                <span class="binding-form__item-label">邮箱</span>
                <el-input
                  v-model="emailForm.email"
                  placeholder="请输入邮箱地址"
                  size="large"
                  :disabled="verifying"
                />
              </div>

              <div class="binding-form__item binding-form__item-code">
                <label for="email-sms-code-0" class="binding-form__item-label">验证码</label>
                <div class="binding-form__item-code-wrapper">
                  <component
                    :is="smsCodeInputComponent"
                    id-prefix="email-sms-code"
                    v-model="emailForm.emailCode"
                    size="small"
                    :disabled="!emailHasSent || verifying"
                    @complete="handleEmailCodeComplete"
                  />
                  <el-button
                    class="send-code-btn"
                    type="primary"
                    plain
                    size="large"
                    :disabled="emailCountdown > 0 || emailSending || !emailForm.email || verifying"
                    :loading="emailSending"
                    @click="handleSendEmailCode"
                  >
                    {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
                  </el-button>
                </div>
              </div>

              <div class="binding-form__item">
                <el-button
                  class="binding-form__item-button"
                  type="primary"
                  size="large"
                  :loading="verifying"
                  :disabled="!emailForm.emailCode || emailForm.emailCode.length !== 6"
                  @click="handleVerify"
                >
                  立即绑定
                </el-button>
              </div>

              <div v-if="verifyError" class="binding-form__item-error">
                {{ verifyError }}
              </div>
            </template>
          </div>

          <!-- 提示区域 -->
          <div class="binding-form__footer">
            <div class="binding-form__divider"></div>
            <div class="binding-form__item-tip">
              <template v-if="bindField === 'phone'">
                <div>1. 请输入您的手机号，验证码将发送至该手机号</div>
                <div>2. 发送验证码后，您可以在手机短信中获取（1分钟内未收到，建议在垃圾短信中查看）</div>
                <div class="binding-form__item-tip-highlight">
                  3. 验证成功后，该手机号将自动绑定到您的账号
                </div>
              </template>
              <template v-else>
                <div>1. 请输入您的邮箱地址，验证码将发送至该邮箱</div>
                <div>2. 验证码已发送至您的邮箱，请查收。如未收到，请检查垃圾邮件或稍后重试。</div>
                <div class="binding-form__item-tip-highlight">
                  3. 验证成功后，该邮箱将自动绑定到您的账号
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BtcDialog>
</template>

<script setup lang="ts">
import { computed, watch, h } from 'vue';

import { Close } from '@element-plus/icons-vue';
import {
  useIdentityVerify,
  type SendSmsCodeFn,
  type SendEmailCodeFn,
  type VerifySmsCodeFn,
  type VerifyEmailCodeFn
} from '../btc-identity-verify/composables/useIdentityVerify';
import type { SaveBindingApi } from './types';
import BtcDialog from '../btc-dialog/index';
import type { Component } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'BtcBindingDialog'
});

interface Props {
  modelValue: boolean;
  userInfo: {
    id?: number | string;
    phone?: string;
    email?: string;
  };
  /** 账号名称（用于显示） */
  accountName?: string;
  /** 发送短信验证码函数 */
  sendSmsCode: SendSmsCodeFn;
  /** 发送邮箱验证码函数 */
  sendEmailCode: SendEmailCodeFn;
  /** 验证短信验证码函数 */
  verifySmsCode: VerifySmsCodeFn;
  /** 验证邮箱验证码函数 */
  verifyEmailCode: VerifyEmailCodeFn;
  /** 保存绑定信息 */
  saveBinding: SaveBindingApi;
  /** 验证码输入组件 */
  smsCodeInputComponent?: Component;
  /** 要绑定的字段（'phone' | 'email'） */
  bindField: 'phone' | 'email';
}

const props = withDefaults(defineProps<Props>(), {
  accountName: '您',
  smsCodeInputComponent: () => h('div', '请提供 smsCodeInputComponent')
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [];
  'cancel': [];
}>();

// 显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 弹窗宽度
const dialogWidth = computed(() => '600px');

// 使用身份验证 composable（复用验证码发送和验证逻辑）
const {
  currentVerifyType,
  phoneForm,
  emailForm,
  verifying,
  verifyError,
  smsCountdown,
  smsSending,
  smsHasSent,
  smsCanSend,
  sendSmsCode,
  emailCountdown,
  emailSending,
  emailHasSent,
  sendEmailCode,
  verify,
  reset,
  switchVerifyType
} = useIdentityVerify({
  userInfo: props.userInfo,
  sendSmsCode: props.sendSmsCode,
  sendEmailCode: props.sendEmailCode,
  verifySmsCode: props.verifySmsCode,
  verifyEmailCode: props.verifyEmailCode,
  onSuccess: async () => {
    // 验证成功后直接保存绑定信息
    try {
      if (props.bindField === 'phone' && phoneForm.phone && phoneForm.smsCode) {
        await props.saveBinding({
          ...(props.userInfo.id !== undefined ? { id: props.userInfo.id } : {}),
          phone: phoneForm.phone,
          smsCode: phoneForm.smsCode,
          smsType: 'bind',
          scene: 'bind'
        });
        BtcMessage.success('手机号绑定成功');
      } else if (props.bindField === 'email' && emailForm.email && emailForm.emailCode) {
        await props.saveBinding({
          ...(props.userInfo.id !== undefined ? { id: props.userInfo.id } : {}),
          email: emailForm.email,
          emailCode: emailForm.emailCode,
          smsType: 'bind',
          scene: 'bind'
        });
        BtcMessage.success('邮箱绑定成功');
      }

      // 绑定成功后，关闭弹窗并触发 success 事件
      visible.value = false;
      emit('success');
    } catch (error: any) {
      logger.error('保存绑定信息失败:', error);
      BtcMessage.error(error?.message || '保存绑定信息失败');
    }
  },
  onError: (error) => {
    logger.error('验证失败:', error);
  }
});

// 初始化验证类型
watch(() => props.bindField, (field) => {
  if (field === 'phone' && currentVerifyType.value !== 'phone') {
    switchVerifyType('phone');
  } else if (field === 'email' && currentVerifyType.value !== 'email') {
    switchVerifyType('email');
  }
}, { immediate: true });

// 发送手机验证码
const handleSendSmsCode = async () => {
  if (!phoneForm.phone) {
    BtcMessage.warning('请输入手机号');
    return;
  }
  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phoneForm.phone)) {
    BtcMessage.warning('请输入正确的手机号');
    return;
  }
  // sendSmsCode 来自 useSmsCode，需要传递 phone 和 smsType 参数
  // 绑定流程使用 'bind'
  await sendSmsCode(phoneForm.phone, 'bind');
};

// 发送邮箱验证码
const handleSendEmailCode = async () => {
  // useIdentityVerify composable 中的 sendEmailCode 不接受参数
  // 它会自动使用 emailForm.email，并在内部调用 props.sendEmailCode(emailForm.email, 'auth')
  await sendEmailCode();
};

// 验证码输入完成
const handleSmsCodeComplete = () => {
  // 自动触发验证
  if (phoneForm.smsCode && phoneForm.smsCode.length === 6) {
    handleVerify();
  }
};

const handleEmailCodeComplete = () => {
  // 自动触发验证
  if (emailForm.emailCode && emailForm.emailCode.length === 6) {
    handleVerify();
  }
};

// 执行验证
const handleVerify = async () => {
  await verify();
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  emit('cancel');
};

// 监听弹窗打开，重置表单
watch(visible, (isVisible) => {
  if (!isVisible) {
    reset();
  } else {
    // 打开弹窗时，根据 bindField 设置验证类型
    if (props.bindField === 'phone') {
      phoneForm.phone = '';
      phoneForm.smsCode = '';
      if (currentVerifyType.value !== 'phone') {
        switchVerifyType('phone');
      }
    } else if (props.bindField === 'email') {
      emailForm.email = '';
      emailForm.emailCode = '';
      if (currentVerifyType.value !== 'email') {
        switchVerifyType('email');
      }
    }
  }
});
</script>

<style lang="scss">
.binding-dialog {
  :deep(.btc-dialog__body) {
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
@use './styles.scss' as *;
</style>
