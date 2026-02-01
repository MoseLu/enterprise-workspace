import { ElMessageBox } from 'element-plus';

export type BtcMessageBoxConfirmArgs = Parameters<typeof ElMessageBox.confirm>;
export type BtcMessageBoxAlertArgs = Parameters<typeof ElMessageBox.alert>;
export type BtcMessageBoxPromptArgs = Parameters<typeof ElMessageBox.prompt>;

export const BtcMessageBox = {
  confirm: (...args: BtcMessageBoxConfirmArgs) => ElMessageBox.confirm(...args),
  alert: (...args: BtcMessageBoxAlertArgs) => ElMessageBox.alert(...args),
  prompt: (...args: BtcMessageBoxPromptArgs) => ElMessageBox.prompt(...args)
};

export const BtcConfirm = (
  ...args: BtcMessageBoxConfirmArgs
) => BtcMessageBox.confirm(...args);

export const BtcAlert = (
  ...args: BtcMessageBoxAlertArgs
) => BtcMessageBox.alert(...args);

export const BtcPrompt = (
  ...args: BtcMessageBoxPromptArgs
) => BtcMessageBox.prompt(...args);

export type BtcMessageBoxReturn = ReturnType<typeof ElMessageBox.confirm>;

