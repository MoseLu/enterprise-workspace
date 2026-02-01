import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, w as withCtx, m as unref, u as useRouter, o as openBlock, D as ElButton, v as createTextVNode, t as toDisplayString, i as _export_sfc } from "./index-CeQEKVXA.js";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { BtcTableGroup } from "@btc/shared-components";
import BtcSvg from "@btc-components/others/btc-svg/index.vue";
import { service } from "@services/eps";
import "@btc/shared-utils";
const _hoisted_1 = { class: "dictionary-fields-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "AdminDictionaryFields"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const router = useRouter();
    const tableGroupRef = ref();
    const selectedResource = ref(null);
    const resourceService = {
      list: (params) => {
        const finalParams = params || {};
        return service.admin?.iam?.resource?.list(finalParams);
      }
    };
    const fieldService = service.admin?.dict?.info;
    const wrappedFieldService = {
      ...fieldService
    };
    const onResourceSelect = (resource) => {
      selectedResource.value = resource;
    };
    const handleFormSubmit = (data, event) => {
      if (selectedResource.value) {
        data.domainId = selectedResource.value.id;
      }
      if (!event.defaultPrevented && typeof event.next === "function") {
        event.next(data);
      }
    };
    const goToDictionaryValues = (field) => {
      if (!field || !field.id) {
        message.warning(t("data.dictionary.field.select_required"));
        return;
      }
      router.push({
        path: "/governance/dictionary/values",
        query: {
          fieldId: field.id,
          fieldName: field.fieldName || field.dictName,
          dictCode: field.dictCode,
          // 传递上下文信息
          domainId: selectedResource.value?.id
        }
      });
    };
    const fieldColumns = computed(() => [
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "dictCode", label: t("data.dictionary.field.code"), minWidth: 150 },
      { prop: "dictName", label: t("data.dictionary.field.name"), minWidth: 150 },
      { prop: "entityClass", label: t("data.dictionary.field.entity_class"), minWidth: 180 },
      { prop: "fieldName", label: t("data.dictionary.field.field_name"), minWidth: 150 },
      { prop: "remark", label: t("data.dictionary.field.remark"), minWidth: 200 }
    ]);
    const fieldFormItems = computed(() => {
      const currentResource = selectedResource.value || tableGroupRef.value?.viewGroupRef?.selectedItem;
      return [
        {
          prop: "dictCode",
          label: t("data.dictionary.field.code"),
          span: 12,
          required: true,
          component: { name: "el-input" }
        },
        {
          prop: "dictName",
          label: t("data.dictionary.field.name"),
          span: 12,
          required: true,
          component: { name: "el-input" }
        },
        {
          prop: "entityClass",
          label: t("data.dictionary.field.entity_class"),
          span: 12,
          component: { name: "el-input" }
        },
        {
          prop: "fieldName",
          label: t("data.dictionary.field.field_name"),
          span: 12,
          component: { name: "el-input" }
        },
        {
          prop: "domainId",
          label: t("data.dictionary.field.domain_id"),
          span: 12,
          value: currentResource?.id,
          component: {
            name: "el-input",
            props: {
              disabled: true,
              placeholder: currentResource?.id ? currentResource.id : t("data.dictionary.field.domain_select_required")
            }
          }
        },
        {
          prop: "remark",
          label: t("data.dictionary.field.remark"),
          span: 24,
          component: { name: "el-input", props: { type: "textarea", rows: 3 } }
        }
      ];
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": resourceService,
          "right-service": wrappedFieldService,
          "table-columns": fieldColumns.value,
          "form-items": fieldFormItems.value,
          op: { buttons: ["custom"] },
          "show-add-btn": false,
          "show-multi-delete-btn": false,
          "left-title": unref(t)("menu.access.resources"),
          "right-title": unref(t)("data.dictionary.field.list"),
          "search-placeholder": unref(t)("data.dictionary.field.search_placeholder"),
          "show-unassigned": false,
          "enable-key-search": true,
          "left-size": "middle",
          "id-field": "id",
          "label-field": "resourceNameCn",
          onSelect: onResourceSelect,
          onFormSubmit: handleFormSubmit
        }, {
          "slot-custom": withCtx(({ scope }) => [
            createVNode(_component_el_button, {
              link: "",
              type: "warning",
              onClick: ($event) => goToDictionaryValues(scope.row)
            }, {
              default: withCtx(() => [
                createVNode(BtcSvg, {
                  class: "btc-crud-btn__icon",
                  name: "dict"
                }),
                createTextVNode(" " + toDisplayString(unref(t)("data.dictionary.actions.manage_values")), 1)
              ]),
              _: 1
            }, 8, ["onClick"])
          ]),
          _: 1
        }, 8, ["table-columns", "form-items", "left-title", "right-title", "search-placeholder"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a10b8b71"]]);
export {
  index as default
};
