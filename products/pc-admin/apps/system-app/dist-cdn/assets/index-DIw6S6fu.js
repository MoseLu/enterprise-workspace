import { b as defineComponent, m as useI18n, i as ref, j as computed, n as createElementBlock, o as openBlock, t as createVNode, g as unref, a5 as BtcTableGroup, ae as normalizePageResponse, B as BtcMessage, a3 as BtcConfirm, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./auth-api-Df5AdCU7.js";
import "./menu-registry-BOrHQOwD.js";
import { s as service } from "./eps-service-CyhGCtaT.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "inventory-confirm-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcDataInventoryConfirm"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const tableGroupRef = ref();
    const selectedCheck = ref(null);
    const checkService = {
      list: async (params) => {
        const checkListService = service.logistics?.warehouse?.check?.list;
        if (!checkListService) {
          console.warn("[InventoryConfirm] 盘点列表接口不存在");
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
          console.error("[InventoryConfirm] 获取盘点列表失败:", error);
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
    const approvalService = {
      page: async (params) => {
        const approvalPageService = service.system?.base?.approval?.page;
        if (!approvalPageService) {
          return {
            list: [],
            total: 0
          };
        }
        try {
          const response = await approvalPageService(params || {});
          let data = response;
          if (response && typeof response === "object" && "data" in response) {
            data = response.data;
          }
          const page = params?.page || 1;
          const size = params?.size || 10;
          const normalized = normalizePageResponse(data, page, size);
          return {
            list: normalized.list,
            total: normalized.total
          };
        } catch (error) {
          console.error("[InventoryConfirm] 获取流程确认列表失败:", error);
          return {
            list: [],
            total: 0
          };
        }
      },
      list: async () => {
        return [];
      },
      get: async () => {
        return null;
      },
      add: async () => {
        return null;
      },
      update: async () => {
        return null;
      },
      delete: async () => {
        return null;
      },
      deleteBatch: async () => {
        return null;
      }
    };
    const onCheckSelect = (check) => {
      selectedCheck.value = check;
    };
    const isConfirmed = (row) => {
      const status = row?.status;
      if (!status) return false;
      const statusStr = String(status);
      return statusStr === "已确认" || statusStr.toLowerCase() === "confirmed" || statusStr === "CONFIRMED";
    };
    const handleConfirm = async (row) => {
      if (isConfirmed(row)) {
        BtcMessage.warning(t("inventory.confirm.alreadyConfirmed") || "已确认，无需再次确认！");
        return;
      }
      const id = row?.id;
      if (!id) {
        BtcMessage.warning(t("inventory.confirm.idNotFound") || "数据ID不存在");
        return;
      }
      const checkNo = row?.checkNo || selectedCheck.value?.checkNo;
      try {
        await BtcConfirm(
          t("inventory.confirm.confirmMessage") || `确定要确认流程 ${checkNo || id} 吗？`,
          t("inventory.confirm.confirmTitle") || "确认",
          {
            confirmButtonText: t("common.button.confirm") || "确定",
            cancelButtonText: t("common.button.cancel") || "取消",
            type: "warning"
          }
        );
        const confirmService = service.system?.base?.approval?.confirm;
        if (!confirmService) {
          BtcMessage.error(t("inventory.confirm.serviceNotFound") || "确认接口不存在");
          return;
        }
        const response = await confirmService({ id });
        if (response && typeof response === "object" && "code" in response) {
          if (response.code === 2e3 || response.code === 200 || response.code === 1e3) {
            BtcMessage.success(response.msg || t("inventory.confirm.success") || "确认成功");
            if (tableGroupRef.value?.crudRef) {
              tableGroupRef.value.crudRef.refresh();
            }
          } else {
            BtcMessage.error(response.msg || t("inventory.confirm.failed") || "确认失败");
          }
        } else {
          BtcMessage.success(t("inventory.confirm.success") || "确认成功");
          if (tableGroupRef.value?.crudRef) {
            tableGroupRef.value.crudRef.refresh();
          }
        }
      } catch (error) {
        if (error === "cancel" || error?.message === "cancel") {
          return;
        }
        console.error("[InventoryConfirm] 确认失败:", error);
        BtcMessage.error(error?.msg || t("inventory.confirm.failed") || "确认失败");
      }
    };
    const opConfig = computed(() => ({
      buttons: ({ scope }) => {
        const row = scope?.row;
        const confirmed = isConfirmed(row);
        return [
          {
            label: confirmed ? t("inventory.confirm.confirmed") || "已确认" : t("inventory.confirm.confirm") || "确认",
            type: confirmed ? "success" : "primary",
            onClick: ({ scope: scope2 }) => {
              handleConfirm(scope2.row);
            }
          }
        ];
      }
    }));
    const approvalColumns = computed(() => [
      { type: "selection", width: 60 },
      { type: "index", label: t("common.index"), width: 60 },
      { prop: "name", label: t("inventory.confirm.fields.name") || "名称", minWidth: 150 },
      {
        prop: "status",
        label: t("inventory.confirm.fields.status") || "状态",
        width: 120,
        dictColor: true,
        dict: [
          {
            label: t("inventory.confirm.status.confirmed") || "已确认",
            value: "已确认",
            type: "success"
          },
          {
            label: t("inventory.confirm.status.unconfirmed") || "未确认",
            value: "未确认",
            type: "info"
          },
          // 兼容英文状态值
          {
            label: t("inventory.confirm.status.confirmed") || "已确认",
            value: "confirmed",
            type: "success"
          },
          {
            label: t("inventory.confirm.status.unconfirmed") || "未确认",
            value: "unconfirmed",
            type: "info"
          },
          {
            label: t("inventory.confirm.status.confirmed") || "已确认",
            value: "CONFIRMED",
            type: "success"
          },
          {
            label: t("inventory.confirm.status.unconfirmed") || "未确认",
            value: "UNCONFIRMED",
            type: "info"
          }
        ]
      },
      { prop: "confirmer", label: t("inventory.confirm.fields.confirmer") || "确认人", width: 120 },
      { prop: "createdAt", label: t("inventory.confirm.fields.createdAt") || "确认时间", width: 180, formatter: (row) => {
        if (!row.createdAt) return "-";
        return new Date(row.createdAt).toLocaleString("zh-CN");
      } }
    ]);
    const approvalFormItems = computed(() => []);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": checkService,
          "right-service": approvalService,
          "table-columns": approvalColumns.value,
          "form-items": approvalFormItems.value,
          op: opConfig.value,
          "left-title": unref(t)("inventory.check.list"),
          "right-title": unref(t)("inventory.confirm.title"),
          "search-placeholder": unref(t)("inventory.confirm.search_placeholder"),
          "show-unassigned": false,
          "enable-key-search": true,
          "left-size": "small",
          "show-add-btn": false,
          "show-multi-delete-btn": false,
          "show-search-key": false,
          "label-field": "checkType",
          onSelect: onCheckSelect
        }, null, 8, ["table-columns", "form-items", "op", "left-title", "right-title", "search-placeholder"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1b1052a4"]]);
export {
  index as default
};
