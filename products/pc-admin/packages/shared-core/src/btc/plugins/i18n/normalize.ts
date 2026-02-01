// i18n/normalize.ts
const CJK = /[\u3400-\u9FFF]/;
const KEYLIKE = /^[a-z0-9_.:-]+$/i;

export function normalizeLocaleTree(node: any): any {
  // 叶子：string
  if (typeof node === 'string') return node;

  // 叶子：反向映射（中文作 key，值像 key）
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string' && CJK.test(k) && KEYLIKE.test(v)) {
        // 反向：'个人中心': 'common.profile'  -->  out['common.profile'] = '个人中心'
        out[v] = out[v] ?? k;
      } else {
        out[k] = normalizeLocaleTree(v); // ✅ 保留对象，递归进去
      }
    }
    return out;
  }

  // 其它类型（null/数组/数字），直接丢弃以保守起见
  return undefined;
}
