# 应用端口配置清单

## 开发环境端口配置

| 应用名称 | 端口 | HMR端口 | 配置文件 | 说明 |
|---------|------|---------|---------|------|
| main-app | 8080 | 8080 | `configs/app-env.config.ts` | 主应用 |
| system-app | 8081 | 8081 | `configs/app-env.config.ts` | 系统应用 |
| logistics-app | 8082 | 8082 | `configs/app-env.config.ts` | 物流应用 |
| quality-app | 8083 | 8083 | `configs/app-env.config.ts` | 质量应用 |
| production-app | 8084 | 8084 | `configs/app-env.config.ts` | 生产应用 |
| engineering-app | 8085 | 8085 | `configs/app-env.config.ts` | 工程应用 |
| finance-app | 8086 | 8086 | `configs/app-env.config.ts` | 财务应用 |
| operations-app | 8087 | 8087 | `configs/app-env.config.ts` | 运维应用 |
| layout-app | 8088 | 8088 | `configs/app-env.config.ts` | 布局应用 |
| dashboard-app | 8089 | 8089 | `configs/app-env.config.ts` | 仪表板应用 |
| personnel-app | 8092 | 8092 | `configs/app-env.config.ts` | 人事应用 |
| mobile-app | 8091 | 8091 | `configs/app-env.config.ts` | 移动应用 |
| admin-app | 8093 | 8093 | `configs/app-env.config.ts` | 管理应用 |
| docs-app | 8094 | 8094 | `configs/app-env.config.ts` | 文档站点（VitePress） |
| home-app | 8095 | 8095 | `configs/app-env.config.ts` | 公司首页 |

## 端口冲突检查

### ✅ 无冲突
所有应用的端口都是唯一的，没有冲突：
- 8080: main-app
- 8081: system-app
- 8082: logistics-app
- 8083: quality-app
- 8084: production-app
- 8085: engineering-app
- 8086: finance-app
- 8087: operations-app
- 8088: layout-app
- 8089: dashboard-app
- 8092: personnel-app
- 8091: mobile-app
- 8093: admin-app
- 8094: docs-app
- 8095: home-app

### ⚠️ 注意事项

1. **端口配置说明**：
   - 所有应用的端口都统一配置在 `configs/app-env.config.ts` 中
   - `package.json` 中的 `dev` 脚本不再硬编码端口参数，使用配置文件中的端口

2. **端口检查**：
   - 运行 `pnpm dev:all` 前会自动检查所有端口是否被占用
   - 可以使用 `node scripts/check-ports.mjs` 手动检查端口占用情况
   - 如果端口被占用，脚本会阻止启动并提示释放端口

3. **端口范围**：
   - 应用端口范围: 8080-8095
   - HMR 端口: 与主端口相同

## Docker 部署端口映射

根据 `docker-compose.yml`，生产环境的端口映射（已与开发环境保持一致）：
- main-app: 8080:80
- system-app: 8081:80
- logistics-app: 8082:80
- quality-app: 8083:80
- production-app: 8084:80
- engineering-app: 8085:80
- finance-app: 8086:80
- operations-app: 8087:80
- layout-app: 8088:80
- dashboard-app: 8089:80
- personnel-app: 8092:80
- mobile-app: 8091:80
- admin-app: 8093:80
- docs-app: 8094:80
- home-app: 8095:80

✅ **已与开发环境端口完全一致**

## 建议

1. **统一端口配置**：所有应用的端口都统一配置在各自的 `vite.config.ts` 中，`package.json` 中的 `dev` 脚本不再硬编码端口参数
2. **开发与生产环境一致**：Docker 部署的端口映射已与开发环境完全一致，便于开发和部署切换
3. **端口预留**：如需添加新应用，建议使用 8092+ 的端口范围
