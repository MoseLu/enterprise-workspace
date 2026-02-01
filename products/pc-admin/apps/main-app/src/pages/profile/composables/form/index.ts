import type { Ref } from 'vue';
import { useBtcForm } from '@btc/shared-core';
import { useFormItems } from './formItems';
import { usePhoneVerification } from './phoneVerification';
import { useEmailVerification } from './emailVerification';
import { useFormEditor } from './formEditor';
import { useFieldEditor } from './fieldEditor';
import { useAvatarEditor } from './avatarEditor';

export function useProfileForm(
  userInfo: Ref<any>,
  showFullInfo: Ref<boolean>,
  loadUserInfo: (showFull: boolean) => Promise<void>,
  onRequestVerify?: (field: string) => void,
  onSetVerifyCallback?: (callback: () => void) => void
) {
  const { Form } = useBtcForm();
  const { formItems } = useFormItems();
  const { phoneUpdateSmsCodeState } = usePhoneVerification();
  const {
    emailUpdateCountdown,
    emailUpdateSending,
    sendUpdateEmailCode,
    resetEmailUpdateCountdown
  } = useEmailVerification();

  const { handleEdit } = useFormEditor({
    Form,
    formItems,
    userInfo,
    showFullInfo,
    loadUserInfo,
    resetEmailUpdateCountdown
  });

  const { handleEditField, handleBindField } = useFieldEditor({
    Form,
    userInfo,
    showFullInfo,
    loadUserInfo,
    phoneUpdateSmsCodeState,
    sendUpdateEmailCode,
    emailUpdateCountdown,
    emailUpdateSending,
    resetEmailUpdateCountdown,
    ...(onRequestVerify !== undefined && { onRequestVerify }),
    ...(onSetVerifyCallback !== undefined && { onSetVerifyCallback })
  });

  const { handleEditAvatar } = useAvatarEditor({
    Form,
    userInfo,
    showFullInfo,
    loadUserInfo
  });

  return {
    Form,
    formItems,
    handleEdit,
    handleEditField,
    handleBindField,
    handleEditAvatar
  };
}

