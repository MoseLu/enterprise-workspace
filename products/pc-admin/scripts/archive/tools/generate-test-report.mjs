#!/usr/bin/env node

/**
 * 测试报告生成器
 * 生成HTML、JSON和Markdown格式的测试报告
 */
import { logger } from '../../../utils/logger.mjs';

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * 生成HTML报告
 */
export function generateHtmlReport(testResults, outputDir) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>部署测试报告 - ${new Date(testResults.startTime).toLocaleString('zh-CN')}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    .summary-card.failed {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
    }
    .summary-card h3 {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .summary-card .value {
      font-size: 36px;
      font-weight: bold;
    }
    .app-section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }
    .app-name {
      font-size: 20px;
      font-weight: bold;
      color: #2c3e50;
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-badge.success {
      background: #d4edda;
      color: #155724;
    }
    .status-badge.failed {
      background: #f8d7da;
      color: #721c24;
    }
    .test-details {
      margin-top: 15px;
    }
    .test-item {
      margin: 10px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .test-item.error {
      background: #fff5f5;
      border-left: 4px solid #eb3349;
    }
    .test-item.success {
      background: #f0fff4;
      border-left: 4px solid #38ef7d;
    }
    .error-list {
      margin-top: 15px;
    }
    .error-item {
      padding: 10px;
      margin: 5px 0;
      background: #fff5f5;
      border-left: 4px solid #eb3349;
      border-radius: 4px;
    }
    .error-type {
      font-weight: bold;
      color: #eb3349;
      margin-bottom: 5px;
    }
    .error-message {
      color: #721c24;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f8f9fa;
      font-weight: bold;
      color: #2c3e50;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .timestamp {
      color: #666;
      font-size: 14px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 BTC ShopFlow 部署测试报告</h1>
    <p class="timestamp">
      测试开始时间: ${new Date(testResults.startTime).toLocaleString('zh-CN')}<br>
      测试结束时间: ${new Date(testResults.endTime).toLocaleString('zh-CN')}<br>
      总耗时: ${(testResults.summary.duration / 1000).toFixed(2)} 秒
    </p>

    <div class="summary">
      <div class="summary-card">
        <h3>总计</h3>
        <div class="value">${testResults.summary.total}</div>
      </div>
      <div class="summary-card success">
        <h3>通过</h3>
        <div class="value">${testResults.summary.passed}</div>
      </div>
      <div class="summary-card failed">
        <h3>失败</h3>
        <div class="value">${testResults.summary.failed}</div>
      </div>
      <div class="summary-card">
        <h3>通过率</h3>
        <div class="value">${testResults.summary.total > 0 ? ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1) : 0}%</div>
      </div>
    </div>

    ${Object.entries(testResults.apps).map(([appName, result]) => `
      <div class="app-section">
        <div class="app-header">
          <div>
            <div class="app-name">${appName}</div>
            <div style="color: #666; font-size: 14px; margin-top: 5px;">
              ${result.config?.description || ''} - ${result.config?.domain || ''}
            </div>
          </div>
          <span class="status-badge ${result.success ? 'success' : 'failed'}">
            ${result.success ? '✅ 通过' : '❌ 失败'}
          </span>
        </div>

        <div class="test-details">
          <div style="margin-bottom: 15px;">
            <strong>测试耗时:</strong> ${result.duration}ms
          </div>

          ${result.accessibility ? `
            <h3 style="margin: 15px 0 10px 0; color: #2c3e50;">访问性测试</h3>
            ${result.accessibility?.homepage ? `
              <div class="test-item ${result.accessibility.homepage.success ? 'success' : 'error'}">
                <strong>首页访问:</strong> ${(result.accessibility.homepage.url || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}<br>
                <span>状态: ${(result.accessibility.homepage.status || 'N/A').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                ${result.accessibility.homepage.responseTime ? ` | 响应时间: ${result.accessibility.homepage.responseTime}ms` : ''}
                ${result.accessibility.homepage.error ? ` | 错误: ${(result.accessibility.homepage.error || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}` : ''}
              </div>
            ` : ''}
            ${result.accessibility.assets && result.accessibility.assets.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>资源路径</th>
                    <th>状态</th>
                    <th>响应时间</th>
                  </tr>
                </thead>
                <tbody>
                  ${result.accessibility.assets.map(asset => `
                    <tr>
                      <td>${(asset.reference || asset.url || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                      <td>${asset.success ? '✅' : '❌'} ${(asset.status || asset.error || 'N/A').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                      <td>${asset.responseTime || 'N/A'}ms</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          ` : ''}

          ${result.references ? `
            <h3 style="margin: 15pxpx 0 10px 0; color: #2c3e50;">引用完整性测试</h3>
            <div class="test-item">
              <strong>总引用数:</strong> ${result.references.references?.total || 0}<br>
              <strong>有效引用:</strong> ${result.references.references?.valid || 0}<br>
              <strong>无效引用:</strong> ${result.references.references?.invalid || 0}
            </div>
            ${result.references.references?.missing && result.references.references.missing.length > 0 ? `
              <div class="error-list">
                <h4 style="color: #eb3349; margin: 10px 0;">缺失的资源:</h4>
                ${result.references.references.missing.map(missing => `
                  <div class="error-item">
                    <div class="error-type">${(missing.reference || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                    <div class="error-message">${(missing.error || missing.status || '资源不存在').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : ''}

          ${result.errors && result.errors.length > 0 ? `
            <h3 style="margin: 15px 0 10px 0; color: #eb3349;">错误列表</h3>
            <div class="error-list">
              ${result.errors.map((error, index) => `
                <div class="error-item">
                  <div class="error-type">错误 #${index + 1}: ${(error.type || '未知错误').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                  <div class="error-message">${(error.message || error.error || '无详细信息').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                  ${error.url ? `<div style="color: #666; font-size: 12px; margin-top: 5px;">URL: ${error.url.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  const htmlPath = join(outputDir, `test-report-${Date.now()}.html`);
  writeFileSync(htmlPath, html, 'utf-8');
  logger.info(`📄 HTML报告已生成: ${htmlPath}`);
  return htmlPath;
}

/**
 * 生成Markdown报告
 */
export function generateMarkdownReport(testResults, outputDir) {
  let md = `# 🚀 BTC ShopFlow 部署测试报告\n\n`;
  md += `**测试时间:** ${new Date(testResults.startTime).toLocaleString('zh-CN')} - ${new Date(testResults.endTime).toLocaleString('zh-CN')}\n`;
  md += `**总耗时:** ${(testResults.summary.duration / 1000).toFixed(2)} 秒\n\n`;

  md += `## 📊 测试概览\n\n`;
  md += `| 项目 | 数量 |\n`;
  md += `|------|------|\n`;
  md += `| 总计 | ${testResults.summary.total} |\n`;
  md += `| ✅ 通过 | ${testResults.summary.passed} |\n`;
  md += `| ❌ 失败 | ${testResults.summary.failed} |\n`;
  md += `| 通过率 | ${testResults.summary.total > 0 ? ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1) : 0}% |\n\n`;

  md += `## 📋 详细结果\n\n`;
  for (const [appName, result] of Object.entries(testResults.apps)) {
    md += `### ${appName} ${result.success ? '✅' : '❌'}\n\n`;
    md += `- **域名:** ${result.config?.domain || 'N/A'}\n`;
    md += `- **描述:** ${result.config?.description || 'N/A'}\n`;
    md += `- **耗时:** ${result.duration}ms\n`;
    md += `- **状态:** ${result.success ? '✅ 通过' : '❌ 失败'}\n\n`;

    if (result.accessibility) {
      md += `#### 访问性测试\n\n`;
      if (result.accessibility.homepage) {
        md += `- **首页:** ${result.accessibility.homepage.url}\n`;
        md += `  - 状态: ${result.accessibility.homepage.status || 'N/A'}\n`;
        if (result.accessibility.homepage.responseTime) {
          md += `  - 响应时间: ${result.accessibility.homepage.responseTime}ms\n`;
        }
        if (result.accessibility.homepage.error) {
          md += `  - 错误: ${result.accessibility.homepage.error}\n`;
        }
        md += `\n`;
      }
      if (result.accessibility.assets && result.accessibility.assets.length > 0) {
        md += `**资源文件测试:**\n\n`;
        md += `| 资源路径 | 状态 | 响应时间 |\n`;
        md += `|---------|------|----------|\n`;
        for (const asset of result.accessibility.assets) {
          md += `| ${asset.reference || asset.url} | ${asset.success ? '✅' : '❌'} ${asset.status || asset.error || 'N/A'} | ${asset.responseTime || 'N/A'}ms |\n`;
        }
        md += `\n`;
      }
    }

    if (result.references) {
      md += `#### 引用完整性测试\n\n`;
      md += `- **总引用数:** ${result.references.references?.total || 0}\n`;
      md += `- **有效引用:** ${result.references.references?.valid || 0}\n`;
      md += `- **无效引用:** ${result.references.references?.invalid || 0}\n\n`;
      
      if (result.references.references?.missing && result.references.references.missing.length > 0) {
        md += `**缺失的资源:**\n\n`;
        for (const missing of result.references.references.missing) {
          md += `- \`${missing.reference}\`: ${missing.error || missing.status || '资源不存在'}\n`;
        }
        md += `\n`;
      }
    }

    if (result.errors && result.errors.length > 0) {
      md += `#### 错误列表\n\n`;
      for (const [index, error] of result.errors.entries()) {
        md += `${index + 1}. **${error.type || '未知错误'}**: ${error.message || error.error || '无详细信息'}\n`;
        if (error.url) {
          md += `   - URL: ${error.url}\n`;
        }
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  const mdPath = join(outputDir, `test-report-${Date.now()}.md`);
  writeFileSync(mdPath, md, 'utf-8');
  logger.info(`📄 Markdown报告已生成: ${mdPath}`);
  return mdPath;
}

/**
 * 生成所有报告
 */
export async function generateReports(testResults, outputDir) {
  logger.info('\n📊 开始生成测试报告...');

  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 生成JSON报告（已由主脚本生成）
  const jsonPath = join(outputDir, `test-results-${Date.now()}.json`);
  writeFileSync(jsonPath, JSON.stringify(testResults, null, 2), 'utf-8');
  logger.info(`📄 JSON报告已生成: ${jsonPath}`);

  // 生成HTML报告
  const htmlPath = generateHtmlReport(testResults, outputDir);

  // 生成Markdown报告
  const mdPath = generateMarkdownReport(testResults, outputDir);

  logger.info('\n✅ 所有测试报告已生成完成！');
  
  return {
    json: jsonPath,
    html: htmlPath,
    markdown: mdPath
  };
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const testResultsPath = process.argv[2];
  if (!testResultsPath) {
    logger.error('❌ 请提供测试结果JSON文件路径');
    process.exit(1);
  }

  const testResults = JSON.parse(readFileSync(testResultsPath, 'utf-8'));
  const outputDir = process.argv[3] || './test-results';
  
  generateReports(testResults, outputDir).catch(error => {
    logger.error('❌ 生成报告失败:', error);
    process.exit(1);
  });
}

