import { BtcTableGroup, BtcConfirm } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, b as computed, e as createElementBlock, l as createVNode, m as unref, o as openBlock, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
const _hoisted_1 = { class: "menus-page" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "NavigationMenus"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const tableGroupRef = ref();
    const selectedModule = ref(null);
    const domainService = {
      list: (params) => {
        const finalParams = params || {};
        return service.admin?.iam?.domain?.list(finalParams);
      }
    };
    const menuService = service.admin?.iam?.menu;
    const wrappedMenuService = {
      ...menuService,
      delete: async (id) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), {
          type: "warning"
        });
        await menuService.delete(id);
        const messageManager = window.messageManager;
        if (messageManager) {
          messageManager.enqueue("success", t("crud.message.delete_success"));
        }
      },
      deleteBatch: async (ids) => {
        await BtcConfirm(t("crud.message.delete_confirm"), t("common.button.confirm"), {
          type: "warning"
        });
        await menuService.deleteBatch(ids);
        const messageManager = window.messageManager;
        if (messageManager) {
          messageManager.enqueue("success", t("crud.message.delete_success"));
        }
      }
    };
    const onDomainSelect = (domain) => {
      selectedModule.value = domain;
    };
    const menuColumns = computed(() => [
      { type: "selection", width: 60 },
      {
        prop: "name",
        label: t("navigation.menu.name"),
        align: "left",
        width: 200,
        fixed: "left"
      },
      {
        prop: "isShow",
        label: t("navigation.menu.is_show"),
        width: 100
      },
      {
        prop: "icon",
        label: t("navigation.menu.icon"),
        width: 100
      },
      {
        prop: "type",
        label: t("navigation.menu.type"),
        width: 110,
        dict: [
          { label: t("navigation.menu.type.directory"), value: 0, type: "warning" },
          { label: t("navigation.menu.type.menu"), value: 1, type: "success" },
          { label: t("navigation.menu.type.permission"), value: 2, type: "danger" }
        ]
      },
      {
        prop: "router",
        label: t("navigation.menu.router"),
        minWidth: 170
      },
      {
        prop: "keepAlive",
        label: t("navigation.menu.keep_alive"),
        width: 100
      },
      {
        prop: "viewPath",
        label: t("navigation.menu.view_path"),
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: "perms",
        label: t("navigation.menu.perms"),
        headerAlign: "center",
        minWidth: 300,
        showOverflowTooltip: true
      },
      {
        prop: "orderNum",
        label: t("navigation.menu.order_num"),
        width: 120,
        fixed: "right",
        sortable: "custom"
      }
    ]);
    const menuTypeOptions = [
      { label: t("navigation.menu.type.directory"), value: 0, type: "warning" },
      { label: t("navigation.menu.type.menu"), value: 1, type: "success" },
      { label: t("navigation.menu.type.permission"), value: 2, type: "danger" }
    ];
    const menuFormItems = computed(() => [
      {
        prop: "type",
        value: 0,
        label: t("navigation.menu.node_type"),
        required: true,
        component: {
          name: "el-radio-group",
          options: menuTypeOptions
        }
      },
      {
        prop: "name",
        label: t("navigation.menu.node_name"),
        component: {
          name: "el-input"
        },
        required: true
      },
      {
        prop: "parentId",
        label: t("navigation.menu.parent_node"),
        component: {
          name: "el-select",
          props: {
            clearable: true,
            placeholder: t("navigation.menu.select_parent")
          }
        }
      },
      {
        prop: "router",
        label: t("navigation.menu.router"),
        hidden: ({ scope }) => scope.type != 1,
        component: {
          name: "el-input",
          props: {
            placeholder: t("navigation.menu.router_placeholder")
          }
        }
      },
      {
        prop: "keepAlive",
        value: true,
        label: t("navigation.menu.keep_alive"),
        hidden: ({ scope }) => scope.type != 1,
        component: {
          name: "el-radio-group",
          options: [
            { label: t("navigation.menu.keep_alive.enable"), value: true },
            { label: t("navigation.menu.keep_alive.disable"), value: false }
          ]
        }
      },
      {
        prop: "isShow",
        label: t("navigation.menu.is_show"),
        value: true,
        hidden: ({ scope }) => scope.type == 2,
        component: {
          name: "el-switch"
        }
      },
      {
        prop: "viewPath",
        label: t("navigation.menu.view_path"),
        hidden: ({ scope }) => scope.type != 1,
        component: {
          name: "el-input",
          props: {
            placeholder: t("navigation.menu.view_path_placeholder")
          }
        }
      },
      {
        prop: "icon",
        label: t("navigation.menu.icon"),
        hidden: ({ scope }) => scope.type == 2,
        component: {
          name: "el-input",
          props: {
            placeholder: t("navigation.menu.icon_placeholder")
          }
        }
      },
      {
        prop: "orderNum",
        label: t("navigation.menu.order_num"),
        component: {
          name: "el-input-number",
          props: {
            placeholder: t("navigation.menu.order_num_placeholder"),
            min: 0,
            max: 99,
            "controls-position": "right"
          }
        }
      },
      {
        prop: "perms",
        label: t("navigation.menu.perms"),
        hidden: ({ scope }) => scope.type != 2,
        component: {
          name: "el-input",
          props: {
            type: "textarea",
            rows: 3,
            placeholder: t("navigation.menu.perms_placeholder")
          }
        }
      }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcTableGroup), {
          ref_key: "tableGroupRef",
          ref: tableGroupRef,
          "left-service": domainService,
          "right-service": wrappedMenuService,
          "table-columns": menuColumns.value,
          "form-items": menuFormItems.value,
          op: { buttons: ["edit", "delete"] },
          "left-title": "业务域",
          "right-title": "菜单列表",
          "search-placeholder": "搜索菜单...",
          "show-unassigned": true,
          "unassigned-label": "未分配",
          "enable-key-search": true,
          "left-size": "small",
          onSelect: onDomainSelect
        }, null, 8, ["table-columns", "form-items"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-35969cdd"]]);
export {
  index as default
};
