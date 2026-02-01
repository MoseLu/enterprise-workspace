/**
 * LoginForm Storybook 故事
 */
;

import type { Meta, StoryObj } from '@storybook/vue3';
import PasswordForm from '../login/password-form/index.vue';
import { ref } from 'vue';

const meta: Meta<typeof PasswordForm> = {
  title: 'Auth/Login/PasswordForm',
  component: PasswordForm,
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: '是否显示加载状态'
    }
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '密码登录表单组件，支持用户名/邮箱登录'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof PasswordForm>;

// 默认状态
export const Default: Story = {
  args: {
    form: {
      username: '',
      password: ''
    },
    rules: {
      username: [
        { required: true, message: '请输入账号或者邮箱', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    },
    loading: false,
    submit: () => {
      console.info('提交登录');
    },
    t: (key: string) => key
  }
};

// 加载状态
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true
  }
};

// 表单填充状态
export const Filled: Story = {
  args: {
    ...Default.args,
    form: {
      username: 'admin',
      password: '123456'
    }
  }
};

// 验证错误状态
export const WithErrors: Story = {
  render: (args) => ({
    components: { PasswordForm },
    setup() {
      const form = ref({
        username: '',
        password: ''
      });

      const rules = {
        username: [
          { required: true, message: '请输入账号或者邮箱', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      };

      const submit = () => {
        console.info('表单验证失败');
      };

      return { form, rules, submit, t: (key: string) => key, loading: false };
    },
    template: '<PasswordForm :form="form" :rules="rules" :loading="loading" :submit="submit" :t="t" />'
  })
};
