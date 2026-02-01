/**
 * TenantSelector 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Check: { name: 'Check' },
  OfficeBuilding: { name: 'OfficeBuilding' },
  Connection: { name: 'Connection' },
  Van: { name: 'Van' }
}));

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('TenantSelector Component', () => {
  it('应该渲染三个租户选项', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: ''
      }
    });

    const tenantCards = wrapper.findAll('.tenant-card');
    expect(tenantCards).toHaveLength(3);
  });

  it('应该显示租户标题和描述', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector);

    expect(wrapper.text()).toContain('BTC员工');
    expect(wrapper.text()).toContain('供应商');
    expect(wrapper.text()).toContain('ITL');
    expect(wrapper.text()).toContain('拜里斯科技员工注册');
    expect(wrapper.text()).toContain('BTC供应商注册');
  });

  it('应该显示顶部提示信息', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector);

    expect(wrapper.text()).toContain('选择注册类型');
    expect(wrapper.text()).toContain('请选择您要注册的账户类型');
  });

  it('应该显示底部按钮', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector);

    const footer = wrapper.find('.tenant-footer');
    expect(footer.exists()).toBe(true);

    const nextButton = wrapper.find('button[type="primary"]');
    expect(nextButton.exists()).toBe(true);
    expect(nextButton.text()).toContain('下一步');
  });

  it('未选择租户时，下一步按钮应该禁用', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: ''
      }
    });

    const nextButton = wrapper.find('button[type="primary"]');
    expect(nextButton.attributes('disabled')).toBeDefined();
  });

  it('选择租户后应该触发 update:modelValue 事件', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: ''
      }
    });

    // 点击第一个租户卡片
    const firstCard = wrapper.find('.tenant-card');
    await firstCard.trigger('click');
    await nextTick();

    // 检查是否触发了事件
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['INERT']);
  });

  it('选择租户后，卡片应该显示选中状态', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: 'INERT'
      }
    });

    await nextTick();

    const firstCard = wrapper.find('.tenant-card');
    expect(firstCard.classes()).toContain('is-selected');
  });

  it('点击下一步应该触发 next 事件', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: 'SUPPLIER'
      }
    });

    await nextTick();

    const nextButton = wrapper.find('button[type="primary"]');
    await nextButton.trigger('click');

    expect(wrapper.emitted('next')).toBeTruthy();
  });

  it('未选择租户时点击下一步不应该触发事件', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: ''
      }
    });

    const nextButton = wrapper.find('button[type="primary"]');
    
    // 按钮被禁用，无法点击
    expect(nextButton.attributes('disabled')).toBeDefined();
  });

  it('应该支持 v-model 双向绑定', async () => {
    const { default: TenantSelector } = await import('../../register/tenant-selector/index.vue');
    
    const wrapper = mount(TenantSelector, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': (value: string) => {
          wrapper.setProps({ modelValue: value });
        }
      }
    });

    // 点击租户卡片
    const cards = wrapper.findAll('.tenant-card');
    await cards[1].trigger('click'); // 选择供应商
    await nextTick();

    // 检查 modelValue 是否更新
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['SUPPLIER']);
  });
});
