var proxy = {
    '/api': {
        target: 'http://10.80.9.76:8115',
        changeOrigin: true,
        // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
        // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    }
};
export { proxy };
