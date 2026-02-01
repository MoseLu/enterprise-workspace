import { h } from 'vue';
import { Close, FullScreen, Minus } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import type { DialogProps } from '../types';
import { useBrowser } from '../../../../composables/useBrowser';

// 注意：不再需要检测微前端环境或查询容器选择器
// 根据 cool-admin 的实现，弹窗应该始终挂载到 body，无论是什么环境

/**
 * 对话框渲染逻辑
 */
export function useDialogRender(props: DialogProps, dialogContext: any, slots: any) {
  const browser = useBrowser();
  const {
    Dialog,
    visible,
    isFullscreen,
    cacheKey,
    onClose,
    onClosed,
    close,
    changeFullscreen,
    dblClickFullscreen,
  } = dialogContext;

  // 关键：根据 cool-admin 的实现，弹窗应该始终挂载到 body
  // cool-admin 直接使用 append-to-body 属性（布尔属性简写），我们也使用相同的方式
  // 不再需要 appendTo 的逻辑，直接使用 append-to-body

  // 渲染头部
  function renderHeader() {
    if (props.hideHeader) {
      return null;
    }

    return h('div', {
      class: 'btc-dialog__header',
      onDblclick: dblClickFullscreen
    }, [
      h('span', { class: 'btc-dialog__title' }, props.title),
      h('div', { class: 'btc-dialog__controls' },
        (props.controls || ['fullscreen', 'close']).map((e: any) => {
          switch (e) {
            // 全屏按钮（移动端不显示）
            case 'fullscreen':
              if (browser.browser.screen === 'xs') {
                return null; // 移动端隐藏全屏按钮
              }

              if (isFullscreen.value) {
                return h('button', {
                  type: 'button',
                  class: 'control-btn minimize',
                  onClick: () => changeFullscreen(false)
                }, [
                  h(ElIcon, null, () => h(Minus))
                ]);
              } else {
                return h('button', {
                  type: 'button',
                  class: 'control-btn maximize',
                  onClick: () => changeFullscreen(true)
                }, [
                  h(ElIcon, null, () => h(FullScreen))
                ]);
              }

            // 关闭按钮
            case 'close':
              return h('button', {
                type: 'button',
                class: 'control-btn close',
                onClick: close
              }, [
                h(ElIcon, null, () => h(Close))
              ]);

            // 自定义按钮
            default:
              return h(e);
          }
        })
      )
    ]);
  }

  // 渲染主函数
  // 关键：render 函数必须每次调用时都读取响应式值，确保 Vue 能正确追踪依赖
  function render() {
    // 每次渲染时都读取响应式值，确保 Vue 能正确追踪依赖
    void visible.value; // 读取以追踪依赖
    const currentHeight = isFullscreen.value ? '100%' : props.height;

    // 关键：完全按照 cool-admin 的实现方式
    // cool-admin 使用 h(<el-dialog ... />, {}, { slots }) 的方式
    // 直接使用 append-to-body 属性（布尔属性简写），确保弹窗挂载到 body
    // 注意：cool-admin 没有设置 destroy-on-close，但可能他们的 Element Plus 版本默认就是 false
    // 我们显式设置 destroy-on-close={false} 确保弹窗在关闭时不会被销毁，始终挂载在 body 上
    // 这样就能实现和 cool-admin 一样的效果：页面加载时弹窗就挂载在 body 上，通过 display = none 控制隐藏
    return h(
      <el-dialog
        ref={Dialog}
        class={['btc-dialog', { 'is-transparent': props.transparent, 'has-height': !!currentHeight }]}
        width={props.width}
        style={currentHeight ? { height: currentHeight } : undefined}
        alignCenter={props.alignCenter !== false}
        beforeClose={props.beforeClose}
        show-close={false}
        append-to-body
        destroy-on-close={false}
        fullscreen={isFullscreen.value}
        v-model={visible.value}
        onClose={onClose}
        onClosed={onClosed}
      />,
      {},
      {
        header() {
          return renderHeader();
        },
        default() {
          // 每次渲染时都读取响应式值，确保 Vue 能正确追踪依赖
          const currentIsFullscreen = isFullscreen.value;
          const currentCacheKey = cacheKey.value;
          const contentHeight = currentIsFullscreen ? '100%' : (props.scrollbar !== false ? props.height : '100%');
          const style = {
            padding: props.padding || '20px',
            height: props.scrollbar !== false ? 'auto' : contentHeight
          };

          function content() {
            return (
              <div class={['btc-dialog__content', 'btc-dialog__default']} style={style} key={currentCacheKey}>
                {slots.default?.()}
              </div>
            );
          }

          if (props.scrollbar !== false) {
            return <el-scrollbar height={contentHeight}>{content()}</el-scrollbar>;
          } else {
            return content();
          }
        },
        footer() {
          const d = slots.footer?.();

          if (d && d.length > 0) {
            return <div class="btc-dialog__footer">{d}</div>;
          }

          return null;
        }
      }
    );
  }

  // 关键：直接返回 render 函数，与 cool-admin 的返回方式完全一致
  // cool-admin 的 setup 函数返回：return () => { return h(...) }
  // 我们的 useDialogRender 返回 render 函数，然后在 index.tsx 的 setup 中返回 render
  return render;
}

