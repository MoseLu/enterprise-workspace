import { ref, type Ref } from 'vue';
import type { NodeType } from '@/types/strategy';

// 节点几何状态类型
export interface NodeGeometry {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // 弧度
  type: NodeType;
  _drag?: { startX: number; startY: number; ox: number; oy: number };
  _resize?: { direction: string; startX: number; startY: number; ow: number; oh: number; ox: number; oy: number };
}

// RAF渲染调度器
let needsRender = false;
let rafId: number | null = null;
let renderSceneCallback: (() => void) | null = null;

export function useGeometryState() {
  const geomMap = new Map<string, NodeGeometry>();

  function scheduleRender() {
    if (needsRender) return;
    needsRender = true;
    rafId = requestAnimationFrame(() => {
      needsRender = false;
      if (renderSceneCallback) {
        renderSceneCallback();
      }
    });
  }

  function setRenderCallback(callback: () => void) {
    renderSceneCallback = callback;
  }

  function addNode(node: any) {
    const geom: NodeGeometry = {
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      width: node.style?.width || 120,
      height: node.style?.height || 60,
      rotation: 0,
      type: node.type
    };
    geomMap.set(node.id, geom);
    
    scheduleRender();
  }

  function updateNode(node: any) {
    const geom = geomMap.get(node.id);
    if (!geom) return;

    geom.x = node.position.x;
    geom.y = node.position.y;
    geom.width = node.style?.width || 120;
    geom.height = node.style?.height || 60;
    geom.type = node.type;

    scheduleRender();
  }

  function removeNode(nodeId: string) {
    geomMap.delete(nodeId);
    scheduleRender();
  }

  function getNodeGeometry(nodeId: string): NodeGeometry | undefined {
    return geomMap.get(nodeId);
  }

  function commitGeometryToStore(geom: NodeGeometry, nodes: Ref<any[]>) {
    const node = nodes.value.find(n => n.id === geom.id);
    if (node) {
      node.position.x = geom.x;
      node.position.y = geom.y;
      if (node.style) {
        node.style.width = geom.width;
        node.style.height = geom.height;
      }
    }
  }

  function applyResizeDelta(geom: NodeGeometry, dx: number, dy: number) {
    if (!geom._resize) return;

    const { direction, ow, oh, ox, oy } = geom._resize;
    const minSize = 40; // 最小尺寸

    switch (direction) {
      case 'top':
        geom.height = Math.max(minSize, oh - dy);
        geom.y = oy + (oh - geom.height);
        break;
      case 'top-right':
        geom.width = Math.max(minSize, ow + dx);
        geom.height = Math.max(minSize, oh - dy);
        geom.y = oy + (oh - geom.height);
        break;
      case 'right':
        geom.width = Math.max(minSize, ow + dx);
        break;
      case 'bottom-right':
        geom.width = Math.max(minSize, ow + dx);
        geom.height = Math.max(minSize, oh + dy);
        break;
      case 'bottom':
        geom.height = Math.max(minSize, oh + dy);
        break;
      case 'bottom-left':
        geom.width = Math.max(minSize, ow - dx);
        geom.height = Math.max(minSize, oh + dy);
        geom.x = ox + (ow - geom.width);
        break;
      case 'left':
        geom.width = Math.max(minSize, ow - dx);
        geom.x = ox + (ow - geom.width);
        break;
      case 'top-left':
        geom.width = Math.max(minSize, ow - dx);
        geom.height = Math.max(minSize, oh - dy);
        geom.x = ox + (ow - geom.width);
        geom.y = oy + (oh - geom.height);
        break;
    }
  }

  function getHandleLocalPositions(geom: NodeGeometry): [number, number][] {
    const { width, height } = geom;
    return [
      [width / 2, 0],           // top
      [width, 0],               // top-right
      [width, height / 2],      // right
      [width, height],          // bottom-right
      [width / 2, height],      // bottom
      [0, height],              // bottom-left
      [0, height / 2],          // left
      [0, 0]                    // top-left
    ];
  }

  function cleanup() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    needsRender = false;
    renderSceneCallback = null;
  }

  return {
    geomMap,
    scheduleRender,
    setRenderCallback,
    addNode,
    updateNode,
    removeNode,
    getNodeGeometry,
    commitGeometryToStore,
    applyResizeDelta,
    getHandleLocalPositions,
    cleanup
  };
}
