/**
 * Mock EPS API 服务器
 * 用于测试 EPS 插件的热更新功能
 */

import http from 'http';

const mockEpsData = {
	user: [
		{ path: '/admin/user/list', method: 'POST', name: 'list', summary: '用户列表' },
		{ path: '/admin/user/add', method: 'POST', name: 'add', summary: '添加用户' },
		{ path: '/admin/user/update', method: 'POST', name: 'update', summary: '更新用户' },
		{ path: '/admin/user/delete', method: 'POST', name: 'delete', summary: '删除用户' },
		{ path: '/admin/user/info', method: 'GET', name: 'info', summary: '用户详情' },
	],
	order: [
		{ path: '/admin/order/page', method: 'POST', name: 'page', summary: '订单分页' },
		{ path: '/admin/order/info', method: 'GET', name: 'info', summary: '订单详情' },
		{ path: '/admin/order/create', method: 'POST', name: 'create', summary: '创建订单' },
		{ path: '/admin/order/cancel', method: 'POST', name: 'cancel', summary: '取消订单' },
	],
	product: [
		{ path: '/admin/product/list', method: 'POST', name: 'list', summary: '产品列表' },
		{ path: '/admin/product/add', method: 'POST', name: 'add', summary: '添加产品' },
		{ path: '/admin/product/update', method: 'POST', name: 'update', summary: '更新产品' },
		{ path: '/admin/product/delete', method: 'POST', name: 'delete', summary: '删除产品' },
	],
};

const server = http.createServer((req, res) => {
	if (req.url === '/api/base/open/eps') {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		});
		res.end(JSON.stringify(mockEpsData));
	} else if (req.url === '/admin/base/comm/program') {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		});
		res.end(JSON.stringify({ code: 1000, data: 'Node', message: 'success' }));
	} else {
		res.writeHead(404);
		res.end('Not Found');
	}
});

const PORT = 8001;
server.listen(PORT, () => {
	// Mock EPS Server running
});

