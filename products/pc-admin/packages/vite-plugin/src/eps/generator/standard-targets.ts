import * as _ from 'lodash-es';
import type { EpsState } from './state';
import { mergeArrayBy, normalizePrefix } from './utils';

export interface StandardTarget {
  prefix: string;
  name: string;
  api: any[];
  columns?: any[];
  pageColumns?: any[];
  pageQueryOp?: any;
  search?: any;
}

const STANDARD_TARGETS: StandardTarget[] = [
  {
    prefix: '/api/system/base/profile',
    name: 'BaseUserEntity',
    api: [
      {
        name: 'update',
        method: 'POST',
        path: '/update',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:sys_user_profile:create',
        summary: '编辑用户档案信息',
        tag: 'BaseUserController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object',
              }
            }
          ]
        }
      },
      {
        name: 'info',
        method: 'GET',
        path: '/info',
        module: 'system.base',
        ignoreToken: false,
        action: 'READ',
        auth: 'login',
        permission: 'system.base:sys_user_profile:read',
        summary: '获取当前用户档案信息',
        tag: 'BaseUserController',
        dts: {
          parameters: [
            {
              description: 'showFull',
              name: 'query:showFull',
              required: false,
              schema: {
                type: 'boolean'
              }
            }
          ]
        }
      },
      {
        name: 'verify',
        method: 'POST',
        path: '/info/verify',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:sys_user_profile:create',
        summary: '获取邮箱或手机号的脱敏数据',
        tag: 'BaseUserController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'password',
        method: 'PUT',
        path: '/update/password',
        module: 'system.base',
        ignoreToken: false,
        action: 'UPDATE',
        auth: 'permission',
        permission: 'system.base:sys_user_profile:update',
        summary: '修改初始密码',
        tag: 'BaseUserController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      }
    ],
    columns: [
      {
        comment: 'ID',
        nullable: true,
        propertyName: 'id',
        source: 'id',
        type: 'bigint'
      },
      {
        comment: '员工ID',
        nullable: true,
        propertyName: 'employeeId',
        source: 'employee_id',
        type: 'varchar'
      },
      {
        comment: '姓名',
        nullable: true,
        propertyName: 'name',
        source: 'name',
        type: 'varchar'
      },
      {
        comment: '真实姓名',
        nullable: true,
        propertyName: 'realName',
        source: 'real_name',
        type: 'varchar'
      },
      {
        comment: '职位',
        nullable: true,
        propertyName: 'position',
        source: 'position',
        type: 'varchar'
      },
      {
        comment: '邮箱',
        nullable: true,
        propertyName: 'email',
        source: 'email',
        type: 'varchar'
      },
      {
        comment: '初始密码',
        nullable: true,
        propertyName: 'initPass',
        source: 'init_pass',
        type: 'varchar'
      },
      {
        comment: '部门id',
        nullable: true,
        propertyName: 'deptId',
        source: 'dept_id',
        type: 'varchar'
      },
      {
        comment: '头像',
        nullable: true,
        propertyName: 'avatar',
        source: 'avatar',
        type: 'varchar'
      },
      {
        comment: '手机号',
        nullable: true,
        propertyName: 'phone',
        source: 'phone',
        type: 'varchar'
      }
    ],
    pageColumns: [
      {
        comment: '页码',
        nullable: false,
        propertyName: 'page',
        source: 'page',
        type: 'number',
        defaultValue: 1
      },
      {
        comment: '每页数量',
        nullable: false,
        propertyName: 'size',
        source: 'size',
        type: 'number',
        defaultValue: 20
      },
      {
        comment: '关键词',
        nullable: true,
        propertyName: 'keyword',
        source: 'keyword',
        type: 'string'
      }
    ],
    pageQueryOp: {
      fieldEq: [],
      fieldLike: [],
      keyWordLikeFields: []
    },
    search: {
      fieldEq: [],
      fieldLike: [],
      keyWordLikeFields: []
    }
  },
  {
    prefix: '/api/system/base/email',
    name: 'EmailEntity',
    api: [
      {
        name: 'update',
        method: 'PUT',
        path: '/update',
        module: 'system.base',
        ignoreToken: false,
        action: 'UPDATE',
        auth: 'permission',
        permission: 'system.base:unknown:update',
        summary: '验证验证码并修改邮箱',
        tag: 'EmailController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'bind',
        method: 'POST',
        path: '/bind',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:unknown:create',
        summary: '绑定发送邮箱验证码',
        tag: 'EmailController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'verify',
        method: 'POST',
        path: '/verify',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:unknown:create',
        summary: '校验邮箱或者手机号验证码',
        tag: 'EmailController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'send',
        method: 'POST',
        path: '/send',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:unknown:create',
        summary: '发送邮箱验证码',
        tag: 'EmailController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      }
    ],
    pageColumns: [
      {
        comment: '页码',
        nullable: false,
        propertyName: 'page',
        source: 'page',
        type: 'number',
        defaultValue: 1
      },
      {
        comment: '每页数量',
        nullable: false,
        propertyName: 'size',
        source: 'size',
        type: 'number',
        defaultValue: 20
      },
      {
        comment: '关键词',
        nullable: true,
        propertyName: 'keyword',
        source: 'keyword',
        type: 'string'
      }
    ],
    pageQueryOp: {
      fieldEq: [],
      fieldLike: [],
      keyWordLikeFields: []
    },
    search: {
      fieldEq: [],
      fieldLike: [],
      keyWordLikeFields: []
    }
  },
  {
    prefix: '/api/system/base/phone',
    name: 'PhoneEntity',
    api: [
      {
        name: 'update',
        method: 'PUT',
        path: '/update',
        module: 'system.base',
        ignoreToken: false,
        action: 'UPDATE',
        auth: 'permission',
        permission: 'system.base:unknown:update',
        summary: '验证码并修改手机号',
        tag: 'PhoneController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'bind',
        method: 'POST',
        path: '/bind',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:unknown:create',
        summary: '绑定发送手机号验证码',
        tag: 'PhoneController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'verify',
        method: 'POST',
        path: '/verify',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:unknown:create',
        summary: '校验邮箱或者手机号验证码',
        tag: 'PhoneController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      },
      {
        name: 'send',
        method: 'POST',
        path: '/send',
        module: 'system.base',
        ignoreToken: false,
        action: 'CREATE',
        auth: 'permission',
        permission: 'system.base:unknown:create',
        summary: '发送手机号验证码',
        tag: 'PhoneController',
        dts: {
          parameters: [
            {
              description: 'arg0',
              name: 'body:arg0',
              required: true,
              schema: {
                type: 'object'
              }
            }
          ]
        }
      }
    ],
    pageColumns: [
      {
        comment: '页码',
        nullable: false,
        propertyName: 'page',
        source: 'page',
        type: 'number',
        defaultValue: 1
      },
      {
        comment: '每页数量',
        nullable: false,
        propertyName: 'size',
        source: 'size',
        type: 'number',
        defaultValue: 20
      },
      {
        comment: '关键词',
        nullable: true,
        propertyName: 'keyword',
        source: 'keyword',
        type: 'string'
      }
    ],
    pageQueryOp: {
      fieldEq: [],
      fieldLike: [],
      keyWordLikeFields: []
    },
    search: {
      fieldEq: [],
      fieldLike: [],
      keyWordLikeFields: []
    }
  }
];

export function ensureStandardTargets(state: EpsState): void {
  STANDARD_TARGETS.forEach((target) => {
    const normalizedTargetPrefix = normalizePrefix(target.prefix);
    const existing = state.epsList.find((item) => {
      if (!item) return false;
      if (item.name && item.name === target.name) return true;
      if (!item.prefix) return false;
      return normalizePrefix(item.prefix) === normalizedTargetPrefix;
    });

    // 如果找到现有实体且已有 moduleKey，使用现有的 moduleKey，否则使用默认值
    const defaultModuleKey = 'system.base';
    const moduleKey = existing?.moduleKey || defaultModuleKey;

    const targetEntity = {
      ..._.cloneDeep(target),
      namespace: target.prefix,
      moduleKey: moduleKey
    };

    if (!targetEntity.columns) {
      targetEntity.columns = [];
    }

    if (existing) {
      existing.prefix = targetEntity.prefix;
      existing.namespace = targetEntity.namespace;
      // 保留后端返回的 moduleKey，不要覆盖
      if (!existing.moduleKey) {
        existing.moduleKey = targetEntity.moduleKey;
      }
      existing.api = mergeArrayBy(existing.api, targetEntity.api, 'name');
      existing.columns = mergeArrayBy(existing.columns, targetEntity.columns!, 'propertyName');
      existing.pageColumns = mergeArrayBy(existing.pageColumns, targetEntity.pageColumns || [], 'propertyName');
      if (targetEntity.pageQueryOp) {
        existing.pageQueryOp = existing.pageQueryOp || {};
        Object.keys(targetEntity.pageQueryOp).forEach((key) => {
          if (existing.pageQueryOp[key] == null) {
            existing.pageQueryOp[key] = _.cloneDeep(targetEntity.pageQueryOp[key]);
          }
        });
      }
      if (targetEntity.search) {
        existing.search = existing.search || {};
        ['fieldEq', 'fieldLike', 'keyWordLikeFields'].forEach((key) => {
          const targetValue = targetEntity.search ? targetEntity.search[key] : undefined;
          if (!Array.isArray(targetValue) || targetValue.length === 0) {
            return;
          }
          const existingValue = Array.isArray(existing.search[key]) ? existing.search[key] : [];
          const mergedSet = new Set<any>(existingValue);
          targetValue.forEach((value: any) => {
            mergedSet.add(value);
          });
          existing.search[key] = Array.from(mergedSet);
        });
      }
    } else {
      state.epsList.push(targetEntity);
    }
  });
}
