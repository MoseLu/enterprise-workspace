<template>
	<div class="third-party-login">
		<!-- 忘记密码组件 - 只在密码登录时显示 -->
		<ForgotPassword v-if="showForgotPassword" />

		<!-- 忘记密码占位空间 - 手机号登录时显示，保持布局一致 -->
		<div v-else class="forgot-password-placeholder"></div>

		<AuthDivider />
		<LoginOptions />
	</div>
</template>

<script lang="ts" setup>
import ForgotPassword from './forgot-password/index.vue';
import AuthDivider from './divider/index.vue';
import LoginOptions from './login-options/index.vue';

defineOptions({
	name: 'ThirdPartyLogin'
});

// Props
interface Props {
	showForgotPassword?: boolean;
}

withDefaults(defineProps<Props>(), {
	showForgotPassword: false
});
</script>

<style lang="scss" scoped>
.third-party-login {
	.forgot-password-placeholder {
		height: 40px; /* 与忘记密码组件保持相同高度 */
	}
}
</style>
