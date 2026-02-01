/**
 * 国际化类型定义
 */
/** 支持的语言类型 */
export type AppLocale = 'zh-CN' | 'en-US';
/**
 * 全局通用词条类型
 * 所有应用共享的通用词条（如按钮文案、布局文案等）
 */
export interface GlobalLocaleMessages {
    common: {
        button: {
            confirm: string;
            cancel: string;
            save: string;
            delete: string;
            search: string;
            reset: string;
            add: string;
            edit: string;
            refresh: string;
            submit: string;
            back: string;
            close: string;
            export: string;
            custom: string;
            sort: string;
        };
        refresh: string;
        refresh_success: string;
        fullscreen: string;
        exit_fullscreen: string;
        profile: string;
        settings: string;
        logout: string;
        logout_confirm: string;
        logout_success: string;
        tip: string;
        close_current: string;
        close_other: string;
        close_all: string;
        close_left: string;
        close_right: string;
        pin: string;
        unpin: string;
        search_menu: string;
        global_search_placeholder: string;
        no_search_results: string;
        try_different_keywords: string;
        recent_searches: string;
        quick_access: string;
        menu_items: string;
        pages: string;
        documents: string;
        menu: string;
        page: string;
        document: string;
        parent_menu: string;
        route: string;
        navigate: string;
        select: string;
        close: string;
        cancel: string;
        clear_search: string;
        login: string;
    };
    layout: {
        header: string;
        sidebar: string;
        content: string;
    };
    app: {
        title: string;
        slogan: string;
    };
}
/**
 * 子应用词条扩展类型
 * 子应用通过泛型参数 T 扩展自己的业务词条
 */
export type AppLocaleMessages<T = Record<string, never>> = GlobalLocaleMessages & T;
//# sourceMappingURL=types.d.ts.map