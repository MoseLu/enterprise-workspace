# BtcIconButton 图标按钮组件

统一的图标按钮组件，自带 tooltip、统一样式、btc-svg，支持 badge、dropdown、popover 等功能。

## 特性

- 自动应用 `btc-comm__icon` 样式
- 内置 `el-tooltip`（tooltip 可选）
- 内置 `btc-svg` 组件
- 支持 badge 显示（消息、通知）
- 支持 dropdown 菜单（关闭其他标签页）
- 支持 popover 面板（消息、通知面板）
- 支持动态 tooltip（折叠/展开按钮）
- 支持动态图标（暗黑模式切换）

## 使用示例

### 简单按钮

```vue
<BtcIconButton
  :config="{
    icon: 'back',
    tooltip: t('common.tooltip.back'),
    onClick: toBack
  }"
/>
```

### 带 badge 的按钮

```vue
<BtcIconButton
  :config="{
    icon: 'msg',
    tooltip: t('common.tooltip.message'),
    badge: unreadCount,
    popover: {
      component: BtcMessagePanel
    }
  }"
/>
```

### 带 dropdown 的按钮

```vue
<BtcIconButton
  :config="{
    icon: 'close-border',
    tooltip: t('common.tooltip.close_other_tabs'),
    dropdown: {
      items: [
        { command: 'close-other', label: t('common.close_other') },
        { command: 'close-all', label: t('common.close_all') }
      ],
      onCommand: handleTabCommand
    }
  }"
/>
```

### 动态 tooltip 和图标

```vue
<BtcIconButton
  :config="{
    icon: () => isCollapse ? 'expand' : 'fold',
    tooltip: () => isCollapse ? t('common.tooltip.expand_sidebar') : t('common.tooltip.collapse_sidebar'),
    onClick: () => $emit('toggle-sidebar')
  }"
/>
```

## Props

### config

类型：`IconButtonConfig`

配置对象，包含以下属性：

- `icon` (string | () => string): 图标名称（必需），支持动态函数
- `tooltip` (string | () => string): tooltip 文本，支持动态函数
- `onClick` (() => void): 点击事件
- `badge` (number): badge 数量（可选）
- `dropdown` (IconButtonDropdown): dropdown 配置（可选）
- `popover` (IconButtonPopover): popover 配置（可选）
- `size` (number): 图标大小（默认 16）
- `class` (string): 额外类名

