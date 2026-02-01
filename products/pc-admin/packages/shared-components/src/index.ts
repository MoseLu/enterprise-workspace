// @btc/shared-components 入口文件

// 导入全局样式
import './styles/index.scss';

// 初始化全局事件系统
import './utils/resize';

// 注意：DevTools 不再在这里自动挂载
// 改为在应用级别的 bootstrap 中挂载：
// - layout-app: 在 initLayoutEnvironment 中挂载（供子应用使用）
// - system-app: 在 bootstrap 中挂载（供主应用使用）
// 这样可以避免多个应用重复挂载导致的问题

// 插件系统
import * as ExcelPlugin from './plugins/excel';
import * as CodePlugin from './plugins/code';

// 直接导入插件组件，避免解构赋值导致的初始化顺序问题
import BtcExportBtn from './plugins/excel/components/export-btn/index.vue';
import BtcImportBtn from './plugins/excel/components/import-btn/index.vue';

// 导入样式
import './components/feedback/btc-dialog/styles/index.scss';
import './components/form/btc-form/style.scss';
import './components/feedback/btc-message/styles.scss';
import './components/feedback/btc-notification/styles.scss';
import './components/basic/btc-icon-button/index.scss';
import './components/basic/btc-table-button/index.scss';
import './components/basic/btc-avatar/index.scss';

// 图表组件
export * from './charts';
// 显式导出 registerEChartsThemes 以确保类型定义正确
export { registerEChartsThemes } from './charts/utils/theme';

// 导入图表组件样式（必须在导出后导入，确保样式被正确提取）
// 注意：由于 cssCodeSplit: false，所有 CSS 会被合并到一个 style.css 文件中
import './charts/line/basic/styles/index.scss';
import './charts/bar/basic/styles/index.scss';
import './charts/bar/horizontal/styles/index.scss';
import './charts/bar/dual-compare/styles/index.scss';
import './charts/pie/basic/styles/index.scss';
import './charts/pie/ring/styles/index.scss';
import './charts/radar/basic/styles/index.scss';
import './charts/scatter/basic/styles/index.scss';
import './charts/kline/basic/styles/index.scss';

// 导出语言包供应用使用
export { default as sharedLocalesZhCN } from './locales/zh-CN.json';
export { default as sharedLocalesEnUS } from './locales/en-US.json';

// Basic 基础组件
export { default as BtcButton } from './components/basic/btc-button/index.vue';
export { default as BtcEmpty } from './components/basic/btc-empty/index.vue';
export { BtcIconButton } from './components/basic/btc-icon-button';
export { default as BtcTableButton } from './components/basic/btc-table-button/index.vue';
export { default as BtcAvatar } from './components/basic/btc-avatar';
export { default as BtcCard } from './components/basic/btc-card/index.vue';
export { default as BtcTag } from './components/basic/btc-tag/index.vue';
export { default as BtcCollapse } from './components/basic/btc-collapse/index.vue';
export { default as BtcCollapseItem } from './components/basic/btc-collapse/CollapseItem.vue';
export { default as BtcRow } from './components/basic/btc-row/index.vue';
export { default as BtcCol } from './components/basic/btc-col/index.vue';
export { default as BtcSplitter } from './components/basic/btc-splitter/index.vue';
export { default as BtcSplitterPanel } from './components/basic/btc-splitter/btc-splitter-panel.vue';
export { default as BtcImageContainer } from './components/basic/btc-image-container/index.vue';
export type { ImageItem, BtcImageContainerProps } from './components/basic/btc-image-container/types';
export { default as BtcImageDetail } from './components/basic/btc-image-detail/index.vue';
export type { ImageDetailProps, ImageDetailEmits } from './components/basic/btc-image-detail/types';

// Layout 布局组件
export { default as BtcContainer } from './components/layout/btc-container/index.vue';
export { default as BtcTabsCategoryContainer } from './components/layout/btc-tabs-category-container/index.vue';
export { default as BtcAppLayout } from './components/layout/app-layout/index.vue';
export { default as BtcDoubleLayout } from './components/layout/btc-double-layout/index.vue';
export { default as BtcViews } from './components/layout/btc-views/index.vue';
export { default as BtcAppSkeleton } from './components/basic/app-skeleton/index.vue';
export { default as BtcGlobalSearch } from './components/layout/app-layout/global-search/index.vue';

// Navigation 导航组件
export { default as BtcTabs } from './components/navigation/btc-tabs/index.vue';
export { default as BtcCascader } from './components/navigation/btc-cascader/index.vue';

// Form 表单组件
export { default as BtcForm } from './components/form/btc-form/index.vue';
export { default as BtcFormCard } from './components/form/btc-form/components/form-card.vue';
export { default as BtcFormTabs } from './components/form/btc-form/components/form-tabs.vue';
export { default as BtcFilterForm } from './components/form/btc-filter-form/index.vue';
export type { BtcFilterFormProps, BtcFilterFormEmits } from './components/form/btc-filter-form/types';
export { default as BtcSelectButton } from './components/form/btc-select-button/index.vue';
export { default as BtcColorPicker } from './components/form/btc-color-picker/index.vue';
export { default as BtcUpload } from './components/form/btc-upload/index.vue';

// Data 数据展示组件
export { default as BtcMasterList } from './components/data/btc-master-list/index.vue';
export { default as BtcMasterTableGroup } from './components/data/btc-master-table-group/index.vue';
export { default as BtcTransferPanel } from './components/data/btc-transfer-panel/index.vue';
export { default as BtcTransferDrawer } from './components/data/btc-transfer-drawer/index.vue';
export { default as BtcChartGallery } from './components/data/btc-chart-gallery/index.vue';
export { default as BtcFilterList } from './components/data/btc-filter-list/index.vue';
export type { FilterCategory, FilterOption, FilterResult } from './components/data/btc-filter-list/types';
export { default as BtcFilterTableGroup } from './components/data/btc-filter-table-group/index.vue';
export type { BtcFilterTableGroupProps, BtcFilterTableGroupEmits, BtcFilterTableGroupExpose } from './components/data/btc-filter-table-group/types';

// Process 流程组件
export { default as BtcProcessCountdown } from './components/process/btc-process-countdown/index.vue';
export { default as BtcProcessCard } from './components/process/btc-process-card/index.vue';

// Feedback 反馈组件
export { default as BtcDialog } from './components/feedback/btc-dialog/index';
export { BtcMessage } from './components/feedback/btc-message';
export { BtcNotification } from './components/feedback/btc-notification';
export { BtcIdentityVerify } from './components/feedback/btc-identity-verify';
export { BtcBindingDialog } from './components/feedback/btc-binding-dialog';
export { BtcMessageBox, BtcConfirm, BtcAlert, BtcPrompt } from './components/feedback/btc-message-box';

// Loading 组件
export { default as BtcAppLoading } from './components/loading/app-loading/index.vue';
export { default as BtcRootLoading } from './components/loading/root-loading/index.vue';

// Others 其他组件
export { default as BtcSvg } from './components/basic/btc-svg/index.vue';
export type { BtcSvgAnimation, BtcSvgAnimationTrigger } from './components/basic/btc-svg/types';
export { default as BtcSearch } from './components/form/btc-search/index.vue';
export { default as BtcInput } from './components/form/btc-input/index.vue';
export { default as BtcDevTools } from './components/others/btc-dev-tools/index.vue';
// 用户设置组件
export { BtcUserSettingDrawer } from './components/others/btc-user-setting';

// CRUD 组件（上下文系统）
export { default as BtcCrud } from './crud/context/index.vue';
export { IMPORT_FILENAME_KEY, IMPORT_FORBIDDEN_KEYWORDS_KEY } from './crud/btc-import-btn/keys';
export { default as BtcTable } from './crud/table/index.vue';
// BtcUpsert 组件单独导出，避免循环依赖
export { default as BtcUpsert } from './crud/upsert/index.vue';
export { default as BtcPagination } from './crud/pagination/index.vue';
export { default as BtcAddBtn } from './crud/add-btn/index.vue';
export { default as BtcRefreshBtn } from './crud/refresh-btn/index.vue';
export { default as BtcMultiDeleteBtn } from './crud/multi-delete-btn/index.vue';
export { default as BtcMultiUnbindBtn } from './crud/multi-unbind-btn/index.vue';
export { default as BtcBindTransferBtn } from './crud/bind-transfer-btn/index.vue';
export { default as BtcCrudRow } from './crud/crud-row/index.vue';
export { default as BtcCrudFlex1 } from './crud/crud-flex1/index.vue';
export { default as BtcCrudSearchKey } from './crud/crud-search-key/index.vue';
export { default as BtcCrudActions } from './crud/actions/index.vue';
export { default as BtcTableToolbar } from './crud/toolbar/inline.vue';
// 导入导出组件已移动到 excel 插件
export { default as BtcMenuExport } from './crud/menu-export/index.vue';

// 导出插件
export { ExcelPlugin, CodePlugin };

// 为了向后兼容，直接导出插件中的组件
// 使用直接导入而不是解构赋值，避免初始化顺序问题
export { BtcExportBtn, BtcImportBtn };
export const { BtcCodeJson } = CodePlugin;

// 导入导出套装组件
export { default as BtcImportExportGroup } from './crud/btc-import-export-group/index.vue';
export type { BtcImportExportGroupProps } from './crud/btc-import-export-group/types';

// 常量导出
export { DEFAULT_OPERATION_WIDTH } from './crud/context/layout';

// 导出工具函数
export { CommonColumns } from './crud/table/utils/common-columns';
export { useUpload } from './components/form/btc-upload/composables/useUpload';
export { addClass, removeClass } from './utils/dom';
export { provideContentHeight, useContentHeight, type ContentHeightContext } from './composables/content-height';
export { useBrowser } from './composables/useBrowser';
export { useUser, type UserInfo } from './composables/useUser';
export { useCurrentApp } from './composables/useCurrentApp';
export { useGlobalBreakpoints, initGlobalBreakpoints } from './composables/useGlobalBreakpoints';
export { useProcessStore, getCurrentAppFromPath, type ProcessItem } from './store/process';
export { registerMenus, clearMenus, clearMenusExcept, getMenusForApp, getMenuRegistry, type MenuItem } from './store/menuRegistry';
export { useFormRenderer } from './components/form/btc-form/composables/useFormRenderer';
export { mountDevTools, unmountDevTools } from './utils/mount-dev-tools';
export { autoMountDevTools } from './utils/auto-mount-dev-tools';
export { default as mitt, globalMitt, Mitt } from './utils/mitt';
// 导出 app-layout 工具函数
export { setIsMainAppFn, getIsMainAppFn } from './components/layout/app-layout/utils';

// 导出错误页面组件
export { default as BtcError404 } from './components/pages/error/404.vue';
export { default as BtcError401 } from './components/pages/error/401.vue';
export { default as BtcError403 } from './components/pages/error/403.vue';
export { default as BtcError500 } from './components/pages/error/500.vue';
export { default as BtcError502 } from './components/pages/error/502.vue';

// 导出用户设置相关的枚举类型（显式导出以避免moduleResolution: "bundler"解析问题）
export { MenuThemeEnum, SystemThemeEnum, MenuTypeEnum, ContainerWidthEnum, BoxStyleType } from './components/others/btc-user-setting/config/enums';

// 导出类型
export type { VerifyPhoneApi, VerifyEmailApi } from './components/feedback/btc-identity-verify/types';
export type { SaveBindingApi } from './components/feedback/btc-binding-dialog/types';
export type { TableColumn, OpButton, OpConfig } from './crud/table/types';
export type { FormItem, UpsertPlugin, UpsertProps } from './crud/upsert/types';
export type { DialogProps } from './components/feedback/btc-dialog/types';
export type { BtcFormItem, BtcFormConfig, BtcFormProps } from './components/form/btc-form/types';
export type { MasterTableGroupProps, MasterTableGroupEmits, MasterTableGroupExpose } from './components/data/btc-master-table-group/types';
export type {
  TransferKey,
  TransferPanelProps,
  TransferPanelColumn,
  TransferPanelEmits,
  TransferPanelExpose,
  SelectedItemDisplay,
  TransferPanelChangePayload,
  TransferPanelRemovePayload,
} from './components/data/btc-transfer-panel/types';
export type { BtcContainerProps } from './components/layout/btc-container/types';
export type { BtcCategory } from './components/layout/btc-tabs-category-container/index.vue';
export type { BtcSplitterProps, BtcSplitterEmits, BtcSplitterExpose, BtcSplitterDirection, BtcSplitterPanelProps, BtcSplitterPanelEmits } from './components/basic/btc-splitter/types';
export type {
  IconButtonConfig,
  IconButtonDropdown,
  IconButtonDropdownItem,
  IconButtonPopover
} from './components/basic/btc-icon-button';
export type { BtcTableButtonConfig } from './components/basic/btc-table-button/types';
export type { BtcTab } from './components/navigation/btc-tabs/index.vue';
export type {
  ProcessManagementItem,
  ProcessPauseRecord
} from './components/process/types';

// 关键：预加载可能在运行时动态导入的依赖，确保 Vite 在启动时就能扫描并预构建它们
// 这样可以避免在运行时触发依赖优化导致页面重新加载
// 注意：这些导入不会被实际执行（因为只导入类型/接口），但会被 Vite 的依赖扫描器识别
// 使用副作用导入确保这些模块被加载
import './components/layout/app-layout/global-search/useSearchIndex';
import './plugins/excel/components/import-btn/index.vue';

// ========== 从 shared-plugins 迁移的插件模块 ==========
export * from './plugins';

// ========== 从 i18n 迁移的国际化模块 ==========
export * from './i18n';
