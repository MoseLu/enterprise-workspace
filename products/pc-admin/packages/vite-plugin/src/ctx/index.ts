;
﻿import type { Plugin } from 'vite';
import fs from 'fs';
import axios from 'axios';
import { rootDir } from '../utils';
// error 未使用，已移除导入
import { config } from '../config';

export interface CtxData {
  modules?: string[];
  serviceLang?: string;
}

/**
 * 创建上下文数据
 */
export async function createCtx(): Promise<CtxData> {
  const ctx: CtxData = {
    serviceLang: 'Node',
    modules: [],
  };

  // 扫描 modules 目录 - 只获取真正的业务模块（一级菜单）
  const modulesDir = rootDir('./src/modules');

  try {
    if (fs.existsSync(modulesDir)) {
      const list = fs.readdirSync(modulesDir);

      // 定义真正的业务模块（对应一级菜单）
      const businessModules = [
        'platform',    // 平台管理
        'org',         // 组织管理
        'access',      // 权限管理
        'navigation',  // 导航管理
        'ops',         // 运维管理
        'test-features' // 测试功能
      ];

      ctx.modules = list.filter((e) => {
        // 过滤掉文件（包含 . 的）
        if (e.includes('.')) return false;

        // 只保留真正的业务模块
        return businessModules.includes(e);
      });
    }
  } catch (_err) {
    // 目录不存在，忽略
  }

  // 从后端获取服务语言类型
  if (config.reqUrl) {
    try {
      // 尝试多个可能的 API 路径
      const possiblePaths = [
        '/admin/base/comm/program',  // 旧版本路径
        '/api/v1/base/comm/program', // 新版本路径
        '/admin/base/comm/info',     // 通用信息接口
        '/api/v1/base/comm/info'     // 新版本通用信息接口
      ];

      let serviceLang = 'Node'; // 默认值

      for (const path of possiblePaths) {
        try {
          const res = await (axios as any).get(config.reqUrl + path, {
            timeout: 3000,
          });

          const { code, data } = res.data;

          if (code === 1000) {
            // 支持不同的数据结构
            serviceLang = data?.program || data?.serviceLang || data || 'Node';
            break; // 成功获取后跳出循环
          }
        } catch (pathErr) {
          // 继续尝试下一个路径
          continue;
        }
      }

      ctx.serviceLang = serviceLang;
    } catch (_err: any) {
      // 所有路径都失败，使用默认值
      ctx.serviceLang = 'Node';
    }
  }

  return ctx;
}

/**
 * 上下文插件（自动扫描模块）
 * 扫描 src/modules/ 目录，获取所有模块名和服务语言类型
 */
export function ctxPlugin(): Plugin {
  let ctxData: CtxData = {};

  return {
    name: 'btc:ctx',
    enforce: 'pre',

		async configResolved() {
			// 生成上下文数据
			ctxData = await createCtx();

			if (ctxData.modules && ctxData.modules.length > 0) {
				console.info(
					`[btc:ctx] 找到 ${ctxData.modules.length} 个模块: ${ctxData.modules.join(', ')}`
				);
			}

			console.info(`[btc:ctx] 服务语言: ${ctxData.serviceLang}`);
		},

    resolveId(id: string) {
      if (id === 'virtual:ctx') {
        return '\0virtual:ctx';
      }
    },

    load(id: string) {
      if (id === '\0virtual:ctx') {
        return `export default ${JSON.stringify(ctxData, null, 2)}`;
      }
    },
  } as Plugin; 
}
