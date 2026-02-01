/**
 * 禁用自动填充的组合式函数
 * 使用多种方法确保彻底禁用浏览器自动填充
 */
;

import { onMounted, onUnmounted, ref } from 'vue';

export function useDisableAutofill() {
  const observers = ref<MutationObserver[]>([]);

  /**
   * 生成随机的 name 属性
   */
  const generateRandomName = (prefix: string = 'field') => {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  };

  /**
   * 延迟设置输入框类型（针对密码框）
   */
  const delaySetPasswordType = (inputElement: HTMLInputElement) => {
    // 先设置为 text 类型
    inputElement.type = 'text';
    
    // 延迟100ms后改为 password 类型
    setTimeout(() => {
      inputElement.type = 'password';
    }, 100);
  };

  /**
   * 监听输入框并应用反自动填充策略
   */
  const setupInputObserver = (container: HTMLElement) => {
    const inputs = container.querySelectorAll('input[type="password"], input[type="text"]');
    
    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      
      // 设置随机 name 属性
      inputElement.name = generateRandomName(inputElement.type);
      
      // 如果是密码框，使用延迟设置类型的方法
      if (inputElement.type === 'password') {
        delaySetPasswordType(inputElement);
      }
      
      // 监听焦点事件，重新设置属性
      const handleFocus = () => {
        inputElement.name = generateRandomName(inputElement.type);
        inputElement.autocomplete = 'off';
      };
      
      inputElement.addEventListener('focus', handleFocus);
      
      // 清理函数
      const cleanup = () => {
        inputElement.removeEventListener('focus', handleFocus);
      };
      
      // 存储清理函数
      (inputElement as any).__autofillCleanup = cleanup;
    });
  };

  /**
   * 创建 MutationObserver 监听 DOM 变化
   */
  const createDOMObserver = (container: HTMLElement) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // 如果是输入框
            if (element.tagName === 'INPUT') {
              setupInputObserver(element.parentElement || container);
            }
            
            // 如果包含输入框
            if (element.querySelectorAll && typeof element.querySelectorAll === 'function') {
              setupInputObserver(element);
            }
          }
        });
      });
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    return observer;
  };

  /**
   * 初始化自动填充禁用
   */
  const initDisableAutofill = (containerSelector: string = '.auth-page') => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    
    if (!container) {
      console.warn(`Container ${containerSelector} not found`);
      return;
    }
    
    // 立即处理现有的输入框
    setupInputObserver(container);
    
    // 创建观察器监听新添加的输入框
    const observer = createDOMObserver(container);
    observers.value.push(observer);
  };

  /**
   * 清理所有观察器和事件监听器
   */
  const cleanup = () => {
    // 清理 MutationObserver
    observers.value.forEach((observer: MutationObserver) => observer.disconnect());
    observers.value = [];
    
    // 清理输入框事件监听器
    const inputs = document.querySelectorAll('input[type="password"], input[type="text"]');
    inputs.forEach((input) => {
      const cleanup = (input as any).__autofillCleanup;
      if (cleanup) {
        cleanup();
        delete (input as any).__autofillCleanup;
      }
    });
  };

  // Vue 生命周期
  onMounted(() => {
    // 延迟初始化，确保 DOM 已渲染
    setTimeout(() => {
      initDisableAutofill();
    }, 100);
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    generateRandomName,
    delaySetPasswordType,
    initDisableAutofill,
    cleanup
  };
}
