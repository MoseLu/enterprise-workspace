# BtcFileActionsCell

文件列表操作单元格组件，提供自定义操作按钮（分享 / 详情 / 删除），用于替换 `BtcTable` 内置的默认操作列。

## Props

| 名称     | 类型                 | 说明                         |
| -------- | -------------------- | ---------------------------- |
| row      | Record<string, any>  | 当前行数据                   |
| onShare  | (row) => void        | 分享回调，可选               |
| onDetail | (row) => void        | 查看详情回调，可选           |
| onDelete | (row) => void        | 删除回调，可选               |

## 用法示例

```ts
const columns = computed<TableColumn[]>(() => [
  {
    label: '操作',
    prop: 'op',
    width: 200,
    align: 'center',
    fixed: 'right' as const,
    component: {
      name: BtcFileActionsCell,
      props: () => ({
        onShare: handleShare,
        onDetail: handleDetail,
        onDelete: (row: any) => handleDeleteSingle(row),
      }),
    },
  },
]);
```

> `row` 对象会通过 `modelValue` 自动注入，无需额外传入。 使用时按需实现 `handleShare`、`handleDetail`、`handleDeleteSingle`。

