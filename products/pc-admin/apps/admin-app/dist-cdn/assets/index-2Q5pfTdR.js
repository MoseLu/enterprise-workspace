import { a as defineComponent, b as computed, r as ref, k as onMounted, I as nextTick, ak as onActivated, e as createElementBlock, l as createVNode, w as withCtx, m as unref, j as useRoute, o as openBlock, h as createBaseVNode, D as ElButton, v as createTextVNode, al as ElInputNumber, i as _export_sfc } from "./index-CeQEKVXA.js";
import { BtcRow, BtcRefreshBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcCrud, BtcMessage, BtcConfirm } from "@btc/shared-components";
import { service } from "@services/eps";
import "@btc/shared-core";
import "@btc/shared-utils";
const _hoisted_1 = { class: "logs-root" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
const _hoisted_3 = { class: "log-keep-filter" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "RequestLog"
  },
  __name: "index",
  setup(__props) {
    const rawRequestService = service && service.admin?.log?.request;
    function normalizePageResult(res) {
      if (!res) return { list: [], total: 0 };
      const list = res.list ?? res.records ?? res.rows ?? res.data ?? (Array.isArray(res) ? res : []) ?? [];
      const total = res.total ?? res.count ?? (typeof res.pagination === "object" ? res.pagination.total : void 0) ?? 0;
      return { list, total: Number.isFinite(total) ? total : Array.isArray(list) ? list.length : 0 };
    }
    const requestService = {
      ...rawRequestService || {},
      async page(params) {
        const s = rawRequestService || {};
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
        const s = rawRequestService || {};
        try {
          let res;
          if (typeof s.list === "function") res = await s.list(params);
          else if (typeof s.page === "function") res = await s.page(params);
          else if (typeof s.query === "function") res = await s.query(params);
          else if (typeof s.search === "function") res = await s.search(params);
          const { list, total } = normalizePageResult(res);
          const pageNo2 = params?.page ?? 1;
          const pageSize = params?.size ?? list.length;
          const result = {
            list,
            total,
            page: pageNo2,
            size: pageSize,
            success: true,
            rows: list,
            records: list,
            count: total,
            data: { list, total, page: pageNo2, size: pageSize }
          };
          return result;
        } catch (err) {
          const pageNo2 = params?.page ?? 1;
          const pageSize = params?.size ?? 0;
          return { list: [], total: 0, page: pageNo2, size: pageSize, success: false, rows: [], records: [], data: { list: [], total: 0, page: pageNo2, size: pageSize } };
        }
        const pageNo = params?.page ?? 1;
        return { list: [], total: 0, page: pageNo, size: 0, success: true, rows: [], records: [], data: { list: [], total: 0, page: pageNo, size: 0 } };
      }
    };
    function onBeforeRefresh(params) {
      return params || {};
    }
    const requestColumns = computed(() => {
      const columns = [
        {
          type: "index",
          label: "#",
          width: 60
        },
        {
          label: "用户ID",
          prop: "userId",
          width: 100
        },
        {
          label: "用户昵称",
          prop: "username",
          width: 120
        },
        {
          label: "请求地址",
          prop: "requestUrl",
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          label: "请求参数",
          prop: "params",
          minWidth: 200,
          showOverflowTooltip: false,
          component: {
            name: "BtcCodeJson",
            props: {
              popover: true,
              maxLength: 500,
              // 限制显示长度
              popoverTrigger: "hover",
              teleported: true,
              popperStrategy: "fixed"
            }
          }
          // 移除 formatter，BtcCodeJson 组件已支持字符串输入
        },
        {
          label: "IP",
          prop: "ip",
          width: 150,
          formatter(row) {
            try {
              if (row.ip === null || row.ip === void 0 || typeof row.ip !== "string") {
                return "-";
              }
              if (row.ip === "") {
                return "";
              }
              const ipStr = row.ip.length > 1e3 ? row.ip.substring(0, 1e3) + "..." : row.ip;
              return ipStr.split(",").map((ip) => ip.trim()).filter((ip) => ip).join(", ");
            } catch (error) {
              console.error("IP字段格式化错误:", error);
              return "-";
            }
          }
        },
        {
          label: "耗时(ms)",
          prop: "duration",
          width: 100,
          sortable: true,
          formatter(row) {
            return row.duration ? `${row.duration}ms` : "-";
          }
        },
        {
          label: "状态",
          prop: "status",
          width: 100,
          dict: [
            { label: "成功", value: "success", type: "success" },
            { label: "失败", value: "failed", type: "danger" }
          ],
          dictColor: true
        },
        {
          label: "请求时间",
          prop: "createdAt",
          width: 170,
          sortable: true,
          fixed: "right"
        }
      ];
      return columns;
    });
    const requestCrudRef = ref();
    const tableRef = ref();
    useRoute();
    const keepDays = ref(31);
    onMounted(async () => {
      await nextTick();
      try {
        const rows = requestCrudRef.value?.tableData?.value?.length ?? requestCrudRef.value?.crud?.tableData?.value?.length;
      } catch (e) {
      }
      requestCrudRef.value?.refresh?.();
      await nextTick();
      try {
        tableRef.value?.calcMaxHeight?.();
        tableRef.value?.tableRef?.value?.doLayout?.();
      } catch {
      }
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {
      }
    });
    onActivated(async () => {
      await nextTick();
      try {
        tableRef.value?.calcMaxHeight?.();
        tableRef.value?.tableRef?.value?.doLayout?.();
      } catch {
      }
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {
      }
    });
    async function saveKeepDays() {
      try {
        BtcMessage.success("保存成功");
      } catch (err) {
        BtcMessage.error(err.message || "保存失败");
      }
    }
    function clearLogs() {
      BtcConfirm("是否要清空日志？", "提示", {
        type: "warning"
      }).then(async () => {
        try {
          BtcMessage.success("清空成功");
          requestCrudRef.value?.refresh?.();
        } catch (err) {
          BtcMessage.error(err.message || "清空失败");
        }
      }).catch(() => null);
    }
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_input_number = ElInputNumber;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcCrud), {
          ref_key: "requestCrudRef",
          ref: requestCrudRef,
          class: "request-log-page",
          service: requestService,
          "auto-load": true,
          "on-before-refresh": onBeforeRefresh
        }, {
          default: withCtx(() => [
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_2, [
                  createVNode(unref(BtcRefreshBtn)),
                  createVNode(_component_el_button, {
                    type: "danger",
                    onClick: clearLogs
                  }, {
                    default: withCtx(() => [..._cache[1] || (_cache[1] = [
                      createTextVNode(" 清空 ", -1)
                    ])]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_3, [
                  _cache[2] || (_cache[2] = createBaseVNode("span", null, "日志保存天数：", -1)),
                  createVNode(_component_el_input_number, {
                    modelValue: keepDays.value,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keepDays.value = $event),
                    min: 1,
                    max: 1e4,
                    "controls-position": "right",
                    onChange: saveKeepDays
                  }, null, 8, ["modelValue"])
                ]),
                createVNode(unref(BtcFlex1)),
                createVNode(unref(BtcSearchKey), { placeholder: "搜索请求地址、用户昵称、IP..." }),
                createVNode(unref(BtcCrudActions))
              ]),
              _: 1
            }),
            createVNode(unref(BtcRow), null, {
              default: withCtx(() => [
                createVNode(unref(BtcTable), {
                  ref_key: "tableRef",
                  ref: tableRef,
                  columns: requestColumns.value,
                  "context-menu": ["refresh"],
                  "auto-height": true,
                  border: ""
                }, null, 8, ["columns"])
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
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8cec9e20"]]);
export {
  index as default
};
