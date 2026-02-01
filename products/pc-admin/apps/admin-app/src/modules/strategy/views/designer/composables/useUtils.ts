import { ref } from 'vue';

/**
 * 工具函数
 */
export function useUtils() {
  // 生成唯一ID
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // DOM 唯一后缀，避免表单控件 id 冲突
  const domUid = ref(generateId());

  return {
    generateId,
    domUid
  };
}

