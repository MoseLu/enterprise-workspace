import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

export interface ProcessState {
  list: RouteRecordRaw[];
}

export const useProcessStore = defineStore('process', {
  state: (): ProcessState => ({
    list: [],
  }),

  actions: {
    addProcess(route: RouteRecordRaw) {
      const index = this.list.findIndex((item) => item.path === route.path);
      if (index === -1) {
        this.list.push(route);
      }
    },

    removeProcess(route: RouteRecordRaw) {
      const index = this.list.findIndex((item) => item.path === route.path);
      if (index !== -1) {
        this.list.splice(index, 1);
      }
    },

    // 移除所有缓存的页面
    clearAllProcess() {
      this.list = [];
    },
  },

  getters: {
    getProcessList: (state) => state.list,
  },

  persist: true,
});
