/**
 * Zod 表单验证工具
 * 提供 Zod schema 与 Element Plus 表单验证规则的转换
 */

import { z } from 'zod';
import type { FormRules } from 'element-plus';
import type { FormItem, FormItemRule } from '../../btc/crud/types';

/**
 * 将 Zod schema 转换为 Element Plus 验证规则
 * @param schema Zod schema
 * @param fieldName 字段名称（用于生成错误消息）
 * @returns Element Plus 验证规则数组
 */
export function zodToElementPlusRules(
  schema: z.ZodTypeAny,
  fieldName: string = '字段'
): FormRules[string] {
  const rules: FormRules[string] = [];

  // 先检查是否是可选/可空/默认值包装的 schema
  let innerSchema = schema;
  let isOptional = false;
  
  if (schema instanceof z.ZodOptional) {
    isOptional = true;
    innerSchema = schema._def.innerType;
  } else if (schema instanceof z.ZodNullable) {
    innerSchema = schema._def.innerType;
  } else if (schema instanceof z.ZodDefault) {
    innerSchema = schema._def.innerType;
  }

  // 处理 Zod 的各个类型（使用内层 schema）
  if (innerSchema instanceof z.ZodString) {
    // 字符串验证
    if (innerSchema._def.checks) {
      innerSchema._def.checks.forEach((check: any) => {
        switch (check.kind) {
          case 'min':
            rules.push({
              min: check.value,
              message: `${fieldName}至少需要${check.value}个字符`,
              trigger: ['blur', 'change'],
            });
            break;
          case 'max':
            rules.push({
              max: check.value,
              message: `${fieldName}最多${check.value}个字符`,
              trigger: ['blur', 'change'],
            });
            break;
          case 'email':
            rules.push({
              type: 'email',
              message: `${fieldName}格式不正确`,
              trigger: ['blur', 'change'],
            });
            break;
          case 'url':
            rules.push({
              type: 'url',
              message: `${fieldName}必须是有效的URL`,
              trigger: ['blur', 'change'],
            });
            break;
          case 'regex':
            rules.push({
              pattern: check.regex,
              message: `${fieldName}格式不正确`,
              trigger: ['blur', 'change'],
            });
            break;
        }
      });
    }
  } else if (innerSchema instanceof z.ZodNumber) {
    // 数字验证
    if (innerSchema._def.checks) {
      innerSchema._def.checks.forEach((check: any) => {
        switch (check.kind) {
          case 'min':
            rules.push({
              type: 'number',
              min: check.value,
              message: `${fieldName}不能小于${check.value}`,
              trigger: ['blur', 'change'],
            });
            break;
          case 'max':
            rules.push({
              type: 'number',
              max: check.value,
              message: `${fieldName}不能大于${check.value}`,
              trigger: ['blur', 'change'],
            });
            break;
          case 'int':
            rules.push({
              type: 'integer',
              message: `${fieldName}必须是整数`,
              trigger: ['blur', 'change'],
            });
            break;
        }
      });
    }
  } else if (innerSchema instanceof z.ZodArray) {
    // 数组验证
    if (innerSchema._def.minLength) {
      rules.push({
        type: 'array',
        min: innerSchema._def.minLength.value,
        message: `${fieldName}至少需要${innerSchema._def.minLength.value}项`,
        trigger: ['blur', 'change'],
      });
    }
    if (innerSchema._def.maxLength) {
      rules.push({
        type: 'array',
        max: innerSchema._def.maxLength.value,
        message: `${fieldName}最多${innerSchema._def.maxLength.value}项`,
        trigger: ['blur', 'change'],
      });
    }
  }

  // 如果 schema 是对象，为整个对象创建验证规则
  if (innerSchema instanceof z.ZodObject) {
    // 对象类型的验证需要递归处理每个字段
    // 这里返回一个自定义验证器
    rules.push({
      validator: (rule: any, value: any, callback: any) => {
        const result = schema.safeParse(value);
        if (result.success) {
          callback();
        } else {
          const firstError = result.error.errors[0];
          callback(new Error(firstError.message || `${fieldName}验证失败`));
        }
      },
      trigger: ['blur', 'change'],
    });
  } else if (innerSchema instanceof z.ZodEnum) {
    // 枚举类型：添加选项验证
    const enumValues = innerSchema._def.values;
    rules.push({
      validator: (rule: any, value: any, callback: any) => {
        if (enumValues.includes(value)) {
          callback();
        } else {
          callback(new Error(`${fieldName}必须是以下值之一: ${enumValues.join(', ')}`));
        }
      },
      trigger: ['blur', 'change'],
    });
  } else if (innerSchema instanceof z.ZodUnion) {
    // 联合类型：使用自定义验证器
    rules.push({
      validator: (rule: any, value: any, callback: any) => {
        const result = schema.safeParse(value);
        if (result.success) {
          callback();
        } else {
          const firstError = result.error.errors[0];
          callback(new Error(firstError.message || `${fieldName}验证失败`));
        }
      },
      trigger: ['blur', 'change'],
    });
  } else if (innerSchema instanceof z.ZodTuple) {
    // 元组类型：验证数组长度和每个元素
    rules.push({
      validator: (rule: any, value: any, callback: any) => {
        const result = schema.safeParse(value);
        if (result.success) {
          callback();
        } else {
          const firstError = result.error.errors[0];
          callback(new Error(firstError.message || `${fieldName}验证失败`));
        }
      },
      trigger: ['blur', 'change'],
    });
  } else if (innerSchema instanceof z.ZodBoolean) {
    // 布尔类型：通常不需要额外验证规则
    // 如果需要必填，会在下面添加
  } else if (innerSchema instanceof z.ZodDate) {
    // 日期类型：添加日期格式验证
    rules.push({
      type: 'date',
      message: `${fieldName}必须是有效的日期`,
      trigger: ['blur', 'change'],
    });
  } else if (!isOptional) {
    // 非可选字段，添加必填验证
    rules.unshift({
      required: true,
      message: `请输入${fieldName}`,
      trigger: ['blur', 'change'],
    });
  }

  return rules;
}

/**
 * 使用 Zod schema 验证表单数据
 * @param schema Zod schema
 * @param data 表单数据
 * @param context 上下文信息（用于上报，可选）
 * @returns 验证结果 { success: boolean, data?: T, errors?: ZodError }
 */
export function validateFormData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: { formField?: string; schemaName?: string }
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // 表单验证失败通常不需要上报（因为用户会看到错误提示）
    // 但如果需要，可以在这里添加上报逻辑
    // try {
    //   const { reportValidationError } = require('../../utils/zod/reporting');
    //   reportValidationError('form', context?.schemaName || 'FormData', result.error, { formField: context?.formField });
    // } catch {}
    return { success: false, errors: result.error };
  }
}

/**
 * 根据 FormItem 配置自动生成 Zod schema
 * @param formItems 表单项配置数组
 * @returns Zod object schema
 */
export function createFormSchema(formItems: FormItem[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  formItems.forEach((item) => {
    if (!item.prop) return;

    let fieldSchema: z.ZodTypeAny;

    // 如果已有 zodSchema，直接使用
    if (item.zodSchema) {
      shape[item.prop] = item.zodSchema;
      return;
    }

    // 根据 type 创建基础 schema
    switch (item.type) {
      case 'number':
        fieldSchema = z.number();
        break;
      case 'date':
      case 'datetime':
        fieldSchema = z.string().or(z.date());
        break;
      case 'switch':
        fieldSchema = z.boolean();
        break;
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'cascader':
      case 'tree-select':
        // 这些类型可能是字符串、数字或数组
        fieldSchema = z.any();
        break;
      default:
        fieldSchema = z.string();
    }

    // 应用验证规则
    // 处理 rules（可能是数组或单个对象）
    const rulesArray: FormItemRule[] = Array.isArray(item.rules) 
      ? item.rules 
      : (item.rules ? [item.rules] : []);
    
    if (rulesArray.length > 0) {
      rulesArray.forEach((rule) => {

        // 处理 required
        if (rule.required) {
          if (fieldSchema instanceof z.ZodString) {
            fieldSchema = fieldSchema.min(1, rule.message || `${item.label}不能为空`);
          } else if (fieldSchema instanceof z.ZodNumber) {
            // 数字类型不能直接用 min(1) 表示必填，需要 refine
            fieldSchema = fieldSchema.refine((val) => val != null, rule.message || `${item.label}不能为空`);
          } else if (fieldSchema instanceof z.ZodArray) {
            fieldSchema = fieldSchema.min(1, rule.message || `${item.label}不能为空`);
          }
        }

        // 处理 min（字符串长度或数字最小值）
        if (typeof rule.min === 'number') {
          if (fieldSchema instanceof z.ZodString) {
            fieldSchema = fieldSchema.min(rule.min, rule.message || `${item.label}至少需要${rule.min}个字符`);
          } else if (fieldSchema instanceof z.ZodNumber) {
            fieldSchema = fieldSchema.min(rule.min, rule.message || `${item.label}不能小于${rule.min}`);
          } else if (fieldSchema instanceof z.ZodArray) {
            fieldSchema = fieldSchema.min(rule.min, rule.message || `${item.label}至少需要${rule.min}项`);
          }
        }

        // 处理 max（字符串长度或数字最大值）
        if (typeof rule.max === 'number') {
          if (fieldSchema instanceof z.ZodString) {
            fieldSchema = fieldSchema.max(rule.max, rule.message || `${item.label}最多${rule.max}个字符`);
          } else if (fieldSchema instanceof z.ZodNumber) {
            fieldSchema = fieldSchema.max(rule.max, rule.message || `${item.label}不能大于${rule.max}`);
          } else if (fieldSchema instanceof z.ZodArray) {
            fieldSchema = fieldSchema.max(rule.max, rule.message || `${item.label}最多${rule.max}项`);
          }
        }

        // 处理 pattern（正则表达式）
        if (rule.pattern && fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.regex(rule.pattern, rule.message || `${item.label}格式不正确`);
        }

        // 处理 type（数据类型验证）
        if (rule.type) {
          switch (rule.type) {
            case 'email':
              if (fieldSchema instanceof z.ZodString) {
                fieldSchema = fieldSchema.email(rule.message || `${item.label}格式不正确`);
              }
              break;
            case 'number':
            case 'integer':
            case 'float':
              // 如果已经是数字类型，不需要转换
              if (!(fieldSchema instanceof z.ZodNumber)) {
                fieldSchema = z.number();
              }
              if (rule.type === 'integer' && fieldSchema instanceof z.ZodNumber) {
                fieldSchema = fieldSchema.int(rule.message || `${item.label}必须是整数`);
              }
              break;
          }
        }

        // 处理自定义 validator 函数
        if (rule.validator && typeof rule.validator === 'function') {
          // 将 Element Plus 的 validator 转换为 Zod refine
          fieldSchema = fieldSchema.refine(
            (val) => {
              // 创建一个模拟的 callback 函数来捕获验证结果
              let isValid = true;
              let errorMessage = '';
              try {
                rule.validator!(
                  {} as any, // rule 对象
                  val, // value
                  (error?: Error) => {
                    if (error) {
                      isValid = false;
                      errorMessage = error.message;
                    }
                  }
                );
              } catch (error) {
                isValid = false;
                errorMessage = error instanceof Error ? error.message : '验证失败';
              }
              return isValid;
            },
            (val) => {
              // 尝试获取错误消息
              let errorMessage = `${item.label}验证失败`;
              try {
                rule.validator!(
                  {} as any,
                  val,
                  (error?: Error) => {
                    if (error) {
                      errorMessage = error.message;
                    }
                  }
                );
              } catch (error) {
                errorMessage = error instanceof Error ? error.message : '验证失败';
              }
              return { message: errorMessage };
            }
          );
        }
      });
    } else if (item.required) {
      // 如果没有规则但有 required，添加必填验证
      if (fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(1, `请输入${item.label}`);
      } else if (fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.refine((val) => val != null, `请输入${item.label}`);
      } else if (fieldSchema instanceof z.ZodArray) {
        fieldSchema = fieldSchema.min(1, `请输入${item.label}`);
      }
    }

    // 如果不是必填，设为可选
    // 使用 rulesArray 检查是否有 required 规则
    const hasRequiredRule = rulesArray.some((r) => (r as any).required);
    if (!item.required && !hasRequiredRule) {
      fieldSchema = fieldSchema.optional();
    }

    shape[item.prop] = fieldSchema;
  });

  return z.object(shape);
}

/**
 * 将 Zod 错误转换为 Element Plus 格式的错误消息
 * @param error Zod 错误
 * @returns 错误消息对象 { [field: string]: string[] }
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  return errors;
}
