/**
 * 自定义 ESLint 规则：检查国际化 key 格式
 * 强制使用 snake_case 格式，且符合 {category}.{module}.{feature}.{element} 层级结构
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '强制国际化 key 使用 snake_case 格式，且符合层级结构',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['snake_case', 'camelCase', 'PascalCase'],
            default: 'snake_case',
          },
          minLevels: {
            type: 'number',
            default: 2,
          },
          maxLevels: {
            type: 'number',
            default: 5,
          },
          allowedPrefixes: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['app', 'auth', 'common', 'menu', 'btc'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidFormat: '国际化 key "{{key}}" 格式不符合要求。应使用 snake_case 格式（全小写，下划线分隔），且符合 {{minLevels}}-{{maxLevels}} 层级的层级结构（如 {{example}}）',
      invalidCase: '国际化 key "{{key}}" 使用了 {{actualCase}} 命名风格，应使用 snake_case（全小写，下划线分隔）',
      invalidLevels: '国际化 key "{{key}}" 层级不符合要求。应为 {{minLevels}}-{{maxLevels}} 层（如 {{example}}）',
      invalidPrefix: '国际化 key "{{key}}" 的前缀 "{{prefix}}" 不在允许的前缀列表中（{{allowedPrefixes}}）',
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const format = options.format || 'snake_case';
    const minLevels = options.minLevels || 2;
    const maxLevels = options.maxLevels || 5;
    const allowedPrefixes = options.allowedPrefixes || ['app', 'auth', 'common', 'menu', 'btc'];

    /**
     * 检查字符串是否为 snake_case 格式
     */
    function isSnakeCase(str) {
      // snake_case: 全小写，单词用下划线分隔，可以包含数字
      return /^[a-z][a-z0-9_]*$/.test(str);
    }

    /**
     * 检查字符串是否为 camelCase 格式
     */
    function isCamelCase(str) {
      // camelCase: 首字母小写，后续单词首字母大写
      return /^[a-z][a-zA-Z0-9]*$/.test(str) && !str.includes('_');
    }

    /**
     * 检查字符串是否为 PascalCase 格式
     */
    function isPascalCase(str) {
      // PascalCase: 首字母大写，后续单词首字母大写
      return /^[A-Z][a-zA-Z0-9]*$/.test(str) && !str.includes('_');
    }

    /**
     * 检测命名风格
     */
    function detectCase(str) {
      if (isSnakeCase(str)) return 'snake_case';
      if (isCamelCase(str)) return 'camelCase';
      if (isPascalCase(str)) return 'PascalCase';
      return 'unknown';
    }

    /**
     * 检查国际化 key 格式
     */
    function checkI18nKey(node, key) {
      if (typeof key !== 'string' || !key.includes('.')) {
        // 不是国际化 key（不包含点），跳过检查
        return;
      }

      const parts = key.split('.');
      const levels = parts.length;

      // 检查层级数量
      if (levels < minLevels || levels > maxLevels) {
        const example = allowedPrefixes[0] + '.example.key';
        context.report({
          node,
          messageId: 'invalidLevels',
          data: {
            key,
            minLevels,
            maxLevels,
            example,
          },
        });
        return;
      }

      // 检查前缀
      const prefix = parts[0];
      if (!allowedPrefixes.includes(prefix)) {
        context.report({
          node,
          messageId: 'invalidPrefix',
          data: {
            key,
            prefix,
            allowedPrefixes: allowedPrefixes.join(', '),
          },
        });
        return;
      }

      // 检查每个部分的命名风格
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const partCase = detectCase(part);

        if (format === 'snake_case' && partCase !== 'snake_case') {
          context.report({
            node,
            messageId: 'invalidCase',
            data: {
              key,
              actualCase: partCase,
            },
          });
          return;
        }
      }

      // 检查整体格式（确保使用点分隔，且每个部分符合要求）
      const example = allowedPrefixes[0] + '.example.key';
      const isValidFormat = parts.every((part) => {
        if (format === 'snake_case') {
          return isSnakeCase(part);
        }
        // 其他格式的检查可以在这里扩展
        return true;
      });

      if (!isValidFormat) {
        context.report({
          node,
          messageId: 'invalidFormat',
          data: {
            key,
            minLevels,
            maxLevels,
            example,
          },
        });
      }
    }

    /**
     * 检查函数调用中的国际化 key
     */
    function checkCallExpression(node) {
      // 检查 $t(), t(), $ts() 等函数调用
      const callee = node.callee;
      const isI18nFunction =
        (callee.type === 'Identifier' && ['$t', 't', '$ts', 'ts'].includes(callee.name)) ||
        (callee.type === 'MemberExpression' &&
          callee.property &&
          callee.property.type === 'Identifier' &&
          ['t', 'ts'].includes(callee.property.name));

      if (!isI18nFunction) {
        return;
      }

      // 检查第一个参数（通常是国际化 key）
      const firstArg = node.arguments[0];
      if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
        checkI18nKey(node, firstArg.value);
      } else if (firstArg && firstArg.type === 'TemplateLiteral') {
        // 模板字符串的情况，检查是否有静态部分
        const quasis = firstArg.quasis;
        if (quasis && quasis.length > 0) {
          const staticKey = quasis.map((q) => q.value.cooked).join('');
          if (staticKey.includes('.')) {
            checkI18nKey(node, staticKey);
          }
        }
      }
    }

    /**
     * 检查模板中的国际化 key
     */
    function checkTemplate(node) {
      // 检查 Vue 模板中的 {{ $t('key') }} 或 :title="$t('key')"
      if (node.type === 'CallExpression') {
        checkCallExpression(node);
      }
    }

    return {
      // 检查函数调用
      CallExpression: checkCallExpression,
      // 检查模板表达式（Vue）
      TaggedTemplateExpression(node) {
        // 处理模板标签表达式
        if (node.tag && node.tag.type === 'Identifier' && ['$t', 't'].includes(node.tag.name)) {
          const quasis = node.quasi.quasis;
          if (quasis && quasis.length > 0) {
            const staticKey = quasis.map((q) => q.value.cooked).join('');
            if (staticKey.includes('.')) {
              checkI18nKey(node, staticKey);
            }
          }
        }
      },
    };
  },
};
