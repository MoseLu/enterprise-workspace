/**
 * 系统基础信息配置
 */
export declare const appConfig: {
    name: string;
    shortName: string;
    enName: string;
    version: string;
    logo: string;
    favicon: string;
    company: {
        name: string;
        fullName: string;
        fullNameCn: string;
        fullNameEn: string;
        website: string;
        sloganKey: string;
    };
    copyright: {
        year: number;
        text: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
    };
    loading: {
        title: string;
        subTitle: string;
    };
    router: {
        mode: string;
        transition: string;
    };
    layout: {
        sidebarWidth: number;
        sidebarCollapseWidth: number;
        topbarHeight: number;
        tabbarHeight: number;
    };
    systemSetting: {
        defaultTabStyle: "tab-default";
        defaultPageTransition: "slide-left";
        defaultShowWorkTab: boolean;
        defaultUniqueOpened: boolean;
        defaultShowGlobalSearch: boolean;
        defaultShowCrumbs: boolean;
        defaultColorWeak: boolean;
        defaultContainerWidth: "full";
        defaultBoxBorderMode: boolean;
        defaultCustomRadius: string;
        defaultMenuType: "left";
        defaultMenuWidth: number;
        defaultSystemThemeType: "auto";
        defaultSystemThemeColor: string;
        defaultMenuTheme: import("../plugins/user-setting/config/enums").MenuThemeEnum;
    };
};
export default appConfig;
