;
// i18n/buildMessages.ts
type L = Record<string, any>; // 只支持 {'zh-CN': {...}, 'en-US': {...}}

function deepMerge<T extends object>(...xs: T[]): T {
  const out: any = {};
  for (const x of xs) {
    if (!x) continue;
    for (const k of Object.keys(x)) {
      const v = (x as any)[k];
      out[k] = v && typeof v === 'object' && !Array.isArray(v)
        ? deepMerge(out[k] ?? {}, v)
        : v;
    }
  }
  return out;
}

export function buildMessages(...bundles: L[]): L {
  const buckets: L = {};

  for (const b of bundles) {
    for (const locale of Object.keys(b)) {
      const localeMessages = b[locale];
      if (!localeMessages || typeof localeMessages !== 'object') continue;

      const processedMessages: Record<string, any> = {};

      // 处理 @intlify/unplugin-vue-i18n 的 AST 格式
      for (const [key, messageNode] of Object.entries(localeMessages)) {
        if (typeof messageNode === 'object' && messageNode && 'loc' in messageNode) {
          // 提取 AST 格式的字符串
          const message = (messageNode as any).loc?.source;
          if (typeof message === 'string') {
            processedMessages[key] = message;
          } else {
            // 调试：记录被跳过的 AST 消息
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[buildMessages] 跳过非字符串 AST 消息: ${key}`, {
                type: typeof message,
                message,
                originalNode: messageNode
              });
            }
          }
        } else if (typeof messageNode === 'string') {
          // 直接使用字符串
          processedMessages[key] = messageNode;
        } else {
          // 调试：记录被跳过的其他类型消息
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[buildMessages] 跳过非字符串消息: ${key}`, {
              type: typeof messageNode,
              value: messageNode
            });
          }
        }
      }

      buckets[locale] = deepMerge(buckets[locale] ?? {}, processedMessages);
    }
  }

  return buckets;
}
