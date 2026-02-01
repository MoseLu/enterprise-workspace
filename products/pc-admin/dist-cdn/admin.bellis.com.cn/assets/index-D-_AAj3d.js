import { a as defineComponent, b as computed, r as ref, k as onMounted, I as nextTick, ak as onActivated, e as createElementBlock, l as createVNode, w as withCtx, m as unref, j as useRoute, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
import { BtcRow, BtcRefreshBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcCrud } from "@btc/shared-components";
import { service } from "@services/eps";
import "@btc/shared-core";
import "@btc/shared-utils";
const _hoisted_1 = { class: "logs-root" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "OpsAudit"
  },
  __name: "index",
  setup(__props) {
    useRoute();
    const rawAuditService = service.admin?.log?.operation;
    function normalizePageResult(res) {
      if (!res) return { list: [], total: 0 };
      const list = res.list ?? res.records ?? res.rows ?? res.data ?? (Array.isArray(res) ? res : []) ?? [];
      const total = res.total ?? res.count ?? (typeof res.pagination === "object" ? res.pagination.total : void 0) ?? 0;
      return { list, total: Number.isFinite(total) ? total : Array.isArray(list) ? list.length : 0 };
    }
    const auditService = {
      ...rawAuditService || {},
      async page(params) {
        const s = rawAuditService || {};
        try {
          let res;
          if (typeof s.page === "function") res = await s.page(params);
          else if (typeof s.list === "function") res = await s.list(params);
          else if (typeof s.query === "function") res = await s.query(params);
          else if (typeof s.search === "function") res = await s.search(params);
          const { list, total } = normalizePageResult(res);
          const pageNo = params?.page ?? 1;
          const pageSize = params?.size ?? list.length;
          const result = {
            list,
            total,
            page: pageNo,
            size: pageSize,
            success: true,
            rows: list,
            records: list,
            count: total,
            data: { list, total, page: pageNo, size: pageSize }
          };
          return result;
        } catch (err) {
          const pageNo = params?.page ?? 1;
          const pageSize = params?.size ?? 0;
          return { list: [], total: 0, page: pageNo, size: pageSize, success: false, rows: [], records: [], data: { list: [], total: 0, page: pageNo, size: pageSize } };
        }
      },
      async list(params) {
        const s = rawAuditService || {};
        try {
          let res;
          if (typeof s.list === "function") res = await s.list(params);
          else if (typeof s.page === "function") res = await s.page(params);
          else if (typeof s.query === "function") res = await s.query(params);
          else if (typeof s.search === "function") res = await s.search(params);
          const { list, total } = normalizePageResult(res);
          const pageNo = params?.page ?? 1;
          const pageSize = params?.size ?? list.length;
          const result = {
            list,
            total,
            page: pageNo,
            size: pageSize,
            success: true,
            rows: list,
            records: list,
            count: total,
            data: { list, total, page: pageNo, size: pageSize }
          };
          return result;
        } catch (err) {
          const pageNo = params?.page ?? 1;
          const pageSize = params?.size ?? 0;
          return { list: [], total: 0, page: pageNo, size: pageSize, success: false, rows: [], records: [], data: { list: [], total: 0, page: pageNo, size: pageSize } };
        }
        return { list: [], total: 0, page: params?.page ?? 1, size: 0, success: true };
      }
    };
    function onBeforeRefresh(params) {
      return params || {};
    }
    const auditColumns = computed(() => [
      { label: "操作人", prop: "username", width: 120 },
      {
        label: "操作类型",
        prop: "operationType",
        width: 120,
        dict: [
          { label: "查询", value: "SELECT", type: "info" },
          { label: "新增", value: "INSERT", type: "success" },
          { label: "更新", value: "UPDATE", type: "warning" },
          { label: "删除", value: "DELETE", type: "danger" }
        ],
        dictColor: true
      },
      { label: "操作资源", prop: "tableName", width: 150, showOverflowTooltip: true },
      { label: "IP地址", prop: "ipAddress", width: 120 },
      { label: "操作描述", prop: "operationDesc", minWidth: 180, showOverflowTooltip: true },
      {
        label: "操作数据",
        prop: "beforeData",
        width: 150,
        showOverflowTooltip: false,
        component: { name: "BtcCodeJson", props: { popover: true, maxLength: 500, popoverTrigger: "hover", teleported: true, popperStrategy: "fixed" } }
      },
      { prop: "createdAt", label: "操作时间", width: 170, sortable: true, fixed: "right" }
    ]);
    const auditCrudRef = ref();
    const auditTableRef = ref();
    const tableMaxHeight = ref(400);
    function computeTableMaxHeight(tag = "compute") {
      try {
        const root = auditCrudRef.value?.$el || null;
        if (!root) {
          return;
        }
        const rect = root.getBoundingClientRect();
        const rows = Array.from(root.querySelectorAll(".btc-crud-row"));
        const headerRow = rows[0];
        const footerRow = rows.length > 1 ? rows[rows.length - 1] : void 0;
        const headerH = headerRow ? headerRow.getBoundingClientRect().height : 0;
        const footerH = footerRow ? footerRow.getBoundingClientRect().height : 0;
        const paddingTop = parseFloat(getComputedStyle(root).paddingTop || "0");
        const paddingBottom = parseFloat(getComputedStyle(root).paddingBottom || "0");
        const available = Math.max(0, rect.height - headerH - footerH - paddingTop - paddingBottom);
        tableMaxHeight.value = Math.max(120, Math.floor(available));
      } catch (e) {
      }
    }
    function logTableSize(tag) {
      try {
        const crudEl = auditCrudRef.value?.$el || null;
        const tableVm = auditTableRef.value?.tableRef?.value || null;
        const tableEl = tableVm?.$el ?? null;
        const maxH = auditTableRef.value?.maxHeight?.value ?? null;
        const crudRect = crudEl ? crudEl.getBoundingClientRect() : null;
        const tableRect = tableEl ? tableEl.getBoundingClientRect() : null;
      } catch (e) {
      }
    }
    onMounted(async () => {
      await nextTick();
      computeTableMaxHeight("after-mount-compute");
      try {
        const rows = auditCrudRef.value?.tableData?.value?.length ?? auditCrudRef.value?.crud?.tableData?.value?.length;
      } catch (e) {
      }
      auditCrudRef.value?.refresh?.();
      await nextTick();
      computeTableMaxHeight("after-activate-compute");
      try {
        auditTableRef.value?.calcMaxHeight?.();
        auditTableRef.value?.tableRef?.value?.doLayout?.();
      } catch {
      }
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {
      }
      await nextTick();
      logTableSize();
    });
    onActivated(async () => {
      await nextTick();
      try {
        auditTableRef.value?.calcMaxHeight?.();
        auditTableRef.value?.tableRef?.value?.doLayout?.();
      } catch {
      }
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {
      }
      await nextTick();
      logTableSize();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "auditCrudRef",
          ref: auditCrudRef,
          service: auditService,
          "on-before-refresh": onBeforeRefresh,
          "auto-load": true,
          style: { "flex": "1", "min-height": "0" }
        }, {
          default: withCtx(() => [
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcRefreshBtn)),
                createVNode(unref(BtcFlex1)),
                createVNode(unref(BtcSearchKey), { placeholder: "搜索操作日志..." }),
                createVNode(unref(BtcCrudActions))
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcTable), {
                  ref_key: "auditTableRef",
                  ref: auditTableRef,
                  columns: auditColumns.value,
                  border: "",
                  "auto-height": false,
                  "max-height": tableMaxHeight.value
                }, null, 8, ["columns", "max-height"])
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcFlex1)),
                createVNode(unref(BtcPagination))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 512)
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d492eccd"]]);
export {
  index as default
};
