;
import type { LocaleMessages } from 'vue-i18n';

// 临时类型定义，避免 VueI18n 命名空间问题
type VueI18nLocaleMessage = any;

/**
 * 转换 unplugin-vue-i18n 的 AST 格式为 vue-i18n 的字符串格式
 * ✅ 正确的聚合：先把所有片段"按语言归桶"
 * @param unpluginMessages unplugin-vue-i18n 生成的消息对象
 * @returns 转换后的消息对象，顶层键必须是语言码
 */
function transformUnpluginMessages(unpluginMessages: any): Record<string, any> {

  const result: Record<string, any> = {};

  // 遍历所有语言 - 保持按语言分组的结构！
  for (const [locale, localeMessages] of Object.entries(unpluginMessages)) {
    if (typeof localeMessages !== 'object' || !localeMessages) continue;

    result[locale] = {};

    // 遍历该语言的所有消息
    for (const [key, messageNode] of Object.entries(localeMessages)) {
      if (typeof messageNode === 'object' && messageNode && 'loc' in messageNode) {
        // 提取 .loc.source 的值
        const message = (messageNode as any).loc?.source;
        if (typeof message === 'string') {
          result[locale][key] = message;
        }
      } else if (typeof messageNode === 'string') {
        // 如果直接是字符串，直接使用
        result[locale][key] = messageNode;
      }
    }
  }


  return result;
}

export interface I18nNamespaceConfig {
  /** 插件命名空间 */
  plugins?: string[];
  /** 业务域命名空间 */
  domains?: string[];
  /** 平台治理命名空间 */
  platform?: string[];
  /** 应用基础命名空间 */
  base?: boolean;
  /** 共享组件命名空间 */
  shared?: boolean;
  /** 通用命名空间 */
  common?: boolean;
}

/**
 * 命名空间化的 i18n 加载器
 * 支持按优先级回退的语言包加载
 */
export class NamespaceI18nLoader {
  private messages: LocaleMessages<VueI18nLocaleMessage> = {};
  private config: I18nNamespaceConfig;

  constructor(config: I18nNamespaceConfig = {}) {
    this.config = {
      plugins: [],
      domains: [],
      platform: ['access', 'org', 'navigation', 'ops'],
      base: true,
      shared: true,
      common: true,
      ...config,
    };
  }

  /**
   * 加载语言包
   * @param locale 语言
   * @param messages 外部传入的消息（unplugin-vue-i18n 格式）
   * @returns 按语言分组的消息对象，顶层键必须是语言码
   */
  load(_locale: string, messages: any = {}): LocaleMessages<VueI18nLocaleMessage> {
    // 首先转换 unplugin-vue-i18n 的 AST 格式为字符串格式
    const transformedMessages = transformUnpluginMessages(messages);

    // ✅ 关键修复：返回按语言分组的结构，而不是平铺的键
    const result: any = {};

    // 为每个语言构建消息
    for (const [lang, _langMessages] of Object.entries(transformedMessages)) {
      result[lang] = {};

      // 按优先级加载命名空间
      const loadChain = this.getLoadChain();

      for (const namespace of loadChain) {
        const namespaceMessages = this.loadNamespace(lang, namespace, transformedMessages);
        if (namespaceMessages) {
          Object.assign(result[lang], namespaceMessages);
        }
      }
    }
    return result;
  }

  /**
   * 获取加载链（从具体到通用）
   */
  private getLoadChain(): string[] {
    const chain: string[] = [];

    // 1. 插件命名空间（最高优先级）
    if (this.config.plugins?.length) {
      this.config.plugins.forEach(plugin => {
        chain.push(`plugin.${plugin}`);
      });
    }

    // 2. 业务域命名空间
    if (this.config.domains?.length) {
      this.config.domains.forEach(domain => {
        chain.push(`domain.${domain}`);
      });
    }

    // 3. 平台治理命名空间
    if (this.config.platform?.length) {
      this.config.platform.forEach(subsystem => {
        chain.push(`platform.${subsystem}`);
      });
      chain.push('platform.common'); // 平台通用
    }

    // 4. 通用命名空间
    if (this.config.common) {
      chain.push('common');
    }

    // 5. 应用基础命名空间
    if (this.config.base) {
      chain.push('base');
    }

    // 6. 共享组件命名空间（最低优先级，兜底）
    if (this.config.shared) {
      chain.push('ui');
    }

    return chain;
  }

  /**
   * 加载指定命名空间的消息
   */
  private loadNamespace(locale: string, namespace: string, messages: any): any {
    const localeMessages = messages[locale];
    if (!localeMessages) return null;

    const result: any = {};

    // 查找以命名空间前缀开头的键
    for (const [key, value] of Object.entries(localeMessages)) {
      if (key.startsWith(`${namespace}.`)) {
        // 移除命名空间前缀，构建嵌套结构
        const subKey = key.substring(namespace.length + 1);
        this.setNestedValue(result, subKey, value);
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * 设置嵌套对象的值
   * @param obj 目标对象
   * @param path 路径（如 'common.profile'）
   * @param value 值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key && !(key in current)) {
        current[key] = {};
      }
      if (key) {
        current = current[key];
      }
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  /**
   * 查找翻译（支持回退）
   * @param key 翻译键
   * @param locale 语言
   */
  lookup(key: string, locale: string): string | null {
    const loadChain = this.getLoadChain();

    for (const namespace of loadChain) {
      const namespaceMessages = this.messages[`${namespace}.${locale}`] || this.messages[namespace];
      if (namespaceMessages && namespaceMessages[key]) {
        return namespaceMessages[key];
      }
    }

    return null;
  }

  /**
   * 格式化 ICU 消息
   * @param message 消息模板
   * @param params 参数
   */
  formatICU(message: string, params: Record<string, any> = {}): string {
    // 简单的 ICU 格式化实现
    let result = message;

    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return result;
  }

  /**
   * 翻译函数（带回退和错误提示）
   * @param key 翻译键
   * @param params 参数
   * @param locale 语言
   */
  t(key: string, params: Record<string, any> = {}, locale: string = 'zh-CN'): string {
    const message = this.lookup(key, locale);

    if (message) {
      return this.formatICU(message, params);
    }

    // 未找到翻译时的处理
    console.warn(`[i18n] Missing translation for key: ${key} in locale: ${locale}`);

    // 开发环境显示键名，生产环境返回友好提示
    if (process.env.NODE_ENV === 'development') {
      return `❓${key}`;
    }

    return key; // 生产环境返回键名
  }
}

/**
 * 创建命名空间化的 i18n 加载器
 */
export function createNamespaceI18nLoader(config?: I18nNamespaceConfig): NamespaceI18nLoader {
  return new NamespaceI18nLoader(config);
}

/**
 * 默认的加载器配置
 */
export const DEFAULT_I18N_CONFIG: I18nNamespaceConfig = {
  plugins: ['github', 'theme', 'i18n'],
  domains: ['procurement', 'inventory', 'logistics', 'production', 'quality', 'engineering'],
  platform: ['access', 'org', 'navigation', 'ops'],
  base: true,
  shared: true,
};
