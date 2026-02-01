/**
 * 琛ㄥ崟椤圭鐞嗗伐鍏? */

// Helpers
export function cloneDeep(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(cloneDeep);
  const cloned = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = cloneDeep(obj[key]);
    }
  }
  return cloned;
}

export function isBoolean(val: any): val is boolean {
  return typeof val === 'boolean';
}

export function isFunction(val: any): val is (...args: any[]) => any {
  return typeof val === 'function';
}

/**
 * 鍒ゆ柇鏄惁闅愯棌
 */
export function parseHidden(value: any, scope: any) {
  if (isBoolean(value)) {
    return value;
  } else if (isFunction(value)) {
    return value({ scope });
  }
  return false;
}

/**
 * 鎶樺彔琛ㄥ崟椤? */
export function collapseItem(item: any) {
  item.collapse = !item.collapse;
}

/**
 * 杞崲琛ㄥ崟鍊? */
export function invokeData(d: any) {
  for (const i in d) {
    if (i.includes('-')) {
      const [a, ...arr] = i.split('-');
      if (!a) return;
      const k: string = arr.pop() || '';

      if (!d[a]) {
        d[a] = {};
      }

      let f: any = d[a];

      arr.forEach((e) => {
        if (!e) return;
        if (!f[e]) {
          f[e] = {};
        }
        f = f[e];
      });

      f[k] = d[i];
      delete d[i];
    }
  }
}

