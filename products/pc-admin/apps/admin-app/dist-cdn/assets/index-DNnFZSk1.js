import { useMessage } from "@/utils/use-message";
import { useI18n } from "@btc/shared-core";
import { service } from "@services/eps";
import { a as defineComponent, r as ref, k as onMounted, e as createElementBlock, l as createVNode, w as withCtx, z as ElCard, o as openBlock, C as ElTransfer, m as unref, h as createBaseVNode, t as toDisplayString, D as ElButton, v as createTextVNode, i as _export_sfc } from "./index-CeQEKVXA.js";
import "@btc/shared-utils";
import "@btc/shared-components";
const _hoisted_1 = { class: "menu-perm-bind-page" };
const _hoisted_2 = { class: "card-header" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "NavigationMenuPermBind"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const menuPermService = service.admin?.iam?.department;
    const permissionService = service.admin?.iam?.permission;
    const allPermissions = ref([]);
    const selectedPermissions = ref([]);
    const saving = ref(false);
    const loadPermissions = async () => {
      const permissions = await permissionService.list({});
      allPermissions.value = permissions.map((p) => ({
        key: p.id,
        label: p.name,
        disabled: false
      }));
    };
    const loadBoundPermissions = async () => {
      const boundPerms = await menuPermService.list({});
      selectedPermissions.value = boundPerms.map((p) => p.permissionId);
    };
    const handleSave = async () => {
      saving.value = true;
      try {
        const existing = await menuPermService.list({});
        for (const item of existing) {
          await menuPermService.remove(item.id);
        }
        for (const permissionId of selectedPermissions.value) {
          await menuPermService.add({
            menuId: 1,
            // ???????????ID
            permissionId,
            createTime: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        message.success("????");
      } catch (_error) {
        message.error("????");
      } finally {
        saving.value = false;
      }
    };
    onMounted(() => {
      loadPermissions();
      loadBoundPermissions();
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_transfer = ElTransfer;
      const _component_el_card = ElCard;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_el_card, null, {
          header: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("span", null, toDisplayString(unref(t)("navigation.permission.bind_title")), 1),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: handleSave,
                loading: saving.value
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("navigation.permission.save")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_transfer, {
              modelValue: selectedPermissions.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedPermissions.value = $event),
              data: allPermissions.value,
              titles: [unref(t)("navigation.permission.all"), unref(t)("navigation.permission.selected")],
              filterable: "",
              "filter-placeholder": unref(t)("navigation.permission.search")
            }, null, 8, ["modelValue", "data", "titles", "filter-placeholder"])
          ]),
          _: 1
        })
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e6c1202c"]]);
export {
  index as default
};
