import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, k as onMounted, x as createBlock, w as withCtx, m as unref, o as openBlock, l as createVNode, h as createBaseVNode } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const permissionService = service.admin?.iam?.permission;
    const wrappedService = {
      ...permissionService,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await permissionService.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await permissionService.deleteBatch(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    const columns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "permName", label: t("access.permission.name"), minWidth: 150, showOverflowTooltip: true },
      { prop: "permCode", label: t("access.permission.code"), minWidth: 150, showOverflowTooltip: true },
      { prop: "permType", label: t("access.permission.type"), minWidth: 100 },
      { prop: "permCategory", label: t("access.permission.category"), minWidth: 100 },
      { prop: "moduleId", label: t("platform.module.name"), minWidth: 120 },
      { prop: "pluginId", label: t("platform.plugin.name"), minWidth: 120 },
      { prop: "description", label: t("common.description"), minWidth: 150, showOverflowTooltip: true },
      { prop: "createdAt", label: t("common.create_time"), minWidth: 160, formatter: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" }
    ]);
    const formItems = computed(() => [
      { prop: "permName", label: t("access.permission.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "permCode", label: t("access.permission.code"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "permType", label: t("access.permission.type"), span: 12, component: { name: "el-input" } },
      { prop: "permCategory", label: t("access.permission.category"), span: 12, component: { name: "el-input" } },
      { prop: "moduleId", label: t("platform.module.name"), span: 12, component: { name: "el-input" } },
      { prop: "pluginId", label: t("platform.plugin.name"), span: 12, component: { name: "el-input" } },
      { prop: "description", label: t("common.description"), span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcCrud), {
        ref_key: "crudRef",
        ref: crudRef,
        service: wrappedService
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
