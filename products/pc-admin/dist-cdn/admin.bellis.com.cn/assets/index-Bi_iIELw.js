import { a as defineComponent, j as useRoute, r as ref, k as onMounted, e as createElementBlock, l as createVNode, w as withCtx, z as ElCard, o as openBlock, A as ElDescriptions, B as ElDescriptionsItem, m as unref, v as createTextVNode, t as toDisplayString, h as createBaseVNode, C as ElTransfer, D as ElButton, i as _export_sfc } from "./index-CeQEKVXA.js";
import { useI18n } from "@btc/shared-core";
import { useMessage } from "@/utils/use-message";
import { createMockCrudService } from "@utils/http";
import "@btc/shared-utils";
import "@btc/shared-components";
const _hoisted_1 = { class: "dept-role-bind" };
const _hoisted_2 = { class: "card-header" };
const _hoisted_3 = { class: "card-header" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const message = useMessage();
    const route = useRoute();
    const deptId = route.params.id;
    const deptInfo = ref({});
    const allRoles = ref([]);
    const selectedRoles = ref([]);
    const saving = ref(false);
    const departmentService = createMockCrudService("btc_departments");
    const roleService = createMockCrudService("btc_roles", {});
    const loadDeptInfo = async () => {
      try {
        const data = await departmentService.info({ deptId });
        deptInfo.value = data;
      } catch (_error) {
        message.error(t("org.dept.load_info_error"));
      }
    };
    const loadRoles = async () => {
      try {
        const roles = await roleService.list({});
        allRoles.value = roles.map((role) => ({
          key: role.id,
          label: `${role.roleName}（${role.roleCode}）`,
          disabled: false
        }));
        selectedRoles.value = [1, 3];
      } catch (_error) {
        message.error(t("org.role.load_list_error"));
      }
    };
    const handleSave = async () => {
      saving.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success(t("crud.message.save_success"));
      } catch (_error) {
        message.error(t("crud.message.save_error"));
      } finally {
        saving.value = false;
      }
    };
    onMounted(() => {
      loadDeptInfo();
      loadRoles();
    });
    return (_ctx, _cache) => {
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_descriptions = ElDescriptions;
      const _component_el_card = ElCard;
      const _component_el_button = ElButton;
      const _component_el_transfer = ElTransfer;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_el_card, {
          class: "info-card",
          shadow: "hover"
        }, {
          header: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("span", null, toDisplayString(unref(t)("org.dept.info")), 1)
            ])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_descriptions, {
              column: 2,
              border: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("org.dept.name")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(deptInfo.value.deptNameCn), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("org.dept.code")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(deptInfo.value.deptCode), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, {
                  label: unref(t)("org.dept.sort")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(deptInfo.value.sortOrder), 1)
                  ]),
                  _: 1
                }, 8, ["label"]),
                createVNode(_component_el_descriptions_item, { label: "ID" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(deptInfo.value.deptId), 1)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        createVNode(_component_el_card, {
          class: "roles-card",
          shadow: "hover",
          style: { "margin-top": "20px" }
        }, {
          header: withCtx(() => [
            createBaseVNode("div", _hoisted_3, [
              createBaseVNode("span", null, toDisplayString(unref(t)("org.dept.role_bind")), 1),
              createVNode(_component_el_button, {
                type: "primary",
                size: "small",
                onClick: handleSave,
                loading: saving.value
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("org.dept.save_bind")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_transfer, {
              modelValue: selectedRoles.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedRoles.value = $event),
              data: allRoles.value,
              titles: [unref(t)("org.dept.available_roles"), unref(t)("org.dept.bound_roles")],
              filterable: "",
              "filter-placeholder": unref(t)("org.dept.search_roles")
            }, null, 8, ["modelValue", "data", "titles", "filter-placeholder"])
          ]),
          _: 1
        })
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d55aab85"]]);
export {
  index as default
};
