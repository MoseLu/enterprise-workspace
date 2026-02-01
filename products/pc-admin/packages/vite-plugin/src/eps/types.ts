/**
 * EPS 插件类型定义
 * 参考 cool-admin 的完整类型体系
 */

export interface EpsColumn {
  /**
   * 属性名
   */
  propertyName: string;
  /**
   * 字段注释
   */
  comment?: string;
  /**
   * 字段类型
   */
  type: string;
  /**
   * 是否可为空
   */
  nullable?: boolean;
  /**
   * 字段源（数据库字段名）
   */
  source?: string;
  /**
   * 字典类型
   * 如果为 true，表示该字段是字典字段，需要从字典接口获取选项
   * 如果为数组，表示字典选项数组 [{label: string, value: any}]
   */
  dict?: boolean | Array<{label: string, value: any}>;
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 最大长度
   */
  maxLength?: number;
  /**
   * 最小值
   */
  minValue?: number;
  /**
   * 最大值
   */
  maxValue?: number;
}

export interface EpsSearch {
  /**
   * 精确匹配字段
   */
  fieldEq: EpsColumn[];
  /**
   * 模糊匹配字段
   */
  fieldLike: EpsColumn[];
  /**
   * 关键词匹配字段
   */
  keyWordLikeFields: EpsColumn[];
}

export interface EpsApi {
  /**
   * API 名称
   */
  name: string;
  /**
   * HTTP 方法
   */
  method: string;
  /**
   * API 路径
   */
  path: string;
  /**
   * API 描述
   */
  summary?: string;
  /**
   * 类型定义
   */
  dts?: {
    parameters?: Array<{
      name: string;
      description?: string;
      required?: boolean;
      schema: { type: string; [key: string]: any };
    }>;
  };
}

export interface EpsEntity {
  /**
   * API 前缀路径
   */
  prefix: string;
  /**
   * 实体名称
   */
  name: string;
  /**
   * API 列表
   */
  api: EpsApi[];
  /**
   * 实体字段
   */
  columns?: EpsColumn[];
  /**
   * 分页查询字段
   */
  pageColumns?: EpsColumn[];
  /**
   * 搜索配置
   */
  search?: EpsSearch;
  /**
   * 分页查询操作配置
   */
  pageQueryOp?: {
    fieldEq?: string[] | Array<{ field: string; value?: any }>;
    fieldLike?: string[] | Array<{ field: string; value?: any }>;
    keyWordLikeFields?: string[] | Array<{ field: string; value?: any }>;
  };
  /**
   * 命名空间
   */
  namespace?: string;
  /**
   * 权限配置
   */
  permission?: Record<string, string>;
}

export interface EpsData {
  [moduleName: string]: EpsEntity[];
}

export interface TypeMapping {
  /**
   * 测试条件
   */
  test?: string[];
  /**
   * 目标类型
   */
  type: string;
  /**
   * 自定义映射函数
   */
  custom?: (params: { propertyName: string; type: string }) => string | null;
}

export interface EpsConfig {
  /**
   * 是否启用
   */
  enable: boolean;
  /**
   * EPS API URL，空字符串表示使用本地Mock
   */
  api?: string;
  /**
   * 输出目录
   */
  dist?: string;
  /**
   * 类型映射配置
   */
  mapping?: TypeMapping[];
  /**
   * 是否生成字典类型
   */
  dict?: boolean;
  /**
   * 字典接口 URL，默认：/api/system/auth/dict
   */
  dictApi?: string;
  /**
   * 共享的 EPS 数据源目录（用于从 main-app 读取 EPS 数据）
   * 如果指定，将优先从此目录读取 EPS 数据，而不是从当前应用的 dist 读取
   */
  sharedEpsDir?: string;
}

export interface EpsPluginOptions {
  /**
   * EPS 元数据 URL
   */
  epsUrl: string;
  /**
   * 输出目录
   */
  outputDir?: string;
  /**
   * 是否监听变化
   */
  watch?: boolean;
  /**
   * 字典接口 URL，默认：/api/system/auth/dict
   */
  dictApi?: string;
  /**
   * 共享的 EPS 数据源目录（用于从 main-app 读取 EPS 数据）
   * 如果指定，将优先从此目录读取 EPS 数据，而不是从当前应用的 outputDir 读取
   */
  sharedEpsDir?: string;
}

export interface ServiceTree {
  [key: string]: any;
  namespace?: string;
  permission?: Record<string, string>;
  search?: EpsSearch;
  request?: any;
}
