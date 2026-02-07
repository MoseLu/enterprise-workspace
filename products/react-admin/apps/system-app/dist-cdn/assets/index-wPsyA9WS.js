import { r as requestAdapter } from "./auth-api-CvJd6wHo.js";
const baseUrl = "/system/auth";
const codeApi = {
  /**
   * 发送短信验证码
   * @param data 手机号和验证码类型
   * @returns Promise<void>
   */
  sendSmsCode(data) {
    return requestAdapter.post(`${baseUrl}/code/sms/send`, data, { notifySuccess: false });
  }
};
export {
  codeApi as c
};
