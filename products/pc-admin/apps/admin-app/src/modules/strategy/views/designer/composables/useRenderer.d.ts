import type { NodeGeometry } from './useGeometryState';
export declare function useRenderer(geomMap: Map<string, NodeGeometry>, getViewportScale: () => number): {
    renderScene: () => void;
    renderNode: (id: string, geom: NodeGeometry) => void;
    renderOverlays: (id: string, geom: NodeGeometry) => void;
};
