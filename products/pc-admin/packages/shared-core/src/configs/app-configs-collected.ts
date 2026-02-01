// @ts-nocheck
/**
 * 此文件由 scripts/collect-app-configs.mjs 自动生成
 * 请勿手动编辑此文件
 * 
 * 生成时间: 2026-01-15T12:17:32.311Z
 * 
 * 此文件包含所有应用配置的内联 JSON 数据，避免运行时动态导入
 */

import type { AppIdentity } from './app-identity.types';

/**
 * 所有应用配置的映射（内联 JSON 字符串）
 * 键为应用配置文件路径（相对于项目根目录），值为 JSON 字符串
 * 
 * 注意：这些是 JSON 字符串，需要在 app-scanner.ts 中解析
 */
export const appConfigsJsonMap: Record<string, string> = {
    '../../../apps/admin-app/src/app.ts': "{\n  \"id\": \"admin\",\n  \"name\": \"subapp.name\",\n  \"description\": \"common.system.btc_shop_management_system\",\n  \"pathPrefix\": \"/admin\",\n  \"subdomain\": \"admin.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/dashboard-app/src/app.ts': "{\n  \"id\": \"dashboard\",\n  \"name\": \"看板应用\",\n  \"description\": \"BTC车间管理系统 - 看板应用\",\n  \"pathPrefix\": \"/dashboard\",\n  \"subdomain\": \"dashboard.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/docs-app/src/app.ts': "{\n  \"id\": \"docs\",\n  \"name\": \"subapp.name\",\n  \"description\": \"app.description\",\n  \"pathPrefix\": \"/docs\",\n  \"subdomain\": \"docs.bellis.com.cn\",\n  \"type\": \"docs\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/engineering-app/src/app.ts': "{\n  \"id\": \"engineering\",\n  \"name\": \"subapp.name\",\n  \"description\": \"common.system.btc_shop_management_system\",\n  \"pathPrefix\": \"/engineering\",\n  \"subdomain\": \"engineering.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/finance-app/src/app.ts': "{\n  \"id\": \"finance\",\n  \"name\": \"财务应用\",\n  \"description\": \"BTC车间管理系统 - 财务应用\",\n  \"pathPrefix\": \"/finance\",\n  \"subdomain\": \"finance.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/home-app/src/app.ts': "{\n  \"id\": \"home\",\n  \"name\": \"公司首页\",\n  \"description\": \"BTC车间管理系统 - 公司首页和关于我们\",\n  \"pathPrefix\": \"/\",\n  \"subdomain\": \"www.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\",\n  \"metadata\": {\n    \"public\": true,\n    \"port\": 8095\n  }\n}",
    '../../../apps/layout-app/src/app.ts': "{\n  \"id\": \"layout\",\n  \"name\": \"subapp.name\",\n  \"description\": \"app.description\",\n  \"pathPrefix\": \"/\",\n  \"subdomain\": \"layout.bellis.com.cn\",\n  \"type\": \"layout\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/logistics-app/src/app.ts': "{\n  \"id\": \"logistics\",\n  \"name\": \"common.apps.logistics\",\n  \"description\": \"common.system.btc_shop_management_system_logistics\",\n  \"pathPrefix\": \"/logistics\",\n  \"subdomain\": \"logistics.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/main-app/src/app.ts': "{\n  \"id\": \"main\",\n  \"name\": \"主应用\",\n  \"description\": \"BTC车间管理系统 - 主应用基座\",\n  \"pathPrefix\": \"/\",\n  \"subdomain\": \"bellis.com.cn\",\n  \"type\": \"main\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\",\n  \"routes\": {\n    \"mainAppRoutes\": [\n      \"/workbench/overview\",\n      \"/workbench/todo\",\n      \"/workbench/profile\",\n      \"/workbench/log-reporter-test\",\n      \"/workbench/log-query\"\n    ],\n    \"nonClosableRoutes\": [\n      \"/workbench/overview\"\n    ],\n    \"homeRoute\": \"/workbench/overview\",\n    \"skipTabbarRoutes\": [\n      \"/login\",\n      \"/register\",\n      \"/forget-password\",\n      \"/404\",\n      \"/workbench/overview\"\n    ]\n  }\n}",
    '../../../apps/operations-app/src/app.ts': "{\n  \"id\": \"operations\",\n  \"name\": \"运维应用\",\n  \"description\": \"BTC车间管理系统 - 运维应用\",\n  \"pathPrefix\": \"/operations\",\n  \"subdomain\": \"operations.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/personnel-app/src/app.ts': "{\n  \"id\": \"personnel\",\n  \"name\": \"人事应用\",\n  \"description\": \"BTC车间管理系统 - 人事应用\",\n  \"pathPrefix\": \"/personnel\",\n  \"subdomain\": \"personnel.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/production-app/src/app.ts': "{\n  \"id\": \"production\",\n  \"name\": \"subapp.name\",\n  \"description\": \"common.system.btc_shop_management_system\",\n  \"pathPrefix\": \"/production\",\n  \"subdomain\": \"production.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/quality-app/src/app.ts': "{\n  \"id\": \"quality\",\n  \"name\": \"subapp.name\",\n  \"description\": \"common.system.btc_shop_management_system\",\n  \"pathPrefix\": \"/quality\",\n  \"subdomain\": \"quality.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
    '../../../apps/system-app/src/app.ts': "{\n  \"id\": \"system\",\n  \"name\": \"系统应用\",\n  \"description\": \"BTC车间管理系统 - 系统应用\",\n  \"pathPrefix\": \"/system\",\n  \"subdomain\": \"system.bellis.com.cn\",\n  \"type\": \"sub\",\n  \"enabled\": true,\n  \"version\": \"1.0.0\"\n}",
};

/**
 * 解析后的应用配置映射
 * 在模块加载时自动解析 JSON 字符串
 */
export const appConfigsMap: Record<string, AppIdentity> = Object.fromEntries(
  Object.entries(appConfigsJsonMap).map(([path, jsonStr]) => [
    path,
    JSON.parse(jsonStr) as AppIdentity,
  ])
);
