import { inject, onBeforeUnmount, provide, ref, type Ref } from 'vue';

const CONTENT_HEIGHT_KEY = Symbol('btc-content-height');

export interface ContentHeightContext {
  height: Ref<number>;
  register: (el: HTMLElement | null) => void;
  emit: () => void;
}

export function provideContentHeight(): ContentHeightContext {
  const height = ref(0);
  let observer: ResizeObserver | null = null;
  let observedEl: HTMLElement | null = null;

  const compute = () => {
    if (observedEl) {
      height.value = observedEl.clientHeight;
    }
  };

  const register = (el: HTMLElement | null) => {
    if (observedEl === el) return;
    if (observer && observedEl) {
      observer.disconnect();
    }

    observedEl = el;

    if (observedEl) {
      observer = observer ?? new ResizeObserver(() => compute());
      observer.observe(observedEl);
      compute();
    }
  };

  const emit = () => {
    compute();
  };

  provide<ContentHeightContext>(CONTENT_HEIGHT_KEY, {
    height,
    register,
    emit,
  });

  onBeforeUnmount(() => {
    if (observer && observedEl) {
      observer.disconnect();
    }
    observer = null;
    observedEl = null;
  });

  return {
    height,
    register,
    emit,
  };
}

export function useContentHeight(): ContentHeightContext {
  const ctx = inject<ContentHeightContext | null>(CONTENT_HEIGHT_KEY, null);
  if (ctx) {
    return ctx;
  }

  const fallback = ref(0);
  return {
    height: fallback,
    register: () => {},
    emit: () => {},
  };
}


