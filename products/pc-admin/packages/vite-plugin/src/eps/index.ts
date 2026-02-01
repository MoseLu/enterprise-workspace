import type { Plugin, ViteDevServer } from 'vite';
import { createEps, fetchEpsData } from './generator';
import type { EpsPluginOptions } from './types';
import { info, error } from './utils';

/**
 * EPS Vite 插件（支持虚拟模块和热更新）
 */
export function epsPlugin(options: EpsPluginOptions & { reqUrl?: string }): Plugin {
  const { epsUrl = '', outputDir = 'build/eps', watch = true, reqUrl = '', sharedEpsDir, dictApi } = options;

  // 虚拟模块 ID 列表
  const virtualModuleIds: string[] = [
    'virtual:eps',
    'virtual:eps-json',
  ];

  // EPS 数据缓存
  let epsCache: any = null;
  let cacheTimestamp: number = 0;
  const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 0 : 24 * 60 * 60 * 1000; // 开发模式下不缓存，生产模式24小时缓存

  // 防止并发请求的 Promise 缓存
  let pendingRequest: Promise<any> | null = null;


  // 获取 EPS 数据（带缓存）
  async function getEpsData() {
    const now = Date.now();

    // 如果缓存有效，直接返回缓存数据
    if (epsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return epsCache;
    }

    // 如果已经有请求在进行中，等待该请求完成
    if (pendingRequest) {
      return await pendingRequest;
    }

    // 否则重新获取数据并更新缓存

    // 创建 pending 请求
    pendingRequest = (async () => {
      // 构建模式下（production）直接使用本地文件，不尝试远程获取
      const isBuildMode = process.env.NODE_ENV === 'production' || process.env.VITE_BUILD === 'true';

      if (isBuildMode) {
        info('构建模式：直接使用本地 EPS 文件，跳过远程获取');
        try {
          // 直接从本地文件读取（优先从共享目录读取）
          const result = await createEps(epsUrl, reqUrl, outputDir, undefined, sharedEpsDir, dictApi);

          // 如果本地文件有数据，使用本地数据
          if (result && result.list && result.list.length > 0) {
            epsCache = result;
            cacheTimestamp = Date.now();
            info(`已从本地文件加载 EPS 数据，共 ${result.list.length} 个实体`);
            return result;
          } else {
            info('本地 EPS 文件为空，将使用空服务对象');
            return { service: {}, list: [], isUpdate: false, serviceCode: { content: '{}', types: [] } };
          }
        } catch (localErr) {
          error(`从本地文件读取 EPS 数据失败: ${localErr}`);
          return { service: {}, list: [], isUpdate: false, serviceCode: { content: '{}', types: [] } };
        }
      }

      // 开发模式下，先尝试远程获取，失败则回退到本地文件
      try {
        // 先获取远程数据
        const entities = await fetchEpsData(epsUrl, reqUrl);

        // 如果远程获取的数据为空，尝试从本地文件读取
        if (!entities || entities.length === 0) {
          info('远程 EPS 数据为空，尝试从本地文件读取...');
          // 传入 undefined 作为 cachedData，让 createEps 从本地文件读取（优先从共享目录读取）
          const result = await createEps(epsUrl, reqUrl, outputDir, undefined, sharedEpsDir, dictApi);

          // 如果本地文件也没有数据，返回空结构
          if (!result || !result.list || result.list.length === 0) {
            error('远程和本地 EPS 数据都为空，将使用空服务对象');
            return { service: {}, list: [], isUpdate: false, serviceCode: { content: '{}', types: [] } };
          }

          // 更新缓存
          epsCache = result;
          cacheTimestamp = Date.now();
          info('已从本地文件加载 EPS 数据');
          return result;
        }

        // 然后创建 EPS 服务
        const result = await createEps(epsUrl, reqUrl, outputDir, { list: entities }, sharedEpsDir, dictApi);

        // 更新缓存
        epsCache = result;
        cacheTimestamp = Date.now();

        return result;
      } catch (err) {
        error(`获取 EPS 数据失败: ${err}`);
        // 尝试从本地文件读取作为回退
        try {
          info('远程获取失败，尝试从本地文件读取...');
          const result = await createEps(epsUrl, reqUrl, outputDir, undefined, sharedEpsDir, dictApi);

          // 如果本地文件有数据，使用本地数据
          if (result && result.list && result.list.length > 0) {
            epsCache = result;
            cacheTimestamp = Date.now();
            info('已从本地文件加载 EPS 数据');
            return result;
          }
        } catch (localErr) {
          error(`从本地文件读取 EPS 数据也失败: ${localErr}`);
        }

        // 如果本地文件也没有数据，返回空结构
        return { service: {}, list: [], isUpdate: false, serviceCode: { content: '{}', types: [] } };
      }
    })();

    try {
      return await pendingRequest;
    } finally {
      // 清除 pending 状态
      pendingRequest = null;
    }
  }

  return {
    name: 'vite-plugin-eps',
    enforce: 'pre', // 确保插件在其他插件之前执行

    async buildStart() {
      info('开始生成服务层...');

      try {
        await getEpsData();
        info('服务层生成成功');
      } catch (err) {
        error(`生成失败: ${err}`);
      }
    },

    // 虚拟模块解析
    resolveId(id: string) {
      if (virtualModuleIds.includes(id)) {
        return '\0' + id;
      }
      return null;
    },

    // 虚拟模块加载
    async load(id: string) {
      if (id === '\0virtual:eps') {
        try {
          // 始终使用 getEpsData，它会处理缓存逻辑
          const eps = await getEpsData();

          // 确保 eps 对象有正确的结构
          const epsData = eps || { service: {}, list: [], isUpdate: false };

          // 生成 service 代码（包含实际的函数，而不是 JSON）
          const { serviceCode } = epsData;

          // 如果 serviceCode 存在，生成包含函数的代码
          if (serviceCode && serviceCode.content) {
            // 导入 request 函数
            // 注意：使用模板字符串时，确保 serviceCode.content 是有效的 JavaScript 代码
            // 转义 serviceContent 中的特殊字符，避免模板字符串解析错误
            const serviceContent = String(serviceCode.content);
            const listData = JSON.stringify(epsData.list || []);
            const isUpdate = epsData.isUpdate || false;

            // 使用字符串拼接而不是模板字符串中的嵌套，避免语法错误
            // 注意：namespace 已经包含完整路径（包括 /api 前缀），所以 baseURL 设为空字符串
            const code = [
              "import { createRequest } from '@btc/shared-core';",
              "const request = createRequest(''); // namespace 已包含完整路径，不需要 baseURL",
              "",
              "// 生成的 service 对象",
              `const serviceObj = ${serviceContent};`,
              "",
              "// 导出 service 和 list",
              "export const service = serviceObj;",
              `export const list = ${listData};`,
              "export default {",
              "  service: serviceObj,",
              `  list: ${listData},`,
              `  isUpdate: ${isUpdate}`,
              "};"
            ].join('\n');

            return code;
          }

          // 如果没有 serviceCode，也要导出 service 和 list（即使为空）
          const serviceContent = epsData.serviceCode?.content || '{}';
          const listData = JSON.stringify(epsData.list || []);
          const isUpdate = epsData.isUpdate || false;

          const code = [
            "import { createRequest } from '@btc/shared-core';",
            "const request = createRequest(''); // namespace 已包含完整路径，不需要 baseURL",
            "",
            "// 生成的 service 对象",
            `const serviceObj = ${serviceContent};`,
            "",
            "// 导出 service 和 list",
            "export const service = serviceObj;",
            `export const list = ${listData};`,
            "export default {",
            "  service: serviceObj,",
            `  list: ${listData},`,
            `  isUpdate: ${isUpdate}`,
            "};"
          ].join('\n');

          return code;
        } catch (err) {
          error(`加载 EPS 数据失败: ${err}`);
          // 返回一个有效的默认结构，确保导出 service 和 list
          const code = [
            "import { createRequest } from '@btc/shared-core';",
            "const request = createRequest('');",
            "",
            "// 默认空服务对象",
            "const serviceObj = {};",
            "const listData = [];",
            "",
            "// 导出 service 和 list",
            "export const service = serviceObj;",
            "export const list = listData;",
            "export default {",
            "  service: serviceObj,",
            "  list: listData,",
            "  isUpdate: false",
            "};"
          ].join('\n');

          return code;
        }
      }

      if (id === '\0virtual:eps-json') {
        try {
          // 始终使用 getEpsData，它会处理缓存逻辑
          const eps = await getEpsData();
          return `export default ${JSON.stringify(eps.list || [])};`;
        } catch (err) {
          error(`加载 EPS JSON 数据失败: ${err}`);
          return `export default [];`;
        }
      }

      return null;
    },

    // 开发模式下热更新
    configureServer(_server: ViteDevServer) {
      // EPS 数据在项目启动时获取一次，不需要定期更新
      if (watch && epsUrl) {
        info('EPS 数据已缓存 24 小时，仅在项目重启时更新');
      }
    },

    // 热更新处理
    handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      // 文件修改时触发
      if (!['eps.json', 'eps.d.ts'].some((e) => file.includes(e))) {
        // 清除缓存，强制重新获取数据
        epsCache = null;
        cacheTimestamp = 0;

        createEps(epsUrl, reqUrl, outputDir, undefined, sharedEpsDir, dictApi).then((data) => {
          if (data.isUpdate) {
            // 更新缓存
            epsCache = data;
            cacheTimestamp = Date.now();

            // 通知客户端刷新
            server.ws.send({
              type: 'custom',
              event: 'eps-update',
              data,
            });
          }
        });
      }
    },
  } as unknown as Plugin;
}
