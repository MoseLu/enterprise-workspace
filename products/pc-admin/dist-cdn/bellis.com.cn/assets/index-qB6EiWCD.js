import { _ as __vitePreload } from "./auth-api-CvJd6wHo.js";
import { d as definePluginConfig } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const githubPlugin = {
  name: "github",
  version: "1.0.0",
  description: "GitHub repository access plugin",
  order: 10,
  // 设置合适的加载顺序
  // 插件配置元数据
  config: definePluginConfig({
    label: "GitHub 集成",
    description: "提供 GitHub 仓库访问和代码展示功能",
    author: "BTC Team",
    version: "1.0.0",
    updateTime: "2024-01-15",
    category: "integration",
    tags: ["github", "repository", "code", "toolbar"],
    recommended: true,
    doc: "https://github.com/BellisGit/btc-shopflow"
  }),
  // 工具栏配置
  toolbar: {
    order: 1,
    // 在最左侧
    pc: true,
    h5: true,
    component: () => __vitePreload(() => import("https://all.bellis.com.cn/system-app/assets/code-DXbk3FUQ.js"), true ? [] : void 0)
  },
  // 插件API
  api: {
    openRepository: (url) => {
      window.open(url || "https://github.com/BellisGit/btc-shopflow.git", "_blank");
    }
  }
};
export {
  githubPlugin
};
