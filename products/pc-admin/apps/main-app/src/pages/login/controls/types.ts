// 控制组件类型定义

export interface QrToggleBtnProps {
	label?: string;
	icon?: 'qr' | 'pc';
}

export interface QrToggleBtnState {
	label: string;
	icon: 'qr' | 'pc';
}

export interface QrToggleBtnActions {
	handleClick: () => void;
}
