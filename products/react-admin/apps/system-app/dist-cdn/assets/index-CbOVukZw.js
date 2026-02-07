import { u as useMessage } from "./use-message-D91LUZR4.js";
import { b as defineComponent, m as useI18n, i as ref, j as computed, n as createElementBlock, o as openBlock, t as createVNode, x as withCtx, E as ElButton, y as createTextVNode, _ as __unplugin_components_0, w as toDisplayString, g as unref, a4 as BtcImportBtn, a5 as BtcTableGroup, B as BtcMessage, a6 as exportJsonToExcel, a7 as provide, a8 as IMPORT_FORBIDDEN_KEYWORDS_KEY, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-Df5AdCU7.js";
import { s as service } from "./eps-service-CyhGCtaT.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "inventory-bom-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcDataInventoryBom"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const tableGroupRef = ref();
    const selectedDomain = ref(null);
    const exportLoading = ref(false);
    const exportFilename = computed(() => t("menu.inventory.dataSource.bom"));
    provide(IMPORT_FORBIDDEN_KEYWORDS_KEY, ["SysPro", "BOM表", "(", ")", "（", "）"]);
    const domainService = {
      list: async () => {
        try {
          const response = await service.logistics?.base?.position?.me?.();
          let data = response;
          if (response && typeof response === "object" && "data" in response) {
            data = response.data;
          }
          const list = Array.isArray(data) ? data : data?.list || [];
          const firstItem = list[0];
          const isDomainList = firstItem && (firstItem.domianId || firstItem.domainId);
          if (isDomainList) {
            const domainMap = /* @__PURE__ */ new Map();
            list.forEach((item) => {
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
          } else {
            const domainMap = /* @__PURE__ */ new Map();
            list.forEach((item) => {
              const domainId = item.domainId;
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
          }
        } catch (error) {
          console.error("[InventoryBom] Failed to load domains from position service:", error);
          return [];
        }
      }
    };
    const bomService = service.system?.base?.bom;
    const wrappedBomService = {
      ...bomService,
      // 包装 page 方法，将左侧选中的域 ID 转换为 keyword.domainId
      // EPS 层会自动根据 search 配置封装其他字段到 keyword 对象中
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
        return bomService?.page?.(finalParams);
      },
      // 移除删除相关方法，因为不允许删除
      delete: void 0,
      deleteBatch: void 0
    };
    const onDomainSelect = (domain) => {
      selectedDomain.value = domain;
    };
    const resolveSelectedDomainId = () => {
      const domain = selectedDomain.value;
      if (!domain) {
        return null;
      }
      return domain.domainId ?? domain.id ?? domain.domainCode ?? domain.value ?? domain.code ?? null;
    };
    const handleImport = async (data, { done, close }) => {
      try {
        const rows = (data?.list || data?.rows || []).map((row) => {
          const { _index, ...rest } = row || {};
          return rest;
        });
        if (!rows.length) {
          const warnMessage = data?.filename ? t("common.import.no_data_or_mapping") : t("inventory.dataSource.bom.import.no_file");
          message.warning(warnMessage);
          done();
          return;
        }
        const domainId = resolveSelectedDomainId();
        if (!domainId) {
          message.warning(t("inventory.dataSource.domain.selectRequired") || "请先选择左侧域");
          done();
          return;
        }
        const normalizedRows = rows.map((row) => ({
          processId: row.processId,
          checkNo: row.checkNo,
          domainId: row.domainId ?? domainId,
          parentNode: row.parentNode,
          childNode: row.childNode,
          childQty: row.childQty ? Number(row.childQty) : void 0,
          checkType: row.checkType,
          remark: row.remark
        }));
        const payload = {
          domainId,
          list: normalizedRows
        };
        const response = await service.system?.base?.bom?.import?.(payload);
        let responseData = response;
        if (response && typeof response === "object" && "data" in response) {
          responseData = response.data;
        }
        if (responseData && typeof responseData === "object" && "code" in responseData) {
          const code = responseData.code;
          if (code !== 200 && code !== 1e3 && code !== 2e3) {
            const errorMsg = responseData.msg || responseData.message || t("inventory.dataSource.bom.import.failed");
            message.error(errorMsg);
            done();
            return;
          }
        }
        message.success(t("inventory.dataSource.bom.import.success"));
        tableGroupRef.value?.crudRef?.crud?.refresh();
        close();
      } catch (error) {
        console.error("[InventoryBom] import failed:", error);
        const errorMsg = error?.response?.data?.msg || error?.msg || t("inventory.dataSource.bom.import.failed");
        message.error(errorMsg);
        done();
      }
    };
    const bomColumns = computed(() => [
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "childNode", label: t("inventory.dataSource.bom.fields.componentName"), minWidth: 160, showOverflowTooltip: true },
      { prop: "parentNode", label: t("inventory.dataSource.bom.fields.materialCodeName"), minWidth: 140, showOverflowTooltip: true },
      { prop: "childQty", label: t("inventory.dataSource.bom.fields.componentTotalQty"), width: 120 }
    ]);
    const bomExportColumns = computed(() => [
      { prop: "childNode", label: t("inventory.dataSource.bom.fields.componentName") },
      { prop: "parentNode", label: t("inventory.dataSource.bom.fields.materialCodeName") },
      { prop: "childQty", label: t("inventory.dataSource.bom.fields.componentTotalQty") }
    ]);
    const handleExport = async () => {
      if (!service.system?.base?.bom?.export) {
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
        const response = await service.system.base.bom.export(exportParams);
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
        const exportColumns = bomExportColumns.value;
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
          filename: exportFilename.value || "物料构成",
          autoWidth: true,
          bookType: "xlsx"
        });
        BtcMessage.success(t("platform.common.export_success"));
      } catch (error) {
        console.error("[InventoryBom] Export failed:", error);
        const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t("platform.common.export_failed");
        BtcMessage.error(errorMsg);
      } finally {
        exportLoading.value = false;
      }
    };
    const bomFormItems = computed(() => [
      {
        prop: "parentNode",
        label: t("inventory.dataSource.bom.fields.parentNode"),
        span: 12,
        required: true,
        component: { name: "el-input", props: { maxlength: 120 } }
      },
      {
        prop: "childNode",
        label: t("inventory.dataSource.bom.fields.childNode"),
        span: 12,
        required: true,
        component: { name: "el-input", props: { maxlength: 120 } }
      },
      {
        prop: "childQty",
        label: t("inventory.dataSource.bom.fields.childQty"),
        span: 12,
        required: true,
        component: { name: "el-input-number", props: { min: 0, precision: 2 } }
      },
      {
        prop: "checkType",
        label: t("inventory.dataSource.bom.fields.checkType"),
        span: 12,
        component: { name: "el-input", props: { maxlength: 120 } }
      },
      {
        prop: "domainId",
        label: t("inventory.dataSource.bom.fields.domainId"),
        span: 12,
        component: { name: "el-input", props: { disabled: true } },
        hook: {
          onInit: (value, formData) => {
            formData.domainId = resolveSelectedDomainId() ?? formData.domainId;
          }
        }
      },
      {
        prop: "processId",
        label: t("inventory.dataSource.bom.fields.processId"),
        span: 12,
        component: { name: "el-input", props: { maxlength: 120 } }
      },
      {
        prop: "checkNo",
        label: t("inventory.dataSource.bom.fields.checkNo"),
        span: 12,
        component: { name: "el-input", props: { maxlength: 120 } }
      }
    ]);
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": wrappedBomService,
          "table-columns": bomColumns.value,
          "form-items": bomFormItems.value,
          "left-title": unref(t)("inventory.dataSource.domain"),
          "right-title": unref(t)("menu.inventory.dataSource.bom"),
          "show-unassigned": false,
          "enable-key-search": false,
          "left-size": "small",
          "show-add-btn": false,
          "show-multi-delete-btn": false,
          "show-search-key": false,
          "show-toolbar": true,
          onSelect: onDomainSelect
        }, {
          "add-btn": withCtx(() => [
            createVNode(unref(BtcImportBtn), {
              columns: bomColumns.value,
              "on-submit": handleImport
            }, null, 8, ["columns"])
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
        }, 8, ["table-columns", "form-items", "left-title", "right-title"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d9e1ed18"]]);
export {
  index as default
};
