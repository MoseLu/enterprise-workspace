# Design Tokens

> 企业工作空间设计令牌系统

本目录包含完整的设计令牌系统，用于确保产品间视觉和交互的一致性。

## 目录结构

```
design-tokens/
├── _core/                      # 核心令牌（跨主题共享）
│   ├── colors.json           # 基础颜色
│   ├── spacing.json          # 基础间距
│   ├── sizing.json           # 基础尺寸
│   ├── typography.json       # 排版基础
│   └── transitions.json      # 过渡效果
│
├── glass/                     # 玻璃态主题（深色毛玻璃效果）
│   ├── colors.json           # 主题颜色
│   ├── effects.json          # 视觉效果
│   ├── typography.json       # 排版
│   └── component.json        # 组件令牌
│
├── minimal/                    # Bellis 极简主题（清爽干净风格）
│   ├── colors.json           # 主题颜色
│   ├── effects.json          # 视觉效果
│   ├── typography.json       # 排版
│   ├── layout.json           # 布局
│   └── component.json        # 组件令牌
│
├── index.ts                   # TypeScript 类型定义
├── variables.css              # 编译后的 CSS 变量
└── README.md                  # 本文件
```

## 主题概览

| 主题 | 描述 | 特点 | 适用场景 |
|------|------|------|----------|
| **Glass** | 玻璃态主题 | 深色背景、毛玻璃效果、透明度叠加 | AI 界面、现代应用 |
| **Bellis** | 极简主题 | 浅色背景、清晰简洁、无多余装饰 | 管理系统、后台面板 |

## 令牌维度

设计令牌分为 **8 大维度**：

| # | 维度 | 描述 | 示例 |
|---|------|------|------|
| 1 | **Colors** | 颜色系统 | 主色、辅助色、语义色、灰度 |
| 2 | **Typography** | 排版系统 | 字体、字号、行高、字重 |
| 3 | **Spacing** | 间距系统 | 基础间距、组件间距 |
| 4 | **Sizing** | 尺寸系统 | 图标、头像、按钮、容器 |
| 5 | **Effects** | 效果系统 | 阴影、模糊、边框、圆角 |
| 6 | **Transitions** | 过渡系统 | 动画时长、缓动函数 |
| 7 | **Layout** | 布局系统 | 断点、容器、栅格 |
| 8 | **Z-Index** | 层级系统 | 模态框、下拉菜单 |

## 使用方法

### 导入 CSS 变量

```css
/* 在全局样式文件中导入 */
@import '@enterprise/shared/design-tokens/variables.css';

/* 或在 main.ts / main.js 中导入 */
import '@enterprise/shared/design-tokens/variables.css';
```

### 在 CSS 中使用

```css
/* 使用核心令牌 */
.element {
  color: var(--color-gray-800);
  padding: var(--spacing-4);
  font-size: var(--font-size-lg);
  border-radius: var(--minimal-border-radius-md);
}

/* 使用 Glass 主题令牌 */
.glass-card {
  background: var(--glass-color-background-card);
  backdrop-filter: var(--glass-effect-backdrop-blur-md);
  box-shadow: var(--glass-effect-shadow-md);
}

/* 使用 Bellis 主题令牌 */
.minimal-card {
  background: var(--minimal-color-background-card);
  border-radius: var(--minimal-border-radius-lg);
  box-shadow: var(--minimal-effect-shadow-sm);
}
```

### 在 React/TypeScript 中使用

```tsx
import { GlassTokens, BellisTokens } from '@enterprise/shared/design-tokens';

// Glass 主题样式
const glassStyles = {
  card: {
    background: 'rgba(40, 40, 40, 0.8)',
    backdropFilter: 'blur(8px)',
  } as React.CSSProperties,
};

// Bellis 主题样式
const minimalStyles = {
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  } as React.CSSProperties,
};
```

### 动态主题切换

```tsx
import { useState, useEffect } from 'react';

type Theme = 'glass' | 'minimal';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('minimal');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return children;
};
```

### 使用主题工具类

```html
<!-- Glass 主题 -->
<div class="glass-card glass-button glass-input">...</div>

<!-- Bellis 主题 -->
<div class="minimal-card minimal-button-primary minimal-button-secondary minimal-input">...</div>
```

## 主题来源

| 主题 | 来源文件 | 用途 |
|------|----------|------|
| **Glass** | `docs/others/设计方案/haowallpaper网站设计思路分析.md` | 深色/玻璃态界面 |
| **Bellis** | 基于 minimal 设计文档重构 | 极简清爽风格 |

## 核心令牌 (_core)

### Colors

```json
{
  "color": {
    "gray": { "50": "#fafafa", "100": "#f4f4f5", ... },
    "semantic": {
      "success": { "light": "#86efac", "main": "#22c55e", ... },
      "warning": { ... },
      "error": { ... },
      "info": { ... }
    }
  }
}
```

### Spacing

```json
{
  "spacing": {
    "base-unit": "4px",
    "scale": {
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "6": "24px",
      "8": "32px"
    }
  }
}
```

### Typography

```json
{
  "typography": {
    "font-size": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px"
    },
    "font-weight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    }
  }
}
```

### Transitions

```json
{
  "transition": {
    "duration": {
      "fast": "150ms",
      "normal": "200ms",
      "slow": "300ms"
    },
    "easing": {
      "ease-out": "ease-out",
      "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    }
  }
}
```

## 组件令牌使用

### 按钮尺寸

```css
/* 小按钮 */
.btn-sm {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
}

/* 中按钮 */
.btn-md {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}

/* 大按钮 */
.btn-lg {
  height: 44px;
  padding: 0 20px;
  font-size: 16px;
}
```

### 输入框

```css
.input {
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 14px;
}
```

### 卡片

```css
.card {
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
```

## 响应式断点

| 断点 | 值 | 用途 |
|------|------|------|
| xs | 480px | 超小屏幕 |
| sm | 640px | 小屏幕 |
| md | 768px | 平板 |
| lg | 1024px | 笔记本 |
| xl | 1280px | 桌面 |
| 2xl | 1536px | 大桌面 |

## 扩展主题

要添加新主题：

1. 创建主题目录：`design-tokens/new-theme/`
2. 添加令牌文件：
   - `colors.json`
   - `effects.json`
   - `typography.json`
   - `layout.json`
   - `component.json`
3. 在 `variables.css` 中添加对应的 CSS 变量
4. 在 `index.ts` 中添加 TypeScript 类型
5. 更新本 README.md

## 验证

### 检查目录结构

```bash
ls -la design-tokens/
ls -la design-tokens/_core/
ls -la design-tokens/glass/
ls -la design-tokens/minimal/
```

### 验证 JSON 格式

```bash
# 使用 jq 验证 JSON
for f in $(find design-tokens -name "*.json"); do
  echo "Validating $f..."
  cat "$f" | jq . > /dev/null 2>&1 && echo "✓ Valid" || echo "✗ Invalid"
done
```

### 验证 TypeScript 编译

```bash
cd design-tokens
npx tsc --noEmit index.ts
```

## 最佳实践

1. **使用令牌而非硬编码值**：始终使用 CSS 变量或令牌值
2. **保持一致性**：相同场景使用相同令牌
3. **优先使用核心令牌**：主题特定令牌应引用核心令牌
4. **不要直接修改生成的 CSS**：编辑源 JSON 文件后重新生成
5. **语义化命名**：令牌名称应描述用途而非具体值
6. **选择适合的主题**：根据产品定位选择合适的主题风格

## 贡献指南

1. 修改源 JSON 文件
2. 更新 TypeScript 类型定义
3. 重新生成 CSS 变量
4. 更新文档
5. 提交 PR 进行审查

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-02-06 | 仅保留 Glass + Bellis 主题 |
| 1.1.0 | 2026-02-06 | 替换 Bellis 为 Minimalist + Cyber 主题 |
| 1.0.0 | 2026-02-06 | 初始版本（Glass + Bellis） |

## License

MIT
