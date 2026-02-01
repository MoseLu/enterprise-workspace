/**
 * API 相关工具函数
 * 
 * @deprecated 请使用 authService 代替
 * 这些函数保留用于向后兼容，将在未来版本中移除
 */

// 使用动态导入避免路径问题
async function getAuthService() {
  const { authService } = await import('../../../../../../auth/services/authService');
  return authService;
}

/**
 * 发送短信验证码
 * @deprecated 请使用 authService.sendSmsCode()
 */
export async function sendSmsCode(phone: string, smsType: string = 'register') {
  const authService = await getAuthService();
  return authService.sendSmsCode(phone, smsType as any);
}

/**
 * 验证员工身份
 * @deprecated 请使用 authService.verifyIdentity()
 */
export async function verifyEmployeeIdentity(employeeId: string, initPass: string) {
  const authService = await getAuthService();
  return authService.verifyIdentity({ employeeId, name: initPass });
}

/**
 * 用户注册
 * @deprecated 请使用 authService.register()
 */
export async function registerUser(data: any) {
  const authService = await getAuthService();
  return authService.register(data);
}

/**
 * 密码登录
 * @deprecated 请使用 authService.login()
 */
export async function passwordLogin(data: any) {
  const authService = await getAuthService();
  return authService.login(data);
}

/**
 * 短信登录
 * @deprecated 请使用 authService.smsLogin()
 */
export async function smsLogin(data: any) {
  const authService = await getAuthService();
  return authService.smsLogin(data);
}

/**
 * 获取租户列表
 * @deprecated 后续版本将移到专门的 tenantService
 */
export async function getTenantList(tenantType: string) {
  // 保留原有实现，后续迁移到 tenantService
  const { request } = await import('@btc/shared-core');
  return request({
    url: '/dev/user/tenant/tenantList',
    method: 'POST',
    data: { tenantType }
  });
}

/**
 * 模糊搜索供应商租户
 * @deprecated 后续版本将移到专门的 tenantService
 */
export async function searchTenantLike(tenantName: string) {
  // 保留原有实现，后续迁移到 tenantService
  const { request } = await import('@btc/shared-core');
  return request({
    url: '/dev/user/tenant/tenantLike',
    method: 'POST',
    data: { tenantName }
  });
}
