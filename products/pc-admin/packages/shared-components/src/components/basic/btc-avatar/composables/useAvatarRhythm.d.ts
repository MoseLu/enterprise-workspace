/**
 * 头像律动效果 Composable
 * 摇滚风格：强烈对比、急促节奏、随机爆发
 */
import type { Ref } from 'vue';
export declare function useAvatarRhythm(containerRef: Ref<HTMLElement | null>): {
    startRhythm: () => void;
    stopRhythm: () => void;
    updateColors: () => void;
    triggerBurst: () => void;
};
