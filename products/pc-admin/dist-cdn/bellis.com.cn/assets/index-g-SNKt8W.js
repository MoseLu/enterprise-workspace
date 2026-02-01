import { b as defineComponent, i as ref, C as watch, n as createElementBlock, o as openBlock, F as Fragment, v as renderList, D as normalizeClass, G as withDirectives, H as vModelText, q as createBaseVNode, I as nextTick, z as _export_sfc } from "./vendor-tN3qNEcA.js";
const _hoisted_1 = { class: "sms-code-input" };
const _hoisted_2 = ["id", "name", "onUpdate:modelValue", "disabled", "onInput", "onKeydown", "onFocus"];
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcSmsCodeInput"
  },
  __name: "index",
  props: {
    modelValue: { default: "" },
    length: { default: 6 },
    disabled: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "complete"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const codes = ref(new Array(props.length).fill(""));
    const currentIndex = ref(-1);
    const inputRefs = ref([]);
    function setInputRef(el, index) {
      if (el) {
        inputRefs.value[index] = el;
      }
    }
    function handleInput(index, event) {
      const target = event.target;
      let value = target.value;
      if (!/^\d*$/.test(value)) {
        value = value.replace(/\D/g, "");
        target.value = value;
        codes.value[index] = value;
        return;
      }
      codes.value[index] = value;
      emitValue();
      if (value && index < props.length - 1) {
        nextTick(() => {
          inputRefs.value[index + 1]?.focus();
        });
      }
      checkComplete();
    }
    function handleKeydown(index, event) {
      const { key } = event;
      if (key === "Backspace") {
        if (!codes.value[index] && index > 0) {
          nextTick(() => {
            inputRefs.value[index - 1]?.focus();
          });
        } else {
          codes.value[index] = "";
          emitValue();
        }
      }
      if (key === "ArrowLeft" && index > 0) {
        nextTick(() => {
          inputRefs.value[index - 1]?.focus();
        });
      }
      if (key === "ArrowRight" && index < props.length - 1) {
        nextTick(() => {
          inputRefs.value[index + 1]?.focus();
        });
      }
      if (!/^\d$/.test(key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
        event.preventDefault();
      }
    }
    function handlePaste(event) {
      event.preventDefault();
      const pasteData = event.clipboardData?.getData("text") || "";
      const numbers = pasteData.replace(/\D/g, "");
      if (numbers.length > 0) {
        for (let i = 0; i < Math.min(numbers.length, props.length); i++) {
          codes.value[i] = numbers[i];
        }
        emitValue();
        checkComplete();
        const nextIndex = Math.min(numbers.length, props.length - 1);
        nextTick(() => {
          inputRefs.value[nextIndex]?.focus();
        });
      }
    }
    function emitValue() {
      const value = codes.value.join("");
      emit("update:modelValue", value);
    }
    function checkComplete() {
      const value = codes.value.join("");
      if (value.length === props.length) {
        emit("complete", value);
      }
    }
    function clearInput() {
      codes.value = new Array(props.length).fill("");
      emitValue();
      nextTick(() => {
        inputRefs.value[0]?.focus();
      });
    }
    function focus() {
      nextTick(() => {
        inputRefs.value[0]?.focus();
      });
    }
    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue !== codes.value.join("")) {
          const stringValue = String(newValue || "");
          const newCodes = stringValue.split("").slice(0, props.length);
          codes.value = [...newCodes, ...new Array(props.length - newCodes.length).fill("")];
        }
      },
      { immediate: true }
    );
    __expose({
      clearInput,
      focus
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(codes.value, (item, index) => {
          return openBlock(), createElementBlock("div", {
            key: index,
            class: normalizeClass(["code-box", { "active": currentIndex.value === index, "filled": item }])
          }, [
            withDirectives(createBaseVNode("input", {
              ref_for: true,
              ref: (el) => setInputRef(el, index),
              id: `sms-code-${index}`,
              name: `sms-code-${index}`,
              "onUpdate:modelValue": ($event) => codes.value[index] = $event,
              type: "text",
              inputmode: "numeric",
              autocomplete: "one-time-code",
              maxlength: "1",
              disabled: props.disabled,
              onInput: ($event) => handleInput(index, $event),
              onKeydown: ($event) => handleKeydown(index, $event),
              onPaste: handlePaste,
              onFocus: ($event) => currentIndex.value = index,
              onBlur: _cache[0] || (_cache[0] = ($event) => currentIndex.value = -1)
            }, null, 40, _hoisted_2), [
              [vModelText, codes.value[index]]
            ])
          ], 2);
        }), 128))
      ]);
    };
  }
});
var BtcSmsCodeInput = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-965515e5"]]);
export {
  BtcSmsCodeInput as B
};
