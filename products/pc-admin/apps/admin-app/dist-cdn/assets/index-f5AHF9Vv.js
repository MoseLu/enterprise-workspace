import { a as defineComponent, b as computed, r as ref, k as onMounted, e as createElementBlock, l as createVNode, h as createBaseVNode, w as withCtx, aX as withDirectives, aY as vLoading, x as createBlock, a1 as ElTable, b0 as zhCn, b1 as English, o as openBlock, R as ElInput, E as ElIcon, m as unref, T as search_default, V as ElTableColumn, s as ElTag, v as createTextVNode, t as toDisplayString, L as createCommentVNode, D as ElButton, b2 as ElConfigProvider, aZ as ElPagination, _ as __vitePreload, i as _export_sfc } from "./index-CeQEKVXA.js";
import { BtcRow, BtcFlex1 } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@/services/eps";
import { e as empty } from "./virtual-eps-empty-DC-cChfU.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "api-test-center" };
const _hoisted_2 = { class: "test-table" };
const _hoisted_3 = { key: 0 };
const _hoisted_4 = { key: 0 };
const _hoisted_5 = { key: 0 };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const message = useMessage();
    const { locale } = useI18n();
    const elLocale = computed(() => {
      const currentLocale = locale.value || "zh-CN";
      return currentLocale === "zh-CN" ? zhCn : English;
    });
    const searchKeyword = ref("");
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const filteredTestCases = computed(() => {
      if (!searchKeyword.value) {
        return testCases.value;
      }
      const keyword = searchKeyword.value.toLowerCase();
      return testCases.value.filter(
        (test) => test.code.toString().includes(keyword) || test.name.toLowerCase().includes(keyword) || test.description.toLowerCase().includes(keyword)
      );
    });
    const paginatedTestCases = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredTestCases.value.slice(start, end);
    });
    const testCases = ref([]);
    function generateTestCases() {
      const cases = [];
      if (empty?.list && Array.isArray(empty.list)) {
        const testEntity = empty.list.find(
          (entity) => entity.moduleKey === "admin.test" || entity.module === "admin.test" || entity.prefix && entity.prefix.includes("/api/system/test/")
        );
        if (testEntity && testEntity.api && Array.isArray(testEntity.api)) {
          testEntity.api.forEach((api) => {
            let code = null;
            if (api.name && /^\d+$/.test(api.name)) {
              code = parseInt(api.name);
            } else {
              const codeMatch = api.path?.match(/\/(\d+)$/);
              code = codeMatch ? parseInt(codeMatch[1]) : null;
            }
            if (code && api.name) {
              cases.push({
                code,
                name: api.summary || api.name,
                // 使用summary作为标题，如果没有则使用name
                description: `测试${code}错误码处理`,
                method: api.name,
                // 使用API的name作为方法名（如"510", "501", "511"）
                loading: false,
                success: false,
                error: false,
                result: null,
                duration: 0
              });
            }
          });
        }
      }
      cases.push({
        code: 404,
        name: "404测试接口",
        description: "测试404错误处理（后端不存在此接口）",
        method: "test404",
        // 这个方法在后端不存在
        isCustomRequest: true,
        // 标记为自定义请求
        customPath: "/api/system/test/404",
        // 自定义请求路径
        loading: false,
        success: false,
        error: false,
        result: null,
        duration: 0
      });
      cases.push({
        code: 999,
        name: "响应拦截器测试",
        description: "测试响应拦截器是否正常工作（请求已知存在的接口）",
        method: "testInterceptor",
        // 这个方法在后端不存在
        isCustomRequest: true,
        // 标记为自定义请求
        customPath: "/api/system/user/page",
        // 请求一个已知存在的接口
        loading: false,
        success: false,
        error: false,
        result: null,
        duration: 0
      });
      cases.sort((a, b) => a.code - b.code);
      return cases;
    }
    const handleCurrentChange = (currentRow, oldCurrentRow) => {
    };
    const runTest = async (test) => {
      test.loading = true;
      test.success = false;
      test.error = false;
      test.result = null;
      const startTime = Date.now();
      try {
        let result;
        if (test.isCustomRequest) {
          const { requestAdapter, recreateResponseInterceptor } = await __vitePreload(async () => {
            const { requestAdapter: requestAdapter2, recreateResponseInterceptor: recreateResponseInterceptor2 } = await import("@/utils/requestAdapter");
            return { requestAdapter: requestAdapter2, recreateResponseInterceptor: recreateResponseInterceptor2 };
          }, true ? [] : void 0);
          recreateResponseInterceptor();
          result = await requestAdapter.get(test.customPath);
        } else {
          if (!service.admin) {
            throw new Error("admin服务不存在");
          }
          if (!service.admin.test) {
            throw new Error("test服务不存在");
          }
          if (!service.admin.test[test.method]) {
            throw new Error(`方法 ${test.method} 不存在`);
          }
          result = await service.admin.test[test.method]();
        }
        const duration = Date.now() - startTime;
        test.duration = duration;
        test.result = result;
        test.success = true;
        message.success(`测试 ${test.name} 完成`);
      } catch (error) {
        const duration = Date.now() - startTime;
        test.duration = duration;
        test.result = {
          error: error.message,
          code: error.code || error.response?.status,
          msg: error.response?.data?.msg || error.message,
          response: error.response?.data
        };
        test.error = true;
        if (error.message === "请求的资源不存在" || error.response?.status === 404 || error.code === 404) {
          test.result.msg = "请求的资源不存在，请检查访问路径是否正确";
          test.result.code = 404;
        }
        if (error.response?.data?.code === 200 && error.response?.data?.msg) {
          test.result.msg = error.response.data.msg;
          test.result.code = 200;
        }
      } finally {
        test.loading = false;
      }
    };
    onMounted(() => {
      testCases.value = generateTestCases();
    });
    return (_ctx, _cache) => {
      const _component_BtcFlex1 = BtcFlex1;
      const _component_el_icon = ElIcon;
      const _component_el_input = ElInput;
      const _component_BtcRow = BtcRow;
      const _component_el_tag = ElTag;
      const _component_el_table_column = ElTableColumn;
      const _component_el_button = ElButton;
      const _component_el_table = ElTable;
      const _component_el_pagination = ElPagination;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_BtcRow, { class: "search-row" }, {
          default: withCtx(() => [
            createVNode(_component_BtcFlex1),
            createVNode(_component_el_input, {
              modelValue: searchKeyword.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
              placeholder: "搜索错误码...",
              clearable: "",
              class: "search-input",
              style: { "width": "240px" }
            }, {
              prefix: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(search_default))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["modelValue"])
          ]),
          _: 1
        }),
        createBaseVNode("div", _hoisted_2, [
          withDirectives((openBlock(), createBlock(_component_el_table, {
            data: paginatedTestCases.value,
            border: "",
            style: { "width": "100%" },
            "highlight-current-row": "",
            onCurrentChange: handleCurrentChange
          }, {
            default: withCtx(() => [
              createVNode(_component_el_table_column, {
                prop: "code",
                label: "错误码",
                width: "100",
                align: "center"
              }, {
                default: withCtx(({ row }) => [
                  createVNode(_component_el_tag, {
                    type: "primary",
                    size: "small"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(row.code), 1)
                    ]),
                    _: 2
                  }, 1024)
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                prop: "name",
                label: "接口名称",
                "min-width": "200",
                align: "center"
              }),
              createVNode(_component_el_table_column, {
                label: "返回代码",
                width: "180",
                align: "center"
              }, {
                default: withCtx(({ row }) => [
                  row.result ? (openBlock(), createElementBlock("div", _hoisted_3, [
                    createVNode(_component_el_tag, {
                      type: row.success ? "success" : "danger",
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(row.success ? "200" : row.result.code || "Error"), 1)
                      ]),
                      _: 2
                    }, 1032, ["type"])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                label: "返回信息",
                "min-width": "300",
                align: "center"
              }, {
                default: withCtx(({ row }) => [
                  row.result ? (openBlock(), createElementBlock("div", _hoisted_4, [
                    createVNode(_component_el_tag, {
                      type: row.success ? "success" : "danger",
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(row.success ? "请求成功" : row.result.msg || row.result.error || "请求失败"), 1)
                      ]),
                      _: 2
                    }, 1032, ["type"])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                label: "耗时",
                width: "120",
                align: "center"
              }, {
                default: withCtx(({ row }) => [
                  row.duration ? (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(row.duration) + "ms", 1)) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode(_component_el_table_column, {
                label: "操作",
                width: "120",
                align: "center",
                fixed: "right"
              }, {
                default: withCtx(({ row }) => [
                  createVNode(_component_el_button, {
                    type: "primary",
                    size: "small",
                    loading: row.loading,
                    onClick: ($event) => runTest(row)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(row.loading ? "测试中..." : "开始测试"), 1)
                    ]),
                    _: 2
                  }, 1032, ["loading", "onClick"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["data"])), [
            [_directive_loading, loading.value]
          ]),
          createVNode(_component_BtcRow, { class: "pagination-row" }, {
            default: withCtx(() => [
              createVNode(_component_BtcFlex1),
              createVNode(unref(ElConfigProvider), { locale: elLocale.value }, {
                default: withCtx(() => [
                  createVNode(_component_el_pagination, {
                    "current-page": currentPage.value,
                    "onUpdate:currentPage": _cache[1] || (_cache[1] = ($event) => currentPage.value = $event),
                    "page-size": pageSize.value,
                    "onUpdate:pageSize": _cache[2] || (_cache[2] = ($event) => pageSize.value = $event),
                    "page-sizes": [10, 20, 50, 100],
                    total: filteredTestCases.value.length,
                    layout: "total, sizes, prev, pager, next, jumper",
                    background: ""
                  }, null, 8, ["current-page", "page-size", "total"])
                ]),
                _: 1
              }, 8, ["locale"])
            ]),
            _: 1
          })
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cb5cdce2"]]);
export {
  index as default
};
