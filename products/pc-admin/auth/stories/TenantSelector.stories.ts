/**
 * TenantSelector Storybook 故事
 */
;

import type { Meta, StoryObj } from '@storybook/vue3';
import TenantSelector from '../register/tenant-selector/index.vue';
import { ref } from 'vue';

const meta: Meta<typeof TenantSelector> = {
  title: 'Auth/Register/TenantSelector',
  component: TenantSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '租户类型选择器，用于注册流程的第一步'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof TenantSelector>;

// 默认状态（未选择）
export const Default: Story = {
  args: {
    modelValue: ''
  }
};

// 已选择员工类型
export const SelectedInert: Story = {
  args: {
    modelValue: 'INERT'
  }
};

// 已选择供应商类型
export const SelectedSupplier: Story = {
  args: {
    modelValue: 'SUPPLIER'
  }
};

// 已选择ITL类型
export const SelectedUkHead: Story = {
  args: {
    modelValue: 'UK-HEAD'
  }
};

// 交互式示例
export const Interactive: Story = {
  render: () => ({
    components: { TenantSelector },
    setup() {
      const selectedTenant = ref('');

      const handleNext = () => {
        console.info('选择的租户类型:', selectedTenant.value);
        alert(`选择了: ${selectedTenant.value}`);
      };

      return { selectedTenant, handleNext };
    },
    template: `
      <div style="width: 500px;">
        <TenantSelector 
          v-model="selectedTenant" 
          @next="handleNext"
        />
        <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <strong>当前选择:</strong> {{ selectedTenant || '（未选择）' }}
        </div>
      </div>
    `
  })
};
