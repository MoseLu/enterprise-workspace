import { debounce, last } from 'lodash-es';
import { nextTick, onActivated, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { addClass, removeClass } from '../../../utils/dom';
import { globalMitt } from '../../../utils/mitt';
import type { TableProps } from '../types';

export function useTableHeight(props: TableProps, tableRef: Ref) {
  const maxHeight = ref<number | undefined>(0);

  const update = debounce(async () => {
    await nextTick();

    let vm: any = tableRef.value;

    if (vm) {
      // 如果用户设置了 maxHeight，直接使用，不进行自动计算
      if (props.maxHeight && props.autoHeight) {
        const maxAllowed = typeof props.maxHeight === 'number' ? props.maxHeight : parseInt(String(props.maxHeight), 10);
        maxHeight.value = maxAllowed;
        return;
      }

      // 查找 btc-crud 容器
      while (
        vm.$parent &&
        !(vm.$parent.$el && vm.$parent.$el.classList && vm.$parent.$el.classList.contains('btc-crud'))
      ) {
        vm = vm.$parent;
      }

      if (vm && vm.$parent?.$el) {
        const crudEl = vm.$parent.$el as HTMLElement;
        const rowEl = vm.$el as HTMLElement;

        await nextTick();

        // 查找合适的容器：优先查找 .page，其次查找 btc-transfer-panel 或 btc-transfer-drawer__panel-body
        let containerEl: HTMLElement | null = null;

        // 向上查找 .page 容器
        let parent: HTMLElement | null = crudEl.parentElement;
        while (parent) {
          if (parent.classList.contains('page')) {
            containerEl = parent;
            break;
          }
          parent = parent.parentElement;
        }

        // 如果没有找到 .page，查找 btc-transfer-panel 或 btc-transfer-drawer__panel-body
        if (!containerEl) {
          parent = crudEl.parentElement;
          while (parent) {
            if (
              parent.classList.contains('btc-transfer-panel') ||
              parent.classList.contains('btc-transfer-drawer__panel-body')
            ) {
              containerEl = parent;
              break;
            }
            parent = parent.parentElement;
          }
        }

        // 如果都没找到，使用 crudEl 本身
        if (!containerEl) {
          containerEl = crudEl;
        }

        let h = 0;

        if (rowEl.className.includes('btc-crud-row')) {
          h += 10;
        }

        h += rowEl.offsetTop;

        let sibling = rowEl.nextSibling as HTMLElement | null;
        const arr: HTMLElement[] = [rowEl];

        while (sibling) {
          if (sibling instanceof HTMLElement && sibling.offsetHeight > 0) {
            h += sibling.offsetHeight || 0;
            arr.push(sibling);

            if (sibling.className.includes('btc-crud-row--last')) {
              h += 10;
            }
          }

          sibling = sibling.nextSibling as HTMLElement | null;
        }

        arr.forEach((el) => {
          removeClass(el, 'btc-crud-row--last');
        });

        const lastRow = last(arr);

        if (lastRow?.className.includes('btc-crud-row')) {
          addClass(lastRow, 'btc-crud-row--last');
          h -= 10;
        }

        h += parseInt(window.getComputedStyle(crudEl).paddingTop, 10) || 0;

        if (props.autoHeight) {
          const available = containerEl.clientHeight - h;

          // 如果用户设置了 maxHeight，使用该值作为上限
          if (props.maxHeight) {
            const maxAllowed = typeof props.maxHeight === 'number' ? props.maxHeight : parseInt(String(props.maxHeight), 10);

            if (available > 100) {
              // 可用高度足够时，使用可用高度和用户设置的上限中的较小值
              maxHeight.value = Math.min(available, maxAllowed);
            } else {
              // 容器高度受限时，使用用户设置的上限
              maxHeight.value = maxAllowed;
            }
          } else {
            // 用户没有设置 maxHeight，直接使用可用高度（不设置默认上限）
            if (available > 100) {
              maxHeight.value = available;
            } else {
              // 容器高度受限，不设置 max-height，让表格自然显示
              maxHeight.value = undefined;
            }
          }
        } else {
          maxHeight.value = 0;
        }
      }
    }
  }, 100);

  const handleResize = () => {
    update();
  };

  globalMitt.on('resize', handleResize);

  onMounted(() => {
    update();
  });

  onActivated(() => {
    update();
  });

  onBeforeUnmount(() => {
    update.cancel();
    globalMitt.off('resize', handleResize);
  });

  return {
    maxHeight,
    calcMaxHeight: update,
  };
}
