import { useEventListener } from '@vueuse/core';
import { reactive, watch } from 'vue';

// 获取浏览器信息
function getBrowser() {
  // 检查是否在浏览器环境中
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return {
      width: 1920,
      screen: 'full' as const,
      isMini: false,
    };
  }
  
  // 在微前端环境下，document.body 可能为 null，需要添加 null 检查
  // 使用 document.body.clientWidth，确保缩放时能正确检测
  const clientWidth = (document.body?.clientWidth) || document.documentElement?.clientWidth || window.innerWidth || 1920;

  // 屏幕信息
  let screen: 'xs' | 'sm' | 'md' | 'xl' | 'full' = 'full';

  if (clientWidth < 768) {
    screen = 'xs';
  } else if (clientWidth < 992) {
    screen = 'sm';
  } else if (clientWidth < 1200) {
    screen = 'md';
  } else if (clientWidth < 1920) {
    screen = 'xl';
  } else {
    screen = 'full';
  }

  // 是否移动端（屏幕宽度 < 768px）
  const isMini = screen === 'xs';

  return {
    width: clientWidth,
    screen,
    isMini,
  };
}

// 使用 reactive 创建一个响应式的浏览器信息对象
const browser = reactive(getBrowser());

// 存储屏幕变化事件的回调函数列表
const events: (() => void)[] = [];

// 监听浏览器屏幕属性的变化
watch(
  () => browser.screen, // 监听屏幕对象
  () => {
    // 当屏幕属性变化时，执行所有注册的回调函数
    events.forEach(ev => ev());
  }
);

// 监听窗口的 resize 事件，更新浏览器信息
if (typeof window !== 'undefined') {
  useEventListener(window, 'resize', () => {
    // 使用 Object.assign 更新响应式对象
    Object.assign(browser, getBrowser());
  });
}

// 导出一个自定义的 hook
export function useBrowser() {
  return {
    browser, // 返回响应式的浏览器信息对象
    // 注册屏幕变化的回调函数
    onScreenChange(ev: () => void, immediate = true) {
      // 将回调函数添加到事件列表
      events.push(ev);

      // 如果 immediate 为 true，立即执行回调函数
      if (immediate) {
        ev();
      }
    }
  };
}

