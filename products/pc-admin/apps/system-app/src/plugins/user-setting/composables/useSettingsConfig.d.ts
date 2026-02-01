/**
 * 设置配置管理
 * 提供所有设置选项的配置
 */
/**
 * 设置配置管理组合式函数
 */
export declare function useSettingsConfig(): {
    themeList: globalThis.ComputedRef<{
        name: any;
        theme: any;
        color: string[];
        leftLineColor: string;
        rightLineColor: string;
        img: any;
    }[]>;
    menuLayoutList: globalThis.ComputedRef<{
        name: any;
        value: any;
        img: any;
    }[]>;
    menuStyleList: globalThis.ComputedRef<{
        theme: any;
        background: string;
        systemNameColor: string;
        iconColor: string;
        textColor: string;
        textActiveColor: string;
        iconActiveColor: string;
        tabBarBackground: string;
        systemBackground: string;
        leftLineColor: string;
        rightLineColor: string;
        img: any;
    }[]>;
    mainColors: globalThis.ComputedRef<any>;
    configOptions: {
        themeList: {
            name: any;
            theme: any;
            color: string[];
            leftLineColor: string;
            rightLineColor: string;
            img: any;
        }[];
        menuLayoutList: {
            name: any;
            value: any;
            img: any;
        }[];
        menuStyleList: {
            theme: any;
            background: string;
            systemNameColor: string;
            iconColor: string;
            textColor: string;
            textActiveColor: string;
            iconActiveColor: string;
            tabBarBackground: string;
            systemBackground: string;
            leftLineColor: string;
            rightLineColor: string;
            img: any;
        }[];
        mainColors: any;
    };
    containerWidthOptions: globalThis.ComputedRef<{
        value: any;
        label: any;
        icon: string;
    }[]>;
    tabStyleOptions: globalThis.ComputedRef<{
        value: string;
        label: any;
    }[]>;
    pageTransitionOptions: globalThis.ComputedRef<{
        value: string;
        label: any;
    }[]>;
    customRadiusOptions: globalThis.ComputedRef<{
        value: string;
        label: any;
    }[]>;
    boxStyleOptions: globalThis.ComputedRef<{
        value: string;
        label: any;
        type: any;
    }[]>;
    basicSettingsConfig: globalThis.ComputedRef<({
        key: string;
        label: any;
        type: "switch";
        handler: string;
        mobileHide: boolean;
        min?: undefined;
        max?: undefined;
        step?: undefined;
        style?: undefined;
        controlsPosition?: undefined;
        options?: undefined;
    } | {
        key: string;
        label: any;
        type: "input-number";
        handler: string;
        min: number;
        max: number;
        step: number;
        style: {
            width: string;
        };
        controlsPosition: "right";
        mobileHide: boolean;
        options?: undefined;
    } | {
        key: string;
        label: any;
        type: "select";
        handler: string;
        options: {
            value: string;
            label: any;
        }[];
        style: {
            width: string;
        };
        mobileHide: boolean;
        min?: undefined;
        max?: undefined;
        step?: undefined;
        controlsPosition?: undefined;
    })[]>;
};
