# Skills 自动触发机制

## 📋 概述

本项目支持多种方式自动触发和使用 Skills，让 AI 能够智能地根据对话内容自动加载相关技能。

## 🎯 自动触发方式

### 1. 对话自动识别（已启用）✅

**说明**：AI 会根据对话内容自动识别并加载相关技能，无需手动指定。

**触发条件**：
- 用户提问与某个 skill 相关的内容
- AI 自动分析对话意图
- 自动读取对应的 skill 文件

**示例**：
```
用户："如何启动开发服务器？"
→ AI 自动识别 → 加载 dev-workflow skill

用户："构建应用失败了怎么办？"
→ AI 自动识别 → 加载 build-guide skill

用户："创建新页面应该用什么组件？"
→ AI 自动识别 → 加载 page-creation-guide skill
```

**配置位置**：`.cursorrules` 第 84 行
```
AI会根据对话自动加载相关技能，或你可以主动要求
```

### 2. 命令自动跟踪（已启用）✅

**说明**：当执行特定命令时，系统会自动识别并记录相关 skill 的执行。

**命令映射**：
| 命令 | 对应 Skill | 说明 |
|------|-----------|------|
| `pnpm dev:all` | dev-workflow | 启动开发服务器 |
| `pnpm build:all` | build-guide | 构建应用 |
| `pnpm release:push` | release-automation | 发布新版本 |
| `pnpm check:i18n` | i18n-toolkit | 检查国际化 |
| `pnpm lint:all` | quality-assurance | 代码检查 |

**实现机制**：
- 命令脚本中集成了 `interceptCommand()` 函数
- 自动识别命令并创建 skill 执行记录
- 跟踪命令执行过程（步骤、耗时等）

**配置位置**：`.cursorrules` 第 310-353 行

**配置文件**：`.claude/skills-meta/config.json`
```json
{
  "command_interception": {
    "enabled": true,
    "auto_track": true,
    "track_on_start": true,
    "track_on_complete": true
  }
}
```

### 3. 手动触发（推荐）⭐

**说明**：用户主动要求使用某个 skill，AI 会立即加载。

**使用方式**：
```
用户："使用 dev-workflow 技能"
用户："读取 build-guide 技能"
用户："使用 common-mistakes-prevention 技能帮助我"
```

**优势**：
- 明确指定需要使用的 skill
- AI 会优先使用指定的 skill
- 适用于需要特定 skill 的场景

### 4. `/skills` 命令（查看列表）

**说明**：列出所有可用的 skills，不自动加载。

**使用方式**：
```
用户："/skills"
```

**功能**：
- 显示所有可用的 skills 列表
- 显示每个 skill 的名称和描述
- 帮助用户了解有哪些 skills 可用

## 🔧 如何配置自动触发

### 方式 1：依赖 AI 自动识别（默认）

**无需配置**，AI 会自动根据对话内容识别并加载相关技能。

**工作原理**：
1. AI 分析用户对话内容
2. 识别对话意图和关键词
3. 匹配对应的 skill
4. 自动读取 skill 文件
5. 使用 skill 中的指导来回答问题

### 方式 2：配置命令拦截器

如果想让命令执行时自动触发 skill 跟踪，需要：

1. **确保配置文件存在**
   文件：`.claude/skills-meta/config.json`
   ```json
   {
     "command_interception": {
       "enabled": true,
       "auto_track": true
     }
   }
   ```

2. **确保命令脚本集成了拦截器**
   脚本会在执行命令时自动调用 `interceptCommand()`

3. **查看执行记录**
   ```bash
   node scripts/commands/skills/cli.mjs list-executions
   ```

### 方式 3：添加新的命令映射

如果想为新的命令添加自动跟踪，需要：

1. **修改命令映射配置**
   在 `.cursorrules` 中添加新的映射：
   ```
   - `your-command` → skill-name
   ```

2. **更新拦截器脚本**
   在 `command-interceptor.mjs` 中添加新的命令识别逻辑

## 📝 最佳实践

### ✅ 推荐做法

1. **依赖 AI 自动识别**：大部分场景下，AI 会自动识别并加载相关 skill
2. **关键操作时手动指定**：重要的或复杂的操作，手动指定 skill 更可靠
3. **使用 `/skills` 查看可用技能**：不确定有哪些 skill 时，先用 `/skills` 查看

### ❌ 不推荐

1. **每次都用 `/skills`**：只有在需要查看列表时才用，不是必需的
2. **过度依赖自动识别**：对于关键操作，手动指定更安全

## 🎯 实际使用示例

### 场景 1：开发调试

```
用户："开发服务器启动不了"

AI 行为：
→ 识别关键词"开发服务器"、"启动"
→ 自动加载 dev-workflow skill
→ 使用 skill 中的故障排查步骤
→ 提供解决方案
```

### 场景 2：构建问题

```
用户："构建失败，提示找不到模块"

AI 行为：
→ 识别关键词"构建"、"失败"
→ 自动加载 build-guide skill
→ 使用 skill 中的常见问题解决方案
→ 提供修复建议
```

### 场景 3：创建新功能

```
用户："我想创建一个新的数据管理页面"

AI 行为：
→ 识别"创建"、"页面"
→ 自动加载 page-creation-guide skill
→ 使用 skill 中的模板和组件推荐
→ 提供代码生成建议
```

## 🔍 验证自动触发是否生效

### 检查方法 1：观察 AI 行为

如果 AI 自动加载了 skill，通常会在回复中体现：
- 使用了更专业的术语
- 按照特定的步骤顺序执行
- 引用了项目特定的配置或约定

### 检查方法 2：查看执行记录

```bash
# 查看最近的 skill 执行记录
node scripts/commands/skills/cli.mjs list-executions

# 查看特定 skill 的执行历史
node scripts/commands/skills/cli.mjs list-executions dev-workflow
```

### 检查方法 3：测试对话

尝试以下对话，观察 AI 是否自动加载相关 skill：

```
"如何启动开发服务器？" → 应该自动加载 dev-workflow
"构建命令是什么？" → 应该自动加载 build-guide
"创建页面的步骤是什么？" → 应该自动加载 page-creation-guide
```

## 📚 相关文档

- **Skills 系统说明**：`.cursorrules` 第 65-457 行
- **命令映射配置**：`.cursorrules` 第 314-320 行
- **自动跟踪机制**：`.cursorrules` 第 310-353 行
- **Skills 文件位置**：`.cursor/skills/{skill-name}/SKILL.md`

## ❓ 常见问题

### Q: AI 没有自动加载 skill，怎么办？

A: 可以手动指定：
```
"使用 dev-workflow 技能帮助我启动开发服务器"
```

### Q: 如何查看 AI 是否使用了某个 skill？

A: 查看执行记录：
```bash
node scripts/commands/skills/cli.mjs list-executions
```

### Q: 可以让 AI 在每次对话开始时自动加载所有 skills 吗？

A: **不推荐**。应该按需加载，避免上下文过大。AI 的自动识别机制已经足够智能。

### Q: `/skills` 命令可以自动执行吗？

A: `/skills` 是一个查看命令，需要在需要查看列表时手动执行。如果需要自动加载 skill，应该依赖 AI 的自动识别或手动指定。
