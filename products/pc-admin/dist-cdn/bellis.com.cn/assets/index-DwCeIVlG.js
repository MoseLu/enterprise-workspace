import { b as defineComponent, n as createElementBlock, o as openBlock, q as createBaseVNode, t as createVNode, g as unref, A as BtcChartDemo, z as _export_sfc } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-CvJd6wHo.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "system-home" };
const _hoisted_2 = { class: "strategy-charts" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "SystemHome"
  },
  __name: "index",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(unref(BtcChartDemo), {
            gap: 10,
            "cols-per-row": 2,
            "chart-height": "300px"
          })
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a6e84d32"]]);
export {
  index as default
};
