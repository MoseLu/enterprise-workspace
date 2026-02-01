/**
 * 国际化配置类型定义
 * 支持应用级、菜单级、页面级配置，以及 columns 和 forms 配置
 */

import type { TableColumn, FormItem } from '@btc/shared-components';

/**
 * 命名规范：支持驼峰（camelCase）和下划线（snake_case）
 * 通过 TS 类型约束确保命名规范
 */
type ValidKey = string; // 简化实现，实际可以通过更复杂的类型约束

/**
 * 应用级配置类型（1层，但允许嵌套对象）
 * 例如：{ name: "管理应用", title: "管理应用", loading: { title: "..." } }
 */
export type AppLevelConfig = Record<ValidKey, string | Record<string, string>>;

/**
 * 菜单配置类型（支持多层嵌套）
 * 例如：{ platform: { domains: "域列表" }, data: { files: { _: "文件管理", templates: "模板管理" } } }
 */
export type MenuLevelConfig = Record<ValidKey, string | MenuLevelConfig | { _?: string; [key: string]: any }>;

/**
 * 页面配置类型（3层）
 * 例如：{ org: { users: { searchBtn: "搜索" } } }
 */
export type PageLevelConfig = Record<
  ValidKey,
  Record<ValidKey, Record<ValidKey, string>>
>;

/**
 * 通用配置类型（支持多层嵌套，用于 common 等）
 * 例如：{ error: { failed: "执行失败" }, retry: { retrying: "正在重试..." } }
 */
export type CommonLevelConfig = Record<ValidKey, string | CommonLevelConfig>;

/**
 * 子应用配置类型（扁平结构，只包含 name）
 * 例如：{ name: "管理应用" }
 */
export type SubAppLevelConfig = {
  name: string;
};

/**
 * 国际化配置类型（单语言）
 */
export interface LocaleConfigSingle {
  app?: AppLevelConfig;
  subapp?: SubAppLevelConfig;
  menu?: MenuLevelConfig;
  page?: PageLevelConfig;
  common?: CommonLevelConfig;
}

/**
 * 应用级国际化配置类型（单语言）
 * 应用级配置不包含 page 属性，page 配置应该在模块级 config.ts 中
 */
export type AppLevelLocaleConfigSingle = Omit<LocaleConfigSingle, 'page'>;

/**
 * 页面级 config.ts 的国际化配置导出类型
 * 注意：locale 下可以直接是模块层（如 org, platform），不再需要 page 层级
 * 为了兼容旧格式，仍然支持 page 层级
 */
export interface PageLocaleConfig {
  app?: AppLevelConfig;
  menu?: MenuLevelConfig;
  page?: PageLevelConfig; // 页面级改为可选（兼容旧格式）
  // 模块配置可以直接放在 locale 下（新格式），允许任意嵌套结构
  [moduleKey: string]: any;
}

/**
 * 应用级完整配置类型（所有页面 config 合并后的类型）
 */
export interface AppLocaleConfig {
  app: AppLevelConfig;
  menu: MenuLevelConfig;
  page: PageLevelConfig;
}

/**
 * 多语言配置类型（包含 zh-CN 和 en-US）
 */
export interface LocaleConfig {
  'zh-CN': LocaleConfigSingle;
  'en-US': LocaleConfigSingle;
}

/**
 * 应用级多语言配置类型（包含 zh-CN 和 en-US）
 * 应用级配置不包含 page 属性，page 配置应该在模块级 config.ts 中
 */
export interface AppLevelLocaleConfig {
  'zh-CN': AppLevelLocaleConfigSingle;
  'en-US': AppLevelLocaleConfigSingle;
}

/**
 * 表格列配置类型（基于 TableColumn，label 使用 i18n key）
 * label 可以是 i18n key（字符串）或直接文本
 */
export type TableColumnConfig = Omit<TableColumn, 'label'> & {
  label?: string; // i18n key 或直接文本
};

/**
 * 表单项配置类型（基于 FormItem，label 和 placeholder 使用 i18n key）
 * label 和 component.props.placeholder 可以是 i18n key（字符串）或直接文本
 */
export type FormItemConfig = Omit<FormItem, 'label'> & {
  label?: string; // i18n key 或直接文本
  component?: FormItem['component'] & {
    props?: FormItem['component']['props'] & {
      placeholder?: string; // i18n key 或直接文本
    };
  };
};

/**
 * 页面级 columns 配置类型（按页面组织）
 * key 格式：'module.submodule.page'，例如 'org.users'
 */
export type ColumnsConfig = Record<string, TableColumnConfig[]>;

/**
 * 页面级 forms 配置类型（按页面组织）
 * key 格式：'module.submodule.page'，例如 'org.users'
 */
export type FormsConfig = Record<string, FormItemConfig[]>;

/**
 * 页面级完整配置类型（包含 locale、columns、forms、service）
 */
export interface PageConfig {
  /**
   * 国际化配置
   */
  locale: PageLocaleConfig;

  /**
   * 表格列配置（可选）
   * key 格式：'module.submodule.page'，例如 'org.users'
   */
  columns?: ColumnsConfig;

  /**
   * 表单配置（可选）
   * key 格式：'module.submodule.page'，例如 'org.users'
   */
  forms?: FormsConfig;

  /**
   * 服务配置（可选）
   * 用于统一管理 API 服务
   */
  service?: Record<string, any>;
}

/**
 * 应用级完整配置类型（包含 locale、columns、forms）
 */
export interface AppConfig {
  /**
   * 国际化配置
   */
  locale: LocaleConfig;

  /**
   * 表格列配置（可选）
   */
  columns?: ColumnsConfig;

  /**
   * 表单配置（可选）
   */
  forms?: FormsConfig;
}
