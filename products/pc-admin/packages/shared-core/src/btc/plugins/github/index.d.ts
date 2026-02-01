import type { Plugin } from 'vue';
/**
 * GitHub鎻掍欢API鎺ュ彛
 */
export interface GitHubPlugin {
    /**
     * 鎵撳紑GitHub浠撳簱
     * @param url GitHub浠撳簱鍦板潃
     */
    openRepository: (url?: string) => void;
}
/**
 * 鍒涘缓GitHub鎻掍欢
 */
export declare function createGitHubPlugin(): Plugin & {
    github: GitHubPlugin;
};
/**
 * 缁勫悎寮?API锛氫娇鐢℅itHub鎻掍欢
 */
export declare function useGitHubPlugin(): GitHubPlugin;
//# sourceMappingURL=index.d.ts.map