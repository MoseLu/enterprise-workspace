import { ref } from 'vue';

// 认证状态管理
export function useAuth() {
	// 加载状态
	const saving = ref(false);

	// 设置加载状态
	const setSaving = (value: boolean) => {
		saving.value = value;
	};

	// 模拟API调用
	const mockApiCall = async (delay: number = 1000): Promise<void> => {
		return new Promise(resolve => {
			setTimeout(resolve, delay);
		});
	};

	return {
		saving,
		setSaving,
		mockApiCall
	};
}
