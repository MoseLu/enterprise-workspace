# Admin-App 配置迁移清单

## 扫描结果

### 包含 columns 配置的页面（46个文件）

#### org 模块
- `org/views/user-role-assign/index.vue` - 包含 roleColumns
- `org/views/tenants/index.vue` - 包含 columns
- `org/views/departments/index.vue` - 包含 columns
- `org/views/users/index.vue` - 包含 userColumns，已有 config.ts
- `org/views/dept-role-bind/index.vue` - 需要检查

#### access 模块
- `access/views/resources/index.vue` - 包含 columns
- `access/views/actions/index.vue` - 包含 columns
- `access/views/permissions/index.vue` - 包含 columns
- `access/views/roles/index.vue` - 包含 columns，已有 config.ts
- `access/views/role-permission-bind/index.vue` - 需要检查
- `access/views/role-perm-bind/index.vue` - 需要检查
- `access/views/perm-compose/index.vue` - 需要检查

#### platform 模块
- `platform/access/views/actions/index.vue` - 包含 columns
- `platform/access/views/roles/index.vue` - 包含 columns
- `platform/views/domains/index.vue` - 包含 columns
- `platform/views/modules/index.vue` - 需要检查
- `platform/views/plugins/index.vue` - 需要检查
- `platform/org/views/user-role-assign/index.vue` - 包含 roleColumns
- `platform/org/views/dept-role-bind/index.vue` - 需要检查
- `platform/navigation/views/menu-perm-bind/index.vue` - 需要检查

#### governance 模块
- `governance/views/dictionary/values/index.vue` - 包含 columns
- `governance/views/dictionary/fields/index.vue` - 包含 columns
- `governance/views/files/templates/index.vue` - 需要检查

#### ops 模块
- `ops/views/api-list/index.vue` - 包含 columns
- `ops/views/baseline/index.vue` - 包含 columns
- `ops/views/simulator/index.vue` - 需要检查
- `ops/views/logs/request/index.vue` - 需要检查
- `ops/views/logs/operation/index.vue` - 需要检查
- `ops/views/logs/index.vue` - 需要检查

#### navigation 模块
- `navigation/views/menus/index.vue` - 包含 columns
- `navigation/views/menu-preview/index.vue` - 需要检查
- `navigation/views/menu-perm-bind/index.vue` - 需要检查

#### strategy 模块
- `strategy/views/management/index.vue` - 包含 columns
- `strategy/views/monitor/index.vue` - 包含 columns
- `strategy/views/monitor/components/StrategyExecutionHistory.vue` - 包含 columns
- `strategy/views/monitor/components/StrategyDetailPanel.vue` - 需要检查
- `strategy/views/monitor/components/StrategyAlertConfig.vue` - 需要检查
- `strategy/views/monitor/components/ExecutionDetailPanel.vue` - 需要检查
- `strategy/views/designer/index.vue` - 需要检查（复杂组件）
- `strategy/views/designer/components/*` - 多个组件文件，需要单独处理

#### test 模块
- `test/views/crud/index.vue` - 包含 columns
- `test/views/import-demo/index.vue` - 包含 columns
- `test/views/inventory-ticket-print/index.vue` - 包含 columns
- `test/views/btc-tabs/index.vue` - 需要检查

### 包含 service 配置的页面（20个文件）

大部分页面都使用 `service` 对象，需要统一管理。

### 已有 config.ts 的页面

- `org/views/users/config.ts` - 已有配置示例
- `access/views/roles/config.ts` - 已有配置示例

## 模块结构分析

### 需要创建 config.ts 的模块路径

1. `org/config.ts` - 组织模块配置（已有 platform/org/config.ts）
2. `access/config.ts` - 访问控制模块配置
3. `platform/access/config.ts` - 平台访问控制配置
4. `platform/views/config.ts` - 平台视图配置（domains, modules, plugins）
5. `governance/config.ts` - 治理模块配置
6. `ops/config.ts` - 运维模块配置
7. `navigation/config.ts` - 导航模块配置
8. `strategy/config.ts` - 策略模块配置
9. `test/config.ts` - 测试模块配置

## 迁移优先级

### 高优先级（核心业务模块）
1. org 模块 - 组织与账号管理
2. access 模块 - 访问控制
3. platform 模块 - 平台管理

### 中优先级（功能模块）
4. governance 模块 - 数据治理
5. ops 模块 - 运维管理
6. navigation 模块 - 导航管理

### 低优先级（特殊模块）
7. strategy 模块 - 策略管理（复杂，需要特殊处理）
8. test 模块 - 测试功能（可最后处理）

## 注意事项

1. strategy/designer 模块包含大量复杂组件，需要单独处理
2. 部分页面已有独立的 config.ts 文件，需要整合到模块级 config.ts
3. 需要检查 locales/*.json 文件，迁移国际化配置
