import { logger } from '../logger/index';
;
/**
 * Form Hook 工具
 * 用于表单数据的绑定和提交转换
 * 完整实现 cool-admin 的 form-hook，包含所有8种内置转换器
 */

// 导出 logger 供外部使用（shared-components 等需要）
export { logger };

export interface HookContext {
  method: 'bind' | 'submit';
  form: Record<string, any>;
  prop?: string;
}

export type HookFn = (value: any, ctx: HookContext) => any;

// 辅助函数
function isArray(val: any): val is any[] {
  return Array.isArray(val);
}

function isString(val: any): val is string {
  return typeof val === 'string';
}

function isEmpty(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (isString(val)) return val === '';
  if (isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
}

// 内置转换器（完整的8种）
export const format: { [key: string]: HookFn } = {
  // 转换为数字
  number(value) {
    return value ? (Array.isArray(value) ? value.map(Number) : Number(value)) : value;
  },

  // 转换为字符串
  string(value) {
    return value ? (Array.isArray(value) ? value.map(String) : String(value)) : value;
  },

  // 分隔（用于绑定，将字符串分割为数组）
  split(value, ctx) {
    if (ctx.method === 'bind' && typeof value === 'string') {
      return value.split(',');
    }
    return value;
  },

  // 合并（用于提交，将数组合并为字符串）
  join(value, ctx) {
    if (ctx.method === 'submit' && Array.isArray(value)) {
      return value.join(',');
    }
    return value;
  },

  // 布尔值转换
  boolean(value) {
    if (value === 'true' || value === '1' || value === 1) {
      return true;
    }
    if (value === 'false' || value === '0' || value === 0) {
      return false;
    }
    return Boolean(value);
  },

  // 日期时间范围转换
  datetimeRange(value, ctx) {
    // 绑定时：将 [start, end] 拆分为两个字段
    if (ctx.method === 'bind' && ctx.prop && Array.isArray(value)) {
      const [start, end] = value;
      const baseProp = ctx.prop.replace(/Start$|End$/, '');
      ctx.form[`${baseProp}Start`] = start;
      ctx.form[`${baseProp}End`] = end;
      return value;
    }

    // 提交时：将两个字段合并为 [start, end]
    if (ctx.method === 'submit' && ctx.prop) {
      const baseProp = ctx.prop.replace(/Start$|End$/, '');
      const start = ctx.form[`${baseProp}Start`];
      const end = ctx.form[`${baseProp}End`];
      if (start && end) {
        return [start, end];
      }
    }

    return value;
  },

  // JSON 转换
  json(value, ctx) {
    if (ctx.method === 'bind') {
      // 绑定时：解析 JSON 字符串
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (_e) {
          return value;
        }
      }
    } else {
      // 提交时：转换为 JSON 字符串
      return JSON.stringify(value);
    }
  },

  // 清空空值
  empty(value) {
    if (isString(value)) {
      return value === '' ? undefined : value;
    }

    if (isArray(value)) {
      return isEmpty(value) ? undefined : value;
    }

    return value;
  },
};

function init({ value, form, prop }: any) {
  if (prop) {
    const [a, b] = prop.split('-');
    if (b) {
      form[prop] = form[a] ? form[a][b] : form[a];
    } else {
      form[prop] = value;
    }
  }
}

function parse(method: 'submit' | 'bind', { value, hook: pipe, form, prop }: any) {
  init({ value, method, form, prop });

  if (!pipe) {
    return false;
  }

  let pipes: any[] = [];

  if (typeof pipe === 'string') {
    if (format[pipe]) {
      pipes = [pipe];
    } else {
      logger.error(`[hook] ${pipe} is not found`);
    }
  } else if (Array.isArray(pipe)) {
    pipes = pipe;
  } else if (typeof pipe === 'object') {
    pipes = Array.isArray(pipe[method]) ? pipe[method] : [pipe[method]];
  } else if (typeof pipe === 'function') {
    pipes = [pipe];
  } else {
    logger.error(`[hook] ${pipe} format error`);
  }

  let v = value;

  pipes.forEach((e) => {
    let f: any = null;

    if (typeof e === 'string') {
      f = format[e];
    } else if (typeof e === 'function') {
      f = e;
    }

    if (f) {
      v = f(v, {
        method,
        form,
        prop,
      });
    }
  });

  if (prop) {
    form[prop] = v;
  }
}

const formHookDefault = {
  bind(data: any) {
    parse('bind', data);
  },

  submit(data: any) {
    parse('submit', data);
  },
};

export function registerFormHook(name: string, fn: HookFn) {
  format[name] = fn;
}

export default formHookDefault;
export const formHook = formHookDefault;
