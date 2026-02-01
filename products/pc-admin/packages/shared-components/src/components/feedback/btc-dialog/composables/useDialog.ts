import { ref, watch, computed, provide } from 'vue';
import type { DialogProps } from '../types';
import { useBrowser } from '../../../../composables/useBrowser';

/**
 * 对话框状态管理
 */
export function useDialog(props: DialogProps, emit: any) {
  const browser = useBrowser();

  // el-dialog ref
  const Dialog = ref();

  // 是否全屏
  const fullscreen = ref(false);

  // 是否可见
  // 完全按照 cool-admin 的实现：初始值为 false
  const visible = ref(false);

  // 缓存数
  const cacheKey = ref(0);

  // 是否全屏（移动端强制全屏）
  const isFullscreen = computed(() => {
    return browser.browser.isMini ? true : fullscreen.value;
  });

  // 监听绑定值
  // 完全按照 cool-admin 的实现：直接赋值，没有额外的检查
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val;
      if (val && !props.keepAlive) {
        cacheKey.value += 1;
      }
    },
    {
      immediate: true,
    }
  );

  // 监听 fullscreen 变化
  watch(
    () => props.fullscreen,
    (val) => {
      fullscreen.value = val || false;
    },
    {
      immediate: true,
    }
  );

  // fullscreen-change 回调
  watch(fullscreen, (val: boolean) => {
    emit('fullscreen-change', val);
  });

  // 提供
  provide('btc-dialog', {
    visible,
    fullscreen: isFullscreen,
  });


  // 打开
  function open() {
    visible.value = true;
  }

  // 关闭
  function close() {
    function done() {
      onClose();
    }

    if (props.beforeClose) {
      props.beforeClose(done);
    } else {
      done();
    }
  }

  // 关闭后
  function onClose() {
    emit('update:modelValue', false);
  }

  // 关闭后回调
  function onClosed() {
    emit('closed');
  }

  // 切换全屏
  function changeFullscreen(val?: boolean) {
    fullscreen.value = typeof val === 'boolean' ? val : !fullscreen.value;
  }

  // 双击全屏
  function dblClickFullscreen() {
    if (Array.isArray(props.controls) && props.controls.includes('fullscreen')) {
      changeFullscreen();
    }
  }

  return {
    // refs
    Dialog,
    visible,
    fullscreen,
    cacheKey,

    // computed
    isFullscreen,

    // methods
    open,
    close,
    onClose,
    onClosed,
    changeFullscreen,
    dblClickFullscreen,
  };
}
