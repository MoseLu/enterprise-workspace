import { useI18n } from "@btc/shared-core";
import { useMessage } from "@/utils/use-message";
import { BtcRow, BtcRefreshBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcCrud } from "@btc/shared-components";
import BtcSvg from "@btc-components/others/btc-svg/index.vue";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, w as withCtx, m as unref, o as openBlock, h as createBaseVNode, D as ElButton, t as toDisplayString, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "resources-page" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
const _hoisted_3 = { class: "btc-crud-btn__text" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const syncLoading = ref(false);
    const resourceService = service.admin?.iam?.resource;
    const handleSync = async () => {
      if (syncLoading.value) return;
      try {
        syncLoading.value = true;
        await service.admin?.iam?.resource?.pull();
        message.success(t("access.resources.sync_success"));
        if (crudRef.value?.crud) {
          await crudRef.value.crud.refresh();
        }
      } catch (error) {
        message.error(t("access.resources.sync_failed"));
        console.error("数据同步失败:", error);
      } finally {
        syncLoading.value = false;
      }
    };
    const resourceTypeDict = [
      { label: "文件", value: "FILE", type: "info" },
      { label: "API", value: "API", type: "warning" },
      { label: "数据表", value: "TABLE", type: "primary" }
    ];
    const resourceColumns = computed(() => [
      { type: "index", label: "序号", width: 60 },
      { prop: "resourceNameCn", label: "资源名称", minWidth: 150 },
      { prop: "resourceCode", label: "资源编码", minWidth: 150 },
      {
        prop: "resourceType",
        label: "类型",
        width: 120,
        dict: resourceTypeDict.map((item) => ({ ...item })),
        dictColor: true
      },
      { prop: "description", label: "描述", minWidth: 200 }
    ]);
    const resourceFormItems = computed(() => [
      { prop: "resourceNameCn", label: "资源名称", span: 12, required: true, component: { name: "el-input" } },
      { prop: "resourceCode", label: "资源编码", span: 12, required: true, component: { name: "el-input" } },
      {
        prop: "resourceType",
        label: "类型",
        span: 12,
        component: {
          name: "el-select",
          options: resourceTypeDict.map((item) => ({
            label: item.label,
            value: item.value
          }))
        }
      },
      { prop: "description", label: "描述", span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "crudRef",
          ref: crudRef,
          service: unref(resourceService)
        }, {
          default: withCtx(() => [
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_2, [
                  createVNode(unref(BtcRefreshBtn)),
                  createVNode(_component_el_button, {
                    type: "warning",
                    class: "btc-crud-btn",
                    loading: syncLoading.value,
                    onClick: handleSync
                  }, {
                    default: withCtx(() => [
                      createVNode(BtcSvg, {
                        class: "btc-crud-btn__icon",
                        name: "sync"
                      }),
                      createBaseVNode("span", _hoisted_3, toDisplayString(unref(t)("access.resources.sync")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
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
                  columns: resourceColumns.value,
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
            createVNode(unref(BtcUpsert), { items: resourceFormItems.value }, null, 8, ["items"])
          ]),
          _: 1
        }, 8, ["service"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6dc5c7d4"]]);
export {
  index as default
};
