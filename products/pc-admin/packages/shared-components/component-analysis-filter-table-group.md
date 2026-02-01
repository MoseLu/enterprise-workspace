# BtcFilterTableGroup 组件分析

## 问题

是否需要创建一个类似于 `BtcTableGroup` 的组件，但是左侧使用 `BtcFilterList`，还是直接使用 `BtcFilterGroup`？

## 对比分析

### 1. BtcTableGroup（参考）

**特点：**
- ✅ **左侧**：内置 `BtcMasterList`（树形/列表数据）
- ✅ **右侧**：内置完整的 `BtcCrud`（表格、分页、搜索、增删改查）
- ✅ **自动联动**：左侧选择项变化时，自动刷新右侧表格数据
- ✅ **参数标准化**：自动将左侧选中项的 ID 作为 `keyword` 传递给右侧 `page` 请求
- ✅ **数据共享**：左侧列表数据自动注入到右侧表单的级联选择器中
- ✅ **开箱即用**：提供完整的 CRUD 功能，减少样板代码

**使用场景：**
- 左侧是树形/列表结构（如部门、模块、菜单等）
- 右侧是 CRUD 表格（如用户、数据列表等）
- 需要左侧选择后自动刷新右侧数据

**代码示例：**
```vue
<BtcTableGroup
  :left-service="services.sysdepartment"
  :right-service="services.sysuser"
  :table-columns="userColumns"
  :form-items="getUserFormItems()"
/>
```

### 2. BtcFilterGroup（当前）

**特点：**
- ✅ **左侧**：内置 `BtcFilterList`（多分类筛选）
- ✅ **右侧**：完全自定义（通过插槽）
- ✅ **筛选结果管理**：自动管理筛选结果，并传递给右侧内容
- ✅ **灵活配置**：右侧内容完全由使用者控制
- ❌ **无自动联动**：需要手动在 `filter-change` 事件中刷新数据
- ❌ **无参数标准化**：需要手动将筛选结果转换为查询参数

**使用场景：**
- 左侧是多分类筛选（如状态、类型、优先级等）
- 右侧内容多样化（可能是表格、卡片、图表等）
- 需要灵活的右侧内容定制

**代码示例：**
```vue
<BtcFilterGroup
  :filter-category="filterCategories"
  @filter-change="handleFilterChange"
>
  <template #right="{ filterResult }">
    <BtcCrud :service="dataService">
      <BtcTable :columns="tableColumns" />
    </BtcCrud>
  </template>
</BtcFilterGroup>
```

### 3. 假设的 BtcFilterTableGroup

**特点（如果创建）：**
- ✅ **左侧**：内置 `BtcFilterList`（多分类筛选）
- ✅ **右侧**：内置完整的 `BtcCrud`（表格、分页、搜索、增删改查）
- ✅ **自动联动**：筛选结果变化时，自动刷新右侧表格数据
- ✅ **参数标准化**：自动将筛选结果转换为查询参数传递给后端
- ✅ **开箱即用**：提供完整的 CRUD 功能，减少样板代码
- ❌ **灵活性降低**：右侧固定为 CRUD 表格，无法自定义

**使用场景：**
- 左侧是多分类筛选
- 右侧是 CRUD 表格（固定）
- 需要筛选后自动刷新表格数据

**代码示例（如果创建）：**
```vue
<BtcFilterTableGroup
  :filter-category="filterCategories"
  :right-service="dataService"
  :table-columns="tableColumns"
  :form-items="formItems"
/>
```

## 实际使用场景分析

### 场景 1：筛选 + 表格（最常见）

**当前使用方式：**
```vue
<BtcFilterGroup :filter-category="filterCategories" @filter-change="handleFilterChange">
  <template #right="{ filterResult }">
    <BtcCrud ref="crudRef" :service="dataService">
      <BtcCrudRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable :columns="tableColumns" />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>
    </BtcCrud>
  </template>
</BtcFilterGroup>
```

**如果使用 BtcFilterTableGroup：**
```vue
<BtcFilterTableGroup
  :filter-category="filterCategories"
  :right-service="dataService"
  :table-columns="tableColumns"
  :form-items="formItems"
/>
```

**优势：**
- ✅ 代码更简洁（减少约 20-30 行样板代码）
- ✅ 自动处理筛选结果到查询参数的转换
- ✅ 自动刷新表格数据
- ✅ 统一的 API 风格（与 `BtcTableGroup` 一致）

**劣势：**
- ❌ 灵活性降低（右侧固定为 CRUD 表格）
- ❌ 如果右侧需要自定义内容（如卡片、图表），需要回退到 `BtcFilterGroup`

### 场景 2：筛选 + 自定义内容

**当前使用方式：**
```vue
<BtcFilterGroup :filter-category="filterCategories">
  <template #right="{ filterResult }">
    <!-- 可以是表格、卡片、图表等任何内容 -->
    <CustomContent :filter-result="filterResult" />
  </template>
</BtcFilterGroup>
```

**如果使用 BtcFilterTableGroup：**
- ❌ 无法满足需求，必须使用 `BtcFilterGroup`

## 建议

### 方案 A：不创建 BtcFilterTableGroup（推荐）

**理由：**

1. **灵活性优先**
   - `BtcFilterGroup` 的右侧完全自定义，可以适应各种场景
   - 右侧可能是表格、卡片、图表、自定义组件等
   - 创建 `BtcFilterTableGroup` 会限制灵活性

2. **代码复杂度**
   - `BtcFilterGroup` 已经足够简单易用
   - 筛选结果到查询参数的转换逻辑相对简单，可以在业务层处理
   - 创建新组件会增加维护成本

3. **使用频率**
   - 虽然"筛选+表格"是常见场景，但"筛选+其他内容"的场景也不少
   - 如果创建 `BtcFilterTableGroup`，会导致两个组件职责重叠

4. **架构一致性**
   - `BtcFilterGroup` 的设计理念是"左侧固定，右侧灵活"
   - 这与 `BtcViewGroup` 的设计一致（左侧 MasterList，右侧自定义）
   - `BtcTableGroup` 是特殊情况（因为"左树右表"是极其常见的场景）

### 方案 B：创建 BtcFilterTableGroup（备选）

**适用条件：**

如果满足以下**所有**条件，可以考虑创建：

1. ✅ **使用频率高**：项目中"筛选+表格"的场景占比 > 80%
2. ✅ **参数转换复杂**：筛选结果到查询参数的转换逻辑复杂且重复
3. ✅ **样板代码多**：每次使用都需要写大量重复的 CRUD 代码（> 30 行）
4. ✅ **团队需求**：团队明确表示需要开箱即用的组件

**实现建议：**

如果创建，应该：
- 基于 `BtcFilterGroup` 封装（而不是重新实现）
- 右侧内置 `BtcCrud`，但保留插槽支持自定义
- 自动处理筛选结果到查询参数的转换
- 提供与 `BtcTableGroup` 类似的 API 风格

## 高复杂交互需求分析

### 新需求

如果计划实现以下高复杂交互功能，**强烈建议创建 `BtcFilterTableGroup`**：

1. **左右侧联动**
   - 基于左侧的分类优先渲染对应的列（宽度充足再渲染其他列）
   - 需要深度集成左侧筛选状态和右侧表格列渲染逻辑

2. **选择提前**
   - 基于用户选中的分类将列提前显示
   - 需要动态调整表格列的显示顺序和优先级

3. **宽度交互**
   - 左侧宽度自动根据页面实际渲染调整尺寸
   - 列非常少时可以突破 large（450px），但有上限
   - 需要实时计算和调整布局

### 为什么需要专用组件

这些功能如果放在 `BtcFilterGroup` 中实现，会导致：

1. **组件职责不清**：`BtcFilterGroup` 变成既负责布局，又负责表格逻辑
2. **代码复杂度高**：表格列优先级、宽度计算等逻辑会混在布局组件中
3. **难以维护**：表格相关的逻辑与筛选逻辑耦合
4. **扩展性差**：如果未来需要更多表格相关功能，组件会越来越复杂

而创建 `BtcFilterTableGroup` 的优势：

1. **职责清晰**：专门处理"筛选+表格"的场景
2. **逻辑内聚**：表格列优先级、宽度计算等逻辑集中管理
3. **易于扩展**：可以独立扩展表格相关功能
4. **性能优化**：可以针对表格场景做专门的性能优化

## 最终建议（更新）

### ✅ 推荐：创建 BtcFilterTableGroup（如果实现高复杂交互）

**理由：**

1. **功能复杂度高**：列优先级渲染、选择提前、动态宽度调整等需要深度集成
2. **逻辑内聚性**：这些功能都与表格渲染相关，应该放在表格组件中
3. **维护性**：专用组件更容易维护和扩展
4. **性能优化**：可以针对表格场景做专门的优化

### 实现建议

如果创建 `BtcFilterTableGroup`，建议：

1. **基于 BtcFilterGroup 封装**
   ```typescript
   // 内部使用 BtcFilterGroup，而不是重新实现布局
   <BtcFilterGroup :filter-category="filterCategory">
     <template #right="{ filterResult }">
       <BtcCrud>
         <!-- 内置表格，包含复杂的列优先级逻辑 -->
       </BtcCrud>
     </template>
   </BtcFilterGroup>
   ```

2. **核心功能模块化**
   - `useColumnPriority`：列优先级管理
   - `useColumnReorder`：列顺序调整
   - `useDynamicWidth`：动态宽度计算

3. **保留插槽支持**
   - 右侧 CRUD 保留关键插槽（如 actions、search）
   - 允许部分自定义，但不允许完全替换表格

4. **API 设计**
   ```typescript
   interface BtcFilterTableGroupProps {
     // 筛选相关
     filterCategory?: FilterCategory[];
     filterService?: { list: () => Promise<FilterCategory[]> };
     
     // 表格相关
     rightService: CrudService;
     tableColumns: TableColumn[];
     formItems?: FormItem[];
     
     // 列优先级配置
     columnPriority?: 'auto' | 'manual'; // 自动或手动
     enableColumnReorder?: boolean; // 是否允许列重排序
     
     // 宽度配置
     minLeftWidth?: string; // 最小宽度，默认 200px
     maxLeftWidth?: string; // 最大宽度，默认 600px
     enableAutoWidth?: boolean; // 是否启用自动宽度
   }
   ```

## 总结（更新）

| 方案 | 适用场景 | 优势 | 劣势 | 推荐度 |
|------|---------|------|------|--------|
| **直接使用 BtcFilterGroup** | 简单场景，右侧内容多样化 | 灵活、简洁、一致 | 复杂交互需要大量自定义代码 | ⭐⭐⭐⭐ |
| **创建 BtcFilterTableGroup** | 复杂交互（列优先级、动态宽度等） | 逻辑内聚、易于维护、性能优化 | 灵活性降低、维护成本增加 | ⭐⭐⭐⭐⭐ |

**结论：** 
- **简单场景**：直接使用 `BtcFilterGroup`
- **复杂交互**：创建 `BtcFilterTableGroup`，专门处理表格相关的高复杂逻辑
