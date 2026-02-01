import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, k as onMounted, x as createBlock, w as withCtx, m as unref, o as openBlock, l as createVNode, h as createBaseVNode, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const tableRef = ref();
    const upsertRef = ref();
    const rolePermissionService = {
      ...service.admin?.iam?.rolePermission,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.iam?.rolePermission?.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        if (service.admin?.iam?.rolePermission?.deleteBatch) {
          await service.admin?.iam?.rolePermission?.deleteBatch(ids);
        } else {
          const deleteFn = service.admin?.iam?.rolePermission?.delete;
          if (deleteFn) {
            await Promise.all(ids.map((id) => deleteFn(id)));
          }
        }
        message.success(t("crud.message.delete_success"));
      }
    };
    const columns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "id", label: "ID", width: 80 },
      { prop: "roleId", label: "角色ID", width: 150 },
      { prop: "permissionId", label: "权限ID", width: 150 },
      { prop: "tenantId", label: "租户ID", width: 150 },
      { prop: "createdAt", label: "创建时间", width: 180, sortable: true }
    ]);
    const formItems = computed(() => [
      { prop: "roleId", label: "角色ID", span: 12, required: true, component: { name: "el-input" } },
      { prop: "permissionId", label: "权限ID", span: 12, required: true, component: { name: "el-input" } },
      { prop: "tenantId", label: "租户ID", span: 12, component: { name: "el-input" } }
    ]);
    onMounted(() => {
      setTimeout(() => crudRef.value?.crud.loadData(), 100);
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcCrud), {
        ref_key: "crudRef",
        ref: crudRef,
        service: rolePermissionService
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
              createVNode(unref(BtcSearchKey), { placeholder: "搜索角色权限绑定..." }),
              createVNode(unref(BtcCrudActions))
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
            ref_key: "upsertRef",
            ref: upsertRef,
            items: formItems.value,
            width: "800px"
          }, null, 8, ["items"])
        ]),
        _: 1
      }, 512);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-887c5931"]]);
export {
  index as default
};
