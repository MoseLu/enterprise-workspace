import { b as defineComponent, aN as useI18n, i as ref, n as createElementBlock, o as openBlock, t as createVNode, q as createBaseVNode, x as withCtx, aO as ElFormItem, a0 as ElInput, aF as withKeys, g as unref, aP as ElForm, y as createTextVNode, w as toDisplayString, E as ElButton, z as _export_sfc, k as useRouter, J as reactive, B as BtcMessage, aR as resolveComponent, f as createBlock, P as ElIcon, aS as arrow_right_default } from "./vendor-tN3qNEcA.js";
import { u as useFormEnterKey, _ as _sfc_main$2, B as BtcAgreementText, a as BtcAuthLayout } from "./index-D0qIuX0u.js";
import "./menu-registry-BOrHQOwD.js";
import { p as http } from "./auth-api-CvJd6wHo.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1$1 = { class: "register-form" };
const _hoisted_2$1 = { class: "op" };
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcRegisterForm"
  },
  __name: "index",
  props: {
    form: {},
    rules: {},
    loading: { type: Boolean }
  },
  emits: ["submit"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    const formRef = ref();
    const handleSubmit = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        emit("submit");
      } catch {
      }
    };
    const { handleEnterKey } = useFormEnterKey({
      formRef,
      onSubmit: handleSubmit
    });
    __expose({
      formRef,
      validate: () => formRef.value?.validate(),
      resetFields: () => formRef.value?.resetFields()
    });
    return (_ctx, _cache) => {
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      const _component_el_button = ElButton;
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
            createVNode(_component_el_form_item, { prop: "username" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "register-username",
                  modelValue: __props.form.username,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => __props.form.username = $event),
                  name: "username",
                  autocomplete: "off",
                  placeholder: unref(t)("auth.username_placeholder"),
                  size: "large",
                  maxlength: "50",
                  onKeyup: _cache[1] || (_cache[1] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                }, null, 8, ["modelValue", "placeholder"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { prop: "phone" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "register-phone",
                  modelValue: __props.form.phone,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => __props.form.phone = $event),
                  name: "phone",
                  autocomplete: "off",
                  placeholder: unref(t)("auth.phone_placeholder"),
                  size: "large",
                  maxlength: "11",
                  onKeyup: _cache[3] || (_cache[3] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                }, null, 8, ["modelValue", "placeholder"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { prop: "password" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "register-password",
                  modelValue: __props.form.password,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => __props.form.password = $event),
                  name: "password",
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: unref(t)("auth.password_placeholder"),
                  size: "large",
                  "show-password": "",
                  maxlength: "20",
                  onKeyup: _cache[5] || (_cache[5] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
                }, null, 8, ["modelValue", "placeholder"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { prop: "confirmPassword" }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  id: "register-confirm-password",
                  modelValue: __props.form.confirmPassword,
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => __props.form.confirmPassword = $event),
                  name: "confirmPassword",
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: unref(t)("auth.confirm_password_placeholder"),
                  size: "large",
                  "show-password": "",
                  maxlength: "20",
                  onKeyup: _cache[7] || (_cache[7] = withKeys((e) => unref(handleEnterKey)(e, e.target), ["enter"]))
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
              createTextVNode(toDisplayString(unref(t)("auth.register_now")), 1)
            ]),
            _: 1
          }, 8, ["loading"])
        ])
      ]);
    };
  }
});
var BtcRegisterForm = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-4356a5fe"]]);
function useRegister() {
  const router = useRouter();
  const { t } = useI18n();
  const form = reactive({
    username: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const loading = ref(false);
  const rules = reactive({
    username: [
      { required: true, message: t("auth.validation.username_required"), trigger: "blur" },
      { min: 2, max: 50, message: t("auth.validation.username_length"), trigger: "blur" }
    ],
    phone: [
      { required: true, message: t("auth.validation.phone_required"), trigger: "blur" },
      { pattern: /^1[3-9]\d{9}$/, message: t("auth.validation.phone_format"), trigger: "blur" }
    ],
    password: [
      { required: true, message: t("auth.validation.password_required"), trigger: "blur" },
      { min: 6, max: 20, message: t("auth.validation.password_length"), trigger: "blur" }
    ],
    confirmPassword: [
      { required: true, message: t("auth.validation.confirm_password_required"), trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (value !== form.password) {
            callback(new Error(t("auth.validation.confirm_password_mismatch")));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ]
  });
  const register = async (formRef) => {
    if (!formRef) return;
    try {
      loading.value = true;
      await formRef.validate();
      await http.post("/base/open/register", {
        username: form.username,
        phone: form.phone,
        password: form.password
      });
      BtcMessage.success(t("auth.message.register_success"));
      setTimeout(() => {
        router.push("/login?from=register");
      }, 1500);
    } catch (error) {
      console.error("注册失败:", error);
      BtcMessage.error(error.message || t("auth.message.register_failed"));
    } finally {
      loading.value = false;
    }
  };
  return {
    form,
    rules,
    loading,
    register
  };
}
const _hoisted_1 = { class: "login-card" };
const _hoisted_2 = { class: "card-content" };
const _hoisted_3 = { class: "back-to-login-wrapper" };
const _hoisted_4 = { class: "back-to-login" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "Register"
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
      register
    } = useRegister();
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
        await register(formRef.value.formRef);
      } catch (error) {
        console.error("注册错误:", error);
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
                    to: "/login?from=register",
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
              createVNode(BtcRegisterForm, {
                form: unref(form),
                rules: unref(rules),
                loading: unref(loading),
                onSubmit: handleSubmit,
                ref_key: "formRef",
                ref: formRef
              }, null, 8, ["form", "rules", "loading"]),
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
