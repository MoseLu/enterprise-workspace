import { CommonColumns, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcImportBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert, BtcCrud, BtcConfirm } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, k as onMounted, y as onBeforeUnmount, x as createBlock, w as withCtx, m as unref, o as openBlock, l as createVNode, h as createBaseVNode } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "btc-crud-primary-actions" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const crudRef = ref();
    const tableRef = ref();
    let detachCrudRefreshListener = null;
    const departmentService = service.admin?.iam?.department;
    const departmentOptions = ref([]);
    const loadDepartmentOptions = async () => {
      try {
        const res = await departmentService.list({});
        let dataArray = [];
        if (res && res.list) {
          dataArray = res.list;
        } else if (res && res.data && res.data.list) {
          dataArray = res.data.list;
        } else if (Array.isArray(res)) {
          dataArray = res;
        }
        const processedData = dataArray.filter((dept) => dept.id != null && dept.name && dept.parentId === "0").map((dept) => ({
          label: dept.name,
          value: dept.id
        }));
        departmentOptions.value = processedData;
      } catch (_error) {
        console.error("加载部门选项失败:", _error);
        departmentOptions.value = [];
      }
    };
    const wrappedDepartmentService = {
      ...departmentService,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await departmentService.delete(id);
        message.success(t("crud.message.delete_success"));
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), { type: "warning" });
        await departmentService.deleteBatch(ids);
        message.success(t("crud.message.delete_success"));
      }
    };
    function resolveDepartmentImportFn() {
      const candidates = ["import", "importBatch", "importExcel"];
      for (const name of candidates) {
        const fn = departmentService?.[name];
        if (typeof fn === "function") {
          return fn;
        }
      }
      return null;
    }
    const handleImport = async (payload, helpers) => {
      const { done, close } = helpers ?? {};
      const rows = Array.isArray(payload?.list) ? payload.list.filter(Boolean) : [];
      if (rows.length === 0) {
        message.warning(t("org.departments.import_empty") || "导入数据为空，请检查模板内容");
        done?.();
        return;
      }
      const importFn = resolveDepartmentImportFn();
      if (!importFn) {
        message.warning(t("org.departments.import_unsupported") || "当前环境未配置部门导入接口");
        done?.();
        return;
      }
      try {
        await importFn(rows);
        message.success(t("org.departments.import_success") || "导入成功");
        done?.();
        close?.();
        crudRef.value?.crud?.refresh?.();
      } catch (error) {
        console.error("[Departments] 导入失败", error);
        message.error(t("org.departments.import_failed") || "导入失败，请检查文件格式或内容");
        done?.(error);
      }
    };
    const columns = computed(() => [
      CommonColumns.selection(),
      CommonColumns.index(),
      { prop: "name", label: "部门名称", minWidth: 150 },
      { prop: "deptCode", label: "部门编码", width: 120 },
      {
        prop: "parentId",
        label: "上级部门",
        width: 120,
        formatter: (row) => {
          if (!row.parentId || row.parentId === "0") return "";
          if (typeof row.parentId === "string" && isNaN(Number(row.parentId)) && !row.parentId.match(/^[A-Z0-9-]+$/)) {
            return row.parentId;
          }
          const parentDept = departmentOptions.value.find((dept) => dept.value === row.parentId);
          return parentDept ? parentDept.label : row.parentId;
        }
      },
      { prop: "sort", label: "排序", width: 80 }
    ]);
    const formItems = computed(() => [
      { prop: "name", label: "部门名称", span: 12, required: true, component: { name: "el-input" } },
      { prop: "deptCode", label: "部门编码", span: 12, required: true, component: { name: "el-input" } },
      {
        prop: "parentId",
        label: "上级部门",
        span: 12,
        component: {
          name: "el-select",
          props: {
            placeholder: "请选择上级部门",
            clearable: true,
            filterable: true
          },
          options: departmentOptions.value
        },
        // 使用 hook 进行数据转换
        hook: {
          bind: (value) => {
            if (typeof value === "string" && isNaN(Number(value)) && !value.match(/^[A-Z0-9-]+$/)) {
              const dept = departmentOptions.value.find((d) => d.label === value);
              return dept ? dept.value : value;
            }
            return value;
          },
          submit: (value) => {
            return value;
          }
        }
      },
      {
        prop: "sort",
        label: "排序",
        span: 12,
        value: 0,
        component: {
          name: "el-input-number",
          props: { min: 0, style: { width: "100%" } }
        }
      }
    ]);
    onMounted(async () => {
      await loadDepartmentOptions();
      const mitt = crudRef.value?.crud?.mitt;
      if (mitt) {
        const handleRefresh = () => {
          loadDepartmentOptions();
        };
        mitt.on("crud.refresh", handleRefresh);
        detachCrudRefreshListener = () => {
          mitt.off("crud.refresh", handleRefresh);
        };
      }
    });
    onBeforeUnmount(() => {
      detachCrudRefreshListener?.();
      detachCrudRefreshListener = null;
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(BtcCrud), {
        ref_key: "crudRef",
        ref: crudRef,
        service: wrappedDepartmentService
      }, {
        default: withCtx(() => [
          createVNode(unref(BtcRow), null, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_1, [
                createVNode(unref(BtcRefreshBtn)),
                createVNode(unref(BtcAddBtn)),
                createVNode(unref(BtcMultiDeleteBtn)),
                createVNode(unref(BtcImportBtn), {
                  template: "/templates/departments.xlsx",
                  tips: unref(t)("org.departments.import_tips"),
                  "on-submit": handleImport
                }, null, 8, ["tips"])
              ]),
              createVNode(unref(BtcFlex1)),
              createVNode(unref(BtcSearchKey), { placeholder: "搜索部门" }),
              createVNode(unref(BtcCrudActions), null, {
                default: withCtx(() => [
                  createVNode(unref(BtcExportBtn), {
                    filename: unref(t)("org.departments.title")
                  }, null, 8, ["filename"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          createVNode(unref(BtcRow), null, {
            default: withCtx(() => [
              createVNode(unref(BtcTable), {
                ref_key: "tableRef",
                ref: tableRef,
                columns: columns.value,
                op: { buttons: ["edit", "delete"] },
                "context-menu": ["refresh"],
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
          }),
          createVNode(unref(BtcUpsert), {
            ref: "upsertRef",
            items: formItems.value,
            width: "800px"
          }, null, 8, ["items"])
        ]),
        _: 1
      }, 512);
    };
  }
});
export {
  _sfc_main as default
};
