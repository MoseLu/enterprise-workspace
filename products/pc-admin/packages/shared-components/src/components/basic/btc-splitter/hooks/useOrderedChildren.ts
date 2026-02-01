import {
  defineComponent,
  h,
  isVNode,
  shallowRef,
  triggerRef,
} from 'vue';

import type { Component, ComponentInternalInstance, VNode } from 'vue';

type ChildEssential = {
  uid: number;
  getVnode: () => VNode;
};

// 扁平化子节点（参考 Element Plus 的实现，但不依赖 @element-plus/utils）
// 使用 WeakSet 避免循环引用导致的栈溢出
const flattedChildren = (
  children: VNode[] | VNode | undefined,
  visited: WeakSet<VNode> = new WeakSet()
): VNode[] => {
  if (!children) return [];
  const vNodes = Array.isArray(children) ? children : [children];
  const result: VNode[] = [];

  vNodes.forEach((child) => {
    if (Array.isArray(child)) {
      result.push(...flattedChildren(child, visited));
    } else if (isVNode(child)) {
      // 避免循环引用
      if (visited.has(child)) {
        return;
      }
      visited.add(child);
      
      if (child.component?.subTree) {
        result.push(child, ...flattedChildren(child.component.subTree, visited));
      } else if (Array.isArray(child.children)) {
        result.push(...flattedChildren(child.children as VNode[], visited));
      } else {
        result.push(child);
      }
    }
  });
  return result;
};

const getOrderedChildren = <T extends ChildEssential>(
  vm: ComponentInternalInstance,
  childComponentName: string,
  children: Record<number, T>
): T[] => {
  const nodes = flattedChildren(vm.subTree).filter(
    (n): n is VNode =>
      isVNode(n) &&
      (n.type as Component)?.name === childComponentName &&
      !!n.component
  );
  const uids = nodes.map((n) => n.component!.uid);
  return uids.map((uid) => children[uid]).filter((p) => !!p);
};

export const useOrderedChildren = <T extends ChildEssential>(
  vm: ComponentInternalInstance,
  childComponentName: string
) => {
  const children = shallowRef<Record<number, T>>({});
  const orderedChildren = shallowRef<T[]>([]);

  const addChild = (child: T) => {
    children.value[child.uid] = child;
    triggerRef(children);
  };

  const removeChild = (child: T) => {
    delete children.value[child.uid];
    triggerRef(children);
  };

  const sortChildren = () => {
    orderedChildren.value = getOrderedChildren(
      vm,
      childComponentName,
      children.value
    );
  };

  // 不使用 deep watch，避免循环引用导致的栈溢出
  // 通过 triggerRef 手动触发更新，在 ChildrenSorter 渲染时调用 sortChildren

  const IsolatedRenderer = (props: { render: () => VNode[] }) => {
    return props.render();
  };

  const ChildrenSorter = defineComponent({
    setup(_, { slots }) {
      return () => {
        sortChildren();

        return slots.default
          ? h(IsolatedRenderer, {
              render: () => slots.default!(),
            })
          : null;
      };
    },
  });

  return {
    children: orderedChildren,
    addChild,
    removeChild,
    ChildrenSorter,
  };
};
