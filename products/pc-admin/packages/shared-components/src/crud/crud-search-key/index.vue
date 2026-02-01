<template>
  <div
    class="btc-search-key"
    :class="containerClasses"
    :style="containerStyle"
    @mouseenter="handleContainerMouseEnter"
    @mouseleave="handleContainerMouseLeave"
  >
    <button
      v-if="isCollapsible && !isExpanded"
      class="btc-search-key__icon-btn btc-search-key__toggle"
      type="button"
      :aria-label="placeholder"
      :title="placeholder"
      @mouseenter="handleIconMouseEnter"
      @focus="handleIconFocus"
      @click.prevent="toggleExpand"
    >
      <BtcSvg name="search" :size="18" />
    </button>

      <el-input
      v-else
      ref="inputRef"
        v-model="keyword"
        :placeholder="placeholder"
        clearable
      :id="inputId"
      :name="props.field"
        v-bind="$attrs"
        @keyup.enter="handleSearch"
        @clear="handleClear"
        @focus="handleFocus"
        @blur="handleBlur"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <template #append>
        <button
          class="btc-search-key__icon-btn"
          type="button"
          :aria-label="placeholder"
          :title="placeholder"
          @click.prevent="handleSearchButtonClick"
          @mousedown.stop="handleSearchButtonMousedown"
          @mouseenter="handleAppendMouseEnter"
          @mouseleave="handleAppendMouseLeave"
          @focus="clearCollapseTimer"
          @blur="handleAppendBlur"
        >
          <BtcSvg name="search" :size="18" />
        </button>
        </template>
      </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useI18n } from '@btc/shared-core';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import type { InputInstance } from 'element-plus';
const DEFAULT_SEARCH_WIDTH = 200;


let searchKeySeed = 0;

export interface Props {
  placeholder?: string;
  field?: string;
  collapsible?: boolean;
  expandedWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  field: 'keyword',
  collapsible: true,
  expandedWidth: DEFAULT_SEARCH_WIDTH,
});

const { t } = useI18n();

const crud = inject<any>('btc-crud');

if (!crud) {
  throw new Error('[BtcSearchKey] Must be used inside <BtcCrud>');
}

const keyword = ref('');
const instanceId = ++searchKeySeed;
const inputRef = ref<InputInstance>();
const collapseTimer = ref<number | null>(null);
const appendHover = ref(false);
const containerHover = ref(false);
const isPinned = ref(false);

const isCollapsible = computed(() => props.collapsible !== false);
const isExpanded = ref(!isCollapsible.value);

const containerClasses = computed(() => ({
  'is-collapsible': isCollapsible.value,
  'is-expanded': !isCollapsible.value || isExpanded.value,
}));

const containerStyle = computed(() => {
  const baseWidth =
    Number.isFinite(props.expandedWidth) && props.expandedWidth > 0
      ? props.expandedWidth
      : DEFAULT_SEARCH_WIDTH;
  return {
    '--btc-crud-search-width': `${baseWidth}px`,
  } as Record<string, string>;
});

watch(isCollapsible, (val) => {
  if (val) {
    isExpanded.value = false;
  } else {
    clearCollapseTimer();
    isExpanded.value = true;
  }
});

const inputId = computed(() => `btc-search-key-${props.field}-${instanceId}`);

const placeholder = computed(() => props.placeholder || t('crud.button.search'));

const clearCollapseTimer = () => {
  if (collapseTimer.value !== null) {
    window.clearTimeout(collapseTimer.value);
    collapseTimer.value = null;
  }
};

const scheduleCollapse = (_reason: string) => {
  if (!isCollapsible.value || !isExpanded.value || isPinned.value || appendHover.value || containerHover.value) {
    return;
  }
  clearCollapseTimer();
  collapseTimer.value = window.setTimeout(() => {
    if (isPinned.value) return;
    isExpanded.value = false;
    inputRef.value?.blur();
  }, 300);
};

interface ExpandOptions {
  pinned?: boolean;
  focus?: boolean;
}

const applyExpand = (options: ExpandOptions = {}) => {
  if (!isCollapsible.value || isExpanded.value) return;
  isExpanded.value = true;
  isPinned.value = options.pinned ?? false;
  clearCollapseTimer();
  if (options.focus !== false) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
};

const toggleExpand = () => {
  if (!isCollapsible.value) return;
  if (isExpanded.value) {
    isPinned.value = false;
    clearCollapseTimer();
    isExpanded.value = false;
    collapseTimer.value = window.setTimeout(() => {
      if (isPinned.value) return;
      inputRef.value?.blur();
    }, 0);
  } else {
    applyExpand({ pinned: true, focus: true });
  }
};

const expand = (options: ExpandOptions = {}) => {
  if (!isCollapsible.value) return;
  applyExpand({ pinned: false, focus: false, ...options });
};

const handleIconMouseEnter = () => {
  expand();
};

const handleIconFocus = () => {
  expand({ focus: true });
};

const handleSearch = () => {
  crud.handleSearch({ [props.field]: keyword.value });
  if (isCollapsible.value) {
    isPinned.value = true;
    clearCollapseTimer();
  }
};

const handleSearchButtonMousedown = () => {
  clearCollapseTimer();
};

const handleSearchButtonClick = () => {
  if (isExpanded.value) {
    // 如果已展开，触发搜索
    handleSearch();
  } else {
    // 如果未展开，先展开输入框
    toggleExpand();
  }
};

const handleContainerMouseEnter = () => {
  containerHover.value = true;
  clearCollapseTimer();
};

const handleContainerMouseLeave = () => {
  containerHover.value = false;
  if (isCollapsible.value) {
    scheduleCollapse('container mouseleave');
  }
};

const handleClear = () => {
  keyword.value = '';
  crud.handleReset();
  if (isCollapsible.value) {
    isPinned.value = false;
    scheduleCollapse('clear');
  }
};

const handleAppendMouseEnter = () => {
  appendHover.value = true;
  clearCollapseTimer();
};

const handleAppendMouseLeave = () => {
  if (!isCollapsible.value) return;
  appendHover.value = false;
  scheduleCollapse('append mouseleave');
};

const handleAppendBlur = () => {
  if (!isCollapsible.value) return;
  appendHover.value = false;
  scheduleCollapse('append blur');
};

// 鼠标悬浮时显示tooltip
const handleMouseEnter = () => {
  clearCollapseTimer();
  expand();
};

const handleMouseLeave = () => {
  if (isCollapsible.value && !isPinned.value) {
    scheduleCollapse('mouse leave');
  }
};

// 聚焦时显示tooltip
const handleFocus = () => {
  clearCollapseTimer();
};

const handleBlur = () => {
  if (!isCollapsible.value) return;
  if (containerHover.value || appendHover.value) return;
  isPinned.value = false;
  scheduleCollapse('blur');
};

onBeforeUnmount(() => {
  clearCollapseTimer();
});

watch(
  () => keyword.value,
  () => {
    if (isCollapsible.value && keyword.value === '') {
      isPinned.value = false;
    }
  }
);
</script>

