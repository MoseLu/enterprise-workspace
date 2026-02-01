import { b as defineComponent, m as useI18n, i as ref, j as computed, K as onMounted, n as createElementBlock, o as openBlock, t as createVNode, x as withCtx, E as ElButton, y as createTextVNode, _ as __unplugin_components_0, w as toDisplayString, g as unref, a5 as BtcTableGroup, aa as ElDescriptions, ab as ElDescriptionsItem, ac as formatDateTimeFriendly, ad as __unplugin_components_3, ae as normalizePageResponse, a3 as BtcConfirm, B as BtcMessage, a6 as exportJsonToExcel, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-Df5AdCU7.js";
import { u as useMessage } from "./use-message-D91LUZR4.js";
import { s as service } from "./eps-service-CyhGCtaT.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "inventory-check-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcDataInventoryCheck"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const tableGroupRef = ref();
    const selectedCheck = ref(null);
    const detailVisible = ref(false);
    const detailRow = ref(null);
    const searchForm = ref({
      partName: "",
      position: "",
      checker: ""
    });
    const positionOptions = ref([]);
    const positionLoading = ref(false);
    const exportLoading = ref(false);
    const loadPositionOptions = async () => {
      positionLoading.value = true;
      try {
        const pageService = service.logistics?.base?.position?.page;
        if (!pageService) {
          console.warn("[InventoryCheck] 仓位配置 page 服务不存在");
          positionOptions.value = [];
          return;
        }
        const response = await pageService({ page: 1, size: 1e3 });
        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (response && typeof response === "object") {
          if ("data" in response) {
            const data = response.data;
            if (Array.isArray(data)) {
              list = data;
            } else if (data && typeof data === "object") {
              list = Array.isArray(data.list) ? data.list : Array.isArray(data.data) ? data.data : [];
            }
          } else if ("list" in response) {
            list = Array.isArray(response.list) ? response.list : [];
          }
        }
        positionOptions.value = list.map((item) => {
          const position = item?.position;
          if (!position) {
            return null;
          }
          return {
            label: String(position),
            value: String(position)
          };
        }).filter((item) => item !== null);
        const uniqueMap = /* @__PURE__ */ new Map();
        positionOptions.value.forEach((item) => {
          if (!uniqueMap.has(item.value)) {
            uniqueMap.set(item.value, item);
          }
        });
        positionOptions.value = Array.from(uniqueMap.values());
        positionOptions.value.sort((a, b) => {
          return a.label.localeCompare(b.label, "zh-CN", { numeric: true, sensitivity: "base" });
        });
      } catch (error) {
        console.error("[InventoryCheck] 获取仓位选项失败:", error);
        positionOptions.value = [];
      } finally {
        positionLoading.value = false;
      }
    };
    const opButtons = computed(() => [
      {
        label: t("common.button.detail"),
        type: "warning",
        icon: "info",
        onClick: ({ scope }) => handleDetail(scope.row)
      },
      "edit"
    ]);
    const checkService = {
      list: async (params) => {
        const checkListService = service.logistics?.warehouse?.check?.list;
        if (!checkListService) {
          console.warn("[InventoryCheck] 盘点列表接口不存在");
          return {
            list: [],
            pagination: {
              total: 0,
              page: params?.page || 1,
              size: params?.size || 10
            }
          };
        }
        try {
          const response = await checkListService(params || {});
          let data = response;
          if (response && typeof response === "object" && "data" in response) {
            data = response.data;
          }
          const page = params?.page || 1;
          const size = params?.size || 10;
          const normalized = normalizePageResponse(data, page, size);
          return {
            list: normalized.list,
            pagination: normalized.pagination
          };
        } catch (error) {
          console.error("[InventoryCheck] 获取盘点列表失败:", error);
          return {
            list: [],
            pagination: {
              total: 0,
              page: params?.page || 1,
              size: params?.size || 10
            }
          };
        }
      }
    };
    const resultService = service.system?.base?.dataSource;
    const wrappedResultService = {
      ...resultService,
      async delete(id) {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        if (!resultService?.delete) {
          throw new Error("未找到删除服务接口");
        }
        await resultService.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      async deleteBatch(ids) {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        if (resultService?.deleteBatch) {
          await resultService.deleteBatch(ids);
        } else if (resultService?.delete) {
          await Promise.all(ids.map((id) => resultService.delete(id)));
        } else {
          throw new Error("未找到删除服务接口");
        }
        message.success(t("crud.message.delete_success"));
      }
    };
    const onCheckSelect = (check) => {
      selectedCheck.value = check;
    };
    const rightOpFields = computed(() => [
      {
        type: "input",
        prop: "partName",
        placeholder: t("system.material.fields.materialCode"),
        width: "150px"
      },
      {
        type: "select",
        prop: "position",
        placeholder: t("inventory.result.fields.storageLocation"),
        width: "100px",
        options: positionOptions.value,
        loading: positionLoading.value
      },
      {
        type: "input",
        prop: "checker",
        placeholder: t("system.inventory.base.fields.checkerId"),
        width: "150px"
      }
    ]);
    const handleSearch = () => {
      if (tableGroupRef.value?.crudRef?.crud) {
        const crud = tableGroupRef.value.crudRef.crud;
        crud.setParams({
          keyword: {
            partName: searchForm.value.partName || "",
            position: searchForm.value.position || "",
            checker: searchForm.value.checker || ""
          }
        });
        crud.refresh();
      }
    };
    const handleDetail = (row) => {
      detailRow.value = row;
      detailVisible.value = true;
    };
    const resultExportColumns = computed(() => [
      { prop: "checkNo", label: t("system.inventory.base.fields.checkNo") },
      { prop: "partName", label: t("system.material.fields.materialCode") },
      { prop: "partQty", label: t("inventory.result.fields.actualQty") },
      { prop: "checker", label: t("system.inventory.base.fields.checkerId") },
      { prop: "position", label: t("inventory.result.fields.storageLocation") },
      { prop: "createdAt", label: t("system.inventory.base.fields.createdAt") }
    ]);
    const handleExport = async () => {
      if (!resultService?.export) {
        BtcMessage.error(t("platform.common.export_failed") || "导出服务不可用");
        return;
      }
      exportLoading.value = true;
      try {
        const params = tableGroupRef.value?.crudRef?.getParams?.() || {};
        const viewGroup = tableGroupRef.value?.viewGroupRef;
        const selectedItem = viewGroup?.selectedItem;
        const keyword = {
          partName: searchForm.value.partName || "",
          position: searchForm.value.position || "",
          checker: searchForm.value.checker || ""
        };
        if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
          keyword.checkNo = selectedItem.checkNo;
        }
        if (params.keyword && typeof params.keyword === "object" && !Array.isArray(params.keyword)) {
          Object.assign(keyword, params.keyword);
        }
        const exportParams = {
          ...params,
          keyword
        };
        const response = await resultService.export(exportParams);
        let dataList = [];
        if (response && typeof response === "object") {
          if ("data" in response && Array.isArray(response.data)) {
            dataList = response.data;
          } else if (Array.isArray(response)) {
            dataList = response;
          }
        }
        const exportColumns = resultExportColumns.value;
        const header = exportColumns.map((col) => col.label || col.prop);
        const data = dataList && dataList.length > 0 ? dataList.map((item) => {
          return exportColumns.map((col) => {
            const value = item[col.prop];
            return value ?? "";
          });
        }) : [];
        exportJsonToExcel({
          header,
          data,
          filename: t("inventory.result.title") || "实盘数据",
          autoWidth: true,
          bookType: "xlsx"
        });
        BtcMessage.success(t("platform.common.export_success"));
      } catch (error) {
        console.error("[InventoryCheck] Export failed:", error);
        const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t("platform.common.export_failed");
        BtcMessage.error(errorMsg);
      } finally {
        exportLoading.value = false;
      }
    };
    const resultColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "partName", label: t("system.material.fields.materialCode"), minWidth: 140 },
      { prop: "partQty", label: t("inventory.result.fields.actualQty"), minWidth: 120 },
      { prop: "checker", label: t("system.inventory.base.fields.checkerId"), minWidth: 120 },
      { prop: "position", label: t("inventory.result.fields.storageLocation"), minWidth: 120 }
    ]);
    const resultFormItems = computed(() => [
      // 物料编码 - 只读
      {
        prop: "partName",
        label: t("system.material.fields.materialCode"),
        span: 12,
        component: {
          name: "el-input",
          props: {
            readonly: true
          }
        },
        required: true
      },
      // 实际数量 - 可编辑
      {
        prop: "partQty",
        label: t("inventory.result.fields.actualQty"),
        span: 12,
        component: {
          name: "el-input",
          props: {
            type: "number"
          }
        },
        required: true
      },
      // 盘点人 - 只读
      {
        prop: "checker",
        label: t("system.inventory.base.fields.checkerId"),
        span: 12,
        component: {
          name: "el-input",
          props: {
            readonly: true
          }
        },
        required: true
      },
      // 仓位 - 只读
      {
        prop: "position",
        label: t("inventory.result.fields.storageLocation"),
        span: 12,
        component: {
          name: "el-input",
          props: {
            readonly: true
          }
        },
        required: true
      }
    ]);
    onMounted(() => {
      loadPositionOptions();
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_descriptions = ElDescriptions;
      const _component_BtcDialog = __unplugin_components_3;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": checkService,
          "right-service": wrappedResultService,
          "table-columns": resultColumns.value,
          "form-items": resultFormItems.value,
          op: { buttons: opButtons.value },
          "left-title": unref(t)("inventory.check.list"),
          "right-title": unref(t)("inventory.result.title"),
          "search-placeholder": unref(t)("inventory.result.search_placeholder"),
          "show-unassigned": false,
          "enable-key-search": true,
          "left-size": "small",
          "show-add-btn": false,
          "show-multi-delete-btn": false,
          "show-search-key": false,
          "label-field": "checkType",
          "show-create-time": false,
          onSelect: onCheckSelect,
          "right-op-fields": rightOpFields.value,
          "right-op-fields-value": searchForm.value,
          "onUpdate:rightOpFieldsValue": _cache[0] || (_cache[0] = ($event) => searchForm.value = $event),
          onRightOpSearch: handleSearch
        }, {
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
        }, 8, ["table-columns", "form-items", "op", "left-title", "right-title", "search-placeholder", "right-op-fields", "right-op-fields-value"]),
        createVNode(_component_BtcDialog, {
          modelValue: detailVisible.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => detailVisible.value = $event),
          title: unref(t)("inventory.result.detail.title"),
          width: "800px",
          "append-to-body": true
        }, {
          default: withCtx(() => [
            createVNode(_component_el_descriptions, {
              column: 2,
              border: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("system.inventory.base.fields.checkNo")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.checkNo || "-"), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, { label: "流程ID" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.processId || "-"), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("system.material.fields.materialCode")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.partName || "-"), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("inventory.result.fields.actualQty")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.partQty || "-"), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("system.inventory.base.fields.checkerId")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.checker || "-"), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("inventory.result.fields.storageLocation")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.position || "-"), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("system.inventory.base.fields.createdAt")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(formatDateTimeFriendly)(detailRow.value?.createdAt)), 1)
                  ]),
                  _: 1
                }, 8, ["label"])
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["modelValue", "title"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-26f67096"]]);
export {
  index as default
};
