<template>
	<div
		class="qr-toggle-btn"
		role="button"
		tabindex="0"
		:aria-label="t(label || 'auth.login.toggle.qr')"
		:style="{
			// Y轴偏移：qr 模式(0%)，pc 模式(100%)
			'--sy': icon === 'pc' ? '100%' : '0%'
		}"
		@click="handleClick"
		@keydown.enter.prevent="emit('click')"
		@keydown.space.prevent="emit('click')"
	>
		<div class="tips">
			<span class="account"></span>
			<span class="tips-text">{{ t(label || 'auth.login.toggle.qr') }}</span>
		</div>
		<div class="sprite-icon"></div>
	</div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

defineOptions({
	name: 'QrToggleBtn'
});

const props = withDefaults(defineProps<{
	label?: string;
	icon?: string;
	onClick?: () => void;
}>(), {
	label: 'auth.login.toggle.qr',
	icon: 'qr'
});

const { t } = useI18n();
const emit = defineEmits<{ click: [] }>();

function handleClick() {
	emit('click');
}
</script>

<style lang="scss">
@use './qr-toggle-btn.scss';
</style>