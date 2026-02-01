<template>
  <div v-if="enableSearch && !hasHeaderActionsSlot" class="btc-filter-list__search-wrapper">
    <div class="btc-filter-list__search">
      <BtcInput
        :model-value="searchKeyword"
        @update:model-value="(val: string | number) => handleSearchKeywordUpdate(val)"
        placeholder="搜索分类..."
        clearable
        :id="`btc-filter-list-search-${props.instanceId || 'default'}`"
        :name="`btc-filter-list-search-${props.instanceId || 'default'}`"
      >
        <template #prefix>
          <BtcSvg name="search" :size="16" />
        </template>
      </BtcInput>
    </div>
    <!-- 设置按钮 -->
    <el-dropdown
      v-model:visible="dropdownVisible"
      trigger="click"
      @command="handleSizeChange"
      placement="bottom-end"
    >
        <template #default>
          <div class="btc-filter-list__settings-btn-wrapper">
            <el-tooltip :content="t('btc.filterList.tooltip.settings')" placement="bottom">
              <div class="btc-filter-list__settings-btn">
                <BtcSvg 
                  name="set" 
                  :size="16" 
                  animation="rotate"
                  animation-trigger="hover"
                  :animation-duration="0.2"
                  :aria-hidden="false"
                />
              </div>
            </el-tooltip>
          </div>
        </template>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="sizeOption in sizeOptions"
            :key="sizeOption.value"
            :command="sizeOption.value"
          >
            <div
              class="btc-filter-list__size-item"
              :class="{ 'is-active': sizeOption.value === currentSize }"
            >
              <span class="btc-filter-list__size-item-label">{{ sizeOption.label }}</span>
              <span v-if="sizeOption.value === currentSize" class="btc-filter-list__size-item-dot"></span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { BtcInput, BtcIconButton } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import type { BtcFilterListSize } from '../types';

interface Props {
  enableSearch?: boolean;
  currentSize: BtcFilterListSize;
  sizeOptions: Array<{ label: string; value: BtcFilterListSize }>;
  searchKeyword: string;
  instanceId?: string; // 实例 ID，用于生成唯一的表单字段 ID
}

interface Emits {
  (e: 'update:searchKeyword', value: string): void;
  (e: 'sizeChange', size: BtcFilterListSize): void;
}

const props = withDefaults(defineProps<Props>(), {
  enableSearch: true,
});

const emit = defineEmits<Emits>();

const slots = useSlots();
const { t } = useI18n();

// 是否提供了 header-actions 插槽
const hasHeaderActionsSlot = computed(() => !!slots['header-actions']);

// 控制下拉菜单的显示状态（用于旋转动画）
const dropdownVisible = ref(false);

// 处理搜索关键词变化
const handleSearchKeywordUpdate = (value: string | number) => {
  emit('update:searchKeyword', String(value));
};

// 处理尺寸切换
const handleSizeChange = (size: BtcFilterListSize) => {
  emit('sizeChange', size);
};
</script>

<style lang="scss" scoped>
.btc-filter-list__search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  width: 100%;
  min-width: 0; // 允许 flex 子元素收缩
  box-sizing: border-box;
}

.btc-filter-list__search {
  flex: 1;
  margin-bottom: 0;
  min-width: 0; // 允许 flex 子元素收缩，防止超出容器
  overflow: hidden; // 防止内容溢出
}

// 设置图标样式（去掉边框）
.btc-filter-list__settings-icon {
  // 去掉 btc-comm__icon 的边框样式
  border: none !important;
  
  &:hover {
    border: none !important;
  }
  
  &:focus {
    border: none !important;
    outline: none !important;
  }
}

// 移除 el-dropdown 的 focus outline（白色方形边框）
:deep(.el-dropdown) {
  .el-only-child {
    outline: none !important;
    
    &:focus {
      outline: none !important;
    }
    
    &:focus-visible {
      outline: none !important;
    }
  }
}

// 下拉菜单样式（与国际化切换样式一致）
:deep(.el-dropdown-menu) {
  .el-dropdown-menu__item {
    padding: 0;
  }
}

// 尺寸选择项样式（与国际化切换样式一致）
.btc-filter-list__size-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px; // 文本和点之间的间距
  padding: 4px 0;

  &-label {
    font-size: 14px;
  }

  &-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--el-color-primary);
    flex-shrink: 0;
  }

  // 选中状态的样式（与国际化切换样式一致）
  &.is-active {
    .btc-filter-list__size-item-label {
      color: var(--el-color-primary);
      font-weight: 500;
    }

    .btc-filter-list__size-item-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
    }
  }

  // hover 状态
  &:hover {
    .btc-filter-list__size-item-label {
      color: var(--el-color-primary);
    }
  }
}
</style>
