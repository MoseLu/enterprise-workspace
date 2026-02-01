import { b as defineComponent, k as useRouter, m as useI18n, j as computed, n as createElementBlock, o as openBlock, q as createBaseVNode, t as createVNode, _ as __unplugin_components_0, F as Fragment, v as renderList, w as toDisplayString, x as withCtx, y as createTextVNode, g as unref, E as ElButton, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./auth-api-Df5AdCU7.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "error-page" };
const _hoisted_2 = { class: "error-page__wrap" };
const _hoisted_3 = { class: "error-page__code" };
const _hoisted_4 = { class: "error-page__btns" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "NotFound404"
  },
  __name: "index",
  props: {
    code: { default: 404 },
    desc: { default: "" }
  },
  setup(__props) {
    const props = __props;
    const router = useRouter();
    const { t } = useI18n();
    const codes = computed(() => {
      return (props.code || 404).toString().split("");
    });
    computed(() => {
      return props.desc || t("common.page_not_found");
    });
    function home() {
      router.push("/");
    }
    function goBack() {
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    }
    return (_ctx, _cache) => {
      const _component_btc_svg = __unplugin_components_0;
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_btc_svg, {
            name: "404",
            class: "error-page__icon",
            size: 200
          }),
          createBaseVNode("h1", _hoisted_3, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(codes.value, (c) => {
              return openBlock(), createElementBlock("span", { key: c }, toDisplayString(c), 1);
            }), 128))
          ]),
          createBaseVNode("div", _hoisted_4, [
            createVNode(_component_el_button, { onClick: home }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(t)("common.back_home")), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: goBack
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(t)("common.go_back")), 1)
              ]),
              _: 1
            })
          ])
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-80c86ce6"]]);
export {
  index as default
};
