<template>
<div v-if="text">
	<div class="btc-code-json__wrap" v-if="popover">
		<el-popover
			width="auto"
			placement="right"
			:popper-class="popperClassComputed"
			effect="dark"
			:trigger="popoverTrigger"
			:teleported="teleported"
			:persistent="false"
			:show-arrow="true"
			:popper-options="{ strategy: popperStrategy }"
		>
			<template #reference>
				<span class="btc-code-json__text">{{ text }}</span>
			</template>

			<viewer />
		</el-popover>
	</div>

	<viewer v-else>
		<template #op>
			<slot name="op"> </slot>
		</template>
	</viewer>
</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'BtcCodeJson'
});

import { ElButton, ElPopover, ElScrollbar } from 'element-plus';
import type { TooltipTriggerType } from 'element-plus';
import { computed, defineComponent, h, type PropType } from 'vue';
import { isObject, isString } from 'lodash-es';
import { BtcMessage } from '@btc/shared-components';
import { logger } from '@btc/shared-core';
;


const props = defineProps({
	content: null,
	modelValue: null,
	popover: Boolean,
	popoverWidth: {
		type: [Number, String],
		default: 400
	},
	popoverTrigger: {
		type: [String, Array] as PropType<TooltipTriggerType | TooltipTriggerType[]>,
		default: 'click'
	},
	teleported: {
		type: Boolean,
		default: true
	},
	popperStrategy: {
		type: String as unknown as () => 'absolute' | 'fixed',
		default: 'fixed'
	},
	height: {
		type: [Number, String],
		default: '100%'
	},
	maxHeight: {
		type: [Number, String],
		default: 300
	},
	maxLength: {
		type: Number,
		default: 100
	}
});

// 获取值，兼容 content 和 modelValue
const value = computed(() => props.modelValue || props.content);

// popper-class 计算属性，解决类型问题
const popperClassComputed = computed(() => 'btc-code-json__popper' as any);

// 复制功能 - 使用更可靠的方法
const copyToClipboard = async (text: string) => {
	try {
		// 优先使用现代 Clipboard API
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			BtcMessage.success('复制成功');
			return;
		}

		// fallback: 使用 document.execCommand
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		textArea.style.opacity = '0';
		textArea.style.pointerEvents = 'none';
		textArea.setAttribute('readonly', '');
		document.body.appendChild(textArea);

		// 选择文本
		textArea.select();
		textArea.setSelectionRange(0, 99999);

		// 执行复制
		const successful = document.execCommand('copy');
		document.body.removeChild(textArea);

		if (successful) {
			BtcMessage.success('复制成功');
		} else {
			BtcMessage.error('复制失败');
		}
	} catch (error) {
		logger.error('复制失败:', error);
		BtcMessage.error('复制失败');
	}
};

// 显示文本
const text = computed(() => {
	const v = value.value;

	if (isString(v)) {
		const maxLen = props.maxLength;
		return v.length > maxLen ? v.substring(0, maxLen) + '...' : v;
	} else if (isObject(v)) {
		const jsonStr = JSON.stringify(v, null, 4);
		const maxLen = props.maxLength;
		return jsonStr.length > maxLen ? jsonStr.substring(0, maxLen) + '...' : jsonStr;
	} else {
		const str = String(v);
		const maxLen = props.maxLength;
		return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
	}
});

// 视图组件
const viewer = defineComponent({
	setup(_, { slots }) {
		// 获取完整的内容用于弹窗显示
		const fullContent = computed(() => {
			const v = value.value;

			if (isString(v)) {
				// 尝试解析 JSON 字符串以提供更好的显示效果
				try {
					const parsed = JSON.parse(v);
					return JSON.stringify(parsed, null, 4);
				} catch {
					// 如果不是有效的 JSON，直接返回原字符串
					return v;
				}
			} else if (isObject(v)) {
				return JSON.stringify(v, null, 4);
			} else {
				return String(v);
			}
		});

		function toCopy() {
			copyToClipboard(fullContent.value);
		}

		return () => {
			return h('div', { class: 'btc-code-json' }, [
				h('div', { class: 'btc-code-json__op' }, [
					fullContent.value && fullContent.value != '{}' &&
						h(
							ElButton as any,
							{
								type: 'success',
								size: 'small',
								onClick: toCopy
							} as any,
							{ default: () => '复制' }
						),
					slots.op && slots.op()
				]),
				h(
					ElScrollbar,
					{
						class: 'btc-code-json__content',
						maxHeight: props.maxHeight,
						height: props.height
					},
					{
						default: () =>
							h('pre', {}, [
								h('code', {}, fullContent.value)
							])
					}
				)
			]);
		};
	}
});
</script>

<style lang="scss">
.btc-code-json {
	position: relative;
	min-width: 200px;
	max-width: 500px;
	font-size: 14px;

	&__op {
		position: absolute;
		right: 8px;
		top: 8px;
		z-index: 9;
	}

	&__content {
		padding: 10px;

		code {
			white-space: pre-wrap;
			word-break: break-all;
		}
	}

	&__wrap {
		.btc-code-json__text {
			display: block;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			cursor: pointer;

			&:hover {
				color: var(--el-color-primary);
			}
		}
	}

	&__popper {
		padding: 0 !important;
		border-radius: 8px !important;
	}

	&__empty {
		color: var(--el-text-color-placeholder);
	}
}
</style>