# 国际化工具脚本

这些脚本用于帮助你优化和管理项目的国际化配置。

## 📦 脚本列表

### 1. migrate-flat-to-nested.mjs
将扁平化的国际化配置转换为嵌套格式

#### 功能
- 转换单个 JSON 文件为 TypeScript 嵌套格式
- 批量转换目录下的所有 JSON 文件
- 分析 config.ts 文件的 locale 配置

#### 使用方法

```bash
# 转换单个文件
node scripts/i18n/migrate-flat-to-nested.mjs file \
  apps/system-app/src/locales/zh-CN.json \
  locales/apps/system-zh-CN.ts

# 批量转换目录
node scripts/i18n/migrate-flat-to-nested.mjs dir \
  apps/system-app/src/locales \
  locales/apps/system

# 分析 config.ts (仅提示,需手动修改)
node scripts/i18n/migrate-flat-to-nested.mjs config \
  apps/system-app/src/modules/warehouse/config.ts
```

### 2. check-completeness.mjs
检查国际化翻译的完整性

#### 功能
- 检查所有 zh-CN 的 key 是否都有对应的 en-US 翻译
- 检查是否有多余的 en-US key
- 生成翻译完整性报告
- 计算翻译覆盖率

#### 使用方法

```bash
# 检查所有默认位置的文件
node scripts/i18n/check-completeness.mjs

# 指定特定模式
node scripts/i18n/check-completeness.mjs \
  --pattern "apps/system-app/**/*.json"

# 指定基础目录
node scripts/i18n/check-completeness.mjs \
  --base /path/to/project

# 查看帮助
node scripts/i18n/check-completeness.mjs --help
```

#### 输出示例

```
🔍 扫描国际化文件...

   找到 45 个文件

📄 apps/system-app/src/locales/zh-CN.json
   中文: 150 个, 英文: 145 个

   ❌ 缺少英文翻译 (5):
      - warehouse.material.fields.material_texture
      - inventory.result.fields.batch_no
      ... 还有 3 个

📊 检查报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
检查文件数:     45
中文翻译总数:   2341
英文翻译总数:   2298
缺失英文翻译:   43
多余英文翻译:   0
完整性:         98.16%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. find-duplicates.mjs
查找重复的国际化翻译

#### 功能
- 分析哪些翻译在多个文件中重复定义
- 识别可以提取到共享翻译中的内容
- 生成重复报告和优化建议
- 保存详细的 JSON 报告

#### 使用方法

```bash
# 查找所有重复
node scripts/i18n/find-duplicates.mjs

# 指定特定模式
node scripts/i18n/find-duplicates.mjs \
  --pattern "apps/**/*.json"

# 指定基础目录
node scripts/i18n/find-duplicates.mjs \
  --base /path/to/project

# 查看帮助
node scripts/i18n/find-duplicates.mjs --help
```

#### 输出示例

```
🔍 扫描国际化文件...

   找到 38 个中文翻译文件

📊 分析重复情况...

🔴 发现 156 个重复的翻译 key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 common.* (45 个重复)
──────────────────────────────────────────────

   🔑 common.button.save
      翻译: "保存"
      出现在 8 个文件:
      - apps/system-app/src/locales/zh-CN.json
      - apps/admin-app/src/locales/zh-CN.json
      - apps/logistics-app/src/locales/zh-CN.json
      ...

💡 优化建议
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

推荐提取以下通用翻译到共享目录:

1. 将 common.* 相关翻译提取到 locales/shared/common.ts
   - 重复次数: 45
   - 预计可减少代码: 2250 行左右

2. 将 crud.* 相关翻译提取到 locales/shared/crud.ts
   - 重复次数: 38
   - 预计可减少代码: 1900 行左右

📈 统计信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总文件数:         38
重复翻译数:       156
重复前缀数:       8
预计冗余代码:     ~624 行
优化潜力:         12.45%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 详细报告已保存到: i18n-duplicates-report.json
```

## 🔧 依赖安装

这些脚本需要以下依赖:

```bash
# 安装 glob (用于文件匹配)
npm install glob

# 或使用 pnpm
pnpm add glob
```

## 📋 使用流程

### 1. 评估当前状态

首先运行检查和分析脚本:

```bash
# 检查翻译完整性
node scripts/i18n/check-completeness.mjs

# 查找重复翻译
node scripts/i18n/find-duplicates.mjs
```

查看生成的报告,了解当前的问题。

### 2. 迁移准备

根据重复报告,规划需要提取到共享目录的翻译:

```bash
# 创建共享翻译目录
mkdir -p locales/shared
mkdir -p locales/domains
mkdir -p locales/apps
```

### 3. 转换格式

使用迁移脚本转换扁平格式为嵌套格式:

```bash
# 转换应用级翻译
node scripts/i18n/migrate-flat-to-nested.mjs dir \
  apps/system-app/src/locales \
  locales/apps/system

# 转换其他应用
node scripts/i18n/migrate-flat-to-nested.mjs dir \
  apps/admin-app/src/locales \
  locales/apps/admin
```

### 4. 提取共享翻译

手动从转换后的文件中提取通用翻译到共享目录:

```bash
# 编辑共享翻译文件
code locales/shared/common.ts
code locales/shared/crud.ts
code locales/shared/theme.ts
```

### 5. 更新应用配置

更新各应用的 i18n 配置,导入共享翻译:

```typescript
// apps/system-app/src/i18n/index.ts
import { sharedLocales } from '@workspace/locales/shared';
// ...
```

### 6. 验证结果

再次运行检查脚本确保没有遗漏:

```bash
# 检查完整性
node scripts/i18n/check-completeness.mjs

# 检查是否还有重复
node scripts/i18n/find-duplicates.mjs
```

### 7. 测试

在浏览器中测试各个应用:

- 切换语言
- 检查各个页面的翻译
- 验证 CRUD 操作

## 💡 提示

1. **备份**: 在开始迁移前,先创建一个备份分支
2. **增量迁移**: 建议逐个应用迁移,而不是一次性全部迁移
3. **团队协作**: 迁移过程中,确保团队成员了解新的结构
4. **CI 集成**: 可以将完整性检查集成到 CI 流程中

## 🐛 故障排除

### 脚本执行失败

```bash
# 确保使用 Node.js 16+
node --version

# 确保安装了依赖
npm install glob
```

### 文件编码问题

```bash
# 检查文件编码 (应该是 UTF-8)
file -I apps/system-app/src/locales/zh-CN.json

# 转换编码
iconv -f GBK -t UTF-8 input.json > output.json
```

### TypeScript 导入失败

如果 TS 文件导入失败,可能需要添加 `.js` 扩展名或配置 tsconfig:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

## 📞 支持

如有问题,请查阅主文档: `docs/i18n-optimization-analysis.md`
