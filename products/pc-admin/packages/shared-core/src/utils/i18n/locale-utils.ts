/**
 * 国际化消息处理工具函数
 * 统一封装各应用 getters.ts 中的重复逻辑
 */

/**
 * 判断是否为对象
 */
export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 深度合并对象
 * 处理字符串和对象的冲突：如果 target[key] 是字符串，source[key] 是对象，用对象覆盖字符串
 * 如果 target[key] 是对象，source[key] 是字符串，用字符串覆盖对象（允许覆盖）
 */
export function deepMerge(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    // 如果 target 或 source 不是对象，直接返回 source（覆盖 target）
    return source;
  }
  
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];
    
    if (isObject(sourceValue)) {
      // source[key] 是对象
      if (!(key in target)) {
        // target 中没有这个 key，直接使用 source 的值
        output[key] = sourceValue;
      } else if (isObject(targetValue)) {
        // target[key] 也是对象，递归合并
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        // target[key] 是字符串或其他类型，用对象覆盖
        // 如果 target[key] 是字符串，可以将其保存到 _ 属性中（兼容处理）
        if (typeof targetValue === 'string') {
          output[key] = { _: targetValue, ...sourceValue };
        } else {
          output[key] = sourceValue;
        }
      }
    } else {
      // source[key] 是字符串或其他类型
      if (!(key in target)) {
        // target 中没有这个 key，直接使用 source 的值
        output[key] = sourceValue;
      } else if (isObject(targetValue)) {
        // target[key] 是对象，source[key] 是字符串，用字符串覆盖对象
        // 但保留对象中的其他属性（如果有 _ 属性，更新它）
        if (typeof sourceValue === 'string') {
          output[key] = { ...targetValue, _: sourceValue };
        } else {
          output[key] = sourceValue;
        }
      } else {
        // target[key] 和 source[key] 都是字符串或其他类型，直接覆盖
        output[key] = sourceValue;
      }
    }
  });
  
  return output;
}

/**
 * 将嵌套对象转换为扁平化对象
 * 支持多层嵌套，如 { app: { loading: { title: "..." } } } -> { "app.loading.title": "..." }
 */
export function flattenObject(obj: any, prefix = '', result: Record<string, string> = {}): Record<string, string> {
  // 如果 obj 本身是字符串，直接设置
  if (typeof obj === 'string' && prefix) {
    result[prefix] = obj;
    return result;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      // 如果当前键是 'subapp'，且值是对象，需要特殊处理其子属性（扁平结构）
      if (key === 'subapp' && value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 递归处理 subapp 对象的子属性，使用 'subapp' 作为前缀
        flattenObject(value, 'subapp', result);
        continue;
      }

      // 对于 subapp 对象的子属性（prefix === 'subapp'），如果值已经是字符串，直接设置（扁平结构）
      if (prefix === 'subapp' && typeof value === 'string') {
        result[newKey] = value;
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 如果对象包含 '_' 键，将其值设置为父键的值
        if ('_' in value && typeof value._ === 'string') {
          result[newKey] = value._;
        }
        // 递归处理嵌套对象（跳过 '_' 键）
        for (const subKey in value) {
          if (subKey !== '_' && Object.prototype.hasOwnProperty.call(value, subKey)) {
            flattenObject(value[subKey], `${newKey}.${subKey}`, result);
          }
        }
      } else if (value !== null && value !== undefined) {
        // 处理各种类型的值
        if (typeof value === 'string') {
          result[newKey] = value;
        } else if (typeof value === 'function') {
          // Vue I18n 编译时优化，某些消息会被编译为函数
          // 优先从 loc.source 获取原始消息模板（最可靠的方法，避免复杂的函数调用）
          const locSource = (value as any).loc?.source;
          if (typeof locSource === 'string') {
            result[newKey] = locSource;
          } else {
            // 如果没有 loc.source，尝试从其他可能的属性获取
            const possibleSources = [
              (value as any).source,
              (value as any).message,
              (value as any).template,
            ];

            const source = possibleSources.find(s => typeof s === 'string');
            if (source) {
              result[newKey] = source;
            }
            // 如果所有方法都失败，静默跳过（这些是包含命名参数的消息，运行时会被正确翻译）
          }
        } else {
          // 其他类型转换为字符串
          result[newKey] = String(value);
        }
      }
    }
  }
  return result;
}

/**
 * 将扁平化对象转换为嵌套对象
 * 支持点号分隔的键，如 { "app.loading.title": "..." } -> { app: { loading: { title: "..." } } }
 * 关键：按键的深度排序，先处理深度更深的键（子键），再处理深度较浅的键（父键）
 * 这样可以避免在字符串上创建属性的错误（如 menu.access 是字符串，但又有 menu.access.config）
 */
export function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  // 按键的深度排序：先处理深度更深的键（子键），再处理深度较浅的键（父键）
  const sortedKeys = Object.keys(flat).sort((a, b) => {
    const depthA = a.split('.').length;
    const depthB = b.split('.').length;
    // 深度更深的键排在前面
    if (depthA !== depthB) {
      return depthB - depthA;
    }
    // 如果深度相同，按字母顺序排序
    return a.localeCompare(b);
  });

  for (const key of sortedKeys) {
    if (Object.prototype.hasOwnProperty.call(flat, key)) {
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        
        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          current = {};
        }
        
        if (!(k in current)) {
          current[k] = {};
        } else if (typeof current[k] === 'string') {
          // 如果当前键已经是字符串，需要转换为对象 { _: stringValue }
          // 这样可以允许在父键上设置子键（如 menu.access 是字符串，但又有 menu.access.config）
          const stringValue = current[k];
          current[k] = { _: stringValue };
        }
        
        current = current[k];
      }
      
      // 确保 current 是对象
      if (typeof current !== 'object' || current === null || Array.isArray(current)) {
        current = {};
      }
      
      const lastKey = keys[keys.length - 1];
      
      // 如果目标键已经存在且是字符串，需要转换为对象
      if (lastKey in current && typeof current[lastKey] === 'string') {
        const stringValue = current[lastKey];
        current[lastKey] = { _: stringValue };
        // 然后设置新值（覆盖 _ 键）
        current[lastKey] = flat[key];
      } else if (lastKey in current && typeof current[lastKey] === 'object' && current[lastKey] !== null) {
        // 如果已经是对象，说明之前已经创建了子键（如 inventory.data_source.bom）
        // 此时如果新值是字符串，需要判断：
        // 1. 如果对象中没有其他属性（只有 _ 属性），可以直接设置字符串值
        // 2. 如果对象中有其他属性，应该保存到 _ 属性中，而不是覆盖整个对象
        if (typeof flat[key] === 'string') {
          // 检查对象中是否有除了 _ 之外的其他属性
          const otherKeys = Object.keys(current[lastKey]).filter(k => k !== '_');
          if (otherKeys.length === 0) {
            // 如果对象中只有 _ 属性或没有属性，直接设置字符串值（覆盖对象）
            current[lastKey] = flat[key];
          } else {
            // 如果对象中有其他属性，保存到 _ 属性中（保留对象结构）
            current[lastKey]._ = flat[key];
          }
        } else {
          // 如果新值也是对象，合并它们
          current[lastKey] = { ...current[lastKey], ...flat[key] };
        }
      } else {
        current[lastKey] = flat[key];
      }
    }
  }
  
  return result;
}

/**
 * 浅合并消息对象（使用 Object.assign）
 */
export function mergeMessages<T extends Record<string, any>>(...sources: T[]): T {
  return Object.assign({}, ...sources.filter(Boolean)) as T;
}

/**
 * 从 config.ts 文件中提取并合并国际化配置
 * 与管理应用保持一致，直接使用扁平化结构存储
 */
export function mergeConfigFiles(configFiles: Record<string, { default: any }>): { zhCN: Record<string, string>; enUS: Record<string, string> } {
  // 直接使用扁平化结构存储，避免多次转换
  let flatZhCN: Record<string, string> = {};
  let flatEnUS: Record<string, string> = {};

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { app: {...}, menu: {...}, page: {...} }, 'en-US': {...} }
    if (path.includes('/locales/config.ts')) {
      if (config['zh-CN']) {
        const flat = flattenObject(config['zh-CN']);
        flatZhCN = { ...flatZhCN, ...flat };
      }
      if (config['en-US']) {
        const flat = flattenObject(config['en-US']);
        flatEnUS = { ...flatEnUS, ...flat };
      }
    } else {
      // 处理模块级配置（src/modules/**/config.ts）
      const localeConfig = config.locale;

      if (localeConfig) {
        // 检查是否是扁平结构（包含 'zh-CN' 和 'en-US' 键）
        if (localeConfig['zh-CN'] || localeConfig['en-US']) {
          // 扁平结构：localeConfig['zh-CN'] 已经是扁平化的键值对，直接合并
          if (localeConfig['zh-CN']) {
            flatZhCN = { ...flatZhCN, ...localeConfig['zh-CN'] };
          }
          if (localeConfig['en-US']) {
            flatEnUS = { ...flatEnUS, ...localeConfig['en-US'] };
          }
        } else {
          // 旧格式：嵌套结构（兼容处理）
          // 先转换为嵌套结构，再扁平化
          let nestedZhCN: any = {};
          let nestedEnUS: any = {};
          
          // 页面级配置可能包含 app 和 menu（用于覆盖）
          if (localeConfig.app) {
            nestedZhCN.app = deepMerge(nestedZhCN.app || {}, localeConfig.app);
            nestedEnUS.app = deepMerge(nestedEnUS.app || {}, localeConfig.app || {});
          }
          if (localeConfig.menu) {
            nestedZhCN.menu = deepMerge(nestedZhCN.menu || {}, localeConfig.menu);
            nestedEnUS.menu = deepMerge(nestedEnUS.menu || {}, localeConfig.menu || {});
          }
          // 将模块配置直接合并到顶层（不再使用 page 层级）
          // localeConfig 中除了 app 和 menu 之外的所有键都是模块配置
          for (const key in localeConfig) {
            if (key !== 'app' && key !== 'menu' && key !== 'page') {
              // 直接合并模块配置到顶层
              if (!nestedZhCN[key]) {
                nestedZhCN[key] = {};
              }
              if (!nestedEnUS[key]) {
                nestedEnUS[key] = {};
              }
              nestedZhCN[key] = deepMerge(nestedZhCN[key], localeConfig[key]);
              nestedEnUS[key] = deepMerge(nestedEnUS[key], localeConfig[key] || {});
            }
          }
          // 兼容旧格式：如果还有 page 层级，也处理（逐步迁移）
          if (localeConfig.page) {
            // 将 page 下的内容直接合并到顶层
            for (const moduleKey in localeConfig.page) {
              if (!nestedZhCN[moduleKey]) {
                nestedZhCN[moduleKey] = {};
              }
              if (!nestedEnUS[moduleKey]) {
                nestedEnUS[moduleKey] = {};
              }
              nestedZhCN[moduleKey] = deepMerge(nestedZhCN[moduleKey], localeConfig.page[moduleKey]);
              nestedEnUS[moduleKey] = deepMerge(nestedEnUS[moduleKey], localeConfig.page[moduleKey] || {});
            }
          }
          
          // 扁平化嵌套结构并合并
          const flat = flattenObject(nestedZhCN);
          flatZhCN = { ...flatZhCN, ...flat };
          const flatEn = flattenObject(nestedEnUS);
          flatEnUS = { ...flatEnUS, ...flatEn };
        }
      }
    }
  }

  // 返回扁平化结构
  return {
    zhCN: flatZhCN,
    enUS: flatEnUS,
  };
}
