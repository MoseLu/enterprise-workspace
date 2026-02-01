export declare function useUserInfo(): {
    profileUserInfo: globalThis.Ref<any, any>;
    displayedName: any;
    isTyping: globalThis.Ref<boolean, boolean>;
    cursorPosition: globalThis.Ref<number, number>;
    userInfo: globalThis.ComputedRef<{
        name: any;
        position: any;
        avatar: any;
    }>;
    loadProfileInfo: () => Promise<void>;
    handleNameHover: () => void;
    handleNameLeave: () => void;
};
