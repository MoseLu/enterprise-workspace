import { BtcTableGroup, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, m as unref, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "modules-page" };
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
    const moduleService = service.admin?.iam?.module;
    const wrappedModuleService = {
      ...moduleService,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await moduleService.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await moduleService.deleteBatch(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
    };
    const moduleColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "moduleName", label: t("platform.module.name"), minWidth: 150 },
      { prop: "moduleCode", label: t("platform.module.code"), minWidth: 150 },
      { prop: "moduleType", label: t("platform.module.type"), width: 100 },
      { prop: "description", label: t("platform.module.description"), minWidth: 200 }
    ]);
    const moduleFormItems = computed(() => [
      { prop: "moduleName", label: t("platform.module.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "moduleCode", label: t("platform.module.code"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "moduleType", label: t("platform.module.type"), span: 12, component: { name: "el-input" } },
      { prop: "description", label: t("platform.module.description"), span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": wrappedModuleService,
          "table-columns": moduleColumns.value,
          "form-items": moduleFormItems.value,
          op: { buttons: ["edit", "delete"] },
          "left-title": "业务域",
          "right-title": "模块列表",
          "search-placeholder": "搜索模块...",
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
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-29c2bbe8"]]);
export {
  index as default
};
