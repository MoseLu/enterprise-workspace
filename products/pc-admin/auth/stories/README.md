# Auth 组件 Storybook 文档

## 概述

本目录包含 Auth 能力包所有组件的 Storybook 故事文件。

## 组件故事列表

### 登录组件
- `LoginForm.stories.ts` - 密码登录表单
  - Default - 默认状态
  - Loading - 加载状态
  - Filled - 表单填充状态
  - WithErrors - 验证错误状态

### 注册组件
- `TenantSelector.stories.ts` - 租户选择器
  - Default - 默认未选择状态
  - SelectedInert - 已选择员工
  - SelectedSupplier - 已选择供应商
  - SelectedUkHead - 已选择ITL
  - Interactive - 交互式示例

## 运行 Storybook

```bash
# 安装 Storybook（如果还未安装）
pnpm add -D @storybook/vue3 @storybook/addon-essentials

# 启动 Storybook
pnpm storybook

# 构建 Storybook
pnpm build-storybook
```

## 添加新故事

1. 在 `stories/` 目录创建新的 `.stories.ts` 文件
2. 导入组件
3. 定义 Meta 和 Story
4. 添加多个变体（variants）

示例：

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import MyComponent from '../components/MyComponent.vue';

const meta: Meta<typeof MyComponent> = {
  title: 'Auth/MyComponent',
  component: MyComponent,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // 组件 props
  }
};
```

## 最佳实践

1. **命名规范**
   - 故事文件: `ComponentName.stories.ts`
   - 故事名称: PascalCase（如 `Default`, `Loading`, `WithError`）

2. **组织结构**
   - 按功能模块分组（`Auth/Login`, `Auth/Register`）
   - 每个组件至少提供 3-5 个变体

3. **文档完善**
   - 使用 `autodocs` 标签自动生成文档
   - 添加组件描述
   - 添加 Props 说明

4. **交互测试**
   - 提供交互式示例
   - 展示组件的各种状态
   - 演示事件触发

## 参考资源

- [Storybook Vue3 文档](https://storybook.js.org/docs/vue/get-started/introduction)
- [组件故事格式](https://storybook.js.org/docs/vue/api/csf)
- [Addon 文档](https://storybook.js.org/docs/vue/essentials/introduction)
