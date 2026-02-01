import { BtcTableGroup, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, m as unref, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "templates-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "AdminGovernanceFilesTemplates"
  },
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
    const templateService = service.admin?.iam?.processTemplate;
    const wrappedTemplateService = {
      ...templateService,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await templateService?.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await templateService?.deleteBatch(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
    };
    const templateColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: "序号", width: 60 },
      { prop: "templateName", label: t("data.template.name"), minWidth: 150 },
      { prop: "templateCode", label: t("data.template.code"), minWidth: 150 },
      { prop: "category", label: t("data.template.category"), width: 120 },
      { prop: "version", label: t("data.template.version"), width: 100 },
      { prop: "status", label: t("data.template.status"), width: 100 },
      { prop: "description", label: t("data.template.description"), minWidth: 200 }
    ]);
    const templateFormItems = computed(() => [
      { prop: "templateName", label: t("data.template.name"), span: 12, required: true, component: { name: "el-input" } },
      { prop: "templateCode", label: t("data.template.code"), span: 12, required: true, component: { name: "el-input" } },
      {
        prop: "category",
        label: t("data.template.category"),
        span: 12,
        component: {
          name: "el-select",
          options: [
            { label: "审批流程", value: "APPROVAL" },
            { label: "采购流程", value: "PURCHASE" },
            { label: "报销流程", value: "REIMBURSEMENT" },
            { label: "用印流程", value: "SEAL" },
            { label: "用印流程", value: "OTHER" }
          ]
        }
      },
      { prop: "version", label: t("data.template.version"), span: 12, component: { name: "el-input" } },
      {
        prop: "status",
        label: t("data.template.status"),
        span: 12,
        value: "DRAFT",
        component: {
          name: "el-radio-group",
          options: [
            { label: "草稿", value: "DRAFT" },
            { label: "已发布", value: "PUBLISHED" },
            { label: "已停用", value: "DISABLED" }
          ]
        }
      },
      { prop: "description", label: t("data.template.description"), span: 24, component: { name: "el-input", props: { type: "textarea", rows: 3 } } }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": wrappedTemplateService,
          "table-columns": templateColumns.value,
          "form-items": templateFormItems.value,
          op: { buttons: ["edit", "delete"] },
          "left-title": "业务域",
          "right-title": "受控文件列表",
          "search-placeholder": "搜索受控文件...",
          "show-unassigned": true,
          "unassigned-label": "未分配",
          "enable-key-search": true,
          onSelect: onDomainSelect
        }, null, 8, ["table-columns", "form-items"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-506288c5"]]);
export {
  index as default
};
