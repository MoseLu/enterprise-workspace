# 原子化迁移步骤文档

本文档将迁移计划分解为最小可执行的原子步骤，每个步骤都是独立的、可验证的。

## 使用说明

- **每个步骤都是独立的**：可以单独执行和验证
- **每个步骤都有明确的输入、输出和验证标准**
- **完成一个步骤后，标记为完成，再进行下一步**
- **如果某个步骤失败，可以回滚到上一步**

## 阶段1：设计令牌包构建和验证

### 步骤1.1：安装设计令牌包依赖

**目标**：安装 Style Dictionary 依赖

**输入**：
- `packages/design-tokens/package.json` 已存在
- monorepo 根目录有 `pnpm-workspace.yaml`

**执行**：
```bash
# 在 monorepo 根目录执行
pnpm install
```

**验证标准**：
- [ ] `packages/design-tokens/node_modules/style-dictionary` 存在
- [ ] 无安装错误
- [ ] `pnpm-lock.yaml` 已更新

**输出**：
- 依赖已安装
- 可以执行构建命令

**回滚**：无需回滚，安装失败不影响现有代码

---

### 步骤1.2：首次构建设计令牌包

**目标**：执行 Style Dictionary 构建，生成输出文件

**输入**：
- 步骤1.1已完成
- `tokens/**/*.json` 文件存在
- `config/style-dictionary.config.js` 已配置

**执行**：
```bash
cd packages/design-tokens
pnpm build
```

**验证标准**：
- [ ] 构建命令执行成功，无错误
- [ ] `dist/css/variables.css` 文件生成
- [ ] `dist/scss/_variables.scss` 文件生成
- [ ] `dist/ts/tokens.ts` 文件生成

**输出文件检查**：

**dist/css/variables.css** 应包含：
```css
:root {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
  --btc-crud-search-width: var(--btc-crud-op-width, 220px);
  --btc-crud-btn-color: var(--el-text-color-primary);
  --btc-crud-icon-color: var(--el-color-primary);
  --btc-icon-color: var(--el-text-color-primary);
  --btc-breath-color: var(--el-color-primary);
  --btc-table-button-color: var(--el-color-primary);
}
```

**dist/scss/_variables.scss** 应包含：
```scss
$btc-crud-gap: 10px;
$btc-crud-op-width: 220px;
// ...
```

**输出**：
- 三个输出文件已生成
- 变量名格式正确（`--btc-*` 或 `$btc-*`）
- 变量值正确

**回滚**：删除 `dist/` 目录即可

---

### 步骤1.3：验证变量名格式

**目标**：确认生成的变量名符合预期格式

**输入**：
- 步骤1.2已完成
- 输出文件已生成

**执行**：
检查 `dist/css/variables.css` 和 `dist/scss/_variables.scss`

**验证标准**：
- [ ] CSS变量名格式：`--btc-{category}-{name}`（kebab-case）
- [ ] SCSS变量名格式：`$btc-{category}-{name}`（kebab-case）
- [ ] 所有8个BTC变量都已生成：
  - `--btc-crud-gap`
  - `--btc-crud-op-width`
  - `--btc-crud-search-width`
  - `--btc-crud-btn-color`
  - `--btc-crud-icon-color`
  - `--btc-icon-color`
  - `--btc-breath-color`
  - `--btc-table-button-color`

**输出**：
- 变量名格式验证通过
- 所有变量都已生成

**回滚**：无需回滚，验证失败只需修复配置

---

### 步骤1.4：验证变量值正确性

**目标**：确认变量值正确，引用关系正确

**输入**：
- 步骤1.3已完成

**执行**：
检查输出文件中的变量值

**验证标准**：
- [ ] `--btc-crud-gap: 10px`（直接值）
- [ ] `--btc-crud-op-width: 220px`（直接值）
- [ ] `--btc-crud-search-width: var(--btc-crud-op-width, 220px)`（引用其他变量）
- [ ] `--btc-crud-btn-color: var(--el-text-color-primary)`（引用Element Plus变量）
- [ ] `--btc-crud-icon-color: var(--el-color-primary)`（引用Element Plus变量）
- [ ] `--btc-icon-color: var(--el-text-color-primary)`（引用Element Plus变量）
- [ ] `--btc-breath-color: var(--el-color-primary)`（引用Element Plus变量）
- [ ] `--btc-table-button-color: var(--el-color-primary)`（引用Element Plus变量）

**输出**：
- 变量值验证通过
- 引用关系正确

**回滚**：无需回滚，验证失败只需修复令牌文件

---

## 阶段2：集成到 shared-components

### 步骤2.1：添加 design-tokens 依赖到 shared-components

**目标**：在 shared-components 的 package.json 中添加 design-tokens 依赖

**输入**：
- `packages/shared-components/package.json` 存在
- `packages/design-tokens` 包已创建

**执行**：
编辑 `packages/shared-components/package.json`，在 `devDependencies` 中添加：
```json
{
  "devDependencies": {
    "@btc/design-tokens": "workspace:*",
    // ... 其他依赖
  }
}
```

**验证标准**：
- [ ] `package.json` 中已添加 `"@btc/design-tokens": "workspace:*"`
- [ ] JSON格式正确，无语法错误

**输出**：
- `package.json` 已更新
- 依赖关系已建立

**回滚**：移除添加的依赖行即可

---

### 步骤2.2：安装 shared-components 依赖

**目标**：安装新添加的 design-tokens 依赖

**输入**：
- 步骤2.1已完成

**执行**：
```bash
# 在 monorepo 根目录执行
pnpm install
```

**验证标准**：
- [ ] 安装成功，无错误
- [ ] `packages/shared-components/node_modules/@btc/design-tokens` 存在（或通过workspace链接）

**输出**：
- 依赖已安装
- 可以在 shared-components 中导入 design-tokens

**回滚**：执行 `pnpm install` 会自动处理

---

### 步骤2.3：更新 _tokens.scss 导入设计令牌

**目标**：在 _tokens.scss 中导入设计令牌包

**输入**：
- 步骤2.2已完成
- `packages/design-tokens/dist/scss/_variables.scss` 存在

**执行**：
编辑 `packages/shared-components/src/styles/_tokens.scss`，在文件开头添加：
```scss
// 导入设计令牌包
@use '@btc/design-tokens/scss' as *;
```

**验证标准**：
- [ ] 导入语句已添加
- [ ] 语法正确
- [ ] 保留原有变量定义（向后兼容）

**输出**：
- `_tokens.scss` 已更新
- 设计令牌已导入

**回滚**：移除导入语句即可

---

### 步骤2.4：构建 shared-components 验证集成

**目标**：构建 shared-components，验证设计令牌集成成功

**输入**：
- 步骤2.3已完成

**执行**：
```bash
cd packages/shared-components
pnpm build
```

**验证标准**：
- [ ] 构建成功，无错误
- [ ] 无 SCSS 导入错误
- [ ] 生成的 CSS 文件包含设计令牌变量

**输出**：
- shared-components 构建成功
- 设计令牌已正确集成

**回滚**：回滚步骤2.3的更改

---

### 步骤2.5：验证浏览器中的变量加载

**目标**：在浏览器中验证设计令牌变量正确加载

**输入**：
- 步骤2.4已完成
- 至少一个应用可以运行

**执行**：
1. 启动一个应用（如 admin-app）
2. 打开浏览器开发者工具
3. 检查 `:root` 元素的计算样式

**验证标准**：
- [ ] 浏览器中可以找到 `--btc-crud-gap` 等变量
- [ ] 变量值正确（如 `--btc-crud-gap: 10px`）
- [ ] 引用关系正确（如 `--btc-crud-search-width: var(--btc-crud-op-width, 220px)`）

**输出**：
- 设计令牌在浏览器中正确加载
- 变量可用

**回滚**：回滚步骤2.3的更改

---

## 阶段3：变量迁移（批次1 - 核心样式文件）

### 步骤3.1.1：识别 crud/_base.scss 中的变量使用

**目标**：找出 `crud/_base.scss` 中所有 `--btc-*` 变量的使用位置

**输入**：
- `packages/shared-components/src/styles/crud/_base.scss` 存在

**执行**：
使用 grep 或编辑器搜索：
```bash
grep -n "--btc-" packages/shared-components/src/styles/crud/_base.scss
```

**验证标准**：
- [ ] 找到所有 `--btc-*` 变量的使用
- [ ] 记录每个使用的位置（行号）
- [ ] 确认变量名与设计令牌包中的变量名一致

**输出**：
- 变量使用清单（文件路径、行号、变量名）

**回滚**：无需回滚，只是识别

---

### 步骤3.1.2：验证 crud/_base.scss 变量与设计令牌一致

**目标**：确认 `crud/_base.scss` 中使用的变量在设计令牌包中已定义

**输入**：
- 步骤3.1.1已完成
- 设计令牌包已构建

**执行**：
对比 `crud/_base.scss` 中的变量使用和 `dist/css/variables.css` 中的变量定义

**验证标准**：
- [ ] 所有使用的变量都在设计令牌包中定义
- [ ] 变量名完全一致
- [ ] 如有不一致，记录差异

**输出**：
- 变量一致性验证结果
- 如有差异，记录差异清单

**回滚**：无需回滚，只是验证

---

### 步骤3.1.3：更新 crud/_base.scss 使用设计令牌（如果 needed）

**目标**：确保 `crud/_base.scss` 使用设计令牌包定义的变量

**输入**：
- 步骤3.1.2已完成
- 设计令牌包已集成（阶段2完成）

**执行**：
检查 `crud/_base.scss`，确保：
1. 变量使用方式正确（`var(--btc-*)`）
2. 变量名与设计令牌包一致
3. 如有硬编码值，改为使用变量

**验证标准**：
- [ ] 所有 `--btc-*` 变量都从设计令牌包加载（通过 `_tokens.scss`）
- [ ] 无硬编码的变量值（除非是设计令牌定义本身）
- [ ] 变量引用正确

**输出**：
- `crud/_base.scss` 已更新（如果需要）
- 文件使用设计令牌变量

**回滚**：使用 git 回滚文件更改

---

### 步骤3.1.4：构建并测试 crud/_base.scss 更改

**目标**：验证 `crud/_base.scss` 更改后构建和功能正常

**输入**：
- 步骤3.1.3已完成

**执行**：
```bash
cd packages/shared-components
pnpm build
```

然后测试使用 CRUD 组件的页面。

**验证标准**：
- [ ] 构建成功，无错误
- [ ] CRUD 组件样式正常
- [ ] 间距、宽度等视觉样式正确

**输出**：
- 构建成功
- 功能验证通过

**回滚**：使用 git 回滚文件更改

---

### 步骤3.2.1-3.2.4：迁移 crud/_button.scss

**重复步骤3.1.1-3.1.4的流程**，针对 `crud/_button.scss`：

- 步骤3.2.1：识别变量使用
- 步骤3.2.2：验证变量一致性
- 步骤3.2.3：更新文件使用设计令牌
- 步骤3.2.4：构建并测试

---

### 步骤3.3.1-3.3.4：迁移 _components.scss

**重复步骤3.1.1-3.1.4的流程**，针对 `_components.scss`：

- 步骤3.3.1：识别变量使用
- 步骤3.3.2：验证变量一致性
- 步骤3.3.3：更新文件使用设计令牌
- 步骤3.3.4：构建并测试

---

### 步骤3.4：批次1完整验证

**目标**：验证批次1所有文件的迁移结果

**输入**：
- 步骤3.1.4、3.2.4、3.3.4 都已完成

**执行**：
1. 构建 shared-components
2. 测试所有CRUD组件
3. 测试通用组件（图标按钮等）
4. 验证主题切换

**验证标准**：
- [ ] 构建成功
- [ ] 所有CRUD组件样式正常
- [ ] 通用组件样式正常
- [ ] 主题切换正常
- [ ] 无视觉回归

**输出**：
- 批次1迁移完成
- 功能验证通过

**回滚**：使用 git 回滚所有批次1的更改

---

## 阶段4：变量迁移（批次2 - CRUD相关样式）

### 步骤4.1-4.5：迁移 crud/_table.scss

**重复批次1的流程**（步骤3.1.1-3.1.4），针对 `crud/_table.scss`

### 步骤4.6-4.10：迁移 crud/_search.scss

**重复批次1的流程**，针对 `crud/_search.scss`

### 步骤4.11-4.15：迁移 crud/_toolbar.scss

**重复批次1的流程**，针对 `crud/_toolbar.scss`

### 步骤4.16-4.20：迁移 crud/_dialog.scss

**重复批次1的流程**，针对 `crud/_dialog.scss`

### 步骤4.21-4.25：迁移 crud/_context-menu.scss

**重复批次1的流程**，针对 `crud/_context-menu.scss`

### 步骤4.26：批次2完整验证

**目标**：验证批次2所有文件的迁移结果

**执行和验证标准**：同步骤3.4

---

## 阶段5：变量迁移（批次3 - 组件样式文件）

### 步骤5.1：识别所有组件文件中的变量使用

**目标**：找出所有组件文件（.vue 和 .scss）中的 `--btc-*` 变量使用

**执行**：
```bash
# 查找所有组件文件中的变量使用
grep -r "--btc-" packages/shared-components/src/components --include="*.vue" --include="*.scss"
```

**验证标准**：
- [ ] 找到所有变量使用位置
- [ ] 按文件分组记录

**输出**：
- 变量使用清单（按文件分组）

---

### 步骤5.2-N：逐个组件文件迁移

**对每个包含变量的组件文件，重复批次1的流程**：

1. 识别变量使用
2. 验证变量一致性
3. 更新文件使用设计令牌
4. 构建并测试

**建议顺序**：
- 先迁移核心组件（使用频率高）
- 再迁移其他组件
- 每个组件迁移后立即测试

---

### 步骤5.Final：批次3完整验证

**目标**：验证批次3所有文件的迁移结果

**执行和验证标准**：同步骤3.4

---

## 阶段6：变量迁移（批次4 - 其他样式文件）

### 步骤6.1：识别剩余文件中的变量使用

**目标**：找出所有剩余的 `--btc-*` 变量使用

**执行**：
```bash
# 查找所有剩余文件中的变量使用
grep -r "--btc-" packages/shared-components/src --include="*.scss" --include="*.vue" --exclude-dir="node_modules"
```

**验证标准**：
- [ ] 找到所有剩余变量使用
- [ ] 确认没有遗漏

---

### 步骤6.2-N：逐个文件迁移

**对每个剩余文件，重复批次1的流程**

---

### 步骤6.Final：批次4完整验证

**目标**：验证所有文件迁移完成

**执行和验证标准**：同步骤3.4，但范围更广

---

## 阶段7：全面测试和验证

### 步骤7.1：功能测试 - CRUD组件

**目标**：测试所有CRUD组件功能正常

**执行**：
- 测试表格显示
- 测试搜索功能
- 测试工具栏操作
- 测试对话框
- 测试上下文菜单

**验证标准**：
- [ ] 所有功能正常
- [ ] 样式显示正确

---

### 步骤7.2：功能测试 - 通用组件

**目标**：测试所有通用组件功能正常

**执行**：
- 测试图标按钮
- 测试其他通用组件

**验证标准**：
- [ ] 所有功能正常
- [ ] 样式显示正确

---

### 步骤7.3：主题切换测试

**目标**：测试亮色/暗色主题切换

**执行**：
- 切换到亮色主题，验证样式
- 切换到暗色主题，验证样式
- 多次切换，验证稳定性

**验证标准**：
- [ ] 主题切换正常
- [ ] 变量值正确更新
- [ ] 无样式破坏

---

### 步骤7.4：跨应用测试

**目标**：测试所有14个应用的样式加载

**执行**：
- 逐个应用启动
- 检查样式加载
- 验证功能正常

**验证标准**：
- [ ] 所有应用样式正常
- [ ] 无样式冲突
- [ ] 功能正常

---

### 步骤7.5：性能测试

**目标**：验证构建和运行时性能

**执行**：
- 测量构建时间
- 检查CSS文件大小
- 检查运行时性能

**验证标准**：
- [ ] 构建时间增加不超过20%
- [ ] CSS文件大小合理
- [ ] 运行时性能无影响

---

## 阶段8：文档更新和清理

### 步骤8.1：更新 CSS_ARCHITECTURE.md

**目标**：更新架构文档，说明设计令牌包的使用

**执行**：
编辑 `packages/shared-components/src/styles/CSS_ARCHITECTURE.md`

**验证标准**：
- [ ] 文档已更新
- [ ] 说明设计令牌包的使用方式
- [ ] 更新变量使用指南

---

### 步骤8.2：更新 INTEGRATION_GUIDE.md

**目标**：更新集成指南，添加设计令牌包说明

**执行**：
编辑 `packages/shared-components/src/styles/INTEGRATION_GUIDE.md`

**验证标准**：
- [ ] 文档已更新
- [ ] 添加设计令牌包集成步骤
- [ ] 更新新后台接入指南

---

### 步骤8.3：创建迁移总结文档

**目标**：记录迁移过程和结果

**执行**：
创建 `packages/design-tokens/MIGRATION_SUMMARY.md`

**内容**：
- 迁移时间线
- 迁移的文件清单
- 遇到的问题和解决方案
- 性能影响分析

---

### 步骤8.4：清理冗余代码（可选）

**目标**：如果设计令牌包完全替代了原有变量定义，清理冗余代码

**执行**：
- 检查 `_tokens.scss` 是否可以简化
- 移除不再需要的注释

**验证标准**：
- [ ] 代码已清理
- [ ] 功能不受影响

---

## 步骤执行检查清单

每个步骤执行时，请确认：

- [ ] 已理解步骤目标
- [ ] 已确认输入条件满足
- [ ] 已执行步骤操作
- [ ] 已验证输出结果
- [ ] 已标记步骤完成
- [ ] 如有问题，已记录

## 回滚策略

如果某个步骤失败：

1. **识别失败步骤**
2. **回滚到上一步**
3. **分析失败原因**
4. **修复问题**
5. **重新执行步骤**

## 进度跟踪

建议使用以下方式跟踪进度：

1. **在文档中标记**：完成步骤后，在文档中标记 `[x]`
2. **使用版本控制**：每个步骤完成后提交代码
3. **记录问题**：遇到问题及时记录和解决
