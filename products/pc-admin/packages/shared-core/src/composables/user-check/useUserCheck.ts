;
/**
 * 用户检查接口调用
 */

export interface UserCheckData {
  status: 'valid' | 'expired' | 'soon_expire' | 'unauthorized';
  serverCurrentTime: string;
  credentialExpireTime: string;
  remainingTime: number;
  details: string;
}

export interface UserCheckResult {
  isValid: boolean;
  data?: UserCheckData;
  remainingTime?: number;
}

/**
 * 调用用户检查接口
 * @returns 用户检查结果
 */
export async function checkUser(): Promise<UserCheckResult | null> {
  try {
    const response = await fetch('/api/system/auth/user-check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 解析响应数据
    const responseText = await response.text();
    let responseData: any = null;
    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('[checkUser] Failed to parse JSON response:', parseError);
      }
    }

    const httpStatus = response.status;
    const code = responseData?.code;

    // 如果返回200，说明cookie正常
    if (code === 200 || httpStatus === 200) {
      const userData = responseData?.data;

      return {
        isValid: true,
        data: userData,
        remainingTime: userData?.remainingTime,
      };
    }

    // 如果返回401，说明cookie已过期
    if (code === 401 || httpStatus === 401) {
      return null;
    }

    // 其他情况，默认认为正常
    const userData = responseData?.data;
    return {
      isValid: true,
      data: userData,
      remainingTime: userData?.remainingTime,
    };
  } catch (error: any) {
    // 检查错误对象本身的 code 属性
    if (error?.code === 401) {
      return null;
    }

    // 其他错误，默认认为正常（避免因为网络错误导致无法继续）
    console.warn('[checkUser] User check failed, but continue:', error);
    return {
      isValid: true,
    };
  }
}

