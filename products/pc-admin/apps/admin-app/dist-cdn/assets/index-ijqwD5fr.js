import { a as defineComponent, r as ref, N as shallowRef, b as computed, k as onMounted, e as createElementBlock, l as createVNode, h as createBaseVNode, w as withCtx, m as unref, F as Fragment, q as renderList, a$ as markRaw, o as openBlock, R as ElInput, E as ElIcon, T as search_default, t as toDisplayString, x as createBlock, v as createTextVNode, s as ElTag, D as ElButton, L as createCommentVNode, aj as resolveDynamicComponent, i as _export_sfc } from "./index-CeQEKVXA.js";
import { BtcMessage, BtcFlex1, BtcRow, BtcDialog } from "@btc/shared-components";
import { useI18n } from "@btc/shared-core";
import { getAllTestInstanceConfigs, loadTestInstanceComponent } from "@/utils/test-instance-scanner";
import "@btc/shared-utils";
const _hoisted_1 = { class: "test-center-page" };
const _hoisted_2 = { class: "test-grid" };
const _hoisted_3 = ["onClick"];
const _hoisted_4 = { class: "test-card-header" };
const _hoisted_5 = { class: "test-info" };
const _hoisted_6 = { class: "test-title" };
const _hoisted_7 = { class: "test-description" };
const _hoisted_8 = { class: "test-card-body" };
const _hoisted_9 = { class: "test-tags" };
const _hoisted_10 = { class: "test-card-footer" };
const logoUrl = "/logo.png";
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "TestCenterPage"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const searchKeyword = ref("");
    const dialogVisible = ref(false);
    const currentTestInstance = ref(null);
    const testInstances = shallowRef([]);
    const loadTestInstances = async () => {
      try {
        const configs = getAllTestInstanceConfigs();
        const testModules = await Promise.all(
          configs.map(async (config) => {
            try {
              const component = await loadTestInstanceComponent(config.name);
              return {
                ...config,
                component: markRaw(component)
                // 使用 markRaw 标记组件为非响应式
              };
            } catch (error) {
              console.warn(`Failed to load test instance: ${config.name}`, error);
              return null;
            }
          })
        );
        testInstances.value = testModules.filter(Boolean);
      } catch (error) {
        console.error("加载测试实例失败:", error);
        BtcMessage.error("加载测试实例失败");
      }
    };
    const filteredTestInstances = computed(() => {
      if (!searchKeyword.value) {
        return testInstances.value;
      }
      const keyword = searchKeyword.value.toLowerCase();
      return testInstances.value.filter(
        (instance) => instance.title.toLowerCase().includes(keyword) || instance.description.toLowerCase().includes(keyword) || instance.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });
    const getTagType = (tag, index2) => {
      const typeOrder = ["primary", "success", "warning", "danger"];
      return typeOrder[index2 % 4];
    };
    const getDialogWidth = () => {
      return "60%";
    };
    const getDialogHeight = () => {
      return "60vh";
    };
    const openTestInstance = (instance) => {
      currentTestInstance.value = instance;
      dialogVisible.value = true;
    };
    onMounted(() => {
      loadTestInstances();
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_input = ElInput;
      const _component_el_tag = ElTag;
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcRow), { class: "search-row" }, {
          default: withCtx(() => [
            createVNode(unref(BtcFlex1)),
            createVNode(_component_el_input, {
              modelValue: searchKeyword.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
              placeholder: "搜索测试功能...",
              clearable: "",
              size: "large",
              class: "search-input"
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
          (openBlock(true), createElementBlock(Fragment, null, renderList(filteredTestInstances.value, (testInstance) => {
            return openBlock(), createElementBlock("div", {
              key: testInstance.name,
              class: "test-card",
              onClick: ($event) => openTestInstance(testInstance)
            }, [
              createBaseVNode("div", _hoisted_4, [
                createBaseVNode("div", { class: "test-icon" }, [
                  createBaseVNode("img", {
                    src: logoUrl,
                    alt: "BTC Logo",
                    class: "test-logo"
                  })
                ]),
                createBaseVNode("div", _hoisted_5, [
                  createBaseVNode("h3", _hoisted_6, toDisplayString(unref(t)(testInstance.title)), 1),
                  createBaseVNode("p", _hoisted_7, toDisplayString(testInstance.description), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("div", _hoisted_9, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(testInstance.tags, (tag, index2) => {
                    return openBlock(), createBlock(_component_el_tag, {
                      key: tag,
                      type: getTagType(tag, index2),
                      size: "small",
                      class: "test-tag"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(tag), 1)
                      ]),
                      _: 2
                    }, 1032, ["type"]);
                  }), 128))
                ])
              ]),
              createBaseVNode("div", _hoisted_10, [
                createVNode(_component_el_button, {
                  type: "primary",
                  size: "small",
                  class: "test-button"
                }, {
                  default: withCtx(() => [..._cache[2] || (_cache[2] = [
                    createTextVNode(" 开始测试 ", -1)
                  ])]),
                  _: 1
                })
              ])
            ], 8, _hoisted_3);
          }), 128))
        ]),
        createVNode(unref(BtcDialog), {
          modelValue: dialogVisible.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => dialogVisible.value = $event),
          title: currentTestInstance.value ? unref(t)(currentTestInstance.value.title) : "",
          width: getDialogWidth(),
          height: getDialogHeight(),
          controls: ["fullscreen", "close"],
          class: "test-dialog"
        }, {
          default: withCtx(() => [
            currentTestInstance.value ? (openBlock(), createBlock(resolveDynamicComponent(currentTestInstance.value.component), {
              key: currentTestInstance.value.name
            })) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue", "title", "width", "height"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9e795ec2"]]);
export {
  index as default
};
