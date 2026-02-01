/**
 * 子应用国际化注册工具
 * 用于从 config.ts 提取国际化配置并注册到主应用
 * 让主应用能够访问子应用的国际化配置（特别是 app 和 menu 部分）
 */
;

import { LocaleConfigSchema, validateConfig } from '../../configs/schemas';
import { logger } from '../../utils/logger';

/**
 * 深度合并对象
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 判断对象是否是扁平化对象（包含点号分隔的键）
 */
function isFlatObject(obj: any): boolean {
  if (!isObject(obj)) {
    return false;
  }
  // 检查是否有键包含点号
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key.includes('.')) {
      return true;
    }
  }
  return false;
}

/**
 * 将嵌套对象转换为扁平化对象
 * 支持多层嵌套，如 { app: { loading: { title: "..." } } } -> { "app.loading.title": "..." }
 * 注意：app 对象现在使用扁平结构（如 app.loading_title），不再嵌套
 */
function flattenObject(obj: any, prefix = '', result: Record<string, string> = {}): Record<string, string> {
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
        // 在递归中，所有 subapp 的子属性（如 name）都会被处理为 subapp.name
        flattenObject(value, 'subapp', result);
        continue;
      }

      // 对于 subapp 对象的子属性（prefix === 'subapp'），如果值已经是字符串，直接设置（扁平结构）
      // 不再递归处理 subapp 下的嵌套对象
      if (prefix === 'subapp' && typeof value === 'string') {
        result[newKey] = value;
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 检查是否是函数对象（Vue I18n 编译后的函数消息）
        if (typeof value === 'function' || (typeof (value as any).call === 'function')) {
          // 如果是函数，尝试提取字符串值
          const locSource = (value as any).loc?.source;
          if (typeof locSource === 'string') {
            result[newKey] = locSource;
            continue;
          }
          const possibleSources = [
            (value as any).source,
            (value as any).message,
            (value as any).template,
          ];
          const source = possibleSources.find(s => typeof s === 'string');
          if (source) {
            result[newKey] = source;
            continue;
          }
          // 尝试调用函数
          try {
            const functionResult = typeof value === 'function' ? value({ normalize: (arr: any[]) => arr[0] }) : (value as any).call({ normalize: (arr: any[]) => arr[0] });
            if (typeof functionResult === 'string' && functionResult.trim() !== '') {
              result[newKey] = functionResult;
              continue;
            } else if (functionResult && typeof functionResult === 'object' && functionResult !== null && 'source' in functionResult && typeof functionResult.source === 'string') {
              result[newKey] = functionResult.source;
              continue;
            }
          } catch {
            // 如果函数调用失败，继续处理为普通对象
          }
        }
        // 优先检查 'source' 键（Vue I18n 编译后的函数消息）
        // 如果对象包含 'source' 键，直接提取字符串，不生成 .source 后缀的 key
        // 注意：必须使用 hasOwnProperty 检查，因为 'source' 可能不在对象自身属性中
        if (Object.prototype.hasOwnProperty.call(value, 'source') && typeof value.source === 'string') {
          result[newKey] = value.source;
          continue; // 跳过递归处理，避免生成 menu.procurement_module.source 这样的 key
        }
        // 使用 'in' 操作符检查（包括继承属性）
        if ('source' in value && typeof value.source === 'string') {
          result[newKey] = value.source;
          continue; // 跳过递归处理，避免生成 menu.procurement_module.source 这样的 key
        }
        // 如果对象包含 '_' 键，将其值设置为父键的值（用于父键同时有子键的情况）
        // 注意：设置后需要继续处理其他子键，不能直接 continue
        // 这样可以在扁平化时保留父键的值，同时处理子键
        if ('_' in value && typeof value._ === 'string' && value._.trim() !== '') {
          result[newKey] = value._;
          // 不 continue，继续处理其他子键（如 auxiliary、packaging 等）
        }
        // 递归处理嵌套对象（跳过 '_' 和 'source' 键以及元数据键）
        for (const subKey in value) {
          if (subKey !== '_' && subKey !== 'source' && Object.prototype.hasOwnProperty.call(value, subKey)) {
            // 跳过元数据键
            if (!['loc', 'key', 'type'].includes(subKey)) {
              const subValue = value[subKey];
              // 如果子值是函数，先尝试提取字符串
              if (typeof subValue === 'function') {
                let extracted = false;
                // 优先检查函数对象的 source 属性（使用 'in' 操作符，因为函数对象的属性可能不在 hasOwnProperty 中）
                if ('source' in subValue && typeof (subValue as any).source === 'string') {
                  result[`${newKey}.${subKey}`] = (subValue as any).source;
                  extracted = true;
                } else {
                  const locSource = (subValue as any).loc?.source;
                  if (typeof locSource === 'string') {
                    result[`${newKey}.${subKey}`] = locSource;
                    extracted = true;
                  } else {
                    const possibleSources = [
                      (subValue as any).message,
                      (subValue as any).template,
                    ];
                    const source = possibleSources.find(s => typeof s === 'string');
                    if (source) {
                      result[`${newKey}.${subKey}`] = source;
                      extracted = true;
                    } else {
                      // 尝试调用函数
                      try {
                        const functionResult = subValue({ normalize: (arr: any[]) => arr[0] });
                        if (typeof functionResult === 'string' && functionResult.trim() !== '') {
                          result[`${newKey}.${subKey}`] = functionResult;
                          extracted = true;
                        } else if (functionResult && typeof functionResult === 'object' && functionResult !== null && 'source' in functionResult && typeof functionResult.source === 'string') {
                          result[`${newKey}.${subKey}`] = functionResult.source;
                          extracted = true;
                        }
                      } catch {
                        // 如果函数调用失败，继续处理为普通对象
                      }
                    }
                  }
                }
                if (extracted) {
                  continue; // 跳过递归处理
                }
              }
              flattenObject(subValue, `${newKey}.${subKey}`, result);
            }
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
            } else {
              // 尝试调用函数获取字符串（Vue I18n 的 AST 格式函数）
              try {
                const functionResult = value({ normalize: (arr: any[]) => arr[0] });
                if (typeof functionResult === 'string' && functionResult.trim() !== '') {
                  result[newKey] = functionResult;
                } else if (functionResult && typeof functionResult === 'object' && functionResult !== null && 'source' in functionResult && typeof functionResult.source === 'string') {
                  // 如果函数返回的是对象，尝试提取 source
                  result[newKey] = functionResult.source;
                }
                // 如果调用失败或返回非字符串，静默跳过（这些消息在运行时会被 Vue I18n 正确处理）
              } catch {
                // 如果函数调用失败，静默跳过（这些消息在运行时会被 Vue I18n 正确处理）
              }
            }
          }
        } else {
          // 其他类型转换为字符串（但应该避免这种情况）
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
 * 特殊处理：如果 key 以 .source 结尾，将其值直接设置为父键的值
 * 关键：按键的深度排序，先处理深度更深的键（子键），再处理深度较浅的键（父键）
 * 这样可以避免在字符串上创建属性的错误
 */
function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  // 按键的深度排序：先处理深度更深的键（子键），再处理深度较浅的键（父键）
  // 这样可以确保在处理子键时，父键还没有被设置为字符串
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
      // 处理 .source 后缀的 key（如 menu.procurement_module.source -> menu.procurement_module）
      if (key.endsWith('.source')) {
        const parentKey = key.slice(0, -7); // 移除 '.source'
        const keys = parentKey.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!k) continue; // 跳过空键
          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            current = {};
          }
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串，需要转换为对象
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
        if (!lastKey) return result; // 如果 lastKey 为空，跳过
        // 如果目标键已经存在且是对象，将值设置到 _ 键中（但 source 键应该直接覆盖）
        // 如果目标键不存在或是字符串，直接设置字符串值
        if (lastKey in current && typeof current[lastKey] === 'object' && current[lastKey] !== null) {
          // 如果已经是对象，直接覆盖（source 键的优先级更高）
          current[lastKey] = flat[key];
        } else {
          current[lastKey] = flat[key];
        }
      } else if (key.endsWith('._')) {
        // 处理 ._ 后缀的 key（如 menu.procurement._ -> menu.procurement）
        // 这种键不应该出现在扁平化输入中，但如果出现了，应该将其值设置到父键的 _ 属性中
        // 注意：这种键通常是由 unflattenObject -> flattenObject 循环产生的，应该避免
        const parentKey = key.slice(0, -2); // 移除 '._'
        const keys = parentKey.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!k) continue; // 跳过空键
          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            current = {};
          }
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串，需要转换为对象
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
        if (!lastKey) continue; // 如果 lastKey 为空，跳过
        // 如果目标键已经存在且是对象，将值设置到 _ 键中
        // 如果目标键不存在，创建对象并设置 _ 键
        if (lastKey in current && typeof current[lastKey] === 'object' && current[lastKey] !== null) {
          current[lastKey]._ = flat[key];
        } else if (lastKey in current && typeof current[lastKey] === 'string') {
          // 如果目标键是字符串，转换为对象并设置 _ 键
          const stringValue = current[lastKey];
          current[lastKey] = { _: stringValue };
        } else {
          // 目标键不存在，创建对象并设置 _ 键
          current[lastKey] = { _: flat[key] };
        }
      } else {
        const keys = key.split('.');
        if (keys.length === 0) continue;

        let current = result;

        // 特殊处理：subapp 对象使用扁平结构（如 subapp.name），不需要嵌套
        // 如果键是 subapp.xxx 格式，且不是 subapp.xxx.yyy（三级或更深），直接设置为 subapp.xxx
        if (keys[0] === 'subapp' && keys.length === 2 && keys[1]) {
          // subapp 对象的扁平键（如 subapp.name），直接设置
          if (!result.subapp) {
            result.subapp = {};
          }
          result.subapp[keys[1]] = flat[key];
          continue;
        }

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!k || k.trim() === '') continue; // 跳过空键

          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            // 如果 current 不是对象，这不应该发生，但为了安全起见，创建一个新对象
            current = {};
          }
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串（可能是从 _ 键设置的），需要转换为对象
            // 将字符串值保存到 _ 键中，然后创建新对象
            const stringValue = current[k];
            current[k] = { _: stringValue };
          }
          current = current[k];
        }

        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          // 如果 current 不是对象，这不应该发生，但为了安全起见，创建一个新对象
          current = {};
        }
        const lastKey = keys[keys.length - 1];
        if (!lastKey || lastKey.trim() === '') continue; // 如果 lastKey 为空，跳过

        // 如果目标键已经存在
        if (lastKey in current) {
          if (typeof current[lastKey] === 'string') {
            // 如果当前键已经是字符串，但存在子键（因为按深度排序，子键先处理），需要转换为对象
            // 检查是否存在以当前键为前缀的其他键（子键）
            const hasChildKeys = sortedKeys.some(otherKey => {
              if (otherKey === key) return false;
              // 检查 otherKey 是否以 key + '.' 开头
              return otherKey.startsWith(key + '.');
            });

            if (hasChildKeys) {
              // 如果存在子键，将字符串值保存到 _ 键中，然后创建新对象
              // 这是 Vue I18n 需要的格式，用于处理父键同时有子键的情况
              const stringValue = current[lastKey];
              current[lastKey] = { _: stringValue };
              // 继续处理下一个键（不 continue，因为已经设置了 _ 键）
            } else {
              // 如果不存在子键，直接覆盖
              current[lastKey] = flat[key];
            }
          } else if (typeof current[lastKey] === 'object' && current[lastKey] !== null) {
            // 如果目标键已经是对象（包含子键），说明子键已经处理过了
            // 将父键的值保存到 _ 键中，这样父键和子键都能正确访问
            // 这是 Vue I18n 需要的格式，用于处理父键同时有子键的情况
            if (typeof flat[key] === 'string' && flat[key].trim() !== '') {
              current[lastKey]._ = flat[key];
            }
            // 继续处理下一个键（不 continue，因为已经设置了 _ 键）
          } else {
            // 其他情况直接覆盖
            current[lastKey] = flat[key];
          }
        } else {
          // 目标键不存在，直接设置
          current[lastKey] = flat[key];
        }
      }
    }
  }


  return result;
}

/**
 * 从 config.ts 文件中提取并合并国际化配置
 * @param configFiles 通过 import.meta.glob 加载的 config.ts 文件
 * @returns 扁平化的国际化消息对象 { 'zh-CN': {...}, 'en-US': {...} }
 */
function extractI18nFromConfigFiles(
  configFiles: Record<string, { default: any }>
): { 'zh-CN': Record<string, string>; 'en-US': Record<string, string> } {
  // 验证工具（开发和生产环境都启用）
  const validateLocaleConfig = (config: any, name: string) => {
    validateConfig(LocaleConfigSchema, config, name);
  };
  let mergedZhCN: any = {
    subapp: {},
    menu: {},
    page: {},
    common: {},
  };
  let mergedEnUS: any = {
    subapp: {},
    menu: {},
    page: {},
    common: {},
  };

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path]?.default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { app: {...}, menu: {...}, page: {...} }, 'en-US': {...} }
    if (path.includes('/locales/config.ts')) {
      // 开发和生产环境：验证配置结构
      if (validateLocaleConfig) {
        try {
          validateLocaleConfig(config, `应用级配置 (${path})`);
        } catch (error) {
          // 开发环境：抛出错误（帮助发现配置问题）
          if (import.meta.env.DEV) {
            throw error;
          }
          // 生产环境：记录警告并上报，但继续处理
          console.warn(`[extractI18nFromConfigFiles] 配置验证失败 (${path}):`, error);
          // 上报验证失败（异步，不阻塞）
          if (error instanceof Error && 'errors' in error) {
            import('../../utils/zod/reporting').then(({ reportValidationError }) => {
              reportValidationError(
                'config',
                `应用级配置 (${path})`,
                error as any,
                { configPath: path }
              );
            }).catch(() => {
              // 如果导入失败，静默跳过
            });
          }
        }
      }

      if (config && typeof config === 'object' && 'zh-CN' in config && config['zh-CN']) {
        mergedZhCN = deepMerge(mergedZhCN, config['zh-CN']);
      }
      if (config && typeof config === 'object' && 'en-US' in config && config['en-US']) {
        mergedEnUS = deepMerge(mergedEnUS, config['en-US']);
      }
    } else {
      // 处理模块级配置（src/modules/**/config.ts）
      const localeConfig = config.locale;

      if (localeConfig) {
        // 检查是否是扁平结构（包含 'zh-CN' 和 'en-US' 键）
        if (localeConfig['zh-CN'] || localeConfig['en-US']) {
          // 扁平结构：localeConfig['zh-CN'] 已经是扁平化的键值对
          // 直接合并到扁平化的结果中，不需要转换为嵌套结构再扁平化
          // 这样可以避免产生 _ 键（当同时存在父键和子键时）
          if (localeConfig['zh-CN']) {
            // 直接合并扁平化的键值对，不经过 unflattenObject 和 flattenObject
            // 这样可以避免产生 _ 键，与管理应用的 mergeConfigFiles 保持一致
            // 先将扁平化的键值对转换为嵌套结构，然后合并到 mergedZhCN
            const nested = unflattenObject(localeConfig['zh-CN']);
            mergedZhCN = deepMerge(mergedZhCN, nested);
          }
          if (localeConfig['en-US']) {
            // 直接合并扁平化的键值对，不经过 unflattenObject 和 flattenObject
            const nested = unflattenObject(localeConfig['en-US']);
            mergedEnUS = deepMerge(mergedEnUS, nested);
          }
        } else {
          // 旧格式：嵌套结构（兼容处理）
          // 页面级配置通常只包含 page 配置，但可能也包含 app、menu 和 common（用于覆盖）
          if (localeConfig.app) {
            mergedZhCN.app = deepMerge(mergedZhCN.app, localeConfig.app);
            mergedEnUS.app = deepMerge(mergedEnUS.app, localeConfig.app || {});
          }
          if (localeConfig.menu) {
            mergedZhCN.menu = deepMerge(mergedZhCN.menu, localeConfig.menu);
            mergedEnUS.menu = deepMerge(mergedEnUS.menu, localeConfig.menu || {});
          }
          if (localeConfig.page) {
            mergedZhCN.page = deepMerge(mergedZhCN.page, localeConfig.page);
            // 页面级配置通常只有中文，如果需要英文可以扩展
            // 暂时使用中文配置作为英文的占位符
            mergedEnUS.page = deepMerge(mergedEnUS.page, localeConfig.page || {});
          }
          if (localeConfig.common) {
            mergedZhCN.common = deepMerge(mergedZhCN.common, localeConfig.common);
            mergedEnUS.common = deepMerge(mergedEnUS.common, localeConfig.common || {});
          }
        }
      }
    }
  }

  // 转换为扁平化结构
  const flatZhCN = flattenObject(mergedZhCN);
  const flatEnUS = flattenObject(mergedEnUS);


  return {
    'zh-CN': flatZhCN,
    'en-US': flatEnUS,
  };
}

/**
 * 注册子应用的国际化消息获取器
 * 从 config.ts 文件中提取国际化配置并注册到全局，供主应用使用
 *
 * @param appId 子应用 ID（如 'system', 'logistics' 等）
 * @param configFiles 通过 import.meta.glob 加载的 config.ts 文件
 * @param additionalMessages 额外的国际化消息（可选，用于合并 JSON 文件等）
 *
 * @example
 * 在子应用的 i18n/getters.ts 中使用：
 * import { registerSubAppI18n, logger } from '@btc/shared-core/composables/subapp-i18n';
 * const configFiles = import.meta.glob('../locales/config.ts', { eager: true });
 * registerSubAppI18n('system', configFiles);
 */
export function registerSubAppI18n(
  appId: string,
  configFiles: Record<string, { default: any }>,
  additionalMessages?: {
    'zh-CN'?: Record<string, any>;
    'en-US'?: Record<string, any>;
  }
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 从 config.ts 提取国际化配置（返回扁平化对象）
    const configMessages = extractI18nFromConfigFiles(configFiles);


    // 将扁平化的 configMessages 转换为嵌套对象
    const configMessagesZhCN = unflattenObject(configMessages['zh-CN']);
    const configMessagesEnUS = unflattenObject(configMessages['en-US']);


    // 合并额外的消息（如果有）
    // 注意：additionalMessages 可能是扁平化对象（如 JSON 文件），需要先转换为嵌套对象
    const additionalZhCN = additionalMessages?.['zh-CN']
      ? (isFlatObject(additionalMessages['zh-CN'])
          ? unflattenObject(additionalMessages['zh-CN'] as Record<string, any>)
          : additionalMessages['zh-CN'])
      : undefined;
    const additionalEnUS = additionalMessages?.['en-US']
      ? (isFlatObject(additionalMessages['en-US'])
          ? unflattenObject(additionalMessages['en-US'] as Record<string, any>)
          : additionalMessages['en-US'])
      : undefined;

    const mergedMessages = {
      'zh-CN': additionalZhCN
        ? deepMerge(configMessagesZhCN, additionalZhCN)
        : configMessagesZhCN,
      'en-US': additionalEnUS
        ? deepMerge(configMessagesEnUS, additionalEnUS)
        : configMessagesEnUS,
    };

    // 创建获取器函数
    const getLocaleMessages = () => mergedMessages;

    // 注册到全局
    if (!(window as any).__SUBAPP_I18N_GETTERS__) {
      (window as any).__SUBAPP_I18N_GETTERS__ = new Map();
    }

    (window as any).__SUBAPP_I18N_GETTERS__.set(appId, getLocaleMessages);
  } catch (error) {
    logger.error(`[registerSubAppI18n] 注册 ${appId} 的国际化消息获取器失败:`, error);
  }
}
