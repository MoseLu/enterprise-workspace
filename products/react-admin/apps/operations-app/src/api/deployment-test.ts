/**
 * 部署测试 API 接口
 */

/**
 * 测试配置
 */
export interface TestConfig {
  apps: string[];
  timeout?: number;
  baseUrl?: string;
}

/**
 * 测试状态
 */
export interface TestStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  currentApp?: string;
  error?: string;
}

/**
 * 测试错误
 */
export interface TestError {
  type: string;
  message: string;
  url?: string;
}

/**
 * 测试结果
 */
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

/**
 * 测试报告
 */
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
 * 部署配置
 */
export interface DeployConfig {
  apps: Record<string, {
    domain: string;
    description: string;
  }>;
}

/**
 * 启动测试
 */
export async function startTest(config: TestConfig): Promise<string> {
  console.info('[deployment-test API] 启动测试，配置:', config);
  const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.info('[deployment-test API] 测试ID:', testId);
  return testId;
}

/**
 * 获取测试状态
 */
export async function getTestStatus(testId: string): Promise<TestStatus> {
  console.info('[deployment-test API] 获取测试状态，testId:', testId);

  if (!testId) {
    return {
      status: 'failed',
      error: '测试ID无效',
    };
  }

  // 从 localStorage 读取状态
  const statusKey = `deployment-test-${testId}`;
  const status = localStorage.getItem(statusKey);

  if (!status) {
    return {
      status: 'failed',
      error: '测试不存在',
    };
  }

  try {
    return JSON.parse(status);
  } catch {
    return {
      status: 'failed',
      error: '状态解析失败',
    };
  }
}

/**
 * 获取测试报告
 */
export async function getTestReport(testId: string): Promise<TestReport> {
  const resultsKey = `deployment-test-results-${testId}`;
  const reportStr = localStorage.getItem(resultsKey);

  if (!reportStr) {
    throw new Error('测试报告不存在');
  }

  try {
    return JSON.parse(reportStr);
  } catch {
    throw new Error('报告解析失败');
  }
}

/**
 * 停止测试
 */
export async function stopTest(testId: string): Promise<void> {
  console.info('[deployment-test API] 停止测试，testId:', testId);
  const statusKey = `deployment-test-${testId}`;
  const statusStr = localStorage.getItem(statusKey);

  if (statusStr) {
    try {
      const status = JSON.parse(statusStr);
      status.status = 'failed';
      status.error = '测试已停止';
      localStorage.setItem(statusKey, JSON.stringify(status));
    } catch {
      // 静默失败
    }
  }
}

/**
 * 下载测试报告
 */
export async function downloadReport(
  testId: string,
  format: 'html' | 'json' | 'markdown' = 'html'
): Promise<void> {
  console.info('[deployment-test API] 下载测试报告，testId:', testId, 'format:', format);

  const report = await getTestReport(testId);

  let content = '';
  let mimeType = 'text/plain';
  let extension = 'txt';

  if (format === 'json') {
    content = JSON.stringify(report, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  } else if (format === 'markdown') {
    content = `# 部署测试报告

## 摘要
- 总计: ${report.summary.total}
- 通过: ${report.summary.passed}
- 失败: ${report.summary.failed}

## 详细结果

${Object.entries(report.apps).map(([appName, result]) => `
### ${appName}
- 状态: ${result.success ? '通过' : '失败'}
- 耗时: ${result.duration}ms
${result.errors && result.errors.length > 0 ? `
- 错误:
${result.errors.map((error: TestError) => `  - ${error.message}`).join('\n')}
` : ''}
`).join('\n')}
`;
    extension = 'md';
  } else {
    // 默认 HTML 格式
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
  ${Object.entries(report.apps).map(([appName, result]) => `
    <div class="app-result ${result.success ? 'success' : 'failed'}">
      <h2>${appName}</h2>
      <p>状态: ${result.success ? '通过' : '失败'}</p>
      <p>耗时: ${result.duration}ms</p>
      ${result.errors && result.errors.length > 0 ? `
        <div>
          <h3>错误列表:</h3>
          ${result.errors.map((error: TestError) => `<div class="error">${error.message}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>`;
    mimeType = 'text/html';
    extension = 'html';
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
