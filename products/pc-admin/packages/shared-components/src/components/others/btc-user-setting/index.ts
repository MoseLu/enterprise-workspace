/**
 * 用户设置组件统一导出
 */

import BtcUserSetting from './index.vue';
import BtcUserSettingDrawer from './components/preferences-drawer.vue';

export { BtcUserSetting, BtcUserSettingDrawer };
export { useUserSetting } from './composables';
export * from './composables';

export default BtcUserSetting;

