/**
 * Style Dictionary 自定义 Transforms
 * 用于生成 BTC 项目特定的变量名格式
 */

export default {
  /**
   * 将令牌路径转换为 --btc-* 格式的 CSS 变量名
   * 例如: spacing.crud.gap -> --btc-crud-gap
   */
  'name/btc-css': {
    type: 'name',
    transform: (token) => {
      const path = token.path;
      // 跳过 'btc' 前缀（如果存在）
      const parts = path.slice(path[0] === 'btc' ? 1 : 0);
      // 转换为 kebab-case
      const name = parts
        .map((part) => part.replace(/([A-Z])/g, '-$1').toLowerCase())
        .join('-');
      return `--btc-${name}`;
    },
  },
};
