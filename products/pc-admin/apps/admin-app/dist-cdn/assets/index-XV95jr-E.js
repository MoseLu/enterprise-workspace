import { BtcTableGroup } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { sortByLocale } from "@btc/shared-utils";
import { sysApi } from "@/modules/api-services";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, m as unref, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
const _hoisted_1 = { class: "ops-api-list" };
const API_DOCS_TIMEOUT = 5e3;
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "OpsApiList"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const controllerList = ref([]);
    const controllerMap = ref({});
    const selectedControllerId = ref(null);
    const loadingDocs = ref(false);
    const API_DOCS_TIMEOUT_TOKEN = {};
    async function fetchApiDocsWithFallback() {
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(API_DOCS_TIMEOUT_TOKEN), API_DOCS_TIMEOUT);
      });
      try {
        const result = await Promise.race([sysApi.apiDocs.list(), timeoutPromise]);
        if (result === API_DOCS_TIMEOUT_TOKEN) {
          console.warn("[OpsApiList] 获取接口文档超时，使用空列表作为回退");
          return [];
        }
        return result;
      } catch (error) {
        console.warn("[OpsApiList] 获取接口文档失败，使用空列表作为回退", error);
        return [];
      }
    }
    function extractPayload(raw) {
      if (!raw) return {};
      if (raw.code !== void 0 && raw.data !== void 0) {
        return raw.data;
      }
      return raw;
    }
    function normalizeValue(value) {
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      if (typeof value === "string") {
        return value;
      }
      return value ? String(value) : "";
    }
    function buildControllers(payload) {
      if (!payload || typeof payload !== "object") {
        return [];
      }
      const controllers = Array.isArray(payload) ? payload : Object.values(payload);
      return controllers.map((controller) => {
        const className = controller?.className || "";
        const simpleName = controller?.simpleName || className.split(".").pop() || className;
        const tags = Array.isArray(controller?.tags) ? controller.tags : [];
        const tagsText = tags.length > 0 ? tags.join(" / ") : "";
        const apis = Array.isArray(controller?.apis) ? controller.apis : [];
        const apiRecords = apis.map((api) => {
          const description = api?.description || {};
          const summary = description?.summary || "";
          const descriptionText = description?.description || "";
          const fullDescription = summary && descriptionText ? `${summary}
${descriptionText}` : summary || descriptionText || "";
          const method = normalizeValue(api?.httpMethods).toUpperCase();
          const paths = normalizeValue(api?.paths);
          const parameters = Array.isArray(api?.parameters) ? api.parameters : [];
          return {
            controller: simpleName,
            className: className || simpleName,
            tags,
            tagsText,
            methodName: api?.methodName || "",
            httpMethods: method,
            paths,
            description: fullDescription,
            notes: descriptionText || "",
            // 使用 description 字段作为备注
            parameters
          };
        });
        const displayName = tagsText || simpleName;
        return {
          id: className || simpleName,
          label: displayName,
          name: displayName,
          className: className || simpleName,
          simpleName,
          tags,
          apis: apiRecords
        };
      });
    }
    async function loadControllers(forceReload = false) {
      if (loadingDocs.value) {
        if (!forceReload) return;
      }
      if (!forceReload && controllerList.value.length) return;
      try {
        loadingDocs.value = true;
        const currentSelectedId = selectedControllerId.value;
        const response = await fetchApiDocsWithFallback();
        const payload = extractPayload(response);
        const nodes = buildControllers(payload);
        const sortedNodes = sortByLocale(nodes, (node) => node.label ?? "");
        controllerList.value = sortedNodes;
        controllerMap.value = sortedNodes.reduce((acc, node) => {
          acc[node.id] = node;
          return acc;
        }, {});
        if (currentSelectedId && controllerMap.value[currentSelectedId]) {
          selectedControllerId.value = currentSelectedId;
        } else if (sortedNodes.length > 0) {
          selectedControllerId.value = sortedNodes[0].id;
        } else {
          selectedControllerId.value = null;
        }
      } finally {
        loadingDocs.value = false;
      }
    }
    const controllerService = {
      async list(params) {
        const forceReload = params?.keyword === void 0;
        await loadControllers(forceReload);
        const keyword = params?.keyword ? params.keyword.toLowerCase() : "";
        const matched = keyword ? controllerList.value.filter((controller) => {
          return controller.label.toLowerCase().includes(keyword) || controller.className.toLowerCase().includes(keyword) || controller.tags.some((tag) => tag.toLowerCase().includes(keyword));
        }) : controllerList.value;
        return sortByLocale(matched, (controller) => controller.label ?? "");
      }
    };
    const apiService = {
      async page(params = {}) {
        await loadControllers();
        const controllerId = selectedControllerId.value;
        const keyword = String(params.keyword || "").trim().toLowerCase();
        const page = Number(params.page || 1);
        const size = Number(params.size || 20);
        let records = [];
        if (controllerId && controllerMap.value[controllerId]) {
          records = controllerMap.value[controllerId].apis;
        }
        if (keyword) {
          records = records.filter((item) => {
            const candidates = [
              item.controller,
              item.className,
              item.methodName,
              item.httpMethods,
              item.paths,
              item.description,
              item.notes,
              item.tagsText
            ];
            return candidates.some((value) => value && value.toLowerCase().includes(keyword));
          });
        }
        const total = records.length;
        const startIndex = (page - 1) * size;
        const list = records.slice(startIndex, startIndex + size);
        return {
          list,
          total
        };
      },
      async add() {
        throw new Error("接口列表不支持新增操作");
      },
      async update() {
        throw new Error("接口列表不支持编辑操作");
      },
      async delete() {
        throw new Error("接口列表不支持删除操作");
      },
      async deleteBatch() {
        throw new Error("接口列表不支持删除操作");
      }
    };
    const columns = computed(() => [
      {
        type: "index",
        width: 60,
        label: "#",
        align: "center",
        headerAlign: "center"
      },
      {
        prop: "tagsText",
        label: t("ops.api_list.fields.tags"),
        minWidth: 160,
        align: "center",
        headerAlign: "center",
        formatter: (row) => row.tagsText || "-",
        showOverflowTooltip: true
      },
      {
        prop: "controller",
        label: t("ops.api_list.fields.controller"),
        minWidth: 200,
        align: "center",
        headerAlign: "center",
        showOverflowTooltip: true
      },
      {
        prop: "methodName",
        label: t("ops.api_list.fields.name"),
        minWidth: 140,
        align: "center",
        headerAlign: "center",
        showOverflowTooltip: true
      },
      {
        prop: "httpMethods",
        label: t("ops.api_list.fields.request_type"),
        width: 120,
        align: "center",
        headerAlign: "center",
        dictColor: true,
        dict: [
          { value: "GET", label: "GET", type: "success" },
          { value: "POST", label: "POST", type: "primary" },
          { value: "PUT", label: "PUT", type: "warning" },
          { value: "DELETE", label: "DELETE", type: "danger" },
          { value: "PATCH", label: "PATCH", type: "info" },
          { value: "OPTIONS", label: "OPTIONS", type: "info" },
          { value: "HEAD", label: "HEAD", type: "info" }
        ]
      },
      {
        prop: "paths",
        label: t("ops.api_list.fields.path"),
        minWidth: 260,
        align: "center",
        headerAlign: "center",
        showOverflowTooltip: true
      },
      {
        prop: "description",
        label: t("ops.api_list.fields.description"),
        minWidth: 220,
        align: "center",
        headerAlign: "center",
        showOverflowTooltip: true
      },
      {
        prop: "parameters",
        label: t("ops.api_list.fields.parameters"),
        minWidth: 280,
        align: "center",
        headerAlign: "center",
        component: {
          name: "BtcCodeJson",
          props: {
            popover: true,
            maxLength: 800
          }
        }
      },
      {
        prop: "notes",
        label: t("ops.api_list.fields.notes"),
        minWidth: 220,
        align: "center",
        headerAlign: "center",
        formatter: (row) => row.notes || "-",
        showOverflowTooltip: true,
        fixed: "right"
      }
    ]);
    const tableGroupRef = ref();
    function handleSelect(item) {
      selectedControllerId.value = item?.id || null;
    }
    function handleControllerLoad(list) {
      if (!selectedControllerId.value && list.length > 0) {
        selectedControllerId.value = list[0].id;
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": controllerService,
          "right-service": apiService,
          "table-columns": columns.value,
          "form-items": [],
          op: void 0,
          "left-title": "控制器",
          "right-title": "接口列表",
          "show-create-time": false,
          "show-update-time": false,
          "enable-key-search": true,
          "left-width": "320px",
          "search-placeholder": "搜索接口...",
          onSelect: handleSelect,
          onLoad: handleControllerLoad
        }, null, 8, ["table-columns"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cb5647db"]]);
export {
  index as default
};
