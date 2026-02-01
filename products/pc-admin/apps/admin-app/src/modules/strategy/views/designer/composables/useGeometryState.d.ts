import { type Ref } from 'vue';
import type { NodeType } from '@/types/strategy';
export interface NodeGeometry {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    type: NodeType;
    _drag?: {
        startX: number;
        startY: number;
        ox: number;
        oy: number;
    };
    _resize?: {
        direction: string;
        startX: number;
        startY: number;
        ow: number;
        oh: number;
        ox: number;
        oy: number;
    };
}
export declare function useGeometryState(): {
    geomMap: Map<string, NodeGeometry>;
    scheduleRender: () => void;
    setRenderCallback: (callback: () => void) => void;
    addNode: (node: any) => void;
    updateNode: (node: any) => void;
    removeNode: (nodeId: string) => void;
    getNodeGeometry: (nodeId: string) => NodeGeometry | undefined;
    commitGeometryToStore: (geom: NodeGeometry, nodes: Ref<any[]>) => void;
    applyResizeDelta: (geom: NodeGeometry, dx: number, dy: number) => void;
    getHandleLocalPositions: (geom: NodeGeometry) => [number, number][];
    cleanup: () => void;
};
