import { a as defineComponent, r as ref, am as reactive, e as createElementBlock, l as createVNode, h as createBaseVNode, w as withCtx, m as unref, L as createCommentVNode, an as ElAlert, a1 as ElTable, ao as ElTimeline, o as openBlock, ap as ElForm, aq as ElFormItem, J as ElSelect, K as ElOption, D as ElButton, v as createTextVNode, E as ElIcon, ar as video_play_default, t as toDisplayString, V as ElTableColumn, s as ElTag, F as Fragment, q as renderList, x as createBlock, as as ElTimelineItem, i as _export_sfc } from "./index-CeQEKVXA.js";
import { useI18n } from "@btc/shared-core";
import { BtcFlex1, BtcRow, BtcMessage } from "@btc/shared-components";
import "@btc/shared-utils";
const _hoisted_1 = { class: "simulator-page" };
const _hoisted_2 = { class: "simulator-container" };
const _hoisted_3 = {
  key: 0,
  class: "simulator-result"
};
const _hoisted_4 = {
  key: 0,
  class: "matched-policies"
};
const _hoisted_5 = {
  key: 1,
  class: "execution-steps"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "OpsSimulator"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const formRef = ref();
    const simulatorForm = reactive({
      user: "",
      resource: "",
      action: ""
    });
    const formRules = {
      user: [{ required: true, message: "请选择用户", trigger: "change" }],
      resource: [{ required: true, message: "请选择资源", trigger: "change" }],
      action: [{ required: true, message: "请选择操作", trigger: "change" }]
    };
    const simulationResult = ref(null);
    const simulating = ref(false);
    const simulatePermission = (user, resource, action) => {
      const permissions = {
        admin: {
          user: ["view", "edit", "delete", "create"],
          role: ["view", "edit", "delete", "create"],
          system: ["view", "edit"],
          order: ["view", "edit", "delete", "create"]
        },
        manager: {
          user: ["view"],
          role: ["view"],
          system: ["view"],
          order: ["view", "edit", "create"]
        },
        employee: {
          user: ["view"],
          role: [],
          system: [],
          order: ["view"]
        }
      };
      const userPermissions = permissions[user] || {};
      const resourcePermissions = userPermissions[resource] || [];
      const hasPermission = resourcePermissions.includes(action);
      return {
        decision: hasPermission ? "allow" : "deny",
        reason: hasPermission ? `用户"${user}"对"${resource}"资源有"${action}"权限` : `用户"${user}"对"${resource}"资源没有"${action}"权限`,
        matchedPolicies: hasPermission ? [
          { policyName: "管理员策略", policyType: "RBAC", effect: "allow", priority: 100 }
        ] : [
          { policyName: "默认拒绝策略", policyType: "RBAC", effect: "deny", priority: 200 }
        ],
        steps: [
          {
            description: `检查用户 ${user} 权限`,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
            type: "primary"
          },
          {
            description: `验证资源 ${resource} 访问权限`,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
            type: "info"
          },
          {
            description: `执行操作 ${action} 权限检查`,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
            type: hasPermission ? "success" : "danger"
          },
          {
            description: hasPermission ? "权限验证通过" : "权限验证失败",
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
            type: hasPermission ? "success" : "danger"
          }
        ]
      };
    };
    const handleSimulate = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        simulating.value = true;
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        const result = simulatePermission(
          simulatorForm.user,
          simulatorForm.resource,
          simulatorForm.action
        );
        simulationResult.value = result;
        BtcMessage.success("模拟完成");
      } catch (_error) {
        BtcMessage.error("表单验证失败，请检查输入");
      } finally {
        simulating.value = false;
      }
    };
    return (_ctx, _cache) => {
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_alert = ElAlert;
      const _component_el_table_column = ElTableColumn;
      const _component_el_tag = ElTag;
      const _component_el_table = ElTable;
      const _component_el_timeline_item = ElTimelineItem;
      const _component_el_timeline = ElTimeline;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcRow), null, {
          default: withCtx(() => [
            createVNode(unref(BtcFlex1)),
            createVNode(_component_el_form, {
              ref_key: "formRef",
              ref: formRef,
              model: simulatorForm,
              rules: formRules,
              inline: "",
              class: "simulator-form"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { prop: "user" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: simulatorForm.user,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => simulatorForm.user = $event),
                      placeholder: unref(t)("ops.simulator.select_user"),
                      style: { "width": "120px" },
                      size: "default"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.admin"),
                          value: "admin"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.manager"),
                          value: "manager"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.employee"),
                          value: "employee"
                        }, null, 8, ["label"])
                      ]),
                      _: 1
                    }, 8, ["modelValue", "placeholder"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { prop: "resource" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: simulatorForm.resource,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => simulatorForm.resource = $event),
                      placeholder: unref(t)("ops.simulator.select_resource"),
                      style: { "width": "120px" },
                      size: "default"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.user_resource"),
                          value: "user"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.role_resource"),
                          value: "role"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.system_resource"),
                          value: "system"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.order_resource"),
                          value: "order"
                        }, null, 8, ["label"])
                      ]),
                      _: 1
                    }, 8, ["modelValue", "placeholder"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { prop: "action" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: simulatorForm.action,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => simulatorForm.action = $event),
                      placeholder: unref(t)("ops.simulator.select_action"),
                      style: { "width": "120px" },
                      size: "default"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.view"),
                          value: "view"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.edit"),
                          value: "edit"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.delete"),
                          value: "delete"
                        }, null, 8, ["label"]),
                        createVNode(_component_el_option, {
                          label: unref(t)("ops.simulator.create"),
                          value: "create"
                        }, null, 8, ["label"])
                      ]),
                      _: 1
                    }, 8, ["modelValue", "placeholder"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"]),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: handleSimulate,
              loading: simulating.value,
              size: "default"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(video_play_default))
                  ]),
                  _: 1
                }),
                createTextVNode(" " + toDisplayString(unref(t)("ops.simulator.start")), 1)
              ]),
              _: 1
            }, 8, ["loading"])
          ]),
          _: 1
        }),
        createBaseVNode("div", _hoisted_2, [
          simulationResult.value ? (openBlock(), createElementBlock("div", _hoisted_3, [
            createVNode(_component_el_alert, {
              title: simulationResult.value.decision === "allow" ? "允许访问" : "拒绝访问",
              type: simulationResult.value.decision === "allow" ? "success" : "error",
              description: simulationResult.value.reason,
              "show-icon": "",
              closable: false
            }, null, 8, ["title", "type", "description"]),
            simulationResult.value.matchedPolicies.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_4, [
              _cache[3] || (_cache[3] = createBaseVNode("h4", null, "匹配策略", -1)),
              createVNode(_component_el_table, {
                data: simulationResult.value.matchedPolicies,
                border: ""
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_table_column, {
                    prop: "policyName",
                    label: "策略名称"
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "policyType",
                    label: "策略类型"
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "effect",
                    label: "效果"
                  }, {
                    default: withCtx(({ row }) => [
                      createVNode(_component_el_tag, {
                        type: row.effect === "allow" ? "success" : "danger"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(row.effect === "allow" ? "允许" : "拒绝"), 1)
                        ]),
                        _: 2
                      }, 1032, ["type"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "priority",
                    label: "优先级"
                  })
                ]),
                _: 1
              }, 8, ["data"])
            ])) : createCommentVNode("", true),
            simulationResult.value.steps.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_5, [
              _cache[4] || (_cache[4] = createBaseVNode("h4", null, "执行步骤", -1)),
              createVNode(_component_el_timeline, null, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(simulationResult.value.steps, (step, index2) => {
                    return openBlock(), createBlock(_component_el_timeline_item, {
                      key: index2,
                      timestamp: step.timestamp,
                      type: step.type
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(step.description), 1)
                      ]),
                      _: 2
                    }, 1032, ["timestamp", "type"]);
                  }), 128))
                ]),
                _: 1
              })
            ])) : createCommentVNode("", true)
          ])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cc502c37"]]);
export {
  index as default
};
