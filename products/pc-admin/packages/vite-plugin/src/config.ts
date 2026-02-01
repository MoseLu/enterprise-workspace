/**
 * 插件配置管理
 */

import type { EpsConfig } from './eps/types';

export type Type = 'admin' | 'app' | 'uniapp-x';

export interface BtcPluginConfig {
  /**
   * 应用类型
   */
  type: Type;
  /**
   * 后端请求地址（用于获取服务语言类型等）
   */
  reqUrl?: string;
  /**
   * 是否为演示模式
   */
  demo?: boolean;
  /**
   * 是否启用名称标签
   */
  nameTag?: boolean;
  /**
   * EPS 配置
   */
  eps?: EpsConfig;
  /**
   * SVG 配置
   */
  svg?: {
    skipNames?: string[];
    allowAppIcons?: boolean;
  };
  /**
   * 是否清理旧文件
   */
  clean?: boolean;
}

export const config: BtcPluginConfig = {
  type: 'admin',
  reqUrl: '',
  demo: false,
  nameTag: false, // 默认禁用 nameTag，使用 defineOptions({ name: 'xxx' }) 代替
  eps: {
    enable: true,
    api: '/api/v1/eps', // 内置 EPS API 路径
    dist: './build/eps',
    dict: false, // 默认禁用字典功能
    dictApi: '/api/system/auth/dict', // 字典接口 URL
    mapping: [
      {
        // 自定义映射
        type: 'string',
        custom: ({
          propertyName: _propertyName,
          type: _type,
        }: {
          propertyName: string;
          type: string;
        }) => {
          // 如果没有，返回 null 或者不返回，则继续遍历其他匹配规则
          return null;
        },
      },
      {
        type: 'string',
        test: ['varchar', 'text', 'char', 'string'],
      },
      {
        type: 'string[]',
        test: ['simple-array'],
      },
      {
        type: 'string',
        test: ['datetime', 'date', 'timestamp'],
      },
      {
        type: 'number',
        test: ['tinyint', 'int', 'integer', 'decimal'],
      },
      {
        type: 'number',
        test: ['bigint', 'long'],
      },
      {
        type: 'boolean',
        test: ['boolean', 'bool'],
      },
      {
        type: 'any',
        test: ['json', 'object'],
      },
      {
        type: 'any[]',
        test: ['array'],
      },
    ],
  },
  svg: {
    skipNames: ['base', 'icons'],
    allowAppIcons: false,
  },
  clean: false,
};
