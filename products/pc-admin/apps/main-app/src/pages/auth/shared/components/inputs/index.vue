<template>
  <div class="sms-code-input">
    <div
      v-for="(item, index) in codes"
      :key="index"
      class="code-box"
      :class="{ 'active': currentIndex === index, 'filled': item }"
    >
      <input
        :ref="el => setInputRef(el as HTMLInputElement, index)"
        v-model="codes[index]"
        type="text"
        maxlength="1"
        :disabled="props.disabled"
        @input="handleInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste"
        @focus="currentIndex = index"
        @blur="currentIndex = -1"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';

defineOptions({
  name: 'SmsCodeInput'
});

interface Props {
  modelValue?: string;
  length?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  length: 6,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'complete': [value: string];
}>();

// 验证码数组
const codes = ref<string[]>(new Array(props.length).fill(''));
// 当前聚焦的输入框索引
const currentIndex = ref(-1);
// 输入框引用
const inputRefs = ref<HTMLInputElement[]>([]);

// 设置input引用
function setInputRef(el: HTMLInputElement | null, index: number) {
  if (el) {
    inputRefs.value[index] = el;
  }
}

// 处理输入
function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  // 只允许数字
  if (!/^\d*$/.test(value)) {
    value = value.replace(/\D/g, '');
    target.value = value;
    codes.value[index] = value;
    return;
  }

  // 更新值
  codes.value[index] = value;
  emitValue();

  // 如果输入了数字且不是最后一位，自动跳转到下一位
  if (value && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus();
    });
  }

  // 检查是否完成输入
  checkComplete();
}

// 处理键盘事件
function handleKeydown(index: number, event: KeyboardEvent) {
  const { key } = event;

  // 删除键
  if (key === 'Backspace') {
    if (!codes.value[index] && index > 0) {
      // 当前位置为空，跳转到前一位
      nextTick(() => {
        inputRefs.value[index - 1]?.focus();
      });
    } else {
      // 清空当前位置
      codes.value[index] = '';
      emitValue();
    }
  }

  // 方向键
  if (key === 'ArrowLeft' && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus();
    });
  }

  if (key === 'ArrowRight' && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus();
    });
  }

  // 阻止非数字字符
  if (!/^\d$/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
    event.preventDefault();
  }
}

// 处理粘贴
function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const numbers = pasteData.replace(/\D/g, '');

  if (numbers.length > 0) {
    // 填充验证码
    for (let i = 0; i < Math.min(numbers.length, props.length); i++) {
      codes.value[i] = numbers[i];
    }

    emitValue();
    checkComplete();

    // 跳转到下一个空位或最后一位
    const nextIndex = Math.min(numbers.length, props.length - 1);
    nextTick(() => {
      inputRefs.value[nextIndex]?.focus();
    });
  }
}

// 发送值
function emitValue() {
  const value = codes.value.join('');
  emit('update:modelValue', value);
}

// 检查是否完成输入
function checkComplete() {
  const value = codes.value.join('');
  if (value.length === props.length) {
    emit('complete', value);
  }
}

// 清空输入
function clearInput() {
  codes.value = new Array(props.length).fill('');
  emitValue();
  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
}

// 聚焦第一个输入框
function focus() {
  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== codes.value.join('')) {
      // 确保 newValue 是字符串
      const stringValue = String(newValue || '');
      const newCodes = stringValue.split('').slice(0, props.length);
      codes.value = [...newCodes, ...new Array(props.length - newCodes.length).fill('')];
    }
  },
  { immediate: true }
);

// 暴露方法
defineExpose({
  clearInput,
  focus
});
</script>

<style lang="scss" scoped>
.sms-code-input {
  display: flex;
  gap: 8px;
  justify-content: space-between; /* 左右对齐 */
  align-items: center;
  width: 100%;

  .code-box {
    position: relative;
    width: 45px; /* 正方形，与高度一致 */
    height: 45px; /* 与手机号输入框高度一致 */
    border: 2px solid var(--el-border-color);
    border-radius: 8px;
    background-color: var(--el-bg-color);
    transition: all 0.3s ease;

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &.filled {
      border-color: var(--el-color-primary);
      background-color: rgba(64, 158, 255, 0.05);
    }

    input {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      caret-color: var(--el-color-primary);

      &:disabled {
        background-color: var(--el-disabled-bg-color);
        color: var(--el-disabled-text-color);
        cursor: not-allowed;
      }

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sms-code-input {
    gap: 6px;

    .code-box {
      width: 40px; /* 正方形 */
      height: 40px; /* 正方形 */

      input {
        font-size: 16px;
      }
    }
  }
}

@media (max-width: 480px) {
  .sms-code-input {
    gap: 4px;

    .code-box {
      width: 36px; /* 正方形 */
      height: 36px; /* 正方形 */

      input {
        font-size: 14px;
      }
    }
  }
}
</style>
