import type { NodeGeometry } from './useGeometryState';

export function useRenderer(geomMap: Map<string, NodeGeometry>, getViewportScale: () => number) {

  function renderNode(id: string, geom: NodeGeometry) {
    const el = document.querySelector(`[data-node-id="${id}"]`) as SVGGElement;
    if (!el) {
      return;
    }


    // 更新节点位置和旋转 - 这是最重要的，确保拖拽时实时更新
    el.setAttribute('transform', `translate(${geom.x},${geom.y}) rotate(${geom.rotation * 180 / Math.PI})`);

    // 更新节点尺寸
    const rect = el.querySelector('.node-rect') as SVGRectElement;
    if (rect) {
      rect.setAttribute('width', geom.width.toString());
      rect.setAttribute('height', geom.height.toString());
    }

    // 更新圆形节点
    const circle = el.querySelector('circle') as SVGCircleElement;
    if (circle) {
      const radius = Math.min(geom.width, geom.height) / 2 - 2;
      circle.setAttribute('r', radius.toString());
      circle.setAttribute('cx', (geom.width / 2).toString());
      circle.setAttribute('cy', (geom.height / 2).toString());
    }

    // 更新菱形节点
    const path = el.querySelector('path') as SVGPathElement;
    if (path) {
      const diamondPath = `M ${geom.width / 2} 0 L ${geom.width} ${geom.height / 2} L ${geom.width / 2} ${geom.height} L 0 ${geom.height / 2} Z`;
      path.setAttribute('d', diamondPath);
    }

    // 更新文本位置
    const text = el.querySelector('.node-text') as SVGTextElement;
    if (text) {
      text.setAttribute('x', (geom.width / 2).toString());
      text.setAttribute('y', (geom.height / 2).toString());
    }

    // 更新foreignObject尺寸
    const foreignObject = el.querySelector('foreignObject') as SVGForeignObjectElement;
    if (foreignObject) {
      foreignObject.setAttribute('width', geom.width.toString());
      foreignObject.setAttribute('height', geom.height.toString());
    }
  }

  function renderOverlays(id: string, geom: NodeGeometry) {
    // 安全获取缩放值，避免 NaN
    const zoom = getViewportScale() || 1;
    const invZoom = 1 / zoom;


    // 更新8个手柄 - 现在在overlay层中
    const handles = document.querySelectorAll(`[data-overlay-id="${id}"] .resize-handle`);
    if (handles.length === 0) return; // 元素尚未渲染，跳过

    const handlePositions = getHandleLocalPositions(geom);
    handles.forEach((handle, i) => {
      if (i < handlePositions.length) {
        const [lx, ly] = handlePositions[i];
        // 直接计算世界坐标，不经过矩阵变换
        const worldX = geom.x + lx;
        const worldY = geom.y + ly;
        const g = handle.parentElement;
        if (g && g instanceof SVGGElement && !isNaN(worldX) && !isNaN(worldY) && !isNaN(invZoom)) {
          g.setAttribute('transform', `translate(${worldX},${worldY}) scale(${invZoom})`);
        }
      }
    });

    // 更新虚线框 - 现在在overlay层中
    const boundaryBox = document.querySelector(`[data-overlay-id="${id}"] .boundary-box`) as SVGRectElement;
    if (boundaryBox) {
      const boxG = boundaryBox.parentElement;
      if (boxG && boxG instanceof SVGGElement && !isNaN(geom.x) && !isNaN(geom.y)) {
        boxG.setAttribute('transform', `translate(${geom.x},${geom.y}) rotate(${geom.rotation * 180 / Math.PI})`);
      }
      boundaryBox.setAttribute('width', geom.width.toString());
      boundaryBox.setAttribute('height', geom.height.toString());
    }

    // 更新4个箭头 - 现在在overlay层中，应用 transform 到 <g class="arrow-group">
    const arrowGroups = document.querySelectorAll(`[data-overlay-id="${id}"] .arrow-group`);
    const arrowMids = [
      [geom.width/2, 0, -90],   // top
      [geom.width, geom.height/2, 0],    // right
      [geom.width/2, geom.height, 90],   // bottom
      [0, geom.height/2, 180]            // left
    ];
    arrowGroups.forEach((arrowGroup, i) => {
      if (i < arrowMids.length) {
        const [lx, ly, ang] = arrowMids[i];
        // 直接计算世界坐标
        const worldX = geom.x + lx;
        const worldY = geom.y + ly;
        const worldDeg = ang + (geom.rotation * 180 / Math.PI);
        if (!isNaN(worldX) && !isNaN(worldY) && !isNaN(worldDeg) && !isNaN(invZoom)) {
          (arrowGroup as SVGGElement).setAttribute('transform',
            `translate(${worldX},${worldY}) rotate(${worldDeg}) scale(${invZoom})`
          );
        }
      }
    });
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

  function renderScene() {
    geomMap.forEach((geom, id) => {
      renderNode(id, geom);
      renderOverlays(id, geom);
    });
  }

  return { renderScene, renderNode, renderOverlays };
}
