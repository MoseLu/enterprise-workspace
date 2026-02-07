import { d as definePluginConfig } from "./vendor-CQyebC7G.js";
import "./auth-api-Df5AdCU7.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const themePlugin = {
  name: "theme",
  version: "1.0.0",
  description: "Theme switching plugin (migrated to user-setting plugin)",
  order: 15,
  // 插件配置元数据
  config: definePluginConfig({
    label: "主题切换",
    description: "提供明暗主题切换和自定义主题配置（已整合到用户设置）",
    author: "BTC Team",
    version: "1.0.0",
    updateTime: "2024-01-15",
    category: "core",
    tags: ["theme", "dark-mode", "light-mode"],
    recommended: true
  })
  // 不再提供工具栏配置，功能已整合到用户设置插件
};
export {
  themePlugin
};
