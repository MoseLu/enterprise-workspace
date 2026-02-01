/**
 * EPS Columns 转换工具
 * 提供将 EPS columns 转换为 TableColumn 和 FormItem 的工具函数
 */
;

import type { TableColumn } from '@btc/shared-components';
import type { FormItem } from '@btc/shared-components';

/**
 * EPS 列类型定义（与 @btc/vite-plugin 中的 EpsColumn 保持一致）
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
  dict?: boolean | Array<{label: string; value: any}>;
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

/**
 * 从 EPS service 中获取指定路径的 columns
 * @param servicePath EPS 服务路径，例如 'logistics.warehouse.material' 或 ['logistics', 'warehouse', 'material']
 * @param serviceRoot EPS 服务根对象
 * @param epsList 可选的 EPS 实体列表，如果不提供则尝试从全局获取
 * @returns 合并后的 columns 数组（包含 columns 和 pageColumns）
 */
export function getEpsColumns(
  servicePath: string | string[],
  serviceRoot: any,
  epsList?: any[]
): EpsColumn[] {
  // 解析服务路径
  const pathArray = Array.isArray(servicePath) ? servicePath : servicePath.split('.');

  // 获取服务节点
  let serviceNode: any = serviceRoot;
  for (const key of pathArray) {
    if (!serviceNode || typeof serviceNode !== 'object') {
      throw new Error(
        `[getEpsColumns] EPS 服务路径 ${servicePath} 不存在，无法找到 ${key}`
      );
    }
    serviceNode = serviceNode[key];
  }

  if (!serviceNode || typeof serviceNode !== 'object') {
    throw new Error(
      `[getEpsColumns] EPS 服务 ${servicePath} 不存在或格式不正确`
    );
  }

  // 从 EPS list 中查找对应的实体
  // 通过 namespace 匹配
  const namespace = serviceNode.namespace;
  if (!namespace) {
    throw new Error(
      `[getEpsColumns] EPS 服务 ${servicePath} 没有 namespace 属性`
    );
  }

  // 获取 EPS list
  let list = epsList;
  if (!list) {
    // 尝试从 serviceRoot 获取
    list = (serviceRoot as any)?._epsList || [];
    
    // 如果还是没有，尝试从全局获取
    if (list.length === 0 && typeof window !== 'undefined') {
      // 尝试从 window.__EPS_LIST__ 获取
      list = (window as any).__EPS_LIST__ || [];
    }
  }

  const entity = list.find((e: any) => {
    const normalizedNs = (e.prefix || e.namespace || '').startsWith('/')
      ? (e.prefix || e.namespace || '')
      : `/${e.prefix || e.namespace || ''}`;
    const normalizedTarget = namespace.startsWith('/') ? namespace : `/${namespace}`;
    return normalizedNs === normalizedTarget;
  });

  if (!entity) {
    console.warn(`[getEpsColumns] 未找到对应的 EPS 实体，namespace: ${namespace}`);
    return [];
  }

  // 合并 columns 和 pageColumns
  const allColumns = [
    ...(entity.columns || []),
    ...(entity.pageColumns || []),
  ];

  return allColumns;
}

/**
 * 将 EPS columns 转换为 TableColumn 格式
 * @param epsColumns EPS columns 数组
 * @param options 转换选项
 * @returns TableColumn 数组
 */
export function epsColumnsToTableColumns(
  epsColumns: EpsColumn[],
  options?: {
    localePrefix?: string;
    excludeFields?: string[];
    includeFields?: string[];
  }
): TableColumn[] {
  const { localePrefix, excludeFields = [], includeFields } = options || {};

  return epsColumns
    .filter((col) => {
      // 如果指定了 includeFields，只包含指定的字段
      if (includeFields && includeFields.length > 0) {
        return includeFields.includes(col.propertyName);
      }
      // 排除指定的字段
      return !excludeFields.includes(col.propertyName);
    })
    .map((col) => {
      const column: TableColumn = {
        prop: col.propertyName,
        label: localePrefix
          ? `${localePrefix}.${col.propertyName}`
          : col.comment || col.propertyName,
        minWidth: 120,
        showOverflowTooltip: true,
      };

      // 处理字典字段
      if (col.dict && Array.isArray(col.dict) && col.dict.length > 0) {
        column.dict = col.dict;
        column.dictColor = true; // 默认使用彩色标签
      }

      // 根据字段类型设置宽度
      if (col.type === 'datetime' || col.type === 'date' || col.type === 'timestamp') {
        column.width = 180;
      } else if (col.type === 'boolean' || col.type === 'bool') {
        column.width = 100;
      } else if (col.maxLength && col.maxLength > 100) {
        column.minWidth = 180;
      }

      return column;
    });
}

/**
 * 根据字段类型和属性选择合适的组件
 */
function getComponentForColumn(col: EpsColumn): {
  name: string;
  props?: Record<string, any>;
  options?: any[];
} {
  // 处理字典字段
  if (col.dict && Array.isArray(col.dict) && col.dict.length > 0) {
    // 如果选项少于等于 4 个，使用 radio-group，否则使用 select
    if (col.dict.length <= 4) {
      return {
        name: 'el-radio-group',
        props: {},
      };
    } else {
      return {
        name: 'el-select',
        props: {
          clearable: true,
          filterable: true,
        },
        options: col.dict,
      };
    }
  }

  // 根据字段类型选择组件
  switch (col.type) {
    case 'datetime':
    case 'date':
    case 'timestamp':
      return {
        name: 'el-date-picker',
        props: {
          type: col.type === 'date' ? 'date' : 'datetime',
          valueFormat: col.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
          clearable: true,
        },
      };
    case 'boolean':
    case 'bool':
      return {
        name: 'el-switch',
        props: {},
      };
    case 'int':
    case 'integer':
    case 'decimal':
    case 'bigint':
    case 'long':
    case 'number':
      return {
        name: 'el-input-number',
        props: {
          controlsPosition: 'right',
          precision: col.type === 'decimal' ? 2 : 0,
        },
      };
    case 'text':
      return {
        name: 'el-input',
        props: {
          type: 'textarea',
          rows: 3,
          maxlength: col.maxLength,
        },
      };
    default:
      return {
        name: 'el-input',
        props: {
          maxlength: col.maxLength,
        },
      };
  }
}

/**
 * 将 EPS columns 转换为 FormItem 格式
 * @param epsColumns EPS columns 数组
 * @param options 转换选项
 * @returns FormItem 数组
 */
export function epsColumnsToFormItems(
  epsColumns: EpsColumn[],
  options?: {
    localePrefix?: string;
    excludeFields?: string[];
    includeFields?: string[];
    defaultSpan?: number;
  }
): FormItem[] {
  const { localePrefix, excludeFields = [], includeFields, defaultSpan = 12 } = options || {};

  return epsColumns
    .filter((col) => {
      // 如果指定了 includeFields，只包含指定的字段
      if (includeFields && includeFields.length > 0) {
        return includeFields.includes(col.propertyName);
      }
      // 排除指定的字段
      return !excludeFields.includes(col.propertyName);
    })
    .map((col) => {
      const component = getComponentForColumn(col);

      const item: FormItem = {
        prop: col.propertyName,
        label: localePrefix
          ? `${localePrefix}.${col.propertyName}`
          : col.comment || col.propertyName,
        span: defaultSpan,
        component,
      };

      // 处理必填字段
      if (col.nullable === false) {
        item.required = true;
      }

      // 处理默认值
      if (col.defaultValue !== undefined && col.defaultValue !== null) {
        item.value = col.defaultValue;
      }

      // 处理验证规则
      const rules: any[] = [];
      if (col.nullable === false) {
        rules.push({
          required: true,
          message: `请输入${col.comment || col.propertyName}`,
          trigger: 'blur',
        });
      }
      if (col.maxLength) {
        rules.push({
          max: col.maxLength,
          message: `最多输入${col.maxLength}个字符`,
          trigger: 'blur',
        });
      }
      if (col.minValue !== undefined || col.maxValue !== undefined) {
        rules.push({
          type: 'number',
          min: col.minValue,
          max: col.maxValue,
          message: `数值范围：${col.minValue !== undefined ? col.minValue : '-∞'} ~ ${col.maxValue !== undefined ? col.maxValue : '+∞'}`,
          trigger: 'blur',
        });
      }
      if (rules.length > 0) {
        item.rules = rules.length === 1 ? rules[0] : rules;
      }

      return item;
    });
}

/**
 * 从 EPS service 生成完整的配置
 * @param servicePath EPS 服务路径
 * @param serviceRoot EPS 服务根对象
 * @param options 配置选项
 * @returns 包含 columns 和 forms 的配置对象
 */
export function generateConfigFromEps(
  servicePath: string | string[],
  serviceRoot: any,
  options?: {
    localePrefix?: string;
    excludeFields?: string[];
    includeFields?: string[];
    defaultSpan?: number;
    epsList?: any[]; // 可选的 EPS 实体列表
    overrides?: {
      columns?: Record<string, Partial<TableColumn>>;
      forms?: Record<string, Partial<FormItem>>;
    };
  }
): {
  columns: TableColumn[];
  forms: FormItem[];
} {
  // 获取 EPS columns
  const epsColumns = getEpsColumns(servicePath, serviceRoot, options?.epsList);

  // 转换为 TableColumn
  let tableColumns = epsColumnsToTableColumns(epsColumns, {
    localePrefix: options?.localePrefix,
    excludeFields: options?.excludeFields,
    includeFields: options?.includeFields,
  });

  // 转换为 FormItem
  let formItems = epsColumnsToFormItems(epsColumns, {
    localePrefix: options?.localePrefix,
    excludeFields: options?.excludeFields,
    includeFields: options?.includeFields,
    defaultSpan: options?.defaultSpan,
  });

  // 应用覆盖配置
  if (options?.overrides) {
    // 覆盖 columns
    if (options.overrides.columns) {
      tableColumns = tableColumns.map((col) => {
        const override = options.overrides!.columns![col.prop!];
        return override ? { ...col, ...override } : col;
      });
    }

    // 覆盖 forms
    if (options.overrides.forms) {
      formItems = formItems.map((item) => {
        const override = options.overrides!.forms![item.prop];
        return override ? { ...item, ...override } : item;
      });
    }
  }

  return {
    columns: tableColumns,
    forms: formItems,
  };
}

/**
 * 从 EPS 数据中合并字典数据到现有的表格列配置
 * @param columns 现有的表格列配置
 * @param servicePath EPS 服务路径
 * @param serviceRoot EPS 服务根对象
 * @param epsList 可选的 EPS 实体列表
 * @returns 合并后的表格列配置
 */
export function mergeEpsDictIntoColumns(
  columns: TableColumn[],
  servicePath: string | string[],
  serviceRoot: any,
  epsList?: any[]
): TableColumn[] {
  // 获取 EPS columns
  const epsColumns = getEpsColumns(servicePath, serviceRoot, epsList);
  
  // 创建 EPS columns 的映射（按 propertyName）
  const epsDictMap = new Map<string, Array<{label: string, value: any}>>();
  epsColumns.forEach((col) => {
    if (col.dict && Array.isArray(col.dict) && col.dict.length > 0) {
      epsDictMap.set(col.propertyName, col.dict);
    }
  });
  
  // 合并字典数据到现有 columns
  return columns.map((col) => {
    if (!col.prop) return col;
    
    const dictData = epsDictMap.get(col.prop);
    if (dictData) {
      return {
        ...col,
        dict: dictData,
        dictColor: col.dictColor !== undefined ? col.dictColor : true, // 如果未设置，默认启用彩色标签
      };
    }
    
    return col;
  });
}

/**
 * 从 EPS 数据中合并字典数据到现有的表单项配置
 * @param formItems 现有的表单项配置
 * @param servicePath EPS 服务路径
 * @param serviceRoot EPS 服务根对象
 * @param epsList 可选的 EPS 实体列表
 * @returns 合并后的表单项配置
 */
export function mergeEpsDictIntoFormItems(
  formItems: FormItem[],
  servicePath: string | string[],
  serviceRoot: any,
  epsList?: any[]
): FormItem[] {
  // 获取 EPS columns
  const epsColumns = getEpsColumns(servicePath, serviceRoot, epsList);
  
  // 创建 EPS columns 的映射（按 propertyName）
  const epsDictMap = new Map<string, Array<{label: string, value: any}>>();
  epsColumns.forEach((col) => {
    if (col.dict && Array.isArray(col.dict) && col.dict.length > 0) {
      epsDictMap.set(col.propertyName, col.dict);
    }
  });
  
  // 合并字典数据到现有 formItems
  return formItems.map((item) => {
    if (!item.prop) return item;
    
    const dictData = epsDictMap.get(item.prop);
    if (dictData) {
      // 如果表单项已经有 component 配置，更新其 options
      // 如果没有 component 配置，创建一个 el-select 组件
      const existingComponent = item.component;
      
      if (existingComponent && typeof existingComponent === 'object') {
        // 已有 component 配置，更新 options
        const componentName = existingComponent.name || 'el-select';
        return {
          ...item,
          component: {
            ...existingComponent,
            name: componentName,
            options: dictData,
            props: {
              ...(existingComponent.props || {}),
              clearable: existingComponent.props?.clearable !== undefined ? existingComponent.props.clearable : true,
              ...(componentName === 'el-select' && existingComponent.props?.filterable === undefined ? { filterable: true } : {}),
            },
          },
        };
      } else {
        // 没有 component 配置，创建一个 el-select 组件
        return {
          ...item,
          component: {
            name: 'el-select',
            options: dictData,
            props: {
              clearable: true,
              filterable: true,
            },
          },
        };
      }
    }
    
    return item;
  });
}
