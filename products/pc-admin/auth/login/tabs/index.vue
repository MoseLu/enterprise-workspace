<template>
  <div
    v-if="currentLoginMode !== 'qr'"
    ref="tabsRef"
    class="login-tabs"
    role="tablist"
    aria-label="login-tabs"
  >
    <div class="tabs-container">
      <button
        ref="tabAccountRef"
        class="tab"
        :class="{ active: currentLoginMode === 'password' }"
        role="tab"
        :aria-selected="currentLoginMode === 'password' ? 'true' : 'false'"
        @click="handleTabClick('password')"
      >
        {{ props.t('账号登录') }}
      </button>
      <button
        ref="tabPhoneRef"
        class="tab"
        :class="{ active: currentLoginMode === 'sms' }"
        role="tab"
        :aria-selected="currentLoginMode === 'sms' ? 'true' : 'false'"
        @click="handleTabClick('sms')"
      >
        {{ props.t('手机号登录') }}
      </button>
      <span ref="inkRef" class="ink-bar" aria-hidden="true"></span>
    </div>

    <!-- 前往注册链接 -->
    <div class="register-link">
      <a href="/register" class="register-link-a">
        {{ props.t('前往注册') }}
        <el-icon class="arrow-right">
          <ArrowRight />
        </el-icon>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';

defineOptions({
  name: 'LoginTabs'
});

const props = defineProps<{
  currentLoginMode: string;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  'tab-change': [mode: string];
  'go-to-register': [];
}>();

const router = useRouter();

// 模板引用
const tabsRef = ref<HTMLElement>();
const tabAccountRef = ref<HTMLElement>();
const tabPhoneRef = ref<HTMLElement>();
const inkRef = ref<HTMLElement>();

// 处理标签页点击
const handleTabClick = (mode: string) => {
  emit('tab-change', mode);
};

// 处理前往注册
const handleGoToRegister = () => {
  emit('go-to-register');
  router.push('/register');
};

// 更新下划线位置
const updateInkBar = async () => {
  await nextTick();

  if (!inkRef.value || !tabsRef.value) return;

  const activeTab = props.currentLoginMode === 'password' ? tabAccountRef.value : tabPhoneRef.value;

  if (activeTab) {
    const tabRect = activeTab.getBoundingClientRect();
    const tabsRect = tabsRef.value.getBoundingClientRect();

    const left = tabRect.left - tabsRect.left;
    const width = tabRect.width;

    inkRef.value.style.left = `${left}px`;
    inkRef.value.style.width = `${width}px`;
    inkRef.value.style.transform = `translateX(0)`;
    inkRef.value.style.opacity = '1';
  }
};

// 监听 currentLoginMode 变化
watch(() => props.currentLoginMode, () => {
  updateInkBar();
});

// 组件挂载后初始化下划线位置
onMounted(() => {
  updateInkBar();
});
</script>

<style lang="scss" scoped>
.login-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .tabs-container {
    position: relative;
    display: flex;

    .tab {
      position: relative;
      padding: 6px 0;
      border: none;
      background: transparent;
      color: var(--el-text-color-regular);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s ease;
      white-space: nowrap;

      &:hover {
        color: var(--el-color-primary);
      }

      &.active {
        color: var(--el-color-primary);
        font-weight: 700;
      }
    }

    .ink-bar {
      position: absolute;
      bottom: 2px;
      left: 0;
      height: 2px;
      background: var(--el-color-primary);
      border-radius: 2px;
      width: 0;
      transform: translateX(0);
      opacity: 0;
      transform-origin: center;
      transition: transform 0.2s ease, width 0.2s ease;
      pointer-events: none;
      display: block;
    }
  }

  .register-link {
    .register-link-a {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--el-color-primary);
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary-light-3);
      }

      .arrow-right {
        font-size: 12px;
        transition: transform 0.2s;
      }

      &:hover .arrow-right {
        transform: translateX(2px);
      }
    }
  }
}
</style>
