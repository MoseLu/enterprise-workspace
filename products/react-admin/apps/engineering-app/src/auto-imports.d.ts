// 自动导入的类型声明
// 由 unplugin-vue-components 自动生成

// Vue
import type { Ref, ComputedRef, ReactiveEffect, ToRefs, UnwrapRef, DeepReadonly, WritableComputedRef, PropType, DefineComponent } from 'vue';

// 组合式 API
declare function ref<T>(value: T): Ref<T>;
declare function computed<T>(getter: () => T): ComputedRef<T>;
declare function watch<T>(source: () => T, callback: (value: T, oldValue: T) => void, options?: object): void;
declare function watchEffect(callback: () => void, options?: object): void;
declare function onMounted(callback: () => void): void;
declare function onUnmounted(callback: () => void): void;
declare function onBeforeMount(callback: () => void): void;
declare function onUpdated(callback: () => void): void;
declare function onBeforeUpdate(callback: () => void): void;
declare function onActivated(callback: () => void): void;
declare function onDeactivated(callback: () => void): void;
declare function nextTick(callback?: () => void): Promise<void>;
declare function getCurrentInstance(): any;
declare function provide<T>(key: string | number, value: T): void;
declare function inject<T>(key: string | number, defaultValue?: T): T | undefined;
declare function readonly<T>(value: T): DeepReadonly<T>;
declare function toRefs<T>(object: T): ToRefs<T>;
declare function toRef(object: any, key: string): WritableComputedRef<any>;
declare function unref<T>(ref: T): T;
declare function isRef<T>(ref: any): ref is Ref<T>;
declare function triggerRef(ref: Ref): void;
declare function customRef<T>(factory: (track: (key: string) => void, trigger: (key: string) => void) => { get: () => T; set: (value: T) => void }): Ref<T>;
declare function shallowRef<T>(value: T): Ref<T>;
declare function triggerRef(ref: Ref): void;

declare function defineComponent(options: any): any;
declare function defineProps<T>(props: T): T;
declare function defineEmits<T>(emits: T): T;

declare function useAttrs(): Record<string, unknown>;
declare function useSlots(): Record<string, unknown>;

// Pinia
declare function defineStore(id: string, options: any): any;
declare function useStore(id: string): any;

declare module 'vue' {
  export interface ComponentCustomProperties {
    $t(key: string, values?: any): string;
    $i18n: any;
    $store: any;
    $refs: any;
    $nextTick: (callback?: () => void) => Promise<void>;
  }
}

export {};
