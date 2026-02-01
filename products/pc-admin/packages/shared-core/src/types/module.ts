/**
 * 模块配置类型定义
 * 扩展 PageConfig，添加模块元数据和路由配置
 */
import type { Component, App } from 'vue';
import type { RouteRecordRaw } from './vue-router';
import type { PageConfig } from '../../../../types/locale';

/**
 * 模块配置接口
 * 扩展 PageConfig，保留 locale、columns、forms、service 字段
 * 添加模块元数据字段（name、label、order 等）
 * 添加路由配置字段（views、pages，可选，用于未来模块注册机制）
 */
export interface ModuleConfig extends PageConfig {
  /**
   * 模块名称（标识符）
   */
  name?: string;

  /**
   * 模块标签（i18n key 或直接文本）
   */
  label?: string;

  /**
   * 模块描述
   */
  description?: string;

  /**
   * 模块加载顺序（数字越小越先加载）
   */
  order?: number;

  /**
   * 模块版本
   */
  version?: string;

  /**
   * 模块组件列表（可选，用于模块注册机制）
   */
  components?: Component[];

  /**
   * 模块指令配置（可选，用于模块注册机制）
   */
  directives?: Record<string, import('vue').Directive>;

  /**
   * 视图路由配置（已使用，用于自动路由发现）
   */
  views?: RouteRecordRaw[];

  /**
   * 页面路由配置（可选，用于未来模块注册机制）
   * 例如：404 错误页面
   */
  pages?: (RouteRecordRaw & { isPage?: boolean })[];

  /**
   * 安装钩子（可选，用于未来模块注册机制）
   */
  install?(app: App, options?: any): any;

  /**
   * 加载完成钩子（可选，用于未来模块注册机制）
   */
  onLoad?(events: { [key: string]: any }): Promise<any> | void;
}
