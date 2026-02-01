import { a as defineComponent, j as useRoute, r as ref, k as onMounted, e as createElementBlock, l as createVNode, w as withCtx, z as ElCard, u as useRouter, o as openBlock, A as ElDescriptions, B as ElDescriptionsItem, v as createTextVNode, t as toDisplayString, h as createBaseVNode, M as ElTree, D as ElButton, i as _export_sfc } from "./index-CeQEKVXA.js";
import { useMessage } from "@/utils/use-message";
import { service } from "@services/eps";
import "@btc/shared-core";
import "@btc/shared-utils";
import "@btc/shared-components";
const _hoisted_1 = { class: "role-perm-bind" };
const _hoisted_2 = { class: "card-header" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const route = useRoute();
    const message = useMessage();
    const router = useRouter();
    const roleId = route.params.id;
    const roleInfo = ref({});
    const permissionTree = ref([]);
    const checkedPermissions = ref([]);
    const saving = ref(false);
    const treeRef = ref();
    const roleService = service.admin?.iam?.role;
    const loadPermissionTree = () => {
      permissionTree.value = [
        {
          id: "user",
          label: "????",
          children: [
            { id: 1, label: "????" },
            { id: 2, label: "????" },
            { id: 3, label: "????" }
          ]
        },
        {
          id: "role",
          label: "????",
          children: [
            { id: 4, label: "????" },
            { id: 5, label: "????" }
          ]
        },
        {
          id: "dept",
          label: "????",
          children: [
            { id: 6, label: "????" },
            { id: 7, label: "????" }
          ]
        }
      ];
      checkedPermissions.value = [1, 4, 6];
    };
    const loadRoleInfo = async () => {
      try {
        const data = await roleService.info({ id: roleId });
        roleInfo.value = data;
      } catch (_error) {
        message.error("????????");
      }
    };
    const handleCheck = () => {
    };
    const handleSave = async () => {
      saving.value = true;
      try {
        const _checkedKeys = treeRef.value?.getCheckedKeys() || [];
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success("????");
        router.back();
      } catch (_error) {
        message.error("????");
      } finally {
        saving.value = false;
      }
    };
    const handleCancel = () => {
      router.back();
    };
    onMounted(() => {
      loadRoleInfo();
      loadPermissionTree();
    });
    return (_ctx, _cache) => {
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_descriptions = ElDescriptions;
      const _component_el_card = ElCard;
      const _component_el_button = ElButton;
      const _component_el_tree = ElTree;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_el_card, {
          class: "info-card",
          shadow: "hover"
        }, {
          header: withCtx(() => [..._cache[0] || (_cache[0] = [
            createBaseVNode("div", { class: "card-header" }, [
              createBaseVNode("span", null, "????")
            ], -1)
          ])]),
          default: withCtx(() => [
            createVNode(_component_el_descriptions, {
              column: 2,
              border: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_el_descriptions_item, { label: "????" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(roleInfo.value.roleName), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "????" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(roleInfo.value.roleCode), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "????" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(roleInfo.value.roleType), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "??" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(roleInfo.value.description), 1)
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
          class: "perms-card",
          shadow: "hover",
          style: { "margin-top": "20px" }
        }, {
          header: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              _cache[3] || (_cache[3] = createBaseVNode("span", null, "????", -1)),
              createBaseVNode("div", null, [
                createVNode(_component_el_button, { onClick: handleCancel }, {
                  default: withCtx(() => [..._cache[1] || (_cache[1] = [
                    createTextVNode("??", -1)
                  ])]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  type: "primary",
                  onClick: handleSave,
                  loading: saving.value
                }, {
                  default: withCtx(() => [..._cache[2] || (_cache[2] = [
                    createTextVNode("??", -1)
                  ])]),
                  _: 1
                }, 8, ["loading"])
              ])
            ])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_tree, {
              ref_key: "treeRef",
              ref: treeRef,
              data: permissionTree.value,
              "show-checkbox": "",
              "node-key": "id",
              props: { children: "children", label: "label" },
              "default-checked-keys": checkedPermissions.value,
              onCheck: handleCheck
            }, null, 8, ["data", "default-checked-keys"])
          ]),
          _: 1
        })
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c6e9afef"]]);
export {
  index as default
};
