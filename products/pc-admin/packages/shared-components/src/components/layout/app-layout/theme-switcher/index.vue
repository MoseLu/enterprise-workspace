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
import type { ThemeConfig } from '@btc/shared-core';
import { BtcIconButton, BtcMessage } from '@btc/shared-components';

// 以下变量在模板中使用，TypeScript 无法识别模板使用，因此显式导出以确保被识别
// Check, BtcIconButton, allThemes, openDrawer, isCurrentTheme, handleThemeClick, handleDarkToggle

const { t } = useI18n();
const theme = useThemePlugin();


const drawerVisible = ref(false);
// 初始化自定义颜色：如果是自定义主题则使用自定义颜色，否则为空字符串（不设置默认值）
const savedCustomColor = theme.currentTheme.value?.name === 'custom'
  ? theme.currentTheme.value.color
  : '';
const customColor = ref(savedCustomColor);

// 自定义主题配置
const customTheme = computed<ThemeConfig>(() => ({
  name: 'custom',
  label: 'theme.presets.custom',
  color: customColor.value || '#409eff', // 仅用于显示，实际使用时不依赖此值
}));

// 合并所有主题，自定义主题放在最后
// allThemes 在模板中使用（第34行）
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

// openDrawer 在模板中使用（第7行）
function openDrawer() {
  drawerVisible.value = true;
  // 如果当前是自定义主题，同步自定义颜色
  if (theme.currentTheme.value?.name === 'custom') {
    customColor.value = theme.currentTheme.value.color;
  }
}

// 判断是否是当前主题
// isCurrentTheme 在模板中使用（第56、72行）
function isCurrentTheme(themeConfig: ThemeConfig): boolean {
  const current = theme.currentTheme.value;
  if (!current) return false;

  if (themeConfig.name === 'custom') {
    return current.name === 'custom';
  }

  return themeConfig.color === current.color;
}

// 处理预设主题点击
// handleThemeClick 在模板中使用（第67行）
function handleThemeClick(themeConfig: ThemeConfig) {
  // 点击预设主题，直接切换（不改变 customColor）
  theme.switchTheme(themeConfig);
  BtcMessage.success(`${t('theme.switched')}: ${t(themeConfig.label)}`);
}

// handleDarkToggle 在模板中使用（第16行）
function handleDarkToggle(event?: MouseEvent) {
  console.info('[ThemeSwitcher] handleDarkToggle 被调用', {
    hasEvent: !!event,
    currentIsDark: theme?.isDark?.value,
    timestamp: new Date().toISOString()
  });

  if (!event) {
    // 如果没有事件，直接调用（不带动画）
    if (theme?.toggleDark) {
      console.info('[ThemeSwitcher] 无事件，直接调用 toggleDark');
      theme.toggleDark();
    }
    return;
  }

  if (!theme || !theme.toggleDark) {
    console.warn('[ThemeSwitcher] theme 或 toggleDark 不存在', { theme: !!theme, toggleDark: !!theme?.toggleDark });
    return;
  }

  console.info('[ThemeSwitcher] 调用 theme.toggleDark(event)');
  theme.toggleDark(event);

  // 延迟检查状态变化
  setTimeout(() => {
    console.info('[ThemeSwitcher] toggleDark 执行后状态', {
      isDark: theme?.isDark?.value,
      htmlHasDark: document.documentElement.classList.contains('dark'),
      timestamp: new Date().toISOString()
    });
  }, 100);
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

