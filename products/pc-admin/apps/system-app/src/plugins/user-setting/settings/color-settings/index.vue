<template>
  <div class="color-settings">
    <SectionTitle :title="t('setting.color.title') || 'Theme Color'" style="margin-top: 40px" />
    <div class="main-color-wrap">
      <div class="offset">
        <!-- 预设主题颜色 -->
        <div
          v-for="(preset, index) in themePresets"
          :key="preset.name || `preset-${index}`"
          :style="{ background: `${preset.color} !important` }"
          @click="handlePresetClick(preset)"
          class="color-item"
        >
          <el-icon v-show="isCurrentPreset(preset)">
            <Check />
          </el-icon>
        </div>
        <!-- 自定义颜色选择器 - 暂时移除 -->
        <!-- <BtcColorPicker
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
            <div
              class="color-item custom-color"
              :class="{ 'is-custom': !customColorDisplay }"
              :style="customColorDisplay ? { backgroundColor: customColorDisplay } : {}"
            >
              <el-icon v-if="isCustomTheme">
                <Check />
              </el-icon>
            </div>
          </template>
        </BtcColorPicker> -->
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Check } from '@element-plus/icons-vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import SectionTitle from '../../components/shared/SectionTitle.vue';
// import BtcColorPicker from '@btc-components/form/btc-color-picker/index.vue';
import { BtcMessage } from '@btc/shared-components';
import '../../settings/color-settings/styles/index.scss';
import type { ThemeConfig } from '@btc/shared-core';

const { t } = useI18n();
const theme = useThemePlugin();

// 初始化自定义颜色：如果是自定义主题则使用自定义颜色，否则为空字符串
const savedCustomColor = theme.currentTheme.value?.name === 'custom'
  ? theme.currentTheme.value.color
  : '';
const customColor = ref(savedCustomColor);

// 保存打开弹窗时的原始颜色值和主题状态，用于关闭时恢复
const originalColor = ref<string | null>(null);
const originalTheme = ref<ThemeConfig | null>(null);
// 标记是否已确认（确认后关闭弹窗时不再恢复）
const isConfirmed = ref(false);

// 获取预设主题列表
const themePresets = computed(() => {
  return theme.THEME_PRESETS || [];
});

// 判断是否是当前预设主题
function isCurrentPreset(preset: ThemeConfig): boolean {
  const current = theme.currentTheme.value;
  if (!current || !preset) return false;
  return preset.name === current.name || preset.color === current.color;
}

// 判断是否是自定义主题
const isCustomTheme = computed(() => {
  return theme.currentTheme.value?.name === 'custom';
});

// 获取自定义颜色的显示值
const customColorDisplay = computed(() => {
  if (theme.currentTheme.value?.name === 'custom') {
    return theme.currentTheme.value.color || '';
  }
  return '';
});

// 处理预设主题点击
function handlePresetClick(preset: ThemeConfig) {
  if (!preset) return;
  theme.switchTheme(preset);
  BtcMessage.success(`${t('theme.switched')}: ${t(preset.label)}`);
}

// 处理自定义主题点击（颜色选择器打开时）
function handleCustomThemeClick() {
  // 保存打开时的原始颜色值和主题状态
  originalColor.value = customColor.value || null;
  originalTheme.value = theme.currentTheme.value ? { ...theme.currentTheme.value } : null;
  isConfirmed.value = false;

  // 确保如果有当前主题颜色，同步到 customColor
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
    document.body.className = 'theme-custom';
  }
}

// 处理颜色变化
function handleColorChange(color: string | null) {
  updateThemeColorPreview(color);
}

// 统一的主题颜色预览更新函数
function updateThemeColorPreview(color: string | null) {
  if (color !== null && color !== undefined && color !== '') {
    const newTheme: ThemeConfig = {
      name: 'custom',
      label: 'theme.presets.custom',
      color: color,
    };
    theme.currentTheme.value = newTheme;
    theme.setThemeColor(color, theme.isDark.value);
    document.body.className = 'theme-custom';
  }
}

// 处理清空颜色
function handleClearColor() {
  customColor.value = '';
  theme.currentTheme.value = {
    name: 'custom',
    label: 'theme.presets.custom',
    color: '',
  };
}

// 处理确认颜色
function handleConfirmColor(color: string | null) {
  isConfirmed.value = true;
  customColor.value = color || '';

  if (color) {
    const customThemeConfig: ThemeConfig = {
      name: 'custom',
      label: 'theme.presets.custom',
      color: color,
    };
    theme.switchTheme(customThemeConfig);
    BtcMessage.success(`${t('theme.switched')}: ${t('theme.presets.custom')}`);
  }

  originalColor.value = null;
}

// 处理活动颜色变化（实时预览）
function handleActiveColorChange(color: string | null) {
  updateThemeColorPreview(color);
}

// 处理颜色选择器关闭
function handleColorPickerHide() {
  if (!isConfirmed.value && originalTheme.value) {
    customColor.value = originalColor.value || '';
    theme.currentTheme.value = { ...originalTheme.value };
    theme.setThemeColor(originalTheme.value.color, theme.isDark.value);
    document.body.className = `theme-${originalTheme.value.name}`;
  }

  originalColor.value = null;
  originalTheme.value = null;
  isConfirmed.value = false;
}

// 监听主题变化，同步自定义颜色
watch(() => theme.currentTheme.value, (newTheme) => {
  if (newTheme && newTheme.name === 'custom') {
    customColor.value = newTheme.color;
  }
});

</script>

