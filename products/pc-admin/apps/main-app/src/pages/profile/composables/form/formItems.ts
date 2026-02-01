import { computed } from 'vue';

export function useFormItems() {
  const formItems = computed(() => [
    {
      prop: 'avatar',
      label: '头像',
      span: 24,
      component: {
        name: 'btc-upload',
        props: {
          type: 'image',
          uploadType: 'avatar',
          text: '选择头像',
          size: [100, 100],
          limitSize: 5
        }
      }
    },
    {
      prop: 'realName',
      label: '姓名',
      span: 12,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入姓名'
        }
      }
    },
    {
      prop: 'name',
      label: '英文名',
      span: 12,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入英文名'
        }
      }
    },
    {
      prop: 'employeeId',
      label: '工号',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '工号',
          disabled: true
        }
      }
    },
    {
      prop: 'position',
      label: '职位',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入职位'
        }
      }
    },
    {
      prop: 'email',
      label: '邮箱',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入邮箱'
        }
      },
      rules: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      ]
    },
    {
      prop: 'phone',
      label: '手机号',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入手机号'
        }
      },
      rules: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    },
    {
      prop: 'initPass',
      label: '密码',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          type: 'password',
          placeholder: '请输入密码',
          showPassword: true
        }
      },
      rules: [
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ]
    }
  ]);

  return {
    formItems
  };
}

