/**
 * SVG工具函数：计算最大内接矩形
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 解析SVG路径数据为点数组
 */
export function parsePathData(pathData: string): Point[] {
  const points: Point[] = [];
  const commands = pathData.match(/[ML][\d.\s,]+/g) || [];
  
  let currentX = 0;
  let currentY = 0;

  commands.forEach((cmd) => {
    const type = cmd[0];
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (type === 'M' && coords.length >= 2) {
      const x = coords[0];
      const y = coords[1];
      if (x !== undefined && y !== undefined) {
        currentX = x;
        currentY = y;
        points.push({ x: currentX, y: currentY });
      }
    } else if (type === 'L' && coords.length >= 2) {
      const x = coords[0];
      const y = coords[1];
      if (x !== undefined && y !== undefined) {
        currentX = x;
        currentY = y;
        points.push({ x: currentX, y: currentY });
      }
    }
  });

  return points;
}

/**
 * 计算两个线段的交点
 */
export function lineIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;
  const x3 = p3.x;
  const y3 = p3.y;
  const x4 = p4.x;
  const y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null; // 平行线

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    };
  }

  return null;
}

/**
 * 计算两个路径的交点
 */
export function pathIntersection(
  path1: SVGPathElement,
  path2: SVGPathElement
): Point | null {
  const pathData1 = path1.getAttribute('d') || '';
  const pathData2 = path2.getAttribute('d') || '';

  const points1 = parsePathData(pathData1);
  const points2 = parsePathData(pathData2);

  // 查找交点
  for (let i = 0; i < points1.length - 1; i++) {
    for (let j = 0; j < points2.length - 1; j++) {
      const p1 = points1[i];
      const p2 = points1[i + 1];
      const p3 = points2[j];
      const p4 = points2[j + 1];
      if (p1 && p2 && p3 && p4) {
        const intersection = lineIntersection(p1, p2, p3, p4);
        if (intersection) {
          return intersection;
        }
      }
    }
  }

  return null;
}

/**
 * 检查点是否在多边形内（射线法）
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;
    const xi = pi.x;
    const yi = pi.y;
    const xj = pj.x;
    const yj = pj.y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * 计算多边形的边界框
 */
export function polygonBoundingBox(polygon: Point[]): Rectangle {
  if (polygon.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const firstPoint = polygon[0];
  if (!firstPoint) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = firstPoint.x;
  let minY = firstPoint.y;
  let maxX = firstPoint.x;
  let maxY = firstPoint.y;

  polygon.forEach((p) => {
    if (p) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * 计算最大内接矩形（简化版本）
 * 基于路径的边界框和交点计算
 */
export function calculateLargestInscribedRectangle(
  paths: SVGPathElement[],
  viewBoxWidth: number,
  viewBoxHeight: number,
  excludeRectangles?: Rectangle[] // 需要排除的矩形区域（如 QA logo）
): Rectangle | null {
  if (paths.length === 0) return null;

  // 找到左上角layer-1和layer-3的交点作为起点
  const topLeftLayer1 = paths.find(
    (p) => p.classList.contains('layer-1') && p.closest('.top-left')
  );
  const topLeftLayer3 = paths.find(
    (p) => p.classList.contains('layer-3') && p.closest('.top-left')
  );

  if (!topLeftLayer1 || !topLeftLayer3) return null;

  // 计算交点
  // 左上角layer-1的右下边缘：从(0, 20vh)到(40vw, 0)
  // 左上角layer-3的右下边缘：从(8vw, 0)到(0, 75vh)
  // 解方程：20vh - (20vh/40vw) * x = 75vh * (1 - x/8vw)
  // 20vh - (20vh/40vw) * x = 75vh - (75vh/8vw) * x
  // (75vh/8vw - 20vh/40vw) * x = 75vh - 20vh = 55vh
  // x = 55vh / (75vh/8vw - 20vh/40vw) = 55vh / (9.375vh/vw - 0.5vh/vw) = 55vh / (8.875vh/vw) = 55vw / 8.875
  
  // 直接使用数学公式计算交点，更准确
  const vw = viewBoxWidth / 100;
  const vh = viewBoxHeight / 100;
  
  // layer-1的右下边缘方程：y = 20vh - (20vh/40vw) * x
  // layer-3的右下边缘方程：y = 75vh * (1 - x/8vw) = 75vh - (75vh/8vw) * x
  // 解方程求交点
  const intersectX = (55 / 8.875) * vw;
  const intersectY = 20 * vh * (1 - intersectX / (40 * vw));
  
  const intersection = {
    x: intersectX,
    y: intersectY,
  };

  // 计算右上角和右下角的边界
  // 右上角layer-1的斜边：从(viewBoxWidth - 16vw, 0)到(viewBoxWidth, 70vh)
  // 斜边方程：y = 70vh * ((x - (viewBoxWidth - 16vw)) / 16vw)
  // 当 y = intersection.y 时，求 x：
  // intersection.y = 70vh * ((x - (viewBoxWidth - 16vw)) / 16vw)
  // x - (viewBoxWidth - 16vw) = intersection.y * 16vw / 70vh
  // x = viewBoxWidth - 16vw + intersection.y * 16vw / 70vh
  const rightX = viewBoxWidth - 16 * vw + (intersection.y * 16 * vw) / (70 * vh);
  
  // 右下角layer-1的斜边：从(viewBoxWidth - 20vw, viewBoxHeight)到(viewBoxWidth, viewBoxHeight - 30vh)
  // 斜边方程：y = viewBoxHeight - 30vh * ((x - (viewBoxWidth - 20vw)) / 20vw)
  // 当 x = rightX 时，求 y：
  let bottomY = viewBoxHeight - 30 * vh * ((rightX - (viewBoxWidth - 20 * vw)) / (20 * vw));
  let bottomX = rightX;

  // 如果提供了需要排除的矩形区域，调整右下角位置以避免重叠
  if (excludeRectangles && excludeRectangles.length > 0) {
    // 检查右下角是否与排除区域重叠
    for (const excludeRect of excludeRectangles) {
      // 如果右下角在排除区域内，向上移动
      if (
        bottomX >= excludeRect.x &&
        bottomX <= excludeRect.x + excludeRect.width &&
        bottomY >= excludeRect.y &&
        bottomY <= excludeRect.y + excludeRect.height
      ) {
        // 将 bottomY 调整为排除区域的上边缘
        bottomY = excludeRect.y;
        // 重新计算 bottomX，确保在斜边上
        // 从 bottomY 反推 x：bottomY = viewBoxHeight - 30vh * ((x - (viewBoxWidth - 20vw)) / 20vw)
        // (viewBoxHeight - bottomY) / 30vh = (x - (viewBoxWidth - 20vw)) / 20vw
        // x = (viewBoxWidth - 20vw) + 20vw * (viewBoxHeight - bottomY) / 30vh
        bottomX = (viewBoxWidth - 20 * vw) + 20 * vw * ((viewBoxHeight - bottomY) / (30 * vh));
        // 确保 bottomX 不超过排除区域的左边缘
        if (bottomX > excludeRect.x + excludeRect.width) {
          bottomX = excludeRect.x + excludeRect.width;
          // 重新计算 bottomY
          bottomY = viewBoxHeight - 30 * vh * ((bottomX - (viewBoxWidth - 20 * vw)) / (20 * vw));
        }
      }
      // 如果右下角的 x 坐标在排除区域内，向左移动
      else if (
        bottomX >= excludeRect.x &&
        bottomX <= excludeRect.x + excludeRect.width &&
        bottomY < excludeRect.y + excludeRect.height
      ) {
        // 将 bottomX 调整为排除区域的左边缘
        bottomX = excludeRect.x;
        // 重新计算 bottomY
        bottomY = viewBoxHeight - 30 * vh * ((bottomX - (viewBoxWidth - 20 * vw)) / (20 * vw));
      }
    }
  }

  // 计算最大内接矩形
  // 矩形的四个顶点：
  // 左上角：intersection (intersection.x, intersection.y)
  // 右上角：(rightX, intersection.y)
  // 右下角：(bottomX, bottomY)
  // 左下角：需要计算，向左移动相同的宽度
  const width = rightX - intersection.x;
  const height = bottomY - intersection.y;

  // 返回矩形（使用左上角和宽度高度）
  return {
    x: intersection.x,
    y: intersection.y,
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

/**
 * 将矩形转换为SVG path字符串
 */
export function rectangleToPath(rect: Rectangle): string {
  return `M ${rect.x} ${rect.y} L ${rect.x + rect.width} ${rect.y} L ${rect.x + rect.width} ${rect.y + rect.height} L ${rect.x} ${rect.y + rect.height} Z`;
}

/**
 * 将矩形转换为CSS clip-path格式
 */
export function rectangleToClipPath(rect: Rectangle, containerWidth: number, containerHeight: number): string {
  const xPercent = (rect.x / containerWidth) * 100;
  const yPercent = (rect.y / containerHeight) * 100;
  const widthPercent = (rect.width / containerWidth) * 100;
  const heightPercent = (rect.height / containerHeight) * 100;

  return `polygon(${xPercent}% ${yPercent}%, ${xPercent + widthPercent}% ${yPercent}%, ${xPercent + widthPercent}% ${yPercent + heightPercent}%, ${xPercent}% ${yPercent + heightPercent}%)`;
}

