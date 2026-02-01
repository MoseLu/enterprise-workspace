import { ref, computed, watch, type Ref } from 'vue';
import { useI18n } from '@btc/shared-core';

/**
 * 文本编辑逻辑
 */
export function useTextEditor(
  nodes: Ref<any[]>,
  selectedNodeId: Ref<string>,
  canvasScale: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  canvasDimensions: Ref<{ width: number; height: number }>,
  dragState: { isDragging: Ref<boolean>; maybeDrag: Ref<boolean> },
  getNodeText: (type: string) => string
) {
  // 文本编辑状态
  const editingNodeId = ref<string | null>(null);
  const editingNodeIdString = computed<string>(() => editingNodeId.value ?? '');
  const editingText = ref<string>('');
  const isOverlayEditing = ref(false);

  // 节点文本配置（全局默认值）
  const defaultTextConfig = {
    fontSize: 16, // 默认字体大小
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal'
  };

  const { t } = useI18n();
  // 字体族选项
  const fontFamilyOptions = [
    { label: t('common.strategy.designer.font_family.system_default'), value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    { label: t('common.strategy.designer.font_family.monospace'), value: "'Courier New', 'Monaco', 'Menlo', monospace" },
    { label: t('common.strategy.designer.font_family.serif'), value: "'Times New Roman', 'Times', serif" },
    { label: t('common.strategy.designer.font_family.rounded'), value: "'Comic Sans MS', 'Chalkboard', cursive" },
    { label: t('common.strategy.designer.font_family.bold'), value: "'Impact', 'Arial Black', sans-serif" },
    { label: 'Microsoft YaHei', value: "'Microsoft YaHei', sans-serif" },
    { label: 'SimSun', value: "'SimSun', serif" },
    { label: 'SimHei', value: "'SimHei', sans-serif" }
  ];

  // 获取字体族的友好标签
  const getFontFamilyLabel = (fontFamily: string) => {
    const option = fontFamilyOptions.find(opt => opt.value === fontFamily);
    return option ? option.label : fontFamily;
  };

  // 当前选中节点的文本配置
  const nodeTextConfig = ref({ ...defaultTextConfig });

  // 更新选中节点的文本配置
  const updateNodeTextConfig = () => {
    if (selectedNodeId.value) {
      const selectedNode = nodes.value.find(node => node.id === selectedNodeId.value);
      if (selectedNode) {
        // 更新节点的文本配置
        if (!selectedNode.textConfig) {
          selectedNode.textConfig = {};
        }
        selectedNode.textConfig = { ...nodeTextConfig.value };
      }
    }
  };

  // 监听文本配置变化，自动更新选中节点
  watch(nodeTextConfig, () => {
    updateNodeTextConfig();
  }, { deep: true });

  // 覆盖编辑器：定位函数（将 SVG 文本盒转换为屏幕像素）
  // 基于画布 CSS transform（pan/zoom）计算屏幕坐标，避免 getScreenCTM 忽略 CSS 变换的问题
  function getScreenBoxForNodeText(nodeId: string) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (!node) return null;
    const svg = document.querySelector('.strategy-canvas') as SVGSVGElement | null;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = canvasScale.value ?? 1;
    const panXVal = panX.value ?? 0;
    const panYVal = panY.value ?? 0;

    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    // 文本位于几何中心（x=width/2,y=height/2, dominant-baseline=middle）
    const centerX = rect.left + panXVal + scale * (node.position.x + nodeWidth / 2);
    const centerY = rect.top + panYVal + scale * (node.position.y + nodeHeight / 2);

    // 返回中心点坐标与节点尺寸（供对齐与宽度约束用）
    const textEl = document.querySelector(`[data-node-id="${nodeId}"] text.node-text`) as SVGTextElement | null;
    return { centerX, centerY, nodeWidth, nodeHeight, scale, textEl };
  }

  // 覆盖编辑器：打开
  function openOverlayTextEditor(node: any) {
    // 暂停拖拽
    dragState.isDragging.value = false;
    dragState.maybeDrag.value = false;
    isOverlayEditing.value = true;
    editingNodeId.value = node.id;

    // 计算屏幕盒
    const box = getScreenBoxForNodeText(node.id);
    if (!box || !box.textEl) return;

    // 隐藏显示态文本，避免重影（若可获取）
    let oldOpacity = '';
    if (box.textEl) {
      oldOpacity = box.textEl.style.opacity;
      box.textEl.style.opacity = '0';
    }

    // 创建 textarea 到覆盖层
    const layer = document.getElementById('text-editor-layer');
    if (!layer) return;
    // 创建 contenteditable 覆盖编辑器
    const editor = document.createElement('div');
    editor.className = 'overlay-contenteditable-editor';
    editor.setAttribute('contenteditable', 'true');

    // 字体与颜色匹配 SVG
    const computedFontFamily = box.textEl?.getAttribute('font-family') || 'system-ui, -apple-system, Segoe UI, sans-serif';
    const computedFontSize = box.textEl?.getAttribute('font-size') || '14px';
    const fontSizePx = typeof computedFontSize === 'string' ? computedFontSize : `${computedFontSize}px`;

    // 以中心点作为定位锚点，结合 translate(-50%,-50%) 做几何居中
    Object.assign(editor.style, {
      position: 'fixed',
      zIndex: '1005',
      left: `${box.centerX}px`,
      top: `${box.centerY}px`,
      margin: '0',
      padding: '0',
      border: '1px solid transparent',
      outline: 'none',
      background: 'transparent',
      overflow: 'hidden',
      userSelect: 'text',
      transformOrigin: '0 0',
    } as CSSStyleDeclaration);

    // 根据 anchor/baseline 计算对齐补偿（百分比）
    const anchor = box.textEl?.getAttribute('text-anchor') || 'start';
    const baseline = box.textEl?.getAttribute('dominant-baseline') || 'text-before-edge';
    let txPct = 0;
    if (anchor === 'middle') txPct = -50; else if (anchor === 'end') txPct = -100;
    let tyPct = 0;
    if (baseline === 'middle' || baseline === 'central') tyPct = -50; else tyPct = -50; // 统一用-50%垂直居中以贴合 draw.io
    // text-before-edge 等顶部参考使用 0

    // 位置已包含 pan/zoom，因此 transform 只做锚点补偿（不再重复缩放）
    editor.style.transform = `scale(${box.scale}) translate(${txPct}%, ${tyPct}%)`;

    // 字体度量（与 SVG 一致）
    editor.style.fontFamily = computedFontFamily;
    editor.style.fontSize = fontSizePx;
    editor.style.lineHeight = '1.2'; // 与示例一致
    editor.style.letterSpacing = '0';
    editor.style.color = box.textEl?.getAttribute('fill') || '#000';
    editor.style.textAlign = anchor === 'middle' ? 'center' : (anchor === 'end' ? 'right' : 'left');
    editor.style.whiteSpace = 'normal';
    editor.style.overflowWrap = 'normal';
    editor.style.minHeight = '1em';
    editor.style.maxWidth = `${Math.max(120, Math.min(330, box.nodeWidth * box.scale * 1.65))}px`;

    // 初始值
    const currentText = (node.text && node.text.toString().trim() !== '') ? node.text : getNodeText(node.type);
    editor.textContent = currentText;
    editingText.value = currentText;
    layer.appendChild(editor);

    // 提交/取消
    const commit = () => {
      const v = (editor.textContent ?? '').toString();
      const trimmed = v.trim();
      node.text = trimmed === '' ? undefined : v;
      finishTextEditing();
      cleanup();
    };
    const cancel = () => {
      cleanup();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    };
    const onBlur = () => commit();

    function cleanup() {
      editor.removeEventListener('keydown', onKey);
      editor.removeEventListener('blur', onBlur);
      editor.remove();
      if (box && box.textEl) box.textEl.style.opacity = oldOpacity || '1';
      isOverlayEditing.value = false;
      editingNodeId.value = null;
      editingText.value = '';
    }

    editor.addEventListener('keydown', onKey);
    editor.addEventListener('blur', onBlur);
    editor.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    editor.addEventListener('click', (e) => { e.stopPropagation(); });
    editor.addEventListener('dblclick', (e) => { e.stopPropagation(); });
    editor.addEventListener('keydown', (e) => { e.stopPropagation(); });

    // 聚焦并全选
    editor.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(editor);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
      // 忽略错误，静默处理
    }
  }

  // 节点双击处理 - 进入文本编辑模式
  const handleNodeDoubleClick = (node: any, event?: MouseEvent) => {
    event?.stopPropagation();
    event?.preventDefault(); // 阻止默认行为

    // 使用覆盖编辑器
    openOverlayTextEditor(node);
  };

  // 完成文本编辑
  const finishTextEditing = () => {
    if (editingNodeId.value) {
      const selectedNode = nodes.value.find(node => node.id === editingNodeId.value);
      if (selectedNode) {
        // 更新节点文本
        selectedNode.text = editingText.value;
      }
    }

    // 清除编辑状态
    editingNodeId.value = null;
    editingText.value = '';
  };

  // 处理文本编辑键盘事件
  const handleTextEditKeyDown = (event: KeyboardEvent) => {
    if (editingNodeId.value) {
      if (event.key === 'Enter') {
        event.preventDefault();
        finishTextEditing();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        // 取消文本编辑
        editingNodeId.value = null;
        editingText.value = '';
      }
    }
  };

  // 取消文本编辑
  const cancelTextEditing = () => {
    // 清除编辑状态
    editingNodeId.value = null;
    editingText.value = '';
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

