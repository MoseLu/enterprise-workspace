/**
 * 表单 Enter 键处理 Composable
 * 提供通用的 Enter 键处理逻辑：
 * - 按 Enter 键时聚焦下一个表单项
 * - 如果是最后一个表单项，则提交表单
 */

import { nextTick, type Ref } from 'vue';
import type { FormInstance } from 'element-plus';

export interface UseFormEnterKeyOptions {
  /**
   * 表单实例引用
   */
  formRef: Ref<FormInstance | undefined>;
  /**
   * 提交表单的回调函数
   */
  onSubmit: () => void | Promise<void>;
  /**
   * 自定义输入元素选择器（默认查找所有可聚焦的输入元素）
   */
  inputSelector?: string;
  /**
   * 是否跳过禁用的输入框（默认：true）
   */
  skipDisabled?: boolean;
}

/**
 * 表单 Enter 键处理 Composable
 * @param options 配置选项
 * @returns 处理 Enter 键的方法
 */
export function useFormEnterKey(options: UseFormEnterKeyOptions) {
  const { formRef, onSubmit, inputSelector = 'input, textarea, select', skipDisabled = true } = options;

  /**
   * 获取表单中所有可聚焦的输入元素
   */
  function getInputElements(): HTMLElement[] {
    if (!formRef.value) return [];

    const formElement = formRef.value.$el as HTMLElement;
    if (!formElement) return [];

    const inputs = Array.from(formElement.querySelectorAll(inputSelector)) as HTMLElement[];
    
    // 过滤掉禁用的元素
    if (skipDisabled) {
      return inputs.filter((el) => {
        const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        return !input.disabled && !input.hasAttribute('disabled');
      });
    }

    return inputs;
  }

  /**
   * 处理 Enter 键事件
   * @param event 键盘事件
   * @param currentElement 当前触发事件的元素
   */
  async function handleEnterKey(event: KeyboardEvent, currentElement?: HTMLElement) {
    // 只在按下 Enter 键时处理（排除 Shift+Enter 等组合键）
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    
    // 阻止默认行为和事件冒泡，防止触发表单的原生 submit 事件
    event.preventDefault();
    event.stopPropagation();

    const target = (currentElement || event.target) as HTMLElement;
    if (!target) return;

    // 获取所有可聚焦的输入元素
    const inputs = getInputElements();
    if (inputs.length === 0) return;

    // 查找当前元素在列表中的索引
    let currentIndex = -1;
    for (let i = 0; i < inputs.length; i++) {
      // 检查是否是目标元素或其子元素（Element Plus 的输入框可能是嵌套的）
      const input = inputs[i];
      if (input && (input.contains(target) || input === target)) {
        currentIndex = i;
        break;
      }
    }

    // 如果找不到当前元素，尝试直接匹配
    if (currentIndex === -1) {
      currentIndex = inputs.findIndex((el) => el === target || el.querySelector('input') === target);
    }

    // 如果仍然找不到，可能是自定义组件（如短信验证码输入框）
    // 尝试通过查找最接近的可聚焦元素
    if (currentIndex === -1) {
      const rect = target.getBoundingClientRect();
      let closestIndex = -1;
      let minDistance = Infinity;

      inputs.forEach((input, index) => {
        const inputRect = input.getBoundingClientRect();
        const distance = Math.abs(rect.top - inputRect.top);
        if (distance < minDistance && rect.top <= inputRect.top) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      currentIndex = closestIndex >= 0 ? closestIndex : inputs.length - 1;
    }

    // 如果是最后一个输入框，提交表单
    if (currentIndex >= 0 && currentIndex === inputs.length - 1) {
      event.preventDefault();
      event.stopPropagation(); // 阻止事件冒泡，防止触发表单的原生 submit 事件
      await onSubmit();
      return;
    }

    // 否则聚焦下一个输入框
    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      event.preventDefault();
      await nextTick();
      
      const nextInput = inputs[currentIndex + 1];
      if (nextInput) {
        // 对于 Element Plus 的输入框，可能需要聚焦内部的 input 元素
        const innerInput = nextInput.querySelector('input') || nextInput.querySelector('textarea') || nextInput;
        if (innerInput && typeof (innerInput as HTMLInputElement).focus === 'function') {
          (innerInput as HTMLInputElement).focus();
        } else if (typeof nextInput.focus === 'function') {
          nextInput.focus();
        }
      }
    }
  }

  return {
    handleEnterKey,
    getInputElements
  };
}
