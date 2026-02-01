import { a as defineComponent, N as shallowRef, G as watch, x as createBlock, f as normalizeClass, O as ElSegmented, o as openBlock, i as _export_sfc, r as ref, b as computed, e as createElementBlock, h as createBaseVNode, l as createVNode, P as ElText, w as withCtx, Q as ElSwitch, R as ElInput, m as unref, S as ElScrollbar, v as createTextVNode, T as search_default, M as ElTree, L as createCommentVNode, E as ElIcon, U as folder_opened_default, t as toDisplayString, s as ElTag, V as ElTableColumn, W as view_default, X as plus_default, Y as edit_default, Z as delete_default, $ as operation_default, a0 as ElTooltip, a1 as ElTable, a2 as ElEmpty, F as Fragment, q as renderList, a3 as ElCheckbox, a4 as TransitionGroup, a5 as close_default, a6 as document_default, k as onMounted, n as normalizeStyle, D as ElButton, a7 as ElDropdown, a8 as ElStatistic, a9 as select_default, aa as ElDivider, ab as arrow_down_default, ac as ElDropdownMenu, ad as ElDropdownItem, ae as connection_default } from "./index-CeQEKVXA.js";
import { useMessage } from "@/utils/use-message";
import { service } from "@services/eps";
import "@btc/shared-core";
import "@btc/shared-utils";
import "@btc/shared-components";
var _sfc_main$4 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcSelectButton"
  },
  __name: "index",
  props: {
    modelValue: {},
    options: { default: () => [] },
    prop: {},
    small: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const internalValue = shallowRef(props.modelValue);
    watch(() => props.modelValue, (newValue) => {
      internalValue.value = newValue;
    });
    watch(internalValue, (newValue) => {
      emit("update:modelValue", newValue === null ? "" : newValue);
    });
    const handleChange = (val) => {
      emit("change", val === null ? "" : val);
    };
    return (_ctx, _cache) => {
      const _component_el_segmented = ElSegmented;
      return openBlock(), createBlock(_component_el_segmented, {
        modelValue: internalValue.value,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => internalValue.value = $event),
        options: __props.options,
        class: normalizeClass(["btc-select-button", { "is-small": __props.small }]),
        onChange: handleChange
      }, null, 8, ["modelValue", "options", "class"]);
    };
  }
});
var __unplugin_components_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-bc3ef38d"]]);
function usePermComposeData() {
  const resourceTree = ref([]);
  const actions = ref([]);
  const composedPermissions = ref([]);
  const resourceTreeRef = ref();
  const resourceFilterText = ref("");
  const applyToChildren = ref(false);
  const treeProps = {
    children: "children",
    label: "resourceNameCn"
  };
  const selectedResources = ref([]);
  const selectedActions = ref([]);
  const matrixSelections = ref(/* @__PURE__ */ new Set());
  const filterResourceNode = (value, data) => {
    if (!value) return true;
    return data.resourceNameCn.toLowerCase().includes(value.toLowerCase()) || data.resourceCode.toLowerCase().includes(value.toLowerCase());
  };
  watch(resourceFilterText, (val) => {
    resourceTreeRef.value?.filter(val);
  });
  const loadData = async () => {
    const resourcesRaw = localStorage.getItem("btc_mock_btc_resources");
    const actionsRaw = localStorage.getItem("btc_mock_btc_actions");
    if (resourcesRaw) {
      resourceTree.value = JSON.parse(resourcesRaw);
    } else {
      resourceTree.value = [
        {
          id: 1,
          resourceNameCn: "用户管理",
          resourceCode: "user",
          resourceType: "菜单",
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 11, resourceNameCn: "用户列表", resourceCode: "user.list", resourceType: "菜单", supportedActions: [1, 2, 3, 4] },
            { id: 12, resourceNameCn: "用户详情", resourceCode: "user.detail", resourceType: "菜单", supportedActions: [1] }
          ]
        },
        {
          id: 2,
          resourceNameCn: "角色管理",
          resourceCode: "role",
          resourceType: "菜单",
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 21, resourceNameCn: "角色列表", resourceCode: "role.list", resourceType: "菜单", supportedActions: [1, 2, 3, 4] },
            { id: 22, resourceNameCn: "角色分配", resourceCode: "role.assign", resourceType: "菜单", supportedActions: [1, 4] }
          ]
        },
        {
          id: 3,
          resourceNameCn: "部门管理",
          resourceCode: "department",
          resourceType: "菜单",
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 31, resourceNameCn: "部门列表", resourceCode: "dept.list", resourceType: "菜单", supportedActions: [1, 2, 3, 4] }
          ]
        },
        {
          id: 4,
          resourceNameCn: "系统设置",
          resourceCode: "system",
          resourceType: "菜单",
          supportedActions: [1, 2],
          children: [
            { id: 41, resourceNameCn: "系统配置", resourceCode: "system.config", resourceType: "菜单", supportedActions: [1, 2] }
          ]
        }
      ];
      localStorage.setItem("btc_mock_btc_resources", JSON.stringify(resourceTree.value));
    }
    if (actionsRaw) {
      actions.value = JSON.parse(actionsRaw);
    } else {
      actions.value = [
        { id: 1, actionNameCn: "查看", actionCode: "view", httpMethod: "GET" },
        { id: 2, actionNameCn: "编辑", actionCode: "edit", httpMethod: "PUT" },
        { id: 3, actionNameCn: "删除", actionCode: "delete", httpMethod: "DELETE" },
        { id: 4, actionNameCn: "新增", actionCode: "create", httpMethod: "POST" }
      ];
      localStorage.setItem("btc_mock_btc_actions", JSON.stringify(actions.value));
    }
  };
  const handleResourceCheck = (_data, _checked) => {
    const checkedKeys = resourceTreeRef.value?.getCheckedKeys() || [];
    selectedResources.value = checkedKeys;
  };
  return {
    resourceTree,
    actions,
    composedPermissions,
    resourceTreeRef,
    resourceFilterText,
    applyToChildren,
    treeProps,
    selectedResources,
    selectedActions,
    matrixSelections,
    filterResourceNode,
    loadData,
    handleResourceCheck
  };
}
function useActionFilter(actions, selectedResources, resourceTreeRef, resourceTree) {
  const message = useMessage();
  const filteredActions = computed(() => {
    if (selectedResources.value.length === 0) {
      return actions.value;
    }
    const flattenResources = (tree) => {
      const result = [];
      for (const node of tree) {
        result.push(node);
        if (node.children) {
          result.push(...flattenResources(node.children));
        }
      }
      return result;
    };
    const allResources = flattenResources(resourceTree.value);
    const filtered = actions.value.filter((action) => {
      return selectedResources.value.every((resourceId) => {
        const resource = allResources.find((r) => r.id === resourceId);
        return resource && resource.supportedActions && resource.supportedActions.includes(action.id);
      });
    });
    if (filtered.length === 0) {
      message.warning("当前选中的资源没有任何共同支持的操作");
    }
    return filtered;
  });
  const isActionSupported = (actionId) => {
    if (selectedResources.value.length === 0) return true;
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    if (checkedNodes.length === 0) return true;
    const supportedCount = checkedNodes.filter(
      (node) => !node.supportedActions || node.supportedActions.includes(actionId)
    ).length;
    return supportedCount < selectedResources.value.length;
  };
  const getActionSupportCount = (actionId) => {
    if (selectedResources.value.length === 0) return 0;
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    return checkedNodes.filter(
      (node) => !node.supportedActions || node.supportedActions.includes(actionId)
    ).length;
  };
  const isActionSupportedByResource = (resourceId, actionId) => {
    const findResource = (tree, id) => {
      for (const node of tree) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findResource(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const resource = findResource(resourceTree.value, resourceId);
    if (!resource || !resource.supportedActions) return true;
    return resource.supportedActions.includes(actionId);
  };
  return {
    filteredActions,
    isActionSupported,
    getActionSupportCount,
    isActionSupportedByResource
  };
}
function useMatrixMode(resourceTree, actions, selectedResources, matrixSelections, composedPermissions, resourceTreeRef) {
  const message = useMessage();
  const matrixData = computed(() => {
    if (selectedResources.value.length === 0) {
      return [];
    }
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    return checkedNodes;
  });
  const isPermissionChecked = (resourceId, actionId) => {
    return matrixSelections.value.has(`${resourceId}-${actionId}`);
  };
  const handleMatrixToggle = (resourceId, actionId, checked) => {
    const key = `${resourceId}-${actionId}`;
    if (checked) {
      matrixSelections.value.add(key);
      const resource = matrixData.value.find((r) => r.id === resourceId);
      const action = actions.value.find((a) => a.id === actionId);
      if (resource && action) {
        const existingKeys = new Set(composedPermissions.value.map((p) => p.key));
        if (!existingKeys.has(key)) {
          composedPermissions.value.push({
            key,
            permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
            permissionCode: `${resource.resourceCode}:${action.actionCode}`,
            resourceId: resource.id,
            resourceName: resource.resourceNameCn,
            actionId: action.id,
            actionName: action.actionNameCn,
            description: `${action.actionNameCn}${resource.resourceNameCn}的权限`
          });
          message.success(`已添加${action.actionNameCn}${resource.resourceNameCn}`);
        }
      }
    } else {
      matrixSelections.value.delete(key);
      const index2 = composedPermissions.value.findIndex((p) => p.key === key);
      if (index2 > -1) {
        const perm = composedPermissions.value[index2];
        composedPermissions.value.splice(index2, 1);
        message.info(`已移除${perm.permissionName}`);
      }
    }
  };
  return {
    matrixData,
    isPermissionChecked,
    handleMatrixToggle
  };
}
function useComposeMode(actions, selectedResources, selectedActions, resourceTreeRef, composedPermissions) {
  const message = useMessage();
  const composeCount = computed(() => {
    if (selectedResources.value.length === 0 || selectedActions.value.length === 0) {
      return 0;
    }
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    let count = 0;
    checkedNodes.forEach((resource) => {
      selectedActions.value.forEach((actionId) => {
        if (!resource.supportedActions || resource.supportedActions.includes(actionId)) {
          count++;
        }
      });
    });
    return count;
  });
  const canCompose = computed(() => {
    return composeCount.value > 0;
  });
  const handleCompose = async (composing) => {
    if (!canCompose.value) {
      message.warning("请至少选择一个资源和操作");
      return;
    }
    composing.value = true;
    try {
      const newPermissions = [];
      const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
      const existingKeys = new Set(composedPermissions.value.map((p) => p.key));
      checkedNodes.forEach((resource) => {
        selectedActions.value.forEach((actionId) => {
          const action = actions.value.find((a) => a.id === actionId);
          if (!action) return;
          if (resource.supportedActions && !resource.supportedActions.includes(actionId)) {
            return;
          }
          const key = `${resource.id}-${actionId}`;
          if (existingKeys.has(key)) return;
          newPermissions.push({
            key,
            permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
            permissionCode: `${resource.resourceCode}:${action.actionCode}`,
            resourceId: resource.id,
            resourceName: resource.resourceNameCn,
            actionId: action.id,
            actionName: action.actionNameCn,
            description: `${action.actionNameCn}${resource.resourceNameCn}的权限`
          });
        });
      });
      if (newPermissions.length === 0) {
        message.warning("没有可添加的权限");
        return;
      }
      composedPermissions.value.push(...newPermissions);
      message.success(`已添加 ${newPermissions.length} 个权限`);
      resourceTreeRef.value?.setCheckedKeys([]);
      selectedResources.value.length = 0;
      selectedActions.value.length = 0;
    } catch (_error) {
      message.error("生成失败");
    } finally {
      composing.value = false;
    }
  };
  return {
    composeCount,
    canCompose,
    handleCompose
  };
}
const _hoisted_1$3 = { class: "scope" };
const _hoisted_2$3 = { class: "head" };
const _hoisted_3$3 = { class: "search" };
const _hoisted_4$3 = { class: "data" };
const _hoisted_5$3 = { class: "item" };
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcResourceTree"
  },
  __name: "BtcResourceTree",
  props: {
    resourceTree: {},
    modelValue: {},
    treeProps: { default: () => ({
      children: "children",
      label: "resourceNameCn"
    }) },
    filterResourceNode: {}
  },
  emits: ["resourceCheck"],
  setup(__props, { expose: __expose }) {
    const props = __props;
    const treeRef = ref();
    watch(() => props.modelValue.resourceFilterText, (val) => {
      treeRef.value?.filter(val);
    });
    __expose({
      getCheckedNodes: () => treeRef.value?.getCheckedNodes(),
      getCheckedKeys: () => treeRef.value?.getCheckedKeys(),
      setCheckedKeys: (keys) => treeRef.value?.setCheckedKeys(keys),
      filter: (val) => treeRef.value?.filter(val)
    });
    return (_ctx, _cache) => {
      const _component_el_text = ElText;
      const _component_el_switch = ElSwitch;
      const _component_el_input = ElInput;
      const _component_el_icon = ElIcon;
      const _component_el_tag = ElTag;
      const _component_el_tree = ElTree;
      const _component_el_scrollbar = ElScrollbar;
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$3, [
          createVNode(_component_el_text, { class: "label" }, {
            default: withCtx(() => [..._cache[3] || (_cache[3] = [
              createTextVNode("资源列表", -1)
            ])]),
            _: 1
          }),
          createVNode(_component_el_switch, {
            modelValue: __props.modelValue.applyToChildren,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => __props.modelValue.applyToChildren = $event),
            "active-text": "应用到子节点",
            "inactive-text": "",
            size: "small"
          }, null, 8, ["modelValue"])
        ]),
        createBaseVNode("div", _hoisted_3$3, [
          createVNode(_component_el_input, {
            modelValue: __props.modelValue.resourceFilterText,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => __props.modelValue.resourceFilterText = $event),
            placeholder: "搜索资源",
            clearable: "",
            "prefix-icon": unref(search_default)
          }, null, 8, ["modelValue", "prefix-icon"])
        ]),
        createBaseVNode("div", _hoisted_4$3, [
          createVNode(_component_el_scrollbar, null, {
            default: withCtx(() => [
              createVNode(_component_el_tree, {
                ref_key: "treeRef",
                ref: treeRef,
                class: "tree",
                data: __props.resourceTree,
                props: __props.treeProps,
                "filter-node-method": __props.filterResourceNode,
                "show-checkbox": "",
                "check-strictly": !__props.modelValue.applyToChildren,
                "node-key": "id",
                "default-expand-all": "",
                "highlight-current": "",
                onCheckChange: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("resourceCheck", $event))
              }, {
                default: withCtx(({ data }) => [
                  createBaseVNode("div", _hoisted_5$3, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(folder_opened_default))
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_text, {
                      truncated: "",
                      class: "item-label"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(data.resourceNameCn), 1)
                      ]),
                      _: 2
                    }, 1024),
                    data.supportedActions ? (openBlock(), createBlock(_component_el_tag, {
                      key: 0,
                      size: "small",
                      type: "info",
                      class: "item-tag"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(data.supportedActions.length), 1)
                      ]),
                      _: 2
                    }, 1024)) : createCommentVNode("", true)
                  ])
                ]),
                _: 1
              }, 8, ["data", "props", "filter-node-method", "check-strictly"])
            ]),
            _: 1
          })
        ])
      ]);
    };
  }
});
var BtcResourceTree = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-6ddf99fc"]]);
const _hoisted_1$2 = { class: "data" };
const _hoisted_2$2 = { class: "action-code" };
const _hoisted_3$2 = {
  key: 1,
  class: "matrix-empty"
};
const _hoisted_4$2 = { class: "matrix-resource" };
const _hoisted_5$2 = { class: "matrix-action-header" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcActionTable"
  },
  __name: "BtcActionTable",
  props: {
    mode: {},
    filteredActions: {},
    matrixData: {},
    actions: {},
    selectedResources: {},
    isActionSupported: { type: Function },
    getActionSupportCount: { type: Function },
    isPermissionChecked: { type: Function },
    isActionSupportedByResource: { type: Function },
    getMethodType: { type: Function },
    handleMatrixToggle: { type: Function }
  },
  emits: ["actionSelectionChange"],
  setup(__props, { expose: __expose }) {
    const tableRef = ref();
    __expose({
      clearSelection: () => tableRef.value?.clearSelection(),
      toggleRowSelection: (row, checked) => tableRef.value?.toggleRowSelection(row, checked)
    });
    return (_ctx, _cache) => {
      const _component_el_table_column = ElTableColumn;
      const _component_el_icon = ElIcon;
      const _component_el_tag = ElTag;
      const _component_el_tooltip = ElTooltip;
      const _component_el_table = ElTable;
      const _component_el_empty = ElEmpty;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_scrollbar = ElScrollbar;
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createVNode(_component_el_scrollbar, null, {
          default: withCtx(() => [
            __props.mode === "compose" ? (openBlock(), createBlock(_component_el_table, {
              key: 0,
              ref_key: "tableRef",
              ref: tableRef,
              data: __props.filteredActions,
              border: "",
              stripe: "",
              onSelectionChange: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("actionSelectionChange", $event)),
              style: { "width": "100%" }
            }, {
              default: withCtx(() => [
                createVNode(_component_el_table_column, {
                  type: "selection",
                  width: "50",
                  selectable: (row) => __props.isActionSupported(row.id)
                }, null, 8, ["selectable"]),
                createVNode(_component_el_table_column, {
                  label: "图标",
                  width: "60",
                  align: "center"
                }, {
                  default: withCtx(({ row }) => [
                    row.actionCode === "view" ? (openBlock(), createBlock(_component_el_icon, {
                      key: 0,
                      size: 18,
                      color: "var(--el-color-success)"
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(view_default))
                      ]),
                      _: 1
                    })) : row.actionCode === "create" ? (openBlock(), createBlock(_component_el_icon, {
                      key: 1,
                      size: 18,
                      color: "var(--el-color-primary)"
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(plus_default))
                      ]),
                      _: 1
                    })) : row.actionCode === "edit" ? (openBlock(), createBlock(_component_el_icon, {
                      key: 2,
                      size: 18,
                      color: "var(--el-color-warning)"
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(edit_default))
                      ]),
                      _: 1
                    })) : row.actionCode === "delete" ? (openBlock(), createBlock(_component_el_icon, {
                      key: 3,
                      size: 18,
                      color: "var(--el-color-danger)"
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    })) : (openBlock(), createBlock(_component_el_icon, {
                      key: 4,
                      size: 18
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(operation_default))
                      ]),
                      _: 1
                    }))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_table_column, {
                  prop: "actionNameCn",
                  label: "名称",
                  width: "80"
                }),
                createVNode(_component_el_table_column, {
                  prop: "actionCode",
                  label: "编码",
                  "min-width": "100"
                }, {
                  default: withCtx(({ row }) => [
                    createBaseVNode("code", _hoisted_2$2, toDisplayString(row.actionCode), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_table_column, {
                  label: "方法",
                  width: "90",
                  align: "center"
                }, {
                  default: withCtx(({ row }) => [
                    createVNode(_component_el_tag, {
                      size: "small",
                      type: __props.getMethodType(row.httpMethod),
                      effect: "plain"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(row.httpMethod), 1)
                      ]),
                      _: 2
                    }, 1032, ["type"])
                  ]),
                  _: 1
                }),
                __props.selectedResources.length > 1 ? (openBlock(), createBlock(_component_el_table_column, {
                  key: 0,
                  label: "支持度",
                  width: "90",
                  align: "center"
                }, {
                  default: withCtx(({ row }) => [
                    createVNode(_component_el_tooltip, {
                      content: `${__props.getActionSupportCount(row.id)} / ${__props.selectedResources.length} 个资源支持`,
                      placement: "top"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_tag, {
                          size: "small",
                          type: __props.getActionSupportCount(row.id) === __props.selectedResources.length ? "success" : "warning",
                          effect: "plain"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.getActionSupportCount(row.id)) + "/" + toDisplayString(__props.selectedResources.length), 1)
                          ]),
                          _: 2
                        }, 1032, ["type"])
                      ]),
                      _: 2
                    }, 1032, ["content"])
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ]),
              _: 1
            }, 8, ["data"])) : createCommentVNode("", true),
            __props.matrixData.length === 0 && __props.mode === "matrix" ? (openBlock(), createElementBlock("div", _hoisted_3$2, [
              createVNode(_component_el_empty, { description: "请先选择资源" }, {
                image: withCtx(() => [
                  createVNode(_component_el_icon, {
                    size: 60,
                    color: "var(--el-text-color-placeholder)"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(folder_opened_default))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ])) : __props.mode === "matrix" ? (openBlock(), createBlock(_component_el_table, {
              key: 2,
              data: __props.matrixData,
              border: "",
              stripe: "",
              "highlight-current-row": "",
              style: { "width": "100%" }
            }, {
              default: withCtx(() => [
                createVNode(_component_el_table_column, {
                  prop: "resourceNameCn",
                  label: "资源",
                  width: "220",
                  fixed: "",
                  align: "center",
                  "header-align": "center"
                }, {
                  default: withCtx(({ row }) => [
                    createBaseVNode("div", _hoisted_4$2, [
                      createVNode(_component_el_icon, { size: 16 }, {
                        default: withCtx(() => [
                          createVNode(unref(folder_opened_default))
                        ]),
                        _: 1
                      }),
                      createBaseVNode("span", null, toDisplayString(row.resourceNameCn), 1),
                      row.resourceCode ? (openBlock(), createBlock(_component_el_tag, {
                        key: 0,
                        size: "small",
                        type: "info"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(row.resourceCode), 1)
                        ]),
                        _: 2
                      }, 1024)) : createCommentVNode("", true)
                    ])
                  ]),
                  _: 1
                }),
                (openBlock(true), createElementBlock(Fragment, null, renderList(__props.actions, (action) => {
                  return openBlock(), createBlock(_component_el_table_column, {
                    key: action.id,
                    prop: `action_${action.id}`,
                    "min-width": "100",
                    align: "center"
                  }, {
                    header: withCtx(() => [
                      createBaseVNode("div", _hoisted_5$2, [
                        action.actionCode === "view" ? (openBlock(), createBlock(_component_el_icon, {
                          key: 0,
                          size: 16,
                          color: "var(--el-color-success)"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(view_default))
                          ]),
                          _: 1
                        })) : action.actionCode === "create" ? (openBlock(), createBlock(_component_el_icon, {
                          key: 1,
                          size: 16,
                          color: "var(--el-color-primary)"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(plus_default))
                          ]),
                          _: 1
                        })) : action.actionCode === "edit" ? (openBlock(), createBlock(_component_el_icon, {
                          key: 2,
                          size: 16,
                          color: "var(--el-color-warning)"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(edit_default))
                          ]),
                          _: 1
                        })) : action.actionCode === "delete" ? (openBlock(), createBlock(_component_el_icon, {
                          key: 3,
                          size: 16,
                          color: "var(--el-color-danger)"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(delete_default))
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createBaseVNode("span", null, toDisplayString(action.actionNameCn), 1)
                      ])
                    ]),
                    default: withCtx(({ row }) => [
                      createVNode(_component_el_checkbox, {
                        "model-value": __props.isPermissionChecked(row.id, action.id),
                        onChange: ($event) => __props.handleMatrixToggle(row.id, action.id, $event),
                        disabled: !__props.isActionSupportedByResource(row.id, action.id)
                      }, null, 8, ["model-value", "onChange", "disabled"])
                    ]),
                    _: 2
                  }, 1032, ["prop"]);
                }), 128))
              ]),
              _: 1
            }, 8, ["data"])) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ]);
    };
  }
});
var BtcActionTable = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-29b03fbb"]]);
const _hoisted_1$1 = { class: "permission-list" };
const _hoisted_2$1 = { class: "permission-item__index" };
const _hoisted_3$1 = { class: "permission-item__content" };
const _hoisted_4$1 = { class: "permission-item__name" };
const _hoisted_5$1 = { class: "permission-item__code" };
const _hoisted_6$1 = ["onClick"];
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcPermissionList"
  },
  __name: "BtcPermissionList",
  props: {
    composedPermissions: {}
  },
  emits: ["removePermission"],
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_empty = ElEmpty;
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createVNode(TransitionGroup, { name: "list" }, {
          default: withCtx(() => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.composedPermissions, (perm, index2) => {
              return openBlock(), createElementBlock("div", {
                key: perm.key,
                class: "permission-item"
              }, [
                createBaseVNode("div", _hoisted_2$1, toDisplayString(index2 + 1), 1),
                createBaseVNode("div", _hoisted_3$1, [
                  createBaseVNode("div", _hoisted_4$1, toDisplayString(perm.permissionName), 1),
                  createBaseVNode("div", _hoisted_5$1, toDisplayString(perm.permissionCode), 1)
                ]),
                createBaseVNode("div", {
                  class: "icon",
                  onClick: ($event) => _ctx.$emit("removePermission", index2)
                }, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(close_default))
                    ]),
                    _: 1
                  })
                ], 8, _hoisted_6$1)
              ]);
            }), 128))
          ]),
          _: 1
        }),
        __props.composedPermissions.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
          key: 0,
          description: "暂无权限",
          "image-size": 80
        }, {
          image: withCtx(() => [
            createVNode(_component_el_icon, {
              size: 60,
              color: "var(--el-text-color-placeholder)"
            }, {
              default: withCtx(() => [
                createVNode(unref(document_default))
              ]),
              _: 1
            })
          ]),
          _: 1
        })) : createCommentVNode("", true)
      ]);
    };
  }
});
var BtcPermissionList = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a5768b7a"]]);
const _hoisted_1 = { class: "perm-compose perm-compose-page" };
const _hoisted_2 = { class: "perm-compose-header" };
const _hoisted_3 = { class: "header-left" };
const _hoisted_4 = { class: "header-right" };
const _hoisted_5 = { class: "perm-compose-content" };
const _hoisted_6 = { class: "perm-compose-wrap" };
const _hoisted_7 = { class: "perm-compose-left" };
const _hoisted_8 = { class: "perm-compose-middle" };
const _hoisted_9 = { class: "scope" };
const _hoisted_10 = { class: "head" };
const _hoisted_11 = {
  key: 0,
  class: "head-actions"
};
const _hoisted_12 = { class: "perm-compose-right" };
const _hoisted_13 = { class: "scope" };
const _hoisted_14 = { class: "head" };
const _hoisted_15 = { class: "head-stat" };
const _hoisted_16 = {
  key: 0,
  class: "compose-action"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const message = useMessage();
    const mode = ref("matrix");
    const modeOptions = [
      { label: "矩阵模式", value: "matrix" },
      { label: "组合模式", value: "compose" }
    ];
    const permissionService = service.admin?.iam?.permission;
    const {
      resourceTree,
      actions,
      composedPermissions,
      resourceTreeRef,
      resourceFilterText,
      applyToChildren,
      treeProps,
      selectedResources,
      selectedActions,
      matrixSelections,
      filterResourceNode,
      loadData,
      handleResourceCheck
    } = usePermComposeData();
    const {
      filteredActions,
      isActionSupported,
      getActionSupportCount,
      isActionSupportedByResource
    } = useActionFilter(actions, selectedResources, resourceTreeRef, resourceTree);
    const {
      matrixData,
      isPermissionChecked,
      handleMatrixToggle
    } = useMatrixMode(resourceTree, actions, selectedResources, matrixSelections, composedPermissions, resourceTreeRef);
    const {
      composeCount,
      canCompose,
      handleCompose: handleComposeBase
    } = useComposeMode(actions, selectedResources, selectedActions, resourceTreeRef, composedPermissions);
    const composing = ref(false);
    const saving = ref(false);
    const handleModeChange = (val) => {
      message.info(`已切换到${val === "matrix" ? "矩阵" : "组合"}模式`);
      if (val === "matrix") {
        selectedResources.value = [];
        selectedActions.value = [];
      } else {
        matrixSelections.value.clear();
      }
    };
    const actionTableRef = ref();
    const handleActionSelectionChange = (selection) => {
      selectedActions.value = selection.map((a) => a.id);
    };
    const handleSelectAllActions = () => {
      if (selectedActions.value.length === filteredActions.value.length) {
        selectedActions.value = [];
        actionTableRef.value?.clearSelection();
        message.info("已取消全选");
      } else {
        selectedActions.value = filteredActions.value.map((a) => a.id);
        filteredActions.value.forEach((row) => {
          actionTableRef.value?.toggleRowSelection(row, true);
        });
        message.success("已选择全部");
      }
    };
    const handleActionTemplate = (command) => {
      actionTableRef.value?.clearSelection();
      let targetActions = [];
      switch (command) {
        case "readonly":
          targetActions = actions.value.filter((a) => a.actionCode === "view");
          message.success("已选择只读权限");
          break;
        case "editor":
          targetActions = actions.value.filter((a) => ["view", "edit"].includes(a.actionCode));
          message.success("已选择编辑权限");
          break;
        case "full":
          targetActions = actions.value;
          message.success("已选择完整CRUD");
          break;
      }
      selectedActions.value = targetActions.map((a) => a.id);
      targetActions.forEach((action) => {
        actionTableRef.value?.toggleRowSelection(action, true);
      });
    };
    const getMethodType = (method) => {
      const typeMap = {
        "GET": "success",
        "POST": "primary",
        "PUT": "warning",
        "DELETE": "danger"
      };
      return typeMap[method] || "info";
    };
    const handleCompose = () => handleComposeBase(composing);
    const handleRemovePermission = (index2) => {
      const perm = composedPermissions.value[index2];
      composedPermissions.value.splice(index2, 1);
      if (mode.value === "matrix") {
        matrixSelections.value.delete(perm.key);
      }
      message.success("已移除");
    };
    const handleClearAll = () => {
      composedPermissions.value = [];
      matrixSelections.value.clear();
      message.success("已清空全部");
    };
    const handleSave = async () => {
      saving.value = true;
      try {
        for (const perm of composedPermissions.value) {
          await permissionService.add(perm);
        }
        message.success(`已保存 ${composedPermissions.value.length} 个权限`);
        composedPermissions.value = [];
        matrixSelections.value.clear();
      } catch (_error) {
        message.error("保存失败");
      } finally {
        saving.value = false;
      }
    };
    onMounted(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      const _component_BtcSelectButton = __unplugin_components_0;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_text = ElText;
      const _component_el_divider = ElDivider;
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      const _component_el_statistic = ElStatistic;
      const _component_el_scrollbar = ElScrollbar;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createVNode(_component_BtcSelectButton, {
              modelValue: mode.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => mode.value = $event),
              options: modeOptions,
              onChange: handleModeChange
            }, null, 8, ["modelValue"])
          ]),
          createBaseVNode("div", _hoisted_4, [
            createVNode(_component_el_button, {
              onClick: handleClearAll,
              disabled: unref(composedPermissions).length === 0
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(delete_default))
                  ]),
                  _: 1
                }),
                _cache[1] || (_cache[1] = createTextVNode(" 清空全部 ", -1))
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: handleSave,
              loading: saving.value,
              disabled: unref(composedPermissions).length === 0
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(select_default))
                  ]),
                  _: 1
                }),
                _cache[2] || (_cache[2] = createTextVNode(" 保存权限 ", -1))
              ]),
              _: 1
            }, 8, ["loading", "disabled"])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              createVNode(BtcResourceTree, {
                "resource-tree": unref(resourceTree),
                "model-value": { resourceFilterText: unref(resourceFilterText), applyToChildren: unref(applyToChildren) },
                "tree-props": unref(treeProps),
                "filter-resource-node": unref(filterResourceNode),
                onResourceCheck: unref(handleResourceCheck),
                ref_key: "resourceTreeRef",
                ref: resourceTreeRef
              }, null, 8, ["resource-tree", "model-value", "tree-props", "filter-resource-node", "onResourceCheck"])
            ]),
            createBaseVNode("div", _hoisted_8, [
              createBaseVNode("div", _hoisted_9, [
                createBaseVNode("div", _hoisted_10, [
                  createVNode(_component_el_text, { class: "label" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(mode.value === "matrix" ? "权限矩阵" : "操作列表"), 1)
                    ]),
                    _: 1
                  }),
                  mode.value === "compose" ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    createVNode(_component_el_button, {
                      size: "small",
                      text: "",
                      onClick: handleSelectAllActions
                    }, {
                      default: withCtx(() => [..._cache[3] || (_cache[3] = [
                        createTextVNode("全选", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_divider, { direction: "vertical" }),
                    createVNode(_component_el_dropdown, {
                      trigger: "click",
                      onCommand: handleActionTemplate
                    }, {
                      dropdown: withCtx(() => [
                        createVNode(_component_el_dropdown_menu, null, {
                          default: withCtx(() => [
                            createVNode(_component_el_dropdown_item, { command: "readonly" }, {
                              default: withCtx(() => [..._cache[5] || (_cache[5] = [
                                createTextVNode("只读权限", -1)
                              ])]),
                              _: 1
                            }),
                            createVNode(_component_el_dropdown_item, { command: "editor" }, {
                              default: withCtx(() => [..._cache[6] || (_cache[6] = [
                                createTextVNode("编辑权限", -1)
                              ])]),
                              _: 1
                            }),
                            createVNode(_component_el_dropdown_item, { command: "full" }, {
                              default: withCtx(() => [..._cache[7] || (_cache[7] = [
                                createTextVNode("完整CRUD", -1)
                              ])]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          size: "small",
                          text: ""
                        }, {
                          default: withCtx(() => [
                            _cache[4] || (_cache[4] = createTextVNode(" 快速选择", -1)),
                            createVNode(_component_el_icon, { class: "el-icon--right" }, {
                              default: withCtx(() => [
                                createVNode(unref(arrow_down_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ])) : createCommentVNode("", true)
                ]),
                createVNode(BtcActionTable, {
                  mode: mode.value,
                  "filtered-actions": unref(filteredActions),
                  "matrix-data": unref(matrixData),
                  actions: unref(actions),
                  "selected-resources": unref(selectedResources),
                  "is-action-supported": unref(isActionSupported),
                  "get-action-support-count": unref(getActionSupportCount),
                  "is-permission-checked": unref(isPermissionChecked),
                  "is-action-supported-by-resource": unref(isActionSupportedByResource),
                  "get-method-type": getMethodType,
                  "handle-matrix-toggle": unref(handleMatrixToggle),
                  onActionSelectionChange: handleActionSelectionChange,
                  ref_key: "actionTableRef",
                  ref: actionTableRef
                }, null, 8, ["mode", "filtered-actions", "matrix-data", "actions", "selected-resources", "is-action-supported", "get-action-support-count", "is-permission-checked", "is-action-supported-by-resource", "handle-matrix-toggle"])
              ])
            ]),
            createBaseVNode("div", _hoisted_12, [
              createBaseVNode("div", _hoisted_13, [
                createBaseVNode("div", _hoisted_14, [
                  createVNode(_component_el_text, { class: "label" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(mode.value === "matrix" ? "已选权限" : "权限预览"), 1)
                    ]),
                    _: 1
                  }),
                  createBaseVNode("div", _hoisted_15, [
                    createVNode(_component_el_statistic, {
                      value: unref(composedPermissions).length,
                      suffix: "个",
                      "value-style": { fontSize: "16px", fontWeight: 600, color: "var(--el-color-primary)" }
                    }, null, 8, ["value"])
                  ])
                ]),
                mode.value === "compose" ? (openBlock(), createElementBlock("div", _hoisted_16, [
                  createVNode(_component_el_button, {
                    type: "primary",
                    onClick: handleCompose,
                    disabled: !unref(canCompose),
                    loading: composing.value,
                    style: { "width": "100%" },
                    size: "large"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(connection_default))
                        ]),
                        _: 1
                      }),
                      createTextVNode(" 生成权限 " + toDisplayString(unref(composeCount)) + " 个 ", 1)
                    ]),
                    _: 1
                  }, 8, ["disabled", "loading"])
                ])) : createCommentVNode("", true),
                createBaseVNode("div", {
                  class: "data",
                  style: normalizeStyle({ height: mode.value === "compose" ? "calc(100% - 110px)" : "calc(100% - 40px)" })
                }, [
                  createVNode(_component_el_scrollbar, null, {
                    default: withCtx(() => [
                      createVNode(BtcPermissionList, {
                        "composed-permissions": unref(composedPermissions),
                        onRemovePermission: handleRemovePermission
                      }, null, 8, ["composed-permissions"])
                    ]),
                    _: 1
                  })
                ], 4)
              ])
            ])
          ])
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c9345589"]]);
export {
  index as default
};
