export declare function useBrowser(): {
    browser: {
        width: number;
        screen: "xs" | "sm" | "md" | "xl" | "full";
        isMini: boolean;
    };
    onScreenChange(ev: () => void, immediate?: boolean): void;
};
