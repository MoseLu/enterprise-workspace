import { b as defineComponent, aN as useI18n, k as useRouter, aR as resolveComponent, n as createElementBlock, N as createCommentVNode, o as openBlock, q as createBaseVNode, t as createVNode, g as unref, ba as BtcTabs, x as withCtx, y as createTextVNode, w as toDisplayString, P as ElIcon, aS as arrow_right_default, aT as renderSlot, z as _export_sfc, i as ref, K as onMounted, bb as onUnmounted, J as reactive, f as createBlock, aO as ElFormItem, a0 as ElInput, aF as withKeys, E as ElButton, U as withModifiers, aP as ElForm, aQ as useSmsCode, B as BtcMessage, I as nextTick, F as Fragment, v as renderList, av as normalizeStyle, bc as arrow_left_default, bd as createStaticVNode, be as useRoute, j as computed } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import { s as appStorage, o as authApi, _ as __vitePreload } from "./auth-api-CvJd6wHo.js";
import { u as useFormEnterKey, _ as _sfc_main$9, b as BtcQrToggleBtn, B as BtcAgreementText, a as BtcAuthLayout } from "./index-D0qIuX0u.js";
import { c as codeApi } from "./index-wPsyA9WS.js";
import { B as BtcSmsCodeInput } from "./index-g-SNKt8W.js";
import { useUser } from "./useUser-DIG-AInn.js";
import "./echarts-vendor-B3YNM73f.js";
import "./eps-service-BXEAd5O1.js";
const _hoisted_1$7 = {
  key: 0,
  class: "login-tabs"
};
const _hoisted_2$3 = { class: "tabs-wrapper" };
const _hoisted_3$2 = { class: "register-link" };
var _sfc_main$8 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcLoginTabs"
  },
  __name: "index",
  props: {
    currentMode: {}
  },
  emits: ["tab-change", "go-to-register"],
  setup(__props, { emit: __emit }) {
    const { t } = useI18n();
    useRouter();
    const emit = __emit;
    const tabs = [
      { name: "password", label: t("账号登录") },
      { name: "sms", label: t("手机号登录") }
    ];
    function handleTabChange(tab, index) {
      const mode = tab?.name || tabs[index]?.name;
      if (mode) {
        emit("tab-change", mode);
      }
    }
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_router_link = resolveComponent("router-link");
      return __props.currentMode !== "qr" ? (openBlock(), createElementBlock("div", _hoisted_1$7, [
        createBaseVNode("div", _hoisted_2$3, [
          createVNode(unref(BtcTabs), {
            "model-value": __props.currentMode,
            tabs,
            onTabChange: handleTabChange
          }, null, 8, ["model-value"])
        ]),
        createBaseVNode("div", _hoisted_3$2, [
          createVNode(_component_router_link, {
            to: "/register",
            class: "register-link-a"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(_ctx.$t("前往注册")) + " ", 1),
              createVNode(_component_el_icon, { class: "arrow-right" }, {
                default: withCtx(() => [
                  createVNode(unref(arrow_right_default))
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$6 = { class: "login-form-layout" };
const _hoisted_2$2 = { class: "form-container" };
const _hoisted_3$1 = { class: "bottom-section" };
const _hoisted_4$1 = { class: "button-container" };
const _hoisted_5$1 = { class: "extra-container" };
var _sfc_main$7 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcLoginFormLayout"
  },
  __name: "index",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        createBaseVNode("div", _hoisted_2$2, [
          renderSlot(_ctx.$slots, "form", {}, void 0, true)
        ]),
        createBaseVNode("div", _hoisted_3$1, [
          createBaseVNode("div", _hoisted_4$1, [
            renderSlot(_ctx.$slots, "button", {}, void 0, true)
          ]),
          createBaseVNode("div", _hoisted_5$1, [
            renderSlot(_ctx.$slots, "extra", {}, void 0, true)
          ])
        ])
      ]);
    };
  }
});
var BtcLoginFormLayout = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-03e38287"]]);
function useDisableAutofill() {
  const observers = ref([]);
  const generateRandomName = (prefix = "field") => {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  };
  const delaySetPasswordType = (inputElement) => {
    inputElement.type = "text";
    setTimeout(() => {
      inputElement.type = "password";
    }, 100);
  };
  const setupInputObserver = (container) => {
    const inputs = container.querySelectorAll('input[type="password"], input[type="text"]');
    inputs.forEach((input) => {
      const inputElement = input;
      inputElement.name = generateRandomName(inputElement.type);
      if (inputElement.type === "password") {
        delaySetPasswordType(inputElement);
      }
      const handleFocus = () => {
        inputElement.name = generateRandomName(inputElement.type);
        inputElement.autocomplete = "off";
      };
      inputElement.addEventListener("focus", handleFocus);
      const cleanup2 = () => {
        inputElement.removeEventListener("focus", handleFocus);
      };
      inputElement.__autofillCleanup = cleanup2;
    });
  };
  const createDOMObserver = (container) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.tagName === "INPUT") {
              setupInputObserver(element.parentElement || container);
            }
            if (element.querySelectorAll && typeof element.querySelectorAll === "function") {
              setupInputObserver(element);
            }
          }
        });
      });
    });
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    return observer;
  };
  const initDisableAutofill = (containerSelector = ".auth-page") => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn(`Container ${containerSelector} not found`);
      return;
    }
    setupInputObserver(container);
    const observer = createDOMObserver(container);
    observers.value.push(observer);
  };
  const cleanup = () => {
    observers.value.forEach((observer) => observer.disconnect());
    observers.value = [];
    const inputs = document.querySelectorAll('input[type="password"], input[type="text"]');
    inputs.forEach((input) => {
      const cleanup2 = input.__autofillCleanup;
      if (cleanup2) {
        cleanup2();
        delete input.__autofillCleanup;
      }
    });
  };
  onMounted(() => {
    setTimeout(() => {
      initDisableAutofill();
    }, 100);
  });
  onUnmounted(() => {
    cleanup();
  });
  return {
    generateRandomName,
    delaySetPasswordType,
    initDisableAutofill,
    cleanup
  };
}
const _hoisted_1$5 = { class: "forgot-password-link" };
var _sfc_main$6 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcPasswordForm"
  },
  __name: "index",
  props: {
    loading: { type: Boolean, default: false }
  },
  emits: ["submit"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    const form = reactive({
      username: localStorage.getItem("username") || "",
      password: ""
    });
    const rules = reactive({
      username: [
        { required: true, message: t("请输入用户名或邮箱"), trigger: "blur" },
        { min: 2, max: 50, message: t("用户名长度在 2 到 50 个字符"), trigger: "blur" }
      ],
      password: [
        { required: true, message: t("请输入密码"), trigger: "blur" },
        { min: 6, max: 20, message: t("密码长度在 6 到 20 个字符"), trigger: "blur" }
      ]
    });
    const formRef = ref();
    const handleSubmit = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        emit("submit", { ...form });
      } catch {
      }
    };
    const { handleEnterKey } = useFormEnterKey({
      formRef,
      onSubmit: handleSubmit
    });
    useDisableAutofill();
    __expose({
      form,
      validate: () => formRef.value?.validate(),
      resetFields: () => formRef.value?.resetFields()
    });
    return (_ctx, _cache) => {
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_button = ElButton;
      const _component_el_form = ElForm;
      const _component_el_icon = ElIcon;
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createBlock(BtcLoginFormLayout, null, {
        form: withCtx(() => [
          createVNode(_component_el_form, {
            ref_key: "formRef",
            ref: formRef,
            model: form,
            rules,
            "label-width": 0,
            class: "form",
            autocomplete: "off",
            name: "password-login-form",
            onSubmit: withModifiers(handleSubmit, ["prevent"])
          }, {
            default: withCtx(() => [
              _cache[4] || (_cache[4] = createBaseVNode("input", {
                id: "fake-username",
                name: "fake-username",
                type: "text",
                style: { "position": "absolute", "left": "-9999px", "opacity": "0", "pointer-events": "none" },
                tabindex: "-1"
              }, null, -1)),
              _cache[5] || (_cache[5] = createBaseVNode("input", {
                id: "fake-password",
                name: "fake-password",
                type: "password",
                style: { "position": "absolute", "left": "-9999px", "opacity": "0", "pointer-events": "none" },
                tabindex: "-1"
              }, null, -1)),
              createVNode(_component_el_form_item, { prop: "username" }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    id: "login-username",
                    modelValue: form.username,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.username = $event),
                    name: `username_${Math.random().toString(36).substr(2, 9)}`,
                    autocomplete: "off",
                    placeholder: unref(t)("请输入用户名或邮箱"),
                    size: "large",
                    maxlength: "50",
                    onKeyup: _cache[1] || (_cache[1] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                  }, null, 8, ["modelValue", "name", "placeholder"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, { prop: "password" }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    id: "login-password",
                    modelValue: form.password,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.password = $event),
                    name: `password_${Math.random().toString(36).substr(2, 9)}`,
                    type: "password",
                    autocomplete: "off",
                    placeholder: unref(t)("请输入密码"),
                    size: "large",
                    "show-password": "",
                    maxlength: "20",
                    onKeyup: _cache[3] || (_cache[3] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                  }, null, 8, ["modelValue", "name", "placeholder"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, null, {
                default: withCtx(() => [
                  createVNode(_component_el_button, {
                    type: "primary",
                    size: "large",
                    loading: __props.loading,
                    "native-type": "submit"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("立即登录")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model", "rules"])
        ]),
        extra: withCtx(() => [
          createBaseVNode("div", _hoisted_1$5, [
            createVNode(_component_router_link, {
              to: "/forget-password",
              class: "link"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(t)("忘记密码？")) + " ", 1),
                createVNode(_component_el_icon, { class: "arrow-right" }, {
                  default: withCtx(() => [
                    createVNode(unref(arrow_right_default))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ])
        ]),
        _: 1
      });
    };
  }
});
var BtcPasswordForm = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-29b179e6"]]);
var _sfc_main$5 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcSmsForm"
  },
  __name: "index",
  props: {
    loading: { type: Boolean, default: false }
  },
  emits: ["submit", "send-sms", "code-complete"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    const form = reactive({
      phone: "",
      smsCode: ""
    });
    const rules = reactive({
      phone: [
        { required: true, message: t("请输入手机号"), trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: t("请输入正确的手机号"), trigger: "blur" }
      ],
      smsCode: [
        { required: true, message: t("请输入验证码"), trigger: "blur" },
        { len: 6, message: t("验证码长度为6位"), trigger: "blur" }
      ]
    });
    const formRef = ref();
    const {
      countdown,
      sending,
      hasSent,
      canSend,
      send: sendCode
    } = useSmsCode({
      sendSmsCode: codeApi.sendSmsCode,
      countdown: 60,
      minInterval: 60,
      onSuccess: () => {
        BtcMessage.success(t("验证码已发送"));
        emit("send-sms");
      },
      onError: (error) => {
        BtcMessage.error(error.message || t("发送验证码失败"));
      }
    });
    const handleSubmit = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        emit("submit", { ...form });
      } catch {
      }
    };
    const { handleEnterKey: handleFormEnterKey } = useFormEnterKey({
      formRef,
      onSubmit: handleSubmit
    });
    const handleSendSmsCode = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validateField("phone");
        await sendCode(form.phone, "login");
      } catch {
      }
    };
    const handlePhoneEnter = async (event) => {
      if (!hasSent.value) {
        event.preventDefault();
        await handleSendSmsCode();
        if (hasSent.value) {
          await nextTick();
          handleFormEnterKey(event, event.target);
        }
      } else {
        handleFormEnterKey(event, event.target);
      }
    };
    const handleCodeComplete = () => {
      emit("code-complete");
    };
    __expose({
      form,
      validate: () => formRef.value?.validate(),
      resetFields: () => formRef.value?.resetFields(),
      countdown,
      hasSent,
      handleSendSmsCode
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      return openBlock(), createBlock(BtcLoginFormLayout, null, {
        form: withCtx(() => [
          createVNode(_component_el_form, {
            ref_key: "formRef",
            ref: formRef,
            model: form,
            rules,
            "label-width": 0,
            class: "form",
            name: "sms-login-form",
            onSubmit: withModifiers(handleSubmit, ["prevent"])
          }, {
            default: withCtx(() => [
              createVNode(_component_el_form_item, { prop: "phone" }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    id: "sms-phone",
                    modelValue: form.phone,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.phone = $event),
                    name: "phone",
                    autocomplete: "tel",
                    placeholder: unref(t)("请输入手机号"),
                    size: "large",
                    maxlength: "11",
                    class: "phone-input",
                    onKeyup: withKeys(handlePhoneEnter, ["enter"])
                  }, {
                    suffix: withCtx(() => [
                      createVNode(_component_el_button, {
                        disabled: !unref(canSend) || !form.phone,
                        loading: unref(sending),
                        onClick: handleSendSmsCode,
                        class: "sms-btn",
                        "native-type": "button"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(countdown) > 0 ? `${unref(countdown)}s` : unref(t)("获取验证码")), 1)
                        ]),
                        _: 1
                      }, 8, ["disabled", "loading"])
                    ]),
                    _: 1
                  }, 8, ["modelValue", "placeholder"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, { prop: "smsCode" }, {
                default: withCtx(() => [
                  createVNode(BtcSmsCodeInput, {
                    modelValue: form.smsCode,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.smsCode = $event),
                    disabled: !unref(hasSent),
                    onComplete: handleCodeComplete
                  }, null, 8, ["modelValue", "disabled"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, null, {
                default: withCtx(() => [
                  createVNode(_component_el_button, {
                    type: "primary",
                    size: "large",
                    loading: __props.loading,
                    disabled: !form.smsCode || form.smsCode.length !== 6,
                    "native-type": "submit"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("立即登录")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model", "rules"])
        ]),
        _: 1
      });
    };
  }
});
var BtcSmsForm = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-93bc1fa8"]]);
var loginQrImage = "data:image/png;base64,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";
const _hoisted_1$4 = { class: "qr-login" };
const _hoisted_2$1 = { class: "qr-container" };
const _hoisted_3 = { class: "qr-code" };
const _hoisted_4 = ["src"];
const _hoisted_5 = { class: "qr-tips" };
var _sfc_main$4 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcQrForm"
  },
  __name: "index",
  props: {
    qrCodeUrl: {}
  },
  emits: ["refresh"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    const handleRefreshQrCode = () => {
      emit("refresh");
    };
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("img", {
              src: __props.qrCodeUrl || unref(loginQrImage),
              alt: "扫码登录"
            }, null, 8, _hoisted_4)
          ]),
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode("p", null, toDisplayString(unref(t)("请使用BTC移动端扫描二维码登录")), 1),
            createVNode(_component_el_button, { onClick: handleRefreshQrCode }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(t)("刷新二维码")), 1)
              ]),
              _: 1
            })
          ])
        ])
      ]);
    };
  }
});
var BtcQrForm = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-20265d37"]]);
const _hoisted_1$3 = { class: "divider-text" };
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcAuthDivider"
  },
  __name: "index",
  setup(__props) {
    const dividerRef = ref();
    const leftLineRef = ref();
    const rightLineRef = ref();
    const leftArrowCount = ref(3);
    const rightArrowCount = ref(3);
    const calculateArrowCount = () => {
      if (!leftLineRef.value || !rightLineRef.value) return;
      const arrowWidth = 16;
      const minSpacing = 4;
      const leftWidth = leftLineRef.value.offsetWidth;
      const rightWidth = rightLineRef.value.offsetWidth;
      const leftCount = Math.max(2, Math.floor((leftWidth - minSpacing) / arrowWidth));
      const rightCount = Math.max(2, Math.floor((rightWidth - minSpacing) / arrowWidth));
      leftArrowCount.value = Math.min(leftCount, 12);
      rightArrowCount.value = Math.min(rightCount, 12);
    };
    const handleResize = () => {
      nextTick(() => {
        calculateArrowCount();
      });
    };
    onMounted(() => {
      nextTick(() => {
        calculateArrowCount();
      });
      window.addEventListener("resize", handleResize);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      return openBlock(), createElementBlock("div", {
        class: "divider",
        ref_key: "dividerRef",
        ref: dividerRef
      }, [
        createBaseVNode("div", {
          class: "divider-line left-arrows",
          ref_key: "leftLineRef",
          ref: leftLineRef
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(leftArrowCount.value, (n) => {
            return openBlock(), createBlock(_component_el_icon, {
              key: `left-${n}`,
              class: "arrow",
              style: normalizeStyle({ animationDelay: `${(n - 1) * 0.2}s` })
            }, {
              default: withCtx(() => [
                createVNode(unref(arrow_right_default))
              ]),
              _: 1
            }, 8, ["style"]);
          }), 128))
        ], 512),
        createBaseVNode("span", _hoisted_1$3, toDisplayString(_ctx.$t("其他方式登录")), 1),
        createBaseVNode("div", {
          class: "divider-line right-arrows",
          ref_key: "rightLineRef",
          ref: rightLineRef
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(rightArrowCount.value, (n) => {
            return openBlock(), createBlock(_component_el_icon, {
              key: `right-${n}`,
              class: "arrow",
              style: normalizeStyle({ animationDelay: `${(n - 1) * 0.2}s` })
            }, {
              default: withCtx(() => [
                createVNode(unref(arrow_left_default))
              ]),
              _: 1
            }, 8, ["style"]);
          }), 128))
        ], 512)
      ], 512);
    };
  }
});
var BtcAuthDivider = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-37676c2d"]]);
const _hoisted_1$2 = { class: "login-options" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcLoginOptions"
  },
  __name: "index",
  setup(__props) {
    function onWechatLogin() {
      BtcMessage.info("微信登录功能暂未开启");
    }
    function onAppLogin() {
      BtcMessage.info("APP登录功能暂未开启");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", {
          class: "login-option",
          onClick: onWechatLogin
        }, [
          _cache[0] || (_cache[0] = createBaseVNode("svg", {
            width: "32",
            height: "32",
            fill: "none",
            viewBox: "0 0 24 24",
            class: "wechat-icon"
          }, [
            createBaseVNode("path", {
              fill: "currentColor",
              d: "M20.314 18.59c1.333-.968 2.186-2.397 2.186-3.986 0-2.91-2.833-5.27-6.325-5.27-3.494 0-6.325 2.36-6.325 5.27 0 2.911 2.831 5.271 6.325 5.271.698.001 1.393-.096 2.064-.288l.186-.029c.122 0 .232.038.336.097l1.386.8.12.04a.21.21 0 0 0 .212-.211l-.034-.154-.285-1.063-.023-.135a.42.42 0 0 1 .177-.343ZM9.09 3.513C4.9 3.514 1.5 6.346 1.5 9.84c0 1.905 1.022 3.622 2.622 4.781a.505.505 0 0 1 .213.412l-.026.16-.343 1.276-.04.185c0 .14.113.254.252.254l.146-.047 1.663-.96a.793.793 0 0 1 .403-.116l.222.032c.806.231 1.64.348 2.478.348l.417-.01a4.888 4.888 0 0 1-.255-1.55c0-3.186 3.1-5.77 6.923-5.77l.411.011c-.57-3.02-3.71-5.332-7.494-5.332Zm4.976 10.248a.843.843 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001Zm4.217 0a1.012 1.012 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001ZM6.561 8.827a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Zm5.061 0a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Z",
              "clip-rule": "evenodd"
            })
          ], -1)),
          createBaseVNode("span", null, toDisplayString(_ctx.$t("微信登录")), 1)
        ]),
        createBaseVNode("div", {
          class: "login-option",
          onClick: onAppLogin
        }, [
          _cache[1] || (_cache[1] = createStaticVNode('<svg width="32" height="32" fill="none" viewBox="0 0 24 24" class="app-icon"><path fill="currentColor" d="M7 2C5.9 2 5 2.9 5 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H7zm0 2h10v12H7V4zm0 14h10v2H7v-2z"></path><circle fill="currentColor" cx="12" cy="19" r="1"></circle><rect fill="currentColor" x="8" y="6" width="8" height="1" rx="0.5"></rect><rect fill="currentColor" x="8" y="8" width="6" height="1" rx="0.5"></rect><rect fill="currentColor" x="8" y="10" width="7" height="1" rx="0.5"></rect></svg>', 1)),
          createBaseVNode("span", null, toDisplayString(_ctx.$t("APP登录")), 1)
        ])
      ]);
    };
  }
});
const _hoisted_1$1 = { class: "third-party-login" };
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcThirdPartyLogin"
  },
  __name: "index",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createVNode(BtcAuthDivider),
        createVNode(_sfc_main$2)
      ]);
    };
  }
});
function useAuthTabs(initialMode = "password") {
  const currentLoginMode = ref(initialMode);
  const isQrMode = ref(false);
  const switchLoginMode = (mode) => {
    if (mode === "qr") {
      isQrMode.value = true;
      currentLoginMode.value = "qr";
    } else {
      isQrMode.value = false;
      currentLoginMode.value = mode;
    }
  };
  const toggleQrLogin = () => {
    if (isQrMode.value) {
      isQrMode.value = false;
      currentLoginMode.value = "password";
    } else {
      isQrMode.value = true;
      currentLoginMode.value = "qr";
    }
  };
  const getToggleInfo = () => {
    if (isQrMode.value) {
      return {
        icon: "pc",
        label: "切换账号登录"
      };
    } else {
      return {
        icon: "qr",
        label: "切换扫码登录"
      };
    }
  };
  return {
    currentLoginMode,
    isQrMode,
    switchLoginMode,
    toggleQrLogin,
    getToggleInfo
  };
}
function usePasswordLogin() {
  const router = useRouter();
  const route = useRoute();
  const { setUserInfo } = useUser();
  const { t } = useI18n();
  const getStoredUsername = () => {
    return appStorage.user.getUsername() || "";
  };
  const form = reactive({
    username: getStoredUsername(),
    password: ""
  });
  const loading = ref(false);
  const submit = async (formData) => {
    try {
      loading.value = true;
      await authApi.login({
        username: formData.username,
        password: formData.password
      });
      BtcMessage.success(t("登录成功"));
      const currentSettings = appStorage.settings.get() || {};
      appStorage.settings.set({ ...currentSettings, is_logged_in: true });
      const { handleCrossAppRedirect, getAndClearLogoutRedirectPath } = await __vitePreload(async () => {
        const { handleCrossAppRedirect: handleCrossAppRedirect2, getAndClearLogoutRedirectPath: getAndClearLogoutRedirectPath2 } = await import("https://all.bellis.com.cn/system-app/assets/redirect-tCAsL96e.js");
        return { handleCrossAppRedirect: handleCrossAppRedirect2, getAndClearLogoutRedirectPath: getAndClearLogoutRedirectPath2 };
      }, true ? [] : void 0);
      let redirectPath;
      const urlRedirect = route.query.redirect;
      if (urlRedirect) {
        redirectPath = urlRedirect.split("?")[0];
      } else {
        const savedPath = getAndClearLogoutRedirectPath();
        redirectPath = savedPath || "/";
      }
      const isCrossAppRedirect = handleCrossAppRedirect(redirectPath, router);
      if (!isCrossAppRedirect) {
        window.location.href = redirectPath;
      }
    } catch (error) {
      console.error("登录错误:", error);
      BtcMessage.error(error.message || t("登录失败"));
      throw error;
    } finally {
      loading.value = false;
    }
  };
  return {
    form,
    loading,
    submit
  };
}
function useSmsLogin() {
  const router = useRouter();
  const route = useRoute();
  const { setUserInfo } = useUser();
  const { t } = useI18n();
  const form = reactive({
    phone: "",
    smsCode: ""
  });
  const loading = ref(false);
  const submit = async (formData) => {
    try {
      loading.value = true;
      await authApi.loginBySms({
        phone: formData.phone,
        smsCode: formData.smsCode,
        smsType: "login"
      });
      BtcMessage.success(t("登录成功"));
      const currentSettings = appStorage.settings.get() || {};
      appStorage.settings.set({ ...currentSettings, is_logged_in: true });
      const { handleCrossAppRedirect, getAndClearLogoutRedirectPath } = await __vitePreload(async () => {
        const { handleCrossAppRedirect: handleCrossAppRedirect2, getAndClearLogoutRedirectPath: getAndClearLogoutRedirectPath2 } = await import("https://all.bellis.com.cn/system-app/assets/redirect-tCAsL96e.js");
        return { handleCrossAppRedirect: handleCrossAppRedirect2, getAndClearLogoutRedirectPath: getAndClearLogoutRedirectPath2 };
      }, true ? [] : void 0);
      let redirectPath;
      const urlRedirect = route.query.redirect;
      if (urlRedirect) {
        redirectPath = urlRedirect.split("?")[0];
      } else {
        const savedPath = getAndClearLogoutRedirectPath();
        redirectPath = savedPath || "/";
      }
      const isCrossAppRedirect = handleCrossAppRedirect(redirectPath, router);
      if (!isCrossAppRedirect) {
        window.location.href = redirectPath;
      }
    } catch (error) {
      console.error("登录错误:", error);
      BtcMessage.error(error.message || t("登录失败"));
    } finally {
      loading.value = false;
    }
  };
  return {
    form,
    loading,
    submit
  };
}
function useQrLogin() {
  const { t } = useI18n();
  const qrCodeUrl = ref(loginQrImage);
  const refreshQrCode = async () => {
    try {
      BtcMessage.info(t("二维码登录功能暂未开启"));
    } catch (error) {
      console.error("刷新二维码错误:", error);
      BtcMessage.error(error.message || t("刷新二维码失败"));
    }
  };
  return {
    qrCodeUrl,
    refreshQrCode
  };
}
const _hoisted_1 = { class: "login-card" };
const _hoisted_2 = { class: "card-content" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "Login"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const agreementRef = ref();
    const isAgreed = ref(false);
    const { currentLoginMode, switchLoginMode, toggleQrLogin, getToggleInfo } = useAuthTabs("password");
    const { loading: passwordLoading, submit: passwordSubmit } = usePasswordLogin();
    const { loading: smsLoading, submit: smsSubmit } = useSmsLogin();
    const { qrCodeUrl, refreshQrCode } = useQrLogin();
    const handleSwitchLoginMode = (mode) => {
      switchLoginMode(mode);
    };
    const handleToggleQrLogin = () => {
      toggleQrLogin();
    };
    const toggleInfo = computed(() => {
      return getToggleInfo();
    });
    const handleAgreementChange = (agreed) => {
      isAgreed.value = agreed;
    };
    const checkAgreement = () => {
      if (!isAgreed.value) {
        if (agreementRef.value) {
          agreementRef.value.checkAgreement();
        }
        BtcMessage.success(t("auth.message.agreement_auto_checked"));
        return false;
      }
      return true;
    };
    const handlePasswordSubmit = async (form) => {
      try {
        if (!checkAgreement()) {
          return;
        }
        await passwordSubmit(form);
      } catch (error) {
        console.error("密码登录错误:", error);
      }
    };
    const handleSmsSubmit = async (form) => {
      try {
        if (!checkAgreement()) {
          return;
        }
        await smsSubmit(form);
      } catch (error) {
        console.error("短信登录错误:", error);
      }
    };
    const handleSendSms = () => {
    };
    const handleCodeComplete = () => {
    };
    const handleRefreshQrCode = () => {
      refreshQrCode();
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(BtcAuthLayout, { class: "glassmorphism" }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1, [
            createVNode(_sfc_main$9, null, {
              toggle: withCtx(() => [
                createVNode(BtcQrToggleBtn, {
                  icon: toggleInfo.value.icon,
                  label: toggleInfo.value.label,
                  onClick: handleToggleQrLogin
                }, null, 8, ["icon", "label"])
              ]),
              _: 1
            }),
            createBaseVNode("div", _hoisted_2, [
              unref(currentLoginMode) !== "qr" ? (openBlock(), createBlock(_sfc_main$8, {
                key: 0,
                "current-mode": unref(currentLoginMode),
                onTabChange: handleSwitchLoginMode
              }, null, 8, ["current-mode"])) : createCommentVNode("", true),
              unref(currentLoginMode) === "password" ? (openBlock(), createBlock(BtcPasswordForm, {
                key: "password-form",
                loading: unref(passwordLoading),
                onSubmit: handlePasswordSubmit
              }, null, 8, ["loading"])) : createCommentVNode("", true),
              unref(currentLoginMode) === "sms" ? (openBlock(), createBlock(BtcSmsForm, {
                key: "sms-form",
                loading: unref(smsLoading),
                onSubmit: handleSmsSubmit,
                onSendSms: handleSendSms,
                onCodeComplete: handleCodeComplete
              }, null, 8, ["loading"])) : createCommentVNode("", true),
              unref(currentLoginMode) === "qr" ? (openBlock(), createBlock(BtcQrForm, {
                key: 3,
                "qr-code-url": unref(qrCodeUrl),
                onRefresh: handleRefreshQrCode
              }, null, 8, ["qr-code-url"])) : createCommentVNode("", true),
              unref(currentLoginMode) !== "qr" ? (openBlock(), createBlock(_sfc_main$1, { key: 4 })) : createCommentVNode("", true),
              unref(currentLoginMode) !== "qr" ? (openBlock(), createBlock(BtcAgreementText, {
                key: 5,
                ref_key: "agreementRef",
                ref: agreementRef,
                onAgreementChange: handleAgreementChange
              }, null, 512)) : createCommentVNode("", true)
            ])
          ])
        ]),
        _: 1
      });
    };
  }
});
export {
  _sfc_main as default
};
