<template>
  <div v-if="visible" ref="toolbarRef" class="btc-table-toolbar">
    <div class="btc-table-toolbar__left">
      <slot name="left" />
    </div>
    <div class="btc-table-toolbar__right">
      <template v-if="items.has('size') && sizeButton">
        <el-dropdown
          v-if="!isSizeControlled"
          trigger="click"
          @command="handleSizeCommand"
        >
          <template #default>
            <BtcTableButton
              class="btc-table-toolbar__icon-btn"
              :config="sizeButton"
            />
          </template>
          <template #dropdown>
            <el-dropdown-menu class="btc-table-toolbar__dropdown">
              <el-dropdown-item
                v-for="option in sizeDropdownOptions"
                :key="option.value"
                :command="option.value"
                :class="{ 'is-selected': option.value === currentSize }"
              >
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <BtcTableButton
          v-else
          class="btc-table-toolbar__icon-btn"
          :config="sizeButton"
        />
      </template>

      <el-popover
        v-if="items.has('columns') && columnsButton && resolvedColumnOptions.length"
        placement="bottom"
        trigger="click"
        :width="220"
      >
        <template #reference>
          <BtcTableButton
            class="btc-table-toolbar__icon-btn"
            :config="columnsButton"
          />
        </template>
        <div class="btc-table-toolbar__columns">
          <el-checkbox
            v-for="option in resolvedColumnOptions"
            :key="option.key"
            :model-value="option.checked"
            :disabled="option.disabled"
            :id="`btc-table-column-${option.key}-${instanceId}`"
            :name="`btc-table-column-${option.key}-${instanceId}`"
            @change="(value: unknown) => handleColumnVisibility(option.key, value)"
          >
            {{ option.label }}
          </el-checkbox>
        </div>
      </el-popover>

      <el-popover
        v-if="items.has('style') && styleButton"
        placement="bottom"
        trigger="click"
      >
        <template #reference>
          <BtcTableButton
            class="btc-table-toolbar__icon-btn"
            :config="styleButton"
          />
        </template>
        <div class="btc-table-toolbar__style">
        <el-checkbox
          :model-value="currentStripe"
          :id="`btc-table-style-stripe-${instanceId}`"
          :name="`btc-table-style-stripe-${instanceId}`"
          @change="(value: unknown) => handleStripeChange(value === true)"
        >
          {{ t('btc.table.style.zebra') }}
        </el-checkbox>
        <el-checkbox
          :model-value="currentHeaderBackground"
          :id="`btc-table-style-header-${instanceId}`"
          :name="`btc-table-style-header-${instanceId}`"
          @change="(value: unknown) => handleHeaderBackgroundChange(value === true)"
        >
          {{ t('btc.table.style.headerBackground') }}
        </el-checkbox>
        <el-checkbox
          :model-value="currentTagRound"
          :id="`btc-table-style-tag-round-${instanceId}`"
          :name="`btc-table-style-tag-round-${instanceId}`"
          @change="(value: unknown) => handleTagRoundChange(value === true)"
        >
          {{ t('btc.table.style.tagRound') }}
        </el-checkbox>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  inject,
  toValue,
  unref,
} from 'vue';
import { useI18n } from '@btc/shared-core';
import { useCrudLayout } from '../context/layout';
import BtcTableButton from '../../components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '../../components/basic/btc-table-button/types';

// 生成唯一实例 ID，避免多个工具栏实例的 checkbox ID 冲突
// 使用时间戳和随机数确保每个实例都有唯一的 ID
const instanceId = `toolbar-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const props = defineProps<{
  binding: any | null;
}>();

const { t } = useI18n();
const layout = useCrudLayout();
const inlineBinding = inject<any>('btc-crud-toolbar-binding', null);

const binding = computed(() => {
  const source = props.binding ?? inlineBinding;
  if (!source) return null;
  return toValue(source) ?? null;
});

const resolveBindingProp = <T,>(prop: unknown, fallback: T): T => {
  if (prop === undefined || prop === null) return fallback;
  try {
    // 优先使用 unref 解包 ref/computed ref
    let value = unref(prop as any);
    // 如果 unref 返回的仍然是对象（可能是嵌套的 ref），尝试再次解包
    if (value && typeof value === 'object' && 'value' in value && typeof (value as any).value !== 'function') {
      value = (value as any).value;
    }
    return value === undefined || value === null ? fallback : value;
  } catch (e) {
    // 如果 unref 失败，尝试使用 toValue
    try {
      let value = toValue(prop as any);
      // 如果 toValue 返回的仍然是对象，尝试访问 .value
      if (value && typeof value === 'object' && 'value' in value && typeof (value as any).value !== 'function') {
        value = (value as any).value;
      }
      return value === undefined || value === null ? fallback : value;
    } catch {
      // 最后尝试直接访问 .value 属性
      if (prop && typeof prop === 'object' && 'value' in prop && typeof (prop as any).value !== 'function') {
        const value = (prop as any).value;
        return value === undefined || value === null ? fallback : value;
      }
      return fallback;
    }
  }
};

const toolbarRef = ref<HTMLElement | null>(null);

const visible = computed(() => {
  const bindingValue = binding.value;
  if (!bindingValue) return false;
  if ('visible' in bindingValue) {
    const resolved = resolveBindingProp<boolean>(bindingValue.visible, true);
    return resolved !== false;
  }
  return true;
});

const items = computed<Set<string>>(() => {
  const bindingValue = binding.value;
  if (!bindingValue) return new Set();
  const raw = resolveBindingProp<Set<string> | Iterable<string>>(bindingValue.items, new Set<string>());
  return raw instanceof Set ? raw : new Set(raw ?? []);
});

const resolvedColumnOptions = computed(
  () => resolveBindingProp<any[]>(binding.value?.columnOptions, []) ?? [],
);
const resolvedSizeButtonConfig = computed(
  () => resolveBindingProp(binding.value?.sizeButtonConfig, null),
);
const resolvedColumnsButtonConfig = computed(
  () => resolveBindingProp(binding.value?.columnsButtonConfig, null),
);
const resolvedStyleButtonConfig = computed(
  () => resolveBindingProp(binding.value?.styleButtonConfig, null),
);
const isSizeControlled = computed(
  () => resolveBindingProp<boolean>(binding.value?.isSizeControlled, false),
);
const isStripeControlled = computed(
  () => resolveBindingProp<boolean>(binding.value?.isStripeControlled, false),
);
const isBorderControlled = computed(
  () => resolveBindingProp<boolean>(binding.value?.isBorderControlled, false),
);
const isHeaderBackgroundControlled = computed(
  () => resolveBindingProp<boolean>(binding.value?.isHeaderBackgroundControlled, false),
);

const toClassArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.slice() as string[];
  return [value as string];
};

const normalizeToolbarConfig = (
  config: any,
  fallback: { icon: string; tooltip: string | (() => string); type?: BtcTableButtonConfig['type']; size?: number },
): BtcTableButtonConfig | null => {
  const source = config ?? {};
  const icon = source.icon ?? fallback.icon;
  if (!icon) return null;
  const tooltip = source.tooltip ?? fallback.tooltip;
  const type = source.type ?? fallback.type ?? 'default';
  const size = source.size ?? fallback.size ?? 20;
  const disabled = source.disabled ?? false;
  const classList = toClassArray(source.class);
  if (!classList.includes('btc-table-toolbar__icon')) {
    classList.push('btc-table-toolbar__icon');
  }

  const normalized: BtcTableButtonConfig = {
    icon,
    tooltip,
    type,
    size,
    disabled,
    onClick: source.onClick,
    badge: source.badge,
    ariaLabel: source.ariaLabel,
  };

  if (classList.length) {
    normalized.class = classList;
  }

  if (!normalized.ariaLabel && typeof tooltip === 'string') {
    normalized.ariaLabel = tooltip;
  }

  return normalized;
};

const sizeButton = computed(() => {
  const normalized = normalizeToolbarConfig(resolvedSizeButtonConfig.value, {
    icon: 'table-density',
    tooltip: () => t('btc.table.toolbar.size'),
    type: 'primary',
    size: 20,
  });
  if (!normalized) return null;
  normalized.disabled = Boolean(normalized.disabled || isSizeControlled.value);
  return normalized;
});

const columnsButton = computed(() =>
  normalizeToolbarConfig(resolvedColumnsButtonConfig.value, {
    icon: 'table-columns',
    tooltip: () => t('btc.table.toolbar.columns'),
    type: 'primary',
    size: 20,
  }),
);

const styleButton = computed(() =>
  normalizeToolbarConfig(resolvedStyleButtonConfig.value, {
    icon: 'table-style',
    tooltip: () => t('btc.table.toolbar.style'),
    type: 'primary',
    size: 20,
  }),
);

const currentSize = computed({
  get: () => resolveBindingProp<string>(binding.value?.currentSize, 'default'),
  set: (val) => {
    const target = binding.value?.currentSize;
    if (target && typeof target === 'object' && 'value' in target) {
      target.value = val;
    }
  },
});
const currentStripe = computed({
  get: () => resolveBindingProp<boolean>(binding.value?.currentStripe, false),
  set: (val) => {
    const target = binding.value?.currentStripe;
    if (target && typeof target === 'object' && 'value' in target) {
      target.value = val;
    }
  },
});
const currentBorder = computed({
  get: () => resolveBindingProp<boolean>(binding.value?.currentBorder, true),
  set: (val) => {
    const target = binding.value?.currentBorder;
    if (target && typeof target === 'object' && 'value' in target) {
      target.value = val;
    }
  },
});
const currentHeaderBackground = computed({
  get: () => resolveBindingProp<boolean>(binding.value?.currentHeaderBackground, true),
  set: (val) => {
    const target = binding.value?.currentHeaderBackground;
    if (target && typeof target === 'object' && 'value' in target) {
      target.value = val;
    }
  },
});
const currentTagRound = computed({
  get: () => resolveBindingProp<boolean>(binding.value?.currentTagRound, false),
  set: (val) => {
    const target = binding.value?.currentTagRound;
    if (target && typeof target === 'object' && 'value' in target) {
      target.value = val;
    }
  },
});

const sizeDropdownOptions = computed(() => [
  { value: 'small', label: t('btc.table.size.small') },
  { value: 'default', label: t('btc.table.size.default') },
  { value: 'large', label: t('btc.table.size.large') },
]);

const handleSizeCommand = (command: string) => {
  binding.value?.handleSizeCommand?.(command);
};

const handleColumnVisibility = (key: string, value: unknown) => {
  binding.value?.handleColumnVisibility?.(key, value);
};

const handleStripeChange = (val: boolean) => {
  if (binding.value?.setStripe) {
    binding.value.setStripe(val);
  } else if (binding.value?.currentStripe && 'value' in binding.value.currentStripe) {
    binding.value.currentStripe.value = val;
  }
};

const handleBorderChange = (val: boolean) => {
  if (binding.value?.setBorder) {
    binding.value.setBorder(val);
  } else if (binding.value?.currentBorder && 'value' in binding.value.currentBorder) {
    binding.value.currentBorder.value = val;
  }
};

const handleHeaderBackgroundChange = (val: boolean) => {
  if (binding.value?.setHeaderBackground) {
    binding.value.setHeaderBackground(val);
  } else if (binding.value?.currentHeaderBackground && 'value' in binding.value.currentHeaderBackground) {
    binding.value.currentHeaderBackground.value = val;
  }
};

const handleTagRoundChange = (val: boolean) => {
  if (binding.value?.setTagRound) {
    binding.value.setTagRound(val);
  } else if (binding.value?.currentTagRound && 'value' in binding.value.currentTagRound) {
    binding.value.currentTagRound.value = val;
  }
};

const ensureRegistered = () => {
  if (!layout || !toolbarRef.value) return;
  layout.registerTrailing('toolbar', visible.value ? toolbarRef.value : null);
};

onMounted(() => {
  ensureRegistered();
});

onBeforeUnmount(() => {
  layout?.registerTrailing('toolbar', null);
});

watch(
  () => visible.value,
  () => {
    ensureRegistered();
  },
  { immediate: true },
);
</script>

