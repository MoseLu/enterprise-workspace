/**
 * Qiankun 微前端类型定义
 */

import type { QiankunProps } from '@btc/shared-core';

/**
 * Qiankun 生命周期钩子
 */
export interface QiankunLifeCycle {
  /**
   * bootstrap 阶段
   */
  bootstrap?: () => Promise<void> | void;

  /**
   * mount 阶段
   */
  mount: (props: QiankunProps) => Promise<void> | void;

  /**
   * unmount 阶段
   */
  unmount: (props?: QiankunProps) => Promise<void> | void;

  /**
   * update 阶段
   */
  update?: (props: QiankunProps) => Promise<void> | void;
}

/**
 * Qiankun 运行模式
 */
export type QiankunMode = 'singleSpa' | 'qiankun' | 'none';

/**
 * Qiankun 配置
 */
export interface QiankunConfig {
  /**
   * 应用名称
   */
  appName: string;

  /**
   * 应用前缀
   */
  appPrefix: string;

  /**
   * 运行模式
   */
  mode: QiankunMode;

  /**
   * 独享元素选择器
   */
  excludeAssets?: string[];

  /**
   * 沙箱配置
   */
  sandbox?: {
    strictStyleIsolation?: boolean;
    experimentalStyleIsolation?: boolean;
  };
}
