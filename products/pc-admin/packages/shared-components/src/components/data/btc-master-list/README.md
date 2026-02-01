# BtcMasterList 通用主列表组件

一个具有普适性的主列表组件，用于处理各种从属关系场景，如部门-用户、域-模块、域-插件、角色-权限等。

## 特性

- 🎯 **通用性强**：支持任意主从关系数据
- 🌳 **树形结构**：支持层级数据展示
- 🎨 **可配置**：字段名、服务方法、事件处理都可配置
- 🔄 **拖拽排序**：支持拖拽排序功能
- 📱 **响应式**：适配移动端和桌面端
- 🎪 **事件丰富**：支持选择、添加、编辑、删除等事件

## 核心设计理念

**BtcMasterList** 组件的核心设计理念是：**左侧主列表直接调用对应的list API，右侧从列表根据主列表的选择进行筛选**。

### 典型使用模式

1. **左侧主列表**：直接调用主实体的list API（如域列表、部门列表、角色列表）
2. **右侧从列表**：根据左侧选择的主实体ID，筛选从实体数据（如模块列表、用户列表、权限列表）

这种设计避免了复杂的ViewGroup配置，让每个页面都能清晰地表达其主从关系。

## 使用场景

### 1. 部门-用户管理

```vue
<template>
  <BtcViewGroup>
    <template #left>
      <BtcMasterList :service="departmentService" title="组织架构" @select="onDepartmentSelect" />
    </template>
    <template #right>
      <BtcCrud :service="userService" />
    </template>
  </BtcViewGroup>
</template>

<script setup>
const departmentService = {
  list: () => service.sysdepartment.list(),
};

const onDepartmentSelect = (department, departmentIds) => {
  // 根据选择的部门筛选用户
  userService.setParams({ departmentIds });
};
</script>
```

### 2. 域-模块管理

```vue
<template>
  <BtcViewGroup>
    <template #left>
      <!-- 直接调用域列表的list API -->
      <BtcMasterList :service="domainService" title="业务域" @select="onDomainSelect" />
    </template>
    <template #right>
      <BtcCrud :service="moduleService" />
    </template>
  </BtcViewGroup>
</template>

<script setup>
// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: () => service.sysdomain.list(),
};

const onDomainSelect = (domain, domainIds) => {
  // 根据选择的域筛选模块
  moduleService.setParams({ domainId: domain.id });
};
</script>
```

### 3. 域-插件管理

```vue
<template>
  <BtcViewGroup>
    <template #left>
      <!-- 直接调用域列表的list API -->
      <BtcMasterList :service="domainService" title="业务域" @select="onDomainSelect" />
    </template>
    <template #right>
      <BtcCrud :service="pluginService" />
    </template>
  </BtcViewGroup>
</template>

<script setup>
// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: () => service.sysdomain.list(),
};

const onDomainSelect = (domain, domainIds) => {
  // 根据选择的域筛选插件
  pluginService.setParams({ domainId: domain.id });
};
</script>
```

### 4. 角色-权限管理

```vue
<template>
  <BtcViewGroup>
    <template #left>
      <BtcMasterList :service="roleService" title="角色列表" @select="onRoleSelect" />
    </template>
    <template #right>
      <BtcCrud :service="permissionService" />
    </template>
  </BtcViewGroup>
</template>

<script setup>
const roleService = {
  list: () => service.sysrole.list(),
};

const onRoleSelect = (role, roleIds) => {
  // 根据选择的角色筛选权限
  permissionService.setParams({ roleId: role.id });
};
</script>
```

## API

### Props

| 参数          | 说明         | 类型              | 默认值     |
| ------------- | ------------ | ----------------- | ---------- |
| service       | 服务配置对象 | MasterListService | -          |
| title         | 列表标题     | string            | -          |
| labelField    | 显示字段名   | string            | 'name'     |
| idField       | ID字段名     | string            | 'id'       |
| childrenField | 子节点字段名 | string            | 'children' |
| drag          | 是否支持拖拽 | boolean           | true       |
| level         | 最大层级     | number            | 99         |
| onSelect      | 选择回调     | function          | -          |
| onAdd         | 添加回调     | function          | -          |
| onEdit        | 编辑回调     | function          | -          |
| onDelete      | 删除回调     | function          | -          |

### Events

| 事件名  | 说明           | 参数        |
| ------- | -------------- | ----------- |
| select  | 选择项目时触发 | (item, ids) |
| refresh | 刷新时触发     | -           |
| add     | 添加时触发     | (item)      |
| edit    | 编辑时触发     | (item)      |
| delete  | 删除时触发     | (item)      |

### Methods

| 方法名   | 说明     | 参数   |
| -------- | -------- | ------ |
| refresh  | 刷新数据 | -      |
| rowClick | 点击行   | (item) |

## 服务配置

```typescript
interface MasterListService {
  list: () => Promise<any[]>; // 必需：获取列表数据
  add?: (data: any) => Promise<any>; // 可选：添加数据
  update?: (data: any) => Promise<any>; // 可选：更新数据
  delete?: (data: any) => Promise<any>; // 可选：删除数据
}
```

## 数据格式

组件期望的数据格式：

```typescript
interface MasterListItem {
  id: string | number; // 主键
  name: string; // 显示名称
  children?: MasterListItem[]; // 子节点
  [key: string]: any; // 其他字段
}
```

## 样式定制

组件使用CSS变量，可以通过覆盖变量来定制样式：

```scss
.btc-master-list {
  --header-bg: #f5f5f5;
  --node-hover-bg: #e6f7ff;
  --active-color: #1890ff;
}
```
