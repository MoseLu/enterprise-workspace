import { m as useI18n, i as ref, j as computed, C as watch, K as onMounted, b as defineComponent, ay as useThemePlugin, n as createElementBlock, o as openBlock, q as createBaseVNode, G as withDirectives, f as createBlock, N as createCommentVNode, t as createVNode, g as unref, az as _sfc_main$1, x as withCtx, _ as __unplugin_components_0, E as ElButton, P as ElIcon, a1 as search_default, aA as isRef, a0 as ElInput, aB as ElOption, aC as ElSelect, Y as vLoading, F as Fragment, v as renderList, aD as BtcProcessCard, aE as ElEmpty, aa as ElDescriptions, ab as ElDescriptionsItem, y as createTextVNode, w as toDisplayString, a9 as formatDateTime, ad as __unplugin_components_3, z as _export_sfc } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import "./auth-api-CvJd6wHo.js";
import { u as useMessage } from "./use-message-Dt-sXeNq.js";
import { s as service } from "./eps-service-BXEAd5O1.js";
import "./echarts-vendor-B3YNM73f.js";
const mapCheckStatus = (checkStatus) => {
  if (!checkStatus) return "pending";
  const statusMap = {
    "pending": "pending",
    "待开始": "pending",
    "running": "running",
    "进行中": "running",
    "paused": "paused",
    "已暂停": "paused",
    "暂停": "paused",
    "暂停中": "paused",
    "completed": "completed",
    "已完成": "completed",
    "已结束": "completed",
    "结束": "completed"
  };
  return statusMap[checkStatus] || "pending";
};
const mapToProcessItem = (item, statusValue) => {
  const scheduledStartTime = item.startTime ? new Date(item.startTime) : void 0;
  const scheduledEndTime = item.endTime ? new Date(item.endTime) : void 0;
  const status = mapCheckStatus(statusValue);
  const hasActualStart = status !== "pending";
  const hasActualEnd = status === "completed";
  const actualStartTime = hasActualStart ? scheduledStartTime : void 0;
  const actualEndTime = hasActualEnd ? scheduledEndTime : void 0;
  const result = {
    id: String(item.id || ""),
    name: item.remark || item.checkNo || `盘点-${item.id}`,
    // 优先使用 remark 作为流程标题
    status,
    ...scheduledStartTime !== void 0 && { scheduledStartTime },
    ...scheduledEndTime !== void 0 && { scheduledEndTime },
    ...actualStartTime !== void 0 && { actualStartTime },
    ...actualEndTime !== void 0 && { actualEndTime },
    ...item.remark !== void 0 && { description: item.remark }
  };
  return result;
};
function useInventoryProcess() {
  const { t } = useI18n();
  const message = useMessage();
  const processes = ref([]);
  const loading = ref(false);
  const searchKeyword = ref("");
  const statusFilter = ref("");
  const filteredProcesses = computed(() => {
    let result = processes.value;
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(keyword)
      );
    }
    if (statusFilter.value) {
      result = result.filter((p) => p.status === statusFilter.value);
    }
    return result;
  });
  const refreshProcessStatus = async (processId) => {
    try {
      const statusResponse = await service.logistics?.warehouse?.check?.status?.({ id: processId });
      return typeof statusResponse === "string" ? statusResponse : statusResponse?.status || statusResponse?.checkStatus || statusResponse?.data?.status || statusResponse?.data?.checkStatus;
    } catch (error) {
      console.error(`[InventoryProcess] Failed to refresh status for process ${processId}:`, error);
      return void 0;
    }
  };
  const loadProcesses = async () => {
    try {
      loading.value = true;
      const response = await service.logistics?.warehouse?.check?.info?.();
      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data?.list) {
          list = response.data.list;
        } else if (response.data?.records) {
          list = response.data.records;
        } else if (response.data && typeof response.data === "object") {
          list = [response.data];
        }
      } else if (response?.list) {
        list = response.list;
      } else if (response?.records) {
        list = response.records;
      } else if (response && typeof response === "object") {
        list = [response];
      }
      let mappedList = list.map((item) => {
        return mapToProcessItem(item, item.checkStatus);
      });
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        mappedList = mappedList.filter(
          (p) => p.name.toLowerCase().includes(keyword)
        );
      }
      if (statusFilter.value) {
        mappedList = mappedList.filter((p) => p.status === statusFilter.value);
      }
      processes.value = mappedList;
    } catch (error) {
      console.error("[InventoryProcess] Load failed:", error);
      message.error(t("process.load.failed") || "加载流程列表失败");
    } finally {
      loading.value = false;
    }
  };
  let searchTimer = null;
  watch(searchKeyword, () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      loadProcesses();
    }, 500);
  });
  watch(statusFilter, () => {
    loadProcesses();
  });
  const startProcess = async (process) => {
    if (process.actualStartTime) {
      message.warning(t("process.start.already") || "流程已经开始，不能重复开始");
      return;
    }
    try {
      loading.value = true;
      await service.logistics?.warehouse?.check?.start?.({ id: process.id });
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index2 = processes.value.findIndex((p) => p.id === process.id);
        if (index2 !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index2];
          if (!currentProcess) return;
          const scheduledStartTime = currentProcess.scheduledStartTime;
          processes.value[index2] = {
            ...currentProcess,
            status: mappedStatus,
            ...scheduledStartTime !== void 0 && { actualStartTime: scheduledStartTime }
            // 使用计划开始时间作为实际开始时间
          };
        }
      }
      message.success(t("process.start.success", { name: process.name }) || `流程 "${process.name}" 已开始`);
    } catch (error) {
      console.error("[InventoryProcess] Start failed:", error);
      message.error(t("process.start.failed") || "开始流程失败");
    } finally {
      loading.value = false;
    }
  };
  const pauseProcess = async (process, reason) => {
    if (process.status !== "running") {
      message.warning(t("process.pause.invalid") || "只有运行中的流程才能暂停");
      return;
    }
    try {
      loading.value = true;
      await service.logistics?.warehouse?.check?.pause?.({ id: process.id, reason });
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index2 = processes.value.findIndex((p) => p.id === process.id);
        if (index2 !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index2];
          if (currentProcess) {
            processes.value[index2] = {
              ...currentProcess,
              status: mappedStatus
            };
          }
        }
      }
      message.success(t("process.pause.success", { name: process.name }) || `流程 "${process.name}" 已暂停`);
    } catch (error) {
      console.error("[InventoryProcess] Pause failed:", error);
      message.error(t("process.pause.failed") || "暂停流程失败");
    } finally {
      loading.value = false;
    }
  };
  const resumeProcess = async (process) => {
    if (process.status !== "paused") {
      message.warning(t("process.resume.invalid") || "只有暂停的流程才能恢复");
      return;
    }
    try {
      loading.value = true;
      await service.logistics?.warehouse?.check?.recover?.({ id: process.id });
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index2 = processes.value.findIndex((p) => p.id === process.id);
        if (index2 !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index2];
          if (currentProcess) {
            processes.value[index2] = {
              ...currentProcess,
              status: mappedStatus
            };
          }
        }
      }
      message.success(t("process.resume.success", { name: process.name }) || `流程 "${process.name}" 已恢复`);
    } catch (error) {
      console.error("[InventoryProcess] Resume failed:", error);
      message.error(t("process.resume.failed") || "恢复流程失败");
    } finally {
      loading.value = false;
    }
  };
  const endProcess = async (process) => {
    if (process.actualEndTime) {
      message.warning(t("process.end.already") || "流程已经结束，不能重复结束");
      return;
    }
    if (!process.actualStartTime) {
      message.warning(t("process.end.notStarted") || "流程尚未开始，不能结束");
      return;
    }
    try {
      loading.value = true;
      await service.logistics?.warehouse?.check?.finish?.({ id: process.id });
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index2 = processes.value.findIndex((p) => p.id === process.id);
        if (index2 !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index2];
          if (!currentProcess) return;
          const scheduledEndTime = currentProcess.scheduledEndTime;
          processes.value[index2] = {
            ...currentProcess,
            status: mappedStatus,
            ...scheduledEndTime !== void 0 && { actualEndTime: scheduledEndTime }
            // 使用计划结束时间作为实际结束时间
          };
        }
      }
      message.success(t("process.end.success", { name: process.name }) || `流程 "${process.name}" 已结束`);
    } catch (error) {
      console.error("[InventoryProcess] End failed:", error);
      message.error(t("process.end.failed") || "结束流程失败");
    } finally {
      loading.value = false;
    }
  };
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref(null);
  const viewProcessDetail = async (process) => {
    try {
      detailVisible.value = true;
      detailLoading.value = true;
      const response = await service.logistics?.warehouse?.check?.info?.({ id: process.id });
      detailData.value = response?.data || response || null;
    } catch (error) {
      console.error("[InventoryProcess] Load detail failed:", error);
      message.error(t("process.detail.load.failed") || "加载详情失败");
      detailVisible.value = false;
    } finally {
      detailLoading.value = false;
    }
  };
  onMounted(() => {
    loadProcesses();
  });
  return {
    processes,
    loading,
    searchKeyword,
    statusFilter,
    filteredProcesses,
    loadProcesses,
    startProcess,
    pauseProcess,
    resumeProcess,
    endProcess,
    viewProcessDetail,
    detailVisible,
    detailLoading,
    detailData
  };
}
const _hoisted_1 = { class: "inventory-process-page" };
const _hoisted_2 = { class: "inventory-process-page__toolbar" };
const _hoisted_3 = { class: "inventory-process-page__toolbar-left" };
const _hoisted_4 = { class: "inventory-process-page__toolbar-right" };
const _hoisted_5 = { class: "inventory-process-page__grid" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "BtcDataInventoryProcess"
  },
  __name: "index",
  setup(__props) {
    const {
      loading,
      searchKeyword,
      statusFilter,
      filteredProcesses,
      loadProcesses,
      startProcess,
      pauseProcess,
      resumeProcess,
      endProcess,
      viewProcessDetail,
      detailVisible,
      detailLoading,
      detailData
    } = useInventoryProcess();
    const handleStart = (process) => {
      startProcess(process);
    };
    const handlePause = (process) => {
      pauseProcess(process);
    };
    const handleResume = (process) => {
      resumeProcess(process);
    };
    const handleEnd = (process) => {
      endProcess(process);
    };
    const handleViewDetail = (process) => {
      viewProcessDetail(process);
    };
    const theme = useThemePlugin();
    const isMinimal = computed(() => theme.buttonStyle?.value === "minimal");
    const refreshButtonConfig = computed(() => ({
      icon: "refresh",
      tooltip: "刷新",
      ariaLabel: "刷新",
      type: "default",
      onClick: () => {
        if (!loading.value) {
          loadProcesses();
        }
      },
      disabled: loading.value
    }));
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_icon = ElIcon;
      const _component_el_input = ElInput;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_empty = ElEmpty;
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_descriptions = ElDescriptions;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            isMinimal.value ? (openBlock(), createBlock(unref(_sfc_main$1), {
              key: 0,
              config: refreshButtonConfig.value
            }, null, 8, ["config"])) : (openBlock(), createBlock(_component_el_button, {
              key: 1,
              class: "btc-crud-btn",
              loading: unref(loading),
              onClick: unref(loadProcesses)
            }, {
              default: withCtx(() => [
                createVNode(unref(__unplugin_components_0), {
                  class: "btc-crud-btn__icon",
                  name: "refresh"
                }),
                _cache[4] || (_cache[4] = createBaseVNode("span", { class: "btc-crud-btn__text" }, "刷新", -1))
              ]),
              _: 1
            }, 8, ["loading", "onClick"]))
          ]),
          createBaseVNode("div", _hoisted_4, [
            createVNode(_component_el_input, {
              modelValue: unref(searchKeyword),
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(searchKeyword) ? searchKeyword.value = $event : null),
              placeholder: "搜索流程名称...",
              clearable: "",
              style: { "width": "300px" }
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
            }, 8, ["modelValue"]),
            createVNode(_component_el_select, {
              modelValue: unref(statusFilter),
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(statusFilter) ? statusFilter.value = $event : null),
              placeholder: "筛选状态",
              clearable: "",
              style: { "width": "150px" }
            }, {
              default: withCtx(() => [
                createVNode(_component_el_option, {
                  label: "全部",
                  value: ""
                }),
                createVNode(_component_el_option, {
                  label: "待开始",
                  value: "pending"
                }),
                createVNode(_component_el_option, {
                  label: "进行中",
                  value: "running"
                }),
                createVNode(_component_el_option, {
                  label: "暂停中",
                  value: "paused"
                }),
                createVNode(_component_el_option, {
                  label: "已结束",
                  value: "completed"
                })
              ]),
              _: 1
            }, 8, ["modelValue"])
          ])
        ]),
        withDirectives((openBlock(), createElementBlock("div", _hoisted_5, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(filteredProcesses), (process) => {
            return openBlock(), createBlock(unref(BtcProcessCard), {
              key: process.id,
              process,
              onStart: handleStart,
              onPause: handlePause,
              onResume: handleResume,
              onEnd: handleEnd,
              onViewDetail: handleViewDetail
            }, null, 8, ["process"]);
          }), 128))
        ])), [
          [_directive_loading, unref(loading)]
        ]),
        !unref(loading) && unref(filteredProcesses).length === 0 ? (openBlock(), createBlock(_component_el_empty, {
          key: 0,
          description: "暂无流程数据",
          class: "inventory-process-page__empty"
        })) : createCommentVNode("", true),
        createVNode(unref(__unplugin_components_3), {
          modelValue: unref(detailVisible),
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(detailVisible) ? detailVisible.value = $event : null),
          title: "流程详情",
          width: "800px"
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[2] || (_cache[2] = ($event) => detailVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[5] || (_cache[5] = [
                createTextVNode("关闭", -1)
              ])]),
              _: 1
            })
          ]),
          default: withCtx(() => [
            withDirectives((openBlock(), createElementBlock("div", null, [
              unref(detailData) ? (openBlock(), createBlock(_component_el_descriptions, {
                key: 0,
                column: 2,
                border: ""
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_descriptions_item, { label: "盘点编号" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).checkNo || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "域ID" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).domainId || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "盘点类型" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).checkType || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "盘点状态" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).checkStatus || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "计划开始时间" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).startTime ? unref(formatDateTime)(unref(detailData).startTime) : "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "计划结束时间" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).endTime ? unref(formatDateTime)(unref(detailData).endTime) : "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "盘点人" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).checker || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "剩余时长" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).remainingSeconds ? `${Math.floor(unref(detailData).remainingSeconds / 60)}分钟` : "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, {
                    label: "备注",
                    span: 2
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).remark || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "创建时间" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).createdAt ? unref(formatDateTime)(unref(detailData).createdAt) : "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_descriptions_item, { label: "更新时间" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(detailData).updateAt ? unref(formatDateTime)(unref(detailData).updateAt) : "-"), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ])), [
              [_directive_loading, unref(detailLoading)]
            ])
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b4644752"]]);
export {
  index as default
};
