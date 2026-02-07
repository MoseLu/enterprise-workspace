# TASK-2026-002: pc-admin 多端适配与测试验证

> 任务ID：TASK-2026-002
> 优先级：P1
> 状态：待开始
> 负责人：AI Assistant / 开发者
> 创建时间：2026-02-07

---

## 一、任务基本信息

| 字段 | 值 |
|------|-----|
| 任务ID | TASK-2026-002 |
| 任务标题 | pc-admin 多端适配与测试验证 |
| 优先级 | P1（高优先级 - 关键级） |
| 任务状态 | 待开始 |
| 负责人 | 待分配 |
| 创建时间 | 2026-02-07 |
| 关联父任务 | TASK-2026-001 (pc-admin → react-admin 迁移) |

---

## 二、任务描述

### 2.1 任务背景

TASK-2026-001 已完成 80+ 组件/页面的 React 迁移，H5 构建验证成功。需要继续完成：

1. **小程序适配**：为子应用配置完整的 Taro 小程序入口文件
2. **测试覆盖**：单元测试覆盖率 ≥ 80%，E2E 测试覆盖核心流程
3. **项目归档**：旧版 Vue 迁移到 references 目录
4. **代码同步**：提交 GitHub PR

### 2.2 任务目标

1. **小程序构建验证**：14 个子应用支持小程序输出
2. **测试覆盖**：单元测试 ≥ 80%，E2E 测试覆盖登录/导航/CRUD
3. **项目归档**：旧版 Vue 代码归档
4. **代码同步**：GitHub PR 提交

---

## 三、待办事项清单

### 阶段 1：小程序构建验证

| 序号 | 待办项 | 状态 | 预估工时 | 负责人 | 备注 |
|------|--------|------|----------|--------|------|
| T01 | home-app 小程序入口配置 | ⏳ 待进行 | 2h | - | app.config.ts + 页面配置 |
| T02 | admin-app 小程序入口配置 | ⏳ 待进行 | 4h | - | 多模块页面配置 |
| T03 | main-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 认证页面配置 |
| T04 | operations-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 运维模块配置 |
| T05 | logistics-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 物流模块配置 |
| T06 | finance-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 财务模块配置 |
| T07 | system-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 系统模块配置 |
| T08 | dashboard-app 小程序入口配置 | ⏳ 待进行 | 1h | - | 仪表盘配置 |
| T09 | engineering-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 工程模块配置 |
| T10 | personnel-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 人事模块配置 |
| T11 | production-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 生产模块配置 |
| T12 | quality-app 小程序入口配置 | ⏳ 待进行 | 2h | - | 质量模块配置 |
| T13 | docs-app 小程序入口配置 | ⏳ 待进行 | 1h | - | 文档模块配置 |
| T14 | layout-app 小程序入口配置 | ⏳ 待进行 | 1h | - | 布局模块配置 |

### 阶段 2：单元测试覆盖

| 序号 | 待办项 | 状态 | 预估工时 | 负责人 | 备注 |
|------|--------|------|----------|--------|------|
| T15 | home-app 组件测试 | ⏳ 待进行 | 4h | - | 8+ 组件测试 |
| T16 | main-app 组件测试 | ⏳ 待进行 | 6h | - | 布局 + 认证组件 |
| T17 | admin-app 组件测试 | ⏳ 待进行 | 8h | - | CRUD + 策略组件 |
| T18 | logistics-app 组件测试 | ⏳ 待进行 | 4h | - | 业务组件测试 |
| T19 | 共享库组件测试 | ⏳ 待进行 | 4h | - | @enterprise-workspace/frontend |
| T20 | 测试覆盖率验证 | ⏳ 待进行 | 2h | - | 确保 ≥ 80% |

### 阶段 3：E2E 测试覆盖

| 序号 | 待办项 | 状态 | 预估工时 | 负责人 | 备注 |
|------|--------|------|----------|--------|------|
| T21 | Playwright 配置 | ⏳ 待进行 | 2h | - | 安装 + 配置 |
| T22 | 登录流程 E2E 测试 | ⏳ 待进行 | 4h | - | 认证流程覆盖 |
| T23 | 导航菜单 E2E 测试 | ⏳ 待进行 | 4h | - | 路由跳转覆盖 |
| T24 | CRUD 操作 E2E 测试 | ⏳ 待进行 | 6h | - | 增删改查覆盖 |
| T25 | 表单提交 E2E 测试 | ⏳ 待进行 | 4h | - | 表单验证覆盖 |

### 阶段 4：项目归档

| 序号 | 待办项 | 状态 | 预估工时 | 负责人 | 备注 |
|------|--------|------|----------|--------|------|
| T26 | 创建 references/pc-admin-vue | ⏳ 待进行 | 1h | - | 创建目录结构 |
| T27 | 移动 Vue 代码到 references | ⏳ 待进行 | 2h | - | git mv 保留历史 |
| T28 | 更新文档指向 references | ⏳ 待进行 | 1h | - | 链接更新 |
| T29 | 创建旧版 README | ⏳ 待进行 | 1h | - | 归档说明文档 |

### 阶段 5：GitHub PR

| 序号 | 待办项 | 状态 | 预估工时 | 负责人 | 备注 |
|------|--------|------|----------|--------|------|
| T30 | 编写 PR 描述文档 | ⏳ 待进行 | 2h | - | 重大重构说明 |
| T31 | 提交 GitHub PR | ⏳ 待进行 | 1h | - | btc-shopflow-monorepo |
| T32 | PR 代码评审 | ⏳ 待进行 | 4h | - | 团队评审 |

---

## 四、技术细节

### 4.1 小程序入口配置示例

```typescript
// apps/home-app/src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/about/index',
    'pages/help/index',
    'pages/terms/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '首页',
    navigationBarTextStyle: 'black',
  },
});
```

### 4.2 页面配置示例

```typescript
// apps/home-app/src/pages/index/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '首页',
  usingComponents: {},
});
```

### 4.3 Vitest 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```

### 4.4 Playwright E2E 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

---

## 五、验收标准

- [ ] 14 个子应用小程序入口配置完成
- [ ] 小程序构建验证通过
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] E2E 测试覆盖登录/导航/CRUD 核心流程
- [ ] 旧版 pc-admin 归档至 references/pc-admin-vue
- [ ] GitHub PR 提交并通过评审

---

## 六、关联信息

### 6.1 关联文档

| 文档名称 | 路径 |
|----------|------|
| 父任务迁移文档 | `../02-product-modules/pc-admin/migration-pc-admin-to-react-admin.md` |
| Taro 官方文档 | https://taro-docs.jd.com/ |
| Vitest 官方文档 | https://vitest.dev/ |
| Playwright 官方文档 | https://playwright.dev/ |

### 6.2 代码仓库

| 仓库 | 路径 |
|------|------|
| enterprise-workspace | `products/react-admin/` |
| btc-shopflow-monorepo | 待同步 |

---

## 七、工时预估

| 阶段 | 预估工时 | 实际工时 | 状态 |
|------|----------|----------|------|
| 小程序构建验证 | 27h | - | ⏳ 待开始 |
| 单元测试覆盖 | 28h | - | ⏳ 待开始 |
| E2E 测试覆盖 | 20h | - | ⏳ 待开始 |
| 项目归档 | 5h | - | ⏳ 待开始 |
| GitHub PR | 7h | - | ⏳ 待开始 |
| **总计** | **87h** | - | - |

---

> 创建时间：2026-02-07
> 创建人：AI Assistant
> 状态：待开始
