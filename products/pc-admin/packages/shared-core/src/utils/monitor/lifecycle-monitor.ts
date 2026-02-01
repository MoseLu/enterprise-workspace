/**
 * 应用生命周期监控
 * 监控应用启动、挂载、卸载等关键节点
 */

import type { AppLifecycleEventType, AppLifecycleEventData } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 生命周期事件时间戳记录
 */
const lifecycleTimestamps: Map<string, number> = new Map();

/**
 * 记录生命周期事件开始时间
 */
function recordLifecycleStart(eventType: AppLifecycleEventType): void {
  const key = `${eventType}:start`;
  lifecycleTimestamps.set(key, performance.now());
}

/**
 * 记录生命周期事件结束时间
 */
function recordLifecycleEnd(eventType: AppLifecycleEventType): number | null {
  const key = `${eventType}:start`;
  const startTime = lifecycleTimestamps.get(key);
  if (startTime) {
    lifecycleTimestamps.delete(key);
    return performance.now() - startTime;
  }
  return null;
}

/**
 * 上报生命周期事件
 */
function reportLifecycleEvent(
  lifecycleEvent: AppLifecycleEventType,
  duration?: number
): void {
  const config = getConfig();
  if (!config.enableAPM) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'app:lifecycle',
    data: {
      context: {
        lifecycleEvent,
        duration,
      } as AppLifecycleEventData,
    },
  });
}

/**
 * 监控应用启动开始
 */
export function trackBootstrapStart(): void {
  recordLifecycleStart('bootstrap:start');
  reportLifecycleEvent('bootstrap:start');
}

/**
 * 监控应用启动结束
 */
export function trackBootstrapEnd(): void {
  const duration = recordLifecycleEnd('bootstrap:end');
  reportLifecycleEvent('bootstrap:end', duration || undefined);
}

/**
 * 监控应用挂载开始
 */
export function trackMountStart(): void {
  recordLifecycleStart('mount:start');
  reportLifecycleEvent('mount:start');
}

/**
 * 监控应用挂载结束
 */
export function trackMountEnd(): void {
  const duration = recordLifecycleEnd('mount:end');
  reportLifecycleEvent('mount:end', duration || undefined);
}

/**
 * 监控应用卸载开始
 */
export function trackUnmountStart(): void {
  recordLifecycleStart('unmount:start');
  reportLifecycleEvent('unmount:start');
}

/**
 * 监控应用卸载结束
 */
export function trackUnmountEnd(): void {
  const duration = recordLifecycleEnd('unmount:end');
  reportLifecycleEvent('unmount:end', duration || undefined);
}

/**
 * 监控应用更新
 */
export function trackUpdate(): void {
  reportLifecycleEvent('update');
}

/**
 * 包装 bootstrap 函数，自动监控启动过程
 */
export function wrapBootstrap<T extends any[]>(
  bootstrapFn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    trackBootstrapStart();
    try {
      await bootstrapFn(...args);
      trackBootstrapEnd();
    } catch (error) {
      trackBootstrapEnd();
      throw error;
    }
  };
}

/**
 * 包装 mount 函数，自动监控挂载过程
 */
export function wrapMount<T extends any[]>(
  mountFn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    trackMountStart();
    try {
      await mountFn(...args);
      trackMountEnd();
    } catch (error) {
      trackMountEnd();
      throw error;
    }
  };
}

/**
 * 包装 unmount 函数，自动监控卸载过程
 */
export function wrapUnmount<T extends any[]>(
  unmountFn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    trackUnmountStart();
    try {
      await unmountFn(...args);
      trackUnmountEnd();
    } catch (error) {
      trackUnmountEnd();
      throw error;
    }
  };
}

/**
 * 包装 update 函数，自动监控更新过程
 */
export function wrapUpdate<T extends any[]>(
  updateFn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    trackUpdate();
    await updateFn(...args);
  };
}
