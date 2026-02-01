# 盘点票打印模块

## 文件结构

```
inventory-ticket-print/
├── index.vue                          # 主入口文件
├── components/                        # 组件目录
│   └── BtcInventoryTicketPrintToolbar.vue  # 工具栏组件
├── composables/                       # 组合式函数目录
│   ├── useTicketService.ts           # 盘点票服务相关逻辑
│   └── useInventoryTicketPrint.ts    # 打印相关逻辑
├── styles/                           # 样式目录
│   └── index.scss                    # 主样式文件
└── README.md                         # 本文件
```

## 模块说明

### 主文件 (index.vue)
- 页面主入口，负责组装各个组件和 composables
- 处理域选择、数据刷新等页面级逻辑

### 组件 (components/)
- **BtcInventoryTicketPrintToolbar.vue**: 工具栏组件
  - 刷新按钮
  - 仓位筛选输入框
  - 打印按钮

### 组合式函数 (composables/)
- **useTicketService.ts**: 
  - 盘点票数据服务封装
  - 域服务封装
  - 表格列配置
  - 分页逻辑

- **useInventoryTicketPrint.ts**:
  - 打印功能实现
  - 二维码生成
  - 打印样式构建
  - 打印完成后调用后端接口

### 样式 (styles/)
- **index.scss**: 页面和组件样式定义

## 使用说明

该模块实现了盘点票的打印功能，支持：
- 按域和仓位筛选数据
- 打印预览（使用隐藏 iframe，不打开新标签页）
- 生产域和非生产域不同的打印样式
- 打印完成后自动调用后端接口记录

