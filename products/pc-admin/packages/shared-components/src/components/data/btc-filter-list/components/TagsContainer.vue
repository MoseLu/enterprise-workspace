<template>
  <!-- 滚动状态 -->
  <el-scrollbar
    v-if="hasScrollingRow"
    ref="tagsScrollbarRef"
    class="btc-filter-list__tags-scrollbar"
    :style="{ height: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'auto', minHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : '0', maxHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'none' }"
  >
    <div
      class="btc-filter-list__tags tags-scrollable"
      ref="tagsContainerRef"
    >
      <div
        v-for="row in categoryTagRows"
        :key="row.categoryId"
        ref="(el) => setRowRef(row.categoryId, el as HTMLElement)"
        class="btc-filter-list__tag-row"
        :data-category-id="row.categoryId"
        :data-scrolling="scrollingRows.has(row.categoryId)"
      >
        <!-- 内部内容容器，用于承载所有标签 -->
        <div class="btc-filter-list__tag-row-content">
          <!-- 分类提示标签（固定，每排第一个，展开状态下隐藏） -->
          <BtcTag
            v-if="!scrollingRows.has(row.categoryId)"
            :type="getTagType(row.categoryId)"
            :disable-transitions="true"
            class="btc-filter-list__category-tag"
          >
            {{ row.categoryName }}
          </BtcTag>

          <!-- 收起按钮（展开状态下显示，取代分类标签位置） -->
          <el-icon
            v-if="scrollingRows.has(row.categoryId)"
            :class="['btc-filter-list__collapse-btn', `btc-filter-list__collapse-btn--${getTagType(row.categoryId)}`]"
            @click.stop="handleCollapseBtnClick(row.categoryId)"
          >
            <ArrowLeft />
          </el-icon>

          <!-- 所有标签（包括可见和溢出，通过样式控制显示/隐藏） -->
          <template v-for="tag in row.tags" :key="`${row.categoryId}-${tag.optionValue}`">
            <BtcTag
              :type="getTagType(row.categoryId)"
              closable
              :disable-transitions="hasScrollingRow"
              :class="[
                'btc-filter-list__overflow-tag-item',
                {
                  'btc-filter-list__tag-hidden': !scrollingRows.has(row.categoryId) && !row.visibleTags.some(t => t.optionValue === tag.optionValue)
                }
              ]"
              @close="handleTagClose(row.categoryId, tag.optionValue)"
            >
              {{ tag.optionLabel }}
            </BtcTag>
          </template>

          <!-- 折叠标签（当有溢出时显示，但在滚动状态下隐藏） -->
          <BtcTag
            v-if="row.overflowCount > 0"
            :type="getTagType(row.categoryId)"
            :disable-transitions="true"
            :class="[
              'btc-filter-list__collapse-tag',
              {
                'btc-filter-list__tag-last': !rowRemainingSpaceMap[row.categoryId],
                'btc-filter-list__tag-hidden': scrollingRows.has(row.categoryId)
              }
            ]"
            @click.stop="handleCollapseTagClick(row.categoryId)"
          >
            +{{ row.overflowCount }}
          </BtcTag>
        </div>
      </div>
    </div>
  </el-scrollbar>

  <!-- 非滚动状态：普通显示 -->
  <div
    v-else-if="showTagsContainer"
    class="btc-filter-list__tags"
    ref="tagsContainerRef"
    :style="{ height: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'auto', minHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : '0', maxHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'none' }"
  >
    <div
      v-for="row in categoryTagRows"
      :key="row.categoryId"
      ref="(el) => setRowRef(row.categoryId, el as HTMLElement)"
      class="btc-filter-list__tag-row"
      :data-category-id="row.categoryId"
      :data-scrolling="false"
    >
      <!-- 内部内容容器，用于承载所有标签 -->
      <div class="btc-filter-list__tag-row-content">
        <!-- 分类提示标签（固定，每排第一个） -->
        <BtcTag
          :type="getTagType(row.categoryId)"
          :disable-transitions="true"
          class="btc-filter-list__category-tag"
        >
          {{ row.categoryName }}
        </BtcTag>

        <!-- 所有标签（包括可见和溢出，通过样式控制显示/隐藏） -->
        <template v-for="(tag, index) in row.tags" :key="`${row.categoryId}-${tag.optionValue}`">
          <BtcTag
            :type="getTagType(row.categoryId)"
            closable
            :disable-transitions="true"
            :class="[
              'btc-filter-list__overflow-tag-item',
              {
                'btc-filter-list__tag-last': index === row.tags.length - 1 && row.overflowCount === 0 && rowRemainingSpaceMap[row.categoryId] === true,
                'btc-filter-list__tag-hidden': !row.visibleTags.some(t => t.optionValue === tag.optionValue)
              }
            ]"
            @close="handleTagClose(row.categoryId, tag.optionValue)"
          >
            {{ tag.optionLabel }}
          </BtcTag>
        </template>

        <!-- 折叠标签（当有溢出时显示） -->
        <BtcTag
          v-if="row.overflowCount > 0"
          :type="getTagType(row.categoryId)"
          :disable-transitions="true"
          :class="[
            'btc-filter-list__collapse-tag',
            { 'btc-filter-list__tag-last': !rowRemainingSpaceMap[row.categoryId] }
          ]"
          @click.stop="handleCollapseTagClick(row.categoryId)"
        >
          +{{ row.overflowCount }}
        </BtcTag>
      </div>
      <!-- 收起按钮（展开状态下显示，非滚动状态下不显示） -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft } from '@element-plus/icons-vue';
import { BtcTag } from '@btc/shared-components';
import type { CategoryTagRow, BtcTagType } from '../types';

interface Props {
  showTagsContainer?: boolean;
  hasScrollingRow: boolean;
  categoryTagRows: CategoryTagRow[];
  scrollingRows: Set<string>;
  rowRemainingSpaceMap: Record<string, boolean>;
  tagsContainerHeight: number;
  getTagType: (categoryId: string) => BtcTagType;
  setRowRef: (categoryId: string, el: HTMLElement | null) => void;
}

interface Emits {
  (e: 'tagClose', categoryId: string, optionValue: any): void;
  (e: 'collapseTagClick', categoryId: string): void;
  (e: 'collapseBtnClick', categoryId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  showTagsContainer: true,
});

const emit = defineEmits<Emits>();

const tagsContainerRef = ref<HTMLElement | null>(null);
const tagsScrollbarRef = ref<any>(null);

const handleTagClose = (categoryId: string, optionValue: any) => {
  emit('tagClose', categoryId, optionValue);
};

const handleCollapseTagClick = (categoryId: string) => {
  emit('collapseTagClick', categoryId);
};

const handleCollapseBtnClick = (categoryId: string) => {
  emit('collapseBtnClick', categoryId);
};

defineExpose({
  tagsContainerRef,
  tagsScrollbarRef,
});
</script>