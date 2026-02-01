<template>
  <div class="component-library">
    <div class="library-header">
      <btc-search
        v-model="searchModel"
        placeholder="搜索组件"
        size="small"
      />
    </div>

    <div class="library-content">
      <el-collapse v-model="activeModel">
        <el-collapse-item
          v-for="category in categories"
          :key="category.name"
          :title="category.title"
          :name="category.name"
        >
          <div class="component-list">
            <div
              v-for="component in category.components"
              :key="component.type"
              class="component-item"
              :data-type="component.type"
              :draggable="true"
              role="button"
              :aria-label="`拖拽 ${component.name} 组件到画布`"
              @dragstart="$emit('dragstart', $event, component)"
              @click="$emit('click-component', component)"
            >
              <div class="component-shape">
                <svg width="60" height="40" viewBox="0 0 60 40">
                  <circle
                    v-if="component.type === 'START' || component.type === 'END'"
                    cx="30" cy="20" r="15"
                    :fill="getFill(component.type)"
                    :stroke="getStroke(component.type)"
                    stroke-width="2"
                  />
                  <path
                    v-else-if="component.type === 'CONDITION'"
                    d="M 30 5 L 50 20 L 30 35 L 10 20 Z"
                    :fill="getFill(component.type)"
                    :stroke="getStroke(component.type)"
                    stroke-width="2"
                  />
                  <rect
                    v-else-if="component.type === 'ACTION'"
                    x="10" y="5" width="40" height="30"
                    :fill="getFill(component.type)"
                    :stroke="getStroke(component.type)"
                    stroke-width="2" rx="4" ry="4"
                  />
                  <rect
                    v-else
                    x="10" y="5" width="40" height="30"
                    :fill="getFill(component.type)"
                    :stroke="getStroke(component.type)"
                    stroke-width="2" rx="4" ry="4"
                  />
                </svg>
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { BtcSearch as btcSearch } from '@btc/shared-components';

const props = defineProps<{
  search: string;
  active: string[];
  categories: Array<{ name: string; title: string; components: any[] }>;
  getFill: (type: string) => string;
  getStroke: (type: string) => string;
}>();
const emit = defineEmits(['update:search','update:active','dragstart','click-component']);

const searchModel = ref(props.search);
watch(() => props.search, v => { searchModel.value = v; });
watch(searchModel, v => {
  emit('update:search', v);
});

const activeModel = ref<string[]>(props.active);
watch(() => props.active, v => { activeModel.value = v; });
watch(activeModel, v => {
  emit('update:active', v);
});
</script>


