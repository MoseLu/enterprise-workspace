import { _ as __vitePreload } from "./auth-api-CvJd6wHo.js";
import { b as defineComponent, m as useI18n, k as useRouter, i as ref, n as createElementBlock, o as openBlock, q as createBaseVNode, w as toDisplayString, g as unref, N as createCommentVNode, F as Fragment, v as renderList, t as createVNode, x as withCtx, y as createTextVNode, E as ElButton, z as _export_sfc, d as definePluginConfig } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "btc-message-panel" };
const _hoisted_2 = { class: "btc-message-panel__header" };
const _hoisted_3 = { class: "btc-message-panel__title" };
const _hoisted_4 = { class: "btc-message-panel__content" };
const _hoisted_5 = { class: "btc-message-panel__scroll" };
const _hoisted_6 = {
  key: 0,
  class: "btc-message-panel__message-list"
};
const _hoisted_7 = ["onClick"];
const _hoisted_8 = { class: "btc-message-panel__avatar" };
const _hoisted_9 = ["src"];
const _hoisted_10 = { class: "btc-message-panel__content-text" };
const _hoisted_11 = { class: "btc-message-panel__content-header" };
const _hoisted_12 = { class: "btc-message-panel__time" };
const _hoisted_13 = { class: "btc-message-panel__preview" };
const _hoisted_14 = {
  key: 1,
  class: "btc-message-panel__empty"
};
const _hoisted_15 = {
  key: 0,
  class: "btc-message-panel__btn-wrapper"
};
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcMessagePanel"
  },
  __name: "message-panel",
  emits: ["close"],
  setup(__props) {
    const { t } = useI18n();
    useRouter();
    const messageList = ref([
      {
        id: "1",
        name: "张三",
        avatar: "/logo.png",
        preview: "你好，请问这个功能如何使用？",
        time: "10:30",
        unread: true
      },
      {
        id: "2",
        name: "李四",
        avatar: "/logo.png",
        preview: "我已经完成了任务，请查看",
        time: "昨天",
        unread: true
      },
      {
        id: "3",
        name: "王五",
        avatar: "/logo.png",
        preview: "谢谢你的帮助！",
        time: "2024-01-15",
        unread: false
      },
      {
        id: "4",
        name: "系统消息",
        avatar: "/logo.png",
        preview: "您的订单已发货",
        time: "2024-01-14",
        unread: true
      }
    ]);
    const handleMessageClick = (item) => {
      console.log("点击消息:", item);
    };
    const handleViewAll = () => {
      console.log("查看全部消息");
    };
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("span", _hoisted_3, toDisplayString(unref(t)("message.title")), 1)
        ]),
        createBaseVNode("div", _hoisted_4, [
          createBaseVNode("div", _hoisted_5, [
            messageList.value.length > 0 ? (openBlock(), createElementBlock("ul", _hoisted_6, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(messageList.value, (item, index) => {
                return openBlock(), createElementBlock("li", {
                  key: index,
                  onClick: ($event) => handleMessageClick(item)
                }, [
                  createBaseVNode("div", _hoisted_8, [
                    createBaseVNode("img", {
                      src: item.avatar,
                      alt: ""
                    }, null, 8, _hoisted_9)
                  ]),
                  createBaseVNode("div", _hoisted_10, [
                    createBaseVNode("div", _hoisted_11, [
                      createBaseVNode("h4", null, toDisplayString(item.name), 1),
                      createBaseVNode("span", _hoisted_12, toDisplayString(item.time), 1)
                    ]),
                    createBaseVNode("p", _hoisted_13, toDisplayString(item.preview), 1)
                  ])
                ], 8, _hoisted_7);
              }), 128))
            ])) : (openBlock(), createElementBlock("div", _hoisted_14, [
              _cache[0] || (_cache[0] = createBaseVNode("i", { class: "iconfont-sys" }, "", -1)),
              createBaseVNode("p", null, toDisplayString(unref(t)("message.empty")), 1)
            ]))
          ]),
          messageList.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_15, [
            createVNode(_component_el_button, {
              class: "btc-message-panel__view-all",
              onClick: handleViewAll
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(t)("message.viewAll")), 1)
              ]),
              _: 1
            })
          ])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
var BtcMessagePanel = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c9dc4807"]]);
const messagePlugin = {
  name: "message",
  version: "1.0.0",
  description: "Message center plugin",
  order: 20,
  // 插件配置元数据
  config: definePluginConfig({
    label: "消息中心",
    description: "提供私信、系统消息功能",
    author: "BTC Team",
    version: "1.0.0",
    updateTime: "2024-01-15",
    category: "core",
    tags: ["message", "chat", "toolbar"],
    recommended: true
  }),
  // 工具栏配置
  toolbar: {
    order: 4,
    // 在通知之后
    pc: true,
    h5: false,
    // 移动端隐藏
    component: () => __vitePreload(() => import("https://all.bellis.com.cn/system-app/assets/message-icon-BitCOvh6.js"), true ? [] : void 0)
  }
};
export {
  BtcMessagePanel,
  messagePlugin
};
