import { u as useMessage } from "./use-message-D91LUZR4.js";
import { b as defineComponent, m as useI18n, i as ref, j as computed, n as createElementBlock, o as openBlock, t as createVNode, x as withCtx, E as ElButton, y as createTextVNode, _ as __unplugin_components_0, w as toDisplayString, g as unref, a4 as BtcImportBtn, a5 as BtcTableGroup, a9 as formatDateTime, B as BtcMessage, a6 as exportJsonToExcel, a7 as provide, a8 as IMPORT_FORBIDDEN_KEYWORDS_KEY, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-Df5AdCU7.js";
import { s as service } from "./eps-service-CyhGCtaT.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "inventory-ticket-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcDataInventoryTicket"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const tableGroupRef = ref();
    const selectedDomain = ref(null);
    const exportLoading = ref(false);
    const exportFilename = computed(() => t("menu.inventory.dataSource.ticket"));
    provide(IMPORT_FORBIDDEN_KEYWORDS_KEY, ["SysPro", "BOM表", "(", ")", "（", "）", "副本"]);
    const domainService = {
      list: async () => {
        try {
          const response = await service.logistics?.base?.position?.me?.();
          let list = [];
          if (Array.isArray(response)) {
            list = response;
          } else if (response && typeof response === "object") {
            if ("data" in response) {
              const data = response.data;
              if (Array.isArray(data)) {
                list = data;
              } else if (data && typeof data === "object") {
                list = Array.isArray(data.data) ? data.data : Array.isArray(data.list) ? data.list : [];
              }
            } else if ("list" in response) {
              list = Array.isArray(response.list) ? response.list : [];
            }
          }
          const domainMap = /* @__PURE__ */ new Map();
          list.forEach((item) => {
            if (!item || typeof item !== "object") return;
            const domainId = item.domianId || item.domainId;
            if (domainId && !domainMap.has(domainId)) {
              domainMap.set(domainId, {
                id: domainId,
                domainId,
                name: item.name || "",
                domainCode: domainId,
                value: domainId
              });
            }
          });
          return Array.from(domainMap.values());
        } catch (error) {
          console.error("[InventoryTicket] Failed to load domains from position service:", error);
          return [];
        }
      }
    };
    const resolveSelectedDomainId = () => {
      const domain = selectedDomain.value;
      if (!domain) return null;
      return domain.domainId ?? domain.id ?? domain.domainCode ?? domain.value ?? null;
    };
    const createWrappedService = (baseService) => {
      if (!baseService) {
        return {};
      }
      return {
        ...baseService,
        // 包装 page 方法，将左侧选中的域 ID 转换为 keyword.domainId
        page: async (params) => {
          const finalParams = { ...params };
          if (finalParams.keyword !== void 0 && finalParams.keyword !== null) {
            const keyword = finalParams.keyword;
            if (typeof keyword === "object" && !Array.isArray(keyword) && keyword.ids) {
              const ids = Array.isArray(keyword.ids) ? keyword.ids : [keyword.ids];
              if (ids.length > 0 && ids[0] !== void 0 && ids[0] !== null && ids[0] !== "") {
                finalParams.keyword = { ...keyword, domainId: ids[0] };
                delete finalParams.keyword.ids;
              } else {
                const { ids: _, ...rest } = keyword;
                finalParams.keyword = rest;
              }
            } else if (typeof keyword === "number" || typeof keyword === "string" && keyword !== "") {
              finalParams.keyword = { domainId: keyword };
            }
          }
          return baseService?.page?.(finalParams);
        },
        // 移除删除相关方法，因为不允许删除
        delete: void 0,
        deleteBatch: void 0
      };
    };
    const ticketService = service.logistics?.warehouse?.ticket;
    const wrappedTicketService = createWrappedService(ticketService);
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
    };
    const handleImport = async (data, { done, close }) => {
      try {
        const domainId = resolveSelectedDomainId();
        if (!domainId) {
          message.warning(t("inventory.dataSource.domain.selectRequired") || "请先选择左侧域");
          done();
          return;
        }
        const rows = (data?.list || data?.rows || []).map((row) => {
          const { _index, ...rest } = row || {};
          return rest;
        });
        if (!rows.length) {
          const warnMessage = data?.filename ? t("common.import.no_data_or_mapping") : t("inventory.dataSource.ticket.import.no_file");
          message.warning(warnMessage);
          done();
          return;
        }
        const normalizedRows = rows.map((row) => ({
          checkNo: row.checkNo,
          partName: row.partName,
          position: row.position,
          checkType: row.checkType,
          domainId: row.domianId || row.domainId || domainId
          // 兼容拼写错误
        }));
        const payload = {
          domainId,
          list: normalizedRows
        };
        const response = await service.logistics?.warehouse?.ticket?.import?.(payload);
        let responseData = response;
        if (response && typeof response === "object" && "data" in response) {
          responseData = response.data;
        }
        if (responseData && typeof responseData === "object" && "code" in responseData) {
          const code = responseData.code;
          if (code !== 200 && code !== 1e3 && code !== 2e3) {
            const errorMsg = responseData.msg || responseData.message || t("inventory.dataSource.ticket.import.failed");
            message.error(errorMsg);
            done();
            return;
          }
        }
        message.success(t("inventory.dataSource.ticket.import.success"));
        tableGroupRef.value?.crudRef?.refresh?.();
        close();
      } catch (error) {
        console.error("[InventoryTicket] import failed:", error);
        const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t("inventory.dataSource.ticket.import.failed");
        message.error(errorMsg);
        done();
      }
    };
    const formatDateCell = (_row, _column, value) => {
      try {
        if (!value || value === null || value === void 0) {
          return "--";
        }
        return formatDateTime(value);
      } catch (error) {
        console.warn("[InventoryTicket] Date format error:", error, value);
        return "--";
      }
    };
    const ticketColumns = computed(() => [
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "partName", label: t("system.material.fields.materialCode"), minWidth: 140 },
      { prop: "position", label: t("inventory.result.fields.storageLocation"), minWidth: 120 },
      { prop: "createdAt", label: t("system.inventory.base.fields.createdAt"), width: 180, formatter: formatDateCell }
    ]);
    const ticketExportColumns = computed(() => [
      { prop: "partName", label: t("system.material.fields.materialCode") },
      { prop: "position", label: t("inventory.result.fields.storageLocation") }
    ]);
    const handleExport = async () => {
      if (!service.logistics?.warehouse?.ticket?.export) {
        BtcMessage.error(t("platform.common.export_failed") || "导出服务不可用");
        return;
      }
      exportLoading.value = true;
      try {
        const params = tableGroupRef.value?.crudRef?.getParams?.() || {};
        const domainId = resolveSelectedDomainId();
        const exportParams = {
          keyword: {
            ...params.keyword || {},
            domainId
          },
          page: params.page,
          size: params.size,
          order: params.order,
          sort: params.sort
        };
        const response = await service.logistics.warehouse.ticket.export(exportParams);
        if (response && typeof response === "object" && "code" in response) {
          const code = response.code;
          if (code !== 200 && code !== 1e3 && code !== 2e3) {
            const errorMsg = response.msg || t("platform.common.export_failed") || "导出失败";
            BtcMessage.error(errorMsg);
            return;
          }
        }
        let dataList = [];
        if (response && typeof response === "object") {
          if ("data" in response && Array.isArray(response.data)) {
            dataList = response.data;
          } else if (Array.isArray(response)) {
            dataList = response;
          } else if ("data" in response && !Array.isArray(response.data)) {
            const errorMsg = response.msg || t("platform.common.export_failed") || "导出失败：数据格式不正确";
            BtcMessage.error(errorMsg);
            return;
          }
        }
        const exportColumns = ticketExportColumns.value;
        const header = exportColumns.map((col) => col.label || col.prop || "");
        const data = dataList && dataList.length > 0 ? dataList.map((item) => {
          return exportColumns.map((col) => {
            const value = col.prop ? item[col.prop] : void 0;
            return value ?? "";
          });
        }) : [];
        exportJsonToExcel({
          header,
          data,
          filename: exportFilename.value || "盘点票",
          autoWidth: true,
          bookType: "xlsx"
        });
        BtcMessage.success(t("platform.common.export_success"));
      } catch (error) {
        console.error("[InventoryTicket] Export failed:", error);
        const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t("platform.common.export_failed");
        BtcMessage.error(errorMsg);
      } finally {
        exportLoading.value = false;
      }
    };
    const ticketFormItems = computed(() => [
      { prop: "checkNo", label: t("system.inventory.base.fields.checkNo"), span: 12, component: { name: "el-input" }, required: true },
      { prop: "partName", label: t("system.material.fields.materialCode"), span: 12, component: { name: "el-input" }, required: true },
      { prop: "position", label: t("inventory.result.fields.storageLocation"), span: 12, component: { name: "el-input" } },
      { prop: "checkType", label: t("system.inventory.base.fields.checkType"), span: 12, component: { name: "el-input" } }
    ]);
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": unref(wrappedTicketService),
          "table-columns": ticketColumns.value,
          "form-items": ticketFormItems.value,
          "left-title": unref(t)("inventory.dataSource.domain"),
          "right-title": unref(t)("menu.inventory.dataSource.ticket"),
          "show-unassigned": false,
          "enable-key-search": false,
          "show-search-key": false,
          "left-size": "small",
          "show-add-btn": false,
          "show-multi-delete-btn": false,
          onSelect: onDomainSelect
        }, {
          "add-btn": withCtx(() => [
            createVNode(unref(BtcImportBtn), {
              "on-submit": handleImport,
              tips: unref(t)("inventory.dataSource.ticket.import.tips")
            }, null, 8, ["tips"])
          ]),
          actions: withCtx(() => [
            createVNode(_component_el_button, {
              type: "info",
              onClick: handleExport,
              loading: exportLoading.value
            }, {
              default: withCtx(() => [
                createVNode(__unplugin_components_0, {
                  name: "export",
                  class: "mr-[5px]"
                }),
                createTextVNode(" " + toDisplayString(unref(t)("ui.export")), 1)
              ]),
              _: 1
            }, 8, ["loading"])
          ]),
          _: 1
        }, 8, ["right-service", "table-columns", "form-items", "left-title", "right-title"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-664a2f96"]]);
export {
  index as default
};
