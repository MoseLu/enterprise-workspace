/**
 * 公共 Vite 插件统一导出
 */

export { cleanDistPlugin } from './clean';
export { chunkVerifyPlugin, optimizeChunksPlugin } from './chunk';
export { ensureBaseUrlPlugin } from './url';
export { corsPlugin } from './cors';
export { ensureCssPlugin } from './css';
export { addVersionPlugin } from './version';
export { publicImagesToAssetsPlugin } from './public-images';
export { resourcePreloadPlugin } from './resource-preload';
export { resolveLogoPlugin } from './resolve-logo';
export { copyIconsPlugin } from './copy-icons';
export { uploadIconsToOssPlugin } from './upload-icons-to-oss';
export { replaceIconsWithCdnPlugin } from './replace-icons-with-cdn';
export { dutyStaticPlugin } from './duty-static';
export { localesStaticPlugin } from './locales-static';
export { uploadCdnPlugin } from './upload-cdn';
export { cdnAssetsPlugin } from './cdn-assets';
export { cdnImportPlugin } from './cdn-import';
export { resolveExternalImportsPlugin } from './resolve-external-imports';
export { resolveBtcImportsPlugin } from './resolve-btc-imports';
export { resolveAuthAliasesPlugin } from './resolve-auth-aliases';
// 已移除 dynamicImportCdnPlugin 导出，该插件会导致 Blob URL 上下文中的模块解析失败
// 如果需要，可以直接从 './dynamic-import-cdn' 导入
