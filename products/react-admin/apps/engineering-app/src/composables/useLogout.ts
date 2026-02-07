import { useEventEmitter } from '@vueuse/core';
import { getLogoutCallback, logger } from '@btc/shared-core';

/**
 * 设置退出登录监听
 */
export function useLogout() {
  const emitter = (window as any).__APP_EMITTER__;

  const handleLogout = () => {
    logger.info('[engineering-app] 收到退出登录事件');

    // 获取退出登录回调函数
    const logoutCallback = getLogoutCallback();

    if (typeof logoutCallback === 'function') {
      logoutCallback();
    } else {
      // 如果没有回调，跳转到登录页
      window.location.reload();
    }
  };

  onMounted(() => {
    if (emitter) {
      emitter.on('logout', handleLogout);
    }
  });

  onUnmounted(() => {
    if (emitter) {
      emitter.off('logout', handleLogout);
    }
  });
}
