<template>
  <Teleport to="body" :disabled="false">
    <!-- 开发工具面板 -->
    <div
      v-show="shouldShowDevTools"
      ref="panelRef"
      class="dev-tools"
      :class="{ 'is-open': visible }"
      :data-dev-tools-instance="instanceId"
    >
      <div class="dev-tools__content">
        <el-scrollbar>
          <div class="dev-tools__inner">
            <!-- 只有非操作类型的标签页才显示组件内容 -->
            <component v-if="components[activeTab]" :is="components[activeTab]" />
            <div v-else class="dev-tools__empty">
              <p>点击菜单项进行操作</p>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 菜单栏 -->
      <div class="dev-tools__menu">
        <!-- 切换按钮（集成在菜单中） -->
        <div
          ref="toggleRef"
          class="dev-tools__menu-item dev-tools__toggle"
          :title="visible ? '关闭开发工具' : '打开开发工具'"
          @click="toggle"
        >
          <el-icon :size="visible ? 18 : 16">
            <Setting />
          </el-icon>
        </div>

        <!-- 其他菜单项 -->
        <el-tooltip
          v-for="item in tabList"
          :key="item.value"
          :content="item.tooltip || item.label"
          placement="right"
          :show-after="300"
          :teleported="true"
        >
          <div
            class="dev-tools__menu-item"
            :class="{ 'is-active': item.value === activeTab }"
            @click="switchTab(item.value)"
          >
            <el-icon :size="18">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Setting, Lightning, Switch, Document, InfoFilled } from '@element-plus/icons-vue';
import { getCurrentEnvironment } from '@btc/shared-core';
import ApiSwitch from './ApiSwitch.vue';
import EpsViewer from './EpsViewer.vue';
import EnvInfo from './EnvInfo.vue';

// 注意：清理重复实例的逻辑已移除
// 原因：当组件直接在模板中使用时（如 <BtcDevTools />），没有 data-dev-tools-container 属性
// 清理逻辑可能导致错误地清理正在使用的组件实例
// 如果需要清理重复实例，应该在 mount-dev-tools.ts 中统一处理

// 简单的 cookie 读取函数（不依赖应用特定的工具）
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

// 检查是否为开发环境
const isDev = import.meta.env.DEV;

// 检查是否为允许在生产环境显示 DevTools 的用户
// 从缓存读取用户信息，不调用接口
async function checkAllowedUser(): Promise<boolean> {
  try {
    // 关键：检查用户是否已登录（通过 btc_user cookie 判断），退出登录后不应该加载
    const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
    const user = appStorage?.user?.get?.();
    if (!user) {
      // 没有用户信息，直接返回 false
      return false;
    }

    // 关键：从缓存读取用户信息，不调用接口
    // 接口由主应用在登录时统一调用并存储到缓存
    try {
      const { getProfileInfoFromCache } = await import('@btc/shared-core/utils/profile-info-cache');
      const data = getProfileInfoFromCache();

      if (!data) {
        // 缓存为空，降级：尝试从 cookie 获取
        return checkAllowedUserFromCookie();
      }

      // 优先使用 name 字段（接口返回的字段），不区分大小写
      const userName = (data?.name || '').toLowerCase();

      if (!userName) {
        // 没有用户名，降级：尝试从 cookie 获取
        return checkAllowedUserFromCookie();
      }

      // 检查用户名是否为 moselu（不区分大小写）
      const isAllowed = userName === 'moselu';
      return isAllowed;
    } catch (error) {
      // 降级：如果读取缓存失败，尝试从 cookie 获取
      return checkAllowedUserFromCookie();
    }
  } catch (error) {
    return false;
  }
}

// 降级方案：从 cookie 获取用户信息（向后兼容）
function checkAllowedUserFromCookie(): boolean {
  try {
    const btcUser = getCookie('btc_user');
    if (!btcUser) {
      return false;
    }

    const decodedValue = decodeURIComponent(btcUser);
    const userInfo = JSON.parse(decodedValue);
    const userName = (userInfo?.username || userInfo?.name || '').toLowerCase();
    return userName === 'moselu';
  } catch {
    return false;
  }
}

// 关键：在组件创建时立即检查，而不是等到 onMounted
// 这样可以确保 shouldShowDevTools 在初始渲染时就有正确的值
// 注意：checkAllowedUser 现在是异步的，需要先设置为 false，然后在 onMounted 中更新
const isAllowedUser = ref<boolean>(false);

// 添加实例ID，用于追踪组件实例（需要在 watch 之前定义）
const instanceId = Math.random().toString(36).substring(7);


// 是否显示 DevTools
// 所有应用都显示 DevTools，但必须检查用户（只有 moselu 用户才能看到）
// 无论开发环境还是生产环境，都只对 moselu 用户显示
const shouldShowDevTools = computed(() => {
  // 只有 moselu 用户才能看到 DevTools（无论环境、无论主应用还是子应用）
  if (isAllowedUser.value) {
    return true;
  }
  // 非 moselu 用户不显示
  return false;
});

// 处理 Vite 热重载
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // 热重载处理
  });
}

// 注意：不再在组件内部执行清理逻辑
// 清理逻辑应该在 mountDevTools() 中统一处理，避免组件内部清理导致的问题
// 如果确实需要清理，应该在 mountDevTools() 的最终检查中处理

// MutationObserver 引用，用于监控元素是否被移除
const mutationObserverRef = ref<MutationObserver | null>(null);

// 在组件挂载时检查并更新用户权限（从接口获取）
onMounted(async () => {

  // 添加 MutationObserver 来监控元素是否被移除
  if (isDev && typeof window !== 'undefined' && window.MutationObserver) {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            // 检查被移除的节点是否包含我们的 toggle 元素
            const toggleInRemoved = element.classList?.contains('dev-tools__toggle') ||
                                   !!element.querySelector('.dev-tools__toggle');
            if (toggleInRemoved) {
              // 获取被移除节点的详细信息（用于调试，但当前未使用）
              // const removedNodeInfo = {
              //   tagName: element.tagName,
              //   className: element.className,
              //   id: element.id,
              //   dataset: element.dataset,
              //   outerHTML: element.outerHTML?.substring(0, 200), // 限制长度
              // };

              // 获取父节点的信息（用于调试，但当前未使用）
              // const parentInfo = mutation.target ? {
              //   tagName: (mutation.target as HTMLElement).tagName,
              //   className: (mutation.target as HTMLElement).className,
              //   id: (mutation.target as HTMLElement).id,
              // } : null;

              // 检查是否有 Vue 的标记（用于调试，但当前未使用）
              // const vueInstance = (element as any).__vueParentComponent;
            }
          }
        });
      });
    });

    // 开始观察 body 的变化
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    mutationObserverRef.value = mutationObserver;
  }

  try {
    const isAllowed = await checkAllowedUser();

    // 关键：只有在组件仍然挂载时才更新状态
    // 使用 nextTick 确保在下一个事件循环中更新，避免与组件生命周期冲突
    await nextTick();
    isAllowedUser.value = isAllowed;
  } catch (error) {
    // 检查失败时，保持 isAllowedUser 为 false
    isAllowedUser.value = false;
  }

  // 调试：检查 DOM 元素是否存在，并检查样式
  // 关键：使用多个 nextTick 确保 Teleport 已完成渲染
  if (isDev) {
    nextTick(() => {
      nextTick(() => {
        // 再次延迟一点，确保 DOM 完全更新
        setTimeout(() => {
          const toggleElement = document.querySelector('.dev-tools__toggle') as HTMLElement;
          if (toggleElement) {
            const styles = window.getComputedStyle(toggleElement);
            const rect = toggleElement.getBoundingClientRect();

            // 如果元素存在但不可见，尝试强制显示
            if (rect.width === 0 || rect.height === 0 || styles.display === 'none' || styles.visibility === 'hidden' || parseFloat(styles.opacity) === 0) {
              toggleElement.style.setProperty('display', 'flex', 'important');
              toggleElement.style.setProperty('visibility', 'visible', 'important');
              toggleElement.style.setProperty('opacity', '1', 'important');
              toggleElement.style.setProperty('width', '36px', 'important');
              toggleElement.style.setProperty('height', '36px', 'important');
              toggleElement.style.setProperty('background-color', '#409eff', 'important');
            }
          }
        }, 100);
      });
    });
  }
});

// 监听组件卸载
onBeforeUnmount(() => {
  // 清理 MutationObserver
  if (mutationObserverRef.value) {
    mutationObserverRef.value.disconnect();
    mutationObserverRef.value = null;
  }
});

// 监听组件销毁
onUnmounted(() => {
  // 组件已卸载
});

// 开发环境下，监听 shouldShowDevTools 的变化
if (isDev) {
  watch(shouldShowDevTools, (newVal, oldVal) => {
    // 如果从 false 变为 true，检查元素是否被正确渲染，并启动持续监控
    if (oldVal === false && newVal === true) {
      // 等待 DOM 更新
      nextTick(() => {
        nextTick(() => {
          setTimeout(() => {
            const toggleElement = document.querySelector('.dev-tools__toggle') as HTMLElement;
            if (toggleElement) {
              const styles = window.getComputedStyle(toggleElement);
              // 如果元素被隐藏（v-show 可能还没有生效），强制显示
              if (styles.display === 'none') {
                toggleElement.style.setProperty('display', 'flex', 'important');
              }

              // 启动持续监控，检查元素是否消失
              let checkCount = 0;
              const maxChecks = 20; // 监控 2 秒（每 100ms 检查一次）
              const monitorInterval = setInterval(() => {
                checkCount++;
                const currentElement = document.querySelector('.dev-tools__toggle') as HTMLElement;
                const currentShouldShow = shouldShowDevTools.value;
                const currentIsAllowed = isAllowedUser.value;

                if (!currentElement) {
                  // 尝试通过强制更新来恢复元素（如果组件仍然存在）
                  if (currentShouldShow && currentIsAllowed) {
                    // 不尝试恢复，因为如果 Teleport 被清理，手动恢复可能会导致问题
                    // 应该找出为什么 Teleport 被清理的根本原因
                  }

                  clearInterval(monitorInterval);
                } else if (!currentShouldShow || !currentIsAllowed) {
                  clearInterval(monitorInterval);
                } else if (checkCount >= maxChecks) {
                  clearInterval(monitorInterval);
                }
              }, 100);
            }
          }, 50);
        });
      });
    }
  }, { immediate: true });
}

const components: Record<string, any> = {
  env: EnvInfo,
  api: ApiSwitch,
  eps: EpsViewer,
};

const tabList = [
  {
    label: '系统信息',
    value: 'env',
    icon: InfoFilled,
    tooltip: '系统信息 - 查看当前运行环境和应用信息',
    isAction: false, // 显示组件内容
  },
  {
    label: '环境切换',
    value: 'api',
    icon: Switch,
    tooltip: '环境切换 - 在开发环境（10.80.9.76:8115）和生产环境（api.bellis.com.cn）之间切换',
    isAction: false, // 显示组件内容
  },
  {
    label: 'EPS',
    value: 'eps',
    icon: Lightning,
    tooltip: 'EPS - 查看所有后端 API 端点列表，支持搜索和浏览',
    isAction: false, // 显示组件内容
  },
  {
    label: '文档中心',
    value: 'docs',
    icon: Document,
    tooltip: '文档中心 - 系统使用指南和API文档',
    isAction: true, // 直接跳转
    action: () => {
      // 使用统一的环境检测函数
      const env = getCurrentEnvironment();
      
      // 生产环境或测试环境：跳转到子域名（无论是主域名还是子域名，都跳转到 docs.bellis.com.cn）
      // 开发环境或预览环境：跳转到路径
      // 关键：跳转到子域名时，只跳转到根路径，不包含当前路径
      let targetUrl: string;
      if (env === 'production' || env === 'test') {
        const protocol = window.location.protocol;
        // 测试环境使用测试子域名，生产环境使用生产子域名
        if (env === 'test') {
          targetUrl = `${protocol}//docs.test.bellis.com.cn/`;
        } else {
          targetUrl = `${protocol}//docs.bellis.com.cn/`;
        }
      } else {
        // 开发环境或预览环境：构建完整的 URL
        const protocol = window.location.protocol;
        const host = window.location.host;
        targetUrl = `${protocol}//${host}/docs`;
      }

      // 在新标签页打开，而不是原标签跳转
      window.open(targetUrl, '_blank');
      visible.value = false;
    },
  },
];

const activeTab = ref('env');
const visible = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const toggleRef = ref<HTMLElement | null>(null);

function switchTab(tab: string) {
  const tabItem = tabList.find(item => item.value === tab);
  if (tabItem?.isAction && tabItem.action) {
    // 如果是操作项，执行操作（跳转）
    tabItem.action();
  } else {
    // 否则切换标签页显示内容
    activeTab.value = tab;
  }
}

function toggle() {
  visible.value = !visible.value;
}

// 点击外部区域自动关闭面板
// 注意：切换按钮现在在面板内部，所以不需要 ignore
onClickOutside(
  panelRef as any,
  () => {
    if (visible.value) {
      visible.value = false;
    }
  }
);
</script>

<style lang="scss" scoped>
.dev-tools {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 2000;
  transition: all 0.3s;

  // 关闭状态：只显示悬浮按钮
  &:not(.is-open) {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    .dev-tools__content {
      display: none;
    }

    .dev-tools__menu {
      border: none;
      padding: 0;
      width: 36px;
      min-width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dev-tools__menu-item:not(.dev-tools__toggle) {
      display: none;
    }

    .dev-tools__toggle {
      border-radius: 50%;
      background-color: var(--el-color-primary, #409eff);
      border: 2px solid #fff;
      cursor: pointer;
      height: 36px;
      width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      margin: 0;
      color: #fff;

      &:hover {
        background-color: var(--el-color-primary-light-3);
        transform: scale(1.1);
      }
    }
  }

  // 打开状态：显示完整面板
  &.is-open {
    background-color: var(--el-bg-color);
    border-radius: 12px;
    border: 1px solid var(--el-border-color-light);
    height: 400px;
    width: 600px;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
    display: flex;
    color: var(--el-text-color-primary);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    .dev-tools__content {
      display: block;
    }

    .dev-tools__toggle {
      border-radius: 8px;
      background-color: transparent;
      border: none;
      height: 34px;
      width: 34px;
      margin: 5px 0 0 0;
      box-shadow: none;
      color: var(--el-text-color-secondary);

      &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
        transform: scale(1);
      }
    }
  }

  &__content {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  &__inner {
    padding: 16px;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  &__menu {
    border-left: 1px solid var(--el-border-color-extra-light);
    padding: 8px 0;
    width: 50px;
    min-width: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    width: 34px;
    cursor: pointer;
    border-radius: 8px;
    margin: 5px 0 0 0;
    color: var(--el-text-color-secondary);
    transition: all 0.3s;
    flex-shrink: 0;
    position: relative;
    z-index: 1;

    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }

    &.is-active {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
  }
}
</style>

