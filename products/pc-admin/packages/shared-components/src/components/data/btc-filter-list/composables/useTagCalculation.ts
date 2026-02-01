import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FilterCategory, CategoryTagRow, BtcTagType } from '../types';

/**
 * 标签计算 composable
 */
export function useTagCalculation(
  categories: Ref<FilterCategory[]>,
  selectedValues: Ref<Record<string, any[]>>,
  maxTagsPerRowMap: Ref<Record<string, number>>,
  defaultMaxTagsPerRow: Ref<number>
) {

  // 按分类分组标签数据
  const categoryTagRows = computed<CategoryTagRow[]>(() => {
    const rows: CategoryTagRow[] = [];

    // 提前获取 maxTagsPerRowMap 快照，避免计算过程中被修改
    const maxTagsSnapshot = { ...maxTagsPerRowMap.value };

    // 遍历所有分类（按原始顺序）
    categories.value.forEach(category => {
      const values = selectedValues.value[category.id] || [];
      if (values.length === 0) {
        // 即使没有选中，也创建一行（用于显示分类提示标签）
        rows.push({
          categoryId: String(category.id),
          categoryName: String(category.name || ''),
          tags: [],
          visibleTags: [],
          overflowCount: 0,
          overflowTags: [],
        });
        return;
      }

      // 收集该分类的所有标签
      // 重要：创建全新的纯对象，只提取 value 和 label，避免循环引用
      const tags = values.map(value => {
        const option = category.options.find(opt => opt.value === value);
        if (!option) {
          return null;
        }
        // 创建全新的纯对象，只包含需要的属性，避免循环引用
        return {
          optionValue: value,
          optionLabel: String(option.label || ''),
        };
      }).filter(Boolean) as Array<{ optionValue: any; optionLabel: string }>;

      // 计算可见标签和溢出标签
      // 使用快照数据，避免计算过程中 maxTagsPerRowMap 变化触发重算
      const maxTagsForRow = maxTagsSnapshot[category.id] ?? defaultMaxTagsPerRow.value;

      // 如果标签数量超过 maxTagsForRow，说明有溢出，需要显示折叠标签
      // 可见标签数量就是 maxTagsForRow（能显示多少就显示多少）
      const hasOverflow = tags.length > maxTagsForRow;
      const visibleTagCount = maxTagsForRow; // 直接使用 maxTagsForRow，不减去 1
      // 创建全新的数组，避免引用原始数组
      const visibleTags = tags.slice(0, visibleTagCount).map(tag => ({
        optionValue: tag.optionValue,
        optionLabel: tag.optionLabel,
      }));
      const overflowTags = tags.slice(visibleTagCount).map(tag => ({
        optionValue: tag.optionValue,
        optionLabel: tag.optionLabel,
      }));
      const overflowCount = overflowTags.length;

      rows.push({
        categoryId: String(category.id),
        categoryName: String(category.name || ''),
        tags,
        visibleTags,
        overflowCount,
        overflowTags,
      });
    });

    return rows;
  });

  // 根据分类 ID 获取对应的 tag 类型
  const getTagType = (categoryId: string): BtcTagType => {
    const typeList = [
      'primary',
      'success',
      'warning',
      'danger',
      'info',
      'purple',
      'pink',
      'cyan',
      'teal',
      'indigo',
      'orange',
      'brown',
      'gray',
      'lime',
      'olive',
      'navy',
      'maroon',
    ] as const;

    // 根据分类在列表中的索引来确定类型
    const categoryIndex = categories.value.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return 'primary';
    }

    const index = categoryIndex % typeList.length;
    return typeList[index] || 'primary';
  };

  return {
    categoryTagRows,
    getTagType,
  };
}