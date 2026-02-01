import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, w as withCtx, m as unref, o as openBlock, h as createBaseVNode, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "dictionary-values-page" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "AdminDictionaryValues"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const dictionaryValueService = {
      ...service.admin?.dict?.dictData,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.dict?.dictData?.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await service.admin?.dict?.dictData?.deleteBatch(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    const dictionaryValueColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "dictTypeCode", label: t("data.dictionary.value.type_code"), minWidth: 150 },
      { prop: "dictValue", label: t("data.dictionary.value.value"), minWidth: 150 },
      { prop: "dictLabel", label: t("data.dictionary.value.label"), minWidth: 150 },
      { prop: "sortOrder", label: t("data.dictionary.value.sort"), width: 100 }
    ]);
    const dictionaryValueFormItems = computed(() => [
      {
        prop: "dictTypeCode",
        label: t("data.dictionary.value.type_code"),
        span: 12,
        required: true,
        component: {
          name: "el-input",
          props: {
            placeholder: t("data.dictionary.value.type_code_placeholder")
          }
        }
      },
      {
        prop: "dictValue",
        label: t("data.dictionary.value.value"),
        span: 12,
        required: true,
        component: { name: "el-input" }
      },
      {
        prop: "dictLabel",
        label: t("data.dictionary.value.label"),
        span: 12,
        required: true,
        component: { name: "el-input" }
      },
      {
        prop: "sortOrder",
        label: t("data.dictionary.value.sort"),
        span: 12,
        component: {
          name: "el-input-number",
          props: { min: 0, precision: 0 }
        }
      }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "crudRef",
          ref: crudRef,
          service: dictionaryValueService
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
                  placeholder: unref(t)("data.dictionary.value.search_placeholder")
                }, null, 8, ["placeholder"]),
                createVNode(unref(BtcCrudActions))
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcTable), {
                  columns: dictionaryValueColumns.value,
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
              items: dictionaryValueFormItems.value,
              width: "800px"
            }, null, 8, ["items"])
          ]),
          _: 1
        }, 512)
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0ad62ace"]]);
export {
  index as default
};
