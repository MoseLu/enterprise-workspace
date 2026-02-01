import { _ as __vitePreload } from "./auth-api-CvJd6wHo.js";
import { d as definePluginConfig } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const i18nPlugin = {
  name: "i18n",
  version: "1.0.0",
  description: "Internationalization plugin",
  order: 5,
  // 插件配置元数据
  config: definePluginConfig({
    label: "国际化",
    description: "提供多语言切换和国际化支持",
    author: "BTC Team",
    version: "1.0.0",
    updateTime: "2024-01-15",
    category: "core",
    tags: ["i18n", "language", "locale", "toolbar"],
    recommended: true
  }),
  // 工具栏配置
  toolbar: {
    order: 2,
    // GitHub之后
    pc: true,
    h5: true,
    component: () => __vitePreload(() => import("https://all.bellis.com.cn/system-app/assets/index-C2y_TXa-.js"), true ? [] : void 0)
  }
};
export {
  i18nPlugin
};
