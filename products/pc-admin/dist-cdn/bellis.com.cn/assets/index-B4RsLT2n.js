import { b as defineComponent, n as createElementBlock, o as openBlock, q as createBaseVNode, aT as renderSlot, t as createVNode, g as unref, _ as __unplugin_components_0, z as _export_sfc, aN as useI18n, j as computed, aF as withKeys, av as normalizeStyle, U as withModifiers, w as toDisplayString, I as nextTick, i as ref, C as watch, x as withCtx, y as createTextVNode, aU as ElCheckbox } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import { q as appConfig } from "./auth-api-Df5AdCU7.js";
const _hoisted_1$3 = { class: "auth-page" };
const _hoisted_2$3 = { class: "bg" };
const _hoisted_3$3 = { class: "auth-card" };
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcAuthLayout"
  },
  __name: "index",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$3, [
          createVNode(unref(__unplugin_components_0), { name: "bg" })
        ]),
        createBaseVNode("div", _hoisted_3$3, [
          renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ]),
        renderSlot(_ctx.$slots, "footer", {}, void 0, true)
      ]);
    };
  }
});
var BtcAuthLayout = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-d08228de"]]);
const _hoisted_1$2 = ["aria-label", "onKeydown"];
const _hoisted_2$2 = { class: "tips" };
const _hoisted_3$2 = { class: "tips-text" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcQrToggleBtn"
  },
  __name: "index",
  props: {
    label: { default: "" },
    icon: { default: "qr" }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t } = useI18n();
    const emit = __emit;
    function handleClick() {
      emit("click");
    }
    const labelText = computed(() => {
      return props.label || t("切换扫码登录");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "qr-toggle-btn",
        role: "button",
        tabindex: "0",
        "aria-label": labelText.value,
        style: normalizeStyle({
          // Y轴偏移：qr 模式(0%)，pc 模式(100%)
          "--sy": __props.icon === "pc" ? "100%" : "0%"
        }),
        onClick: handleClick,
        onKeydown: [
          withKeys(withModifiers(handleClick, ["prevent"]), ["enter"]),
          withKeys(withModifiers(handleClick, ["prevent"]), ["space"])
        ]
      }, [
        createBaseVNode("div", _hoisted_2$2, [
          _cache[0] || (_cache[0] = createBaseVNode("span", { class: "account" }, null, -1)),
          createBaseVNode("span", _hoisted_3$2, toDisplayString(labelText.value), 1)
        ]),
        _cache[1] || (_cache[1] = createBaseVNode("div", { class: "sprite-icon" }, null, -1))
      ], 44, _hoisted_1$2);
    };
  }
});
var BtcQrToggleBtn = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-009415dd"]]);
const _hoisted_1$1 = { class: "card-header" };
const _hoisted_2$1 = { class: "title" };
const _hoisted_3$1 = { class: "logo" };
const _hoisted_4 = ["src", "alt"];
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcAuthHeader"
  },
  __name: "index",
  props: {
    toggleIcon: { default: "qr" },
    toggleLabel: { default: "切换扫码登录" }
  },
  emits: ["toggle-qr"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function handleToggleQr() {
      emit("toggle-qr");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3$1, [
            createBaseVNode("img", {
              src: unref(appConfig).logo,
              alt: unref(appConfig).name
            }, null, 8, _hoisted_4)
          ]),
          createBaseVNode("h1", null, toDisplayString(unref(appConfig).name), 1)
        ]),
        renderSlot(_ctx.$slots, "toggle", {}, () => [
          createVNode(BtcQrToggleBtn, {
            icon: __props.toggleIcon,
            label: __props.toggleLabel,
            onClick: handleToggleQr
          }, null, 8, ["icon", "label"])
        ])
      ]);
    };
  }
});
function useFormEnterKey(options) {
  const { formRef, onSubmit, inputSelector = "input, textarea, select", skipDisabled = true } = options;
  function getInputElements() {
    if (!formRef.value) return [];
    const formElement = formRef.value.$el;
    if (!formElement) return [];
    const inputs = Array.from(formElement.querySelectorAll(inputSelector));
    if (skipDisabled) {
      return inputs.filter((el) => {
        const input = el;
        return !input.disabled && !input.hasAttribute("disabled");
      });
    }
    return inputs;
  }
  async function handleEnterKey(event, currentElement) {
    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    const target = currentElement || event.target;
    if (!target) return;
    const inputs = getInputElements();
    if (inputs.length === 0) return;
    let currentIndex = -1;
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (input && (input.contains(target) || input === target)) {
        currentIndex = i;
        break;
      }
    }
    if (currentIndex === -1) {
      currentIndex = inputs.findIndex((el) => el === target || el.querySelector("input") === target);
    }
    if (currentIndex === -1) {
      const rect = target.getBoundingClientRect();
      let closestIndex = -1;
      let minDistance = Infinity;
      inputs.forEach((input, index) => {
        const inputRect = input.getBoundingClientRect();
        const distance = Math.abs(rect.top - inputRect.top);
        if (distance < minDistance && rect.top <= inputRect.top) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      currentIndex = closestIndex >= 0 ? closestIndex : inputs.length - 1;
    }
    if (currentIndex >= 0 && currentIndex === inputs.length - 1) {
      event.preventDefault();
      await onSubmit();
      return;
    }
    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      event.preventDefault();
      await nextTick();
      const nextInput = inputs[currentIndex + 1];
      if (nextInput) {
        const innerInput = nextInput.querySelector("input") || nextInput.querySelector("textarea") || nextInput;
        if (innerInput && typeof innerInput.focus === "function") {
          innerInput.focus();
        } else if (typeof nextInput.focus === "function") {
          nextInput.focus();
        }
      }
    }
  }
  return {
    handleEnterKey,
    getInputElements
  };
}
const _hoisted_1 = { class: "agreement-text" };
const _hoisted_2 = { class: "agreement-content" };
const _hoisted_3 = {
  href: "/duty/agreement.html",
  target: "_blank",
  rel: "noopener noreferrer",
  class: "agreement-link"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcAgreementText"
  },
  __name: "index",
  emits: ["agreementChange"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const { t } = useI18n();
    const agreed = ref(false);
    const emit = __emit;
    const handleAgreementChange = (value) => {
      emit("agreementChange", value);
    };
    watch(agreed, (newValue) => {
      emit("agreementChange", newValue);
    });
    __expose({
      agreed,
      resetAgreement: () => {
        agreed.value = false;
      },
      // 自动勾选协议
      checkAgreement: () => {
        agreed.value = true;
      }
    });
    return (_ctx, _cache) => {
      const _component_el_checkbox = ElCheckbox;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_el_checkbox, {
          id: "agreement-checkbox",
          name: "agreement",
          modelValue: agreed.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => agreed.value = $event),
          size: "small",
          onChange: handleAgreementChange
        }, {
          default: withCtx(() => [
            createBaseVNode("span", _hoisted_2, [
              createTextVNode(toDisplayString(unref(t)("未注册手机验证后自动登录，注册即代表同意")) + " ", 1),
              createBaseVNode("a", _hoisted_3, toDisplayString(unref(t)("《拜里斯科技软件协议》")), 1)
            ])
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
var BtcAgreementText = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9407e3bf"]]);
export {
  BtcAgreementText as B,
  _sfc_main$1 as _,
  BtcAuthLayout as a,
  BtcQrToggleBtn as b,
  useFormEnterKey as u
};
