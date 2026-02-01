import { defineComponent, type PropType } from 'vue';
import type { DialogProps } from './types';
import { useDialog, useDialogRender } from './composables';
import './styles/index.scss';

export default defineComponent({
  name: 'BtcDialog',

  props: {
    // 是否可见
    modelValue: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: '-'
    },
    // 高度
    height: [String, Number],
    // 宽度
    width: {
      type: [String, Number],
      default: '50%'
    },
    // 內间距
    padding: {
      type: String,
      default: '20px'
    },
    // 是否缓存
    keepAlive: Boolean,
    // 是否全屏
    fullscreen: Boolean,
    // 控制按钮
    controls: {
      type: Array,
      default: () => ['fullscreen', 'close']
    },
    // 隐藏头部元素
    hideHeader: Boolean,
    // 关闭前
    beforeClose: Function,
    // 是否需要滚动条
    scrollbar: {
      type: Boolean,
      default: true
    },
    // 背景透明
    transparent: Boolean,
    // 是否居中
    alignCenter: {
      type: Boolean,
      default: true
    },
    // 是否挂载到 body（在微前端环境中建议设置为 false）
    appendToBody: {
      type: Boolean,
      default: undefined // undefined 表示根据环境自动判断
    },
    // 挂载到指定选择器或元素（Element Plus 2.4.3+ 支持，优先级高于 appendToBody）
    appendTo: {
      type: [String, Object] as PropType<string | HTMLElement>,
      default: undefined
    }
  },

  emits: ['update:modelValue', 'fullscreen-change', 'closed'],

  setup(props, { emit, expose, slots }) {
    // 对话框状态管理
    const dialogContext = useDialog(props as unknown as DialogProps, emit);

    const {
      Dialog,
      visible,
      isFullscreen,
      open,
      close,
      changeFullscreen,
    } = dialogContext;

    // 渲染逻辑
    // 关键：useDialogRender 直接返回 render 函数，与 cool-admin 的返回方式一致
    const render = useDialogRender(props as unknown as DialogProps, dialogContext, slots);

    // 暴露方法
    expose({
      Dialog,
      visible,
      isFullscreen,
      open,
      close,
      changeFullscreen
    });

    // 直接返回 render 函数，与 cool-admin 的 setup 返回方式一致
    // cool-admin: return () => { return h(...) }
    // 我们: return render (render 函数内部已经返回 h(...))
    return render;
  }
});

