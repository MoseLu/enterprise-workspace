import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, k as onMounted, e as createElementBlock, l as createVNode, w as withCtx, m as unref, o as openBlock, h as createBaseVNode, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "domains-page" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const crudRef = ref();
    const tableRef = ref();
    const tenantOptions = ref([]);
    const tenantLoading = ref(false);
    const tenantLabelMap = computed(() => {
      const map = /* @__PURE__ */ new Map();
      tenantOptions.value.forEach((item) => {
        map.set(item.value, item.label);
      });
      return map;
    });
    const loadTenantOptions = async () => {
      const tenantService = service.admin?.iam?.tenant;
      if (!tenantService || typeof tenantService.list !== "function") {
        console.warn("[Domain] 租户列表服务不可用");
        tenantOptions.value = [];
        return;
      }
      tenantLoading.value = true;
      try {
        const response = await tenantService.list({});
        const list = Array.isArray(response?.list) ? response.list : Array.isArray(response) ? response : [];
        tenantOptions.value = list.map((tenant) => {
          const value = tenant?.id ?? tenant?.tenantId ?? tenant?.tenantCode ?? tenant?.code;
          const label = tenant?.tenantName ?? tenant?.name ?? tenant?.tenantCode ?? value;
          if (value === void 0 || value === null) {
            return null;
          }
          return {
            value,
            label: String(label ?? value)
          };
        }).filter((item) => !!item);
      } catch (error) {
        console.warn("[Domain] 获取租户列表失败:", error);
        tenantOptions.value = [];
      } finally {
        tenantLoading.value = false;
      }
    };
    onMounted(() => {
      loadTenantOptions();
    });
    const wrappedDomainService = {
      ...service.admin?.iam?.domain || {},
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.domain?.delete(id);
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.domain?.deleteBatch(ids);
      }
    };
    const columns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "name", label: t("platform.domains.domain_name"), minWidth: 150 },
      { prop: "domainCode", label: t("platform.domains.domain_code"), width: 120 },
      { prop: "domainType", label: t("platform.domains.domain_type"), width: 120 },
      {
        prop: "tenantId",
        label: "租户名称",
        width: 150,
        formatter: (_row, _column, cellValue) => tenantLabelMap.value.get(cellValue) ?? cellValue ?? "-"
      },
      { prop: "description", label: t("platform.domains.description"), minWidth: 200 }
    ]);
    const formItems = computed(() => [
      { prop: "name", label: t("platform.domain.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "domainCode", label: t("platform.domain.code"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "domainType", label: t("platform.domains.domain_type"), span: 12, component: { name: "el-input" } },
      {
        prop: "tenantId",
        label: "租户名称",
        span: 12,
        required: true,
        component: {
          name: "el-select",
          props: {
            filterable: true,
            clearable: true,
            loading: tenantLoading.value
          },
          options: tenantOptions.value
        }
      },
      { prop: "description", label: t("common.description"), span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "crudRef",
          ref: crudRef,
          service: wrappedDomainService
        }, {
          default: withCtx(() => [
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_2, [
                  createVNode(unref(BtcRefreshBtn)),
                  createVNode(unref(BtcAddBtn)),
                  createVNode(unref(BtcMultiDeleteBtn))
                ]),
                createVNode(unref(BtcFlex1)),
                createVNode(unref(BtcSearchKey), {
                  placeholder: unref(t)("platform.domain.search_placeholder")
                }, null, 8, ["placeholder"]),
                createVNode(unref(BtcCrudActions), null, {
                  default: withCtx(() => [
                    createVNode(unref(BtcExportBtn), {
                      filename: unref(t)("platform.domain.list")
                    }, null, 8, ["filename"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcTable), {
                  ref_key: "tableRef",
                  ref: tableRef,
                  columns: columns.value,
                  op: { buttons: ["edit", "delete"] },
                  border: ""
                }, null, 8, ["columns"])
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
              width: "800px"
            }, null, 8, ["items"])
          ]),
          _: 1
        }, 512)
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6bde1cd8"]]);
export {
  index as default
};
