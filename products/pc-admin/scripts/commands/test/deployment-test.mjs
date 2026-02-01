#!/usr/bin/env node

/**
 * 部署测试脚本
 * 测试生产环境构建产物是否能正常访问，测试构建产物引用是否正常
 */
import { logger } from '../../utils/logger.mjs';

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';

const rootDir = getRootDir();

// 测试结果存储
const testResults = {
  startTime: new Date().toISOString(),
  apps: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

/**
 * 读取部署配置
 */
function loadDeployConfig() {
  const configPath = join(rootDir, 'deploy.config.json');
  if (!existsSync(configPath)) {
    logger.error('❌ 部署配置文件不存在:', configPath);
    logger.info('💡 请使用 deploy.config.example.json 作为模板创建 deploy.config.json');
    process.exit(1);
  }
  
  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logger.error('❌ 读取部署配置失败:', error.message);
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    apps: [],
    all: false,
    timeout: 30000,
    baseUrl: null,
    outputDir: join(rootDir, 'test-results')
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--app':
        if (i + 1 < args.length) {
          result.apps.push(args[++i]);
        }
        break;
      case '--apps':
        if (i + 1 < args.length) {
          result.apps.push(...args[++i].split(',').map(a => a.trim()));
        }
        break;
      case '--all':
        result.all = true;
        break;
      case '--timeout':
        if (i + 1 < args.length) {
          result.timeout = parseInt(args[++i], 10) || 30000;
        }
        break;
      case '--base-url':
        if (i + 1 < args.length) {
          result.baseUrl = args[++i];
        }
        break;
      case '--output':
        if (i + 1 < args.length) {
          result.outputDir = args[++i];
        }
        break;
      case '--help':
      case '-h':
        logger.info(`
部署测试脚本

用法:
  node scripts/test-deployment.mjs [选项]

选项:
  --app <name>        测试单个应用
  --apps <app1,app2>  测试多个应用（逗号分隔）
  --all               测试所有应用
  --timeout <ms>      请求超时时间（默认: 30000）
  --base-url <url>    基础URL（默认: 从配置读取，使用 https://）
  --output <dir>      测试结果输出目录（默认: test-results）
  --help, -h          显示帮助信息

示例:
  node scripts/test-deployment.mjs --app admin-app
  node scripts/test-deployment.mjs --apps admin-app,logistics-app
  node scripts/test-deployment.mjs --all
        `);
        process.exit(0);
        break;
    }
  }

  return result;
}

/**
 * HTTP请求测试
 */
async function testHttpRequest(url, timeout = 30000) {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'BTC-ShopFlow-Deployment-Test/1.0'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const content = await response.text();

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      contentLength: content.length,
      content: content,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      responseTime,
      isTimeout: error.name === 'AbortError'
    };
  }
}

/**
 * 测试应用访问性
 */
async function testAppAccessibility(appName, appConfig, baseUrl, timeout) {
  const results = {
    accessibility: {
      homepage: null,
      assets: []
    },
    errors: []
  };

  const domain = appConfig.domain;
  const homepageUrl = baseUrl ? `${baseUrl}/${domain}` : `https://${domain}`;

  logger.info(`\n🔍 测试 ${appName} 访问性...`);
  logger.info(`   首页: ${homepageUrl}`);

  // 测试首页
  const homepageResult = await testHttpRequest(homepageUrl, timeout);
  results.accessibility.homepage = {
    url: homepageUrl,
    ...homepageResult
  };

  if (!homepageResult.success) {
    results.errors.push({
      type: 'homepage_access_failed',
      message: `首页访问失败: ${homepageResult.error || homepageResult.statusText}`,
      details: homepageResult
    });
    logger.info(`   ❌ 首页访问失败: ${homepageResult.error || homepageResult.statusText}`);
  } else {
    logger.info(`   ✅ 首页访问成功 (${homepageResult.status}, ${homepageResult.responseTime}ms)`);

    // 从HTML中提取资源引用
    if (homepageResult.content && homepageResult.contentLength > 0) {
      try {
        const htmlContent = homepageResult.content;
        const assetReferences = extractAssetReferencesFromHtml(htmlContent);
        
        logger.info(`   📦 发现 ${assetReferences.length} 个资源引用，开始验证...`);

        // 测试关键资源文件
        for (const ref of assetReferences.slice(0, 10)) { // 限制测试前10个资源
          const assetUrl = ref.startsWith('http') ? ref : `${homepageUrl}${ref.startsWith('/') ? '' : '/'}${ref}`;
          const assetResult = await testHttpRequest(assetUrl, timeout);
          
          results.accessibility.assets.push({
            url: assetUrl,
            reference: ref,
            ...assetResult
          });

          if (!assetResult.success) {
            results.errors.push({
              type: 'asset_not_found',
              message: `资源文件不存在: ${ref}`,
              url: assetUrl,
              details: assetResult
            });
            logger.info(`   ❌ 资源缺失: ${ref}`);
          }
        }
      } catch (error) {
        results.errors.push({
          type: 'html_parse_error',
          message: `解析HTML失败: ${error.message}`
        });
      }
    }
  }

  return results;
}

/**
 * 从HTML中提取资源引用
 */
function extractAssetReferencesFromHtml(htmlContent) {
  const references = [];
  
  // 提取 script src
  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      references.push(src);
    }
  }

  // 提取 link href (CSS)
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const href = match[1];
    if (href && !href.startsWith('data:') && !href.startsWith('blob:')) {
      references.push(href);
    }
  }

  return references;
}

/**
 * 测试应用引用完整性
 */
async function testAppReferences(appName, appConfig, baseUrl, timeout) {
  const results = {
    references: {
      total: 0,
      valid: 0,
      invalid: 0,
      missing: []
    },
    errors: []
  };

  const domain = appConfig.domain;
  const homepageUrl = baseUrl ? `${baseUrl}/${domain}` : `https://${domain}`;

  logger.info(`\n🔍 测试 ${appName} 引用完整性...`);

  // 获取首页HTML
  const homepageResult = await testHttpRequest(homepageUrl, timeout);
  if (!homepageResult.success || !homepageResult.content) {
    results.errors.push({
      type: 'cannot_fetch_homepage',
      message: '无法获取首页内容，跳过引用完整性测试'
    });
    return results;
  }

  const htmlContent = homepageResult.content;
  const assetReferences = extractAssetReferencesFromHtml(htmlContent);
  results.references.total = assetReferences.length;

  logger.info(`   📦 发现 ${assetReferences.length} 个资源引用`);

  // 验证每个资源引用
  for (const ref of assetReferences) {
    const assetUrl = ref.startsWith('http') ? ref : `${homepageUrl}${ref.startsWith('/') ? '' : '/'}${ref}`;
    const assetResult = await testHttpRequest(assetUrl, timeout);

    if (assetResult.success) {
      results.references.valid++;
    } else {
      results.references.invalid++;
      results.references.missing.push({
        reference: ref,
        url: assetUrl,
        error: assetResult.error || assetResult.statusText,
        status: assetResult.status
      });
      logger.info(`   ❌ 资源缺失: ${ref}`);
    }
  }

  logger.info(`   ✅ 有效: ${results.references.valid}, ❌ 无效: ${results.references.invalid}`);

  return results;
}

/**
 * 测试单个应用
 */
async function testApp(appName, config, args) {
  const appConfig = config.apps[appName];
  if (!appConfig) {
    logger.error(`❌ 应用 ${appName} 不在配置中`);
    return {
      success: false,
      error: `应用 ${appName} 不在配置中`
    };
  }

  const baseUrl = args.baseUrl || 'https://';
  const timeout = args.timeout || 30000;

  logger.info(`\n${'='.repeat(60)}`);
  logger.info(`🧪 开始测试: ${appName}`);
  logger.info(`   域名: ${appConfig.domain}`);
  logger.info(`   描述: ${appConfig.description}`);
  logger.info(`${'='.repeat(60)}`);

  const startTime = Date.now();
  const result = {
    appName,
    config: appConfig,
    startTime: new Date().toISOString(),
    accessibility: null,
    references: null,
    success: false,
    errors: [],
    duration: 0
  };

  try {
    // 测试访问性
    result.accessibility = await testAppAccessibility(appName, appConfig, baseUrl, timeout);
    result.errors.push(...result.accessibility.errors);

    // 测试引用完整性
    result.references = await testAppReferences(appName, appConfig, baseUrl, timeout);
    result.errors.push(...result.references.errors);

    // 判断是否成功
    const hasAccessibilityErrors = result.accessibility.errors.length > 0;
    const hasReferenceErrors = result.references.invalid > 0;
    result.success = !hasAccessibilityErrors && !hasReferenceErrors;

    result.duration = Date.now() - startTime;

    if (result.success) {
      logger.info(`\n✅ ${appName} 测试通过 (耗时: ${result.duration}ms)`);
      testResults.summary.passed++;
    } else {
      logger.info(`\n❌ ${appName} 测试失败 (耗时: ${result.duration}ms)`);
      testResults.summary.failed++;
    }
  } catch (error) {
    result.success = false;
    result.error = error.message;
    result.errors.push({
      type: 'test_error',
      message: error.message,
      stack: error.stack
    });
    result.duration = Date.now() - startTime;
    logger.error(`\n❌ ${appName} 测试出错: ${error.message}`);
    testResults.summary.failed++;
  }

  testResults.apps[appName] = result;
  testResults.summary.total++;

  return result;
}

/**
 * 主函数
 */
async function main() {
  const args = parseArgs();
  const config = loadDeployConfig();

  // 确定要测试的应用列表
  let appsToTest = [];
  if (args.all) {
    appsToTest = Object.keys(config.apps);
  } else if (args.apps.length > 0) {
    appsToTest = args.apps;
  } else {
    logger.error('❌ 请指定要测试的应用: --app <name>, --apps <app1,app2> 或 --all');
    process.exit(1);
  }

  logger.info('\n🚀 BTC ShopFlow 部署测试');
  logger.info('='.repeat(60));
  logger.info(`📋 测试应用: ${appsToTest.join(', ')}`);
  logger.info(`⏱️  超时时间: ${args.timeout}ms`);
  logger.info(`📁 输出目录: ${args.outputDir}`);
  logger.info('='.repeat(60));

  // 确保输出目录存在
  if (!existsSync(args.outputDir)) {
    mkdirSync(args.outputDir, { recursive: true });
  }

  // 测试每个应用
  for (const appName of appsToTest) {
    await testApp(appName, config, args);
  }

  // 生成测试报告
  testResults.endTime = new Date().toISOString();
  testResults.summary.duration = Date.now() - new Date(testResults.startTime).getTime();

  logger.info('\n' + '='.repeat(60));
  logger.info('📊 测试总结');
  logger.info('='.repeat(60));
  logger.info(`总计: ${testResults.summary.total}`);
  logger.info(`通过: ${testResults.summary.passed} ✅`);
  logger.info(`失败: ${testResults.summary.failed} ❌`);
  logger.info(`耗时: ${testResults.summary.duration}ms`);
  logger.info('='.repeat(60));

  // 保存测试结果
  const resultFile = join(args.outputDir, `test-results-${Date.now()}.json`);
  writeFileSync(resultFile, JSON.stringify(testResults, null, 2), 'utf-8');
  logger.info(`\n💾 测试结果已保存: ${resultFile}`);

  // 生成报告
  const reportGeneratorPath = join(__dirname, 'generate-test-report.mjs');
  if (existsSync(reportGeneratorPath)) {
    try {
      const reportModule = await import(`file://${reportGeneratorPath}`);
      if (reportModule.generateReports) {
        await reportModule.generateReports(testResults, args.outputDir);
      }
    } catch (error) {
      logger.warn('⚠️  生成报告失败:', error.message);
    }
  }

  // 根据测试结果退出
  if (testResults.summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// 运行主函数
main().catch((error) => {
  logger.error('❌ 测试执行失败:', error);
  process.exit(1);
});

