import { b as defineComponent, u as useI18n, i as ref, j as computed, f as createBlock, o as openBlock, g as unref, h as BtcIconButton } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-CvJd6wHo.js";
import { BtcNotificationPanel } from "./index-BN3GQ4LT.js";
import "./echarts-vendor-B3YNM73f.js";
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcNotificationIcon"
  },
  __name: "notification-icon",
  setup(__props) {
    const { t } = useI18n();
    const unreadCount = ref(6);
    const hasUnread = computed(() => unreadCount.value > 0);
    const notificationConfig = computed(() => ({
      icon: "notice",
      tooltip: t("common.tooltip.notification"),
      class: hasUnread.value ? "btc-icon-button--breath btc-icon-button--breath--warning" : "",
      popover: {
        component: BtcNotificationPanel,
        width: 360,
        placement: "bottom-end",
        popperClass: "btc-notification-popover"
      }
    }));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcIconButton), { config: notificationConfig.value }, null, 8, ["config"]);
    };
  }
});
export {
  _sfc_main as default
};
