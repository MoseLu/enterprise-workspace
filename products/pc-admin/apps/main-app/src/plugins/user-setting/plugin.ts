import type { Plugin } from '@btc/shared-core';
import { userSettingPlugin } from './index';

/**
 * 兼容 system-app 的插件自动扫描器：
 * - module-scanner.ts 会 eager 扫描 /src/plugins/**\/plugin.ts
 * - 将 user-setting 作为核心插件在构建期稳定纳入，避免生产环境因动态 chunk 缓存不一致导致未注册/未安装
 */
export default userSettingPlugin as Plugin;


