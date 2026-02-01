/**
 * ESLint 自定义规则：禁止直接使用存储 API
 *
 * 禁止直接使用：
 * - localStorage.getItem/setItem/removeItem/clear
 * - sessionStorage.getItem/setItem/removeItem/clear
 * - document.cookie (读取或赋值)
 *
 * 必须使用统一的存储工具：
 * - Cookie: @btc/shared-core/utils/cookie (getCookie, setCookie, deleteCookie)
 * - LocalStorage: @btc/shared-core/utils/storage/local (storage)
 * - SessionStorage: @btc/shared-core/utils/storage/session (sessionStorage)
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止直接使用 localStorage、sessionStorage 和 document.cookie，必须使用统一的存储工具',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noDirectLocalStorage: '禁止直接使用 localStorage，请使用 @btc/shared-core/utils/storage/local 中的 storage 工具',
      noDirectSessionStorage: '禁止直接使用 sessionStorage，请使用 @btc/shared-core/utils/storage/session 中的 sessionStorage 工具',
      noDirectCookie: '禁止直接使用 document.cookie，请使用 @btc/shared-core/utils/cookie 中的工具函数',
    },
    schema: [],
  },
  create(context) {
    /**
     * 检查是否是存储工具库文件（需要排除）
     */
    function isStorageToolFile(filename) {
      if (!filename) return false;
      // 排除存储工具库本身
      const storageToolPaths = [
        'packages/shared-core/src/utils/storage/',
        'packages/shared-core/src/utils/cookie/',
        'packages/shared-core/src/utils/cross-domain',
      ];
      return storageToolPaths.some(path => filename.includes(path));
    }

    /**
     * 检查 MemberExpression 是否访问了 localStorage 或 sessionStorage
     */
    function checkStorageAccess(node) {
      const filename = context.getFilename();

      // 排除存储工具库文件
      if (isStorageToolFile(filename)) {
        return;
      }

      // 检查 localStorage.getItem/setItem/removeItem/clear
      if (
        node.object &&
        node.object.type === 'Identifier' &&
        node.object.name === 'localStorage' &&
        node.property &&
        node.property.type === 'Identifier' &&
        ['getItem', 'setItem', 'removeItem', 'clear'].includes(node.property.name)
      ) {
        context.report({
          node,
          messageId: 'noDirectLocalStorage',
        });
        return;
      }

      // 检查 sessionStorage.getItem/setItem/removeItem/clear
      if (
        node.object &&
        node.object.type === 'Identifier' &&
        node.object.name === 'sessionStorage' &&
        node.property &&
        node.property.type === 'Identifier' &&
        ['getItem', 'setItem', 'removeItem', 'clear'].includes(node.property.name)
      ) {
        context.report({
          node,
          messageId: 'noDirectSessionStorage',
        });
        return;
      }
    }

    /**
     * 检查是否直接访问 document.cookie
     */
    function checkCookieAccess(node) {
      const filename = context.getFilename();

      // 排除存储工具库文件
      if (isStorageToolFile(filename)) {
        return;
      }

      // 检查 document.cookie (读取或赋值)
      if (
        node.object &&
        node.object.type === 'MemberExpression' &&
        node.object.object &&
        node.object.object.type === 'Identifier' &&
        node.object.object.name === 'document' &&
        node.object.property &&
        node.object.property.type === 'Identifier' &&
        node.object.property.name === 'cookie'
      ) {
        context.report({
          node,
          messageId: 'noDirectCookie',
        });
        return;
      }
    }

    return {
      // 检查 MemberExpression（如 localStorage.getItem, sessionStorage.setItem）
      MemberExpression(node) {
        checkStorageAccess(node);
        checkCookieAccess(node);
      },
    };
  },
};
