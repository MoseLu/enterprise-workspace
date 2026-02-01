<template>
  <div class="docs-iframe-wrapper" :class="{ 'is-hidden': !isVisible }">
    <iframe
      v-if="iframeCreated"
      ref="docsIframe"
      :src="iframeSrc"
      frameborder="0"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      class="docs-iframe"
      :class="{ 'is-loaded': iframeLoaded }"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { storage } from '@btc/shared-utils';
import { useI18n, logger } from '@btc/shared-core';

interface Props {
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
});

const route = useRoute();
const docsIframe = ref<HTMLIFrameElement>();
const iframeLoaded = ref(false);
const iframeCreated = ref(false); // 懒加载标记
const iframeSrc = ref(''); // 动态 src
const { locale } = useI18n();

// 动态获取文档服务器地址
const getDocsUrl = () => {
  if (!import.meta.env.DEV) {
    return '/';
  }

  // 开发环境：优先使用环境变量，否则从配置中获取
  const envUrl = import.meta.env.VITE_DOCS_URL;
  if (envUrl) {
    return envUrl;
  }

  // 自动检测当前页面的主机地址
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // 从配置中获取文档应用的端口（docs-app 的开发端口是 4172）
  // 使用同步方式获取配置
  let docsPort = '4172';
  let shouldWarn = false;

  try {
    // 尝试从全局配置中获取（如果已加载）
    if ((window as any).__BTC_APP_CONFIGS__) {
      const docsConfig = (window as any).__BTC_APP_CONFIGS__.find(
        (config: any) => config.appName === 'docs-app'
      );
      if (docsConfig && docsConfig.devPort) {
        docsPort = docsConfig.devPort;
      } else {
        // 配置存在但没有找到 docs-app 的配置
        shouldWarn = true;
      }
    } else {
      // 如果全局配置未加载，尝试直接导入（仅在 system-app 中可用）
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getAppConfig } = require('@btc/shared-core/configs/app-env.config');
        const docsConfig = getAppConfig('docs-app');
        if (docsConfig && docsConfig.devPort) {
          docsPort = docsConfig.devPort;
        } else {
          shouldWarn = true;
        }
      } catch (importError) {
        // 导入失败，可能需要警告
        shouldWarn = true;
      }
    }
  } catch (e) {
    // 如果获取失败，可能需要警告
    shouldWarn = true;
  }

  // 移除警告，因为使用默认端口是正常行为，不需要警告
  // 如果确实需要警告，使用全局标记避免重复警告
  // if (shouldWarn && !(window as any)[GLOBAL_WARN_KEY] && import.meta.env.DEV) {
  //   (window as any)[GLOBAL_WARN_KEY] = true;
  //   console.warn('[DocsIframe] 无法从配置获取端口，使用默认端口 4172');
  // }

  return `${protocol}//${hostname}:${docsPort}/`;
};

const baseUrl = getDocsUrl();

// 动态计算 iframe 的完整 URL
const getIframeUrl = (currentPath: string) => {
  // 简化逻辑：让 VitePress 处理自己的路由
  let docPath = '';

  if (currentPath === '/docs') {
    // /docs -> VitePress 首页
    docPath = '';
  } else if (currentPath.startsWith('/docs/')) {
    // /docs/xxx -> /xxx (移除 /docs 前缀，让 VitePress 处理)
    docPath = currentPath.replace(/^\/docs\/?/, '').replace(/\/$/, '');
  }
  // 注意：移除了对原生 VitePress 路由的支持，只允许通过 /docs 前缀访问

  // 构建完整的 iframe URL
  return docPath ? `${baseUrl}${docPath}` : baseUrl;
};

// 是否可见
const isVisible = computed(() => props.visible);

let syncTimeout: number | null = null;
let lastSyncTheme: boolean | null = null;
let isUpdatingFromIframe = false; // 标记是否正在从 iframe 更新路由

// 隐藏全局 Loading
function hideLoading() {
  const el = document.getElementById('Loading');
  if (el) {
    el.classList.add('is-hide');
  }
}

// iframe 加载完成后同步当前状态
function onIframeLoad() {
  // 立即更新iframe的parent-theme
  const currentTheme = document.documentElement.classList.contains('dark');
  const vueuseTheme = storage.get<string>('vueuse-color-scheme');

  // iframe已加载

  if (docsIframe.value?.contentWindow) {
    try {
      // 发送主题同步消息
      docsIframe.value.contentWindow.postMessage({
        type: 'update-parent-theme',
        value: currentTheme ? 'dark' : 'light'
      }, '*');

      // 同时发送VueUse主题状态
      docsIframe.value.contentWindow.postMessage({
        type: 'update-vueuse-theme',
        value: vueuseTheme || 'light'
      }, '*');

    } catch (e) {
      logger.error('[Main App] Failed to update themes on load:', e);
    }
  }

  syncToIframe();

  // 延迟隐藏 loading，确保内容渲染完成
  setTimeout(() => {
    iframeLoaded.value = true;
    hideLoading();

    // 设置全局状态，标记 iframe 已加载完成（用于路由守卫判断）
    (window as any).__DOCS_IFRAME_LOADED__ = true;

    // iframe加载完成后立即同步主题
    lastSyncTheme = null;
    syncToIframe();

    // 注意：不需要在这里同步路由，因为 iframe 已经通过 URL 加载了正确的页面
  }, 150);
}

// 同步主题和语言到 iframe（防抖 + 防重复）
function syncToIframe() {
  if (!docsIframe.value?.contentWindow) {
    return;
  }

  // 使用VueUse的useDark()来检测主题状态
  const isDark = document.documentElement.classList.contains('dark');

  const vueuseTheme = storage.get<string>('vueuse-color-scheme');

  // 同步主题到iframe
  // 如果主题没有变化，跳过同步
  if (lastSyncTheme === isDark) {
    return;
  }

  // 清除之前的定时器（防抖）
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // 防抖：立即发送，不等待
  syncTimeout = window.setTimeout(() => {

    // 发送主题同步消息
    docsIframe.value!.contentWindow!.postMessage({
      type: 'host:theme',
      value: isDark ? 'dark' : 'light'
    }, '*');

    // 同时发送VueUse主题状态
    docsIframe.value!.contentWindow!.postMessage({
      type: 'update-vueuse-theme',
      value: vueuseTheme || 'light'
    }, '*');

    // 更新parent-theme
    docsIframe.value!.contentWindow!.postMessage({
      type: 'update-parent-theme',
      value: isDark ? 'dark' : 'light'
    }, '*');

    lastSyncTheme = isDark;
    syncTimeout = null;
  }, 10); // 减少防抖时间
}

// 懒加载：首次显示时才创建 iframe
watch(isVisible, (visible) => {
  if (visible && !iframeCreated.value) {
    // 首次显示，创建 iframe
    iframeCreated.value = true;
    // 根据当前路由动态设置 iframe URL
    iframeSrc.value = getIframeUrl(route.path);

    // 重置加载状态
    (window as any).__DOCS_IFRAME_LOADED__ = false;
    iframeLoaded.value = false;

    // 首次加载时，添加 docs-mode 类（路由守卫未处理）
    document.body.classList.add('docs-mode');

    // 立即同步当前主题状态到iframe
    setTimeout(() => {
      lastSyncTheme = null;
      syncToIframe();
    }, 100);
  } else if (visible && iframeCreated.value && iframeLoaded.value) {
    // iframe 已存在且已加载，只需要同步主题状态，不重新加载
    setTimeout(() => {
      lastSyncTheme = null;
      syncToIframe();
    }, 50);
  }

  // 如果 iframe 已加载且重新显示，使用 nextTick 确保在路由守卫后执行
  if (visible && iframeLoaded.value) {
    nextTick(() => {
      // 确保 iframe 已加载完成，立即隐藏 Loading
      hideLoading();
    });
  }

  // 控制事件穿透：隐藏时阻止事件
  if (!visible && docsIframe.value) {
    docsIframe.value.style.pointerEvents = 'none';
  } else if (visible && docsIframe.value) {
    docsIframe.value.style.pointerEvents = 'auto';
  }

  // 隐藏时通知 VitePress 停止不必要的操作（降频）
  if (!visible && docsIframe.value?.contentWindow) {
    docsIframe.value.contentWindow.postMessage({
      type: 'btc-visibility-change',
      visible: false
    }, '*');
  } else if (visible && docsIframe.value?.contentWindow) {
    docsIframe.value.contentWindow.postMessage({
      type: 'btc-visibility-change',
      visible: true
    }, '*');
  }
}, { immediate: true });

// 导航到指定文档（内部路由，不重新加载 iframe）
function navigateToDoc(path: string) {
  if (!docsIframe.value?.contentWindow) {
    return;
  }

  // 通过 postMessage 通知 VitePress 进行内部路由导航
  docsIframe.value.contentWindow.postMessage({
    type: 'btc-navigate',
    path
  }, '*');
}

// 监听语言切换
watch(locale, () => {
  syncToIframe();
});

// 监听 storage 变化（包括主题切换）
function handleStorageChange(e: StorageEvent) {
  if (e.key === 'isDark' || e.key === 'vueuse-color-scheme') {
    syncToIframe();
  }
}

// 监听自定义事件（主题切换器会触发）
function handleThemeChange() {
  // 主题变化事件

  // 立即同步，不需要延迟
  syncToIframe();
}

// 监听VueUse的useDark变化
function handleVueUseThemeChange() {
  // 延迟一点时间，确保DOM更新完成
  setTimeout(() => {
    // 强制同步
    lastSyncTheme = null;
    syncToIframe();
  }, 50);
}

// 监听来自 VitePress 的消息
function handleMessage(event: MessageEvent) {
  if (event.data?.type === 'vitepress-ready') {
    // 重置状态，强制同步
    lastSyncTheme = null;
    syncToIframe();

    // 额外延迟同步，确保VitePress完全加载
    setTimeout(() => {
      lastSyncTheme = null;
      syncToIframe();
    }, 500);
  } else if (event.data?.type === 'vitepress-iframe-ready') {
    // iframe已清理完localStorage，立即同步主题
    lastSyncTheme = null;
    syncToIframe();
  } else if (event.data?.type === 'request-theme-sync') {
    // iframe请求主题同步
    lastSyncTheme = null;
    syncToIframe();
  } else if (event.data?.type === 'vitepress-theme-changed') {
    // VitePress 内部主题切换了，同步回主应用
    const { isDark } = event.data;

    // 更新主应用的 localStorage 和状态
    storage.set('isDark', isDark);
    lastSyncTheme = isDark;

    // 触发主应用的主题切换（通过自定义事件）
    window.dispatchEvent(new CustomEvent('theme-change-from-docs', { detail: { isDark } }));
  } else if (event.data?.type === 'vitepress-clicked') {
    // VitePress 内部被点击，关闭主应用的抽屉（如果打开）
    window.dispatchEvent(new CustomEvent('iframe-clicked'));
  } else if (event.data?.type === 'vitepress-route-restored') {
    // 移除复杂的路由恢复逻辑，让 VitePress 自然处理路由状态
  }
}

// 监听全局搜索导航事件
function handleGlobalSearchNavigate(event: Event) {
  const customEvent = event as CustomEvent;
  const { path } = customEvent.detail;

  if (path) {
    // 先检查是否已经在目标页面
    if (docsIframe.value?.contentWindow) {
      const currentUrl = docsIframe.value.src;
      // 如果已经在目标页面，不需要导航
      if (currentUrl.includes(path)) {
        return;
      }
    }

    navigateToDoc(path);
  }
}

// 移除复杂的路由同步逻辑，让 VitePress 自己处理路由
// VitePress 有完美的原生路由系统，我们不需要干扰它

onMounted(() => {
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('theme-change', handleThemeChange);
  window.addEventListener('locale-change', handleThemeChange);
  window.addEventListener('message', handleMessage);
  window.addEventListener('docs-navigate', handleGlobalSearchNavigate);
  window.addEventListener('message', handleIframeRouteChange);

  // 监听路由变化，更新 iframe URL
  watch(() => route.path, (newPath, oldPath) => {
    // 如果是从 iframe 更新的路由，跳过处理
    if (isUpdatingFromIframe) {
      isUpdatingFromIframe = false;
      return;
    }

    // 检查是否为文档相关路由（只支持 /docs 前缀）
    const isDocsRoute = newPath === '/docs' ||
                       newPath.startsWith('/docs/');

    // 如果是文档路由且 iframe 已创建
    if (isDocsRoute && iframeCreated.value && newPath !== oldPath) {
      // 更新 iframe 的 src，让它直接加载正确的页面
      const newIframeUrl = getIframeUrl(newPath);
      if (iframeSrc.value !== newIframeUrl) {
        iframeSrc.value = newIframeUrl;
        // 重置加载状态，因为 URL 改变了
        iframeLoaded.value = false;
        (window as any).__DOCS_IFRAME_LOADED__ = false;
      }
    }
  }, { immediate: false });

  // 监听 iframe 内部路由变化，同步到主应用
  function handleIframeRouteChange(event: MessageEvent) {
    if (event.origin !== baseUrl.replace(/\/$/, '')) {
      return;
    }

    if (event.data?.type === 'vitepress-route-change') {
      // VitePress 内部路由变化了，同步到主应用
      const { path } = event.data;

      if (path) {
        // 构建主应用路由
        let mainAppPath = '/docs';
        if (path !== '/') {
          // 移除路径末尾的斜线（如果有的话）
          const cleanPath = path.replace(/\/$/, '');
          mainAppPath = `/docs${cleanPath}`;
        }


        // 标记正在从 iframe 更新路由，避免循环
        isUpdatingFromIframe = true;

        // 更新主应用路由，但不触发 iframe 重新加载
        // 使用 replaceState 避免创建新的历史记录
        if (mainAppPath !== window.location.pathname) {
          window.history.replaceState(null, '', mainAppPath);
        }
      }
    }
  }

  // 监听VueUse的useDark变化
  const vueuseTheme = storage.get<string>('vueuse-color-scheme');
  let lastVueuseTheme = vueuseTheme;

  // 定期检查VueUse主题变化
  const checkVueUseTheme = () => {
    const currentVueuseTheme = storage.get<string>('vueuse-color-scheme');
    if (currentVueuseTheme !== lastVueuseTheme) {
      lastVueuseTheme = currentVueuseTheme;
      handleVueUseThemeChange();
    }
  };

  // 每100ms检查一次VueUse主题变化
  const vueuseThemeInterval = setInterval(checkVueUseTheme, 100);

  // 保存interval ID以便清理
  (window as any).__VUEUSE_THEME_INTERVAL__ = vueuseThemeInterval;
});

// docs-mode 类由路由守卫统一管理（避免冲突和重复动画）

onUnmounted(() => {
  document.body.classList.remove('docs-mode');
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('theme-change', handleThemeChange);
  window.removeEventListener('locale-change', handleThemeChange);
  window.removeEventListener('message', handleMessage);
  window.removeEventListener('docs-navigate', handleGlobalSearchNavigate);

  // 清理全局状态
  delete (window as any).__DOCS_IFRAME_LOADED__;

  // 重置加载状态
  iframeLoaded.value = false;

  // 清理VueUse主题检查interval
  const vueuseThemeInterval = (window as any).__VUEUSE_THEME_INTERVAL__;
  if (vueuseThemeInterval) {
    clearInterval(vueuseThemeInterval);
    delete (window as any).__VUEUSE_THEME_INTERVAL__;
  }
});

// 暴露 navigateToDoc 方法给外部使用
defineExpose({
  navigateToDoc
});
</script>

<style scoped lang="scss">
.docs-iframe-wrapper {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color);
  border-radius: 6px;
  overflow: hidden;

  // 隐藏态优化（使用 visibility: hidden 保留DOM以缓存iframe）
  &.is-hidden {
    pointer-events: none; // 事件隔离
    visibility: hidden;   // 对屏幕阅读器隐藏
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }
}

.docs-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 6px;
  display: block;
  background: var(--el-bg-color); // 设置初始背景色，防止白屏
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.is-loaded {
    opacity: 1;
  }
}
</style>

