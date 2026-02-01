/**
 * 系统监控
 * 监控内存、网络、设备信息等
 */

import type { SystemInfo, SystemMemoryInfo, SystemNetworkInfo, SystemDeviceInfo, DeviceType } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 是否已初始化
 */
let initialized = false;

/**
 * 检测设备类型
 */
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * 检测浏览器信息
 */
function detectBrowser(): { browser: string; browserVersion: string } {
  if (typeof window === 'undefined' || !window.navigator) {
    return { browser: 'unknown', browserVersion: 'unknown' };
  }

  const ua = window.navigator.userAgent;
  let browser = 'unknown';
  let browserVersion = 'unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  }

  return { browser, browserVersion };
}

/**
 * 检测操作系统信息
 */
function detectOS(): { os: string; osVersion: string } {
  if (typeof window === 'undefined' || !window.navigator) {
    return { os: 'unknown', osVersion: 'unknown' };
  }

  const ua = window.navigator.userAgent;
  let os = 'unknown';
  let osVersion = 'unknown';

  if (ua.includes('Windows')) {
    os = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    osVersion = match ? match[1] : 'unknown';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = match ? match[1].replace('_', '.') : 'unknown';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
    osVersion = 'unknown';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android (\d+\.\d+)/);
    osVersion = match ? match[1] : 'unknown';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+)/);
    osVersion = match ? match[1].replace('_', '.') : 'unknown';
  }

  return { os, osVersion };
}

/**
 * 获取内存信息
 */
function getMemoryInfo(): SystemMemoryInfo | undefined {
  if (typeof window === 'undefined' || !(window.performance as any)?.memory) {
    return undefined;
  }

  const memory = (window.performance as any).memory;
  return {
    heapUsed: Math.round(memory.usedJSHeapSize / 1024 / 1024),
    heapTotal: Math.round(memory.totalJSHeapSize / 1024 / 1024),
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
  };
}

/**
 * 获取网络信息
 */
function getNetworkInfo(): SystemNetworkInfo | undefined {
  if (typeof window === 'undefined' || !window.navigator) {
    return undefined;
  }

  const connection = (navigator as any).connection ||
                     (navigator as any).mozConnection ||
                     (navigator as any).webkitConnection;

  if (!connection) {
    return {
      online: navigator.onLine,
    };
  }

  return {
    online: navigator.onLine,
    connectionType: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
  };
}

/**
 * 获取设备信息
 */
function getDeviceInfo(): SystemDeviceInfo {
  const { browser, browserVersion } = detectBrowser();
  const { os, osVersion } = detectOS();

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    deviceType: detectDeviceType(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
  };
}

/**
 * 上报系统信息
 */
function reportSystemInfo(system: SystemInfo, eventType: 'system:memory' | 'system:network' | 'system:device'): void {
  const config = getConfig();
  if (!config.enableSystemMonitoring) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType,
    data: {
      system,
    },
  });
}

/**
 * 初始化系统监控
 */
export function initSystemMonitor(): void {
  if (initialized) {
    return;
  }

  const config = getConfig();
  if (!config.enableSystemMonitoring) {
    return;
  }

  // 上报设备信息（一次性）
  const deviceInfo = getDeviceInfo();
  reportSystemInfo({ device: deviceInfo }, 'system:device');

  // 定期上报内存信息
  if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
    const memoryInterval = setInterval(() => {
      const memoryInfo = getMemoryInfo();
      if (memoryInfo) {
        reportSystemInfo({ memory: memoryInfo }, 'system:memory');
      }
    }, 60000); // 每分钟上报一次

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
      clearInterval(memoryInterval);
    });
  }

  // 监听网络状态变化
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      const networkInfo = getNetworkInfo();
      if (networkInfo) {
        reportSystemInfo({ network: networkInfo }, 'system:network');
      }
    });

    window.addEventListener('offline', () => {
      const networkInfo = getNetworkInfo();
      if (networkInfo) {
        reportSystemInfo({ network: networkInfo }, 'system:network');
      }
    });
  }

  initialized = true;
}

/**
 * 手动上报系统内存信息
 */
export function reportSystemMemory(): void {
  const memoryInfo = getMemoryInfo();
  if (memoryInfo) {
    reportSystemInfo({ memory: memoryInfo }, 'system:memory');
  }
}

/**
 * 手动上报系统网络信息
 */
export function reportSystemNetwork(): void {
  const networkInfo = getNetworkInfo();
  if (networkInfo) {
    reportSystemInfo({ network: networkInfo }, 'system:network');
  }
}

/**
 * 手动上报系统设备信息
 */
export function reportSystemDevice(): void {
  const deviceInfo = getDeviceInfo();
  reportSystemInfo({ device: deviceInfo }, 'system:device');
}

/**
 * 销毁系统监控
 */
export function destroySystemMonitor(): void {
  initialized = false;
}
