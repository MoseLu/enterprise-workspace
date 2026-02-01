<template>
  <!--
    关键：在微前端（qiankun）样式隔离场景下，Teleport 到 body 可能导致样式无法命中（选择器被自动加上容器作用域）。
    因此优先挂载到 layout-app 根容器内，保证样式正常；不存在时再回退到 body。
  -->
  <teleport :to="teleportTarget">
    <transition name="preferences-slide">
      <section
        v-if="visible"
        ref="drawerRef"
        class="user-preferences-panel"
        role="dialog"
        aria-modal="false"
        aria-label="User preferences"
  >
    <div class="preferences-drawer">
      <!-- 头部关闭按钮 -->
      <SettingHeader @close="closeDrawer" />

      <!-- 主题风格（切换深浅主题） -->
      <ThemeStyleSettings />

      <!-- 全局风格套件 -->
      <StylePresetSettings />

      <!-- 菜单布局 -->
      <MenuLayoutSettings />

      <!-- 菜单风格 -->
      <MenuStyleSettings />

      <!-- 系统主题色 -->
      <ColorSettings />

      <!-- 按钮风格 -->
      <ButtonStyleSettings />

      <!-- Loading 样式 -->
      <LoadingStyleSettings />

      <!-- 盒子样式 -->
      <BoxStyleSettings />

      <!-- 容器宽度 -->
      <ContainerWidthSettings />

      <!-- 基础设置 -->
      <BasicSettings />
    </div>
      </section>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
// watch 未使用，已移除
import SettingHeader from './shared/SettingHeader.vue';
import MenuLayoutSettings from '../settings/menu-layout/index.vue';
import MenuStyleSettings from '../settings/menu-style/index.vue';
import ThemeStyleSettings from '../settings/theme-style/index.vue';
import StylePresetSettings from '../settings/style-preset/index.vue';
import ColorSettings from '../settings/color-settings/index.vue';
import ButtonStyleSettings from '../settings/button-style/index.vue';
import LoadingStyleSettings from '../settings/loading-style/index.vue';
import BoxStyleSettings from '../settings/box-style/index.vue';
import ContainerWidthSettings from '../settings/container-width/index.vue';
import BasicSettings from '../settings/basic-settings/index.vue';
import '../styles/index.scss';

defineOptions({
  name: 'BtcUserSettingDrawer'
});

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const drawerRef = ref<HTMLElement | null>(null);
const teleportTarget = ref<string | HTMLElement>('body');

const closeDrawer = () => {
  visible.value = false;
};

const handleGlobalClick = (event: MouseEvent) => {
  if (!visible.value) {
    return;
  }

  const drawerEl = drawerRef.value;
  if (!drawerEl) {
    return;
  }

  // 检查点击是否在抽屉内部
  const isClickInside = drawerEl.contains(event.target as Node);

  // 检查点击是否来自偏好设置按钮（避免点击按钮时立即关闭）
  const target = event.target as HTMLElement;
  const isFromButton = target.closest('.btc-user-setting-toolbar') ||
                       target.closest('.btc-icon-button') ||
                       target.closest('[data-preference-button]');

  if (isFromButton) {
    return;
  }

  if (!isClickInside) {
    closeDrawer();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!visible.value) {
    return;
  }
  if (event.key === 'Escape') {
    closeDrawer();
  }
};

const resolveTeleportTarget = (): string | HTMLElement => {
  // 关键：优先挂载到 layout-app 容器中，避免 qiankun 样式隔离导致样式丢失
  // 使用 nextTick 确保 DOM 已经准备好
  try {
    if (typeof document !== 'undefined') {
      const layoutApp = document.querySelector('#layout-app');
      if (layoutApp) {
        return layoutApp as HTMLElement;
      }
      const app = document.querySelector('#app');
      if (app) {
        return app as HTMLElement;
      }
      // 确保 body 存在
      if (document.body) {
        return 'body';
      }
    }
  } catch (error) {
    // 静默失败，回退到 body
  }
  // 默认回退到 body
  return 'body';
};

onMounted(() => {
  // 使用 nextTick 确保 DOM 已经准备好，避免 teleport 目标不存在导致错误
  nextTick(() => {
    const target = resolveTeleportTarget();
    teleportTarget.value = target;

    // 延迟添加点击监听器，避免打开抽屉时的点击事件立即触发关闭
    // 使用 setTimeout 确保点击事件已经处理完毕
    setTimeout(() => {
      document.addEventListener('click', handleGlobalClick, true); // 使用捕获阶段
      document.addEventListener('keydown', handleKeydown);
    }, 100);
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

