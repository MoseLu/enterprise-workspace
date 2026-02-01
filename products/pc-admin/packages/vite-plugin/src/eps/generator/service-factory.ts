;
import { epsState, type EpsState } from './state';
import { checkName, firstUpperCase, formatName, toCamel } from './utils';
// logger 已移除，使用 console 替代
// config 未使用，已移除导入

export function createService(_epsUrl: string, state: EpsState = epsState) {
  if (state.epsList.length === 0) {
    console.error('[eps] 未找到实体! eps 数据获取失败');
    throw new Error('EPS data fetch failed - no entities available');
  }

  state.epsList.forEach((e) => {
    const serviceKey = e.name ? e.name.toLowerCase().replace(/entity$/, '') : 'unknown';

    const prefix = e.prefix || '';
    let pathParts: string[] = [];
    let finalKey: string;

    // 优先使用 moduleKey（模块名称）来构建 service 树
    if (e.moduleKey) {
      // moduleKey 格式：admin.iam，需要转换为路径数组
      // 所有部分都作为路径，最终键直接使用 name 属性
      pathParts = e.moduleKey.split('.').map((part: string) => toCamel(part));
      // 直接使用 name 属性作为实体名称
      finalKey = e.name ? toCamel(e.name) : serviceKey;
    } else {
      // 如果没有 moduleKey，则从 prefix 解析路径（兼容历史数据）
      // 过滤掉空字符串和 'api'，保留其他路径部分
      pathParts = prefix.split('/').filter((part: string) => {
        return part && part !== 'api';
      }).map((part: string) => toCamel(part));
      // 优先使用 name 属性，如果没有则从 pathParts 中取最后一个
      finalKey = e.name ? toCamel(e.name) : (pathParts[pathParts.length - 1] || serviceKey);
      // 如果使用 prefix 且没有 name，需要移除最后一个作为路径的一部分
      if (pathParts.length > 0 && !e.name) {
        pathParts = pathParts.slice(0, -1);
      }
    }

    let currentLevel = state.service;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (part === undefined) continue; // 跳过 undefined
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    }
    if (!currentLevel[finalKey]) {
      currentLevel[finalKey] = {
        namespace: prefix,
        permission: {},
        _permission: {},
        search: e.search || {},
        _pageColumns: e.pageColumns || [], // 保存 pageColumns 供 use-crud 使用
      };
    } else {
      // 如果服务对象已存在，更新 search 和 pageColumns 属性（确保 pageQueryOp 转换后的 search 被应用）
      if (e.search) {
        currentLevel[finalKey].search = e.search;
      }
      if (e.pageColumns) {
        currentLevel[finalKey]._pageColumns = e.pageColumns;
      }
    }

    if (e.api && Array.isArray(e.api)) {
      e.api.forEach((a: any) => {
        let methodName = a.name;
        if (!methodName && a.path) {
          methodName = a.path.replace(/^\//, '').replace(/\/.*$/, '');
        }

        if (methodName && !/[-:]/g.test(methodName)) {
          currentLevel[finalKey][methodName] = {
            path: a.path,
            method: a.method,
            name: a.name,
            module: a.module,
            ignoreToken: a.ignoreToken,
            action: a.action,
            auth: a.auth,
            permission: a.permission,
            summary: a.summary,
            tag: a.tag,
            dts: a.dts
          };
        }
      });
    }

    if (currentLevel[finalKey].namespace) {
      Object.keys(currentLevel[finalKey]).forEach((key) => {
        if (!['namespace', 'permission', '_permission', 'search'].includes(key)) {
          currentLevel[finalKey].permission[key] = `${currentLevel[finalKey].namespace}/${key}`.replace(/\//g, ':');
        }
      });
    }
  });
}

export function createServiceCode(state: EpsState = epsState): { content: string; types: string[] } {
  const types: string[] = [];
  let chain = '';

  function deep(d: any, k?: string, visited: WeakSet<object> = new WeakSet()) {
    if (!d || typeof d !== 'object' || d === null) {
      return;
    }

    if (visited.has(d)) {
      return;
    }

    visited.add(d);

    if (!k) k = '';

    for (const i in d) {
      if (['swagger'].includes(i)) {
        continue;
      }

      const value = d[i];
      if (!value || typeof value !== 'object' || value === null) {
        continue;
      }

      if (visited.has(value)) {
        continue;
      }

      const name = k + toCamel(firstUpperCase(formatName(i)));

      if (!checkName(name)) continue;

      if (value.namespace) {
        // 通过 namespace 匹配对应的 EPS 实体
        const normalizedNs = value.namespace.startsWith('/') ? value.namespace : `/${value.namespace}`;
        const item = state.epsList.find((e) => {
          const normalizedPrefix = (e.prefix || '').startsWith('/') ? (e.prefix || '') : `/${e.prefix || ''}`;
          return normalizedPrefix === normalizedNs;
        });

        if (item) {
          let t = `{`;

          // 添加 namespace 属性
          t += `
            namespace: "${value.namespace}",
          `;

          // 添加 search 属性（如果存在）
          if (item.search) {
            const searchStr = JSON.stringify(item.search);
            t += `
              search: ${searchStr},
            `;
          }

          if (item.api) {
            item.api.forEach((a: any) => {
              const n = toCamel(formatName(a.name || a.path.split('/').pop()!));

              if (!checkName(n)) return;

              if (n) {
                const normalizedNamespace = value.namespace.replace(/\/$/, '');
                const normalizedPath = a.path.startsWith('/') ? a.path : `/${a.path}`;
                const fullPath = `${normalizedNamespace}${normalizedPath}`;

                let urlPath = `"${fullPath}"`;
                let requestData = 'data';
                const methodLower = (a.method || 'get').toLowerCase();
                const payloadKey = ['post', 'put', 'patch'].includes(methodLower) ? 'data' : 'params';

                if (n.toLowerCase().includes('delete')) {
                  if (a.path.includes('{id}')) {
                    urlPath = `"${fullPath}".replace(/{id}/g, Array.isArray(data) ? data[0] : data)`;
                    requestData = 'undefined';
                  } else if (n.toLowerCase().includes('batch')) {
                    urlPath = `"${fullPath}"`;
                    requestData = 'data';
                  }
                }

                t += `
                  /**
                   * ${a.summary || n}
                   */
                  ${n}(data) {
                    return request({
                      url: ${urlPath},
                      method: "${(a.method || 'get').toUpperCase()}",
                      ${requestData === 'undefined' ? '' : `${payloadKey}: ${requestData},`}
                    });
                  },
                `;
              }
            });
          }

          t += `}\n`;

          types.push(name);

          chain += `${formatName(i)}: ${t},\n`;
        }
      } else {
        chain += `${formatName(i)}: {`;
        deep(value, name, visited);
        chain += `},`;

        types.push(`${firstUpperCase(i)}Interface`);
      }
    }
  }

  deep(state.service);

  return {
    content: `{ ${chain} }`,
    types,
  };
}
