// @btc/shared-core 入口文件

// ========== 关键导出（显式导出，确保TypeScript能正确识别）==========
// 显式导出 subapp-lifecycle 模块的所有函数和类型（放在最前面，确保优先级）
export { setupSubAppGlobals } from './composables/subapp-lifecycle/useSubAppGlobals';
export { createSubApp, mountSubApp, unmountSubApp, updateSubApp, setupStandalonePlugins } from './composables/subapp-lifecycle/useSubAppLifecycle';
export { setupRouteSync, setupHostLocationBridge, ensureCleanUrl } from './composables/subapp-lifecycle/useSubAppRouteSync';
export { ensureLeadingSlash, normalizeToHostPath, getCurrentHostPath, removeLoadingElement, clearNavigationFlag } from './composables/subapp-lifecycle/utils';
export { setupEventBridge } from './composables/subapp-lifecycle/useSubAppEventBridge';
export { createLogoutFunction } from './composables/subapp-lifecycle/useSubAppLogout';
export type { SubAppContext, SubAppOptions } from './composables/subapp-lifecycle/types';
// 其他 subapp-lifecycle 导出（显式导出以避免moduleResolution: "bundler"解析问题）
export { listenSubAppRouteChange } from './composables/subapp-lifecycle/useSubAppTabbar';
export { registerManifestMenusForApp } from './composables/subapp-lifecycle/useSubAppMenu';
export { findMenuIconByI18nKey } from './composables/subapp-lifecycle/useSubAppBreadcrumb';
export type { CleanupState, CleanupListener } from './composables/subapp-lifecycle/types';

// 显式导出 qiankun 类型
export type { TabMeta, MenuItem, QiankunProps } from './types/qiankun';

// 显式导出常用类型和函数，确保 TypeScript 能够正确识别
export type { UseCrudReturn, CrudService } from './btc/crud/types';
export type { ButtonStyle } from './btc/plugins/theme';
export type { ThemeConfig } from './btc/composables/useTheme';
export type { Plugin } from './btc/plugins/manager/types';

// 显式导出常用函数
export { useI18n, createI18nPlugin } from './btc/plugins/i18n';
export { useThemePlugin, createThemePlugin } from './btc/plugins/theme';
export { exportTableToExcel } from './btc/plugins/excel';
export { useCountdown } from './composables/useCountdown';
export { useCrud } from './btc/crud';
export { useSmsCode } from './composables/use-sms-code';
export { usePluginManager } from './btc/plugins/manager';
export { useBtcForm } from './composables/useBtcForm';
export { useEnvInfo } from './composables/useEnvInfo';
export type { EnvInfo } from './composables/useEnvInfo';
export { useTabs, useAction, useElApi, usePlugins } from './composables/form-helpers';
export { useContentMount } from './composables/useContentMount';
export type { ContentMountType, ContentMountState } from './composables/useContentMount';
export { startUserCheckPolling, stopUserCheckPolling, getUserCheckData, startUserCheckPollingIfLoggedIn } from './composables/user-check';
export { useLogout } from './composables/useLogout';
export type { UseLogoutOptions } from './composables/useLogout';
export { useServiceWithConfirm } from './composables/useServiceWithConfirm';
export { logoutCore } from './auth/logoutCore';
export type { LogoutCoreOptions } from './auth/logoutCore';
export { checkStorageValidity, triggerAutoLogout, recordLoginTime } from './utils/storage-validity-check';
export { logRedirectTrace, getRedirectTraceLogs, clearRedirectTraceLogs, exportRedirectTraceLogs } from './utils/redirect-logger';
export { registerSubAppI18n } from './composables/subapp-i18n/registerSubAppI18n';
// 导出国际化工具函数（供各应用使用，统一处理逻辑）
export { mergeConfigFiles, deepMerge, unflattenObject, flattenObject, isObject, mergeMessages } from './utils/i18n/locale-utils';
export { createLocaleGetters } from './utils/i18n/create-locale-getters';
export type { CreateLocaleGettersOptions, LocaleGetters, LocaleMessages, SupportedLocale } from './utils/i18n/create-locale-getters';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE } from './utils/i18n/create-locale-getters';
export { createTSync } from './utils/i18n/create-tsync';
export type { CreateTSyncOptions } from './utils/i18n/create-tsync';
export { setupAppI18n } from './utils/i18n/setup-app-i18n';
export type { SetupAppI18nOptions } from './utils/i18n/setup-app-i18n';
export { loadFlatI18nMessages } from './utils/i18n/simple-flat-loader';
export type { FlatLocaleSource, FlatLocaleMessages } from './utils/i18n/simple-flat-loader';
export { loadLocaleFromCDN, loadHybridLocale, clearCDNCache, preloadCDNLocales } from './utils/i18n/cdn-locale-loader';
export type { CDNLocaleConfig } from './utils/i18n/cdn-locale-loader';
export { useCrossDomainBridge, broadcastLoginMessage } from './composables/useCrossDomainBridge';
export type { UseCrossDomainBridgeOptions, UseCrossDomainBridgeReturn, BridgeMessage } from './composables/useCrossDomainBridge';
export { useThemeStore } from './btc/store/theme';
export { createCrudServiceFromEps } from './btc/service/eps-utils';
export { getEpsColumns, epsColumnsToTableColumns, epsColumnsToFormItems, generateConfigFromEps, mergeEpsDictIntoColumns, mergeEpsDictIntoFormItems } from './btc/service/eps-columns-utils';
export { getDictData, getAllDictData, updateDictData, batchUpdateDictData, refreshDictData, onDictUpdate, offDictUpdate, setDefaultDictApi, getDefaultDictApi, clearDictCache, initSSEIntegration, cleanupSSEIntegration, isDictCacheEmpty } from './btc/service/dict-manager';
export type { DictUpdateEvent } from './btc/service/dict-manager';
export { connectSSE, disconnectSSE, on, off, getSSEStatus } from './btc/service/sse-manager';
export type { SSEStatus, SSEOptions } from './btc/service/sse-manager';
export { useDictData, useDictDataMultiple } from './btc/composables/useDictData';
export { assignIconsToMenuTree } from './utils/menu-icon-assigner';
export { getMainAppId, isMainAppRoute, isRouteClosable, shouldSkipTabbar, getMainAppHomeRoute, getAppIdFromPath, getMainAppRoutes } from './utils/app-route-utils';
export { getEnvInfo, getCurrentEnvironment, getCurrentAppId, getCurrentAppConfig } from './utils/env-info';
export { getMainAppLoginUrl } from './utils/get-main-app-login-url';
// 重定向工具函数导出
export {
  clearRedirectCache,
  clearRedirectCookie,
  getCurrentUnifiedPath,
  getCurrentUnifiedPathSync,
  saveLogoutRedirectPath,
  getAndClearLogoutRedirectPath,
  validateAndNormalizeRedirectPath,
  getTargetAppInfo,
  getCurrentAppInfo,
  isCrossAppRedirect,
  convertPathToFullUrl,
  buildLogoutUrl,
  buildLogoutUrlWithFullUrl,
  handleCrossAppRedirect,
} from './utils/redirect';
// EnvInfo 类型已在上面从 './composables/useEnvInfo' 导出，避免重复导出
export { initGlobalStateManager, getGlobalState, waitForGlobalState, setGlobalState, getGlobalStateValue, onGlobalStateChange, cleanupAllListeners, useGlobalState, isGlobalStateInitialized } from './composables/useGlobalState';
export { getGlobalEpsService, createEpsService, loadEpsService, exportEpsServiceToGlobal } from './eps';
export type { EpsServiceData } from './eps';
export { initResourceLoader, loadResource, getResourceLoaderConfig, clearResourceLoaderCache, setupImageFallback, getCssUrlFallback } from './btc/utils/resource-loader';
export type { ResourceLoaderOptions } from './btc/utils/resource-loader';
export { initDynamicImportInterceptor, loadModule, clearModuleCache, getModuleCacheInfo } from './btc/utils/dynamic-import-interceptor';
export { getProfileInfoFromCache, loadProfileInfoOnLogin, clearProfileInfoCache } from './utils/profile-info-cache';

// Loading 相关导出
export * from './btc/utils/loading';
export { appLoadingService, rootLoadingService, routeLoadingService } from './btc/utils/loading';

// Element Plus 全局初始化相关导出
export { initGlobalElementPlus, updateElementPlusLocale, getGlobalElementPlus, isElementPlusInstalled } from './btc/utils/element-plus';
export { cleanupElementPlus } from './btc/utils/element-plus/cleanup';

// Qiankun 沙箱配置相关导出
export { globalQiankunSandboxConfig, getQiankunSandboxConfig } from './configs/qiankun-sandbox-config';
export type { QiankunSandboxConfig } from './configs/qiankun-sandbox-config';

// 页面标题相关导出
export {
  setPageTitle,
  buildTitle,
  buildTitleSync,
  isStandardApp,
  isStandardAppSync,
  getAppDisplayName,
  getAppDisplayNameSync,
  getAppConfig,
  getAppConfigSync,
  preloadAppsConfig,
  PAGE_TITLE_CONFIG,
} from './btc/utils/page-title';
export type { PageTitleOptions } from './btc/utils/page-title';

// ========== 其他导出（使用 export *，但关键导出已在上方显式声明）==========
export * from './btc';
export * from './btc/plugins';
export * from './btc/plugins/i18n';
export * from './btc/plugins/permission';
export * from './btc/plugins/theme';
export * from './btc/service/base';
export * from './btc/service/builder';
export * from './btc/service/request';
export * from './btc/service';
export * from './btc/crud';
export * from './btc/composables/useTheme';
export * from './btc/store/theme';
export * from './composables/use-request';
export * from './composables/useBtcForm';
export * from './composables/form-helpers';
export * from './composables/use-sms-code';
export * from './composables/use-email-code';
export * from './composables/useCountdown';
export * from './composables/user-check';
export * from './composables/useContentMount';
export * from './composables/useEnvInfo';
// 显式导出 types/common 中的类型，避免与 types/schemas 冲突
export type { BaseResponse } from './types/common';
export * from './types/crud';
export type { ModuleConfig } from './types/module';
export * from './utils/menu-icon-assigner';
export * from './utils/app-route-utils';
export * from './eps';

// ========== 从 shared-utils 迁移的工具模块 ==========
export * from './utils';
export { getCookieDomain } from './utils/storage/cookie';
// 日志模块导出
export { logger, getLogger, setLogContext, getLogContext, clearLogContext, reinitializeLogger } from './utils/logger';
export type { LogContext, LogLevel } from './utils/logger/types';
// 显式导出存储工具（确保 Pinia 插件正确导出）
export { persistedStatePlugin, persistedStatePluginSession, createPersistedStatePlugin } from './utils/storage/pinia-persist';
export type { PersistedStatePluginOptions } from './utils/storage/pinia-persist';
export {
  usePageColumns,
  usePageForms,
  usePageService,
  getPageConfigFull,
  registerPageConfig,
  registerConfigsFromGlob,
  getPageConfig,
  getAllRegisteredPageKeys,
} from './utils/config-loader';
export {
  scanRoutesFromModules,
  scanRoutesFromConfigFiles,
  mergeRoutes,
  registerRoutes,
} from './utils/route-scanner';

// ========== 从 subapp-manifests 迁移的清单模块 ==========
export * from './manifest';

// ========== 从 env 迁移的环境变量模块 ==========
export * from './env';

// ========== 从 configs 导出的应用扫描器函数 ==========
export { getAppById, getAllApps, getAppBySubdomain } from './configs/app-scanner';
export type { AppIdentity } from './configs/app-identity.types';

// ========== Zod 验证工具导出 ==========
export * from './utils/zod';
// 注意：createBaseResponseSchema 在 utils/http/schemas 和 types/schemas 中都有定义
// 优先使用 utils/http/schemas 中的版本（更通用）
export {
  createBaseResponseSchema,
  createPageResponseSchema,
  createApiResponseSchema,
  validateResponse,
  safeValidateResponse,
  emptyDataSchema,
  // API 类型验证相关
  validateApiResponseByType,
  inferApiDataType,
  listApiResponseSchema,
  detailApiResponseSchema,
  booleanApiResponseSchema,
  numberApiResponseSchema,
  stringApiResponseSchema,
} from './utils/http/schemas';
export type { ApiDataType } from './utils/http/schemas';
export * from './utils/form/zod-validator';
export * from './configs/schemas';
// 从 types/schemas 导出类型和 schema，但排除 createBaseResponseSchema（已在上面导出）
export { DictItemSchema, PageParamsSchema, PageResponseSchema } from './types/schemas';
export type { DictItem, PageParams, PageResponse } from './types/schemas';

// ========== API 中心导出 ==========
export * from './utils/api-center';
export { createApiClient } from './utils/api-center/client';
export type { ApiClient, ApiRequestOptions } from './utils/api-center/types';
export type { RequestAdapter } from './utils/api-center/client';

// ========== 日志上报中心导出 ==========
export * from './utils/log-reporter';
export { getLogReporter, initLogReporter, reportLog, getQueueLength, getLogFilterOptions } from './utils/log-reporter';
// LogLevel 已在上面从 logger/types 导出，这里不再重复导出
export type { LogEntry, ErrorInfo, LogReporterOptions, LogReportResponse } from './utils/log-reporter/types';
export type { LogFilterOptions } from './utils/log-reporter/utils';

