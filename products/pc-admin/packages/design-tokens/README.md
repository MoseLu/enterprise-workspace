# @btc/design-tokens

BTC ShopFlow 设计令牌（Design Tokens）包，使用 Style Dictionary 管理设计系统变量。

## 安装

```bash
pnpm add @btc/design-tokens
```

## 使用

### CSS 变量

```css
@import '@btc/design-tokens/css';
```

### SCSS 变量

```scss
@use '@btc/design-tokens/scss' as *;
```

### TypeScript

```typescript
import { tokens } from '@btc/design-tokens/ts';
```

## 开发

### 构建

```bash
pnpm build
```

### 监听模式

```bash
pnpm dev
```

## 结构

```
design-tokens/
├── tokens/              # 设计令牌源文件（JSON）
│   ├── base/           # 基础令牌（颜色、间距等）
│   ├── components/     # 组件特定令牌
│   └── themes/          # 主题令牌
├── config/             # Style Dictionary 配置
└── dist/               # 编译输出
    ├── css/
    ├── scss/
    └── ts/
```
