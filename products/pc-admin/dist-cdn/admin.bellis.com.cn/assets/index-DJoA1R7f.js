import { am as reactive, r as ref, b as computed, I as nextTick, G as watch, k as onMounted, ay as onUnmounted, a as defineComponent, y as onBeforeUnmount, e as createElementBlock, o as openBlock, n as normalizeStyle, f as normalizeClass, h as createBaseVNode, m as unref, az as renderSlot, F as Fragment, q as renderList, L as createCommentVNode, aA as withModifiers, i as _export_sfc, t as toDisplayString, l as createVNode, D as ElButton, w as withCtx, v as createTextVNode, E as ElIcon, ag as refresh_default, ar as video_play_default, ap as ElForm, aB as ElRow, aC as ElCol, aq as ElFormItem, J as ElSelect, K as ElOption, aD as ElSlider, R as ElInput, x as createBlock, aj as resolveDynamicComponent, p as loading_default, aE as circle_check_filled_default, aF as circle_close_filled_default, au as ElPopover, s as ElTag, ae as connection_default, aG as share_default, aH as lightning_default, aI as question_filled_default, aJ as video_pause_default, aK as zoom_out_default, a7 as ElDropdown, aL as withKeys, ac as ElDropdownMenu, ad as ElDropdownItem, aM as full_screen_default, aN as zoom_in_default, aw as ElCollapse, ax as ElCollapseItem, X as plus_default, a2 as ElEmpty, Z as delete_default, aO as ElRadioGroup, aP as ElRadio, an as ElAlert, aQ as createStaticVNode, al as ElInputNumber, Q as ElSwitch, A as ElDescriptions, B as ElDescriptionsItem, aR as setting_default, aS as isRef, at as ElDialog } from "./index-CeQEKVXA.js";
import { BtcConfirm, BtcMessage, BtcSearch, BtcGridGroup } from "@btc/shared-components";
import { NodeType, ConnectorType } from "@/types/strategy";
import { strategyService } from "@/services/strategy";
import { indexedDBManager } from "@/modules/strategy/utils/indexedDB";
import { BtcConfigForm, BtcConfigFormItem } from "@/components/btc-config-form";
import "@btc/shared-core";
import "@btc/shared-utils";
function useSelection(options) {
  const { nodes, connections, isOverlayEditing, connectionState, selectedNodeId, connectionOffsetY, getConnectionHandle, fallthrough } = options;
  const rubber = reactive({ active: false, startX: 0, startY: 0, x: 0, y: 0, w: 0, h: 0 });
  const multiSelectedNodeIds = ref(/* @__PURE__ */ new Set());
  const multiSelectedConnectionIds = ref(/* @__PURE__ */ new Set());
  const lastSelectionMode = ref("none");
  const updateNodeSelection = (newSet) => {
    multiSelectedNodeIds.value = new Set(newSet);
  };
  const updateConnectionSelection = (newSet) => {
    multiSelectedConnectionIds.value = new Set(newSet);
  };
  function clientToSvg(e) {
    const container = document.querySelector(".canvas-scroll");
    if (!container) return { x: 0, y: 0 };
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft || 0;
    const scrollTop = container.scrollTop || 0;
    const x = e.clientX - containerRect.left + scrollLeft;
    const y = e.clientY - containerRect.top + scrollTop;
    return { x, y };
  }
  function onCanvasMouseDown(e) {
    const target = e.target;
    const tag = target.tagName?.toLowerCase();
    if (tag === "svg") {
      if (e.button === 0 && !isOverlayEditing.value && !connectionState.isConnecting) {
        const p = clientToSvg(e);
        rubber.active = true;
        rubber.startX = rubber.x = p.x;
        rubber.startY = rubber.y = p.y;
        rubber.w = 0;
        rubber.h = 0;
        lastSelectionMode.value = "rubber";
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      fallthrough.handleCanvasMouseDown(e);
      return;
    }
    const isOnNode = target.closest("[data-node-id]") !== null || target.closest(".strategy-node") !== null;
    const isPathElement = tag === "path";
    const isOnConnection = isPathElement && (target.classList?.contains("connection-path") || target.getAttribute("data-connection-id") !== null);
    const isOnConnectionHandle = target.closest(".connection-handles-overlay") !== null;
    const isOnConnectionArrow = target.closest(".connection-arrow-group") !== null || target.closest(".connection-arrows") !== null;
    const isOnTempConnection = target.closest(".temp-connection-group") !== null || target.closest(".temp-connection-line") !== null;
    const isContentLayer = tag === "g" && target.classList?.contains("content-layer");
    const isBackground = !isOnNode && !isOnConnection && !isOnConnectionHandle && !isOnConnectionArrow && !isOnTempConnection || isContentLayer;
    if (e.button === 0 && isBackground && !isOverlayEditing.value && !connectionState.isConnecting) {
      const p = clientToSvg(e);
      rubber.active = true;
      rubber.startX = rubber.x = p.x;
      rubber.startY = rubber.y = p.y;
      rubber.w = 0;
      rubber.h = 0;
      lastSelectionMode.value = "rubber";
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    fallthrough.handleCanvasMouseDown(e);
  }
  function onCanvasMouseMove(e) {
    if (rubber.active) {
      const p = clientToSvg(e);
      const x1 = Math.min(rubber.startX, p.x);
      const y1 = Math.min(rubber.startY, p.y);
      const x2 = Math.max(rubber.startX, p.x);
      const y2 = Math.max(rubber.startY, p.y);
      rubber.x = Math.round(x1);
      rubber.y = Math.round(y1);
      rubber.w = Math.round(x2 - x1);
      rubber.h = Math.round(y2 - y1);
      e.stopPropagation();
      return;
    }
    fallthrough.handleCanvasMouseMove(e);
  }
  function onCanvasMouseUp(e) {
    if (rubber.active) {
      const rx = rubber.x;
      const ry = rubber.y;
      const rw = rubber.w;
      const rh = rubber.h;
      const r2 = { x1: rx, y1: ry, x2: rx + rw, y2: ry + rh };
      if (Math.abs(rw) < 5 && Math.abs(rh) < 5) {
        rubber.active = false;
        lastSelectionMode.value = "none";
        updateNodeSelection(/* @__PURE__ */ new Set());
        updateConnectionSelection(/* @__PURE__ */ new Set());
        e?.stopPropagation();
        e?.preventDefault();
        return;
      }
      const nextNodes = /* @__PURE__ */ new Set();
      nodes.value.forEach((n) => {
        const w = n.style?.width || 120;
        const h = n.style?.height || 60;
        const n2 = { x1: n.position.x, y1: n.position.y, x2: n.position.x + w, y2: n.position.y + h };
        const inter = !(n2.x2 < r2.x1 || n2.x1 > r2.x2 || n2.y2 < r2.y1 || n2.y1 > r2.y2);
        if (inter) nextNodes.add(n.id);
      });
      updateNodeSelection(nextNodes);
      const nextConns = /* @__PURE__ */ new Set();
      connections.value.forEach((conn) => {
        const s = nodes.value.find((nn) => nn.id === conn.sourceNodeId);
        const t = nodes.value.find((nn) => nn.id === conn.targetNodeId);
        if (!s || !t) return;
        let sx, sy, tx, ty, mx, my;
        if (getConnectionHandle) {
          const handle = getConnectionHandle(conn.id);
          sx = handle.sx;
          sy = handle.sy;
          tx = handle.tx;
          ty = handle.ty;
          if (handle.middleHandles && handle.middleHandles.length > 0) {
            mx = handle.middleHandles[0].x;
            my = handle.middleHandles[0].y;
          } else if (handle.mx !== void 0 && handle.my !== void 0) {
            mx = handle.mx;
            my = handle.my;
          } else {
            mx = (sx + tx) / 2;
            my = (sy + ty) / 2 + (connectionOffsetY?.[conn.id] || 0);
          }
        } else {
          const sw = s.style?.width || 120;
          const sh = s.style?.height || 60;
          const tw = t.style?.width || 120;
          const th = t.style?.height || 60;
          const sxCenter = s.position.x + sw / 2;
          const syCenter = s.position.y + sh / 2;
          const txCenter = t.position.x + tw / 2;
          const tyCenter = t.position.y + th / 2;
          const dx = txCenter - sxCenter;
          const dy = tyCenter - syCenter;
          if (Math.abs(dx) >= Math.abs(dy)) {
            sx = dx >= 0 ? s.position.x + sw : s.position.x;
            sy = syCenter;
            tx = dx >= 0 ? t.position.x : t.position.x + tw;
            ty = tyCenter;
          } else {
            sx = sxCenter;
            sy = dy >= 0 ? s.position.y + sh : s.position.y;
            tx = txCenter;
            ty = dy >= 0 ? t.position.y : t.position.y + th;
          }
          const offset = connectionOffsetY?.[conn.id] || 0;
          mx = (sx + tx) / 2;
          my = (sy + ty) / 2 + offset;
        }
        const strokeWidth = 2;
        const padding = strokeWidth / 2 + 2;
        const bx1 = Math.min(sx, tx, mx) - padding;
        const by1 = Math.min(sy, ty, my) - padding;
        const bx2 = Math.max(sx, tx, mx) + padding;
        const by2 = Math.max(sy, ty, my) + padding;
        const inter = !(bx2 < r2.x1 || bx1 > r2.x2 || by2 < r2.y1 || by1 > r2.y2);
        if (inter) nextConns.add(conn.id);
      });
      updateConnectionSelection(nextConns);
      lastSelectionMode.value = "rubber";
      if (nextNodes.size > 0 || nextConns.size > 0) {
        selectedNodeId.value = "";
      }
      rubber.active = false;
      e?.stopPropagation();
      e?.preventDefault();
      return;
    }
    fallthrough.handleCanvasMouseUp(e);
  }
  const clearMultiSelection = () => {
    updateNodeSelection(/* @__PURE__ */ new Set());
    updateConnectionSelection(/* @__PURE__ */ new Set());
    lastSelectionMode.value = "none";
  };
  return {
    rubber,
    multiSelectedNodeIds,
    multiSelectedConnectionIds,
    lastSelectionMode,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
    clearMultiSelection
  };
}
function useComponentLibrary(nodes) {
  const componentSearch = ref("");
  const activeCategories = ref(["basic", "advanced"]);
  const isNodeTypeExists = (nodeType) => {
    if (!nodes?.value) return false;
    return nodes.value.some((node) => node.type === nodeType);
  };
  const componentCategories = computed(() => [
    {
      name: "basic",
      title: "基础组件",
      components: [
        {
          type: NodeType.START,
          name: "开始",
          disabled: isNodeTypeExists(NodeType.START)
        },
        {
          type: NodeType.END,
          name: "结束",
          disabled: isNodeTypeExists(NodeType.END)
        },
        {
          type: NodeType.CONDITION,
          name: "条件",
          disabled: false
        },
        {
          type: NodeType.ACTION,
          name: "动作",
          disabled: false
        }
      ]
    },
    {
      name: "advanced",
      title: "高级组件",
      components: [
        {
          type: NodeType.DECISION,
          name: "决策",
          disabled: false
        },
        {
          type: NodeType.GATEWAY,
          name: "网关",
          disabled: false
        }
      ]
    }
  ]);
  const filteredComponentCategories = computed(() => {
    if (!componentSearch.value) return componentCategories.value;
    return componentCategories.value.map((category) => ({
      ...category,
      components: category.components.filter(
        (comp) => comp.name.includes(componentSearch.value)
      )
    })).filter((category) => category.components.length > 0);
  });
  const handleComponentDragStart = (event, component) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/json", JSON.stringify(component));
      event.dataTransfer.setData("component-type", component.type);
      event.dataTransfer.effectAllowed = "copy";
      const dragImage = document.createElement("canvas");
      dragImage.width = 120;
      dragImage.height = 60;
      const ctx = dragImage.getContext("2d");
      if (ctx) {
        const fillColor = getNodeFillColor(component.type);
        const strokeColor = getNodeStrokeColor(component.type);
        const textColor = getNodeTextColor(component.type);
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, 120, 60);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 118, 58);
        ctx.fillStyle = textColor;
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(getNodeText(component.type), 60, 30);
      }
      event.dataTransfer.setDragImage(dragImage, 60, 30);
    }
  };
  const getNodeFillColor = (type) => {
    const colorMap = {
      [NodeType.START]: "#67c23a",
      [NodeType.END]: "#f56c6c",
      [NodeType.CONDITION]: "#e6a23c",
      [NodeType.ACTION]: "#409eff",
      [NodeType.DECISION]: "#909399",
      [NodeType.GATEWAY]: "#9c27b0"
    };
    return colorMap[type] || "#409eff";
  };
  const getNodeStrokeColor = (type) => {
    return getNodeFillColor(type);
  };
  const getNodeTextColor = (type) => {
    return "#ffffff";
  };
  const getNodeText = (type) => {
    const textMap = {
      [NodeType.START]: "开始",
      [NodeType.END]: "结束",
      [NodeType.CONDITION]: "条件",
      [NodeType.ACTION]: "动作",
      [NodeType.DECISION]: "决策",
      [NodeType.GATEWAY]: "网关"
    };
    return textMap[type] || "节点";
  };
  const handleCanvasDragOver = (event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };
  const parseDropData = (event) => {
    if (!event.dataTransfer) return null;
    try {
      return JSON.parse(event.dataTransfer.getData("application/json"));
    } catch (error) {
      console.error("Failed to parse drop data:", error);
      return null;
    }
  };
  const componentLibrary = computed(() => {
    return componentCategories.value.flatMap((category) => category.components);
  });
  return {
    // 状态
    componentSearch,
    activeCategories,
    componentCategories,
    filteredComponentCategories,
    componentLibrary,
    // 方法
    handleComponentDragStart,
    handleCanvasDragOver,
    parseDropData
  };
}
function useCanvasInteraction(updateTempConnection) {
  const currentTool = ref("select");
  const zoom = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const dragState = reactive({
    isDragging: false,
    startPos: { x: 0, y: 0 }
  });
  const setTool = (tool) => {
    currentTool.value = tool;
  };
  const zoomIn = () => {
    zoom.value = Math.min(zoom.value * 1.2, 3);
  };
  const zoomOut = () => {
    zoom.value = Math.max(zoom.value / 1.2, 0.1);
  };
  const resetZoom = () => {
    zoom.value = 1;
    panX.value = 0;
    panY.value = 0;
  };
  const fitToScreen = (canvasRef, nodes) => {
    if (!canvasRef || nodes.length === 0) return;
    const bounds = nodes.reduce((acc, node) => {
      return {
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + (node.style?.width || 120)),
        maxY: Math.max(acc.maxY, node.position.y + (node.style?.height || 80))
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    const containerRect = canvasRef.getBoundingClientRect();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const scaleX = (containerRect.width - 100) / contentWidth;
    const scaleY = (containerRect.height - 100) / contentHeight;
    zoom.value = Math.min(scaleX, scaleY, 1);
    panX.value = (containerRect.width - contentWidth * zoom.value) / 2 - bounds.minX * zoom.value;
    panY.value = (containerRect.height - contentHeight * zoom.value) / 2 - bounds.minY * zoom.value;
  };
  const handleCanvasMouseDown = (event) => {
    if (currentTool.value === "drag") {
      dragState.isDragging = true;
      dragState.startPos = {
        x: event.clientX - panX.value,
        y: event.clientY - panY.value
      };
    }
  };
  const handleCanvasMouseMove = (event) => {
    if (dragState.isDragging && currentTool.value === "drag") {
      panX.value = event.clientX - dragState.startPos.x;
      panY.value = event.clientY - dragState.startPos.y;
    }
    const canvasRef = document.querySelector(".strategy-canvas");
    if (canvasRef && updateTempConnection) {
      updateTempConnection(event, canvasRef);
    }
  };
  const handleCanvasMouseUp = () => {
    dragState.isDragging = false;
  };
  const handleCanvasWheel = (event, canvasRef) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom.value * delta));
    if (newZoom !== zoom.value) {
      const target = canvasRef || event.target;
      const rect = target.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const scaleFactor = newZoom / zoom.value;
      panX.value = mouseX - (mouseX - panX.value) * scaleFactor;
      panY.value = mouseY - (mouseY - panY.value) * scaleFactor;
      zoom.value = newZoom;
    }
  };
  return {
    // 状态
    currentTool,
    zoom,
    panX,
    panY,
    dragState,
    // 方法
    setTool,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel
  };
}
function useNodeManagement(canvasDimensions) {
  const nodes = ref([]);
  const selectedNodeId = ref("");
  const canvasDimensionsRef = canvasDimensions || { value: { width: 2e3, height: 1500 } };
  const positionBoxPlacement = /* @__PURE__ */ new Map();
  const selectedNode = computed(
    () => nodes.value.find((node) => node.id === selectedNodeId.value)
  );
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const HYSTERESIS = 6;
  const updatePositionBox = (nodeId, x, y, width, height) => {
    const positionGroup = document.querySelector(`[data-position-id="position-${nodeId}"]`);
    if (positionGroup) {
      let canvasWidth = canvasDimensionsRef?.value.width || 2e3;
      let canvasHeight = canvasDimensionsRef?.value.height || 1500;
      const svgEl = document.querySelector(".strategy-canvas");
      if (svgEl && svgEl.viewBox && svgEl.viewBox.baseVal) {
        const vb = svgEl.viewBox.baseVal;
        if (vb && vb.width > 0 && vb.height > 0) {
          canvasWidth = vb.width;
          canvasHeight = vb.height;
        }
      }
      const boxWidth = 70;
      const boxHeight = 18;
      const margin = 20;
      const bottomX = x + width / 2 - boxWidth / 2;
      const bottomY = y + height + margin;
      const topX = x + width / 2 - boxWidth / 2;
      const topY = y - boxHeight - margin;
      const bottomSpace = Math.round(canvasHeight - (y + height));
      const needSpace = Math.round(margin + boxHeight);
      const prev = positionBoxPlacement.get(nodeId) ?? "bottom";
      let nextPlacement = prev;
      if (prev === "bottom" && bottomSpace < needSpace - HYSTERESIS) {
        nextPlacement = "top";
      } else if (prev === "top" && bottomSpace > needSpace + HYSTERESIS) {
        nextPlacement = "bottom";
      } else if (!positionBoxPlacement.has(nodeId)) {
        nextPlacement = bottomSpace >= needSpace ? "bottom" : "top";
      }
      let finalX;
      let finalY;
      if (nextPlacement === "bottom") {
        finalX = bottomX;
        finalY = bottomY;
      } else {
        finalX = topX;
        finalY = topY;
      }
      finalX = Math.round(Math.max(0, Math.min(finalX, canvasWidth - boxWidth)));
      finalY = Math.round(Math.max(0, Math.min(finalY, canvasHeight - boxHeight)));
      positionGroup.setAttribute("transform", `translate(${finalX}, ${finalY})`);
      positionBoxPlacement.set(nodeId, nextPlacement);
      const textElement = positionGroup.querySelector(".position-box-text");
      if (textElement) {
        textElement.textContent = `${Math.round(x)}, ${Math.round(y)}`;
      }
    }
  };
  const validateNodeTypeUniqueness = (nodeType) => {
    const existingNode = nodes.value.find((node) => node.type === nodeType);
    if (nodeType === NodeType.START && existingNode) {
      return {
        valid: false,
        message: "策略中只能有一个开始节点"
      };
    }
    if (nodeType === NodeType.END && existingNode) {
      return {
        valid: false,
        message: "策略中只能有一个结束节点"
      };
    }
    return { valid: true };
  };
  const getNodeColor = (type) => {
    const colorMap = {
      [NodeType.START]: "#67c23a",
      [NodeType.END]: "#f56c6c",
      [NodeType.CONDITION]: "#e6a23c",
      [NodeType.ACTION]: "#409eff",
      [NodeType.DECISION]: "#909399",
      [NodeType.GATEWAY]: "#9c27b0"
    };
    return colorMap[type] || "#409eff";
  };
  const addNode = async (component, position) => {
    const validation = validateNodeTypeUniqueness(component.type);
    if (!validation.valid) {
      BtcMessage.warning(validation.message);
      return null;
    }
    let nodeWidth = 120;
    let nodeHeight = 60;
    if (component.type === "START" || component.type === "END") {
      nodeWidth = 60;
      nodeHeight = 60;
    }
    const newNode = {
      id: generateId(),
      type: component.type,
      name: component.name,
      position,
      data: {
        conditions: [],
        actions: [],
        rules: [],
        config: {}
      },
      style: {
        width: nodeWidth,
        height: nodeHeight,
        backgroundColor: getNodeColor(component.type),
        borderColor: getNodeColor(component.type)
      },
      textConfig: {
        fontSize: 16,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: "normal",
        fontStyle: "normal"
      }
    };
    nodes.value.push(newNode);
    await nextTick();
    return newNode;
  };
  const selectNode = (nodeId) => {
    selectedNodeId.value = nodeId;
  };
  const moveNode = (nodeId, position) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      Object.assign(node.position, position);
    }
  };
  const updateNodeProperties = (nodeId, properties) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      Object.assign(node, properties);
    }
  };
  const deleteNode = async (nodeId, skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        await BtcConfirm("确定要删除这个节点吗？", "确认删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
      }
      nodes.value = nodes.value.filter((n) => n.id !== nodeId);
      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = "";
      }
      BtcMessage.success("节点删除成功");
      return true;
    } catch {
      return false;
    }
  };
  const clearNodes = () => {
    nodes.value = [];
    selectedNodeId.value = "";
  };
  const updateNode = (nodeId, updates) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  };
  const getNodeStyle = (node) => {
    return {};
  };
  const getNodeIcon = (type) => {
    const iconMap = {
      [NodeType.START]: "VideoPlay",
      [NodeType.END]: "VideoPause",
      [NodeType.CONDITION]: "QuestionFilled",
      [NodeType.ACTION]: "Lightning",
      [NodeType.DECISION]: "Share",
      [NodeType.GATEWAY]: "Connection"
    };
    return iconMap[type] || "Lightning";
  };
  const getOutputConnectionClass = (node) => {
    if (node.type === "CONDITION") {
      return "conditional";
    }
    return "";
  };
  const isDragging = ref(false);
  const draggingNodeId = ref(null);
  const dragOffset = ref({ x: 0, y: 0 });
  const dragStartPosition = ref({ x: 0, y: 0 });
  const handleNodeMouseDown = (event, node, isEditingText = false, canvasDimensions2) => {
    if (isEditingText) {
      return;
    }
    const target = event.target;
    if (target.classList.contains("connection-point")) {
      return;
    }
    event.stopPropagation();
    selectNode(node.id);
    isDragging.value = true;
    draggingNodeId.value = node.id;
    dragStartPosition.value = { x: node.position.x, y: node.position.y };
    const startX = event.clientX;
    const startY = event.clientY;
    const startNodeX = node.position.x;
    const startNodeY = node.position.y;
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const canvasWidth = canvasDimensions2?.width || 2e3;
    const canvasHeight = canvasDimensions2?.height || 1500;
    const minX = 0;
    const minY = 0;
    const maxX = canvasWidth - nodeWidth;
    const maxY = canvasHeight - nodeHeight;
    let newPosition = {
      x: node.position.x,
      y: node.position.y
    };
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      newPosition = {
        x: Math.max(minX, Math.min(maxX, startNodeX + deltaX)),
        y: Math.max(minY, Math.min(maxY, startNodeY + deltaY))
      };
      const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
      if (nodeElement) {
        updatePositionBox(node.id, newPosition.x, newPosition.y, nodeWidth, nodeHeight);
        if (window.updateConnectionPaths) {
          window.updateConnectionPaths();
        }
      }
    };
    const handleMouseUp = () => {
      const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
      if (nodeElement) {
        moveNode(node.id, newPosition);
      }
      isDragging.value = false;
      draggingNodeId.value = null;
      dragOffset.value = { x: 0, y: 0 };
      dragStartPosition.value = { x: 0, y: 0 };
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  return {
    // 状态
    nodes,
    selectedNodeId,
    selectedNode,
    isDragging,
    draggingNodeId,
    dragOffset,
    dragStartPosition,
    // 方法
    addNode,
    selectNode,
    moveNode,
    updateNodeProperties,
    updateNode,
    deleteNode,
    clearNodes,
    generateId,
    getNodeColor,
    getNodeStyle,
    getNodeIcon,
    getOutputConnectionClass,
    handleNodeMouseDown,
    updatePositionBox
  };
}
function useConnectionPointSelector() {
  const validateHandleConsistency = (handle, isSource, sourceNode, targetNode) => {
    if (!handle) return true;
    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;
    const targetWidth = targetNode.style?.width || 120;
    const targetHeight = targetNode.style?.height || 60;
    const sourceTop = sourceNode.position.y;
    const sourceBottom = sourceNode.position.y + sourceHeight;
    const sourceLeft = sourceNode.position.x;
    const sourceRight = sourceNode.position.x + sourceWidth;
    const targetTop = targetNode.position.y;
    const targetBottom = targetNode.position.y + targetHeight;
    const targetLeft = targetNode.position.x;
    const targetRight = targetNode.position.x + targetWidth;
    const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
    const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
    const targetCenterX = targetNode.position.x + targetWidth / 2;
    const targetCenterY = targetNode.position.y + targetHeight / 2;
    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;
    if (isSource) {
      switch (handle) {
        case "top":
          if (targetTop > sourceTop) return false;
          if (deltaY > 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case "bottom":
          if (targetTop < sourceBottom) return false;
          if (deltaY < 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case "left":
          if (targetLeft > sourceLeft) return false;
          if (deltaX > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
        case "right":
          if (targetRight < sourceRight) return false;
          if (deltaX < 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
      }
    } else {
      switch (handle) {
        case "top":
          if (sourceTop > targetTop) return false;
          if (deltaY > 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case "bottom":
          if (sourceTop < targetBottom) return false;
          if (deltaY < 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case "left":
          if (sourceLeft > targetLeft) return false;
          if (deltaX > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
        case "right":
          if (sourceRight < targetRight) return false;
          if (deltaX < 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
      }
    }
    return true;
  };
  const selectBestAlternative = (idealHandles, availableHandles, nodePosition, deltaX, deltaY) => {
    for (const ideal of idealHandles) {
      if (availableHandles.includes(ideal)) {
        return ideal;
      }
    }
    if (availableHandles.length > 0) {
      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        if (deltaX > 0) {
          const priority = nodePosition === "source" ? ["right", "top", "bottom", "left"] : ["left", "top", "bottom", "right"];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        } else {
          const priority = nodePosition === "source" ? ["left", "top", "bottom", "right"] : ["right", "top", "bottom", "left"];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        }
      } else {
        if (deltaY > 0) {
          const priority = nodePosition === "source" ? ["bottom", "right", "left", "top"] : ["top", "right", "left", "bottom"];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        } else {
          const priority = nodePosition === "source" ? ["top", "right", "left", "bottom"] : ["bottom", "right", "left", "top"];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        }
      }
    }
    return availableHandles.length > 0 ? availableHandles[0] : "right";
  };
  const selectOptimalConnectionPoints = (sourceNode, targetNode, connection, sourceUsedHandles, targetUsedHandles) => {
    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;
    const targetWidth = targetNode.style?.width || 120;
    const targetHeight = targetNode.style?.height || 60;
    const sourceTop = sourceNode.position.y;
    const sourceBottom = sourceNode.position.y + sourceHeight;
    const sourceLeft = sourceNode.position.x;
    const sourceRight = sourceNode.position.x + sourceWidth;
    const targetTop = targetNode.position.y;
    const targetBottom = targetNode.position.y + targetHeight;
    const targetLeft = targetNode.position.x;
    const targetRight = targetNode.position.x + targetWidth;
    const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
    const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
    const targetCenterX = targetNode.position.x + targetWidth / 2;
    const targetCenterY = targetNode.position.y + targetHeight / 2;
    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;
    let sourceX;
    let sourceY;
    let targetX;
    let targetY;
    let selectedSourceHandle;
    let selectedTargetHandle;
    const sourceNodeUsedHandles = sourceUsedHandles || /* @__PURE__ */ new Set();
    const targetNodeUsedHandles = targetUsedHandles || /* @__PURE__ */ new Set();
    const isSourceNodeHasOtherConnections = sourceNodeUsedHandles.size > 0;
    const isTargetNodeHasOtherConnections = targetNodeUsedHandles.size > 0;
    const savedSourceHandle = connection.sourceHandle;
    const savedTargetHandle = connection.targetHandle;
    if (savedSourceHandle && !validateHandleConsistency(savedSourceHandle, true, sourceNode, targetNode)) {
      connection.sourceHandle = void 0;
    }
    if (savedTargetHandle && !validateHandleConsistency(savedTargetHandle, false, sourceNode, targetNode)) {
      connection.targetHandle = void 0;
    }
    const hasHorizontalOverlap = !(targetLeft >= sourceRight || targetRight <= sourceLeft);
    const hasVerticalOverlap = !(targetTop >= sourceBottom || targetBottom <= sourceTop);
    const getAvailableHandles = (usedHandles) => {
      const allHandles = ["top", "bottom", "left", "right"];
      return allHandles.filter((h) => !usedHandles.has(h));
    };
    const sourceAvailableHandles = isSourceNodeHasOtherConnections ? getAvailableHandles(sourceNodeUsedHandles) : ["top", "bottom", "left", "right"];
    const targetAvailableHandles = isTargetNodeHasOtherConnections ? getAvailableHandles(targetNodeUsedHandles) : ["top", "bottom", "left", "right"];
    if ((sourceNode.type === "CONDITION" || sourceNode.type === "DECISION") && connection.condition) {
      selectedSourceHandle = connection.condition === "true" ? "right" : "left";
      if (selectedSourceHandle === "right") {
        sourceX = sourceRight;
        sourceY = sourceCenterY;
      } else {
        sourceX = sourceLeft;
        sourceY = sourceCenterY;
      }
      if (hasVerticalOverlap) {
        if (deltaX > 0) {
          selectedTargetHandle = selectBestAlternative(["left"], targetAvailableHandles, "target", deltaX, deltaY);
        } else {
          selectedTargetHandle = selectBestAlternative(["right"], targetAvailableHandles, "target", deltaX, deltaY);
        }
      } else if (hasHorizontalOverlap) {
        if (deltaY > 0) {
          selectedTargetHandle = selectBestAlternative(["top"], targetAvailableHandles, "target", deltaX, deltaY);
        } else {
          selectedTargetHandle = selectBestAlternative(["bottom"], targetAvailableHandles, "target", deltaX, deltaY);
        }
      } else {
        if (deltaY > 0) {
          selectedTargetHandle = selectBestAlternative(["top"], targetAvailableHandles, "target", deltaX, deltaY);
        } else {
          selectedTargetHandle = selectBestAlternative(["bottom"], targetAvailableHandles, "target", deltaX, deltaY);
        }
      }
      switch (selectedTargetHandle) {
        case "top":
          targetX = targetCenterX;
          targetY = targetTop;
          break;
        case "bottom":
          targetX = targetCenterX;
          targetY = targetBottom;
          break;
        case "left":
          targetX = targetLeft;
          targetY = targetCenterY;
          break;
        case "right":
          targetX = targetRight;
          targetY = targetCenterY;
          break;
        default:
          targetX = targetCenterX;
          targetY = targetCenterY;
      }
      return {
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceHandle: selectedSourceHandle,
        targetHandle: selectedTargetHandle
      };
    }
    if (hasVerticalOverlap) {
      if (deltaX > 0) {
        selectedSourceHandle = selectBestAlternative(["right"], sourceAvailableHandles, "source", deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(["left"], targetAvailableHandles, "target", deltaX, deltaY);
      } else {
        selectedSourceHandle = selectBestAlternative(["left"], sourceAvailableHandles, "source", deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(["right"], targetAvailableHandles, "target", deltaX, deltaY);
      }
    } else if (hasHorizontalOverlap) {
      if (deltaY > 0) {
        selectedSourceHandle = selectBestAlternative(["bottom"], sourceAvailableHandles, "source", deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(["top"], targetAvailableHandles, "target", deltaX, deltaY);
      } else {
        selectedSourceHandle = selectBestAlternative(["top"], sourceAvailableHandles, "source", deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(["bottom"], targetAvailableHandles, "target", deltaX, deltaY);
      }
    } else {
      if (deltaY > 0) {
        if (deltaX > 0) {
          selectedSourceHandle = selectBestAlternative(["bottom"], sourceAvailableHandles, "source", deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(["left"], targetAvailableHandles, "target", deltaX, deltaY);
        } else {
          selectedSourceHandle = selectBestAlternative(["bottom"], sourceAvailableHandles, "source", deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(["right"], targetAvailableHandles, "target", deltaX, deltaY);
        }
      } else {
        if (deltaX > 0) {
          selectedSourceHandle = selectBestAlternative(["top"], sourceAvailableHandles, "source", deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(["left"], targetAvailableHandles, "target", deltaX, deltaY);
        } else {
          selectedSourceHandle = selectBestAlternative(["top"], sourceAvailableHandles, "source", deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(["right"], targetAvailableHandles, "target", deltaX, deltaY);
        }
      }
    }
    switch (selectedSourceHandle) {
      case "top":
        sourceX = sourceCenterX;
        sourceY = sourceTop;
        break;
      case "bottom":
        sourceX = sourceCenterX;
        sourceY = sourceBottom;
        break;
      case "left":
        sourceX = sourceLeft;
        sourceY = sourceCenterY;
        break;
      case "right":
        sourceX = sourceRight;
        sourceY = sourceCenterY;
        break;
      default:
        sourceX = sourceCenterX;
        sourceY = sourceCenterY;
    }
    switch (selectedTargetHandle) {
      case "top":
        targetX = targetCenterX;
        targetY = targetTop;
        break;
      case "bottom":
        targetX = targetCenterX;
        targetY = targetBottom;
        break;
      case "left":
        targetX = targetLeft;
        targetY = targetCenterY;
        break;
      case "right":
        targetX = targetRight;
        targetY = targetCenterY;
        break;
      default:
        targetX = targetCenterX;
        targetY = targetCenterY;
    }
    if (!connection.sourceHandle || connection.sourceHandle !== selectedSourceHandle) {
      connection.sourceHandle = selectedSourceHandle;
    }
    if (!connection.targetHandle || connection.targetHandle !== selectedTargetHandle) {
      connection.targetHandle = selectedTargetHandle;
    }
    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceHandle: selectedSourceHandle,
      targetHandle: selectedTargetHandle
    };
  };
  return {
    selectOptimalConnectionPoints,
    validateHandleConsistency,
    selectBestAlternative
  };
}
function useConnectionPathGenerator(nodes, connectionOffsetY) {
  const getConnectionPoint = (node, handle, defaultHandle) => {
    const w = node.style?.width || 120;
    const h = node.style?.height || 60;
    const handleType = handle || defaultHandle;
    switch (handleType) {
      case "top":
        return { x: node.position.x + w / 2, y: node.position.y };
      case "bottom":
        return { x: node.position.x + w / 2, y: node.position.y + h };
      case "left":
        return { x: node.position.x, y: node.position.y + h / 2 };
      case "right":
        return { x: node.position.x + w, y: node.position.y + h / 2 };
      default:
        return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
    }
  };
  const getConnectionPath = (connection) => {
    const sourceNode = nodes.value.find((n) => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find((n) => n.id === connection.targetNodeId);
    if (!sourceNode || !targetNode) {
      console.warn("getConnectionPath: 找不到节点", connection.sourceNodeId, connection.targetNodeId);
      return "";
    }
    const sxCenter = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
    const syCenter = sourceNode.position.y + (sourceNode.style?.height || 60) / 2;
    const txCenter = targetNode.position.x + (targetNode.style?.width || 120) / 2;
    const tyCenter = targetNode.position.y + (targetNode.style?.height || 60) / 2;
    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;
    const defaultSourceHandle = Math.abs(dx) >= Math.abs(dy) ? dx >= 0 ? "right" : "left" : dy >= 0 ? "bottom" : "top";
    const defaultTargetHandle = Math.abs(dx) >= Math.abs(dy) ? dx >= 0 ? "left" : "right" : dy >= 0 ? "top" : "bottom";
    const sourcePoint = getConnectionPoint(sourceNode, connection.sourceHandle, defaultSourceHandle);
    const targetPoint = getConnectionPoint(targetNode, connection.targetHandle, defaultTargetHandle);
    const sourceX = sourcePoint.x;
    const sourceY = sourcePoint.y;
    const targetX = targetPoint.x;
    const targetY = targetPoint.y;
    if (isNaN(sourceX) || isNaN(sourceY) || isNaN(targetX) || isNaN(targetY)) {
      console.error("getConnectionPath: 连接点坐标无效", { sourcePoint, targetPoint, connection });
      return "";
    }
    const offset = connectionOffsetY[connection.id] || 0;
    const sourceHandle = connection.sourceHandle || defaultSourceHandle;
    const targetHandle = connection.targetHandle || defaultTargetHandle;
    const isSourceVertical = sourceHandle === "top" || sourceHandle === "bottom";
    const isTargetVertical = targetHandle === "top" || targetHandle === "bottom";
    const isSourceHorizontal = sourceHandle === "left" || sourceHandle === "right";
    const isTargetHorizontal = targetHandle === "left" || targetHandle === "right";
    const actualDx = targetX - sourceX;
    const actualDy = targetY - sourceY;
    if (isSourceVertical && isTargetVertical) {
      const midY = (sourceY + targetY) / 2 + offset;
      if (Math.abs(sourceX - targetX) < 0.1 && Math.abs(offset) < 0.1) {
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        if (!path || path.includes("NaN")) {
          console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, connection });
          return "";
        }
        return path;
      } else {
        const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        if (!path || path.includes("NaN")) {
          console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, midY, connection });
          return "";
        }
        return path;
      }
    } else if (isSourceHorizontal && isTargetHorizontal) {
      if (Math.abs(sourceY - targetY) < 0.1 && Math.abs(offset) < 0.1) {
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        if (!path || path.includes("NaN")) {
          console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, connection });
          return "";
        }
        return path;
      } else {
        const midX = sourceX + (targetX - sourceX) / 2;
        const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        if (!path || path.includes("NaN")) {
          console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, midX, connection });
          return "";
        }
        return path;
      }
    } else {
      if (Math.abs(actualDx) >= Math.abs(actualDy)) {
        const midX = sourceX + (targetX - sourceX) / 2;
        if (Math.abs(sourceY - targetY) < 0.1 && Math.abs(offset) < 0.1) {
          const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          if (!path || path.includes("NaN")) {
            console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, connection });
            return "";
          }
          return path;
        } else {
          const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
          if (!path || path.includes("NaN")) {
            console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, midX, connection });
            return "";
          }
          return path;
        }
      } else {
        const midY = (sourceY + targetY) / 2 + offset;
        if (Math.abs(sourceX - targetX) < 0.1 && Math.abs(offset) < 0.1) {
          const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          if (!path || path.includes("NaN")) {
            console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, connection });
            return "";
          }
          return path;
        } else {
          const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
          if (!path || path.includes("NaN")) {
            console.error("getConnectionPath: 路径无效", { sourceX, sourceY, targetX, targetY, midY, connection });
            return "";
          }
          return path;
        }
      }
    }
  };
  const generateOrthogonalPath = (sourceX, sourceY, targetX, targetY, sourceIsRight, sourceIsLeft, sourceIsTop, sourceIsBottom, targetIsRight, targetIsLeft, targetIsTop, targetIsBottom) => {
    const isHorizontalAligned = Math.abs(sourceY - targetY) < 5;
    const isVerticalAligned = Math.abs(sourceX - targetX) < 5;
    if (isHorizontalAligned && (sourceIsRight && targetIsLeft || sourceIsLeft && targetIsRight)) {
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else if (isVerticalAligned && (sourceIsTop && targetIsBottom || sourceIsBottom && targetIsTop)) {
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else if (sourceIsRight && (targetIsBottom || targetIsTop)) {
      const turnX = targetX;
      return `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
    } else if (sourceIsLeft && (targetIsBottom || targetIsTop)) {
      const turnX = targetX;
      return `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
    } else if (sourceIsTop && (targetIsRight || targetIsLeft)) {
      const turnY = targetY;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
    } else if (sourceIsBottom && (targetIsRight || targetIsLeft)) {
      const turnY = targetY;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
    } else if (sourceIsRight && targetIsLeft) {
      const midX = sourceX + (targetX - sourceX) / 2;
      return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
    } else if (sourceIsLeft && targetIsRight) {
      const midX = sourceX + (targetX - sourceX) / 2;
      return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
    } else if (sourceIsTop && targetIsBottom) {
      const midY = sourceY + (targetY - sourceY) / 2;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
    } else if (sourceIsBottom && targetIsTop) {
      const midY = sourceY + (targetY - sourceY) / 2;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
    } else {
      const horizontalDistance = Math.abs(targetX - sourceX);
      const verticalDistance = Math.abs(targetY - sourceY);
      if (horizontalDistance > verticalDistance) {
        const midX = sourceX + (targetX - sourceX) / 2;
        return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
      } else {
        const midY = sourceY + (targetY - sourceY) / 2;
        return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
      }
    }
  };
  return {
    getConnectionPoint,
    getConnectionPath,
    generateOrthogonalPath
  };
}
function useConnectionStyle(nodes) {
  const { getConnectionPath } = useConnectionPathGenerator(nodes, {});
  const computeConnectionStyle = (connection) => {
    const getThemeColor = (cssVar) => {
      if (typeof window !== "undefined") {
        const color2 = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        return color2 || "#ffffff";
      }
      return "#ffffff";
    };
    const isDarkTheme = getThemeColor("--el-color-white") === "#ffffff" && getComputedStyle(document.documentElement).getPropertyValue("--el-bg-color").includes("dark");
    const color = connection.style?.strokeColor || (isDarkTheme ? getThemeColor("--el-color-white") : getThemeColor("--el-color-primary"));
    let marker = "url(#arrowhead-default)";
    if (connection.condition === "true") {
      marker = "url(#arrowhead-true)";
    } else if (connection.condition === "false") {
      marker = "url(#arrowhead-false)";
    }
    return { color, marker };
  };
  const getConnectionColor = (connection) => {
    if (connection.condition === "true") {
      return "#67c23a";
    } else if (connection.condition === "false") {
      return "#f56c6c";
    }
    return connection.style?.strokeColor || "#409eff";
  };
  const getConnectionMarker = (connection) => {
    if (connection.condition === "true") {
      return "url(#arrowhead-true)";
    } else if (connection.condition === "false") {
      return "url(#arrowhead-false)";
    }
    return "url(#arrowhead-default)";
  };
  const getConnectionDirection = (connection, pathString) => {
    let path = pathString;
    if (!path) {
      path = getConnectionPath(connection);
    }
    if (path) {
      const firstMove = path.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
      if (firstMove) {
        const allLines = path.matchAll(/L\s+([\d.-]+)\s+([\d.-]+)/g);
        const lines = Array.from(allLines);
        if (lines.length > 0) {
          let totalHorizontalLength = 0;
          let totalVerticalLength = 0;
          let prevX = parseFloat(firstMove[1]);
          let prevY = parseFloat(firstMove[2]);
          for (const line of lines) {
            const x = parseFloat(line[1]);
            const y = parseFloat(line[2]);
            const dx2 = Math.abs(x - prevX);
            const dy2 = Math.abs(y - prevY);
            totalHorizontalLength += dx2;
            totalVerticalLength += dy2;
            prevX = x;
            prevY = y;
          }
          return totalHorizontalLength >= totalVerticalLength ? "horizontal" : "vertical";
        }
      }
    }
    const sourceNode = nodes.value.find((n) => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find((n) => n.id === connection.targetNodeId);
    if (!sourceNode || !targetNode) return "horizontal";
    const sxCenter = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
    const syCenter = sourceNode.position.y + (sourceNode.style?.height || 60) / 2;
    const txCenter = targetNode.position.x + (targetNode.style?.width || 120) / 2;
    const tyCenter = targetNode.position.y + (targetNode.style?.height || 60) / 2;
    const dx = Math.abs(txCenter - sxCenter);
    const dy = Math.abs(tyCenter - syCenter);
    return dx >= dy ? "horizontal" : "vertical";
  };
  return {
    computeConnectionStyle,
    getConnectionColor,
    getConnectionMarker,
    getConnectionDirection
  };
}
function useOrphanedConnection(nodes) {
  const { getConnectionColor, getConnectionMarker } = useConnectionStyle(nodes);
  const handleOrphanedConnection = (connection, sourceNode, targetNode, connectionOffsetY) => {
    connectionOffsetY[connection.id] || 0;
    let fromX, fromY, toX, toY;
    if (sourceNode && !targetNode) {
      if (!connection.lastTargetX || !connection.lastTargetY) {
        return { id: connection.id, path: "", color: "", marker: "", direction: "horizontal", isOrphaned: true };
      }
      const sourceWidth = sourceNode.style?.width || 120;
      const sourceHeight = sourceNode.style?.height || 60;
      const handle = connection.sourceHandle || "bottom";
      switch (handle) {
        case "top":
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y;
          break;
        case "bottom":
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y + sourceHeight;
          break;
        case "left":
          fromX = sourceNode.position.x;
          fromY = sourceNode.position.y + sourceHeight / 2;
          break;
        case "right":
          fromX = sourceNode.position.x + sourceWidth;
          fromY = sourceNode.position.y + sourceHeight / 2;
          break;
        default:
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y + sourceHeight;
      }
      toX = connection.lastTargetX;
      toY = connection.lastTargetY;
    } else if (!sourceNode && targetNode) {
      if (!connection.lastSourceX || !connection.lastSourceY) {
        return { id: connection.id, path: "", color: "", marker: "", direction: "horizontal", isOrphaned: true };
      }
      fromX = connection.lastSourceX;
      fromY = connection.lastSourceY;
      const targetWidth = targetNode.style?.width || 120;
      const targetHeight = targetNode.style?.height || 60;
      const handle = connection.targetHandle || "top";
      switch (handle) {
        case "top":
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y;
          break;
        case "bottom":
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y + targetHeight;
          break;
        case "left":
          toX = targetNode.position.x;
          toY = targetNode.position.y + targetHeight / 2;
          break;
        case "right":
          toX = targetNode.position.x + targetWidth;
          toY = targetNode.position.y + targetHeight / 2;
          break;
        default:
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y;
      }
    } else {
      return { id: connection.id, path: "", color: "", marker: "", direction: "horizontal", isOrphaned: true };
    }
    let path;
    if (connection.lastPath) {
      const pathMatch = connection.lastPath.match(/^M\s+([\d.]+)\s+([\d.]+)(.*)/);
      if (pathMatch) {
        const oldStartX = parseFloat(pathMatch[1]);
        const oldStartY = parseFloat(pathMatch[2]);
        const oldPathRest = pathMatch[3];
        const pathPoints = oldPathRest.match(/L\s+([\d.]+)\s+([\d.]+)/g);
        if (pathPoints && pathPoints.length > 0) {
          const lastPoint = pathPoints[pathPoints.length - 1];
          const lastPointMatch = lastPoint.match(/L\s+([\d.]+)\s+([\d.]+)/);
          if (lastPointMatch) {
            const oldEndX = parseFloat(lastPointMatch[1]);
            const oldEndY = parseFloat(lastPointMatch[2]);
            const oldRelEndX = oldEndX - oldStartX;
            const oldRelEndY = oldEndY - oldStartY;
            const newRelEndX = toX - fromX;
            const newRelEndY = toY - fromY;
            const scaleX = oldRelEndX !== 0 ? newRelEndX / oldRelEndX : 1;
            const scaleY = oldRelEndY !== 0 ? newRelEndY / oldRelEndY : 1;
            let newPath = `M ${fromX} ${fromY}`;
            pathPoints.forEach((point) => {
              const pointMatch = point.match(/L\s+([\d.]+)\s+([\d.]+)/);
              if (pointMatch) {
                let x = parseFloat(pointMatch[1]);
                let y = parseFloat(pointMatch[2]);
                const relX = x - oldStartX;
                const relY = y - oldStartY;
                x = fromX + relX * scaleX;
                y = fromY + relY * scaleY;
                newPath += ` L ${x} ${y}`;
              }
            });
            path = newPath;
          } else {
            path = generateSimplePath(fromX, fromY, toX, toY);
          }
        } else {
          path = generateSimplePath(fromX, fromY, toX, toY);
        }
      } else {
        path = generateSimplePath(fromX, fromY, toX, toY);
      }
    } else {
      path = generateSimplePath(fromX, fromY, toX, toY);
    }
    const color = getConnectionColor(connection);
    const marker = getConnectionMarker(connection);
    const direction = Math.abs(toX - fromX) >= Math.abs(toY - fromY) ? "horizontal" : "vertical";
    return { id: connection.id, path, color, marker, direction, isOrphaned: true };
  };
  const generateSimplePath = (fromX, fromY, toX, toY) => {
    const horizontalDistance = Math.abs(toX - fromX);
    const verticalDistance = Math.abs(toY - fromY);
    const minGap = 20;
    if (horizontalDistance < minGap || verticalDistance < minGap) {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const turnX = fromX + (toX - fromX) / 2;
        return `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
      } else {
        const turnY = fromY + (toY - fromY) / 2;
        return `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
      }
    }
  };
  return {
    handleOrphanedConnection
  };
}
function useConnectionManagement(nodes) {
  const connections = ref([]);
  const selectedConnectionId = ref("");
  const connectionOffsetY = reactive({});
  const connectionState = reactive({
    isConnecting: false,
    fromNodeId: "",
    fromCondition: void 0,
    tempConnection: null
  });
  const selectedConnection = computed(
    () => connections.value.find((conn) => conn.id === selectedConnectionId.value)
  );
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const { selectOptimalConnectionPoints } = useConnectionPointSelector();
  const { getConnectionPath, generateOrthogonalPath } = useConnectionPathGenerator(nodes, connectionOffsetY);
  const { handleOrphanedConnection } = useOrphanedConnection(nodes);
  const { computeConnectionStyle, getConnectionColor, getConnectionMarker, getConnectionDirection } = useConnectionStyle(nodes);
  const startConnection = (fromNodeId, event, condition) => {
    connectionState.isConnecting = true;
    connectionState.fromNodeId = fromNodeId;
    connectionState.fromCondition = condition;
    const canvasRef = document.querySelector(".strategy-canvas");
    if (canvasRef) {
      updateTempConnection(event, canvasRef);
    } else {
      console.error("找不到画布元素");
    }
  };
  const updateTempConnection = (event, canvasRef) => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId || !canvasRef) {
      return;
    }
    const fromNode = nodes.value.find((n) => n.id === connectionState.fromNodeId);
    if (!fromNode) {
      return;
    }
    const rect = canvasRef.getBoundingClientRect();
    const toX = event.clientX - rect.left;
    const toY = event.clientY - rect.top;
    const nodeWidth = fromNode.style?.width || 120;
    const nodeHeight = fromNode.style?.height || 60;
    let fromX;
    let fromY;
    if ((fromNode.type === "CONDITION" || fromNode.type === "DECISION") && connectionState.fromCondition) {
      if (connectionState.fromCondition === "true") {
        fromX = fromNode.position.x + nodeWidth;
        fromY = fromNode.position.y + nodeHeight / 2;
      } else {
        fromX = fromNode.position.x;
        fromY = fromNode.position.y + nodeHeight / 2;
      }
    } else {
      const nodeCenterX = fromNode.position.x + nodeWidth / 2;
      const nodeCenterY = fromNode.position.y + nodeHeight / 2;
      const deltaX = toX - nodeCenterX;
      const deltaY = toY - nodeCenterY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          fromX = fromNode.position.x + nodeWidth;
          fromY = fromNode.position.y + nodeHeight / 2;
        } else {
          fromX = fromNode.position.x;
          fromY = fromNode.position.y + nodeHeight / 2;
        }
      } else {
        if (deltaY > 0) {
          fromX = fromNode.position.x + nodeWidth / 2;
          fromY = fromNode.position.y + nodeHeight;
        } else {
          fromX = fromNode.position.x + nodeWidth / 2;
          fromY = fromNode.position.y;
        }
      }
    }
    const horizontalDistance = Math.abs(toX - fromX);
    const verticalDistance = Math.abs(toY - fromY);
    const minGap = 20;
    let path;
    if (horizontalDistance < minGap || verticalDistance < minGap) {
      path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const turnX = fromX + (toX - fromX) / 2;
        path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
      } else {
        const turnY = fromY + (toY - fromY) / 2;
        path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
      }
    }
    connectionState.tempConnection = { path };
  };
  const completeConnection = (toNodeId) => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId || connectionState.fromNodeId === toNodeId) {
      return false;
    }
    const existingConnection = connections.value.find(
      (c) => c.sourceNodeId === connectionState.fromNodeId && c.targetNodeId === toNodeId
    );
    if (existingConnection) {
      BtcMessage.warning("节点之间已存在连接");
      connectionState.isConnecting = false;
      connectionState.tempConnection = null;
      connectionState.fromNodeId = "";
      return false;
    }
    let strokeColor = "#409eff";
    if (connectionState.fromCondition === "true") {
      strokeColor = "#67c23a";
    } else if (connectionState.fromCondition === "false") {
      strokeColor = "#f56c6c";
    }
    const newConnection = {
      id: generateId(),
      type: ConnectorType.SEQUENCE,
      sourceNodeId: connectionState.fromNodeId,
      targetNodeId: toNodeId,
      condition: connectionState.fromCondition,
      style: {
        strokeColor,
        strokeWidth: 2
      }
    };
    connections.value.push(newConnection);
    connectionState.isConnecting = false;
    connectionState.tempConnection = null;
    connectionState.fromNodeId = "";
    connectionState.fromCondition = void 0;
    BtcMessage.success("连接创建成功");
    return true;
  };
  const cancelConnection = () => {
    connectionState.isConnecting = false;
    connectionState.tempConnection = null;
    connectionState.fromNodeId = "";
    connectionState.fromCondition = void 0;
  };
  const selectConnection = (connection) => {
    selectedConnectionId.value = connection.id;
  };
  const updateConnectionProperties = (connectionId, properties) => {
    const connection = connections.value.find((c) => c.id === connectionId);
    if (connection) {
      Object.assign(connection, properties);
    }
  };
  const deleteConnection = async (connectionId, skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        await BtcConfirm("确定要删除这个连接吗？", "确认删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
      }
      connections.value = connections.value.filter((c) => c.id !== connectionId);
      if (selectedConnectionId.value === connectionId) {
        selectedConnectionId.value = "";
      }
      BtcMessage.success("连接删除成功");
      return true;
    } catch {
      return false;
    }
  };
  const deleteNodeConnections = (nodeId) => {
    connections.value = connections.value.filter(
      (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );
  };
  const updateConnectionPaths = () => {
    isUpdatingHandles = true;
    try {
      const nodeHandleUsage = /* @__PURE__ */ new Map();
      connections.value.forEach((connection) => {
        const sourceId = connection.sourceNodeId;
        const targetId = connection.targetNodeId;
        if (!nodeHandleUsage.has(sourceId)) {
          nodeHandleUsage.set(sourceId, /* @__PURE__ */ new Set());
        }
        if (!nodeHandleUsage.has(targetId)) {
          nodeHandleUsage.set(targetId, /* @__PURE__ */ new Set());
        }
        if (connection.sourceHandle) {
          nodeHandleUsage.get(sourceId).add(connection.sourceHandle);
        }
        if (connection.targetHandle) {
          nodeHandleUsage.get(targetId).add(connection.targetHandle);
        }
      });
      connections.value.forEach((connection) => {
        const sourceElement = document.querySelector(`[data-node-id="${connection.sourceNodeId}"]`);
        const targetElement = document.querySelector(`[data-node-id="${connection.targetNodeId}"]`);
        if (!sourceElement || !targetElement) return;
        const getNodePosition = (element) => {
          const transform = element.style.transform || element.getAttribute("transform") || "";
          const match = transform.match(/translate\(([^,]+)(?:px)?,\s*([^)]+)(?:px)?\)/);
          if (match) {
            return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
          }
          return { x: 0, y: 0 };
        };
        const getNodeSize = (element) => {
          const rectElement = element.querySelector(".node-rect");
          if (rectElement) {
            return {
              width: parseFloat(rectElement.getAttribute("width") || "120"),
              height: parseFloat(rectElement.getAttribute("height") || "60")
            };
          }
          const circleElement = element.querySelector("circle");
          if (circleElement) {
            const radius = parseFloat(circleElement.getAttribute("r") || "28");
            return {
              width: (radius + 2) * 2,
              height: (radius + 2) * 2
            };
          }
          return { width: 120, height: 60 };
        };
        const sourcePos = getNodePosition(sourceElement);
        const targetPos = getNodePosition(targetElement);
        const sourceNodeTemplate = nodes.value.find((n) => n.id === connection.sourceNodeId);
        const targetNodeTemplate = nodes.value.find((n) => n.id === connection.targetNodeId);
        const sourceNode = {
          id: connection.sourceNodeId,
          position: sourcePos,
          style: sourceNodeTemplate?.style || { width: 120, height: 60 },
          type: sourceNodeTemplate?.type,
          name: sourceNodeTemplate?.name || "",
          data: sourceNodeTemplate?.data || {}
        };
        const targetNode = {
          id: connection.targetNodeId,
          position: targetPos,
          style: targetNodeTemplate?.style || { width: 120, height: 60 },
          type: targetNodeTemplate?.type,
          name: targetNodeTemplate?.name || "",
          data: targetNodeTemplate?.data || {}
        };
        const sourceSize = { width: sourceNode.style?.width || 120, height: sourceNode.style?.height || 60 };
        const targetSize = { width: targetNode.style?.width || 120, height: targetNode.style?.height || 60 };
        const sourceUsedHandles = nodeHandleUsage.get(connection.sourceNodeId) || /* @__PURE__ */ new Set();
        const targetUsedHandles = nodeHandleUsage.get(connection.targetNodeId) || /* @__PURE__ */ new Set();
        const { sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle } = selectOptimalConnectionPoints(
          sourceNode,
          targetNode,
          connection,
          sourceUsedHandles,
          targetUsedHandles
        );
        if (sourceHandle && !sourceUsedHandles.has(sourceHandle)) {
          sourceUsedHandles.add(sourceHandle);
          nodeHandleUsage.set(connection.sourceNodeId, sourceUsedHandles);
        }
        if (targetHandle && !targetUsedHandles.has(targetHandle)) {
          targetUsedHandles.add(targetHandle);
          nodeHandleUsage.set(connection.targetNodeId, targetUsedHandles);
        }
        const sourceIsRight = sourceX === sourcePos.x + sourceSize.width;
        const sourceIsLeft = sourceX === sourcePos.x;
        const sourceIsTop = sourceY === sourcePos.y;
        const sourceIsBottom = sourceY === sourcePos.y + sourceSize.height;
        const targetIsRight = targetX === targetPos.x + targetSize.width;
        const targetIsLeft = targetX === targetPos.x;
        const targetIsTop = targetY === targetPos.y;
        const targetIsBottom = targetY === targetPos.y + targetSize.height;
        const path = generateOrthogonalPath(
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourceIsRight,
          sourceIsLeft,
          sourceIsTop,
          sourceIsBottom,
          targetIsRight,
          targetIsLeft,
          targetIsTop,
          targetIsBottom
        );
        const getThemeColor = (cssVar) => {
          if (typeof window !== "undefined") {
            const color2 = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
            return color2 || "#ffffff";
          }
          return "#ffffff";
        };
        const isDarkTheme = getThemeColor("--el-color-white") === "#ffffff" && getComputedStyle(document.documentElement).getPropertyValue("--el-bg-color").includes("dark");
        let color = isDarkTheme ? getThemeColor("--el-color-white") : getThemeColor("--el-text-color-primary");
        if (connection.condition === "true") {
          color = isDarkTheme ? getThemeColor("--el-color-white") : getThemeColor("--el-text-color-primary");
        } else if (connection.condition === "false") {
          color = isDarkTheme ? getThemeColor("--el-color-white") : getThemeColor("--el-text-color-primary");
        } else {
          color = connection.style?.strokeColor || (isDarkTheme ? getThemeColor("--el-color-white") : getThemeColor("--el-text-color-primary"));
        }
        let marker = "url(#arrowhead-default)";
        if (connection.condition === "true") {
          marker = "url(#arrowhead-true)";
        } else if (connection.condition === "false") {
          marker = "url(#arrowhead-false)";
        }
        const connectionElement = document.querySelector(`[data-connection-id="${connection.id}"]`);
        if (connectionElement) {
          connectionElement.setAttribute("d", path);
          connectionElement.setAttribute("stroke", color);
          connectionElement.setAttribute("marker-end", marker);
        }
      });
    } finally {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        isUpdatingHandles = false;
        resetTimer = null;
      }, 0);
    }
  };
  let isUpdatingHandles = false;
  let resetTimer = null;
  const connectionPaths = ref([]);
  watch([connections, nodes, connectionOffsetY], () => {
    if (isUpdatingHandles) {
      return;
    }
    const nodeHandleUsage = /* @__PURE__ */ new Map();
    connections.value.forEach((connection) => {
      const sourceId = connection.sourceNodeId;
      const targetId = connection.targetNodeId;
      if (!nodeHandleUsage.has(sourceId)) {
        nodeHandleUsage.set(sourceId, /* @__PURE__ */ new Set());
      }
      if (!nodeHandleUsage.has(targetId)) {
        nodeHandleUsage.set(targetId, /* @__PURE__ */ new Set());
      }
    });
    isUpdatingHandles = true;
    try {
      connectionPaths.value = connections.value.map((connection) => {
        const sourceNode = nodes.value.find((n) => n.id === connection.sourceNodeId);
        const targetNode = nodes.value.find((n) => n.id === connection.targetNodeId);
        if (!sourceNode && !targetNode) {
          return { id: connection.id, path: "", color: "", marker: "", direction: "horizontal", isOrphaned: true };
        } else if (!sourceNode) {
          return handleOrphanedConnection(connection, void 0, targetNode, connectionOffsetY);
        } else if (!targetNode) {
          return handleOrphanedConnection(connection, sourceNode, void 0, connectionOffsetY);
        }
        const sourceUsedHandles = nodeHandleUsage.get(connection.sourceNodeId) || /* @__PURE__ */ new Set();
        const targetUsedHandles = nodeHandleUsage.get(connection.targetNodeId) || /* @__PURE__ */ new Set();
        const connectionPoints = selectOptimalConnectionPoints(
          sourceNode,
          targetNode,
          connection,
          sourceUsedHandles,
          targetUsedHandles
        );
        const { sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle } = connectionPoints;
        if (sourceHandle) {
          const sourceUsed = nodeHandleUsage.get(connection.sourceNodeId) || /* @__PURE__ */ new Set();
          sourceUsed.add(sourceHandle);
          nodeHandleUsage.set(connection.sourceNodeId, sourceUsed);
        }
        if (targetHandle) {
          const targetUsed = nodeHandleUsage.get(connection.targetNodeId) || /* @__PURE__ */ new Set();
          targetUsed.add(targetHandle);
          nodeHandleUsage.set(connection.targetNodeId, targetUsed);
        }
        if (sourceHandle !== void 0 && connection.sourceHandle !== sourceHandle) {
          connection.sourceHandle = sourceHandle;
        }
        if (targetHandle !== void 0 && connection.targetHandle !== targetHandle) {
          connection.targetHandle = targetHandle;
        }
        const sourceIsRight = sourceX === sourceNode.position.x + (sourceNode.style?.width || 120);
        const sourceIsLeft = sourceX === sourceNode.position.x;
        const sourceIsTop = sourceY === sourceNode.position.y;
        const sourceIsBottom = sourceY === sourceNode.position.y + (sourceNode.style?.height || 60);
        const targetIsRight = targetX === targetNode.position.x + (targetNode.style?.width || 120);
        const targetIsLeft = targetX === targetNode.position.x;
        const targetIsTop = targetY === targetNode.position.y;
        const targetIsBottom = targetY === targetNode.position.y + (targetNode.style?.height || 60);
        const path = generateOrthogonalPath(
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourceIsRight,
          sourceIsLeft,
          sourceIsTop,
          sourceIsBottom,
          targetIsRight,
          targetIsLeft,
          targetIsTop,
          targetIsBottom
        );
        if (!path || !path.trim()) {
          return { id: connection.id, path: "", color: "", marker: "", direction: "horizontal" };
        }
        connection.lastSourceX = sourceX;
        connection.lastSourceY = sourceY;
        connection.lastTargetX = targetX;
        connection.lastTargetY = targetY;
        connection.lastPath = path;
        const { color, marker } = computeConnectionStyle(connection);
        const direction = getConnectionDirection(connection, path);
        return { id: connection.id, path: path || "", color, marker, direction };
      });
    } finally {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        isUpdatingHandles = false;
        resetTimer = null;
      }, 0);
    }
  }, { deep: true, immediate: true, flush: "post" });
  const clearConnections = () => {
    connections.value = [];
    selectedConnectionId.value = "";
    cancelConnection();
  };
  const addConnection = (connection) => {
    connections.value.push(connection);
  };
  const updateConnection = (connectionId, updates) => {
    const connection = connections.value.find((c) => c.id === connectionId);
    if (connection) {
      Object.assign(connection, updates);
    }
  };
  const handleConnectionStart = (event, node, type) => {
    event.stopPropagation();
    if (type === "input") {
      completeConnection(node.id);
    } else {
      const condition = type === "output-true" ? "true" : type === "output-false" ? "false" : void 0;
      startConnection(node.id, event, condition);
    }
  };
  const tempConnection = computed(() => connectionState.tempConnection);
  return {
    connections,
    selectedConnectionId,
    selectedConnection,
    connectionState,
    tempConnection,
    connectionPaths,
    startConnection,
    updateTempConnection,
    completeConnection,
    cancelConnection,
    selectConnection,
    updateConnectionProperties,
    updateConnection,
    addConnection,
    deleteConnection,
    deleteNodeConnections,
    getConnectionPath,
    connectionOffsetY,
    getConnectionColor,
    getConnectionMarker,
    handleConnectionStart,
    clearConnections,
    updateConnectionPaths
  };
}
function useStrategyOperations(nodes, connections) {
  const strategyName = ref("新策略编排");
  const showPreview = ref(false);
  const currentOrchestration = computed(() => ({
    id: Date.now().toString(),
    strategyId: "",
    nodes: nodes.value,
    connections: connections.value,
    variables: {},
    metadata: {
      version: "1.0.0",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  }));
  const validateOrchestration = async () => {
    try {
      const result = await strategyService.validateOrchestration(currentOrchestration.value);
      if (result.valid) {
        BtcMessage.success("策略编排验证通过");
        return true;
      } else {
        BtcMessage.error(`验证失败：${result.errors.join(", ")}`);
        return false;
      }
    } catch (error) {
      BtcMessage.error("验证失败");
      return false;
    }
  };
  const previewExecution = () => {
    if (nodes.value.length === 0) {
      BtcMessage.warning("请先添加节点");
      return;
    }
    showPreview.value = true;
  };
  const saveOrchestration = async (strategyId) => {
    if (!strategyId) {
      BtcMessage.warning("请先选择或创建策略");
      return false;
    }
    try {
      await strategyService.updateOrchestration(strategyId, currentOrchestration.value);
      BtcMessage.success("策略编排保存成功");
      return true;
    } catch (error) {
      BtcMessage.error("保存失败");
      return false;
    }
  };
  const loadOrchestration = async (strategyId) => {
    try {
      const orchestration = await strategyService.getOrchestration(strategyId);
      nodes.value = orchestration.nodes;
      connections.value = orchestration.connections;
      if (orchestration.metadata?.name) {
        strategyName.value = orchestration.metadata.name;
      }
      BtcMessage.success("策略编排加载成功");
      return orchestration;
    } catch (error) {
      console.error("Failed to load orchestration:", error);
      BtcMessage.error("加载策略编排失败");
      return null;
    }
  };
  const clearOrchestration = () => {
    nodes.value = [];
    connections.value = [];
    strategyName.value = "新策略编排";
    BtcMessage.success("编排已清空");
  };
  const exportOrchestration = () => {
    const data = JSON.stringify(currentOrchestration.value, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${strategyName.value || "strategy"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    BtcMessage.success("编排导出成功");
  };
  const importOrchestration = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result);
          if (data.nodes && data.connections) {
            nodes.value = data.nodes;
            connections.value = data.connections;
            if (data.metadata?.name) {
              strategyName.value = data.metadata.name;
            }
            BtcMessage.success("编排导入成功");
            resolve(true);
          } else {
            BtcMessage.error("无效的编排文件格式");
            resolve(false);
          }
        } catch (error) {
          BtcMessage.error("编排文件解析失败");
          resolve(false);
        }
      };
      reader.onerror = () => {
        BtcMessage.error("文件读取失败");
        resolve(false);
      };
      reader.readAsText(file);
    });
  };
  const handleSave = async () => {
    if (nodes.value.length === 0) {
      BtcMessage.warning("请先添加节点");
      return;
    }
    BtcMessage.success("策略编排保存成功");
  };
  return {
    // 状态
    strategyName,
    showPreview,
    currentOrchestration,
    // 方法
    validateOrchestration,
    previewExecution,
    saveOrchestration,
    handleSave,
    loadOrchestration,
    clearOrchestration,
    exportOrchestration,
    importOrchestration
  };
}
const DRAG_THRESHOLD_PX = 4;
function useNodeDrag(nodes, selectedNodeId, canvasDimensions, canvasScale, isResizing, isOverlayEditing, nodeIsDragging, moveNode, getHandlePositions, getArrowTransformByPos, handleNodeDoubleClick) {
  const dragState = reactive({
    isDragging: false,
    startX: 0,
    startY: 0,
    startNodeX: 0,
    startNodeY: 0,
    maybeDrag: false
  });
  const isDragging = computed(() => dragState.isDragging || nodeIsDragging.value);
  const draggingNodeId = computed(() => dragState.isDragging ? selectedNodeId.value : "");
  const syncNodeVisuals = (_nodeId, _x, _y) => {
    return;
  };
  const handleNodePointerDown = (e, node) => {
    if (isOverlayEditing.value) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (e.detail >= 2) {
      e.stopPropagation();
      e.preventDefault();
      if (handleNodeDoubleClick) {
        handleNodeDoubleClick(node, e);
      }
      return;
    }
    e.stopPropagation();
    dragState.isDragging = false;
    dragState.maybeDrag = true;
    selectedNodeId.value = node.id;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const container = document.querySelector(".canvas-scroll");
    const containerWidth = container ? container.getBoundingClientRect().width : canvasDimensions.value.width;
    const containerHeight = container ? container.getBoundingClientRect().height : canvasDimensions.value.height;
    const borderWidth = 1;
    const gridOffsetX = (containerWidth - canvasDimensions.value.width) / 2 + borderWidth;
    const gridOffsetY = (containerHeight - canvasDimensions.value.height) / 2 + borderWidth;
    const minX = gridOffsetX;
    const minY = gridOffsetY;
    const maxX = gridOffsetX + canvasDimensions.value.width - nodeWidth;
    const maxY = gridOffsetY + canvasDimensions.value.height - nodeHeight;
    dragState.startNodeX = Math.max(minX, Math.min(maxX, node.position.x));
    dragState.startNodeY = Math.max(minY, Math.min(maxY, node.position.y));
    if (dragState.startNodeX !== node.position.x || dragState.startNodeY !== node.position.y) {
      moveNode(node.id, { x: dragState.startNodeX, y: dragState.startNodeY });
    }
  };
  const handleNodePointerMove = (e) => {
    if (isOverlayEditing.value) return;
    if (e.buttons === 0) {
      if (dragState.isDragging || dragState.maybeDrag) {
        dragState.isDragging = false;
        dragState.maybeDrag = false;
      }
      return;
    }
    if (!dragState.isDragging || isResizing.value) {
      if (isResizing.value) ;
      if (dragState.maybeDrag) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
          dragState.isDragging = true;
          dragState.maybeDrag = false;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    const node = nodes.value.find((n) => n.id === selectedNodeId.value);
    if (!node) return;
    const deltaX = (e.clientX - dragState.startX) / canvasScale.value;
    const deltaY = (e.clientY - dragState.startY) / canvasScale.value;
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const container = document.querySelector(".canvas-scroll");
    const containerWidth = container ? container.getBoundingClientRect().width : canvasDimensions.value.width;
    const containerHeight = container ? container.getBoundingClientRect().height : canvasDimensions.value.height;
    const borderWidth = 1;
    const gridOffsetX = (containerWidth - canvasDimensions.value.width) / 2 + borderWidth;
    const gridOffsetY = (containerHeight - canvasDimensions.value.height) / 2 + borderWidth;
    const minX = gridOffsetX;
    const minY = gridOffsetY;
    const maxX = gridOffsetX + canvasDimensions.value.width - nodeWidth;
    const maxY = gridOffsetY + canvasDimensions.value.height - nodeHeight;
    const rawX = dragState.startNodeX + deltaX;
    const rawY = dragState.startNodeY + deltaY;
    let newX = Math.max(minX, Math.min(maxX, rawX));
    let newY = Math.max(minY, Math.min(maxY, rawY));
    newX = Math.round(newX);
    newY = Math.round(newY);
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    moveNode(node.id, { x: newX, y: newY });
  };
  const handleNodePointerUp = (e) => {
    if (dragState.isDragging) {
      dragState.isDragging = false;
      dragState.maybeDrag = false;
    }
    dragState.isDragging = false;
    dragState.maybeDrag = false;
  };
  return {
    dragState,
    isDragging,
    draggingNodeId,
    handleNodePointerDown,
    handleNodePointerMove,
    handleNodePointerUp,
    syncNodeVisuals,
    dragStateRefs: {
      isDragging: computed(() => dragState.isDragging),
      maybeDrag: computed(() => dragState.maybeDrag)
    }
  };
}
function useNodeResize(nodes, selectedNodeId, canvasDimensions, canvasScale, isMouseOnNodeBorder, getHandlePositions, getArrowTransform, getArrowTransformByPos) {
  const isResizing = ref(false);
  const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, nodeX: 0, nodeY: 0 });
  const resizeDirection = ref("");
  const resizingNodeId = ref("");
  const resizeRafId = ref(null);
  const handleResizeHandleEnter = () => {
    isMouseOnNodeBorder.value = true;
  };
  const handleResizeHandleLeave = () => {
    isMouseOnNodeBorder.value = false;
  };
  const syncNodeResizeVisuals = (nodeId, x, y, width, height) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node) return;
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) return;
    if (node.type === "START" || node.type === "END") {
      const circleElement = nodeElement.querySelector("circle");
      if (circleElement) {
        const radius = Math.min(width, height) / 2 - 2;
        circleElement.setAttribute("r", radius.toString());
        circleElement.setAttribute("cx", (width / 2).toString());
        circleElement.setAttribute("cy", (height / 2).toString());
      }
    } else if (node.type === "CONDITION") {
      const pathElement = nodeElement.querySelector("path");
      if (pathElement) {
        const diamondPath = `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`;
        pathElement.setAttribute("d", diamondPath);
      }
    } else {
      const rectElement = nodeElement.querySelector(".node-rect");
      if (rectElement) {
        rectElement.setAttribute("width", width.toString());
        rectElement.setAttribute("height", height.toString());
      }
    }
    const boundaryBox = nodeElement.querySelector(".boundary-box");
    if (boundaryBox) {
      const handleData = getHandlePositions(node.type, width, height);
      boundaryBox.setAttribute("x", handleData.boundaryBox.x.toString());
      boundaryBox.setAttribute("y", handleData.boundaryBox.y.toString());
      boundaryBox.setAttribute("width", handleData.boundaryBox.width.toString());
      boundaryBox.setAttribute("height", handleData.boundaryBox.height.toString());
    }
    const handles = nodeElement.querySelectorAll('.resize-handles > g[class^="handle-"]');
    handles.forEach((handle) => {
      const cls = handle.getAttribute("class") || "";
      const match = cls.match(/handle-(\w+)/);
      const handleType = match?.[1];
      if (!handleType) return;
      const handleData = getHandlePositions(node.type, width, height);
      const pos = handleData.positions[handleType];
      if (pos) {
        handle.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);
      }
    });
    const textElement = nodeElement.querySelector(".node-text");
    if (textElement) {
      textElement.setAttribute("x", (width / 2).toString());
      textElement.setAttribute("y", (height / 2).toString());
    }
    const foreignObject = nodeElement.querySelector("foreignObject");
    if (foreignObject) {
      foreignObject.setAttribute("width", width.toString());
      foreignObject.setAttribute("height", height.toString());
    }
  };
  const handleResizeStart = (event, node, direction) => {
    event.stopPropagation();
    isResizing.value = true;
    resizingNodeId.value = node.id;
    resizeDirection.value = direction;
    resizeStart.value = {
      x: event.clientX,
      y: event.clientY,
      width: node.style?.width || 120,
      height: node.style?.height || 60,
      nodeX: node.position.x,
      nodeY: node.position.y
    };
  };
  const handleResizeMove = (event) => {
    if (!isResizing.value) return;
    const deltaX = (event.clientX - resizeStart.value.x) / canvasScale.value;
    const deltaY = (event.clientY - resizeStart.value.y) / canvasScale.value;
    const node = nodes.value.find((n) => n.id === selectedNodeId.value);
    if (!node) return;
    let newWidth = node.style?.width || 120;
    let newHeight = node.style?.height || 60;
    let newX = node.position.x;
    let newY = node.position.y;
    switch (resizeDirection.value) {
      case "top-left":
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newX = resizeStart.value.nodeX + deltaX;
        newY = resizeStart.value.nodeY + deltaY;
        break;
      case "top-right":
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newY = resizeStart.value.nodeY + deltaY;
        break;
      case "bottom-left":
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        newX = resizeStart.value.nodeX + deltaX;
        break;
      case "bottom-right":
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        break;
      case "top":
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newY = resizeStart.value.nodeY + deltaY;
        break;
      case "bottom":
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        break;
      case "left":
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newX = resizeStart.value.nodeX + deltaX;
        break;
      case "right":
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        break;
    }
    const container = document.querySelector(".canvas-scroll");
    const containerWidth = container ? container.getBoundingClientRect().width : canvasDimensions.value.width;
    const containerHeight = container ? container.getBoundingClientRect().height : canvasDimensions.value.height;
    const borderWidth = 1;
    const gridOffsetX = (containerWidth - canvasDimensions.value.width) / 2 + borderWidth;
    const gridOffsetY = (containerHeight - canvasDimensions.value.height) / 2 + borderWidth;
    const minX = gridOffsetX;
    const minY = gridOffsetY;
    const maxX = gridOffsetX + canvasDimensions.value.width - newWidth;
    const maxY = gridOffsetY + canvasDimensions.value.height - newHeight;
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    newX = Math.round(newX);
    newY = Math.round(newY);
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    if (resizeRafId.value !== null) {
      cancelAnimationFrame(resizeRafId.value);
    }
    resizeRafId.value = requestAnimationFrame(() => {
      syncNodeResizeVisuals(node.id, newX, newY, newWidth, newHeight);
      node.position.x = newX;
      node.position.y = newY;
      if (!node.style) node.style = {};
      node.style.width = newWidth;
      node.style.height = newHeight;
      resizeRafId.value = null;
    });
  };
  const handleResizeEnd = () => {
    if (resizeRafId.value !== null) {
      cancelAnimationFrame(resizeRafId.value);
      resizeRafId.value = null;
    }
    isResizing.value = false;
    resizeDirection.value = "";
    resizingNodeId.value = "";
    nextTick(() => {
      const node = nodes.value.find((n) => n.id === selectedNodeId.value);
      const nodeElement = document.querySelector(`[data-node-id="${node?.id}"]`);
      if (nodeElement && node) {
        const arrowGroups = nodeElement.querySelectorAll(".connection-arrow-group");
        arrowGroups.forEach((arrowGroup) => {
          const pathElement = arrowGroup.querySelector(".arrow-shape");
          if (pathElement) {
            const direction = pathElement.getAttribute("data-arrow-direction");
            if (direction) {
              const transform = getArrowTransform(node, direction);
              pathElement.setAttribute("transform", transform);
            }
          }
        });
        const handleData = getHandlePositions(node.type, node.style?.width || 120, node.style?.height || 60);
        const handles = nodeElement.querySelectorAll(".resize-handles > g");
        handles.forEach((handle) => {
          const className = handle.getAttribute("class");
          if (className) {
            const handleType = className.replace("handle-", "");
            const position = handleData.positions[handleType];
            if (position) {
              handle.setAttribute("transform", `translate(${position.x}, ${position.y})`);
            }
          }
        });
      }
    });
  };
  return {
    isResizing,
    resizeStart,
    resizeDirection,
    resizingNodeId,
    resizeRafId,
    handleResizeHandleEnter,
    handleResizeHandleLeave,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    syncNodeResizeVisuals
  };
}
function useNodeGeometry(canvasDimensions) {
  const positionBoxPlacementLocal = /* @__PURE__ */ new Map();
  const getHandlePositions = (nodeType, width, height) => {
    let result;
    if (nodeType === "START" || nodeType === "END") {
      const radius = Math.min(width, height) / 2;
      const boundarySize = radius * 2;
      const offsetX = (width - boundarySize) / 2;
      const offsetY = (height - boundarySize) / 2;
      result = {
        positions: {
          "top": { x: radius + offsetX, y: offsetY },
          "top-right": { x: boundarySize + offsetX, y: offsetY },
          "right": { x: boundarySize + offsetX, y: radius + offsetY },
          "bottom-right": { x: boundarySize + offsetX, y: boundarySize + offsetY },
          "bottom": { x: radius + offsetX, y: boundarySize + offsetY },
          "bottom-left": { x: offsetX, y: boundarySize + offsetY },
          "left": { x: offsetX, y: radius + offsetY },
          "top-left": { x: offsetX, y: offsetY }
        },
        boundaryBox: {
          x: offsetX,
          y: offsetY,
          width: boundarySize,
          height: boundarySize
        }
      };
    } else if (nodeType === "CONDITION") {
      result = {
        positions: {
          "top": { x: width / 2, y: 0 },
          "top-right": { x: width, y: 0 },
          "right": { x: width, y: height / 2 },
          "bottom-right": { x: width, y: height },
          "bottom": { x: width / 2, y: height },
          "bottom-left": { x: 0, y: height },
          "left": { x: 0, y: height / 2 },
          "top-left": { x: 0, y: 0 }
        },
        boundaryBox: {
          x: 0,
          y: 0,
          width,
          height
        }
      };
    } else {
      result = {
        positions: {
          "top": { x: width / 2, y: 0 },
          "top-right": { x: width, y: 0 },
          "right": { x: width, y: height / 2 },
          "bottom-right": { x: width, y: height },
          "bottom": { x: width / 2, y: height },
          "bottom-left": { x: 0, y: height },
          "left": { x: 0, y: height / 2 },
          "top-left": { x: 0, y: 0 }
        },
        boundaryBox: {
          x: 0,
          y: 0,
          width,
          height
        }
      };
    }
    return result;
  };
  const getArrowTransform = (node, direction) => {
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const handleData = getHandlePositions(node.type, nodeWidth, nodeHeight);
    const b = handleData.boundaryBox;
    const cxLocal = b.x + b.width / 2;
    const cyLocal = b.y + b.height / 2;
    const arrowOffset = 20;
    switch (direction) {
      case "top": {
        const targetX = cxLocal;
        const targetY = b.y - arrowOffset;
        return `translate(${targetX - 60}, ${targetY + 10})`;
      }
      case "right": {
        const targetX = b.x + b.width + arrowOffset;
        const targetY = cyLocal;
        return `translate(${targetX - 10}, ${targetY - 30})`;
      }
      case "bottom": {
        const targetX = cxLocal;
        const targetY = b.y + b.height + arrowOffset;
        return `translate(${targetX - 60}, ${targetY - 10})`;
      }
      case "left": {
        const targetX = b.x - arrowOffset;
        const targetY = cyLocal;
        return `translate(${targetX - 30}, ${targetY - 30})`;
      }
      default:
        return "translate(0, 0)";
    }
  };
  const getArrowTransformByPos = (x, y, nodeType, width, height, direction) => {
    switch (direction) {
      case "top": {
        const topTargetX = x + width / 2;
        const topTargetY = y - 10;
        return `translate(${topTargetX - 60}, ${topTargetY + 10})`;
      }
      case "right": {
        const rightTargetX = x + width + 10;
        const rightTargetY = y + height / 2;
        return `translate(${rightTargetX - 10}, ${rightTargetY - 30})`;
      }
      case "bottom": {
        const bottomTargetX = x + width / 2;
        const bottomTargetY = y + height + 10;
        return `translate(${bottomTargetX - 60}, ${bottomTargetY - 10})`;
      }
      case "left": {
        const leftTargetX = x - 10;
        const leftTargetY = y + height / 2;
        return `translate(${leftTargetX - 30}, ${leftTargetY - 30})`;
      }
      default:
        return "translate(0, 0)";
    }
  };
  const getHandleCursor = (handleType) => {
    const cursorMap = {
      "top": "n-resize",
      "top-right": "ne-resize",
      "right": "e-resize",
      "bottom-right": "se-resize",
      "bottom": "s-resize",
      "bottom-left": "sw-resize",
      "left": "w-resize",
      "top-left": "nw-resize"
    };
    return cursorMap[handleType] || "default";
  };
  const getPositionBoxLocalTransform = (node) => {
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const BOX_W = 70;
    const BOX_H = 18;
    const MARGIN = 20;
    const canvasH = canvasDimensions.value.height;
    const bottomSpace = Math.round(canvasH - (node.position.y + nodeHeight));
    const needSpace = Math.round(MARGIN + BOX_H);
    const prev = positionBoxPlacementLocal.get(node.id) ?? "bottom";
    let place = prev;
    const H = 6;
    if (prev === "bottom" && bottomSpace < needSpace - H) place = "top";
    else if (prev === "top" && bottomSpace > needSpace + H) place = "bottom";
    else if (!positionBoxPlacementLocal.has(node.id)) place = bottomSpace >= needSpace ? "bottom" : "top";
    positionBoxPlacementLocal.set(node.id, place);
    const localX = Math.round(nodeWidth / 2 - BOX_W / 2);
    const localY = place === "bottom" ? Math.round(nodeHeight + MARGIN) : Math.round(-BOX_H - MARGIN);
    return `translate(${localX}, ${localY})`;
  };
  return {
    getHandlePositions,
    getArrowTransform,
    getArrowTransformByPos,
    getHandleCursor,
    getPositionBoxLocalTransform,
    positionBoxPlacementLocal
  };
}
function useNodeStyle(nodes, connectionState) {
  const getThemeColor = (cssVar) => {
    if (typeof window !== "undefined") {
      const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return color || "#ffffff";
    }
    return "#ffffff";
  };
  const isDarkTheme = computed(() => {
    if (typeof window !== "undefined") {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue("--el-bg-color").trim();
      return bgColor.includes("dark") || bgColor.includes("#1a1a1a") || bgColor.includes("#000");
    }
    return false;
  });
  const getNodeText = (type) => {
    const textMap = {
      "START": "开始",
      "END": "结束",
      "CONDITION": "条件",
      "ACTION": "动作",
      "DECISION": "决策",
      "GATEWAY": "网关"
    };
    return textMap[type] || "节点";
  };
  const getNodeFillColor = (type) => {
    return "none";
  };
  const getNodeStrokeColor = (type) => {
    if (typeof window !== "undefined") {
      const borderColor = getComputedStyle(document.documentElement).getPropertyValue("--el-border-color").trim();
      return borderColor || "#dcdfe6";
    }
    return "#dcdfe6";
  };
  const getNodeTextColor = (type) => {
    const colorMap = {
      "START": "#2d5016",
      // 深绿色
      "END": "#5c2121",
      // 深红色
      "CONDITION": "#6c5b00",
      // 深黄色
      "ACTION": "#1f4e79",
      // 深蓝色
      "DECISION": "#4c2a5c",
      // 深紫色
      "GATEWAY": "#333333"
      // 深灰色
    };
    return colorMap[type] || "#333333";
  };
  const getConnectionColor = () => {
    return isDarkTheme.value ? getThemeColor("--el-color-white") : getThemeColor("--el-text-color-primary");
  };
  const getTempConnectionColor = () => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId) {
      return "var(--el-color-primary)";
    }
    const fromNode = nodes.value.find((n) => n.id === connectionState.fromNodeId);
    if (!fromNode) {
      return "var(--el-color-primary)";
    }
    if (fromNode.type === "CONDITION" || fromNode.type === "DECISION") {
      if (connectionState.fromCondition === "true") {
        return "var(--el-color-success)";
      } else if (connectionState.fromCondition === "false") {
        return "var(--el-color-danger)";
      }
    }
    return "var(--el-color-primary)";
  };
  const getGridColor = (isSmall = true) => {
    if (isSmall) {
      return isDarkTheme.value ? getThemeColor("--el-border-color") : getThemeColor("--el-text-color-placeholder");
    } else {
      if (isDarkTheme.value) {
        return getThemeColor("--el-border-color-light") || getThemeColor("--el-border-color");
      } else {
        return getThemeColor("--el-text-color-regular") || getThemeColor("--el-text-color-primary") || "#606266";
      }
    }
  };
  return {
    getNodeText,
    getNodeFillColor,
    getNodeStrokeColor,
    getNodeTextColor,
    getConnectionColor,
    getTempConnectionColor,
    getGridColor,
    getThemeColor,
    isDarkTheme
  };
}
function useConnectionHandles(connections, nodes, connectionOffsetY, canvasScale) {
  let draggingConnId = null;
  let dragStartY = 0;
  let startOffset = 0;
  const getConnectionPoint = (node, handle, defaultHandle) => {
    const w = node.style?.width || 120;
    const h = node.style?.height || 60;
    const handleType = handle || defaultHandle;
    switch (handleType) {
      case "top":
        return { x: node.position.x + w / 2, y: node.position.y };
      case "bottom":
        return { x: node.position.x + w / 2, y: node.position.y + h };
      case "left":
        return { x: node.position.x, y: node.position.y + h / 2 };
      case "right":
        return { x: node.position.x + w, y: node.position.y + h / 2 };
      default:
        return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
    }
  };
  const parsePath = (pathString) => {
    const points = [];
    if (!pathString) return points;
    const moveMatch = pathString.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
    if (moveMatch) {
      const x = parseFloat(moveMatch[1]);
      const y = parseFloat(moveMatch[2]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }
    const lineRegex = /L\s+([\d.-]+)\s+([\d.-]+)/g;
    let match;
    while ((match = lineRegex.exec(pathString)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      if (!isNaN(x) && !isNaN(y)) {
        const lastPoint = points[points.length - 1];
        if (lastPoint && Math.abs(lastPoint.x - x) < 0.1 && Math.abs(lastPoint.y - y) < 0.1) {
          continue;
        }
        points.push({ x, y });
      }
    }
    return points;
  };
  const getConnectionHandle = (pathId, pathString) => {
    const conn = connections.value.find((c) => c.id === pathId);
    if (!conn) {
      return { sx: 0, sy: 0, middleHandles: [], tx: 0, ty: 0 };
    }
    if (pathString) {
      const pathPoints2 = parsePath(pathString);
      if (pathPoints2.length < 2) {
        return { sx: 0, sy: 0, middleHandles: [], tx: 0, ty: 0 };
      }
      const sx2 = pathPoints2[0].x;
      const sy2 = pathPoints2[0].y;
      const tx2 = pathPoints2[pathPoints2.length - 1].x;
      const ty2 = pathPoints2[pathPoints2.length - 1].y;
      const middleHandles2 = [];
      for (let i = 0; i < pathPoints2.length - 1; i++) {
        const p1 = pathPoints2[i];
        const p2 = pathPoints2[i + 1];
        if (Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1) {
          continue;
        }
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        middleHandles2.push({
          x: Math.round(midX),
          y: Math.round(midY),
          segmentIndex: i
        });
      }
      const result2 = {
        sx: Math.round(sx2),
        sy: Math.round(sy2),
        middleHandles: middleHandles2,
        tx: Math.round(tx2),
        ty: Math.round(ty2)
      };
      return result2;
    }
    const s = nodes.value.find((n) => n.id === conn.sourceNodeId);
    const t = nodes.value.find((n) => n.id === conn.targetNodeId);
    if (!s || !t) {
      return { sx: 0, sy: 0, middleHandles: [], tx: 0, ty: 0 };
    }
    const sxCenter = s.position.x + (s.style?.width || 120) / 2;
    const syCenter = s.position.y + (s.style?.height || 60) / 2;
    const txCenter = t.position.x + (t.style?.width || 120) / 2;
    const tyCenter = t.position.y + (t.style?.height || 60) / 2;
    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;
    const defaultSourceHandle = Math.abs(dx) >= Math.abs(dy) ? dx >= 0 ? "right" : "left" : dy >= 0 ? "bottom" : "top";
    const defaultTargetHandle = Math.abs(dx) >= Math.abs(dy) ? dx >= 0 ? "left" : "right" : dy >= 0 ? "top" : "bottom";
    const sourcePoint = getConnectionPoint(s, conn.sourceHandle, defaultSourceHandle);
    const targetPoint = getConnectionPoint(t, conn.targetHandle, defaultTargetHandle);
    const sx = sourcePoint.x;
    const sy = sourcePoint.y;
    const tx = targetPoint.x;
    const ty = targetPoint.y;
    const offset = connectionOffsetY[conn.id] || 0;
    const actualDx = tx - sx;
    const actualDy = ty - sy;
    let pathPoints = [];
    if (Math.abs(actualDx) >= Math.abs(actualDy)) {
      const midX = sx + (tx - sx) / 2;
      const midY = (sy + ty) / 2 + offset;
      if (Math.abs(sy - ty) < 1 && Math.abs(offset) < 1) {
        pathPoints = [
          { x: sx, y: sy },
          { x: midX, y: sy },
          { x: tx, y: ty }
        ];
      } else {
        pathPoints = [
          { x: sx, y: sy },
          { x: midX, y: sy },
          { x: midX, y: midY },
          { x: midX, y: ty },
          { x: tx, y: ty }
        ];
      }
    } else {
      const midY = (sy + ty) / 2 + offset;
      const midX = (sx + tx) / 2;
      if (Math.abs(sx - tx) < 1 && Math.abs(offset) < 1) {
        pathPoints = [
          { x: sx, y: sy },
          { x: sx, y: midY },
          { x: tx, y: ty }
        ];
      } else {
        pathPoints = [
          { x: sx, y: sy },
          { x: sx, y: midY },
          { x: midX, y: midY },
          { x: tx, y: midY },
          { x: tx, y: ty }
        ];
      }
    }
    const middleHandles = [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      middleHandles.push({
        x: Math.round(midX),
        y: Math.round(midY),
        segmentIndex: i
      });
    }
    const result = {
      sx: Math.round(sx),
      sy: Math.round(sy),
      middleHandles,
      tx: Math.round(tx),
      ty: Math.round(ty)
    };
    return result;
  };
  const startDragConnectionHandle = (e, connectionId, segmentIndex) => {
    draggingConnId = connectionId;
    dragStartY = e.clientY;
    startOffset = connectionOffsetY[connectionId] || 0;
    window.addEventListener("mousemove", onDragConnMove);
    window.addEventListener("mouseup", onDragConnUp, { once: true });
  };
  const onDragConnMove = (e) => {
    if (!draggingConnId) return;
    const conn = connections.value.find((c) => c.id === draggingConnId);
    if (!conn) return;
    const s = nodes.value.find((n) => n.id === conn.sourceNodeId);
    const t = nodes.value.find((n) => n.id === conn.targetNodeId);
    if (!s || !t) return;
    const sw = s.style?.width || 120;
    const sh = s.style?.height || 60;
    const tw = t.style?.width || 120;
    const th = t.style?.height || 60;
    const sxCenter = s.position.x + sw / 2;
    const syCenter = s.position.y + sh / 2;
    const txCenter = t.position.x + tw / 2;
    const tyCenter = t.position.y + th / 2;
    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;
    const canvas = document.querySelector(".strategy-canvas");
    if (!canvas) return;
    const pt = canvas.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    pt.matrixTransform(canvas.getScreenCTM()?.inverse());
    const dyClient = e.clientY - dragStartY;
    const dyWorld = dyClient / canvasScale.value;
    const currentOffset = startOffset + dyWorld;
    let newSourceHandle = conn.sourceHandle;
    let newTargetHandle = conn.targetHandle;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const sourceY = syCenter;
      const targetY = tyCenter;
      const midY = (sourceY + targetY) / 2 + currentOffset;
      const sourceTop = s.position.y;
      const sourceBottom = s.position.y + sh;
      const targetTop = t.position.y;
      const targetBottom = t.position.y + th;
      if (midY >= sourceBottom) {
        newSourceHandle = "bottom";
      } else if (midY <= sourceTop) {
        newSourceHandle = "top";
      } else if (midY > sourceTop && midY < sourceBottom) {
        newSourceHandle = dx >= 0 ? "right" : "left";
      }
      if (midY >= targetBottom) {
        newTargetHandle = "bottom";
      } else if (midY <= targetTop) {
        newTargetHandle = "top";
      } else if (midY > targetTop && midY < targetBottom) {
        newTargetHandle = dx >= 0 ? "left" : "right";
      }
    } else {
      const sourceX = sxCenter;
      const targetX = txCenter;
      const midX = (sourceX + targetX) / 2;
      const sourceLeft = s.position.x;
      const sourceRight = s.position.x + sw;
      const targetLeft = t.position.x;
      const targetRight = t.position.x + tw;
      (s.position.y + (dy >= 0 ? s.position.y + sh : s.position.y) + t.position.y + (dy >= 0 ? t.position.y : t.position.y + th)) / 2 + currentOffset;
      if (midX >= sourceRight) {
        newSourceHandle = "right";
      } else if (midX <= sourceLeft) {
        newSourceHandle = "left";
      } else if (midX > sourceLeft && midX < sourceRight) {
        newSourceHandle = dy >= 0 ? "bottom" : "top";
      }
      if (midX >= targetRight) {
        newTargetHandle = "right";
      } else if (midX <= targetLeft) {
        newTargetHandle = "left";
      } else if (midX > targetLeft && midX < targetRight) {
        newTargetHandle = dy >= 0 ? "top" : "bottom";
      }
    }
    const getConnectionPoint2 = (node, handle) => {
      const w = node.style?.width || 120;
      const h = node.style?.height || 60;
      switch (handle) {
        case "top":
          return { x: node.position.x + w / 2, y: node.position.y };
        case "bottom":
          return { x: node.position.x + w / 2, y: node.position.y + h };
        case "left":
          return { x: node.position.x, y: node.position.y + h / 2 };
        case "right":
          return { x: node.position.x + w, y: node.position.y + h / 2 };
        default:
          return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
      }
    };
    const sourcePoint = getConnectionPoint2(s, newSourceHandle);
    const targetPoint = getConnectionPoint2(t, newTargetHandle);
    const actualDx = targetPoint.x - sourcePoint.x;
    targetPoint.y - sourcePoint.y;
    const isSourceVertical = newSourceHandle === "top" || newSourceHandle === "bottom";
    const isTargetVertical = newTargetHandle === "top" || newTargetHandle === "bottom";
    if (isSourceVertical && isTargetVertical && Math.abs(actualDx) < 0.1 && Math.abs(currentOffset) < 0.1) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        newSourceHandle = dx >= 0 ? "right" : "left";
        newTargetHandle = dx >= 0 ? "left" : "right";
      }
    }
    const handleChanged = newSourceHandle !== conn.sourceHandle || newTargetHandle !== conn.targetHandle;
    if (handleChanged) {
      conn.sourceHandle = newSourceHandle;
      conn.targetHandle = newTargetHandle;
      connectionOffsetY[draggingConnId] = 0;
    } else {
      connectionOffsetY[draggingConnId] = Math.round(currentOffset);
    }
  };
  const onDragConnUp = () => {
    window.removeEventListener("mousemove", onDragConnMove);
    draggingConnId = null;
  };
  return {
    getConnectionHandle,
    startDragConnectionHandle
  };
}
function useComponentMenu(nodes, connections, componentLibrary, addNode, generateId, getConnectionColor, activeArrowDirection) {
  const showComponentMenuFlag = ref(false);
  const componentMenuPosition = ref({ x: 0, y: 0 });
  const selectedNodeForConnection = ref(null);
  const selectedDirection = ref("");
  const showComponentMenu = (node, direction) => {
    selectedNodeForConnection.value = node;
    selectedDirection.value = direction;
    const canvas = document.querySelector(".strategy-canvas");
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    let menuX = canvasRect.left + node.position.x;
    let menuY = canvasRect.top + node.position.y;
    switch (direction) {
      case "top":
        menuX += nodeWidth / 2;
        menuY -= 32;
        break;
      case "right":
        menuX += nodeWidth + 32;
        menuY += nodeHeight / 2;
        break;
      case "bottom":
        menuX += nodeWidth / 2;
        menuY += nodeHeight + 32;
        break;
      case "left":
        menuX -= 32;
        menuY += nodeHeight / 2;
        break;
    }
    componentMenuPosition.value = { x: menuX, y: menuY };
    showComponentMenuFlag.value = true;
  };
  const calculateNewNodePosition = (sourceNode, direction) => {
    const gap = 50;
    const sourceW = sourceNode.style?.width || 120;
    const sourceH = sourceNode.style?.height || 60;
    const targetW = 120;
    const targetH = 60;
    const sourceX = sourceNode.position.x;
    const sourceY = sourceNode.position.y;
    switch (direction) {
      case "top":
        return { x: sourceX + (sourceW - targetW) / 2, y: sourceY - gap - targetH };
      case "right":
        return { x: sourceX + sourceW + gap, y: sourceY + (sourceH - targetH) / 2 };
      case "bottom":
        return { x: sourceX + (sourceW - targetW) / 2, y: sourceY + sourceH + gap };
      case "left":
        return { x: sourceX - gap - targetW, y: sourceY + (sourceH - targetH) / 2 };
      default:
        return { x: sourceX + sourceW + gap, y: sourceY };
    }
  };
  const findNearbyNode = (sourceNode, direction) => {
    const threshold = 200;
    const sourceX = sourceNode.position.x;
    const sourceY = sourceNode.position.y;
    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;
    return nodes.value.find((node) => {
      if (node.id === sourceNode.id) return false;
      const targetX = node.position.x;
      const targetY = node.position.y;
      const targetWidth = node.style?.width || 120;
      const targetHeight = node.style?.height || 60;
      const sourceCenterX = sourceX + sourceWidth / 2;
      const sourceCenterY = sourceY + sourceHeight / 2;
      const targetCenterX = targetX + targetWidth / 2;
      const targetCenterY = targetY + targetHeight / 2;
      const deltaX = targetCenterX - sourceCenterX;
      const deltaY = targetCenterY - sourceCenterY;
      switch (direction) {
        case "top":
          return deltaY < 0 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold;
        case "right":
          return deltaX > 0 && Math.abs(deltaY) < threshold && Math.abs(deltaX) < threshold;
        case "bottom":
          return deltaY > 0 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold;
        case "left":
          return deltaX < 0 && Math.abs(deltaY) < threshold && Math.abs(deltaX) < threshold;
        default:
          return false;
      }
    });
  };
  const createConnection = (sourceNode, targetNode, direction) => {
    let condition = void 0;
    if (sourceNode.type === "CONDITION" || sourceNode.type === "DECISION") {
      if (direction === "right") {
        condition = "true";
      } else if (direction === "left") {
        condition = "false";
      }
    }
    const newConnection = {
      id: generateId(),
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      condition,
      type: ConnectorType.SEQUENCE,
      style: {
        strokeColor: getConnectionColor(),
        strokeWidth: 2
      }
    };
    connections.value.push(newConnection);
    activeArrowDirection.value = "";
  };
  const selectComponent = async (component) => {
    if (selectedNodeForConnection.value) {
      const newNodePosition = calculateNewNodePosition(selectedNodeForConnection.value, selectedDirection.value);
      const newNode = await addNode(component, newNodePosition);
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (newNode) {
        let condition = void 0;
        if (selectedNodeForConnection.value.type === "CONDITION" || selectedNodeForConnection.value.type === "DECISION") {
          if (selectedDirection.value === "right") {
            condition = "true";
          } else if (selectedDirection.value === "left") {
            condition = "false";
          }
        }
        const newConnection = {
          id: generateId(),
          sourceNodeId: selectedNodeForConnection.value.id,
          targetNodeId: newNode.id,
          condition,
          type: ConnectorType.SEQUENCE,
          style: {
            strokeColor: getConnectionColor(),
            strokeWidth: 2
          }
        };
        connections.value.push(newConnection);
      }
    }
    closeComponentMenu();
  };
  const closeComponentMenu = () => {
    showComponentMenuFlag.value = false;
    selectedNodeForConnection.value = null;
    selectedDirection.value = "";
    activeArrowDirection.value = "";
  };
  const getCommonComponents = () => {
    if (!componentLibrary.value || componentLibrary.value.length === 0) {
      return [];
    }
    return componentLibrary.value.slice(0, 6);
  };
  const getDirectionText = (direction) => {
    const directionMap = {
      "top": "上方",
      "right": "右侧",
      "bottom": "下方",
      "left": "左侧"
    };
    return directionMap[direction] || "";
  };
  return {
    showComponentMenuFlag,
    componentMenuPosition,
    selectedNodeForConnection,
    selectedDirection,
    showComponentMenu,
    selectComponent,
    closeComponentMenu,
    calculateNewNodePosition,
    getCommonComponents,
    getDirectionText,
    findNearbyNode,
    createConnection
  };
}
function useTextEditor(nodes, selectedNodeId, canvasScale, panX, panY, canvasDimensions, dragState, getNodeText) {
  const editingNodeId = ref(null);
  const editingNodeIdString = computed(() => editingNodeId.value ?? "");
  const editingText = ref("");
  const isOverlayEditing = ref(false);
  const defaultTextConfig = {
    fontSize: 16,
    // 默认字体大小
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: "normal",
    fontStyle: "normal"
  };
  const fontFamilyOptions = [
    { label: "系统默认", value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    { label: "等宽字体", value: "'Courier New', 'Monaco', 'Menlo', monospace" },
    { label: "衬线字体", value: "'Times New Roman', 'Times', serif" },
    { label: "圆润字体", value: "'Comic Sans MS', 'Chalkboard', cursive" },
    { label: "粗体字体", value: "'Impact', 'Arial Black', sans-serif" },
    { label: "微软雅黑", value: "'Microsoft YaHei', '微软雅黑', sans-serif" },
    { label: "宋体", value: "'SimSun', '宋体', serif" },
    { label: "黑体", value: "'SimHei', '黑体', sans-serif" }
  ];
  const getFontFamilyLabel = (fontFamily) => {
    const option = fontFamilyOptions.find((opt) => opt.value === fontFamily);
    return option ? option.label : fontFamily;
  };
  const nodeTextConfig = ref({ ...defaultTextConfig });
  const updateNodeTextConfig = () => {
    if (selectedNodeId.value) {
      const selectedNode = nodes.value.find((node) => node.id === selectedNodeId.value);
      if (selectedNode) {
        if (!selectedNode.textConfig) {
          selectedNode.textConfig = {};
        }
        selectedNode.textConfig = { ...nodeTextConfig.value };
      }
    }
  };
  watch(nodeTextConfig, () => {
    updateNodeTextConfig();
  }, { deep: true });
  function getScreenBoxForNodeText(nodeId) {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node) return null;
    const svg = document.querySelector(".strategy-canvas");
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = canvasScale.value ?? 1;
    const panXVal = panX.value ?? 0;
    const panYVal = panY.value ?? 0;
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const centerX = rect.left + panXVal + scale * (node.position.x + nodeWidth / 2);
    const centerY = rect.top + panYVal + scale * (node.position.y + nodeHeight / 2);
    const textEl = document.querySelector(`[data-node-id="${nodeId}"] text.node-text`);
    return { centerX, centerY, nodeWidth, nodeHeight, scale, textEl };
  }
  function openOverlayTextEditor(node) {
    dragState.isDragging.value = false;
    dragState.maybeDrag.value = false;
    isOverlayEditing.value = true;
    editingNodeId.value = node.id;
    const box = getScreenBoxForNodeText(node.id);
    if (!box || !box.textEl) return;
    let oldOpacity = "";
    if (box.textEl) {
      oldOpacity = box.textEl.style.opacity;
      box.textEl.style.opacity = "0";
    }
    const layer = document.getElementById("text-editor-layer");
    if (!layer) return;
    const editor = document.createElement("div");
    editor.className = "overlay-contenteditable-editor";
    editor.setAttribute("contenteditable", "true");
    const computedFontFamily = box.textEl?.getAttribute("font-family") || "system-ui, -apple-system, Segoe UI, sans-serif";
    const computedFontSize = box.textEl?.getAttribute("font-size") || "14px";
    const fontSizePx = typeof computedFontSize === "string" ? computedFontSize : `${computedFontSize}px`;
    Object.assign(editor.style, {
      position: "fixed",
      zIndex: "1005",
      left: `${box.centerX}px`,
      top: `${box.centerY}px`,
      margin: "0",
      padding: "0",
      border: "1px solid transparent",
      outline: "none",
      background: "transparent",
      overflow: "hidden",
      userSelect: "text",
      transformOrigin: "0 0"
    });
    const anchor = box.textEl?.getAttribute("text-anchor") || "start";
    const baseline = box.textEl?.getAttribute("dominant-baseline") || "text-before-edge";
    let txPct = 0;
    if (anchor === "middle") txPct = -50;
    else if (anchor === "end") txPct = -100;
    let tyPct = 0;
    if (baseline === "middle" || baseline === "central") tyPct = -50;
    else tyPct = -50;
    editor.style.transform = `scale(${box.scale}) translate(${txPct}%, ${tyPct}%)`;
    editor.style.fontFamily = computedFontFamily;
    editor.style.fontSize = fontSizePx;
    editor.style.lineHeight = "1.2";
    editor.style.letterSpacing = "0";
    editor.style.color = box.textEl?.getAttribute("fill") || "#000";
    editor.style.textAlign = anchor === "middle" ? "center" : anchor === "end" ? "right" : "left";
    editor.style.whiteSpace = "normal";
    editor.style.overflowWrap = "normal";
    editor.style.minHeight = "1em";
    editor.style.maxWidth = `${Math.max(120, Math.min(330, box.nodeWidth * box.scale * 1.65))}px`;
    const currentText = node.text && node.text.toString().trim() !== "" ? node.text : getNodeText(node.type);
    editor.textContent = currentText;
    editingText.value = currentText;
    layer.appendChild(editor);
    const commit = () => {
      const v = (editor.textContent ?? "").toString();
      const trimmed = v.trim();
      node.text = trimmed === "" ? void 0 : v;
      finishTextEditing();
      cleanup();
    };
    const cancel = () => {
      cleanup();
    };
    const onKey = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    };
    const onBlur = () => commit();
    function cleanup() {
      editor.removeEventListener("keydown", onKey);
      editor.removeEventListener("blur", onBlur);
      editor.remove();
      if (box && box.textEl) box.textEl.style.opacity = oldOpacity || "1";
      isOverlayEditing.value = false;
      editingNodeId.value = null;
      editingText.value = "";
    }
    editor.addEventListener("keydown", onKey);
    editor.addEventListener("blur", onBlur);
    editor.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    editor.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    editor.addEventListener("dblclick", (e) => {
      e.stopPropagation();
    });
    editor.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });
    editor.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(editor);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
    }
  }
  const handleNodeDoubleClick = (node, event) => {
    event?.stopPropagation();
    event?.preventDefault();
    openOverlayTextEditor(node);
  };
  const finishTextEditing = () => {
    if (editingNodeId.value) {
      const selectedNode = nodes.value.find((node) => node.id === editingNodeId.value);
      if (selectedNode) {
        selectedNode.text = editingText.value;
      }
    }
    editingNodeId.value = null;
    editingText.value = "";
  };
  const handleTextEditKeyDown = (event) => {
    if (editingNodeId.value) {
      if (event.key === "Enter") {
        event.preventDefault();
        finishTextEditing();
      } else if (event.key === "Escape") {
        event.preventDefault();
        editingNodeId.value = null;
        editingText.value = "";
      }
    }
  };
  const cancelTextEditing = () => {
    editingNodeId.value = null;
    editingText.value = "";
  };
  return {
    editingNodeId,
    editingNodeIdString,
    editingText,
    isOverlayEditing,
    nodeTextConfig,
    defaultTextConfig,
    fontFamilyOptions,
    handleNodeDoubleClick,
    openOverlayTextEditor,
    finishTextEditing,
    handleTextEditKeyDown,
    cancelTextEditing,
    updateNodeTextConfig,
    getFontFamilyLabel
  };
}
function useCanvasDimensions() {
  const gridSize = computed(() => {
    return {
      small: 10,
      // 小网格 10x10px
      large: 50
      // 大网格 50x50px
    };
  });
  const canvasDimensions = ref({ width: 2e3, height: 1500 });
  const updateCanvasDimensions = () => {
    const largeGrid = gridSize.value.large;
    const scrollContainer = document.querySelector(".canvas-scroll");
    const container = scrollContainer || document.querySelector(".canvas-container");
    if (!container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const width = Math.floor(containerWidth / largeGrid) * largeGrid;
    const height = Math.floor(containerHeight / largeGrid) * largeGrid;
    const minWidth = largeGrid;
    const minHeight = largeGrid;
    const finalWidth = Math.max(width, minWidth);
    const finalHeight = Math.max(height, minHeight);
    canvasDimensions.value = {
      width: finalWidth,
      height: finalHeight
    };
  };
  let resizeObserver = null;
  onMounted(async () => {
    await nextTick();
    updateCanvasDimensions();
    const scrollContainer = document.querySelector(".canvas-scroll");
    const container = scrollContainer || document.querySelector(".canvas-container");
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateCanvasDimensions();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", updateCanvasDimensions);
  });
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener("resize", updateCanvasDimensions);
  });
  return {
    canvasDimensions,
    gridSize,
    updateCanvasDimensions
  };
}
function useCanvasScale(panX, panY) {
  const canvasScale = ref(1);
  const minScale = 1;
  const maxScale = 3;
  const scaleStep = 0.1;
  const scaleInputValue = ref("100%");
  const isInputFocused = ref(false);
  const scalePercentage = computed(() => {
    return Math.round(canvasScale.value * 100);
  });
  const updateScaleInputValue = () => {
    if (!isInputFocused.value) {
      scaleInputValue.value = `${Math.round(canvasScale.value * 100)}%`;
    }
  };
  const applyScaleFromInput = () => {
    let inputValue = scaleInputValue.value.trim();
    if (!inputValue.includes("%")) {
      const numericValue2 = parseFloat(inputValue);
      if (!isNaN(numericValue2) && numericValue2 > 0) {
        inputValue = `${numericValue2}%`;
      }
    }
    const numericValue = parseFloat(inputValue.replace("%", ""));
    if (!isNaN(numericValue) && numericValue > 0) {
      const scale = numericValue / 100;
      canvasScale.value = Math.max(minScale, Math.min(scale, maxScale));
    }
    scaleInputValue.value = `${Math.round(canvasScale.value * 100)}%`;
  };
  const handleZoomIn = () => {
    if (canvasScale.value < maxScale) {
      canvasScale.value = Math.min(canvasScale.value + scaleStep, maxScale);
      updateScaleInputValue();
    }
  };
  const handleZoomOut = () => {
    if (canvasScale.value > minScale) {
      canvasScale.value = Math.max(canvasScale.value - scaleStep, minScale);
      updateScaleInputValue();
    }
  };
  const handleFitToScreen = () => {
    canvasScale.value = minScale;
    panX.value = 0;
    panY.value = 0;
    updateScaleInputValue();
  };
  const handleZoomCommand = (command) => {
    if (command === "fit") {
      handleFitToScreen();
    } else {
      const scale = parseInt(command) / 100;
      canvasScale.value = Math.max(minScale, Math.min(scale, maxScale));
      updateScaleInputValue();
    }
  };
  const handleScaleInputChange = (value) => {
  };
  const handleScaleInputBlur = () => {
    isInputFocused.value = false;
    applyScaleFromInput();
  };
  const handleScaleInputEnter = () => {
    isInputFocused.value = false;
    applyScaleFromInput();
  };
  watch(canvasScale, () => {
    updateScaleInputValue();
  });
  return {
    canvasScale,
    minScale,
    maxScale,
    scaleStep,
    scaleInputValue,
    isInputFocused,
    scalePercentage,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleZoomCommand,
    updateScaleInputValue,
    handleScaleInputChange,
    handleScaleInputBlur,
    handleScaleInputEnter
  };
}
function useNodeInteraction(nodes, selectedNodeId, isOverlayEditing, editingNodeId, showComponentMenuFlag, closeComponentMenu, activeArrowDirection, lastSelectionMode, findNearbyNode, createConnection, showComponentMenu, nodeTextConfig, defaultTextConfig, isMouseOnNodeBorder, clearMultiSelection, clearConnectionSelection) {
  const hoveredNodeId = ref("");
  const currentHoveredNode = ref(null);
  const hoveredArrowDirection = ref("");
  let doubleClickTimer = null;
  const handleArrowEnter = (direction) => {
    hoveredArrowDirection.value = direction;
  };
  const handleArrowLeave = () => {
    hoveredArrowDirection.value = "";
  };
  const handleNodeClick = (node, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (isOverlayEditing.value || editingNodeId.value) {
      return;
    }
    if (clearConnectionSelection) {
      clearConnectionSelection();
    }
    if (doubleClickTimer) {
      clearTimeout(doubleClickTimer);
      doubleClickTimer = null;
      return;
    }
    doubleClickTimer = setTimeout(() => {
      doubleClickTimer = null;
      selectedNodeId.value = node.id;
      lastSelectionMode.value = "click";
      nodeTextConfig.value = {
        fontSize: node.textConfig?.fontSize || defaultTextConfig.fontSize,
        fontFamily: node.textConfig?.fontFamily || defaultTextConfig.fontFamily,
        fontWeight: node.textConfig?.fontWeight || defaultTextConfig.fontWeight,
        fontStyle: node.textConfig?.fontStyle || defaultTextConfig.fontStyle
      };
      if (showComponentMenuFlag.value) {
        closeComponentMenu();
      }
      if (clearMultiSelection) {
        clearMultiSelection();
      }
    }, 200);
  };
  const handleNodeMouseEnter = (node) => {
    hoveredNodeId.value = node.id;
    currentHoveredNode.value = node;
    isMouseOnNodeBorder.value = false;
  };
  const handleNodeMouseLeave = () => {
    hoveredNodeId.value = "";
    currentHoveredNode.value = null;
    isMouseOnNodeBorder.value = false;
  };
  const handleArrowClick = (event, node, direction) => {
    event.stopPropagation();
    activeArrowDirection.value = direction;
    selectedNodeId.value = node.id;
    const nearbyNode = findNearbyNode(node, direction);
    if (nearbyNode) {
      createConnection(node, nearbyNode, direction);
    } else {
      showComponentMenu(node, direction);
    }
  };
  const handleConnectionPointClick = (event, node, direction) => {
    event.stopPropagation();
  };
  const handleCanvasClick = (event) => {
    const target = event.target;
    const isOnNode = target.closest("[data-node-id]") !== null || target.closest(".strategy-node") !== null;
    if (isOnNode) {
      return;
    }
    const isConnectionPath = target.tagName?.toLowerCase() === "path" && (target.classList?.contains("connection-path") || target.getAttribute("data-connection-id") !== null);
    if (isConnectionPath) {
      return;
    }
    if (showComponentMenuFlag.value) {
      closeComponentMenu();
    }
    if (lastSelectionMode.value === "rubber") {
      return;
    }
    selectedNodeId.value = "";
    hoveredNodeId.value = "";
    activeArrowDirection.value = "";
    if (clearMultiSelection) {
      clearMultiSelection();
    }
    if (clearConnectionSelection) {
      clearConnectionSelection();
    }
  };
  const handleCanvasDragLeave = (event) => {
    event.preventDefault();
  };
  return {
    hoveredNodeId,
    currentHoveredNode,
    hoveredArrowDirection,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handleArrowClick,
    handleArrowEnter,
    handleArrowLeave,
    handleConnectionPointClick,
    handleCanvasClick,
    handleCanvasDragLeave
  };
}
function useUtils() {
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const domUid = ref(generateId());
  return {
    generateId,
    domUid
  };
}
function useUndoRedo(nodes, connections, connectionOffsetY) {
  const historyStack = ref([]);
  const historyIndex = ref(-1);
  const MAX_HISTORY_SIZE = 100;
  const deepCloneNodes = (nodesToClone) => {
    return nodesToClone.map((node) => ({
      ...node,
      position: { ...node.position },
      data: { ...node.data },
      style: { ...node.style },
      textConfig: { ...node.textConfig }
    }));
  };
  const deepCloneConnections = (connsToClone) => {
    return connsToClone.map((conn) => ({
      ...conn,
      style: conn.style ? { ...conn.style } : void 0
      // ... 运算符会包含所有其他属性（sourceHandle, targetHandle, lastSourceX/Y, lastTargetX/Y 等）
    }));
  };
  const deepCloneConnectionOffsetY = (offsetY) => {
    return { ...offsetY };
  };
  const recordHistory = () => {
    const state = {
      nodes: deepCloneNodes(nodes.value),
      connections: deepCloneConnections(connections.value),
      connectionOffsetY: deepCloneConnectionOffsetY(connectionOffsetY)
    };
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }
    historyStack.value.push(state);
    historyIndex.value = historyStack.value.length - 1;
    if (historyStack.value.length > MAX_HISTORY_SIZE) {
      historyStack.value.shift();
      historyIndex.value--;
    }
  };
  const undo = () => {
    if (historyIndex.value <= 0) {
      return false;
    }
    historyIndex.value--;
    applyHistoryState(historyStack.value[historyIndex.value]);
    return true;
  };
  const redo = () => {
    if (historyIndex.value >= historyStack.value.length - 1) {
      return false;
    }
    historyIndex.value++;
    applyHistoryState(historyStack.value[historyIndex.value]);
    return true;
  };
  const applyHistoryState = (state) => {
    nodes.value = deepCloneNodes(state.nodes);
    connections.value = deepCloneConnections(state.connections);
    Object.keys(connectionOffsetY).forEach((key) => {
      delete connectionOffsetY[key];
    });
    Object.assign(connectionOffsetY, state.connectionOffsetY);
  };
  const clearHistory = () => {
    historyStack.value = [];
    historyIndex.value = -1;
  };
  const canUndo = () => {
    return historyIndex.value > 0;
  };
  const canRedo = () => {
    return historyIndex.value < historyStack.value.length - 1;
  };
  return {
    recordHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo
  };
}
function useAutoSave(options) {
  const {
    nodes,
    connections,
    connectionOffsetY,
    canvasPosition,
    canvasScale,
    strategyName,
    autoSaveEnabled = true
  } = options;
  const fileId = ref("default");
  const lastSaved = ref(null);
  const isSaving = ref(false);
  const isLoading = ref(false);
  const saveToIndexedDB = async () => {
    if (!autoSaveEnabled || isSaving.value || isLoading.value) {
      return;
    }
    try {
      isSaving.value = true;
      const data = {
        nodes: JSON.parse(JSON.stringify(nodes.value)),
        connections: JSON.parse(JSON.stringify(connections.value)),
        connectionOffsetY: { ...connectionOffsetY },
        canvasPosition: { x: canvasPosition.x.value, y: canvasPosition.y.value },
        canvasScale: canvasScale.value
      };
      const name = strategyName?.value || "未命名策略";
      await indexedDBManager.saveFile(fileId.value, name, data);
      lastSaved.value = /* @__PURE__ */ new Date();
    } catch (error) {
      console.error("[AutoSave] Failed to save to IndexedDB:", error);
    } finally {
      isSaving.value = false;
    }
  };
  const loadFromIndexedDB = async (targetFileId) => {
    if (isLoading.value || isSaving.value) {
      return false;
    }
    try {
      isLoading.value = true;
      const idToLoad = targetFileId || fileId.value;
      const data = await indexedDBManager.loadFile(idToLoad);
      if (data) {
        nodes.value = data.nodes || [];
        connections.value = data.connections || [];
        Object.keys(connectionOffsetY).forEach((key) => {
          delete connectionOffsetY[key];
        });
        if (data.connectionOffsetY) {
          Object.assign(connectionOffsetY, data.connectionOffsetY);
        }
        if (data.canvasPosition) {
          canvasPosition.x.value = data.canvasPosition.x;
          canvasPosition.y.value = data.canvasPosition.y;
        }
        if (data.canvasScale !== void 0) {
          canvasScale.value = data.canvasScale;
        }
        if (targetFileId) {
          fileId.value = targetFileId;
        }
        lastSaved.value = /* @__PURE__ */ new Date();
        return true;
      }
      return false;
    } catch (error) {
      console.error("[AutoSave] Failed to load from IndexedDB:", error);
      return false;
    } finally {
      await nextTick();
      isLoading.value = false;
    }
  };
  const setFileId = (id) => {
    fileId.value = id;
  };
  const getFileList = async () => {
    try {
      return await indexedDBManager.getFileList();
    } catch (error) {
      return [];
    }
  };
  const deleteFile = async (targetFileId) => {
    await indexedDBManager.deleteFile(targetFileId);
  };
  const init = async (targetFileId) => {
    await indexedDBManager.init();
    const loaded = await loadFromIndexedDB(targetFileId);
    return loaded;
  };
  const saveNow = async () => {
    await saveToIndexedDB();
  };
  onMounted(() => {
    init();
  });
  return {
    fileId,
    lastSaved,
    isSaving,
    isLoading,
    saveNow,
    loadFromIndexedDB,
    setFileId,
    getFileList,
    deleteFile
  };
}
const _hoisted_1$e = ["viewBox"];
const _hoisted_2$d = {
  id: "arrowhead-default",
  markerWidth: "5",
  markerHeight: "3.5",
  refX: "4",
  refY: "1.75",
  orient: "auto",
  class: "connection-marker"
};
const _hoisted_3$d = ["fill"];
const _hoisted_4$c = {
  id: "arrowhead-true",
  markerWidth: "5",
  markerHeight: "3.5",
  refX: "4",
  refY: "1.75",
  orient: "auto",
  class: "connection-marker"
};
const _hoisted_5$b = ["fill"];
const _hoisted_6$9 = {
  id: "arrowhead-false",
  markerWidth: "5",
  markerHeight: "3.5",
  refX: "4",
  refY: "1.75",
  orient: "auto",
  class: "connection-marker"
};
const _hoisted_7$7 = ["fill"];
const _hoisted_8$6 = ["transform"];
const _hoisted_9$4 = ["data-connection-id", "d"];
const _hoisted_10$4 = ["data-connection-id", "d", "stroke", "stroke-dasharray", "marker-end", "onClick", "onMousemove"];
var _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "CanvasSvg",
  props: {
    canvasDimensions: {},
    panX: {},
    panY: {},
    scale: {},
    isDragging: { type: Boolean },
    connectionPaths: {},
    isConnectionSelected: { type: Function },
    getGridColor: { type: Function },
    getConnectionColor: { type: Function }
  },
  emits: ["drop", "dragover", "dragleave", "mousedown", "mousemove", "mouseup", "click", "select-connection"],
  setup(__props) {
    const props = __props;
    const { canvasDimensions, panX, panY, scale, getConnectionColor } = props;
    const getCursorForConnection = (pathData) => {
      const cursor = pathData.direction === "horizontal" ? "row-resize" : pathData.direction === "vertical" ? "col-resize" : "default";
      return cursor;
    };
    const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) {
        param = dot / lenSq;
      }
      let xx, yy;
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
      const dx = px - xx;
      const dy = py - yy;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const getCursorForPathSegment = (pathData, event) => {
      if (!event || !(event.target instanceof SVGPathElement)) {
        return getCursorForConnection(pathData);
      }
      const path = event.target;
      const pathString = pathData.path;
      const firstMove = pathString.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
      if (!firstMove) {
        return getCursorForConnection(pathData);
      }
      const points = [];
      points.push({ x: parseFloat(firstMove[1]), y: parseFloat(firstMove[2]) });
      const allLines = pathString.matchAll(/L\s+([\d.-]+)\s+([\d.-]+)/g);
      for (const line of allLines) {
        points.push({ x: parseFloat(line[1]), y: parseFloat(line[2]) });
      }
      if (points.length < 2) {
        return getCursorForConnection(pathData);
      }
      const svg = path.ownerSVGElement;
      if (!svg) {
        return getCursorForConnection(pathData);
      }
      const mouseEvent = event;
      const pathCTM = path.getScreenCTM();
      if (!pathCTM) {
        return getCursorForConnection(pathData);
      }
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = mouseEvent.clientX;
      svgPoint.y = mouseEvent.clientY;
      const pathPoint = svgPoint.matrixTransform(pathCTM.inverse());
      let minDistance = Infinity;
      let closestSegmentDirection = null;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const distance = pointToLineDistance(pathPoint.x, pathPoint.y, p1.x, p1.y, p2.x, p2.y);
        if (distance < minDistance) {
          minDistance = distance;
          const dx = Math.abs(p2.x - p1.x);
          const dy = Math.abs(p2.y - p1.y);
          if (dx > dy) {
            closestSegmentDirection = "horizontal";
          } else if (dy > dx) {
            closestSegmentDirection = "vertical";
          } else {
            closestSegmentDirection = pathData.direction === "horizontal" ? "horizontal" : "vertical";
          }
        }
      }
      if (closestSegmentDirection !== null) {
        const result = closestSegmentDirection === "horizontal" ? "row-resize" : "col-resize";
        return result;
      }
      return getCursorForConnection(pathData);
    };
    const scaleCompX = computed(() => (scale || 1) * (1 / (scaleX.value || 1)));
    const scaleCompY = computed(() => (scale || 1) * (1 / (scaleY.value || 1)));
    const svgRef = ref(null);
    const clientW = ref(0);
    const clientH = ref(0);
    const initialBodyMiddleH = ref(0);
    const currentBodyMiddleH = ref(0);
    let ro = null;
    onMounted(() => {
      const el = svgRef.value;
      if (!el) return;
      const update = () => {
        const rect = el.getBoundingClientRect();
        clientW.value = rect.width;
        clientH.value = rect.height;
        const bodyMiddle = el.closest(".btc-grid-group__body-middle");
        const bodyH = bodyMiddle ? bodyMiddle.getBoundingClientRect().height : rect.height;
        currentBodyMiddleH.value = bodyH;
        if (initialBodyMiddleH.value === 0 && bodyH > 0) {
          initialBodyMiddleH.value = bodyH;
        }
      };
      update();
      ro = new ResizeObserver(update);
      ro.observe(el);
    });
    onBeforeUnmount(() => {
      if (ro && svgRef.value) ro.disconnect();
      ro = null;
    });
    const baseW = computed(() => canvasDimensions.width);
    const baseH = computed(() => canvasDimensions.height);
    const scaleX = computed(() => clientW.value > 0 ? clientW.value / baseW.value : 1);
    const scaleY = computed(() => clientH.value > 0 ? clientH.value / baseH.value : 1);
    const svgSizeStyle = computed(() => ({
      position: "absolute",
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      display: "block",
      backgroundImage: "none"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        ref_key: "svgRef",
        ref: svgRef,
        class: normalizeClass(["strategy-canvas", { dragging: __props.isDragging }]),
        viewBox: `0 0 ${baseW.value} ${baseH.value}`,
        style: normalizeStyle(svgSizeStyle.value),
        preserveAspectRatio: "none",
        onDrop: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("drop", $event)),
        onDragover: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("dragover", $event)),
        onDragleave: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("dragleave", $event)),
        onMousedown: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("mousedown", $event)),
        onMousemove: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("mousemove", $event)),
        onMouseup: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("mouseup", $event)),
        onClick: _cache[7] || (_cache[7] = ($event) => _ctx.$emit("click", $event))
      }, [
        createBaseVNode("defs", null, [
          createBaseVNode("marker", _hoisted_2$d, [
            createBaseVNode("polygon", {
              points: "0 0, 5 1.75, 0 3.5",
              fill: unref(getConnectionColor)()
            }, null, 8, _hoisted_3$d)
          ]),
          createBaseVNode("marker", _hoisted_4$c, [
            createBaseVNode("polygon", {
              points: "0 0, 5 1.75, 0 3.5",
              fill: unref(getConnectionColor)()
            }, null, 8, _hoisted_5$b)
          ]),
          createBaseVNode("marker", _hoisted_6$9, [
            createBaseVNode("polygon", {
              points: "0 0, 5 1.75, 0 3.5",
              fill: unref(getConnectionColor)()
            }, null, 8, _hoisted_7$7)
          ])
        ]),
        createBaseVNode("g", {
          class: "content-layer",
          transform: `translate(${unref(panX)}, ${unref(panY)}) scale(${scaleCompX.value}, ${scaleCompY.value})`
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(props.connectionPaths, (pathData) => {
            return openBlock(), createElementBlock("g", {
              key: pathData.id,
              class: normalizeClass(["connection-group", { selected: __props.isConnectionSelected(pathData.id) }])
            }, [
              pathData.path && pathData.path.trim() && __props.isConnectionSelected(pathData.id) ? (openBlock(), createElementBlock("path", {
                key: 0,
                "data-connection-id": pathData.id,
                d: pathData.path,
                stroke: "#409eff",
                "stroke-width": "2",
                "vector-effect": "non-scaling-stroke",
                fill: "none",
                "stroke-dasharray": "6,6",
                "stroke-opacity": "0.8",
                class: "connection-selected-outline",
                "pointer-events": "none"
              }, null, 8, _hoisted_9$4)) : createCommentVNode("", true),
              pathData.path && pathData.path.trim() ? (openBlock(), createElementBlock("path", {
                key: 1,
                "data-connection-id": pathData.id,
                d: pathData.path,
                stroke: pathData.color,
                "stroke-width": "2",
                "vector-effect": "non-scaling-stroke",
                fill: "none",
                class: normalizeClass(["connection-path", {
                  "connection-horizontal": pathData.direction === "horizontal",
                  "connection-vertical": pathData.direction === "vertical"
                }]),
                "stroke-dasharray": pathData.isOrphaned ? "5,5" : void 0,
                style: normalizeStyle({
                  cursor: getCursorForConnection(pathData)
                }),
                "marker-end": pathData.marker,
                onClick: withModifiers((e) => {
                  _ctx.$emit("select-connection", pathData.id);
                }, ["stop"]),
                onMousemove: (e) => {
                  const path = e.target;
                  const cursor = getCursorForPathSegment(pathData, e);
                  path.style.cursor = cursor;
                },
                onMouseleave: _cache[0] || (_cache[0] = (e) => {
                  const path = e.target;
                  path.style.cursor = "";
                })
              }, null, 46, _hoisted_10$4)) : createCommentVNode("", true)
            ], 2);
          }), 128)),
          renderSlot(_ctx.$slots, "default", {}, void 0, true),
          renderSlot(_ctx.$slots, "overlay-top", {}, void 0, true)
        ], 8, _hoisted_8$6)
      ], 46, _hoisted_1$e);
    };
  }
});
var CanvasSvg = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-8bf5e1a4"]]);
const _hoisted_1$d = { class: "connection-handles-overlay" };
const _hoisted_3$c = ["cx", "cy"];
const _hoisted_4$b = ["cx", "cy"];
const _hoisted_5$a = ["cx", "cy", "onMousedown"];
const _hoisted_6$8 = ["cx", "cy"];
const _hoisted_7$6 = ["cx", "cy"];
var _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "ConnectionHandlesOverlay",
  props: {
    connectionPaths: {},
    isSelected: { type: Function },
    selectedConnectionId: {},
    multiSelectedConnectionIds: {},
    getConnectionHandle: { type: Function },
    startDrag: { type: Function },
    isDragging: { type: Boolean },
    isResizing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { isSelected, getConnectionHandle, startDrag, isDragging, isResizing } = props;
    const selectedConnectionsWithHandles = computed(() => {
      const rawPaths = props.connectionPaths;
      const paths = Array.isArray(rawPaths) ? rawPaths : rawPaths && typeof rawPaths === "object" && "value" in rawPaths ? rawPaths.value : unref(rawPaths) || [];
      const dragging = isDragging;
      const resizing = isResizing;
      const selectedId = props.selectedConnectionId !== void 0 ? typeof props.selectedConnectionId === "string" ? props.selectedConnectionId : unref(props.selectedConnectionId) : "";
      const multiIds = props.multiSelectedConnectionIds !== void 0 ? props.multiSelectedConnectionIds instanceof Set ? props.multiSelectedConnectionIds : unref(props.multiSelectedConnectionIds) : /* @__PURE__ */ new Set();
      if (dragging || resizing) {
        return [];
      }
      if (!Array.isArray(paths)) {
        return [];
      }
      if (paths.length === 0) {
        return [];
      }
      const selected = paths.filter((pathData) => {
        if (props.selectedConnectionId !== void 0 || props.multiSelectedConnectionIds !== void 0) {
          const isSelectedValue = selectedId === pathData.id || multiIds && multiIds.has(pathData.id);
          return isSelectedValue;
        }
        return props.isSelected(pathData.id);
      });
      const withHandles = selected.map((pathData) => {
        const handle = getConnectionHandle(pathData.id, pathData.path);
        return {
          pathData,
          handle
        };
      });
      const valid = withHandles.filter((item) => {
        if (!item.handle) {
          return false;
        }
        const hasValidStart = !(item.handle.sx === 0 && item.handle.sy === 0);
        const hasValidEnd = !(item.handle.tx === 0 && item.handle.ty === 0);
        const isValid = hasValidStart && hasValidEnd;
        return isValid;
      });
      return valid;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("g", _hoisted_1$d, [
        createCommentVNode("", true),
        (openBlock(true), createElementBlock(Fragment, null, renderList(selectedConnectionsWithHandles.value, (item) => {
          return openBlock(), createElementBlock("g", {
            key: `handles-${item.pathData.id}`
          }, [
            createBaseVNode("g", {
              style: normalizeStyle({ pointerEvents: "auto", cursor: item.pathData.direction === "horizontal" ? "row-resize" : "col-resize" }),
              class: "connection-handle-start"
            }, [
              createBaseVNode("circle", {
                cx: item.handle.sx,
                cy: item.handle.sy,
                r: "6",
                fill: "#409eff",
                stroke: "#fff",
                "stroke-width": "2"
              }, null, 8, _hoisted_3$c),
              createBaseVNode("circle", {
                cx: item.handle.sx,
                cy: item.handle.sy,
                r: "3",
                fill: "#fff"
              }, null, 8, _hoisted_4$b)
            ], 4),
            (openBlock(true), createElementBlock(Fragment, null, renderList(item.handle.middleHandles, (middleHandle, index) => {
              return openBlock(), createElementBlock("circle", {
                key: `middle-${item.pathData.id}-${index}`,
                cx: middleHandle.x,
                cy: middleHandle.y,
                r: "6",
                fill: "#409eff",
                stroke: "#fff",
                "stroke-width": "2",
                style: normalizeStyle({ cursor: item.pathData.direction === "horizontal" ? "row-resize" : "col-resize", pointerEvents: "auto" }),
                class: "connection-handle-middle",
                onMousedown: withModifiers((e) => unref(startDrag)(e, item.pathData.id, middleHandle.segmentIndex), ["stop"])
              }, null, 44, _hoisted_5$a);
            }), 128)),
            createBaseVNode("g", {
              style: normalizeStyle({ pointerEvents: "auto", cursor: item.pathData.direction === "horizontal" ? "row-resize" : "col-resize" }),
              class: "connection-handle-end"
            }, [
              createBaseVNode("circle", {
                cx: item.handle.tx,
                cy: item.handle.ty,
                r: "6",
                fill: "#409eff",
                stroke: "#fff",
                "stroke-width": "2"
              }, null, 8, _hoisted_6$8),
              createBaseVNode("circle", {
                cx: item.handle.tx,
                cy: item.handle.ty,
                r: "3",
                fill: "#fff"
              }, null, 8, _hoisted_7$6)
            ], 4)
          ]);
        }), 128))
      ]);
    };
  }
});
const _hoisted_1$c = ["data-node-id", "transform"];
const _hoisted_2$c = ["cx", "cy", "r"];
const _hoisted_3$b = ["d"];
const _hoisted_4$a = ["width", "height"];
const _hoisted_5$9 = ["width", "height"];
const _hoisted_6$7 = ["x", "y", "font-family", "font-weight", "font-style", "font-size"];
const _hoisted_7$5 = ["transform"];
const _hoisted_8$5 = {
  x: "35",
  y: "9",
  "text-anchor": "middle",
  "dominant-baseline": "middle",
  fill: "#fff",
  "font-size": "3",
  "font-family": "monospace"
};
const _hoisted_9$3 = {
  key: 6,
  class: "resize-handles"
};
const _hoisted_10$3 = ["x", "y", "width", "height"];
const _hoisted_11$2 = ["transform"];
const _hoisted_12$2 = ["transform"];
const _hoisted_13$2 = ["transform"];
const _hoisted_14$1 = ["transform"];
const _hoisted_15$1 = {
  class: "handle-top-left",
  transform: `translate(0, 0)`
};
const _hoisted_16$1 = ["transform"];
const _hoisted_17$1 = ["transform"];
const _hoisted_18$1 = ["transform"];
const _hoisted_19$1 = {
  key: 7,
  class: "connection-arrows visible",
  style: { "pointer-events": "none" }
};
const _hoisted_20$1 = ["transform"];
const _hoisted_21$1 = ["transform"];
const _hoisted_22 = ["transform"];
const _hoisted_23 = ["transform"];
var _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "NodeItem",
  props: {
    node: {},
    selectedNodeId: {},
    multiSelectedNodeIds: {},
    isDragging: { type: Boolean },
    isResizing: { type: Boolean },
    isEditing: { type: Boolean },
    draggingNodeId: {},
    lastSelectionMode: {},
    multiSelectedConnectionCount: {},
    hoveredArrowDirection: {},
    isMouseOnNodeBorder: { type: Boolean },
    defaultTextConfig: {},
    getNodeFillColor: { type: Function },
    getNodeStrokeColor: { type: Function },
    getNodeTextColor: { type: Function },
    getHandlePositions: { type: Function },
    getPositionBoxLocalTransform: { type: Function },
    getArrowTransform: { type: Function },
    getNodeText: { type: Function },
    canvasDimensions: {},
    connections: {},
    selectedConnectionId: {},
    multiSelectedConnectionIds: {},
    getConnectionHandle: { type: Function }
  },
  emits: ["pointerdown", "click", "dblclick", "mouseenter", "mouseleave", "resize-start", "handle-enter", "handle-leave", "arrow-click", "arrow-enter", "arrow-leave"],
  setup(__props) {
    const props = __props;
    const isSelected = computed(() => props.selectedNodeId === props.node.id || props.multiSelectedNodeIds.has(props.node.id));
    const showPositionBox = computed(() => props.selectedNodeId === props.node.id || props.isDragging && props.draggingNodeId === props.node.id);
    const showResizeHandles = computed(() => {
      if (!isSelected.value || props.isDragging || props.isResizing || props.isEditing) {
        return false;
      }
      const isInMultiSelection = props.multiSelectedNodeIds.has(props.node.id);
      if (props.lastSelectionMode === "rubber" && props.multiSelectedConnectionCount > 0 && !isInMultiSelection) {
        return false;
      }
      return true;
    });
    const showArrows = computed(() => props.selectedNodeId === props.node.id && !props.isDragging);
    const getHandleVisibility = computed(() => {
      const result = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topLeft: true,
        topRight: true,
        bottomLeft: true,
        bottomRight: true
      };
      if (!props.connections || !props.getConnectionHandle || !showResizeHandles.value) {
        return result;
      }
      const nodeWidth = props.node.style?.width || 120;
      const nodeHeight = props.node.style?.height || 60;
      const nodeX = props.node.position.x;
      const nodeY = props.node.position.y;
      const handlePositions = {
        top: { x: nodeX + nodeWidth / 2, y: nodeY },
        right: { x: nodeX + nodeWidth, y: nodeY + nodeHeight / 2 },
        bottom: { x: nodeX + nodeWidth / 2, y: nodeY + nodeHeight },
        left: { x: nodeX, y: nodeY + nodeHeight / 2 }
      };
      const selectedConnections = props.connections.filter((conn) => {
        const isSelected2 = props.selectedConnectionId === conn.id || props.multiSelectedConnectionIds && props.multiSelectedConnectionIds.has(conn.id);
        return isSelected2 && (conn.sourceNodeId === props.node.id || conn.targetNodeId === props.node.id);
      });
      const tolerance = 3;
      selectedConnections.forEach((conn) => {
        const handle = props.getConnectionHandle(conn.id);
        if (!handle || !handle.sx || !handle.sy || !handle.tx || !handle.ty) return;
        const checkConnectionPoint = (pointX, pointY) => {
          if (Math.abs(pointX - handlePositions.top.x) < tolerance && Math.abs(pointY - handlePositions.top.y) < tolerance) {
            result.top = false;
          }
          if (Math.abs(pointX - handlePositions.right.x) < tolerance && Math.abs(pointY - handlePositions.right.y) < tolerance) {
            result.right = false;
          }
          if (Math.abs(pointX - handlePositions.bottom.x) < tolerance && Math.abs(pointY - handlePositions.bottom.y) < tolerance) {
            result.bottom = false;
          }
          if (Math.abs(pointX - handlePositions.left.x) < tolerance && Math.abs(pointY - handlePositions.left.y) < tolerance) {
            result.left = false;
          }
        };
        if (conn.sourceNodeId === props.node.id) {
          checkConnectionPoint(handle.sx, handle.sy);
        }
        if (conn.targetNodeId === props.node.id) {
          checkConnectionPoint(handle.tx, handle.ty);
        }
      });
      return result;
    });
    const getRelativePosition = (node) => {
      const container = document.querySelector(".canvas-scroll");
      if (!container) {
        return { x: Math.round(node.position.x), y: Math.round(node.position.y) };
      }
      const containerWidth = container.getBoundingClientRect().width;
      const containerHeight = container.getBoundingClientRect().height;
      const gridWidth = props.canvasDimensions?.width || 2e3;
      const gridHeight = props.canvasDimensions?.height || 1500;
      const borderWidth = 1;
      const gridOffsetX = (containerWidth - gridWidth) / 2 + borderWidth;
      const gridOffsetY = (containerHeight - gridHeight) / 2 + borderWidth;
      const relativeX = node.position.x - gridOffsetX;
      const relativeY = node.position.y - gridOffsetY;
      return {
        x: Math.floor(relativeX),
        y: Math.floor(relativeY)
      };
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("g", {
        class: normalizeClass([
          "strategy-node",
          __props.node.type,
          { selected: isSelected.value }
        ]),
        "data-node-id": __props.node.id,
        transform: `translate(${__props.node.position.x}, ${__props.node.position.y})`,
        onMousedown: _cache[36] || (_cache[36] = withModifiers((e) => _ctx.$emit("pointerdown", e, __props.node), ["stop"])),
        onClick: _cache[37] || (_cache[37] = withModifiers((e) => _ctx.$emit("click", __props.node, e), ["stop"])),
        onDblclick: _cache[38] || (_cache[38] = withModifiers((e) => _ctx.$emit("dblclick", __props.node, e), ["stop"])),
        onMouseenter: _cache[39] || (_cache[39] = () => _ctx.$emit("mouseenter", __props.node)),
        onMouseleave: _cache[40] || (_cache[40] = () => _ctx.$emit("mouseleave"))
      }, [
        __props.node.type === "START" || __props.node.type === "END" ? (openBlock(), createElementBlock("circle", {
          key: 0,
          cx: (__props.node.style?.width || 120) / 2,
          cy: (__props.node.style?.height || 60) / 2,
          r: Math.min(__props.node.style?.width || 120, __props.node.style?.height || 60) / 2 - 2,
          "stroke-width": "2",
          class: "node-rect",
          "pointer-events": "all"
        }, null, 8, _hoisted_2$c)) : __props.node.type === "CONDITION" ? (openBlock(), createElementBlock("path", {
          key: 1,
          d: `M ${(__props.node.style?.width || 120) / 2} 0 L ${__props.node.style?.width || 120} ${(__props.node.style?.height || 60) / 2} L ${(__props.node.style?.width || 120) / 2} ${__props.node.style?.height || 60} L 0 ${(__props.node.style?.height || 60) / 2} Z`,
          "stroke-width": "2",
          class: "node-rect",
          "pointer-events": "all"
        }, null, 8, _hoisted_3$b)) : __props.node.type === "ACTION" ? (openBlock(), createElementBlock("rect", {
          key: 2,
          width: __props.node.style?.width || 120,
          height: __props.node.style?.height || 60,
          "stroke-width": "2",
          rx: "4",
          ry: "4",
          class: "node-rect",
          "pointer-events": "all"
        }, null, 8, _hoisted_4$a)) : (openBlock(), createElementBlock("rect", {
          key: 3,
          width: __props.node.style?.width || 120,
          height: __props.node.style?.height || 60,
          "stroke-width": "2",
          rx: "4",
          ry: "4",
          class: "node-rect",
          "pointer-events": "all"
        }, null, 8, _hoisted_5$9)),
        !__props.isEditing ? (openBlock(), createElementBlock("text", {
          key: 4,
          x: (__props.node.style?.width || 120) / 2,
          y: (__props.node.style?.height || 60) / 2,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          "font-family": __props.node.textConfig?.fontFamily || __props.defaultTextConfig.fontFamily,
          "font-weight": __props.node.textConfig?.fontWeight || __props.defaultTextConfig.fontWeight,
          "font-style": __props.node.textConfig?.fontStyle || __props.defaultTextConfig.fontStyle,
          "font-size": (__props.node.textConfig?.fontSize || __props.defaultTextConfig.fontSize) + "px",
          class: "node-text"
        }, toDisplayString(__props.node.text || __props.getNodeText(__props.node.type)), 9, _hoisted_6$7)) : createCommentVNode("", true),
        showPositionBox.value ? (openBlock(), createElementBlock("g", {
          key: 5,
          class: "node-position-box",
          transform: __props.getPositionBoxLocalTransform(__props.node)
        }, [
          _cache[41] || (_cache[41] = createBaseVNode("rect", {
            x: "0",
            y: "0",
            width: "70",
            height: "18",
            fill: "rgba(0,0,0,0.8)",
            stroke: "#666",
            "stroke-width": "1",
            rx: "2",
            ry: "2"
          }, null, -1)),
          createBaseVNode("text", _hoisted_8$5, toDisplayString(getRelativePosition(__props.node).x) + ", " + toDisplayString(getRelativePosition(__props.node).y), 1)
        ], 8, _hoisted_7$5)) : createCommentVNode("", true),
        showResizeHandles.value ? (openBlock(), createElementBlock("g", _hoisted_9$3, [
          createBaseVNode("rect", {
            x: __props.getHandlePositions(__props.node.type, __props.node.style?.width || 120, __props.node.style?.height || 60).boundaryBox.x,
            y: __props.getHandlePositions(__props.node.type, __props.node.style?.width || 120, __props.node.style?.height || 60).boundaryBox.y,
            width: __props.getHandlePositions(__props.node.type, __props.node.style?.width || 120, __props.node.style?.height || 60).boundaryBox.width,
            height: __props.getHandlePositions(__props.node.type, __props.node.style?.width || 120, __props.node.style?.height || 60).boundaryBox.height,
            fill: "none",
            stroke: "#409eff",
            "stroke-width": "1",
            "stroke-dasharray": "4,4",
            class: "boundary-box"
          }, null, 8, _hoisted_10$3),
          getHandleVisibility.value.top ? (openBlock(), createElementBlock("g", {
            key: 0,
            class: "handle-top",
            transform: `translate(${(__props.node.style?.width || 120) / 2}, 0)`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle top",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "n-resize",
              onMousedown: _cache[0] || (_cache[0] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "top"), ["stop"])),
              onMouseenter: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_11$2)) : createCommentVNode("", true),
          getHandleVisibility.value.right ? (openBlock(), createElementBlock("g", {
            key: 1,
            class: "handle-right",
            transform: `translate(${__props.node.style?.width || 120}, ${(__props.node.style?.height || 60) / 2})`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle right",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "e-resize",
              onMousedown: _cache[3] || (_cache[3] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "right"), ["stop"])),
              onMouseenter: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_12$2)) : createCommentVNode("", true),
          getHandleVisibility.value.bottom ? (openBlock(), createElementBlock("g", {
            key: 2,
            class: "handle-bottom",
            transform: `translate(${(__props.node.style?.width || 120) / 2}, ${__props.node.style?.height || 60})`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle bottom",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "s-resize",
              onMousedown: _cache[6] || (_cache[6] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "bottom"), ["stop"])),
              onMouseenter: _cache[7] || (_cache[7] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[8] || (_cache[8] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_13$2)) : createCommentVNode("", true),
          getHandleVisibility.value.left ? (openBlock(), createElementBlock("g", {
            key: 3,
            class: "handle-left",
            transform: `translate(0, ${(__props.node.style?.height || 60) / 2})`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle left",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "w-resize",
              onMousedown: _cache[9] || (_cache[9] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "left"), ["stop"])),
              onMouseenter: _cache[10] || (_cache[10] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[11] || (_cache[11] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_14$1)) : createCommentVNode("", true),
          createBaseVNode("g", _hoisted_15$1, [
            createBaseVNode("circle", {
              class: "resize-handle top-left",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "nw-resize",
              onMousedown: _cache[12] || (_cache[12] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "top-left"), ["stop"])),
              onMouseenter: _cache[13] || (_cache[13] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[14] || (_cache[14] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ]),
          createBaseVNode("g", {
            class: "handle-top-right",
            transform: `translate(${__props.node.style?.width || 120}, 0)`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle top-right",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "ne-resize",
              onMousedown: _cache[15] || (_cache[15] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "top-right"), ["stop"])),
              onMouseenter: _cache[16] || (_cache[16] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[17] || (_cache[17] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_16$1),
          createBaseVNode("g", {
            class: "handle-bottom-left",
            transform: `translate(0, ${__props.node.style?.height || 60})`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle bottom-left",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "sw-resize",
              onMousedown: _cache[18] || (_cache[18] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "bottom-left"), ["stop"])),
              onMouseenter: _cache[19] || (_cache[19] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[20] || (_cache[20] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_17$1),
          createBaseVNode("g", {
            class: "handle-bottom-right",
            transform: `translate(${__props.node.style?.width || 120}, ${__props.node.style?.height || 60})`
          }, [
            createBaseVNode("circle", {
              class: "resize-handle bottom-right",
              cx: "0",
              cy: "0",
              r: "6",
              fill: "#409eff",
              stroke: "white",
              "stroke-width": "2",
              cursor: "se-resize",
              onMousedown: _cache[21] || (_cache[21] = withModifiers((e) => _ctx.$emit("resize-start", e, __props.node, "bottom-right"), ["stop"])),
              onMouseenter: _cache[22] || (_cache[22] = ($event) => _ctx.$emit("handle-enter")),
              onMouseleave: _cache[23] || (_cache[23] = ($event) => _ctx.$emit("handle-leave"))
            }, null, 32)
          ], 8, _hoisted_18$1)
        ])) : createCommentVNode("", true),
        showArrows.value ? (openBlock(), createElementBlock("g", _hoisted_19$1, [
          createBaseVNode("g", {
            class: normalizeClass(["connection-arrow-group", { "active": isSelected.value && !__props.isMouseOnNodeBorder && __props.hoveredArrowDirection === "top" }]),
            transform: __props.getArrowTransform(__props.node, "top"),
            style: { "pointer-events": "auto" },
            onClick: _cache[24] || (_cache[24] = ($event) => _ctx.$emit("arrow-click", $event, __props.node, "top")),
            onMouseenter: _cache[25] || (_cache[25] = ($event) => _ctx.$emit("arrow-enter", "top")),
            onMouseleave: _cache[26] || (_cache[26] = ($event) => _ctx.$emit("arrow-leave"))
          }, [..._cache[42] || (_cache[42] = [
            createBaseVNode("path", {
              d: "M 56 -10 L 56 -30 L 52 -30 L 60 -40 L 68 -30 L 64 -30 L 64 -10 Z",
              class: "arrow-shape"
            }, null, -1)
          ])], 42, _hoisted_20$1),
          createBaseVNode("g", {
            class: normalizeClass(["connection-arrow-group", { "active": isSelected.value && !__props.isMouseOnNodeBorder && __props.hoveredArrowDirection === "right" }]),
            transform: __props.getArrowTransform(__props.node, "right"),
            style: { "pointer-events": "auto" },
            onClick: _cache[27] || (_cache[27] = ($event) => _ctx.$emit("arrow-click", $event, __props.node, "right")),
            onMouseenter: _cache[28] || (_cache[28] = ($event) => _ctx.$emit("arrow-enter", "right")),
            onMouseleave: _cache[29] || (_cache[29] = ($event) => _ctx.$emit("arrow-leave"))
          }, [..._cache[43] || (_cache[43] = [
            createBaseVNode("path", {
              d: "M 10 26 L 30 26 L 30 22 L 40 30 L 30 38 L 30 34 L 10 34 Z",
              class: "arrow-shape"
            }, null, -1)
          ])], 42, _hoisted_21$1),
          createBaseVNode("g", {
            class: normalizeClass(["connection-arrow-group", { "active": isSelected.value && !__props.isMouseOnNodeBorder && __props.hoveredArrowDirection === "bottom" }]),
            transform: __props.getArrowTransform(__props.node, "bottom"),
            style: { "pointer-events": "auto" },
            onClick: _cache[30] || (_cache[30] = ($event) => _ctx.$emit("arrow-click", $event, __props.node, "bottom")),
            onMouseenter: _cache[31] || (_cache[31] = ($event) => _ctx.$emit("arrow-enter", "bottom")),
            onMouseleave: _cache[32] || (_cache[32] = ($event) => _ctx.$emit("arrow-leave"))
          }, [..._cache[44] || (_cache[44] = [
            createBaseVNode("path", {
              d: "M 56 10 L 56 30 L 52 30 L 60 40 L 68 30 L 64 30 L 64 10 Z",
              class: "arrow-shape"
            }, null, -1)
          ])], 42, _hoisted_22),
          createBaseVNode("g", {
            class: normalizeClass(["connection-arrow-group", { "active": isSelected.value && !__props.isMouseOnNodeBorder && __props.hoveredArrowDirection === "left" }]),
            transform: __props.getArrowTransform(__props.node, "left"),
            style: { "pointer-events": "auto" },
            onClick: _cache[33] || (_cache[33] = ($event) => _ctx.$emit("arrow-click", $event, __props.node, "left")),
            onMouseenter: _cache[34] || (_cache[34] = ($event) => _ctx.$emit("arrow-enter", "left")),
            onMouseleave: _cache[35] || (_cache[35] = ($event) => _ctx.$emit("arrow-leave"))
          }, [..._cache[45] || (_cache[45] = [
            createBaseVNode("path", {
              d: "M 30 26 L 10 26 L 10 22 L 0 30 L 10 38 L 10 34 L 30 34 Z",
              class: "arrow-shape"
            }, null, -1)
          ])], 42, _hoisted_23)
        ])) : createCommentVNode("", true)
      ], 42, _hoisted_1$c);
    };
  }
});
const _hoisted_1$b = { class: "strategy-execution-preview" };
const _hoisted_2$b = { class: "preview-header" };
const _hoisted_3$a = { class: "preview-controls" };
const _hoisted_4$9 = { class: "execution-config" };
const _hoisted_5$8 = { class: "execution-flow" };
const _hoisted_6$6 = { class: "flow-canvas" };
const _hoisted_7$4 = ["width", "height"];
const _hoisted_8$4 = ["d"];
const _hoisted_9$2 = { class: "node-content" };
const _hoisted_10$2 = { class: "node-icon" };
const _hoisted_11$1 = { class: "node-title" };
const _hoisted_12$1 = { class: "execution-indicator" };
const _hoisted_13$1 = {
  key: 0,
  class: "node-result"
};
const _hoisted_14 = { class: "result-detail" };
const _hoisted_15 = { class: "execution-log" };
const _hoisted_16 = { class: "log-header" };
const _hoisted_17 = { class: "log-content" };
const _hoisted_18 = { class: "log-time" };
const _hoisted_19 = { class: "log-level" };
const _hoisted_20 = { class: "log-message" };
const _hoisted_21 = {
  key: 0,
  class: "log-empty"
};
var _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "StrategyExecutionPreview",
  props: {
    orchestration: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const isExecuting = ref(false);
    const canvasWidth = ref(800);
    const canvasHeight = ref(600);
    const configForm = ref({
      mode: "step",
      speed: 1e3,
      inputData: '{"user": {"id": "123", "role": "admin"}, "resource": {"type": "document"}}'
    });
    const executedNodes = ref(/* @__PURE__ */ new Set());
    const executedConnections = ref(/* @__PURE__ */ new Set());
    const currentExecutingNode = ref("");
    const nodeResults = ref(/* @__PURE__ */ new Map());
    const executionLogs = ref([]);
    const getNodeExecutionStatus = (nodeId) => {
      if (currentExecutingNode.value === nodeId) return "executing";
      if (executedNodes.value.has(nodeId)) {
        const result = nodeResults.value.get(nodeId);
        return result?.success ? "completed" : "failed";
      }
      return "pending";
    };
    const getNodeIcon = (type) => {
      const iconMap = {
        "START": video_play_default,
        "END": video_pause_default,
        "CONDITION": question_filled_default,
        "ACTION": lightning_default,
        "DECISION": share_default,
        "GATEWAY": connection_default
      };
      return iconMap[type] || question_filled_default;
    };
    const getConnectionPath = (connection) => {
      const sourceNode = props.orchestration.nodes.find((n) => n.id === connection.sourceNodeId);
      const targetNode = props.orchestration.nodes.find((n) => n.id === connection.targetNodeId);
      if (!sourceNode || !targetNode) return "";
      const sourceX = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
      const sourceY = sourceNode.position.y + (sourceNode.style?.height || 80);
      const targetX = targetNode.position.x + (targetNode.style?.width || 120) / 2;
      const targetY = targetNode.position.y;
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    };
    const addLog = (level, message) => {
      executionLogs.value.push({
        timestamp: Date.now(),
        level,
        message
      });
    };
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };
    const clearLog = () => {
      executionLogs.value = [];
    };
    const resetPreview = () => {
      isExecuting.value = false;
      executedNodes.value.clear();
      executedConnections.value.clear();
      currentExecutingNode.value = "";
      nodeResults.value.clear();
      executionLogs.value = [];
      addLog("info", "预览已重置");
    };
    const startPreview = async () => {
      if (props.orchestration.nodes.length === 0) {
        BtcMessage.warning("请先添加节点");
        return;
      }
      try {
        const inputData = JSON.parse(configForm.value.inputData);
        await executeOrchestration(inputData);
      } catch (error) {
        BtcMessage.error("输入数据格式错误，请输入有效的JSON");
      }
    };
    const executeOrchestration = async (inputData) => {
      isExecuting.value = true;
      addLog("info", "开始执行策略编排");
      try {
        const startNodes = props.orchestration.nodes.filter((n) => n.type === "START");
        if (startNodes.length === 0) {
          throw new Error("未找到开始节点");
        }
        for (const startNode of startNodes) {
          await executeNode(startNode, inputData);
        }
        addLog("success", "策略执行完成");
      } catch (error) {
        addLog("error", `策略执行失败: ${error}`);
      } finally {
        isExecuting.value = false;
        currentExecutingNode.value = "";
      }
    };
    const executeNode = async (node, context) => {
      currentExecutingNode.value = node.id;
      addLog("info", `开始执行节点: ${node.name}`);
      await new Promise((resolve) => setTimeout(resolve, configForm.value.speed));
      try {
        const result = await simulateNodeExecution(node, context);
        executedNodes.value.add(node.id);
        nodeResults.value.set(node.id, result);
        addLog("success", `节点 ${node.name} 执行成功`);
        const nextConnections = props.orchestration.connections.filter(
          (c) => c.sourceNodeId === node.id
        );
        for (const connection of nextConnections) {
          executedConnections.value.add(connection.id);
          const nextNode = props.orchestration.nodes.find((n) => n.id === connection.targetNodeId);
          if (nextNode) {
            await executeNode(nextNode, result.output);
          }
        }
        return result;
      } catch (error) {
        const errorResult = {
          success: false,
          duration: Math.random() * 100 + 50,
          output: context,
          error: String(error)
        };
        executedNodes.value.add(node.id);
        nodeResults.value.set(node.id, errorResult);
        addLog("error", `节点 ${node.name} 执行失败: ${error}`);
        throw error;
      }
    };
    const simulateNodeExecution = async (node, context) => {
      const duration = Math.random() * 200 + 100;
      switch (node.type) {
        case "START":
          return {
            success: true,
            duration,
            output: context
          };
        case "END":
          return {
            success: true,
            duration,
            output: context
          };
        case "CONDITION": {
          const conditionResult = Math.random() > 0.3;
          return {
            success: conditionResult,
            duration,
            output: {
              ...context,
              conditionResult
            }
          };
        }
        case "ACTION": {
          const actionSuccess = Math.random() > 0.1;
          return {
            success: actionSuccess,
            duration,
            output: {
              ...context,
              actionExecuted: actionSuccess
            }
          };
        }
        case "DECISION": {
          const decisionResult = ["option1", "option2", "option3"][Math.floor(Math.random() * 3)];
          return {
            success: true,
            duration,
            output: {
              ...context,
              decisionResult
            }
          };
        }
        case "GATEWAY":
          return {
            success: true,
            duration,
            output: context
          };
        default:
          return {
            success: true,
            duration,
            output: context
          };
      }
    };
    onMounted(() => {
      addLog("info", "预览组件已加载");
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_form_item = ElFormItem;
      const _component_el_col = ElCol;
      const _component_el_slider = ElSlider;
      const _component_el_row = ElRow;
      const _component_el_input = ElInput;
      const _component_el_form = ElForm;
      const _component_el_tag = ElTag;
      const _component_el_popover = ElPopover;
      return openBlock(), createElementBlock("div", _hoisted_1$b, [
        createBaseVNode("div", _hoisted_2$b, [
          _cache[5] || (_cache[5] = createBaseVNode("div", { class: "preview-info" }, [
            createBaseVNode("h3", null, "策略执行预览"),
            createBaseVNode("p", null, "模拟策略执行流程，查看各节点的执行顺序和结果")
          ], -1)),
          createBaseVNode("div", _hoisted_3$a, [
            createVNode(_component_el_button, { onClick: resetPreview }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(refresh_default))
                  ]),
                  _: 1
                }),
                _cache[3] || (_cache[3] = createTextVNode(" 重置 ", -1))
              ]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: startPreview,
              loading: isExecuting.value
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(video_play_default))
                  ]),
                  _: 1
                }),
                _cache[4] || (_cache[4] = createTextVNode(" 开始预览 ", -1))
              ]),
              _: 1
            }, 8, ["loading"])
          ])
        ]),
        createBaseVNode("div", _hoisted_4$9, [
          createVNode(_component_el_form, {
            model: configForm.value,
            "label-width": "100px",
            size: "small"
          }, {
            default: withCtx(() => [
              createVNode(_component_el_row, { gutter: 16 }, {
                default: withCtx(() => [
                  createVNode(_component_el_col, { span: 12 }, {
                    default: withCtx(() => [
                      createVNode(_component_el_form_item, {
                        label: "执行模式",
                        prop: "mode"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_select, {
                            id: "execution-mode-select",
                            modelValue: configForm.value.mode,
                            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => configForm.value.mode = $event)
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_option, {
                                id: "execution-mode-step",
                                label: "步进模式",
                                value: "step"
                              }),
                              createVNode(_component_el_option, {
                                id: "execution-mode-continuous",
                                label: "连续模式",
                                value: "continuous"
                              }),
                              createVNode(_component_el_option, {
                                id: "execution-mode-fast",
                                label: "快速模式",
                                value: "fast"
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_col, { span: 12 }, {
                    default: withCtx(() => [
                      createVNode(_component_el_form_item, {
                        label: "执行速度",
                        prop: "speed"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_slider, {
                            id: "execution-speed-slider",
                            modelValue: configForm.value.speed,
                            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => configForm.value.speed = $event),
                            min: 100,
                            max: 2e3,
                            step: 100,
                            "show-input": ""
                          }, null, 8, ["modelValue"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_form_item, {
                label: "输入数据",
                prop: "inputData"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    id: "execution-input-data-textarea",
                    modelValue: configForm.value.inputData,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => configForm.value.inputData = $event),
                    type: "textarea",
                    rows: 4,
                    placeholder: '{"user": {"id": "123", "role": "admin"}, "resource": {"type": "document"}}'
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model"])
        ]),
        createBaseVNode("div", _hoisted_5$8, [
          createBaseVNode("div", _hoisted_6$6, [
            (openBlock(), createElementBlock("svg", {
              width: canvasWidth.value,
              height: canvasHeight.value,
              class: "preview-svg"
            }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.orchestration.connections, (connection) => {
                return openBlock(), createElementBlock("path", {
                  key: connection.id,
                  d: getConnectionPath(connection),
                  class: normalizeClass([
                    "connection-line",
                    { "executed": executedConnections.value.has(connection.id) }
                  ]),
                  stroke: "#ddd",
                  "stroke-width": "2",
                  fill: "none",
                  "marker-end": "url(#preview-arrowhead)"
                }, null, 10, _hoisted_8$4);
              }), 128)),
              _cache[6] || (_cache[6] = createBaseVNode("defs", null, [
                createBaseVNode("marker", {
                  id: "preview-arrowhead",
                  markerWidth: "10",
                  markerHeight: "7",
                  refX: "9",
                  refY: "3.5",
                  orient: "auto"
                }, [
                  createBaseVNode("polygon", {
                    points: "0 0, 10 3.5, 0 7",
                    fill: "#409eff"
                  })
                ])
              ], -1))
            ], 8, _hoisted_7$4)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.orchestration.nodes, (node) => {
              return openBlock(), createElementBlock("div", {
                key: node.id,
                class: normalizeClass(["preview-node", [
                  `node-type-${node.type.toLowerCase()}`,
                  getNodeExecutionStatus(node.id)
                ]]),
                style: normalizeStyle({
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  width: `${node.style?.width || 120}px`,
                  height: `${node.style?.height || 80}px`
                })
              }, [
                createBaseVNode("div", _hoisted_9$2, [
                  createBaseVNode("div", _hoisted_10$2, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        (openBlock(), createBlock(resolveDynamicComponent(getNodeIcon(node.type))))
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  createBaseVNode("div", _hoisted_11$1, toDisplayString(node.name), 1),
                  createBaseVNode("div", _hoisted_12$1, [
                    getNodeExecutionStatus(node.id) === "executing" ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                      default: withCtx(() => [
                        createVNode(unref(loading_default))
                      ]),
                      _: 1
                    })) : getNodeExecutionStatus(node.id) === "completed" ? (openBlock(), createBlock(_component_el_icon, {
                      key: 1,
                      class: "success"
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(circle_check_filled_default))
                      ]),
                      _: 1
                    })) : getNodeExecutionStatus(node.id) === "failed" ? (openBlock(), createBlock(_component_el_icon, {
                      key: 2,
                      class: "error"
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(circle_close_filled_default))
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ])
                ]),
                nodeResults.value.has(node.id) ? (openBlock(), createElementBlock("div", _hoisted_13$1, [
                  createVNode(_component_el_popover, {
                    placement: "top",
                    trigger: "hover",
                    width: "300"
                  }, {
                    reference: withCtx(() => [
                      createVNode(_component_el_tag, {
                        size: "small",
                        type: nodeResults.value.get(node.id)?.success ? "success" : "danger"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(nodeResults.value.get(node.id)?.success ? "成功" : "失败"), 1)
                        ]),
                        _: 2
                      }, 1032, ["type"])
                    ]),
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_14, [
                        createBaseVNode("p", null, [
                          _cache[7] || (_cache[7] = createBaseVNode("strong", null, "执行时间:", -1)),
                          createTextVNode(" " + toDisplayString(nodeResults.value.get(node.id)?.duration) + "ms", 1)
                        ]),
                        _cache[8] || (_cache[8] = createBaseVNode("p", null, [
                          createBaseVNode("strong", null, "输出:")
                        ], -1)),
                        createBaseVNode("pre", null, toDisplayString(JSON.stringify(nodeResults.value.get(node.id)?.output, null, 2)), 1)
                      ])
                    ]),
                    _: 2
                  }, 1024)
                ])) : createCommentVNode("", true)
              ], 6);
            }), 128))
          ])
        ]),
        createBaseVNode("div", _hoisted_15, [
          createBaseVNode("div", _hoisted_16, [
            _cache[10] || (_cache[10] = createBaseVNode("h4", null, "执行日志", -1)),
            createVNode(_component_el_button, {
              size: "small",
              onClick: clearLog
            }, {
              default: withCtx(() => [..._cache[9] || (_cache[9] = [
                createTextVNode("清空日志", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_17, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(executionLogs.value, (log, index) => {
              return openBlock(), createElementBlock("div", {
                key: index,
                class: normalizeClass(["log-item", log.level])
              }, [
                createBaseVNode("span", _hoisted_18, toDisplayString(formatTime(log.timestamp)), 1),
                createBaseVNode("span", _hoisted_19, toDisplayString(log.level.toUpperCase()), 1),
                createBaseVNode("span", _hoisted_20, toDisplayString(log.message), 1)
              ], 2);
            }), 128)),
            executionLogs.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_21, " 暂无执行日志 ")) : createCommentVNode("", true)
          ])
        ])
      ]);
    };
  }
});
var StrategyExecutionPreview = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-250e9e8d"]]);
const _hoisted_1$a = { class: "zoom-controls" };
const _hoisted_2$a = { class: "zoom-center" };
var _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "TopToolbar",
  props: {
    scale: {},
    minScale: {},
    maxScale: {},
    scaleInputValue: {}
  },
  emits: [
    "zoom-in",
    "zoom-out",
    "zoom-command",
    "scale-blur",
    "scale-enter",
    "scale-input"
  ],
  setup(__props) {
    const props = __props;
    const model = ref(props.scaleInputValue);
    watch(() => props.scaleInputValue, (v) => {
      model.value = v;
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_input = ElInput;
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      return openBlock(), createElementBlock("div", _hoisted_1$a, [
        createVNode(_component_el_button, {
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("zoom-out")),
          disabled: __props.scale <= __props.minScale,
          circle: ""
        }, {
          default: withCtx(() => [
            createVNode(_component_el_icon, null, {
              default: withCtx(() => [
                createVNode(unref(zoom_out_default))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["disabled"]),
        createBaseVNode("div", _hoisted_2$a, [
          createVNode(_component_el_dropdown, {
            onCommand: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("zoom-command", $event)),
            trigger: "click",
            placement: "bottom"
          }, {
            dropdown: withCtx(() => [
              createVNode(_component_el_dropdown_menu, null, {
                default: withCtx(() => [
                  createVNode(_component_el_dropdown_item, { command: "fit" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(full_screen_default))
                        ]),
                        _: 1
                      }),
                      _cache[7] || (_cache[7] = createTextVNode(" 适应窗口大小 ", -1))
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, {
                    divided: "",
                    command: "100"
                  }, {
                    default: withCtx(() => [..._cache[8] || (_cache[8] = [
                      createTextVNode("100%", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, { command: "125" }, {
                    default: withCtx(() => [..._cache[9] || (_cache[9] = [
                      createTextVNode("125%", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, { command: "150" }, {
                    default: withCtx(() => [..._cache[10] || (_cache[10] = [
                      createTextVNode("150%", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, { command: "175" }, {
                    default: withCtx(() => [..._cache[11] || (_cache[11] = [
                      createTextVNode("175%", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, { command: "200" }, {
                    default: withCtx(() => [..._cache[12] || (_cache[12] = [
                      createTextVNode("200%", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, { command: "250" }, {
                    default: withCtx(() => [..._cache[13] || (_cache[13] = [
                      createTextVNode("250%", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_dropdown_item, { command: "300" }, {
                    default: withCtx(() => [..._cache[14] || (_cache[14] = [
                      createTextVNode("300%", -1)
                    ])]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createVNode(_component_el_input, {
                modelValue: model.value,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => model.value = $event),
                onBlur: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("scale-blur")),
                onKeydown: _cache[3] || (_cache[3] = withKeys(($event) => _ctx.$emit("scale-enter"), ["enter"])),
                onInput: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("scale-input", model.value)),
                class: "zoom-input",
                size: "small"
              }, null, 8, ["modelValue"])
            ]),
            _: 1
          })
        ]),
        createVNode(_component_el_button, {
          onClick: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("zoom-in")),
          disabled: __props.scale >= __props.maxScale,
          circle: ""
        }, {
          default: withCtx(() => [
            createVNode(_component_el_icon, null, {
              default: withCtx(() => [
                createVNode(unref(zoom_in_default))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["disabled"])
      ]);
    };
  }
});
var TopToolbar = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-00896cf6"]]);
const _hoisted_1$9 = { class: "component-library" };
const _hoisted_2$9 = { class: "library-header" };
const _hoisted_3$9 = { class: "library-content" };
const _hoisted_4$8 = { class: "component-list" };
const _hoisted_5$7 = ["data-type", "aria-label", "onDragstart", "onClick"];
const _hoisted_6$5 = { class: "component-shape" };
const _hoisted_7$3 = {
  width: "60",
  height: "40",
  viewBox: "0 0 60 40"
};
const _hoisted_8$3 = ["fill", "stroke"];
const _hoisted_9$1 = ["fill", "stroke"];
const _hoisted_10$1 = ["fill", "stroke"];
const _hoisted_11 = ["fill", "stroke"];
const _hoisted_12 = { class: "component-info" };
const _hoisted_13 = { class: "component-name" };
var _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "ComponentLibraryPanel",
  props: {
    search: {},
    active: {},
    categories: {},
    getFill: { type: Function },
    getStroke: { type: Function }
  },
  emits: ["update:search", "update:active", "dragstart", "click-component"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const searchModel = ref(props.search);
    watch(() => props.search, (v) => {
      searchModel.value = v;
    });
    watch(searchModel, (v) => {
      emit("update:search", v);
    });
    const activeModel = ref(props.active);
    watch(() => props.active, (v) => {
      activeModel.value = v;
    });
    watch(activeModel, (v) => {
      emit("update:active", v);
    });
    return (_ctx, _cache) => {
      const _component_el_collapse_item = ElCollapseItem;
      const _component_el_collapse = ElCollapse;
      return openBlock(), createElementBlock("div", _hoisted_1$9, [
        createBaseVNode("div", _hoisted_2$9, [
          createVNode(unref(BtcSearch), {
            modelValue: searchModel.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchModel.value = $event),
            placeholder: "搜索组件",
            size: "small"
          }, null, 8, ["modelValue"])
        ]),
        createBaseVNode("div", _hoisted_3$9, [
          createVNode(_component_el_collapse, {
            modelValue: activeModel.value,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => activeModel.value = $event)
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.categories, (category) => {
                return openBlock(), createBlock(_component_el_collapse_item, {
                  key: category.name,
                  title: category.title,
                  name: category.name
                }, {
                  default: withCtx(() => [
                    createBaseVNode("div", _hoisted_4$8, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(category.components, (component) => {
                        return openBlock(), createElementBlock("div", {
                          key: component.type,
                          class: "component-item",
                          "data-type": component.type,
                          draggable: true,
                          role: "button",
                          "aria-label": `拖拽 ${component.name} 组件到画布`,
                          onDragstart: ($event) => _ctx.$emit("dragstart", $event, component),
                          onClick: ($event) => _ctx.$emit("click-component", component)
                        }, [
                          createBaseVNode("div", _hoisted_6$5, [
                            (openBlock(), createElementBlock("svg", _hoisted_7$3, [
                              component.type === "START" || component.type === "END" ? (openBlock(), createElementBlock("circle", {
                                key: 0,
                                cx: "30",
                                cy: "20",
                                r: "15",
                                fill: __props.getFill(component.type),
                                stroke: __props.getStroke(component.type),
                                "stroke-width": "2"
                              }, null, 8, _hoisted_8$3)) : component.type === "CONDITION" ? (openBlock(), createElementBlock("path", {
                                key: 1,
                                d: "M 30 5 L 50 20 L 30 35 L 10 20 Z",
                                fill: __props.getFill(component.type),
                                stroke: __props.getStroke(component.type),
                                "stroke-width": "2"
                              }, null, 8, _hoisted_9$1)) : component.type === "ACTION" ? (openBlock(), createElementBlock("rect", {
                                key: 2,
                                x: "10",
                                y: "5",
                                width: "40",
                                height: "30",
                                fill: __props.getFill(component.type),
                                stroke: __props.getStroke(component.type),
                                "stroke-width": "2",
                                rx: "4",
                                ry: "4"
                              }, null, 8, _hoisted_10$1)) : (openBlock(), createElementBlock("rect", {
                                key: 3,
                                x: "10",
                                y: "5",
                                width: "40",
                                height: "30",
                                fill: __props.getFill(component.type),
                                stroke: __props.getStroke(component.type),
                                "stroke-width": "2",
                                rx: "4",
                                ry: "4"
                              }, null, 8, _hoisted_11))
                            ]))
                          ]),
                          createBaseVNode("div", _hoisted_12, [
                            createBaseVNode("div", _hoisted_13, toDisplayString(component.name), 1)
                          ])
                        ], 40, _hoisted_5$7);
                      }), 128))
                    ])
                  ]),
                  _: 2
                }, 1032, ["title", "name"]);
              }), 128))
            ]),
            _: 1
          }, 8, ["modelValue"])
        ])
      ]);
    };
  }
});
const _hoisted_1$8 = { class: "condition-node-config" };
const _hoisted_2$8 = { class: "config-header" };
const _hoisted_3$8 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_4$7 = {
  key: 1,
  class: "conditions-list"
};
const _hoisted_5$6 = { class: "condition-header" };
const _hoisted_6$4 = { class: "condition-index" };
const _hoisted_7$2 = {
  key: 2,
  class: "expression-preview"
};
const _hoisted_8$2 = { class: "expression-text" };
const _hoisted_9 = { class: "test-section" };
const _hoisted_10 = {
  key: 0,
  class: "test-result"
};
var _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "ConditionNodeConfig",
  props: {
    conditions: {}
  },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const testData = ref('{"user": {"role": "admin"}, "resource": {"type": "document"}}');
    const testResult = ref(null);
    const operators = [
      { value: "eq", label: "等于 (=)" },
      { value: "ne", label: "不等于 (≠)" },
      { value: "gt", label: "大于 (>)" },
      { value: "gte", label: "大于等于 (≥)" },
      { value: "lt", label: "小于 (<)" },
      { value: "lte", label: "小于等于 (≤)" },
      { value: "in", label: "包含于 (in)" },
      { value: "nin", label: "不包含于 (not in)" },
      { value: "contains", label: "包含 (contains)" },
      { value: "startsWith", label: "开始于 (starts with)" },
      { value: "endsWith", label: "结束于 (ends with)" },
      { value: "regex", label: "正则匹配 (regex)" },
      { value: "exists", label: "存在 (exists)" },
      { value: "notExists", label: "不存在 (not exists)" }
    ];
    const conditions = computed({
      get: () => props.conditions,
      set: (value) => emit("update", value)
    });
    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const addCondition = () => {
      const newCondition = {
        id: generateId(),
        field: "",
        operator: "eq",
        value: "",
        logicalOperator: conditions.value.length > 0 ? "AND" : void 0
      };
      conditions.value = [...conditions.value, newCondition];
    };
    const removeCondition = (index) => {
      const newConditions = [...conditions.value];
      newConditions.splice(index, 1);
      if (index === 0 && newConditions.length > 0) {
        newConditions[0].logicalOperator = void 0;
      }
      conditions.value = newConditions;
    };
    const emitUpdate = () => {
      emit("update", conditions.value);
    };
    const generateExpression = () => {
      if (conditions.value.length === 0) return "";
      return conditions.value.map((condition, index) => {
        let expr = `${condition.field} ${getOperatorSymbol(condition.operator)} ${formatValue(condition.value)}`;
        if (index > 0 && condition.logicalOperator) {
          expr = `${condition.logicalOperator} ${expr}`;
        }
        return expr;
      }).join(" ");
    };
    const getOperatorSymbol = (operator) => {
      const symbolMap = {
        "eq": "==",
        "ne": "!=",
        "gt": ">",
        "gte": ">=",
        "lt": "<",
        "lte": "<=",
        "in": "in",
        "nin": "not in",
        "contains": "contains",
        "startsWith": "starts with",
        "endsWith": "ends with",
        "regex": "matches",
        "exists": "exists",
        "notExists": "not exists"
      };
      return symbolMap[operator] || operator;
    };
    const formatValue = (value) => {
      if (typeof value === "string") {
        return `"${value}"`;
      }
      return String(value);
    };
    const testConditions = () => {
      try {
        const data = JSON.parse(testData.value);
        const result = evaluateConditions(conditions.value, data);
        testResult.value = result;
      } catch (error) {
        BtcMessage.error("测试数据格式错误，请输入有效的JSON");
        testResult.value = null;
      }
    };
    const evaluateConditions = (conditions2, data) => {
      if (conditions2.length === 0) return true;
      let result = evaluateSingleCondition(conditions2[0], data);
      for (let i = 1; i < conditions2.length; i++) {
        const condition = conditions2[i];
        const conditionResult = evaluateSingleCondition(condition, data);
        if (condition.logicalOperator === "OR") {
          result = result || conditionResult;
        } else {
          result = result && conditionResult;
        }
      }
      return result;
    };
    const evaluateSingleCondition = (condition, data) => {
      const fieldValue = getFieldValue(data, condition.field);
      const compareValue = parseValue(condition.value);
      switch (condition.operator) {
        case "eq":
          return fieldValue === compareValue;
        case "ne":
          return fieldValue !== compareValue;
        case "gt":
          return Number(fieldValue) > Number(compareValue);
        case "gte":
          return Number(fieldValue) >= Number(compareValue);
        case "lt":
          return Number(fieldValue) < Number(compareValue);
        case "lte":
          return Number(fieldValue) <= Number(compareValue);
        case "in":
          return Array.isArray(compareValue) && compareValue.includes(fieldValue);
        case "nin":
          return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
        case "contains":
          return String(fieldValue).includes(String(compareValue));
        case "startsWith":
          return String(fieldValue).startsWith(String(compareValue));
        case "endsWith":
          return String(fieldValue).endsWith(String(compareValue));
        case "regex":
          return new RegExp(String(compareValue)).test(String(fieldValue));
        case "exists":
          return fieldValue !== void 0 && fieldValue !== null;
        case "notExists":
          return fieldValue === void 0 || fieldValue === null;
        default:
          return false;
      }
    };
    const getFieldValue = (data, field) => {
      const keys = field.split(".");
      let value = data;
      for (const key of keys) {
        if (value === null || value === void 0) {
          return void 0;
        }
        value = value[key];
      }
      return value;
    };
    const parseValue = (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_empty = ElEmpty;
      const _component_el_input = ElInput;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_radio = ElRadio;
      const _component_el_radio_group = ElRadioGroup;
      const _component_el_alert = ElAlert;
      return openBlock(), createElementBlock("div", _hoisted_1$8, [
        createBaseVNode("div", _hoisted_2$8, [
          _cache[2] || (_cache[2] = createBaseVNode("span", null, "条件配置", -1)),
          createVNode(_component_el_button, {
            size: "small",
            type: "primary",
            onClick: addCondition
          }, {
            default: withCtx(() => [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(unref(plus_default))
                ]),
                _: 1
              }),
              _cache[1] || (_cache[1] = createTextVNode(" 添加条件 ", -1))
            ]),
            _: 1
          })
        ]),
        conditions.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$8, [
          createVNode(_component_el_empty, {
            description: "暂无条件，请添加条件",
            "image-size": 60
          })
        ])) : (openBlock(), createElementBlock("div", _hoisted_4$7, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(conditions.value, (condition, index) => {
            return openBlock(), createElementBlock("div", {
              key: condition.id,
              class: "condition-item"
            }, [
              createBaseVNode("div", _hoisted_5$6, [
                createBaseVNode("span", _hoisted_6$4, "条件 " + toDisplayString(index + 1), 1),
                createVNode(_component_el_button, {
                  size: "small",
                  type: "danger",
                  text: "",
                  onClick: ($event) => removeCondition(index)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              createVNode(unref(BtcConfigForm), {
                model: condition,
                size: "small",
                "label-width": "60px"
              }, {
                default: withCtx(() => [
                  createVNode(unref(BtcConfigFormItem), {
                    label: "字段",
                    prop: "field"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: condition.field,
                        "onUpdate:modelValue": ($event) => condition.field = $event,
                        placeholder: "如：user.role",
                        onBlur: emitUpdate
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  createVNode(unref(BtcConfigFormItem), {
                    label: "操作符",
                    prop: "operator"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: condition.operator,
                        "onUpdate:modelValue": ($event) => condition.operator = $event,
                        placeholder: "选择操作符",
                        onChange: emitUpdate
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createElementBlock(Fragment, null, renderList(operators, (op) => {
                            return createVNode(_component_el_option, {
                              key: op.value,
                              label: op.label,
                              value: op.value
                            }, null, 8, ["label", "value"]);
                          }), 64))
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  createVNode(unref(BtcConfigFormItem), {
                    label: "值",
                    prop: "value"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: condition.value,
                        "onUpdate:modelValue": ($event) => condition.value = $event,
                        placeholder: "比较值",
                        onBlur: emitUpdate
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  index > 0 ? (openBlock(), createBlock(unref(BtcConfigFormItem), {
                    key: 0,
                    label: "逻辑",
                    prop: "logicalOperator"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_radio_group, {
                        modelValue: condition.logicalOperator,
                        "onUpdate:modelValue": ($event) => condition.logicalOperator = $event,
                        onChange: emitUpdate
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_radio, { label: "AND" }, {
                            default: withCtx(() => [..._cache[3] || (_cache[3] = [
                              createTextVNode("且", -1)
                            ])]),
                            _: 1
                          }),
                          createVNode(_component_el_radio, { label: "OR" }, {
                            default: withCtx(() => [..._cache[4] || (_cache[4] = [
                              createTextVNode("或", -1)
                            ])]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024)) : createCommentVNode("", true)
                ]),
                _: 2
              }, 1032, ["model"])
            ]);
          }), 128))
        ])),
        conditions.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_7$2, [
          _cache[5] || (_cache[5] = createBaseVNode("h5", null, "表达式预览", -1)),
          createBaseVNode("div", _hoisted_8$2, toDisplayString(generateExpression()), 1)
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_9, [
          _cache[7] || (_cache[7] = createBaseVNode("h5", null, "条件测试", -1)),
          createVNode(unref(BtcConfigForm), {
            model: { testData: testData.value },
            size: "small",
            "label-width": "80px"
          }, {
            default: withCtx(() => [
              createVNode(unref(BtcConfigFormItem), {
                label: "测试数据",
                prop: "testData"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: testData.value,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => testData.value = $event),
                    type: "textarea",
                    rows: 3,
                    placeholder: '{"user": {"role": "admin"}, "resource": {"type": "document"}}'
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), null, {
                default: withCtx(() => [
                  createVNode(_component_el_button, {
                    type: "primary",
                    onClick: testConditions
                  }, {
                    default: withCtx(() => [..._cache[6] || (_cache[6] = [
                      createTextVNode("测试条件", -1)
                    ])]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model"]),
          testResult.value !== null ? (openBlock(), createElementBlock("div", _hoisted_10, [
            createVNode(_component_el_alert, {
              type: testResult.value ? "success" : "error",
              title: testResult.value ? "条件满足" : "条件不满足",
              "show-icon": "",
              closable: false
            }, null, 8, ["type", "title"])
          ])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
var ConditionNodeConfig = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-f8a57e58"]]);
const _hoisted_1$7 = { class: "action-node-config" };
const _hoisted_2$7 = { class: "config-header" };
const _hoisted_3$7 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_4$6 = {
  key: 1,
  class: "actions-list"
};
const _hoisted_5$5 = { class: "action-header" };
const _hoisted_6$3 = { class: "action-index" };
var _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "ActionNodeConfig",
  props: {
    actions: {}
  },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const actionTypes = [
      { value: "ALLOW_ACCESS", label: "允许访问" },
      { value: "DENY_ACCESS", label: "拒绝访问" },
      { value: "LOG_EVENT", label: "记录日志" },
      { value: "SEND_NOTIFICATION", label: "发送通知" },
      { value: "UPDATE_DATA", label: "更新数据" },
      { value: "CALL_API", label: "调用接口" },
      { value: "EXECUTE_SCRIPT", label: "执行脚本" },
      { value: "SET_VARIABLE", label: "设置变量" }
    ];
    const actions = computed({
      get: () => props.actions.map((action) => ({
        ...action,
        parametersJson: JSON.stringify(action.parameters || {}, null, 2)
      })),
      set: (value) => {
        const normalizedActions = value.map((action) => ({
          id: action.id,
          type: action.type,
          parameters: action.parameters || {},
          description: action.description
        }));
        emit("update", normalizedActions);
      }
    });
    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const addAction = () => {
      const newAction = {
        id: generateId(),
        type: "ALLOW_ACCESS",
        parameters: {},
        parametersJson: "{}",
        description: ""
      };
      actions.value = [...actions.value, newAction];
    };
    const removeAction = (index) => {
      const newActions = [...actions.value];
      newActions.splice(index, 1);
      actions.value = newActions;
    };
    const updateParameters = (action) => {
      try {
        action.parameters = JSON.parse(action.parametersJson || "{}");
        emitUpdate();
      } catch (error) {
        BtcMessage.error("参数格式错误，请输入有效的JSON");
      }
    };
    const emitUpdate = () => {
      const normalizedActions = actions.value.map((action) => ({
        id: action.id,
        type: action.type,
        parameters: action.parameters || {},
        description: action.description
      }));
      emit("update", normalizedActions);
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_empty = ElEmpty;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_input = ElInput;
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        createBaseVNode("div", _hoisted_2$7, [
          _cache[1] || (_cache[1] = createBaseVNode("span", null, "动作配置", -1)),
          createVNode(_component_el_button, {
            size: "small",
            type: "primary",
            onClick: addAction
          }, {
            default: withCtx(() => [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(unref(plus_default))
                ]),
                _: 1
              }),
              _cache[0] || (_cache[0] = createTextVNode(" 添加动作 ", -1))
            ]),
            _: 1
          })
        ]),
        actions.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$7, [
          createVNode(_component_el_empty, {
            description: "暂无动作，请添加动作",
            "image-size": 60
          })
        ])) : (openBlock(), createElementBlock("div", _hoisted_4$6, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(actions.value, (action, index) => {
            return openBlock(), createElementBlock("div", {
              key: action.id,
              class: "action-item"
            }, [
              createBaseVNode("div", _hoisted_5$5, [
                createBaseVNode("span", _hoisted_6$3, "动作 " + toDisplayString(index + 1), 1),
                createVNode(_component_el_button, {
                  size: "small",
                  type: "danger",
                  text: "",
                  onClick: ($event) => removeAction(index)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              createVNode(unref(BtcConfigForm), {
                model: action,
                size: "small",
                "label-width": "60px"
              }, {
                default: withCtx(() => [
                  createVNode(unref(BtcConfigFormItem), {
                    label: "类型",
                    prop: "type"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: action.type,
                        "onUpdate:modelValue": ($event) => action.type = $event,
                        placeholder: "选择动作类型",
                        onChange: emitUpdate
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createElementBlock(Fragment, null, renderList(actionTypes, (type) => {
                            return createVNode(_component_el_option, {
                              key: type.value,
                              label: type.label,
                              value: type.value
                            }, null, 8, ["label", "value"]);
                          }), 64))
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  createVNode(unref(BtcConfigFormItem), {
                    label: "参数",
                    prop: "parametersJson"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: action.parametersJson,
                        "onUpdate:modelValue": ($event) => action.parametersJson = $event,
                        type: "textarea",
                        rows: 3,
                        placeholder: '{"key": "value"}',
                        onBlur: ($event) => updateParameters(action)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"])
                    ]),
                    _: 2
                  }, 1024),
                  createVNode(unref(BtcConfigFormItem), {
                    label: "描述",
                    prop: "description"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: action.description,
                        "onUpdate:modelValue": ($event) => action.description = $event,
                        placeholder: "动作描述",
                        onBlur: emitUpdate
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024)
                ]),
                _: 2
              }, 1032, ["model"])
            ]);
          }), 128))
        ]))
      ]);
    };
  }
});
var ActionNodeConfig = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-96276507"]]);
const _hoisted_1$6 = { class: "decision-node-config" };
const _hoisted_2$6 = { class: "config-header" };
const _hoisted_3$6 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_4$5 = {
  key: 1,
  class: "rules-list"
};
const _hoisted_5$4 = { class: "rule-header" };
const _hoisted_6$2 = { class: "rule-index" };
var _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "DecisionNodeConfig",
  props: {
    rules: {}
  },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const rules = computed({
      get: () => props.rules.map((rule) => ({
        ...rule,
        variablesJson: JSON.stringify(rule.variables || {}, null, 2)
      })),
      set: (value) => {
        const normalizedRules = value.map((rule) => ({
          id: rule.id,
          expression: rule.expression,
          variables: rule.variables || {},
          description: rule.description
        }));
        emit("update", normalizedRules);
      }
    });
    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const addRule = () => {
      const newRule = {
        id: generateId(),
        expression: "",
        variables: {},
        variablesJson: "{}",
        description: ""
      };
      rules.value = [...rules.value, newRule];
    };
    const removeRule = (index) => {
      const newRules = [...rules.value];
      newRules.splice(index, 1);
      rules.value = newRules;
    };
    const updateVariables = (rule) => {
      try {
        rule.variables = JSON.parse(rule.variablesJson || "{}");
        emitUpdate();
      } catch (error) {
        BtcMessage.error("变量格式错误，请输入有效的JSON");
      }
    };
    const emitUpdate = () => {
      const normalizedRules = rules.value.map((rule) => ({
        id: rule.id,
        expression: rule.expression,
        variables: rule.variables || {},
        description: rule.description
      }));
      emit("update", normalizedRules);
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_empty = ElEmpty;
      const _component_el_input = ElInput;
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        createBaseVNode("div", _hoisted_2$6, [
          _cache[1] || (_cache[1] = createBaseVNode("span", null, "决策规则", -1)),
          createVNode(_component_el_button, {
            size: "small",
            type: "primary",
            onClick: addRule
          }, {
            default: withCtx(() => [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(unref(plus_default))
                ]),
                _: 1
              }),
              _cache[0] || (_cache[0] = createTextVNode(" 添加规则 ", -1))
            ]),
            _: 1
          })
        ]),
        rules.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$6, [
          createVNode(_component_el_empty, {
            description: "暂无规则，请添加决策规则",
            "image-size": 60
          })
        ])) : (openBlock(), createElementBlock("div", _hoisted_4$5, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(rules.value, (rule, index) => {
            return openBlock(), createElementBlock("div", {
              key: rule.id,
              class: "rule-item"
            }, [
              createBaseVNode("div", _hoisted_5$4, [
                createBaseVNode("span", _hoisted_6$2, "规则 " + toDisplayString(index + 1), 1),
                createVNode(_component_el_button, {
                  size: "small",
                  type: "danger",
                  text: "",
                  onClick: ($event) => removeRule(index)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              createVNode(unref(BtcConfigForm), {
                model: rule,
                size: "small",
                "label-width": "60px"
              }, {
                default: withCtx(() => [
                  createVNode(unref(BtcConfigFormItem), {
                    label: "表达式",
                    prop: "expression"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: rule.expression,
                        "onUpdate:modelValue": ($event) => rule.expression = $event,
                        type: "textarea",
                        rows: 2,
                        placeholder: "如：user.score > 80 ? 'high' : 'low'",
                        onBlur: emitUpdate
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  createVNode(unref(BtcConfigFormItem), {
                    label: "变量",
                    prop: "variablesJson"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: rule.variablesJson,
                        "onUpdate:modelValue": ($event) => rule.variablesJson = $event,
                        type: "textarea",
                        rows: 2,
                        placeholder: '{"user": {"score": 0}}',
                        onBlur: ($event) => updateVariables(rule)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"])
                    ]),
                    _: 2
                  }, 1024),
                  createVNode(unref(BtcConfigFormItem), {
                    label: "描述",
                    prop: "description"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: rule.description,
                        "onUpdate:modelValue": ($event) => rule.description = $event,
                        placeholder: "规则描述",
                        onBlur: emitUpdate
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024)
                ]),
                _: 2
              }, 1032, ["model"])
            ]);
          }), 128))
        ])),
        _cache[2] || (_cache[2] = createStaticVNode('<div class="expression-help" data-v-44327155><h5 data-v-44327155>表达式语法帮助</h5><div class="help-content" data-v-44327155><p data-v-44327155><strong data-v-44327155>基本语法：</strong></p><ul data-v-44327155><li data-v-44327155>条件判断：<code data-v-44327155>condition ? value1 : value2</code></li><li data-v-44327155>比较操作：<code data-v-44327155>&gt;</code>, <code data-v-44327155>&lt;</code>, <code data-v-44327155>==</code>, <code data-v-44327155>!=</code></li><li data-v-44327155>逻辑操作：<code data-v-44327155>&amp;&amp;</code>, <code data-v-44327155>||</code>, <code data-v-44327155>!</code></li><li data-v-44327155>数学运算：<code data-v-44327155>+</code>, <code data-v-44327155>-</code>, <code data-v-44327155>*</code>, <code data-v-44327155>/</code></li></ul><p data-v-44327155><strong data-v-44327155>示例：</strong></p><ul data-v-44327155><li data-v-44327155><code data-v-44327155>user.age &gt;= 18 ? &#39;adult&#39; : &#39;minor&#39;</code></li><li data-v-44327155><code data-v-44327155>order.amount &gt; 1000 &amp;&amp; user.vip ? &#39;discount&#39; : &#39;normal&#39;</code></li></ul></div></div>', 1))
      ]);
    };
  }
});
var DecisionNodeConfig = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-44327155"]]);
const _hoisted_1$5 = { class: "gateway-node-config" };
const _hoisted_2$5 = { class: "config-preview" };
const _hoisted_3$5 = { class: "config-json" };
var _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "GatewayNodeConfig",
  props: {
    config: {}
  },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const gatewayTypes = [
      { value: "parallel", label: "并行网关" },
      { value: "exclusive", label: "排他网关" },
      { value: "inclusive", label: "包容网关" },
      { value: "complex", label: "复杂网关" }
    ];
    const configForm = ref({
      gatewayType: "parallel",
      mergeStrategy: "all",
      customRule: "",
      timeout: 5e3,
      parallel: true,
      failureHandling: "continue",
      retryCount: 3,
      ...props.config
    });
    watch(() => props.config, (newConfig) => {
      configForm.value = {
        gatewayType: "parallel",
        mergeStrategy: "all",
        customRule: "",
        timeout: 5e3,
        parallel: true,
        failureHandling: "continue",
        retryCount: 3,
        ...newConfig
      };
    }, { deep: true });
    const emitUpdate = () => {
      emit("update", { ...configForm.value });
    };
    return (_ctx, _cache) => {
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_input = ElInput;
      const _component_el_input_number = ElInputNumber;
      const _component_el_switch = ElSwitch;
      const _component_el_radio = ElRadio;
      const _component_el_radio_group = ElRadioGroup;
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        _cache[12] || (_cache[12] = createBaseVNode("div", { class: "config-header" }, [
          createBaseVNode("span", null, "网关配置")
        ], -1)),
        createVNode(unref(BtcConfigForm), {
          model: configForm.value,
          size: "small",
          "label-width": "80px"
        }, {
          default: withCtx(() => [
            createVNode(unref(BtcConfigFormItem), {
              label: "网关类型",
              prop: "gatewayType"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_select, {
                  modelValue: configForm.value.gatewayType,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => configForm.value.gatewayType = $event),
                  onChange: emitUpdate
                }, {
                  default: withCtx(() => [
                    (openBlock(), createElementBlock(Fragment, null, renderList(gatewayTypes, (type) => {
                      return createVNode(_component_el_option, {
                        key: type.value,
                        label: type.label,
                        value: type.value
                      }, null, 8, ["label", "value"]);
                    }), 64))
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(unref(BtcConfigFormItem), {
              label: "合并策略",
              prop: "mergeStrategy"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_select, {
                  modelValue: configForm.value.mergeStrategy,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => configForm.value.mergeStrategy = $event),
                  onChange: emitUpdate
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_option, {
                      label: "全部通过",
                      value: "all"
                    }),
                    createVNode(_component_el_option, {
                      label: "任一通过",
                      value: "any"
                    }),
                    createVNode(_component_el_option, {
                      label: "多数通过",
                      value: "majority"
                    }),
                    createVNode(_component_el_option, {
                      label: "自定义",
                      value: "custom"
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            configForm.value.mergeStrategy === "custom" ? (openBlock(), createBlock(unref(BtcConfigFormItem), {
              key: 0,
              label: "自定义规则",
              prop: "customRule"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: configForm.value.customRule,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => configForm.value.customRule = $event),
                  type: "textarea",
                  rows: 3,
                  placeholder: "如：(result1 && result2) || result3",
                  onBlur: emitUpdate
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            })) : createCommentVNode("", true),
            createVNode(unref(BtcConfigFormItem), {
              label: "超时时间",
              prop: "timeout"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input_number, {
                  modelValue: configForm.value.timeout,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => configForm.value.timeout = $event),
                  min: 1e3,
                  max: 6e4,
                  step: 1e3,
                  onChange: emitUpdate
                }, null, 8, ["modelValue"]),
                _cache[7] || (_cache[7] = createBaseVNode("span", { style: { "margin-left": "8px", "font-size": "12px", "color": "var(--el-text-color-secondary)" } }, "毫秒", -1))
              ]),
              _: 1
            }),
            createVNode(unref(BtcConfigFormItem), {
              label: "并行执行",
              prop: "parallel"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_switch, {
                  modelValue: configForm.value.parallel,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => configForm.value.parallel = $event),
                  onChange: emitUpdate
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(unref(BtcConfigFormItem), {
              label: "失败处理",
              prop: "failureHandling"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_radio_group, {
                  modelValue: configForm.value.failureHandling,
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => configForm.value.failureHandling = $event),
                  onChange: emitUpdate
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_radio, { label: "continue" }, {
                      default: withCtx(() => [..._cache[8] || (_cache[8] = [
                        createTextVNode("继续执行", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_radio, { label: "stop" }, {
                      default: withCtx(() => [..._cache[9] || (_cache[9] = [
                        createTextVNode("停止执行", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_radio, { label: "retry" }, {
                      default: withCtx(() => [..._cache[10] || (_cache[10] = [
                        createTextVNode("重试", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            configForm.value.failureHandling === "retry" ? (openBlock(), createBlock(unref(BtcConfigFormItem), {
              key: 1,
              label: "重试次数",
              prop: "retryCount"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input_number, {
                  modelValue: configForm.value.retryCount,
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => configForm.value.retryCount = $event),
                  min: 1,
                  max: 10,
                  onChange: emitUpdate
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            })) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["model"]),
        createBaseVNode("div", _hoisted_2$5, [
          _cache[11] || (_cache[11] = createBaseVNode("h5", null, "配置预览", -1)),
          createBaseVNode("pre", _hoisted_3$5, toDisplayString(JSON.stringify(configForm.value, null, 2)), 1)
        ])
      ]);
    };
  }
});
var GatewayNodeConfig = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-c3120d0a"]]);
const _hoisted_1$4 = { class: "strategy-node-properties" };
const _hoisted_2$4 = { class: "property-section" };
const _hoisted_3$4 = { class: "property-section" };
const _hoisted_4$4 = { class: "property-section" };
const _hoisted_5$3 = {
  key: 4,
  class: "node-config-empty"
};
var _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "StrategyNodeProperties",
  props: {
    node: {}
  },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const nodeForm = ref({
      name: props.node.name,
      description: props.node.description || "",
      type: props.node.type
    });
    const styleForm = ref({
      width: props.node.style?.width || 120,
      height: props.node.style?.height || 80,
      backgroundColor: props.node.style?.backgroundColor || "#ffffff",
      borderColor: props.node.style?.borderColor || "#409eff"
    });
    const nodeTypes = computed(() => [
      { value: "START", label: "开始节点" },
      { value: "END", label: "结束节点" },
      { value: "CONDITION", label: "条件节点" },
      { value: "ACTION", label: "动作节点" },
      { value: "DECISION", label: "决策节点" },
      { value: "GATEWAY", label: "网关节点" }
    ]);
    watch(() => props.node, (newNode) => {
      nodeForm.value = {
        name: newNode.name,
        description: newNode.description || "",
        type: newNode.type
      };
      styleForm.value = {
        width: newNode.style?.width || 120,
        height: newNode.style?.height || 80,
        backgroundColor: newNode.style?.backgroundColor || "#ffffff",
        borderColor: newNode.style?.borderColor || "#409eff"
      };
    }, { deep: true });
    const updateNode = () => {
      emit("update", props.node.id, {
        name: nodeForm.value.name,
        description: nodeForm.value.description
      });
    };
    const updateStyle = () => {
      emit("update", props.node.id, {
        style: {
          ...props.node.style,
          width: styleForm.value.width,
          height: styleForm.value.height,
          backgroundColor: styleForm.value.backgroundColor,
          borderColor: styleForm.value.borderColor
        }
      });
    };
    const handleTypeChange = (newType) => {
      emit("update", props.node.id, {
        type: newType,
        data: {
          conditions: [],
          actions: [],
          rules: [],
          config: {}
        }
      });
    };
    const updateConditions = (conditions) => {
      emit("update", props.node.id, {
        data: {
          ...props.node.data,
          conditions
        }
      });
    };
    const updateActions = (actions) => {
      emit("update", props.node.id, {
        data: {
          ...props.node.data,
          actions
        }
      });
    };
    const updateRules = (rules) => {
      emit("update", props.node.id, {
        data: {
          ...props.node.data,
          rules
        }
      });
    };
    const updateConfig = (config) => {
      emit("update", props.node.id, {
        data: {
          ...props.node.data,
          config
        }
      });
    };
    return (_ctx, _cache) => {
      const _component_el_input = ElInput;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_input_number = ElInputNumber;
      const _component_el_empty = ElEmpty;
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createBaseVNode("div", _hoisted_2$4, [
          _cache[7] || (_cache[7] = createBaseVNode("h4", { class: "section-title" }, "基础属性", -1)),
          createVNode(unref(BtcConfigForm), {
            model: nodeForm.value,
            "label-width": "60px",
            size: "small"
          }, {
            default: withCtx(() => [
              createVNode(unref(BtcConfigFormItem), {
                label: "节点名称",
                prop: "name"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: nodeForm.value.name,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => nodeForm.value.name = $event),
                    onBlur: updateNode,
                    placeholder: "请输入节点名称"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "节点描述",
                prop: "description"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: nodeForm.value.description,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => nodeForm.value.description = $event),
                    type: "textarea",
                    rows: 2,
                    onBlur: updateNode,
                    placeholder: "请输入节点描述"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "节点类型",
                prop: "type"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_select, {
                    modelValue: nodeForm.value.type,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => nodeForm.value.type = $event),
                    onChange: handleTypeChange,
                    disabled: ""
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(nodeTypes.value, (type) => {
                        return openBlock(), createBlock(_component_el_option, {
                          key: type.value,
                          label: type.label,
                          value: type.value
                        }, null, 8, ["label", "value"]);
                      }), 128))
                    ]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model"])
        ]),
        createBaseVNode("div", _hoisted_3$4, [
          _cache[8] || (_cache[8] = createBaseVNode("h4", { class: "section-title" }, "样式属性", -1)),
          createVNode(unref(BtcConfigForm), {
            model: styleForm.value,
            "label-width": "60px",
            size: "small"
          }, {
            default: withCtx(() => [
              createVNode(unref(BtcConfigFormItem), {
                label: "宽度",
                prop: "width"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input_number, {
                    modelValue: styleForm.value.width,
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => styleForm.value.width = $event),
                    min: 80,
                    max: 300,
                    onChange: updateStyle
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "高度",
                prop: "height"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input_number, {
                    modelValue: styleForm.value.height,
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => styleForm.value.height = $event),
                    min: 60,
                    max: 200,
                    onChange: updateStyle
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "背景色",
                prop: "backgroundColor"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: styleForm.value.backgroundColor,
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => styleForm.value.backgroundColor = $event),
                    placeholder: "请输入颜色值，如 #ff0000"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "边框色",
                prop: "borderColor"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: styleForm.value.borderColor,
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => styleForm.value.borderColor = $event),
                    placeholder: "请输入颜色值，如 #ff0000"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model"])
        ]),
        createBaseVNode("div", _hoisted_4$4, [
          _cache[9] || (_cache[9] = createBaseVNode("h4", { class: "section-title" }, "节点配置", -1)),
          __props.node.type === "CONDITION" ? (openBlock(), createBlock(ConditionNodeConfig, {
            key: 0,
            conditions: __props.node.data.conditions || [],
            onUpdate: updateConditions
          }, null, 8, ["conditions"])) : __props.node.type === "ACTION" ? (openBlock(), createBlock(ActionNodeConfig, {
            key: 1,
            actions: __props.node.data.actions || [],
            onUpdate: updateActions
          }, null, 8, ["actions"])) : __props.node.type === "DECISION" ? (openBlock(), createBlock(DecisionNodeConfig, {
            key: 2,
            rules: __props.node.data.rules || [],
            onUpdate: updateRules
          }, null, 8, ["rules"])) : __props.node.type === "GATEWAY" ? (openBlock(), createBlock(GatewayNodeConfig, {
            key: 3,
            config: __props.node.data.config || {},
            onUpdate: updateConfig
          }, null, 8, ["config"])) : (openBlock(), createElementBlock("div", _hoisted_5$3, [
            createVNode(_component_el_empty, {
              description: "此节点类型无需额外配置",
              "image-size": 60
            })
          ]))
        ])
      ]);
    };
  }
});
var StrategyNodeProperties = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-6c6e693a"]]);
const _hoisted_1$3 = { class: "strategy-connection-properties" };
const _hoisted_2$3 = { class: "property-section" };
const _hoisted_3$3 = { class: "property-section" };
const _hoisted_4$3 = { class: "property-section" };
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "StrategyConnectionProperties",
  props: {
    connection: {}
  },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const connectionForm = ref({
      type: props.connection.type,
      label: props.connection.label || ""
    });
    const styleForm = ref({
      strokeColor: props.connection.style?.strokeColor || "#409eff",
      strokeWidth: props.connection.style?.strokeWidth || 2,
      strokeDasharray: props.connection.style?.strokeDasharray || ""
    });
    const conditionExpression = ref(
      props.connection.condition?.field && props.connection.condition?.operator && props.connection.condition?.value ? `${props.connection.condition.field} ${props.connection.condition.operator} ${props.connection.condition.value}` : ""
    );
    watch(() => props.connection, (newConnection) => {
      connectionForm.value = {
        type: newConnection.type,
        label: newConnection.label || ""
      };
      styleForm.value = {
        strokeColor: newConnection.style?.strokeColor || "#409eff",
        strokeWidth: newConnection.style?.strokeWidth || 2,
        strokeDasharray: newConnection.style?.strokeDasharray || ""
      };
      conditionExpression.value = newConnection.condition?.field && newConnection.condition?.operator && newConnection.condition?.value ? `${newConnection.condition.field} ${newConnection.condition.operator} ${newConnection.condition.value}` : "";
    }, { deep: true });
    const updateConnection = () => {
      emit("update", props.connection.id, {
        type: connectionForm.value.type,
        label: connectionForm.value.label
      });
    };
    const updateStyle = () => {
      emit("update", props.connection.id, {
        style: {
          ...props.connection.style,
          strokeColor: styleForm.value.strokeColor,
          strokeWidth: styleForm.value.strokeWidth,
          strokeDasharray: styleForm.value.strokeDasharray
        }
      });
    };
    const updateCondition = () => {
      if (!conditionExpression.value.trim()) {
        emit("update", props.connection.id, {
          condition: void 0
        });
        return;
      }
      const parts = conditionExpression.value.trim().split(/\s+/);
      if (parts.length >= 3) {
        const condition = {
          id: Date.now().toString(),
          field: parts[0],
          operator: parts[1],
          value: parts.slice(2).join(" ")
        };
        emit("update", props.connection.id, {
          condition
        });
      }
    };
    return (_ctx, _cache) => {
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_input = ElInput;
      const _component_el_input_number = ElInputNumber;
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_descriptions = ElDescriptions;
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$3, [
          _cache[6] || (_cache[6] = createBaseVNode("h4", { class: "section-title" }, "连接属性", -1)),
          createVNode(unref(BtcConfigForm), {
            model: connectionForm.value,
            "label-width": "60px",
            size: "small"
          }, {
            default: withCtx(() => [
              createVNode(unref(BtcConfigFormItem), {
                label: "连接类型",
                prop: "type"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_select, {
                    modelValue: connectionForm.value.type,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => connectionForm.value.type = $event),
                    onChange: updateConnection
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "顺序连接",
                        value: "SEQUENCE"
                      }),
                      createVNode(_component_el_option, {
                        label: "条件连接",
                        value: "CONDITIONAL"
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "连接标签",
                prop: "label"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: connectionForm.value.label,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => connectionForm.value.label = $event),
                    placeholder: "连接描述",
                    onBlur: updateConnection
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              connectionForm.value.type === "CONDITIONAL" ? (openBlock(), createBlock(unref(BtcConfigFormItem), {
                key: 0,
                label: "条件",
                prop: "condition"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: conditionExpression.value,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => conditionExpression.value = $event),
                    type: "textarea",
                    rows: 2,
                    placeholder: "如：result === true",
                    onBlur: updateCondition
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ]),
            _: 1
          }, 8, ["model"])
        ]),
        createBaseVNode("div", _hoisted_3$3, [
          _cache[7] || (_cache[7] = createBaseVNode("h4", { class: "section-title" }, "样式属性", -1)),
          createVNode(unref(BtcConfigForm), {
            model: styleForm.value,
            "label-width": "60px",
            size: "small"
          }, {
            default: withCtx(() => [
              createVNode(unref(BtcConfigFormItem), {
                label: "线条颜色",
                prop: "strokeColor"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: styleForm.value.strokeColor,
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => styleForm.value.strokeColor = $event),
                    placeholder: "请输入颜色值，如 #ff0000"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "线条宽度",
                prop: "strokeWidth"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_input_number, {
                    modelValue: styleForm.value.strokeWidth,
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => styleForm.value.strokeWidth = $event),
                    min: 1,
                    max: 10,
                    onChange: updateStyle
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(unref(BtcConfigFormItem), {
                label: "线条样式",
                prop: "strokeDasharray"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_select, {
                    modelValue: styleForm.value.strokeDasharray,
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => styleForm.value.strokeDasharray = $event),
                    onChange: updateStyle
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "实线",
                        value: ""
                      }),
                      createVNode(_component_el_option, {
                        label: "虚线",
                        value: "5,5"
                      }),
                      createVNode(_component_el_option, {
                        label: "点线",
                        value: "2,2"
                      }),
                      createVNode(_component_el_option, {
                        label: "点划线",
                        value: "10,5,2,5"
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["model"])
        ]),
        createBaseVNode("div", _hoisted_4$3, [
          _cache[8] || (_cache[8] = createBaseVNode("h4", { class: "section-title" }, "连接信息", -1)),
          createVNode(_component_el_descriptions, {
            column: 1,
            size: "small",
            border: ""
          }, {
            default: withCtx(() => [
              createVNode(_component_el_descriptions_item, { label: "源节点ID" }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.connection.sourceNodeId), 1)
                ]),
                _: 1
              }),
              createVNode(_component_el_descriptions_item, { label: "目标节点ID" }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.connection.targetNodeId), 1)
                ]),
                _: 1
              }),
              createVNode(_component_el_descriptions_item, { label: "源句柄" }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.connection.sourceHandle || "默认"), 1)
                ]),
                _: 1
              }),
              createVNode(_component_el_descriptions_item, { label: "目标句柄" }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.connection.targetHandle || "默认"), 1)
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ])
      ]);
    };
  }
});
var StrategyConnectionProperties = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-65a3f206"]]);
const _hoisted_1$2 = { class: "properties-panel" };
const _hoisted_2$2 = { class: "panel-header" };
const _hoisted_3$2 = { class: "panel-actions" };
const _hoisted_4$2 = { class: "panel-content" };
const _hoisted_5$2 = { class: "text-config-section" };
const _hoisted_6$1 = { class: "font-preview" };
const _hoisted_7$1 = {
  key: 2,
  class: "empty-state"
};
const _hoisted_8$1 = { class: "empty-icon" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "PropertiesPanel",
  props: {
    selectedNode: {},
    selectedConnection: {},
    textConfig: {},
    fontFamilyOptions: {}
  },
  emits: ["delete-selected", "update-node", "update-connection", "update-text-config"],
  setup(__props) {
    const props = __props;
    const textConfig = reactive({ ...props.textConfig });
    watch(() => props.textConfig, (v) => Object.assign(textConfig, v || {}));
    watch(textConfig, (v) => {
    }, { deep: true });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_input_number = ElInputNumber;
      const _component_el_form_item = ElFormItem;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_form = ElForm;
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", _hoisted_2$2, [
          createBaseVNode("div", _hoisted_3$2, [
            !!__props.selectedNode ? (openBlock(), createBlock(_component_el_button, {
              key: 0,
              type: "danger",
              size: "small",
              onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("delete-selected"))
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(delete_default))
                  ]),
                  _: 1
                }),
                _cache[7] || (_cache[7] = createTextVNode(" 删除 ", -1))
              ]),
              _: 1
            })) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("div", _hoisted_4$2, [
          createBaseVNode("div", _hoisted_5$2, [
            _cache[9] || (_cache[9] = createBaseVNode("h4", null, "文本配置", -1)),
            createVNode(_component_el_form, {
              model: textConfig,
              "label-width": "60px",
              size: "small"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, {
                  label: "字体大小",
                  prop: "fontSize"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input_number, {
                      modelValue: textConfig.fontSize,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => textConfig.fontSize = $event),
                      min: 8,
                      max: 32,
                      step: 1,
                      "controls-position": "right",
                      style: { "width": "100%" }
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "字体族",
                  prop: "fontFamily"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: textConfig.fontFamily,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => textConfig.fontFamily = $event),
                      style: { "width": "100%" }
                    }, {
                      default: withCtx(() => [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.fontFamilyOptions, (option) => {
                          return openBlock(), createBlock(_component_el_option, {
                            key: option.value,
                            label: option.label,
                            value: option.value
                          }, null, 8, ["label", "value"]);
                        }), 128))
                      ]),
                      _: 1
                    }, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "字体粗细",
                  prop: "fontWeight"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: textConfig.fontWeight,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => textConfig.fontWeight = $event),
                      style: { "width": "100%" }
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: "极细",
                          value: "100"
                        }),
                        createVNode(_component_el_option, {
                          label: "细体",
                          value: "300"
                        }),
                        createVNode(_component_el_option, {
                          label: "正常",
                          value: "normal"
                        }),
                        createVNode(_component_el_option, {
                          label: "中等",
                          value: "500"
                        }),
                        createVNode(_component_el_option, {
                          label: "粗体",
                          value: "bold"
                        }),
                        createVNode(_component_el_option, {
                          label: "极粗",
                          value: "900"
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "字体样式",
                  prop: "fontStyle"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: textConfig.fontStyle,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => textConfig.fontStyle = $event),
                      style: { "width": "100%" }
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: "正常",
                          value: "normal"
                        }),
                        createVNode(_component_el_option, {
                          label: "斜体",
                          value: "italic"
                        }),
                        createVNode(_component_el_option, {
                          label: "倾斜",
                          value: "oblique"
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"]),
            createBaseVNode("div", _hoisted_6$1, [
              _cache[8] || (_cache[8] = createBaseVNode("h5", null, "预览效果", -1)),
              createBaseVNode("div", {
                class: "preview-text",
                style: normalizeStyle({ fontSize: textConfig.fontSize + "px", fontFamily: textConfig.fontFamily, fontWeight: textConfig.fontWeight, fontStyle: textConfig.fontStyle })
              }, "开始节点", 4)
            ])
          ]),
          !!__props.selectedNode ? (openBlock(), createBlock(StrategyNodeProperties, {
            key: 0,
            node: __props.selectedNode,
            onUpdate: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("update-node", $event))
          }, null, 8, ["node"])) : createCommentVNode("", true),
          !!__props.selectedConnection ? (openBlock(), createBlock(StrategyConnectionProperties, {
            key: 1,
            connection: __props.selectedConnection,
            onUpdate: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("update-connection", $event))
          }, null, 8, ["connection"])) : createCommentVNode("", true),
          !__props.selectedNode && !__props.selectedConnection ? (openBlock(), createElementBlock("div", _hoisted_7$1, [
            createBaseVNode("div", _hoisted_8$1, [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(unref(setting_default))
                ]),
                _: 1
              })
            ]),
            _cache[10] || (_cache[10] = createBaseVNode("div", { class: "empty-text" }, "请选择一个节点或连接线来配置属性", -1))
          ])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
const _hoisted_1$1 = { class: "shape-grid" };
const _hoisted_2$1 = ["onClick"];
const _hoisted_3$1 = {
  width: "40",
  height: "40",
  viewBox: "0 0 40 40"
};
const _hoisted_4$1 = ["fill", "stroke"];
const _hoisted_5$1 = ["fill", "stroke"];
const _hoisted_6 = ["fill", "stroke"];
const _hoisted_7 = ["fill", "stroke"];
const _hoisted_8 = { class: "shape-name" };
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ShapeSelectorPopup",
  props: {
    visible: { type: Boolean },
    position: {},
    components: {},
    getFill: { type: Function },
    getStroke: { type: Function }
  },
  emits: ["select"],
  setup(__props) {
    return (_ctx, _cache) => {
      return __props.visible ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "shape-selector-popup",
        style: normalizeStyle({
          left: __props.position.x + "px",
          top: __props.position.y + "px"
        }),
        onClick: _cache[0] || (_cache[0] = withModifiers(() => {
        }, ["stop"]))
      }, [
        createBaseVNode("div", _hoisted_1$1, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.components, (component) => {
            return openBlock(), createElementBlock("div", {
              key: component.type,
              class: "shape-item",
              onClick: ($event) => _ctx.$emit("select", component)
            }, [
              (openBlock(), createElementBlock("svg", _hoisted_3$1, [
                component.type === "START" || component.type === "END" ? (openBlock(), createElementBlock("circle", {
                  key: 0,
                  cx: "20",
                  cy: "20",
                  r: "12",
                  fill: __props.getFill(component.type),
                  stroke: __props.getStroke(component.type),
                  "stroke-width": "2"
                }, null, 8, _hoisted_4$1)) : component.type === "CONDITION" ? (openBlock(), createElementBlock("path", {
                  key: 1,
                  d: "M 20 5 L 35 20 L 20 35 L 5 20 Z",
                  fill: __props.getFill(component.type),
                  stroke: __props.getStroke(component.type),
                  "stroke-width": "2"
                }, null, 8, _hoisted_5$1)) : component.type === "ACTION" ? (openBlock(), createElementBlock("rect", {
                  key: 2,
                  x: "5",
                  y: "5",
                  width: "30",
                  height: "30",
                  fill: __props.getFill(component.type),
                  stroke: __props.getStroke(component.type),
                  "stroke-width": "2",
                  rx: "4",
                  ry: "4"
                }, null, 8, _hoisted_6)) : (openBlock(), createElementBlock("rect", {
                  key: 3,
                  x: "5",
                  y: "5",
                  width: "30",
                  height: "30",
                  fill: __props.getFill(component.type),
                  stroke: __props.getStroke(component.type),
                  "stroke-width": "2",
                  rx: "4",
                  ry: "4"
                }, null, 8, _hoisted_7))
              ])),
              createBaseVNode("span", _hoisted_8, toDisplayString(component.name), 1)
            ], 8, _hoisted_2$1);
          }), 128))
        ])
      ], 4)) : createCommentVNode("", true);
    };
  }
});
var ShapeSelectorPopup = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-87a2f9b5"]]);
const _hoisted_1 = { class: "strategy-designer" };
const _hoisted_2 = { class: "canvas-container" };
const _hoisted_3 = { class: "canvas-scroll" };
const _hoisted_4 = {
  key: 0,
  class: "temp-connection-group"
};
const _hoisted_5 = ["d", "stroke"];
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    const canvasRef = ref(null);
    const { generateId } = useUtils();
    const { canvasDimensions } = useCanvasDimensions();
    let updateTempConnectionTemp;
    const {
      panX,
      panY,
      resetZoom,
      handleCanvasMouseDown,
      handleCanvasMouseMove,
      handleCanvasMouseUp
    } = useCanvasInteraction((event, canvasRef2) => {
      updateTempConnectionTemp?.(event, canvasRef2);
    });
    const {
      canvasScale,
      minScale,
      maxScale,
      scaleInputValue,
      handleZoomIn,
      handleZoomOut,
      handleZoomCommand,
      handleScaleInputChange,
      handleScaleInputBlur,
      handleScaleInputEnter
    } = useCanvasScale(panX, panY);
    const {
      nodes,
      selectedNode,
      selectedNodeId,
      isDragging: nodeIsDragging,
      addNode,
      updateNode: updateNodeOriginal,
      selectNode,
      moveNode
    } = useNodeManagement(canvasDimensions);
    const {
      connections,
      selectedConnectionId,
      selectedConnection,
      connectionState,
      tempConnection,
      connectionPaths,
      updateTempConnection,
      completeConnection,
      connectionOffsetY,
      selectConnection,
      updateConnection: updateConnectionOriginal,
      updateConnectionPaths
    } = useConnectionManagement(nodes);
    window.updateConnectionPaths = updateConnectionPaths;
    updateTempConnectionTemp = updateTempConnection;
    const {
      getHandlePositions,
      getArrowTransform,
      getArrowTransformByPos,
      getPositionBoxLocalTransform
    } = useNodeGeometry(canvasDimensions);
    const {
      getNodeText,
      getNodeFillColor,
      getNodeStrokeColor,
      getNodeTextColor,
      getConnectionColor,
      getTempConnectionColor,
      getGridColor
    } = useNodeStyle(nodes, connectionState);
    const {
      getConnectionHandle,
      startDragConnectionHandle
    } = useConnectionHandles(connections, nodes, connectionOffsetY, canvasScale);
    const {
      componentSearch,
      activeCategories,
      filteredComponentCategories,
      componentLibrary,
      handleComponentDragStart
    } = useComponentLibrary(nodes);
    const activeArrowDirection = ref("");
    const {
      showComponentMenuFlag,
      componentMenuPosition,
      showComponentMenu,
      selectComponent,
      closeComponentMenu,
      getCommonComponents,
      findNearbyNode,
      createConnection: createConnectionOriginal
    } = useComponentMenu(
      nodes,
      connections,
      componentLibrary,
      addNode,
      generateId,
      getConnectionColor,
      activeArrowDirection
    );
    let createConnectionFromMenu = (sourceNode, targetNode, direction) => {
      createConnectionOriginal(sourceNode, targetNode, direction);
    };
    const dragStatePlaceholder = {
      isDragging: ref(false),
      maybeDrag: ref(false)
    };
    const {
      editingNodeId,
      isOverlayEditing,
      nodeTextConfig,
      defaultTextConfig,
      fontFamilyOptions,
      handleNodeDoubleClick
    } = useTextEditor(
      nodes,
      selectedNodeId,
      canvasScale,
      panX,
      panY,
      canvasDimensions,
      dragStatePlaceholder,
      getNodeText
    );
    const isMouseOnNodeBorder = ref(false);
    const {
      isResizing,
      handleResizeHandleEnter,
      handleResizeHandleLeave,
      handleResizeStart,
      handleResizeMove,
      handleResizeEnd
    } = useNodeResize(
      nodes,
      selectedNodeId,
      canvasDimensions,
      canvasScale,
      isMouseOnNodeBorder,
      getHandlePositions,
      getArrowTransform
    );
    const {
      dragState,
      isDragging,
      draggingNodeId,
      handleNodePointerDown,
      handleNodePointerMove,
      handleNodePointerUp,
      dragStateRefs
    } = useNodeDrag(
      nodes,
      selectedNodeId,
      canvasDimensions,
      canvasScale,
      isResizing,
      isOverlayEditing,
      nodeIsDragging,
      moveNode,
      getHandlePositions,
      getArrowTransformByPos,
      handleNodeDoubleClick
    );
    watch(dragStateRefs.isDragging, (v) => {
      dragStatePlaceholder.isDragging.value = v;
    }, { immediate: true });
    watch(dragStateRefs.maybeDrag, (v) => {
      dragStatePlaceholder.maybeDrag.value = v;
    }, { immediate: true });
    const selection = useSelection({
      nodes,
      connections,
      isOverlayEditing,
      connectionState,
      selectedNodeId,
      connectionOffsetY,
      getConnectionHandle,
      fallthrough: { handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp }
    });
    const multiSelectedNodeIds = selection.multiSelectedNodeIds;
    const multiSelectedConnectionIds = selection.multiSelectedConnectionIds;
    const lastSelectionMode = selection.lastSelectionMode;
    const lastSelectionModePlaceholder = ref("click");
    const {
      hoveredArrowDirection: interactionHoveredArrowDirection,
      handleNodeClick,
      handleNodeMouseEnter,
      handleNodeMouseLeave,
      handleArrowClick,
      handleArrowEnter,
      handleArrowLeave,
      handleCanvasClick,
      handleCanvasDragLeave
    } = useNodeInteraction(
      nodes,
      selectedNodeId,
      isOverlayEditing,
      editingNodeId,
      showComponentMenuFlag,
      closeComponentMenu,
      activeArrowDirection,
      lastSelectionModePlaceholder,
      findNearbyNode,
      createConnectionFromMenu,
      showComponentMenu,
      nodeTextConfig,
      defaultTextConfig,
      isMouseOnNodeBorder,
      selection.clearMultiSelection,
      () => {
        selectedConnectionId.value = "";
      }
      // 清空连接线选中状态
    );
    const hoveredArrowDirection = interactionHoveredArrowDirection;
    watch(lastSelectionMode, (val) => {
      lastSelectionModePlaceholder.value = val === "rubber" ? "rubber" : "click";
    }, { immediate: true });
    const {
      recordHistory,
      undo,
      redo
    } = useUndoRedo(nodes, connections, connectionOffsetY);
    const {
      strategyName,
      currentOrchestration,
      showPreview,
      validateOrchestration,
      previewExecution,
      handleSave
    } = useStrategyOperations(nodes, connections);
    const {
      saveNow
    } = useAutoSave({
      nodes,
      connections,
      connectionOffsetY,
      canvasPosition: { x: panX, y: panY },
      // 传递当前画布位置 refs
      canvasScale,
      strategyName,
      autoSaveEnabled: true
    });
    watch(isOverlayEditing, (newVal, oldVal) => {
      if (oldVal && !newVal) {
        recordHistory();
        saveNow();
      }
    });
    createConnectionFromMenu = (sourceNode, targetNode, direction) => {
      createConnectionOriginal(sourceNode, targetNode, direction);
      recordHistory();
      saveNow();
    };
    const updateNode = (nodeId, updates) => {
      updateNodeOriginal(nodeId, updates);
      recordHistory();
      saveNow();
    };
    const updateConnection = (connectionId, updates) => {
      updateConnectionOriginal(connectionId, updates);
      recordHistory();
      saveNow();
    };
    const handleCanvasDrop = async (event) => {
      event.preventDefault();
      const componentType = event.dataTransfer?.getData("component-type");
      const componentData = event.dataTransfer?.getData("application/json");
      if (componentType && componentData) {
        try {
          const component = JSON.parse(componentData);
          const rect = event.target.getBoundingClientRect();
          const x = (event.clientX - rect.left - panX.value) / canvasScale.value;
          const y = (event.clientY - rect.top - panY.value) / canvasScale.value;
          await addNode(component, { x, y });
          recordHistory();
          saveNow();
        } catch (error) {
          console.error("Failed to parse component data:", error);
        }
      }
    };
    const gridPatternSvg = computed(() => {
      const gridSize = 40;
      const smallGridStep = 10;
      const svg = `
<svg style="color-scheme: light dark;" width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M 0 ${smallGridStep} L ${gridSize} ${smallGridStep} M ${smallGridStep} 0 L ${smallGridStep} ${gridSize} M 0 ${smallGridStep * 2} L ${gridSize} ${smallGridStep * 2} M ${smallGridStep * 2} 0 L ${smallGridStep * 2} ${gridSize} M 0 ${smallGridStep * 3} L ${gridSize} ${smallGridStep * 3} M ${smallGridStep * 3} 0 L ${smallGridStep * 3} ${gridSize}" fill="none" style="stroke: light-dark(#d0d0d0, #424242);" stroke="#d0d0d0" opacity="0.2" stroke-width="1"/>
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" style="stroke: light-dark(#d0d0d0, #424242);" stroke="#d0d0d0" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
</svg>`.trim();
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    });
    const gridBackgroundStyle = computed(() => {
      return {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: `${canvasDimensions.value.width}px`,
        height: `${canvasDimensions.value.height}px`,
        marginLeft: `-${canvasDimensions.value.width / 2}px`,
        marginTop: `-${canvasDimensions.value.height / 2}px`,
        boxSizing: "border-box",
        borderTopWidth: "1px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--el-border-color)",
        overflow: "hidden",
        backgroundColor: "var(--el-bg-color)",
        backgroundImage: `url("${gridPatternSvg.value}")`,
        backgroundPosition: "-1px -1px",
        pointerEvents: "none"
      };
    });
    const deleteSelected = () => {
      if (isDragging.value || isResizing.value || dragState.maybeDrag) {
        return;
      }
      if (multiSelectedNodeIds.value.size > 0 || multiSelectedConnectionIds.value.size > 0) {
        if (multiSelectedNodeIds.value.size > 0) {
          const nodesToDelete = Array.from(multiSelectedNodeIds.value);
          nodes.value = nodes.value.filter((n) => !nodesToDelete.includes(n.id));
        }
        if (multiSelectedConnectionIds.value.size > 0) {
          const connsToDelete = Array.from(multiSelectedConnectionIds.value);
          connections.value = connections.value.filter((conn) => !connsToDelete.includes(conn.id));
        }
        selection.clearMultiSelection();
        selectedNodeId.value = "";
        selectedConnectionId.value = "";
        recordHistory();
        saveNow();
        return;
      }
      if (selectedNode.value) {
        const nodeId = selectedNode.value.id;
        const nodeExists = nodes.value.some((n) => n.id === nodeId);
        if (nodeExists) {
          recordHistory();
          nodes.value = nodes.value.filter((n) => n.id !== nodeId);
          if (selectedNodeId.value === nodeId) {
            selectedNodeId.value = "";
          }
          nextTick(() => {
            recordHistory();
            saveNow();
          });
        }
      } else if (selectedConnection.value) {
        const connectionId = selectedConnection.value.id;
        const connectionExists = connections.value.some((c) => c.id === connectionId);
        if (connectionExists) {
          connections.value = connections.value.filter((conn) => conn.id !== connectionId);
          if (selectedConnectionId.value === connectionId) {
            selectedConnectionId.value = "";
          }
          recordHistory();
          saveNow();
        }
      }
    };
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (editingNodeId.value || isOverlayEditing.value) {
        return;
      }
      if (isDragging.value || isResizing.value) {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNode.value || selectedConnection.value || multiSelectedNodeIds.value.size > 0 || multiSelectedConnectionIds.value.size > 0) {
          event.preventDefault();
          deleteSelected();
        }
      }
    };
    const handleGlobalMouseMove = (event) => {
      if (isResizing.value) {
        handleResizeMove(event);
      }
      handleNodePointerMove(event);
      handleCanvasMouseMove(event);
    };
    const handleGlobalMouseUp = (event) => {
      if (isResizing.value) {
        handleResizeEnd();
        recordHistory();
        saveNow();
      }
      const wasDragging = dragState.isDragging || dragState.maybeDrag;
      handleNodePointerUp(event);
      if (wasDragging) {
        recordHistory();
        saveNow();
      }
      handleCanvasMouseUp();
    };
    const lastGridOffset = ref(null);
    const lastCanvasDimensions = ref(null);
    watch(() => canvasDimensions.value, (newDims) => {
      if (isDragging.value || isResizing.value) {
        return;
      }
      const container = document.querySelector(".canvas-scroll");
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const currentContainerWidth = containerRect.width;
      const currentContainerHeight = containerRect.height;
      const borderWidth = 1;
      const currentGridOffsetX = Math.round((currentContainerWidth - newDims.width) / 2 + borderWidth);
      const currentGridOffsetY = Math.round((currentContainerHeight - newDims.height) / 2 + borderWidth);
      if (!lastGridOffset.value || !lastCanvasDimensions.value) {
        lastGridOffset.value = { x: currentGridOffsetX, y: currentGridOffsetY };
        lastCanvasDimensions.value = { ...newDims };
        return;
      }
      const gridSizeChanged = Math.abs(newDims.width - lastCanvasDimensions.value.width) > 0.5 || Math.abs(newDims.height - lastCanvasDimensions.value.height) > 0.5;
      const offsetChanged = currentGridOffsetX !== lastGridOffset.value.x || currentGridOffsetY !== lastGridOffset.value.y;
      if (!gridSizeChanged && !offsetChanged) {
        lastGridOffset.value = { x: currentGridOffsetX, y: currentGridOffsetY };
        lastCanvasDimensions.value = { ...newDims };
        return;
      }
      nodes.value.forEach((node) => {
        const relativeX = node.position.x - lastGridOffset.value.x;
        const relativeY = node.position.y - lastGridOffset.value.y;
        const newAbsoluteX = relativeX + currentGridOffsetX;
        const newAbsoluteY = relativeY + currentGridOffsetY;
        const targetNode = nodes.value.find((n) => n.id === node.id);
        if (targetNode) {
          targetNode.position.x = Math.round(newAbsoluteX);
          targetNode.position.y = Math.round(newAbsoluteY);
        }
      });
      lastGridOffset.value = { x: currentGridOffsetX, y: currentGridOffsetY };
      lastCanvasDimensions.value = { ...newDims };
    }, { immediate: false });
    onMounted(async () => {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      try {
        resetZoom();
      } catch {
      }
    });
    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    });
    const handleComponentClick = async (component) => {
      const svg = document.querySelector(".strategy-canvas");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const viewCenterClientX = rect.left + rect.width / 2;
      const viewCenterClientY = rect.top + rect.height / 2;
      const centerX = (viewCenterClientX - rect.left - panX.value) / canvasScale.value;
      const centerY = (viewCenterClientY - rect.top - panY.value) / canvasScale.value;
      let nodeWidth = component.style?.width || 120;
      let nodeHeight = component.style?.height || 60;
      if (component.type === "START" || component.type === "END") {
        nodeWidth = 60;
        nodeHeight = 60;
      }
      const nodeX = centerX - nodeWidth / 2;
      const nodeY = centerY - nodeHeight / 2;
      await addNode(component, { x: nodeX, y: nodeY });
      recordHistory();
      saveNow();
    };
    const handleCompleteConnection = (nodeId) => {
      const result = completeConnection(nodeId);
      if (result) {
        recordHistory();
        saveNow();
      }
    };
    __expose({
      completeConnection: handleCompleteConnection,
      selectNode,
      selectConnection
    });
    return (_ctx, _cache) => {
      const _component_el_input = ElInput;
      const _component_el_button = ElButton;
      const _component_el_dialog = ElDialog;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(BtcGridGroup), {
          "left-width": "200px",
          "right-width": "260px"
        }, {
          headerLeft: withCtx(() => [
            createVNode(TopToolbar, {
              scale: unref(canvasScale),
              "min-scale": unref(minScale),
              "max-scale": unref(maxScale),
              "scale-input-value": unref(scaleInputValue),
              onZoomOut: unref(handleZoomOut),
              onZoomIn: unref(handleZoomIn),
              onZoomCommand: unref(handleZoomCommand),
              onScaleBlur: unref(handleScaleInputBlur),
              onScaleEnter: unref(handleScaleInputEnter),
              onScaleInput: unref(handleScaleInputChange)
            }, null, 8, ["scale", "min-scale", "max-scale", "scale-input-value", "onZoomOut", "onZoomIn", "onZoomCommand", "onScaleBlur", "onScaleEnter", "onScaleInput"])
          ]),
          headerMiddle: withCtx(() => [
            createVNode(_component_el_input, {
              modelValue: unref(strategyName),
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(strategyName) ? strategyName.value = $event : null),
              placeholder: "策略名称",
              style: { "width": "200px" }
            }, null, 8, ["modelValue"])
          ]),
          headerRight: withCtx(() => [
            createVNode(_component_el_button, {
              type: "primary",
              onClick: unref(validateOrchestration)
            }, {
              default: withCtx(() => [..._cache[7] || (_cache[7] = [
                createTextVNode("验证", -1)
              ])]),
              _: 1
            }, 8, ["onClick"]),
            createVNode(_component_el_button, {
              type: "warning",
              onClick: unref(previewExecution)
            }, {
              default: withCtx(() => [..._cache[8] || (_cache[8] = [
                createTextVNode("预览", -1)
              ])]),
              _: 1
            }, 8, ["onClick"]),
            createVNode(_component_el_button, {
              type: "success",
              onClick: unref(handleSave)
            }, {
              default: withCtx(() => [..._cache[9] || (_cache[9] = [
                createTextVNode("保存", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ]),
          bodyLeft: withCtx(() => [
            createVNode(_sfc_main$9, {
              search: unref(componentSearch),
              active: unref(activeCategories),
              categories: unref(filteredComponentCategories),
              "get-fill": unref(getNodeFillColor),
              "get-stroke": unref(getNodeStrokeColor),
              "onUpdate:search": _cache[1] || (_cache[1] = (v) => componentSearch.value = v),
              "onUpdate:active": _cache[2] || (_cache[2] = (v) => activeCategories.value = v),
              onDragstart: unref(handleComponentDragStart),
              onClickComponent: handleComponentClick
            }, null, 8, ["search", "active", "categories", "get-fill", "get-stroke", "onDragstart"])
          ]),
          bodyMiddle: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("div", _hoisted_3, [
                createBaseVNode("div", {
                  class: "grid-background-page",
                  style: normalizeStyle(gridBackgroundStyle.value)
                }, null, 4),
                _cache[10] || (_cache[10] = createBaseVNode("div", { id: "text-editor-layer" }, null, -1)),
                createVNode(CanvasSvg, {
                  ref_key: "canvasRef",
                  ref: canvasRef,
                  "canvas-dimensions": unref(canvasDimensions),
                  "pan-x": unref(panX),
                  "pan-y": unref(panY),
                  scale: unref(canvasScale),
                  "is-dragging": unref(isDragging),
                  "connection-paths": unref(connectionPaths),
                  "is-connection-selected": (id) => unref(selectedConnectionId) === id || unref(multiSelectedConnectionIds).has(id),
                  "get-grid-color": unref(getGridColor),
                  "get-connection-color": unref(getConnectionColor),
                  onDrop: handleCanvasDrop,
                  onDragover: _cache[3] || (_cache[3] = (event) => event.preventDefault()),
                  onDragleave: unref(handleCanvasDragLeave),
                  onMousedown: unref(selection).onCanvasMouseDown,
                  onMousemove: unref(selection).onCanvasMouseMove,
                  onMouseup: unref(selection).onCanvasMouseUp,
                  onClick: unref(handleCanvasClick),
                  onSelectConnection: _cache[4] || (_cache[4] = (id) => {
                    const conn = unref(connections).find((c) => c.id === id);
                    if (conn) {
                      unref(selectConnection)(conn);
                      unref(selectNode)("");
                      unref(selection).clearMultiSelection();
                    }
                  })
                }, {
                  "overlay-top": withCtx(() => [
                    createVNode(_sfc_main$d, {
                      "connection-paths": unref(connectionPaths),
                      "is-selected": (id) => unref(selectedConnectionId) === id || unref(multiSelectedConnectionIds).has(id),
                      "selected-connection-id": unref(selectedConnectionId),
                      "multi-selected-connection-ids": unref(multiSelectedConnectionIds),
                      "get-connection-handle": unref(getConnectionHandle),
                      "start-drag": unref(startDragConnectionHandle),
                      "is-dragging": unref(isDragging),
                      "is-resizing": unref(isResizing)
                    }, null, 8, ["connection-paths", "is-selected", "selected-connection-id", "multi-selected-connection-ids", "get-connection-handle", "start-drag", "is-dragging", "is-resizing"])
                  ]),
                  default: withCtx(() => [
                    unref(tempConnection) ? (openBlock(), createElementBlock("g", _hoisted_4, [
                      createBaseVNode("path", {
                        d: unref(tempConnection).path,
                        stroke: unref(getTempConnectionColor)(),
                        "stroke-width": "2",
                        "stroke-dasharray": "5,5",
                        fill: "none",
                        class: "temp-connection-line"
                      }, null, 8, _hoisted_5)
                    ])) : createCommentVNode("", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(unref(nodes), (node) => {
                      return openBlock(), createBlock(_sfc_main$c, {
                        key: node.id,
                        node,
                        "selected-node-id": unref(selectedNodeId) || "",
                        "multi-selected-node-ids": unref(multiSelectedNodeIds),
                        "is-dragging": unref(isDragging),
                        "is-resizing": unref(isResizing),
                        "is-editing": unref(editingNodeId) === node.id,
                        "dragging-node-id": unref(draggingNodeId) || "",
                        "last-selection-mode": unref(lastSelectionMode),
                        "multi-selected-connection-count": unref(multiSelectedConnectionIds).size,
                        "hovered-arrow-direction": unref(hoveredArrowDirection),
                        "is-mouse-on-node-border": isMouseOnNodeBorder.value,
                        "default-text-config": unref(defaultTextConfig),
                        "get-node-fill-color": unref(getNodeFillColor),
                        "get-node-stroke-color": unref(getNodeStrokeColor),
                        "get-node-text-color": unref(getNodeTextColor),
                        "get-handle-positions": unref(getHandlePositions),
                        "get-position-box-local-transform": unref(getPositionBoxLocalTransform),
                        "get-arrow-transform": unref(getArrowTransform),
                        "get-node-text": unref(getNodeText),
                        "canvas-dimensions": unref(canvasDimensions),
                        connections: unref(connections),
                        "selected-connection-id": unref(selectedConnectionId) || "",
                        "multi-selected-connection-ids": unref(multiSelectedConnectionIds),
                        "get-connection-handle": unref(getConnectionHandle),
                        onPointerdown: unref(handleNodePointerDown),
                        onClick: unref(handleNodeClick),
                        onDblclick: unref(handleNodeDoubleClick),
                        onMouseenter: unref(handleNodeMouseEnter),
                        onMouseleave: unref(handleNodeMouseLeave),
                        onResizeStart: unref(handleResizeStart),
                        onHandleEnter: unref(handleResizeHandleEnter),
                        onHandleLeave: unref(handleResizeHandleLeave),
                        onArrowClick: unref(handleArrowClick),
                        onArrowEnter: unref(handleArrowEnter),
                        onArrowLeave: unref(handleArrowLeave)
                      }, null, 8, ["node", "selected-node-id", "multi-selected-node-ids", "is-dragging", "is-resizing", "is-editing", "dragging-node-id", "last-selection-mode", "multi-selected-connection-count", "hovered-arrow-direction", "is-mouse-on-node-border", "default-text-config", "get-node-fill-color", "get-node-stroke-color", "get-node-text-color", "get-handle-positions", "get-position-box-local-transform", "get-arrow-transform", "get-node-text", "canvas-dimensions", "connections", "selected-connection-id", "multi-selected-connection-ids", "get-connection-handle", "onPointerdown", "onClick", "onDblclick", "onMouseenter", "onMouseleave", "onResizeStart", "onHandleEnter", "onHandleLeave", "onArrowClick", "onArrowEnter", "onArrowLeave"]);
                    }), 128))
                  ]),
                  _: 1
                }, 8, ["canvas-dimensions", "pan-x", "pan-y", "scale", "is-dragging", "connection-paths", "is-connection-selected", "get-grid-color", "get-connection-color", "onDragleave", "onMousedown", "onMousemove", "onMouseup", "onClick"]),
                unref(selection).rubber.active ? (openBlock(), createElementBlock("div", {
                  key: 0,
                  class: "rubber-band-selection",
                  style: normalizeStyle({
                    position: "absolute",
                    left: `${unref(selection).rubber.x}px`,
                    top: `${unref(selection).rubber.y}px`,
                    width: `${unref(selection).rubber.w}px`,
                    height: `${unref(selection).rubber.h}px`,
                    pointerEvents: "none",
                    border: "1px solid #888",
                    backgroundColor: "rgba(0, 0, 0, 0.3)"
                  })
                }, null, 4)) : createCommentVNode("", true)
              ])
            ])
          ]),
          bodyRight: withCtx(() => [
            createVNode(_sfc_main$2, {
              "selected-node": unref(selectedNode),
              "selected-connection": unref(selectedConnection),
              "text-config": unref(nodeTextConfig),
              "font-family-options": unref(fontFamilyOptions),
              onDeleteSelected: deleteSelected,
              onUpdateNode: updateNode,
              onUpdateConnection: updateConnection
            }, null, 8, ["selected-node", "selected-connection", "text-config", "font-family-options"])
          ]),
          _: 1
        }),
        createVNode(_component_el_dialog, {
          modelValue: unref(showPreview),
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => isRef(showPreview) ? showPreview.value = $event : null),
          title: "策略执行预览",
          width: "80%"
        }, {
          default: withCtx(() => [
            createVNode(StrategyExecutionPreview, {
              orchestration: unref(currentOrchestration),
              onClose: _cache[5] || (_cache[5] = ($event) => showPreview.value = false)
            }, null, 8, ["orchestration"])
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(ShapeSelectorPopup, {
          visible: unref(showComponentMenuFlag),
          position: unref(componentMenuPosition),
          components: unref(getCommonComponents)(),
          "get-fill": unref(getNodeFillColor),
          "get-stroke": unref(getNodeStrokeColor),
          onSelect: unref(selectComponent)
        }, null, 8, ["visible", "position", "components", "get-fill", "get-stroke", "onSelect"])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
