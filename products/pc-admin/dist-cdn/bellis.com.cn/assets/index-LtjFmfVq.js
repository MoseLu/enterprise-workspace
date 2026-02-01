import { b as defineComponent, aN as useI18n, i as ref, n as createElementBlock, o as openBlock, t as createVNode, q as createBaseVNode, x as withCtx, aO as ElFormItem, a0 as ElInput, aF as withKeys, g as unref, E as ElButton, y as createTextVNode, w as toDisplayString, aP as ElForm, I as nextTick, z as _export_sfc, k as useRouter, J as reactive, aQ as useSmsCode, B as BtcMessage, aR as resolveComponent, f as createBlock, P as ElIcon, aS as arrow_right_default } from "./vendor-tN3qNEcA.js";
import { u as useFormEnterKey, _ as _sfc_main$2, B as BtcAgreementText, a as BtcAuthLayout } from "./index-D0qIuX0u.js";
import { B as BtcSmsCodeInput } from "./index-g-SNKt8W.js";
import "./menu-registry-BOrHQOwD.js";
import { o as authApi } from "./auth-api-CvJd6wHo.js";
import { c as codeApi } from "./index-wPsyA9WS.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1$1 = { class: "forget-password-form" };
const _hoisted_2$1 = { class: "op" };
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcForgetPasswordForm"
  },
  __name: "index",
  props: {
    form: {},
    rules: {},
    loading: { type: Boolean },
    sending: { type: Boolean },
    smsCountdown: {},
    hasSentSms: { type: Boolean }
  },
  emits: ["send-sms", "code-complete", "submit"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const formRef = ref();
    const handleSubmit = async () => {
      if (!formRef.value) return;
      emit("submit");
    };
    const { handleEnterKey } = useFormEnterKey({
      formRef,
      onSubmit: handleSubmit
    });
    const handleSendSmsCode = () => {
      emit("send-sms");
    };
    const handlePhoneEnter = async (event) => {
      if (!props.hasSentSms) {
        event.preventDefault();
        handleSendSmsCode();
        await nextTick();
        setTimeout(() => {
          if (props.hasSentSms) {
            handleEnterKey(event, event.target);
          }
        }, 100);
      } else {
        handleEnterKey(event, event.target);
      }
    };
    const handleCodeComplete = () => {
      emit("code-complete");
    };
    __expose({
      formRef,
      validate: () => formRef.value?.validate()
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createVNode(_component_el_form, {
          ref_key: "formRef",
          ref: formRef,
          model: __props.form,
          rules: __props.rules,
          "label-width": 0,
          class: "form",
          autocomplete: "off"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_form_item, { prop: "phone" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "forget-password-phone",
                  modelValue: __props.form.phone,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => __props.form.phone = $event),
                  name: "phone",
                  autocomplete: "off",
                  placeholder: unref(t)("auth.phone_placeholder"),
                  size: "large",
                  maxlength: "11",
                  onKeyup: withKeys(handlePhoneEnter, ["enter"])
                }, {
                  suffix: withCtx(() => [
                    createVNode(_component_el_button, {
                      disabled: __props.smsCountdown > 0 || !__props.form.phone || __props.sending,
                      onClick: handleSendSmsCode,
                      class: "sms-btn"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(__props.smsCountdown > 0 ? `${__props.smsCountdown}s` : unref(t)("auth.get_sms_code")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])
                  ]),
                  _: 1
                }, 8, ["modelValue", "placeholder"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { prop: "smsCode" }, {
              default: withCtx(() => [
                createVNode(BtcSmsCodeInput, {
                  modelValue: __props.form.smsCode,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => __props.form.smsCode = $event),
                  disabled: !__props.hasSentSms,
                  onComplete: handleCodeComplete
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { prop: "newPassword" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "forget-password-new-password",
                  modelValue: __props.form.newPassword,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => __props.form.newPassword = $event),
                  name: "newPassword",
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: unref(t)("auth.new_password_placeholder"),
                  size: "large",
                  "show-password": "",
                  maxlength: "20",
                  onKeyup: _cache[3] || (_cache[3] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                }, null, 8, ["modelValue", "placeholder"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { prop: "confirmPassword" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "forget-password-confirm-password",
                  modelValue: __props.form.confirmPassword,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => __props.form.confirmPassword = $event),
                  name: "confirmPassword",
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: unref(t)("auth.confirm_new_password_placeholder"),
                  size: "large",
                  "show-password": "",
                  maxlength: "20",
                  onKeyup: _cache[5] || (_cache[5] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                }, null, 8, ["modelValue", "placeholder"])
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["model", "rules"]),
        createBaseVNode("div", _hoisted_2$1, [
          createVNode(_component_el_button, {
            type: "primary",
            size: "large",
            loading: __props.loading,
            onClick: handleSubmit
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("auth.reset_password")), 1)
            ]),
            _: 1
          }, 8, ["loading"])
        ])
      ]);
    };
  }
});
var BtcForgetPasswordForm = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-bfa4ee65"]]);
function useForgetPassword() {
  const router = useRouter();
  const { t } = useI18n();
  const form = reactive({
    phone: "",
    smsCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  const loading = ref(false);
  const {
    countdown: smsCountdown,
    sending,
    hasSent: hasSentSms,
    send: sendSmsCodeInternal
  } = useSmsCode({
    sendSmsCode: codeApi.sendSmsCode,
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      BtcMessage.success(t("auth.message.sms_code_sent"));
    },
    onError: (error) => {
      BtcMessage.error(error.message || t("auth.message.sms_code_send_failed"));
    }
  });
  const rules = reactive({
    phone: [
      { required: true, message: t("auth.validation.phone_required"), trigger: "blur" },
      { pattern: /^1[3-9]\d{9}$/, message: t("auth.validation.phone_format"), trigger: "blur" }
    ],
    smsCode: [
      { required: true, message: t("auth.validation.sms_code_required"), trigger: "blur" },
      { len: 6, message: t("auth.validation.sms_code_length"), trigger: "blur" }
    ],
    newPassword: [
      { required: true, message: t("auth.validation.new_password_required"), trigger: "blur" },
      { min: 6, max: 20, message: t("auth.validation.password_length"), trigger: "blur" }
    ],
    confirmPassword: [
      { required: true, message: t("auth.validation.confirm_new_password_required"), trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (value !== form.newPassword) {
            callback(new Error(t("auth.validation.confirm_password_mismatch")));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ]
  });
  const sendSmsCode = async () => {
    if (!form.phone) {
      BtcMessage.warning(t("auth.message.phone_required_for_sms"));
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      BtcMessage.warning(t("auth.message.phone_format_error"));
      return;
    }
    try {
      await sendSmsCodeInternal(form.phone, "reset");
    } catch (error) {
    }
  };
  const resetPassword = async (formRef) => {
    if (!formRef) return;
    try {
      await formRef.validate();
      loading.value = true;
      await authApi.resetPassword({
        phone: form.phone,
        smsCode: form.smsCode,
        newPassword: form.newPassword
      });
      BtcMessage.success(t("auth.message.reset_password_success"));
      setTimeout(() => {
        router.push("/login?from=forget-password");
      }, 1500);
    } catch (error) {
      if (error.message) {
        BtcMessage.error(error.message);
      }
      throw error;
    } finally {
      loading.value = false;
    }
  };
  return {
    form,
    rules,
    loading,
    sending,
    smsCountdown,
    hasSentSms,
    sendSmsCode,
    resetPassword
  };
}
const _hoisted_1 = { class: "login-card" };
const _hoisted_2 = { class: "card-content" };
const _hoisted_3 = { class: "back-to-login-wrapper" };
const _hoisted_4 = { class: "back-to-login" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "ForgetPassword"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const formRef = ref();
    const agreementRef = ref();
    const isAgreed = ref(false);
    const {
      form,
      rules,
      loading,
      sending,
      smsCountdown,
      hasSentSms,
      sendSmsCode,
      resetPassword
    } = useForgetPassword();
    const handleSendSmsCode = () => {
      sendSmsCode();
    };
    const handleCodeComplete = () => {
    };
    const handleAgreementChange = (agreed) => {
      isAgreed.value = agreed;
    };
    const checkAgreement = () => {
      if (!isAgreed.value) {
        BtcMessage.warning(t("auth.message.agreement_required"));
        return false;
      }
      return true;
    };
    const handleSubmit = async () => {
      try {
        if (!formRef.value) return;
        if (!checkAgreement()) {
          return;
        }
        await resetPassword(formRef.value.formRef);
      } catch (error) {
        console.error("重置密码错误:", error);
      }
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createBlock(BtcAuthLayout, { class: "glassmorphism" }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1, [
            createVNode(_sfc_main$2),
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("div", _hoisted_3, [
                createBaseVNode("div", _hoisted_4, [
                  createVNode(_component_router_link, {
                    to: "/login?from=forget-password",
                    class: "back-to-login-link"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("auth.back_to_login")) + " ", 1),
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
              createVNode(BtcForgetPasswordForm, {
                form: unref(form),
                rules: unref(rules),
                loading: unref(loading),
                sending: unref(sending),
                "sms-countdown": unref(smsCountdown),
                "has-sent-sms": unref(hasSentSms),
                onSendSms: handleSendSmsCode,
                onCodeComplete: handleCodeComplete,
                onSubmit: handleSubmit,
                ref_key: "formRef",
                ref: formRef
              }, null, 8, ["form", "rules", "loading", "sending", "sms-countdown", "has-sent-sms"]),
              createVNode(BtcAgreementText, {
                ref_key: "agreementRef",
                ref: agreementRef,
                onAgreementChange: handleAgreementChange
              }, null, 512)
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
