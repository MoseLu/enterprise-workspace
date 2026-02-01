import { b as defineComponent, m as useI18n, i as ref, j as computed, n as createElementBlock, o as openBlock, t as createVNode, x as withCtx, af as _sfc_main$1, ag as _sfc_main$2, ah as _sfc_main$3, ai as _sfc_main$4, aj as __unplugin_components_1, ak as _sfc_main$5, al as _sfc_main$6, am as __unplugin_components_5, an as _sfc_main$7, ao as __unplugin_components_9, ap as _sfc_main$8, z as _export_sfc } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-Df5AdCU7.js";
import { s as service } from "./eps-service-CyhGCtaT.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "dictionary-file-categories" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "DictionaryFileCategories"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const crudRef = ref();
    const tableRef = ref();
    const upsertRef = ref();
    const epsCategoryService = service.upload?.file?.category;
    function ensureMethod(method) {
      const fn = epsCategoryService?.[method];
      if (typeof fn !== "function") {
        throw new Error(`[DictionaryFileCategories] EPS 服务 upload.file.category.${method} 未加载，请先同步 EPS 元数据`);
      }
      return fn;
    }
    function normalizePageResponse(response, page, size) {
      if (!response) {
        return {
          list: [],
          total: 0,
          pagination: { page, size, total: 0 }
        };
      }
      if (Array.isArray(response.list) && response.pagination) {
        const { pagination } = response;
        const total = Number(
          pagination.total ?? pagination.count ?? response.total ?? response.pagination?.total ?? 0
        );
        return {
          list: response.list,
          total,
          pagination: {
            page: Number(pagination.page ?? page),
            size: Number(pagination.size ?? size),
            total
          }
        };
      }
      if (Array.isArray(response.records)) {
        const total = Number(response.total ?? response.pagination?.total ?? 0);
        return {
          list: response.records,
          total,
          pagination: {
            page: Number(response.current ?? page),
            size: Number(response.size ?? size),
            total
          }
        };
      }
      if (Array.isArray(response.list) && typeof response.total !== "undefined") {
        return {
          list: response.list,
          total: Number(response.total ?? 0),
          pagination: {
            page,
            size,
            total: Number(response.total ?? 0)
          }
        };
      }
      if (Array.isArray(response)) {
        return {
          list: response,
          total: response.length,
          pagination: { page, size, total: response.length }
        };
      }
      return {
        list: [],
        total: 0,
        pagination: { page, size, total: 0 }
      };
    }
    const categoryService = {
      async page(params = {}) {
        const page = Number(params.page ?? 1);
        const size = Number(params.size ?? 20);
        const keyword = params.keyword ? String(params.keyword) : void 0;
        const payload = { page, size };
        if (keyword) {
          payload.keyword = keyword;
        }
        const pageFn = ensureMethod("page");
        const response = await pageFn(payload);
        const normalized = normalizePageResponse(response, page, size);
        return {
          list: normalized.list,
          total: normalized.total,
          pagination: normalized.pagination
        };
      },
      async add(data) {
        const addFn = ensureMethod("add");
        await addFn(data);
      },
      async update(data) {
        const updateFn = ensureMethod("update");
        await updateFn(data);
      },
      async delete(id) {
        const deleteFn = ensureMethod("delete");
        await deleteFn(id);
      },
      async deleteBatch(ids) {
        const deleteFn = ensureMethod("delete");
        await Promise.all(ids.map((id) => deleteFn(id)));
      }
    };
    const columns = computed(() => [
      { type: "selection" },
      { label: t("dictionary.fileCategories.code"), prop: "category", minWidth: 140, showOverflowTooltip: true },
      { label: t("dictionary.fileCategories.label"), prop: "categoryLabel", minWidth: 160, showOverflowTooltip: true },
      { label: t("dictionary.fileCategories.mime"), prop: "mime", minWidth: 160, showOverflowTooltip: true },
      { label: t("dictionary.fileCategories.createdAt"), prop: "createdAt", width: 170 },
      { label: t("dictionary.fileCategories.updatedAt"), prop: "updatedAt", width: 170 }
    ]);
    const formItems = computed(() => [
      {
        label: t("dictionary.fileCategories.code"),
        prop: "category",
        required: true,
        component: {
          name: "el-input",
          props: {
            maxlength: 60,
            placeholder: t("dictionary.fileCategories.codePlaceholder")
          }
        }
      },
      {
        label: t("dictionary.fileCategories.label"),
        prop: "categoryLabel",
        required: true,
        component: {
          name: "el-input",
          props: {
            maxlength: 60,
            placeholder: t("dictionary.fileCategories.labelPlaceholder")
          }
        }
      },
      {
        label: t("dictionary.fileCategories.mime"),
        prop: "mime",
        component: {
          name: "el-input",
          props: {
            maxlength: 255,
            placeholder: t("dictionary.fileCategories.mimePlaceholder")
          }
        }
      }
    ]);
    return (_ctx, _cache) => {
      const _component_btc_refresh_btn = _sfc_main$2;
      const _component_btc_add_btn = _sfc_main$3;
      const _component_btc_multi_delete_btn = _sfc_main$4;
      const _component_btc_flex1 = __unplugin_components_1;
      const _component_btc_search_key = _sfc_main$5;
      const _component_btc_crud_actions = _sfc_main$6;
      const _component_btc_row = _sfc_main$1;
      const _component_btc_table = __unplugin_components_5;
      const _component_btc_pagination = _sfc_main$7;
      const _component_btc_upsert = __unplugin_components_9;
      const _component_btc_crud = _sfc_main$8;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_btc_crud, {
          ref_key: "crudRef",
          ref: crudRef,
          service: categoryService
        }, {
          default: withCtx(() => [
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_refresh_btn),
                createVNode(_component_btc_add_btn),
                createVNode(_component_btc_multi_delete_btn),
                createVNode(_component_btc_flex1),
                createVNode(_component_btc_search_key),
                createVNode(_component_btc_crud_actions)
              ]),
              _: 1
            }),
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_table, {
                  ref_key: "tableRef",
                  ref: tableRef,
                  columns: columns.value,
                  border: "",
                  op: { buttons: ["edit", "delete"] }
                }, null, 8, ["columns"])
              ]),
              _: 1
            }),
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_flex1),
                createVNode(_component_btc_pagination)
              ]),
              _: 1
            }),
            createVNode(_component_btc_upsert, {
              ref_key: "upsertRef",
              ref: upsertRef,
              items: formItems.value,
              width: "520px"
            }, null, 8, ["items"])
          ]),
          _: 1
        }, 512)
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8d739502"]]);
export {
  index as default
};
