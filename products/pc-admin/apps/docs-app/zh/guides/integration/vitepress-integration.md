---
title: "文档集成"
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: 文档集成
sidebar_order: 1
sidebar_group: integration
---
# VitePress 文档中心集成完成报告

## 完成时间
2025-10-13

## 实施方案
**方案 A2-1：iframe 嵌入 + 主应用侧边栏隐藏**

VitePress 作为独立应用运行在 8086 端口，通过 iframe 嵌入到主应用中进入文档中心后，主应用的左侧菜单自动隐藏，VitePress 完全接管显示区域

## 实施内容

### 1. VitePress 基础架构

- **package.json** - 添加所有必要依赖（VitePressElement Plusgray-matterajvglob 等）
- **VitePress 配置** - 端口 8086导航搜索别名SSR 配置
- **自定义主题** - 复用主应用的 theme.scss 和 global.scss
- **自定义组件**:
- `DocumentMeta.vue` - 文档元数据展示（作者日期标签保密级别）
- `Demo.vue` - 组件演示容器

### 2. 主题同步机制

**VitePress 端（接收方）**:
- 从 `localStorage` 读取 `isDark` 初始化主题
- 监听来自主应用的 `postMessage`（`btc-theme-sync` 消息）
- 监听 `storage` 事件（跨标签页同步）
- 同时更新 `vitepress-theme-appearance` 和 `isDark`
- 通过 `.dark` class 控制 VitePress 的暗黑模式

**主应用端（发送方）**:
- 创建 `/docs` 页面，使用 iframe 嵌入 VitePress
- 监听主题切换语言切换storage 变化
- 通过 `postMessage` 实时通知 iframe 内的 VitePress
- VitePress 准备好后自动同步初始状态

### 3. 文档管理脚本

- **`ingest.ts`** - 文档收录脚本（扫描验证Git 元数据生成索引）
- **`add-frontmatter.ts`** - 批量添加 frontmatter
- **`validate-frontmatter.ts`** - 验证 frontmatter
- **`new-doc.ts`** - 交互式创建新文档
- **`frontmatter.schema.json`** - JSON Schema 验证规范
- **`.sources.json`** - 源文档白名单配置

### 4. 主应用集成

- **路由配置** - 添加 `/docs` 路由
- **菜单配置** - 添加"文档中心"菜单项（Document 图标）
- **tab 注册** - 添加 docs tab 元数据
- **i18n 翻译** - 中英文"文档中心"/"Docs Center"
- **docs-mode CSS** - 自动隐藏左侧边栏的样式

### 5. 启动脚本

`start-all.bat` - 一键启动所有应用（包括 docs-site）

## 技术实现细节

### postMessage 通信

```typescript
// 主应用发送消息
docsIframe.contentWindow.postMessage({
type: 'btc-theme-sync',
isDark: true
}, '*');

// VitePress 接收消息
window.addEventListener('message', (event) => {
if (event.data?.type === 'btc-theme-sync') {
const { isDark } = event.data;
applyTheme(isDark);
}
});
```

### 主题应用（VitePress）

```typescript
function applyTheme(isDark: boolean) {
const html = document.documentElement;

if (isDark) {
html.classList.add('dark');
localStorage.setItem('vitepress-theme-appearance', 'dark');
} else {
html.classList.remove('dark');
localStorage.setItem('vitepress-theme-appearance', 'light');
}

localStorage.setItem('isDark', JSON.stringify(isDark));
}
```

### docs-mode CSS

```scss
body.docs-mode {
.app-layout__sidebar {
display: none !important;
}

.app-layout__main {
margin-left: 0 !important;
}

.app-layout__content {
padding: 0 !important;
height: 100%;
}
}
```

## 目录结构

```
apps/docs-site/
.vitepress/
config.ts # VitePress 配置（端口 8086）
theme/ # 自定义主题
index.ts # 主题入口（复用主应用配置，postMessage 监听）
components/ # 自定义组件
DocumentMeta.vue
Demo.vue
schemas/ # frontmatter JSON Schema
_ingested/ # 收录的文档（自动生成）
scripts/ # 脚本工具
ingest.ts
add-frontmatter.ts
validate-frontmatter.ts
new-doc.ts
.sources.json # 源文档配置
index.md # 首页
timeline/ # 时间线页面
projects/ # 项目索引页面
types/ # 类型索引页面
tags/ # 标签页面
README.md # 使用指南
package.json
```

## 使用指南

### 启动所有应用

```bash
# 方式 1：一键启动所有应用（推荐）
pnpm dev

# 方式 2：使用 Turbo 启动
pnpm dev:all

# 方式 3：单独启动文档中心
cd apps/docs-site
pnpm dev
```

### 访问地址

- **主应用**: http://localhost:8080
- **物流应用**: http://localhost:8081
- **工程应用**: http://localhost:8082
- **品质应用**: http://localhost:8083
- **生产应用**: http://localhost:8084
- **文档中心（独立）**: http://localhost:8085
- **文档中心（嵌入）**: http://localhost:8080/docs （点击主应用左侧菜单"文档中心"）

### 创建新文档

```bash
# 使用交互式向导
pnpm --filter docs-site-app new-doc

# 或手动创建后运行 ingest
pnpm --filter docs-site-app ingest
```

### 验证文档

```bash
pnpm --filter docs-site-app validate-frontmatter
```

## 功能特性

### 1. 主题实时同步

- 主应用切换暗黑模式 VitePress 立即响应
- 初始加载时从 localStorage 读取主题
- VitePress 刷新后保持主题一致
- 跨标签页同步

### 2. 视觉统一

- VitePress 使用主应用的 CSS 变量和主题样式
- 保留 VitePress 的侧边栏导航和搜索
- 进入文档中心时隐藏主应用侧边栏
- 保留主应用的 topbar 和 tabbar

### 3. 文档管理

- frontmatter 验证（JSON Schema）
- Git 元数据提取（commitauthordate）
- 自动生成索引页（时间线项目类型标签）
- 多维度文档分类
- 保密级别控制

### 4. 组件演示

- 在文档中使用 `<Demo>` 组件
- 可以引用 @btc/shared-components 的所有组件
- 代码和效果对照展示

## 注意事项

### 1. 端口占用

确保 8086 端口未被占用如果被占用，VitePress 会报错（`strictPort: true`）

### 2. 主题同步延迟

postMessage 通信是异步的，主题切换可能有 ~100ms 延迟如果需要更快响应，可以调整 `setTimeout` 时间

### 3. 语言切换

VitePress 的界面文本是构建时确定的，不支持运行时切换语言当前配置为中文主界面，但 Element Plus 组件的语言可以动态切换

如果需要完整的多语言切换：
- 构建两个版本的 VitePress（中文版和英文版）
- 或刷新 iframe 来切换语言（会丢失当前滚动位置）

### 4. iframe 限制

- VitePress 和主应用在不同的 JavaScript 上下文
- 需要通过 postMessage 通信
- 不能直接访问主应用的 Vue 组件或状态

### 5. 文档收录规则

只有 `publish: true` 的文档才会被 ingest 收录确保新文档的 frontmatter 包含完整的必需字段

## 后续工作

### Phase 1: 文档迁移（待执行）

1. **批量添加 frontmatter**
```bash
pnpm --filter docs-site-app add-frontmatter
```

2. **运行 ingest 收录**
```bash
pnpm --filter docs-site-app ingest
```

3. **验证结果**
```bash
pnpm --filter docs-site-app validate-frontmatter
pnpm --filter docs-site-app dev
```

4. **删除原文档**（慎重！确认迁移成功后）
- 删除 `docs/guides/`
- 删除 `docs/adr/`
- 删除 `docs/sop/`
- 删除所有包级 README
- 保留项目级 README

### Phase 2: 组件文档（可选）

创建组件演示文档：
- components/btc-crud.md
- components/btc-table.md
- components/btc-upsert.md
- components/btc-dialog.md
- components/btc-form.md
- components/btc-view-group.md

### Phase 3: CI/CD（可选）

配置文档质量检查和自动部署：
- PR 时验证 frontmatter
- 自动构建和部署到内网服务器

## 总结

VitePress 文档中心已成功集成到 BTC 车间流程管理系统中：

- **完全保留 VitePress 优势**（搜索导航主题SSR）
- **主题实时同步**（暗黑模式CSS 变量）
- **无缝嵌入主应用**（不需要新标签页跳转）
- **文档管理自动化**（收录验证索引生成）
- **组件演示能力**（可在文档中演示 BTC 组件）

用户体验：
- 点击"文档中心"菜单 左侧菜单隐藏 VitePress 接管整个显示区域
- 切换主题 VitePress 立即同步
- 保留 topbar 和 tabbar 可以随时切换回其他应用
- 可以打开多个文档标签页

**开始使用**: `start-all.bat` 启动所有应用，然后访问 http://localhost:8080 点击"文档中心"！

