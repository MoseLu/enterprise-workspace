# 国际化 Key 命名规范

## 概述

本文档定义了项目中国际化 key 的命名规范和文件组织规则，确保国际化文件的可维护性和一致性。

## 命名规范

### 基本规则

1. **格式**：`{category}.{module}.{feature}.{element}`
2. **命名风格**：全小写，使用下划线分隔单词（snake_case）
3. **禁止**：
   - 大驼峰命名（PascalCase）：如 `AdminInventoryTicketPrint` ❌
   - 小驼峰命名（camelCase）：如 `inventoryTicketPrint` ❌
   - 中文 key：如 `"盘点票打印"` ❌
   - 大写字母开头的 key：如 `InventoryTicketPrint` ❌

### 命名示例

#### ✅ 正确示例

```json
{
  "app.name": "拜里斯车间管理系统",
  "app.title": "车间管理",
  "menu.platform.domains": "域列表",
  "menu.org.users": "用户列表",
  "inventory.ticket.print.title": "盘点票打印",
  "inventory.ticket.print.load_failed": "加载数据失败",
  "org.user_role_assign.drawer.title": "批量角色绑定"
}
```

#### ❌ 错误示例

```json
{
  "AdminInventoryTicketPrint": "盘点票打印",  // ❌ 大驼峰
  "inventoryTicketPrint": "盘点票打印",       // ❌ 小驼峰
  "盘点票打印": "盘点票打印",                  // ❌ 中文 key
  "Inventory.ticket.print": "盘点票打印"     // ❌ 大写开头
}
```

## 分类层级

### 1. 应用级 (`app.*`)

应用的基本信息，包括名称、描述、版本等。

```json
{
  "app.name": "拜里斯车间管理系统",
  "app.title": "车间管理",
  "app.description": "系统管理、平台治理、组织与账号、访问控制",
  "app.version": "版本 1.0.0",
  "app.welcome": "欢迎使用车间管理",
  "app.loading.title": "正在加载资源",
  "app.loading.subtitle": "部分资源可能加载时间较长，请耐心等待"
}
```

### 2. 认证相关 (`auth.*`)

登录、注册、密码重置等认证相关的翻译。

```json
{
  "auth.login": "登录",
  "auth.login.account": "账号登录",
  "auth.login.phone": "手机号登录",
  "auth.login.immediately": "立即登录",
  "auth.login.password.forgot": "忘记密码？",
  "auth.register": "注册",
  "auth.forget_password": "忘记密码"
}
```

### 3. 通用组件 (`common.*`, `btc.*`)

通用组件和功能，可在多个模块中复用。

```json
{
  "common.confirm": "确认",
  "common.cancel": "取消",
  "common.search": "搜索",
  "common.created_at": "创建时间",
  "common.updated_at": "更新时间",
  "btc.table.toolbar.size": "表格密度",
  "btc.table.size.default": "默认"
}
```

### 4. 菜单级 (`menu.*`)

菜单相关的翻译，按菜单层级组织。

**排序规则**：
- 按 manifest 文件中菜单定义的顺序
- 一级菜单 → 二级菜单 → 三级菜单
- 同级菜单按定义顺序

```json
{
  "menu.platform": "平台管理",
  "menu.platform.domains": "域列表",
  "menu.platform.modules": "模块列表",
  "menu.platform.plugins": "插件列表",
  "menu.org": "组织架构",
  "menu.org.tenants": "租户列表",
  "menu.org.departments": "部门列表",
  "menu.org.users": "用户列表"
}
```

### 5. 业务模块级 (`{module}.{feature}.*`)

特定业务模块的翻译，按业务逻辑组织。

**排序规则**：
- 按业务逻辑流程顺序
- 同一页面的 key 按使用顺序：`fields` → `actions` → `messages` → `dialogs` → `others`

```json
{
  "inventory.ticket.print.title": "盘点票打印",
  "inventory.ticket.print.list": "盘点票列表",
  "inventory.ticket.print.fields.domain": "域",
  "inventory.ticket.print.fields.print_time": "打印时间",
  "inventory.ticket.print.actions.print": "打印",
  "inventory.ticket.print.messages.load_failed": "加载数据失败",
  "inventory.ticket.print.dialogs.select_range": "选择打印范围"
}
```

## 文件组织规则

### 优先级排序

文件中的 key 应按以下优先级排序：

1. **应用级** (`app.*`)
2. **认证相关** (`auth.*`)
3. **通用组件** (`common.*`, `btc.*`)
4. **菜单级** (`menu.*`) - 按菜单层级顺序
5. **业务模块** - 按模块顺序，每个模块内按功能顺序

### 菜单级排序示例

根据 `admin.json` manifest 文件中的菜单定义顺序：

```json
{
  "menu.platform": "平台管理",
  "menu.platform.domains": "域列表",
  "menu.platform.modules": "模块列表",
  "menu.platform.plugins": "插件列表",
  "menu.org": "组织架构",
  "menu.org.tenants": "租户列表",
  "menu.org.departments": "部门列表",
  "menu.org.users": "用户列表",
  "menu.access": "权限管理",
  "menu.access.config": "基础配置",
  "menu.access.resources": "资源列表",
  "menu.access.actions": "行为列表",
  "menu.access.permissions": "权限列表",
  "menu.access.roles": "角色列表",
  "menu.access.relations": "资源分配",
  "menu.access.perm_compose": "权限组合",
  "menu.access.user_assign": "用户分配",
  "menu.access.user_role_bind": "角色绑定",
  "menu.access.role_assign": "角色分配",
  "menu.access.role_permission_bind": "权限绑定",
  "menu.navigation": "导航管理",
  "menu.navigation.menus": "菜单列表",
  "menu.navigation.menu_preview": "菜单预览",
  "menu.ops": "运维管理",
  "menu.ops.logs": "日志中心",
  "menu.ops.operation_log": "操作日志",
  "menu.ops.request_log": "请求日志",
  "menu.ops.api_list": "接口列表",
  "menu.ops.baseline": "基线配置",
  "menu.ops.simulator": "模拟器",
  "menu.strategy": "策略中心",
  "menu.strategy.management": "策略管理",
  "menu.strategy.designer": "策略编排",
  "menu.strategy.monitor": "策略监控",
  "menu.governance": "数据治理",
  "menu.data.files": "文件管理",
  "menu.data.files.templates": "模板管理",
  "menu.data.dictionary": "字典管理",
  "menu.data.dictionary.fields": "字段管理",
  "menu.data.dictionary.values": "字典值管理",
  "menu.test_features": "测试功能",
  "menu.test_features.components": "组件测试中心",
  "menu.test_features.api_test_center": "接口测试中心",
  "menu.test_features.inventory_ticket_print": "盘点票打印"
}
```

### 页面级排序示例

同一页面的 key 按业务逻辑顺序：

```json
{
  "inventory.ticket.print.title": "盘点票打印",
  "inventory.ticket.print.list": "盘点票列表",
  "inventory.ticket.print.fields.domain": "域",
  "inventory.ticket.print.fields.print_time": "打印时间",
  "inventory.ticket.print.fields.material_code": "物料编码",
  "inventory.ticket.print.actions.print": "打印",
  "inventory.ticket.print.actions.refresh": "刷新",
  "inventory.ticket.print.messages.load_failed": "加载数据失败",
  "inventory.ticket.print.messages.service_unavailable": "盘点票服务不可用",
  "inventory.ticket.print.dialogs.select_range": "选择打印范围",
  "inventory.ticket.print.dialogs.range_hint": "共 {total} 条数据，请输入要打印的范围（如：1-50）"
}
```

## 文件格式要求

1. **编码**：UTF-8（无 BOM）
2. **缩进**：2 个空格
3. **换行**：文件末尾只有一个换行符
4. **一致性**：中英文文件的 key 顺序必须完全一致

## 最佳实践

1. **避免重复**：如果多个页面使用相同的文本，应使用通用 key（如 `common.confirm`）
2. **语义化命名**：key 名称应清晰表达其用途
3. **层级清晰**：使用合理的层级结构，避免过深或过浅
4. **及时清理**：删除未使用的 key，保持文件整洁
5. **统一风格**：同一模块内的 key 应保持命名风格一致

## 迁移指南

### 重命名不规范 key

**示例**：将 `AdminInventoryTicketPrint` 重命名为 `menu.test_features.inventory_ticket_print.title`

1. 在 locale 文件中重命名 key
2. 更新所有代码引用（搜索并替换）
3. 验证翻译是否正确显示

### 清理未使用的 key

1. 使用脚本分析 key 使用情况
2. 确认 key 确实未被使用
3. 从 locale 文件中删除
4. 验证应用功能正常

## 工具支持

项目提供了脚本工具用于分析 key 使用情况：

```bash
node scripts/analyze-i18n-keys.js <app-name>
```

该脚本会输出：
- 已定义的 key 总数
- 实际使用的 key 总数
- 未使用的 key 列表
- 缺失的 key 列表
