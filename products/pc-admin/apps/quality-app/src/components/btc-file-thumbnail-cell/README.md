# BtcFileThumbnailCell

文件缩略图单元格组件，用于在 `BtcTable` 中展示文件的预览效果：

- 图片类文件（`mime` 以 `image/` 开头，或常见图片扩展名）展示真实缩略图，支持点击放大预览。
- 其他类型文件展示带有扩展名的色块图标，针对 Excel、PowerPoint、Word、PDF、文本等常见格式提供区分配色。

## Props

| 名称         | 类型   | 说明                           |
| ------------ | ------ | ------------------------------ |
| modelValue   | string | 预览文件的 URL（由表格列注入） |
| mime         | string | 文件的 MIME 类型               |
| originalName | string | 文件原始名称，用于解析后缀     |

## 用法示例

```ts
const columns = computed<TableColumn[]>(() => [
  {
    label: '缩略图',
    prop: 'fileUrl',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    component: {
      name: 'BtcFileThumbnailCell',
      props: (scope) => ({
        mime: scope.row.mime,
        originalName: scope.row.originalName,
      }),
    },
  },
  // ...
]);
```

确保在 `props` 回调中传入 `mime` 与 `originalName`，以便组件准确识别文件类型。文件 URL 会通过 `modelValue` 自动注入，无需额外配置。

