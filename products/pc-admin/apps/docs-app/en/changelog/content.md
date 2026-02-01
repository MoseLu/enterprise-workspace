# Changelog

This document records all important changes in the project. Version numbers follow [Semantic Versioning](https://semver.org/lang/zh-CN/).

Format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/), this project uses [Conventional Commits](https://www.conventionalcommits.org/) standards.

## [Unreleased]

---

## [1.0.10] - 2026-01-14

### Changed
- Scripts architecture refactoring completed

---

## [1.0.9] - 2026-01-11

### Refactored
- BTC component library comprehensive refactoring and optimization: Completed component classification adjustments, naming standardization, and necessary checks
  - Classification adjustments: BtcSvg, BtcSearch, BtcForm, BtcViewGroup, BtcDialog moved to correct directories
  - Renaming: BtcChartDemo→BtcChartGallery, BtcViewGroup→BtcMasterViewGroup
  - CRUD component naming standardization: BtcRow→BtcCrudRow, BtcFlex1→BtcCrudFlex1, BtcSearchKey→BtcCrudSearchKey, BtcMenuExp→BtcMenuExport
  - Unified naming prefix: AppLayout→BtcAppLayout, AppSkeleton→BtcAppSkeleton, AppLoading→BtcAppLoading, RootLoading→BtcRootLoading, GlobalSearch→BtcGlobalSearch
  - Data component optimization: BtcDoubleGroup→BtcDoubleLeftGroup
  - Updated all import/export paths and usage locations, ensuring component library structure is scientific and naming is standardized

---

## [1.0.8] - 2025-01-XX

### Added
- Added Git commit templates and tag standards documentation
- Unified internationalization configuration method for admin application and logistics application
- Added storage validity check utilities (`checkStorageValidity` and `triggerAutoLogout`), implementing auto-logout functionality
- Added unified login redirect utility (`getMainAppLoginUrl`), supporting all sub-applications to uniformly redirect to main application login page

### Changed
- Emptied admin application's JSON internationalization files, unified use of config.ts scanning solution
- Fixed logistics application menu hierarchy structure, using `_` key as first-level menu text
- Unified redirect parameters: All login, logout, redirect unified use of `oauth_callback` parameter, removed `redirect` parameter compatibility
- Unified login redirect logic: All sub-applications use shared `getMainAppLoginUrl` function, supporting cross-domain/cross-port redirect
- Optimized route change event handling: Get route information from manifest, supplement labelKey and other meta information

### Fixed
- Fixed `registerSubAppI18n` logic for handling `_` key in `flattenObject` and `unflattenObject`
- Fixed auto-logout logic: Changed to check validity in storage utility, only check if `btc_profile_info_data` exists
- Fixed tag internationalization failure when navigating to overview page: Get route information from manifest and supplement labelKey
- Fixed issue where entire purple background displayed briefly on login page refresh: Added initial hidden state and fade-in animation for gradient border
- Fixed `@btc/subapp-manifests` import error during build: Changed to use relative path to import manifest module

---

## [1.0.7] - 2026-01-07

### Changed
- Storage system refactoring: Introduced pinia-plugin-persistedstate, unified management of all Store persistence
- Storage utility reorganization: Unified to utils/storage/ directory, added SessionStorage and IndexedDB utilities
- Refactored all Stores: Removed manual persistence logic, use plugin automatic management
- Added IndexedDB utility: Based on Dexie.js, supports large-capacity historical data queries (visualization dashboard scenarios)

---

## [1.0.6] - 2025-12-29

### Changed
- Loading style system optimization

---

## [1.0.5] - 2025-12-27

### Added
- Added logistics application menu configuration
- Added internationalization scanning functionality

---

## [1.0.4] - 2025-12-23

### Changed
- Optimized build process
- Updated dependency versions

---

## [1.0.3] - 2025-12-20

### Fixed
- Fixed known issues

---

## [1.0.2] - 2025-12-19

### Added
- New features

---

## [1.0.1] - 2025-12-18

### Fixed
- Fixed initial version issues

---

## [1.0.0] - 2025-12-18

### Added
- Project initial version
- Basic functionality implementation

---

## Version Notes

- **[Unreleased]**: Current changes in development, will be released in next version
- **[Major.Minor.Patch]**: Published version tags

## Change Types

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related fixes

## Related Links

- [Git Tag Standards Guide](./docs/GIT_TAG_GUIDE.md)
- [Version Release Guide](./docs/VERSION_RELEASE_GUIDE.md)
- [GitHub Releases](https://github.com/your-org/your-repo/releases)
