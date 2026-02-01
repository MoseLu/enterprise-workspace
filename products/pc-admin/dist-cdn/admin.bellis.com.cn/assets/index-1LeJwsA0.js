import { BtcTableGroup, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, m as unref, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "plugins-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const tableGroupRef = ref();
    const selectedDomain = ref(null);
    const domainService = {
      list: (params) => {
        const finalParams = params || {};
        return service.admin?.iam?.domain?.list(finalParams);
      }
    };
    const pluginService = service.admin?.iam?.plugin;
    const wrappedPluginService = {
      ...pluginService,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await pluginService.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await pluginService.deleteBatch(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
    };
    const pluginColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "pluginName", label: t("platform.plugin.name"), minWidth: 150 },
      { prop: "pluginCode", label: t("platform.plugin.code"), minWidth: 150 },
      { prop: "version", label: t("platform.plugin.version"), width: 100 },
      { prop: "status", label: t("platform.plugin.status"), width: 100 },
      { prop: "description", label: t("platform.plugin.description"), minWidth: 200 }
    ]);
    const pluginFormItems = computed(() => [
      { prop: "pluginName", label: t("platform.plugin.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "pluginCode", label: t("platform.plugin.code"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "version", label: t("platform.plugin.version"), span: 12, component: { name: "el-input" } },
      {
        prop: "status",
        label: t("platform.plugin.status"),
        span: 12,
        value: "ENABLED",
        component: {
          name: "el-radio-group",
          options: [
            { label: t("platform.plugin.enabled"), value: "ENABLED" },
            { label: t("platform.plugin.disabled"), value: "DISABLED" }
          ]
        }
      },
      { prop: "description", label: t("platform.plugin.description"), span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": wrappedPluginService,
          "table-columns": pluginColumns.value,
          "form-items": pluginFormItems.value,
          op: { buttons: ["edit", "delete"] },
          "left-title": "业务域",
          "right-title": "插件列表",
          "search-placeholder": "搜索插件...",
          "show-unassigned": true,
          "unassigned-label": "未分配",
          "enable-key-search": true,
          "left-size": "small",
          onSelect: onDomainSelect
        }, null, 8, ["table-columns", "form-items"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7b1c0288"]]);
export {
  index as default
};
