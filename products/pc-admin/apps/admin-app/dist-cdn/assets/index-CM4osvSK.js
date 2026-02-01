import { BtcTableGroup } from "@btc/shared-components";
import { s as service } from "./eps-B-NJyMre.js";
import { a as defineComponent, r as ref, b as computed, k as onMounted, e as createElementBlock, l as createVNode, m as unref, o as openBlock, I as nextTick, i as _export_sfc } from "./index-CeQEKVXA.js";
import "./virtual-eps-empty-DC-cChfU.js";
import "@btc/shared-core";
import "@btc/shared-utils";
const getRoleFormItems = (domainOptions = [], roleOptions = []) => {
  const formItems = [
    {
      prop: "roleName",
      label: "角色名称",
      span: 12,
      required: true,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入角色名称"
        }
      }
    },
    {
      prop: "roleCode",
      label: "角色编码",
      span: 12,
      required: true,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入角色编码"
        }
      }
    },
    {
      prop: "roleType",
      label: "角色类型",
      span: 12,
      required: true,
      component: {
        name: "el-select",
        props: {
          placeholder: "请选择角色类型",
          clearable: true
        },
        options: [
          { label: "管理员", value: "ADMIN" },
          { label: "业务员", value: "BUSINESS" },
          { label: "访客", value: "GUEST" }
        ]
      }
    },
    {
      prop: "parentId",
      label: "父级角色",
      span: 12,
      component: {
        name: "btc-cascader",
        props: {
          placeholder: "请选择父级角色",
          options: roleOptions,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: "domainId",
      label: "所属域",
      span: 12,
      component: {
        name: "btc-cascader",
        props: {
          placeholder: "请选择所属域",
          options: domainOptions,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: "description",
      label: "描述",
      span: 24,
      component: {
        name: "el-input",
        props: {
          type: "textarea",
          rows: 3,
          placeholder: "请输入角色描述"
        }
      }
    }
  ];
  return formItems;
};
const services = {
  sysdomain: service.admin?.iam?.domain,
  sysrole: service.admin?.iam?.role
};
const _hoisted_1 = { class: "roles-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const tableGroupRef = ref();
    const domainOptions = ref([]);
    const roleOptions = ref([]);
    const roleColumns = computed(() => {
      const baseColumns = [
        { type: "selection", width: 60 },
        { type: "index", label: "序号", width: 60 },
        {
          prop: "roleName",
          label: "角色名称",
          minWidth: 150
        },
        { prop: "roleCode", label: "角色编码", width: 180 },
        {
          prop: "roleType",
          label: "角色类型",
          width: 100,
          dict: [
            { label: "管理员", value: "ADMIN", type: "danger" },
            { label: "业务员", value: "BUSINESS", type: "success" },
            { label: "访客", value: "GUEST", type: "info" }
          ],
          dictColor: true
        },
        {
          prop: "parentId",
          label: "父级角色",
          width: 100,
          formatter: (row) => {
            if (!row.parentId || row.parentId === "0" || roleOptions.value.length === 0) {
              return "无";
            }
            const parentRole = roleOptions.value.find((r) => r.id === row.parentId);
            return parentRole ? parentRole.roleName : row.parentId;
          }
        },
        {
          prop: "domainId",
          label: "所属域",
          width: 100,
          formatter: (row) => {
            if (!row.domainId || domainOptions.value.length === 0) {
              return "未分配";
            }
            const domain = domainOptions.value.find((d) => d.id === row.domainId);
            return domain ? domain.name : row.domainId;
          }
        },
        { prop: "description", label: "描述", minWidth: 200, showOverflowTooltip: true },
        { prop: "createdAt", label: "创建时间", width: 160, sortable: true }
      ];
      return baseColumns;
    });
    const formItems = computed(() => getRoleFormItems(domainOptions.value, roleOptions.value));
    async function loadRoleOptions() {
      try {
        const response = await services.sysrole.list({});
        roleOptions.value = response.list || [];
      } catch (error) {
        console.error("加载角色数据失败:", error);
      }
    }
    function handleLoad(data) {
      domainOptions.value = data;
      if (roleOptions.value.length === 0) {
        nextTick(() => {
          loadRoleOptions();
        });
      }
    }
    async function handleRoleInfo(role, { next, done }) {
      try {
        if (roleOptions.value.length === 0) {
          await loadRoleOptions();
        }
        const roleDetail = await next(role);
        if (roleDetail.domainId && domainOptions.value.length > 0) {
          const findDomain = (options, id) => {
            for (const option of options) {
              if (option.value === id || option.id === id) {
                return option;
              }
              if (option.children && option.children.length > 0) {
                const found = findDomain(option.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          const domain = findDomain(domainOptions.value, roleDetail.domainId);
          if (domain) {
            roleDetail.domainId = domain.value || domain.id;
          }
        }
        if (roleDetail.parentId && roleDetail.parentId !== "0" && roleOptions.value.length > 0) {
          const parentRole = roleOptions.value.find((r) => r.id === roleDetail.parentId);
          if (parentRole) {
            roleDetail.parentId = parentRole.id;
          }
        }
        done(roleDetail);
      } catch (error) {
        console.error("获取角色详情失败:", error);
        done(role);
      }
    }
    onMounted(() => {
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": unref(services).sysdomain,
          "right-service": unref(services).sysrole,
          "table-columns": roleColumns.value,
          "form-items": formItems.value,
          op: { buttons: ["edit", "delete"] },
          "on-info": handleRoleInfo,
          "left-title": "域列表",
          "right-title": "角色列表",
          "show-unassigned": true,
          "enable-key-search": true,
          "left-size": "small",
          onLoad: handleLoad
        }, null, 8, ["left-service", "right-service", "table-columns", "form-items"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f3cd3b19"]]);
export {
  index as default
};
