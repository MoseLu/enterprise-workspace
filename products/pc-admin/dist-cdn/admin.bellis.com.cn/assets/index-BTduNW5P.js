import { BtcMessage, BtcConfirm, BtcRow, BtcRefreshBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcCrud } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { strategyService } from "@/services/strategy";
import { a as defineComponent, e as createElementBlock, o as openBlock, l as createVNode, aB as ElRow, w as withCtx, aC as ElCol, z as ElCard, A as ElDescriptions, B as ElDescriptionsItem, v as createTextVNode, t as toDisplayString, s as ElTag, x as createBlock, h as createBaseVNode, a2 as ElEmpty, L as createCommentVNode, E as ElIcon, m as unref, aE as circle_check_filled_default, aF as circle_close_filled_default, aI as question_filled_default, F as Fragment, q as renderList, aa as ElDivider, aT as ElTabs, aU as ElTabPane, i as _export_sfc, b as computed, aV as list_default, aW as timer_default, ao as ElTimeline, as as ElTimelineItem, r as ref, k as onMounted, aX as withDirectives, J as ElSelect, K as ElOption, D as ElButton, ag as refresh_default, aY as vLoading, V as ElTableColumn, av as ElLink, au as ElPopover, a1 as ElTable, aZ as ElPagination, at as ElDialog, ap as ElForm, aq as ElFormItem, R as ElInput, al as ElInputNumber, a_ as ElCheckboxGroup, a3 as ElCheckbox, Q as ElSwitch, an as ElAlert } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1$4 = { class: "strategy-detail-panel" };
const _hoisted_2$4 = {
  key: 0,
  class: "stats-grid"
};
const _hoisted_3$3 = { class: "stat-item" };
const _hoisted_4$3 = { class: "stat-value" };
const _hoisted_5$3 = { class: "stat-item" };
const _hoisted_6$3 = { class: "stat-value success" };
const _hoisted_7$2 = { class: "stat-item" };
const _hoisted_8$2 = { class: "stat-value error" };
const _hoisted_9$2 = { class: "stat-item" };
const _hoisted_10$2 = { class: "stat-value" };
const _hoisted_11$1 = { class: "stat-item" };
const _hoisted_12$1 = { class: "stat-value" };
const _hoisted_13$1 = { class: "stat-item" };
const _hoisted_14$1 = { class: "stat-value" };
const _hoisted_15$1 = {
  key: 0,
  class: "effect-stats"
};
const _hoisted_16$1 = { class: "effect-item" };
const _hoisted_17$1 = { class: "effect-icon allow" };
const _hoisted_18$1 = { class: "effect-info" };
const _hoisted_19$1 = { class: "effect-count" };
const _hoisted_20$1 = { class: "effect-item" };
const _hoisted_21$1 = { class: "effect-icon deny" };
const _hoisted_22$1 = { class: "effect-info" };
const _hoisted_23$1 = { class: "effect-count" };
const _hoisted_24$1 = { class: "effect-item" };
const _hoisted_25$1 = { class: "effect-icon conditional" };
const _hoisted_26$1 = { class: "effect-info" };
const _hoisted_27$1 = { class: "effect-count" };
const _hoisted_28$1 = {
  key: 0,
  class: "performance-stats"
};
const _hoisted_29$1 = { class: "perf-item" };
const _hoisted_30$1 = { class: "perf-value" };
const _hoisted_31$1 = { class: "perf-item" };
const _hoisted_32 = { class: "perf-value error" };
const _hoisted_33 = { class: "perf-item" };
const _hoisted_34 = { class: "perf-value" };
const _hoisted_35 = { class: "perf-item" };
const _hoisted_36 = { class: "perf-value" };
const _hoisted_37 = { class: "tags-container" };
const _hoisted_38 = {
  key: 0,
  class: "no-tags"
};
const _hoisted_39 = { class: "description-section" };
const _hoisted_40 = {
  key: 0,
  class: "description-text"
};
const _hoisted_41 = {
  key: 1,
  class: "no-description"
};
const _hoisted_42 = { key: 0 };
const _hoisted_43 = { class: "expression-code" };
const _hoisted_44 = { class: "variables-json" };
const _hoisted_45 = { key: 0 };
const _hoisted_46 = { key: 0 };
const _hoisted_47 = { class: "parameters-json" };
var _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "StrategyDetailPanel",
  props: {
    strategy: {},
    stats: {}
  },
  setup(__props) {
    const getTypeTagType = (type) => {
      const typeMap = {
        "PERMISSION": "danger",
        "BUSINESS": "success",
        "DATA": "warning",
        "WORKFLOW": "info"
      };
      return typeMap[type] || "default";
    };
    const getTypeLabel = (type) => {
      const labelMap = {
        "PERMISSION": "权限策略",
        "BUSINESS": "业务策略",
        "DATA": "数据策略",
        "WORKFLOW": "工作流策略"
      };
      return labelMap[type] || type;
    };
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
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };
    return (_ctx, _cache) => {
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_tag = ElTag;
      const _component_el_descriptions = ElDescriptions;
      const _component_el_card = ElCard;
      const _component_el_col = ElCol;
      const _component_el_empty = ElEmpty;
      const _component_el_row = ElRow;
      const _component_el_icon = ElIcon;
      const _component_el_divider = ElDivider;
      const _component_el_tab_pane = ElTabPane;
      const _component_el_tabs = ElTabs;
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createVNode(_component_el_row, { gutter: 16 }, {
          default: withCtx(() => [
            createVNode(_component_el_col, { span: 12 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "基本信息" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_descriptions, {
                      column: 1,
                      border: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_descriptions_item, { label: "策略名称" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.strategy.name), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "策略类型" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_tag, {
                              type: getTypeTagType(__props.strategy.type),
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(getTypeLabel(__props.strategy.type)), 1)
                              ]),
                              _: 1
                            }, 8, ["type"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "当前状态" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_tag, {
                              type: getStatusTagType(__props.strategy.status),
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(getStatusLabel(__props.strategy.status)), 1)
                              ]),
                              _: 1
                            }, 8, ["type"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "优先级" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.strategy.priority), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "版本" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.strategy.version), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "创建时间" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(formatDate(__props.strategy.createdAt)), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "更新时间" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(formatDate(__props.strategy.updatedAt)), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "创建人" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.strategy.createdBy), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            createVNode(_component_el_col, { span: 12 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "执行统计" }, {
                  default: withCtx(() => [
                    __props.stats ? (openBlock(), createElementBlock("div", _hoisted_2$4, [
                      createBaseVNode("div", _hoisted_3$3, [
                        createBaseVNode("div", _hoisted_4$3, toDisplayString(__props.stats.execution.total), 1),
                        _cache[0] || (_cache[0] = createBaseVNode("div", { class: "stat-label" }, "总执行次数", -1))
                      ]),
                      createBaseVNode("div", _hoisted_5$3, [
                        createBaseVNode("div", _hoisted_6$3, toDisplayString(__props.stats.execution.success), 1),
                        _cache[1] || (_cache[1] = createBaseVNode("div", { class: "stat-label" }, "成功次数", -1))
                      ]),
                      createBaseVNode("div", _hoisted_7$2, [
                        createBaseVNode("div", _hoisted_8$2, toDisplayString(__props.stats.execution.failed), 1),
                        _cache[2] || (_cache[2] = createBaseVNode("div", { class: "stat-label" }, "失败次数", -1))
                      ]),
                      createBaseVNode("div", _hoisted_9$2, [
                        createBaseVNode("div", _hoisted_10$2, toDisplayString(Math.round(__props.stats.execution.avgDuration)) + "ms", 1),
                        _cache[3] || (_cache[3] = createBaseVNode("div", { class: "stat-label" }, "平均执行时间", -1))
                      ]),
                      createBaseVNode("div", _hoisted_11$1, [
                        createBaseVNode("div", _hoisted_12$1, toDisplayString(__props.stats.execution.maxDuration) + "ms", 1),
                        _cache[4] || (_cache[4] = createBaseVNode("div", { class: "stat-label" }, "最大执行时间", -1))
                      ]),
                      createBaseVNode("div", _hoisted_13$1, [
                        createBaseVNode("div", _hoisted_14$1, toDisplayString(__props.stats.execution.minDuration) + "ms", 1),
                        _cache[5] || (_cache[5] = createBaseVNode("div", { class: "stat-label" }, "最小执行时间", -1))
                      ])
                    ])) : (openBlock(), createBlock(_component_el_empty, {
                      key: 1,
                      description: "暂无统计数据",
                      "image-size": 80
                    }))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        createVNode(_component_el_row, {
          gutter: 16,
          style: { "margin-top": "16px" }
        }, {
          default: withCtx(() => [
            createVNode(_component_el_col, { span: 8 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "策略效果分布" }, {
                  default: withCtx(() => [
                    __props.stats ? (openBlock(), createElementBlock("div", _hoisted_15$1, [
                      createBaseVNode("div", _hoisted_16$1, [
                        createBaseVNode("div", _hoisted_17$1, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(circle_check_filled_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_18$1, [
                          createBaseVNode("div", _hoisted_19$1, toDisplayString(__props.stats.effects.allow), 1),
                          _cache[6] || (_cache[6] = createBaseVNode("div", { class: "effect-label" }, "允许", -1))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_20$1, [
                        createBaseVNode("div", _hoisted_21$1, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(circle_close_filled_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_22$1, [
                          createBaseVNode("div", _hoisted_23$1, toDisplayString(__props.stats.effects.deny), 1),
                          _cache[7] || (_cache[7] = createBaseVNode("div", { class: "effect-label" }, "拒绝", -1))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_24$1, [
                        createBaseVNode("div", _hoisted_25$1, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(question_filled_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_26$1, [
                          createBaseVNode("div", _hoisted_27$1, toDisplayString(__props.stats.effects.conditional), 1),
                          _cache[8] || (_cache[8] = createBaseVNode("div", { class: "effect-label" }, "条件性", -1))
                        ])
                      ])
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            createVNode(_component_el_col, { span: 8 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "性能指标" }, {
                  default: withCtx(() => [
                    __props.stats ? (openBlock(), createElementBlock("div", _hoisted_28$1, [
                      createBaseVNode("div", _hoisted_29$1, [
                        _cache[9] || (_cache[9] = createBaseVNode("div", { class: "perf-label" }, "吞吐量", -1)),
                        createBaseVNode("div", _hoisted_30$1, toDisplayString(__props.stats.performance.throughput.toFixed(2)) + " /s", 1)
                      ]),
                      createBaseVNode("div", _hoisted_31$1, [
                        _cache[10] || (_cache[10] = createBaseVNode("div", { class: "perf-label" }, "错误率", -1)),
                        createBaseVNode("div", _hoisted_32, toDisplayString((__props.stats.performance.errorRate * 100).toFixed(2)) + "%", 1)
                      ]),
                      createBaseVNode("div", _hoisted_33, [
                        _cache[11] || (_cache[11] = createBaseVNode("div", { class: "perf-label" }, "P95响应时间", -1)),
                        createBaseVNode("div", _hoisted_34, toDisplayString(__props.stats.performance.p95Duration) + "ms", 1)
                      ]),
                      createBaseVNode("div", _hoisted_35, [
                        _cache[12] || (_cache[12] = createBaseVNode("div", { class: "perf-label" }, "P99响应时间", -1)),
                        createBaseVNode("div", _hoisted_36, toDisplayString(__props.stats.performance.p99Duration) + "ms", 1)
                      ])
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            createVNode(_component_el_col, { span: 8 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "标签信息" }, {
                  default: withCtx(() => [
                    createBaseVNode("div", _hoisted_37, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(__props.strategy.tags, (tag) => {
                        return openBlock(), createBlock(_component_el_tag, {
                          key: tag,
                          style: { "margin": "4px" },
                          effect: "plain"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(tag), 1)
                          ]),
                          _: 2
                        }, 1024);
                      }), 128)),
                      __props.strategy.tags.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_38, " 暂无标签 ")) : createCommentVNode("", true)
                    ]),
                    createVNode(_component_el_divider),
                    createBaseVNode("div", _hoisted_39, [
                      _cache[13] || (_cache[13] = createBaseVNode("h4", null, "策略描述", -1)),
                      __props.strategy.description ? (openBlock(), createElementBlock("p", _hoisted_40, toDisplayString(__props.strategy.description), 1)) : (openBlock(), createElementBlock("p", _hoisted_41, " 暂无描述 "))
                    ])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        createVNode(_component_el_row, { style: { "margin-top": "16px" } }, {
          default: withCtx(() => [
            createVNode(_component_el_col, { span: 24 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "策略配置详情" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_tabs, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_tab_pane, {
                          label: "规则配置",
                          name: "rules"
                        }, {
                          default: withCtx(() => [
                            __props.strategy.rules && __props.strategy.rules.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_42, [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.strategy.rules, (rule, index2) => {
                                return openBlock(), createElementBlock("div", {
                                  key: rule.id,
                                  class: "config-item"
                                }, [
                                  createBaseVNode("h5", null, "规则 " + toDisplayString(index2 + 1), 1),
                                  createVNode(_component_el_descriptions, {
                                    column: 1,
                                    size: "small",
                                    border: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_descriptions_item, { label: "表达式" }, {
                                        default: withCtx(() => [
                                          createBaseVNode("code", _hoisted_43, toDisplayString(rule.expression), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      createVNode(_component_el_descriptions_item, { label: "变量" }, {
                                        default: withCtx(() => [
                                          createBaseVNode("pre", _hoisted_44, toDisplayString(JSON.stringify(rule.variables, null, 2)), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      rule.description ? (openBlock(), createBlock(_component_el_descriptions_item, {
                                        key: 0,
                                        label: "描述"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(rule.description), 1)
                                        ]),
                                        _: 2
                                      }, 1024)) : createCommentVNode("", true)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]);
                              }), 128))
                            ])) : (openBlock(), createBlock(_component_el_empty, {
                              key: 1,
                              description: "暂无规则配置",
                              "image-size": 80
                            }))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_tab_pane, {
                          label: "条件配置",
                          name: "conditions"
                        }, {
                          default: withCtx(() => [
                            __props.strategy.conditions && __props.strategy.conditions.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_45, [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.strategy.conditions, (condition, index2) => {
                                return openBlock(), createElementBlock("div", {
                                  key: condition.id,
                                  class: "config-item"
                                }, [
                                  createBaseVNode("h5", null, "条件 " + toDisplayString(index2 + 1), 1),
                                  createVNode(_component_el_descriptions, {
                                    column: 2,
                                    size: "small",
                                    border: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_descriptions_item, { label: "字段" }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(condition.field), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      createVNode(_component_el_descriptions_item, { label: "操作符" }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(condition.operator), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      createVNode(_component_el_descriptions_item, { label: "值" }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(condition.value), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      condition.logicalOperator ? (openBlock(), createBlock(_component_el_descriptions_item, {
                                        key: 0,
                                        label: "逻辑操作符"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(condition.logicalOperator), 1)
                                        ]),
                                        _: 2
                                      }, 1024)) : createCommentVNode("", true)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]);
                              }), 128))
                            ])) : (openBlock(), createBlock(_component_el_empty, {
                              key: 1,
                              description: "暂无条件配置",
                              "image-size": 80
                            }))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_tab_pane, {
                          label: "动作配置",
                          name: "actions"
                        }, {
                          default: withCtx(() => [
                            __props.strategy.actions && __props.strategy.actions.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_46, [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.strategy.actions, (action, index2) => {
                                return openBlock(), createElementBlock("div", {
                                  key: action.id,
                                  class: "config-item"
                                }, [
                                  createBaseVNode("h5", null, "动作 " + toDisplayString(index2 + 1), 1),
                                  createVNode(_component_el_descriptions, {
                                    column: 1,
                                    size: "small",
                                    border: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_descriptions_item, { label: "类型" }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(action.type), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      createVNode(_component_el_descriptions_item, { label: "参数" }, {
                                        default: withCtx(() => [
                                          createBaseVNode("pre", _hoisted_47, toDisplayString(JSON.stringify(action.parameters, null, 2)), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      action.description ? (openBlock(), createBlock(_component_el_descriptions_item, {
                                        key: 0,
                                        label: "描述"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(action.description), 1)
                                        ]),
                                        _: 2
                                      }, 1024)) : createCommentVNode("", true)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]);
                              }), 128))
                            ])) : (openBlock(), createBlock(_component_el_empty, {
                              key: 1,
                              description: "暂无动作配置",
                              "image-size": 80
                            }))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_tab_pane, {
                          label: "执行配置",
                          name: "execution"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_descriptions, {
                              column: 2,
                              border: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_descriptions_item, { label: "执行引擎" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(__props.strategy.execution?.engine || "SYNC"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "超时时间" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(__props.strategy.execution?.timeout || 5e3) + "ms ", 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "重试次数" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(__props.strategy.execution?.retryCount || 3), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "缓存启用" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(__props.strategy.execution?.cacheEnabled ? "是" : "否"), 1)
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ]);
    };
  }
});
var StrategyDetailPanel = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-2635913a"]]);
const _hoisted_1$3 = { class: "execution-detail-panel" };
const _hoisted_2$3 = { class: "stats-container" };
const _hoisted_3$2 = { class: "stat-item" };
const _hoisted_4$2 = { class: "stat-icon total" };
const _hoisted_5$2 = { class: "stat-info" };
const _hoisted_6$2 = { class: "stat-value" };
const _hoisted_7$1 = { class: "stat-item" };
const _hoisted_8$1 = { class: "stat-icon success" };
const _hoisted_9$1 = { class: "stat-info" };
const _hoisted_10$1 = { class: "stat-value" };
const _hoisted_11 = { class: "stat-item" };
const _hoisted_12 = { class: "stat-icon failed" };
const _hoisted_13 = { class: "stat-info" };
const _hoisted_14 = { class: "stat-value" };
const _hoisted_15 = { class: "stat-item" };
const _hoisted_16 = { class: "stat-icon duration" };
const _hoisted_17 = { class: "stat-info" };
const _hoisted_18 = { class: "stat-value" };
const _hoisted_19 = { class: "step-content" };
const _hoisted_20 = { class: "step-header" };
const _hoisted_21 = { class: "step-title" };
const _hoisted_22 = { class: "step-meta" };
const _hoisted_23 = { class: "step-index" };
const _hoisted_24 = { class: "step-duration" };
const _hoisted_25 = {
  key: 0,
  class: "step-result"
};
const _hoisted_26 = { class: "result-json" };
const _hoisted_27 = {
  key: 1,
  class: "step-error"
};
const _hoisted_28 = { class: "error-message" };
const _hoisted_29 = { class: "data-json" };
const _hoisted_30 = {
  key: 0,
  class: "error-details"
};
const _hoisted_31 = { class: "error-json" };
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ExecutionDetailPanel",
  props: {
    execution: {}
  },
  setup(__props) {
    const props = __props;
    const successSteps = computed(() => {
      return props.execution.steps.filter((step) => step.executed && !step.error).length;
    });
    const failedSteps = computed(() => {
      return props.execution.steps.filter((step) => step.error).length;
    });
    const avgStepDuration = computed(() => {
      const totalDuration = props.execution.steps.reduce((sum, step) => sum + step.duration, 0);
      return props.execution.steps.length > 0 ? Math.round(totalDuration / props.execution.steps.length) : 0;
    });
    const getEffectTagType = (effect) => {
      const effectMap = {
        "ALLOW": "success",
        "DENY": "danger",
        "CONDITIONAL": "warning"
      };
      return effectMap[effect] || "default";
    };
    const getStepType = (step) => {
      if (step.error) return "danger";
      if (step.executed) return "success";
      return "info";
    };
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };
    const formatStepTime = (duration) => {
      return `${duration}ms`;
    };
    return (_ctx, _cache) => {
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_tag = ElTag;
      const _component_el_descriptions = ElDescriptions;
      const _component_el_card = ElCard;
      const _component_el_col = ElCol;
      const _component_el_icon = ElIcon;
      const _component_el_row = ElRow;
      const _component_el_timeline_item = ElTimelineItem;
      const _component_el_timeline = ElTimeline;
      const _component_el_empty = ElEmpty;
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createVNode(_component_el_row, { gutter: 16 }, {
          default: withCtx(() => [
            createVNode(_component_el_col, { span: 12 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "执行概览" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_descriptions, {
                      column: 1,
                      border: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_descriptions_item, { label: "执行ID" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.execution.executionId), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "策略ID" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.execution.strategyId), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "策略效果" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_tag, {
                              type: getEffectTagType(__props.execution.effect),
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(__props.execution.effect), 1)
                              ]),
                              _: 1
                            }, 8, ["type"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "执行状态" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_tag, {
                              type: __props.execution.success ? "success" : "danger",
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(__props.execution.success ? "成功" : "失败"), 1)
                              ]),
                              _: 1
                            }, 8, ["type"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "执行时间" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.execution.executionTime) + "ms ", 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "开始时间" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(formatTime(__props.execution.metadata.startTime)), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "结束时间" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(formatTime(__props.execution.metadata.endTime)), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_descriptions_item, { label: "策略版本" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.execution.metadata.version), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            createVNode(_component_el_col, { span: 12 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "执行统计" }, {
                  default: withCtx(() => [
                    createBaseVNode("div", _hoisted_2$3, [
                      createBaseVNode("div", _hoisted_3$2, [
                        createBaseVNode("div", _hoisted_4$2, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(list_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_5$2, [
                          createBaseVNode("div", _hoisted_6$2, toDisplayString(__props.execution.steps.length), 1),
                          _cache[0] || (_cache[0] = createBaseVNode("div", { class: "stat-label" }, "总步骤数", -1))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_7$1, [
                        createBaseVNode("div", _hoisted_8$1, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(circle_check_filled_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_9$1, [
                          createBaseVNode("div", _hoisted_10$1, toDisplayString(successSteps.value), 1),
                          _cache[1] || (_cache[1] = createBaseVNode("div", { class: "stat-label" }, "成功步骤", -1))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_11, [
                        createBaseVNode("div", _hoisted_12, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(circle_close_filled_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_13, [
                          createBaseVNode("div", _hoisted_14, toDisplayString(failedSteps.value), 1),
                          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "stat-label" }, "失败步骤", -1))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_15, [
                        createBaseVNode("div", _hoisted_16, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(timer_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_17, [
                          createBaseVNode("div", _hoisted_18, toDisplayString(avgStepDuration.value) + "ms", 1),
                          _cache[3] || (_cache[3] = createBaseVNode("div", { class: "stat-label" }, "平均步骤时间", -1))
                        ])
                      ])
                    ])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        createVNode(_component_el_row, { style: { "margin-top": "16px" } }, {
          default: withCtx(() => [
            createVNode(_component_el_col, { span: 24 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "执行步骤详情" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_timeline, null, {
                      default: withCtx(() => [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.execution.steps, (step, index2) => {
                          return openBlock(), createBlock(_component_el_timeline_item, {
                            key: step.nodeId,
                            type: getStepType(step),
                            timestamp: formatStepTime(step.duration)
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("div", _hoisted_19, [
                                createBaseVNode("div", _hoisted_20, [
                                  createBaseVNode("h4", _hoisted_21, [
                                    createTextVNode(toDisplayString(step.nodeName) + " ", 1),
                                    createVNode(_component_el_tag, {
                                      size: "small",
                                      type: step.executed ? "success" : "info"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(step.executed ? "已执行" : "跳过"), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["type"])
                                  ]),
                                  createBaseVNode("div", _hoisted_22, [
                                    createBaseVNode("span", _hoisted_23, "步骤 " + toDisplayString(index2 + 1), 1),
                                    createBaseVNode("span", _hoisted_24, toDisplayString(step.duration) + "ms", 1)
                                  ])
                                ]),
                                step.result ? (openBlock(), createElementBlock("div", _hoisted_25, [
                                  _cache[4] || (_cache[4] = createBaseVNode("h5", null, "执行结果", -1)),
                                  createBaseVNode("pre", _hoisted_26, toDisplayString(JSON.stringify(step.result, null, 2)), 1)
                                ])) : createCommentVNode("", true),
                                step.error ? (openBlock(), createElementBlock("div", _hoisted_27, [
                                  _cache[5] || (_cache[5] = createBaseVNode("h5", null, "错误信息", -1)),
                                  createBaseVNode("div", _hoisted_28, toDisplayString(step.error), 1)
                                ])) : createCommentVNode("", true)
                              ])
                            ]),
                            _: 2
                          }, 1032, ["type", "timestamp"]);
                        }), 128))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        createVNode(_component_el_row, {
          gutter: 16,
          style: { "margin-top": "16px" }
        }, {
          default: withCtx(() => [
            createVNode(_component_el_col, { span: 12 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "输出数据" }, {
                  default: withCtx(() => [
                    createBaseVNode("pre", _hoisted_29, toDisplayString(JSON.stringify(__props.execution.output, null, 2)), 1)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            createVNode(_component_el_col, { span: 12 }, {
              default: withCtx(() => [
                createVNode(_component_el_card, { title: "错误信息" }, {
                  default: withCtx(() => [
                    __props.execution.error ? (openBlock(), createElementBlock("div", _hoisted_30, [
                      createVNode(_component_el_descriptions, {
                        column: 1,
                        border: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_descriptions_item, { label: "错误代码" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(__props.execution.error.code), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_descriptions_item, { label: "错误消息" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(__props.execution.error.message), 1)
                            ]),
                            _: 1
                          }),
                          __props.execution.error.details ? (openBlock(), createBlock(_component_el_descriptions_item, {
                            key: 0,
                            label: "详细信息"
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("pre", _hoisted_31, toDisplayString(JSON.stringify(__props.execution.error.details, null, 2)), 1)
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        _: 1
                      })
                    ])) : (openBlock(), createBlock(_component_el_empty, {
                      key: 1,
                      description: "无错误信息",
                      "image-size": 80
                    }))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ]);
    };
  }
});
var ExecutionDetailPanel = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-b762e9b9"]]);
const _hoisted_1$2 = { class: "strategy-execution-history" };
const _hoisted_2$2 = { class: "history-header" };
const _hoisted_3$1 = { class: "header-controls" };
const _hoisted_4$1 = { class: "json-preview" };
const _hoisted_5$1 = { class: "json-preview" };
const _hoisted_6$1 = { class: "table-pagination" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "StrategyExecutionHistory",
  props: {
    strategyId: {}
  },
  setup(__props) {
    const props = __props;
    const loading = ref(false);
    const executionHistory = ref([]);
    const statusFilter = ref("");
    const currentPage = ref(1);
    const pageSize = ref(20);
    const totalRecords = ref(0);
    const showExecutionDetail = ref(false);
    const selectedExecution = ref(null);
    computed(() => {
      if (!statusFilter.value) return executionHistory.value;
      return executionHistory.value.filter((execution) => {
        if (statusFilter.value === "success") return execution.success;
        if (statusFilter.value === "failed") return !execution.success;
        return true;
      });
    });
    const getEffectTagType = (effect) => {
      const effectMap = {
        "ALLOW": "success",
        "DENY": "danger",
        "CONDITIONAL": "warning"
      };
      return effectMap[effect] || "default";
    };
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };
    const getInputData = (execution) => {
      return execution.output || {};
    };
    const refreshHistory = async () => {
      loading.value = true;
      try {
        const result = await strategyService.getExecutionHistory(props.strategyId, {
          page: currentPage.value,
          size: pageSize.value
        });
        executionHistory.value = result.list;
        totalRecords.value = result.total;
      } catch (error) {
        BtcMessage.error("加载执行历史失败");
      } finally {
        loading.value = false;
      }
    };
    const handleSizeChange = (size) => {
      pageSize.value = size;
      refreshHistory();
    };
    const handleCurrentChange = (page) => {
      currentPage.value = page;
      refreshHistory();
    };
    const viewExecutionDetail = (execution) => {
      selectedExecution.value = execution;
      showExecutionDetail.value = true;
    };
    const replayExecution = async (execution) => {
      try {
        BtcMessage.success("执行重放已启动");
      } catch (error) {
        BtcMessage.error("执行重放失败");
      }
    };
    onMounted(() => {
      refreshHistory();
    });
    return (_ctx, _cache) => {
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_link = ElLink;
      const _component_el_table_column = ElTableColumn;
      const _component_el_tag = ElTag;
      const _component_el_popover = ElPopover;
      const _component_el_table = ElTable;
      const _component_el_pagination = ElPagination;
      const _component_el_dialog = ElDialog;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", _hoisted_2$2, [
          _cache[5] || (_cache[5] = createBaseVNode("div", { class: "header-info" }, [
            createBaseVNode("h3", null, "执行历史记录"),
            createBaseVNode("p", null, "查看策略的详细执行历史和结果分析")
          ], -1)),
          createBaseVNode("div", _hoisted_3$1, [
            createVNode(_component_el_select, {
              modelValue: statusFilter.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => statusFilter.value = $event),
              placeholder: "状态筛选",
              clearable: "",
              style: { "width": "120px" }
            }, {
              default: withCtx(() => [
                createVNode(_component_el_option, {
                  label: "全部",
                  value: ""
                }),
                createVNode(_component_el_option, {
                  label: "成功",
                  value: "success"
                }),
                createVNode(_component_el_option, {
                  label: "失败",
                  value: "failed"
                })
              ]),
              _: 1
            }, 8, ["modelValue"]),
            createVNode(_component_el_button, {
              onClick: refreshHistory,
              loading: loading.value
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(refresh_default))
                  ]),
                  _: 1
                }),
                _cache[4] || (_cache[4] = createTextVNode(" 刷新 ", -1))
              ]),
              _: 1
            }, 8, ["loading"])
          ])
        ]),
        withDirectives((openBlock(), createBlock(_component_el_table, {
          data: executionHistory.value,
          stripe: ""
        }, {
          default: withCtx(() => [
            createVNode(_component_el_table_column, {
              prop: "executionId",
              label: "执行ID",
              width: "180"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_link, {
                  type: "primary",
                  onClick: ($event) => viewExecutionDetail(row)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.executionId), 1)
                  ]),
                  _: 2
                }, 1032, ["onClick"])
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "effect",
              label: "策略效果",
              width: "100"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_tag, {
                  type: getEffectTagType(row.effect),
                  size: "small"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.effect), 1)
                  ]),
                  _: 2
                }, 1032, ["type"])
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "success",
              label: "执行状态",
              width: "100"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_tag, {
                  type: row.success ? "success" : "danger",
                  size: "small"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.success ? "成功" : "失败"), 1)
                  ]),
                  _: 2
                }, 1032, ["type"])
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "executionTime",
              label: "执行时间",
              width: "100"
            }, {
              default: withCtx(({ row }) => [
                createTextVNode(toDisplayString(row.executionTime) + "ms ", 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "steps",
              label: "执行步骤",
              width: "100"
            }, {
              default: withCtx(({ row }) => [
                createTextVNode(toDisplayString(row.steps.length) + " 步 ", 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "metadata.startTime",
              label: "开始时间",
              width: "180"
            }, {
              default: withCtx(({ row }) => [
                createTextVNode(toDisplayString(formatTime(row.metadata.startTime)), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              label: "输入数据",
              "min-width": "200"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_popover, {
                  placement: "top",
                  trigger: "hover",
                  width: "400"
                }, {
                  reference: withCtx(() => [
                    createVNode(_component_el_button, {
                      size: "small",
                      text: ""
                    }, {
                      default: withCtx(() => [..._cache[6] || (_cache[6] = [
                        createTextVNode("查看输入", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  default: withCtx(() => [
                    createBaseVNode("pre", _hoisted_4$1, toDisplayString(JSON.stringify(getInputData(row), null, 2)), 1)
                  ]),
                  _: 2
                }, 1024)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              label: "输出结果",
              "min-width": "200"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_popover, {
                  placement: "top",
                  trigger: "hover",
                  width: "400"
                }, {
                  reference: withCtx(() => [
                    createVNode(_component_el_button, {
                      size: "small",
                      text: ""
                    }, {
                      default: withCtx(() => [..._cache[7] || (_cache[7] = [
                        createTextVNode("查看输出", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  default: withCtx(() => [
                    createBaseVNode("pre", _hoisted_5$1, toDisplayString(JSON.stringify(row.output, null, 2)), 1)
                  ]),
                  _: 2
                }, 1024)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              label: "操作",
              width: "120"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_button, {
                  size: "small",
                  onClick: ($event) => viewExecutionDetail(row)
                }, {
                  default: withCtx(() => [..._cache[8] || (_cache[8] = [
                    createTextVNode(" 详情 ", -1)
                  ])]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_el_button, {
                  size: "small",
                  type: "primary",
                  onClick: ($event) => replayExecution(row)
                }, {
                  default: withCtx(() => [..._cache[9] || (_cache[9] = [
                    createTextVNode(" 重放 ", -1)
                  ])]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["data"])), [
          [_directive_loading, loading.value]
        ]),
        createBaseVNode("div", _hoisted_6$1, [
          createVNode(_component_el_pagination, {
            "current-page": currentPage.value,
            "onUpdate:currentPage": _cache[1] || (_cache[1] = ($event) => currentPage.value = $event),
            "page-size": pageSize.value,
            "onUpdate:pageSize": _cache[2] || (_cache[2] = ($event) => pageSize.value = $event),
            total: totalRecords.value,
            "page-sizes": [10, 20, 50, 100],
            layout: "total, sizes, prev, pager, next, jumper",
            onSizeChange: handleSizeChange,
            onCurrentChange: handleCurrentChange
          }, null, 8, ["current-page", "page-size", "total"])
        ]),
        createVNode(_component_el_dialog, {
          modelValue: showExecutionDetail.value,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => showExecutionDetail.value = $event),
          title: "执行详情",
          width: "80%"
        }, {
          default: withCtx(() => [
            selectedExecution.value ? (openBlock(), createBlock(ExecutionDetailPanel, {
              key: 0,
              execution: selectedExecution.value
            }, null, 8, ["execution"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
var StrategyExecutionHistory = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-ff0d39ea"]]);
const _hoisted_1$1 = { class: "strategy-alert-config" };
const _hoisted_2$1 = { class: "config-header" };
const _hoisted_3 = { class: "header-info" };
const _hoisted_4 = { key: 0 };
const _hoisted_5 = { key: 1 };
const _hoisted_6 = { class: "threshold-unit" };
const _hoisted_7 = { class: "alert-preview" };
const _hoisted_8 = { class: "preview-content" };
const _hoisted_9 = {
  key: 0,
  class: "existing-alerts"
};
const _hoisted_10 = { class: "form-actions" };
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "StrategyAlertConfig",
  props: {
    strategy: {}
  },
  emits: ["save"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const formRef = ref();
    const saving = ref(false);
    const existingAlerts = ref([]);
    const selectedActionTypes = ref([]);
    const alertForm = ref({
      name: "",
      type: "PERFORMANCE",
      condition: {
        metric: "",
        operator: "gt",
        threshold: 0,
        duration: 300
      },
      enabled: true
    });
    const emailConfig = ref({
      recipients: "",
      subject: "策略监控告警"
    });
    const webhookConfig = ref({
      url: "",
      method: "POST"
    });
    const smsConfig = ref({
      phoneNumbers: ""
    });
    const alertRules = {
      name: [
        { required: true, message: "请输入告警名称", trigger: "blur" }
      ],
      type: [
        { required: true, message: "请选择告警类型", trigger: "change" }
      ]
    };
    const availableMetrics = computed(() => {
      const metricsMap = {
        "PERFORMANCE": [
          { value: "avg_response_time", label: "平均响应时间" },
          { value: "p95_response_time", label: "P95响应时间" },
          { value: "p99_response_time", label: "P99响应时间" }
        ],
        "ERROR_RATE": [
          { value: "error_rate", label: "错误率" },
          { value: "failure_count", label: "失败次数" }
        ],
        "EXECUTION_COUNT": [
          { value: "execution_count", label: "执行次数" },
          { value: "execution_rate", label: "执行频率" }
        ]
      };
      return metricsMap[alertForm.value.type] || [];
    });
    const getThresholdPrecision = () => {
      const metric = alertForm.value.condition.metric;
      if (metric === "error_rate") return 2;
      return 0;
    };
    const getThresholdUnit = () => {
      const metric = alertForm.value.condition.metric;
      const unitMap = {
        "avg_response_time": "ms",
        "p95_response_time": "ms",
        "p99_response_time": "ms",
        "error_rate": "%",
        "failure_count": "次",
        "execution_count": "次",
        "execution_rate": "次/分钟"
      };
      return unitMap[metric] || "";
    };
    const getTypeLabel = (type) => {
      const labelMap = {
        "PERFORMANCE": "性能",
        "ERROR_RATE": "错误率",
        "EXECUTION_COUNT": "执行次数"
      };
      return labelMap[type] || type;
    };
    const getPreviewTitle = () => {
      if (!alertForm.value.name) return "告警规则预览";
      return `告警规则: ${alertForm.value.name}`;
    };
    const getPreviewDescription = () => {
      const { condition } = alertForm.value;
      if (!condition.metric) return "请完善告警配置";
      const metricLabel = availableMetrics.value.find((m) => m.value === condition.metric)?.label || condition.metric;
      const operatorMap = {
        "gt": "大于",
        "gte": "大于等于",
        "lt": "小于",
        "lte": "小于等于",
        "eq": "等于"
      };
      return `当 ${metricLabel} ${operatorMap[condition.operator]} ${condition.threshold}${getThresholdUnit()} 且持续 ${condition.duration} 秒时触发告警`;
    };
    const handleTypeChange = () => {
      alertForm.value.condition.metric = "";
      alertForm.value.condition.threshold = 0;
    };
    const resetForm = () => {
      alertForm.value = {
        name: "",
        type: "PERFORMANCE",
        condition: {
          metric: "",
          operator: "gt",
          threshold: 0,
          duration: 300
        },
        enabled: true
      };
      selectedActionTypes.value = [];
      emailConfig.value = { recipients: "", subject: "策略监控告警" };
      webhookConfig.value = { url: "", method: "POST" };
      smsConfig.value = { phoneNumbers: "" };
    };
    const saveAlert = async () => {
      try {
        await formRef.value.validate();
        saving.value = true;
        const actions = selectedActionTypes.value.map((type) => {
          const configMap = {
            "EMAIL": emailConfig.value,
            "WEBHOOK": webhookConfig.value,
            "SMS": smsConfig.value
          };
          return {
            type,
            config: configMap[type] || {}
          };
        });
        const alertData = {
          strategyId: props.strategy?.id || "",
          name: alertForm.value.name,
          type: alertForm.value.type,
          condition: alertForm.value.condition,
          actions,
          enabled: alertForm.value.enabled
        };
        await strategyService.createAlert(alertData);
        BtcMessage.success("告警规则保存成功");
        emit("save");
        loadExistingAlerts();
        resetForm();
      } catch (error) {
        BtcMessage.error(error.message || "保存失败");
      } finally {
        saving.value = false;
      }
    };
    const editAlert = (alert) => {
      alertForm.value = {
        name: alert.name,
        type: alert.type,
        condition: { ...alert.condition },
        enabled: alert.enabled
      };
      selectedActionTypes.value = alert.actions.map((action) => action.type);
      alert.actions.forEach((action) => {
        if (action.type === "EMAIL") {
          emailConfig.value = { ...action.config };
        } else if (action.type === "WEBHOOK") {
          webhookConfig.value = { ...action.config };
        } else if (action.type === "SMS") {
          smsConfig.value = { ...action.config };
        }
      });
    };
    const deleteAlert = async (alert) => {
      try {
        await BtcConfirm("确定要删除这个告警规则吗？", "确认删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        await strategyService.deleteAlert(alert.id);
        BtcMessage.success("告警规则删除成功");
        loadExistingAlerts();
      } catch (error) {
        if (error !== "cancel") {
          BtcMessage.error("删除失败");
        }
      }
    };
    const loadExistingAlerts = async () => {
      try {
        const alerts = await strategyService.getAlerts(props.strategy?.id);
        existingAlerts.value = alerts;
      } catch (error) {
        console.error("加载告警列表失败:", error);
      }
    };
    onMounted(() => {
      loadExistingAlerts();
      if (props.strategy) {
        alertForm.value.name = `${props.strategy.name} - 性能告警`;
      }
    });
    return (_ctx, _cache) => {
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_input_number = ElInputNumber;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_checkbox_group = ElCheckboxGroup;
      const _component_el_switch = ElSwitch;
      const _component_el_form = ElForm;
      const _component_el_alert = ElAlert;
      const _component_el_table_column = ElTableColumn;
      const _component_el_tag = ElTag;
      const _component_el_button = ElButton;
      const _component_el_table = ElTable;
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3, [
            _cache[13] || (_cache[13] = createBaseVNode("h3", null, "告警配置", -1)),
            __props.strategy ? (openBlock(), createElementBlock("p", _hoisted_4, '为策略 "' + toDisplayString(__props.strategy.name) + '" 配置监控告警', 1)) : (openBlock(), createElementBlock("p", _hoisted_5, "配置系统级监控告警"))
          ])
        ]),
        createVNode(_component_el_form, {
          model: alertForm.value,
          rules: alertRules,
          ref_key: "formRef",
          ref: formRef,
          "label-width": "120px"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_form_item, {
              label: "告警名称",
              prop: "name"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: alertForm.value.name,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => alertForm.value.name = $event),
                  placeholder: "请输入告警名称"
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "告警类型",
              prop: "type"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_select, {
                  modelValue: alertForm.value.type,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => alertForm.value.type = $event),
                  placeholder: "选择告警类型",
                  onChange: handleTypeChange
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_option, {
                      label: "性能告警",
                      value: "PERFORMANCE"
                    }),
                    createVNode(_component_el_option, {
                      label: "错误率告警",
                      value: "ERROR_RATE"
                    }),
                    createVNode(_component_el_option, {
                      label: "执行次数告警",
                      value: "EXECUTION_COUNT"
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "监控指标",
              prop: "metric"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_select, {
                  modelValue: alertForm.value.condition.metric,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => alertForm.value.condition.metric = $event),
                  placeholder: "选择监控指标"
                }, {
                  default: withCtx(() => [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(availableMetrics.value, (metric) => {
                      return openBlock(), createBlock(_component_el_option, {
                        key: metric.value,
                        label: metric.label,
                        value: metric.value
                      }, null, 8, ["label", "value"]);
                    }), 128))
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "比较操作符",
              prop: "operator"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_select, {
                  modelValue: alertForm.value.condition.operator,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => alertForm.value.condition.operator = $event),
                  placeholder: "选择操作符"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_option, {
                      label: "大于 (>)",
                      value: "gt"
                    }),
                    createVNode(_component_el_option, {
                      label: "大于等于 (>=)",
                      value: "gte"
                    }),
                    createVNode(_component_el_option, {
                      label: "小于 (<)",
                      value: "lt"
                    }),
                    createVNode(_component_el_option, {
                      label: "小于等于 (<=)",
                      value: "lte"
                    }),
                    createVNode(_component_el_option, {
                      label: "等于 (=)",
                      value: "eq"
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "阈值",
              prop: "threshold"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input_number, {
                  modelValue: alertForm.value.condition.threshold,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => alertForm.value.condition.threshold = $event),
                  min: 0,
                  precision: getThresholdPrecision(),
                  style: { "width": "100%" }
                }, null, 8, ["modelValue", "precision"]),
                createBaseVNode("span", _hoisted_6, toDisplayString(getThresholdUnit()), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "持续时间",
              prop: "duration"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input_number, {
                  modelValue: alertForm.value.condition.duration,
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => alertForm.value.condition.duration = $event),
                  min: 60,
                  max: 3600,
                  style: { "width": "100%" }
                }, null, 8, ["modelValue"]),
                _cache[14] || (_cache[14] = createBaseVNode("span", { class: "threshold-unit" }, "秒", -1))
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, { label: "告警方式" }, {
              default: withCtx(() => [
                createVNode(_component_el_checkbox_group, {
                  modelValue: selectedActionTypes.value,
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => selectedActionTypes.value = $event)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_checkbox, { label: "EMAIL" }, {
                      default: withCtx(() => [..._cache[15] || (_cache[15] = [
                        createTextVNode("邮件通知", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_checkbox, { label: "WEBHOOK" }, {
                      default: withCtx(() => [..._cache[16] || (_cache[16] = [
                        createTextVNode("Webhook", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_checkbox, { label: "SMS" }, {
                      default: withCtx(() => [..._cache[17] || (_cache[17] = [
                        createTextVNode("短信通知", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            selectedActionTypes.value.includes("EMAIL") ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createVNode(_component_el_form_item, { label: "邮件地址" }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: emailConfig.value.recipients,
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => emailConfig.value.recipients = $event),
                    placeholder: "多个邮箱用逗号分隔"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, { label: "邮件主题" }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: emailConfig.value.subject,
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => emailConfig.value.subject = $event),
                    placeholder: "告警邮件主题"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ], 64)) : createCommentVNode("", true),
            selectedActionTypes.value.includes("WEBHOOK") ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createVNode(_component_el_form_item, { label: "Webhook URL" }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: webhookConfig.value.url,
                    "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => webhookConfig.value.url = $event),
                    placeholder: "https://example.com/webhook"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, { label: "请求方法" }, {
                default: withCtx(() => [
                  createVNode(_component_el_select, {
                    modelValue: webhookConfig.value.method,
                    "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => webhookConfig.value.method = $event)
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "POST",
                        value: "POST"
                      }),
                      createVNode(_component_el_option, {
                        label: "PUT",
                        value: "PUT"
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              })
            ], 64)) : createCommentVNode("", true),
            selectedActionTypes.value.includes("SMS") ? (openBlock(), createBlock(_component_el_form_item, {
              key: 2,
              label: "手机号码"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: smsConfig.value.phoneNumbers,
                  "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => smsConfig.value.phoneNumbers = $event),
                  placeholder: "多个号码用逗号分隔"
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            })) : createCommentVNode("", true),
            createVNode(_component_el_form_item, { label: "启用状态" }, {
              default: withCtx(() => [
                createVNode(_component_el_switch, {
                  modelValue: alertForm.value.enabled,
                  "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => alertForm.value.enabled = $event)
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["model"]),
        createBaseVNode("div", _hoisted_7, [
          _cache[18] || (_cache[18] = createBaseVNode("h4", null, "告警规则预览", -1)),
          createBaseVNode("div", _hoisted_8, [
            createVNode(_component_el_alert, {
              title: getPreviewTitle(),
              description: getPreviewDescription(),
              type: "info",
              "show-icon": "",
              closable: false
            }, null, 8, ["title", "description"])
          ])
        ]),
        existingAlerts.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_9, [
          _cache[21] || (_cache[21] = createBaseVNode("h4", null, "现有告警规则", -1)),
          createVNode(_component_el_table, {
            data: existingAlerts.value,
            stripe: ""
          }, {
            default: withCtx(() => [
              createVNode(_component_el_table_column, {
                prop: "name",
                label: "告警名称"
              }),
              createVNode(_component_el_table_column, {
                prop: "type",
                label: "类型",
                width: "120"
              }, {
                default: withCtx(({ row }) => [
                  createVNode(_component_el_tag, { size: "small" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(getTypeLabel(row.type)), 1)
                    ]),
                    _: 2
                  }, 1024)
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                prop: "condition.metric",
                label: "监控指标",
                width: "120"
              }),
              createVNode(_component_el_table_column, {
                label: "条件",
                width: "150"
              }, {
                default: withCtx(({ row }) => [
                  createTextVNode(toDisplayString(row.condition.operator) + " " + toDisplayString(row.condition.threshold), 1)
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                prop: "enabled",
                label: "状态",
                width: "80"
              }, {
                default: withCtx(({ row }) => [
                  createVNode(_component_el_tag, {
                    type: row.enabled ? "success" : "danger",
                    size: "small"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(row.enabled ? "启用" : "禁用"), 1)
                    ]),
                    _: 2
                  }, 1032, ["type"])
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                label: "操作",
                width: "120"
              }, {
                default: withCtx(({ row }) => [
                  createVNode(_component_el_button, {
                    size: "small",
                    onClick: ($event) => editAlert(row)
                  }, {
                    default: withCtx(() => [..._cache[19] || (_cache[19] = [
                      createTextVNode("编辑", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_el_button, {
                    size: "small",
                    type: "danger",
                    onClick: ($event) => deleteAlert(row)
                  }, {
                    default: withCtx(() => [..._cache[20] || (_cache[20] = [
                      createTextVNode("删除", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["data"])
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_10, [
          createVNode(_component_el_button, { onClick: resetForm }, {
            default: withCtx(() => [..._cache[22] || (_cache[22] = [
              createTextVNode("重置", -1)
            ])]),
            _: 1
          }),
          createVNode(_component_el_button, {
            type: "primary",
            onClick: saveAlert,
            loading: saving.value
          }, {
            default: withCtx(() => [..._cache[23] || (_cache[23] = [
              createTextVNode(" 保存告警规则 ", -1)
            ])]),
            _: 1
          }, 8, ["loading"])
        ])
      ]);
    };
  }
});
var StrategyAlertConfig = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-e3944081"]]);
const _hoisted_1 = { class: "strategy-monitor" };
const _hoisted_2 = { class: "strategy-details" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const selectedStatus = ref("");
    const showDetailDialog = ref(false);
    const showHistoryDialog = ref(false);
    const showAlertsDialog = ref(false);
    const selectedStrategy = ref(null);
    const selectedStrategyStats = ref(null);
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
      { prop: "description", label: "描述", minWidth: 200 },
      { prop: "updatedAt", label: "更新时间", width: 180 }
    ]);
    const handleStatusFilter = () => {
      setTimeout(() => crudRef.value?.crud.loadData(), 50);
    };
    function onBeforeRefresh(params) {
      const next = { ...params };
      if (selectedStatus.value) {
        next.status = selectedStatus.value;
      }
      return next;
    }
    const viewStrategyDetail = async (strategy) => {
      selectedStrategy.value = strategy;
      try {
        selectedStrategyStats.value = await strategyService.getStrategyStats(strategy.id);
      } catch (error) {
        console.error("Failed to load strategy stats:", error);
      }
      showDetailDialog.value = true;
    };
    const viewExecutionHistory = (strategy) => {
      selectedStrategy.value = strategy;
      showHistoryDialog.value = true;
    };
    const configureAlerts = (strategy) => {
      selectedStrategy.value = strategy;
      showAlertsDialog.value = true;
    };
    onMounted(() => {
      setTimeout(() => crudRef.value?.crud.loadData(), 100);
    });
    return (_ctx, _cache) => {
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_button = ElButton;
      const _component_el_dialog = ElDialog;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(unref(BtcCrud), {
            ref_key: "crudRef",
            ref: crudRef,
            service: wrappedService,
            "on-before-refresh": onBeforeRefresh,
            class: "strategy-monitor-crud"
          }, {
            default: withCtx(() => [
              createVNode(unref(BtcRow), null, {
                default: withCtx(() => [
                  createVNode(unref(BtcRefreshBtn)),
                  createVNode(_component_el_select, {
                    modelValue: selectedStatus.value,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedStatus.value = $event),
                    placeholder: "策略状态",
                    clearable: "",
                    style: { "width": "120px", "margin-left": "8px" },
                    onChange: handleStatusFilter
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "全部",
                        value: ""
                      }),
                      createVNode(_component_el_option, {
                        label: "激活",
                        value: "ACTIVE"
                      }),
                      createVNode(_component_el_option, {
                        label: "停用",
                        value: "INACTIVE"
                      }),
                      createVNode(_component_el_option, {
                        label: "测试中",
                        value: "TESTING"
                      })
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
                    op: { buttons: ["view", "history", "alerts"] },
                    border: ""
                  }, {
                    "op-view": withCtx(({ row }) => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        size: "small",
                        onClick: ($event) => viewStrategyDetail(row)
                      }, {
                        default: withCtx(() => [..._cache[4] || (_cache[4] = [
                          createTextVNode(" 查看详情 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    "op-history": withCtx(({ row }) => [
                      createVNode(_component_el_button, {
                        type: "info",
                        size: "small",
                        onClick: ($event) => viewExecutionHistory(row)
                      }, {
                        default: withCtx(() => [..._cache[5] || (_cache[5] = [
                          createTextVNode(" 执行历史 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    "op-alerts": withCtx(({ row }) => [
                      createVNode(_component_el_button, {
                        type: "warning",
                        size: "small",
                        onClick: ($event) => configureAlerts(row)
                      }, {
                        default: withCtx(() => [..._cache[6] || (_cache[6] = [
                          createTextVNode(" 告警配置 ", -1)
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
              })
            ]),
            _: 1
          }, 512)
        ]),
        createVNode(_component_el_dialog, {
          modelValue: showDetailDialog.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => showDetailDialog.value = $event),
          title: "策略详情",
          width: "1000px"
        }, {
          default: withCtx(() => [
            selectedStrategy.value ? (openBlock(), createBlock(StrategyDetailPanel, {
              key: 0,
              strategy: selectedStrategy.value,
              stats: selectedStrategyStats.value
            }, null, 8, ["strategy", "stats"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: showHistoryDialog.value,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => showHistoryDialog.value = $event),
          title: "执行历史",
          width: "1200px"
        }, {
          default: withCtx(() => [
            selectedStrategy.value ? (openBlock(), createBlock(StrategyExecutionHistory, {
              key: 0,
              "strategy-id": selectedStrategy.value.id
            }, null, 8, ["strategy-id"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: showAlertsDialog.value,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => showAlertsDialog.value = $event),
          title: "告警配置",
          width: "800px"
        }, {
          default: withCtx(() => [
            selectedStrategy.value ? (openBlock(), createBlock(StrategyAlertConfig, {
              key: 0,
              strategy: selectedStrategy.value
            }, null, 8, ["strategy"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-36a101b5"]]);
export {
  index as default
};
