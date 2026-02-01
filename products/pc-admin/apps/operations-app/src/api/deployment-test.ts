/**
 * 部署测试API接口
 */
;

import { storage } from '@btc/shared-utils';
import { logger } from '@btc/shared-core';

export interface TestConfig {
  apps: string[];
  timeout?: number;
  baseUrl?: string;
}

export interface TestStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  currentApp?: string;
  error?: string;
}

export interface TestError {
  type: string;
  message: string;
  url?: string;
}

export interface TestResult {
  appName: string;
  config: {
    domain: string;
    description: string;
  };
  startTime: string;
  accessibility?: Record<string, unknown>;
  references?: string[];
  success: boolean;
  errors: TestError[];
  duration: number;
}

export interface TestReport {
  startTime: string;
  endTime: string;
  apps: Record<string, TestResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

/**
 * 启动测试
 */
export async function startTest(config: TestConfig): Promise<string> {
  console.info('[deployment-test API] 启动测试，配置:', config);
  // 直接使用本地执行模式（前端实现）
  const testId = await startLocalTest(config);
  console.info('[deployment-test API] 本地测试ID:', testId);
  return testId;
}

/**
 * 本地启动测试（直接调用测试脚本）
 */
async function startLocalTest(config: TestConfig): Promise<string> {
  // 生成测试ID
  const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.info('[deployment-test API] 生成测试ID:', testId);

  // 在后台执行测试
  console.info('[deployment-test API] 启动后台测试执行...');
  executeTestInBackground(testId, config);

  return testId;
}

/**
 * 在后台执行测试
 */
async function executeTestInBackground(testId: string, config: TestConfig) {
  console.info('[deployment-test API] 开始后台执行测试，testId:', testId, 'config:', config);
  // 将测试状态存储到localStorage
  const testStatusKey = `deployment-test-${testId}`;
  const testResultsKey = `deployment-test-results-${testId}`;

  // 初始化状态为 pending，然后立即转为 running
  const status: TestStatus = {
    status: 'pending',
    progress: 0,
  };
  console.info('[deployment-test API] 设置初始状态为 pending');
  storage.set(testStatusKey, status);

  // 使用 setTimeout 确保状态更新能被轮询捕获
  setTimeout(async () => {
    console.info('[deployment-test API] 开始执行测试逻辑...');
    try {
      // 更新为 running 状态
      console.info('[deployment-test API] 更新状态为 running');
      status.status = 'running';
      status.progress = 0;
      storage.set(testStatusKey, status);

      // 加载部署配置
      const deployConfig = await loadDeployConfig();
      console.info('[deployment-test API] 部署配置加载完成:', deployConfig);

      // 执行实际测试
      const startTime = Date.now();
      const totalApps = config.apps.length;
      const results: TestReport = {
        startTime: new Date().toISOString(),
        endTime: '',
        apps: {},
        summary: {
          total: totalApps,
          passed: 0,
          failed: 0,
          duration: 0,
        },
      };

      for (let i = 0; i < totalApps; i++) {
        const appName = config.apps[i];
        if (!appName) {
          continue;
        }
        status.currentApp = appName;
        status.progress = Math.round(((i + 1) / totalApps) * 100);
        storage.set(testStatusKey, status);

        console.info(`[deployment-test API] 测试应用: ${appName}`);
        const appConfig = deployConfig.apps?.[appName];

        if (!appConfig) {
          results.apps[appName] = {
            appName,
            config: { domain: '', description: '' },
            startTime: new Date().toISOString(),
            success: false,
            errors: [{ type: 'config_error', message: `应用 ${appName} 的配置未找到` }],
            duration: 0,
          };
          results.summary.failed++;
          continue;
        }

        const appStartTime = Date.now();
        const appResult = await testApp(appName, appConfig, config.timeout || 30000, config.baseUrl);
        const appDuration = Date.now() - appStartTime;

        results.apps[appName] = {
          appName,
          config: {
            domain: appConfig.domain || '',
            description: appConfig.description || '',
          },
          startTime: new Date().toISOString(),
          success: appResult.success,
          errors: appResult.errors,
          duration: appDuration,
        };

        if (appResult.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      }

      // 测试完成
      results.endTime = new Date().toISOString();
      results.summary.duration = Date.now() - startTime;
      status.status = 'completed';
      status.progress = 100;
      storage.set(testStatusKey, status);
      storage.set(testResultsKey, results);

      console.info('[deployment-test API] 测试完成:', results);
    } catch (error: unknown) {
      logger.error('[deployment-test API] 测试执行失败:', error);
      status.status = 'failed';
      status.error = error instanceof Error ? error.message : String(error);
      storage.set(testStatusKey, status);
    }
  }, 100); // 100ms 后开始执行，确保状态能被轮询捕获
}

export interface DeployConfig {
  apps: Record<string, {
    domain: string;
    description: string;
  }>;
}

/**
 * 加载部署配置
 */
async function loadDeployConfig(): Promise<DeployConfig> {
  try {
    // 尝试从 /deploy.config.json 加载配置
    const response = await fetch('/deploy.config.json');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('无法加载部署配置');
  } catch (error) {
    console.warn('[deployment-test API] 无法从 /deploy.config.json 加载配置，使用默认配置');
    // 返回默认配置（可以根据实际情况调整）
    return {
      apps: {
        'system-app': { domain: 'system.bellis.com.cn', description: '系统应用' },
        'admin-app': { domain: 'admin.bellis.com.cn', description: '管理应用' },
        'logistics-app': { domain: 'logistics.bellis.com.cn', description: '物流应用' },
        'quality-app': { domain: 'quality.bellis.com.cn', description: '质量应用' },
        'production-app': { domain: 'production.bellis.com.cn', description: '生产应用' },
        'engineering-app': { domain: 'engineering.bellis.com.cn', description: '工程应用' },
        'finance-app': { domain: 'finance.bellis.com.cn', description: '财务应用' },
      },
    };
  }
}

export interface AppConfig {
  domain: string;
  description: string;
}

/**
 * 测试单个应用
 */
async function testApp(appName: string, appConfig: AppConfig, timeout: number, baseUrl?: string): Promise<{ success: boolean; errors: TestError[] }> {
  const errors: TestError[] = [];
  const domain = appConfig.domain;
  const homepageUrl = baseUrl || `https://${domain}`;

  try {
    // 1. 测试首页可访问性
    console.info(`[deployment-test API] 测试 ${appName} 首页可访问性: ${homepageUrl}`);
    const homePageTest = await testHttpRequest(homepageUrl, timeout);

    if (!homePageTest.success) {
      errors.push({
        type: 'accessibility',
        message: `首页访问失败: ${homePageTest.status} ${homePageTest.statusText}`,
        url: homepageUrl,
      });
      return { success: false, errors };
    }

    // 2. 测试资源引用完整性
    if (homePageTest.content) {
      console.info(`[deployment-test API] 测试 ${appName} 资源引用完整性`);
      const assetReferences = extractAssetReferencesFromHtml(homePageTest.content);

      // 测试前10个关键资源
      for (const ref of assetReferences.slice(0, 10)) {
        const assetUrl = ref.startsWith('http') ? ref : `${homepageUrl}${ref.startsWith('/') ? '' : '/'}${ref}`;
        const assetResult = await testHttpRequest(assetUrl, timeout);

        if (!assetResult.success) {
          errors.push({
            type: 'asset_not_found',
            message: `资源文件不存在: ${ref}`,
            url: assetUrl,
          });
        }
      }
    }

    return { success: errors.length === 0, errors };
  } catch (error: unknown) {
    errors.push({
      type: 'test_error',
      message: error instanceof Error ? error.message : String(error),
    });
    return { success: false, errors };
  }
}

/**
 * 测试HTTP请求
 */
async function testHttpRequest(url: string, timeout: number): Promise<{ success: boolean; status?: number; statusText?: string; content?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
      };
    }

    const content = await response.text();
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      content,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        status: 0,
        statusText: '请求超时',
      };
    }
    return {
      success: false,
      status: 0,
      statusText: error instanceof Error ? error.message : '请求失败',
    };
  }
}

/**
 * 从HTML中提取资源引用
 */
function extractAssetReferencesFromHtml(htmlContent: string): string[] {
  const references: string[] = [];

  // 提取 script src
  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('javascript:')) {
      references.push(src);
    }
  }

  // 提取 link href (CSS)
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const href = match[1];
    if (href && !href.startsWith('data:') && !href.startsWith('blob:') && !href.startsWith('javascript:')) {
      references.push(href);
    }
  }

  return references;
}

/**
 * 获取测试状态
 */
export async function getTestStatus(testId: string): Promise<TestStatus> {
  console.info('[deployment-test API] 获取测试状态，testId:', testId);

  // 如果testId为undefined或空，直接返回错误状态
  if (!testId) {
    console.warn('[deployment-test API] testId为空，返回失败状态');
    return {
      status: 'failed',
      error: '测试ID无效',
    };
  }

  // 直接从 storage 读取状态（前端实现）
  const statusKey = `deployment-test-${testId}`;
  const status = storage.get<TestStatus>(statusKey);

  console.info('[deployment-test API] storage key:', statusKey, 'value:', status);

  if (!status) {
    console.warn('[deployment-test API] 测试状态不存在');
    return {
      status: 'failed',
      error: '测试不存在',
    };
  }

  console.info('[deployment-test API] 从 storage 读取的状态:', status);
  return status;
}

/**
 * 获取测试报告
 */
export async function getTestReport(testId: string): Promise<TestReport> {
  // 直接从 storage 读取报告（前端实现）
  console.info('[deployment-test API] 获取测试报告，testId:', testId);
  const resultsKey = `deployment-test-results-${testId}`;
  const report = storage.get<TestReport>(resultsKey);

  if (!report) {
    throw new Error('测试报告不存在');
  }

  console.info('[deployment-test API] 从 storage 读取的报告:', report);
  return report;
}

/**
 * 停止测试
 */
export async function stopTest(testId: string): Promise<void> {
  // 前端实现：更新状态为停止
  console.info('[deployment-test API] 停止测试，testId:', testId);
  const statusKey = `deployment-test-${testId}`;
  const status = storage.get<TestStatus>(statusKey);

  if (status) {
    status.status = 'failed';
    status.error = '测试已停止';
    storage.set(statusKey, status);
  }
}

/**
 * 下载测试报告
 */
export async function downloadReport(testId: string, format: 'html' | 'json' | 'markdown' = 'html'): Promise<void> {
  console.info('[deployment-test API] 下载测试报告，testId:', testId, 'format:', format);

  // 从localStorage获取报告
  const report = await getTestReport(testId);

  // 根据格式生成内容
  let content = '';
  let mimeType = 'text/plain';
  let extension = 'txt';

  if (format === 'json') {
    content = JSON.stringify(report, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  } else if (format === 'html') {
    // 简单的HTML报告
    content = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>部署测试报告</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    .summary { margin: 20px 0; }
    .app-result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .success { background-color: #f0f9ff; }
    .failed { background-color: #fef2f2; }
    .error { color: #dc2626; margin: 5px 0; }
  </style>
</head>
<body>
  <h1>部署测试报告</h1>
  <div class="summary">
    <p>总计: ${report.summary.total}</p>
    <p>通过: ${report.summary.passed}</p>
    <p>失败: ${report.summary.failed}</p>
  </div>
  ${Object.entries(report.apps).map(([appName, result]: [string, TestResult]) => `
    <div class="app-result ${result.success ? 'success' : 'failed'}">
      <h2>${appName}</h2>
      <p>状态: ${result.success ? '通过' : '失败'}</p>
      <p>耗时: ${result.duration}ms</p>
      ${result.errors && result.errors.length > 0 ? `
        <div>
          <h3>错误列表:</h3>
          ${result.errors.map((error: TestError) => `<div class="error">${error.message || String(error)}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>`;
    mimeType = 'text/html';
    extension = 'html';
  } else if (format === 'markdown') {
    content = `# 部署测试报告

## 摘要
- 总计: ${report.summary.total}
- 通过: ${report.summary.passed}
- 失败: ${report.summary.failed}

## 详细结果

${Object.entries(report.apps).map(([appName, result]: [string, TestResult]) => `
### ${appName}
- 状态: ${result.success ? '✅ 通过' : '❌ 失败'}
- 耗时: ${result.duration}ms
${result.errors && result.errors.length > 0 ? `
- 错误:
${result.errors.map((error: TestError) => `  - ${error.message || String(error)}`).join('\n')}
` : ''}
`).join('\n')}
`;
    extension = 'md';
  }

  // 创建下载链接
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-report-${testId}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

