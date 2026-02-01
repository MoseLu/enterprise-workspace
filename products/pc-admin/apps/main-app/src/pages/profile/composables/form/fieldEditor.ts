;
import { BtcMessage } from '@btc/shared-components';
import type { Ref } from 'vue';
import type { PhoneSmsState } from './phoneVerification';
import { resolveFieldConfig } from './fieldConfig';
import { createFieldFormData } from './fieldForm';
import { submitFieldUpdate } from './fieldSubmit';
import { logger } from '@btc/shared-core';

interface FieldEditorOptions {
  Form: Ref<any>;
  userInfo: Ref<any>;
  showFullInfo: Ref<boolean>;
  loadUserInfo: (showFull: boolean) => Promise<void>;
  phoneUpdateSmsCodeState: PhoneSmsState;
  sendUpdateEmailCode: (email: string) => Promise<void>;
  emailUpdateCountdown: Ref<number>;
  emailUpdateSending: Ref<boolean>;
  resetEmailUpdateCountdown: () => void;
  onRequestVerify?: (field: string) => void;
  onSetVerifyCallback?: (callback: () => void) => void;
}

export function useFieldEditor({
  Form,
  userInfo,
  showFullInfo,
  loadUserInfo,
  phoneUpdateSmsCodeState,
  sendUpdateEmailCode,
  emailUpdateCountdown,
  emailUpdateSending,
  resetEmailUpdateCountdown,
  onRequestVerify,
  onSetVerifyCallback
}: FieldEditorOptions) {
  const openFieldEditForm = (field: string) => {
    const config = resolveFieldConfig(field, {
      phoneUpdateSmsCodeState,
      sendUpdateEmailCode,
      emailUpdateCountdown,
      emailUpdateSending
    });

    if (!config) {
      BtcMessage.warning('该字段不支持编辑');
      return;
    }

    const formData = createFieldFormData(field, userInfo, resetEmailUpdateCountdown);

    Form.value?.open({
      title: `编辑${config.label}`,
      width: '500px',
      form: formData,
      items: config.items,
      props: {
        labelWidth: '100px',
        labelPosition: 'top'
      },
      op: {
        buttons: ['save', 'close']
      },
      on: {
        submit: async (data: any, { close, done }: { close: () => void; done: () => void }) => {
          try {
            const result = await submitFieldUpdate(field, data, { userInfo });
            if (!result.success) {
              done();
              return;
            }

            BtcMessage.success(result.message || '保存成功');
            close();
            resetEmailUpdateCountdown();
            await loadUserInfo(showFullInfo.value);
          } catch (error: any) {
            logger.error('保存用户信息失败:', error);
            BtcMessage.error(error?.message || '保存失败');
            done();
          }
        }
      }
    });
  };

  const handleEditField = async (field: string) => {
    if (field === 'phone' || field === 'email') {
      const currentValue = userInfo.value[field];
      const isEmpty = !currentValue || currentValue === '-' || currentValue.trim() === '';

      if (isEmpty) {
        handleBindField(field);
        return;
      }
    }

    const fieldsRequiringVerify = ['phone', 'email', 'initPass'];

    if (fieldsRequiringVerify.includes(field) && onRequestVerify && onSetVerifyCallback) {
      onSetVerifyCallback(() => {
        openFieldEditForm(field);
      });
      onRequestVerify(field);
      return;
    }

    openFieldEditForm(field);
  };

  const handleBindField = (_field: string) => {
    // 绑定字段逻辑由主页面处理，这里保留函数用于兼容
  };

  return {
    handleEditField,
    handleBindField
  };
}

