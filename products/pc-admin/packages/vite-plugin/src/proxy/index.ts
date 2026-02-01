// logger 已移除，使用 console 替代
;
﻿// 浠ｇ悊閰嶇疆澶勭悊

export function getProxyTarget(proxy: any) {
  try {
    // 鐩存帴浠庝紶鍏ョ殑 proxy 閰嶇疆涓幏鍙栫洰鏍囧湴鍧€
    if (proxy && typeof proxy === 'object') {
      // 鏌ユ壘绗竴涓唬鐞嗛厤缃殑 target
      for (const [, config] of Object.entries(proxy)) {
        if (config && typeof config === 'object' && 'target' in config) {
          const target = (config as any).target;
          if (target && typeof target === 'string') {
            console.info(`[btc:proxy] 使用代理目标: ${target}`);
            return target;
          }
        }
      }
    }
  } catch (err) {
    console.error('[btc:proxy] 获取代理目标失败:', err);
  }

  return '';
}

