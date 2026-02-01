import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcMessage, BtcConfirm } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { useMessage } from "@/utils/use-message";
import { strategyService } from "@/services/strategy";
import { a as defineComponent, r as ref, b as computed, k as onMounted, e as createElementBlock, l as createVNode, w as withCtx, m as unref, at as ElDialog, o as openBlock, h as createBaseVNode, J as ElSelect, F as Fragment, q as renderList, K as ElOption, D as ElButton, v as createTextVNode, x as createBlock, L as createCommentVNode, s as ElTag, t as toDisplayString, au as ElPopover, av as ElLink, a1 as ElTable, V as ElTableColumn, ap as ElForm, aq as ElFormItem, R as ElInput, aa as ElDivider, A as ElDescriptions, B as ElDescriptionsItem, aw as ElCollapse, ax as ElCollapseItem, ao as ElTimeline, as as ElTimelineItem, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "strategy-management" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
const _hoisted_3 = { class: "strategy-tags" };
const _hoisted_4 = { class: "test-form" };
const _hoisted_5 = {
  key: 0,
  class: "test-result"
};
const _hoisted_6 = { class: "step-info" };
const _hoisted_7 = { class: "step-name" };
const _hoisted_8 = { class: "step-duration" };
const _hoisted_9 = {
  key: 0,
  class: "step-result"
};
const _hoisted_10 = {
  key: 1,
  class: "step-error"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const statusFilter = ref("");
    const showVersionDialog = ref(false);
    const showTestDialog = ref(false);
    const testing = ref(false);
    const testingStrategies = ref(/* @__PURE__ */ new Set());
    const versionHistory = ref([]);
    const testForm = ref({
      context: '{\n  "user": {\n    "id": "123",\n    "roles": ["user"],\n    "permissions": ["read"]\n  },\n  "resource": {\n    "type": "document",\n    "id": "doc-001"\n  }\n}'
    });
    const testResult = ref(null);
    const currentTestStrategy = ref(null);
    const strategyStatuses = [
      { value: "DRAFT", label: "草稿" },
      { value: "TESTING", label: "测试中" },
      { value: "ACTIVE", label: "激活" },
      { value: "INACTIVE", label: "停用" },
      { value: "ARCHIVED", label: "已归档" }
    ];
    const wrappedService = {
      ...strategyService,
      delete: async (id) => {
        await BtcConfirm(
          t("crud.message.delete_confirm"),
          t("common.button.confirm"),
          { type: "warning" }
        );
        await strategyService.deleteStrategy(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(
          t("crud.message.delete_confirm"),
          t("common.button.confirm"),
          { type: "warning" }
        );
        await strategyService.deleteStrategies(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    const columns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: t("crud.table.index"), width: 60 },
      { prop: "name", label: "策略名称", minWidth: 180 },
      {
        prop: "type",
        label: "类型",
        width: 120,
        dict: [
          { label: "权限", value: "PERMISSION", type: "danger" },
          { label: "业务", value: "BUSINESS", type: "success" },
          { label: "数据", value: "DATA", type: "warning" },
          { label: "工作流", value: "WORKFLOW", type: "info" }
        ]
      },
      {
        prop: "status",
        label: "状态",
        width: 100,
        dict: [
          { label: "草稿", value: "DRAFT", type: "info" },
          { label: "测试中", value: "TESTING", type: "warning" },
          { label: "激活", value: "ACTIVE", type: "success" },
          { label: "停用", value: "INACTIVE", type: "danger" },
          { label: "已归档", value: "ARCHIVED", type: "default" }
        ]
      },
      { prop: "priority", label: "优先级", width: 100 },
      { prop: "version", label: "版本", width: 100 },
      { prop: "tags", label: "标签", width: 150 },
      { prop: "description", label: "描述", minWidth: 200 },
      { prop: "updatedAt", label: "更新时间", width: 180 }
    ]);
    const formItems = computed(() => [
      {
        prop: "name",
        label: "策略名称",
        span: 12,
        required: true,
        component: { name: "el-input" }
      },
      {
        prop: "type",
        label: "策略类型",
        span: 12,
        required: true,
        component: {
          name: "el-select",
          options: [
            { label: "权限策略", value: "PERMISSION" },
            { label: "业务策略", value: "BUSINESS" },
            { label: "数据策略", value: "DATA" },
            { label: "工作流策略", value: "WORKFLOW" }
          ]
        }
      },
      {
        prop: "priority",
        label: "优先级",
        span: 12,
        component: {
          name: "el-input-number",
          props: { min: 0, max: 1e3 }
        },
        value: 100
      },
      {
        prop: "tags",
        label: "标签",
        span: 12,
        component: {
          name: "el-input",
          props: { placeholder: "多个标签用逗号分隔" }
        }
      },
      {
        prop: "description",
        label: "描述",
        span: 24,
        component: {
          name: "el-input",
          props: { type: "textarea", rows: 3 }
        }
      }
    ]);
    const getStatusTagType = (status) => {
      const statusMap = {
        "DRAFT": "info",
        "TESTING": "warning",
        "ACTIVE": "success",
        "INACTIVE": "danger",
        "ARCHIVED": "default"
      };
      return statusMap[status] || "default";
    };
    const getStatusLabel = (status) => {
      const labelMap = {
        "DRAFT": "草稿",
        "TESTING": "测试中",
        "ACTIVE": "激活",
        "INACTIVE": "停用",
        "ARCHIVED": "已归档"
      };
      return labelMap[status] || status;
    };
    const handleStatusFilter = () => {
      setTimeout(() => crudRef.value?.crud.loadData(), 50);
    };
    function onBeforeRefresh(params) {
      const next = { ...params };
      if (statusFilter.value) {
        next.status = statusFilter.value;
      }
      return next;
    }
    const showVersionHistory = async (strategy) => {
      try {
        versionHistory.value = await strategyService.getStrategyVersions(strategy.id);
        showVersionDialog.value = true;
      } catch (error) {
        BtcMessage.error("获取版本历史失败");
      }
    };
    const activateVersion = async (version) => {
      try {
        await strategyService.activateStrategyVersion(version.id, version.version);
        BtcMessage.success("版本激活成功");
        showVersionDialog.value = false;
        crudRef.value?.crud.loadData();
      } catch (error) {
        BtcMessage.error("版本激活失败");
      }
    };
    const compareVersion = (version) => {
      BtcMessage.info("版本对比功能将在后续版本实现");
    };
    const testStrategy = (strategy) => {
      currentTestStrategy.value = strategy;
      testResult.value = null;
      showTestDialog.value = true;
    };
    const runTest = async () => {
      if (!currentTestStrategy.value) return;
      testing.value = true;
      testingStrategies.value.add(currentTestStrategy.value.id);
      try {
        const context = {
          strategyId: currentTestStrategy.value.id,
          executionId: Date.now().toString(),
          input: JSON.parse(testForm.value.context),
          variables: {},
          environment: {
            timestamp: Date.now(),
            source: "test"
          }
        };
        testResult.value = await strategyService.testStrategy(currentTestStrategy.value.id, context);
        BtcMessage.success("策略测试完成");
      } catch (error) {
        BtcMessage.error("策略测试失败");
      } finally {
        testing.value = false;
        testingStrategies.value.delete(currentTestStrategy.value.id);
      }
    };
    const cloneStrategy = async (strategy) => {
      try {
        const cloned = await strategyService.createStrategy({
          ...strategy,
          name: `${strategy.name} (副本)`,
          status: "DRAFT",
          version: "1.0.0"
        });
        BtcMessage.success("策略克隆成功");
        crudRef.value?.crud.loadData();
      } catch (error) {
        BtcMessage.error("策略克隆失败");
      }
    };
    const exportStrategy = async (strategy) => {
      try {
        const blob = await strategyService.exportStrategy(strategy.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `strategy-${strategy.name}-${strategy.version}.json`;
        a.click();
        URL.revokeObjectURL(url);
        BtcMessage.success("策略导出成功");
      } catch (error) {
        BtcMessage.error("策略导出失败");
      }
    };
    onMounted(() => {
      setTimeout(() => crudRef.value?.crud.loadData(), 100);
    });
    return (_ctx, _cache) => {
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_link = ElLink;
      const _component_el_tag = ElTag;
      const _component_el_popover = ElPopover;
      const _component_el_button = ElButton;
      const _component_el_table_column = ElTableColumn;
      const _component_el_table = ElTable;
      const _component_el_dialog = ElDialog;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      const _component_el_divider = ElDivider;
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_descriptions = ElDescriptions;
      const _component_el_timeline_item = ElTimelineItem;
      const _component_el_timeline = ElTimeline;
      const _component_el_collapse_item = ElCollapseItem;
      const _component_el_collapse = ElCollapse;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "crudRef",
          ref: crudRef,
          service: wrappedService,
          "on-before-refresh": onBeforeRefresh,
          class: "strategy-crud"
        }, {
          default: withCtx(() => [
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_2, [
                  createVNode(unref(BtcRefreshBtn)),
                  createVNode(unref(BtcAddBtn)),
                  createVNode(unref(BtcMultiDeleteBtn))
                ]),
                createVNode(_component_el_select, {
                  modelValue: statusFilter.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => statusFilter.value = $event),
                  placeholder: "状态筛选",
                  clearable: "",
                  style: { "width": "120px", "margin-left": "8px" },
                  onChange: handleStatusFilter
                }, {
                  default: withCtx(() => [
                    (openBlock(), createElementBlock(Fragment, null, renderList(strategyStatuses, (status) => {
                      return createVNode(_component_el_option, {
                        key: status.value,
                        label: status.label,
                        value: status.value
                      }, null, 8, ["label", "value"]);
                    }), 64))
                  ]),
                  _: 1
                }, 8, ["modelValue"]),
                createVNode(unref(BtcFlex1)),
                createVNode(unref(BtcSearchKey)),
                createVNode(unref(BtcCrudActions))
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcTable), {
                  ref: "tableRef",
                  columns: columns.value,
                  op: { buttons: ["edit", "delete", "test", "clone", "export"] },
                  border: ""
                }, {
                  "column-version": withCtx(({ row }) => [
                    createVNode(_component_el_link, {
                      type: "primary",
                      onClick: ($event) => showVersionHistory(row)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(row.version), 1)
                      ]),
                      _: 2
                    }, 1032, ["onClick"])
                  ]),
                  "column-tags": withCtx(({ row }) => [
                    createBaseVNode("div", _hoisted_3, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(row.tags?.slice(0, 2), (tag) => {
                        return openBlock(), createBlock(_component_el_tag, {
                          key: tag,
                          size: "small",
                          effect: "plain"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(tag), 1)
                          ]),
                          _: 2
                        }, 1024);
                      }), 128)),
                      row.tags && row.tags.length > 2 ? (openBlock(), createBlock(_component_el_popover, {
                        key: 0,
                        placement: "top",
                        trigger: "hover",
                        content: row.tags.slice(2).join(", ")
                      }, {
                        reference: withCtx(() => [
                          createVNode(_component_el_tag, {
                            size: "small",
                            type: "info"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("+" + toDisplayString(row.tags.length - 2), 1)
                            ]),
                            _: 2
                          }, 1024)
                        ]),
                        _: 2
                      }, 1032, ["content"])) : createCommentVNode("", true)
                    ])
                  ]),
                  "op-test": withCtx(({ row }) => [
                    createVNode(_component_el_button, {
                      type: "warning",
                      size: "small",
                      onClick: ($event) => testStrategy(row),
                      loading: testingStrategies.value.has(row.id)
                    }, {
                      default: withCtx(() => [..._cache[5] || (_cache[5] = [
                        createTextVNode(" 测试 ", -1)
                      ])]),
                      _: 1
                    }, 8, ["onClick", "loading"])
                  ]),
                  "op-clone": withCtx(({ row }) => [
                    createVNode(_component_el_button, {
                      type: "info",
                      size: "small",
                      onClick: ($event) => cloneStrategy(row)
                    }, {
                      default: withCtx(() => [..._cache[6] || (_cache[6] = [
                        createTextVNode(" 克隆 ", -1)
                      ])]),
                      _: 1
                    }, 8, ["onClick"])
                  ]),
                  "op-export": withCtx(({ row }) => [
                    createVNode(_component_el_button, {
                      type: "success",
                      size: "small",
                      onClick: ($event) => exportStrategy(row)
                    }, {
                      default: withCtx(() => [..._cache[7] || (_cache[7] = [
                        createTextVNode(" 导出 ", -1)
                      ])]),
                      _: 1
                    }, 8, ["onClick"])
                  ]),
                  _: 1
                }, 8, ["columns"])
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcFlex1)),
                createVNode(unref(BtcPagination))
              ]),
              _: 1
            }),
            createVNode(unref(BtcUpsert), {
              ref: "upsertRef",
              items: formItems.value,
              width: "1200px"
            }, null, 8, ["items"])
          ]),
          _: 1
        }, 512),
        createVNode(_component_el_dialog, {
          modelValue: showVersionDialog.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => showVersionDialog.value = $event),
          title: "版本历史",
          width: "800px"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_table, {
              data: versionHistory.value,
              stripe: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_el_table_column, {
                  prop: "version",
                  label: "版本",
                  width: "100"
                }),
                createVNode(_component_el_table_column, {
                  prop: "status",
                  label: "状态",
                  width: "100"
                }, {
                  default: withCtx(({ row }) => [
                    createVNode(_component_el_tag, {
                      type: getStatusTagType(row.status),
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(getStatusLabel(row.status)), 1)
                      ]),
                      _: 2
                    }, 1032, ["type"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_table_column, {
                  prop: "updatedAt",
                  label: "更新时间",
                  width: "180"
                }),
                createVNode(_component_el_table_column, {
                  prop: "updatedBy",
                  label: "更新人",
                  width: "120"
                }),
                createVNode(_component_el_table_column, {
                  label: "操作",
                  width: "200"
                }, {
                  default: withCtx(({ row }) => [
                    createVNode(_component_el_button, {
                      size: "small",
                      onClick: ($event) => activateVersion(row)
                    }, {
                      default: withCtx(() => [..._cache[8] || (_cache[8] = [
                        createTextVNode("激活", -1)
                      ])]),
                      _: 1
                    }, 8, ["onClick"]),
                    createVNode(_component_el_button, {
                      size: "small",
                      type: "info",
                      onClick: ($event) => compareVersion(row)
                    }, {
                      default: withCtx(() => [..._cache[9] || (_cache[9] = [
                        createTextVNode("对比", -1)
                      ])]),
                      _: 1
                    }, 8, ["onClick"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["data"])
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: showTestDialog.value,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => showTestDialog.value = $event),
          title: "策略测试",
          width: "800px"
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[3] || (_cache[3] = ($event) => showTestDialog.value = false)
            }, {
              default: withCtx(() => [..._cache[11] || (_cache[11] = [
                createTextVNode("关闭", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: runTest,
              loading: testing.value
            }, {
              default: withCtx(() => [..._cache[12] || (_cache[12] = [
                createTextVNode(" 执行测试 ", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_4, [
              createVNode(_component_el_form, {
                model: testForm.value,
                "label-width": "120px"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, { label: "测试上下文" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: testForm.value.context,
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => testForm.value.context = $event),
                        type: "textarea",
                        rows: 8,
                        placeholder: "请输入JSON格式的测试上下文"
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
            ]),
            testResult.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
              createVNode(_component_el_divider, null, {
                default: withCtx(() => [..._cache[10] || (_cache[10] = [
                  createTextVNode("测试结果", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_el_descriptions, {
                border: "",
                column: 2
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_descriptions_item, { label: "执行结果" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_tag, {
                        type: testResult.value.success ? "success" : "danger"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(testResult.value.success ? "成功" : "失败"), 1)
                        ]),
                        _: 1
                      }, 8, ["type"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "策略效果" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_tag, {
                        type: testResult.value.effect === "ALLOW" ? "success" : "danger"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(testResult.value.effect), 1)
                        ]),
                        _: 1
                      }, 8, ["type"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "执行时间" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(testResult.value.executionTime) + "ms ", 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "执行步骤" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(testResult.value.steps?.length || 0), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              testResult.value.steps && testResult.value.steps.length > 0 ? (openBlock(), createBlock(_component_el_collapse, {
                key: 0,
                style: { "margin-top": "16px" }
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_collapse_item, {
                    title: "执行步骤详情",
                    name: "steps"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_timeline, null, {
                        default: withCtx(() => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(testResult.value.steps, (step) => {
                            return openBlock(), createBlock(_component_el_timeline_item, {
                              key: step.nodeId,
                              type: step.executed ? "success" : "info"
                            }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_6, [
                                  createBaseVNode("div", _hoisted_7, toDisplayString(step.nodeName), 1),
                                  createBaseVNode("div", _hoisted_8, toDisplayString(step.duration) + "ms", 1),
                                  step.result ? (openBlock(), createElementBlock("div", _hoisted_9, " 结果: " + toDisplayString(JSON.stringify(step.result)), 1)) : createCommentVNode("", true),
                                  step.error ? (openBlock(), createElementBlock("div", _hoisted_10, " 错误: " + toDisplayString(step.error), 1)) : createCommentVNode("", true)
                                ])
                              ]),
                              _: 2
                            }, 1032, ["type"]);
                          }), 128))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-589786ff"]]);
export {
  index as default
};
