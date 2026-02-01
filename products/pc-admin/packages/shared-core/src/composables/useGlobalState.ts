/**
 * 全局状态管理器（统一中间层）
 * 封装 qiankun globalState 的初始化、访问和监听逻辑
 * 确保所有应用都通过这个中间层使用全局状态，避免重复注册和未初始化问题
 */
;

import { ref, onUnmounted } from 'vue';
import { logger } from '../utils/logger/index';

/**
 * qiankun 全局状态操作接口（本地定义，避免依赖 qiankun 类型）
 */
export interface MicroAppStateActions {
  onGlobalStateChange: (
    callback: (state: Record<string, any>, prev?: Record<string, any>) => void,
    fireImmediately?: boolean
  ) => (() => void) | void;
  setGlobalState: (state: Record<string, any>) => boolean;
  offGlobalStateChange: (callback?: (() => void) | void) => void;
  getGlobalState: () => Record<string, any>;
}

/**
 * 全局状态初始化状态
 */
const initState = {
  isInitialized: false,
  isInitializing: false,
  globalState: null as MicroAppStateActions | null,
  waitingCallbacks: [] as Array<() => void>,
};

/**
 * 已注册的监听器映射（key: 监听器ID, value: { listener: 回调函数, unsubscribe: 取消函数 }）
 * 注意：qiankun 限制每个应用只能有一个全局监听器，所以我们使用一个统一监听器，内部管理多个回调
 */
const listenerCallbacks = new Map<string, (state: Record<string, any>, prev?: Record<string, any>) => void>();

/**
 * 统一监听器（仅注册一次到 qiankun）
 */
let unifiedUnsubscribe: (() => void) | null = null;
let isUnifiedListenerRegistered = false;

/**
 * 监听器计数器（用于生成唯一ID）
 */
let listenerIdCounter = 0;

/**
 * 初始化全局状态（仅主应用调用）
 * @param globalState qiankun globalState 实例
 */
export function initGlobalStateManager(globalState: MicroAppStateActions) {
  if (initState.isInitialized) {
    if (import.meta.env.DEV) {
      console.warn('[GlobalStateManager] 全局状态已经被初始化，跳过重复初始化');
    }
    return;
  }

  if (initState.isInitializing) {
    // 如果正在初始化，等待完成
    return new Promise<void>((resolve) => {
      const checkInit = () => {
        if (initState.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInit, 10);
        }
      };
      checkInit();
    });
  }

  initState.isInitializing = true;

  try {
    // 挂载到全局
    (window as any).globalState = globalState;
    initState.globalState = globalState;
    initState.isInitialized = true;
    initState.isInitializing = false;

    // 执行所有等待的回调
    initState.waitingCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        logger.error('[GlobalStateManager] 执行等待回调失败:', error);
      }
    });
    initState.waitingCallbacks = [];
  } catch (error) {
    initState.isInitializing = false;
    logger.error('[GlobalStateManager] 初始化全局状态失败:', error);
    throw error;
  }
}

/**
 * 获取全局状态实例（自动等待初始化）
 * @returns globalState 实例，如果未初始化则返回 null
 */
export function getGlobalState(): MicroAppStateActions | null {
  // 优先从管理器获取
  if (initState.globalState) {
    return initState.globalState;
  }

  // 兼容性：尝试从 window 获取（可能是直接初始化的）
  const windowGlobalState = (window as any).globalState;
  if (windowGlobalState && typeof windowGlobalState.setGlobalState === 'function') {
    // 如果从 window 获取到，同步到管理器
    if (!initState.isInitialized) {
      initState.globalState = windowGlobalState;
      initState.isInitialized = true;
    }
    return windowGlobalState;
  }

  return null;
}

/**
 * 等待全局状态初始化完成
 * @param timeout 超时时间（毫秒），默认 5000ms
 * @returns Promise<MicroAppStateActions | null>
 */
export function waitForGlobalState(timeout = 5000): Promise<MicroAppStateActions | null> {
  return new Promise((resolve) => {
    // 如果已经初始化，直接返回
    if (initState.isInitialized && initState.globalState) {
      resolve(initState.globalState);
      return;
    }

    // 如果正在初始化，等待完成
    if (initState.isInitializing) {
      const checkInit = () => {
        if (initState.isInitialized && initState.globalState) {
          resolve(initState.globalState);
        } else {
          setTimeout(checkInit, 10);
        }
      };
      checkInit();
      return;
    }

    // 尝试从 window 获取
    const windowGlobalState = (window as any).globalState;
    if (windowGlobalState && typeof windowGlobalState.setGlobalState === 'function') {
      initState.globalState = windowGlobalState;
      initState.isInitialized = true;
      resolve(windowGlobalState);
      return;
    }

    // 否则等待初始化
    const startTime = Date.now();
    const checkInit = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > timeout) {
        if (import.meta.env.DEV) {
          console.warn('[GlobalStateManager] 等待全局状态初始化超时');
        }
        resolve(null);
        return;
      }

      if (initState.isInitialized && initState.globalState) {
        resolve(initState.globalState);
      } else {
        // 再次尝试从 window 获取（可能是异步初始化的）
        const windowGlobalState = (window as any).globalState;
        if (windowGlobalState && typeof windowGlobalState.setGlobalState === 'function') {
          initState.globalState = windowGlobalState;
          initState.isInitialized = true;
          resolve(windowGlobalState);
        } else {
          setTimeout(checkInit, 50);
        }
      }
    };
    checkInit();
  });
}

/**
 * 设置全局状态
 * @param state 要设置的状态
 * @param waitInit 是否等待初始化（默认 true）
 */
export async function setGlobalState(
  state: Record<string, any>,
  waitInit = true
): Promise<boolean> {
  const globalState = waitInit ? await waitForGlobalState() : getGlobalState();
  
  if (!globalState) {
    if (import.meta.env.DEV) {
      console.warn('[GlobalStateManager] globalState 未初始化，无法设置状态');
    }
    return false;
  }

  try {
    globalState.setGlobalState(state);
    return true;
  } catch (error) {
    logger.error('[GlobalStateManager] 设置全局状态失败:', error);
    return false;
  }
}

/**
 * 获取全局状态（同步）
 * @returns 当前全局状态，如果未初始化则返回 null
 */
export function getGlobalStateValue(): Record<string, any> | null {
  const globalState = getGlobalState();
  
  if (!globalState || typeof globalState.getGlobalState !== 'function') {
    return null;
  }

  try {
    return globalState.getGlobalState();
  } catch (error) {
    logger.error('[GlobalStateManager] 获取全局状态失败:', error);
    return null;
  }
}

/**
 * 统一监听器回调（分发给所有注册的回调）
 */
function unifiedListenerCallback(state: Record<string, any>, prev?: Record<string, any>) {
  listenerCallbacks.forEach((callback) => {
    try {
      callback(state, prev);
    } catch (error) {
      logger.error('[GlobalStateManager] 执行监听回调失败:', error);
    }
  });
}

/**
 * 注册统一监听器（仅注册一次到 qiankun）
 */
function registerUnifiedListener(globalState: MicroAppStateActions, fireImmediately = false): boolean {
  // 如果已经注册，直接返回（不重复注册）
  if (isUnifiedListenerRegistered) {
    // 如果要求立即触发，手动调用一次（因为已经注册过了，不会自动触发）
    if (fireImmediately) {
      const currentState = getGlobalStateValue();
      if (currentState) {
        try {
          unifiedListenerCallback(currentState, currentState);
        } catch (error) {
          logger.error('[GlobalStateManager] 立即触发统一监听器回调失败:', error);
        }
      }
    }
    return true;
  }

  // 检查 qiankun 是否已经注册了监听器
  // qiankun 会在 globalState 对象上存储监听器信息（不同版本可能字段名不同）
  // 如果已经注册，我们不应该再次注册，而是复用现有的监听器
  const qiankunState = globalState as any;
  const hasExistingListener = 
    (qiankunState._listeners && Array.isArray(qiankunState._listeners) && qiankunState._listeners.length > 0) ||
    (qiankunState.listeners && Array.isArray(qiankunState.listeners) && qiankunState.listeners.length > 0) ||
    (qiankunState._callbacks && Array.isArray(qiankunState._callbacks) && qiankunState._callbacks.length > 0) ||
    // 检查 qiankun 内部存储的监听器 Map（某些版本使用 Map 存储）
    (qiankunState._listenersMap && qiankunState._listenersMap instanceof Map && qiankunState._listenersMap.size > 0) ||
    (qiankunState.listenersMap && qiankunState.listenersMap instanceof Map && qiankunState.listenersMap.size > 0);
  
  if (hasExistingListener) {
    // qiankun 已经注册了监听器，我们标记为已注册，但不重复注册
    // 这种情况下，我们需要手动触发一次回调（如果要求立即触发）
    if (fireImmediately) {
      const currentState = getGlobalStateValue();
      if (currentState) {
        try {
          unifiedListenerCallback(currentState, currentState);
        } catch (error) {
          logger.error('[GlobalStateManager] 立即触发统一监听器回调失败:', error);
        }
      }
    }
    // 标记为已注册，但不实际注册（避免重复注册警告）
    isUnifiedListenerRegistered = true;
    // 注意：这种情况下，我们无法获取取消函数，所以 unifiedUnsubscribe 保持为 null
    // 这是可以接受的，因为 qiankun 会管理现有的监听器
    return true;
  }

  try {
    const result = globalState.onGlobalStateChange(unifiedListenerCallback, fireImmediately);
    // qiankun 的 onGlobalStateChange 可能返回取消函数，也可能不返回
    unifiedUnsubscribe = typeof result === 'function' ? result : (() => {
      // 如果没有返回取消函数，尝试使用 offGlobalStateChange
      if (typeof globalState.offGlobalStateChange === 'function') {
        globalState.offGlobalStateChange();
      }
    });
    isUnifiedListenerRegistered = true;
    return true;
  } catch (error) {
    logger.error('[GlobalStateManager] 注册统一监听器失败:', error);
    return false;
  }
}

/**
 * 注册全局状态监听器（防止重复注册）
 * @param listener 监听器函数
 * @param fireImmediately 是否立即触发一次（默认 false）
 * @param listenerKey 监听器唯一标识（可选，如果不提供则自动生成）
 * @returns 取消监听的函数
 */
export function onGlobalStateChange(
  listener: (state: Record<string, any>, prev?: Record<string, any>) => void,
  fireImmediately = false,
  listenerKey?: string
): (() => void) | null {
  const globalState = getGlobalState();
  
  if (!globalState || typeof globalState.onGlobalStateChange !== 'function') {
    // 如果未初始化，等待初始化后再注册
    if (!listenerKey) {
      listenerIdCounter++;
      listenerKey = `listener-${listenerIdCounter}`;
    }

    // 将回调添加到等待队列
    const registerWhenReady = () => {
      const actualGlobalState = getGlobalState();
      if (actualGlobalState && typeof actualGlobalState.onGlobalStateChange === 'function') {
        // 注册统一监听器（如果还没有注册）
        registerUnifiedListener(actualGlobalState, fireImmediately);
        // 添加回调到映射
        listenerCallbacks.set(listenerKey!, listener);
        // 如果要求立即触发，手动调用一次
        if (fireImmediately) {
          const currentState = getGlobalStateValue();
          if (currentState) {
            try {
              listener(currentState, currentState);
            } catch (error) {
              logger.error('[GlobalStateManager] 立即触发回调失败:', error);
            }
          }
        }
      }
    };

    // 如果有等待中的回调，添加到队列
    if (!initState.isInitialized) {
      initState.waitingCallbacks.push(registerWhenReady);
    } else {
      // 立即尝试注册
      registerWhenReady();
    }

    // 返回取消函数
    return () => {
      listenerCallbacks.delete(listenerKey!);
      // 如果没有回调了，取消统一监听器
      if (listenerCallbacks.size === 0 && unifiedUnsubscribe) {
        try {
          unifiedUnsubscribe();
        } catch (error) {
          logger.error('[GlobalStateManager] 取消统一监听失败:', error);
        }
        unifiedUnsubscribe = null;
        isUnifiedListenerRegistered = false;
      }
    };
  }

  // 如果已经注册过相同 key 的回调，先移除旧的
  if (listenerKey && listenerCallbacks.has(listenerKey)) {
    listenerCallbacks.delete(listenerKey);
  }

  // 生成唯一 key（如果没有提供）
  if (!listenerKey) {
    listenerIdCounter++;
    listenerKey = `listener-${listenerIdCounter}`;
  }

  // 注册统一监听器（如果还没有注册）
  const registered = registerUnifiedListener(globalState, fireImmediately);
  if (!registered) {
    return null;
  }

  // 添加回调到映射
  listenerCallbacks.set(listenerKey, listener);

  // 如果要求立即触发，手动调用一次
  if (fireImmediately) {
    const currentState = getGlobalStateValue();
    if (currentState) {
      try {
        listener(currentState, currentState);
      } catch (error) {
        logger.error('[GlobalStateManager] 立即触发回调失败:', error);
      }
    }
  }
  
  // 返回取消函数
  return () => {
    listenerCallbacks.delete(listenerKey!);
    // 如果没有回调了，取消统一监听器
    if (listenerCallbacks.size === 0 && unifiedUnsubscribe) {
      try {
        unifiedUnsubscribe();
      } catch (error) {
        logger.error('[GlobalStateManager] 取消统一监听失败:', error);
      }
      unifiedUnsubscribe = null;
      isUnifiedListenerRegistered = false;
    }
  };
}

/**
 * 清理所有监听器
 */
export function cleanupAllListeners() {
  // 清理所有回调
  listenerCallbacks.clear();
  
  // 取消统一监听器
  if (unifiedUnsubscribe) {
    try {
      unifiedUnsubscribe();
    } catch (error) {
      logger.error('[GlobalStateManager] 清理统一监听器失败:', error);
    }
    unifiedUnsubscribe = null;
    isUnifiedListenerRegistered = false;
  }
}

/**
 * 使用全局状态的 Composable（Vue 3）
 * @param listenerKey 监听器唯一标识（可选）
 * @returns 全局状态相关的 API
 */
export function useGlobalState(listenerKey?: string) {
  const state = ref<Record<string, any>>({});
  const isReady = ref(false);

  let unsubscribe: (() => void) | null = null;

  // 等待初始化并注册监听器
  waitForGlobalState().then((globalState) => {
    if (!globalState) {
      return;
    }

    isReady.value = true;

    // 同步初始状态
    const currentState = getGlobalStateValue();
    if (currentState) {
      state.value = currentState;
    }

    // 注册监听器
    unsubscribe = onGlobalStateChange(
      (newState) => {
        state.value = { ...newState };
      },
      true, // 立即触发一次
      listenerKey
    );
  });

  // 组件卸载时取消监听
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  });

  return {
    state,
    isReady,
    setGlobalState: (newState: Record<string, any>) => setGlobalState(newState),
    getGlobalState: getGlobalStateValue,
  };
}

/**
 * 检查全局状态是否已初始化
 */
export function isGlobalStateInitialized(): boolean {
  return initState.isInitialized || !!(window as any).globalState;
}

