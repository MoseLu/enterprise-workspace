// 登录标签页逻辑处理

import { ref, Ref } from 'vue';

interface TabsProps {
  currentLoginMode: 'password' | 'sms' | 'qr';
  handleSwitchLoginMode: (mode: 'password' | 'sms' | 'qr') => void;
  t: (key: string, params?: any) => string;
}

export function useTabsLogic(props: TabsProps) {
  // 创建本地refs
  const tabsRef = ref<HTMLDivElement>();
  const tabAccountRef = ref<HTMLButtonElement>();
  const tabPhoneRef = ref<HTMLButtonElement>();
  const inkRef = ref<HTMLElement>();

  // 更新ink位置
  const updateInkPosition = async () => {
    // 如果当前是QR模式，不执行ink位置更新
    if (props.currentLoginMode === 'qr') {
      return;
    }

    const activeTab = props.currentLoginMode === 'password' ? tabAccountRef.value : tabPhoneRef.value;
    const ink = inkRef.value;

    if (activeTab && ink) {
      // 使用 nextTick 确保DOM已完全渲染
      await new Promise(resolve => setTimeout(resolve, 0));

      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = tabsRef.value?.getBoundingClientRect();

      if (containerRect && tabRect.width > 0) {
        // 获取 tabs-container 的边界，因为 ink-bar 是相对于 tabs-container 定位的
        const tabsContainer = activeTab.parentElement;
        const tabsContainerRect = tabsContainer?.getBoundingClientRect();

        if (tabsContainerRect) {
          // 获取 tab 的水平padding（当前设置为 0）
          const horizontalPadding = 0;
          const left = (tabRect.left - tabsContainerRect.left) + horizontalPadding;
          const width = tabRect.width - (2 * horizontalPadding);

          // 第一步：先重置过渡状态，移动到新tab中心位置，宽度设为0
          ink.style.transition = 'none';
          ink.style.transform = `translateX(${left + width / 2}px)`; // 定位到tab中心
          ink.style.width = '0px';
          ink.style.opacity = '1';

          // 第二步：下一帧触发宽度过渡动画，同时移动到tab左边
          requestAnimationFrame(() => {
            ink.style.transition = 'transform .2s ease, width .2s ease';
            ink.style.width = `${width}px`;
            ink.style.transform = `translateX(${left}px)`; // 移动到tab左边
          });
        }
      }
    }
  };

  // 处理tab点击
  const handleTabClick = (mode: 'password' | 'sms') => {
    props.handleSwitchLoginMode(mode);
    // 延迟更新ink位置，确保DOM已更新
    setTimeout(updateInkPosition, 50);
  };

  return {
    tabsRef,
    tabAccountRef,
    tabPhoneRef,
    inkRef,
    handleTabClick,
    updateInkPosition
  };
}
