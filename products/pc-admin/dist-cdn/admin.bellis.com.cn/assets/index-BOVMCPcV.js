import { BtcRow, BtcFlex1 } from "@btc/shared-components";
import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { a as defineComponent, r as ref, b as computed, k as onMounted, e as createElementBlock, h as createBaseVNode, l as createVNode, L as createCommentVNode, w as withCtx, af as ElMenu, o as openBlock, J as ElSelect, m as unref, F as Fragment, q as renderList, x as createBlock, K as ElOption, D as ElButton, v as createTextVNode, E as ElIcon, ag as refresh_default, t as toDisplayString, ah as ElSubMenu, ai as ElMenuItem, aj as resolveDynamicComponent, i as _export_sfc } from "./index-CeQEKVXA.js";
import { service } from "@services/eps";
import "@btc/shared-utils";
const _hoisted_1 = { class: "menu-preview-page" };
const _hoisted_2 = { class: "preview-container" };
const _hoisted_3 = {
  key: 0,
  class: "menu-preview"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "NavigationMenuPreview"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    service.admin?.iam?.user;
    const _roleService = service.admin?.iam?.role;
    const menuService = service.admin?.iam?.menu;
    const roles = ref([]);
    const menus = ref([]);
    const selectedRole = ref(null);
    const activeMenu = ref("");
    const filteredMenus = computed(() => {
      if (!selectedRole.value) return [];
      const filterMenus = (menuList) => {
        return menuList.filter((menu) => menu.roles && menu.roles.includes(selectedRole.value)).map((menu) => ({
          ...menu,
          children: menu.children ? filterMenus(menu.children) : []
        })).sort((a, b) => (a.sort || 0) - (b.sort || 0));
      };
      return filterMenus(menus.value);
    });
    const handleRoleChange = (roleId) => {
      selectedRole.value = roleId;
      activeMenu.value = "";
      message.success(`??????: ${roles.value.find((r) => r.id === roleId)?.roleName}`);
    };
    const handleMenuSelect = (index2) => {
      activeMenu.value = index2;
      const menu = menus.value.find((m) => m.id.toString() === index2);
      if (menu) {
        message.info(`?????: ${menu.label}`);
      }
    };
    const handleRefresh = () => {
      loadData();
      message.success("????");
    };
    const buildTree = (data, parentId = null) => {
      if (!Array.isArray(data)) {
        return [];
      }
      return data.filter((item) => item.parentId === parentId).map((item) => ({
        ...item,
        children: buildTree(data, item.id)
      }));
    };
    const loadData = async () => {
      const [rolesData, menusData] = await Promise.all([
        _roleService.list({}),
        menuService.list({})
      ]);
      roles.value = Array.isArray(rolesData) ? rolesData : rolesData?.list || [];
      const menuList = Array.isArray(menusData) ? menusData : menusData?.list || [];
      menus.value = buildTree(menuList);
    };
    onMounted(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      const _component_BtcFlex1 = BtcFlex1;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_BtcRow = BtcRow;
      const _component_el_menu_item = ElMenuItem;
      const _component_el_sub_menu = ElSubMenu;
      const _component_el_menu = ElMenu;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_BtcRow, null, {
            default: withCtx(() => [
              createVNode(_component_BtcFlex1),
              createVNode(_component_el_select, {
                modelValue: selectedRole.value,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedRole.value = $event),
                placeholder: unref(t)("navigation.preview.select_role"),
                onChange: handleRoleChange,
                style: { "width": "200px" }
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(roles.value, (role) => {
                    return openBlock(), createBlock(_component_el_option, {
                      key: role.id,
                      label: role.roleName,
                      value: role.id
                    }, null, 8, ["label", "value"]);
                  }), 128))
                ]),
                _: 1
              }, 8, ["modelValue", "placeholder"]),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: handleRefresh,
                style: { "margin-left": "10px" }
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(refresh_default))
                    ]),
                    _: 1
                  }),
                  createTextVNode(" " + toDisplayString(unref(t)("navigation.preview.refresh")), 1)
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          selectedRole.value && filteredMenus.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_3, [
            createVNode(_component_el_menu, {
              "default-active": activeMenu.value,
              class: "preview-menu",
              mode: "vertical",
              onSelect: handleMenuSelect
            }, {
              default: withCtx(() => [
                (openBlock(true), createElementBlock(Fragment, null, renderList(filteredMenus.value, (menu) => {
                  return openBlock(), createElementBlock(Fragment, {
                    key: menu.id
                  }, [
                    menu.children && menu.children.length > 0 ? (openBlock(), createBlock(_component_el_sub_menu, {
                      key: 0,
                      index: menu.id.toString()
                    }, {
                      title: withCtx(() => [
                        menu.icon ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                          default: withCtx(() => [
                            (openBlock(), createBlock(resolveDynamicComponent(menu.icon)))
                          ]),
                          _: 2
                        }, 1024)) : createCommentVNode("", true),
                        createBaseVNode("span", null, toDisplayString(menu.label), 1)
                      ]),
                      default: withCtx(() => [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(menu.children, (child) => {
                          return openBlock(), createBlock(_component_el_menu_item, {
                            key: child.id,
                            index: child.id.toString()
                          }, {
                            default: withCtx(() => [
                              child.icon ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                                default: withCtx(() => [
                                  (openBlock(), createBlock(resolveDynamicComponent(child.icon)))
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true),
                              createBaseVNode("span", null, toDisplayString(child.label), 1)
                            ]),
                            _: 2
                          }, 1032, ["index"]);
                        }), 128))
                      ]),
                      _: 2
                    }, 1032, ["index"])) : (openBlock(), createBlock(_component_el_menu_item, {
                      key: 1,
                      index: menu.id.toString()
                    }, {
                      default: withCtx(() => [
                        menu.icon ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                          default: withCtx(() => [
                            (openBlock(), createBlock(resolveDynamicComponent(menu.icon)))
                          ]),
                          _: 2
                        }, 1024)) : createCommentVNode("", true),
                        createBaseVNode("span", null, toDisplayString(menu.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["index"]))
                  ], 64);
                }), 128))
              ]),
              _: 1
            }, 8, ["default-active"])
          ])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0fd38c65"]]);
export {
  index as default
};
