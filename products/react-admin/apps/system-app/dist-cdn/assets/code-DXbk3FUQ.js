import { b as defineComponent, u as useI18n, f as createBlock, o as openBlock, g as unref, h as BtcIconButton } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-CvJd6wHo.js";
import "./echarts-vendor-B3YNM73f.js";
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcGithubCode"
  },
  __name: "code",
  setup(__props) {
    const { t } = useI18n();
    function toCode() {
      window.open("https://github.com/BellisGit/btc-shopflow.git", "_blank");
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcIconButton), {
        config: {
          icon: "github",
          tooltip: unref(t)("common.tooltip.github"),
          onClick: toCode
        }
      }, null, 8, ["config"]);
    };
  }
});
export {
  _sfc_main as default
};
