import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../modules/home/views/index.vue'),
    meta: {
      title: '首页',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../modules/about/views/index.vue'),
    meta: {
      title: '关于我们',
    },
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../modules/news/views/index.vue'),
    meta: {
      title: '新闻动态',
    },
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../modules/terms/views/index.vue'),
    meta: {
      title: '服务条款',
    },
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../modules/help/views/index.vue'),
    meta: {
      title: '帮助中心',
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫：设置页面标题
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});

