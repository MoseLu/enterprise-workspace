import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useUser } from '@/composables/useUser';
import { appStorage } from '@/utils/app-storage';

export function useUserInfo() {
  // 用户相关（需要在读取缓存之前初始化）
  const { userInfo: userInfoComputed, getUserInfo } = useUser();

  // 从个人信息服务获取的用户信息
  // 初始化时立即从缓存读取，避免闪烁
  const cachedUser = getUserInfo();
  const cachedAvatar = appStorage.user.getAvatar();
  const cachedName = appStorage.user.getName();

  const profileUserInfo = ref<any>(
    (cachedAvatar || cachedName) ? {
      name: cachedName || cachedUser?.name || '',
      avatar: cachedAvatar || cachedUser?.avatar || '/logo.png',
    } : null
  );

  // 初始化显示名称
  const displayedName = ref(cachedName || cachedUser?.name || '');

  // 打字机效果相关
  const isTyping = ref(false);
  const cursorPosition = ref(0);
  let typingTimer: number | null = null;

  // 监听用户信息更新事件
  const handleUserInfoUpdated = (event: CustomEvent) => {
    const { avatar, name } = event.detail || {};

    // 更新统一存储
    if (avatar) {
      appStorage.user.setAvatar(avatar);
    }
    if (name) {
      appStorage.user.setName(name);
    }

    // 更新 profileUserInfo，触发响应式更新
    if (profileUserInfo.value) {
      profileUserInfo.value = {
        ...profileUserInfo.value,
        ...(avatar && { avatar }),
        ...(name && { name }),
      };
    } else {
      // 如果还没有 profileUserInfo，从缓存和 useUser 获取
      const currentUser = getUserInfo();
      const cachedAvatar = appStorage.user.getAvatar();
      const cachedName = appStorage.user.getName();
      profileUserInfo.value = {
        avatar: avatar || cachedAvatar || currentUser?.avatar || '/logo.png',
        name: name || cachedName || currentUser?.name || '',
        position: currentUser?.position || '',
      };
    }

    // 更新显示名称
    if (name) {
      displayedName.value = name;
    }
  };

  // 用户信息（优先从个人信息服务获取，否则从 localStorage 缓存或 useUser 获取，提供默认值）
  const userInfo = computed(() => {
    // 优先使用从个人信息服务获取的数据
    if (profileUserInfo.value) {
      return {
        name: profileUserInfo.value.name || profileUserInfo.value.realName || '',
        position: profileUserInfo.value.position || '',
        avatar: profileUserInfo.value.avatar || '/logo.png',
      };
    }

    // 其次从统一存储获取头像和用户名
    const cachedAvatar = appStorage.user.getAvatar();
    const cachedName = appStorage.user.getName();
    if (cachedAvatar || cachedName) {
      // 从 useUser 获取其他信息（如 position）
      const info = userInfoComputed.value || getUserInfo();
      return {
        name: cachedName || info?.name || info?.username || '',
        position: info?.position || '',
        avatar: cachedAvatar || info?.avatar || '/logo.png',
      };
    }

    // 再次从 useUser 获取
    const info = userInfoComputed.value;
    if (info) {
      return {
        name: info.name || info.username || '',
        position: info.position || '',
        avatar: info.avatar || '/logo.png',
      };
    }

    // 如果没有用户信息，尝试从 localStorage 获取
    const stored = getUserInfo();
    if (stored) {
      return {
        name: stored.name || stored.username || '',
        position: stored.position || '',
        avatar: stored.avatar || '/logo.png',
      };
    }

    // 默认值
    return {
      name: '',
      position: '',
      avatar: '/logo.png',
    };
  });


  // 打字机效果（悬浮时触发）
  const handleNameHover = () => {
    const fullName = userInfo.value.name;
    if (!fullName || isTyping.value) return;

    // 清除之前的定时器
    if (typingTimer) {
      clearInterval(typingTimer);
    }

    // 重置显示
    displayedName.value = '';
    isTyping.value = true;
    cursorPosition.value = 0;

    let index = 0;
    typingTimer = window.setInterval(() => {
      if (index < fullName.length) {
        displayedName.value = fullName.substring(0, index + 1);
        cursorPosition.value = index + 1;
        index++;
      } else {
        // 打字完成，移除光标
        isTyping.value = false;
        cursorPosition.value = 0;
        if (typingTimer) {
          clearInterval(typingTimer);
          typingTimer = null;
        }
      }
    }, 100);
  };

  // 鼠标离开时恢复完整显示
  const handleNameLeave = () => {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    isTyping.value = false;
    cursorPosition.value = 0;
    displayedName.value = userInfo.value.name;
  };

  // 监听用户信息变化，更新显示名称
  watch(() => userInfo.value.name, (newName) => {
    if (!isTyping.value) {
      displayedName.value = newName || '';
    }
  }, { immediate: true });

  // 在组件挂载时监听事件，卸载时移除监听
  onMounted(() => {
    window.addEventListener('userInfoUpdated', handleUserInfoUpdated as EventListener);
  });

  onUnmounted(() => {
    window.removeEventListener('userInfoUpdated', handleUserInfoUpdated as EventListener);
  });

  return {
    profileUserInfo,
    displayedName,
    isTyping,
    cursorPosition,
    userInfo,
    handleNameHover,
    handleNameLeave
  };
}
