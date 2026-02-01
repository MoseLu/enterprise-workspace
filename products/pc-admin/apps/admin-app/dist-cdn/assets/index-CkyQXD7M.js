import { BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { createMockCrudService } from "@utils/http";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, w as withCtx, m as unref, o as openBlock, h as createBaseVNode, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "baseline-page" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const crudRef = ref();
    const tableRef = ref();
    const upsertRef = ref();
    const baselineService = createMockCrudService("btc_baseline");
    const baselineColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "baselineName", label: "基线名称", minWidth: 150 },
      { prop: "baselineCode", label: "基线编码", minWidth: 150 },
      { prop: "version", label: "版本", width: 100 },
      { prop: "description", label: "描述", minWidth: 200 },
      { prop: "status", label: "状态", width: 100 }
    ]);
    const baselineFormItems = computed(() => [
      { prop: "baselineName", label: "基线名称", span: 12, required: true, component: { name: "el-input" } },
      { prop: "baselineCode", label: "基线编码", span: 12, required: true, component: { name: "el-input" } },
      { prop: "version", label: "版本", span: 12, component: { name: "el-input" } },
      {
        prop: "status",
        label: "状态",
        span: 12,
        component: {
          name: "el-select",
          options: [
            { label: "启用", value: "enabled" },
            { label: "禁用", value: "disabled" }
          ]
        }
      },
      { prop: "description", label: "描述", span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "crudRef",
          ref: crudRef,
          service: unref(baselineService)
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
                  placeholder: unref(t)("ops.baseline.search_placeholder")
                }, null, 8, ["placeholder"]),
                createVNode(unref(BtcCrudActions))
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcTable), {
                  ref_key: "tableRef",
                  ref: tableRef,
                  columns: baselineColumns.value,
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
              items: baselineFormItems.value,
              width: "800px"
            }, null, 8, ["items"])
          ]),
          _: 1
        }, 8, ["service"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f36819ae"]]);
export {
  index as default
};
