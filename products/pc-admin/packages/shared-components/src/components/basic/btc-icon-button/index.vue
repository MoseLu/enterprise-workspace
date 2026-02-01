<template>
  <!-- Popover 模式（消息、通知） - 暂时禁用，避免 getBoundingClientRect 错误 -->
  <!-- <el-popover
    v-if="config.popover"
    v-model:visible="popoverVisible"
    :placement="config.popover.placement || 'bottom-end'"
    :width="config.popover.width || 360"
    :offset="10"
    :popper-class="config.popover.popperClass"
    trigger="click"
  >
    <template #reference>
      <IconButtonInner :config="config" />
    </template>
    <component
      :is="config.popover.component"
      v-if="popoverVisible"
      @close="handlePopoverClose"
    />
  </el-popover> -->
  <!-- 临时替代方案：直接显示组件内容 -->
  <div v-if="config.popover" @click="popoverVisible = !popoverVisible">
    <IconButtonInner :config="config" />
    <div v-if="popoverVisible" class="btc-icon-button__popover-fallback">
      <component
        :is="config.popover.component"
        @close="handlePopoverClose"
      />
    </div>
  </div>

  <!-- Dropdown 模式（关闭其他标签页） -->
  <el-dropdown
    v-else-if="config.dropdown"
    trigger="click"
    :popper-class="config.dropdown.popperClass"
    @command="handleDropdownCommand"
  >
    <template #default>
      <IconButtonInner :config="config" />
    </template>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in config.dropdown.items"
          :key="item.command"
          :command="item.command"
          :disabled="item.disabled"
        >
          <span class="btc-icon-button__dropdown-item">
            <BtcSvg
              v-if="resolveDropdownIcon(item.icon)"
              :name="resolveDropdownIcon(item.icon)"
              class="btc-icon-button__dropdown-icon"
            />
            <span class="btc-icon-button__dropdown-label">{{ item.label }}</span>
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 普通模式 -->
  <IconButtonInner v-else :config="config" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcIconButton'
});

import { ref } from 'vue';
import type { IconButtonConfig } from './types';
import IconButtonInner from './icon-button-inner.vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';

const props = defineProps<{
  config: IconButtonConfig;
}>();

const popoverVisible = ref(false);

const handlePopoverClose = () => {
  popoverVisible.value = false;
};

const handleDropdownCommand = (command: string) => {
  props.config.dropdown?.onCommand(command);
};

const resolveDropdownIcon = (icon?: string | (() => string)) => {
  if (!icon) return '';
  if (typeof icon === 'function') {
    return icon();
  }
  return icon;
};
</script>

<style lang="scss" scoped>
// 样式由 IconButtonInner 组件提供
</style>

