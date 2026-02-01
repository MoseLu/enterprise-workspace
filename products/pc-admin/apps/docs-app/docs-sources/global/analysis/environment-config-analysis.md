# 环境配置分析报告：POC/SIT/UAT 环境必要性评估

## 📋 执行摘要

本报告分析了当前 BTC ShopFlow 项目的环境配置现状，并评估是否需要添加 POC（概念验证）、SIT（系统集成测试）、UAT（用户验收测试）三种专用环境。

**结论**：当前项目已具备基本的环境体系，但缺少规范的 POC、SIT、UAT 环境划分。**建议添加这三种环境**，以完善研发和测试流程，确保从技术验证到业务验收的全链路质量保障。

**实施状态**：✅ **已完成** - POC、SIT、UAT 三种环境已成功添加到项目中，包括环境类型定义、配置方案、域名检测逻辑、应用配置和部署配置。

---

## 🔍 当前环境配置现状

### 1. 现有环境定义

项目在 `packages/shared-core/src/configs/unified-env-config.ts` 中定义了七种环境：

| 环境 | 域名/标识 | 用途 | 特点 |
|------|----------|------|------|
| `development` | `localhost:8080` 系列 | 本地开发 | 热更新、调试工具、开发服务器 |
| `preview` | `localhost:4173` 系列 | 本地预览 | 构建产物预览、静态服务 |
| `poc` | `poc.bellis.com.cn` | 概念验证 | 技术方案验证、快速搭建/销毁 |
| `sit` | `sit.bellis.com.cn` | 系统集成测试 | 研发内部集成测试、测试数据 |
| `uat` | `uat.bellis.com.cn` | 用户验收测试 | 业务方验收、脱敏生产数据 |
| `test` | `test.bellis.com.cn` | 测试环境（UAT 别名） | 在线测试、域名访问（向后兼容） |
| `production` | `bellis.com.cn` | 生产环境 | 正式上线、生产域名 |

### 2. 现有测试类型

项目提供了多层测试保障：

- **单元测试** (`test:unit`) - Vitest + Testing Library
- **集成测试** (`test:integration`) - Vitest + MSW（业务契约测试）
- **E2E测试** (`test:e2e`) - Playwright
- **部署测试** (`test:deployment`) - 验证构建产物可访问性

### 3. 部署配置

部署配置位于 `scripts/config/deploy.config.js`，目前定义了：
- `development` - 开发环境
- `poc` - POC 环境
- `sit` - SIT 环境
- `uat` - UAT 环境
- `test` - 测试环境（UAT 别名，向后兼容）
- `production` - 生产环境

---

## 🎯 POC/SIT/UAT 环境定义与对比

### POC（Proof of Concept）- 概念验证环境

**核心用途**：
- 验证技术方案可行性（如微前端框架、新中间件）
- 验证架构选型是否满足性能/兼容性需求
- 验证核心功能的技术实现路径
- 输出技术可行性报告，为项目立项提供依据

**测试主体**：研发人员、架构师

**环境特点**：
- 最小化原型环境
- 快速搭建，可随时销毁重建
- 专注于技术验证，不要求完整功能

### SIT（System Integration Testing）- 系统集成测试环境

**核心用途**：
- 对已完成单元测试的模块/子系统进行集成测试
- 验证模块间的接口、数据流转、依赖关系
- 发现模块集成后的接口异常、数据一致性问题、服务依赖冲突
- 验证系统基本功能完整性

**测试主体**：测试工程师

**环境特点**：
- 接近生产的集成环境
- 包含所有已完成的模块
- 稳定的环境，适合持续集成测试

### UAT（User Acceptance Testing）- 用户验收测试环境

**核心用途**：
- 模拟生产环境，让最终用户/业务方验证系统
- 确认系统功能与业务流程匹配
- 验证系统易用性、业务合理性
- **UAT 通过是系统上线的必要前提**

**测试主体**：业务人员、产品经理、客户（最终使用者）

**环境特点**：
- 环境配置、数据（脱敏后）与生产环境尽可能一致
- 避免因环境差异导致上线后出现问题
- 测试结果由业务方签字确认

---

## 📊 当前环境 vs POC/SIT/UAT 映射分析

### 现状映射

| 标准环境 | 当前环境 | 匹配度 | 说明 |
|---------|---------|--------|------|
| **POC** | ✅ `poc` | 100% | ✅ 已实施：POC 环境已添加，支持 `poc.bellis.com.cn` 和动态 POC 实例 |
| **SIT** | ✅ `sit` | 100% | ✅ 已实施：SIT 环境已添加，支持 `sit.bellis.com.cn` 子域名 |
| **UAT** | ✅ `uat` + `test` | 100% | ✅ 已实施：UAT 环境已添加，支持 `uat.bellis.com.cn`，`test.bellis.com.cn` 作为别名保留 |

### 问题分析

#### 1. **缺少 POC 环境**

**现状问题**：
- 技术验证混在 `development` 环境中，容易影响正常开发
- 概念验证需要快速搭建/销毁，但当前环境配置较复杂
- 没有独立的 POC 构建/部署流程

**影响**：
- 技术选型验证不够隔离，可能影响开发环境稳定性
- 无法快速创建/销毁概念验证原型

#### 2. **SIT 和 UAT 混用**

**现状问题**：
- 当前的 `test` 环境（test.bellis.com.cn）同时承担 SIT 和 UAT 的职责
- 缺少研发内部的集成测试环境，直接暴露给业务方
- 测试数据可能包含测试用例数据，不适合业务方验收

**影响**：
- 测试工程师和业务人员共用环境，可能互相干扰
- 无法区分技术问题（SIT）和业务问题（UAT）
- 部署流程不够清晰（什么版本应该部署到 SIT，什么版本到 UAT）

#### 3. **环境职责不清晰**

**现状问题**：
- `preview` 环境主要用于本地预览，不适合团队共享的集成测试
- 缺少明确的环境部署策略（POC → SIT → UAT → Production）

**影响**：
- 代码版本在不同环境的流转不清晰
- 无法建立规范的测试流程

---

## ✅ 建议方案

### 方案一：完整添加三种环境（推荐）

#### 环境架构设计

```
开发流程：
Development → POC → SIT → UAT → Production
   (本地)    (概念)  (集成)  (验收)  (生产)
```

#### 具体环境配置

1. **POC 环境**
   - **域名/标识**：`poc.bellis.com.cn` 或 `poc-xxx.bellis.com.cn`（动态创建）
   - **用途**：技术概念验证
   - **特点**：
     - 支持快速创建/销毁
     - 可同时存在多个 POC 实例（用于不同技术方案对比）
     - 最小化配置，仅包含核心功能模块
   - **部署策略**：手动触发，按需创建
   - **生命周期**：短期（验证完成后可销毁）

2. **SIT 环境**（新增）
   - **域名/标识**：`sit.bellis.com.cn` 或 `sit-test.bellis.com.cn`
   - **用途**：系统集成测试（研发内部）
   - **特点**：
     - 包含所有已完成的模块
     - 使用测试数据（非生产数据）
     - 自动触发部署（代码合并到 develop 分支后）
   - **部署策略**：CI/CD 自动部署
   - **测试主体**：测试工程师、研发人员

3. **UAT 环境**（重构现有 test 环境）
   - **域名/标识**：`uat.bellis.com.cn`（当前 `test.bellis.com.cn` 重命名或保留作为别名）
   - **用途**：用户验收测试
   - **特点**：
     - 环境配置与生产环境一致
     - 使用脱敏后的生产数据
     - 手动触发部署（SIT 通过后）
   - **部署策略**：手动触发（需要测试通过标志）
   - **测试主体**：业务人员、产品经理、客户

4. **Production 环境**（保持不变）
   - **域名/标识**：`bellis.com.cn`
   - **用途**：正式生产环境
   - **部署策略**：UAT 通过后，手动触发上线

#### 实施步骤

**阶段一：添加 SIT 环境（优先级最高）**

1. 在 `unified-env-config.ts` 中添加 `sit` 环境类型
2. 配置 SIT 环境的域名和 API 地址
3. 在 `app-env.config.ts` 中添加各应用的 SIT 环境配置
4. 添加构建脚本：`build:sit`, `deploy:sit`
5. 配置 CI/CD：develop 分支合并后自动部署到 SIT
6. 更新部署文档

**阶段二：重构 UAT 环境**

1. 保留现有 `test` 环境配置（向后兼容）
2. 添加 `uat` 环境类型（可选：将 `test` 重命名为 `uat`）
3. 明确 UAT 环境的部署触发条件（SIT 测试通过）
4. 配置 UAT 环境使用脱敏生产数据
5. 更新业务方的访问地址和文档

**阶段三：添加 POC 环境（按需）**

1. 添加 `poc` 环境类型（支持动态创建）
2. 创建 POC 环境快速搭建脚本
3. 支持多 POC 实例（不同技术方案对比）
4. 添加 POC 环境销毁脚本
5. 文档化 POC 环境使用流程

#### 配置示例

```typescript
// unified-env-config.ts 新增环境配置
export type Environment = 'development' | 'preview' | 'poc' | 'sit' | 'uat' | 'production';

const configSchemes: Record<ConfigScheme, Record<Environment, EnvironmentConfig>> = {
  default: {
    // ... existing environments ...
    
    poc: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://poc-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://poc.bellis.com.cn',
        entryPrefix: '',
      },
      // ... other configs ...
    },
    
    sit: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://sit-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://sit.bellis.com.cn',
        entryPrefix: '',
      },
      // ... other configs ...
    },
    
    uat: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://uat-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://uat.bellis.com.cn', // 或保留 test.bellis.com.cn
        entryPrefix: '',
      },
      // ... other configs ...
    },
  },
};
```

```typescript
// app-env.config.ts 新增环境配置
const BUSINESS_APP_CONFIGS: AppEnvConfig[] = [
  {
    appName: 'admin-app',
    // ... existing configs ...
    pocHost: 'admin.poc.bellis.com.cn',    // 新增
    pocPort: '9081',                       // 新增（可选）
    sitHost: 'admin.sit.bellis.com.cn',    // 新增
    sitPort: '9081',                       // 新增（可选）
    testHost: 'admin.test.bellis.com.cn',  // 保留（向后兼容）
    uatHost: 'admin.uat.bellis.com.cn',    // 新增（或重命名 testHost）
    // ... other configs ...
  },
  // ...
];
```

### 方案二：简化方案（如果资源有限）

如果暂时无法提供多个独立环境，可以采用**环境复用 + 流程规范**的方式：

1. **保留现有环境结构**，但明确各环境的职责：
   - `development` → 开发 + POC（通过分支隔离）
   - `preview` → 本地预览
   - `test` → SIT + UAT（通过部署策略和访问权限区分）

2. **通过部署策略区分 SIT 和 UAT**：
   - SIT：develop 分支自动部署，测试工程师访问
   - UAT：手动触发部署，业务方访问（可使用相同的 test 环境，但部署不同的代码版本）

3. **通过流程文档明确**：
   - 建立明确的测试流程文档
   - 定义代码从 SIT 到 UAT 的流转规则
   - 明确各环境的测试主体和测试目标

---

## 📈 预期收益

### 添加三种环境的收益

1. **POC 环境**
   - ✅ 技术选型验证更加隔离，不影响开发
   - ✅ 支持快速创建/销毁，降低资源占用
   - ✅ 可同时验证多个技术方案，便于对比

2. **SIT 环境**
   - ✅ 测试工程师独立环境，避免与业务方干扰
   - ✅ 自动化部署，提高测试效率
   - ✅ 明确的集成测试流程，降低集成问题发现成本

3. **UAT 环境**
   - ✅ 业务方专用环境，职责清晰
   - ✅ 环境配置与生产一致，降低上线风险
   - ✅ 明确的验收流程，确保上线质量

### 整体流程优化

- **质量保障**：POC → SIT → UAT → Production 的递进测试，确保每个环节都经过验证
- **风险控制**：技术风险（POC）、集成风险（SIT）、业务风险（UAT）分层把控
- **效率提升**：环境职责清晰，减少环境混乱导致的重复工作

---

## ⚠️ 实施注意事项

1. **域名和服务器资源**
   - 需要为 SIT、UAT、POC 环境准备独立的域名和服务器资源
   - 或使用子域名（如 `sit.bellis.com.cn`, `uat.bellis.com.cn`）

2. **数据准备**
   - SIT 环境：使用测试数据（可由测试工程师管理）
   - UAT 环境：使用脱敏后的生产数据（需要数据脱敏流程）

3. **向后兼容**
   - 保留现有 `test` 环境的配置和访问方式（作为 UAT 的别名）
   - 逐步迁移，避免影响现有流程

4. **CI/CD 配置**
   - 配置各环境的自动部署触发条件
   - 建立环境部署的审批流程（特别是 UAT 和 Production）

5. **文档更新**
   - 更新环境配置文档
   - 建立各环境的使用规范和流程文档
   - 培训测试团队和业务团队

---

## 📝 结论与建议

### 结论

当前项目已具备基本的环境体系（development、preview、test、production），但**缺少规范的 POC、SIT、UAT 环境划分**。建议添加这三种环境，以完善研发和测试流程。

### 推荐实施优先级

1. **高优先级：添加 SIT 环境**
   - 当前最紧急的需求
   - 可以立即改善测试流程
   - 实施难度中等

2. **中优先级：重构 UAT 环境**
   - 将现有 `test` 环境明确为 UAT
   - 建立 UAT 验收流程
   - 实施难度低（主要是流程和文档）

3. **低优先级：添加 POC 环境**
   - 按需创建，不需要常驻环境
   - 可以通过脚本快速搭建
   - 实施难度低

### 下一步行动

1. ✅ **评审本报告**，确认环境规划方案
2. ✅ **评估资源**，确认能否提供独立的环境资源
3. ✅ **制定实施计划**，分阶段实施
4. ✅ **开始实施** SIT 环境（优先级最高）

---

## 📚 参考资料

- 当前环境配置：`packages/shared-core/src/configs/unified-env-config.ts`
- 应用环境配置：`packages/shared-core/src/configs/app-env.config.ts`
- 部署配置：`scripts/config/deploy.config.js`
- 部署测试脚本：`scripts/commands/test/deployment-test.mjs`

---

**报告生成时间**：2025-01-19  
**分析人员**：AI Assistant  
**审核状态**：✅ 已实施  
**实施时间**：2025-01-19  
**实施内容**：
- ✅ 添加了 POC、SIT、UAT 三种环境类型定义
- ✅ 在 `unified-env-config.ts` 中添加了三种环境的完整配置
- ✅ 更新了环境检测逻辑，支持新环境的域名识别（浏览器环境）和环境变量识别（Node.js 环境）
- ✅ 更新了所有应用的环境配置，添加了 `pocHost`、`sitHost`、`uatHost` 字段
- ✅ 添加了辅助函数：`getAppConfigByPocHost`、`getAppConfigBySitHost`、`getAppConfigByUatHost`
- ✅ 更新了 `getSubAppEntry`、`getSubAppActiveRule`、`getCurrentSubApp`、`isMainApp` 等函数
- ✅ 更新了 `useEnvInfo` composable，添加了 `isPoc`、`isSit`、`isUat` 计算属性
- ✅ 更新了部署配置，添加了新环境的部署选项

### Node.js 环境中的环境识别

在 Node.js 环境中（如 Vite 配置文件、构建脚本等），可以通过以下环境变量来指定环境：

- **`VITE_ENV`** 或 **`APP_ENV`**：显式指定环境类型
  - 可选值：`development`、`preview`、`poc`、`sit`、`uat`、`test`、`production`
  - 示例：`VITE_ENV=sit npm run build`

- **`NODE_ENV`**：如果未设置 `VITE_ENV` 或 `APP_ENV`，则根据 `NODE_ENV` 判断
  - `NODE_ENV=production` → `production`
  - 其他值 → `development`

**使用示例**：
```bash
# 构建 SIT 环境
VITE_ENV=sit npm run build

# 构建 UAT 环境
VITE_ENV=uat npm run build

# 构建 POC 环境
VITE_ENV=poc npm run build
```
