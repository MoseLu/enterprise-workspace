import { computed, type Ref } from 'vue';
import lunr from 'lunr';

/**
 * 搜索数据项类型
 */
export interface SearchDataItem {
  id: string;
  type: 'menu' | 'page' | 'doc';
  title: string; // 翻译后的标题
  originalTitle?: string; // 原始标题（可能是国际化key）
  path: string;
  breadcrumb?: string;
  app?: string;
  score?: number; // 相关性分数（来自 lunr）
  hasChildren?: boolean; // 是否有子菜单（用于区分父级菜单和实际路由）
}

/**
 * Lunr 搜索结果类型
 */
export interface LunrSearchResult {
  ref: string; // 对应 SearchDataItem.id
  score: number; // 相关性分数
  matchData?: any; // 匹配数据
}

/**
 * 自定义分词器：支持中文字符分割
 * 将中文字符按字符分割，英文按单词分割
 */
function chineseTokenizer(token: string | null | undefined): lunr.Token[] {
  if (token == null || token === undefined) {
    return [];
  }

  const str = token.toString().toLowerCase();
  const tokens: lunr.Token[] = [];
  let currentToken = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (!char) continue;
    const charCode = char.charCodeAt(0);

    // 判断是否为中文字符（包括中文标点）
    // 中文字符范围：\u4e00-\u9fff（基本汉字）
    // 扩展范围：\u3400-\u4dbf（扩展A）、\u20000-\u2a6df（扩展B）等
    const isChinese = (charCode >= 0x4e00 && charCode <= 0x9fff) ||
                      (charCode >= 0x3400 && charCode <= 0x4dbf) ||
                      (charCode >= 0x20000 && charCode <= 0x2a6df);

    if (isChinese) {
      // 中文字符：每个字符作为一个 token
      if (currentToken) {
        tokens.push(new lunr.Token(currentToken, {}));
        currentToken = '';
      }
      tokens.push(new lunr.Token(char, {}));
    } else if (char && /[\w\u00c0-\u024f\u1e00-\u1eff]/.test(char)) {
      // 英文字母或带重音的字母：累积到当前 token
      currentToken += char;
    } else {
      // 其他字符（空格、标点等）：结束当前 token
      if (currentToken) {
        tokens.push(new lunr.Token(currentToken, {}));
        currentToken = '';
      }
    }
  }

  // 处理最后一个 token
  if (currentToken) {
    tokens.push(new lunr.Token(currentToken, {}));
  }

  return tokens;
}

/**
 * 使用 lunr.js 构建搜索索引的 composable
 *
 * @param searchData 搜索数据源（响应式）
 * @returns 搜索索引和相关方法
 */
export function useSearchIndex(searchData: Ref<SearchDataItem[]>) {
  // 构建搜索索引（响应式，当 searchData 变化时自动重建）
  const searchIndex = computed(() => {
    try {
      const data = searchData.value;

      // 如果数据为空，返回 null
      if (!data || data.length === 0) {
        return null;
      }

      // 构建 lunr 索引
      const index = lunr(function(this: lunr.Builder) {
        // 设置自定义分词器（支持中文）
        this.tokenizer = chineseTokenizer as typeof lunr.tokenizer;

        // 设置文档引用字段
        this.ref('id');

        // 设置搜索字段及其权重
        // title 权重最高（10），因为标题匹配最重要
        this.field('title', { boost: 10 });

        // breadcrumb 权重中等（5），面包屑也能提供有用信息
        this.field('breadcrumb', { boost: 5 });

        // originalTitle 权重中等（3），原始标题（国际化key）也有一定价值
        this.field('originalTitle', { boost: 3 });

        // path 权重最低（1），路径匹配价值相对较低
        this.field('path', { boost: 1 });

        // 添加所有文档到索引
        data.forEach((item) => {
          this.add({
            id: item.id,
            title: item.title || '',
            breadcrumb: item.breadcrumb || '',
            path: item.path || '',
            originalTitle: item.originalTitle || ''
          });
        });
      });

      return index;
    } catch (error) {
      return null;
    }
  });

  /**
   * 检查字符串是否包含中文字符
   */
  function containsChinese(str: string): boolean {
    return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(str);
  }

  /**
   * 执行搜索
   *
   * @param keyword 搜索关键词
   * @returns 搜索结果数组，按相关性分数降序排序
   */
  const search = (keyword: string): LunrSearchResult[] => {
    if (!keyword || !keyword.trim()) {
      return [];
    }

    const index = searchIndex.value;
    if (!index) {
      return [];
    }

    try {
      const trimmedKeyword = keyword.trim();

      // 如果包含中文，尝试多种搜索策略
      if (containsChinese(trimmedKeyword)) {
        // 提取中文字符
        const chineseChars = trimmedKeyword.split('').filter(char =>
          /[\u4e00-\u9fff\u3400-\u4dbf]/.test(char)
        );

        let results: LunrSearchResult[] = [];

        // 策略1：使用 AND 查询，查找同时包含所有字符的文档
        // 例如："流程" -> "流 程"（lunr 默认 AND 逻辑）
        if (chineseChars.length > 0) {
          const andQuery = chineseChars.join(' ');
          try {
            results = index.search(andQuery);
          } catch (error) {
            // 忽略搜索错误
          }
        }

        // 策略1.5：尝试使用 + 前缀强制匹配（lunr 语法）
        if (results.length === 0 && chineseChars.length > 0) {
          const requiredQuery = chineseChars.map(char => `+${char}`).join(' ');
          try {
            results = index.search(requiredQuery);
          } catch (error) {
            // 忽略搜索错误
          }
        }

        // 策略2：通配符搜索（支持部分匹配）
        if (results.length === 0 && chineseChars.length > 0) {
          const wildcardQuery = chineseChars.map(char => `${char}*`).join(' ');
          try {
            results = index.search(wildcardQuery);
          } catch (error) {
            // 忽略搜索错误
          }
        }

        // 策略3：首字符搜索
        if (results.length === 0 && chineseChars.length >= 2) {
          const firstCharQuery = `${chineseChars[0]}*`;
          try {
            results = index.search(firstCharQuery);
          } catch (error) {
            // 忽略搜索错误
          }
        }

        // 策略4：OR 查询（匹配任意字符）
        if (results.length === 0 && chineseChars.length > 1) {
          const orQuery = chineseChars.join(' OR ');
          try {
            results = index.search(orQuery);
          } catch (error) {
            // 忽略搜索错误
          }
        }

        return results;
      } else {
        // 英文搜索：直接使用 lunr 搜索
        return index.search(trimmedKeyword);
      }
    } catch (error) {
      return [];
    }
  };

  /**
   * 将 lunr 搜索结果映射回原始的 SearchDataItem
   *
   * @param results lunr 搜索结果
   * @param dataMap 数据映射表（id -> SearchDataItem）
   * @returns 映射后的 SearchDataItem 数组
   */
  const mapResultsToItems = (
    results: LunrSearchResult[],
    dataMap: Map<string, SearchDataItem>
  ): SearchDataItem[] => {
    const items: SearchDataItem[] = [];

    for (const result of results) {
      const item = dataMap.get(result.ref);
      if (item) {
        // 保留相关性分数
        items.push({
          ...item,
          score: result.score
        });
      }
    }

    return items;
  };

  /**
   * 创建数据映射表（用于快速查找）
   *
   * @param data 搜索数据
   * @returns Map<id, SearchDataItem>
   */
  const createDataMap = (data: SearchDataItem[]): Map<string, SearchDataItem> => {
    const map = new Map<string, SearchDataItem>();
    for (const item of data) {
      map.set(item.id, item);
    }
    return map;
  };

  return {
    searchIndex,
    search,
    mapResultsToItems,
    createDataMap
  };
}
