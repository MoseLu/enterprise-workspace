/**
 * Zod 工具函数统一导出
 */

// 从 helpers 导出辅助函数
export {
  formatZodError,
  formatZodErrorString,
  optional,
  nullable,
  nullish,
  withDefault,
  validateAndTransform,
  safeValidate,
  mergeSchemas,
} from './helpers';

// 导出类型（需要单独导出）
export type { InferType } from './helpers';

// 从 validators 导出常用验证器
export {
  emailValidator,
  phoneValidator,
  urlValidator,
  idCardValidator,
  chineseValidator,
  numericStringValidator,
  nonEmptyStringValidator,
  positiveIntegerValidator,
  nonNegativeIntegerValidator,
  dateStringValidator,
  datetimeStringValidator,
  passwordStrengthValidator,
  smsCodeValidator,
  confirmPasswordValidator,
} from './validators';

// 重新导出 Zod 核心类型和函数
export { z } from 'zod';
export type { ZodType, ZodTypeAny, ZodError, ZodObject, ZodSchema } from 'zod';

// 导出验证失败上报服务
export {
  reportValidationError,
  configureReporting,
  flushReports,
  getPendingReportCount,
  clearErrorQueue,
} from './reporting';
export type {
  ValidationErrorType,
  ValidationErrorContext,
  ValidationErrorReport,
  ReportingConfig,
} from './reporting';
