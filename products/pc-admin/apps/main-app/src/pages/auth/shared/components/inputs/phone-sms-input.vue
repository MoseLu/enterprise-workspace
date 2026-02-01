<template>
  <btc-form-item :label="label" :prop="prop">
    <el-input
      v-model="phoneValue"
      :placeholder="phonePlaceholder"
      :maxlength="11"
      :clearable="clearable"
      @blur="handlePhoneBlur"
      @keyup.enter="handlePhoneEnter"
      @input="handlePhoneInput"
    >
      <template #suffix>
        <el-button
          :disabled="smsCountdown > 0 || !isPhoneValid"
          @click="handleSendSms"
          class="sms-btn"
        >
          {{ smsCountdown > 0 ? `${smsCountdown}s` : smsButtonText }}
        </el-button>
      </template>
    </el-input>
  </btc-form-item>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

// 定义组件选项
defineOptions({
  name: 'PhoneSmsInput'
})

interface Props {
  label?: string
  prop?: string
  modelValue?: string
  phonePlaceholder?: string
  smsButtonText?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  phonePlaceholder: '请输入手机号',
  smsButtonText: '获取验证码',
  clearable: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'sendSms', phone: string): void
  (e: 'phoneBlur', phone: string): void
  (e: 'phoneEnter', phone: string): void
}>()

// 响应式数据
const phoneValue = ref(props.modelValue || '')
const smsCountdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

// 计算属性
const isPhoneValid = computed(() => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phoneValue.value)
})

// 监听器
watch(() => props.modelValue, (newValue) => {
  phoneValue.value = newValue || ''
})

watch(phoneValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// 方法
const handlePhoneInput = () => {
  // 只允许输入数字
  phoneValue.value = phoneValue.value.replace(/\D/g, '')
}

const handlePhoneBlur = () => {
  emit('phoneBlur', phoneValue.value)
}

const handlePhoneEnter = () => {
  emit('phoneEnter', phoneValue.value)
}

const handleSendSms = () => {
  if (isPhoneValid.value && smsCountdown.value === 0) {
    emit('sendSms', phoneValue.value)
    startCountdown()
  }
}

const startCountdown = () => {
  smsCountdown.value = 60
  countdownTimer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.sms-btn {
  border: none;
  background: transparent;
  color: var(--el-color-primary);
  font-size: 12px;
  padding: 0 8px;
  height: 32px;

  &:disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: var(--el-color-primary-light-3);
  }
}
</style>
