/**
 * 开发错误分类器
 * 对错误信息进行分级和分类
 */

/**
 * 错误严重程度
 */
export const SEVERITY = {
  CRITICAL: 'critical',  // 严重：导致构建失败
  ERROR: 'error',        // 错误：TypeScript/ESLint 错误
  WARNING: 'warning',    // 警告：不影响运行但需要注意
  INFO: 'info'           // 信息：一般提示信息
};

/**
 * 错误类型
 */
export const ERROR_TYPE = {
  TYPESCRIPT: 'typescript',
  ESLINT: 'eslint',
  BUILD: 'build',
  BUILD_WARNING: 'build_warning',  // 构建警告：可修复但不影响编译
  RUNTIME: 'runtime',
  DEPENDENCY: 'dependency',
  PORT: 'port',
  NETWORK: 'network',
  PERMISSION: 'permission',
  OTHER: 'other'
};

/**
 * 分类错误
 * @param {string} line - 错误行内容
 * @returns {object|null} 分类结果
 */
export function classifyError(line) {
  if (!line || typeof line !== 'string') {
    return null;
  }
  
  const normalizedLine = line.trim();
  
  // 跳过空行和正常输出
  if (!normalizedLine || normalizedLine.length === 0) {
    return null;
  }
  
  // TypeScript 错误
  if (normalizedLine.includes('error TS') || 
      normalizedLine.match(/\.tsx?\(\d+,\d+\): error TS/)) {
    return {
      severity: SEVERITY.ERROR,
      type: ERROR_TYPE.TYPESCRIPT,
      isError: true
    };
  }
  
  // ESLint 错误
  if (normalizedLine.includes('✖') && normalizedLine.includes('problems') ||
      normalizedLine.match(/error\s+[A-Z]\d+/i) ||
      normalizedLine.includes('ESLint')) {
    return {
      severity: SEVERITY.ERROR,
      type: ERROR_TYPE.ESLINT,
      isError: true
    };
  }
  
  // 构建警告（可修复但不影响编译）
  // 这些警告虽然不影响编译，但是可以解决的问题，应该被记录到数据库中
  // 例如：
  // - "Generated an empty chunk": 可以通过调整 Rollup 配置解决
  // - "named and default exports together": 可以通过调整导出方式解决
  if (normalizedLine.includes('Generated an empty chunk') ||
      normalizedLine.includes('empty chunk') ||
      (normalizedLine.includes('named and default exports together') && 
       normalizedLine.includes('Consumers of your bundle'))) {
    return {
      severity: SEVERITY.WARNING,
      type: ERROR_TYPE.BUILD_WARNING,
      isError: false,
      fixable: true  // 标记为可修复，用于后续优化和修复建议
    };
  }
  
  // 构建错误
  if (normalizedLine.includes('Build failed') ||
      normalizedLine.includes('ERROR') && normalizedLine.includes('build') ||
      normalizedLine.includes('Failed to compile')) {
    return {
      severity: SEVERITY.CRITICAL,
      type: ERROR_TYPE.BUILD,
      isError: true
    };
  }
  
  // 运行时错误
  if (normalizedLine.includes('Error:') ||
      normalizedLine.includes('Uncaught') ||
      normalizedLine.includes('ReferenceError') ||
      normalizedLine.includes('TypeError') ||
      normalizedLine.includes('SyntaxError')) {
    return {
      severity: SEVERITY.ERROR,
      type: ERROR_TYPE.RUNTIME,
      isError: true
    };
  }
  
  // 依赖错误
  if (normalizedLine.includes('Cannot find module') ||
      normalizedLine.includes('Module not found') ||
      normalizedLine.includes('ERR_MODULE_NOT_FOUND') ||
      (normalizedLine.includes('dependency') && normalizedLine.includes('not found'))) {
    // 检查是否是 shared-core 相关的模块未找到错误（可能是构建顺序问题）
    const isSharedCoreIssue = normalizedLine.includes('shared-core') && 
                              (normalizedLine.includes('dist/index.mjs') || normalizedLine.includes('dist/index.js'));
    
    return {
      severity: SEVERITY.ERROR,
      type: ERROR_TYPE.DEPENDENCY,
      isError: true,
      fixable: isSharedCoreIssue, // 标记为可修复（可能是构建顺序问题）
      suggestion: isSharedCoreIssue ? 'shared-core 可能还在构建中，请等待构建完成或手动构建: pnpm --filter @btc/shared-core build' : undefined
    };
  }
  
  // 端口错误
  if (normalizedLine.includes('port') && (normalizedLine.includes('already in use') || 
      normalizedLine.includes('EADDRINUSE') ||
      normalizedLine.includes('address already in use'))) {
    return {
      severity: SEVERITY.WARNING,
      type: ERROR_TYPE.PORT,
      isError: false
    };
  }
  
  // 网络错误
  if (normalizedLine.includes('ECONNREFUSED') ||
      normalizedLine.includes('ETIMEDOUT') ||
      normalizedLine.includes('network')) {
    return {
      severity: SEVERITY.WARNING,
      type: ERROR_TYPE.NETWORK,
      isError: false
    };
  }
  
  // 权限错误
  if (normalizedLine.includes('EACCES') ||
      normalizedLine.includes('permission denied') ||
      normalizedLine.includes('EADDRINUSE')) {
    return {
      severity: SEVERITY.WARNING,
      type: ERROR_TYPE.PERMISSION,
      isError: false
    };
  }
  
  // 警告信息
  if (normalizedLine.includes('warning') ||
      normalizedLine.includes('WARN') ||
      normalizedLine.includes('⚠')) {
    return {
      severity: SEVERITY.WARNING,
      type: ERROR_TYPE.OTHER,
      isError: false
    };
  }
  
  // 默认：可能是错误，但不确定
  if (normalizedLine.includes('error') || 
      normalizedLine.includes('Error') ||
      normalizedLine.includes('ERROR') ||
      normalizedLine.includes('✖') ||
      normalizedLine.includes('❌')) {
    return {
      severity: SEVERITY.ERROR,
      type: ERROR_TYPE.OTHER,
      isError: true
    };
  }
  
  return null;
}

/**
 * 提取错误详细信息
 * @param {string} line - 错误行
 * @param {object} classification - 分类结果
 * @returns {object} 错误详情
 */
export function extractErrorDetails(line, classification) {
  const details = {
    errorMessage: line.trim(),
    filePath: null,
    lineNumber: null,
    columnNumber: null,
    workspaceName: null,
    packageName: null
  };
  
  // 提取文件路径和行号（TypeScript 错误格式）
  const tsErrorMatch = line.match(/([^\s]+\.tsx?)\((\d+),(\d+)\)/);
  if (tsErrorMatch) {
    details.filePath = tsErrorMatch[1];
    details.lineNumber = parseInt(tsErrorMatch[2], 10);
    details.columnNumber = parseInt(tsErrorMatch[3], 10);
  }
  
  // 提取 workspace/package 名称（从路径中）
  if (details.filePath) {
    const pathParts = details.filePath.split(/[/\\]/);
    // 查找 apps/ 或 packages/ 目录
    const appsIndex = pathParts.indexOf('apps');
    const packagesIndex = pathParts.indexOf('packages');
    
    if (appsIndex !== -1 && pathParts[appsIndex + 1]) {
      details.workspaceName = pathParts[appsIndex + 1];
      details.packageName = `@btc/${details.workspaceName}`;
    } else if (packagesIndex !== -1 && pathParts[packagesIndex + 1]) {
      details.workspaceName = pathParts[packagesIndex + 1];
      details.packageName = `@btc/${details.workspaceName}`;
    }
  }
  
  // 从错误信息中提取 package 名称
  if (!details.packageName) {
    const packageMatch = line.match(/@btc\/[\w-]+/);
    if (packageMatch) {
      details.packageName = packageMatch[0];
    }
  }
  
  return details;
}

import { createHash } from 'crypto';

/**
 * 生成错误哈希（用于去重）
 * @param {object} errorDetails - 错误详情
 * @returns {string} 错误哈希
 */
export function generateErrorHash(errorDetails) {
  // 使用关键信息生成哈希
  const hashInput = [
    errorDetails.errorMessage?.substring(0, 200), // 限制长度
    errorDetails.filePath,
    errorDetails.lineNumber,
    errorDetails.packageName
  ].filter(Boolean).join('|');
  
  return createHash('sha256').update(hashInput).digest('hex').substring(0, 16);
}
