import { b as defineComponent, u as useI18n, i as ref, j as computed, f as createBlock, o as openBlock, g as unref, h as BtcIconButton } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-CvJd6wHo.js";
import { BtcMessagePanel } from "./index-BuZ9cvuO.js";
import "./echarts-vendor-B3YNM73f.js";
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcMessageIcon"
  },
  __name: "message-icon",
  setup(__props) {
    const { t } = useI18n();
    const unreadCount = ref(3);
    const hasUnread = computed(() => unreadCount.value > 0);
    const messageConfig = computed(() => ({
      icon: "msg",
      tooltip: t("common.tooltip.message"),
      class: hasUnread.value ? "btc-icon-button--breath btc-icon-button--breath--success" : "",
      popover: {
        component: BtcMessagePanel,
        width: 360,
        placement: "bottom-end",
        popperClass: "btc-message-popover"
      }
    }));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcIconButton), { config: messageConfig.value }, null, 8, ["config"]);
    };
  }
});
export {
  _sfc_main as default
};
