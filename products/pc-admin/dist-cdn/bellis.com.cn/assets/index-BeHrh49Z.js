import { b as defineComponent, i as ref, j as computed, n as createElementBlock, o as openBlock, q as createBaseVNode, f as createBlock, aF as withKeys, U as withModifiers, D as normalizeClass, w as toDisplayString, N as createCommentVNode, g as unref, aG as ElImageViewer, aH as Teleport, F as Fragment, z as _export_sfc, u as useI18n, ay as useThemePlugin, aI as CommonColumns, B as BtcMessage, a3 as BtcConfirm, t as createVNode, x as withCtx, af as _sfc_main$2, ag as _sfc_main$3, az as _sfc_main$4, E as ElButton, _ as __unplugin_components_0, aj as __unplugin_components_1, ak as _sfc_main$5, al as _sfc_main$6, am as __unplugin_components_5, an as _sfc_main$7, ap as _sfc_main$8, L as ElUpload, P as ElIcon, aJ as upload_filled_default, y as createTextVNode, aK as ElDialog, aa as ElDescriptions, ab as ElDescriptionsItem, aL as ElLink, aM as DEFAULT_OPERATION_WIDTH } from "./vendor-CQyebC7G.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-Df5AdCU7.js";
import { s as service } from "./eps-service-CyhGCtaT.js";
import "./echarts-vendor-B3YNM73f.js";
const _hoisted_1$1 = { class: "btc-file-thumbnail" };
const _hoisted_2$1 = ["onKeydown"];
const _hoisted_3$1 = ["src"];
const _hoisted_4$1 = { class: "btc-file-thumbnail__icon-text" };
const Z_INDEX = 4e3;
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BtcFileThumbnailCell",
  props: {
    modelValue: { default: "" },
    mime: { default: "" },
    originalName: { default: "" }
  },
  setup(__props) {
    const props = __props;
    const visible = ref(false);
    const previewList = computed(() => props.modelValue ? [props.modelValue] : []);
    const extension = computed(() => {
      const nameSource = props.originalName || props.modelValue || "";
      const matched = nameSource.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
      return matched ? matched[1].toLowerCase() : "";
    });
    const isImage = computed(() => {
      if (props.mime) {
        return props.mime.startsWith("image/");
      }
      const ext = extension.value;
      return ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(ext);
    });
    const extensionLabel = computed(() => {
      if (!extension.value) {
        return "FILE";
      }
      return extension.value.length > 4 ? extension.value.slice(0, 4).toUpperCase() : extension.value.toUpperCase();
    });
    const typeClass = computed(() => {
      const ext = extension.value;
      if (["xls", "xlsx", "csv"].includes(ext)) return "btc-file-thumbnail__icon--excel";
      if (["ppt", "pptx"].includes(ext)) return "btc-file-thumbnail__icon--ppt";
      if (["doc", "docx"].includes(ext)) return "btc-file-thumbnail__icon--word";
      if (["pdf"].includes(ext)) return "btc-file-thumbnail__icon--pdf";
      if (["txt", "md"].includes(ext)) return "btc-file-thumbnail__icon--text";
      return "btc-file-thumbnail__icon--default";
    });
    const openPreview = () => {
      if (!isImage.value || !props.modelValue) return;
      visible.value = true;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("div", _hoisted_1$1, [
          isImage.value ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "btc-file-thumbnail__image",
            role: "button",
            tabindex: "0",
            onClick: withModifiers(openPreview, ["stop"]),
            onKeydown: withKeys(withModifiers(openPreview, ["stop", "prevent"]), ["enter"])
          }, [
            createBaseVNode("img", {
              src: __props.modelValue,
              alt: ""
            }, null, 8, _hoisted_3$1)
          ], 40, _hoisted_2$1)) : (openBlock(), createElementBlock("div", {
            key: 1,
            class: normalizeClass(["btc-file-thumbnail__icon", typeClass.value])
          }, [
            createBaseVNode("span", _hoisted_4$1, toDisplayString(extensionLabel.value), 1)
          ], 2))
        ]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          visible.value ? (openBlock(), createBlock(unref(ElImageViewer), {
            key: 0,
            "z-index": Z_INDEX,
            "url-list": previewList.value,
            "initial-index": 0,
            onClose: _cache[0] || (_cache[0] = ($event) => visible.value = false)
          }, null, 8, ["url-list"])) : createCommentVNode("", true)
        ]))
      ], 64);
    };
  }
});
var BtcFileThumbnailCell = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-065ae60f"]]);
const _hoisted_1 = { class: "files-page" };
const _hoisted_2 = { class: "btc-crud-primary-actions" };
const _hoisted_3 = { class: "dialog-footer" };
const _hoisted_4 = { key: 1 };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "DataFilesList"
  },
  __name: "index",
  setup(__props) {
    useI18n();
    const loading = ref(false);
    const uploading = ref(false);
    const crudRef = ref();
    const tableRef = ref();
    const uploadRef = ref();
    const detailVisible = ref(false);
    const detailRow = ref(null);
    const uploadVisible = ref(false);
    const fileList = ref([]);
    const tableSelection = computed(() => {
      return crudRef.value?.selection || [];
    });
    const selectionCount = computed(() => tableSelection.value.length);
    const theme = useThemePlugin();
    const isMinimal = computed(() => theme.buttonStyle?.value === "minimal");
    const uploadButtonConfig = computed(() => ({
      icon: "upload",
      type: "primary",
      tooltip: "上传文件",
      ariaLabel: "上传文件",
      disabled: loading.value,
      onClick: () => handleUpload()
    }));
    const deleteButtonConfig = computed(() => ({
      icon: "delete",
      type: "danger",
      tooltip: "删除文件",
      ariaLabel: "删除文件",
      badge: selectionCount.value || void 0,
      disabled: selectionCount.value === 0 || loading.value,
      onClick: () => handleDelete()
    }));
    const OPERATION_WIDTH = DEFAULT_OPERATION_WIDTH + 60;
    const columns = computed(() => [
      CommonColumns.selection(),
      CommonColumns.index(),
      {
        label: "缩略图",
        prop: "fileUrl",
        width: 88,
        align: "center",
        headerAlign: "center",
        component: {
          name: BtcFileThumbnailCell,
          props: (scope) => ({
            modelValue: scope.row.fileUrl,
            mime: scope.row.mime,
            originalName: scope.row.originalName
          })
        }
      },
      {
        label: "文件名",
        prop: "originalName",
        minWidth: 200
      },
      {
        label: "文件类型",
        prop: "mime",
        width: 120
      },
      {
        label: "文件大小",
        prop: "sizeBytes",
        width: 120,
        formatter: (row) => formatSize(row.sizeBytes)
      },
      {
        label: "上传时间",
        prop: "createdAt",
        width: 180
      },
      {
        type: "op",
        label: "操作",
        width: OPERATION_WIDTH,
        align: "center",
        fixed: "right",
        buttons: [
          {
            label: "分享",
            type: "success",
            icon: "share",
            onClick: ({ scope }) => handleShare(scope.row)
          },
          {
            label: "详情",
            type: "primary",
            icon: "info",
            onClick: ({ scope }) => handleDetail(scope.row)
          },
          {
            label: "删除",
            type: "danger",
            icon: "delete",
            onClick: ({ scope }) => handleDeleteSingle(scope.row)
          }
        ]
      }
    ]);
    const epsFileService = service.upload?.file?.files;
    function normalizePageResponse(response, page, size) {
      if (!response) {
        return {
          list: [],
          total: 0,
          pagination: { page, size, total: 0 }
        };
      }
      if (Array.isArray(response.list) && response.pagination) {
        const { pagination } = response;
        const total = Number(
          pagination.total ?? pagination.count ?? response.total ?? response.pagination?.total ?? 0
        );
        return {
          list: response.list,
          total,
          pagination: {
            page: Number(pagination.page ?? page),
            size: Number(pagination.size ?? size),
            total
          }
        };
      }
      if (Array.isArray(response.records)) {
        const total = Number(response.total ?? response.pagination?.total ?? 0);
        return {
          list: response.records,
          total,
          pagination: {
            page: Number(response.current ?? page),
            size: Number(response.size ?? size),
            total
          }
        };
      }
      if (Array.isArray(response.list) && typeof response.total !== "undefined") {
        return {
          list: response.list,
          total: Number(response.total ?? 0),
          pagination: {
            page,
            size,
            total: Number(response.total ?? 0)
          }
        };
      }
      if (Array.isArray(response)) {
        return {
          list: response,
          total: response.length,
          pagination: { page, size, total: response.length }
        };
      }
      return {
        list: [],
        total: 0,
        pagination: { page, size, total: 0 }
      };
    }
    const fileService = {
      async page(params = {}) {
        const page = Number(params.page ?? 1);
        const size = Number(params.size ?? 20);
        const keyword = params.keyword ? String(params.keyword) : void 0;
        const pageFn = epsFileService?.page;
        if (typeof pageFn !== "function") {
          throw new Error("未找到文件分页服务，请先同步 EPS 元数据");
        }
        const payload = {
          page,
          size
        };
        if (keyword) {
          payload.keyword = keyword;
        }
        const response = await pageFn(payload);
        const normalized = normalizePageResponse(response, page, size);
        return {
          list: normalized.list,
          total: normalized.total,
          pagination: normalized.pagination
        };
      },
      async add() {
        throw new Error("文件列表不支持新增操作");
      },
      async update() {
        throw new Error("文件列表不支持编辑操作");
      },
      async delete(id) {
        const deleteFn = epsFileService?.delete;
        if (typeof deleteFn !== "function") {
          throw new Error("未找到文件删除服务，请先同步 EPS 元数据");
        }
        return deleteFn(id);
      },
      async deleteBatch(ids) {
        const deleteFn = epsFileService?.delete;
        if (typeof deleteFn !== "function") {
          throw new Error("未找到文件删除服务，请先同步 EPS 元数据");
        }
        await Promise.all(ids.map((id) => deleteFn(id)));
      }
    };
    const handleUpload = () => {
      uploadVisible.value = true;
      fileList.value = [];
    };
    const handleFileChange = (_file, uploadFiles) => {
      fileList.value = [...uploadFiles];
    };
    const handleFileRemove = (_file, uploadFiles) => {
      fileList.value = [...uploadFiles];
    };
    const handleConfirmUpload = async () => {
      if (fileList.value.length === 0) {
        BtcMessage.warning("请选择要上传的文件");
        return;
      }
      uploading.value = true;
      try {
        const formData = new FormData();
        fileList.value.forEach((file) => {
          if (file.raw) {
            formData.append("file", file.raw);
          }
        });
        const uploadFn = epsFileService?.upload;
        if (typeof uploadFn !== "function") {
          throw new Error("未找到文件上传服务，请先同步 EPS 元数据");
        }
        await uploadFn(formData);
        BtcMessage.success("上传成功");
        uploadVisible.value = false;
        fileList.value = [];
        crudRef.value?.crud?.refresh();
      } catch (error) {
        BtcMessage.error(error?.message || "上传失败");
      } finally {
        uploading.value = false;
      }
    };
    const handleDelete = async () => {
      if (tableSelection.value.length === 0) {
        BtcMessage.warning("请选择要删除的文件");
        return;
      }
      await BtcConfirm(`确定要删除选中的 ${tableSelection.value.length} 个文件吗？`, "提示", {
        type: "warning"
      });
      loading.value = true;
      try {
        const ids = tableSelection.value.map((item) => item.id);
        await fileService.deleteBatch(ids);
        BtcMessage.success("删除成功");
        crudRef.value?.crud?.refresh();
      } catch (error) {
        BtcMessage.error(error?.message || "删除失败");
      } finally {
        loading.value = false;
      }
    };
    const handleDeleteSingle = async (row) => {
      await BtcConfirm("确定要删除该文件吗？", "提示", { type: "warning" });
      loading.value = true;
      try {
        await fileService.delete(row.id);
        BtcMessage.success("删除成功");
        crudRef.value?.crud?.refresh();
      } catch (error) {
        BtcMessage.error(error?.message || "删除失败");
      } finally {
        loading.value = false;
      }
    };
    function formatSize(value) {
      const size = Number(value || 0);
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
      if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    async function handleShare(row) {
      if (!row?.fileUrl) {
        BtcMessage.warning("当前文件暂无可分享的链接");
        return;
      }
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(row.fileUrl);
        } else {
          const input = document.createElement("input");
          input.value = row.fileUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand("copy");
          document.body.removeChild(input);
        }
        BtcMessage.success("文件链接已复制");
      } catch (error) {
        console.error("copy link error", error);
        BtcMessage.error("复制链接失败，请手动复制");
      }
    }
    function handleDetail(row) {
      detailRow.value = row;
      detailVisible.value = true;
    }
    return (_ctx, _cache) => {
      const _component_btc_refresh_btn = _sfc_main$3;
      const _component_btc_flex1 = __unplugin_components_1;
      const _component_btc_search_key = _sfc_main$5;
      const _component_btc_crud_actions = _sfc_main$6;
      const _component_btc_row = _sfc_main$2;
      const _component_btc_table = __unplugin_components_5;
      const _component_btc_pagination = _sfc_main$7;
      const _component_btc_crud = _sfc_main$8;
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_link = ElLink;
      const _component_el_descriptions = ElDescriptions;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_btc_crud, {
          ref_key: "crudRef",
          ref: crudRef,
          class: "files-page",
          service: fileService
        }, {
          default: withCtx(() => [
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_2, [
                  createVNode(_component_btc_refresh_btn),
                  isMinimal.value ? (openBlock(), createBlock(unref(_sfc_main$4), {
                    key: 0,
                    class: "btc-crud-action-icon",
                    config: uploadButtonConfig.value
                  }, null, 8, ["config"])) : (openBlock(), createBlock(unref(ElButton), {
                    key: 1,
                    type: "primary",
                    class: "btc-crud-btn",
                    loading: loading.value,
                    onClick: handleUpload
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(__unplugin_components_0), {
                        class: "btc-crud-btn__icon",
                        name: "upload"
                      }),
                      _cache[4] || (_cache[4] = createBaseVNode("span", { class: "btc-crud-btn__text" }, "上传文件", -1))
                    ]),
                    _: 1
                  }, 8, ["loading"])),
                  isMinimal.value ? (openBlock(), createBlock(unref(_sfc_main$4), {
                    key: 2,
                    class: "btc-crud-action-icon",
                    config: deleteButtonConfig.value
                  }, null, 8, ["config"])) : (openBlock(), createBlock(unref(ElButton), {
                    key: 3,
                    type: "danger",
                    class: "btc-crud-btn",
                    disabled: selectionCount.value === 0 || loading.value,
                    loading: loading.value,
                    onClick: handleDelete
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(__unplugin_components_0), {
                        class: "btc-crud-btn__icon",
                        name: "delete"
                      }),
                      _cache[5] || (_cache[5] = createBaseVNode("span", { class: "btc-crud-btn__text" }, "删除文件", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled", "loading"]))
                ]),
                createVNode(_component_btc_flex1),
                createVNode(_component_btc_search_key),
                createVNode(_component_btc_crud_actions)
              ]),
              _: 1
            }),
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_table, {
                  ref_key: "tableRef",
                  ref: tableRef,
                  columns: columns.value,
                  autoHeight: true,
                  border: "",
                  rowKey: "id"
                }, null, 8, ["columns"])
              ]),
              _: 1
            }),
            createVNode(_component_btc_row, null, {
              default: withCtx(() => [
                createVNode(_component_btc_flex1),
                createVNode(_component_btc_pagination)
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 512),
        createVNode(unref(ElDialog), {
          modelValue: uploadVisible.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => uploadVisible.value = $event),
          title: "上传文件",
          width: "500px"
        }, {
          footer: withCtx(() => [
            createBaseVNode("span", _hoisted_3, [
              createVNode(unref(ElButton), {
                onClick: _cache[0] || (_cache[0] = ($event) => uploadVisible.value = false)
              }, {
                default: withCtx(() => [..._cache[8] || (_cache[8] = [
                  createTextVNode("取消", -1)
                ])]),
                _: 1
              }),
              createVNode(unref(ElButton), {
                type: "primary",
                loading: uploading.value,
                onClick: handleConfirmUpload
              }, {
                default: withCtx(() => [..._cache[9] || (_cache[9] = [
                  createTextVNode(" 确认上传 ", -1)
                ])]),
                _: 1
              }, 8, ["loading"])
            ])
          ]),
          default: withCtx(() => [
            createVNode(unref(ElUpload), {
              ref_key: "uploadRef",
              ref: uploadRef,
              class: "upload-demo",
              drag: "",
              action: "#",
              "auto-upload": false,
              "on-change": handleFileChange,
              "on-remove": handleFileRemove,
              "file-list": fileList.value
            }, {
              tip: withCtx(() => [..._cache[6] || (_cache[6] = [
                createBaseVNode("div", { class: "el-upload__tip" }, " 支持单个或批量上传，单个文件不超过50MB ", -1)
              ])]),
              default: withCtx(() => [
                createVNode(unref(ElIcon), { class: "el-icon--upload" }, {
                  default: withCtx(() => [
                    createVNode(unref(upload_filled_default))
                  ]),
                  _: 1
                }),
                _cache[7] || (_cache[7] = createBaseVNode("div", { class: "el-upload__text" }, [
                  createTextVNode(" 将文件拖到此处，或"),
                  createBaseVNode("em", null, "点击上传")
                ], -1))
              ]),
              _: 1
            }, 8, ["file-list"])
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(unref(ElDialog), {
          modelValue: detailVisible.value,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => detailVisible.value = $event),
          title: "文件详情",
          width: "420px"
        }, {
          footer: withCtx(() => [
            createVNode(unref(ElButton), {
              onClick: _cache[2] || (_cache[2] = ($event) => detailVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[11] || (_cache[11] = [
                createTextVNode("关闭", -1)
              ])]),
              _: 1
            })
          ]),
          default: withCtx(() => [
            createVNode(_component_el_descriptions, {
              column: 1,
              border: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_el_descriptions_item, { label: "文件名" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.originalName || "-"), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "类型" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.mime || "-"), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "大小" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(formatSize(detailRow.value?.sizeBytes)), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "上传时间" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(detailRow.value?.createdAt || "-"), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, { label: "链接" }, {
                  default: withCtx(() => [
                    detailRow.value?.fileUrl ? (openBlock(), createBlock(_component_el_link, {
                      key: 0,
                      href: detailRow.value.fileUrl,
                      target: "_blank",
                      type: "primary"
                    }, {
                      default: withCtx(() => [..._cache[10] || (_cache[10] = [
                        createTextVNode(" 打开文件 ", -1)
                      ])]),
                      _: 1
                    }, 8, ["href"])) : (openBlock(), createElementBlock("span", _hoisted_4, "-"))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b185f95e"]]);
export {
  index as default
};
