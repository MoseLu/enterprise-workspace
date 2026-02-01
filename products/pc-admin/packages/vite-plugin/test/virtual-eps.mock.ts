/**
 * 鐢ㄤ簬娴嬭瘯鐨?EPS Mock 鏁版嵁
 */

export const mockEpsData = {
  user: [
    {
      path: '/admin/user/list',
      method: 'POST',
      name: 'list',
      summary: '鐢ㄦ埛鍒楄〃',
    },
    {
      path: '/admin/user/add',
      method: 'POST',
      name: 'add',
      summary: '娣诲姞鐢ㄦ埛',
    },
    {
      path: '/admin/user/update',
      method: 'POST',
      name: 'update',
      summary: '鏇存柊鐢ㄦ埛',
    },
    {
      path: '/admin/user/delete',
      method: 'POST',
      name: 'delete',
      summary: '鍒犻櫎鐢ㄦ埛',
    },
    {
      path: '/admin/user/info',
      method: 'GET',
      name: 'info',
      summary: '鐢ㄦ埛璇︽儏',
    },
  ],
  order: [
    {
      path: '/admin/order/page',
      method: 'POST',
      name: 'page',
      summary: '璁㈠崟鍒嗛〉',
    },
    {
      path: '/admin/order/info',
      method: 'GET',
      name: 'info',
      summary: '璁㈠崟璇︽儏',
    },
    {
      path: '/admin/order/create',
      method: 'POST',
      name: 'create',
      summary: '鍒涘缓璁㈠崟',
    },
    {
      path: '/admin/order/cancel',
      method: 'POST',
      name: 'cancel',
      summary: '鍙栨秷璁㈠崟',
    },
  ],
  product: [
    {
      path: '/admin/product/list',
      method: 'POST',
      name: 'list',
      summary: '浜у搧鍒楄〃',
    },
    {
      path: '/admin/product/add',
      method: 'POST',
      name: 'add',
      summary: '娣诲姞浜у搧',
    },
    {
      path: '/admin/product/update',
      method: 'POST',
      name: 'update',
      summary: '鏇存柊浜у搧',
    },
    {
      path: '/admin/product/delete',
      method: 'POST',
      name: 'delete',
      summary: '鍒犻櫎浜у搧',
    },
  ],
};

/**
 * 妯℃嫙 EPS API 鍝嶅簲
 */
export function createMockEpsResponse() {
  return {
    code: 1000,
    data: mockEpsData,
    message: 'success',
  };
}

