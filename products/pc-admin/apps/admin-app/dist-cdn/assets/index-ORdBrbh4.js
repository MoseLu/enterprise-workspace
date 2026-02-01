import { a as defineComponent, b as computed, e as createElementBlock, o as openBlock, n as normalizeStyle, f as normalizeClass, h as createBaseVNode, i as _export_sfc, u as useRouter, j as useRoute, r as ref, k as onMounted, l as createVNode, w as withCtx, E as ElIcon, m as unref, p as loading_default, t as toDisplayString, F as Fragment, q as renderList, s as ElTag, v as createTextVNode } from "./index-CeQEKVXA.js";
import { useI18n } from "@btc/shared-core";
import { BtcCard, BtcChartDemo } from "@btc/shared-components";
import { service } from "@services/eps";
import { getDomainList } from "@/utils/domain-cache";
import "@btc/shared-utils";
const _hoisted_1$1 = ["href", "xlink:href"];
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    name: "btc-svg"
  },
  __name: "index",
  props: {
    // 图标名称（不需要 icon- 前缀）
    name: String,
    // 自定义类名
    className: String,
    // 图标颜色
    color: String,
    // 图标大小
    size: [String, Number]
  },
  setup(__props) {
    function parsePx(val) {
      if (val === void 0) return void 0;
      return typeof val === "number" ? `${val}px` : val;
    }
    const props = __props;
    const style = computed(() => ({
      fontSize: parsePx(props.size),
      fill: props.color
    }));
    const iconName = computed(() => `#icon-${props.name}`);
    const svgClass = computed(() => {
      return ["btc-svg", `btc-svg__${props.name}`, String(props.className || "")];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        class: normalizeClass(svgClass.value),
        style: normalizeStyle(style.value),
        "aria-hidden": "true"
      }, [
        createBaseVNode("use", {
          href: iconName.value,
          "xlink:href": iconName.value
        }, null, 8, _hoisted_1$1)
      ], 6);
    };
  }
});
var __unplugin_components_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-0772ddc5"]]);
const _hoisted_1 = { class: "main-home" };
const _hoisted_2 = { class: "main-home__top-row" };
const _hoisted_3 = { class: "main-home__quick-access" };
const _hoisted_4 = {
  key: 0,
  class: "loading-container"
};
const _hoisted_5 = {
  key: 1,
  class: "quick-access-grid"
};
const _hoisted_6 = ["onClick"];
const _hoisted_7 = { class: "main-home__system-info" };
const _hoisted_8 = { class: "system-info" };
const _hoisted_9 = { class: "info-item" };
const _hoisted_10 = { class: "label" };
const _hoisted_11 = { class: "info-item" };
const _hoisted_12 = { class: "label" };
const _hoisted_13 = { class: "info-item" };
const _hoisted_14 = { class: "label" };
const _hoisted_15 = { class: "main-home__bottom-row" };
const _hoisted_16 = { class: "strategy-charts" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const router = useRouter();
    useRoute();
    const { t } = useI18n();
    const domainAppMapping = {
      "LOGISTICS": {
        icon: "map",
        color: "#67c23a"
      },
      "ENGINEERING": {
        icon: "design",
        color: "#e6a23c"
      },
      "QUALITY": {
        icon: "approve",
        color: "#f56c6c"
      },
      "PRODUCTION": {
        icon: "work",
        color: "#909399"
      },
      "FINANCE": {
        icon: "amount-alt",
        color: "#1890ff"
      },
      "ADMIN": {
        icon: "settings",
        color: "#13c2c2"
      },
      "OPERATIONS": {
        icon: "monitor",
        color: "#52c41a"
      },
      "DASHBOARD": {
        icon: "trend",
        color: "#ff6b9d"
      },
      "PERSONNEL": {
        icon: "team",
        color: "#ffc107"
      }
    };
    const loading = ref(false);
    const quickAccessDomains = ref([]);
    const loadDomains = async () => {
      loading.value = true;
      try {
        const response = await getDomainList(service);
        if (response?.list) {
          const domains = response.list.filter(
            (domain) => domain.domainCode !== "SYSTEM" && domain.name !== "系统域" && domain.domainCode !== "DOCS" && domain.name !== "文档中心" && domain.domainCode !== "ADMIN" && domain.name !== "管理域"
          ).map((domain) => {
            const domainCode = domain.domainCode;
            const appConfig = domainAppMapping[domainCode];
            if (appConfig) {
              return {
                domainCode,
                name: domain.name,
                icon: appConfig.icon,
                color: appConfig.color
              };
            }
            return null;
          }).filter((item) => item !== null);
          quickAccessDomains.value = domains;
        } else {
          quickAccessDomains.value = [
            { domainCode: "LOGISTICS", name: t("micro_app.logistics.title"), icon: "map", color: "#67c23a" },
            { domainCode: "ENGINEERING", name: t("micro_app.engineering.title"), icon: "design", color: "#e6a23c" },
            { domainCode: "QUALITY", name: t("micro_app.quality.title"), icon: "approve", color: "#f56c6c" },
            { domainCode: "PRODUCTION", name: t("micro_app.production.title"), icon: "work", color: "#909399" },
            { domainCode: "FINANCE", name: t("micro_app.finance.title"), icon: "amount-alt", color: "#1890ff" }
          ];
        }
      } catch (error) {
        console.warn("获取域列表失败，使用默认配置:", error);
        quickAccessDomains.value = [
          { domainCode: "LOGISTICS", name: t("micro_app.logistics.title"), icon: "map", color: "#67c23a" },
          { domainCode: "ENGINEERING", name: t("micro_app.engineering.title"), icon: "design", color: "#e6a23c" },
          { domainCode: "QUALITY", name: t("micro_app.quality.title"), icon: "approve", color: "#f56c6c" },
          { domainCode: "PRODUCTION", name: t("micro_app.production.title"), icon: "work", color: "#909399" },
          { domainCode: "FINANCE", name: t("micro_app.finance.title"), icon: "amount-alt", color: "#d48806" }
        ];
      } finally {
        loading.value = false;
      }
    };
    const goToModule = (domainCode) => {
      const domainPathMap = {
        "LOGISTICS": "/logistics",
        "ENGINEERING": "/engineering",
        "QUALITY": "/quality",
        "PRODUCTION": "/production",
        "FINANCE": "/finance",
        "OPERATIONS": "/operations",
        "DASHBOARD": "/dashboard",
        "PERSONNEL": "/personnel"
      };
      const targetPath = domainPathMap[domainCode] || `/${domainCode.toLowerCase()}`;
      router.push(targetPath);
    };
    onMounted(() => {
      loadDomains();
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_btc_svg = __unplugin_components_1;
      const _component_el_tag = ElTag;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createVNode(unref(BtcCard), {
              title: unref(t)("main.home.quick_access"),
              class: "main-home__card"
            }, {
              default: withCtx(() => [
                loading.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
                  createVNode(_component_el_icon, { class: "is-loading" }, {
                    default: withCtx(() => [
                      createVNode(unref(loading_default))
                    ]),
                    _: 1
                  }),
                  createBaseVNode("span", null, toDisplayString(unref(t)("common.loading")) + "...", 1)
                ])) : (openBlock(), createElementBlock("div", _hoisted_5, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(quickAccessDomains.value, (domain) => {
                    return openBlock(), createElementBlock("div", {
                      key: domain.domainCode,
                      class: "access-item",
                      onClick: ($event) => goToModule(domain.domainCode)
                    }, [
                      createVNode(_component_btc_svg, {
                        name: domain.icon,
                        size: 36
                      }, null, 8, ["name"]),
                      createBaseVNode("span", null, toDisplayString(domain.name), 1)
                    ], 8, _hoisted_6);
                  }), 128))
                ]))
              ]),
              _: 1
            }, 8, ["title"])
          ]),
          createBaseVNode("div", _hoisted_7, [
            createVNode(unref(BtcCard), {
              title: unref(t)("main.home.system_info"),
              class: "main-home__card"
            }, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_8, [
                  createBaseVNode("div", _hoisted_9, [
                    createBaseVNode("span", _hoisted_10, toDisplayString(unref(t)("main.home.version")) + ":", 1),
                    createVNode(_component_el_tag, { size: "small" }, {
                      default: withCtx(() => [..._cache[0] || (_cache[0] = [
                        createTextVNode("v1.0.0", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  createBaseVNode("div", _hoisted_11, [
                    createBaseVNode("span", _hoisted_12, toDisplayString(unref(t)("main.home.environment")) + ":", 1),
                    createVNode(_component_el_tag, {
                      type: "success",
                      size: "small"
                    }, {
                      default: withCtx(() => [..._cache[1] || (_cache[1] = [
                        createTextVNode("Development", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  createBaseVNode("div", _hoisted_13, [
                    createBaseVNode("span", _hoisted_14, toDisplayString(unref(t)("main.home.apps")) + ":", 1),
                    createVNode(_component_el_tag, {
                      type: "info",
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("6 " + toDisplayString(unref(t)("main.home.apps_loaded")), 1)
                      ]),
                      _: 1
                    })
                  ])
                ])
              ]),
              _: 1
            }, 8, ["title"])
          ])
        ]),
        createBaseVNode("div", _hoisted_15, [
          createBaseVNode("div", _hoisted_16, [
            createVNode(unref(BtcChartDemo), {
              gap: 8,
              "cols-per-row": 4,
              "chart-height": "300px"
            })
          ])
        ])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fffdd0c7"]]);
export {
  index as default
};
