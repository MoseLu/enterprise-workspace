import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, k as onMounted, x as createBlock, w as withCtx, m as unref, o as openBlock, l as createVNode, h as createBaseVNode } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const crudRef = ref();
    const actionService = {
      ...service.admin?.iam?.action,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.action?.delete(id);
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.action?.deleteBatch(ids);
      }
    };
    const columns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "actionNameCn", label: t("access.action.name") },
      { prop: "actionCode", label: t("access.action.code") },
      { prop: "actionType", label: t("access.action.type") },
      { prop: "httpMethod", label: t("access.action.http_method") },
      { prop: "description", label: t("common.description") }
    ]);
    const formItems = computed(() => [
      { prop: "actionNameCn", label: t("access.action.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "actionCode", label: t("access.action.code"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "actionType", label: t("access.action.type"), span: 12, component: { name: "el-input" } },
      { prop: "httpMethod", label: t("access.action.http_method"), span: 12, component: { name: "el-input" } },
      { prop: "description", label: t("common.description"), span: 24, component: { name: "el-input", props: { type: "textarea" } } }
    ]);
    onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcCrud), {
        ref_key: "crudRef",
        ref: crudRef,
        service: actionService
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
