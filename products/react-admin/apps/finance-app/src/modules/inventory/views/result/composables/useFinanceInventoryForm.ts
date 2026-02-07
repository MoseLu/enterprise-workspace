import { useMemo } from 'react';

export function useFinanceInventoryForm() {
  const formItems = useMemo(() => [
    {
      prop: 'materialCode',
      label: '物料编码',
      span: 24,
      required: true,
      component: {
        name: 'Input',
        props: {
          placeholder: '请输入物料编码',
          maxLength: 50,
        },
      },
    },
    {
      prop: 'position',
      label: '仓位',
      span: 24,
      required: true,
      component: {
        name: 'Input',
        props: {
          placeholder: '请输入仓位',
          maxLength: 10,
        },
      },
    },
  ], []);

  return {
    formItems,
  };
}
