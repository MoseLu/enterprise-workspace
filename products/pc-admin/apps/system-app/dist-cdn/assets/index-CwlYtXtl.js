import { b as defineComponent, m as useI18n, i as ref, f as createBlock, o as openBlock, x as withCtx, t as createVNode, ar as ElDropdownMenu, n as createElementBlock, F as Fragment, v as renderList, as as ElDropdownItem, q as createBaseVNode, D as normalizeClass, g as unref, N as createCommentVNode, w as toDisplayString, h as BtcIconButton, at as ElDropdown, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./auth-api-Df5AdCU7.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "locale-switcher__item-label" };
const _hoisted_2 = {
  key: 0,
  class: "locale-switcher__item-dot"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "LayoutLocaleSwitcher"
  },
  __name: "index",
  setup(__props) {
    const { locale, t } = useI18n();
    const languages = ref([
      {
        label: "简体中文",
        // 简体中文
        value: "zh-CN"
      },
      {
        label: "English",
        value: "en-US"
      }
    ]);
    const handleCommand = (value) => {
      locale.value = value;
      localStorage.setItem("locale", value);
      window.dispatchEvent(new CustomEvent("language-change", {
        detail: { locale: value }
      }));
    };
    return (_ctx, _cache) => {
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      return openBlock(), createBlock(_component_el_dropdown, {
        trigger: "click",
        onCommand: handleCommand
      }, {
        default: withCtx(() => [
          createVNode(unref(BtcIconButton), {
            config: {
              icon: "lang",
              tooltip: unref(t)("common.tooltip.locale")
            }
          }, null, 8, ["config"])
        ]),
        dropdown: withCtx(() => [
          createVNode(_component_el_dropdown_menu, null, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(languages.value, (lang) => {
                return openBlock(), createBlock(_component_el_dropdown_item, {
                  key: lang.value,
                  command: lang.value
                }, {
                  default: withCtx(() => [
                    createBaseVNode("div", {
                      class: normalizeClass(["locale-switcher__item", { active: unref(locale) === lang.value }])
                    }, [
                      createBaseVNode("span", _hoisted_1, toDisplayString(lang.label), 1),
                      unref(locale) === lang.value ? (openBlock(), createElementBlock("span", _hoisted_2)) : createCommentVNode("", true)
                    ], 2)
                  ]),
                  _: 2
                }, 1032, ["command"]);
              }), 128))
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-685aaf31"]]);
export {
  index as default
};
