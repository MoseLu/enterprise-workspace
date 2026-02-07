import { b as defineComponent, m as useI18n, i as ref, J as reactive, j as computed, K as onMounted, I as nextTick, n as createElementBlock, o as openBlock, t as createVNode, x as withCtx, q as createBaseVNode, G as withDirectives, E as ElButton, y as createTextVNode, w as toDisplayString, g as unref, L as ElUpload, f as createBlock, M as ElScrollbar, F as Fragment, v as renderList, D as normalizeClass, N as createCommentVNode, O as ElImage, P as ElIcon, Q as picture_default, R as video_play_default, S as document_default, T as check_default, U as withModifiers, V as zoom_in_default, W as download_default, X as delete_default, Y as vLoading, Z as ElPagination, $ as ElText, _ as __unplugin_components_0, a0 as ElInput, a1 as search_default, a2 as BtcViewGroup, B as BtcMessage, a3 as BtcConfirm, z as _export_sfc } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-CvJd6wHo.js";
import "./eps-service-BXEAd5O1.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1 = { class: "file-template-page" };
const _hoisted_2 = { class: "file-template-left" };
const _hoisted_3 = { class: "header" };
const _hoisted_4 = { class: "header-actions" };
const _hoisted_5 = { class: "search" };
const _hoisted_6 = ["onClick"];
const _hoisted_7 = { class: "category-name" };
const _hoisted_8 = { class: "category-count" };
const _hoisted_9 = { class: "file-template-right" };
const _hoisted_10 = { class: "header" };
const _hoisted_11 = {
  key: 0,
  class: "template-grid"
};
const _hoisted_12 = ["onClick", "onDblclick"];
const _hoisted_13 = { class: "image-error" };
const _hoisted_14 = {
  key: 1,
  class: "template-video"
};
const _hoisted_15 = ["src"];
const _hoisted_16 = { class: "video-overlay" };
const _hoisted_17 = {
  key: 2,
  class: "template-audio"
};
const _hoisted_18 = ["src"];
const _hoisted_19 = ["title"];
const _hoisted_20 = {
  key: 4,
  class: "template-selected"
};
const _hoisted_21 = { class: "template-actions" };
const _hoisted_22 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_23 = { class: "pagination" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "DataFilesTemplate"
  },
  __name: "index",
  setup(__props) {
    const { t } = useI18n();
    const viewGroupRef = ref();
    const uploadRef = ref();
    const loading = ref(false);
    const selectedTemplates = ref([]);
    const selectedCategoryId = ref(null);
    const categoryKeyword = ref("");
    const pagination = reactive({
      page: 1,
      size: 20,
      total: 0
    });
    const categories = computed(() => [
      { id: "all", name: t("data.file.template.category.all"), count: 0 },
      { id: "image", name: t("data.file.template.category.image"), count: 0 },
      { id: "video", name: t("data.file.template.category.video"), count: 0 },
      { id: "audio", name: t("data.file.template.category.audio"), count: 0 },
      { id: "document", name: t("data.file.template.category.document"), count: 0 },
      { id: "other", name: t("data.file.template.category.other"), count: 0 }
    ]);
    const filteredCategories = computed(() => {
      if (!categoryKeyword.value) return categories.value;
      const keyword = categoryKeyword.value.toLowerCase();
      return categories.value.filter(
        (cat) => cat.name.toLowerCase().includes(keyword)
      );
    });
    computed(() => {
      return categories.value.find((cat) => cat.id === selectedCategoryId.value);
    });
    const templateList = ref([]);
    const uploadAction = computed(() => {
      return "/api/base/open/upload";
    });
    const uploadHeaders = computed(() => {
      return {};
    });
    const handleCategorySelect = (category) => {
      selectedCategoryId.value = category.id;
      pagination.page = 1;
      viewGroupRef.value?.select(category);
      refreshTemplateList();
    };
    const handleRefreshCategories = () => {
      BtcMessage.info(t("data.file.template.refresh_categories"));
    };
    const isImage = (template) => {
      return template.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(template.name);
    };
    const isVideo = (template) => {
      return template.type?.startsWith("video/") || /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(template.name);
    };
    const isAudio = (template) => {
      return template.type?.startsWith("audio/") || /\.(mp3|wav|flac|aac|ogg)$/i.test(template.name);
    };
    const handleTemplateSelect = (template) => {
      const index2 = selectedTemplates.value.indexOf(template.id);
      if (index2 >= 0) {
        selectedTemplates.value.splice(index2, 1);
      } else {
        selectedTemplates.value.push(template.id);
      }
    };
    const handleTemplatePreview = (template) => {
      if (isImage(template)) {
        return;
      }
      window.open(template.url, "_blank");
    };
    const handleTemplateDownload = (template) => {
      const link = document.createElement("a");
      link.href = template.url;
      link.download = template.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    const handleTemplateDelete = async (template) => {
      try {
        await BtcConfirm(
          t("crud.message.delete_confirm"),
          t("common.button.confirm"),
          { type: "warning" }
        );
        BtcMessage.success(t("crud.message.delete_success"));
        refreshTemplateList();
      } catch (error) {
      }
    };
    const handleBatchDelete = async () => {
      try {
        await BtcConfirm(
          t("crud.message.delete_confirm"),
          t("common.button.confirm"),
          { type: "warning" }
        );
        BtcMessage.success(t("crud.message.delete_success"));
        selectedTemplates.value = [];
        refreshTemplateList();
      } catch (error) {
      }
    };
    const beforeUpload = (file) => {
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        BtcMessage.error(t("data.file.template.upload.size_limit"));
        return false;
      }
      return true;
    };
    const handleUploadSuccess = (response, file) => {
      BtcMessage.success(t("data.file.template.upload.success"));
      refreshTemplateList();
    };
    const handleUploadError = (error) => {
      BtcMessage.error(t("data.file.template.upload.failed"));
    };
    const refreshTemplateList = async () => {
      loading.value = true;
      try {
        setTimeout(() => {
          templateList.value = [];
          pagination.total = 0;
          loading.value = false;
        }, 500);
      } catch (error) {
        console.error("加载模板列表失败:", error);
        loading.value = false;
      }
    };
    const handlePageChange = () => {
      refreshTemplateList();
    };
    const handleSizeChange = () => {
      pagination.page = 1;
      refreshTemplateList();
    };
    onMounted(() => {
      nextTick(() => {
        handleCategorySelect(categories.value[0]);
      });
    });
    return (_ctx, _cache) => {
      const _component_el_text = ElText;
      const _component_btc_svg = __unplugin_components_0;
      const _component_el_input = ElInput;
      const _component_el_icon = ElIcon;
      const _component_el_scrollbar = ElScrollbar;
      const _component_el_button = ElButton;
      const _component_el_upload = ElUpload;
      const _component_el_image = ElImage;
      const _component_el_pagination = ElPagination;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcViewGroup), {
          ref_key: "viewGroupRef",
          ref: viewGroupRef,
          "left-width": "280px",
          "left-title": unref(t)("data.file.template.categories"),
          "right-title": unref(t)("data.file.template.template_list")
        }, {
          left: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("div", _hoisted_3, [
                createVNode(_component_el_text, { class: "label" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("data.file.template.categories")), 1)
                  ]),
                  _: 1
                }),
                createBaseVNode("div", _hoisted_4, [
                  createBaseVNode("div", {
                    class: "icon",
                    onClick: handleRefreshCategories
                  }, [
                    createVNode(_component_btc_svg, { name: "refresh" })
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_5, [
                createVNode(_component_el_input, {
                  modelValue: categoryKeyword.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => categoryKeyword.value = $event),
                  placeholder: unref(t)("data.file.template.search_category"),
                  clearable: "",
                  "prefix-icon": unref(search_default)
                }, null, 8, ["modelValue", "placeholder", "prefix-icon"])
              ]),
              createVNode(_component_el_scrollbar, { class: "category-list" }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(filteredCategories.value, (category) => {
                    return openBlock(), createElementBlock("div", {
                      key: category.id,
                      class: normalizeClass(["category-item", { active: selectedCategoryId.value === category.id }]),
                      onClick: ($event) => handleCategorySelect(category)
                    }, [
                      createVNode(_component_el_icon, { class: "category-icon" }, {
                        default: withCtx(() => [
                          createVNode(unref(document_default))
                        ]),
                        _: 1
                      }),
                      createBaseVNode("span", _hoisted_7, toDisplayString(category.name), 1),
                      createBaseVNode("span", _hoisted_8, "(" + toDisplayString(category.count || 0) + ")", 1)
                    ], 10, _hoisted_6);
                  }), 128))
                ]),
                _: 1
              })
            ])
          ]),
          right: withCtx(({ selected, keyword }) => [
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("div", _hoisted_10, [
                createVNode(_component_el_button, { onClick: refreshTemplateList }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("common.button.refresh")), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_upload, {
                  ref_key: "uploadRef",
                  ref: uploadRef,
                  action: uploadAction.value,
                  headers: uploadHeaders.value,
                  multiple: "",
                  "show-file-list": false,
                  "before-upload": beforeUpload,
                  "on-success": handleUploadSuccess,
                  "on-error": handleUploadError,
                  style: { "margin": "0 10px" }
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, { type: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("data.file.template.click_to_upload")), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["action", "headers"]),
                createVNode(_component_el_button, {
                  type: "danger",
                  disabled: selectedTemplates.value.length === 0,
                  onClick: handleBatchDelete
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("data.file.template.delete_selected")), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])
              ]),
              withDirectives((openBlock(), createBlock(_component_el_scrollbar, { class: "template-list" }, {
                default: withCtx(() => [
                  templateList.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(templateList.value, (template) => {
                      return openBlock(), createElementBlock("div", {
                        key: template.id,
                        class: normalizeClass(["template-item", { active: selectedTemplates.value.includes(template.id) }]),
                        onClick: ($event) => handleTemplateSelect(template),
                        onDblclick: ($event) => handleTemplatePreview(template)
                      }, [
                        isImage(template) ? (openBlock(), createBlock(_component_el_image, {
                          key: 0,
                          class: "template-image",
                          src: template.url,
                          "preview-src-list": [template.url],
                          fit: "contain",
                          lazy: ""
                        }, {
                          error: withCtx(() => [
                            createBaseVNode("div", _hoisted_13, [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(picture_default))
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        }, 8, ["src", "preview-src-list"])) : isVideo(template) ? (openBlock(), createElementBlock("div", _hoisted_14, [
                          createBaseVNode("video", {
                            src: template.url
                          }, null, 8, _hoisted_15),
                          createBaseVNode("div", _hoisted_16, [
                            createVNode(_component_el_icon, { class: "play-icon" }, {
                              default: withCtx(() => [
                                createVNode(unref(video_play_default))
                              ]),
                              _: 1
                            })
                          ])
                        ])) : isAudio(template) ? (openBlock(), createElementBlock("div", _hoisted_17, [
                          createVNode(_component_el_icon, { class: "audio-icon" }, {
                            default: withCtx(() => [
                              createVNode(unref(video_play_default))
                            ]),
                            _: 1
                          }),
                          createBaseVNode("audio", {
                            src: template.url,
                            controls: ""
                          }, null, 8, _hoisted_18)
                        ])) : (openBlock(), createBlock(_component_el_icon, {
                          key: 3,
                          class: "template-icon"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(document_default))
                          ]),
                          _: 1
                        })),
                        createBaseVNode("div", {
                          class: "template-name",
                          title: template.name
                        }, toDisplayString(template.name), 9, _hoisted_19),
                        selectedTemplates.value.includes(template.id) ? (openBlock(), createElementBlock("div", _hoisted_20, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(check_default))
                            ]),
                            _: 1
                          })
                        ])) : createCommentVNode("", true),
                        createBaseVNode("div", _hoisted_21, [
                          createVNode(_component_el_icon, {
                            class: "action-icon",
                            onClick: withModifiers(($event) => handleTemplatePreview(template), ["stop"])
                          }, {
                            default: withCtx(() => [
                              createVNode(unref(zoom_in_default))
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(_component_el_icon, {
                            class: "action-icon",
                            onClick: withModifiers(($event) => handleTemplateDownload(template), ["stop"])
                          }, {
                            default: withCtx(() => [
                              createVNode(unref(download_default))
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(_component_el_icon, {
                            class: "action-icon",
                            onClick: withModifiers(($event) => handleTemplateDelete(template), ["stop"])
                          }, {
                            default: withCtx(() => [
                              createVNode(unref(delete_default))
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ], 42, _hoisted_12);
                    }), 128))
                  ])) : (openBlock(), createElementBlock("div", _hoisted_22, [
                    createVNode(_component_el_icon, { class: "empty-icon" }, {
                      default: withCtx(() => [
                        createVNode(unref(document_default))
                      ]),
                      _: 1
                    }),
                    createBaseVNode("p", null, toDisplayString(unref(t)("data.file.template.empty_tip")), 1)
                  ]))
                ]),
                _: 1
              })), [
                [_directive_loading, loading.value]
              ]),
              createBaseVNode("div", _hoisted_23, [
                createVNode(_component_el_pagination, {
                  "current-page": pagination.page,
                  "onUpdate:currentPage": _cache[1] || (_cache[1] = ($event) => pagination.page = $event),
                  "page-size": pagination.size,
                  "onUpdate:pageSize": _cache[2] || (_cache[2] = ($event) => pagination.size = $event),
                  total: pagination.total,
                  background: "",
                  layout: "prev, pager, next, jumper, sizes, total",
                  "page-sizes": [20, 40, 60, 80, 100],
                  onSizeChange: handleSizeChange,
                  onCurrentChange: handlePageChange
                }, null, 8, ["current-page", "page-size", "total"])
              ])
            ])
          ]),
          _: 1
        }, 8, ["left-title", "right-title"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7c6aa39f"]]);
export {
  index as default
};
