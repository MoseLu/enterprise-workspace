var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * 系统设置配置统一导出
 */
import { themeConfig } from './theme';
import { menuConfig } from './menu';
import { layoutConfig } from './layout';
import { uiConfig } from './ui';
/**
 * 系统设置配置
 * 整合所有子配置
 */
export var systemSettingConfig = __assign(__assign(__assign(__assign({}, themeConfig), menuConfig), layoutConfig), uiConfig);
// 导出子配置（便于单独使用）
export { themeConfig, menuConfig, layoutConfig, uiConfig };
