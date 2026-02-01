/**
 * 生产环境子应用的 virtual:eps 空实现
 *
 * 目的：
 * - 子应用在生产环境由 layout-app 提供共享 EPS 服务（window.__APP_EPS_SERVICE__）
 * - 子应用不应再引入/构建自己的 virtual:eps 与 eps-service chunk，避免重复与 404 风险
 */
const empty = {
  service: {},
  list: [],
};

export default empty;


