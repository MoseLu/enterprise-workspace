/**
 * 设置处理器
 * 提供所有设置的变更处理方法
 */
import { BoxStyleType, ContainerWidthEnum } from '../config/enums';
import type { SystemThemeEnum, MenuThemeEnum, MenuTypeEnum } from '../config/enums';
/**
 * 设置处理器组合式函数
 */
export declare function useSettingsHandlers(): {
    domOperations: {
        setHtmlClass: (className: string, add: boolean) => void;
        setRootAttribute: (attribute: string, value: string) => void;
        setBodyClass: (className: string, add: boolean) => void;
    };
    basicHandlers: {
        workTab: (value?: boolean) => void;
        uniqueOpened: (value?: boolean) => void;
        globalSearch: (value?: boolean) => void;
        crumbs: (value?: boolean) => void;
        colorWeak: (value?: boolean) => void;
        menuOpenWidth: (value: number) => void;
        tabStyle: (value: string) => void;
        pageTransition: (value: string) => void;
        customRadius: (value: string) => void;
    };
    boxStyleHandlers: {
        setBoxMode: (type: BoxStyleType) => void;
    };
    colorHandlers: {
        selectColor: (color: string) => void;
    };
    containerHandlers: {
        setWidth: (type: ContainerWidthEnum) => void;
    };
    themeStyleHandlers: {
        switchTheme: (theme: SystemThemeEnum) => void;
    };
    menuLayoutHandlers: {
        switchLayout: (layout: MenuTypeEnum) => void;
    };
    menuStyleHandlers: {
        switchStyle: (style: MenuThemeEnum) => void;
    };
};
