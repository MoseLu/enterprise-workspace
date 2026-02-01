import { useI18n } from "@btc/shared-core";
import { BtcConfirm, BtcMessage, BtcMultiUnbindBtn, BtcSvg, BtcTableGroup, BtcTransferPanel } from "@btc/shared-components";
import { service } from "@services/eps";
import { s as services } from "./config-BhoH2ysO.js";
import { services as services$1 } from "@modules/access/views/roles/config";
import { a as defineComponent, r as ref, G as watch, b as computed, e as createElementBlock, l as createVNode, w as withCtx, m as unref, H as ElDrawer, I as nextTick, o as openBlock, D as ElButton, h as createBaseVNode, t as toDisplayString, v as createTextVNode, J as ElSelect, F as Fragment, q as renderList, x as createBlock, K as ElOption, L as createCommentVNode, i as _export_sfc } from "./index-CeQEKVXA.js";
import "./eps-B-NJyMre.js";
import "./virtual-eps-empty-DC-cChfU.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "user-role-assign-page" };
const _hoisted_2 = { class: "btc-crud-btn__text" };
const _hoisted_3 = { class: "user-role-assign-drawer" };
const _hoisted_4 = { class: "drawer-section user-section" };
const _hoisted_5 = { class: "section-title" };
const _hoisted_6 = {
  key: 0,
  style: { "color": "var(--el-text-color-secondary)", "margin-left": "8px" }
};
const _hoisted_7 = { class: "drawer-section role-section" };
const _hoisted_8 = { class: "section-title" };
const _hoisted_9 = { class: "drawer-footer" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const tableGroupRef = ref();
    const roleTransferRef = ref(null);
    const userSelectRef = ref(null);
    const drawerVisible = ref(false);
    const submitting = ref(false);
    const selectedDomain = ref(null);
    const selectedUserId = ref([]);
    const selectedRoleKeys = ref([]);
    const userOptions = ref([]);
    const userSearchLoading = ref(false);
    watch(() => selectedDomain.value, async () => {
      if (selectedUserId.value.length > 0 && drawerVisible.value) {
        roleTransferRef.value?.refresh?.();
      }
    });
    const domainService = {
      list: (params) => {
        const finalParams = params || {};
        return service.admin?.iam?.domain?.list(finalParams);
      }
    };
    const userRoleService = service.admin?.iam?.userRole;
    const wrappedUserRoleService = {
      ...userRoleService,
      page: async (params) => {
        const finalParams = { ...params };
        if (finalParams.keyword !== void 0 && finalParams.keyword !== null) {
          const keyword = finalParams.keyword;
          if (typeof keyword === "object" && !Array.isArray(keyword) && keyword.ids) {
            const ids = Array.isArray(keyword.ids) ? keyword.ids : [keyword.ids];
            if (ids.length > 0 && ids[0] !== void 0 && ids[0] !== null && ids[0] !== "") {
              if (typeof finalParams.keyword !== "object" || Array.isArray(finalParams.keyword)) {
                finalParams.keyword = {};
              }
              finalParams.keyword.domainId = ids[0];
              if (finalParams.keyword.username === void 0) {
                finalParams.keyword.username = "";
              }
              if (finalParams.keyword.roleId === void 0) {
                finalParams.keyword.roleId = "";
              }
            }
            delete finalParams.keyword.ids;
          } else if (typeof keyword === "number" || typeof keyword === "string" && !isNaN(Number(keyword)) && keyword !== "") {
            finalParams.keyword = {
              username: "",
              roleId: "",
              domainId: typeof keyword === "number" ? keyword : keyword
            };
          } else if (typeof keyword === "object" && !Array.isArray(keyword)) {
            if (finalParams.keyword.domainId === void 0) {
              finalParams.keyword.domainId = "";
            }
            if (finalParams.keyword.username === void 0) {
              finalParams.keyword.username = "";
            }
            if (finalParams.keyword.roleId === void 0) {
              finalParams.keyword.roleId = "";
            }
          }
        } else {
          finalParams.keyword = {
            username: "",
            roleId: "",
            domainId: ""
          };
        }
        return userRoleService?.page?.(finalParams);
      }
    };
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
    };
    const roleColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "name", label: t("org.user_role_assign.columns.username"), minWidth: 160, showOverflowTooltip: true },
      { prop: "realName", label: t("org.user_role_assign.user.realName"), minWidth: 120, showOverflowTooltip: true },
      { prop: "roleName", label: t("org.user_role_assign.columns.roleName"), minWidth: 180, showOverflowTooltip: true },
      {
        type: "op",
        label: t("crud.table.operation"),
        minWidth: 126,
        // 单个按钮的最小宽度（116+10），保证工具栏宽度
        width: 126,
        // 单个按钮的宽度（116+10）
        align: "center",
        fixed: "right",
        buttons: [
          {
            label: t("org.user_role_assign.actions.unbind"),
            type: "danger",
            icon: "unbind",
            onClick: ({ scope }) => handleUnbind(scope.row)
          }
        ]
      }
    ]);
    const userService = services.sysuser;
    services$1.sysrole;
    const roleTransferColumns = computed(() => [
      { prop: "roleName", label: t("org.user_role_assign.columns.roleName"), minWidth: 160 },
      { prop: "description", label: t("org.user_role_assign.columns.description"), minWidth: 220 }
    ]);
    const handleRoleBeforeRefresh = (params) => {
      if (params.keyword && typeof params.keyword === "object" && !Array.isArray(params.keyword)) {
        const keyword = params.keyword;
        if (keyword.ids !== void 0) {
          const idsValue = keyword.ids;
          if (typeof idsValue === "string" && idsValue !== "") {
            keyword.roleName = idsValue;
            delete keyword.ids;
          } else if (Array.isArray(idsValue) && idsValue.length > 0) {
            const firstElement = idsValue[0];
            if (typeof firstElement === "string") {
              keyword.roleName = firstElement;
              delete keyword.ids;
            }
          }
        }
      }
      if (selectedUserId.value.length > 0) {
        if (!params.keyword || typeof params.keyword !== "object" || Array.isArray(params.keyword)) {
          params.keyword = {};
        }
        params.keyword.userId = selectedUserId.value[0];
        params.keyword.domainId = selectedDomain.value?.id || "";
      }
      return params;
    };
    const roleOptions = {
      search: {
        keyWordLikeFields: ["roleName"]
      },
      onBeforeRefresh: handleRoleBeforeRefresh
    };
    const roleTransferService = computed(() => ({
      page: async (params) => {
        if (!selectedUserId.value || selectedUserId.value.length === 0) {
          return { list: [], total: 0 };
        }
        if (!userRoleService?.data) {
          return { list: [], total: 0 };
        }
        const finalParams = { ...params };
        if (!finalParams.keyword || typeof finalParams.keyword !== "object" || Array.isArray(finalParams.keyword)) {
          finalParams.keyword = {
            username: "",
            roleId: "",
            domainId: selectedDomain.value?.id || "",
            userId: selectedUserId.value[0]
          };
        } else {
          if (finalParams.keyword.userId === void 0) {
            finalParams.keyword.userId = selectedUserId.value[0];
          }
          if (finalParams.keyword.domainId === void 0) {
            finalParams.keyword.domainId = selectedDomain.value?.id || "";
          }
          if (finalParams.keyword.username === void 0) {
            finalParams.keyword.username = "";
          }
          if (finalParams.keyword.roleId === void 0) {
            finalParams.keyword.roleId = "";
          }
        }
        const response = await userRoleService.data(finalParams);
        if (Array.isArray(response)) {
          return { list: response, total: response.length };
        } else if (response && typeof response === "object" && "list" in response) {
          return response;
        } else {
          return { list: [], total: 0 };
        }
      }
    }));
    const searchUsers = async (query) => {
      if (!query) {
        userOptions.value = [];
        return;
      }
      userSearchLoading.value = true;
      try {
        const response = await userService.data?.({
          page: 1,
          size: 20,
          keyword: {
            username: query
          }
        });
        userOptions.value = Array.isArray(response) ? response : response?.list || [];
      } catch (error) {
        console.error("[UserRoleAssign] search users error", error);
        userOptions.value = [];
      } finally {
        userSearchLoading.value = false;
      }
    };
    const handleUserChange = (value) => {
      if (value.length > 1) {
        selectedUserId.value = [value[value.length - 1]];
      } else {
        selectedUserId.value = value;
      }
      if (selectedUserId.value.length > 0) {
        nextTick(() => {
          if (userSelectRef.value) {
            const selectInput = userSelectRef.value.$el?.querySelector(".el-select__input");
            if (selectInput) {
              selectInput.value = "";
              selectInput.dispatchEvent(new Event("input", { bubbles: true }));
              if (userSelectRef.value.setQuery) {
                userSelectRef.value.setQuery("");
              } else if (userSelectRef.value.query) {
                userSelectRef.value.query = "";
              }
            }
          }
          userOptions.value = [];
        });
      }
      selectedRoleKeys.value = [];
      if (roleTransferRef.value) {
        roleTransferRef.value.clearSelection?.();
      }
      if (selectedUserId.value.length > 0 && drawerVisible.value) {
        roleTransferRef.value?.refresh?.();
      }
    };
    const handleRemoveUser = () => {
      selectedUserId.value = [];
      selectedRoleKeys.value = [];
      userOptions.value = [];
      if (roleTransferRef.value) {
        roleTransferRef.value.clearSelection?.();
        if (drawerVisible.value) {
          roleTransferRef.value.refresh?.();
        }
      }
    };
    const handleSelectVisibleChange = (visible) => {
      if (visible && selectedUserId.value.length > 0) {
        nextTick(() => {
          userSelectRef.value?.blur?.();
        });
      }
    };
    function openDrawer() {
      selectedUserId.value = [];
      selectedRoleKeys.value = [];
      userOptions.value = [];
      drawerVisible.value = true;
    }
    function closeDrawer() {
      drawerVisible.value = false;
      setTimeout(() => {
        selectedUserId.value = [];
        selectedRoleKeys.value = [];
        userOptions.value = [];
      }, 300);
    }
    async function handleSubmit() {
      if (!selectedUserId.value || selectedUserId.value.length === 0) {
        BtcMessage.warning(t("org.user_role_assign.messages.selectUsers"));
        return;
      }
      if (!selectedRoleKeys.value || selectedRoleKeys.value.length === 0) {
        BtcMessage.warning(t("org.user_role_assign.messages.selectRoles"));
        return;
      }
      const currentDomain = selectedDomain.value;
      const currentDomainId = currentDomain?.id;
      submitting.value = true;
      try {
        await userRoleService?.batchBind?.({
          userId: selectedUserId.value,
          roleId: selectedRoleKeys.value
        });
        BtcMessage.success(t("org.user_role_assign.messages.bindSuccess"));
        closeDrawer();
        if (tableGroupRef.value?.crudRef?.crud?.loadData) {
          await tableGroupRef.value.crudRef.crud.loadData();
        } else {
          await tableGroupRef.value?.refresh?.();
          if (currentDomain && currentDomainId && tableGroupRef.value?.viewGroupRef) {
            await nextTick();
            await nextTick();
            setTimeout(() => {
              const viewGroup = tableGroupRef.value?.viewGroupRef;
              if (viewGroup?.masterListRef) {
                const leftList = viewGroup.masterListRef.list || [];
                const domainItem = leftList.find((item) => item.id === currentDomainId);
                if (domainItem) {
                  viewGroup.select?.(domainItem, currentDomainId);
                } else {
                  viewGroup.select?.(currentDomain, currentDomainId);
                }
              }
            }, 200);
          }
        }
      } catch (error) {
        console.error("[UserRoleAssign] submit error", error);
        const errorMessage = error?.message || error?.response?.data?.message || t("common.message.error");
        BtcMessage.error(errorMessage);
      } finally {
        submitting.value = false;
      }
    }
    async function handleUnbind(row) {
      const currentDomain = selectedDomain.value;
      const currentDomainId = currentDomain?.id;
      try {
        await BtcConfirm(
          t("org.user_role_assign.messages.unbindConfirm", {
            username: row.name || row.username,
            roleName: row.roleName
          }),
          t("common.button.confirm"),
          { type: "warning" }
        );
        await userRoleService?.unbind?.({
          userId: row.userId,
          roleId: row.roleId
        });
        BtcMessage.success(t("org.user_role_assign.messages.unbindSuccess"));
        if (tableGroupRef.value?.crudRef?.crud?.loadData) {
          await tableGroupRef.value.crudRef.crud.loadData();
        } else {
          await tableGroupRef.value?.refresh?.();
          if (currentDomain && currentDomainId && tableGroupRef.value?.viewGroupRef) {
            await nextTick();
            await nextTick();
            setTimeout(() => {
              const viewGroup = tableGroupRef.value?.viewGroupRef;
              if (viewGroup?.masterListRef) {
                const leftList = viewGroup.masterListRef.list || [];
                const domainItem = leftList.find((item) => item.id === currentDomainId);
                if (domainItem) {
                  viewGroup.select?.(domainItem, currentDomainId);
                } else {
                  viewGroup.select?.(currentDomain, currentDomainId);
                }
              }
            }, 200);
          }
        }
      } catch (error) {
        if (error?.message === "cancel" || error === "cancel") {
          return;
        }
        console.error("[UserRoleAssign] unbind error", error);
        const errorMessage = error?.message || error?.response?.data?.message || t("common.message.error");
        BtcMessage.error(errorMessage);
      }
    }
    async function handleMultiUnbind(rows) {
      if (!rows || rows.length === 0) {
        BtcMessage.warning(t("org.user_role_assign.messages.selectRows"));
        return;
      }
      const currentDomain = selectedDomain.value;
      const currentDomainId = currentDomain?.id;
      try {
        await BtcConfirm(
          t("org.user_role_assign.messages.unbindBatchConfirm", { count: rows.length }),
          t("common.button.confirm"),
          { type: "warning" }
        );
        const unbindList = rows.map((row) => ({
          userId: row.userId,
          roleId: row.roleId
        }));
        await userRoleService?.batchUnbind?.(unbindList);
        BtcMessage.success(t("org.user_role_assign.messages.unbindSuccess"));
        if (tableGroupRef.value?.crudRef?.crud?.loadData) {
          await tableGroupRef.value.crudRef.crud.loadData();
        } else {
          await tableGroupRef.value?.refresh?.();
          if (currentDomain && currentDomainId && tableGroupRef.value?.viewGroupRef) {
            await nextTick();
            await nextTick();
            setTimeout(() => {
              const viewGroup = tableGroupRef.value?.viewGroupRef;
              if (viewGroup?.masterListRef) {
                const leftList = viewGroup.masterListRef.list || [];
                const domainItem = leftList.find((item) => item.id === currentDomainId);
                if (domainItem) {
                  viewGroup.select?.(domainItem, currentDomainId);
                } else {
                  viewGroup.select?.(currentDomain, currentDomainId);
                }
              }
            }, 200);
          }
        }
      } catch (error) {
        if (error?.message === "cancel" || error === "cancel") {
          return;
        }
        console.error("[UserRoleAssign] multi unbind error", error);
        const errorMessage = error?.message || error?.response?.data?.message || t("common.message.error");
        BtcMessage.error(errorMessage);
      }
    }
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_drawer = ElDrawer;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": wrappedUserRoleService,
          "table-columns": roleColumns.value,
          "form-items": [],
          "left-title": "业务域",
          "right-title": "角色绑定列表",
          "search-placeholder": "搜索用户或角色...",
          "show-unassigned": true,
          "unassigned-label": "未分配",
          "enable-key-search": true,
          op: void 0,
          "show-add-btn": false,
          "show-multi-delete-btn": false,
          "left-size": "small",
          onSelect: onDomainSelect
        }, {
          "add-btn": withCtx(() => [
            createVNode(_component_el_button, {
              type: "primary",
              class: "btc-crud-btn",
              onClick: openDrawer
            }, {
              default: withCtx(() => [
                createVNode(unref(BtcSvg), {
                  class: "btc-crud-btn__icon",
                  name: "authorize"
                }),
                createBaseVNode("span", _hoisted_2, toDisplayString(unref(t)("common.button.authorize")), 1)
              ]),
              _: 1
            })
          ]),
          "multi-delete-btn": withCtx(() => [
            createVNode(unref(BtcMultiUnbindBtn), { onClick: handleMultiUnbind })
          ]),
          _: 1
        }, 8, ["table-columns"]),
        createVNode(_component_el_drawer, {
          modelValue: drawerVisible.value,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => drawerVisible.value = $event),
          title: unref(t)("org.user_role_assign.drawer.title"),
          size: "800px",
          "close-on-click-modal": false,
          modal: false,
          "append-to-body": "",
          "lock-scroll": false,
          class: "user-role-assign-drawer-wrapper"
        }, {
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_3, [
              createBaseVNode("div", _hoisted_4, [
                createBaseVNode("div", _hoisted_5, toDisplayString(unref(t)("org.user_role_assign.drawer.subjectSectionTitle")), 1),
                createVNode(_component_el_select, {
                  ref_key: "userSelectRef",
                  ref: userSelectRef,
                  modelValue: selectedUserId.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedUserId.value = $event),
                  filterable: "",
                  remote: "",
                  "remote-method": searchUsers,
                  loading: userSearchLoading.value,
                  placeholder: unref(t)("org.user_role_assign.drawer.searchUser"),
                  clearable: "",
                  multiple: "",
                  "collapse-tags": "",
                  "collapse-tags-tooltip": "",
                  style: { "width": "100%" },
                  onChange: handleUserChange,
                  onClear: handleRemoveUser,
                  onVisibleChange: handleSelectVisibleChange
                }, {
                  default: withCtx(() => [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(userOptions.value, (user) => {
                      return openBlock(), createBlock(_component_el_option, {
                        key: user.id,
                        label: user.username,
                        value: user.id
                      }, {
                        default: withCtx(() => [
                          createBaseVNode("span", null, toDisplayString(user.username), 1),
                          user.realName ? (openBlock(), createElementBlock("span", _hoisted_6, " (" + toDisplayString(user.realName) + ") ", 1)) : createCommentVNode("", true)
                        ]),
                        _: 2
                      }, 1032, ["label", "value"]);
                    }), 128))
                  ]),
                  _: 1
                }, 8, ["modelValue", "loading", "placeholder"])
              ]),
              createBaseVNode("div", _hoisted_7, [
                createBaseVNode("div", _hoisted_8, toDisplayString(unref(t)("org.user_role_assign.drawer.roleSectionTitle")), 1),
                createVNode(unref(BtcTransferPanel), {
                  ref_key: "roleTransferRef",
                  ref: roleTransferRef,
                  modelValue: selectedRoleKeys.value,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => selectedRoleKeys.value = $event),
                  service: roleTransferService.value,
                  columns: roleTransferColumns.value,
                  options: roleOptions,
                  "display-prop": "roleName",
                  "description-prop": "description",
                  "row-key": "id",
                  "auto-load": false,
                  collapsible: false
                }, null, 8, ["modelValue", "service", "columns"])
              ])
            ])
          ]),
          footer: withCtx(() => [
            createBaseVNode("div", _hoisted_9, [
              createVNode(_component_el_button, { onClick: closeDrawer }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("common.button.cancel")), 1)
                ]),
                _: 1
              }),
              createVNode(_component_el_button, {
                type: "primary",
                loading: submitting.value,
                onClick: handleSubmit
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("common.button.confirm")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ])
          ]),
          _: 1
        }, 8, ["modelValue", "title"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ea51ccbb"]]);
export {
  index as default
};
