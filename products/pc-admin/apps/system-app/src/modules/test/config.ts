/**
 * 测试模块配置
 */
;
import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'test',
  label: 'common.module.test.label',
  order: 100,

  // 路由配置
  views: [
    {
      path: 'test/test-one',
      name: 'TestTestOne',
      component: () => import('./views/test-one/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_one',
      },
    },
    {
      path: 'test/test-two',
      name: 'TestTestTwo',
      component: () => import('./views/test-two/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_two',
      },
    },
    {
      path: 'test/test-three',
      name: 'TestTestThree',
      component: () => import('./views/test-three/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_three',
      },
    },
    {
      path: 'test/test-four',
      name: 'TestTestFour',
      component: () => import('./views/test-four/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_four',
      },
    },
    {
      path: 'test/test-five',
      name: 'TestTestFive',
      component: () => import('./views/test-five/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_five',
      },
    },
    {
      path: 'test/test-six',
      name: 'TestTestSix',
      component: () => import('./views/test-six/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_six',
      },
    },
    {
      path: 'test/test-seven',
      name: 'TestTestSeven',
      component: () => import('./views/test-seven/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_seven',
      },
    },
    {
      path: 'test/test-eight',
      name: 'TestTestEight',
      component: () => import('./views/test-eight/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_eight',
      },
    },
    {
      path: 'test/test-nine',
      name: 'TestTestNine',
      component: () => import('./views/test-nine/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_nine',
      },
    },
    {
      path: 'test/test-ten',
      name: 'TestTestTen',
      component: () => import('./views/test-ten/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_ten',
      },
    },
    {
      path: 'test/image-detail/:id',
      name: 'TestImageDetail',
      component: () => import('./views/image-detail/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.image_detail',
      },
    },
  ],

  // PageConfig 字段
  locale: {
    'zh-CN': {
      // 模块标签
      'common.module.test.label': '测试模块',
      // 菜单配置
      'menu.test': '测试模块',
      'menu.test.test_one': '图标展示',
      'menu.test.test_two': '测试二',
      'menu.test.test_three': '测试三',
      'menu.test.test_four': '测试四',
      'menu.test.test_five': '测试五',
      'menu.test.test_six': '测试六',
      'menu.test.test_seven': '测试七',
      'menu.test.test_eight': '测试八',
      'menu.test.test_nine': '测试九',
      'menu.test.test_ten': '测试十',
      'menu.test.image_detail': '图片详情',
    },
    'en-US': {
      // 模块标签
      'common.module.test.label': 'Test Module',
      // 菜单配置
      'menu.test': 'Test Module',
      'menu.test.test_one': 'Icon Showcase',
      'menu.test.test_two': 'Test Two',
      'menu.test.test_three': 'Test Three',
      'menu.test.test_four': 'Test Four',
      'menu.test.test_five': 'Test Five',
      'menu.test.test_six': 'Test Six',
      'menu.test.test_seven': 'Test Seven',
      'menu.test.test_eight': 'Test Eight',
      'menu.test.test_nine': 'Test Nine',
      'menu.test.test_ten': 'Test Ten',
      'menu.test.image_detail': 'Image Detail',
    },
  },
} satisfies ModuleConfig;
