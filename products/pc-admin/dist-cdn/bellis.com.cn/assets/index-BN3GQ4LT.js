import { _ as __vitePreload } from "./auth-api-CvJd6wHo.js";
import { b as defineComponent, m as useI18n, i as ref, j as computed, n as createElementBlock, o as openBlock, q as createBaseVNode, w as toDisplayString, g as unref, F as Fragment, v as renderList, D as normalizeClass, G as withDirectives, au as vShow, av as normalizeStyle, t as createVNode, x as withCtx, y as createTextVNode, E as ElButton, z as _export_sfc, d as definePluginConfig } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "btc-notification-panel" };
const _hoisted_2 = { class: "btc-notification-panel__header" };
const _hoisted_3 = { class: "btc-notification-panel__title" };
const _hoisted_4 = { class: "btc-notification-panel__bar" };
const _hoisted_5 = ["onClick"];
const _hoisted_6 = { class: "btc-notification-panel__content" };
const _hoisted_7 = { class: "btc-notification-panel__scroll" };
const _hoisted_8 = { class: "btc-notification-panel__notice-list" };
const _hoisted_9 = ["innerHTML"];
const _hoisted_10 = { class: "btc-notification-panel__text" };
const _hoisted_11 = { class: "btc-notification-panel__message-list" };
const _hoisted_12 = { class: "btc-notification-panel__avatar" };
const _hoisted_13 = ["src"];
const _hoisted_14 = { class: "btc-notification-panel__text" };
const _hoisted_15 = { class: "btc-notification-panel__pending-list" };
const _hoisted_16 = { class: "btc-notification-panel__empty" };
const _hoisted_17 = { class: "btc-notification-panel__btn-wrapper" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcNotificationPanel"
  },
  __name: "notification-panel",
  emits: ["close"],
  setup(__props) {
    const { t } = useI18n();
    const barActiveIndex = ref(0);
    const noticeList = ref([
      {
        title: "新增国际化",
        time: "2024-6-13 0:10",
        type: "notice"
      },
      {
        title: "冷月呆呆给你发了一条消息",
        time: "2024-4-21 8:05",
        type: "message"
      },
      {
        title: "小肥猪关注了你",
        time: "2020-3-17 21:12",
        type: "collection"
      },
      {
        title: "新增使用文档",
        time: "2024-02-14 0:20",
        type: "notice"
      },
      {
        title: "小肥猪给你发了一封邮件",
        time: "2024-1-20 0:15",
        type: "email"
      },
      {
        title: "菜单mock本地真实数据",
        time: "2024-1-17 22:06",
        type: "notice"
      }
    ]);
    const msgList = ref([
      {
        title: "池不胖 关注了你",
        time: "2021-2-26 23:50",
        avatar: "/logo.png"
      },
      {
        title: "唐不苦 关注了你",
        time: "2021-2-21 8:05",
        avatar: "/logo.png"
      },
      {
        title: "中小鱼 关注了你",
        time: "2020-1-17 21:12",
        avatar: "/logo.png"
      },
      {
        title: "何小荷 关注了你",
        time: "2021-01-14 0:20",
        avatar: "/logo.png"
      },
      {
        title: "誶誶淰 关注了你",
        time: "2020-12-20 0:15",
        avatar: "/logo.png"
      },
      {
        title: "冷月呆呆 关注了你",
        time: "2020-12-17 22:06",
        avatar: "/logo.png"
      }
    ]);
    const pendingList = ref([]);
    const barList = computed(() => [
      {
        name: t("notice.bar[0]"),
        num: noticeList.value.length
      },
      {
        name: t("notice.bar[1]"),
        num: msgList.value.length
      },
      {
        name: t("notice.bar[2]"),
        num: pendingList.value.length
      }
    ]);
    const currentTabIsEmpty = computed(() => {
      const tabDataMap = [noticeList.value, msgList.value, pendingList.value];
      const currentData = tabDataMap[barActiveIndex.value];
      return currentData && currentData.length === 0;
    });
    const getNoticeStyle = (type) => {
      const noticeStyleMap = {
        email: {
          icon: "&#xe72e;",
          iconColor: "rgb(230, 162, 60)",
          backgroundColor: "rgba(230, 162, 60, 0.1)"
        },
        message: {
          icon: "&#xe747;",
          iconColor: "rgb(103, 194, 58)",
          backgroundColor: "rgba(103, 194, 58, 0.1)"
        },
        collection: {
          icon: "&#xe714;",
          iconColor: "rgb(245, 108, 108)",
          backgroundColor: "rgba(245, 108, 108, 0.1)"
        },
        user: {
          icon: "&#xe608;",
          iconColor: "rgb(144, 147, 153)",
          backgroundColor: "rgba(144, 147, 153, 0.1)"
        },
        notice: {
          icon: "&#xe6c2;",
          iconColor: "rgb(64, 158, 255)",
          backgroundColor: "rgba(64, 158, 255, 0.1)"
        }
      };
      return noticeStyleMap[type] || noticeStyleMap.notice;
    };
    const changeBar = (index) => {
      barActiveIndex.value = index;
    };
    const handleReadAll = () => {
      console.log("标记全部已读");
    };
    const handleViewAll = () => {
      console.log("查看全部", barList.value[barActiveIndex.value].name);
    };
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("span", _hoisted_3, toDisplayString(unref(t)("notice.title")), 1),
          createBaseVNode("span", {
            class: "btc-notification-panel__btn-read",
            onClick: handleReadAll
          }, toDisplayString(unref(t)("notice.btnRead")), 1)
        ]),
        createBaseVNode("ul", _hoisted_4, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(barList.value, (item, index) => {
            return openBlock(), createElementBlock("li", {
              key: index,
              class: normalizeClass({ active: barActiveIndex.value === index }),
              onClick: ($event) => changeBar(index)
            }, toDisplayString(item.name) + " (" + toDisplayString(item.num) + ") ", 11, _hoisted_5);
          }), 128))
        ]),
        createBaseVNode("div", _hoisted_6, [
          createBaseVNode("div", _hoisted_7, [
            withDirectives(createBaseVNode("ul", _hoisted_8, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(noticeList.value, (item, index) => {
                return openBlock(), createElementBlock("li", { key: index }, [
                  createBaseVNode("div", {
                    class: "btc-notification-panel__icon",
                    style: normalizeStyle({ background: getNoticeStyle(item.type).backgroundColor + "!important" })
                  }, [
                    createBaseVNode("i", {
                      class: "iconfont-sys",
                      style: normalizeStyle({ color: getNoticeStyle(item.type).iconColor + "!important" }),
                      innerHTML: getNoticeStyle(item.type).icon
                    }, null, 12, _hoisted_9)
                  ], 4),
                  createBaseVNode("div", _hoisted_10, [
                    createBaseVNode("h4", null, toDisplayString(item.title), 1),
                    createBaseVNode("p", null, toDisplayString(item.time), 1)
                  ])
                ]);
              }), 128))
            ], 512), [
              [vShow, barActiveIndex.value === 0]
            ]),
            withDirectives(createBaseVNode("ul", _hoisted_11, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(msgList.value, (item, index) => {
                return openBlock(), createElementBlock("li", { key: index }, [
                  createBaseVNode("div", _hoisted_12, [
                    createBaseVNode("img", {
                      src: item.avatar,
                      alt: ""
                    }, null, 8, _hoisted_13)
                  ]),
                  createBaseVNode("div", _hoisted_14, [
                    createBaseVNode("h4", null, toDisplayString(item.title), 1),
                    createBaseVNode("p", null, toDisplayString(item.time), 1)
                  ])
                ]);
              }), 128))
            ], 512), [
              [vShow, barActiveIndex.value === 1]
            ]),
            withDirectives(createBaseVNode("ul", _hoisted_15, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(pendingList.value, (item, index) => {
                return openBlock(), createElementBlock("li", { key: index }, [
                  createBaseVNode("h4", null, toDisplayString(item.title), 1),
                  createBaseVNode("p", null, toDisplayString(item.time), 1)
                ]);
              }), 128))
            ], 512), [
              [vShow, barActiveIndex.value === 2]
            ]),
            withDirectives(createBaseVNode("div", _hoisted_16, [
              _cache[0] || (_cache[0] = createBaseVNode("i", { class: "iconfont-sys" }, "", -1)),
              createBaseVNode("p", null, toDisplayString(unref(t)("notice.text[0]")) + toDisplayString(barList.value[barActiveIndex.value].name), 1)
            ], 512), [
              [vShow, currentTabIsEmpty.value]
            ])
          ]),
          createBaseVNode("div", _hoisted_17, [
            createVNode(_component_el_button, {
              class: "btc-notification-panel__view-all",
              onClick: handleViewAll
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(t)("notice.viewAll")), 1)
              ]),
              _: 1
            })
          ])
        ])
      ]);
    };
  }
});
var BtcNotificationPanel = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-97a6c3db"]]);
const notificationPlugin = {
  name: "notification",
  version: "1.0.0",
  description: "Notification management plugin",
  order: 15,
  // 插件配置元数据
  config: definePluginConfig({
    label: "通知管理",
    description: "提供系统通知、消息提醒功能",
    author: "BTC Team",
    version: "1.0.0",
    updateTime: "2024-01-15",
    category: "core",
    tags: ["notification", "alert", "toolbar"],
    recommended: true
  }),
  // 工具栏配置
  toolbar: {
    order: 3,
    // 在国际化之后
    pc: true,
    h5: false,
    // 移动端隐藏
    component: () => __vitePreload(() => import("https://all.bellis.com.cn/system-app/assets/notification-icon-CUAi_8Zb.js"), true ? [] : void 0)
  }
};
export {
  BtcNotificationPanel,
  notificationPlugin
};
