# 文档清理自动化脚本
# 用途：自动执行文档清理和重组任务

param(
    [switch]$DryRun = $false,  # 只显示将要执行的操作，不实际执行
    [switch]$Phase1 = $false,  # 执行 Phase 1: 删除重复和空文件
    [switch]$Phase2 = $false,  # 执行 Phase 2: 归档过时文档
    [switch]$Phase3 = $false,  # 执行 Phase 3: 重组文档
    [switch]$Phase4 = $false,  # 执行 Phase 4: 规范命名
    [switch]$All = $false      # 执行所有阶段
)

# 设置颜色
$ErrorColor = "Red"
$WarningColor = "Yellow"
$SuccessColor = "Green"
$InfoColor = "Cyan"

Write-Host "`n=== 文档清理脚本 ===" -ForegroundColor $InfoColor
Write-Host "工作目录: $(Get-Location)" -ForegroundColor $InfoColor
Write-Host "模式: $(if ($DryRun) { '预览模式（不执行）' } else { '执行模式' })" -ForegroundColor $(if ($DryRun) { $WarningColor } else { $InfoColor })
Write-Host ""

# 确认是否继续
if (-not $DryRun) {
    Write-Host "⚠️  警告: 此操作将删除、移动和归档文档文件。" -ForegroundColor $WarningColor
    Write-Host "建议先执行: git tag docs-before-cleanup" -ForegroundColor $WarningColor
    $confirm = Read-Host "`n是否继续？(y/N)"
    if ($confirm -ne 'y') {
        Write-Host "已取消" -ForegroundColor $WarningColor
        exit 0
    }
}

# 辅助函数
function Execute-Operation {
    param(
        [string]$Description,
        [scriptblock]$Action
    )
    
    if ($DryRun) {
        Write-Host "[预览] $Description" -ForegroundColor $WarningColor
    } else {
        try {
            Write-Host "[执行] $Description" -ForegroundColor $InfoColor
            & $Action
            Write-Host "  ✅ 完成" -ForegroundColor $SuccessColor
        } catch {
            Write-Host "  ❌ 失败: $_" -ForegroundColor $ErrorColor
        }
    }
}

function Remove-FileIfExists {
    param([string]$Path)
    if (Test-Path $Path) {
        Execute-Operation "删除: $Path" {
            Remove-Item $Path -Force
        }
    }
}

function Move-FileIfExists {
    param([string]$Source, [string]$Destination)
    if (Test-Path $Source) {
        $destDir = Split-Path $Destination -Parent
        if (-not (Test-Path $destDir)) {
            Execute-Operation "创建目录: $destDir" {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
        }
        Execute-Operation "移动: $Source → $Destination" {
            Move-Item $Source $Destination -Force
        }
    }
}

# ============================================================
# Phase 1: 删除重复和空文件
# ============================================================
if ($Phase1 -or $All) {
    Write-Host "`n=== Phase 1: 删除重复和空文件 ===" -ForegroundColor $InfoColor
    
    # 1.1 删除 docs/ 下的重复部署文档
    Write-Host "`n1.1 删除重复部署文档" -ForegroundColor $InfoColor
    Remove-FileIfExists "docs\NGINX_SUBDOMAIN_PROXY.md"
    Remove-FileIfExists "docs\K8S_INCREMENTAL_DEPLOYMENT.md"
    Remove-FileIfExists "docs\REVERSE_PROXY_ARCHITECTURE.md"
    Remove-FileIfExists "docs\SUBDOMAIN_LAYOUT_INTEGRATION.md"
    Remove-FileIfExists "docs\GITHUB_ACTIONS_K8S_SETUP.md"
    
    # 1.2 删除空 README 文件
    Write-Host "`n1.2 删除空 README 文件" -ForegroundColor $InfoColor
    $emptyReadmes = Get-ChildItem -Recurse -Filter "README.md" | Where-Object {
        $_.FullName -notmatch "node_modules|dist|dist-cdn" -and
        $_.Length -lt 150
    }
    
    foreach ($file in $emptyReadmes) {
        $lines = (Get-Content $file.FullName | Measure-Object -Line).Lines
        if ($lines -le 2) {
            Remove-FileIfExists $file.FullName
        }
    }
    
    # 1.3 删除错误报告目录
    Write-Host "`n1.3 删除错误报告目录" -ForegroundColor $InfoColor
    if (Test-Path "ts-error-reports") {
        Execute-Operation "删除目录: ts-error-reports" {
            Remove-Item "ts-error-reports" -Recurse -Force
        }
    }
    if (Test-Path "lint-error-reports") {
        Execute-Operation "删除目录: lint-error-reports" {
            Remove-Item "lint-error-reports" -Recurse -Force
        }
    }
    
    # 1.4 删除根目录重复的输入框文档（将在 Phase 3 移动到 docs-app）
    Write-Host "`n1.4 标记待移动的重复文档" -ForegroundColor $InfoColor
    Write-Host "  ⏩ 封装输入框.md 和 输入框封装分析与建议.md 将在 Phase 3 移动" -ForegroundColor $WarningColor
}

# ============================================================
# Phase 2: 归档过时文档
# ============================================================
if ($Phase2 -or $All) {
    Write-Host "`n=== Phase 2: 归档过时文档 ===" -ForegroundColor $InfoColor
    
    # 2.1 创建归档目录
    Write-Host "`n2.1 创建归档目录" -ForegroundColor $InfoColor
    Execute-Operation "创建 docs/archive/ 目录结构" {
        New-Item -ItemType Directory -Path "docs\archive\migrations" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs\archive\design-tokens" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs\archive\css-architecture" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs\archive\i18n" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs\archive\architecture" -Force | Out-Null
    }
    
    # 2.2 归档设计令牌迁移文档
    Write-Host "`n2.2 归档设计令牌迁移文档" -ForegroundColor $InfoColor
    $designTokensDocs = @(
        "MIGRATION_COMPLETE.md",
        "MIGRATION_SUMMARY.md",
        "MIGRATION_MILESTONES.md",
        "MIGRATION_CURRENT_STATE.md",
        "MIGRATION_PROGRESS.md",
        "MIGRATION_EXECUTION_GUIDE.md",
        "MIGRATION_INDEX.md",
        "MIGRATION_ATOMIC_STEPS.md",
        "IMPLEMENTATION_COMPLETE.md",
        "IMPLEMENTATION_STATUS.md",
        "PLAN_EXECUTION_SUMMARY.md",
        "FINAL_VERIFICATION.md"
    )
    
    foreach ($doc in $designTokensDocs) {
        Move-FileIfExists "packages\design-tokens\$doc" "docs\archive\design-tokens\$doc"
    }
    
    # 2.3 归档日志迁移文档
    Write-Host "`n2.3 归档日志迁移文档" -ForegroundColor $InfoColor
    Move-FileIfExists "CONSOLE_TO_LOGGER_MIGRATION_REPORT.md" "docs\archive\migrations\console-to-logger.md"
    Move-FileIfExists "MIGRATION_COMPLETE_SUMMARY.md" "docs\archive\migrations\migration-summary.md"
    Move-FileIfExists "LOGGING_LIBRARY_ANALYSIS.md" "docs\archive\migrations\logging-library-analysis.md"
    
    # 2.4 归档 CSS 架构重构文档
    Write-Host "`n2.4 归档 CSS 架构重构文档" -ForegroundColor $InfoColor
    Move-FileIfExists "packages\shared-components\src\styles\IMPLEMENTATION_SUMMARY.md" "docs\archive\css-architecture\implementation-summary.md"
    Move-FileIfExists "packages\shared-components\src\styles\ITCSS_RESTRUCTURE_PLAN.md" "docs\archive\css-architecture\itcss-restructure-plan.md"
    
    # 2.5 归档 i18n 优化分析
    Write-Host "`n2.5 归档 i18n 优化分析" -ForegroundColor $InfoColor
    Move-FileIfExists "docs\i18n-optimization-analysis.md" "docs\archive\i18n\optimization-analysis-v1.md"
    Move-FileIfExists "docs\i18n-optimization-analysis-v2.md" "docs\archive\i18n\optimization-analysis-v2.md"
    Move-FileIfExists "docs\i18n-scripts-integration.md" "docs\archive\i18n\scripts-integration.md"
    
    # 2.6 归档模块架构对比（旧版本）
    Write-Host "`n2.6 归档模块架构对比（旧版本）" -ForegroundColor $InfoColor
    Move-FileIfExists "docs\module-architecture-comparison.md" "docs\archive\architecture\module-architecture-comparison-v1.md"
}

# ============================================================
# Phase 3: 重组文档结构
# ============================================================
if ($Phase3 -or $All) {
    Write-Host "`n=== Phase 3: 重组文档结构 ===" -ForegroundColor $InfoColor
    
    # 3.1 创建新的目录结构
    Write-Host "`n3.1 创建新的目录结构" -ForegroundColor $InfoColor
    Execute-Operation "创建 docs/ 子目录" {
        $dirs = @(
            "docs\getting-started",
            "docs\architecture",
            "docs\development",
            "docs\deployment",
            "docs\ci-cd",
            "docs\guides\i18n",
            "docs\guides\routing",
            "docs\guides\styling",
            "docs\api",
            "docs\research"
        )
        foreach ($dir in $dirs) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    # 3.2 移动根目录中文文档
    Write-Host "`n3.2 移动根目录中文文档" -ForegroundColor $InfoColor
    Move-FileIfExists "封装输入框.md" "apps\docs-app\guides\components\input-component-design.md"
    Move-FileIfExists "输入框封装分析与建议.md" "apps\docs-app\guides\components\input-component-analysis.md"
    Move-FileIfExists "常见问题.md" "apps\docs-app\guides\faq.md"
    
    # 3.3 移动技术研究文档
    Write-Host "`n3.3 移动技术研究文档" -ForegroundColor $InfoColor
    Move-FileIfExists "SPECULATION_RULES_API_EVALUATION.md" "docs\research\speculation-rules.md"
    
    # 3.4 重组 docs/ 目录文档
    Write-Host "`n3.4 重组 docs/ 目录文档" -ForegroundColor $InfoColor
    
    # 开发指南
    Move-FileIfExists "docs\APP_DEVELOPMENT_GUIDE.md" "docs\development\app-development.md"
    Move-FileIfExists "docs\SCRIPTS_USAGE.md" "docs\development\scripts-usage.md"
    Move-FileIfExists "docs\GIT_TAG_GUIDE.md" "docs\development\git-tag.md"
    
    # 路由指南
    Move-FileIfExists "docs\auto-route-discovery-usage.md" "docs\guides\routing\auto-discovery.md"
    
    # i18n 指南
    Move-FileIfExists "docs\i18n-quick-start.md" "docs\guides\i18n\quick-start.md"
    Move-FileIfExists "docs\i18n-flat-structure-rationale.md" "docs\guides\i18n\flat-structure.md"
    Move-FileIfExists "docs\ESLINT-I18N-RULES.md" "docs\guides\i18n\eslint-rules.md"
    Move-FileIfExists "docs\I18N-NAMING-CONVENTION.md" "docs\guides\i18n\naming-convention.md"
    Move-FileIfExists "docs\I18N-LOADING-ORDER.md" "docs\guides\i18n\loading-order.md"
    
    # 部署文档
    Move-FileIfExists "docs\CDN_RESOURCE_ACCELERATION.md" "docs\deployment\cdn-acceleration.md"
    Move-FileIfExists "docs\JENKINS_SETUP.md" "docs\ci-cd\setup.md"
    
    # 架构文档
    Move-FileIfExists "docs\CHART_ARCHITECTURE_ANALYSIS.md" "docs\architecture\chart-system.md"
    Move-FileIfExists "auth\README.md" "docs\architecture\auth.md"
    
    # API 文档
    Move-FileIfExists "docs\STORAGE_USAGE_AUDIT.md" "docs\api\storage-usage.md"
    Move-FileIfExists "docs\USER-CHECK-API.md" "docs\api\user-check.md"
}

# ============================================================
# Phase 4: 规范命名
# ============================================================
if ($Phase4 -or $All) {
    Write-Host "`n=== Phase 4: 规范命名 ===" -ForegroundColor $InfoColor
    
    Write-Host "`n4.1 规范 packages/shared-components/ 文档命名" -ForegroundColor $InfoColor
    
    $renameMappings = @{
        "packages\shared-components\COMPONENT_ANALYSIS.md" = "packages\shared-components\component-analysis.md"
        "packages\shared-components\COMPONENT_ANALYSIS_FILTER_TABLE_GROUP.md" = "packages\shared-components\filter-table-group-analysis.md"
        "packages\shared-components\COMPONENT_NAMING_ANALYSIS.md" = "packages\shared-components\component-naming-analysis.md"
        "packages\shared-components\GROUP_COMPONENTS_ANALYSIS.md" = "packages\shared-components\group-components-analysis.md"
        "packages\shared-components\CIRCULAR_REFERENCE_GUIDE.md" = "packages\shared-components\circular-reference-guide.md"
        "packages\shared-components\BTC_LAYOUT_ENHANCED_PLAN.md" = "packages\shared-components\layout-enhanced-plan.md"
        "packages\shared-components\BTC_LAYOUT_UNIFIED_ASSESSMENT.md" = "packages\shared-components\layout-unified-assessment.md"
        "packages\shared-components\BTC_DOUBLE_LAYOUT_MIGRATION_ASSESSMENT.md" = "packages\shared-components\double-layout-migration-assessment.md"
        "packages\shared-components\BTC_FILTER_TABLE_GROUP_IMPLEMENTATION_PLAN.md" = "packages\shared-components\filter-table-group-implementation-plan.md"
    }
    
    foreach ($mapping in $renameMappings.GetEnumerator()) {
        if (Test-Path $mapping.Key) {
            Execute-Operation "重命名: $($mapping.Key) → $($mapping.Value)" {
                Move-Item $mapping.Key $mapping.Value -Force
            }
        }
    }
}

# ============================================================
# 统计
# ============================================================
Write-Host "`n=== 清理统计 ===" -ForegroundColor $InfoColor

$beforeCount = (Get-ChildItem -Recurse -Filter "*.md" | Where-Object { 
    $_.FullName -notmatch "node_modules|dist|dist-cdn|.pnpm" 
} | Measure-Object).Count

Write-Host "当前文档数量: $beforeCount" -ForegroundColor $InfoColor

if ($Phase1 -or $All) {
    $expectedDeletion = 40  # 预期删除数量
    Write-Host "Phase 1 预期删除: ~$expectedDeletion 个文档" -ForegroundColor $WarningColor
}

if ($Phase2 -or $All) {
    $expectedArchive = 30  # 预期归档数量
    Write-Host "Phase 2 预期归档: ~$expectedArchive 个文档" -ForegroundColor $WarningColor
}

Write-Host "`n✅ 清理脚本执行完成" -ForegroundColor $SuccessColor

if ($DryRun) {
    Write-Host "`n提示: 使用 -Phase1, -Phase2, -Phase3, -Phase4 或 -All 参数执行实际操作" -ForegroundColor $InfoColor
    Write-Host "示例: .\scripts\cleanup-docs.ps1 -Phase1" -ForegroundColor $InfoColor
} else {
    Write-Host "`n建议下一步:" -ForegroundColor $InfoColor
    Write-Host "1. 检查 git status，确认变更" -ForegroundColor $InfoColor
    Write-Host "2. 运行文档链接检查工具" -ForegroundColor $InfoColor
    Write-Host "3. 更新 docs/README.md 添加导航" -ForegroundColor $InfoColor
    Write-Host "4. 更新 apps/docs-app 的 VitePress 配置" -ForegroundColor $InfoColor
}

Write-Host ""
