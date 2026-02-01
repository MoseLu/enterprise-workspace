/**
 * 用户设置 Composables 统一导出
 * 
 * ⚠️ 重要：为了避免循环依赖，此文件已被禁用
 * 请直接从具体文件导入，例如：
 * - import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
 * - import { useSettingsHandlers } from '@/plugins/user-setting/composables/useSettingsHandlers';
 * - import { useUserSetting } from '@/plugins/user-setting/composables/useThemeSwitcher';
 * - import { useSettingsConfig } from '@/plugins/user-setting/composables/useSettingsConfig';
 * 
 * 原因：export { ... } from '...' 语句会在模块加载时立即执行，
 * 即使函数本身是延迟的，也会导致循环依赖问题。
 */

// 所有导出已禁用，请直接从具体文件导入
// export { useUserSetting } from './useThemeSwitcher';
// export { useSettingsConfig } from './useSettingsConfig';
// export { useSettingsHandlers } from './useSettingsHandlers';
// export { useSettingsState } from './useSettingsState';

