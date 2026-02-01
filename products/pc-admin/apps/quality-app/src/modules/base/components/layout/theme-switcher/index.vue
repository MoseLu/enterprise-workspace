<template>
  <!-- 偏好设置按钮 -->
  <BtcIconButton
    :config="{
      icon: 'theme',
      tooltip: t('common.tooltip.theme_settings'),
      onClick: openDrawer
    }"
  />

  <!-- 暗黑模式切换 -->
  <BtcIconButton
    :config="{
      icon: () => theme.isDark.value ? 'light' : 'dark',
      tooltip: t('common.tooltip.toggle_dark'),
      onClick: handleDarkToggle,
      class: 'ml-[10px]'
    }"
  />

      <!-- 偏好设置抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="t('theme.title')"
      size="420px"
      append-to-body
    >
      <div class="preferences-drawer">
        <el-form label-position="top">
          <!-- 预设主题（包含自定义主题） -->
          <el-form-item :label="t('theme.presets')">
            <ul class="theme-presets">
              <li
                v-for="themePreset in allThemes"
                :key="themePreset.name"
              >
                <!-- 自定义主题：点击后弹出颜色选择器弹窗 - 暂时移除 -->
                <!-- <template v-if="themePreset.name === 'custom'">
                  <BtcColorPicker
                    v-model="customColor"
                    :teleported="false"
                    @show="handleCustomThemeClick"
                    @hide="handleColorPickerHide"
                    @change="handleColorChange"
                    @active-change="handleActiveColorChange"
                    @confirm="handleConfirmColor"
                    @clear="handleClearColor"
                  >
                    <template #reference>
                      <div class="theme-item-wrapper">
                        <div
                          class="color-box"
                          :class="{ 'is-custom': !customColorDisplay }"
                          :style="customColorDisplay ? { backgroundColor: customColorDisplay } : {}"
                        >
                          <el-icon v-if="isCurrentTheme(themePreset)">
                            <Check />
                          </el-icon>
                        </div>
                        <span>{{ t(themePreset.label) }}</span>
                      </div>
                    </template>
                  </BtcColorPicker>
                </template> -->
                <!-- 预设主题：直接点击切换 -->
                <template v-else>
                  <div class="theme-item-wrapper" @click="handleThemeClick(themePreset)">
                <div
                  class="color-box"
                      :style="{ backgroundColor: themePreset.color }"
                >
                  <el-icon v-if="isCurrentTheme(themePreset)">
                    <Check />
                  </el-icon>
                </div>
                <span>{{ t(themePreset.label) }}</span>
                  </div>
                </template>
              </li>
            </ul>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutThemeSwitcher'
});

import { ref, computed, watch } from 'vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import { Check } from '@element-plus/icons-vue';
import { useMessage } from '@/utils/use-message';
import type { ThemeConfig } from '@btc/shared-core';
// import { BtcColorPicker, BtcIconButton } from '@btc/shared-components';
import { BtcIconButton } from '@btc/shared-components';

const { t } = useI18n();
const theme = useThemePlugin();
const message = useMessage();


const drawerVisible = ref(false);
// 初始化自定义颜色：如果是自定义主题则使用自定义颜色，否则为空字符串（不设置默认值）
const savedCustomColor = theme.currentTheme.value?.name === 'custom'
  ? theme.currentTheme.value.color
  : '';
const customColor = ref(savedCustomColor);
// 保存打开弹窗时的原始颜色值和主题状态，用于关闭时恢复
const originalColor = ref<string | null>(null);
const originalTheme = ref<ThemeConfig | null>(null);
// 标记是否已确认（确认后关闭弹窗时不再恢复）
const isConfirmed = ref(false);

// 自定义主题配置
const customTheme = computed<ThemeConfig>(() => ({
  name: 'custom',
  label: 'theme.presets.custom',
  color: customColor.value || '#409eff', // 仅用于显示，实际使用时不依赖此值
}));

// 合并所有主题，自定义主题放在最后
const allThemes = computed(() => {
  const currentCustomColor = theme.currentTheme.value?.name === 'custom'
    ? theme.currentTheme.value.color
    : customColor.value || '#409eff'; // 仅用于显示

  return [
    ...theme.THEME_PRESETS,
    {
      ...customTheme.value,
      color: currentCustomColor,
    },
  ];
});

// 监听主题变化，同步自定义颜色（仅当是自定义主题时才更新）
watch(() => theme.currentTheme.value, (newTheme) => {
  if (newTheme && newTheme.name === 'custom') {
    customColor.value = newTheme.color;
  }
});

function openDrawer() {
  drawerVisible.value = true;
  // 如果当前是自定义主题，同步自定义颜色
  if (theme.currentTheme.value?.name === 'custom') {
    customColor.value = theme.currentTheme.value.color;
  }
}

// 获取自定义颜色的显示值
// 如果当前是自定义主题，显示主题颜色；否则返回空字符串（显示彩虹渐变）
const customColorDisplay = computed(() => {
  if (theme.currentTheme.value?.name === 'custom') {
    return theme.currentTheme.value.color || '';
  }
  return '';
});

// 判断是否是当前主题
function isCurrentTheme(themeConfig: ThemeConfig): boolean {
  const current = theme.currentTheme.value;
  if (!current) return false;

  if (themeConfig.name === 'custom') {
    return current.name === 'custom';
  }

  return themeConfig.color === current.color;
}

// 处理自定义主题点击（颜色选择器打开时）
function handleCustomThemeClick() {
  // 保存打开时的原始颜色值和主题状态
  originalColor.value = customColor.value || null;
  originalTheme.value = theme.currentTheme.value ? { ...theme.currentTheme.value } : null;
  isConfirmed.value = false;

  // 确保如果有当前主题颜色，同步到 customColor（用于显示在输入框中）
  if (theme.currentTheme.value?.name === 'custom' && theme.currentTheme.value.color) {
    customColor.value = theme.currentTheme.value.color;
    originalColor.value = customColor.value;
  }

  // 如果当前有自定义颜色，临时切换到自定义主题（用于预览）
  if (customColor.value) {
    theme.currentTheme.value = {
      name: 'custom',
      label: 'theme.presets.custom',
      color: customColor.value,
    };
    theme.setThemeColor(customColor.value, theme.isDark.value);
    if (document.body) {
      document.body.className = 'theme-custom';
    }
  }
}


// 处理预设主题点击
function handleThemeClick(themeConfig: ThemeConfig) {
  // 点击预设主题，直接切换（不改变 customColor）
  theme.switchTheme(themeConfig);
  message.success(`${t('theme.switched')}: ${t(themeConfig.label)}`);
}

// 处理颜色变化（点击预设颜色或输入框变化时触发）
function handleColorChange(color: string | null) {
  // 实时更新主题颜色（点击预设颜色时也需要实时更新）
  updateThemeColorPreview(color);
}

// 统一的主题颜色预览更新函数
function updateThemeColorPreview(color: string | null) {
  if (color !== null && color !== undefined && color !== '') {
    // 始终创建新对象以确保响应式更新
    const newTheme: ThemeConfig = {
      name: 'custom',
      label: 'theme.presets.custom',
      color: color,
    };
    // 直接替换整个 ref 的值以触发响应式更新
    theme.currentTheme.value = newTheme;
    // 更新全局主题色
    theme.setThemeColor(color, theme.isDark.value);
    if (document.body) {
      document.body.className = 'theme-custom';
    }
  }
}

// 处理清空颜色
function handleClearColor() {
  customColor.value = '';
  // 清空时恢复彩虹渐变（将主题颜色设为空）
  theme.currentTheme.value = {
    name: 'custom',
    label: 'theme.presets.custom',
    color: '',
  };
}

// 处理确认颜色
function handleConfirmColor(color: string | null) {
  // 标记已确认，避免在 hide 时恢复
  isConfirmed.value = true;

  // 更新 customColor（即使是空字符串也要更新）
  customColor.value = color || '';

  // 如果有颜色，切换到自定义主题并保存
  if (color) {
    // 使用 switchTheme 确保所有状态都正确更新（包括 document.body.className）
    const customThemeConfig: ThemeConfig = {
      name: 'custom',
      label: 'theme.presets.custom',
      color: color,
    };
    theme.switchTheme(customThemeConfig);
    message.success(`${t('theme.switched')}: ${t('theme.presets.custom')}`);
  } else {
    // 如果没有颜色，恢复原始主题（如果有的话）
    // 这里可以根据需求决定是否恢复到之前的主题
  }

  // 重置状态
  originalColor.value = null;
}

// 处理活动颜色变化（实时预览，拖拽时触发）
function handleActiveColorChange(color: string | null) {
  // 使用统一的更新函数
  updateThemeColorPreview(color);
}

// 处理颜色选择器关闭
function handleColorPickerHide() {
  // 如果没有确认，恢复原始状态
  if (!isConfirmed.value && originalTheme.value) {
    // 恢复 customColor 到原始值
    customColor.value = originalColor.value || '';

    // 恢复主题状态（从保存的原始主题状态恢复）
    theme.currentTheme.value = { ...originalTheme.value };
    theme.setThemeColor(originalTheme.value.color, theme.isDark.value);
    if (document.body) {
      document.body.className = `theme-${originalTheme.value.name}`;
    }
  }

  // 重置状态
  originalColor.value = null;
  originalTheme.value = null;
  isConfirmed.value = false;
}

function handleDarkToggle(event?: MouseEvent) {
  if (!event) {
    // 如果没有事件，直接调用（不带动画）
    if (theme?.toggleDark) {
      theme.toggleDark();
    }
    return;
  }
  
  if (!theme || !theme.toggleDark) {
    return;
  }
  
  theme.toggleDark(event);
}
</script>

<style lang="scss">
// 偏好设置抽屉样式
.preferences-drawer {
  padding: 0 2px;
}

// 主题预设列表样式
.theme-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: opacity 0.2s;
    // 设置固定宽度，确保相同位置垂直对齐（宽度需要能容纳圆圈和文字）
    flex: 0 0 70px;
  }

  .theme-item-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: 100%;

    &:hover {
      opacity: 0.7;
    }

    .color-box {
      width: 28px;
      height: 28px;
      border-radius: 50%; // 圆形
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
      box-shadow: 0 2px 8px var(--el-box-shadow-light);
      position: relative;
      overflow: hidden;

      .el-icon {
        color: #fff;
        font-size: 14px;
        z-index: 1;
      }

      // 自定义主题：静态圆形彩虹色渐变（未选择颜色时）
      &.is-custom {
        background: conic-gradient(
          from 0deg,
          #ff0000,
          #ff7f00,
          #ffff00,
          #00ff00,
          #0000ff,
          #4b0082,
          #9400d3,
          #ff0000
        );
      }
    }

    span {
      font-size: 12px;
      color: var(--el-text-color-regular);
      white-space: nowrap; // 防止文本换行
      overflow: hidden;
      text-overflow: ellipsis; // 如果文本过长，显示省略号
      max-width: 100%;
    }
  }
}
</style>

