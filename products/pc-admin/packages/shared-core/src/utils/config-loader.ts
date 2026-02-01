/**
 * 配置加载工具函数
 * 用于从 config.ts 读取 columns 和 forms 配置
 */
;

import { computed, type ComputedRef } from 'vue';
import { useI18n } from '../btc/plugins/i18n';
import type { TableColumn, FormItem } from '@btc/shared-components';
import type {
  TableColumnConfig,
  FormItemConfig,
  PageConfig,
} from '../../../../types/locale';
import { useServiceWithConfirm } from '../composables/useServiceWithConfirm';

/**
 * 配置注册表
 * 用于存储已加载的页面配置
 */
const configRegistry = new Map<string, PageConfig>();

/**
 * 从文件路径提取页面键
 * 例如：'../modules/platform/org/config.ts' -> 'org'
 * 或者：'../modules/platform/org/views/users/config.ts' -> 'org.users'
 */
function extractPageKeyFromPath(filePath: string): string | null {
  // 匹配 modules/{module}/{submodule}/config.ts 或 modules/{module}/{submodule}/views/{page}/config.ts
  const match = filePath.match(/modules\/([^/]+)\/([^/]+)(?:\/views\/([^/]+))?\/config\.ts$/);
  if (match) {
    const [, , submodule, page] = match;
    return page ? `${submodule}.${page}` : (submodule ?? null);
  }
  return null;
}

/**
 * 初始化配置注册表
 * 使用 import.meta.glob 动态加载所有 config.ts 文件
 * 注意：这个函数需要在应用初始化时调用
 */
export function initConfigRegistry(): void {
  // 使用 import.meta.glob 扫描所有 config.ts 文件
  // 注意：这个需要在应用代码中调用，因为 import.meta.glob 需要在模块上下文中
  // 这里提供一个辅助函数，实际加载在应用代码中完成
}

/**
 * 注册页面配置
 * @param pageKey 页面键，格式：'module.submodule.page'，例如 'org.users'
 * @param config 页面配置
 */
export function registerPageConfig(pageKey: string, config: PageConfig): void {
  configRegistry.set(pageKey, config);
}

/**
 * 检查路径是否应该被跳过（非页面配置文件）
 * @param path 文件路径
 * @param config 配置对象（可选，用于判断是否包含页面配置）
 * @returns 是否应该跳过
 */
function shouldSkipPath(path: string, config?: any): boolean {
  // 跳过 locales/config.ts（国际化配置文件，不是页面配置）
  if (path.includes('/locales/config.ts') || path.includes('\\locales\\config.ts')) {
    return true;
  }

  // 如果提供了配置对象，检查是否包含页面配置（columns/forms/service）
  // 如果包含，即使路径看起来像模块级别配置，也不应该跳过
  if (config && typeof config === 'object') {
    if (config.columns || config.forms || config.service) {
      // 包含页面配置，不应该跳过
      return false;
    }
  }

  // 跳过模块级别的 config.ts（模块元数据配置，不是页面配置）
  // 例如：modules/api-services/config.ts, modules/base/config.ts, modules/platform/config.ts
  // 注意：如果这些文件包含 columns/forms/service，上面的检查会返回 false，不会被跳过
  // 路径可能是相对路径（如 ../modules/org/config.ts）或绝对路径，需要匹配两种情况
  // 匹配模式：modules/{module}/config.ts（不包含 views 或其他子目录）
  // 使用更宽松的匹配，支持相对路径和绝对路径
  const moduleLevelMatch = path.match(/modules[\/\\]([^\/\\]+)[\/\\]config\.ts$/);
  if (moduleLevelMatch) {
    // 如果路径包含 views 或其他子目录，说明是页面级配置，不应该跳过
    // 例如：modules/inventory/views/info/config.ts 不应该被跳过
    if (path.includes('/views/') || path.includes('\\views\\')) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * 检查配置是否符合 PageConfig 结构
 * @param config 配置对象
 * @returns 是否符合 PageConfig 结构
 */
function isValidPageConfig(config: any): config is PageConfig {
  // PageConfig 至少需要 locale 属性，或者有 columns/forms/service 之一
  return (
    config &&
    typeof config === 'object' &&
    (config.locale || config.columns || config.forms || config.service)
  );
}

/**
 * 批量注册配置（从 import.meta.glob 的结果）
 * @param configFiles import.meta.glob 返回的文件映射
 */
export function registerConfigsFromGlob(configFiles: Record<string, { default: PageConfig }>): void {
  const registeredKeys: string[] = [];
  const skippedPaths: string[] = [];

  for (const path in configFiles) {
    const configFile = configFiles[path];
    if (!configFile) {
      skippedPaths.push(path);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Config file is null/undefined: ${path}`);
      }
      continue;
    }
    const config = configFile.default;
    if (!config) {
      skippedPaths.push(path);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Config default export is null/undefined: ${path}`);
      }
      continue;
    }

    // 开发环境：输出每个文件的检查信息
    if (import.meta.env.DEV) {
      console.debug(`[config-loader] Processing config file: ${path}`, {
        hasColumns: !!config.columns,
        hasForms: !!config.forms,
        hasService: !!config.service,
        hasLocale: !!config.locale,
        columnsKeys: config.columns ? Object.keys(config.columns) : [],
        formsKeys: config.forms ? Object.keys(config.forms) : [],
        shouldSkip: shouldSkipPath(path, config),
        isValid: isValidPageConfig(config),
      });
    }

    // 跳过非页面配置文件（现在基于配置内容判断，而不是仅基于路径）
    if (shouldSkipPath(path, config)) {
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Skipped non-page config file: ${path}`);
      }
      continue;
    }

    // 检查配置是否符合 PageConfig 结构
    if (!isValidPageConfig(config)) {
      skippedPaths.push(path);
      if (import.meta.env.DEV) {
        const configAny = config as any;
        console.debug(`[config-loader] Config does not match PageConfig structure: ${path}`, {
          hasColumns: !!configAny.columns,
          hasForms: !!configAny.forms,
          hasService: !!configAny.service,
          hasLocale: !!configAny.locale,
        });
      }
      continue;
    }

    // 从配置对象的 columns 和 forms 键中提取所有 pageKey
    // 这样可以支持一个配置文件包含多个 pageKey 的情况（如 governance/config.ts 或 platform/views/config.ts）
    const pageKeys = new Set<string>();

    // 从 columns 中提取 pageKey
    if (config.columns) {
      const columnKeys = Object.keys(config.columns);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Found ${columnKeys.length} column keys in ${path}:`, columnKeys);
      }
      columnKeys.forEach(key => pageKeys.add(key));
    }

    // 从 forms 中提取 pageKey
    if (config.forms) {
      const formKeys = Object.keys(config.forms);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Found ${formKeys.length} form keys in ${path}:`, formKeys);
      }
      formKeys.forEach(key => pageKeys.add(key));
    }

    if (import.meta.env.DEV) {
      console.debug(`[config-loader] Extracted ${pageKeys.size} pageKeys from ${path}:`, Array.from(pageKeys));
    }

    // 如果从 columns 和 forms 中提取到了 pageKey，使用这些 pageKey 注册
    if (pageKeys.size > 0) {
      // 为每个 pageKey 注册配置（注册整个 config 对象，因为 getPageConfig 需要访问完整的配置）
      pageKeys.forEach(key => {
        registerPageConfig(key, config);
        registeredKeys.push(key);
        // 开发环境调试：记录注册的 pageKey
        if (import.meta.env.DEV) {
          console.debug(`[config-loader] Registered pageKey "${key}" from path: ${path}`);
        }
      });
    } else {
      // 如果从 columns 和 forms 中都没有提取到 pageKey，尝试从路径提取
      // 这种情况适用于只有一个 pageKey 的配置文件（如 modules/platform/org/config.ts -> org）
      const pageKey = extractPageKeyFromPath(path);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] No pageKeys found in columns/forms for ${path}, trying to extract from path:`, {
          extractedPageKey: pageKey,
          pathMatch: path.match(/modules\/([^/]+)\/([^/]+)(?:\/views\/([^/]+))?\/config\.ts$/),
        });
      }
      if (pageKey) {
        registerPageConfig(pageKey, config);
        registeredKeys.push(pageKey);
        if (import.meta.env.DEV) {
          console.debug(`[config-loader] Registered pageKey "${pageKey}" from path: ${path}`);
        }
      } else {
        // 开发环境调试：如果从路径和 columns/forms 中都没有提取到 pageKey，使用 debug 级别
        skippedPaths.push(path);
        if (import.meta.env.DEV) {
          console.debug(`[config-loader] Cannot extract pageKey from path: ${path}, and no pageKeys found in columns/forms`, {
            hasColumns: !!config.columns,
            hasForms: !!config.forms,
            columnsKeys: config.columns ? Object.keys(config.columns) : [],
            formsKeys: config.forms ? Object.keys(config.forms) : [],
          });
        }
      }
    }
  }

  // 开发环境：输出注册摘要
  if (import.meta.env.DEV) {
    console.debug(`[config-loader] Registration summary:`, {
      registered: registeredKeys.length,
      skipped: skippedPaths.length,
      registeredKeys: registeredKeys.slice(0, 20), // 只显示前20个，避免输出过多
      skippedPaths: skippedPaths.slice(0, 10), // 只显示前10个
    });
  }
}

/**
 * 获取页面配置
 * @param pageKey 页面键
 * @returns 页面配置，如果不存在则返回 undefined
 */
export function getPageConfig(pageKey: string): PageConfig | undefined {
  const config = configRegistry.get(pageKey);

  // 开发环境调试：如果配置不存在，输出调试信息
  if (import.meta.env.DEV && !config) {
    console.warn(`[config-loader] Config not found for pageKey: ${pageKey}`);
    const allKeys = Array.from(configRegistry.keys());
    console.debug(`[config-loader] Available pageKeys (${allKeys.length}):`, allKeys);
    // 检查是否有相似的 pageKey
    const similarKeys = allKeys.filter(key => key.includes(pageKey.split('.').pop() || ''));
    if (similarKeys.length > 0) {
      console.debug(`[config-loader] Similar pageKeys found:`, similarKeys);
    }
  }

  // 开发环境调试：如果配置存在但没有对应的 columns/forms，输出调试信息
  if (import.meta.env.DEV && config) {
    if (!config.columns?.[pageKey] && !config.forms?.[pageKey]) {
      console.debug(`[config-loader] Config found for ${pageKey}, but columns/forms keys:`, {
        hasColumns: !!config.columns,
        hasForms: !!config.forms,
        columnsKeys: config.columns ? Object.keys(config.columns) : [],
        formsKeys: config.forms ? Object.keys(config.forms) : [],
      });
    }
  }

  return config;
}

/**
 * 获取所有已注册的 pageKey（开发环境调试用）
 */
export function getAllRegisteredPageKeys(): string[] {
  return Array.from(configRegistry.keys());
}

/**
 * 翻译 i18n key
 * @param key i18n key 或直接文本
 * @param t 翻译函数（vue-i18n Composer 的 t 方法）
 * @returns 翻译后的文本
 */
function translateKey(key: string | undefined, t: any): string {
  if (!key) return '';

  // 如果 key 不包含点号，可能是直接文本，直接返回
  if (!key.includes('.')) {
    // 仍然尝试翻译，因为有些 key 可能没有点号
    try {
      if (typeof t === 'function') {
        const translated = t(key);
        // 确保返回字符串类型
        if (typeof translated === 'string' && translated !== key) {
          return translated;
        }
      }
    } catch {
      // 翻译失败，返回原 key
    }
    return key;
  }

  // key 包含点号，尝试翻译
  try {
    if (typeof t !== 'function') {
      if (import.meta.env.DEV) {
        console.warn(`[config-loader] t is not a function, key: ${key}`);
      }
      return key;
    }

    // 首先尝试直接翻译
    let translated = t(key);
    let translatedStr: string;

    if (typeof translated === 'string') {
      translatedStr = translated;
    } else if (typeof translated === 'function') {
      // 如果返回的是函数（Vue I18n 编译后的消息函数），调用它获取字符串
      try {
        const result = translated({});
        translatedStr = typeof result === 'string' ? result : String(result);
      } catch (error) {
        // 如果调用失败，使用 key 作为回退
        if (import.meta.env.DEV) {
          console.warn(`[config-loader] Failed to call translation function for key "${key}":`, error);
        }
        translatedStr = key;
      }
    } else if (translated != null) {
      translatedStr = String(translated);
    } else {
      translatedStr = key;
    }

    // 如果翻译结果与 key 相同，说明没有找到翻译
    // 尝试添加 'page.' 前缀（兼容旧格式，新格式不再需要）
    // 注意：新格式下，locale 下直接是模块层，扁平化后是 org.tenants.tenant_name，不需要 page. 前缀
    if (translatedStr === key && !key.startsWith('page.')) {
      const pageKey = `page.${key}`;

      // 优先直接访问消息对象来检查键是否存在（更可靠）
      let pageKeyExists = false;
      try {
        const i18nInstance = (t as any).__i18n || (t as any).$i18n || (t as any).i18n;
        if (i18nInstance?.global) {
          const currentLocale = i18nInstance.global.locale?.value || 'zh-CN';
          const messages = i18nInstance.global.getLocaleMessage(currentLocale) || {};
          pageKeyExists = pageKey in messages;

          // 如果直接访问消息对象找到了键，直接使用
          if (pageKeyExists) {
            const value = messages[pageKey];
            if (typeof value === 'string' && value.trim() !== '') {
              if (import.meta.env.DEV && key.includes('tenant')) {
                console.debug(`[config-loader] Translated "${key}" -> "${pageKey}" -> "${value}" (direct access)`);
              }
              return value;
            } else if (typeof value === 'function') {
              try {
                const result = value({ normalize: (arr: any[]) => arr[0] });
                if (typeof result === 'string' && result.trim() !== '') {
                  if (import.meta.env.DEV && key.includes('tenant')) {
                    console.debug(`[config-loader] Translated "${key}" -> "${pageKey}" -> "${result}" (function)`);
                  }
                  return result;
                }
              } catch (error) {
                // 函数调用失败，继续使用 t 函数
              }
            }
          }
        }
      } catch (error) {
        // 如果直接访问失败，继续使用 te 函数
      }

      // 如果直接访问失败，使用 te 函数检查
      if (!pageKeyExists) {
        const hasTe = typeof (t as any).te === 'function';
        pageKeyExists = hasTe && (t as any).te(pageKey);
      }

      if (pageKeyExists) {
        const pageTranslated = t(pageKey);
        if (typeof pageTranslated === 'string' && pageTranslated !== pageKey) {
          if (import.meta.env.DEV && key.includes('tenant')) {
            console.debug(`[config-loader] Translated "${key}" -> "${pageKey}" -> "${pageTranslated}" (via t function)`);
          }
          return pageTranslated;
        } else if (pageTranslated != null) {
          if (import.meta.env.DEV && key.includes('tenant')) {
            console.debug(`[config-loader] Translated "${key}" -> "${pageKey}" -> "${String(pageTranslated)}" (via t function)`);
          }
          return String(pageTranslated);
        }
      } else if (import.meta.env.DEV && key.includes('tenant')) {
        // 调试：检查为什么 pageKey 不存在
        try {
          const i18nInstance = (t as any).__i18n || (t as any).$i18n || (t as any).i18n;
          if (i18nInstance?.global) {
            const currentLocale = i18nInstance.global.locale?.value || 'zh-CN';
            const messages = i18nInstance.global.getLocaleMessage(currentLocale) || {};
            const keyExists = pageKey in messages;
            console.debug(`[config-loader] Translation check for "${key}":`, {
              pageKey,
              keyExists,
              hasTe: typeof (t as any).te === 'function',
              currentLocale,
              sampleKeys: Object.keys(messages).filter(k => k.includes('tenant')).slice(0, 5),
            });
          }
        } catch (error) {
          console.debug(`[config-loader] Error checking i18n for "${key}":`, error);
        }
      }
    }

    // 如果翻译结果与 key 相同，说明没有找到翻译
    if (translatedStr === key) {
      // 开发环境：输出调试信息
      if (import.meta.env.DEV) {
        // 检查 t 函数是否有 te 方法（vue-i18n 的 exists 方法）
        const hasTe = typeof (t as any).te === 'function';
        const keyExists = hasTe && (t as any).te(key);
        const pageKey = `page.${key}`;
        const pageKeyExists = hasTe && (t as any).te(pageKey);

        if (!keyExists && !pageKeyExists) {
          // 尝试获取 i18n 实例的消息对象来检查
          let availableKeys: string[] = [];
          try {
            const i18nInstance = (t as any).__i18n || (t as any).$i18n;
            if (i18nInstance?.global) {
              const currentLocale = i18nInstance.global.locale?.value || 'zh-CN';
              const messages = i18nInstance.global.getLocaleMessage(currentLocale) || {};
              availableKeys = Object.keys(messages);

              // 查找相似的键
              const keyLastPart = key.split('.').pop() || '';
              const keyFirstPart = key.split('.')[0] || '';
              const similarKeys = availableKeys.filter(k => {
                const kLastPart = k.split('.').pop() || '';
                return k.includes(keyLastPart) || key.includes(kLastPart);
              }).slice(0, 5);

              if (similarKeys.length > 0) {
                console.warn(`[config-loader] Translation key not found: ${key} (also tried: ${pageKey})`, {
                  similarKeys,
                  totalKeys: availableKeys.length,
                  sampleKeys: availableKeys.filter(k => k.startsWith(keyFirstPart)).slice(0, 5),
                });
              } else {
                console.debug(`[config-loader] Translation key not found: ${key} (also tried: ${pageKey})`);
              }
            } else {
              console.debug(`[config-loader] Translation key not found: ${key} (also tried: ${pageKey}), i18n instance not available`);
            }
          } catch (error) {
            console.debug(`[config-loader] Translation key not found: ${key} (also tried: ${pageKey}), error checking i18n:`, error);
          }
        }
      }
      return key;
    }

    return translatedStr;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[config-loader] Translation error for key "${key}":`, error);
    }
    return key;
  }
}

/**
 * 将 TableColumnConfig 转换为 TableColumn
 * @param config 表格列配置
 * @param t 翻译函数（vue-i18n Composer 的 t 方法）
 * @param onClickHandlers onClick 处理器映射（可选）
 * @returns TableColumn
 */
function convertTableColumn(
  config: TableColumnConfig,
  t: any,
  onClickHandlers?: Record<string, (options: { scope: any }) => void>
): TableColumn {
  const column: TableColumn = {
    ...config,
    label: translateKey(config.label, t),
  };

  // 处理操作列的 buttons 中的 onClick
  if (column.buttons && Array.isArray(column.buttons)) {
    column.buttons = column.buttons.map((btn) => {
      if (typeof btn === 'object' && btn.onClick) {
        // 如果 onClick 是字符串，尝试从 handlers 中获取
        if (typeof btn.onClick === 'string' && onClickHandlers?.[btn.onClick]) {
          return {
            ...btn,
            label: translateKey(btn.label, t),
            onClick: onClickHandlers[btn.onClick],
          };
        }
        // 如果 onClick 已经是函数，直接使用
        if (typeof btn.onClick === 'function') {
          return {
            ...btn,
            label: translateKey(btn.label, t),
            onClick: btn.onClick,
          };
        }
        // 如果 onClick 是字符串但没有对应的 handler，移除 onClick
        const { onClick, ...rest } = btn;
        const result: typeof rest & { label: string } = {
          ...rest,
          label: translateKey(btn.label, t),
        };
        return result;
      }
      // 如果是字符串类型的按钮，尝试翻译
      if (typeof btn === 'string') {
        return btn;
      }
      return {
        ...btn,
        label: translateKey(btn.label, t),
      };
    }) as typeof column.buttons;
  }

  return column;
}

/**
 * 将 FormItemConfig 转换为 FormItem
 * @param config 表单项配置
 * @param t 翻译函数（vue-i18n Composer 的 t 方法）
 * @returns FormItem
 */
function convertFormItem(
  config: FormItemConfig,
  t: any
): FormItem {
  // 确保 prop 存在（FormItem 要求 prop 是必需的）
  if (!config.prop) {
    throw new Error(`FormItemConfig must have a 'prop' property: ${JSON.stringify(config)}`);
  }

  const item = {
    ...config,
    prop: config.prop,
    label: translateKey(config.label, t),
  } as FormItem;

  // 处理 component.props.placeholder
  if (item.component?.props?.placeholder) {
    item.component.props.placeholder = translateKey(
      item.component.props.placeholder as string,
      t
    );
  }

  // 处理 component.options（select、radio-group、checkbox-group 等的选项）
  if (item.component?.options && Array.isArray(item.component.options)) {
    item.component.options = item.component.options.map((opt: any) => {
      // 如果选项有 label 字段，且是国际化 key，进行翻译
      if (opt.label && typeof opt.label === 'string') {
        return {
          ...opt,
          label: translateKey(opt.label, t),
        };
      }
      return opt;
    });
  }

  return item;
}

/**
 * 从 config.ts 读取指定页面的 columns 配置
 * @param pageKey 页面键，格式：'module.submodule.page'，例如 'org.users'
 * @param onClickHandlers onClick 处理器映射（可选），用于动态绑定按钮点击事件
 * @returns 响应式的 TableColumn[]
 */
export function usePageColumns(
  pageKey: string,
  onClickHandlers?: Record<string, (options: { scope: any }) => void>
): { columns: ComputedRef<TableColumn[]> } {
  const { t } = useI18n();

  const columns = computed<TableColumn[]>(() => {
    const config = getPageConfig(pageKey);
    if (!config) {
      console.warn(`[config-loader] Columns config not found for page: ${pageKey} (config is null/undefined)`);
      return [];
    }
    if (!config.columns) {
      console.warn(`[config-loader] Columns config not found for page: ${pageKey} (config.columns is null/undefined)`);
      return [];
    }
    if (!config.columns[pageKey]) {
      console.warn(`[config-loader] Columns config not found for page: ${pageKey} (config.columns[${pageKey}] is null/undefined)`);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Available columns keys:`, Object.keys(config.columns));
      }
      return [];
    }

    const columnConfigs = config.columns[pageKey];
    return columnConfigs.map((col) => convertTableColumn(col, t, onClickHandlers));
  });

  return { columns };
}

/**
 * 从 config.ts 读取指定页面的 forms 配置
 * @param pageKey 页面键，格式：'module.submodule.page'，例如 'org.users'
 * @returns 响应式的 FormItem[]
 */
export function usePageForms(pageKey: string): { formItems: ComputedRef<FormItem[]> } {
  const { t } = useI18n();

  const formItems = computed<FormItem[]>(() => {
    const config = getPageConfig(pageKey);
    if (!config) {
      console.warn(`[config-loader] Forms config not found for page: ${pageKey} (config is null/undefined)`);
      return [];
    }
    if (!config.forms) {
      console.warn(`[config-loader] Forms config not found for page: ${pageKey} (config.forms is null/undefined)`);
      return [];
    }
    if (!config.forms[pageKey]) {
      console.warn(`[config-loader] Forms config not found for page: ${pageKey} (config.forms[${pageKey}] is null/undefined)`);
      if (import.meta.env.DEV) {
        console.debug(`[config-loader] Available forms keys:`, Object.keys(config.forms));
      }
      return [];
    }

    const formConfigs = config.forms[pageKey];
    return formConfigs.map((item) => convertFormItem(item, t));
  });

  return { formItems };
}

/**
 * 获取指定页面的完整配置（包含 locale、columns、forms）
 * @param pageKey 页面键
 * @returns 页面配置，如果不存在则返回 undefined
 */
export function getPageConfigFull(pageKey: string): PageConfig | undefined {
  return getPageConfig(pageKey);
}

/**
 * 从 pageKey 推断 service key
 * 例如：'org.tenants' -> 'tenant', 'access.actions' -> 'action'
 */
function inferServiceKeyFromPageKey(pageKey: string): string {
  // 提取最后一个部分
  const parts = pageKey.split('.');
  const lastPart = parts[parts.length - 1];

  // 如果 lastPart 不存在，返回 pageKey 本身
  if (!lastPart) {
    return pageKey;
  }

  // 简单的复数转单数规则（可以根据需要扩展）
  // tenants -> tenant, departments -> department, users -> user, actions -> action
  if (lastPart.endsWith('s')) {
    return lastPart.slice(0, -1);
  }
  return lastPart;
}

/**
 * 从 config.ts 读取指定页面的 service 配置
 * @param pageKey 页面键，格式：'module.submodule.page'，例如 'org.tenants'
 * @param serviceKey 可选的 service key，如果不提供则从 pageKey 推断
 * @param options useServiceWithConfirm 的选项
 * @returns 包装后的 service（已添加删除确认逻辑）
 */
export function usePageService(
  pageKey: string,
  serviceKey?: string,
  options?: {
    showConfirm?: boolean;
    confirmMessage?: string;
    showSuccessMessage?: boolean;
    successMessage?: string;
  }
): ReturnType<typeof useServiceWithConfirm> {
  const config = getPageConfig(pageKey);

  if (!config) {
    console.warn(`[config-loader] Service config not found for page: ${pageKey} (config is null/undefined)`);
    return null as any;
  }
  if (!config.service) {
    console.warn(`[config-loader] Service config not found for page: ${pageKey} (config.service is null/undefined)`);
    if (import.meta.env.DEV) {
      console.debug(`[config-loader] Config keys:`, Object.keys(config));
    }
    return null as any;
  }

  // 如果没有指定 serviceKey，从 pageKey 推断
  const finalServiceKey = serviceKey || inferServiceKeyFromPageKey(pageKey);
  const service = config.service[finalServiceKey];

  // 服务不存在是正常情况（可能后端没有提供该服务，或服务路径不同）
  // 静默返回 null，不打印警告，让调用方自行处理
  if (!service) {
    return null as any;
  }

  // 使用 useServiceWithConfirm 包装 service
  return useServiceWithConfirm(service, options);
}
