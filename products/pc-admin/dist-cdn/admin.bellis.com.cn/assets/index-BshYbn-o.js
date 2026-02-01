import { BtcTableGroup } from "@btc/shared-components";
import { g as getUserFormItems, s as services } from "./config-BhoH2ysO.js";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, m as unref, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
import "./eps-B-NJyMre.js";
import "./virtual-eps-empty-DC-cChfU.js";
import "@btc/shared-core";
import "@btc/shared-utils";
const _hoisted_1 = { class: "users-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const tableGroupRef = ref();
    const departmentOptions = ref([]);
    const userColumns = computed(() => {
      const baseColumns = [
        { type: "selection", width: 60 },
        { prop: "username", label: "用户名", width: 120 },
        { prop: "realName", label: "中文名", minWidth: 100 },
        { prop: "position", label: "职位", minWidth: 100 },
        {
          prop: "name",
          label: "部门",
          width: 120
        },
        {
          prop: "status",
          label: "状态",
          width: 100,
          dict: [
            { label: "激活", value: "ACTIVE", type: "success" },
            { label: "禁用", value: "INACTIVE", type: "danger" }
          ],
          dictColor: true
        }
      ];
      return baseColumns;
    });
    const formItems = computed(() => getUserFormItems(departmentOptions.value));
    function handleLoad(data) {
      departmentOptions.value = data;
    }
    async function handleUserInfo(user, { next, done }) {
      try {
        const userDetail = await next(user);
        if (userDetail.deptId && departmentOptions.value.length > 0) {
          const findDepartment = (options, id) => {
            for (const option of options) {
              if (option.value === id || option.id === id) {
                return option;
              }
              if (option.children && option.children.length > 0) {
                const found = findDepartment(option.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          const department = findDepartment(departmentOptions.value, userDetail.deptId);
          if (department) {
            userDetail.deptId = department.value || department.id;
          }
        }
        done(userDetail);
      } catch (error) {
        console.error("获取用户详情失败:", error);
        done(user);
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": unref(services).sysdepartment,
          "right-service": unref(services).sysuser,
          "table-columns": userColumns.value,
          "form-items": formItems.value,
          op: { buttons: ["edit", "delete"] },
          "on-info": handleUserInfo,
          "left-title": "部门列表",
          "right-title": "用户列表",
          "show-unassigned": true,
          "enable-key-search": true,
          "left-size": "middle",
          onLoad: handleLoad
        }, null, 8, ["left-service", "right-service", "table-columns", "form-items"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2311b3d1"]]);
export {
  index as default
};
