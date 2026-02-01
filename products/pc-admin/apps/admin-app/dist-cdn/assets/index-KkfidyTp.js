import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, x as createBlock, w as withCtx, m as unref, o as openBlock, l as createVNode, h as createBaseVNode } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const crudRef = ref();
    const tenantService = {
      ...service.admin?.iam?.tenant,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.tenant?.delete(id);
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.tenant?.deleteBatch(ids);
      }
    };
    const columns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "tenantName", label: t("org.tenant.name") },
      { prop: "tenantCode", label: t("org.tenant.code") },
      { prop: "tenantType", label: t("org.tenant.type") },
      {
        prop: "status",
        label: t("org.user.status"),
        width: 120,
        dict: [
          { label: "启用", value: "ACTIVE", type: "success" },
          { label: "禁用", value: "INACTIVE", type: "danger" }
        ],
        dictColor: true
      }
    ]);
    const formItems = computed(() => [
      { prop: "tenantName", label: t("org.tenant.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "tenantCode", label: t("org.tenant.code"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "tenantType", label: t("org.tenant.type"), span: 12, component: { name: "el-input" } },
      { prop: "description", label: t("org.tenant.description"), span: 24, component: { name: "el-input", props: { type: "textarea" } } }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcCrud), {
        ref_key: "crudRef",
        ref: crudRef,
        service: tenantService
      }, {
        default: withCtx(() => [
          createVNode(unref(BtcRow), null, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_1, [
                createVNode(unref(BtcRefreshBtn)),
                createVNode(unref(BtcAddBtn)),
                createVNode(unref(BtcMultiDeleteBtn))
              ]),
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
      }, 512);
    };
  }
});
export {
  _sfc_main as default
};
