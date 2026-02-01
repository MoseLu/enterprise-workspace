import { b as defineComponent, u as useI18n, i as ref, j as computed, B as BtcMessage, a3 as BtcConfirm, aq as onActivated, n as createElementBlock, o as openBlock, t as createVNode, x as withCtx, af as _sfc_main$1, q as createBaseVNode, ag as _sfc_main$2, g as unref, E as ElButton, y as createTextVNode, w as toDisplayString, aj as __unplugin_components_1, ak as _sfc_main$3, al as _sfc_main$4, am as __unplugin_components_5, an as _sfc_main$5, ap as _sfc_main$6, z as _export_sfc } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import { r as requestAdapter } from "./auth-api-CvJd6wHo.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "recycle-page" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "DataRecycle"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const loading = ref(false);
    const crudRef = ref();
    const tableRef = ref();
    const tableSelection = computed(() => {
      return crudRef.value?.selection || [];
    });
    const columns = computed(() => [
      {
        type: "selection"
      },
      {
        label: t("recycle.operator"),
        prop: "username",
        minWidth: 120
      },
      {
        label: t("recycle.operation_desc"),
        prop: "operationDesc",
        minWidth: 150,
        showOverflowTooltip: true
      },
      {
        label: t("recycle.ip_address"),
        prop: "ipAddress",
        minWidth: 120
      },
      {
        label: t("recycle.deleted_data"),
        prop: "beforeData",
        minWidth: 200,
        component: {
          name: "btc-code-json",
          props: {
            popover: true
          }
        }
      },
      {
        label: t("recycle.request_url"),
        prop: "requestUrl",
        showOverflowTooltip: true,
        minWidth: 200
      },
      {
        label: t("recycle.request_params"),
        prop: "params",
        minWidth: 200,
        component: {
          name: "btc-code-json",
          props: {
            popover: true
          }
        }
      },
      {
        label: t("recycle.create_time"),
        prop: "createdAt",
        minWidth: 170,
        sortable: "custom"
      },
      {
        type: "op",
        width: 120,
        buttons: [
          {
            label: t("recycle.restore"),
            type: "success",
            onClick: ({ scope }) => {
              const id = scope.row.id;
              restore(id);
            }
          }
        ]
      }
    ]);
    const recycleService = {
      page: async (data) => {
        return await requestAdapter.post("/api/system/log/deletelog/page", data || {}, { notifySuccess: false });
      },
      restore: async (data) => {
        return await requestAdapter.post("/api/system/log/deletelog/restore", data, { notifySuccess: false });
      },
      restoreBatch: async (data) => {
        return await requestAdapter.post("/api/system/log/deletelog/restore/batch", data, { notifySuccess: false });
      },
      // 添加CRUD必需的方法（数据回收站不需要这些功能）
      add: async () => {
        throw new Error("数据回收站不支持添加操作");
      },
      update: async () => {
        throw new Error("数据回收站不支持更新操作");
      },
      delete: async () => {
        throw new Error("数据回收站不支持删除操作");
      },
      deleteBatch: async () => {
        throw new Error("数据回收站不支持批量删除操作");
      }
    };
    function refresh(params) {
      crudRef.value?.crud?.refresh(params);
    }
    function restore(targetId) {
      const ids = targetId ? [targetId] : tableSelection.value.map((e) => e.id);
      const validIds = ids.filter(Boolean);
      if (validIds.length === 0) {
        BtcMessage.warning(t("recycle.please_select_data"));
        return;
      }
      const confirmMessage = validIds.length === 1 ? t("recycle.restore_confirm") : t("recycle.batch_restore_confirm", { count: validIds.length });
      BtcConfirm(
        confirmMessage,
        t("common.tip"),
        {
          type: "warning",
          confirmButtonText: t("common.button.confirm"),
          cancelButtonText: t("common.button.cancel")
        }
      ).then(async () => {
        loading.value = true;
        try {
          if (validIds.length === 1) {
            await recycleService.restore({
              id: validIds[0]
            });
            BtcMessage.success(t("recycle.restore_success"));
          } else {
            await recycleService.restoreBatch({ ids: validIds });
            BtcMessage.success(t("recycle.batch_restore_success", { count: validIds.length }));
          }
          refresh();
        } catch (err) {
          console.error("恢复数据失败:", err);
        } finally {
          loading.value = false;
        }
      }).catch(() => null);
    }
    onActivated(() => {
      refresh();
    });
    return (_ctx, _cache) => {
      const _component_btc_refresh_btn = _sfc_main$2;
      const _component_btc_flex1 = __unplugin_components_1;
      const _component_btc_search_key = _sfc_main$3;
      const _component_btc_crud_actions = _sfc_main$4;
      const _component_btc_row = _sfc_main$1;
      const _component_btc_table = __unplugin_components_5;
      const _component_btc_pagination = _sfc_main$5;
      const _component_btc_crud = _sfc_main$6;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_btc_crud, {
          ref_key: "crudRef",
          ref: crudRef,
          service: recycleService
        }, {
          default: withCtx(() => [
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_2, [
                  createVNode(_component_btc_refresh_btn),
                  createVNode(unref(ElButton), {
                    type: "success",
                    disabled: tableSelection.value.length === 0 || loading.value,
                    loading: loading.value,
                    onClick: _cache[0] || (_cache[0] = ($event) => restore())
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(tableSelection.value.length === 1 ? _ctx.$t("recycle.restore") : _ctx.$t("recycle.batch_restore")) + " (" + toDisplayString(tableSelection.value.length) + ") ", 1)
                    ]),
                    _: 1
                  }, 8, ["disabled", "loading"])
                ]),
                createVNode(_component_btc_flex1),
                createVNode(_component_btc_search_key),
                createVNode(_component_btc_crud_actions)
              ]),
              _: 1
            }),
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_table, {
                  ref_key: "tableRef",
                  ref: tableRef,
                  columns: columns.value,
                  autoHeight: true,
                  border: "",
                  rowKey: "id"
                }, null, 8, ["columns"])
              ]),
              _: 1
            }),
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_flex1),
                createVNode(_component_btc_pagination)
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 512)
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a42f9b5a"]]);
export {
  index as default
};
